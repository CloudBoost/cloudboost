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
                res.status(400).send(error);
            });
        }else{
            res.status(400).send("Select param in CloudQuery is not allowed.");
        }       
        
        global.apiTracker.log(appId,"Push / Send", req.url,sdk);                
        
    });


};


