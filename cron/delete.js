/*
#     CloudBoost - Core Engine that powers Bakend as a Service
#     (c) 2014 HackerBay, Inc.
#     CloudBoost may be freely distributed under the Apache 2 License
*/
/* eslint no-use-before-define: 0, consistent-return: 0, no-param-reassign: 0 */
const q = require('q');
const winston = require('winston');
const { CronJob } = require('cron');
const mongoUtil = require('../helpers/mongo');
const config = require('../config/config');

const job = new CronJob('15 * * * * *', (() => {
  getMessages();
}),
null, false, 'America/Los_Angeles');

job.start();

function getMessages() {
  try {
    if (config.mongoDisconnected) return '';
    global.queue.getMessages(config.deleteQueue, (error, message) => {
      if (!error) {
        if (message.length > 0) {
          _delete(message[0].messagetext).then(() => {
            deleteFromQueue(message);
            getMessages();
          }, (err) => {
            deleteFromQueue(message);
            winston.log('error', {
              error: String(err),
              stack: new Error().stack,
            });
          });
        } else {
          return '';
        }
      }
    });
  } catch (err) {
    winston.log('error', {
      error: String(err),
      stack: new Error().stack,
    });
  }
}

function deleteFromQueue(message) {
  try {
    global.queue.deleteMessage(config.deleteQueue, message[0].messageid, message[0].popreceipt, () => {});
  } catch (err) {
    winston.log('error', {
      error: String(err),
      stack: new Error().stack,
    });
  }
}

function _delete(message) {
  const deferred = q.defer();
  try {
    let promise = null;
    if (message) {
      message = JSON.parse(message);
      if (message.operation === 'tableDelete') promise = _tableDelete(message.appId, message.tableName, message.db);
      else if (message.operation === 'appDelete') promise = _appDelete(message.appId, message.db);
      else promise = _columnDelete(message.appId, message.tableName, message.columnName, message.db);
    }
    promise.then(() => {
      deferred.resolve();
    }, (err) => {
      deferred.reject(err);
    });
  } catch (err) {
    winston.log('error', {
      error: String(err),
      stack: new Error().stack,
    });
    deferred.reject(err);
  }
  return deferred.promise;
}

function _appDelete(appId, db) {
  const deferred = q.defer();
  try {
    const promises = [];
    if (db.length > 0) {
      if (db.indexOf('mongo') >= 0) promises.push(mongoUtil.app.drop(appId));
    }
    if (promises.length > 0) {
      q.all(promises).then(() => {
        deferred.resolve();
      }, () => {
        deferred.reject();
      });
    } else deferred.resolve();
  } catch (err) {
    winston.log('error', {
      error: String(err),
      stack: new Error().stack,
    });
    deferred.reject(err);
  }
  return deferred.promise;
}

function _tableDelete(appId, tableName, db) {
  const deferred = q.defer();

  try {
    const promises = [];
    if (db.length > 0) {
      if (db.indexOf('mongo') >= 0) promises.push(mongoUtil.collection.dropCollection(appId, tableName));
    }
    if (promises.length > 0) {
      q.all(promises).then(() => {
        deferred.resolve();
      }, () => {
        deferred.reject();
      });
    } else deferred.resolve();
  } catch (err) {
    winston.log('error', {
      error: String(err),
      stack: new Error().stack,
    });
    deferred.reject(err);
  }
  return deferred.promise;
}

function _columnDelete(appId, tableName, columnName, db) {
  const deferred = q.defer();
  try {
    const promises = [];
    if (db.length > 0) {
      if (db.indexOf('mongo') >= 0) promises.push(mongoUtil.collection.dropColumn(appId, tableName, columnName));
    }
    if (promises.length > 0) {
      q.all(promises).then(() => {
        deferred.resolve();
      }, () => {
        deferred.reject();
      });
    } else deferred.resolve();
  } catch (err) {
    winston.log('error', {
      error: String(err),
      stack: new Error().stack,
    });
    deferred.reject(err);
  }
  return deferred.promise;
}
