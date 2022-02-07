############################################
# WoDone
# backend/backend/wsgy.py
# Authors: Tobias Höpp
# 
# Einstiegspunkt für WSGI-Server
############################################
from main import api

if __name__ == "__main__":
	api.run()