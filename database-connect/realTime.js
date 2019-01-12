/*
#     CloudBoost - Core Engine that powers Bakend as a Service
#     (c) 2014 HackerBay, Inc.
#     CloudBoost may be freely distributed under the Apache 2 License
*/
const q = require('q');
const winston = require('winston');
const socketSessionHelper = require('../helpers/socketSession');
const socketQueryHelper = require('../helpers/socketQuery');
const aclHelper = require('../helpers/ACL');
const appService = require('../services/app');

function _buildSocketId(socketId, appId, tableName, eventType) {
  return socketId + (`${appId}table${tableName}${eventType}`).toLowerCase();
}

function _sendNotification(appId, document, socket, eventType) {
  const deferred = q.defer();
  try {
    socketSessionHelper.getSession(socket.id, (err, _session) => {
      if (err) {
        deferred.reject();
      }

      const session = _session || {};

      socketQueryHelper.getData(_buildSocketId(socket.id, appId, document._tableName, eventType), eventType, (err1, _socketData) => {
        const socketData = _socketData || { timestamp: '' };
        let socketQueryValidate = true;
        if (socketData.query) {
          socketQueryValidate = socketQueryHelper.validateSocketQuery(document, socketData.query.query);
        }

        if (socketQueryValidate) {
          // check if public access is enabled or the current session user is allowed
          if (aclHelper.isAllowedReadAccess(session.userId, session.roles, document.ACL)) {
            socket.emit(`${appId.toLowerCase()}table${document._tableName.toLowerCase()}${eventType.toLowerCase()}${socketData.timestamp}`,
              JSON.stringify(document));

            deferred.resolve();
          } else if (socketData.appKey) {
            // if no access then only emit if listen is using master key
            appService.isMasterKey(appId, socketData.appKey).then((isMaster) => {
              if (isMaster) {
                // eslint-disable-next-line max-len
                socket.emit(`${appId.toLowerCase()}table${document._tableName.toLowerCase()}${eventType.toLowerCase()}${socketData.timestamp}`, JSON.stringify(document));
              }
              deferred.resolve();
            });
          } else {
            deferred.resolve();
          }
        } else {
          deferred.resolve();
        }
      });
    });
  } catch (e) {
    winston.log('error', {
      error: String(e),
      stack: new Error().stack,
    });
    deferred.reject(e);
  }
  return deferred.promise;
}

module.exports = (io) => {
  const g = {};
  io.use((socket, next) => {
    next();
  });
  io.on('connection', (socket) => {
    try {
      socket.on('app-init', (data) => {
        try {
          socket.join(data);
        } catch (e) {
          winston.log('error', {
            error: String(e),
            stack: new Error().stack,
          });
        }
      });

      /* Custom Channel Listeners. */

      socket.on('join-custom-channel', (data) => {
        try {
          socket.join(data);
        } catch (e) {
          winston.log('error', {
            error: String(e),
            stack: new Error().stack,
          });
        }
      });

      socket.on('socket-disconnect', () => {
        try {
          socket.disconnect();
        } catch (e) {
          winston.log('error', {
            error: String(e),
            stack: new Error().stack,
          });
        }
      });

      socket.on('leave-custom-channel', (data) => {
        try {
          socket.leave(data);
        } catch (e) {
          winston.log('error', {
            error: String(e),
            stack: new Error().stack,
          });
        }
      });

      socket.on('publish-custom-channel', (data) => {
        try {
          // if this doucment is an instance of a table Object.
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
            error: String(e),
            stack: new Error().stack,
          });
        }
      });

      /* CloudObject Channel Listeners. */
      socket.on('join-object-channel', (data) => {
        try {
          if (typeof data === 'string') { // Backward Compatibility : data only has the room id
            socket.join(data);
          } else { // data has both the room id and the sessionId.
            socket.join(data.room);
            // connect socket.id and sessionId together

            // build socketid specefic to table
            let tableSocketId = data.room.split('');
            tableSocketId.splice(-8, 8);
            tableSocketId = socket.id + tableSocketId.join('');

            socketQueryHelper.setData(tableSocketId, data.data);
            socketSessionHelper.saveSession(socket.id, data.sessionId);
          }
        } catch (e) {
          winston.log('error', {
            error: String(e),
            stack: new Error().stack,
          });
        }
      });

      socket.on('leave-object-channel', (data) => {
        try {
          // build socketid specefic to table
          const tableSocketId = socket.id + data.event;
          socketQueryHelper.getData(tableSocketId, data.eventType, (err, socketData) => {
            if (err) throw err;
            else {
              socket.leave(data.event + socketData.timestamp);
              socket.emit(`leave${data.event}${data.timestamp}`, socketData.timestamp); // to removeAlListeners
              socketQueryHelper.deleteData(tableSocketId, data.event);
            }
          });
        } catch (e) {
          winston.log('error', {
            error: String(e),
            stack: new Error().stack,
          });
        }
      });

      socket.on('disconnect', () => {
        try {
          socketSessionHelper.deleteSession(socket.id); // deletes the lnk between this socket and session.
        } catch (e) {
          winston.log('error', {
            error: String(e),
            stack: new Error().stack,
          });
        }
      });
    } catch (e) {
      winston.log('error', {
        error: String(e),
        stack: new Error().stack,
      });
    }
  });

  g.sendObjectNotification = (appId, document, eventType) => {
    try {
      // event type can be created, updated, deleted.
      if (document && document._tableName) {
        // if this doucment is an instance of a table Object.
        const roomSockets = io.to(`${appId.toLowerCase()}table${document._tableName.toLowerCase()}${eventType.toLowerCase()}`);
        const { sockets } = roomSockets;

        const promises = [];

        // check for ACL and then send.

        if (typeof sockets === 'object' && !Array.isArray(sockets)) {
          Object.keys(sockets).forEach((key) => {
            if (Object.prototype.hasOwnProperty.call(sockets, key) && sockets[key]) {
              promises.push(_sendNotification(appId, document, sockets[key], eventType));
            }
          });
        } else {
          for (let i = 0; i < sockets.length; i++) {
            const socket = sockets[i];
            promises.push(_sendNotification(appId, document, socket, eventType));
          }
        }

        q.all(promises).then(() => {

        }, () => {

        });
      }
    } catch (e) {
      winston.log('error', {
        error: String(e),
        stack: new Error().stack,
      });
    }
  };

  return g;
};

/**
 */
