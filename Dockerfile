# syntax=docker/dockerfile:1

FROM node:14-alpine

RUN apk add --no-cache python g++ make

WORKDIR /crawler_game

COPY . .

RUN npm install --production

CMD ["node", "index.js"]