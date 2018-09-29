FROM node:8.12-alpine

RUN mkdir /app
RUN mkdir /app/server
RUN mkdir /app/client
RUN mkdir /app/client/dist

RUN npm config set registry http://registry.npmjs.org

RUN apk --no-cache add --virtual native-deps \
  g++ gcc libgcc libstdc++ linux-headers make python && \
  npm install --quiet node-gyp -g 


# install packages for both client and server
COPY ./server/package.json /app/server/package.json
WORKDIR /app/server
RUN npm install  

COPY ./client/package.json /app/client/package.json
WORKDIR /app/client
RUN npm install 

RUN apk del native-deps

# copy server files
COPY ./server/login /app/server/login
COPY ./server/routes /app/server/routes
COPY ./server/secure /app/server/secure
COPY ./server/_config.js /app/server/_config.js
COPY ./server/_logger.js /app/server/_logger.js
COPY ./server/server.js /app/server/server.js

# copy client files
COPY ./client/dist/index.html /app/client/dist/index.html
COPY ./client/dist/bundle.js /app/client/dist/bundle.js
WORKDIR /app/server
CMD ["node", "server.js"]

