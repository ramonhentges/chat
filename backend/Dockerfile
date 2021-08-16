FROM node:14.17.2-alpine3.12

RUN apk add --no-cache bash

RUN npm install -g @nestjs/cli@7.6.0

RUN npm install -g jest

USER node

WORKDIR /home/node/app