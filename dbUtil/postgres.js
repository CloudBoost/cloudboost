var q = require("q");
var Client = require("pg").Client;

module.exports = function() {
  let obj = {};

  obj.app = {
    create: function(appId) {
      console.log("Create app in postgres");

      var deferred = q.defer();

      try {
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
                let conn = require("../database-connect/pgConnect.js")().connect(appId);
                conn.then(function(pgClient) {
                    global.pgClient[appId] = pgClient;
                    deferred.resolve(pgClient);
                }).catch(function(err) {
                    console.log("Error: Creating a database in postgreSQL\n", err);
                    deferred.reject("Error: Creating a database in postgreSQL");
                });
            }).catch(function(err) {
                deferred.reject("Error: Creating a database in postgreSQL", err);
            }).then(function() {
                client.end()
                    .then(function() {
                        console.log("Connection closed successfully");
                    }).catch(function(err) {
                        console.log("Error closing connection");
                    });
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

  obj.collection = {

    addColumn: function(appId, collectionName, column) {
      var deferred = global.q.defer();

      try {
          if (column.dataType === 'GeoPoint' || column.dataType === 'Text') {
              obj.collection.createIndex(appId, collectionName, column.name, column.dataType).then(function() {
                  deferred.resolve("Index Created");
              }, function(err) {
                  global.winston.log('error', err);
                  deferred.reject("Unable to create Index in PostgreSQL");
              });
          } else {
              deferred.resolve();
          }

      } catch (err) {
          global.winston.log('error', {
              "error": String(err),
              "stack": new Error().stack
          });
          deferred.reject(err);
      }
      return deferred.promise;
    },

    create: function(appId, collectionName, schema) {
      var deferred = global.q.defer();

      try {
          var promises = [];
          for (var i = 0; i < schema.length; i++) {
              if (schema[i].dataType === 'GeoPoint') {
                  promises.push(obj.collection.createIndex(appId, collectionName, schema[i].name, schema[i].dataType));
              }
          }
          if (promises.length > 0) {
              global.q.all(promises).then(function() {
                  deferred.resolve("Index Created");
              }, function(err) {
                  global.winston.log('error', err);
                  deferred.reject("Unable to create Index in PostgreSQL");
              });
          } else {
              deferred.resolve("Created Table in PostgreSQL");
          }

      } catch (err) {
          global.winston.log('error', {
              "error": String(err),
              "stack": new Error().stack
          });
          deferred.reject(err);
      }
      return deferred.promise;
    },

    createIndex: function(appId, collectionName, columnName, columnType) {
      var deferred = global.q.defer();

      try {
          /**
              Creating a wild card index , instaed of creating individual $text index on each column seperately
          **/
          var index = "";

          if(columnType === 'Text'){
              index = "$**_text";
          }
          if (columnType === 'GeoPoint') {
            index = "2dsphere";
          }

          var db = global.pgClient[appId];
          
          var Model = db.model(global.pgClient.collection.getId(appId, collectionName));

          Model
            .query(`CREATE INDEX ${index} ON ${collectionName}`)
            .then(function(res) {
              console.log(res);
              deferred.resolve(res);
            }).catch(function(err) {
              console.log("Could not create index", err);
              deferred.reject(err);
            });

      } catch (err) {
          global.winston.log('error', {
              "error": String(err),
              "stack": new Error().stack
          });
          deferred.reject(err);
      }
      return deferred.promise;
    },

    deleteAndCreateTextIndexes: function(appId, collectionName, oldColumns, schema) {
      var deferred = global.q.defer();

      try {
          /**
              Creating a wild card index , instaed of creating individual $text index on each column seperately
          **/

          var db = global.pgClient[appId];
          
          var Model = db.model(global.pgClient.collection.getId(appId, collectionName));

          var index = "$**_text"
          Model
            .query(`CREATE INDEX ${index} ON ${collectionName}`)
            .then(function(res) {
              console.log(res);
              deferred.resolve(res);
            }).catch(function(err) {
              global.winston.log('error', err);
              console.log("Could not create index");
              deferred.reject(err);
            });
          
      } catch (err) {
          global.winston.log('error', {
              "error": String(err),
              "stack": new Error().stack
          });
          deferred.reject(err);
      }
      return deferred.promise;
    },

    getId: function(appId, collectionName) { //for a given appId and collectionName it gives a unique collection name
      try {
          return collectionName;
      } catch (err) {
          global.winston.log('error', {
              "error": String(err),
              "stack": new Error().stack
          });
      }
    },
  };

  return obj;
};
