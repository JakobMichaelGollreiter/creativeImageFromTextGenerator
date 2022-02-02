from flask import Flask, json, jsonify, request
from main import api
@api.route("/api/generators/<generatorID>/image/<imageID>", methods=["GET"])
def getOrCreateImage(generatorID, imageID):
	data = request.json()
	#Im Folgenden der Code. file_data muss durch das entsprechende Bild ausgetauscht werden.
	#Das Ergebnis aus base64.b64encode(file_data).decode('utf-8') könnte direkt bei der Bildgenerierung in der Datenbank abgespeichert werden.
	"""
	if imageExist(data["query"]):
		return jsonify({
			"status": "done",
			"img": "data:image/png;base64,"+base64.b64encode(file_data).decode('utf-8')
		}), 200
	else:
		return jsonify({
			"status": "inProgress",
			"img": "data:image/png;base64,"+base64.b64encode(file_data).decode('utf-8')
		}), 200
	"""
	# Die Zeile hier unten muss dann natürlich weg.
	# Wenn es zu einem Serverseitigen Fehler Kommt, ist der richtige Fehlercode 500
	return "Not Implemented", 501