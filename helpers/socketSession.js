
/*
#     CloudBoost - Core Engine that powers Bakend as a Service
#     (c) 2014 HackerBay, Inc. 
#     CloudBoost may be freely distributed under the Apache 2 License
*/
var sessionHelper = require('../helpers/session');
var config = require('../config/config');
var winston = require('winston');

module.exports = {
    
    
    /* Gets the session connected to a socketId.
     * @socketId : Its a string.
     * 
     * @callback : A sessionID which is a string.. 
     */ 
    getSession : function (socketId, callback) {    
        try{    
            config.redisClient.get('cb-socket-'+socketId, function (err, reply) {
                if (reply) {
                    sessionHelper.getSession(reply, callback);
                } else { 
                    if (callback) {
                        callback(err, null);
                    }
                }
            });

        }catch(err){                    
            winston.log('error',{"error":String(err),"stack": new Error().stack});                                                            
        }
    },
    
    
    /*Attaches the socketId to the session of the user.
     */ 
    saveSession : function (socketId, sessionId, callback) {
        try{
            config.redisClient.set('cb-socket-' + socketId, sessionId, function (err, reply) {
                config.redisClient.expire('cb-socket-' + socketId, 30 * 24 * 60 * 60);
                if (callback)
                    callback(err, reply);
            });
        }catch(err){                    
            winston.log('error',{"error":String(err),"stack": new Error().stack});                                                            
        }
        
    },

    deleteSession : function (socketId, callback) {
        try{
            config.redisClient.set('cb-socket-' + socketId, null, function (err, reply) { 
                if(callback)
                    callback(err, reply);
            });
        }catch(err){                    
            winston.log('error',{"error":String(err),"stack": new Error().stack});                                                            
        }
    },

};