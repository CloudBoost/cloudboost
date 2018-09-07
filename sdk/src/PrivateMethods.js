import CB from './CB'
import { log } from 'util';

if (typeof localStorage === "undefined" || localStorage === null) {
    var localStorage = require('localStorage')
}

function lsWrapper() {
    if (typeof localStorage === "undefined" || localStorage === null) {
        var localStorage = require('localStorage');
        var nodeLocalStorage = true;
    }

    return {
        setItem: function(key, value){
            if(nodeLocalStorage){
                localStorage.setItem(key, value).catch(errorCB);
            } else {
                localStorage.setItem(key, value);
            }
        },

        removeItem: function (key) {
            if(nodeLocalStorage) {
                localStorage.getItem(key)
            }
        }

    }
    
}


/* PRIVATE METHODS */
CB.toJSON = function(thisObj) {

    if (thisObj.constructor === Array) {
        for (var i = 0; i < thisObj.length; i++) {
            thisObj[i] = CB.toJSON(thisObj[i]);
        }
        return thisObj;
    }

    var id = null;
    var columnName = null;
    var tableName = null;
    var latitude = null;
    var longitude = null;

    if (thisObj instanceof CB.CloudGeoPoint) {
        latitude = thisObj.document.latitude;
        longitude = thisObj.document.longitude;
    }

    if (thisObj instanceof CB.CloudFile)
        id = thisObj.document._id;

    if (thisObj instanceof CB.Column)
        columnName = thisObj.document.name;

    if (thisObj instanceof CB.CloudTable)
        tableName = thisObj.document.name;

    var obj = CB._clone(thisObj, id, longitude, latitude, tableName || columnName);

    if (!obj instanceof CB.CloudObject || !obj instanceof CB.CloudFile || !obj instanceof CB.CloudGeoPoint || !obj instanceof CB.CloudTable || !obj instanceof CB.Column) {
        throw "Data passed is not an instance of CloudObject or CloudFile or CloudGeoPoint";
    }

    if (obj instanceof CB.Column)
        return obj.document;

    if (obj instanceof CB.CloudGeoPoint)
        return obj.document;

    var doc = obj.document;

    for (var key in doc) {
        if (doc[key]instanceof CB.CloudObject || doc[key]instanceof CB.CloudFile || doc[key]instanceof CB.CloudGeoPoint || doc[key]instanceof CB.Column) {
            //if something is a relation.
            doc[key] = CB.toJSON(doc[key]); //serialize this object.
        } else if (key === 'ACL') {
            //if this is an ACL, then. Convert this from CB.ACL object to JSON - to strip all the ACL Methods.
            var acl = doc[key].document;
            doc[key] = acl;
        } else if (doc[key]instanceof Array) {
            //if this is an array.
            //then check if this is an array of CloudObjects, if yes, then serialize every CloudObject.
            if (doc[key][0] && (doc[key][0]instanceof CB.CloudObject || doc[key][0]instanceof CB.CloudFile || doc[key][0]instanceof CB.CloudGeoPoint || doc[key][0]instanceof CB.Column)) {
                var arr = [];
                for (var i = 0; i < doc[key].length; i++) {
                    arr.push(CB.toJSON(doc[key][i]));
                }
                doc[key] = arr;
            }
        }
    }

    return doc;
};

