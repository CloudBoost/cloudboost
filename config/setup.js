const winston = require('winston');
const { MongoAdapter } = require('mongo-adapter');
const keyService = require('../database-connect/keyService');
const serverService = require('../services/server');
// import mongoConnect from '../database-connect/mongoConnect.js';
const config = require('./config');
const getMongoConnectionString = require('./mongo');

module.exports = async () => {
    try {
        const dbc = await MongoAdapter.connect({
            connectionString: getMongoConnectionString(),
        });
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
    } catch (error) {
        winston.error('Failed to initialize Secure Key. Please check if MongoDB is connected and restart server.');
        winston.error(error);
        process.exit(1);
    }
};
