############################################
# WoDone
# backend/backend/endpoints/generators.py
# Authors: Tobias Höpp
# 
# Erlaubt das Erstellen und Abrufen von Generatoren aus der Datenbank.
# Zu jeder neuen Suchanfrage des Frontends wird ein neuer Generator erstellt.
############################################

from flask import jsonify, request
from main import api, db
from models.generators import generators
from models.images import images
@api.route('/api/generators', methods=['POST', 'GET'])
def generators_function():
	if request.method == 'POST':
		# Add new generator to database with given keyword and return its id
		data = request.json
		if not "search" in data:
			return jsonify({"status": "error", "error": "search not specified"}), 401
		gen = generators(data["search"])
		db.session.add(gen)
		db.session.commit()
		return jsonify({
			"id": gen.id
			}), 201
	elif request.method == 'GET':
		# return all existing generators for history function
		gens = []
		gs = generators.query.order_by(generators.id.desc()).all()
		for g in gs:
			gens.append({
				"id": g.id,
				"search": g.search,
			})
		return jsonify({
			"generators": gens
		}), 200

# Der folgende Endpunkt gibt einen Auszug der Datenbank-Tabelle images zurück und dient lediglich zum debuggen.
@api.route('/api/debug/all_images', methods=['GET'])
def get_all_images():
	imgs = images.query.all()
	res = []
	for img in imgs:
		res.append({
			"id": img.id,
			"identifier": img.identifier,
			"seed": img.seed,
			"liked": img.liked,
			"path": img.path,
			"generated": img.generated,
			"generator_id": img.generator_id,
			"generator.search": img.generator.search
		})
	return jsonify(res), 200