from flask import Flask, json, jsonify, request
from main import api
@api.route('/api/generators', methods=['POST', 'GET']) #Methods: GET, PUT, POST, DELETE, ...
def generators_function():
	if request.method == 'POST':
		# Add new generator to database with given keyword and return its id
		data = request.json() # In here ist e.g. the keyword. API-Spec still TODO.
		id = "dummy"
		return jsonify({
			"id": id
			}), 502 #should be 201
	elif request.method == 'GET':
		# return all existing generators
		return jsonify({
			"generators": []
		}), 501 #should be 200


@api.route("/api/generators/<generatorID>", methods=["DELETE"])
def deleteGenerator(generatorID):
	if request.method == "DELETE":
		# Delete generator
		return "Not found", 501 #should be 404