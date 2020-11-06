

const winston = require('winston');
const Q = require('q');
const request = require('request');
const keys = require('../config/keys.js');

module.exports = {

  apiUsage(appId) {
    const deferred = Q.defer();

    try {
      _getApiUsageAnalytics(appId).then((result) => {
        deferred.resolve(result);
      }, (error) => {
        deferred.reject(error);
      });
    } catch (err) {
      winston.log('error', {
        error: String(err),
        stack: new Error().stack,
      });
      deferred.reject(err);
    }

    return deferred.promise;
  },

  storageUsage(appId) {
    const deferred = Q.defer();

    try {
      _getStorageUsageAnalytics(appId).then((result) => {
        deferred.resolve(result);
      }, (error) => {
        deferred.reject(error);
      });
    } catch (err) {
      winston.log('error', {
        error: String(err),
        stack: new Error().stack,
      });
      deferred.reject(err);
    }

    return deferred.promise;
  },
  apiCount(appId) {
    const deferred = Q.defer();

    try {
      _getApiCountAnalytics(appId).then((result) => {
        deferred.resolve(result);
      }, (error) => {
        deferred.reject(error);
      });
    } catch (err) {
      winston.log('error', {
        error: String(err),
        stack: new Error().stack,
      });
      deferred.reject(err);
    }
    return deferred.promise;
  },
  storageLastRecord(appId) {
    const deferred = Q.defer();

    try {
      _getStorageLastRecord(appId).then((result) => {
        deferred.resolve(result);
      }, (error) => {
        deferred.reject(error);
      });
    } catch (err) {
      winston.log('error', {
        error: String(err),
        stack: new Error().stack,
      });
      deferred.reject(err);
    }

    return deferred.promise;
  },
  bulkApiStorageDetails(appIdArray) {
    const deferred = Q.defer();

    try {
      _getBulkApiStorageDetails(appIdArray).then((result) => {
        deferred.resolve(result);
      }, (error) => {
        deferred.reject(error);
      });
    } catch (err) {
      winston.log('error', {
        error: String(err),
        stack: new Error().stack,
      });
      deferred.reject(err);
    }

    return deferred.promise;
  },

  getAppStatistics(appId) {
    const deferred = Q.defer();


    try {
      _getAppStatisticsAnalytics(appId).then((result) => {
        deferred.resolve(result);
      }, (error) => {
        deferred.reject(error);
      });
    } catch (err) {
      winston.log('error', {
        error: String(err),
        stack: new Error().stack,
      });
      deferred.reject(err);
    }

    return deferred.promise;
  },
};


/** *********************Pinging Analytics Services******************************** */

function _getApiUsageAnalytics(appId) {
  const deferred = Q.defer();

  try {
    let postData = {};
    postData.secureKey = keys.secureKey;
    postData = JSON.stringify(postData);


    const url = `${keys.analyticsServiceUrl}/${appId}/api/usage`;
    request.post(url, {
      headers: {
        'content-type': 'application/json',
        'content-length': postData.length,
      },
      body: postData,
    }, (err, response, body) => {
      if (err || response.statusCode === 500 || response.statusCode === 400 || body === 'Error') {
        winston.error({
          error: String(err),
          stack: new Error().stack,
        });
        deferred.reject(err);
      } else {
        try {
          const respBody = JSON.parse(body);
          deferred.resolve(respBody);
        } catch (e) {
          deferred.reject('Data parse error');
        }
      }
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


function _getStorageUsageAnalytics(appId) {
  const deferred = Q.defer();

  try {
    let postData = {};
    postData.secureKey = keys.secureKey;
    postData = JSON.stringify(postData);


    const url = `${keys.analyticsServiceUrl}/${appId}/storage/usage`;
    request.post(url, {
      headers: {
        'content-type': 'application/json',
        'content-length': postData.length,
      },
      body: postData,
    }, (err, response, body) => {
      if (err || response.statusCode === 500 || response.statusCode === 400 || body === 'Error') {
        winston.error({
          error: String(err),
          stack: new Error().stack,
        });
        deferred.reject(err);
      } else {
        try {
          const respBody = JSON.parse(body);
          deferred.resolve(respBody);
        } catch (e) {
          deferred.reject('Data parse error');
        }
      }
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


function _getApiCountAnalytics(appId) {
  const deferred = Q.defer();

  try {
    let postData = {};
    postData.secureKey = keys.secureKey;
    postData = JSON.stringify(postData);


    const url = `${keys.analyticsServiceUrl}/${appId}/api/count`;
    request.post(url, {
      headers: {
        'content-type': 'application/json',
        'content-length': postData.length,
      },
      body: postData,
    }, (err, response, body) => {
      if (err || response.statusCode === 500 || response.statusCode === 400 || body === 'Error') {
        winston.error({
          error: String(err),
          stack: new Error().stack,
        });
        deferred.reject(err);
      } else {
        try {
          const respBody = JSON.parse(body);
          deferred.resolve(respBody);
        } catch (e) {
          deferred.reject('Data parse error');
        }
      }
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

function _getStorageLastRecord(appId) {
  const deferred = Q.defer();

  try {
    let postData = {};
    postData.secureKey = keys.secureKey;
    postData = JSON.stringify(postData);


    const url = `${keys.analyticsServiceUrl}/${appId}/storage/count`;
    request.post(url, {
      headers: {
        'content-type': 'application/json',
        'content-length': postData.length,
      },
      body: postData,
    }, (err, response, body) => {
      if (err || response.statusCode === 500 || response.statusCode === 400 || body === 'Error') {
        winston.error({
          error: String(err),
          stack: new Error().stack,
        });
        deferred.reject(err);
      } else {
        try {
          const respBody = JSON.parse(body);
          deferred.resolve(respBody);
        } catch (e) {
          deferred.reject('Data parse error');
        }
      }
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


function _getBulkApiStorageDetails(appIdArray) {
  const deferred = Q.defer();

  try {
    let postData = {};
    postData.secureKey = keys.secureKey;
    postData.appIdArray = appIdArray;
    postData = JSON.stringify(postData);


    const url = `${keys.analyticsServiceUrl}/bulk/api-storage/count`;
    request.post(url, {
      headers: {
        'content-type': 'application/json',
        'content-length': postData.length,
      },
      body: postData,
    }, (err, response, body) => {
      if (err || response.statusCode === 500 || response.statusCode === 400 || body === 'Error') {
        winston.error({
          error: String(err),
          stack: new Error().stack,
        });
        deferred.reject(err);
      } else {
        try {
          const respBody = JSON.parse(body);
          deferred.resolve(respBody);
        } catch (e) {
          deferred.reject('Data parse error');
        }
      }
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

function _getAppStatisticsAnalytics(appId) {
  const deferred = Q.defer();

  try {
    let postData = {};
    postData.secureKey = keys.secureKey;
    postData = JSON.stringify(postData);


    const url = `${keys.analyticsServiceUrl}/${appId}/get/stats`;
    request.post(url, {
      headers: {
        'content-type': 'application/json',
        'content-length': postData.length,
      },
      body: postData,
    }, (err, response, body) => {
      if (err || response.statusCode === 500 || response.statusCode === 400 || body === 'Error') {
        winston.error({
          error: String(err),
          stack: new Error().stack,
        });
        deferred.reject(err);
      } else {
        try {
          const respBody = JSON.parse(body);
          deferred.resolve(respBody);
        } catch (e) {
          deferred.reject('Data parse error');
        }
      }
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
