from flask import Flask, json, jsonify, request
from main import api
@api.route("/api/generators/<generatorID>/image/<imageID>", methods=["GET"])
def getOrCreateImage(generatorID, imageID):
	return "Not Implemented", 501