CB.fromJSON = function(data, thisObj) {

    //prevObj : is a copy of object before update.
    //this is to deserialize JSON to a document which can be shoved into CloudObject. :)
    //if data is a list it will return a list of Cl oudObjects.
    if (!data || data === "")
        return null;

    if (data instanceof Array) {

        if (data[0] && data[0]instanceof Object) {

            var arr = [];

            for (var i = 0; i < data.length; i++) {
                obj = CB.fromJSON(data[i]);
                arr.push(obj);
            }

            return arr;

        } else {
            //this is just a normal array, not an array of CloudObjects.
            return data;
        }
    } else if (data instanceof Object && data._type) {

        //if this is a CloudObject.
        var document = {};
        //different types of classes.

        for (var key in data) {
            if (data[key]instanceof Array) {
                document[key] = CB.fromJSON(data[key]);
            } else if (data[key]instanceof Object) {
                if (key === 'ACL') {
                    //this is an ACL.
                    document[key] = new CB.ACL();
                    document[key].document = data[key];

                } else if (data[key]._type) {
                    if (thisObj)
                        document[key] = CB.fromJSON(data[key], thisObj.get(key));
                    else
                        document[key] = CB.fromJSON(data[key]);
                    }
                else {
                    document[key] = data[key];
                }
            } else {
                document[key] = data[key];
            }
        }
        var id = thisObj
        if (thisObj instanceof Object) 
            id = thisObj._id || thisObj.id
        if (!thisObj || data['_id'] === id) {
            var id = null;
            var latitude = null;
            var longitude = null;
            var name = null;
            if (document._type === "file")
                id = document._id;
            if (document._type === "point") {
                latitude = document.latitude;
                longitude = document.longitude;
            }
            if (document._type === "table") {
                name = document.name;
            }
            if (document._type === "column") {
                name = document.name;
            }
            if (document._type === "queue") {
                name = document.name;
            }
            if (document._type === "cache") {
                name = document.name;
            }
            var obj = CB._getObjectByType(document._type, id, longitude, latitude, name);
            obj.document = document;

            thisObj = obj;
        } else {
            thisObj.document = document;
        }

        if (thisObj instanceof CB.CloudObject || thisObj instanceof CB.CloudUser || thisObj instanceof CB.CloudRole || thisObj instanceof CB.CloudFile) {
            //activate ACL.
            if (thisObj.document["ACL"])
                thisObj.document["ACL"].parent = thisObj;
            }

        return thisObj;

    } else {
        //if this is plain json.
        return data;
    }
};

CB._getObjectByType = function(type, id, longitude, latitude, name) {

    var obj = null;

    if (type === 'custom') {
        obj = new CB.CloudObject();
    }

    if (type === 'role') {
        obj = new CB.CloudRole();
    }

    if (type === 'user') {
        obj = new CB.CloudUser();
    }

    if (type === 'file') {
        obj = new CB.CloudFile(id);
    }

    if (type === 'point') {
        obj = new CB.CloudGeoPoint(0, 0);
        obj.document.latitude = Number(latitude);
        obj.document.longitude = Number(longitude);
    }

    if (type === 'table') {
        obj = new CB.CloudTable(name);
    }

    if (type === 'column') {
        obj = new CB.Column(name);
    }

    return obj;
};

CB._validate = function() {
    if (!CB.appId) {
        throw "AppID is null. Please use CB.CloudApp.init to initialize your app.";
    }

    if (!CB.appKey) {
        throw "AppKey is null. Please use CB.CloudApp.init to initialize your app.";
    }
};

function _all(arrayOfPromises) {
    //this is simplilar to Q.all for jQuery promises.
    return jQuery.when.apply(jQuery, arrayOfPromises).then(function() {
        return Array.prototype.slice.call(arguments, 0);
    });
};

CB._clone = function(obj, id, longitude, latitude, name) {
    var n_obj = {};
    if (obj.document._type && obj.document._type != 'point') {
        n_obj = CB._getObjectByType(obj.document._type, id, longitude, latitude, name);
        var doc = obj.document;
        var doc2 = {};
        for (var key in doc) {
            if (doc[key]instanceof CB.CloudFile)
                doc2[key] = CB._clone(doc[key], doc[key].document._id);
            else if (doc[key]instanceof CB.CloudObject) {
                doc2[key] = CB._clone(doc[key], null);
            } else if (doc[key]instanceof CB.CloudGeoPoint) {
                doc2[key] = CB._clone(doc[key], null);
            } else
                doc2[key] = doc[key];
            }
        } else if (obj instanceof CB.CloudGeoPoint) {
        n_obj = new CB.CloudGeoPoint(obj.get('longitude'), obj.get('latitude'));
        return n_obj;
    }

    n_obj.document = doc2;

    return n_obj;
};

