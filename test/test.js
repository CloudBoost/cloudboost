var SECURE_KEY = "1227d1c4-1385-4d5f-ae73-23e99f74b006";
var URL = "http://localhost:4730";
module.exports = {

  makeString: function () {
    var text = "x";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for (var i = 0; i < 5; i++)
      text += possible.charAt(Math.floor(Math.random() * possible.length));

    return 'x' + text;
  },

  makeEmail: function () {
    return this.makeString() + '@sample.com';
  },

  generateHash: function () {
    var hash = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for (var i = 0; i < 8; i++) {
      hash = hash + possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return hash;
  }


}
var window = window || null;
var request = require('request');
var util = require('./util/util.js');
var equal = require('deep-equal');
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



describe("CloudBoost App API", function () {

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

});

describe("CloudBoost Users API", function () {

  describe("Adding new row and editing same row in users table", function () {
    var rowId = util.generateHash();
    it("Should add new row with default modified columns in users table", function (done) {
      this.timeout(100000);
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
      this.timeout(100000);
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

});
describe("CloudBoost Email API", function () {

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


});