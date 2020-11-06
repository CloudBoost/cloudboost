var CronJob = require('cron').CronJob;
var request = require('request');
var Q = require('q');
var _ = require('underscore');

module.exports =function(){

  function _runUserAnalyticsCronJob(){      
    
    try {
      
      var UserStorageAnalyticsJob = new CronJob('58 58 23 * * *', function() {
        /*
         * Runs every day
         * at 11:58:58 PM(58 58 23 * * *)      
         */
          
          global.mongoClient.command({listDatabases: 1},function(err, databaseStatList){
              if(err) {            
                console.log(err);
                global.winston.log('error', {
                    "error": String(err),
                    "stack": new Error().stack
                });        
              }else if(databaseStatList){  
                //For Development
                //var reqDB=_.first(_.where(databaseStatList.databases, {name: "otamnrahmfux"}));               
                //console.log(databaseStatList); 

                //Pinging to analytics  
                console.log("List of databases and their sizes");                     
                _sendStorageDetailsToAnalytics(global.keys.secureKey,databaseStatList.databases);                                        
              }
          });

        }, function () {
          /* This function is executed when the job stops */
        },
        true, /* Start the job right now */
        null /* Time zone of this job. */
      );

    } catch(ex) {
      console.log("User Storage Analytics cron pattern not valid");
      global.winston.log('error', {
          "error": String(ex),
          "stack": new Error().stack
      });
    }
  }

  _runUserAnalyticsCronJob();

};        


/*************************Pinging Analytics Services*********************************/

function _sendStorageDetailsToAnalytics(secureKey,dbArray){
  var deferred = Q.defer(); 
  
  var dataObj={};
  dataObj.secureKey = global.keys.secureKey; 
  dataObj.dbArray = dbArray;
  dataObj = JSON.stringify(dataObj);

  var url = global.keys.analyticsUrl + 'save/storage';  
  
  request.post(url,{
      headers: {
          'content-type': 'application/json',
          'content-length': dataObj.length
      },
      body: dataObj
  },function(err,response,body){     
      if(err || response.statusCode === 500 || response.statusCode === 400 || body === 'Error'){
        console.log(err)
        global.winston.log('error', {
            "error": String(err),
            "stack": new Error().stack
        }); 
        deferred.reject(err);
      }else {   
        console.log('SUCCESS in saving db stats')
        deferred.resolve(true);
      }
  });

  return deferred.promise;
}
