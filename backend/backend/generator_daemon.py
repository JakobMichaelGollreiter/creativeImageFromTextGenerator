
from time import sleep
from main import db
from models.generators import generators
from models.images import images
import sys

from generate_image import generate_image

workplaceinjuries = 0


while True:
	#finds first image that isn't generated
	img = images.query.filter(images.generated == False).order_by(images.id.asc()).first()

	if img:
		#print(images.query.filter(images.generated == False).order_by(images.id.asc()))
		print("\ngenerating new image\n\n")
		workplaceinjuries = 0
		try:
			generate_image(img.id)
		except:
			db.session.rollback()
	else:
		#print("nothing to do")
		sleep(0.1)
		workplaceinjuries+=1
		if not workplaceinjuries%30:
			print("seconds without an image to render: ", workplaceinjuries/10)
			sys.stdout.flush()

	#have the database refresh next time
	db.session.commit()
	del img