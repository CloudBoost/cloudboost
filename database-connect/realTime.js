/*
#     CloudBoost - Core Engine that powers Bakend as a Service
#     (c) 2014 HackerBay, Inc.
#     CloudBoost may be freely distributed under the Apache 2 License
*/
var socketSessionHelper = require('../helpers/socketSession');
var socketQueryHelper = require('../helpers/socketQuery');
var aclHelper = require('../helpers/ACL');
var appService = require('../services/app');
var q = require('q');
var winston = require('winston');

module.exports = function (io) {

    var g = {};
    io.use(function (socket, next) {
        next();
    });
    io.on('connection', function (socket) {

        try {
            socket.on('app-init', function (data) {
                try {
                    socket.join(data);
                } catch (e) {
                    winston.log('error', {
                        "error": String(e),
                        "stack": new Error().stack
                    });
                }
            });

            /* Custom Channel Listeners. */

            socket.on('join-custom-channel', function (data) {
                try {


                    socket.join(data);

                } catch (e) {
                    winston.log('error', {
                        "error": String(e),
                        "stack": new Error().stack
                    });
                }
            });

            socket.on('socket-disconnect', function () {
                try {
                    socket.disconnect();
                } catch (e) {
                    winston.log('error', {
                        "error": String(e),
                        "stack": new Error().stack
                    });
                }
            });

            socket.on('leave-custom-channel', function (data) {
                try {


                    socket.leave(data);
                } catch (e) {
                    winston.log('error', {
                        "error": String(e),
                        "stack": new Error().stack
                    });
                }
            });

            socket.on('publish-custom-channel', function (data) {
                try {


                    //if this doucment is an instance of a table Object.
                    // var roomSockets = io.to(data.channel);
                    // var sockets = roomSockets.sockets;

                    // if (typeof sockets === "object") {
                    //     for (var key in sockets) {
                    //         if (sockets[key]) {
                    //             sockets[key].emit(data.channel, data.data);
                    //         }
                    //     }
                    // }

                    io.emit(data.channel, data.data);

                } catch (e) {
                    winston.log('error', {
                        "error": String(e),
                        "stack": new Error().stack
                    });
                }
            });

            /* CloudObject Channel Listeners. */
            socket.on('join-object-channel', function (data) {
                try {
                    if (typeof data === 'string') { // Backward Compatibility : data only has the room id
                        socket.join(data);
                    } else { //data has both the room id and the sessionId.
                        socket.join(data.room);
                        //connect socket.id and sessionId together

                        // build socketid specefic to table
                        var tableSocketId = data.room.split('');
                        tableSocketId.splice(-8,8);
                        tableSocketId = socket.id + tableSocketId.join('');

                        socketQueryHelper.setData(tableSocketId, data.data);
                        socketSessionHelper.saveSession(socket.id, data.sessionId);
                    }
                } catch (e) {
                    winston.log('error', {
                        "error": String(e),
                        "stack": new Error().stack
                    });
                }
            });

            socket.on('leave-object-channel', function (data) {
                try {


                    // build socketid specefic to table
                    var tableSocketId = socket.id + data.event;
                    socketQueryHelper.getData(tableSocketId, data.eventType, function (err, socketData) {
                        if (err)
                            throw err;
                        else {
                            socket.leave(data.event + socketData.timestamp);
                            socket.emit('leave' + data.event + data.timestamp, socketData.timestamp); //to removeAlListeners
                            socketQueryHelper.deleteData(tableSocketId, data.event);
                        }
                    });
                } catch (e) {
                    winston.log('error', {
                        "error": String(e),
                        "stack": new Error().stack
                    });
                }
            });

            socket.on('disconnect', function () {
                try {
                    socketSessionHelper.deleteSession(socket.id); //deletes the lnk between this socket and session.
                } catch (e) {
                    winston.log('error', {
                        "error": String(e),
                        "stack": new Error().stack
                    });
                }
            });

        } catch (e) {
            winston.log('error', {
                "error": String(e),
                "stack": new Error().stack
            });
        }

    });

    g.sendObjectNotification = function (appId, document, eventType) {
        try {
            //event type can be created, updated, deleted.
            if (document && document._tableName) {



                //if this doucment is an instance of a table Object.
                var roomSockets = io.to(appId.toLowerCase() + 'table' + document._tableName.toLowerCase() + eventType.toLowerCase());
                var sockets = roomSockets.sockets;

                var promises = [];

                //check for ACL and then send.

                if (typeof sockets === "object") {
                    for (var key in sockets) {
                        if (sockets[key]) {
                            promises.push(_sendNotification(appId, document, sockets[key], eventType));
                        }
                    }
                } else {
                    for (var i = 0; i < sockets.length; i++) {
                        var socket = sockets[i];
                        promises.push(_sendNotification(appId, document, socket, eventType));
                    }
                }

                q.all(promises).then(function () {

                }, function () {

                });
            }
        } catch (e) {
            winston.log('error', {
                "error": String(e),
                "stack": new Error().stack
            });
        }
    };

    return g;

};

/**
 */

function _sendNotification(appId, document, socket, eventType) {
    var deferred = q.defer();
    try {
        socketSessionHelper.getSession(socket.id, function (err, session) {
            if (err) {
                deferred.reject();
            }

            session = session || {};

            socketQueryHelper.getData(_buildSocketId(socket.id,appId,document._tableName,eventType), eventType, function (err, socketData) {

                socketData = socketData || { timestamp: '' };
                var socketQueryValidate = true;
                if (socketData.query) {
                    socketQueryValidate = socketQueryHelper.validateSocketQuery(document, socketData.query.query);
                }

                if (socketQueryValidate) {
                    // check if public access is enabled or the current session user is allowed
                    if (aclHelper.isAllowedReadAccess(session.userId, session.roles, document.ACL)) {

                        socket.emit(appId.toLowerCase() + 'table' + document._tableName.toLowerCase() + eventType.toLowerCase() + socketData.timestamp, JSON.stringify(document));

                        deferred.resolve();
                    } else {
                        // if no access then only emit if listen is using master key
                        if (socketData.appKey) {
                            appService.isMasterKey(appId, socketData.appKey).then(( isMaster ) => {
                                if(isMaster){

                                    socket.emit(appId.toLowerCase() + 'table' + document._tableName.toLowerCase() + eventType.toLowerCase() + socketData.timestamp, JSON.stringify(document));

                                }
                                deferred.resolve();
                            });
                        } else {

                            deferred.resolve();
                        }
                    }

                } else {

                    deferred.resolve();
                }

            });
        });
    } catch (e) {
        winston.log('error', {
            "error": String(e),
            "stack": new Error().stack
        });
        deferred.reject(e);
    }
    return deferred.promise;
}

function _buildSocketId(socketId, appId,tableName,eventType){
    return socketId + (appId + 'table' + tableName + eventType).toLowerCase();
}
