var addSubscriber = function(email) {
  var q = Q.defer();
  console.log('Subscribed');
  var sendJson = {};
  sendJson.email = email;
  $.ajax({
    type: "POST",
    url: serverURL + '/subscribe',
    data: sendJson,
    success: function(msg) {
      q.resolve("Voila! You're looped in. We'll keep you posted. Thanks!");
    },
    error: function(error) {
      q.reject("You've already subscribed with us, OR Something went wrong with us");
    }
  });

  return q.promise;
}
