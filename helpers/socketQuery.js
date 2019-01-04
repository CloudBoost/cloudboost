/* eslint-disable no-redeclare */
/*
#     CloudBoost - Core Engine that powers Bakend as a Service
#     (c) 2014 HackerBay, Inc.
#     CloudBoost may be freely distributed under the Apache 2 License
*/
const winston = require('winston');
const util = require('../helpers/util.js');
const config = require('../config/config');

var obj = {

  /* Gets the query connected to a socketId.
     * @socketId : Its a string.
     *
     * @callback : A query which is a string..
     */
  getData(socketId, eventType, callback) {
    try {
      config.redisClient.get(`cb-socket-${socketId}-data${eventType}`, (err, reply) => {
        callback(err, JSON.parse(reply));
      });
    } catch (err) {
      winston.log('error', {
        error: String(err),
        stack: new Error().stack,
      });
    }
  },

  /* Attaches the socketId to the query of the user.
     */
  setData(socketId, data, callback) {
    try {
      data = data || {};
      config.redisClient.set(`cb-socket-${socketId}-data${data.eventType}`, JSON.stringify(data), (err, reply) => {
        if (callback) callback(err, reply);
      });
    } catch (err) {
      winston.log('error', {
        error: String(err),
        stack: new Error().stack,
      });
    }
  },

  deleteData(socketId, eventType, callback) {
    try {
      config.redisClient.set(`cb-socket-${socketId}-data${eventType}`, null, (err, reply) => {
        if (callback) callback(err, reply);
      });
    } catch (err) {
      winston.log('error', {
        error: String(err),
        stack: new Error().stack,
      });
    }
  },
  validateSocketQuery(cloudObject, query) {
    // validate query.
    for (const key in query) {
      if (query[key]) {
        var value = query[key];
        if (typeof value === 'object') {
          if (key === '$or') {
            if (query[key].length > 0) {
              let isTrue = false;
              for (var i = 0; i < query[key].length; i++) {
                if (obj.validateSocketQuery(cloudObject, query[key][i])) {
                  isTrue = true;
                  break;
                }
              }

              if (!isTrue) {
                return false;
              }
            }
          } else {
            for (const objectKeys in value) {
              // near query
              if (objectKeys === '$near') {
                const cbVal = cloudObject[key];
                const qVal = query[key].$near;
                const lat1 = cbVal.latitude;


                const lon1 = cbVal.longitude;


                const lat2 = qVal.$geometry.coordinates[1];


                const lon2 = qVal.$geometry.coordinates[0];
                let maxDistance = qVal.$maxDistance;
                let minDistance = qVal.$minDistance;
                const distance = util.getLatLongDistance(lat1, lon1, lat2, lon2);
                if (!minDistance) minDistance = 0;
                if (!maxDistance) maxDistance = 21036000; // maximum distance b/w 2 poits on earth
                if (distance > maxDistance || distance < minDistance) return false;
              }

              // not equalTo query
              if (objectKeys === '$ne') {
                if (cloudObject[key] === query[key].$ne) {
                  return false;
                }
              }

              // greater than
              if (objectKeys === '$gt') {
                if (cloudObject[key] <= query[key].$gt) {
                  return false;
                }
              }

              // less than
              if (objectKeys === '$lt') {
                if (cloudObject[key] >= query[key].$lt) {
                  return false;
                }
              }

              // greater than and equalTo.
              if (objectKeys === '$gte') {
                if (cloudObject[key] < query[key].$gte) {
                  return false;
                }
              }

              // less than and equalTo.
              if (objectKeys === '$lte') {
                if (cloudObject[key] > query[key].$lte) {
                  return false;
                }
              }

              // exists
              if (objectKeys === '$exists') {
                if (query[key][objectKeys] && cloudObject[key]) {
                  // do nothing.
                } else if (query[key][objectKeys] !== false) {
                  return false;
                }
              }

              // doesNot exists.
              if (objectKeys === '$exists') {
                if (!query[key][objectKeys] && cloudObject[key]) {
                  return false;
                }
              }

              // startsWith.
              if (objectKeys === '$regex') {
                const reg = new RegExp(query[key][objectKeys]);

                if (!query[key].$options) {
                  if (!reg.test(cloudObject[key])) // test actial regex.
                  { return false; }
                } else if (query[key].$options === 'im') { // test starts with.
                  // starts with.
                  var value = trimStart('^', query[key][objectKeys]);
                  if (cloudObject[key].indexOf(value) !== 0) return false;
                }
              }

              // containedIn.
              if (objectKeys === '$in') {
                if (query[key][objectKeys]) {
                  var arr = query[key][objectKeys];
                  var value = null;
                  if (key.indexOf('.') > -1) { // for CloudObjects
                    var tempKey = key.substr(0, key.indexOf('.'));
                    value = cloudObject[tempKey];
                  } else {
                    value = cloudObject[key];
                  }

                  if (Object.prototype.toString.call(value) === '[object Array]') {
                    var exists = false;
                    for (var i = 0; i < value.length; i++) {
                      if (value[i]._type === 'custom') {
                        if (arr.indexOf(value[i]._id) > -1) {
                          exists = true;
                          break;
                        }
                      } else if (arr.indexOf(value[i]) > -1) {
                        exists = true;
                        break;
                      }
                    }

                    if (!exists) {
                      return false;
                    }
                  } else {
                    // if the element is not in the array then return false;
                    if (arr.indexOf(value) === -1) return false;
                  }
                }
              }

              // doesNot containedIn.
              if (objectKeys === '$nin') {
                if (query[key][objectKeys]) {
                  var arr = query[key][objectKeys];
                  var value = null;
                  if (key.indexOf('.') > -1) { // for CloudObjects
                    var tempKey = key.substr(0, key.indexOf('.'));
                    value = cloudObject[tempKey];
                  } else {
                    value = cloudObject[key];
                  }

                  if (Object.prototype.toString.call(value) === '[object Array]') {
                    var exists = false;
                    for (var i = 0; i < value.length; i++) {
                      if (value[i]._type === 'custom') {
                        if (arr.indexOf(value[i]._id) !== -1) {
                          exists = true;
                          break;
                        }
                      } else if (arr.indexOf(value[i]) !== -1) {
                        exists = true;
                        break;
                      }
                    }

                    if (exists) {
                      return false;
                    }
                  } else {
                    // if the element is not in the array then return false;
                    if (arr.indexOf(value) !== -1) return false;
                  }
                }
              }

              // containsAll.
              if (objectKeys === '$all') {
                if (query[key][objectKeys]) {
                  var arr = query[key][objectKeys];
                  var value = null;
                  if (key.indexOf('.') > -1) { // for CloudObjects
                    var tempKey = key.substr(0, key.indexOf('.'));
                    value = cloudObject[tempKey];
                  } else {
                    value = cloudObject[key];
                  }

                  if (Object.prototype.toString.call(value) === '[object Array]') {
                    for (var i = 0; i < value.length; i++) {
                      if (value[i]._type === 'custom') {
                        if (arr.indexOf(value[i]._id) === -1) {
                          return false;
                        }
                      } else if (arr.indexOf(value[i]) === -1) {
                        return false;
                      }
                    }
                  } else {
                    // if the element is not in the array then return false;
                    if (arr.indexOf(value) === -1) return false;
                  }
                }
              }
            }
          }
        } else {
          // it might be a plain equalTo query.
          if (key.indexOf('.') !== -1) { // for keys with "key._id" - This is for CloudObjects.
            const temp = key.substring(0, key.indexOf('.'));
            if (!cloudObject[temp]) {
              return false;
            }
            const a = cloudObject[temp]._id;
            const b = query[key];
            if (a !== b) {
              return false;
            }
          } else if (cloudObject[key] !== query[key]) {
            return false;
          }
        }
      }
    }

    return true;
  },
};

function trimStart(character, string) {
  let startIndex = 0;

  while (string[startIndex] === character) {
    startIndex++;
  }

  return string.substr(startIndex);
}

module.exports = obj;