CB._request = function(method, url, params, isServiceUrl, isFile, progressCallback) {

    CB._validate();

    // if(!params){
    //     var params = {};
    // }
    // if(typeof params != "object"){
    //     params = JSON.parse(params);
    // }

    // params.sdk = "JavaScript"
    // params = JSON.stringify(params)

    if (!CB.CloudApp._isConnected)
        throw "Your CloudApp is disconnected. Please use CB.CloudApp.connect() and try again.";

    var def = new CB.Promise();
    var Axios;
    var headers = {};
    var axiosRetry = require('axios-retry');

    if (CB._isNode) {
        Axios = require('Axios');
    } else {
        Axios = require('axios');
    }

    if (!isServiceUrl) {
        var ssid = CB._getSessionId();
        if (ssid != null)
            headers.sessionID = ssid
    }

    if (params && typeof params != "object") {
        params = JSON.parse(params);
    } 
    axiosRetry(Axios, { retryDelay: axiosRetry.exponentialDelay });
    Axios({
        method: method,
        url: url,
        data: params,
        headers: headers,
        onUploadProgress: function(event) {
            if (event.lengthComputable) {
                var percentComplete = event.loaded / event.total;
                if (progressCallback)
                    progressCallback(percentComplete)
            }
        }
    }).then(function(res) {
        if (!isServiceUrl) {
            var sessionID = res.headers.sessionid
            if (sessionID)
                localStorage.setItem('sessionID', sessionID);
            else
                localStorage.removeItem('sessionID');
            }
        def.resolve(JSON.stringify(res.data));
    }, function(err) {
        def.reject(err);
    })

    return def.promise;
};

CB._getSessionId = function() {
    return localStorage.getItem('sessionID');
}

CB._columnValidation = function(column, cloudtable) {
    var defaultColumn = ['id', 'createdAt', 'updatedAt', 'ACL'];
    if (cloudtable.document.type == 'user') {
        defaultColumn.concat(['username', 'email', 'password', 'roles']);
    } else if (cloudtable.document.type == 'role') {
        defaultColumn.push('name');
    }

    var index = defaultColumn.indexOf(column.name.toLowerCase());
    if (index === -1)
        return true;
    else
        return false;
    }
;

