describe("Delete App", function () {
  it("should delete the app and teardown", function (done) {
    this.timeout(100000);
    var appId = util.makeString();
    var url = URL + '/app/' + testAppId;
    var params = {};
    params.secureKey = SECURE_KEY;
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