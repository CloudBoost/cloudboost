#
# CloudBoost Dashbard Dockerfile
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

RUN cd /usr/src/app && npm run-script build
# Expose ports.
#   - 1440: CloudBoost Dashboard
EXPOSE 1440

#Run the app
CMD [ "npm", "start" ]
