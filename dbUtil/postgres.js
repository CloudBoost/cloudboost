var q = require("q");
var tablesData = require("../helpers/cloudTable");

module.exports = function() {
  let obj = {};

  obj.app = {
    create: function(appId) {
      console.log("Create app from postgres");

      var deferred = q.defer();

      try {
        let createDbQuery = `CREATE DATABASE ${appId}`;
        global.pgClient.query(createDbQuery).then(function(db) {
          console.log('Created database in postgres...');
          console.log(db);
          if (db) {
            console.log("Success : App created in Postgres Storage backend.");
            deferred.resolve(db);
          } else {
            console.log("Error : Creating an app in the Postgres Storage Backend ");
            global.winston.log("Error : Creating an app in the Postgres Storage Backend ");
            deferred.reject("Error : Creating an app in the Postgres Storage Backend ");
          }
        });
        
      } catch (e) {
        console.log("Error : Creating an app in Postgres Storage Backend.");
        console.log(e);
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
