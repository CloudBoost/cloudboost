var SECURE_KEY = "37ac59f0-7eab-49b8-8bc9-e121b35ec2b6";
var URL = "http://localhost:4730";
var window = window || null;
var request = require('request');
var util = require('./Util.js');
var equal = require('deep-equal');
var testAppId = null;
var testKey = null;
var testMasterKey = null;

describe("CloudBoost API", function () {

    it("MongoDb,RedisDb & Elastic SearchDb Statuses..", function (done) {
        this.timeout(100000);

        var url = URL + '/status';
        var params = {};
        params.url = URL;

        if (!window) {
            //Lets configure and request
            request({
                url: url, //URL to hit
                method: 'GET'
            }, function (error, response, body) {

                if (error || response.statusCode === 500 || response.statusCode === 400 || body === 'Error') {
                    done("Something went wrong..");
                } else {
                    done();
                }
            });

        }
    });

    it("Change the Server URL", function (done) {
        this.timeout(100000);
        var appId = util.makeString();
        var url = URL + '/server/url';
        var params = {};
        params.secureKey = SECURE_KEY;
        params.url = URL;

        if (!window) {
            //Lets configure and request
            request({
                url: url, //URL to hit
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                json: params //Set the body as a string
            }, function (error, response, body) {
                if (error) {
                    done(error);
                } else {
                    done();
                }
            });
        }

    });


    it("should create and get the app details.", function (done) {
        this.timeout(100000);
        var appId = util.makeString();
        var url = URL + '/app/' + appId;
        var params = {};
        params.secureKey = SECURE_KEY;
        if (!window) {
            //Lets configure and request
            request({
                url: url, //URL to hit
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                json: params //Set the body as a string
            }, function (error, response, json) {
                if (error) {
                    done(error);
                }
                else {
                    testAppId = json.appId;
                    testKey = json.keys.js;
                    testMasterKey = json.keys.master;
                    console.log(testAppId + '---' + testKey);
                    done();
                }

            });
        }

    });


    it("should add email setting to an app.", function (done) {
        this.timeout(100000);
        var params = {
            "settings": {
                "fromEmail": "hello@cloudboost.io",
                "fromName": "cloudboost.test.io",
                "mailgun": { enabled: true, apiKey: "key-f66ed97c75c75cf864990730517d0445", domain: "cloudboost.io" },
                "apiKey": "key-f66ed97c75c75cf864990730517d0445",
                "domain": "cloudboost.io",
                "mandrill": { "enabled": false },

            },
            "key": testMasterKey
        };
        if (!window) {
            //Lets configure and request
            request({
                url: URL + '/settings/' + testAppId + '/email', //URL to hit
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                json: params //Set the body as a string
            }, function (error, response, json) {
                if (error) {
                    done(error);
                } else {
                    done();
                }
            });

        }
    });


    it("should create and get sample setting to an app.", function (done) {
        this.timeout(100000);
        var params = {};
        if (!window) {
            //Lets configure and request
            request({
                url: URL, //URL to hit
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                json: params //Set the body as a string
            }, function (error, response, json) {
                if (error) {
                    done(error);
                } else {
                    done();
                }
            });

        }
    });

    it("Should create a table", function (done) {

        var params = {
            "data": {
                "name": "Employee",
                "appId": testAppId,
                "_type": "table",
                "type": "custom",
                "maxCount": 9999,
                "columns": [
                    {
                        "name": "id",
                        "_type": "column",
                        "dataType": "Id",
                        "required": true,
                        "unique": true,
                        "relatedTo": null,
                        "relationType": null,
                        "isDeletable": false,
                        "isEditable": false,
                        "isRenamable": false,
                        "editableByMasterKey": false
                    }, {
                        "name": "expires",
                        "_type": "column",
                        "dataType": "DateTime",
                        "required": false,
                        "unique": false,
                        "relatedTo": null,
                        "relationType": null,
                        "isDeletable": false,
                        "isEditable": false,
                        "isRenamable": false,
                        "editableByMasterKey": false
                    }, {
                        "name": "updatedAt",
                        "_type": "column",
                        "dataType": "DateTime",
                        "required": true,
                        "unique": false,
                        "relatedTo": null,
                        "relationType": null,
                        "isDeletable": false,
                        "isEditable": false,
                        "isRenamable": false,
                        "editableByMasterKey": false
                    }, {
                        "name": "createdAt",
                        "_type": "column",
                        "dataType": "DateTime",
                        "required": true,
                        "unique": false,
                        "relatedTo": null,
                        "relationType": null,
                        "isDeletable": false,
                        "isEditable": false,
                        "isRenamable": false,
                        "editableByMasterKey": false
                    }, {
                        "name": "ACL",
                        "_type": "column",
                        "dataType": "ACL",
                        "required": true,
                        "unique": false,
                        "relatedTo": null,
                        "relationType": null,
                        "isDeletable": false,
                        "isEditable": false,
                        "isRenamable": false,
                        "editableByMasterKey": false
                    }
                ]
            }
        }

        if (!window) {
            //Lets configure and request
            request({
                url: URL + '/app/' + testAppId + '/Employee', //URL to hit
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                json: params //Set the body as a string
            }, function (error, response, json) {
                if (error) {
                    done(error);
                } else {
                    done();
                }
            });

        }
    });


    describe("Adding new row and editing same row in users table", function () {
        var rowId = util.generateHash();
        it("Should add new row with default modified columns in users table", function (done) {

            var params = {
                "document":
                    {
                        "_tableName": "User",
                        "ACL": {
                            "read": {
                                "allow": { "user": ["all"], "role": [] },
                                "deny": { "user": [], "role": [] }
                            },
                            "write": {
                                "allow": {
                                    "user": ["all"],
                                    "role": []
                                }, "deny": { "user": [], "role": [] }
                            }
                        },
                        "_type": "custom", "expires": null,
                        "_hash": rowId,
                        "_modifiedColumns": ["createdAt", "updatedAt", "ACL", "expires"],
                        "_isModified": true, "updatedAt": "2018-01-30T16:32:04.129Z",
                        "createdAt": "2018-01-30T16:32:04.130Z"
                    },
                "key": testMasterKey
            }
            if (!window) {
                //Lets configure and request
                request({
                    url: URL + '/data/' + testAppId + '/User', //URL to hit
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    json: params //Set the body as a string
                }, function (error, response, json) {
                    if (error) {
                        done(error);
                    } else {
                        done();
                    }
                });

            }
        });

        it("Should edit existing row with username modified cloumn in users table", function (done) {

            var params = {
                "document":
                    {
                        "_tableName": "User",
                        "ACL": {
                            "read": {
                                "allow": { "user": ["all"], "role": [] },
                                "deny": { "user": [], "role": [] }
                            },
                            "write": {
                                "allow": {
                                    "user": ["all"],
                                    "role": []
                                }, "deny": {
                                    "user": [],
                                    "role": []
                                }
                            }
                        }, "_type": "custom",
                        "expires": null,
                        "updatedAt": "2018-01-30T16:45:14.871Z",
                        "createdAt": "2018-01-30T16:32:04.130Z",
                        "_id": rowId,
                        "_version": 0,
                        "username": "test",
                        "roles": null,
                        "password": null,
                        "email": null,
                        "socialAuth": null,
                        "verified": null,
                        "_isModified": true,
                        "_modifiedColumns": ["username"]
                    },
                "key": testMasterKey
            }
            if (!window) {
                //Lets configure and request
                request({
                    url: URL + '/data/' + testAppId + '/User', //URL to hit
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    json: params //Set the body as a string
                }, function (error, response, json) {
                    if (error) {
                        done(error);
                    } else {
                        done();
                    }
                });

            }
        });
    });


    it("Should add user in users table", function (done) {

        var params = {
            "document":
                {
                    "_tableName": "User",
                    "ACL": {
                        "read": {
                            "allow": { "user": ["all"], "role": [] },
                            "deny": { "user": [], "role": [] }
                        }, "write": { "allow": { "user": ["all"], "role": [] }, "deny": { "user": [], "role": [] } }
                    },
                    "_type": "custom",
                    "expires": null,
                    "_hash": util.generateHash(),
                    "username": "test",
                    "roles": null,
                    "password": null,
                    "email": "rravithejareddy@gmail.com", // please use test email 
                    "socialAuth": null,
                    "verified": null, "_isModified": true,
                    "_modifiedColumns": ["createdAt", "updatedAt", "ACL", "expires", "email", "username"],
                    "_isModified": true, "updatedAt": "2018-01-29T15:21:16.630Z",
                    "createdAt": "2018-01-29T15:21:16.630Z"
                },
            "key": testMasterKey
        }


        if (!window) {
            //Lets configure and request
            request({
                url: URL + '/data/' + testAppId + '/User', //URL to hit
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                json: params //Set the body as a string
            }, function (error, response, json) {
                if (error) {
                    done(error);
                } else {
                    done();
                }
            });

        }
    });

    it('should send emails successfully', done => {
        let params = {
            key: testMasterKey,
            emailBody: 'test12',
            emailSubject: 'test12',
            query: ''
        }

        request({
            url: URL + '/email/' + testAppId + '/campaign', //URL to hit
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            json: params //Set the body as a string
        }, function (error, response, json) {
            if (error) {
                done(error);
            } else {
                done();
            }
        });

    });

    describe("Delete App", function () {
        it("should delete the app and teardown", function (done) {
            this.timeout(100000);
            var appId = util.makeString();
            var url = URL + '/app/' + testAppId;
            var params = {};
            params.secureKey = testKey;
            params.method = "DELETE";

            if (!window) {
                //Lets configure and request
                request({
                    url: url, //URL to hit
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    json: params //Set the body as a string
                }, function (error, response, body) {
                    if (error) {
                        done(error);
                    } else {
                        done();
                    }
                });
            }

        });
    });

});