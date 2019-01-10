const winston = require('winston');
const appConfig = require('./config');

function loadConfig() {
  try {
    const config = require('./cloudboost'); // eslint-disable-line
    return config;
  } catch (e) {
    return {};
  }
}

module.exports = () => {
  const config = loadConfig();
  let mongoConnectionString = 'mongodb://';
  let isReplicaSet = false;

  appConfig.loadedConfig = config;

  if ((!config.mongo
    && !process.env.MONGO_1_PORT_27017_TCP_ADDR
    && !process.env.KUBERNETES_STATEFUL_MONGO_URL)) {
    winston.error('INFO : Not running on Docker. Use docker-compose (recommended) from https://github.com/cloudboost/docker');
  }

  if (process.env.CLOUDBOOST_MONGODB_USERNAME && process.env.CLOUDBOOST_MONGODB_PASSWORD) {
    mongoConnectionString += `${process.env.CLOUDBOOST_MONGODB_USERNAME}:${process.env.CLOUDBOOST_MONGODB_PASSWORD}@`;
  }


  if (config.mongo && config.mongo.length > 0) {
    if (config.mongo[0].username && config.mongo[0].password) {
      mongoConnectionString += `${config.mongo[0].username}:${config.mongo[0].password}@`;
    }

    if (config.mongo.length > 1) {
      isReplicaSet = true;
    }

    for (let i = 0; i < config.mongo.length; i++) {
      mongoConnectionString += `${config.mongo[i].host}:${config.mongo[i].port}`;
      mongoConnectionString += ',';
    }
  } else {
    config.mongo = [];

    if (process.env.KUBERNETES_STATEFUL_MONGO_URL) {
      config.mongo = process.env.KUBERNETES_STATEFUL_MONGO_URL.split(',').map(x => ({
        host: x.split(':')[0],
        port: x.split(':')[1],
      }));

      mongoConnectionString += process.env.KUBERNETES_STATEFUL_MONGO_URL;
      isReplicaSet = true;
    } else {
      let count = 1;

      if (process.env.MONGO_PORT_27017_TCP_ADDR && process.env.MONGO_PORT_27017_TCP_PORT) {
        config.mongo.push({
          host: process.env.MONGO_PORT_27017_TCP_ADDR,
          port: process.env.MONGO_PORT_27017_TCP_PORT,
        });

        mongoConnectionString += `${process.env.MONGO_PORT_27017_TCP_ADDR}:${process.env.MONGO_PORT_27017_TCP_PORT}`;
        mongoConnectionString += ',';
      } else {
        while (process.env[`MONGO_${count}_PORT_27017_TCP_ADDR`] && process.env[`MONGO_${count}_PORT_27017_TCP_PORT`]) {
          if (count > 1) {
            isReplicaSet = true;
          }

          config.mongo.push({
            host: process.env[`MONGO_${count}_PORT_27017_TCP_ADDR`],
            port: process.env[`MONGO_${count}_PORT_27017_TCP_PORT`],
          });
          // eslint-disable-next-line max-len
          mongoConnectionString += `${process.env[`MONGO_${count}_PORT_27017_TCP_ADDR`]}:${process.env[`MONGO_${count}_PORT_27017_TCP_PORT`]}`;
          mongoConnectionString += ',';
          count++;
        }
      }
    }
  }

  // if no docker/kubernetes or local config then switch to localhost.
  if (mongoConnectionString === 'mongodb://') {
    config.mongo = [];
    config.mongo.push({
      host: 'localhost',
      port: '27017',
    });

    mongoConnectionString += 'localhost:27017';
    mongoConnectionString += ',';
  }

  mongoConnectionString = mongoConnectionString.substring(0, mongoConnectionString.length - 1);
  mongoConnectionString += '/'; // de limitter.
  let _mongoConnectionString = mongoConnectionString;

  if (isReplicaSet) {
    const str = '?replicaSet=cloudboost';
    _mongoConnectionString += str;
  }

  appConfig.mongoConnectionString = _mongoConnectionString;

  return _mongoConnectionString;
};
