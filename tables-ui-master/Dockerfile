#
# CloudBoost Data-Browser Dockerfile
#

# Pull base image nodejs image.
FROM node:6.14.3-alpine

#Maintainer.
MAINTAINER Nawaz Dhandala <nawazdhandala@outlook.com>


RUN mkdir -p /usr/src/app

WORKDIR /usr/src/app

# Install app dependencies
COPY package.json /usr/src/app/
RUN npm install

# Bundle app source
COPY . /usr/src/app

RUN npm run-script build

# Expose ports.
#   - 3333: CloudBoost Data-Browser
EXPOSE 3333

#Run the app
CMD [ "npm", "start" ]
