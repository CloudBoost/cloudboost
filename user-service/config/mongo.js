const winston = require('winston');
const mongoose = require('mongoose');
const keys = require('./keys');
const mongoConnect = require('./mongoConnect');
const keyService = require('./keyService.js');
const cbServerService = require('../services/cbServerService');
const mongoUrl = require('../helpers/mongoString')();

module.exports = function (callback) {
  mongoose.connect(mongoUrl);
  mongoose.connection.once('connected', () => {
    mongoConnect.connect()
      .then((db) => {
        keys.mongoClient = db;
        // init encryption Key.
        return [keyService.initSecureKey(), keyService.initClusterKey()];
      })
      .spread((secureKey) => {
        cbServerService.registerServer(secureKey);
        callback();
      }, (error) => {
        // error
        winston.error({
          error: String(error),
          stack: new Error().stack,
        });
        // exit server if connection to mongo was not made
        process.exit(1);
      });
  });
};
