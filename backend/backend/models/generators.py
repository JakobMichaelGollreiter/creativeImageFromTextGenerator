############################################
# WoDone
# backend/backend/models/generators.py
# Authors: Tobias Höpp
# 
# Datenbankmodell der Tabelle generators zum Speichern der Suchanfragen
# und darstellen einer Suchhistorie.
############################################
from main import db

class generators(db.Model):
    __tablename__ = "generators"
    id = db.Column(db.Integer,  primary_key=True)
    search = db.Column(db.Text)
    images = db.relationship("images", back_populates="generator")
    def __init__(self, search):
        self.search = search
