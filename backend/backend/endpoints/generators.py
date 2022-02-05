from flask import Flask, json, jsonify, request
from main import api, db
from models.generators import generators
from models.images import images
@api.route('/api/generators', methods=['POST', 'GET']) #Methods: GET, PUT, POST, DELETE, ...
def generators_function():
	if request.method == 'POST':
		# Add new generator to database with given keyword and return its id
		data = request.json
		gen = generators(data["search"])
		db.session.add(gen)
		db.session.commit()
		id = "dummy"
		return jsonify({
			"id": gen.id
			}), 201
	elif request.method == 'GET':
		# return all existing generators
		gens = []
		gs = generators.query.order_by(generators.id.desc()).all()
		for g in gs:
			gens.append({
				"id": g.id,
				"search": g.search,
			})
		return jsonify({
			"generators": gens
		}), 200 #should be 200

'''
@api.route("/api/generators/<generatorID>", methods=["DELETE"])
def deleteGenerator(generatorID):
	if request.method == "DELETE":
		# Delete generator
		return "Not found", 501 #should be 404
'''