

const winston = require('winston');
const Q = require('q');
const util = require('./utilService');
const Subscriber = require('../model/subscriber.js');

module.exports = {

  subscribe(email) {
    const deferred = Q.defer();

    try {
      const self = this;

      if (util.isEmailValid(email)) {
        self.get(email).then((_subscriber) => {
          let subscriber = _subscriber;
          if (subscriber) {
            deferred.reject('Already Subscribed');
          } else {
            subscriber = new Subscriber();
            subscriber.email = email;

            subscriber.save((err) => {
              if (err) {
                deferred.reject(err);
              } else {
                deferred.resolve(email);
              }
            });
          }
        });
      } else {
        deferred.reject('Emailid invalid..');
      }
    } catch (err) {
      winston.log('error', {
        error: String(err),
        stack: new Error().stack,
      });
      deferred.reject(err);
    }

    return deferred.promise;
  },


  get(email) {
    const deferred = Q.defer();

    try {
      Subscriber.findOne({
        email,
      }, (err, subscriber) => {
        if (err) {
          deferred.reject(err);
        } else {
          deferred.resolve(subscriber);
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

  delete(email) {
    const deferred = Q.defer();

    try {
      Subscriber.findOneAndRemove({
        email,
      }, (err, subscriber) => {
        if (err) {
          deferred.reject(err);
        } else {
          deferred.resolve(subscriber);
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
