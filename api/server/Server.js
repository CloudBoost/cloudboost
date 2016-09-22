
/*
#     CloudBoost - Core Engine that powers Bakend as a Service
#     (c) 2014 HackerBay, Inc. 
#     CloudBoost may be freely distributed under the Apache 2 License
*/


var util = require('../../helpers/util.js');
var request = require('request');
var q = require('q');

module.exports = function() {

    //Description : Used to change server URL form localhost to any DNS. 
    //Params : secureKey : Used to validate the request. 
    //         url : New Server URL. 
    //Returns : 200 - success
    //          400 - Invalid URL, 401 - Unauthoroized, 500 - Internal Server Error.     
    global.app.post('/server/url', function(req, res) {
        try {
            console.log("++++ Change Server URL ++++++");
            console.log("New URL : "+req.body.url);
            if (!util.isUrlValid(req.body.url)) {
                return res.status(400).send("Invalid URL");
            }

            if (global.keys.secureKey === req.body.secureKey) {
                console.log("Secure Key Valid. Creating app...");
                global.keyService.changeUrl(req.body.url).then(function (url) {
                    console.log("URL Updated to "+url);
                    res.status(200).send({status : "success", message : "Cluster URL Updated to "+url});
                }, function (err) {
                    console.log("Error : Cannot change the URL");
                    console.log(err);
                    res.status(500).send("Error, Cannot change the cluster URL at this time.");
                });
            } else {
                console.log("Unauthorized: Invalid Secure Key ");
                res.status(401).send("Unauthorized");
            }
        }catch(e){
            console.log(e);
            res.send(500, "Internal Server Error");
        }
    });


    global.app.get('/status', function(req,res,next) {

        console.log("MongoDB,RedisDB");        

        global.serverService.getDBStatuses().then(function(response){           
            return res.status(200).json({status:200, message : "Service Status : OK"});            
        },function(error){
            return res.status(500).send(error);
        });    
                  
    });
};

