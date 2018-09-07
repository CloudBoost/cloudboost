
var q = require('q');
var json2csv = require('json2csv');
var fs = require('fs');
var path = require('path');

var util = require('../helpers/util');
var customHelper = require('../helpers/custom');
var customService = require('./cloudObjects');
var fileService = require('./cloudFiles');
var importHelpers = require('./importHelpers');
var mongoService = require('../databases/mongo');
var appService = require('./app');

module.exports = {
     exportTable: function (appId, tableName, exportType, isMasterKey, accessList) {

        var deferred = q.defer();
        customService.find(appId, tableName, {}, null, null, 999999, null, accessList, isMasterKey).then(function (tables) {
            tables.map(function (docs) {
                docs.createdAt ? delete docs.createdAt : null;
                docs.updatedAt ? delete docs.updatedAt : null;
                docs._tableName ? delete docs._tableName : null;
                delete docs.expires;
                docs._id ? delete docs._id : null;
                delete docs._version;
                docs.ACL ? delete docs.ACL : null;
                docs._type ? delete docs._type : null;
            });
            if (exportType === 'csv') {
                var result = json2csv({ data: tables });
                deferred.resolve(result);
            } else if (exportType === 'xlsx' || exportType === 'xls') {
                var random = util.getId();
                var fileName = '/tmp/tempfile' + random + '.xlsx';

                fs.readFile(fileName, function read(err, data) {
                    if (err) {
                        deferred.reject("Error : Failed to convert the table.");
                    }
                    fs.unlink(fileName, function (err) {
                        if (err) {
                            deferred.reject(err);
                        }
                        deferred.resolve(data);
                    });
                });
            } else if (exportType === 'json') {
                deferred.resolve(tables);
            } else {
                deferred.reject('Invalid exportType ,exportType should be csv,xls,xlsx,json');
            }
        }, function (err) {
            deferred.reject(err);
        });
        return deferred.promise;
    },

    importTable: function (req, isMasterKey) {
        var deferred = q.defer();
        var appId = req.params.appId;
        var appKey = req.body.key;
        var fileId = req.body.fileId;
        var table = req.body.tableName;
        var tableName = table.replace(/\s/g, '');
        var fileName = req.body.fileName;
        var fileExt = path.extname(fileName);

        fileService.getFile(appId, fileId, customHelper.getAccessList(req), isMasterKey).then(function (file) {
            var fileStream = mongoService.document.getFileStreamById(appId, file._id);
            var parseFile = null;
            var importType;
            if (fileExt == ".csv") {
                parseFile = importHelpers.importCSVFile;
                importType = "csv";
            } else if (fileExt == '.xls' || fileExt == '.xlsx') {
                parseFile = importHelpers.importXLSFile;
                importType = "xls";
            } else {
                parseFile = importHelpers.importJSONFile;
                importType = "json";
            }

            if (parseFile) {
                parseFile(fileStream, tableName).then(function (document) {
                    var body = importHelpers.generateSchema(document, importType);
                    appService.getTable(appId, tableName).then(function (table) {
                        if (table == null) {
                            deferred.reject("Table doesn't exists");
                        } else {
                            importHelpers.compareSchema(document, table, body).then(function (schema) {
                                // check if table already exists
                                appService.getTable(appId, tableName).then(function (table) {
                                    // authorize client for table level, if table found then authorize on table level else on app level for creating new table.
                                    var authorizationLevel = table ? 'table' : 'app';
                                    appService.isClientAuthorized(appId, appKey, authorizationLevel, table).then(function (isAuthorized) {
                                        if (isAuthorized) {
                                            appService.upsertTable(appId, tableName, schema.data.columns, schema.data).then(function () {
                                                customService.save(appId, tableName, document, customHelper.getAccessList(req), isMasterKey).then(function (result) {
                                                    deferred.resolve(result);
                                                }, function (error) {
                                                    deferred.reject(error);
                                                });
                                            }, function (err) {
                                                return deferred.reject(err);
                                            });
                                        } else return deferred.reject({ status: 'Unauthorized' });
                                    }, function (error) {
                                        return deferred.reject({ status: 'Unauthorized', message: error });
                                    });

                                }, function (err) {
                                    return deferred.reject(err);
                                });
                            }, function (err) {


                                deferred.reject(err);
                            });

                        }
                    }, function (err) {
                        deferred.reject(err);
                    });
                }, function (error) {
                    deferred.reject(error);
                });
            } else {
                deferred.reject({ message: 'Unparsed file error'});
            }
        });
        return deferred.promise;
    }
};