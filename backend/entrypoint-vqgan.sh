#!/bin/bash
############################################
# WoDone
# backend/entrypoint-flask.sh
# Authors: Tobias Höpp, Bernhard Stöffler
# 
# Entrypoint für den wodone_vqgan container
############################################

# Auf Datenbank warten
while ! mysqladmin ping -h"$MYSQL_HOST" --silent; do
	echo "connecting to sql..."
    sleep 1
done

echo "done! now starting generator daemon"

# vqgan-Daemon starten
cd /usr/local/bin/api
python3 generator_daemon.py

