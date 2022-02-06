
from time import sleep
from main import db
from models.generators import generators
from models.images import images

from generate_image import generate_image

workplaceinjuries = 0

while True:
	#refresh database
	img = images.query.filter(images.generated == False).order_by(images.id.asc()).first()
	db.session.refresh(img)
	#finds first image that isn't generated
	#img = images.query.filter(images.generated == False).order_by(images.id.asc()).first()

	if img:
		#print(images.query.filter(images.generated == False).order_by(images.id.asc()))
		print("generating new image")
		workplaceinjuries = 0
		try:
			generate_image(img.id)
		except:
			db.session.rollback()
	else:
		#print("nothing to do")
		sleep(0.1)
		workplaceinjuries+=1
		if not workplaceinjuries%10:
			print("second without workplace injuries: ", workplaceinjuries)