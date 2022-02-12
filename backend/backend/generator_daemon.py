############################################
# WoDone
# backend/backend/generator_daemon.py
# Authors: Bernhard Stöffler, Jakob Gollreiter
# 
# Daemon that periodically refreshes and checks the database
# If an image is found that is not generated yet, do so.
############################################

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

	#if database query returned an image, we have some generating to do
	if img:
		print("\ngenerating new image\n\n")
		workplaceinjuries = 0
		try:
			generate_image(img.id)
		except:
			#undo any changes to the database to avoid problems
			db.session.rollback()
	else:
		sleep(0.1)
		workplaceinjuries+=1
		if not workplaceinjuries%500:
			print("seconds without an image to render: ", workplaceinjuries/10)
			sys.stdout.flush()

	#end the database session so the next image query opens a new session with latest entries
	db.session.commit()
	del img