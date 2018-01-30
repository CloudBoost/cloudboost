
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