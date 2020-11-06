///<reference path="./cloudboost.d.ts" />

import CB from './CB';

try {
    if (window) {
        if (navigator.product == 'ReactNative') {
            // for react native turn node and native flags to true
            CB._isNode = true
            CB._isNative = true
        } else {
            // if window is found then node is false
            CB._isNode = false
        }
    }
} catch (e) {
    // if window is not found , then turn node flag to true
    CB._isNode = true
}

require('./PrivateMethods')
require('./CloudApp')
require('./Column')
require('./CloudTable')
require('./ACL')
require('./CloudGeoPoint')
require('./CloudObject')
require('./CloudFile')
require('./CloudRole')
require('./CloudEvent')
require('./CloudUser')
require('./CloudNotification')
require('./CloudPush')
require('./CloudQuery')

try {
    window.CB = CB
} catch (e) {}
module.exports = CB
