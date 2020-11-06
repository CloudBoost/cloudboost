#
# CloudBoost File-Ui Dockerfile
#

# Pull base image nodejs image.
FROM node:boron

#Maintainer.
MAINTAINER CloudBoost <hello@cloudboost.io>

ADD package.json /app/package.json
RUN cd /app && npm install
RUN mkdir -p /opt/app && cp -a /app/node_modules /opt/app/


WORKDIR /opt/app
ADD . /opt/app

RUN npm run-script build

# Expose ports.
#   - 3012: CloudBoost File-ui
EXPOSE 3012

#Run the app
CMD [ "node", "server.js" ]
