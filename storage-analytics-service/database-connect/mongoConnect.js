var q = require("q");

module.exports = function () {
    
    var obj = {

    dbConnect: function(appId){
        return global.mongoClient.db(appId);
    },

    replSet : function(){

        var ReplSetServers = require('mongodb').ReplSetServers,
            Server = require('mongodb').Server;

        var servers = [];

        if(global.config.mongo.length===0){
            return null;
        }

        if(global.config.mongo.length===1){
            return new Server(global.config.mongo[0].host, global.config.mongo[0].port);
        }

        for(var i=0;i<global.config.mongo.length; i++){
            servers.push(new Server(lobal.config.mongo[i].host,lobal.config.mongo[i].port));
        }

        var replSet = new ReplSetServers(servers);

        return replSet;
    },

    connect: function() {
            
            var _self = obj;
            var deferred = q.defer();
            var mongoClient = require('mongodb').MongoClient;
            mongoClient.connect(global.keys.mongoConnectionString,function (err, db) {
                if (err) {
                    deferred.reject(err);
                } else {
                    deferred.resolve(db);
                }
            });
            return deferred.promise;
        }
    };

    return obj;
};
