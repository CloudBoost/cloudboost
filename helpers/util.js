/*
#     CloudBoost - Core Engine that powers Bakend as a Service
#     (c) 2014 HackerBay, Inc.
#     CloudBoost may be freely distributed under the Apache 2 License
*/

var URL = require('url');
var q = require('q');
var fs = require('fs');
var _ = require('underscore');
var winston = require('winston');

module.exports = {

    isUrlValid: function(data) {
        try {
            var obj = URL.parse(data);
            if (!obj.protocol || !obj.hostname)
                return false;
            return true;
        } catch (err) {
            winston.log('error', {
                "error": String(err),
                "stack": new Error().stack
            });
        }
    },

    isEmailValid: function(data) {
        try {
            var re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
            return re.test(data);
        } catch (err) {
            winston.log('error', {
                "error": String(err),
                "stack": new Error().stack
            });
        }
    },

    getId: function() {
        try {
            var id = "";
            var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
            for (var i = 0; i < 8; i++) {
                id = id + possible.charAt(Math.floor(Math.random() * possible.length));
            }
            return id;

        } catch (err) {
            winston.log('error', {
                "error": String(err),
                "stack": new Error().stack
            });
        }
    },

    isJsonString: function(str) {
        try {

            JSON.parse(str);
            return true;

        } catch (err) {
            winston.log('error', {
                "error": String(err),
                "stack": new Error().stack
            });
            return false;
        }
    },
    isJsonObject: function(obj) {
        try {

             JSON.stringify(obj);
             return true;

        } catch (err) {
            winston.log('error', {
                "error": String(err),
                "stack": new Error().stack
            });
            return false;
        }
    },
    getLatLongDistance: function(lat1, lon1, lat2, lon2) {
        var radlat1 = Math.PI * lat1 / 180 ;
        var radlat2 = Math.PI * lat2 / 180 ;
        var theta = lon1 - lon2 ;
        var radtheta = Math.PI * theta / 180 ;
        var dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
        dist = Math.acos(dist) ;
        dist = dist * 180 / Math.PI ;
        dist = dist * 60 * 1.1515 ;
        dist = dist * 1609.344 ;

        return dist;
    },

    _checkFileExists: function (filePath) {

    var deferred = q.defer();

        try {

            fs.readFile(filePath, function(err, data) {
                if (err) {
                    
                    return deferred.reject(err);
                }
                deferred.resolve(data);
            });

        } catch (err) {
            winston.log('error', {
                "error": String(err),
                "stack": new Error().stack
            });
        }

        return deferred.promise;
    },

    _isJSON: function (json) {
        //String
        if (json && typeof(json) === "string") {
            try {
                JSON.parse(json);
                return true;
            } catch (e) {
                return false;
            }

        } else {
            return _.isObject(json);
        }
    }

};
