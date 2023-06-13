docker build -t openlayers-test-backend .
docker run -d -p 3001:80 openlayers-test-backend:latest
