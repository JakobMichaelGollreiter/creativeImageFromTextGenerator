#!/usr/bin/env python3
############################################
# WoDone
# backend/backend/initialRunner.py
# Authors: Tobias Höpp
# 
# initialRunner zum Generieren der Datenbank,
# falls diese noch nicht existiert
############################################
from main import db

from models.generators import generators
from models.images import images


def setup():
	print("Setup wird ausgeführt.")
	db.create_all()

setup()