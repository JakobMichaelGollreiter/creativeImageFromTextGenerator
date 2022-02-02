from flask import Flask, json, jsonify, request
from main import api
@api.route("/api/requestimage", methods=["POST"])
def requestImage():
	data = request.json()
	"""
	data["searchString"]
	data["reqArray"]

		return jsonify({
			"status": "",
			"imgPath": ""
		}), 200
	"""
	# Die Zeile hier unten muss dann natürlich weg.
	return "Not Implemented", 501