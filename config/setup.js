var keyService = require('../database-connect/keyService');
var serverService = require('../services/server');

var config = require('./config');
var winston = require('winston');

module.exports = function () {
    try {
        var db = require('../database-connect/mongoConnect.js').connect();
        db.then(function (dbc) {
            try {
                config.mongoClient = dbc;
                //Init Secure key for this cluster. Secure key is used for Encryption / Creating apps , etc.
                keyService.initSettingsVariable().then(function (settings) {
                    config.secureKey = settings.secureKey;
                    config.clusterKey = settings.clusterKey;
                    config.myURL = settings.myURL;
                    winston.info("Secure Key: " + settings.secureKey);
                    winston.info("Cluster Key: " + settings.clusterKey);
                    winston.info("IMPORTANT: Please keep Secure Key private. Revealing it would make your server vulnerable.");
                    serverService.registerServer(settings.secureKey);
                }, function () {
                    winston.error("Failed to initialize Secure Key. Please check if MongoDB is connected and restart server.");
                });
            } catch (e) {
                winston.log('error', {
                    "error": String(e),
                    "stack": new Error().stack
                });
            }
        }, function (e) {
            winston.log('error', {
                "error": String(e),
                "stack": new Error().stack
            });
            // exit server if connection to mongo was not made
            process.exit(1);
        });

    } catch (err) {
        winston.log('error', {
            "error": String(err),
            "stack": new Error().stack
        });
    }
};
