var q = require("q");
var Client = require("pg").Client;

module.exports = function() {
  let obj = {};

  obj.app = {
    create: function(appId) {
      console.log("Create app in postgres");

      var deferred = q.defer();

      try {
        console.log(global.keys.pgConnectionString);
        let connectionString = global.keys.pgConnectionString;
        let client = new Client({
          connectionString: connectionString
        });
        
        client.connect(function(err) {
          if(err) {
            console.log('Error: Connecting to postgreSQL');
            deferred.reject('Error: Connecting to postgreSQL');
            return deferred.promise;
          }
          
          console.log('Success: Connected to postgreSQL')
        });
        
        let createDbQuery = `CREATE DATABASE ${appId}`;
        client.query(createDbQuery)
          .then(function(db) {
            console.log(db);
            global.pgClient[appId] = require("./database-connect/pgConnect.js")().connect(appId);
            deferred.resolve(pgClient);
          }).catch(function(err) {
            console.log("Error: Creating a database in postgreSQL");
            deferred.reject("Error: Creating a database in postgreSQL");
            return deferred.promise;
          }).then(function() {
            client.end();
          })
        
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
