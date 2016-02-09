module.exports = {
    
    
    /* Gets the session connected to a socketId.
     * @socketId : Its a string.
     * 
     * @callback : A sessionID which is a string.. 
     */ 
    getSession : function (socketId, callback) {        
        global.redisClient.get('cb-socket-'+socketId, function (err, reply) {
            if (reply) {
                global.sessionHelper.getSession(reply, callback);
            } else { 
                if (callback) {
                    callback(err, null);
                }
            }
        });
    },
    
    
    /*Attaches the socketId to the session of the user.
     */ 
    saveSession : function (socketId, sessionId, callback) {
        global.redisClient.set('cb-socket-' + socketId, sessionId, function (err, reply) {
            global.redisClient.expire('cb-socket-' + socketId, 30 * 24 * 60 * 60);
            if (callback)
                callback(err, reply);
        });
        
    },

    deleteSession : function (socketId, callback) {
        global.redisClient.set('cb-socket-' + socketId, null, function (err, reply) { 
            if(callback)
                callback(err, reply);
        });
    },

};