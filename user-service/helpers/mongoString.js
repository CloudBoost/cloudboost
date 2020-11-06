const winston = require('winston');
const keys = require('../config/keys');

module.exports = function () {
  if ((!keys.config && !process.env.MONGO_1_PORT_27017_TCP_ADDR && !process.env.KUBERNETES_STATEFUL_MONGO_URL)) {
    winston.error('INFO : Not running on Docker. Use docker-compose (recommended) from https://github.com/cloudboost/docker');
  }

  // MongoDB connections.
  let mongoConnectionString = 'mongodb://';

  if (process.env.CLOUDBOOST_MONGODB_USERNAME && process.env.CLOUDBOOST_MONGODB_PASSWORD) {
    mongoConnectionString += `${process.env.CLOUDBOOST_MONGODB_USERNAME}:${process.env.CLOUDBOOST_MONGODB_PASSWORD}@`;
  }

  let isReplicaSet = false;

  if (keys.config && keys.config.mongo && keys.config.mongo.length > 0) {
    // take from config file

    if (keys.config.mongo.length > 1) {
      isReplicaSet = true;
    }

    for (let i = 0; i < keys.config.mongo.length; i++) {
      mongoConnectionString += `${keys.config.mongo[i].host}:${keys.config.mongo[i].port}`;
      mongoConnectionString += ',';
    }
  } else if (process.env.KUBERNETES_STATEFUL_MONGO_URL) {
    mongoConnectionString += process.env.KUBERNETES_STATEFUL_MONGO_URL;
    isReplicaSet = true;
  } else {
    let i = 1;

    if (process.env.MONGO_PORT_27017_TCP_ADDR && process.env.MONGO_PORT_27017_TCP_PORT) {
      mongoConnectionString += `${process.env.MONGO_PORT_27017_TCP_ADDR}:${process.env.MONGO_PORT_27017_TCP_PORT}`;
      mongoConnectionString += ',';
    } else {
      while (process.env[`MONGO_${i}_PORT_27017_TCP_ADDR`] && process.env[`MONGO_${i}_PORT_27017_TCP_PORT`]) {
        if (i > 1) {
          isReplicaSet = true;
        }
        mongoConnectionString += `${process.env[`MONGO_${i}_PORT_27017_TCP_ADDR`]}:${process.env[`MONGO_${i}_PORT_27017_TCP_PORT`]}`;
        mongoConnectionString += ',';
        i++;
      }
    }
  }
  let m = 1;
  keys.mongoPublicUrls = [];
  while (process.env[`CB_MONGO_${m}_SERVER`]) {
    keys.mongoPublicUrls.push(process.env[`CB_MONGO_${m}_SERVER`]);
    m++;
  }

  mongoConnectionString = mongoConnectionString.substring(0, mongoConnectionString.length - 1);
  mongoConnectionString += '/'; // de limitter.
  global.mongoConnectionString = mongoConnectionString;

  let dbUrl = mongoConnectionString + keys.globalDb;

  if (isReplicaSet) {
    // eslint-disable-next-line max-len
    dbUrl += '?replicaSet=cloudboost&slaveOk=true&maxPoolSize=200&ssl=false&connectTimeoutMS=30000&socketTimeoutMS=30000&w=1&wtimeoutMS=30000';
  }

  keys.mongoConnectionString = dbUrl;
  keys.db = dbUrl;

  return dbUrl;
};
