############################################
# WoDone
# backend/backend/endpoints/images.py
# Authors: Tobias Höpp
# 
# Erlaubt das Anfragen neuer Bilder zu einem Generator und gibt Generationsstatus,
# Url des Bildes und Like-Status des Bildes zurück
# Erlaubt das Liken von Bildern und modifiziert dann das neuste Bild des Generators um 
# diesem Like zu Entsprechen (sodass das Like direkt beim weiter Swipen effektiv wird)
# Erstellt bei erstmaliger Anfrage die Seeds, mit denen das jeweilige Bild generiert wird 
# anhand der Likes vorheriger Bilder des Generators und einer Zufallszahl
############################################
from flask import jsonify, request
from main import api, db
from vqgan.wodone_mod_words import wodone_adjectives
from models.generators import generators
from models.images import images
import random

# Hilfsfunktionen
# baseSeed anhand von Likes bestimmen: der Random-Parameter jedes gelikten Bildes ist Teil des baseSeeds
def getBaseSeed(generatorID):
    imgs = images.query.filter(images.generator_id == generatorID, images.liked == True).order_by(images.identifier.asc()).all()
    seed = [] 
    for img in imgs:
        seed.append(img.seed[len(img.seed)-1])
    return seed
# seed des nächsten Bildes bestimmen aus baseSeed und random
def getNextSeed(generatorID):
    seed = getBaseSeed(generatorID)
    seed.append(random.randint(0, len(wodone_adjectives)-1))
    return seed

# Endpunkt
@api.route("/api/generators/<generatorID>/<imageID>", methods=["GET", "POST"])
def requestImage(generatorID, imageID):
    if request.method == "GET":
        # Bei negativen IDs (werden für die vorherige Slide abgefragt, wenn der Nutzer auf der ersten Slide ist)
        # leere Daten zurückgeben
        if int(imageID) < 0:
            return jsonify({"status": "empty", "info": "id must be not negative"}), 202

        # Generator aus Datenbank holen
        gen = generators.query.get(generatorID)
        if not gen:
            return jsonify({"status": "error", "error": "generatorID not found"}), 404
        # Größten images.identifiers bestimmen. Dieser nummeriert die Bilder nach ihrer Anzeigereihenfolge im Frontend.
        # Wenn es noch kein Bild für den Generator gibt (immer der Fall, wenn erstmals Bilder zum Generator abgefragt werden)
        # highestID = -1 setzen, um später Bild mit ID 0 zu erstellen
        highestIDimg = images.query.filter(images.generator_id == generatorID).order_by(images.identifier.desc()).first()
        if not highestIDimg:
            highestID = -1
        else:
            highestID = highestIDimg.identifier

        if int(imageID) > highestID +2:
            # Fehlermeldung, wenn angefragte imageID deutlich zu groß
            return jsonify({"status": "error", "error": "imageID not found"}), 404
        elif int(imageID) == highestID +2:
            # Wenn die angefragte imageID etwas zu groß (also es wurden IDs davor noch nie abgefragt)
            # Warteanweisung zurückgeben
            return jsonify({"status": "wait", "info": "must request lower id first"}), 202
        elif int(imageID) == highestID +1:
            # Wenn exakt das erste, noch nie vorher abgefragte Bild abgefragt wird, dieses erstellen
            seed = getNextSeed(generatorID)
            img = images(generatorID,highestID+1,seed)
            db.session.add(img)
            db.session.commit() 
        elif int(imageID) == highestID:
            # Wenn das neuste Bild angefragt wird, prüfen, ob sich die Likes in der Zwischenzeit geändert haben
            # und das Bild neu generiert werden soll
            img = images.query.filter(images.generator_id == generatorID, images.identifier == imageID).one()
            img_seed = img.seed
            # auf geänderte Likes prüfen
            if not img.liked and not [*getBaseSeed(generatorID), img_seed[len(img_seed)-1]] == img_seed:
                db.session.delete(img)
                db.session.commit()
                seed = [*getBaseSeed(generatorID), img_seed[len(img_seed)-1]] # This guaranties that linking and unlinking the previous image does not generate to much server load
                del img
                img = images(generatorID,highestID,seed)
                db.session.add(img)
                db.session.commit()
        else:
            # Wenn ein "altes" Bild abgefragt wird, dessen Informationen aus der Datenbank holen
            img = images.query.filter(images.generator_id == generatorID, images.identifier == imageID).one()
        
        # Bildpfad bestimmen und speichern
        imgPath = img.path

        if img.generated:
            # Wenn das Bild bereits fertig von vqgan generiert wurde, status auf ok setzen
            status = "ok"
        else:
            # Wenn das Bild noch nicht fertig von vqgan generiert wurde,
            # zunächst prüfen, ob es in der Datenbank ein anderes, älteres Bild mit gleichem
            # Suchbegriff und gleichem Seed gibt
            eq = images.query.join(generators).filter(generators.search == gen.search, images.seed == img.seed, images.id < img.id).order_by(images.id.asc()).first()
            if eq:
                # Wenn JA: Die Eigenschaften dieses Datenbankeintrages auf das Aktuelle Bild überschreiben.
                # Dadurch muss vqgan das identische Bild nicht zweimal erstellen und die Serverauslastung wird reduziert.
                img.path = eq.path
                imgPath = eq.path
                img.generated = eq.generated
                db.session.commit()
                # Je nachdem, ob das Bild, was soeben kopiert wurde, bereits generiert wurde, den Status wählen
                if eq.generated:
                    status = "ok"
                else:
                    status = "generating"
            else:
                # Das Bild gab es zuvor noch nicht und muss von vqgan generiert werden
                status = "generating"

        return jsonify({"status": status,"src": imgPath, "like": img.liked}), 200
    elif request.method == "POST":
        # Liken von Bildern
        data = request.json
        # Prüfen, ob notwendige Datenfelder übermittelt wurden
        if not "like" in data:
            return jsonify({"status": "error", "error": "like not specified"}), 401
            
        # Gelikedes Bild aus der Datenbank abfragen, like (bzw. unlike) entsprechend ändern
        img = images.query.filter(images.generator_id == generatorID, images.identifier == imageID).first()
        if not img:
            return jsonify({"status": "error", "error": "not found"}), 404
        if data["like"] == True:
            img.liked = True
        else:
            img.liked = False

        db.session.commit()
        return jsonify({"status": "ok"}), 200