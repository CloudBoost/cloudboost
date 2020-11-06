

const winston = require('winston');
const Q = require('q');
const Tutorial = require('../model/tutorial.js');

module.exports = {

  getTutorialList() {
    const deferred = Q.defer();

    try {
      Tutorial.find({}, null, {
        sort: {
          order: 1,
        },
      }, (err, tutorial) => {
        if (err) {
          deferred.reject(err);
        }
        if (tutorial && tutorial.length > 0) {
          deferred.resolve(tutorial);
        } else {
          deferred.resolve(null);
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
  getTutorialById() {
    const deferred = Q.defer();

    try {

      /* Tutorial.findOne({tutorials::{"$in":[id:tutorialDocId]}}, function (err, tutorial) {
      if (err) deferred.reject(err);
      if(tutorial){
        deferred.resolve(tutorial);
      }else{
        deferred.resolve(null);
      }
    }); */

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
