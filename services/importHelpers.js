
var util = require('../helpers/util.js');
const csv = require('csvtojson');
var xlsx = require('node-xlsx');
var tablesData = require('../helpers/cloudTable');

module.exports = function () {

    return {
        importCSVFile: function (fileStream, table) {
            var deferred = q.defer();
            var tableName = table.replace(/\s/g, '')
            var csvJson = [];
            csv()
                .fromStream(fileStream)
                .on('json', (json) => {
                    json.expires ? json.expires : json.expires = null;
                    (json._id || json.id) ? json._id = (json._id || json.id) : json._id = util.getId();
                    json._version ? json._version : json._version = "1";
                    json._type ? json._type : json._type = "custom";
                    if (json.createdAt) {
                        if (new Date(json.createdAt) == "Invalid Date") {
                            json.created = json.createdAt;
                            json.createdAt = "";
                        }
                    } else {
                        json.createdAt = "";
                    }
                    if (json.updatedAt) {
                        if (new Date(json.updatedAt) == "Invalid Date") {
                            json.updated = json.updatedAt;
                            json.updatedAt = "";
                        }
                    } else {
                        json.updatedAt = "";
                    }
                    try {
                        json.ACL ? json.ACL = JSON.parse(json.ACL)
                            : json.ACL = {
                                "read": {
                                    "allow": {
                                        "user": [
                                            "all"
                                        ],
                                        "role": []
                                    },
                                    "deny": {
                                        "user": [],
                                        "role": []
                                    }
                                },
                                "write": {
                                    "allow": {
                                        "user": [
                                            "all"
                                        ],
                                        "role": []
                                    },
                                    "deny": {
                                        "user": [],
                                        "role": []
                                    }
                                }
                            };
                    } catch (err) {
                        console.log("+++++++++++++Error in ACL++++++++++++");
                        console.log(err);
                        json.ACL = {
                            "read": {
                                "allow": {
                                    "user": [
                                        "all"
                                    ],
                                    "role": []
                                },
                                "deny": {
                                    "user": [],
                                    "role": []
                                }
                            },
                            "write": {
                                "allow": {
                                    "user": [
                                        "all"
                                    ],
                                    "role": []
                                },
                                "deny": {
                                    "user": [],
                                    "role": []
                                }
                            }
                        };
                    }
                    json._modifiedColumns = Object.keys(json);
                    json._isModified = true;
                    json._tableName = tableName;
                    csvJson.push(json);
                })
                .on('done', (error) => {
                    if (error) {
                        deferred.reject(error);
                    } else {
                        deferred.resolve(csvJson);
                    }
                });
            return deferred.promise;
        },

        importXLSFile: function (fileStream, table) {
            var deferred = q.defer();
            var csvJson = [];
            var tableName = table.replace(/\s/g, '');
            var xslJsonObj = [];
            var workSheetsFromBuffer;
            fileStream.on('data', function (chunk) {
                workSheetsFromBuffer = xlsx.parse(chunk);
            });

            fileStream.on('end', function () {
                try {
                    workSheetsFromBuffer.forEach(function (element) {
                        var h = element.data[0];
                        var headers = [];
                        h.map(function (x) {
                            if (x !== "A CL" && x !== "ACL" && x !== "A C L") {
                                x = x.charAt(0).toLowerCase() + x.slice(1);
                            }
                            headers.push(x.replace(/\s/g, ''))
                        });
                        for (var i = 1; i < element.data.length; i++) {
                            var obj = {};
                            if (element.data[i].length != 0) {
                                for (var j = 0; j < element.data[i].length; j++) {
                                    if (typeof element.data[i][j] != 'undefined' && typeof headers[j] != 'undefined') {
                                        if (headers[j] == "A CL" || headers[j] == "ACL" || headers[j] == "A C L") {
                                            try {
                                                obj[headers[j]] = JSON.parse(element.data[i][j]);
                                            } catch (err) {
                                                console.log("++++++++++Error in ACL++++++++");
                                                obj[headers[j]] = {
                                                    "read": {
                                                        "allow": {
                                                            "user": [
                                                                "all"
                                                            ],
                                                            "role": []
                                                        },
                                                        "deny": {
                                                            "user": [],
                                                            "role": []
                                                        }
                                                    },
                                                    "write": {
                                                        "allow": {
                                                            "user": [
                                                                "all"
                                                            ],
                                                            "role": []
                                                        },
                                                        "deny": {
                                                            "user": [],
                                                            "role": []
                                                        }
                                                    }
                                                };
                                            }
                                            continue;
                                        }
                                        if (headers[j] == "createdAt" && new Date(element.data[i][j]).toString() == "Invalid Date") {
                                            obj["created"] = element.data[i][j].replace(/"/g, "");
                                            obj["created"] = obj["created"].replace(/\./g, "");
                                            continue;
                                        }
                                        if (headers[j] == "updatedAt" && new Date(element.data[i][j]).toString() == "Invalid Date") {
                                            obj["updated"] = element.data[i][j].replace(/"/g, "");
                                            obj["updated"] = obj["updated"].replace(/\./g, "");
                                            continue;
                                        }
                                        obj[headers[j]] = element.data[i][j] == 'null' ? null : element.data[i][j];
                                    }
                                }
                                obj.ACL ? obj.ACL : obj.ACL = {
                                    "read": {
                                        "allow": {
                                            "user": [
                                                "all"
                                            ],
                                            "role": []
                                        },
                                        "deny": {
                                            "user": [],
                                            "role": []
                                        }
                                    },
                                    "write": {
                                        "allow": {
                                            "user": [
                                                "all"
                                            ],
                                            "role": []
                                        },
                                        "deny": {
                                            "user": [],
                                            "role": []
                                        }
                                    }
                                };
                                obj.expires ? obj.expires : obj.expires = null;
                                (obj._id || obj.id) ? obj._id = (obj._id || obj.id) : obj._id = util.getId();
                                obj.updatedAt ? obj.updatedAt : obj.updatedAt = "";
                                obj._version ? obj._version : obj._version = "1";
                                obj._type ? obj._type : obj._type = "custom";
                                obj.createdAt ? obj.createdAt : obj.createdAt = "";
                                obj._modifiedColumns = Object.keys(obj);
                                obj._isModified = true;
                                obj._tableName = tableName;
                                xslJsonObj.push(obj);
                            } else {
                                continue;
                            }
                        }
                    });
                    deferred.resolve(xslJsonObj);
                } catch (err) {
                    console.log("+++++++++Error in Data+++++++++");
                    console.log(err);
                    deferred.reject(err);
                }
            });

            fileStream.on('error', function (error) {
                deferred.reject(error);
            });
            return deferred.promise;
        },

        importJSONFile: function (fileStream, table) {
            var deferred = q.defer();
            var tableName = table.replace(/\s/g, '');
            var data = '';
            fileStream.on('data', function (chunk) {
                data += chunk;
            });

            fileStream.on('end', function () {
                try {
                    var jSON = JSON.parse(data);
                    try {
                        for (var i = 0; i < jSON.data.length; i++) {
                            jSON.data[i].expires ? jSON.data[i].expires : jSON.data[i].expires = null;
                            (jSON.data[i]._id || jSON.data[i].id) ? jSON.data[i]._id = (jSON.data[i]._id || jSON.data[i].id) : jSON.data[i]._id = util.getId();
                            if (jSON.data[i].createdAt) {
                                if (new Date(jSON.data[i].createdAt) == "Invalid Date") {
                                    jSON.data[i].created = jSON.data[i].createdAt;
                                    jSON.data[i].createdAt = "";
                                }
                            } else {
                                jSON.data[i].createdAt = "";
                            }
                            if (jSON.data[i].updatedAt) {
                                if (new Date(jSON.data[i].updatedAt) == "Invalid Date") {
                                    jSON.data[i].updated = jSON.data[i].updatedAt;
                                    jSON.data[i].updatedAt = "";
                                }
                            } else {
                                jSON.data[i].updatedAt = "";
                            }
                            jSON.data[i]._version ? jSON.data[i]._version : jSON.data[i]._version = "1";
                            jSON.data[i]._type ? jSON.data[i]._type : jSON.data[i]._type = "custom";
                            jSON.data[i].ACL ? jSON.data[i].ACL :
                                jSON.data[i].ACL = {
                                    "read": {
                                        "allow": {
                                            "user": [
                                                "all"
                                            ],
                                            "role": []
                                        },
                                        "deny": {
                                            "user": [],
                                            "role": []
                                        }
                                    },
                                    "write": {
                                        "allow": {
                                            "user": [
                                                "all"
                                            ],
                                            "role": []
                                        },
                                        "deny": {
                                            "user": [],
                                            "role": []
                                        }
                                    }
                                };
                            jSON.data[i]._modifiedColumns = Object.keys(jSON.data[i]);
                            jSON.data[i]._isModified = true;
                            jSON.data[i]._tableName = tableName;
                        }
                        deferred.resolve(jSON.data);
                    } catch (error) {
                        console.log(error);
                        deferred.reject(error);
                    }
                } catch (err) {
                    console.log("+++++++++++Error in Data+++++++++++")
                    console.log(err);
                    deferred.reject(err);
                }

            });

            fileStream.on('error', function (error) {
                deferred.reject(error);
            });
            return deferred.promise;
        },

        generateSchema: function (document) {
            var tableHeaders = [];
            var headers = Object.keys(document[0]);
            headers.map(function (x) {
                if (x == "_type" || x == "_version" || x == "_tableName" || x == "_isModified" || x == "_modifiedColumns" || x == "" || x == "_id" || x == "ACL" || x == "createdAt" || x == "updatedAt" || x == "expires") {
                    return;
                }
                var obj = {};
                obj["name"] = x;
                obj["_type"] = "column";
                var type = typeof document[0][x];
                if (type == "string") {
                    obj["dataType"] = "Text";
                } else {
                    obj["dataType"] = type.charAt(0).toUpperCase() + type.slice(1);
                }
                obj["unique"] = false;
                obj["defaultValue"] = null;
                obj["required"] = false;
                obj["relatedTo"] = null;
                obj["relationType"] = null;
                obj["isDeletable"] = true;
                obj["isEditable"] = true;
                obj["isRenamable"] = false;
                obj["editableByMasterKey"] = false;
                tableHeaders.push(obj);
            });
            var body = {
                data: {
                    columns: tableHeaders.concat(tablesData.Custom).reverse()
                }
            };
            return body;
        }
    }
}