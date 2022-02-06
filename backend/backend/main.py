#!/usr/bin/env python3
from flask import Flask, json, jsonify, request
from flask_sqlalchemy import SQLAlchemy
from utils.checkProduction import production
import os

api = Flask(__name__)

if production:
    api.config['SQLALCHEMY_DATABASE_URI'] = "mysql://" + os.environ["MYSQL_USER"] + ":" + \
        os.environ["MYSQL_PASSWORD"] + "@" + \
        os.environ["MYSQL_HOST"] + "/" + os.environ["MYSQL_DATABASE"]
else:
    @api.after_request
    def add_header(response):
        response.headers["Access-Control-Allow-Origin"] = "*"
        response.headers["Access-Control-Allow-Methods"] = "*"
        response.headers["Access-Control-Allow-Headers"] = "*"
        return response
    api.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///test.sqlite'

api.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(api)

# Include Endpoints

from endpoints.generators import *
from endpoints.images import *



if __name__ == '__main__':
    # db.create_all()
    api.run(host="0.0.0.0", debug=False, port=8800, threaded=True)
