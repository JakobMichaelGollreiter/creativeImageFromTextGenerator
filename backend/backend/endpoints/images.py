from flask import Flask, json, jsonify, request
from main import api
from vqgan.get_image import get_image
@api.route("/api/requestimage", methods=["POST"])
def requestImage():
    data = request.json()
    imPath, status = get_image(data["searchString"],data["reqArray"])

    return jsonify({
        "status": status,
        "imgPath": imgPath
    }), 200
	