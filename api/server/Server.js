
/*
#     CloudBoost - Core Engine that powers Bakend as a Service
#     (c) 2014 HackerBay, Inc. 
#     CloudBoost may be freely distributed under the Apache 2 License
*/


var util = require('../../helpers/util.js');
var request = require('request');
var config = require('../../config/config');

module.exports = function(app) {

    //Description : Used to change server URL form localhost to any DNS. 
    //Params : secureKey : Used to validate the request. 
    //         url : New Server URL. 
    //Returns : 200 - success
    //          400 - Invalid URL, 401 - Unauthoroized, 500 - Internal Server Error.     
    app.post('/server/url', function(req, res) {
        try {
            
            
            if (!util.isUrlValid(req.body.url)) {
                return res.status(400).send("Invalid URL");
            }

            if (config.secureKey === req.body.secureKey) {
                
                global.keyService.changeUrl(req.body.url).then(function (url) {
                    
                    res.status(200).send({status : "success", message : "Cluster URL Updated to "+url});
                }, function (err) {
                    
                    
                    res.status(500).send("Error, Cannot change the cluster URL at this time.");
                });
            } else {
                
                res.status(401).send("Unauthorized");
            }
        }catch(e){
            
            res.send(500, "Internal Server Error");
        }
    });


    app.get('/status', function(req,res) {

                

        global.serverService.getDBStatuses().then(function(response){           
            return res.status(200).json({status:200, message : "Service Status : OK"});            
        },function(error){
            return res.status(500).send(error);
        });    
                  
    });
};

