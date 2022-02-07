############################################
# WoDone
# backend/backend/models/images.py
# Authors: Tobias Höpp
# 
# Datenbankmodell der Tabelle images zum Speichern der 
# Bildpfade, Seeds, Like-Informationen etc.
############################################
from main import db

class images(db.Model):
	__tablename__ = "images"
	id = db.Column(db.Integer,  primary_key=True)
	identifier = db.Column(db.Integer)
	seed = db.Column(db.JSON)
	liked = db.Column(db.Boolean)
	path = db.Column(db.Text)
	generated = db.Column(db.Boolean)
	generator_id = db.Column(db.Integer, db.ForeignKey('generators.id'))
	generator = db.relationship("generators", back_populates="images")
	# Ladebild als Default-Bild:
	def __init__(self, generator_id, identifier, seed, liked=False, path="/api/images/giphy.gif", generated=False):
		self.generator_id = generator_id
		self.identifier = identifier
		self.seed = seed
		self.liked = liked
		self.path = path
		self.generated = generated