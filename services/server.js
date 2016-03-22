var Q = require('q');
var request = require('request');

module.exports = function() {
  return {
    registerServer: function (secureKey) {

      var _self = this;

      var deferred = Q.defer();

      try{

        _registerServerAnalytics(secureKey).then(function(result) {
            deferred.resolve(result);
        },function(error){
            deferred.reject(error);
        }); 

      } catch(err){           
          global.winston.log('error',err);
          deferred.reject(err);
      }          

      return deferred.promise;
    }
  }  
};

function _registerServerAnalytics(secureKey){
  var deferred = Q.defer();
 
  try{
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

  } catch(err){           
    global.winston.log('error',err);
    deferred.reject(err);
  }

  return deferred.promise;
}