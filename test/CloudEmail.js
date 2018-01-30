var window = window || null;
var request = require('request');
var SECURE_KEY = "37ac59f0-7eab-49b8-8bc9-e121b35ec2b6";
var URL = "http://localhost:4730";
var equal = require('deep-equal');
var util = require('./Util.js');
var testAppId = null;
var testKey = null;
var testMasterKey = null;

describe("CloudBoost Email API", function () {

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

    it("Should add user in users table", function (done) {
        this.timeout(100000);
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
                    "email": "rravithejareddy@gmail.com", // please test email 
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
        this.timeout(100000);
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