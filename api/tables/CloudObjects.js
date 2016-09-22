
/*
#     CloudBoost - Core Engine that powers Bakend as a Service
#     (c) 2014 HackerBay, Inc. 
#     CloudBoost may be freely distributed under the Apache 2 License
*/


var customHelper = require('../../helpers/custom.js');

module.exports = function() {


    global.app.put('/data/:appId/:tableName', function (req, res, next) { //save a new document into <tableName> of app
        if(req.body && req.body.method=="DELETE"){
            /******************DELETE API*********************/
            _deleteApi(req, res);
            /******************DELETE API*********************/
        }else{
            /******************SAVE API*********************/
            console.log("SAVE API");
            var appId = req.params.appId;
            var document = req.body.document;
            var collectionName = req.params.tableName;
            var userId = req.session.userId || null;
            var appKey = req.body.key || req.params.key;
            var sdk = req.body.sdk || "REST";
            
            global.appService.isMasterKey(appId, appKey).then(function (isMasterKey) {
                return global.customService.save(appId, collectionName, document, customHelper.getAccessList(req), isMasterKey);
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
    
	
    global.app.get('/data/:appId/:tableName/find', _getData);
    global.app.post('/data/:appId/:tableName/find', _getData);

    global.app.get('/data/:appId/:tableName/count', _count);
    global.app.post('/data/:appId/:tableName/count', _count);

    global.app.get('/data/:appId/:tableName/distinct', _distinct);
    global.app.post('/data/:appId/:tableName/distinct', _distinct);

    global.app.get('/data/:appId/:tableName/findOne', _findOne);
    global.app.post('/data/:appId/:tableName/findOne', _findOne);
   
	global.app.delete('/data/:appId/:tableName', _deleteApi);

    function _deleteApi(req, res, next) { //delete a document matching the <objectId>
        console.log("DELETE API");
        var appId = req.params.appId;
        var collectionName = req.params.tableName;
        var userId = req.session.userId || null;
        var document = req.body.document;
        var appKey = req.body.key || req.param('key');
        var sdk = req.body.sdk || "REST";

        global.appService.isMasterKey(appId,appKey).then(function(isMasterKey){
            return global.customService.delete(appId, collectionName, document, customHelper.getAccessList(req),isMasterKey);
        }).then(function(result) {
            res.json(result);
        }, function(error) {
            res.status(400).send(error);
        });
       
        global.apiTracker.log(appId,"Object / Delete", req.url,sdk);
       
    }

};

function _getData(req, res, next) { //get document(s) object based on query and various parameters
    console.log("FIND API");
    var appId = req.params.appId;
    var collectionName = req.params.tableName;
    var query = req.body.query;
    var select = req.body.select;
    var sort = req.body.sort;
    var limit = req.body.limit;
    var skip = req.body.skip;
    var userId = req.session.userId || null;
    var appKey = req.body.key || req.param('key');
    var sdk = req.body.sdk || "REST";
    
    global.appService.isMasterKey(appId, appKey).then(function (isMasterKey) {
        return global.customService.find(appId, collectionName, query, select, sort, limit, skip, customHelper.getAccessList(req), isMasterKey)
    }).then(function (results) {
        res.json(results);
    }, function (error) {
        res.status(400).send(error);
    });
    
    global.apiTracker.log(appId,"Object / Find", req.url,sdk);
}

function _count(req, res, next) { //get document(s) object based on query and various parameters
    console.log("COUNT API");
    var appId = req.params.appId;
    var collectionName = req.params.tableName;
    var query = req.body.query;
    var limit = req.body.limit;
    var skip = req.body.skip;
    var userId = req.session.userId || null;
    var appKey = req.body.key || req.param('key');
    var sdk = req.body.sdk || "REST";
    
    global.appService.isMasterKey(appId, appKey).then(function (isMasterKey) {
        return global.customService.count(appId, collectionName, query, limit, skip, customHelper.getAccessList(req), isMasterKey);
    }).then(function (result) {
        res.json(result);
    }, function (error) {
        res.status(400).send(error);
    });
    
    global.apiTracker.log(appId,"Object / Count", req.url,sdk);
}

function _distinct(req, res, next) { //get document(s) object based on query and various parameters
    console.log("DISTINCT API");
    var appId = req.params.appId;
    var collectionName = req.params.tableName;
    var onKey = req.body.onKey;
    var query = req.body.query;
    var select = req.body.select;
    var sort = req.body.sort;
    var limit = req.body.limit;
    var skip = req.body.skip;
    var userId = req.session.userId || null;
    var appKey = req.body.key || req.param('key');
    var sdk = req.body.sdk || "REST";
    
    global.appService.isMasterKey(appId, appKey).then(function (isMasterKey) {
        return global.customService.distinct(appId, collectionName, onKey, query, select, sort, limit, skip, customHelper.getAccessList(req), isMasterKey);
    }).then(function (results) {
        res.json(results);
    }, function (error) {
        res.status(400).send(error);
    });
    
    global.apiTracker.log(appId,"Object / Distinct", req.url,sdk);
}

function _findOne(req, res, next) { //get a single document matching the search query
    console.log("FIND ONE API");
    var appId = req.params.appId;
    var collectionName = req.params.tableName;
    var query = req.body.query;
    var select = req.body.select;
    var sort = req.body.sort;
    var skip = req.body.skip;
    var userId = req.session.userId || null;
    var appKey = req.body.key || req.param('key');
    var sdk = req.body.sdk || "REST";
    
    global.appService.isMasterKey(appId, appKey).then(function (isMasterKey) {
        return global.customService.findOne(appId, collectionName, query, select, sort, skip, customHelper.getAccessList(req), isMasterKey);
    }).then(function (result) {
        res.json(result);
    }, function (error) {
        res.status(400).send(error);
    });
    
    global.apiTracker.log(appId,"Object / FindOne", req.url,sdk);
}
