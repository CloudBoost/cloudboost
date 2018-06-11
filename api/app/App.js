/*
#     CloudBoost - Core Engine that powers Bakend as a Service
#     (c) 2014 HackerBay, Inc.
#     CloudBoost may be freely distributed under the Apache 2 License
*/
var path = require('path');
var util = require("../../helpers/util.js");
module.exports = function () {

    /**
     * @description Middleware used for zapier application auth using app ID and app secret key
     * @param {*} req
     * @param {Object} req.body
     * @param {String} req.body.appId
     * @param {String} req.body.appKey
     * @param {*} res
     */

    global.app.post('/app/token', function (req, res) {
        var appId = req.body.appId;
        var appKey = req.body.appKey;

        global.appService.isMasterKey(appId, appKey).then(function (isValid) {
            if (isValid) {
                return global.appService.getApp(appId).then(function (app) {
                    return res.status(200).json({
                        appName: app.name
                    });
                }, function () {
                    return res.status(401).send('App not found');
                });
            } else {
                return res.status(401).send('Invalid access keys provided');
            }
        },  function () {
            return res.status(401).send('Invalid keys');
        });
    });

    //create a new app.
    global.app.post('/app/:appId', function (req, res) {

        try {


            var appId = req.params.appId;


            var sdk = req.body.sdk || "REST";

            if (global.keys.secureKey === req.body.secureKey) {

                global.appService.createApp(appId).then(function (app) {

                    global.appService.createDefaultTables(appId).then(function () {

                        delete app.keys.encryption_key;
                        res.status(200).send(app);
                    }, function (err) {


                        res.status(500).send(err);
                    });

                }, function (err) {


                    res.status(500).send(err);
                });
            } else {

                res.status(401).send("Unauthorized");
            }

            global.apiTracker.log(appId, "App / Create", req.url, sdk);

        } catch (e) {

        }
    });

    //delete app.
    global.app.delete('/app/:appId', _deleteApp);
    global.app.put('/app/:appId', _deleteApp);

    function _deleteApp(req, res) { //delete the app and all of its data.

        var appId = req.params.appId;
        var sdk = req.body.sdk || "REST";

        var body = req.body || {};
        var deleteReason = body.deleteReason;
        if (global.keys.secureKey === body.secureKey) {

            //delete all code here.
            global.appService.deleteApp(appId, deleteReason).then(function () {

                return res.status(200).send({
                    status: 'Success'
                });
            }, function () {

                return res.status(500).send({
                    status: 'Error'
                });
            });
        } else {

            return res.status(401).send({
                status: 'Unauthorized'
            });
        }

        global.apiTracker.log(appId, "App / Delete", req.url, sdk);

    }

    //delete a table.
    global.app.delete('/app/:appId/:tableName', _deleteTable);

    function _deleteTable(req, res) { //delete the app and all of its data.

        try {
            //this method is to delete a particular collection from an global.app.

            var appId = req.params.appId;
            var tableName = req.params.tableName;
            var sdk = req.body.sdk || "REST";

            var appKey = req.body.key || req.params.key;

            // to delete table authorize on app level
            global.appService.isClientAuthorized(appId, appKey, 'app', null).then(function (isAuthorized) {
                if (isAuthorized) {
                    global.appService.deleteTable(appId, tableName).then(function (table) {
                        res.status(200).send(table);
                    }, function (error) {


                        res.status(500).send('Cannot delete table at this point in time. Please try again later.');
                    });
                } else return res.status(401).send({
                    status: 'Unauthorized'
                });
            }, function (error) {
                return res.status(401).send({
                    status: 'Unauthorized',
                    message: error
                });
            })

        } catch (e) {


            return res.status(500).send('Cannot delete table.');
        }

        global.apiTracker.log(appId, "App / Table / Delete", req.url, sdk);
    }

    //create a table.
    global.app.put('/app/:appId/:tableName', function (req, res) {



        if (req.body && req.body.method == "DELETE") {
            /***************************DELETE******************************/
            _deleteTable(req, res);
            /***************************DELETE******************************/
        } else {

            /***************************UPDATE******************************/

            var appId = req.params.appId;
            var tableName = req.params.tableName;
            var body = req.body || {};
            var sdk = req.body.sdk || "REST";
            var appKey = req.body.key || req.params.key;

            if (global.mongoDisconnected) {
                return res.status(500).send('Storage / Cache Backend are temporarily down.');
            }

            // check if table already exists
            global.appService.getTable(appId, tableName).then(function (table) {
                // authorize client for table level, if table found then authorize on table level else on app level for creating new table.
                var authorizationLevel = table ? 'table' : 'app';
                global.appService.isClientAuthorized(appId, appKey, authorizationLevel, table).then(function (isAuthorized) {
                    if (isAuthorized) {
                        global.appService.upsertTable(appId, tableName, body.data.columns, body.data).then(function (table) {
                            return res.status(200).send(table);
                        }, function (err) {
                            return res.status(500).send(err);
                        });
                    } else return res.status(401).send({
                        status: 'Unauthorized'
                    });
                }, function (error) {
                    return res.status(401).send({
                        status: 'Unauthorized',
                        message: error
                    });
                })

            }, function (err) {
                return res.status(500).send(err);
            });

            global.apiTracker.log(appId, "App / Table / Create", req.url, sdk);
        }
    });

    //get a table.
    global.app.post('/app/:appId/:tableName', _getTable);
    global.app.get('/app/:appId/:tableName', _getTable);

    // global.app.get('/app/:appId/:tableName', _getColumn);

    function _getTable(req, res) {


        var appId = req.params.appId;
        var tableName = req.params.tableName;
        var sdk = req.body.sdk || "REST";
        var appKey = req.body.key || req.params.key;

        if (tableName === "_getAll") {
            // to get all tables authorize on app level;
            global.appService.isClientAuthorized(appId, appKey, 'app', null).then(function (isAuthorized) {
                if (isAuthorized) {
                    global.appService.getAllTables(appId).then(function (tables) {
                        return res.status(200).send(tables);
                    }, function (err) {
                        return res.status(500).send('Error');
                    });
                } else return res.status(401).send({
                    status: 'Unauthorized'
                });
            }, function (error) {
                return res.status(401).send({
                    status: 'Unauthorized',
                    message: error
                });
            });

        } else {

            global.appService.getTable(appId, tableName).then(function (table) {
                // to get a tables authorize on table level;
                global.appService.isClientAuthorized(appId, appKey, 'table', table).then(function (isAuthorized) {
                    if (isAuthorized) {
                        return res.status(200).send(table);
                    } else return res.status(401).send({
                        status: 'Unauthorized'
                    });
                }, function (error) {
                    return res.status(401).send({
                        status: 'Unauthorized',
                        message: error
                    });
                })

            }, function (err) {
                return res.status(500).send('Error');
            });
        }

        global.apiTracker.log(appId, "App / Table / Get", req.url, sdk);
    }

    //Export Database for :appID
    global.app.post('/backup/:appId/exportdb', function (req, res) {

        try {
            var appKey = req.body.key;
            var appId = req.params.appId;

            global.appService.isMasterKey(appId, appKey).then(function (isMasterKey) {

                if (isMasterKey) {
                    global.appService.exportDatabase(appId).then(function (data) {
                        res.writeHead(200, {
                            "Content-Type": "application/octet-stream",
                            "Content-Disposition": "attachment; filename=dump" + (new Date()) + ".json"
                        });
                        res.end(JSON.stringify(data));
                    }, function (err) {


                        res.status(500).send("Error");
                    });
                } else {
                    res.status(401).send({
                        status: 'Unauthorized'
                    });
                }
            }, function (error) {
                return res.status(500).send('Cannot retrieve security keys.');
            });
        } catch (e) {

        }
    });

    //Import Database for :appID
    global.app.post('/backup/:appId/importdb', function (req, res) {

        try {
            var appKey = req.body.key;
            var appId = req.params.appId;
            global.appService.isMasterKey(appId, appKey).then(function (isMasterKey) {
                if (isMasterKey) {
                    var file;
                    if (req.files && req.files.file) {
                        file = req.files.file.data;
                    }
                    if (file) {
                        global.appService.importDatabase(appId, file).then(function (data) {
                            if (data) {
                                res.status(200).json({
                                    Success: true
                                });
                            } else {
                                res.status(500).json({
                                    success: false
                                });
                            }
                        }, function (err) {


                            res.status(500).send("Error");
                        });
                    }
                } else {
                    res.status(401).send({
                        status: 'Unauthorized'
                    });
                }
            }, function (error) {
                return res.status(500).send('Cannot retrieve security keys.');
            });
        } catch (e) {

        }
    });

    //Export Table for :appID
    global.app.post('/export/:appId/:tableName', function (req, res) {

        try {
            var appKey = req.body.key;
            var appId = req.params.appId;
            var tableName = req.params.tableName;
            var exportType = req.body.exportType;
            var customHelper = require('../../helpers/custom.js');
            var accessList = customHelper.getAccessList(req)
            if (!appKey) {
                res.status(400).send("key is missing");
            }
            if (!appId) {
                res.status(400).send("appId is missing");
            }
            if (!tableName) {
                res.status(400).send("tableName is missing");
            }
            if (!exportType) {
                res.status(400).send("exportType is missing");
            }
            global.appService.isMasterKey(appId, appKey).then(function (isMasterKey) {
                global.appService.exportTable(appId, tableName, exportType.toLowerCase(), isMasterKey, accessList).then(function (data) {
                    if (exportType.toLowerCase() === 'json') {
                        res.status(200).json(data);
                    } else {
                        res.status(200).send(data);
                    }
                }, function (err) {


                    res.status(500).send(err);
                });
            }, function (error) {
                return res.status(500).send('Cannot retrieve security keys.');
            });

        } catch (e) {

        }
    });

    //Import Table for :appID
    global.app.post('/import/:appId', function (req, res, next) {

        try {
            var appKey = req.body.key;
            var appId = req.params.appId;
            var fileId = req.body.fileId;
            var tableName = req.body.tableName;
            var fileName = req.body.fileName;
            var fileExt = path.extname(fileName);

            if (!appKey) {
                return res.status(400).send("key is missing");
            }
            if (!appId) {
                return res.status(400).send("appId is missing");
            }
            if (!tableName) {
                return res.status(400).send("tableName is missing");
            }
            if (!fileId) {
                return res.status(400).send("fileId is missing");
            }
            if (fileExt != ".csv" && fileExt != '.json' && fileExt != '.xls' && fileExt != '.xlsx') {
                return res.status(400).send(fileExt + " is not allowed");
            }
            global.appService.isMasterKey(appId, appKey).then(function (isMasterKey) {
                global.appService.importTable(req, isMasterKey).then(function (result) {
                    return res.status(200).json(result);
                }, function (error) {
                    return res.status(500).send(error);
                })
            }, function (error) {
                return res.status(500).send('Cannot retrieve security keys.');
            });
        } catch (e) {

        }
    });
};