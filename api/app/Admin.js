/*
#     CloudBoost - Core Engine that powers Bakend as a Service
#     (c) 2014 HackerBay, Inc. 
#     CloudBoost may be freely distributed under the Apache 2 License
*/
var config = require('../../config/config');
var appService = require('../../services/app');
var winston = require('winston');

module.exports = function (app) {

    //Change MasterKey/ClientKey
    app.put('/admin/:appId/clientkey', function (req, res) {

        var appId = req.params.appId;

        if (config.secureKey === req.body.secureKey) {

            appService.changeAppClientKey(appId, req.body.value).then(function (app) {
                res.status(200).json(app);
            }, function (err) {
                winston.error({
                    error: err
                });
                res.status(500).send("Error");
            });

        } else {
            res.status(401).send("Unauthorized");
        }
    });

    //Change MasterKey/ClientKey
    app.put('/admin/:appId/masterkey', function (req, res) {

        var appId = req.params.appId;

        if (config.secureKey === req.body.secureKey) {
            appService.changeAppMasterKey(appId, req.body.value).then(function (app) {
                res.status(200).json(app);
            }, function (err) {
                winston.error({
                    error: err
                });
                res.status(500).send("Error");
            });

        } else {
            res.status(401).send("Unauthorized");
        }
    });

    /**
    *Description : Adds a user to its specefic database as a read/write admin
    *Params: 
    *- Param appID : Database Name
    *- Param secureKey: Secure key of System
    *Returns:
    -Success : User data (username,password)
    -Error : Error Data( 'Server Error' : status 500 )
    */
    app.post('/admin/dbaccess/enable/:appId', function (req, res) {
        if (config.secureKey === req.body.secureKey) {
            appService.createDatabaseUser(req.params.appId).then(function (userData) {
                res.status(200).json({
                    user: userData
                });
            }, function (err) {
                winston.error({
                    error: err
                });
                res.status(500).send("Server Erorr");
            });
        } else {
            res.status(401).send("Unauthorized");
        }
    });
};