/* eslint-disable no-use-before-define
*/
const winston = require('winston');
const Q = require('q');
const request = require('request');
const keys = require('../config/keys.js');
const dbaccessModel = require('../model/dbAccess.js');

module.exports = {

  createAccessUrl(userId, appId) {
    const deferred = Q.defer();
    checkIfAppByUser(userId, appId)
      .then(() => checkIfAlreadyExists(userId, appId, dbaccessModel))
      .then(() => createUserInDb(appId))
      .then(userData => createAccessEntryforUser(userId, appId, userData, dbaccessModel))
      .then(data => deferred.resolve(data))
      .catch(err => deferred.reject(err));
    return deferred.promise;
  },
  getAccessUrl(userId, appId) {
    const deferred = Q.defer();
    dbaccessModel.findOne({
      _userId: userId,
      appId,
    }, (err, data) => {
      if (err) deferred.reject(err);
      if (data === null || data === undefined) {
        deferred.reject({
          found: false,
        });
      } else {
        if (keys.mongoPublicUrls.length === 0) {
          deferred.reject({
            message: "No public url's",
          });
        }
        const url = keys.mongoPublicUrls.reduce((acc, curr, idx, array) => {
          let newAcc = acc + curr;
          if (idx !== array.length - 1) {
            newAcc += ',';
          }
          return newAcc;
        }, '');
        deferred.resolve({
          data,
          url,
        });
      }
    });
    return deferred.promise;
  },

};

function createUserInDb(appId) {
  const deferred = Q.defer();
  let postData;
  const url = `${keys.dataServiceUrl}/admin/dbaccess/enable/${appId}`;
  postData = {
    secureKey: keys.secureKey,
  };
  postData = JSON.stringify(postData);
  request.post(url, {
    headers: {
      'content-type': 'application/json',
      'content-length': postData.length,
    },
    body: postData,
  }, (err, response, body) => {
    if (err || response.statusCode === 500 || body === 'Error') {
      winston.error({
        error: String(err),
        stack: new Error().stack,
      });
      deferred.reject(err);
    } else {
      try {
        deferred.resolve(JSON.parse(body));
      } catch (e) {
        deferred.reject(e);
      }
    }
  });
  return deferred.promise;
}

function createAccessEntryforUser(userId, appId, userData, DbaccessModel) {
  const deferred = Q.defer();

  const newDbAccess = new DbaccessModel();
  newDbAccess.username = userData.user.username;
  newDbAccess.password = userData.user.password;
  newDbAccess._userId = userId;
  newDbAccess.appId = appId;

  newDbAccess.save((err) => {
    if (err) {
      deferred.reject(err);
    } else {
      deferred.resolve(userData);
    }
  });

  return deferred.promise;
}

function checkIfAlreadyExists(userId, appId, DbaccessModel) {
  const deferred = Q.defer();
  DbaccessModel.findOne({
    _userId: userId,
    appId,
  }, (err, data) => {
    if (err) deferred.reject(err);
    if (data === null || data === undefined) {
      deferred.resolve(true);
    } else {
      deferred.reject({
        error: 'DbAccess Already Existis',
      });
    }
  });
  return deferred.promise;
}

function checkIfAppByUser(userId, appId) {
  const deferred = Q.defer();
  global.projectService.projectList(userId).then((list) => {
    const exists = list.find(elm => elm.appId === appId);
    if (exists) {
      return deferred.resolve(true);
    }
    return deferred.reject({
      error: 'given user does not exists for the given application',
    });
  }, (err) => {
    deferred.reject(err);
  });
  return deferred.promise;
}
