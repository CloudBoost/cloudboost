/*
#     CloudBoost - Core Engine that powers Bakend as a Service
#     (c) 2014 HackerBay, Inc.
#     CloudBoost may be freely distributed under the Apache 2 License
*/

var customHelper = require('../../helpers/custom.js');
var integrationService = require('../../services/integrationService');

var apiTracker = require('../../database-connect/apiTracker');
var customService = require('../../services/cloudObjects');
var appService = require('../../services/app');

module.exports = function (app) {

    app.put('/data/:appId/:tableName', function (req, res) { //save a new document into <tableName> of app
        if (req.body && req.body.method == "DELETE") {
            /******************DELETE API*********************/
            _deleteApi(req, res);
            /******************DELETE API*********************/
        } else {
            /******************SAVE API*********************/

            var appId = req.params.appId;
            var document = req.body.document;
            var collectionName = req.params.tableName;
            var appKey = req.body.key || req.params.key;
            var sdk = req.body.sdk || "REST";
            var table_event = "";

            if (document._id) {
                table_event = "Update";
            } else {
                table_event = "Create";
            }
            appService.isMasterKey(appId, appKey).then(function (isMasterKey) {
                appService.getApp(appId).then(function (application) {
                    customService.save(appId, collectionName, document, customHelper.getAccessList(req), isMasterKey, null, application.keys.encryption_key).then(function (result) {
                        integrationService.integrationNotification(appId, document, collectionName, table_event);
                        res.status(200).send(result);
                    }, function (error) {
                        res.status(400).send(error);
                    });
                }, function () {
                    res.status(400).send("App not found.");
                });
            });

            apiTracker.log(appId, "Object / Save", req.url, sdk);
            /******************SAVE API*********************/
        }
    });

    app.get('/data/:appId/:tableName/find', _getData);
    app.post('/data/:appId/:tableName/find', _getData);

    app.get('/data/:appId/:tableName/count', _count);
    app.post('/data/:appId/:tableName/count', _count);

    app.get('/data/:appId/:tableName/distinct', _distinct);
    app.post('/data/:appId/:tableName/distinct', _distinct);

    app.get('/data/:appId/:tableName/findOne', _findOne);
    app.post('/data/:appId/:tableName/findOne', _findOne);

    app.delete('/data/:appId/:tableName', _deleteApi);

    function _deleteApi(req, res) { //delete a document matching the <objectId>

        var appId = req.params.appId;
        var collectionName = req.params.tableName;
        var document = req.body.document;
        var appKey = req.body.key || req.param('key');
        var sdk = req.body.sdk || "REST";

        appService.isMasterKey(appId, appKey).then(function (isMasterKey) {
            return customService.delete(appId, collectionName, document, customHelper.getAccessList(req), isMasterKey);
        }).then(function (result) {
            integrationService.integrationNotification(appId, document, collectionName, "Delete");
            res.json(result);
        }, function (error) {
            res.status(400).send(error);
        });

        apiTracker.log(appId, "Object / Delete", req.url, sdk);

    }

};

function _getData(req, res) { //get document(s) object based on query and various parameters

    var appId = req.params.appId;
    var collectionName = req.params.tableName;
    var query = req.body.query;
    var select = req.body.select;
    var sort = req.body.sort;
    var limit = req.body.limit;
    var skip = req.body.skip;
    var appKey = req.body.key || req.param('key');
    var sdk = req.body.sdk || "REST";

    appService.isMasterKey(appId, appKey).then(function (isMasterKey) {
        return customService.find(appId, collectionName, query, select, sort, limit, skip, customHelper.getAccessList(req), isMasterKey);
    }).then(function (results) {
        res.json(results);
    }, function (error) {
        res.status(400).send(error);
    });

    apiTracker.log(appId, "Object / Find", req.url, sdk);
}

function _count(req, res) { //get document(s) object based on query and various parameters

    var appId = req.params.appId;
    var collectionName = req.params.tableName;
    var query = req.body.query;
    var limit = req.body.limit;
    var skip = req.body.skip;
    var appKey = req.body.key || req.param('key');
    var sdk = req.body.sdk || "REST";

    appService.isMasterKey(appId, appKey).then(function (isMasterKey) {
        return customService.count(appId, collectionName, query, limit, skip, customHelper.getAccessList(req), isMasterKey);
    }).then(function (result) {
        res.json(result);
    }, function (error) {
        res.status(400).send(error);
    });

    apiTracker.log(appId, "Object / Count", req.url, sdk);
}

function _distinct(req, res) { //get document(s) object based on query and various parameters

    var appId = req.params.appId;
    var collectionName = req.params.tableName;
    var onKey = req.body.onKey;
    var query = req.body.query;
    var select = req.body.select;
    var sort = req.body.sort;
    var limit = req.body.limit;
    var skip = req.body.skip;
    var appKey = req.body.key || req.param('key');
    var sdk = req.body.sdk || "REST";

    appService.isMasterKey(appId, appKey).then(function (isMasterKey) {
        return customService.distinct(appId, collectionName, onKey, query, select, sort, limit, skip, customHelper.getAccessList(req), isMasterKey);
    }).then(function (results) {
        res.json(results);
    }, function (error) {
        res.status(400).send(error);
    });

    apiTracker.log(appId, "Object / Distinct", req.url, sdk);
}

function _findOne(req, res) { //get a single document matching the search query

    var appId = req.params.appId;
    var collectionName = req.params.tableName;
    var query = req.body.query;
    var select = req.body.select;
    var sort = req.body.sort;
    var skip = req.body.skip;
    var appKey = req.body.key || req.param('key');
    var sdk = req.body.sdk || "REST";

    appService.isMasterKey(appId, appKey).then(function (isMasterKey) {
        return customService.findOne(appId, collectionName, query, select, sort, skip, customHelper.getAccessList(req), isMasterKey);
    }).then(function (result) {
        res.json(result);
    }, function (error) {
        res.status(400).send(error);
    });

    apiTracker.log(appId, "Object / FindOne", req.url, sdk);
}