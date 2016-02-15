var Q = require('q');
var request = require('request');

module.exports = function() {
  return {
    registerServer: function (secureKey) {

            var _self = this;

            var deferred = Q.defer();

            _registerServerAnalytics(secureKey).then(function(result) {
                deferred.resolve(result);
            },function(error){
                deferred.reject(error);
            });           

            return deferred.promise;
        }
  }  
};

function _registerServerAnalytics(secureKey){
  var deferred = Q.defer();
 
  var post_data = {};
  post_data.secureKey = secureKey; 
  post_data = JSON.stringify(post_data);

  var url = global.keys.analyticsUrl +'/server/register';  
  request.post(url,{
      headers: {
          'content-type': 'application/json',
          'content-length': post_data.length
      },
      body: post_data
  },function(err,response,body){
      if(err || response.statusCode === 500 || body === 'Error'){       
        deferred.reject(err);
      }else {    
        var respBody=JSON.parse(body);
        deferred.resolve(respBody);
      }
  });

  return deferred.promise;
}