

const winston = require('winston');
const Q = require('q');
const Resources = require('../model/resources');

module.exports = {
  getAllResources(type) {
    const deferred = Q.defer();
    try {
      if (!type) {
        Resources.find({}, (err, resource) => {
          if (err) {
            deferred.reject(err);
          }
          if (!resource) {
            deferred.reject({});
          } else {
            deferred.resolve(resource);
          }
        });
      } else {
        Resources.find({ type }, (err, resource) => {
          if (err) {
            deferred.reject(err);
          }
          if (!resource) {
            deferred.reject({});
          } else {
            deferred.resolve(resource);
          }
        });
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

  getEntrepriseResources() {
    const deferred = Q.defer();
    try {
      Resources.find({ showOnEnterprisePage: true }, (err, resource) => {
        if (err) {
          deferred.reject(err);
        }
        if (!resource) {
          deferred.reject({});
        } else {
          deferred.resolve(resource);
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


  getResource(type, slug) {
    const deferred = Q.defer();

    try {
      Resources.findOne({
        type,
        slug,
      }, (err, resource) => {
        if (err) {
          deferred.reject(err);
        } else {
          deferred.resolve(resource);
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
