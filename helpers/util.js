/*
#     CloudBoost - Core Engine that powers Bakend as a Service
#     (c) 2014 HackerBay, Inc.
#     CloudBoost may be freely distributed under the Apache 2 License
*/

const URL = require('url');
const q = require('q');
const fs = require('fs');
const _ = require('underscore');
const winston = require('winston');

module.exports = {

  isUrlValid(data) {
    try {
      const obj = URL.parse(data);
      if (!obj.protocol || !obj.hostname) return false;
      return true;
    } catch (err) {
      winston.log('error', {
        error: String(err),
        stack: new Error().stack,
      });
    }
  },

  isEmailValid(data) {
    try {
      const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
      return re.test(data);
    } catch (err) {
      winston.log('error', {
        error: String(err),
        stack: new Error().stack,
      });
    }
  },

  getId() {
    try {
      let id = '';
      const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
      for (let i = 0; i < 8; i++) {
        id += possible.charAt(Math.floor(Math.random() * possible.length));
      }
      return id;
    } catch (err) {
      winston.log('error', {
        error: String(err),
        stack: new Error().stack,
      });
    }
  },

  isJsonString(str) {
    try {
      JSON.parse(str);
      return true;
    } catch (err) {
      winston.log('error', {
        error: String(err),
        stack: new Error().stack,
      });
      return false;
    }
  },
  isJsonObject(obj) {
    try {
      JSON.stringify(obj);
      return true;
    } catch (err) {
      winston.log('error', {
        error: String(err),
        stack: new Error().stack,
      });
      return false;
    }
  },
  getLatLongDistance(lat1, lon1, lat2, lon2) {
    const radlat1 = Math.PI * lat1 / 180;
    const radlat2 = Math.PI * lat2 / 180;
    const theta = lon1 - lon2;
    const radtheta = Math.PI * theta / 180;
    let dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
    dist = Math.acos(dist);
    dist = dist * 180 / Math.PI;
    dist = dist * 60 * 1.1515;
    dist *= 1609.344;

    return dist;
  },

  _checkFileExists(filePath) {
    const deferred = q.defer();

    try {
      fs.readFile(filePath, (err, data) => {
        if (err) {
          return deferred.reject(err);
        }
        deferred.resolve(data);
      });
    } catch (err) {
      winston.log('error', {
        error: String(err),
        stack: new Error().stack,
      });
    }

    return deferred.promise;
  },

  _isJSON(json) {
    // String
    if (json && typeof (json) === 'string') {
      try {
        JSON.parse(json);
        return true;
      } catch (e) {
        return false;
      }
    } else {
      return _.isObject(json);
    }
  },

};
