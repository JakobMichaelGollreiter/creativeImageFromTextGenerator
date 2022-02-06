#!/bin/bash

# Function for a clean shutdown of the container
function shutdown {
    #kill -TERM "$NGINX_PROCESS" 2>/dev/null
    exit
}
trap shutdown SIGTERM

while ! mysqladmin ping -h"$MYSQL_HOST" --silent; do
    sleep 1
done

sleep 10

cd /usr/local/bin/api
python3 generator_daemon.py

