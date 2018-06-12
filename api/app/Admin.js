/*
#     CloudBoost - Core Engine that powers Bakend as a Service
#     (c) 2014 HackerBay, Inc. 
#     CloudBoost may be freely distributed under the Apache 2 License
*/
var config = require('../../config/config');

module.exports = function (app) {

    //Change MasterKey/ClientKey
    app.put('/admin/:appId/clientkey', function (req, res) {

        try {
            var appId = req.params.appId;

            if (config.secureKey === req.body.secureKey) {

                global.appService.changeAppClientKey(appId, req.body.value).then(function (app) {
                    res.status(200).json(app);
                }, function (err) {
                    res.status(500).send("Error");
                });

            } else {
                res.status(401).send("Unauthorized");
            }
        } catch (e) {

        }
    });

    //Change MasterKey/ClientKey
    app.put('/admin/:appId/masterkey', function (req, res) {


        try {

            var appId = req.params.appId;

            if (config.secureKey === req.body.secureKey) {
                global.appService.changeAppMasterKey(appId, req.body.value).then(function (app) {
                    res.status(200).json(app);
                }, function (err) {
                    res.status(500).send("Error");
                });

            } else {
                res.status(401).send("Unauthorized");
            }


        } catch (e) {

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
        try {
            if (config.secureKey === req.body.secureKey) {
                global.appService.createDatabaseUser(req.params.appId).then(function (userData) {
                    res.status(200).json({
                        user: userData
                    });
                }, function (err) {
                    res.status(500).send("Server Erorr");
                });
            } else {

                res.status(401).send("Unauthorized");
            }
        } catch (e) {

        }
    });
};