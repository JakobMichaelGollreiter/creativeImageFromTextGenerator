from main import db

class images(db.Model):
	__tablename__ = "images"
	id = db.Column(db.Integer,  primary_key=True)
	generator = db.relationship("generators")
	def __init__(self):
		return