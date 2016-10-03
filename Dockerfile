#
# CloudBoost Dockerfile
#
# Pull base image nodejs image.
FROM node:5.6

#Maintainer.
MAINTAINER Nawaz Dhandala <nawazdhandala@outlook.com>

RUN mkdir -p /usr/src/app

WORKDIR /usr/src/app

# Install app dependencies
COPY package.json /usr/src/app/

RUN npm install

#Store the Public IP in the env variable. 
RUN export CLOUDBOOST_PUBLIC_IP="$(wget http://ipinfo.io/ip -qO -)"

# Bundle app source
COPY . /usr/src/app

# Expose ports.
#   - 4730: CloudBoost HTTP REST API
EXPOSE 4730

#Run the app
CMD [ "npm", "start" ]
