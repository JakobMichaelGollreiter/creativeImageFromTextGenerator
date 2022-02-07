#!/bin/bash
############################################
# WoDone
# backend/entrypoint-flask.sh
# Authors: Tobias Höpp
# 
# Entrypoint für den wodone_flask container
############################################

# sauberes Herunterfahren sicherstellen
function shutdown {
    kill -TERM "$NGINX_PROCESS" 2>/dev/null
    exit
}
trap shutdown SIGTERM

# auf Verfügbarkeit der Datenbank warten
while ! mysqladmin ping -h"$MYSQL_HOST" --silent; do
    sleep 1
done

sleep 10

# initialRunner.py ausführen
cd /usr/local/bin/api
python3 initialRunner.py
# flask und nginx starten
uwsgi --ini uwsgi.ini --lazy &
cd
nginx -g 'daemon off;' &
NGINX_PROCESS=$!
wait $NGINX_PROCESS
