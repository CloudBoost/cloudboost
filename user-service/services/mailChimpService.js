

const winston = require('winston');
const Q = require('q');
const request = require('request');
const keys = require('../config/keys');

module.exports = {

  addSubscriber(listId, email) {
    const deferred = Q.defer();

    try {
      const postData = {};
      postData.email_address = email;
      postData.status = 'subscribed';

      const url = `https://us10.api.mailchimp.com/3.0/lists/${listId}/members`;

      request({
        url,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        json: postData,
        auth: {
          username: 'cloudboost',
          password: keys.mailchimpApiKey,
        },
      }, (error, response, body) => {
        if (error || response.statusCode === 400 || response.statusCode === 500) {
          deferred.reject(error);
        } else {
          deferred.resolve(body);
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
