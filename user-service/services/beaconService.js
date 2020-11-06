

const winston = require('winston');
const Q = require('q');
const Beacon = require('../model/beacon');

module.exports = {

  createBeacon(userId) {
    const deferred = Q.defer();

    try {
      const beacon = new Beacon();
      beacon._userId = userId;

      beacon.firstApp = false;
      beacon.firstTable = false;
      beacon.firstColumn = false;
      beacon.firstRow = false;
      beacon.tableDesignerLink = false;
      beacon.documentationLink = false;
      beacon.dashboardFeedback = true;
      beacon.firstLogin = false;

      beacon.save((err, beaconObj) => {
        if (err) {
          deferred.reject(err);
        }

        if (!beaconObj) {
          deferred.reject('Cannot save the beacon right now.');
        } else {
          deferred.resolve(beaconObj);
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
  getBeaconByUserId(userId) {
    const deferred = Q.defer();

    try {
      Beacon.find({
        _userId: userId,
      }, (err, beaconObj) => {
        if (err) {
          deferred.reject(err);
        }
        if (beaconObj && beaconObj.length > 0) {
          deferred.resolve(beaconObj[0]._doc);
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
  updateBeacon(userId, beaconObj) {
    const deferred = Q.defer();

    try {
      const _self = this;

      _self.getBeaconByUserIdAndBeaconId(userId, beaconObj._id).then((_respBeaconObj) => {
        const respBeaconObj = {};
        respBeaconObj._id = _respBeaconObj._id;
        respBeaconObj.firstApp = beaconObj.firstApp;
        respBeaconObj.firstTable = beaconObj.firstTable;
        respBeaconObj.firstColumn = beaconObj.firstColumn;
        respBeaconObj.firstRow = beaconObj.firstRow;
        respBeaconObj.tableDesignerLink = beaconObj.tableDesignerLink;
        respBeaconObj.documentationLink = beaconObj.documentationLink;
        respBeaconObj.dashboardFeedback = beaconObj.dashboardFeedback;
        respBeaconObj.firstLogin = beaconObj.firstLogin;

        return Beacon.findByIdAndUpdate({ _id: _respBeaconObj._id }, respBeaconObj, { new: true });
      }).then((savedBeaconObj) => {
        deferred.resolve(savedBeaconObj);
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
  getBeaconByUserIdAndBeaconId(userId, beaconId) {
    const deferred = Q.defer();

    try {
      Beacon.findOne({
        _id: beaconId,
        _userId: userId,
      }, (err, beaconObj) => {
        if (err) {
          deferred.reject(err);
        }
        if (beaconObj) {
          deferred.resolve(beaconObj);
        } else {
          deferred.reject('No beacon found');
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
  saveBeaconByObj(beaconObj) {
    const deferred = Q.defer();

    try {
      Beacon.findOneAndUpdate({ _id: beaconObj._id }, beaconObj, { new: true }, (err, savedBeaconObj) => {
        if (err) {
          deferred.reject(err);
        }
        if (!savedBeaconObj) {
          deferred.reject('Cannot save the beacon right now.');
        } else {
          deferred.resolve(savedBeaconObj);
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
