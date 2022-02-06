
from time import sleep
from main import db
from models.generators import generators
from models.images import images

from generate_image import generate_image


while True:
	#finds first image that isn't generated
	img = images.query.filter(images.generated == False).order_by(images.id.asc()).first()

	if img:
		print("generating new image")
		generate_image(img.id)
	else:
		sleep(0.1)