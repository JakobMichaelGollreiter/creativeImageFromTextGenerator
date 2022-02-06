#!/bin/bash

# Function for a clean shutdown of the container
function shutdown {
    #kill -TERM "$NGINX_PROCESS" 2>/dev/null
    exit
}
trap shutdown SIGTERM

while ! mysqladmin ping -h"$MYSQL_HOST" --silent; do
	echo "connecting to sql..."
    sleep 1
done

echo "connected! waiting another 10 pointless seconds..."
sleep 10
echo "done! now starting generator daemon"

cd /usr/local/bin/api
python3 generator_daemon.py

