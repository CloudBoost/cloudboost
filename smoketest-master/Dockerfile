#
# CloudBoost Dashbard Dockerfile
#
# Pull base image nodejs image.
FROM node:8.0

#Maintainer.
MAINTAINER Nawaz Dhandala <nawazdhandala@outlook.com>

RUN mkdir -p /usr/src/app

WORKDIR /usr/src/app

# Install app dependencies
COPY package.json /usr/src/app/
RUN npm install

# Bundle app source
COPY . /usr/src/app

#Expose port 3020
EXPOSE 3020

#Run the app
CMD [ "node", "app.js" ]