
/*
#     CloudBoost - Core Engine that powers Bakend as a Service
#     (c) 2014 HackerBay, Inc.
#     CloudBoost may be freely distributed under the Apache 2 License
*/

var config = require('../config/config');
var winston = require('winston');

module.exports = {

    getSession : function (sessionId, callback) {

        try{
            config.redisClient.get(sessionId, function (err, reply) {
                if (!err) {
                    if (reply) {
                        if (callback)
                            callback(null, JSON.parse(reply));
                    }
                    else {
                        if (callback) {
                            callback(null, {}); //pass an empty session.
                        }
                    }
                }
                else {
                    if (callback) {
                        callback(err, null);
                    }
                }

            });

        }catch(err){
            winston.log('error',{"error":String(err),"stack": new Error().stack});
        }
    },


    /*Saves the user session into Redis.
     * @session : Object
     *  {
            id : uuid.v1(),
            userId : result._id,
            loggedIn : true,
            appId : appId,
            email : result.email,
            roles : [string of role id's]
        };
     * @callback : Its a simple callback.
     */
    saveSession : function (session, expireDays, callback) {
        try{
            config.redisClient.set(session.id, JSON.stringify(session), function (err, reply) {
                //ttl time 30 * 24 * 60 * 60 for 30 days
                config.redisClient.expire(session.id,  expireDays * 24 * 60 * 60);
                if (callback){
                    callback(err, reply);
                }
            });

        }catch(err){
            winston.log('error',{"error":String(err),"stack": new Error().stack});
        }
    }

};