# g5-21

Requirements:

docker-compose v1.28.0+
cuda drivers of some sort (depends on your host system)
to get started use--> docker-compose up -d


**backend readme:**

**Which neural net are we using for the image generation?**


For the actual image generation we use an already pre-trained network using VQGAN + CLIP, source code for image generation taken from
https://colab.research.google.com/drive/1wkF67ThUz37T2_oPIuSwuO4e_-0vjaLs?usp=sharing#scrollTo=ZdlpRFL8UAlW
This is a Google Colab notebook by Max Woolf, however the original method was by Katherine Crowson.

The generative capabilities of this network are extremely impressive. The interaction of the two nets essentially consists of VQGAN generating the images, while CLIP judges how well an image matches our text input.


**How does the like-algorithm work?**

In order for the user to have a direct impact of the image generation we wanted to have some user feedback. Therefore we use a simple like/dislike functionality, to more accurately depict the users fantasy.
To implement this, we came up with a simple way to influence the image generation without actually touching the neural networks code. Our AI is able to generate images from text, so instead of manipulating the image, we just modify the input text.
![like-algo](/uploads/1f1d4625e32e172cddd64b644b3da527/like-algo.png)
