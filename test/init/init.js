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
