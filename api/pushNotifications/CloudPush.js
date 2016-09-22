
/*
#     CloudBoost - Core Engine that powers Bakend as a Service
#     (c) 2014 HackerBay, Inc. 
#     CloudBoost may be freely distributed under the Apache 2 License
*/


var q = require("q");
var fs = require('fs');
var customHelper = require('../../helpers/custom.js');
var util = require("../../helpers/util.js");
var _ = require('underscore');
var Stream = require('stream');
var Grid = require('gridfs-stream');

module.exports = function() {   

    //Send push notifications
    global.app.post('/push/:appId/send', function (req, res) {

        console.log("++++ Send push notification++++++");

        var appId    = req.params.appId;     
        var appKey   = req.body.key || req.params.key;
        var body     = req.body;

        var collectionName = "Device";
        var query          = body.query;
        var select         = body.select;
        var sort           = body.sort;
        var limit          = body.limit;
        var skip           = body.skip;
        var userId         = req.session.userId || null;       
        var sdk            = body.sdk || "REST";
        var pushData       = body.data;        
       
        if(!select){
            global.appService.isMasterKey(appId, appKey).then(function (isMasterKey) {                
                return global.pushService.sendPush(appId,collectionName, query, sort, limit,skip,customHelper.getAccessList(req),isMasterKey,pushData);
            }).then(function (results) {
                res.status(200).send(results);
            }, function (error) {

                if(util.isJsonObject(error)){
                   error=JSON.stringify(error);
                }               

                res.status(400).send(error);
            });
        }else{
            res.status(400).send("Select param in CloudQuery is not allowed.");
        }       
        
        global.apiTracker.log(appId,"Push / Send", req.url,sdk);                
        
    });

    global.app.put('/push/:appId', function (req, res, next) { 
        if(req.body && req.body.method=="DELETE"){
            /******************DELETE API*********************/
            _deleteApi(req, res);
            /******************DELETE API*********************/
        }else{
            /******************SAVE API*********************/
            console.log("SAVE API");
            var appId = req.params.appId;
            var document = req.body.document;
            var collectionName = "Device";
            var userId = req.session.userId || null;
            var appKey = req.body.key || req.params.key;
            var sdk = req.body.sdk || "REST";
            
            global.appService.isMasterKey(appId, appKey).then(function (isMasterKey) {
                return global.pushService.upsertDevice(appId, collectionName, document, customHelper.getAccessList(req), isMasterKey);
            }).then(function (result) {
                console.log('+++ Save Success +++');
                console.log(result);
                res.status(200).send(result);
            }, function (error) {
                console.log('++++++ Save Error +++++++');
                console.log(error);
                res.status(400).send(error);
            });

            global.apiTracker.log(appId,"Object / Save", req.url,sdk);
            /******************SAVE API*********************/
        }
    });

    global.app.delete('/push/:appId', _deleteApi);

    function _deleteApi(req, res, next) { //delete a document matching the <objectId>
        console.log("DELETE API");
        var appId = req.params.appId;
        var collectionName = "Device";
        var userId = req.session.userId || null;
        var document = req.body.document;
        var appKey = req.body.key || req.param('key');
        var sdk = req.body.sdk || "REST";

        global.appService.isMasterKey(appId,appKey).then(function(isMasterKey){
            return global.pushService.deleteDevice(appId, collectionName, document, customHelper.getAccessList(req),isMasterKey);
        }).then(function(result) {
            res.json(result);
        }, function(error) {
            res.status(400).send(error);
        });
       
        global.apiTracker.log(appId,"Object / Delete", req.url,sdk);
       
    }


};


