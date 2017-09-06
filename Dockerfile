#
# CloudBoost Dockerfile
#
# Pull base image nodejs image.
FROM node:8.2.1

#Maintainer.
MAINTAINER Nawaz Dhandala <nawazdhandala@outlook.com>

RUN mkdir -p /usr/src/app

WORKDIR /usr/src/app

# Install app dependencies
COPY package.json /usr/src/app/

RUN npm install

# Bundle app source
COPY . /usr/src/app

# Expose ports.
#   - 4730: CloudBoost HTTP REST API
EXPOSE 4730

#Run the app
CMD [ "npm", "start" ]
