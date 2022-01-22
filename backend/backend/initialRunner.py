from main import db

from models.generators import generators
from models.images import images


def setup():
	print("Setup wird ausgeführt.")
	db.create_all()

setup()