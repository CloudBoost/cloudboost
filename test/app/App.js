

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