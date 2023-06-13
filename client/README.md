docker build -t openlayers-test .
docker run -d -p 3000:80 openlayers-test:latest
