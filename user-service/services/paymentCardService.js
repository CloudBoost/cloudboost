const q = require('q');
const request = require('request');
const winston = require('winston');
const keys = require('../config/keys');

module.exports = {
  /**
   * @param {String} userId
   * @param {Object} data
   * @param {String} data.token
   * @param {String} data.userEmail
   * @param {ObjectID} data.userId
   *
   * @returns {Promise} Promises
   *
   */
  addCard(userId, _data) {
    const deferred = q.defer();
    const data = _data;
    try {
      data.secureKey = keys.secureKey;
      const dataObj = JSON.stringify(data);

      const url = `${keys.analyticsServiceUrl}/user/${userId}/addcard`;
      request.post(url, {
        headers: {
          'content-type': 'application/json',
          'content-length': dataObj.length,
        },
        body: dataObj,
      }, (err, response, body) => {
        if (err || response.statusCode >= 400) {
          deferred.reject(err);
        } else {
          const respBody = JSON.parse(body);
          deferred.resolve(respBody);
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
  },

  /**
   * @param {Object} data
   * @param {String} data.cardId
   * @param {String} data.customerId
   * @param {ObjectID} data.userId
   * @param {Object} data.params
   * @param {String} data.params.name
   * @param {String} data.params.exp_month
   * @param {String} data.params.exp_year
   *
   * @returns {Promise} Promises
   *
   */

  updateCard(_data) {
    const deferred = q.defer();
    const data = _data;
    try {
      data.secureKey = keys.secureKey;
      const dataObj = JSON.stringify(data);

      const url = `${keys.analyticsServiceUrl}/user/${data.userId}/updatecard`;
      request.post(url, {
        headers: {
          'content-type': 'application/json',
          'content-length': dataObj.length,
        },
        body: dataObj,
      }, (err, response, body) => {
        if (err || response.statusCode >= 400) {
          deferred.reject(err);
        } else {
          const respBody = JSON.parse(body);
          deferred.resolve(respBody);
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
  },


  /**
   * @param {Object} data
   * @param {String} data.cardId
   * @param {String} data.customerId
   * @param {ObjectID} data.userId
   *
   * @returns {Promise} Promises
   *
   */

  removeCard(_data) {
    const deferred = q.defer();
    const data = _data;
    try {
      data.secureKey = keys.secureKey;
      const dataObj = JSON.stringify(data);

      const url = `${keys.analyticsServiceUrl}/user/${data.userId}/removecard`;
      request.post(url, {
        headers: {
          'content-type': 'application/json',
          'content-length': dataObj.length,
        },
        body: dataObj,
      }, (err, response, body) => {
        if (err || response.statusCode >= 400) {
          deferred.reject(err);
        } else {
          const respBody = JSON.parse(body);
          deferred.resolve(respBody);
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
  },

  /**
   * @param {String} customerId
   * @param {Object} data
   * @param {String} data.defaultSource
   * @param {Object[]} data.sources
   * @param {Object} data.sources[].card
   * @param {String} data.sources[].card.last4
   * @param {String} data.sources[].card.brand
   * @param {String} data.sources[].card.exp_month
   * @param {String} data.sources[].card.exp_year
   * @param {String} data.sources[].card.cvc_check
   * @param {String} data.sources[].card.name
   * @param {String} data.sources[].card.funding
   * @param {String} data.sources[].card.id
   *
   * @returns {Promise} Promises
   *
   */

  updatePaymentFromStripe(customerId, data) {
    const deferred = q.defer();

    try {
      const dataObj = JSON.stringify(data);

      const url = `${keys.analyticsServiceUrl}/stripe/customer/${customerId}/update`;
      request.post(url, {
        headers: {
          'content-type': 'application/json',
          'content-length': dataObj.length,
        },
        body: dataObj,
      }, (err, response, body) => {
        if (err || response.statusCode >= 400) {
          deferred.reject(err);
        } else {
          const respBody = JSON.parse(body);
          deferred.resolve(respBody);
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
  },

  updateSalesFromAnalytics(appId, data, query) {
    const deferred = q.defer();

    try {
      const dataObj = JSON.stringify({
        data,
        query: query || null,
      });
      // /stripe/sales/:appId/update
      const url = `${keys.analyticsServiceUrl}/stripe/sale/${appId}/update`;
      request.post(url, {
        headers: {
          'content-type': 'application/json',
          'content-length': dataObj.length,
        },
        body: dataObj,
      }, (err, response, body) => {
        if (err || response.statusCode >= 400) {
          deferred.reject(err);
        } else {
          const respBody = JSON.parse(body);
          deferred.resolve(respBody);
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
  },
  /**
   *
   * @param {String} appId
   * @param {Object} query
   * @param {String} query.appId
   * @param {String} query.userId
   * @param {String} query.subscription_id
   */
  deleteSalesFromAnalytics(appId, query) {
    const deferred = q.defer();
    try {
      const dataObj = JSON.stringify(query);
      // /stripe/sales/:appId/update
      const url = `${keys.analyticsServiceUrl}/stripe/sale/${appId}/delete`;
      request.post(url, {
        headers: {
          'content-type': 'application/json',
          'content-length': dataObj.length,
        },
        body: dataObj,
      }, (err, response, body) => {
        if (err || response.statusCode >= 400) {
          deferred.reject(err);
        } else {
          const respBody = JSON.parse(body);
          deferred.resolve(respBody);
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
  },
};