CB._tableValidation = function(tableName) {

    if (!tableName) //if table name is empty
        throw "table name cannot be empty";

    if (!isNaN(tableName[0]))
        throw "table name should not start with a number";

    if (!tableName.match(/^\S+$/))
        throw "table name should not contain spaces";

    var pattern = new RegExp(/[~`!#$%\^&*+=\-\[\]\\';,/{}|\\":<>\?]/);
    if (pattern.test(tableName))
        throw "table not shoul not contain special characters";

    };

CB._modified = function(thisObj, columnName) {
    thisObj.document._isModified = true;
    if (thisObj.document._modifiedColumns) {
        if (thisObj.document._modifiedColumns.indexOf(columnName) === -1) {
            thisObj.document._modifiedColumns.push(columnName);
        }
    } else {
        thisObj.document._modifiedColumns = [];
        thisObj.document._modifiedColumns.push(columnName);
    }
};

function trimStart(character, string) {
    var startIndex = 0;

    while (string[startIndex] === character) {
        startIndex++;
    }

    return string.substr(startIndex);
}

CB._columnNameValidation = function(columnName) {
    if (!columnName) //if table name is empty
        throw "table name cannot be empty";

    if (!isNaN(columnName[0]))
        throw "column name should not start with a number";

    if (!columnName.match(/^\S+$/))
        throw "column name should not contain spaces";

    var pattern = new RegExp(/[~`!#$%\^&*+=\-\[\]\\';,/{}|\\":<>\?]/);
    if (pattern.test(columnName))
        throw "column name not should not contain special characters";
    };

CB._columnDataTypeValidation = function(dataType) {

    if (!dataType)
        throw "data type cannot be empty";

    var dataTypeList = [
        'Text',
        'Email',
        'URL',
        'Number',
        'Boolean',
        'DateTime',
        'GeoPoint',
        'File',
        'List',
        'Relation',
        'Object',
        'EncryptedText'
    ];
    var index = dataTypeList.indexOf(dataType);
    if (index < 0)
        throw "invalid data type";

    };

CB._defaultColumns = function(type) {
    var id = new CB.Column('id');
    id.dataType = 'Id';
    id.required = true;
    id.unique = true;
    id.document.isDeletable = false;
    id.document.isEditable = false;

    var expires = new CB.Column('expires');
    expires.dataType = 'DateTime';
    expires.document.isDeletable = false;
    expires.document.isEditable = false;

    var createdAt = new CB.Column('createdAt');
    createdAt.dataType = 'DateTime';
    createdAt.required = true;
    createdAt.document.isDeletable = false;
    createdAt.document.isEditable = false;

    var updatedAt = new CB.Column('updatedAt');
    updatedAt.dataType = 'DateTime';
    updatedAt.required = true;
    updatedAt.document.isDeletable = false;
    updatedAt.document.isEditable = false;

    var ACL = new CB.Column('ACL');
    ACL.dataType = 'ACL';
    ACL.required = true;
    ACL.document.isDeletable = false;
    ACL.document.isEditable = false;

    var col = [id, expires, updatedAt, createdAt, ACL];
    if (type === "custom") {
        return col;
    } else if (type === "user") {
        var username = new CB.Column('username');
        username.dataType = 'Text';
        username.required = false;
        username.unique = true;
        username.document.isDeletable = false;
        username.document.isEditable = false;

        var email = new CB.Column('email');
        email.dataType = 'Email';
        email.unique = true;
        email.document.isDeletable = false;
        email.document.isEditable = false;

        var password = new CB.Column('password');
        password.dataType = 'EncryptedText';
        password.required = false;
        password.document.isDeletable = false;
        password.document.isEditable = false;

        var roles = new CB.Column('roles');
        roles.dataType = 'List';
        roles.relatedTo = 'Role';
        roles.relatedToType = 'role';
        roles.document.relationType = 'table';
        roles.document.isDeletable = false;
        roles.document.isEditable = false;

        var socialAuth = new CB.Column('socialAuth');
        socialAuth.dataType = 'List';
        socialAuth.relatedTo = 'Object';
        socialAuth.required = false;
        socialAuth.document.isDeletable = false;
        socialAuth.document.isEditable = false;

        var verified = new CB.Column('verified');
        verified.dataType = 'Boolean';
        verified.required = false;
        verified.document.isDeletable = false;
        verified.document.isEditable = false;

        col.push(username);
        col.push(roles);
        col.push(password);
        col.push(email);
        col.push(socialAuth);
        col.push(verified);
        return col;
    } else if (type === "role") {
        var name = new CB.Column('name');
        name.dataType = 'Text';
        name.unique = true;
        name.required = true;
        name.document.isDeletable = false;
        name.document.isEditable = false;
        col.push(name);
        return col;
    } else if (type === "device") {
        var channels = new CB.Column('channels');
        channels.dataType = 'List';
        channels.relatedTo = 'Text';
        channels.document.isDeletable = false;
        channels.document.isEditable = false;

        var deviceToken = new CB.Column('deviceToken');
        deviceToken.dataType = 'Text';
        deviceToken.unique = true;
        deviceToken.document.isDeletable = false;
        deviceToken.document.isEditable = false;

        var deviceOS = new CB.Column('deviceOS');
        deviceOS.dataType = 'Text';
        deviceOS.document.isDeletable = false;
        deviceOS.document.isEditable = false;

        var timezone = new CB.Column('timezone');
        timezone.dataType = 'Text';
        timezone.document.isDeletable = false;
        timezone.document.isEditable = false;

        var metadata = new CB.Column('metadata');
        metadata.dataType = 'Object';
        metadata.document.isDeletable = false;
        metadata.document.isEditable = false;

        col.push(channels);
        col.push(deviceToken);
        col.push(deviceOS);
        col.push(timezone);
        col.push(metadata);
        return col;
    }
};

CB._fileCheck = function(obj) {

    //obj is an instance of CloudObject.
    var deferred = new CB.Promise();
    var promises = [];
    for (var key in obj.document) {
        if (obj.document[key]instanceof Array && obj.document[key][0]instanceof CB.CloudFile) {
            for (var i = 0; i < obj.document[key].length; i++) {
                if (!obj.document[key][i].id)
                    promises.push(obj.document[key][i].save());
                }
            } else if (obj.document[key]instanceof Object && obj.document[key]instanceof CB.CloudFile) {
            if (!obj.document[key].id)
                promises.push(obj.document[key].save());
            }
        }
    if (promises.length > 0) {
        CB.Promise.all(promises).then(function() {
            var res = arguments;
            var j = 0;
            for (var key in obj.document) {
                if (obj.document[key]instanceof Array && obj.document[key][0]instanceof CB.CloudFile) {
                    for (var i = 0; i < obj.document[key].length; i++) {
                        if (!obj.document[key][i].id) {
                            obj.document[key][i] = res[j];
                            j = j + 1;
                        }
                    }
                } else if (obj.document[key]instanceof Object && obj.document[key]instanceof CB.CloudFile) {
                    if (!obj.document[key].id) {
                        obj.document[key] = res[j];
                        j = j + 1;
                    }
                }
            }
            deferred.resolve(obj);
        }, function(err) {
            deferred.reject(err);
        });
    } else {
        deferred.resolve(obj);
    }
    return deferred.promise;
};

CB._bulkObjFileCheck = function(array) {
    var deferred = new CB.Promise();
    var promises = [];
    for (var i = 0; i < array.length; i++) {
        promises.push(CB._fileCheck(array[i]));
    }
    CB.Promise.all(promises).then(function() {
        deferred.resolve(arguments);
    }, function(err) {
        deferred.reject(err);
    });
    return deferred.promise;
};

CB._generateHash = function() {
    var hash = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for (var i = 0; i < 8; i++) {
        hash = hash + possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return hash;
};

CB._isJsonString = function(str) {
    try {
        JSON.parse(str);
    } catch (e) {
        return false;
    }
    return true;
};

CB._isJsonObject = function(obj) {
    try {
        JSON.stringify(obj);
    } catch (e) {
        return false;
    }
    return true;
};

//Description : This fucntion get the content of the cookie .
//Params : @name : Name of the cookie.
//Returns : content as string.
CB._getCookie = function(name) {
    if (typeof(Storage) !== "undefined") {
        // Code for localStorage/sessionStorage.
        if (new Date(localStorage.getItem(name + "_expires")) > new Date()) {
            return localStorage.getItem(name);
        } else {
            CB._deleteCookie(name);
        }
    } else {
        // Sorry! No Web Storage support..
        if (typeof(document) !== 'undefined') {
            var name = name + "=";
            var ca = document.cookie.split(';');
            for (var i = 0; i < ca.length; i++) {
                var c = ca[i];
                while (c.charAt(0) == ' ')
                    c = c.substring(1);
                if (c.indexOf(name) == 0)
                    return c.substring(name.length, c.length);
                }
            return "";
        }
    }

}

//Description : Deletes the cookie
//Params : @name : Name of the cookie.
//Returns : void
CB._deleteCookie = function(name) {
    //save the user to the cookie.
    if (typeof(Storage) !== "undefined") {
        // Code for localStorage/sessionStorage.
        localStorage.removeItem(name);
        localStorage.removeItem(name + "_expires");
    } else {
        if (typeof(document) !== 'undefined') {
            var d = new Date();
            d.setTime(d.getTime() + (0 * 0 * 0 * 0 * 0));
            var expires = "expires=" + d.toUTCString();
            document.cookie = name + "=" + + "; " + expires;
        }
    }
}

//Description : Creates cookie.
//Params : @name : Name of the cookie.
//         @content : Content as string / JSON / int / etc.
//         @expires : Expiration time in millisecinds.
//Returns : content as string.
CB._createCookie = function(name, content, expires) {
    var d = new Date();
    d.setTime(d.getTime() + (expires));
    if (typeof(Storage) !== "undefined") {
        // Code for localStorage/sessionStorage.
        localStorage.setItem(name, content.toString());
        localStorage.setItem(name + "_expires", d);
    } else {
        if (typeof(document) !== 'undefined') {

            var expires = "expires=" + d.toUTCString();
            document.cookie = +name + "=" + content.toString() + "; " + expires;
        }
    }
}

//Description : returns query string.
//Params : @key : key
//Returns : query string.
CB._getQuerystringByKey = function(key) {
    key = key.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
    var regex = new RegExp("[\\?&]" + key + "=([^&#]*)"),
        results = regex.exec(location.search);
    return results === null
        ? ""
        : decodeURIComponent(results[1].replace(/\+/g, " "));
}

//Set sessionId if cbtoken is found in url
if (typeof(location) !== 'undefined' && location.search) {
    var cbtoken = CB._getQuerystringByKey("cbtoken");
    if (cbtoken && cbtoken !== "") {
        localStorage.setItem('sessionID', cbtoken);
    }
}

//Description : returns browser name
//Params : null
//Returns : browser name.
CB._getThisBrowserName = function() {

    // check if library is used as a Node.js module
    if (typeof window !== 'undefined') {

        // store navigator properties to use later
        var userAgent = 'navigator' in window && 'userAgent' in navigator && navigator.userAgent.toLowerCase() || '';
        var vendor = 'navigator' in window && 'vendor' in navigator && navigator.vendor.toLowerCase() || '';
        var appVersion = 'navigator' in window && 'appVersion' in navigator && navigator.appVersion.toLowerCase() || '';

        var is = {};

        // is current browser chrome?
        is.chrome = function() {
            return /chrome|chromium/i.test(userAgent) && /google inc/.test(vendor);
        };

        // is current browser firefox?
        is.firefox = function() {
            return /firefox/i.test(userAgent);
        };

        // is current browser edge?
        is.edge = function() {
            return /edge/i.test(userAgent);
        };

        // is current browser internet explorer?
        // parameter is optional
        is.ie = function(version) {
            if (!version) {
                return /msie/i.test(userAgent) || "ActiveXObject" in window;
            }
            if (version >= 11) {
                return "ActiveXObject" in window;
            }
            return new RegExp('msie ' + version).test(userAgent);
        };

        // is current browser opera?
        is.opera = function() {
            return /^Opera\//.test(userAgent) || // Opera 12 and older versions
            /\x20OPR\//.test(userAgent); // Opera 15+
        };

        // is current browser safari?
        is.safari = function() {
            return /safari/i.test(userAgent) && /apple computer/i.test(vendor);
        };

        if (is.chrome()) {
            return "chrome";
        }

        if (is.firefox()) {
            return "firefox";
        }

        if (is.edge()) {
            return "edge";
        }

        if (is.ie()) {
            return "ie";
        }

        if (is.opera()) {
            return "opera";
        }

        if (is.safari()) {
            return "safari";
        }

        return "unidentified";

    }
}

export default true
