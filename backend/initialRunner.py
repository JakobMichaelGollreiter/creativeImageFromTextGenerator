from main import db

def setup():
	print("Setup wird ausgeführt.")
	db.create_all()