from enum import unique
from main import db

class images(db.Model):
	__tablename__ = "images"
	id = db.Column(db.Integer,  primary_key=True)
	identifier = db.Column(db.Integer)
	#mod_word = db.Column(db.Integer) #is a part of the seed 
	seed = db.Column(db.JSON)
	liked = db.Column(db.Boolean)
	generator_id = db.Column(db.Integer, db.ForeignKey('generators.id'))
	generator = db.relationship("generators", back_populates="images")
	def __init__(self, generator_id, identifier, seed, liked=False):
		self.generator_id = generator_id
		self.identifier = identifier
		self.seed = seed,
		self.liked = liked