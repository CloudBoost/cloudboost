
/*
#     CloudBoost - Core Engine that powers Bakend as a Service
#     (c) 2014 HackerBay, Inc. 
#     CloudBoost may be freely distributed under the Apache 2 License
*/


var util = require('../../helpers/util.js');
var config = require('../../config/config');
var serverService = require('../../services/server');
var keyService = require('../../database-connect/keyService');
var winston = require('winston');

module.exports = function(app) {

    //Description : Used to change server URL form localhost to any DNS. 
    //Params : secureKey : Used to validate the request. 
    //         url : New Server URL. 
    //Returns : 200 - success
    //          400 - Invalid URL, 401 - Unauthoroized, 500 - Internal Server Error.     
    app.post('/server/url', function(req, res) {

            if (!util.isUrlValid(req.body.url)) {
                return res.status(400).send("Invalid URL");
            }

            if (config.secureKey === req.body.secureKey) {
                keyService.changeUrl(req.body.url).then(function (url) {
                    res.status(200).send({status : "success", message : "Cluster URL Updated to "+url});
                }, function (err) {
                    winston.error({
                        error: err
                    });
                    res.status(500).send("Error, Cannot change the cluster URL at this time.");
                });
            } else {
                res.status(401).send("Unauthorized");
            }
    });


    app.get('/status', function(req,res) {
        serverService.getDBStatuses().then(function(){           
            return res.status(200).json({status:200, message : "Service Status : OK"});            
        },function(error){
            return res.status(500).send(error);
        });    
                  
    });
};

