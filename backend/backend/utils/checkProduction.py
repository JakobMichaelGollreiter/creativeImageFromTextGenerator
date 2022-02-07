############################################
# WoDone
# backend/backend/utils/checkProduction.py
# Authors: Tobias Höpp
# 
# Prüft, ob der Server in einer Production-Umgebung läuft
############################################
import os

if "PRODUCTION" in os.environ and os.environ["PRODUCTION"]:
	production = True
else:
	production = False
	print("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!")
	print("Running in a DEVELOPEMENT Mode. This has major security implications! DO NOT USE for production!")
	print("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!")
