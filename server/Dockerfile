FROM node:18
WORKDIR /usr/src/app
RUN npm install -g pnpm
COPY package.json pnpm-lock.yaml ./
RUN pnpm install
COPY . .

EXPOSE 80
CMD [ "node", "server.js" ]