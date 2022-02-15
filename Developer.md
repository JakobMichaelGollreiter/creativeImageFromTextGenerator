# Developer Guide

Recommended: For any changes just restart and rebuild the docker container: `docker-compose up -d --build`

Only if you wish to take some more effort, use the following instructions:

## Frontend

Requirements:

-   nodejs
-   npm

Start local frontend

```
cd ./frontend/frontend
npm install #only needs to be done once
npm start
```

Note that for now you must change all fetched URLs (and possibly change cross-origin headers in the backend) in order to be able to use the frontend locally.

## Backend

For backend developement we highly recommend to rebuild the docker containers for testing any change at the current point in time.
Nevertheless the flask-server should run just fine outside docker by executing.

```
cd ./backend/backend
python3 main.py
```

Note though that no images will be actually generated in that case and therefore the frontend will be locked to a loading screen.

## Docker

Requirements:

-   docker
-   docker-compose >=1.28.0
-   cuda

Rebuild and start all containers:

```
docker-compose up -d --build
```
