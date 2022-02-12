############################################
# WoDone
# backend/backend/generate_image.py
# Authors: Bernhard Stöffler, Jakob Gollreiter
# 
# takes a numerical ID as input, which is used to fetch 
# the image in question from the database.
#
# images are generated using VQGAN + CLIP, source code for image generation taken from
# https://colab.research.google.com/drive/1wkF67ThUz37T2_oPIuSwuO4e_-0vjaLs?usp=sharing#scrollTo=ZdlpRFL8UAlW
# a Google Colab notebook by Max Woolf, however the original method was by Katherine Crowson.
# 
# the user text prompt is prepended by a concatenation of modificator adjectives from wodone_mod_words.py
# this is to get more stylistically varied results, and to enable a like feature.
############################################

from pathlib import Path
import sys
import os
from vqgan.wodone_mod_words import wodone_adjectives
from main import db

from models.generators import generators
from models.images import images

def generate_image(image_id):

	#fetch image attributes from database
	current_image = images.query.get(image_id)
	texts = current_image.generator.search

	modifiers = current_image.seed
	for wordindex in modifiers:
		#prepend generation prompt with adjectives
		texts = wodone_adjectives[int(wordindex)] + " " + texts

	print("now generating: ", texts, "\n")

	#where the images will be saved
	globalimagedirpath = "/var/www/html/images"
	imgpathrel = str(image_id)
	for wordindex in modifiers:
		#save images in a tree structure (with numeric names, since os.system is called later)
		imgpathrel = imgpathrel + "/" + str(wordindex)
	imgpath = globalimagedirpath + "/" + imgpathrel
	imgpathdb = "/api/images/" + imgpathrel

	#create directory and add unfinished flag
	Path(imgpath + "/steps").mkdir(parents=True, exist_ok=True)
	os.system("touch " + imgpath + "/unfinished")

	# Fixed parameters
	model_name = "vqgan_imagenet_f16_16384"
	seed = 42
	learning_rate = 0.2 

	# width, height and max_steps are kept low to speed up generation
	# could be bigger if our hardware was more powerful
	width = 300 
	height = 300 
	max_steps = 100 
	# note: from experience, image converges after ~100 iterations, more steps have little effect

	#from here on, most of the generation code is simply copied from colab
	try:
		import argparse
		import math

		from IPython import display
		from base64 import b64encode
		from omegaconf import OmegaConf
		from PIL import Image
		from PIL.PngImagePlugin import PngInfo
		from taming.models import cond_transformer, vqgan
		import taming.modules 
		import torch
		from torch import nn, optim
		from torch.nn import functional as F
		from torchvision import transforms
		from torchvision.transforms import functional as TF
		from torch.optim.lr_scheduler import StepLR
		from tqdm.notebook import tqdm
		from shutil import move

		from vqgan.CLIP import clip
		import kornia.augmentation as K
		import numpy as np
		from PIL import ImageFile, Image
		ImageFile.LOAD_TRUNCATED_IMAGES = True


		def sinc(x):
			return torch.where(x != 0, torch.sin(math.pi * x) / (math.pi * x), x.new_ones([]))


		def lanczos(x, a):
			cond = torch.logical_and(-a < x, x < a)
			out = torch.where(cond, sinc(x) * sinc(x/a), x.new_zeros([]))
			return out / out.sum()


		def ramp(ratio, width):
			n = math.ceil(width / ratio + 1)
			out = torch.empty([n])
			cur = 0
			for i in range(out.shape[0]):
				out[i] = cur
				cur += ratio
			return torch.cat([-out[1:].flip([0]), out])[1:-1]


		def resample(input, size, align_corners=True):
			n, c, h, w = input.shape
			dh, dw = size

			input = input.view([n * c, 1, h, w])

			if dh < h:
				kernel_h = lanczos(ramp(dh / h, 2), 2).to(input.device, input.dtype)
				pad_h = (kernel_h.shape[0] - 1) // 2
				input = F.pad(input, (0, 0, pad_h, pad_h), 'reflect')
				input = F.conv2d(input, kernel_h[None, None, :, None])

			if dw < w:
				kernel_w = lanczos(ramp(dw / w, 2), 2).to(input.device, input.dtype)
				pad_w = (kernel_w.shape[0] - 1) // 2
				input = F.pad(input, (pad_w, pad_w, 0, 0), 'reflect')
				input = F.conv2d(input, kernel_w[None, None, None, :])

			input = input.view([n, c, h, w])
			return F.interpolate(input, size, mode='bicubic', align_corners=align_corners)


		class ReplaceGrad(torch.autograd.Function):
			@staticmethod
			def forward(ctx, x_forward, x_backward):
				ctx.shape = x_backward.shape
				return x_forward

			@staticmethod
			def backward(ctx, grad_in):
				return None, grad_in.sum_to_size(ctx.shape)


		replace_grad = ReplaceGrad.apply


		class ClampWithGrad(torch.autograd.Function):
			@staticmethod
			def forward(ctx, input, min, max):
				ctx.min = min
				ctx.max = max
				ctx.save_for_backward(input)
				return input.clamp(min, max)

			@staticmethod
			def backward(ctx, grad_in):
				input, = ctx.saved_tensors
				return grad_in * (grad_in * (input - input.clamp(ctx.min, ctx.max)) >= 0), None, None


		clamp_with_grad = ClampWithGrad.apply


		def vector_quantize(x, codebook):
			d = x.pow(2).sum(dim=-1, keepdim=True) + codebook.pow(2).sum(dim=1) - 2 * x @ codebook.T
			indices = d.argmin(-1)
			x_q = F.one_hot(indices, codebook.shape[0]).to(d.dtype) @ codebook
			return replace_grad(x_q, x)


		class Prompt(nn.Module):
			def __init__(self, embed, weight=1., stop=float('-inf')):
				super().__init__()
				self.register_buffer('embed', embed)
				self.register_buffer('weight', torch.as_tensor(weight))
				self.register_buffer('stop', torch.as_tensor(stop))

			def forward(self, input):
				input_normed = F.normalize(input.unsqueeze(1), dim=2)
				embed_normed = F.normalize(self.embed.unsqueeze(0), dim=2)
				dists = input_normed.sub(embed_normed).norm(dim=2).div(2).arcsin().pow(2).mul(2)
				dists = dists * self.weight.sign()
				return self.weight.abs() * replace_grad(dists, torch.maximum(dists, self.stop)).mean()


		def parse_prompt(prompt):
			vals = prompt.rsplit(':', 2)
			vals = vals + ['', '1', '-inf'][len(vals):]
			return vals[0], float(vals[1]), float(vals[2])


		class MakeCutouts(nn.Module):
			def __init__(self, cut_size, cutn, cut_pow=1.):
				super().__init__()
				self.cut_size = cut_size
				self.cutn = cutn
				self.cut_pow = cut_pow

				self.augs = nn.Sequential(
					K.RandomAffine(degrees=15, translate=0.1, p=0.7, padding_mode='border'),
					K.RandomPerspective(0.7,p=0.7),
					K.ColorJitter(hue=0.1, saturation=0.1, p=0.7),
					K.RandomErasing((.1, .4), (.3, 1/.3), same_on_batch=True, p=0.7),
					
		)
				self.noise_fac = 0.1
				self.av_pool = nn.AdaptiveAvgPool2d((self.cut_size, self.cut_size))
				self.max_pool = nn.AdaptiveMaxPool2d((self.cut_size, self.cut_size))

			def forward(self, input):
				sideY, sideX = input.shape[2:4]
				max_size = min(sideX, sideY)
				min_size = min(sideX, sideY, self.cut_size)
				cutouts = []
				
				for _ in range(self.cutn):
					cutout = (self.av_pool(input) + self.max_pool(input))/2
					cutouts.append(cutout)
				batch = self.augs(torch.cat(cutouts, dim=0))
				if self.noise_fac:
					facs = batch.new_empty([self.cutn, 1, 1, 1]).uniform_(0, self.noise_fac)
					batch = batch + facs * torch.randn_like(batch)
				return batch


		def load_vqgan_model(config_path, checkpoint_path):
			config = OmegaConf.load(config_path)
			if config.model.target == 'taming.models.vqgan.VQModel':
				model = vqgan.VQModel(**config.model.params)
				model.eval().requires_grad_(False)
				model.init_from_ckpt(checkpoint_path)
			elif config.model.target == 'taming.models.vqgan.GumbelVQ':
				model = vqgan.GumbelVQ(**config.model.params)
				model.eval().requires_grad_(False)
				model.init_from_ckpt(checkpoint_path)
			elif config.model.target == 'taming.models.cond_transformer.Net2NetTransformer':
				parent_model = cond_transformer.Net2NetTransformer(**config.model.params)
				parent_model.eval().requires_grad_(False)
				parent_model.init_from_ckpt(checkpoint_path)
				model = parent_model.first_stage_model
			else:
				raise ValueError(f'unknown model type: {config.model.target}')
			del model.loss
			return model


		def resize_image(image, out_size):
			ratio = image.size[0] / image.size[1]
			area = min(image.size[0] * image.size[1], out_size[0] * out_size[1])
			size = round((area * ratio)**0.5), round((area / ratio)**0.5)
			return image.resize(size, Image.LANCZOS)

		#input parameters are now combined in a dictionary, for easy referencing in functions
		gen_config = {
			"texts": texts,
			"width": width,
			"height": height,
			"init_image": "",
			"target_images": "",
			"learning_rate": learning_rate,
			"max_steps": max_steps,
			"training_seed": 42,
			"model": "vqgan_imagenet_f16_16384"
		}

		metadata = PngInfo()
		for k, v in gen_config.items():
			try:
				metadata.add_text("AI_ " + k, str(v))
			except UnicodeEncodeError:
				pass

		model_names={"vqgan_imagenet_f16_16384": 'ImageNet 16384',"vqgan_imagenet_f16_1024":"ImageNet 1024", 'vqgan_openimages_f16_8192':'OpenImages 8912',
						"wikiart_1024":"WikiArt 1024", "wikiart_16384":"WikiArt 16384", "coco":"COCO-Stuff", "faceshq":"FacesHQ", "sflckr":"S-FLCKR"}
		name_model = model_names[model_name]     

		if seed == -1:
			seed = None
		init_image = None
		model_target_images = []
		model_texts = [phrase.strip() for phrase in texts.split("|")]

		if model_texts == ['']:
			model_texts = []

		args = argparse.Namespace(
			prompts=model_texts,
			image_prompts=model_target_images,
			noise_prompt_seeds=[],
			noise_prompt_weights=[],
			size=[width, height],
			init_image=init_image,
			init_weight=0.,
			clip_model='ViT-B/32',
			vqgan_config=f'vqgan/{model_name}.yaml',
			vqgan_checkpoint=f'vqgan/{model_name}.ckpt',
			step_size=learning_rate,
			cutn=32,
			cut_pow=1.,
			seed=seed,
		)
		from urllib.request import urlopen

		#note: please, for gods sake, use a GPU, cpu generation times are soooo slow
		device = torch.device('cuda:0' if torch.cuda.is_available() else 'cpu')
		seed = args.seed
		torch.manual_seed(seed)

		model = load_vqgan_model(args.vqgan_config, args.vqgan_checkpoint).to(device)
		perceptor = clip.load(args.clip_model, jit=False)[0].eval().requires_grad_(False).to(device)
		cut_size = perceptor.visual.input_resolution

		f = 2**(model.decoder.num_resolutions - 1)
		make_cutouts = MakeCutouts(cut_size, args.cutn, cut_pow=args.cut_pow)

		toksX, toksY = args.size[0] // f, args.size[1] // f
		sideX, sideY = toksX * f, toksY * f

		if args.vqgan_checkpoint == 'vqgan_openimages_f16_8192.ckpt':
			e_dim = 256
			n_toks = model.quantize.n_embed
			z_min = model.quantize.embed.weight.min(dim=0).values[None, :, None, None]
			z_max = model.quantize.embed.weight.max(dim=0).values[None, :, None, None]
		else:
			e_dim = model.quantize.e_dim
			n_toks = model.quantize.n_e
			z_min = model.quantize.embedding.weight.min(dim=0).values[None, :, None, None]
			z_max = model.quantize.embedding.weight.max(dim=0).values[None, :, None, None]

		one_hot = F.one_hot(torch.randint(n_toks, [toksY * toksX], device=device), n_toks).float()
		if args.vqgan_checkpoint == 'vqgan_openimages_f16_8192.ckpt':
			z = one_hot @ model.quantize.embed.weight
		else:
			z = one_hot @ model.quantize.embedding.weight
		z = z.view([-1, toksY, toksX, e_dim]).permute(0, 3, 1, 2) 
		z = torch.rand_like(z)*2
		z_orig = z.clone()
		z.requires_grad_(True)
		opt = optim.Adam([z], lr=args.step_size)
		scheduler = StepLR(opt, step_size=5, gamma=0.95)

		normalize = transforms.Normalize(mean=[0.48145466, 0.4578275, 0.40821073],
										std=[0.26862954, 0.26130258, 0.27577711])

		pMs = []

		for prompt in args.prompts:
			txt, weight, stop = parse_prompt(prompt)
			embed = perceptor.encode_text(clip.tokenize(txt).to(device)).float()
			pMs.append(Prompt(embed, weight, stop).to(device))

		for prompt in args.image_prompts:
			path, weight, stop = parse_prompt(prompt)
			img = Image.open(path)
			pil_image = img.convert('RGB')
			img = resize_image(pil_image, (sideX, sideY))
			batch = make_cutouts(TF.to_tensor(img).unsqueeze(0).to(device))
			embed = perceptor.encode_image(normalize(batch)).float()
			pMs.append(Prompt(embed, weight, stop).to(device))

		for seed, weight in zip(args.noise_prompt_seeds, args.noise_prompt_weights):
			gen = torch.Generator().manual_seed(seed)
			embed = torch.empty([1, perceptor.visual.output_dim]).normal_(generator=gen)
			pMs.append(Prompt(embed, weight).to(device))

		def synth(z):
			if args.vqgan_checkpoint == 'vqgan_openimages_f16_8192.ckpt':
				z_q = vector_quantize(z.movedim(1, 3), model.quantize.embed.weight).movedim(3, 1)
			else:
				z_q = vector_quantize(z.movedim(1, 3), model.quantize.embedding.weight).movedim(3, 1)
			return clamp_with_grad(model.decode(z_q).add(1).div(2), 0, 1)

		def ascend_txt():
			out = synth(z)
			iii = perceptor.encode_image(normalize(make_cutouts(out))).float()
			
			result = []

			if args.init_weight:
				result.append(F.mse_loss(z, torch.zeros_like(z_orig)) * ((1/torch.tensor(i*2 + 1))*args.init_weight) / 2)
			for prompt in pMs:
				result.append(prompt(iii))
			img = np.array(out.mul(255).clamp(0, 255)[0].cpu().detach().numpy().astype(np.uint8))[:,:,:]
			img = np.transpose(img, (1, 2, 0))
			img = Image.fromarray(img)
			
			#save the current iteration in /steps
			img.save(imgpath + f"/steps/{i:03d}.png", pnginfo=metadata) 
			#update database path to current step (to have a live preview)
			current_image.path = imgpathdb + f"/steps/{i:03d}.png"
			db.session.commit()
			return result

		def train(i):
			opt.zero_grad()
			lossAll = ascend_txt()

			#saves image on every step
			out = synth(z)
			TF.to_pil_image(out[0].cpu()).save(imgpath + "/image.png", pnginfo=metadata)

			loss = sum(lossAll)
			loss.backward()
			opt.step()
			scheduler.step()
			with torch.no_grad():
				z.copy_(z.maximum(z_min).minimum(z_max))

		########## "main" ##########################################
		#image is effectively generated in this loop

		try:
			for i in range(max_steps):
				train(i)
				if not i%20:
					print("    prompt: " + texts + f", iteration {i:03d}")
					sys.stdout.flush()
		except KeyboardInterrupt:
			pass

		#set database entry to be finished and update path with final result
		current_image.generated = True
		current_image.path = imgpathdb + "/image.png"
		db.session.commit()
		#remove unfinished flag
		os.system("rm " + imgpath + "/unfinished")
		#remove generator steps (save disk space)
		os.system("rm -r " + imgpath + "/steps")
		print("done generating!\n")
		sys.stdout.flush()

	except:
		#### if anything happens during generation process, we end up here.
		#### fortunately, our daemon will just restart and try again, so pretend nothing happened
		# prevent database from being semi corrupted hopefully
		db.session.rollback()
		print("\nERROR while generating\n")
		# leave no evidence of our failure
		os.system("rm -rf " + imgpath)