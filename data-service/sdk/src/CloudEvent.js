import CB from './CB'
import axios from 'axios'
var os = require('os');
/*
 CloudEvent
 */
class CloudEvent {}
CloudEvent.track = function(name, data, type, callback) {
    var def;
    if (typeof type === 'object') {
        if (callback != null) {
            throw '\'type\' cannot be an object.'
        } else {
            callback = type;
            type = 'Custom';
        }

    }
    if (!type)
        type = 'Custom';
    if (!callback)
        def = new CB.Promise();

    CloudEvent._getDeviceInformation({
        success: function(object) {
            data['device'] = object;
            var obj = new CB.CloudObject('_Event');
            obj.ACL = new CB.ACL();
            obj.ACL.setPublicReadAccess(false);
            obj.ACL.setPublicWriteAccess(false);
            obj.set('user', CB.CloudUser.current);
            obj.set('name', name);
            obj.set('data', data);
            obj.set('type', type);
            obj.save({
                success: function(obj) {
                    if (callback) {
                        callback.success(obj);
                    } else {
                        def.resolve(obj);
                    }
                },
                error: function(err) {
                    if (callback) {
                        callback.error(err);
                    } else {
                        def.reject(err);
                    }
                }
            });

        }
    })
    if (!callback)
        return def.promise;

    }

CloudEvent._getDeviceInformation = function(callback) {
    var obj = new Object();
    if (!CB._isNode) 
        obj['browser'] = _getBrowser();
    else
        obj['browser'] = 'node';

    _getLocation(obj, {
        success: function(object) {
            callback.success(object)
        }
    })
}

CloudEvent._os = function() {}

function _getBrowser() {
    // Opera 8.0+
    try {
        var isOpera = (!!window.opr && !!opr.addons) || !!window.opera || navigator.userAgent.indexOf(' OPR/') >= 0;

        // Firefox 1.0+
        var isFirefox = typeof InstallTrigger !== 'undefined';

        // Safari 3.0+ "[object HTMLElementConstructor]"
        var isSafari = /constructor/i.test(window.HTMLElement) || (function(p) {
            return p.toString() === "[object SafariRemoteNotification]";
        })(!window['safari'] || safari.pushNotification);

        // Internet Explorer 6-11
        var isIE =/*@cc_on!@*/
        false || !!document.documentMode;

        // Edge 20+
        var isEdge = !isIE && !!window.StyleMedia;

        // Chrome 1+
        var isChrome = !!window.chrome && !!window.chrome.webstore;

        if (isChrome)
            return 'Chrome';
        else if (isEdge)
            return 'Edge';
        else if (isIE)
            return 'Internet Explorer';
        else if (isSafari)
            return 'Safari';
        else if (isFirefox)
            return 'Firefox';
        else if (isOpera)
            return 'Opera';
        else {
            return 'Other';
        }
    } catch (e) {
        return 'other'
    }
}

function _getLocation(obj, callback) {
    axios.get('https://ipinfo.io/json').then(function(data) {

        obj['ip'] = data.data.ip;
        obj['city'] = data.data.city;
        obj['region'] = data.data.region;
        obj['country'] = data.data.country;
        obj['loc'] = data.data.loc;
        callback.success(obj);

    }).catch(function(err) {
        obj['message'] = 'App is Offline';
        callback.success(obj);
    });
}

CB.CloudEvent = CloudEvent

export default CloudEvent
