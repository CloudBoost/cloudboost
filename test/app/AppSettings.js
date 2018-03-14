describe("CloudBoost AppSettings API", function () {
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


  it("should get sample setting to an app.", function (done) {
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
});