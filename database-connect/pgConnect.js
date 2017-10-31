/*
#     CloudBoost - Core Engine that powers Bakend as a Service
#     (c) 2014 HackerBay, Inc. 
#     CloudBoost may be freely distributed under the Apache 2 License
*/

var q = require("q");
var Sequelize = require("sequelize");

module.exports = function() {
  var obj = {
    connect: function() {
      var deferred = q.defer();
      try {
        const pgClient = new Sequelize(global.keys.pgConnectionString);

        deferred.resolve(pgClient);
      } catch (e) {
        global.winston.log("error", {
          error: String(e),
          stack: new Error().stack
        });
        deferred.reject(e);
      }
      return deferred.promise;
    }
  };

  return obj;
};