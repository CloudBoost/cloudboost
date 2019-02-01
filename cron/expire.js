
/*
#     CloudBoost - Core Engine that powers Bakend as a Service
#     (c) 2014 HackerBay, Inc.
#     CloudBoost may be freely distributed under the Apache 2 License
*/

const q = require('q');
const winston = require('winston');
const { CronJob } = require('cron');
const mongoUtil = require('../helpers/mongo');
const fileService = require('../services/cloudFiles');
const config = require('../config/config');


function removeFiles(appId, curr) {
  try {
    const collectionName = 'File';
    const collectionId = mongoUtil.collection.getId(appId, collectionName);
    const collection = config.mongoClient.db(appId).collection(collectionId);
    const query = { expires: { $lt: curr, $exists: true, $ne: null } };
    const promises = [];
    collection.find(query).toArray().then((res) => {
      for (let i = 0; i < res.length; i++) {
        promises.push(fileService.delete(appId, res[i], null, true));
      }
      q.all(promises).then(() => {}, () => {});
    }, () => {});
  } catch (err) {
    winston.log('error', { error: String(err), stack: new Error().stack });
  }
}

function mongodb(appId, collectionName, curr) {
  try {
    const collectionId = mongoUtil.collection.getId(appId, collectionName);
    const collection = config.mongoClient.db(appId).collection(collectionId);
    const que = { expires: { $lt: curr, $exists: true, $ne: null } };
    collection.remove(que);
  } catch (err) {
    winston.log('error', { error: String(err), stack: new Error().stack });
  }
}


function _getDatabases() {
  const deferred = q.defer();

  try {
    config.mongoClient.command({ listDatabases: 1 }, (err, databaseStatList) => {
      if (err) {
        deferred.reject(err);
      } else if (databaseStatList) {
        // Exclude Databases
        const excludeDBList = ['_Analytics', '_GLOBAL', 'local'];
        const databaseNameList = [];
        for (let i = 0; i < databaseStatList.databases.length; ++i) {
          if (excludeDBList.indexOf(databaseStatList.databases[i].name) < 0) {
            databaseNameList.push(databaseStatList.databases[i].name);
          }
        }

        deferred.resolve(databaseNameList);
      }
    });
  } catch (err) {
    winston.log('error', { error: String(err), stack: new Error().stack });
  }

  return deferred.promise;
}

const job = new CronJob('00 00 22 * * *', (() => {
  try {
    _getDatabases().then((databaseNameList) => {
      if (databaseNameList && databaseNameList.length > 0) {
        for (let j = 0; j < databaseNameList.length; ++j) {
          const appId = databaseNameList[j];

          const curr = new Date();

          const collectionName = '_Schema';
          const collection = config.mongoClient.db(appId).collection(collectionName);

          collection.find({}).toArray().then((res) => {
            const resp = res.length;

            for (let i = 0; i < resp; i++) {
              const _collectionName = res[i].name;
              if (global.database && global.esClient) {
                if (_collectionName !== 'File') {
                  mongodb(appId, _collectionName, curr);
                } else {
                  removeFiles(appId, curr);
                }
              }
            }
          }, (error) => {
            winston.error({
              error,
            });
          });
        }
      }
    }, (error) => {
      winston.error({
        error: String(error),
        stack: new Error().stack,
      });
    });
  } catch (err) {
    winston.log('error', { error: String(err), stack: new Error().stack });
  }
}),

null, false, 'America/Los_Angeles');

job.start();
