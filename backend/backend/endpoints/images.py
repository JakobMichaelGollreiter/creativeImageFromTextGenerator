from flask import Flask, json, jsonify, request
from main import api, db
#from vqgan.get_image import get_image
from vqgan.wodone_mod_words import wodone_adjectives
from models.generators import generators
from models.images import images
import random

def getBaseSeed(generatorID):
    imgs = images.query.filter(images.generator_id == generatorID, images.liked == True).order_by(images.identifier.asc()).all()
    seed = [] 
    for img in imgs:
        seed.append(img.seed[len(img.seed)-1])
    return seed
def getNextSeed(generatorID):
    seed = getBaseSeed(generatorID)
    seed.append(random.randint(0, len(wodone_adjectives)-1))
    return seed

@api.route("/api/generators/<generatorID>/<imageID>", methods=["GET", "POST"])
def requestImage(generatorID, imageID):
    if request.method == "GET":
        if int(imageID) < 0:
            return jsonify({"status": "empty", "info": "id must be not negative"}), 202
        gen = generators.query.get(generatorID)
        if not gen:
            return jsonify({"status": "error", "error": "generatorID not found"}), 404
        #highestID = gen.images.order_by(images.identifier.desc()).first().identifier
        highestIDimg = images.query.filter(images.generator_id == generatorID).order_by(images.identifier.desc()).first()
        if not highestIDimg:
            highestID = -1
        else:
            highestID = highestIDimg.identifier
        
        if int(imageID) > highestID +2:
            return jsonify({"status": "error", "error": "imageID not found"}), 404
        elif int(imageID) == highestID +2:
            return jsonify({"status": "wait", "info": "must generate lower id first"}), 202
        elif int(imageID) == highestID +1:
            seed = getNextSeed(generatorID)
            img = images(generatorID,highestID+1,seed)
            db.session.add(img)
            db.session.commit()
        elif int(imageID) == highestID:
            img = images.query.filter(images.generator_id == generatorID, images.identifier == imageID).one()
            # (Only) the last image is recreated if Likes have changed
            if not img.liked and not [*getBaseSeed(generatorID), img.seed[len(img.seed)-1]] == img.seed:
                img.seed = [*getBaseSeed(generatorID), img.seed[len(img.seed)-1]] # This guaranties that linking and unlinking the previous image does not generate to much server load
                db.session.commit()
        else:
             img = images.query.filter(images.generator_id == generatorID, images.identifier == imageID).one()
        #imgPath, status = get_image(gen.search,img.seed)
        imgPath = "https://placekitten.com/"+str(int(imageID)+800)
        status = "ok"
        debg = {"search": gen.search, "seed": img.seed} #TODO: remove
        return jsonify({"status": status,"src": imgPath, "like": img.liked, "debug": debg}), 200
    elif request.method == "POST":

        data = request.json
        if not "like" in data:
            return jsonify({"status": "error", "error": "like not specified"}), 401
        
        img = images.query.filter(images.generator_id == generatorID, images.identifier == imageID).first()
        if not img:
            return jsonify({"status": "error", "error": "not found"}), 404
        if data["like"] == True:
            img.liked = True
        else:
            img.liked = False
        db.session.commit()
        return jsonify({"status": "ok"}), 200