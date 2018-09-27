FROM node:10.11-alpine

RUN mkdir /app
RUN mkdir /app/server
RUN mkdir /app/client

# install packages for both client and server
COPY ./server/package.json /app/server/package.json
WORKDIR /app/server
RUN npm install package.json

COPY ./client/package.json /app/client/package.json
WORKDIR /app/client
RUN npm install package.json

# copy server files
COPY ./server/login /app/server/login
COPY ./server/routes /app/server/routes
COPY ./server/secure /app/server/secure
COPY ./server/_config.js /app/server/_config.js
COPY ./server/_logger.js /app/server/_logger.js
COPY ./server/_server.js /app/server/_server.js

# copy client files
COPY ./client/dist /app/client/dist
WORKDIR /app/server
CMD node --version
CMD node server.js