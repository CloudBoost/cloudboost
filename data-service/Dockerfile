#
# CloudBoost Dockerfile
#
# Pull base image nodejs image.
FROM node:8.15-alpine

#Maintainer.
MAINTAINER Nawaz Dhandala <nawazdhandala@outlook.com>

RUN mkdir -p /usr/src/app

WORKDIR /usr/src/app

# Install app dependencies
COPY package.json /usr/src/app/

RUN apk add --no-cache make gcc g++ python && \
  npm install --production && \
  apk del make gcc g++ python

# Bundle app source
COPY . /usr/src/app

# Expose ports.
#   - 4730: CloudBoost HTTP REST API
EXPOSE 4730

#Run the app
CMD [ "npm", "start" ]
