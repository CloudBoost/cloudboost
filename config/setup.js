const winston = require('winston');
const keyService = require('../database-connect/keyService');
const serverService = require('../services/server');
const mongoConnect = require('../database-connect/mongoConnect.js');
const config = require('./config');

module.exports = async () => {
  try {
    const dbc = await mongoConnect.connect();
    config.mongoClient = dbc;
    // Init Secure key for this cluster. Secure key is used for Encryption / Creating apps , etc.
    const settings = await keyService.initSettingsVariable(dbc);
    config.secureKey = settings.secureKey;
    config.clusterKey = settings.clusterKey;
    config.myURL = settings.myURL;
    winston.info(`Secure Key: ${settings.secureKey}`);
    winston.info(`Cluster Key: ${settings.clusterKey}`);
    winston.info('IMPORTANT: Please keep Secure Key private. Revealing it would make your server vulnerable.');
    serverService.registerServer(settings.secureKey);
  } catch (err) {
    winston.error('Failed to initialize Secure Key. Please check if MongoDB is connected and restart server.');
    winston.log('error', {
      error: String(err),
      stack: new Error().stack,
    });
    process.exit(1);
  }
};
