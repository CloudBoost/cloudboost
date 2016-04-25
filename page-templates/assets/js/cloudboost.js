/*

 This is the version 1.0.0 of the CloudBoost JS/Node SDK
 This SDK is dependent on jQuery.

 */

var CB = CB || {}; //namespace.

CB.version = "1.0.0";
CB._isNode = false;
CB.Socket = null;

CB.io = null; //socket.io library is saved here.

CB.apiUrl = 'https://api.cloudboost.io';


CB.appId = CB.appId || null;
CB.appKey = CB.appKey || null;

if (typeof(process) !== "undefined" &&
    process.versions &&
    process.versions.node) {
    CB._isNode = true;
}
else
{
    CB._isNode = false;
}

/*
 Parse codes:
 */
CB._ajaxIE8 = function(method, url, data) {
    var promise = new CB.Promise();
    var xdr = new XDomainRequest();
    xdr.onload = function() {
        var response;
        try {
            response = JSON.parse(xdr.responseText);
        } catch (e) {
            promise.reject(e);
        }
        if (response) {
            promise.resolve(response);
        }
    };
    xdr.onerror = xdr.ontimeout = function() {
        // Let's fake a real error message.
        var fakeResponse = {
            responseText: JSON.stringify({
                code: 500,
                error: "IE's XDomainRequest does not supply error info."
            })
        };
        promise.reject(fakeResponse);
    };
    xdr.onprogress = function() {};
    xdr.open(method, url);
    xdr.send(data);
    return promise;
};
CB._loadXml = function()
{
    var xmlhttp;
    var req = typeof(require) === 'function' ? require : null;
    // Load references to other dependencies
    if (typeof(XMLHttpRequest) !== 'undefined') {
        xmlhttp = XMLHttpRequest;
    } else if (typeof(require) === 'function' &&
        typeof(require.ensure) === 'undefined') {
        xmlhttp = req('xmlhttprequest').XMLHttpRequest;
    }
    xmlhttp = new xmlhttp();
    return xmlhttp;
};
CB.Promise = function() {
    this._resolved = false;
    this._rejected = false;
    this._resolvedCallbacks = [];
    this._rejectedCallbacks = [];

    this._isPromisesAPlusCompliant = false;
    this.is = function(promise) {
        return promise && promise.then && Object.prototype.toString.call(promise.then) === "[object Function]";
    };
    this.as = function() {
        var promise = new CB.Promise();
        promise.resolve.apply(promise, arguments);
        return promise;
    };
    this.error = function() {
        var promise = new CB.Promise();
        promise.reject.apply(promise, arguments);
        return promise;
    };
    this.when = function(promises) {
        // Allow passing in Promises as separate arguments instead of an Array.
        var objects;
        if (promises && (typeof promises.length === "undefined" || promises.length === null)) {
            objects = arguments;
        } else {
            objects = promises;
        }

        var total = objects.length;
        var hadError = false;
        var results = [];
        var errors = [];
        results.length = objects.length;
        errors.length = objects.length;

        if (total === 0) {
            return CB.Promise.as.apply(this, results);
        }

        var promise = new CB.Promise();

        var resolveOne = function() {
            total = total - 1;
            if (total === 0) {
                if (hadError) {
                    promise.reject(errors);
                } else {
                    promise.resolve.apply(promise, results);
                }
            }
        };

        objects.forEach(function(object, i) {
            if (CB.Promise.is(object)) {
                object.then(function(result) {
                    results[i] = result;
                    resolveOne();
                }, function(error) {
                    errors[i] = error;
                    hadError = true;
                    resolveOne();
                });
            } else {
                results[i] = object;
                resolveOne();
            }
        });

        return promise;
    };
    this._continueWhile = function(predicate, asyncFunction) {
        if (predicate()) {
            return asyncFunction().then(function() {
                return CB.Promise._continueWhile(predicate, asyncFunction);
            });
        }
        return CB.Promise.as();
    }
};

CB.Promise.is = function(promise) {
    return promise && promise.then && Object.prototype.toString.call(promise.then) === "[object Function]";
};
/**
 * Marks this promise as fulfilled, firing any callbacks waiting on it.
 * @param {Object} result the result to pass to the callbacks.
 */
CB.Promise.prototype["resolve"] = function(result) {
    if (this._resolved || this._rejected) {
        throw "A promise was resolved even though it had already been " +
        (this._resolved ? "resolved" : "rejected") + ".";
    }
    this._resolved = true;
    this._result = arguments;
    var results = arguments;
    this._resolvedCallbacks.forEach(function(resolvedCallback) {
        resolvedCallback.apply(this, results);
    });
    this._resolvedCallbacks = [];
    this._rejectedCallbacks = [];
};

/**
 * Marks this promise as fulfilled, firing any callbacks waiting on it.
 * @param {Object} error the error to pass to the callbacks.
 */
CB.Promise.prototype["reject"] = function(error) {
    if (this._resolved || this._rejected) {
        throw "A promise was rejected even though it had already been " +
        (this._resolved ? "resolved" : "rejected") + ".";
    }
    this._rejected = true;
    this._error = error;
    this._rejectedCallbacks.forEach(function(rejectedCallback) {
        rejectedCallback(error);
    });
    this._resolvedCallbacks = [];
    this._rejectedCallbacks = [];
};

/**
 * Adds callbacks to be called when this promise is fulfilled. Returns a new
 * Promise that will be fulfilled when the callback is complete. It allows
 * chaining. If the callback itself returns a Promise, then the one returned
 * by "then" will not be fulfilled until that one returned by the callback
 * is fulfilled.
 * @param {Function} resolvedCallback Function that is called when this
 * Promise is resolved. Once the callback is complete, then the Promise
 * returned by "then" will also be fulfilled.
 * @param {Function} rejectedCallback Function that is called when this
 * Promise is rejected with an error. Once the callback is complete, then
 * the promise returned by "then" with be resolved successfully. If
 * rejectedCallback is null, or it returns a rejected Promise, then the
 * Promise returned by "then" will be rejected with that error.
 * @return {CB.Promise} A new Promise that will be fulfilled after this
 * Promise is fulfilled and either callback has completed. If the callback
 * returned a Promise, then this Promise will not be fulfilled until that
 * one is.
 */
CB.Promise.prototype["then"] = function(resolvedCallback, rejectedCallback) {
    var promise = new CB.Promise();

    var wrappedResolvedCallback = function() {
        var result = arguments;
        if (resolvedCallback) {
            if (CB.Promise._isPromisesAPlusCompliant) {
                try {
                    result = [resolvedCallback.apply(this, result)];
                } catch (e) {
                    result = [CB.Promise.error(e)];
                }
            } else {
                result = [resolvedCallback.apply(this, result)];
            }
        }
        if (result.length === 1 && CB.Promise.is(result[0])) {
            result[0].then(function() {
                promise.resolve.apply(promise, arguments);
            }, function(error) {
                promise.reject(error);
            });
        } else {
            promise.resolve.apply(promise, result);
        }
    };

    var wrappedRejectedCallback = function(error) {
        var result = [];
        if (rejectedCallback) {
            if (CB.Promise._isPromisesAPlusCompliant) {
                try {
                    result = [rejectedCallback(error)];
                } catch (e) {
                    result = [CB.Promise.error(e)];
                }
            } else {
                result = [rejectedCallback(error)];
            }
            if (result.length === 1 && CB.Promise.is(result[0])) {
                result[0].then(function() {
                    promise.resolve.apply(promise, arguments);
                }, function(error) {
                    promise.reject(error);
                });
            } else {
                if (CB.Promise._isPromisesAPlusCompliant) {
                    promise.resolve.apply(promise, result);
                } else {
                    promise.reject(result[0]);
                }
            }
        } else {
            promise.reject(error);
        }
    };

    var runLater = function(func) {
        func.call();
    };
    if (CB.Promise._isPromisesAPlusCompliant) {
        if (typeof(window) !== 'undefined' && window.setTimeout) {
            runLater = function(func) {
                window.setTimeout(func, 0);
            };
        } else if (typeof(process) !== 'undefined' && process.nextTick) {
            runLater = function(func) {
                process.nextTick(func);
            };
        }
    }

    var self = this;
    if (this._resolved) {
        runLater(function() {
            wrappedResolvedCallback.apply(self, self._result);
        });
    } else if (this._rejected) {
        runLater(function() {
            wrappedRejectedCallback(self._error);
        });
    } else {
        this._resolvedCallbacks.push(wrappedResolvedCallback);
        this._rejectedCallbacks.push(wrappedRejectedCallback);
    }

    return promise;
};

/**
 * Add handlers to be called when the promise
 * is either resolved or rejected
 */
CB.Promise.prototype["always"] = function(callback) {
    return this.then(callback, callback);
};

/**
 * Add handlers to be called when the Promise object is resolved
 */
CB.Promise.prototype["done"] = function(callback) {
    return this.then(callback);
};

/**
 * Add handlers to be called when the Promise object is rejected
 */
CB.Promise.prototype["fail"] = function(callback) {
    return this.then(null, callback);
};

/**
 * Run the given callbacks after this promise is fulfilled.
 * @param optionsOrCallback {} A Backbone-style options callback, or a
 * callback function. If this is an options object and contains a "model"
 * attributes, that will be passed to error callbacks as the first argument.
 * @param model {} If truthy, this will be passed as the first result of
 * error callbacks. This is for Backbone-compatability.
 * @return {CB.Promise} A promise that will be resolved after the
 * callbacks are run, with the same result as this.
 */
CB.clone = function(obj) {
    if (! Object.prototype.toString.call(obj) === "[object Object]") return obj;
    return (Object.prototype.toString.call(obj) === "[object Array]") ? obj.slice() : new Object(obj);
};

CB.Promise.prototype["_thenRunCallbacks"] = function(optionsOrCallback, model) {
    var options;
    if (Object.prototype.toString.call(optionsOrCallback) === "[object Function]") {
        var callback = optionsOrCallback;
        options = {
            success: function(result) {
                callback(result, null);
            },
            error: function(error) {
                callback(null, error);
            }
        };
    } else {
        options = CB.clone(optionsOrCallback);
    }
    options = options || {};

    return this.then(function(result) {
        if (options.success) {
            options.success.apply(this, arguments);
        } else if (model) {
            // When there's no callback, a sync event should be triggered.
            model.trigger('sync', model, result, options);
        }
        return CB.Promise.as.apply(CB.Promise, arguments);
    }, function(error) {
        if (options.error) {
            if (! typeof model === "undefined") {
                options.error(model, error);
            } else {
                options.error(error);
            }
        } else if (model) {
            // When there's no error callback, an error event should be triggered.
            model.trigger('error', model, error, options);
        }
        // By explicitly returning a rejected Promise, this will work with
        // either jQuery or Promises/A semantics.
        return CB.Promise.error(error);
    });
}

/**
 * Returns a new promise that is fulfilled when all of the input promises
 * are resolved. If any promise in the list fails, then the returned promise
 * will fail with the last error. If they all succeed, then the returned
 * promise will succeed, with the results being the results of all the input
 * promises. For example: <pre>
 *   var p1 = Parse.Promise.as(1);
 *   var p2 = Parse.Promise.as(2);
 *   var p3 = Parse.Promise.as(3);
 *
 *   Parse.Promise.when(p1, p2, p3).then(function(r1, r2, r3) {
     *     console.log(r1);  // prints 1
     *     console.log(r2);  // prints 2
     *     console.log(r3);  // prints 3
     *   });</pre>
 *
 * The input promises can also be specified as an array: <pre>
 *   var promises = [p1, p2, p3];
 *   Parse.Promise.when(promises).then(function(r1, r2, r3) {
     *     console.log(r1);  // prints 1
     *     console.log(r2);  // prints 2
     *     console.log(r3);  // prints 3
     *   });
 * </pre>
 * @method when
 * @param {Array} promises a list of promises to wait for.
 * @static
 * @return {Parse.Promise} the new promise.
 */
CB.Promise["all"] = function(promises) {
        var objects;
        if (Array.isArray(promises)) {
            objects = promises;
        } else {
            objects = arguments;
        }

        var total = objects.length;
        var hadError = false;
        var results = [];
        var errors = [];
        results.length = objects.length;
        errors.length = objects.length;

        if (total === 0) {
            return CB.Promise.as.apply(this, results);
        }

        var promise = new CB.Promise();

        var resolveOne = function resolveOne() {
            total--;
            if (total <= 0) {
                if (hadError) {
                    promise.reject(errors);
                } else {
                    promise.resolve(results);
                }
            }
        };

        var chain = function chain(object, index) {
            if (CB.Promise.is(object)) {
                object.then(function (result) {
                    results[index] = result;
                    resolveOne();
                }, function (error) {
                    errors[index] = error;
                    hadError = true;
                    resolveOne();
                });
            } else {
                results[i] = object;
                resolveOne();
            }
        };
        for (var i = 0; i < objects.length; i++) {
            chain(objects[i], i);
        }

        return promise;

};


CB.Events = {
    trigger: function(events) {
        var event, node, calls, tail, args, all, rest;
        if (!(calls = this._callbacks)) {
            return this;
        }
        all = calls.all;
        events = events.split(eventSplitter);
        rest = slice.call(arguments, 1);

        // For each event, walk through the linked list of callbacks twice,
        // first to trigger the event, then to trigger any `"all"` callbacks.
        event = events.shift();
        while (event) {
            node = calls[event];
            if (node) {
                tail = node.tail;
                while ((node = node.next) !== tail) {
                    node.callback.apply(node.context || this, rest);
                }
            }
            node = all;
            if (node) {
                tail = node.tail;
                args = [event].concat(rest);
                while ((node = node.next) !== tail) {
                    node.callback.apply(node.context || this, args);
                }
            }
            event = events.shift();
        }

        return this;
    }
}
/**
 * Adds a callback function that should be called regardless of whether
 * this promise failed or succeeded. The callback will be given either the
 * array of results for its first argument, or the error as its second,
 * depending on whether this Promise was rejected or resolved. Returns a
 * new Promise, like "then" would.
 * @param {Function} continuation the callback.
 */
CB.Promise.prototype["_continueWith"] = function(continuation) {
    return this.then(function() {
        return continuation(arguments, null);
    }, function(error) {
        return continuation(null, error);
    });
};

/* PRIVATE METHODS */
CB.toJSON = function(thisObj) {

    if(thisObj.constructor === Array){
        for(var i=0;i<thisObj.length;i++){
            thisObj[i] = CB.toJSON(thisObj[i]);
        }
        return thisObj;
    }

    var id = null;
    var columnName = null;
    var tableName = null;
    var latitude = null;
    var longitude = null;

    if(thisObj instanceof CB.CloudGeoPoint){
        latitude = thisObj.document.latitude;
        longitude = thisObj.document.longitude;
    }

    if(thisObj instanceof CB.CloudFile)
        id=thisObj.document._id;

    if(thisObj instanceof CB.Column)
        columnName=thisObj.document.name;

    if(thisObj instanceof CB.CloudQueue)
        tableName=thisObj.document.name;

    if(thisObj instanceof CB.CloudTable)
        tableName=thisObj.document.name;

     if(thisObj instanceof CB.CloudCache)
        tableName=thisObj.document.name;

    var obj= CB._clone(thisObj,id,latitude,longitude,tableName,columnName);

    if (!obj instanceof CB.CloudObject || !obj instanceof CB.CloudFile || !obj instanceof CB.CloudGeoPoint
        || !obj instanceof CB.CloudTable || !obj instanceof CB.Column || !obj instanceof CB.QueueMessage || !obj instanceof CB.CloudQueue || !obj instanceof CB.CloudCache) {
        throw "Data passed is not an instance of CloudObject or CloudFile or CloudGeoPoint";
    }

    if(obj instanceof CB.Column)
        return obj.document;

    if(obj instanceof CB.CloudGeoPoint)
        return obj.document;

    var doc = obj.document;

    for (var key in doc) {
        if (doc[key] instanceof CB.CloudObject || doc[key] instanceof CB.CloudFile
            || doc[key] instanceof CB.CloudGeoPoint  || doc[key] instanceof CB.Column || doc[key] instanceof CB.QueueMessage || doc[key] instanceof CB.CloudQueue || doc[key] instanceof CB.CloudCache) {
            //if something is a relation.
            doc[key] = CB.toJSON(doc[key]); //serialize this object.
        } else if (key === 'ACL') {
            //if this is an ACL, then. Convert this from CB.ACL object to JSON - to strip all the ACL Methods.
            var acl = doc[key].document;
            doc[key] = acl;
        } else if (doc[key] instanceof Array) {
            //if this is an array.
            //then check if this is an array of CloudObjects, if yes, then serialize every CloudObject.
            if (doc[key][0] && (doc[key][0] instanceof CB.CloudObject || doc[key][0] instanceof CB.CloudFile
                || doc[key][0] instanceof CB.CloudGeoPoint || doc[key][0] instanceof CB.Column || doc[key][0] instanceof CB.QueueMessage || doc[key][0] instanceof CB.CloudQueue || doc[key][0] instanceof CB.CloudCache )) {
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

        if (data[0] && data[0] instanceof Object) {

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
            if(data[key] instanceof Array) {
                document[key]=CB.fromJSON(data[key]);
            }else if (data[key] instanceof Object) {
                if (key === 'ACL') {
                    //this is an ACL.
                    document[key] = new CB.ACL();
                    document[key].document= data[key];

                } else if(data[key]._type) {
                    if(thisObj)
                        document[key] = CB.fromJSON(data[key], thisObj.get(key));
                    else
                        document[key] = CB.fromJSON(data[key]);
                }else{
                    document[key] = data[key];
                }
            }else {
                document[key] = data[key];
            }
        }

        if(!thisObj){
            var id=null;
            var latitude = null;
            var longitude = null;
            var name = null;
            if(document._type === "file")
                id=document._id;
            if(document._type === "point"){
                latitude = document.latitude;
                longitude = document.longitude;
            }
            if(document._type === "table"){
                name = document.name;
            }
            if(document._type === "column"){
                name = document.name;
            }
            if(document._type === "queue"){
                name = document.name;
            }
            if(document._type === "cache"){
                name = document.name;
            }
            var obj = CB._getObjectByType(document._type,id,latitude,longitude,name);
            obj.document = document;

            thisObj = obj;
        }else{
            thisObj.document = document;
        }

        if(thisObj instanceof CB.CloudObject || thisObj instanceof CB.CloudUser || thisObj instanceof CB.CloudRole || thisObj instanceof CB.CloudQueue || thisObj instanceof CB.QueueMessage || thisObj instanceof CB.CloudFile || thisObj instanceof CB.CloudCache){
            //activate ACL.
            if(thisObj.document["ACL"])
                thisObj.document["ACL"].parent = thisObj;
        }

        return thisObj;

    }else {
        //if this is plain json.
        return data;
    }
};

CB._getObjectByType = function(type,id,latitude,longitude,name){

    var obj = null;

    if (type === 'custom') {
        obj = new CB.CloudObject();
    }

    if (type === 'queue') {
        //tablename is queue name in this instance.
        obj = new CB.CloudQueue(name);
    }

    if (type === 'queue-message') {
        obj = new CB.QueueMessage();
    }

    if (type === 'cache') {
        obj = new CB.CloudCache(name);
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

    if(type === 'point'){
        obj = new CB.CloudGeoPoint(latitude,longitude);
    }

    if(type === 'table'){
        obj = new CB.CloudTable(name);
    }

    if(type === 'column'){
        obj = new CB.Column(name);
    }

    return obj;
};


CB._validate = function() {
    if (!CB.appId) {
        throw "AppID is null. Please use CB.CloudApp.init to initialize your app.";
    }

    if(!CB.appKey){
        throw "AppKey is null. Please use CB.CloudApp.init to initialize your app.";
    }
};


//to check if its running under node, If yes - then export CB.
(function () {
    // Establish the root object, `window` in the browser, or `global` on the server.
    var root = this;
    // Create a reference to this
    var _ = new Object();
})();

function _all(arrayOfPromises) {
    //this is simplilar to Q.all for jQuery promises.
    return jQuery.when.apply(jQuery, arrayOfPromises).then(function() {
        return Array.prototype.slice.call(arguments, 0);
    });
};

if(CB._isNode){
    module.exports = {};
    module.exports = CB;
}


CB._clone=function(obj,id,latitude,longitude,tableName,columnName){
    var n_obj = {};
    if(obj.document._type && obj.document._type != 'point') {
        n_obj = CB._getObjectByType(obj.document._type,id,latitude,longitude,tableName,columnName);
        var doc=obj.document;
        var doc2={};
        for (var key in doc) {
            if(doc[key] instanceof CB.CloudFile)
                doc2[key]=CB._clone(doc[key],doc[key].document._id);
            else if(doc[key] instanceof CB.CloudObject){
                doc2[key]=CB._clone(doc[key],null);
            }else if(doc[key] instanceof CB.CloudQueue){
                doc2[key]=CB._clone(doc[key],null);
            }else if(doc[key] instanceof CB.QueueMessage){
                doc2[key]=CB._clone(doc[key],null);
            }else if(doc[key] instanceof CB.CloudGeoPoint){
                doc2[key]=CB._clone(doc[key], null);
            }else if(doc[key] instanceof CB.CloudCache){
                doc2[key]=CB._clone(doc[key], null);
            }
            else
                doc2[key]=doc[key];
        }
    }else if(obj instanceof CB.CloudGeoPoint){
        n_obj = new CB.CloudGeoPoint(obj.get('longitude'),obj.get('latitude'));
        return n_obj;
    }

    n_obj.document=doc2;

    return n_obj;
};

CB._request=function(method,url,params,isServiceUrl,isFile, progressCallback)
{

    CB._validate();

    if(!params)
        params = {};

    params.sdk = "JavaScript";

    if(!CB.CloudApp._isConnected)
        throw "Your CloudApp is disconnected. Please use CB.CloudApp.connect() and try again.";

    var def = new CB.Promise();
    var xmlhttp= CB._loadXml();
    if (CB._isNode) {
        var LocalStorage = require('node-localstorage').LocalStorage;
        localStorage = new LocalStorage('./scratch');
    }
    xmlhttp.open(method,url,true);
    if(!isFile) {
        xmlhttp.setRequestHeader('Content-Type', 'text/plain');
    }

    if(progressCallback){
        if(typeof(xmlhttp.upload)!=="undefined"){
            xmlhttp.upload.addEventListener("progress", function(evt){
              if (evt.lengthComputable) {  
                var percentComplete = evt.loaded / evt.total;            
                progressCallback(percentComplete);
              }
            }, false); 
        }        
    }

    if(!isServiceUrl){
        var ssid = CB._getSessionId();
        if(ssid != null)
            xmlhttp.setRequestHeader('sessionID', ssid);
    }
    if(CB._isNode){
        xmlhttp.setRequestHeader("User-Agent","CB/" + CB.version + " (NodeJS " + process.versions.node + ")");

        if(params && typeof params ==="object"){
            params=JSON.stringify(params);
        }
    }
    if(params)
        xmlhttp.send(params);
    else
        xmlhttp.send();
    xmlhttp.onreadystatechange = function() {
        if (xmlhttp.readyState == xmlhttp.DONE) {
            if (xmlhttp.status == 200) {
                if(!isServiceUrl){
                    var sessionID = xmlhttp.getResponseHeader('sessionID');
                    if(sessionID)
                        localStorage.setItem('sessionID', sessionID);
                    else
                        localStorage.removeItem('sessionID');
                }
                def.resolve(xmlhttp.responseText);
            } else {                
                def.reject(xmlhttp.responseText);
            }
        }
    };
    return def;
};

CB._getSessionId = function() {
    return localStorage.getItem('sessionID');
}

CB._columnValidation = function(column, cloudtable){
  var defaultColumn = ['id', 'createdAt', 'updatedAt', 'ACL'];
  if(cloudtable.document.type == 'user'){
    defaultColumn.concat(['username', 'email', 'password', 'roles']);
  }else if(cloudtable.document.type == 'role'){
    defaultColumn.push('name');
  }

  var index = defaultColumn.indexOf(column.name.toLowerCase());
  if(index === -1)
    return true;
  else
    return false;
};

CB._tableValidation = function(tableName){

  if(!tableName) //if table name is empty
    throw "table name cannot be empty";

  if(!isNaN(tableName[0]))
    throw "table name should not start with a number";

  if(!tableName.match(/^\S+$/))
    throw "table name should not contain spaces";

  var pattern = new RegExp(/[~`!#$%\^&*+=\-\[\]\\';,/{}|\\":<>\?]/);
  if(pattern.test(tableName))
    throw "table not shoul not contain special characters";

};

CB._modified = function(thisObj,columnName){
    thisObj.document._isModified = true;
    if(thisObj.document._modifiedColumns) {
        if (thisObj.document._modifiedColumns.indexOf(columnName) === -1) {
            thisObj.document._modifiedColumns.push(columnName);
        }
    }else{
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

CB._columnNameValidation = function(columnName){

///  var defaultColumn = ['id','createdAt', 'updatedAt', 'ACL'];

  if(!columnName) //if table name is empty
    throw "table name cannot be empty";

  /*var index = defaultColumn.indexOf(columnName.toLowerCase());
  if(index >= 0)
    throw "this column name is already in use";
*/
  if(!isNaN(columnName[0]))
    throw "column name should not start with a number";

  if(!columnName.match(/^\S+$/))
    throw "column name should not contain spaces";

  var pattern = new RegExp(/[~`!#$%\^&*+=\-\[\]\\';,/{}|\\":<>\?]/);
  if(pattern.test(columnName))
    throw "column name not should not contain special characters";
};

CB._columnDataTypeValidation = function(dataType){

  if(!dataType)
    throw "data type cannot be empty";

  var dataTypeList = ['Text', 'Email', 'URL', 'Number', 'Boolean', 'DateTime', 'GeoPoint', 'File', 'List', 'Relation', 'Object','EncryptedText'];
  var index = dataTypeList.indexOf(dataType);
  if(index < 0)
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

    var col = [id,expires,updatedAt,createdAt,ACL];
    if (type === "custom") {
        return col;
    }else if (type === "user"){
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

        col.push(username);
        col.push(roles);
        col.push(password);
        col.push(email);
        col.push(socialAuth);
        return col;
    }else if(type === "role") {
        var name = new CB.Column('name');
        name.dataType = 'Text';
        name.unique = true;
        name.required = true;
        name.document.isDeletable = false;
        name.document.isEditable = false;
        col.push(name);
        return col;
    }else if(type === "device") {
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

CB._fileCheck = function(obj){

    //obj is an instance of CloudObject.
    var deferred = new CB.Promise();
    var promises = [];
    for(var key in obj.document){
        if(obj.document[key] instanceof Array && obj.document[key][0] instanceof CB.CloudFile){
            for(var i=0;i<obj.document[key].length;i++){
                if(!obj.document[key][i].id)
                    promises.push(obj.document[key][i].save());
            }
        }else if(obj.document[key] instanceof Object && obj.document[key] instanceof CB.CloudFile){
            if(!obj.document[key].id)
                promises.push(obj.document[key].save());
        }
    }
    if(promises.length >0) {
        CB.Promise.all(promises).then(function () {
            var res = arguments;
            var j = 0;
            for (var key in obj.document) {
                if (obj.document[key] instanceof Array && obj.document[key][0] instanceof CB.CloudFile) {
                    for (var i = 0; i < obj.document[key].length; i++) {
                        if(!obj.document[key][i].id) {
                            obj.document[key][i] = res[j];
                            j = j + 1;
                        }
                    }
                } else if (obj.document[key] instanceof Object && obj.document[key] instanceof CB.CloudFile) {
                    if(!obj.document[key].id) {
                        obj.document[key] = res[j];
                        j = j + 1;
                    }
                }
            }
            deferred.resolve(obj);
        }, function (err) {
            deferred.reject(err);
        });
    }else{
        deferred.resolve(obj);
    }
    return deferred;
};

CB._bulkObjFileCheck = function(array){
    var deferred = new CB.Promise();
    var promises = [];
    for(var i=0;i<array.length;i++){
        promises.push(CB._fileCheck(array[i]));
    }
    CB.Promise.all(promises).then(function(){
        deferred.resolve(arguments);
    },function(err){
        deferred.reject(err);
    });
    return deferred;
};

CB._generateHash = function(){
    var hash="";
    var possible="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for(i=0;i<8;i++)
    {
        hash=hash+possible.charAt(Math.floor(Math.random()*possible.length));
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
}

//Description : This fucntion get the content of the cookie .
//Params : @name : Name of the cookie.
//Returns : content as string.  
CB._getCookie = function(name) {
    if(typeof(Storage) !== "undefined") {
        // Code for localStorage/sessionStorage.
        if(new Date(localStorage.getItem(name+"_expires"))>new Date()){
            return localStorage.getItem(name);
        }else{
            CB._deleteCookie(name);
        }
    } else {
        // Sorry! No Web Storage support..       
        if(typeof(document) !== 'undefined') {
            var name = name + "=";
            var ca = document.cookie.split(';');
            for(var i=0; i<ca.length; i++) {
                var c = ca[i];
                while (c.charAt(0)==' ') c = c.substring(1);
                if (c.indexOf(name) == 0) return c.substring(name.length,c.length);
            }
            return "";
        }        
    }
    
}

//Description : Deletes the cookie
//Params : @name : Name of the cookie.
//Returns : void
CB._deleteCookie = function(name){
    //save the user to the cookie. 
    if(typeof(Storage) !== "undefined") {
        // Code for localStorage/sessionStorage.
        localStorage.removeItem(name);
        localStorage.removeItem(name+"_expires");
    } else {
        if(typeof(document) !== 'undefined'){
            var d = new Date();
            d.setTime(d.getTime() + (0*0*0*0*0));
            var expires = "expires="+d.toUTCString();
            document.cookie =  name+ "=" +  + "; " + expires;
        }
    }
}

//Description : Creates cookie. 
//Params : @name : Name of the cookie.
//         @content : Content as string / JSON / int / etc. 
//         @expires : Expiration time in millisecinds.
//Returns : content as string.  
CB._createCookie = function(name, content, expires){
    var d = new Date();
    d.setTime(d.getTime() + (expires));
    if(typeof(Storage) !== "undefined") {
        // Code for localStorage/sessionStorage.
        localStorage.setItem(name,content.toString());
        localStorage.setItem(name+"_expires",d);
    } else {
        if(typeof(document) !== 'undefined'){
            
            var expires = "expires="+d.toUTCString();
            document.cookie =  + name+"=" + content.toString() + "; " + expires;
        }
    }
}

//Description : returns query string. 
//Params : @key : key         
//Returns : query string.  
CB._getQuerystringByKey = function(key){
    key = key.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
    var regex = new RegExp("[\\?&]" + key + "=([^&#]*)"),
    results = regex.exec(location.search);
    return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
}
if(!CB._isNode) {
	//Socket.io Client library 
	(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.io = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(_dereq_,module,exports){

module.exports =  _dereq_('./lib/');

},{"./lib/":2}],2:[function(_dereq_,module,exports){

module.exports = _dereq_('./socket');

/**
 * Exports parser
 *
 * @api public
 *
 */
module.exports.parser = _dereq_('engine.io-parser');

},{"./socket":3,"engine.io-parser":19}],3:[function(_dereq_,module,exports){
(function (global){
/**
 * Module dependencies.
 */

var transports = _dereq_('./transports');
var Emitter = _dereq_('component-emitter');
var debug = _dereq_('debug')('engine.io-client:socket');
var index = _dereq_('indexof');
var parser = _dereq_('engine.io-parser');
var parseuri = _dereq_('parseuri');
var parsejson = _dereq_('parsejson');
var parseqs = _dereq_('parseqs');

/**
 * Module exports.
 */

module.exports = Socket;

/**
 * Noop function.
 *
 * @api private
 */

function noop(){}

/**
 * Socket constructor.
 *
 * @param {String|Object} uri or options
 * @param {Object} options
 * @api public
 */

function Socket(uri, opts){
  if (!(this instanceof Socket)) return new Socket(uri, opts);

  opts = opts || {};

  if (uri && 'object' == typeof uri) {
    opts = uri;
    uri = null;
  }

  if (uri) {
    uri = parseuri(uri);
    opts.hostname = uri.host;
    opts.secure = uri.protocol == 'https' || uri.protocol == 'wss';
    opts.port = uri.port;
    if (uri.query) opts.query = uri.query;
  } else if (opts.host) {
    opts.hostname = parseuri(opts.host).host;
  }

  this.secure = null != opts.secure ? opts.secure :
    (global.location && 'https:' == location.protocol);

  if (opts.hostname && !opts.port) {
    // if no port is specified manually, use the protocol default
    opts.port = this.secure ? '443' : '80';
  }

  this.agent = opts.agent || false;
  this.hostname = opts.hostname ||
    (global.location ? location.hostname : 'localhost');
  this.port = opts.port || (global.location && location.port ?
       location.port :
       (this.secure ? 443 : 80));
  this.query = opts.query || {};
  if ('string' == typeof this.query) this.query = parseqs.decode(this.query);
  this.upgrade = false !== opts.upgrade;
  this.path = (opts.path || '/engine.io').replace(/\/$/, '') + '/';
  this.forceJSONP = !!opts.forceJSONP;
  this.jsonp = false !== opts.jsonp;
  this.forceBase64 = !!opts.forceBase64;
  this.enablesXDR = !!opts.enablesXDR;
  this.timestampParam = opts.timestampParam || 't';
  this.timestampRequests = opts.timestampRequests;
  this.transports = opts.transports || ['polling', 'websocket'];
  this.readyState = '';
  this.writeBuffer = [];
  this.policyPort = opts.policyPort || 843;
  this.rememberUpgrade = opts.rememberUpgrade || false;
  this.binaryType = null;
  this.onlyBinaryUpgrades = opts.onlyBinaryUpgrades;
  this.perMessageDeflate = false !== opts.perMessageDeflate ? (opts.perMessageDeflate || {}) : false;

  if (true === this.perMessageDeflate) this.perMessageDeflate = {};
  if (this.perMessageDeflate && null == this.perMessageDeflate.threshold) {
    this.perMessageDeflate.threshold = 1024;
  }

  // SSL options for Node.js client
  this.pfx = opts.pfx || null;
  this.key = opts.key || null;
  this.passphrase = opts.passphrase || null;
  this.cert = opts.cert || null;
  this.ca = opts.ca || null;
  this.ciphers = opts.ciphers || null;
  this.rejectUnauthorized = opts.rejectUnauthorized === undefined ? null : opts.rejectUnauthorized;

  // other options for Node.js client
  var freeGlobal = typeof global == 'object' && global;
  if (freeGlobal.global === freeGlobal) {
    if (opts.extraHeaders && Object.keys(opts.extraHeaders).length > 0) {
      this.extraHeaders = opts.extraHeaders;
    }
  }

  this.open();
}

Socket.priorWebsocketSuccess = false;

/**
 * Mix in `Emitter`.
 */

Emitter(Socket.prototype);

/**
 * Protocol version.
 *
 * @api public
 */

Socket.protocol = parser.protocol; // this is an int

/**
 * Expose deps for legacy compatibility
 * and standalone browser access.
 */

Socket.Socket = Socket;
Socket.Transport = _dereq_('./transport');
Socket.transports = _dereq_('./transports');
Socket.parser = _dereq_('engine.io-parser');

/**
 * Creates transport of the given type.
 *
 * @param {String} transport name
 * @return {Transport}
 * @api private
 */

Socket.prototype.createTransport = function (name) {
  debug('creating transport "%s"', name);
  var query = clone(this.query);

  // append engine.io protocol identifier
  query.EIO = parser.protocol;

  // transport name
  query.transport = name;

  // session id if we already have one
  if (this.id) query.sid = this.id;

  var transport = new transports[name]({
    agent: this.agent,
    hostname: this.hostname,
    port: this.port,
    secure: this.secure,
    path: this.path,
    query: query,
    forceJSONP: this.forceJSONP,
    jsonp: this.jsonp,
    forceBase64: this.forceBase64,
    enablesXDR: this.enablesXDR,
    timestampRequests: this.timestampRequests,
    timestampParam: this.timestampParam,
    policyPort: this.policyPort,
    socket: this,
    pfx: this.pfx,
    key: this.key,
    passphrase: this.passphrase,
    cert: this.cert,
    ca: this.ca,
    ciphers: this.ciphers,
    rejectUnauthorized: this.rejectUnauthorized,
    perMessageDeflate: this.perMessageDeflate,
    extraHeaders: this.extraHeaders
  });

  return transport;
};

function clone (obj) {
  var o = {};
  for (var i in obj) {
    if (obj.hasOwnProperty(i)) {
      o[i] = obj[i];
    }
  }
  return o;
}

/**
 * Initializes transport to use and starts probe.
 *
 * @api private
 */
Socket.prototype.open = function () {
  var transport;
  if (this.rememberUpgrade && Socket.priorWebsocketSuccess && this.transports.indexOf('websocket') != -1) {
    transport = 'websocket';
  } else if (0 === this.transports.length) {
    // Emit error on next tick so it can be listened to
    var self = this;
    setTimeout(function() {
      self.emit('error', 'No transports available');
    }, 0);
    return;
  } else {
    transport = this.transports[0];
  }
  this.readyState = 'opening';

  // Retry with the next transport if the transport is disabled (jsonp: false)
  try {
    transport = this.createTransport(transport);
  } catch (e) {
    this.transports.shift();
    this.open();
    return;
  }

  transport.open();
  this.setTransport(transport);
};

/**
 * Sets the current transport. Disables the existing one (if any).
 *
 * @api private
 */

Socket.prototype.setTransport = function(transport){
  debug('setting transport %s', transport.name);
  var self = this;

  if (this.transport) {
    debug('clearing existing transport %s', this.transport.name);
    this.transport.removeAllListeners();
  }

  // set up transport
  this.transport = transport;

  // set up transport listeners
  transport
  .on('drain', function(){
    self.onDrain();
  })
  .on('packet', function(packet){
    self.onPacket(packet);
  })
  .on('error', function(e){
    self.onError(e);
  })
  .on('close', function(){
    self.onClose('transport close');
  });
};

/**
 * Probes a transport.
 *
 * @param {String} transport name
 * @api private
 */

Socket.prototype.probe = function (name) {
  debug('probing transport "%s"', name);
  var transport = this.createTransport(name, { probe: 1 })
    , failed = false
    , self = this;

  Socket.priorWebsocketSuccess = false;

  function onTransportOpen(){
    if (self.onlyBinaryUpgrades) {
      var upgradeLosesBinary = !this.supportsBinary && self.transport.supportsBinary;
      failed = failed || upgradeLosesBinary;
    }
    if (failed) return;

    debug('probe transport "%s" opened', name);
    transport.send([{ type: 'ping', data: 'probe' }]);
    transport.once('packet', function (msg) {
      if (failed) return;
      if ('pong' == msg.type && 'probe' == msg.data) {
        debug('probe transport "%s" pong', name);
        self.upgrading = true;
        self.emit('upgrading', transport);
        if (!transport) return;
        Socket.priorWebsocketSuccess = 'websocket' == transport.name;

        debug('pausing current transport "%s"', self.transport.name);
        self.transport.pause(function () {
          if (failed) return;
          if ('closed' == self.readyState) return;
          debug('changing transport and sending upgrade packet');

          cleanup();

          self.setTransport(transport);
          transport.send([{ type: 'upgrade' }]);
          self.emit('upgrade', transport);
          transport = null;
          self.upgrading = false;
          self.flush();
        });
      } else {
        debug('probe transport "%s" failed', name);
        var err = new Error('probe error');
        err.transport = transport.name;
        self.emit('upgradeError', err);
      }
    });
  }

  function freezeTransport() {
    if (failed) return;

    // Any callback called by transport should be ignored since now
    failed = true;

    cleanup();

    transport.close();
    transport = null;
  }

  //Handle any error that happens while probing
  function onerror(err) {
    var error = new Error('probe error: ' + err);
    error.transport = transport.name;

    freezeTransport();

    debug('probe transport "%s" failed because of error: %s', name, err);

    self.emit('upgradeError', error);
  }

  function onTransportClose(){
    onerror("transport closed");
  }

  //When the socket is closed while we're probing
  function onclose(){
    onerror("socket closed");
  }

  //When the socket is upgraded while we're probing
  function onupgrade(to){
    if (transport && to.name != transport.name) {
      debug('"%s" works - aborting "%s"', to.name, transport.name);
      freezeTransport();
    }
  }

  //Remove all listeners on the transport and on self
  function cleanup(){
    transport.removeListener('open', onTransportOpen);
    transport.removeListener('error', onerror);
    transport.removeListener('close', onTransportClose);
    self.removeListener('close', onclose);
    self.removeListener('upgrading', onupgrade);
  }

  transport.once('open', onTransportOpen);
  transport.once('error', onerror);
  transport.once('close', onTransportClose);

  this.once('close', onclose);
  this.once('upgrading', onupgrade);

  transport.open();

};

/**
 * Called when connection is deemed open.
 *
 * @api public
 */

Socket.prototype.onOpen = function () {
  debug('socket open');
  this.readyState = 'open';
  Socket.priorWebsocketSuccess = 'websocket' == this.transport.name;
  this.emit('open');
  this.flush();

  // we check for `readyState` in case an `open`
  // listener already closed the socket
  if ('open' == this.readyState && this.upgrade && this.transport.pause) {
    debug('starting upgrade probes');
    for (var i = 0, l = this.upgrades.length; i < l; i++) {
      this.probe(this.upgrades[i]);
    }
  }
};

/**
 * Handles a packet.
 *
 * @api private
 */

Socket.prototype.onPacket = function (packet) {
  if ('opening' == this.readyState || 'open' == this.readyState) {
    debug('socket receive: type "%s", data "%s"', packet.type, packet.data);

    this.emit('packet', packet);

    // Socket is live - any packet counts
    this.emit('heartbeat');

    switch (packet.type) {
      case 'open':
        this.onHandshake(parsejson(packet.data));
        break;

      case 'pong':
        this.setPing();
        this.emit('pong');
        break;

      case 'error':
        var err = new Error('server error');
        err.code = packet.data;
        this.onError(err);
        break;

      case 'message':
        this.emit('data', packet.data);
        this.emit('message', packet.data);
        break;
    }
  } else {
    debug('packet received with socket readyState "%s"', this.readyState);
  }
};

/**
 * Called upon handshake completion.
 *
 * @param {Object} handshake obj
 * @api private
 */

Socket.prototype.onHandshake = function (data) {
  this.emit('handshake', data);
  this.id = data.sid;
  this.transport.query.sid = data.sid;
  this.upgrades = this.filterUpgrades(data.upgrades);
  this.pingInterval = data.pingInterval;
  this.pingTimeout = data.pingTimeout;
  this.onOpen();
  // In case open handler closes socket
  if  ('closed' == this.readyState) return;
  this.setPing();

  // Prolong liveness of socket on heartbeat
  this.removeListener('heartbeat', this.onHeartbeat);
  this.on('heartbeat', this.onHeartbeat);
};

/**
 * Resets ping timeout.
 *
 * @api private
 */

Socket.prototype.onHeartbeat = function (timeout) {
  clearTimeout(this.pingTimeoutTimer);
  var self = this;
  self.pingTimeoutTimer = setTimeout(function () {
    if ('closed' == self.readyState) return;
    self.onClose('ping timeout');
  }, timeout || (self.pingInterval + self.pingTimeout));
};

/**
 * Pings server every `this.pingInterval` and expects response
 * within `this.pingTimeout` or closes connection.
 *
 * @api private
 */

Socket.prototype.setPing = function () {
  var self = this;
  clearTimeout(self.pingIntervalTimer);
  self.pingIntervalTimer = setTimeout(function () {
    debug('writing ping packet - expecting pong within %sms', self.pingTimeout);
    self.ping();
    self.onHeartbeat(self.pingTimeout);
  }, self.pingInterval);
};

/**
* Sends a ping packet.
*
* @api private
*/

Socket.prototype.ping = function () {
  var self = this;
  this.sendPacket('ping', function(){
    self.emit('ping');
  });
};

/**
 * Called on `drain` event
 *
 * @api private
 */

Socket.prototype.onDrain = function() {
  this.writeBuffer.splice(0, this.prevBufferLen);

  // setting prevBufferLen = 0 is very important
  // for example, when upgrading, upgrade packet is sent over,
  // and a nonzero prevBufferLen could cause problems on `drain`
  this.prevBufferLen = 0;

  if (0 === this.writeBuffer.length) {
    this.emit('drain');
  } else {
    this.flush();
  }
};

/**
 * Flush write buffers.
 *
 * @api private
 */

Socket.prototype.flush = function () {
  if ('closed' != this.readyState && this.transport.writable &&
    !this.upgrading && this.writeBuffer.length) {
    debug('flushing %d packets in socket', this.writeBuffer.length);
    this.transport.send(this.writeBuffer);
    // keep track of current length of writeBuffer
    // splice writeBuffer and callbackBuffer on `drain`
    this.prevBufferLen = this.writeBuffer.length;
    this.emit('flush');
  }
};

/**
 * Sends a message.
 *
 * @param {String} message.
 * @param {Function} callback function.
 * @param {Object} options.
 * @return {Socket} for chaining.
 * @api public
 */

Socket.prototype.write =
Socket.prototype.send = function (msg, options, fn) {
  this.sendPacket('message', msg, options, fn);
  return this;
};

/**
 * Sends a packet.
 *
 * @param {String} packet type.
 * @param {String} data.
 * @param {Object} options.
 * @param {Function} callback function.
 * @api private
 */

Socket.prototype.sendPacket = function (type, data, options, fn) {
  if('function' == typeof data) {
    fn = data;
    data = undefined;
  }

  if ('function' == typeof options) {
    fn = options;
    options = null;
  }

  if ('closing' == this.readyState || 'closed' == this.readyState) {
    return;
  }

  options = options || {};
  options.compress = false !== options.compress;

  var packet = {
    type: type,
    data: data,
    options: options
  };
  this.emit('packetCreate', packet);
  this.writeBuffer.push(packet);
  if (fn) this.once('flush', fn);
  this.flush();
};

/**
 * Closes the connection.
 *
 * @api private
 */

Socket.prototype.close = function () {
  if ('opening' == this.readyState || 'open' == this.readyState) {
    this.readyState = 'closing';

    var self = this;

    if (this.writeBuffer.length) {
      this.once('drain', function() {
        if (this.upgrading) {
          waitForUpgrade();
        } else {
          close();
        }
      });
    } else if (this.upgrading) {
      waitForUpgrade();
    } else {
      close();
    }
  }

  function close() {
    self.onClose('forced close');
    debug('socket closing - telling transport to close');
    self.transport.close();
  }

  function cleanupAndClose() {
    self.removeListener('upgrade', cleanupAndClose);
    self.removeListener('upgradeError', cleanupAndClose);
    close();
  }

  function waitForUpgrade() {
    // wait for upgrade to finish since we can't send packets while pausing a transport
    self.once('upgrade', cleanupAndClose);
    self.once('upgradeError', cleanupAndClose);
  }

  return this;
};

/**
 * Called upon transport error
 *
 * @api private
 */

Socket.prototype.onError = function (err) {
  debug('socket error %j', err);
  Socket.priorWebsocketSuccess = false;
  this.emit('error', err);
  this.onClose('transport error', err);
};

/**
 * Called upon transport close.
 *
 * @api private
 */

Socket.prototype.onClose = function (reason, desc) {
  if ('opening' == this.readyState || 'open' == this.readyState || 'closing' == this.readyState) {
    debug('socket close with reason: "%s"', reason);
    var self = this;

    // clear timers
    clearTimeout(this.pingIntervalTimer);
    clearTimeout(this.pingTimeoutTimer);

    // stop event from firing again for transport
    this.transport.removeAllListeners('close');

    // ensure transport won't stay open
    this.transport.close();

    // ignore further transport communication
    this.transport.removeAllListeners();

    // set ready state
    this.readyState = 'closed';

    // clear session id
    this.id = null;

    // emit close event
    this.emit('close', reason, desc);

    // clean buffers after, so users can still
    // grab the buffers on `close` event
    self.writeBuffer = [];
    self.prevBufferLen = 0;
  }
};

/**
 * Filters upgrades, returning only those matching client transports.
 *
 * @param {Array} server upgrades
 * @api private
 *
 */

Socket.prototype.filterUpgrades = function (upgrades) {
  var filteredUpgrades = [];
  for (var i = 0, j = upgrades.length; i<j; i++) {
    if (~index(this.transports, upgrades[i])) filteredUpgrades.push(upgrades[i]);
  }
  return filteredUpgrades;
};

}).call(this,typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : typeof global !== "undefined" ? global : {})
},{"./transport":4,"./transports":5,"component-emitter":15,"debug":17,"engine.io-parser":19,"indexof":23,"parsejson":26,"parseqs":27,"parseuri":28}],4:[function(_dereq_,module,exports){
/**
 * Module dependencies.
 */

var parser = _dereq_('engine.io-parser');
var Emitter = _dereq_('component-emitter');

/**
 * Module exports.
 */

module.exports = Transport;

/**
 * Transport abstract constructor.
 *
 * @param {Object} options.
 * @api private
 */

function Transport (opts) {
  this.path = opts.path;
  this.hostname = opts.hostname;
  this.port = opts.port;
  this.secure = opts.secure;
  this.query = opts.query;
  this.timestampParam = opts.timestampParam;
  this.timestampRequests = opts.timestampRequests;
  this.readyState = '';
  this.agent = opts.agent || false;
  this.socket = opts.socket;
  this.enablesXDR = opts.enablesXDR;

  // SSL options for Node.js client
  this.pfx = opts.pfx;
  this.key = opts.key;
  this.passphrase = opts.passphrase;
  this.cert = opts.cert;
  this.ca = opts.ca;
  this.ciphers = opts.ciphers;
  this.rejectUnauthorized = opts.rejectUnauthorized;

  // other options for Node.js client
  this.extraHeaders = opts.extraHeaders;
}

/**
 * Mix in `Emitter`.
 */

Emitter(Transport.prototype);

/**
 * Emits an error.
 *
 * @param {String} str
 * @return {Transport} for chaining
 * @api public
 */

Transport.prototype.onError = function (msg, desc) {
  var err = new Error(msg);
  err.type = 'TransportError';
  err.description = desc;
  this.emit('error', err);
  return this;
};

/**
 * Opens the transport.
 *
 * @api public
 */

Transport.prototype.open = function () {
  if ('closed' == this.readyState || '' == this.readyState) {
    this.readyState = 'opening';
    this.doOpen();
  }

  return this;
};

/**
 * Closes the transport.
 *
 * @api private
 */

Transport.prototype.close = function () {
  if ('opening' == this.readyState || 'open' == this.readyState) {
    this.doClose();
    this.onClose();
  }

  return this;
};

/**
 * Sends multiple packets.
 *
 * @param {Array} packets
 * @api private
 */

Transport.prototype.send = function(packets){
  if ('open' == this.readyState) {
    this.write(packets);
  } else {
    throw new Error('Transport not open');
  }
};

/**
 * Called upon open
 *
 * @api private
 */

Transport.prototype.onOpen = function () {
  this.readyState = 'open';
  this.writable = true;
  this.emit('open');
};

/**
 * Called with data.
 *
 * @param {String} data
 * @api private
 */

Transport.prototype.onData = function(data){
  var packet = parser.decodePacket(data, this.socket.binaryType);
  this.onPacket(packet);
};

/**
 * Called with a decoded packet.
 */

Transport.prototype.onPacket = function (packet) {
  this.emit('packet', packet);
};

/**
 * Called upon close.
 *
 * @api private
 */

Transport.prototype.onClose = function () {
  this.readyState = 'closed';
  this.emit('close');
};

},{"component-emitter":15,"engine.io-parser":19}],5:[function(_dereq_,module,exports){
(function (global){
/**
 * Module dependencies
 */

var XMLHttpRequest = _dereq_('xmlhttprequest-ssl');
var XHR = _dereq_('./polling-xhr');
var JSONP = _dereq_('./polling-jsonp');
var websocket = _dereq_('./websocket');

/**
 * Export transports.
 */

exports.polling = polling;
exports.websocket = websocket;

/**
 * Polling transport polymorphic constructor.
 * Decides on xhr vs jsonp based on feature detection.
 *
 * @api private
 */

function polling(opts){
  var xhr;
  var xd = false;
  var xs = false;
  var jsonp = false !== opts.jsonp;

  if (global.location) {
    var isSSL = 'https:' == location.protocol;
    var port = location.port;

    // some user agents have empty `location.port`
    if (!port) {
      port = isSSL ? 443 : 80;
    }

    xd = opts.hostname != location.hostname || port != opts.port;
    xs = opts.secure != isSSL;
  }

  opts.xdomain = xd;
  opts.xscheme = xs;
  xhr = new XMLHttpRequest(opts);

  if ('open' in xhr && !opts.forceJSONP) {
    return new XHR(opts);
  } else {
    if (!jsonp) throw new Error('JSONP disabled');
    return new JSONP(opts);
  }
}

}).call(this,typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : typeof global !== "undefined" ? global : {})
},{"./polling-jsonp":6,"./polling-xhr":7,"./websocket":9,"xmlhttprequest-ssl":10}],6:[function(_dereq_,module,exports){
(function (global){

/**
 * Module requirements.
 */

var Polling = _dereq_('./polling');
var inherit = _dereq_('component-inherit');

/**
 * Module exports.
 */

module.exports = JSONPPolling;

/**
 * Cached regular expressions.
 */

var rNewline = /\n/g;
var rEscapedNewline = /\\n/g;

/**
 * Global JSONP callbacks.
 */

var callbacks;

/**
 * Callbacks count.
 */

var index = 0;

/**
 * Noop.
 */

function empty () { }

/**
 * JSONP Polling constructor.
 *
 * @param {Object} opts.
 * @api public
 */

function JSONPPolling (opts) {
  Polling.call(this, opts);

  this.query = this.query || {};

  // define global callbacks array if not present
  // we do this here (lazily) to avoid unneeded global pollution
  if (!callbacks) {
    // we need to consider multiple engines in the same page
    if (!global.___eio) global.___eio = [];
    callbacks = global.___eio;
  }

  // callback identifier
  this.index = callbacks.length;

  // add callback to jsonp global
  var self = this;
  callbacks.push(function (msg) {
    self.onData(msg);
  });

  // append to query string
  this.query.j = this.index;

  // prevent spurious errors from being emitted when the window is unloaded
  if (global.document && global.addEventListener) {
    global.addEventListener('beforeunload', function () {
      if (self.script) self.script.onerror = empty;
    }, false);
  }
}

/**
 * Inherits from Polling.
 */

inherit(JSONPPolling, Polling);

/*
 * JSONP only supports binary as base64 encoded strings
 */

JSONPPolling.prototype.supportsBinary = false;

/**
 * Closes the socket.
 *
 * @api private
 */

JSONPPolling.prototype.doClose = function () {
  if (this.script) {
    this.script.parentNode.removeChild(this.script);
    this.script = null;
  }

  if (this.form) {
    this.form.parentNode.removeChild(this.form);
    this.form = null;
    this.iframe = null;
  }

  Polling.prototype.doClose.call(this);
};

/**
 * Starts a poll cycle.
 *
 * @api private
 */

JSONPPolling.prototype.doPoll = function () {
  var self = this;
  var script = document.createElement('script');

  if (this.script) {
    this.script.parentNode.removeChild(this.script);
    this.script = null;
  }

  script.async = true;
  script.src = this.uri();
  script.onerror = function(e){
    self.onError('jsonp poll error',e);
  };

  var insertAt = document.getElementsByTagName('script')[0];
  if (insertAt) {
    insertAt.parentNode.insertBefore(script, insertAt);
  }
  else {
    (document.head || document.body).appendChild(script);
  }
  this.script = script;

  var isUAgecko = 'undefined' != typeof navigator && /gecko/i.test(navigator.userAgent);
  
  if (isUAgecko) {
    setTimeout(function () {
      var iframe = document.createElement('iframe');
      document.body.appendChild(iframe);
      document.body.removeChild(iframe);
    }, 100);
  }
};

/**
 * Writes with a hidden iframe.
 *
 * @param {String} data to send
 * @param {Function} called upon flush.
 * @api private
 */

JSONPPolling.prototype.doWrite = function (data, fn) {
  var self = this;

  if (!this.form) {
    var form = document.createElement('form');
    var area = document.createElement('textarea');
    var id = this.iframeId = 'eio_iframe_' + this.index;
    var iframe;

    form.className = 'socketio';
    form.style.position = 'absolute';
    form.style.top = '-1000px';
    form.style.left = '-1000px';
    form.target = id;
    form.method = 'POST';
    form.setAttribute('accept-charset', 'utf-8');
    area.name = 'd';
    form.appendChild(area);
    document.body.appendChild(form);

    this.form = form;
    this.area = area;
  }

  this.form.action = this.uri();

  function complete () {
    initIframe();
    fn();
  }

  function initIframe () {
    if (self.iframe) {
      try {
        self.form.removeChild(self.iframe);
      } catch (e) {
        self.onError('jsonp polling iframe removal error', e);
      }
    }

    try {
      // ie6 dynamic iframes with target="" support (thanks Chris Lambacher)
      var html = '<iframe src="javascript:0" name="'+ self.iframeId +'">';
      iframe = document.createElement(html);
    } catch (e) {
      iframe = document.createElement('iframe');
      iframe.name = self.iframeId;
      iframe.src = 'javascript:0';
    }

    iframe.id = self.iframeId;

    self.form.appendChild(iframe);
    self.iframe = iframe;
  }

  initIframe();

  // escape \n to prevent it from being converted into \r\n by some UAs
  // double escaping is required for escaped new lines because unescaping of new lines can be done safely on server-side
  data = data.replace(rEscapedNewline, '\\\n');
  this.area.value = data.replace(rNewline, '\\n');

  try {
    this.form.submit();
  } catch(e) {}

  if (this.iframe.attachEvent) {
    this.iframe.onreadystatechange = function(){
      if (self.iframe.readyState == 'complete') {
        complete();
      }
    };
  } else {
    this.iframe.onload = complete;
  }
};

}).call(this,typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : typeof global !== "undefined" ? global : {})
},{"./polling":8,"component-inherit":16}],7:[function(_dereq_,module,exports){
(function (global){
/**
 * Module requirements.
 */

var XMLHttpRequest = _dereq_('xmlhttprequest-ssl');
var Polling = _dereq_('./polling');
var Emitter = _dereq_('component-emitter');
var inherit = _dereq_('component-inherit');
var debug = _dereq_('debug')('engine.io-client:polling-xhr');

/**
 * Module exports.
 */

module.exports = XHR;
module.exports.Request = Request;

/**
 * Empty function
 */

function empty(){}

/**
 * XHR Polling constructor.
 *
 * @param {Object} opts
 * @api public
 */

function XHR(opts){
  Polling.call(this, opts);

  if (global.location) {
    var isSSL = 'https:' == location.protocol;
    var port = location.port;

    // some user agents have empty `location.port`
    if (!port) {
      port = isSSL ? 443 : 80;
    }

    this.xd = opts.hostname != global.location.hostname ||
      port != opts.port;
    this.xs = opts.secure != isSSL;
  } else {
    this.extraHeaders = opts.extraHeaders;
  }
}

/**
 * Inherits from Polling.
 */

inherit(XHR, Polling);

/**
 * XHR supports binary
 */

XHR.prototype.supportsBinary = true;

/**
 * Creates a request.
 *
 * @param {String} method
 * @api private
 */

XHR.prototype.request = function(opts){
  opts = opts || {};
  opts.uri = this.uri();
  opts.xd = this.xd;
  opts.xs = this.xs;
  opts.agent = this.agent || false;
  opts.supportsBinary = this.supportsBinary;
  opts.enablesXDR = this.enablesXDR;

  // SSL options for Node.js client
  opts.pfx = this.pfx;
  opts.key = this.key;
  opts.passphrase = this.passphrase;
  opts.cert = this.cert;
  opts.ca = this.ca;
  opts.ciphers = this.ciphers;
  opts.rejectUnauthorized = this.rejectUnauthorized;

  // other options for Node.js client
  opts.extraHeaders = this.extraHeaders;

  return new Request(opts);
};

/**
 * Sends data.
 *
 * @param {String} data to send.
 * @param {Function} called upon flush.
 * @api private
 */

XHR.prototype.doWrite = function(data, fn){
  var isBinary = typeof data !== 'string' && data !== undefined;
  var req = this.request({ method: 'POST', data: data, isBinary: isBinary });
  var self = this;
  req.on('success', fn);
  req.on('error', function(err){
    self.onError('xhr post error', err);
  });
  this.sendXhr = req;
};

/**
 * Starts a poll cycle.
 *
 * @api private
 */

XHR.prototype.doPoll = function(){
  debug('xhr poll');
  var req = this.request();
  var self = this;
  req.on('data', function(data){
    self.onData(data);
  });
  req.on('error', function(err){
    self.onError('xhr poll error', err);
  });
  this.pollXhr = req;
};

/**
 * Request constructor
 *
 * @param {Object} options
 * @api public
 */

function Request(opts){
  this.method = opts.method || 'GET';
  this.uri = opts.uri;
  this.xd = !!opts.xd;
  this.xs = !!opts.xs;
  this.async = false !== opts.async;
  this.data = undefined != opts.data ? opts.data : null;
  this.agent = opts.agent;
  this.isBinary = opts.isBinary;
  this.supportsBinary = opts.supportsBinary;
  this.enablesXDR = opts.enablesXDR;

  // SSL options for Node.js client
  this.pfx = opts.pfx;
  this.key = opts.key;
  this.passphrase = opts.passphrase;
  this.cert = opts.cert;
  this.ca = opts.ca;
  this.ciphers = opts.ciphers;
  this.rejectUnauthorized = opts.rejectUnauthorized;

  // other options for Node.js client
  this.extraHeaders = opts.extraHeaders;

  this.create();
}

/**
 * Mix in `Emitter`.
 */

Emitter(Request.prototype);

/**
 * Creates the XHR object and sends the request.
 *
 * @api private
 */

Request.prototype.create = function(){
  var opts = { agent: this.agent, xdomain: this.xd, xscheme: this.xs, enablesXDR: this.enablesXDR };

  // SSL options for Node.js client
  opts.pfx = this.pfx;
  opts.key = this.key;
  opts.passphrase = this.passphrase;
  opts.cert = this.cert;
  opts.ca = this.ca;
  opts.ciphers = this.ciphers;
  opts.rejectUnauthorized = this.rejectUnauthorized;

  var xhr = this.xhr = new XMLHttpRequest(opts);
  var self = this;

  try {
    debug('xhr open %s: %s', this.method, this.uri);
    xhr.open(this.method, this.uri, this.async);
    try {
      if (this.extraHeaders) {
        xhr.setDisableHeaderCheck(true);
        for (var i in this.extraHeaders) {
          if (this.extraHeaders.hasOwnProperty(i)) {
            xhr.setRequestHeader(i, this.extraHeaders[i]);
          }
        }
      }
    } catch (e) {}
    if (this.supportsBinary) {
      // This has to be done after open because Firefox is stupid
      // http://stackoverflow.com/questions/13216903/get-binary-data-with-xmlhttprequest-in-a-firefox-extension
      xhr.responseType = 'arraybuffer';
    }

    if ('POST' == this.method) {
      try {
        if (this.isBinary) {
          xhr.setRequestHeader('Content-type', 'application/octet-stream');
        } else {
          xhr.setRequestHeader('Content-type', 'text/plain;charset=UTF-8');
        }
      } catch (e) {}
    }

    // ie6 check
    if ('withCredentials' in xhr) {
      xhr.withCredentials = true;
    }

    if (this.hasXDR()) {
      xhr.onload = function(){
        self.onLoad();
      };
      xhr.onerror = function(){
        self.onError(xhr.responseText);
      };
    } else {
      xhr.onreadystatechange = function(){
        if (4 != xhr.readyState) return;
        if (200 == xhr.status || 1223 == xhr.status) {
          self.onLoad();
        } else {
          // make sure the `error` event handler that's user-set
          // does not throw in the same tick and gets caught here
          setTimeout(function(){
            self.onError(xhr.status);
          }, 0);
        }
      };
    }

    debug('xhr data %s', this.data);
    xhr.send(this.data);
  } catch (e) {
    // Need to defer since .create() is called directly fhrom the constructor
    // and thus the 'error' event can only be only bound *after* this exception
    // occurs.  Therefore, also, we cannot throw here at all.
    setTimeout(function() {
      self.onError(e);
    }, 0);
    return;
  }

  if (global.document) {
    this.index = Request.requestsCount++;
    Request.requests[this.index] = this;
  }
};

/**
 * Called upon successful response.
 *
 * @api private
 */

Request.prototype.onSuccess = function(){
  this.emit('success');
  this.cleanup();
};

/**
 * Called if we have data.
 *
 * @api private
 */

Request.prototype.onData = function(data){
  this.emit('data', data);
  this.onSuccess();
};

/**
 * Called upon error.
 *
 * @api private
 */

Request.prototype.onError = function(err){
  this.emit('error', err);
  this.cleanup(true);
};

/**
 * Cleans up house.
 *
 * @api private
 */

Request.prototype.cleanup = function(fromError){
  if ('undefined' == typeof this.xhr || null === this.xhr) {
    return;
  }
  // xmlhttprequest
  if (this.hasXDR()) {
    this.xhr.onload = this.xhr.onerror = empty;
  } else {
    this.xhr.onreadystatechange = empty;
  }

  if (fromError) {
    try {
      this.xhr.abort();
    } catch(e) {}
  }

  if (global.document) {
    delete Request.requests[this.index];
  }

  this.xhr = null;
};

/**
 * Called upon load.
 *
 * @api private
 */

Request.prototype.onLoad = function(){
  var data;
  try {
    var contentType;
    try {
      contentType = this.xhr.getResponseHeader('Content-Type').split(';')[0];
    } catch (e) {}
    if (contentType === 'application/octet-stream') {
      data = this.xhr.response;
    } else {
      if (!this.supportsBinary) {
        data = this.xhr.responseText;
      } else {
        try {
          data = String.fromCharCode.apply(null, new Uint8Array(this.xhr.response));
        } catch (e) {
          var ui8Arr = new Uint8Array(this.xhr.response);
          var dataArray = [];
          for (var idx = 0, length = ui8Arr.length; idx < length; idx++) {
            dataArray.push(ui8Arr[idx]);
          }

          data = String.fromCharCode.apply(null, dataArray);
        }
      }
    }
  } catch (e) {
    this.onError(e);
  }
  if (null != data) {
    this.onData(data);
  }
};

/**
 * Check if it has XDomainRequest.
 *
 * @api private
 */

Request.prototype.hasXDR = function(){
  return 'undefined' !== typeof global.XDomainRequest && !this.xs && this.enablesXDR;
};

/**
 * Aborts the request.
 *
 * @api public
 */

Request.prototype.abort = function(){
  this.cleanup();
};

/**
 * Aborts pending requests when unloading the window. This is needed to prevent
 * memory leaks (e.g. when using IE) and to ensure that no spurious error is
 * emitted.
 */

if (global.document) {
  Request.requestsCount = 0;
  Request.requests = {};
  if (global.attachEvent) {
    global.attachEvent('onunload', unloadHandler);
  } else if (global.addEventListener) {
    global.addEventListener('beforeunload', unloadHandler, false);
  }
}

function unloadHandler() {
  for (var i in Request.requests) {
    if (Request.requests.hasOwnProperty(i)) {
      Request.requests[i].abort();
    }
  }
}

}).call(this,typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : typeof global !== "undefined" ? global : {})
},{"./polling":8,"component-emitter":15,"component-inherit":16,"debug":17,"xmlhttprequest-ssl":10}],8:[function(_dereq_,module,exports){
/**
 * Module dependencies.
 */

var Transport = _dereq_('../transport');
var parseqs = _dereq_('parseqs');
var parser = _dereq_('engine.io-parser');
var inherit = _dereq_('component-inherit');
var yeast = _dereq_('yeast');
var debug = _dereq_('debug')('engine.io-client:polling');

/**
 * Module exports.
 */

module.exports = Polling;

/**
 * Is XHR2 supported?
 */

var hasXHR2 = (function() {
  var XMLHttpRequest = _dereq_('xmlhttprequest-ssl');
  var xhr = new XMLHttpRequest({ xdomain: false });
  return null != xhr.responseType;
})();

/**
 * Polling interface.
 *
 * @param {Object} opts
 * @api private
 */

function Polling(opts){
  var forceBase64 = (opts && opts.forceBase64);
  if (!hasXHR2 || forceBase64) {
    this.supportsBinary = false;
  }
  Transport.call(this, opts);
}

/**
 * Inherits from Transport.
 */

inherit(Polling, Transport);

/**
 * Transport name.
 */

Polling.prototype.name = 'polling';

/**
 * Opens the socket (triggers polling). We write a PING message to determine
 * when the transport is open.
 *
 * @api private
 */

Polling.prototype.doOpen = function(){
  this.poll();
};

/**
 * Pauses polling.
 *
 * @param {Function} callback upon buffers are flushed and transport is paused
 * @api private
 */

Polling.prototype.pause = function(onPause){
  var pending = 0;
  var self = this;

  this.readyState = 'pausing';

  function pause(){
    debug('paused');
    self.readyState = 'paused';
    onPause();
  }

  if (this.polling || !this.writable) {
    var total = 0;

    if (this.polling) {
      debug('we are currently polling - waiting to pause');
      total++;
      this.once('pollComplete', function(){
        debug('pre-pause polling complete');
        --total || pause();
      });
    }

    if (!this.writable) {
      debug('we are currently writing - waiting to pause');
      total++;
      this.once('drain', function(){
        debug('pre-pause writing complete');
        --total || pause();
      });
    }
  } else {
    pause();
  }
};

/**
 * Starts polling cycle.
 *
 * @api public
 */

Polling.prototype.poll = function(){
  debug('polling');
  this.polling = true;
  this.doPoll();
  this.emit('poll');
};

/**
 * Overloads onData to detect payloads.
 *
 * @api private
 */

Polling.prototype.onData = function(data){
  var self = this;
  debug('polling got data %s', data);
  var callback = function(packet, index, total) {
    // if its the first message we consider the transport open
    if ('opening' == self.readyState) {
      self.onOpen();
    }

    // if its a close packet, we close the ongoing requests
    if ('close' == packet.type) {
      self.onClose();
      return false;
    }

    // otherwise bypass onData and handle the message
    self.onPacket(packet);
  };

  // decode payload
  parser.decodePayload(data, this.socket.binaryType, callback);

  // if an event did not trigger closing
  if ('closed' != this.readyState) {
    // if we got data we're not polling
    this.polling = false;
    this.emit('pollComplete');

    if ('open' == this.readyState) {
      this.poll();
    } else {
      debug('ignoring poll - transport state "%s"', this.readyState);
    }
  }
};

/**
 * For polling, send a close packet.
 *
 * @api private
 */

Polling.prototype.doClose = function(){
  var self = this;

  function close(){
    debug('writing close packet');
    self.write([{ type: 'close' }]);
  }

  if ('open' == this.readyState) {
    debug('transport open - closing');
    close();
  } else {
    // in case we're trying to close while
    // handshaking is in progress (GH-164)
    debug('transport not open - deferring close');
    this.once('open', close);
  }
};

/**
 * Writes a packets payload.
 *
 * @param {Array} data packets
 * @param {Function} drain callback
 * @api private
 */

Polling.prototype.write = function(packets){
  var self = this;
  this.writable = false;
  var callbackfn = function() {
    self.writable = true;
    self.emit('drain');
  };

  var self = this;
  parser.encodePayload(packets, this.supportsBinary, function(data) {
    self.doWrite(data, callbackfn);
  });
};

/**
 * Generates uri for connection.
 *
 * @api private
 */

Polling.prototype.uri = function(){
  var query = this.query || {};
  var schema = this.secure ? 'https' : 'http';
  var port = '';

  // cache busting is forced
  if (false !== this.timestampRequests) {
    query[this.timestampParam] = yeast();
  }

  if (!this.supportsBinary && !query.sid) {
    query.b64 = 1;
  }

  query = parseqs.encode(query);

  // avoid port if default for schema
  if (this.port && (('https' == schema && this.port != 443) ||
     ('http' == schema && this.port != 80))) {
    port = ':' + this.port;
  }

  // prepend ? to query
  if (query.length) {
    query = '?' + query;
  }

  var ipv6 = this.hostname.indexOf(':') !== -1;
  return schema + '://' + (ipv6 ? '[' + this.hostname + ']' : this.hostname) + port + this.path + query;
};

},{"../transport":4,"component-inherit":16,"debug":17,"engine.io-parser":19,"parseqs":27,"xmlhttprequest-ssl":10,"yeast":30}],9:[function(_dereq_,module,exports){
(function (global){
/**
 * Module dependencies.
 */

var Transport = _dereq_('../transport');
var parser = _dereq_('engine.io-parser');
var parseqs = _dereq_('parseqs');
var inherit = _dereq_('component-inherit');
var yeast = _dereq_('yeast');
var debug = _dereq_('debug')('engine.io-client:websocket');
var BrowserWebSocket = global.WebSocket || global.MozWebSocket;

/**
 * Get either the `WebSocket` or `MozWebSocket` globals
 * in the browser or try to resolve WebSocket-compatible
 * interface exposed by `ws` for Node-like environment.
 */

var WebSocket = BrowserWebSocket;
if (!WebSocket && typeof window === 'undefined') {
  try {
    WebSocket = _dereq_('ws');
  } catch (e) { }
}

/**
 * Module exports.
 */

module.exports = WS;

/**
 * WebSocket transport constructor.
 *
 * @api {Object} connection options
 * @api public
 */

function WS(opts){
  var forceBase64 = (opts && opts.forceBase64);
  if (forceBase64) {
    this.supportsBinary = false;
  }
  this.perMessageDeflate = opts.perMessageDeflate;
  Transport.call(this, opts);
}

/**
 * Inherits from Transport.
 */

inherit(WS, Transport);

/**
 * Transport name.
 *
 * @api public
 */

WS.prototype.name = 'websocket';

/*
 * WebSockets support binary
 */

WS.prototype.supportsBinary = true;

/**
 * Opens socket.
 *
 * @api private
 */

WS.prototype.doOpen = function(){
  if (!this.check()) {
    // let probe timeout
    return;
  }

  var self = this;
  var uri = this.uri();
  var protocols = void(0);
  var opts = {
    agent: this.agent,
    perMessageDeflate: this.perMessageDeflate
  };

  // SSL options for Node.js client
  opts.pfx = this.pfx;
  opts.key = this.key;
  opts.passphrase = this.passphrase;
  opts.cert = this.cert;
  opts.ca = this.ca;
  opts.ciphers = this.ciphers;
  opts.rejectUnauthorized = this.rejectUnauthorized;
  if (this.extraHeaders) {
    opts.headers = this.extraHeaders;
  }

  this.ws = BrowserWebSocket ? new WebSocket(uri) : new WebSocket(uri, protocols, opts);

  if (this.ws.binaryType === undefined) {
    this.supportsBinary = false;
  }

  if (this.ws.supports && this.ws.supports.binary) {
    this.supportsBinary = true;
    this.ws.binaryType = 'buffer';
  } else {
    this.ws.binaryType = 'arraybuffer';
  }

  this.addEventListeners();
};

/**
 * Adds event listeners to the socket
 *
 * @api private
 */

WS.prototype.addEventListeners = function(){
  var self = this;

  this.ws.onopen = function(){
    self.onOpen();
  };
  this.ws.onclose = function(){
    self.onClose();
  };
  this.ws.onmessage = function(ev){
    self.onData(ev.data);
  };
  this.ws.onerror = function(e){
    self.onError('websocket error', e);
  };
};

/**
 * Override `onData` to use a timer on iOS.
 * See: https://gist.github.com/mloughran/2052006
 *
 * @api private
 */

if ('undefined' != typeof navigator
  && /iPad|iPhone|iPod/i.test(navigator.userAgent)) {
  WS.prototype.onData = function(data){
    var self = this;
    setTimeout(function(){
      Transport.prototype.onData.call(self, data);
    }, 0);
  };
}

/**
 * Writes data to socket.
 *
 * @param {Array} array of packets.
 * @api private
 */

WS.prototype.write = function(packets){
  var self = this;
  this.writable = false;

  // encodePacket efficient as it uses WS framing
  // no need for encodePayload
  var total = packets.length;
  for (var i = 0, l = total; i < l; i++) {
    (function(packet) {
      parser.encodePacket(packet, self.supportsBinary, function(data) {
        if (!BrowserWebSocket) {
          // always create a new object (GH-437)
          var opts = {};
          if (packet.options) {
            opts.compress = packet.options.compress;
          }

          if (self.perMessageDeflate) {
            var len = 'string' == typeof data ? global.Buffer.byteLength(data) : data.length;
            if (len < self.perMessageDeflate.threshold) {
              opts.compress = false;
            }
          }
        }

        //Sometimes the websocket has already been closed but the browser didn't
        //have a chance of informing us about it yet, in that case send will
        //throw an error
        try {
          if (BrowserWebSocket) {
            // TypeError is thrown when passing the second argument on Safari
            self.ws.send(data);
          } else {
            self.ws.send(data, opts);
          }
        } catch (e){
          debug('websocket closed before onclose event');
        }

        --total || done();
      });
    })(packets[i]);
  }

  function done(){
    self.emit('flush');

    // fake drain
    // defer to next tick to allow Socket to clear writeBuffer
    setTimeout(function(){
      self.writable = true;
      self.emit('drain');
    }, 0);
  }
};

/**
 * Called upon close
 *
 * @api private
 */

WS.prototype.onClose = function(){
  Transport.prototype.onClose.call(this);
};

/**
 * Closes socket.
 *
 * @api private
 */

WS.prototype.doClose = function(){
  if (typeof this.ws !== 'undefined') {
    this.ws.close();
  }
};

/**
 * Generates uri for connection.
 *
 * @api private
 */

WS.prototype.uri = function(){
  var query = this.query || {};
  var schema = this.secure ? 'wss' : 'ws';
  var port = '';

  // avoid port if default for schema
  if (this.port && (('wss' == schema && this.port != 443)
    || ('ws' == schema && this.port != 80))) {
    port = ':' + this.port;
  }

  // append timestamp to URI
  if (this.timestampRequests) {
    query[this.timestampParam] = yeast();
  }

  // communicate binary support capabilities
  if (!this.supportsBinary) {
    query.b64 = 1;
  }

  query = parseqs.encode(query);

  // prepend ? to query
  if (query.length) {
    query = '?' + query;
  }

  var ipv6 = this.hostname.indexOf(':') !== -1;
  return schema + '://' + (ipv6 ? '[' + this.hostname + ']' : this.hostname) + port + this.path + query;
};

/**
 * Feature detection for WebSocket.
 *
 * @return {Boolean} whether this transport is available.
 * @api public
 */

WS.prototype.check = function(){
  return !!WebSocket && !('__initialize' in WebSocket && this.name === WS.prototype.name);
};

}).call(this,typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : typeof global !== "undefined" ? global : {})
},{"../transport":4,"component-inherit":16,"debug":17,"engine.io-parser":19,"parseqs":27,"ws":undefined,"yeast":30}],10:[function(_dereq_,module,exports){
// browser shim for xmlhttprequest module
var hasCORS = _dereq_('has-cors');

module.exports = function(opts) {
  var xdomain = opts.xdomain;

  // scheme must be same when usign XDomainRequest
  // http://blogs.msdn.com/b/ieinternals/archive/2010/05/13/xdomainrequest-restrictions-limitations-and-workarounds.aspx
  var xscheme = opts.xscheme;

  // XDomainRequest has a flow of not sending cookie, therefore it should be disabled as a default.
  // https://github.com/Automattic/engine.io-client/pull/217
  var enablesXDR = opts.enablesXDR;

  // XMLHttpRequest can be disabled on IE
  try {
    if ('undefined' != typeof XMLHttpRequest && (!xdomain || hasCORS)) {
      return new XMLHttpRequest();
    }
  } catch (e) { }

  // Use XDomainRequest for IE8 if enablesXDR is true
  // because loading bar keeps flashing when using jsonp-polling
  // https://github.com/yujiosaka/socke.io-ie8-loading-example
  try {
    if ('undefined' != typeof XDomainRequest && !xscheme && enablesXDR) {
      return new XDomainRequest();
    }
  } catch (e) { }

  if (!xdomain) {
    try {
      return new ActiveXObject('Microsoft.XMLHTTP');
    } catch(e) { }
  }
}

},{"has-cors":22}],11:[function(_dereq_,module,exports){
module.exports = after

function after(count, callback, err_cb) {
    var bail = false
    err_cb = err_cb || noop
    proxy.count = count

    return (count === 0) ? callback() : proxy

    function proxy(err, result) {
        if (proxy.count <= 0) {
            throw new Error('after called too many times')
        }
        --proxy.count

        // after first error, rest are passed to err_cb
        if (err) {
            bail = true
            callback(err)
            // future error callbacks will go to error handler
            callback = err_cb
        } else if (proxy.count === 0 && !bail) {
            callback(null, result)
        }
    }
}

function noop() {}

},{}],12:[function(_dereq_,module,exports){
/**
 * An abstraction for slicing an arraybuffer even when
 * ArrayBuffer.prototype.slice is not supported
 *
 * @api public
 */

module.exports = function(arraybuffer, start, end) {
  var bytes = arraybuffer.byteLength;
  start = start || 0;
  end = end || bytes;

  if (arraybuffer.slice) { return arraybuffer.slice(start, end); }

  if (start < 0) { start += bytes; }
  if (end < 0) { end += bytes; }
  if (end > bytes) { end = bytes; }

  if (start >= bytes || start >= end || bytes === 0) {
    return new ArrayBuffer(0);
  }

  var abv = new Uint8Array(arraybuffer);
  var result = new Uint8Array(end - start);
  for (var i = start, ii = 0; i < end; i++, ii++) {
    result[ii] = abv[i];
  }
  return result.buffer;
};

},{}],13:[function(_dereq_,module,exports){
/*
 * base64-arraybuffer
 * https://github.com/niklasvh/base64-arraybuffer
 *
 * Copyright (c) 2012 Niklas von Hertzen
 * Licensed under the MIT license.
 */
(function(chars){
  "use strict";

  exports.encode = function(arraybuffer) {
    var bytes = new Uint8Array(arraybuffer),
    i, len = bytes.length, base64 = "";

    for (i = 0; i < len; i+=3) {
      base64 += chars[bytes[i] >> 2];
      base64 += chars[((bytes[i] & 3) << 4) | (bytes[i + 1] >> 4)];
      base64 += chars[((bytes[i + 1] & 15) << 2) | (bytes[i + 2] >> 6)];
      base64 += chars[bytes[i + 2] & 63];
    }

    if ((len % 3) === 2) {
      base64 = base64.substring(0, base64.length - 1) + "=";
    } else if (len % 3 === 1) {
      base64 = base64.substring(0, base64.length - 2) + "==";
    }

    return base64;
  };

  exports.decode =  function(base64) {
    var bufferLength = base64.length * 0.75,
    len = base64.length, i, p = 0,
    encoded1, encoded2, encoded3, encoded4;

    if (base64[base64.length - 1] === "=") {
      bufferLength--;
      if (base64[base64.length - 2] === "=") {
        bufferLength--;
      }
    }

    var arraybuffer = new ArrayBuffer(bufferLength),
    bytes = new Uint8Array(arraybuffer);

    for (i = 0; i < len; i+=4) {
      encoded1 = chars.indexOf(base64[i]);
      encoded2 = chars.indexOf(base64[i+1]);
      encoded3 = chars.indexOf(base64[i+2]);
      encoded4 = chars.indexOf(base64[i+3]);

      bytes[p++] = (encoded1 << 2) | (encoded2 >> 4);
      bytes[p++] = ((encoded2 & 15) << 4) | (encoded3 >> 2);
      bytes[p++] = ((encoded3 & 3) << 6) | (encoded4 & 63);
    }

    return arraybuffer;
  };
})("ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/");

},{}],14:[function(_dereq_,module,exports){
(function (global){
/**
 * Create a blob builder even when vendor prefixes exist
 */

var BlobBuilder = global.BlobBuilder
  || global.WebKitBlobBuilder
  || global.MSBlobBuilder
  || global.MozBlobBuilder;

/**
 * Check if Blob constructor is supported
 */

var blobSupported = (function() {
  try {
    var a = new Blob(['hi']);
    return a.size === 2;
  } catch(e) {
    return false;
  }
})();

/**
 * Check if Blob constructor supports ArrayBufferViews
 * Fails in Safari 6, so we need to map to ArrayBuffers there.
 */

var blobSupportsArrayBufferView = blobSupported && (function() {
  try {
    var b = new Blob([new Uint8Array([1,2])]);
    return b.size === 2;
  } catch(e) {
    return false;
  }
})();

/**
 * Check if BlobBuilder is supported
 */

var blobBuilderSupported = BlobBuilder
  && BlobBuilder.prototype.append
  && BlobBuilder.prototype.getBlob;

/**
 * Helper function that maps ArrayBufferViews to ArrayBuffers
 * Used by BlobBuilder constructor and old browsers that didn't
 * support it in the Blob constructor.
 */

function mapArrayBufferViews(ary) {
  for (var i = 0; i < ary.length; i++) {
    var chunk = ary[i];
    if (chunk.buffer instanceof ArrayBuffer) {
      var buf = chunk.buffer;

      // if this is a subarray, make a copy so we only
      // include the subarray region from the underlying buffer
      if (chunk.byteLength !== buf.byteLength) {
        var copy = new Uint8Array(chunk.byteLength);
        copy.set(new Uint8Array(buf, chunk.byteOffset, chunk.byteLength));
        buf = copy.buffer;
      }

      ary[i] = buf;
    }
  }
}

function BlobBuilderConstructor(ary, options) {
  options = options || {};

  var bb = new BlobBuilder();
  mapArrayBufferViews(ary);

  for (var i = 0; i < ary.length; i++) {
    bb.append(ary[i]);
  }

  return (options.type) ? bb.getBlob(options.type) : bb.getBlob();
};

function BlobConstructor(ary, options) {
  mapArrayBufferViews(ary);
  return new Blob(ary, options || {});
};

module.exports = (function() {
  if (blobSupported) {
    return blobSupportsArrayBufferView ? global.Blob : BlobConstructor;
  } else if (blobBuilderSupported) {
    return BlobBuilderConstructor;
  } else {
    return undefined;
  }
})();

}).call(this,typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : typeof global !== "undefined" ? global : {})
},{}],15:[function(_dereq_,module,exports){

/**
 * Expose `Emitter`.
 */

module.exports = Emitter;

/**
 * Initialize a new `Emitter`.
 *
 * @api public
 */

function Emitter(obj) {
  if (obj) return mixin(obj);
};

/**
 * Mixin the emitter properties.
 *
 * @param {Object} obj
 * @return {Object}
 * @api private
 */

function mixin(obj) {
  for (var key in Emitter.prototype) {
    obj[key] = Emitter.prototype[key];
  }
  return obj;
}

/**
 * Listen on the given `event` with `fn`.
 *
 * @param {String} event
 * @param {Function} fn
 * @return {Emitter}
 * @api public
 */

Emitter.prototype.on =
Emitter.prototype.addEventListener = function(event, fn){
  this._callbacks = this._callbacks || {};
  (this._callbacks[event] = this._callbacks[event] || [])
    .push(fn);
  return this;
};

/**
 * Adds an `event` listener that will be invoked a single
 * time then automatically removed.
 *
 * @param {String} event
 * @param {Function} fn
 * @return {Emitter}
 * @api public
 */

Emitter.prototype.once = function(event, fn){
  var self = this;
  this._callbacks = this._callbacks || {};

  function on() {
    self.off(event, on);
    fn.apply(this, arguments);
  }

  on.fn = fn;
  this.on(event, on);
  return this;
};

/**
 * Remove the given callback for `event` or all
 * registered callbacks.
 *
 * @param {String} event
 * @param {Function} fn
 * @return {Emitter}
 * @api public
 */

Emitter.prototype.off =
Emitter.prototype.removeListener =
Emitter.prototype.removeAllListeners =
Emitter.prototype.removeEventListener = function(event, fn){
  this._callbacks = this._callbacks || {};

  // all
  if (0 == arguments.length) {
    this._callbacks = {};
    return this;
  }

  // specific event
  var callbacks = this._callbacks[event];
  if (!callbacks) return this;

  // remove all handlers
  if (1 == arguments.length) {
    delete this._callbacks[event];
    return this;
  }

  // remove specific handler
  var cb;
  for (var i = 0; i < callbacks.length; i++) {
    cb = callbacks[i];
    if (cb === fn || cb.fn === fn) {
      callbacks.splice(i, 1);
      break;
    }
  }
  return this;
};

/**
 * Emit `event` with the given args.
 *
 * @param {String} event
 * @param {Mixed} ...
 * @return {Emitter}
 */

Emitter.prototype.emit = function(event){
  this._callbacks = this._callbacks || {};
  var args = [].slice.call(arguments, 1)
    , callbacks = this._callbacks[event];

  if (callbacks) {
    callbacks = callbacks.slice(0);
    for (var i = 0, len = callbacks.length; i < len; ++i) {
      callbacks[i].apply(this, args);
    }
  }

  return this;
};

/**
 * Return array of callbacks for `event`.
 *
 * @param {String} event
 * @return {Array}
 * @api public
 */

Emitter.prototype.listeners = function(event){
  this._callbacks = this._callbacks || {};
  return this._callbacks[event] || [];
};

/**
 * Check if this emitter has `event` handlers.
 *
 * @param {String} event
 * @return {Boolean}
 * @api public
 */

Emitter.prototype.hasListeners = function(event){
  return !! this.listeners(event).length;
};

},{}],16:[function(_dereq_,module,exports){

module.exports = function(a, b){
  var fn = function(){};
  fn.prototype = b.prototype;
  a.prototype = new fn;
  a.prototype.constructor = a;
};
},{}],17:[function(_dereq_,module,exports){

/**
 * This is the web browser implementation of `debug()`.
 *
 * Expose `debug()` as the module.
 */

exports = module.exports = _dereq_('./debug');
exports.log = log;
exports.formatArgs = formatArgs;
exports.save = save;
exports.load = load;
exports.useColors = useColors;
exports.storage = 'undefined' != typeof chrome
               && 'undefined' != typeof chrome.storage
                  ? chrome.storage.local
                  : localstorage();

/**
 * Colors.
 */

exports.colors = [
  'lightseagreen',
  'forestgreen',
  'goldenrod',
  'dodgerblue',
  'darkorchid',
  'crimson'
];

/**
 * Currently only WebKit-based Web Inspectors, Firefox >= v31,
 * and the Firebug extension (any Firefox version) are known
 * to support "%c" CSS customizations.
 *
 * TODO: add a `localStorage` variable to explicitly enable/disable colors
 */

function useColors() {
  // is webkit? http://stackoverflow.com/a/16459606/376773
  return ('WebkitAppearance' in document.documentElement.style) ||
    // is firebug? http://stackoverflow.com/a/398120/376773
    (window.console && (console.firebug || (console.exception && console.table))) ||
    // is firefox >= v31?
    // https://developer.mozilla.org/en-US/docs/Tools/Web_Console#Styling_messages
    (navigator.userAgent.toLowerCase().match(/firefox\/(\d+)/) && parseInt(RegExp.$1, 10) >= 31);
}

/**
 * Map %j to `JSON.stringify()`, since no Web Inspectors do that by default.
 */

exports.formatters.j = function(v) {
  return JSON.stringify(v);
};


/**
 * Colorize log arguments if enabled.
 *
 * @api public
 */

function formatArgs() {
  var args = arguments;
  var useColors = this.useColors;

  args[0] = (useColors ? '%c' : '')
    + this.namespace
    + (useColors ? ' %c' : ' ')
    + args[0]
    + (useColors ? '%c ' : ' ')
    + '+' + exports.humanize(this.diff);

  if (!useColors) return args;

  var c = 'color: ' + this.color;
  args = [args[0], c, 'color: inherit'].concat(Array.prototype.slice.call(args, 1));

  // the final "%c" is somewhat tricky, because there could be other
  // arguments passed either before or after the %c, so we need to
  // figure out the correct index to insert the CSS into
  var index = 0;
  var lastC = 0;
  args[0].replace(/%[a-z%]/g, function(match) {
    if ('%%' === match) return;
    index++;
    if ('%c' === match) {
      // we only are interested in the *last* %c
      // (the user may have provided their own)
      lastC = index;
    }
  });

  args.splice(lastC, 0, c);
  return args;
}

/**
 * Invokes `console.log()` when available.
 * No-op when `console.log` is not a "function".
 *
 * @api public
 */

function log() {
  // this hackery is required for IE8/9, where
  // the `console.log` function doesn't have 'apply'
  return 'object' === typeof console
    && console.log
    && Function.prototype.apply.call(console.log, console, arguments);
}

/**
 * Save `namespaces`.
 *
 * @param {String} namespaces
 * @api private
 */

function save(namespaces) {
  try {
    if (null == namespaces) {
      exports.storage.removeItem('debug');
    } else {
      exports.storage.debug = namespaces;
    }
  } catch(e) {}
}

/**
 * Load `namespaces`.
 *
 * @return {String} returns the previously persisted debug modes
 * @api private
 */

function load() {
  var r;
  try {
    r = exports.storage.debug;
  } catch(e) {}
  return r;
}

/**
 * Enable namespaces listed in `localStorage.debug` initially.
 */

exports.enable(load());

/**
 * Localstorage attempts to return the localstorage.
 *
 * This is necessary because safari throws
 * when a user disables cookies/localstorage
 * and you attempt to access it.
 *
 * @return {LocalStorage}
 * @api private
 */

function localstorage(){
  try {
    return window.localStorage;
  } catch (e) {}
}

},{"./debug":18}],18:[function(_dereq_,module,exports){

/**
 * This is the common logic for both the Node.js and web browser
 * implementations of `debug()`.
 *
 * Expose `debug()` as the module.
 */

exports = module.exports = debug;
exports.coerce = coerce;
exports.disable = disable;
exports.enable = enable;
exports.enabled = enabled;
exports.humanize = _dereq_('ms');

/**
 * The currently active debug mode names, and names to skip.
 */

exports.names = [];
exports.skips = [];

/**
 * Map of special "%n" handling functions, for the debug "format" argument.
 *
 * Valid key names are a single, lowercased letter, i.e. "n".
 */

exports.formatters = {};

/**
 * Previously assigned color.
 */

var prevColor = 0;

/**
 * Previous log timestamp.
 */

var prevTime;

/**
 * Select a color.
 *
 * @return {Number}
 * @api private
 */

function selectColor() {
  return exports.colors[prevColor++ % exports.colors.length];
}

/**
 * Create a debugger with the given `namespace`.
 *
 * @param {String} namespace
 * @return {Function}
 * @api public
 */

function debug(namespace) {

  // define the `disabled` version
  function disabled() {
  }
  disabled.enabled = false;

  // define the `enabled` version
  function enabled() {

    var self = enabled;

    // set `diff` timestamp
    var curr = +new Date();
    var ms = curr - (prevTime || curr);
    self.diff = ms;
    self.prev = prevTime;
    self.curr = curr;
    prevTime = curr;

    // add the `color` if not set
    if (null == self.useColors) self.useColors = exports.useColors();
    if (null == self.color && self.useColors) self.color = selectColor();

    var args = Array.prototype.slice.call(arguments);

    args[0] = exports.coerce(args[0]);

    if ('string' !== typeof args[0]) {
      // anything else let's inspect with %o
      args = ['%o'].concat(args);
    }

    // apply any `formatters` transformations
    var index = 0;
    args[0] = args[0].replace(/%([a-z%])/g, function(match, format) {
      // if we encounter an escaped % then don't increase the array index
      if (match === '%%') return match;
      index++;
      var formatter = exports.formatters[format];
      if ('function' === typeof formatter) {
        var val = args[index];
        match = formatter.call(self, val);

        // now we need to remove `args[index]` since it's inlined in the `format`
        args.splice(index, 1);
        index--;
      }
      return match;
    });

    if ('function' === typeof exports.formatArgs) {
      args = exports.formatArgs.apply(self, args);
    }
    var logFn = enabled.log || exports.log || console.log.bind(console);
    logFn.apply(self, args);
  }
  enabled.enabled = true;

  var fn = exports.enabled(namespace) ? enabled : disabled;

  fn.namespace = namespace;

  return fn;
}

/**
 * Enables a debug mode by namespaces. This can include modes
 * separated by a colon and wildcards.
 *
 * @param {String} namespaces
 * @api public
 */

function enable(namespaces) {
  exports.save(namespaces);

  var split = (namespaces || '').split(/[\s,]+/);
  var len = split.length;

  for (var i = 0; i < len; i++) {
    if (!split[i]) continue; // ignore empty strings
    namespaces = split[i].replace(/\*/g, '.*?');
    if (namespaces[0] === '-') {
      exports.skips.push(new RegExp('^' + namespaces.substr(1) + '$'));
    } else {
      exports.names.push(new RegExp('^' + namespaces + '$'));
    }
  }
}

/**
 * Disable debug output.
 *
 * @api public
 */

function disable() {
  exports.enable('');
}

/**
 * Returns true if the given mode name is enabled, false otherwise.
 *
 * @param {String} name
 * @return {Boolean}
 * @api public
 */

function enabled(name) {
  var i, len;
  for (i = 0, len = exports.skips.length; i < len; i++) {
    if (exports.skips[i].test(name)) {
      return false;
    }
  }
  for (i = 0, len = exports.names.length; i < len; i++) {
    if (exports.names[i].test(name)) {
      return true;
    }
  }
  return false;
}

/**
 * Coerce `val`.
 *
 * @param {Mixed} val
 * @return {Mixed}
 * @api private
 */

function coerce(val) {
  if (val instanceof Error) return val.stack || val.message;
  return val;
}

},{"ms":25}],19:[function(_dereq_,module,exports){
(function (global){
/**
 * Module dependencies.
 */

var keys = _dereq_('./keys');
var hasBinary = _dereq_('has-binary');
var sliceBuffer = _dereq_('arraybuffer.slice');
var base64encoder = _dereq_('base64-arraybuffer');
var after = _dereq_('after');
var utf8 = _dereq_('utf8');

/**
 * Check if we are running an android browser. That requires us to use
 * ArrayBuffer with polling transports...
 *
 * http://ghinda.net/jpeg-blob-ajax-android/
 */

var isAndroid = navigator.userAgent.match(/Android/i);

/**
 * Check if we are running in PhantomJS.
 * Uploading a Blob with PhantomJS does not work correctly, as reported here:
 * https://github.com/ariya/phantomjs/issues/11395
 * @type boolean
 */
var isPhantomJS = /PhantomJS/i.test(navigator.userAgent);

/**
 * When true, avoids using Blobs to encode payloads.
 * @type boolean
 */
var dontSendBlobs = isAndroid || isPhantomJS;

/**
 * Current protocol version.
 */

exports.protocol = 3;

/**
 * Packet types.
 */

var packets = exports.packets = {
    open:     0    // non-ws
  , close:    1    // non-ws
  , ping:     2
  , pong:     3
  , message:  4
  , upgrade:  5
  , noop:     6
};

var packetslist = keys(packets);

/**
 * Premade error packet.
 */

var err = { type: 'error', data: 'parser error' };

/**
 * Create a blob api even for blob builder when vendor prefixes exist
 */

var Blob = _dereq_('blob');

/**
 * Encodes a packet.
 *
 *     <packet type id> [ <data> ]
 *
 * Example:
 *
 *     5hello world
 *     3
 *     4
 *
 * Binary is encoded in an identical principle
 *
 * @api private
 */

exports.encodePacket = function (packet, supportsBinary, utf8encode, callback) {
  if ('function' == typeof supportsBinary) {
    callback = supportsBinary;
    supportsBinary = false;
  }

  if ('function' == typeof utf8encode) {
    callback = utf8encode;
    utf8encode = null;
  }

  var data = (packet.data === undefined)
    ? undefined
    : packet.data.buffer || packet.data;

  if (global.ArrayBuffer && data instanceof ArrayBuffer) {
    return encodeArrayBuffer(packet, supportsBinary, callback);
  } else if (Blob && data instanceof global.Blob) {
    return encodeBlob(packet, supportsBinary, callback);
  }

  // might be an object with { base64: true, data: dataAsBase64String }
  if (data && data.base64) {
    return encodeBase64Object(packet, callback);
  }

  // Sending data as a utf-8 string
  var encoded = packets[packet.type];

  // data fragment is optional
  if (undefined !== packet.data) {
    encoded += utf8encode ? utf8.encode(String(packet.data)) : String(packet.data);
  }

  return callback('' + encoded);

};

function encodeBase64Object(packet, callback) {
  // packet data is an object { base64: true, data: dataAsBase64String }
  var message = 'b' + exports.packets[packet.type] + packet.data.data;
  return callback(message);
}

/**
 * Encode packet helpers for binary types
 */

function encodeArrayBuffer(packet, supportsBinary, callback) {
  if (!supportsBinary) {
    return exports.encodeBase64Packet(packet, callback);
  }

  var data = packet.data;
  var contentArray = new Uint8Array(data);
  var resultBuffer = new Uint8Array(1 + data.byteLength);

  resultBuffer[0] = packets[packet.type];
  for (var i = 0; i < contentArray.length; i++) {
    resultBuffer[i+1] = contentArray[i];
  }

  return callback(resultBuffer.buffer);
}

function encodeBlobAsArrayBuffer(packet, supportsBinary, callback) {
  if (!supportsBinary) {
    return exports.encodeBase64Packet(packet, callback);
  }

  var fr = new FileReader();
  fr.onload = function() {
    packet.data = fr.result;
    exports.encodePacket(packet, supportsBinary, true, callback);
  };
  return fr.readAsArrayBuffer(packet.data);
}

function encodeBlob(packet, supportsBinary, callback) {
  if (!supportsBinary) {
    return exports.encodeBase64Packet(packet, callback);
  }

  if (dontSendBlobs) {
    return encodeBlobAsArrayBuffer(packet, supportsBinary, callback);
  }

  var length = new Uint8Array(1);
  length[0] = packets[packet.type];
  var blob = new Blob([length.buffer, packet.data]);

  return callback(blob);
}

/**
 * Encodes a packet with binary data in a base64 string
 *
 * @param {Object} packet, has `type` and `data`
 * @return {String} base64 encoded message
 */

exports.encodeBase64Packet = function(packet, callback) {
  var message = 'b' + exports.packets[packet.type];
  if (Blob && packet.data instanceof global.Blob) {
    var fr = new FileReader();
    fr.onload = function() {
      var b64 = fr.result.split(',')[1];
      callback(message + b64);
    };
    return fr.readAsDataURL(packet.data);
  }

  var b64data;
  try {
    b64data = String.fromCharCode.apply(null, new Uint8Array(packet.data));
  } catch (e) {
    // iPhone Safari doesn't let you apply with typed arrays
    var typed = new Uint8Array(packet.data);
    var basic = new Array(typed.length);
    for (var i = 0; i < typed.length; i++) {
      basic[i] = typed[i];
    }
    b64data = String.fromCharCode.apply(null, basic);
  }
  message += global.btoa(b64data);
  return callback(message);
};

/**
 * Decodes a packet. Changes format to Blob if requested.
 *
 * @return {Object} with `type` and `data` (if any)
 * @api private
 */

exports.decodePacket = function (data, binaryType, utf8decode) {
  // String data
  if (typeof data == 'string' || data === undefined) {
    if (data.charAt(0) == 'b') {
      return exports.decodeBase64Packet(data.substr(1), binaryType);
    }

    if (utf8decode) {
      try {
        data = utf8.decode(data);
      } catch (e) {
        return err;
      }
    }
    var type = data.charAt(0);

    if (Number(type) != type || !packetslist[type]) {
      return err;
    }

    if (data.length > 1) {
      return { type: packetslist[type], data: data.substring(1) };
    } else {
      return { type: packetslist[type] };
    }
  }

  var asArray = new Uint8Array(data);
  var type = asArray[0];
  var rest = sliceBuffer(data, 1);
  if (Blob && binaryType === 'blob') {
    rest = new Blob([rest]);
  }
  return { type: packetslist[type], data: rest };
};

/**
 * Decodes a packet encoded in a base64 string
 *
 * @param {String} base64 encoded message
 * @return {Object} with `type` and `data` (if any)
 */

exports.decodeBase64Packet = function(msg, binaryType) {
  var type = packetslist[msg.charAt(0)];
  if (!global.ArrayBuffer) {
    return { type: type, data: { base64: true, data: msg.substr(1) } };
  }

  var data = base64encoder.decode(msg.substr(1));

  if (binaryType === 'blob' && Blob) {
    data = new Blob([data]);
  }

  return { type: type, data: data };
};

/**
 * Encodes multiple messages (payload).
 *
 *     <length>:data
 *
 * Example:
 *
 *     11:hello world2:hi
 *
 * If any contents are binary, they will be encoded as base64 strings. Base64
 * encoded strings are marked with a b before the length specifier
 *
 * @param {Array} packets
 * @api private
 */

exports.encodePayload = function (packets, supportsBinary, callback) {
  if (typeof supportsBinary == 'function') {
    callback = supportsBinary;
    supportsBinary = null;
  }

  var isBinary = hasBinary(packets);

  if (supportsBinary && isBinary) {
    if (Blob && !dontSendBlobs) {
      return exports.encodePayloadAsBlob(packets, callback);
    }

    return exports.encodePayloadAsArrayBuffer(packets, callback);
  }

  if (!packets.length) {
    return callback('0:');
  }

  function setLengthHeader(message) {
    return message.length + ':' + message;
  }

  function encodeOne(packet, doneCallback) {
    exports.encodePacket(packet, !isBinary ? false : supportsBinary, true, function(message) {
      doneCallback(null, setLengthHeader(message));
    });
  }

  map(packets, encodeOne, function(err, results) {
    return callback(results.join(''));
  });
};

/**
 * Async array map using after
 */

function map(ary, each, done) {
  var result = new Array(ary.length);
  var next = after(ary.length, done);

  var eachWithIndex = function(i, el, cb) {
    each(el, function(error, msg) {
      result[i] = msg;
      cb(error, result);
    });
  };

  for (var i = 0; i < ary.length; i++) {
    eachWithIndex(i, ary[i], next);
  }
}

/*
 * Decodes data when a payload is maybe expected. Possible binary contents are
 * decoded from their base64 representation
 *
 * @param {String} data, callback method
 * @api public
 */

exports.decodePayload = function (data, binaryType, callback) {
  if (typeof data != 'string') {
    return exports.decodePayloadAsBinary(data, binaryType, callback);
  }

  if (typeof binaryType === 'function') {
    callback = binaryType;
    binaryType = null;
  }

  var packet;
  if (data == '') {
    // parser error - ignoring payload
    return callback(err, 0, 1);
  }

  var length = ''
    , n, msg;

  for (var i = 0, l = data.length; i < l; i++) {
    var chr = data.charAt(i);

    if (':' != chr) {
      length += chr;
    } else {
      if ('' == length || (length != (n = Number(length)))) {
        // parser error - ignoring payload
        return callback(err, 0, 1);
      }

      msg = data.substr(i + 1, n);

      if (length != msg.length) {
        // parser error - ignoring payload
        return callback(err, 0, 1);
      }

      if (msg.length) {
        packet = exports.decodePacket(msg, binaryType, true);

        if (err.type == packet.type && err.data == packet.data) {
          // parser error in individual packet - ignoring payload
          return callback(err, 0, 1);
        }

        var ret = callback(packet, i + n, l);
        if (false === ret) return;
      }

      // advance cursor
      i += n;
      length = '';
    }
  }

  if (length != '') {
    // parser error - ignoring payload
    return callback(err, 0, 1);
  }

};

/**
 * Encodes multiple messages (payload) as binary.
 *
 * <1 = binary, 0 = string><number from 0-9><number from 0-9>[...]<number
 * 255><data>
 *
 * Example:
 * 1 3 255 1 2 3, if the binary contents are interpreted as 8 bit integers
 *
 * @param {Array} packets
 * @return {ArrayBuffer} encoded payload
 * @api private
 */

exports.encodePayloadAsArrayBuffer = function(packets, callback) {
  if (!packets.length) {
    return callback(new ArrayBuffer(0));
  }

  function encodeOne(packet, doneCallback) {
    exports.encodePacket(packet, true, true, function(data) {
      return doneCallback(null, data);
    });
  }

  map(packets, encodeOne, function(err, encodedPackets) {
    var totalLength = encodedPackets.reduce(function(acc, p) {
      var len;
      if (typeof p === 'string'){
        len = p.length;
      } else {
        len = p.byteLength;
      }
      return acc + len.toString().length + len + 2; // string/binary identifier + separator = 2
    }, 0);

    var resultArray = new Uint8Array(totalLength);

    var bufferIndex = 0;
    encodedPackets.forEach(function(p) {
      var isString = typeof p === 'string';
      var ab = p;
      if (isString) {
        var view = new Uint8Array(p.length);
        for (var i = 0; i < p.length; i++) {
          view[i] = p.charCodeAt(i);
        }
        ab = view.buffer;
      }

      if (isString) { // not true binary
        resultArray[bufferIndex++] = 0;
      } else { // true binary
        resultArray[bufferIndex++] = 1;
      }

      var lenStr = ab.byteLength.toString();
      for (var i = 0; i < lenStr.length; i++) {
        resultArray[bufferIndex++] = parseInt(lenStr[i]);
      }
      resultArray[bufferIndex++] = 255;

      var view = new Uint8Array(ab);
      for (var i = 0; i < view.length; i++) {
        resultArray[bufferIndex++] = view[i];
      }
    });

    return callback(resultArray.buffer);
  });
};

/**
 * Encode as Blob
 */

exports.encodePayloadAsBlob = function(packets, callback) {
  function encodeOne(packet, doneCallback) {
    exports.encodePacket(packet, true, true, function(encoded) {
      var binaryIdentifier = new Uint8Array(1);
      binaryIdentifier[0] = 1;
      if (typeof encoded === 'string') {
        var view = new Uint8Array(encoded.length);
        for (var i = 0; i < encoded.length; i++) {
          view[i] = encoded.charCodeAt(i);
        }
        encoded = view.buffer;
        binaryIdentifier[0] = 0;
      }

      var len = (encoded instanceof ArrayBuffer)
        ? encoded.byteLength
        : encoded.size;

      var lenStr = len.toString();
      var lengthAry = new Uint8Array(lenStr.length + 1);
      for (var i = 0; i < lenStr.length; i++) {
        lengthAry[i] = parseInt(lenStr[i]);
      }
      lengthAry[lenStr.length] = 255;

      if (Blob) {
        var blob = new Blob([binaryIdentifier.buffer, lengthAry.buffer, encoded]);
        doneCallback(null, blob);
      }
    });
  }

  map(packets, encodeOne, function(err, results) {
    return callback(new Blob(results));
  });
};

/*
 * Decodes data when a payload is maybe expected. Strings are decoded by
 * interpreting each byte as a key code for entries marked to start with 0. See
 * description of encodePayloadAsBinary
 *
 * @param {ArrayBuffer} data, callback method
 * @api public
 */

exports.decodePayloadAsBinary = function (data, binaryType, callback) {
  if (typeof binaryType === 'function') {
    callback = binaryType;
    binaryType = null;
  }

  var bufferTail = data;
  var buffers = [];

  var numberTooLong = false;
  while (bufferTail.byteLength > 0) {
    var tailArray = new Uint8Array(bufferTail);
    var isString = tailArray[0] === 0;
    var msgLength = '';

    for (var i = 1; ; i++) {
      if (tailArray[i] == 255) break;

      if (msgLength.length > 310) {
        numberTooLong = true;
        break;
      }

      msgLength += tailArray[i];
    }

    if(numberTooLong) return callback(err, 0, 1);

    bufferTail = sliceBuffer(bufferTail, 2 + msgLength.length);
    msgLength = parseInt(msgLength);

    var msg = sliceBuffer(bufferTail, 0, msgLength);
    if (isString) {
      try {
        msg = String.fromCharCode.apply(null, new Uint8Array(msg));
      } catch (e) {
        // iPhone Safari doesn't let you apply to typed arrays
        var typed = new Uint8Array(msg);
        msg = '';
        for (var i = 0; i < typed.length; i++) {
          msg += String.fromCharCode(typed[i]);
        }
      }
    }

    buffers.push(msg);
    bufferTail = sliceBuffer(bufferTail, msgLength);
  }

  var total = buffers.length;
  buffers.forEach(function(buffer, i) {
    callback(exports.decodePacket(buffer, binaryType, true), i, total);
  });
};

}).call(this,typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : typeof global !== "undefined" ? global : {})
},{"./keys":20,"after":11,"arraybuffer.slice":12,"base64-arraybuffer":13,"blob":14,"has-binary":21,"utf8":29}],20:[function(_dereq_,module,exports){

/**
 * Gets the keys for an object.
 *
 * @return {Array} keys
 * @api private
 */

module.exports = Object.keys || function keys (obj){
  var arr = [];
  var has = Object.prototype.hasOwnProperty;

  for (var i in obj) {
    if (has.call(obj, i)) {
      arr.push(i);
    }
  }
  return arr;
};

},{}],21:[function(_dereq_,module,exports){
(function (global){

/*
 * Module requirements.
 */

var isArray = _dereq_('isarray');

/**
 * Module exports.
 */

module.exports = hasBinary;

/**
 * Checks for binary data.
 *
 * Right now only Buffer and ArrayBuffer are supported..
 *
 * @param {Object} anything
 * @api public
 */

function hasBinary(data) {

  function _hasBinary(obj) {
    if (!obj) return false;

    if ( (global.Buffer && global.Buffer.isBuffer(obj)) ||
         (global.ArrayBuffer && obj instanceof ArrayBuffer) ||
         (global.Blob && obj instanceof Blob) ||
         (global.File && obj instanceof File)
        ) {
      return true;
    }

    if (isArray(obj)) {
      for (var i = 0; i < obj.length; i++) {
          if (_hasBinary(obj[i])) {
              return true;
          }
      }
    } else if (obj && 'object' == typeof obj) {
      if (obj.toJSON) {
        obj = obj.toJSON();
      }

      for (var key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key) && _hasBinary(obj[key])) {
          return true;
        }
      }
    }

    return false;
  }

  return _hasBinary(data);
}

}).call(this,typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : typeof global !== "undefined" ? global : {})
},{"isarray":24}],22:[function(_dereq_,module,exports){

/**
 * Module exports.
 *
 * Logic borrowed from Modernizr:
 *
 *   - https://github.com/Modernizr/Modernizr/blob/master/feature-detects/cors.js
 */

try {
  module.exports = typeof XMLHttpRequest !== 'undefined' &&
    'withCredentials' in new XMLHttpRequest();
} catch (err) {
  // if XMLHttp support is disabled in IE then it will throw
  // when trying to create
  module.exports = false;
}

},{}],23:[function(_dereq_,module,exports){

var indexOf = [].indexOf;

module.exports = function(arr, obj){
  if (indexOf) return arr.indexOf(obj);
  for (var i = 0; i < arr.length; ++i) {
    if (arr[i] === obj) return i;
  }
  return -1;
};
},{}],24:[function(_dereq_,module,exports){
module.exports = Array.isArray || function (arr) {
  return Object.prototype.toString.call(arr) == '[object Array]';
};

},{}],25:[function(_dereq_,module,exports){
/**
 * Helpers.
 */

var s = 1000;
var m = s * 60;
var h = m * 60;
var d = h * 24;
var y = d * 365.25;

/**
 * Parse or format the given `val`.
 *
 * Options:
 *
 *  - `long` verbose formatting [false]
 *
 * @param {String|Number} val
 * @param {Object} options
 * @return {String|Number}
 * @api public
 */

module.exports = function(val, options){
  options = options || {};
  if ('string' == typeof val) return parse(val);
  return options.long
    ? long(val)
    : short(val);
};

/**
 * Parse the given `str` and return milliseconds.
 *
 * @param {String} str
 * @return {Number}
 * @api private
 */

function parse(str) {
  str = '' + str;
  if (str.length > 10000) return;
  var match = /^((?:\d+)?\.?\d+) *(milliseconds?|msecs?|ms|seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h|days?|d|years?|yrs?|y)?$/i.exec(str);
  if (!match) return;
  var n = parseFloat(match[1]);
  var type = (match[2] || 'ms').toLowerCase();
  switch (type) {
    case 'years':
    case 'year':
    case 'yrs':
    case 'yr':
    case 'y':
      return n * y;
    case 'days':
    case 'day':
    case 'd':
      return n * d;
    case 'hours':
    case 'hour':
    case 'hrs':
    case 'hr':
    case 'h':
      return n * h;
    case 'minutes':
    case 'minute':
    case 'mins':
    case 'min':
    case 'm':
      return n * m;
    case 'seconds':
    case 'second':
    case 'secs':
    case 'sec':
    case 's':
      return n * s;
    case 'milliseconds':
    case 'millisecond':
    case 'msecs':
    case 'msec':
    case 'ms':
      return n;
  }
}

/**
 * Short format for `ms`.
 *
 * @param {Number} ms
 * @return {String}
 * @api private
 */

function short(ms) {
  if (ms >= d) return Math.round(ms / d) + 'd';
  if (ms >= h) return Math.round(ms / h) + 'h';
  if (ms >= m) return Math.round(ms / m) + 'm';
  if (ms >= s) return Math.round(ms / s) + 's';
  return ms + 'ms';
}

/**
 * Long format for `ms`.
 *
 * @param {Number} ms
 * @return {String}
 * @api private
 */

function long(ms) {
  return plural(ms, d, 'day')
    || plural(ms, h, 'hour')
    || plural(ms, m, 'minute')
    || plural(ms, s, 'second')
    || ms + ' ms';
}

/**
 * Pluralization helper.
 */

function plural(ms, n, name) {
  if (ms < n) return;
  if (ms < n * 1.5) return Math.floor(ms / n) + ' ' + name;
  return Math.ceil(ms / n) + ' ' + name + 's';
}

},{}],26:[function(_dereq_,module,exports){
(function (global){
/**
 * JSON parse.
 *
 * @see Based on jQuery#parseJSON (MIT) and JSON2
 * @api private
 */

var rvalidchars = /^[\],:{}\s]*$/;
var rvalidescape = /\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g;
var rvalidtokens = /"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g;
var rvalidbraces = /(?:^|:|,)(?:\s*\[)+/g;
var rtrimLeft = /^\s+/;
var rtrimRight = /\s+$/;

module.exports = function parsejson(data) {
  if ('string' != typeof data || !data) {
    return null;
  }

  data = data.replace(rtrimLeft, '').replace(rtrimRight, '');

  // Attempt to parse using the native JSON parser first
  if (global.JSON && JSON.parse) {
    return JSON.parse(data);
  }

  if (rvalidchars.test(data.replace(rvalidescape, '@')
      .replace(rvalidtokens, ']')
      .replace(rvalidbraces, ''))) {
    return (new Function('return ' + data))();
  }
};
}).call(this,typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : typeof global !== "undefined" ? global : {})
},{}],27:[function(_dereq_,module,exports){
/**
 * Compiles a querystring
 * Returns string representation of the object
 *
 * @param {Object}
 * @api private
 */

exports.encode = function (obj) {
  var str = '';

  for (var i in obj) {
    if (obj.hasOwnProperty(i)) {
      if (str.length) str += '&';
      str += encodeURIComponent(i) + '=' + encodeURIComponent(obj[i]);
    }
  }

  return str;
};

/**
 * Parses a simple querystring into an object
 *
 * @param {String} qs
 * @api private
 */

exports.decode = function(qs){
  var qry = {};
  var pairs = qs.split('&');
  for (var i = 0, l = pairs.length; i < l; i++) {
    var pair = pairs[i].split('=');
    qry[decodeURIComponent(pair[0])] = decodeURIComponent(pair[1]);
  }
  return qry;
};

},{}],28:[function(_dereq_,module,exports){
/**
 * Parses an URI
 *
 * @author Steven Levithan <stevenlevithan.com> (MIT license)
 * @api private
 */

var re = /^(?:(?![^:@]+:[^:@\/]*@)(http|https|ws|wss):\/\/)?((?:(([^:@]*)(?::([^:@]*))?)?@)?((?:[a-f0-9]{0,4}:){2,7}[a-f0-9]{0,4}|[^:\/?#]*)(?::(\d*))?)(((\/(?:[^?#](?![^?#\/]*\.[^?#\/.]+(?:[?#]|$)))*\/?)?([^?#\/]*))(?:\?([^#]*))?(?:#(.*))?)/;

var parts = [
    'source', 'protocol', 'authority', 'userInfo', 'user', 'password', 'host', 'port', 'relative', 'path', 'directory', 'file', 'query', 'anchor'
];

module.exports = function parseuri(str) {
    var src = str,
        b = str.indexOf('['),
        e = str.indexOf(']');

    if (b != -1 && e != -1) {
        str = str.substring(0, b) + str.substring(b, e).replace(/:/g, ';') + str.substring(e, str.length);
    }

    var m = re.exec(str || ''),
        uri = {},
        i = 14;

    while (i--) {
        uri[parts[i]] = m[i] || '';
    }

    if (b != -1 && e != -1) {
        uri.source = src;
        uri.host = uri.host.substring(1, uri.host.length - 1).replace(/;/g, ':');
        uri.authority = uri.authority.replace('[', '').replace(']', '').replace(/;/g, ':');
        uri.ipv6uri = true;
    }

    return uri;
};

},{}],29:[function(_dereq_,module,exports){
(function (global){
/*! https://mths.be/utf8js v2.0.0 by @mathias */
;(function(root) {

	// Detect free variables `exports`
	var freeExports = typeof exports == 'object' && exports;

	// Detect free variable `module`
	var freeModule = typeof module == 'object' && module &&
		module.exports == freeExports && module;

	// Detect free variable `global`, from Node.js or Browserified code,
	// and use it as `root`
	var freeGlobal = typeof global == 'object' && global;
	if (freeGlobal.global === freeGlobal || freeGlobal.window === freeGlobal) {
		root = freeGlobal;
	}

	/*--------------------------------------------------------------------------*/

	var stringFromCharCode = String.fromCharCode;

	// Taken from https://mths.be/punycode
	function ucs2decode(string) {
		var output = [];
		var counter = 0;
		var length = string.length;
		var value;
		var extra;
		while (counter < length) {
			value = string.charCodeAt(counter++);
			if (value >= 0xD800 && value <= 0xDBFF && counter < length) {
				// high surrogate, and there is a next character
				extra = string.charCodeAt(counter++);
				if ((extra & 0xFC00) == 0xDC00) { // low surrogate
					output.push(((value & 0x3FF) << 10) + (extra & 0x3FF) + 0x10000);
				} else {
					// unmatched surrogate; only append this code unit, in case the next
					// code unit is the high surrogate of a surrogate pair
					output.push(value);
					counter--;
				}
			} else {
				output.push(value);
			}
		}
		return output;
	}

	// Taken from https://mths.be/punycode
	function ucs2encode(array) {
		var length = array.length;
		var index = -1;
		var value;
		var output = '';
		while (++index < length) {
			value = array[index];
			if (value > 0xFFFF) {
				value -= 0x10000;
				output += stringFromCharCode(value >>> 10 & 0x3FF | 0xD800);
				value = 0xDC00 | value & 0x3FF;
			}
			output += stringFromCharCode(value);
		}
		return output;
	}

	function checkScalarValue(codePoint) {
		if (codePoint >= 0xD800 && codePoint <= 0xDFFF) {
			throw Error(
				'Lone surrogate U+' + codePoint.toString(16).toUpperCase() +
				' is not a scalar value'
			);
		}
	}
	/*--------------------------------------------------------------------------*/

	function createByte(codePoint, shift) {
		return stringFromCharCode(((codePoint >> shift) & 0x3F) | 0x80);
	}

	function encodeCodePoint(codePoint) {
		if ((codePoint & 0xFFFFFF80) == 0) { // 1-byte sequence
			return stringFromCharCode(codePoint);
		}
		var symbol = '';
		if ((codePoint & 0xFFFFF800) == 0) { // 2-byte sequence
			symbol = stringFromCharCode(((codePoint >> 6) & 0x1F) | 0xC0);
		}
		else if ((codePoint & 0xFFFF0000) == 0) { // 3-byte sequence
			checkScalarValue(codePoint);
			symbol = stringFromCharCode(((codePoint >> 12) & 0x0F) | 0xE0);
			symbol += createByte(codePoint, 6);
		}
		else if ((codePoint & 0xFFE00000) == 0) { // 4-byte sequence
			symbol = stringFromCharCode(((codePoint >> 18) & 0x07) | 0xF0);
			symbol += createByte(codePoint, 12);
			symbol += createByte(codePoint, 6);
		}
		symbol += stringFromCharCode((codePoint & 0x3F) | 0x80);
		return symbol;
	}

	function utf8encode(string) {
		var codePoints = ucs2decode(string);
		var length = codePoints.length;
		var index = -1;
		var codePoint;
		var byteString = '';
		while (++index < length) {
			codePoint = codePoints[index];
			byteString += encodeCodePoint(codePoint);
		}
		return byteString;
	}

	/*--------------------------------------------------------------------------*/

	function readContinuationByte() {
		if (byteIndex >= byteCount) {
			throw Error('Invalid byte index');
		}

		var continuationByte = byteArray[byteIndex] & 0xFF;
		byteIndex++;

		if ((continuationByte & 0xC0) == 0x80) {
			return continuationByte & 0x3F;
		}

		// If we end up here, it’s not a continuation byte
		throw Error('Invalid continuation byte');
	}

	function decodeSymbol() {
		var byte1;
		var byte2;
		var byte3;
		var byte4;
		var codePoint;

		if (byteIndex > byteCount) {
			throw Error('Invalid byte index');
		}

		if (byteIndex == byteCount) {
			return false;
		}

		// Read first byte
		byte1 = byteArray[byteIndex] & 0xFF;
		byteIndex++;

		// 1-byte sequence (no continuation bytes)
		if ((byte1 & 0x80) == 0) {
			return byte1;
		}

		// 2-byte sequence
		if ((byte1 & 0xE0) == 0xC0) {
			var byte2 = readContinuationByte();
			codePoint = ((byte1 & 0x1F) << 6) | byte2;
			if (codePoint >= 0x80) {
				return codePoint;
			} else {
				throw Error('Invalid continuation byte');
			}
		}

		// 3-byte sequence (may include unpaired surrogates)
		if ((byte1 & 0xF0) == 0xE0) {
			byte2 = readContinuationByte();
			byte3 = readContinuationByte();
			codePoint = ((byte1 & 0x0F) << 12) | (byte2 << 6) | byte3;
			if (codePoint >= 0x0800) {
				checkScalarValue(codePoint);
				return codePoint;
			} else {
				throw Error('Invalid continuation byte');
			}
		}

		// 4-byte sequence
		if ((byte1 & 0xF8) == 0xF0) {
			byte2 = readContinuationByte();
			byte3 = readContinuationByte();
			byte4 = readContinuationByte();
			codePoint = ((byte1 & 0x0F) << 0x12) | (byte2 << 0x0C) |
				(byte3 << 0x06) | byte4;
			if (codePoint >= 0x010000 && codePoint <= 0x10FFFF) {
				return codePoint;
			}
		}

		throw Error('Invalid UTF-8 detected');
	}

	var byteArray;
	var byteCount;
	var byteIndex;
	function utf8decode(byteString) {
		byteArray = ucs2decode(byteString);
		byteCount = byteArray.length;
		byteIndex = 0;
		var codePoints = [];
		var tmp;
		while ((tmp = decodeSymbol()) !== false) {
			codePoints.push(tmp);
		}
		return ucs2encode(codePoints);
	}

	/*--------------------------------------------------------------------------*/

	var utf8 = {
		'version': '2.0.0',
		'encode': utf8encode,
		'decode': utf8decode
	};

	// Some AMD build optimizers, like r.js, check for specific condition patterns
	// like the following:
	if (
		typeof define == 'function' &&
		typeof define.amd == 'object' &&
		define.amd
	) {
		define(function() {
			return utf8;
		});
	}	else if (freeExports && !freeExports.nodeType) {
		if (freeModule) { // in Node.js or RingoJS v0.8.0+
			freeModule.exports = utf8;
		} else { // in Narwhal or RingoJS v0.7.0-
			var object = {};
			var hasOwnProperty = object.hasOwnProperty;
			for (var key in utf8) {
				hasOwnProperty.call(utf8, key) && (freeExports[key] = utf8[key]);
			}
		}
	} else { // in Rhino or a web browser
		root.utf8 = utf8;
	}

}(this));

}).call(this,typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : typeof global !== "undefined" ? global : {})
},{}],30:[function(_dereq_,module,exports){
'use strict';

var alphabet = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz-_'.split('')
  , length = 64
  , map = {}
  , seed = 0
  , i = 0
  , prev;

/**
 * Return a string representing the specified number.
 *
 * @param {Number} num The number to convert.
 * @returns {String} The string representation of the number.
 * @api public
 */
function encode(num) {
  var encoded = '';

  do {
    encoded = alphabet[num % length] + encoded;
    num = Math.floor(num / length);
  } while (num > 0);

  return encoded;
}

/**
 * Return the integer value specified by the given string.
 *
 * @param {String} str The string to convert.
 * @returns {Number} The integer value represented by the string.
 * @api public
 */
function decode(str) {
  var decoded = 0;

  for (i = 0; i < str.length; i++) {
    decoded = decoded * length + map[str.charAt(i)];
  }

  return decoded;
}

/**
 * Yeast: A tiny growing id generator.
 *
 * @returns {String} A unique id.
 * @api public
 */
function yeast() {
  var now = encode(+new Date());

  if (now !== prev) return seed = 0, prev = now;
  return now +'.'+ encode(seed++);
}

//
// Map each character to its index.
//
for (; i < length; i++) map[alphabet[i]] = i;

//
// Expose the `yeast`, `encode` and `decode` functions.
//
yeast.encode = encode;
yeast.decode = decode;
module.exports = yeast;

},{}],31:[function(_dereq_,module,exports){

/**
 * Module dependencies.
 */

var url = _dereq_('./url');
var parser = _dereq_('socket.io-parser');
var Manager = _dereq_('./manager');
var debug = _dereq_('debug')('socket.io-client');

/**
 * Module exports.
 */

module.exports = exports = lookup;

/**
 * Managers cache.
 */

var cache = exports.managers = {};

/**
 * Looks up an existing `Manager` for multiplexing.
 * If the user summons:
 *
 *   `io('http://localhost/a');`
 *   `io('http://localhost/b');`
 *
 * We reuse the existing instance based on same scheme/port/host,
 * and we initialize sockets for each namespace.
 *
 * @api public
 */

function lookup(uri, opts) {
  if (typeof uri == 'object') {
    opts = uri;
    uri = undefined;
  }

  opts = opts || {};

  var parsed = url(uri);
  var source = parsed.source;
  var id = parsed.id;
  var path = parsed.path;
  var sameNamespace = cache[id] && path in cache[id].nsps;
  var newConnection = opts.forceNew || opts['force new connection'] ||
                      false === opts.multiplex || sameNamespace;

  var io;

  if (newConnection) {
    debug('ignoring socket cache for %s', source);
    io = Manager(source, opts);
  } else {
    if (!cache[id]) {
      debug('new io instance for %s', source);
      cache[id] = Manager(source, opts);
    }
    io = cache[id];
  }

  return io.socket(parsed.path);
}

/**
 * Protocol version.
 *
 * @api public
 */

exports.protocol = parser.protocol;

/**
 * `connect`.
 *
 * @param {String} uri
 * @api public
 */

exports.connect = lookup;

/**
 * Expose constructors for standalone build.
 *
 * @api public
 */

exports.Manager = _dereq_('./manager');
exports.Socket = _dereq_('./socket');

},{"./manager":32,"./socket":34,"./url":35,"debug":39,"socket.io-parser":47}],32:[function(_dereq_,module,exports){

/**
 * Module dependencies.
 */

var eio = _dereq_('engine.io-client');
var Socket = _dereq_('./socket');
var Emitter = _dereq_('component-emitter');
var parser = _dereq_('socket.io-parser');
var on = _dereq_('./on');
var bind = _dereq_('component-bind');
var debug = _dereq_('debug')('socket.io-client:manager');
var indexOf = _dereq_('indexof');
var Backoff = _dereq_('backo2');

/**
 * IE6+ hasOwnProperty
 */

var has = Object.prototype.hasOwnProperty;

/**
 * Module exports
 */

module.exports = Manager;

/**
 * `Manager` constructor.
 *
 * @param {String} engine instance or engine uri/opts
 * @param {Object} options
 * @api public
 */

function Manager(uri, opts){
  if (!(this instanceof Manager)) return new Manager(uri, opts);
  if (uri && ('object' == typeof uri)) {
    opts = uri;
    uri = undefined;
  }
  opts = opts || {};

  opts.path = opts.path || '/socket.io';
  this.nsps = {};
  this.subs = [];
  this.opts = opts;
  this.reconnection(opts.reconnection !== false);
  this.reconnectionAttempts(opts.reconnectionAttempts || Infinity);
  this.reconnectionDelay(opts.reconnectionDelay || 1000);
  this.reconnectionDelayMax(opts.reconnectionDelayMax || 5000);
  this.randomizationFactor(opts.randomizationFactor || 0.5);
  this.backoff = new Backoff({
    min: this.reconnectionDelay(),
    max: this.reconnectionDelayMax(),
    jitter: this.randomizationFactor()
  });
  this.timeout(null == opts.timeout ? 20000 : opts.timeout);
  this.readyState = 'closed';
  this.uri = uri;
  this.connecting = [];
  this.lastPing = null;
  this.encoding = false;
  this.packetBuffer = [];
  this.encoder = new parser.Encoder();
  this.decoder = new parser.Decoder();
  this.autoConnect = opts.autoConnect !== false;
  if (this.autoConnect) this.open();
}

/**
 * Propagate given event to sockets and emit on `this`
 *
 * @api private
 */

Manager.prototype.emitAll = function() {
  this.emit.apply(this, arguments);
  for (var nsp in this.nsps) {
    if (has.call(this.nsps, nsp)) {
      this.nsps[nsp].emit.apply(this.nsps[nsp], arguments);
    }
  }
};

/**
 * Update `socket.id` of all sockets
 *
 * @api private
 */

Manager.prototype.updateSocketIds = function(){
  for (var nsp in this.nsps) {
    if (has.call(this.nsps, nsp)) {
      this.nsps[nsp].id = this.engine.id;
    }
  }
};

/**
 * Mix in `Emitter`.
 */

Emitter(Manager.prototype);

/**
 * Sets the `reconnection` config.
 *
 * @param {Boolean} true/false if it should automatically reconnect
 * @return {Manager} self or value
 * @api public
 */

Manager.prototype.reconnection = function(v){
  if (!arguments.length) return this._reconnection;
  this._reconnection = !!v;
  return this;
};

/**
 * Sets the reconnection attempts config.
 *
 * @param {Number} max reconnection attempts before giving up
 * @return {Manager} self or value
 * @api public
 */

Manager.prototype.reconnectionAttempts = function(v){
  if (!arguments.length) return this._reconnectionAttempts;
  this._reconnectionAttempts = v;
  return this;
};

/**
 * Sets the delay between reconnections.
 *
 * @param {Number} delay
 * @return {Manager} self or value
 * @api public
 */

Manager.prototype.reconnectionDelay = function(v){
  if (!arguments.length) return this._reconnectionDelay;
  this._reconnectionDelay = v;
  this.backoff && this.backoff.setMin(v);
  return this;
};

Manager.prototype.randomizationFactor = function(v){
  if (!arguments.length) return this._randomizationFactor;
  this._randomizationFactor = v;
  this.backoff && this.backoff.setJitter(v);
  return this;
};

/**
 * Sets the maximum delay between reconnections.
 *
 * @param {Number} delay
 * @return {Manager} self or value
 * @api public
 */

Manager.prototype.reconnectionDelayMax = function(v){
  if (!arguments.length) return this._reconnectionDelayMax;
  this._reconnectionDelayMax = v;
  this.backoff && this.backoff.setMax(v);
  return this;
};

/**
 * Sets the connection timeout. `false` to disable
 *
 * @return {Manager} self or value
 * @api public
 */

Manager.prototype.timeout = function(v){
  if (!arguments.length) return this._timeout;
  this._timeout = v;
  return this;
};

/**
 * Starts trying to reconnect if reconnection is enabled and we have not
 * started reconnecting yet
 *
 * @api private
 */

Manager.prototype.maybeReconnectOnOpen = function() {
  // Only try to reconnect if it's the first time we're connecting
  if (!this.reconnecting && this._reconnection && this.backoff.attempts === 0) {
    // keeps reconnection from firing twice for the same reconnection loop
    this.reconnect();
  }
};


/**
 * Sets the current transport `socket`.
 *
 * @param {Function} optional, callback
 * @return {Manager} self
 * @api public
 */

Manager.prototype.open =
Manager.prototype.connect = function(fn){
  debug('readyState %s', this.readyState);
  if (~this.readyState.indexOf('open')) return this;

  debug('opening %s', this.uri);
  this.engine = eio(this.uri, this.opts);
  var socket = this.engine;
  var self = this;
  this.readyState = 'opening';
  this.skipReconnect = false;

  // emit `open`
  var openSub = on(socket, 'open', function() {
    self.onopen();
    fn && fn();
  });

  // emit `connect_error`
  var errorSub = on(socket, 'error', function(data){
    debug('connect_error');
    self.cleanup();
    self.readyState = 'closed';
    self.emitAll('connect_error', data);
    if (fn) {
      var err = new Error('Connection error');
      err.data = data;
      fn(err);
    } else {
      // Only do this if there is no fn to handle the error
      self.maybeReconnectOnOpen();
    }
  });

  // emit `connect_timeout`
  if (false !== this._timeout) {
    var timeout = this._timeout;
    debug('connect attempt will timeout after %d', timeout);

    // set timer
    var timer = setTimeout(function(){
      debug('connect attempt timed out after %d', timeout);
      openSub.destroy();
      socket.close();
      socket.emit('error', 'timeout');
      self.emitAll('connect_timeout', timeout);
    }, timeout);

    this.subs.push({
      destroy: function(){
        clearTimeout(timer);
      }
    });
  }

  this.subs.push(openSub);
  this.subs.push(errorSub);

  return this;
};

/**
 * Called upon transport open.
 *
 * @api private
 */

Manager.prototype.onopen = function(){
  debug('open');

  // clear old subs
  this.cleanup();

  // mark as open
  this.readyState = 'open';
  this.emit('open');

  // add new subs
  var socket = this.engine;
  this.subs.push(on(socket, 'data', bind(this, 'ondata')));
  this.subs.push(on(socket, 'ping', bind(this, 'onping')));
  this.subs.push(on(socket, 'pong', bind(this, 'onpong')));
  this.subs.push(on(socket, 'error', bind(this, 'onerror')));
  this.subs.push(on(socket, 'close', bind(this, 'onclose')));
  this.subs.push(on(this.decoder, 'decoded', bind(this, 'ondecoded')));
};

/**
 * Called upon a ping.
 *
 * @api private
 */

Manager.prototype.onping = function(){
  this.lastPing = new Date;
  this.emitAll('ping');
};

/**
 * Called upon a packet.
 *
 * @api private
 */

Manager.prototype.onpong = function(){
  this.emitAll('pong', new Date - this.lastPing);
};

/**
 * Called with data.
 *
 * @api private
 */

Manager.prototype.ondata = function(data){
  this.decoder.add(data);
};

/**
 * Called when parser fully decodes a packet.
 *
 * @api private
 */

Manager.prototype.ondecoded = function(packet) {
  this.emit('packet', packet);
};

/**
 * Called upon socket error.
 *
 * @api private
 */

Manager.prototype.onerror = function(err){
  debug('error', err);
  this.emitAll('error', err);
};

/**
 * Creates a new socket for the given `nsp`.
 *
 * @return {Socket}
 * @api public
 */

Manager.prototype.socket = function(nsp){
  var socket = this.nsps[nsp];
  if (!socket) {
    socket = new Socket(this, nsp);
    this.nsps[nsp] = socket;
    var self = this;
    socket.on('connecting', onConnecting);
    socket.on('connect', function(){
      socket.id = self.engine.id;
    });

    if (this.autoConnect) {
      // manually call here since connecting evnet is fired before listening
      onConnecting();
    }
  }

  function onConnecting() {
    if (!~indexOf(self.connecting, socket)) {
      self.connecting.push(socket);
    }
  }

  return socket;
};

/**
 * Called upon a socket close.
 *
 * @param {Socket} socket
 */

Manager.prototype.destroy = function(socket){
  var index = indexOf(this.connecting, socket);
  if (~index) this.connecting.splice(index, 1);
  if (this.connecting.length) return;

  this.close();
};

/**
 * Writes a packet.
 *
 * @param {Object} packet
 * @api private
 */

Manager.prototype.packet = function(packet){
  debug('writing packet %j', packet);
  var self = this;

  if (!self.encoding) {
    // encode, then write to engine with result
    self.encoding = true;
    this.encoder.encode(packet, function(encodedPackets) {
      for (var i = 0; i < encodedPackets.length; i++) {
        self.engine.write(encodedPackets[i], packet.options);
      }
      self.encoding = false;
      self.processPacketQueue();
    });
  } else { // add packet to the queue
    self.packetBuffer.push(packet);
  }
};

/**
 * If packet buffer is non-empty, begins encoding the
 * next packet in line.
 *
 * @api private
 */

Manager.prototype.processPacketQueue = function() {
  if (this.packetBuffer.length > 0 && !this.encoding) {
    var pack = this.packetBuffer.shift();
    this.packet(pack);
  }
};

/**
 * Clean up transport subscriptions and packet buffer.
 *
 * @api private
 */

Manager.prototype.cleanup = function(){
  debug('cleanup');

  var sub;
  while (sub = this.subs.shift()) sub.destroy();

  this.packetBuffer = [];
  this.encoding = false;
  this.lastPing = null;

  this.decoder.destroy();
};

/**
 * Close the current socket.
 *
 * @api private
 */

Manager.prototype.close =
Manager.prototype.disconnect = function(){
  debug('disconnect');
  this.skipReconnect = true;
  this.reconnecting = false;
  if ('opening' == this.readyState) {
    // `onclose` will not fire because
    // an open event never happened
    this.cleanup();
  }
  this.backoff.reset();
  this.readyState = 'closed';
  if (this.engine) this.engine.close();
};

/**
 * Called upon engine close.
 *
 * @api private
 */

Manager.prototype.onclose = function(reason){
  debug('onclose');

  this.cleanup();
  this.backoff.reset();
  this.readyState = 'closed';
  this.emit('close', reason);

  if (this._reconnection && !this.skipReconnect) {
    this.reconnect();
  }
};

/**
 * Attempt a reconnection.
 *
 * @api private
 */

Manager.prototype.reconnect = function(){
  if (this.reconnecting || this.skipReconnect) return this;

  var self = this;

  if (this.backoff.attempts >= this._reconnectionAttempts) {
    debug('reconnect failed');
    this.backoff.reset();
    this.emitAll('reconnect_failed');
    this.reconnecting = false;
  } else {
    var delay = this.backoff.duration();
    debug('will wait %dms before reconnect attempt', delay);

    this.reconnecting = true;
    var timer = setTimeout(function(){
      if (self.skipReconnect) return;

      debug('attempting reconnect');
      self.emitAll('reconnect_attempt', self.backoff.attempts);
      self.emitAll('reconnecting', self.backoff.attempts);

      // check again for the case socket closed in above events
      if (self.skipReconnect) return;

      self.open(function(err){
        if (err) {
          debug('reconnect attempt error');
          self.reconnecting = false;
          self.reconnect();
          self.emitAll('reconnect_error', err.data);
        } else {
          debug('reconnect success');
          self.onreconnect();
        }
      });
    }, delay);

    this.subs.push({
      destroy: function(){
        clearTimeout(timer);
      }
    });
  }
};

/**
 * Called upon successful reconnect.
 *
 * @api private
 */

Manager.prototype.onreconnect = function(){
  var attempt = this.backoff.attempts;
  this.reconnecting = false;
  this.backoff.reset();
  this.updateSocketIds();
  this.emitAll('reconnect', attempt);
};

},{"./on":33,"./socket":34,"backo2":36,"component-bind":37,"component-emitter":38,"debug":39,"engine.io-client":1,"indexof":42,"socket.io-parser":47}],33:[function(_dereq_,module,exports){

/**
 * Module exports.
 */

module.exports = on;

/**
 * Helper for subscriptions.
 *
 * @param {Object|EventEmitter} obj with `Emitter` mixin or `EventEmitter`
 * @param {String} event name
 * @param {Function} callback
 * @api public
 */

function on(obj, ev, fn) {
  obj.on(ev, fn);
  return {
    destroy: function(){
      obj.removeListener(ev, fn);
    }
  };
}

},{}],34:[function(_dereq_,module,exports){

/**
 * Module dependencies.
 */

var parser = _dereq_('socket.io-parser');
var Emitter = _dereq_('component-emitter');
var toArray = _dereq_('to-array');
var on = _dereq_('./on');
var bind = _dereq_('component-bind');
var debug = _dereq_('debug')('socket.io-client:socket');
var hasBin = _dereq_('has-binary');

/**
 * Module exports.
 */

module.exports = exports = Socket;

/**
 * Internal events (blacklisted).
 * These events can't be emitted by the user.
 *
 * @api private
 */

var events = {
  connect: 1,
  connect_error: 1,
  connect_timeout: 1,
  connecting: 1,
  disconnect: 1,
  error: 1,
  reconnect: 1,
  reconnect_attempt: 1,
  reconnect_failed: 1,
  reconnect_error: 1,
  reconnecting: 1,
  ping: 1,
  pong: 1
};

/**
 * Shortcut to `Emitter#emit`.
 */

var emit = Emitter.prototype.emit;

/**
 * `Socket` constructor.
 *
 * @api public
 */

function Socket(io, nsp){
  this.io = io;
  this.nsp = nsp;
  this.json = this; // compat
  this.ids = 0;
  this.acks = {};
  this.receiveBuffer = [];
  this.sendBuffer = [];
  this.connected = false;
  this.disconnected = true;
  if (this.io.autoConnect) this.open();
}

/**
 * Mix in `Emitter`.
 */

Emitter(Socket.prototype);

/**
 * Subscribe to open, close and packet events
 *
 * @api private
 */

Socket.prototype.subEvents = function() {
  if (this.subs) return;

  var io = this.io;
  this.subs = [
    on(io, 'open', bind(this, 'onopen')),
    on(io, 'packet', bind(this, 'onpacket')),
    on(io, 'close', bind(this, 'onclose'))
  ];
};

/**
 * "Opens" the socket.
 *
 * @api public
 */

Socket.prototype.open =
Socket.prototype.connect = function(){
  if (this.connected) return this;

  this.subEvents();
  this.io.open(); // ensure open
  if ('open' == this.io.readyState) this.onopen();
  this.emit('connecting');
  return this;
};

/**
 * Sends a `message` event.
 *
 * @return {Socket} self
 * @api public
 */

Socket.prototype.send = function(){
  var args = toArray(arguments);
  args.unshift('message');
  this.emit.apply(this, args);
  return this;
};

/**
 * Override `emit`.
 * If the event is in `events`, it's emitted normally.
 *
 * @param {String} event name
 * @return {Socket} self
 * @api public
 */

Socket.prototype.emit = function(ev){
  if (events.hasOwnProperty(ev)) {
    emit.apply(this, arguments);
    return this;
  }

  var args = toArray(arguments);
  var parserType = parser.EVENT; // default
  if (hasBin(args)) { parserType = parser.BINARY_EVENT; } // binary
  var packet = { type: parserType, data: args };

  packet.options = {};
  packet.options.compress = !this.flags || false !== this.flags.compress;

  // event ack callback
  if ('function' == typeof args[args.length - 1]) {
    debug('emitting packet with ack id %d', this.ids);
    this.acks[this.ids] = args.pop();
    packet.id = this.ids++;
  }

  if (this.connected) {
    this.packet(packet);
  } else {
    this.sendBuffer.push(packet);
  }

  delete this.flags;

  return this;
};

/**
 * Sends a packet.
 *
 * @param {Object} packet
 * @api private
 */

Socket.prototype.packet = function(packet){
  packet.nsp = this.nsp;
  this.io.packet(packet);
};

/**
 * Called upon engine `open`.
 *
 * @api private
 */

Socket.prototype.onopen = function(){
  debug('transport is open - connecting');

  // write connect packet if necessary
  if ('/' != this.nsp) {
    this.packet({ type: parser.CONNECT });
  }
};

/**
 * Called upon engine `close`.
 *
 * @param {String} reason
 * @api private
 */

Socket.prototype.onclose = function(reason){
  debug('close (%s)', reason);
  this.connected = false;
  this.disconnected = true;
  delete this.id;
  this.emit('disconnect', reason);
};

/**
 * Called with socket packet.
 *
 * @param {Object} packet
 * @api private
 */

Socket.prototype.onpacket = function(packet){
  if (packet.nsp != this.nsp) return;

  switch (packet.type) {
    case parser.CONNECT:
      this.onconnect();
      break;

    case parser.EVENT:
      this.onevent(packet);
      break;

    case parser.BINARY_EVENT:
      this.onevent(packet);
      break;

    case parser.ACK:
      this.onack(packet);
      break;

    case parser.BINARY_ACK:
      this.onack(packet);
      break;

    case parser.DISCONNECT:
      this.ondisconnect();
      break;

    case parser.ERROR:
      this.emit('error', packet.data);
      break;
  }
};

/**
 * Called upon a server event.
 *
 * @param {Object} packet
 * @api private
 */

Socket.prototype.onevent = function(packet){
  var args = packet.data || [];
  debug('emitting event %j', args);

  if (null != packet.id) {
    debug('attaching ack callback to event');
    args.push(this.ack(packet.id));
  }

  if (this.connected) {
    emit.apply(this, args);
  } else {
    this.receiveBuffer.push(args);
  }
};

/**
 * Produces an ack callback to emit with an event.
 *
 * @api private
 */

Socket.prototype.ack = function(id){
  var self = this;
  var sent = false;
  return function(){
    // prevent double callbacks
    if (sent) return;
    sent = true;
    var args = toArray(arguments);
    debug('sending ack %j', args);

    var type = hasBin(args) ? parser.BINARY_ACK : parser.ACK;
    self.packet({
      type: type,
      id: id,
      data: args
    });
  };
};

/**
 * Called upon a server acknowlegement.
 *
 * @param {Object} packet
 * @api private
 */

Socket.prototype.onack = function(packet){
  var ack = this.acks[packet.id];
  if ('function' == typeof ack) {
    debug('calling ack %s with %j', packet.id, packet.data);
    ack.apply(this, packet.data);
    delete this.acks[packet.id];
  } else {
    debug('bad ack %s', packet.id);
  }
};

/**
 * Called upon server connect.
 *
 * @api private
 */

Socket.prototype.onconnect = function(){
  this.connected = true;
  this.disconnected = false;
  this.emit('connect');
  this.emitBuffered();
};

/**
 * Emit buffered events (received and emitted).
 *
 * @api private
 */

Socket.prototype.emitBuffered = function(){
  var i;
  for (i = 0; i < this.receiveBuffer.length; i++) {
    emit.apply(this, this.receiveBuffer[i]);
  }
  this.receiveBuffer = [];

  for (i = 0; i < this.sendBuffer.length; i++) {
    this.packet(this.sendBuffer[i]);
  }
  this.sendBuffer = [];
};

/**
 * Called upon server disconnect.
 *
 * @api private
 */

Socket.prototype.ondisconnect = function(){
  debug('server disconnect (%s)', this.nsp);
  this.destroy();
  this.onclose('io server disconnect');
};

/**
 * Called upon forced client/server side disconnections,
 * this method ensures the manager stops tracking us and
 * that reconnections don't get triggered for this.
 *
 * @api private.
 */

Socket.prototype.destroy = function(){
  if (this.subs) {
    // clean subscriptions to avoid reconnections
    for (var i = 0; i < this.subs.length; i++) {
      this.subs[i].destroy();
    }
    this.subs = null;
  }

  this.io.destroy(this);
};

/**
 * Disconnects the socket manually.
 *
 * @return {Socket} self
 * @api public
 */

Socket.prototype.close =
Socket.prototype.disconnect = function(){
  if (this.connected) {
    debug('performing disconnect (%s)', this.nsp);
    this.packet({ type: parser.DISCONNECT });
  }

  // remove socket from pool
  this.destroy();

  if (this.connected) {
    // fire events
    this.onclose('io client disconnect');
  }
  return this;
};

/**
 * Sets the compress flag.
 *
 * @param {Boolean} if `true`, compresses the sending data
 * @return {Socket} self
 * @api public
 */

Socket.prototype.compress = function(compress){
  this.flags = this.flags || {};
  this.flags.compress = compress;
  return this;
};

},{"./on":33,"component-bind":37,"component-emitter":38,"debug":39,"has-binary":41,"socket.io-parser":47,"to-array":51}],35:[function(_dereq_,module,exports){
(function (global){

/**
 * Module dependencies.
 */

var parseuri = _dereq_('parseuri');
var debug = _dereq_('debug')('socket.io-client:url');

/**
 * Module exports.
 */

module.exports = url;

/**
 * URL parser.
 *
 * @param {String} url
 * @param {Object} An object meant to mimic window.location.
 *                 Defaults to window.location.
 * @api public
 */

function url(uri, loc){
  var obj = uri;

  // default to window.location
  var loc = loc || global.location;
  if (null == uri) uri = loc.protocol + '//' + loc.host;

  // relative path support
  if ('string' == typeof uri) {
    if ('/' == uri.charAt(0)) {
      if ('/' == uri.charAt(1)) {
        uri = loc.protocol + uri;
      } else {
        uri = loc.host + uri;
      }
    }

    if (!/^(https?|wss?):\/\//.test(uri)) {
      debug('protocol-less url %s', uri);
      if ('undefined' != typeof loc) {
        uri = loc.protocol + '//' + uri;
      } else {
        uri = 'https://' + uri;
      }
    }

    // parse
    debug('parse %s', uri);
    obj = parseuri(uri);
  }

  // make sure we treat `localhost:80` and `localhost` equally
  if (!obj.port) {
    if (/^(http|ws)$/.test(obj.protocol)) {
      obj.port = '80';
    }
    else if (/^(http|ws)s$/.test(obj.protocol)) {
      obj.port = '443';
    }
  }

  obj.path = obj.path || '/';

  var ipv6 = obj.host.indexOf(':') !== -1;
  var host = ipv6 ? '[' + obj.host + ']' : obj.host;

  // define unique id
  obj.id = obj.protocol + '://' + host + ':' + obj.port;
  // define href
  obj.href = obj.protocol + '://' + host + (loc && loc.port == obj.port ? '' : (':' + obj.port));

  return obj;
}

}).call(this,typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : typeof global !== "undefined" ? global : {})
},{"debug":39,"parseuri":45}],36:[function(_dereq_,module,exports){

/**
 * Expose `Backoff`.
 */

module.exports = Backoff;

/**
 * Initialize backoff timer with `opts`.
 *
 * - `min` initial timeout in milliseconds [100]
 * - `max` max timeout [10000]
 * - `jitter` [0]
 * - `factor` [2]
 *
 * @param {Object} opts
 * @api public
 */

function Backoff(opts) {
  opts = opts || {};
  this.ms = opts.min || 100;
  this.max = opts.max || 10000;
  this.factor = opts.factor || 2;
  this.jitter = opts.jitter > 0 && opts.jitter <= 1 ? opts.jitter : 0;
  this.attempts = 0;
}

/**
 * Return the backoff duration.
 *
 * @return {Number}
 * @api public
 */

Backoff.prototype.duration = function(){
  var ms = this.ms * Math.pow(this.factor, this.attempts++);
  if (this.jitter) {
    var rand =  Math.random();
    var deviation = Math.floor(rand * this.jitter * ms);
    ms = (Math.floor(rand * 10) & 1) == 0  ? ms - deviation : ms + deviation;
  }
  return Math.min(ms, this.max) | 0;
};

/**
 * Reset the number of attempts.
 *
 * @api public
 */

Backoff.prototype.reset = function(){
  this.attempts = 0;
};

/**
 * Set the minimum duration
 *
 * @api public
 */

Backoff.prototype.setMin = function(min){
  this.ms = min;
};

/**
 * Set the maximum duration
 *
 * @api public
 */

Backoff.prototype.setMax = function(max){
  this.max = max;
};

/**
 * Set the jitter
 *
 * @api public
 */

Backoff.prototype.setJitter = function(jitter){
  this.jitter = jitter;
};


},{}],37:[function(_dereq_,module,exports){
/**
 * Slice reference.
 */

var slice = [].slice;

/**
 * Bind `obj` to `fn`.
 *
 * @param {Object} obj
 * @param {Function|String} fn or string
 * @return {Function}
 * @api public
 */

module.exports = function(obj, fn){
  if ('string' == typeof fn) fn = obj[fn];
  if ('function' != typeof fn) throw new Error('bind() requires a function');
  var args = slice.call(arguments, 2);
  return function(){
    return fn.apply(obj, args.concat(slice.call(arguments)));
  }
};

},{}],38:[function(_dereq_,module,exports){

/**
 * Expose `Emitter`.
 */

module.exports = Emitter;

/**
 * Initialize a new `Emitter`.
 *
 * @api public
 */

function Emitter(obj) {
  if (obj) return mixin(obj);
};

/**
 * Mixin the emitter properties.
 *
 * @param {Object} obj
 * @return {Object}
 * @api private
 */

function mixin(obj) {
  for (var key in Emitter.prototype) {
    obj[key] = Emitter.prototype[key];
  }
  return obj;
}

/**
 * Listen on the given `event` with `fn`.
 *
 * @param {String} event
 * @param {Function} fn
 * @return {Emitter}
 * @api public
 */

Emitter.prototype.on =
Emitter.prototype.addEventListener = function(event, fn){
  this._callbacks = this._callbacks || {};
  (this._callbacks['$' + event] = this._callbacks['$' + event] || [])
    .push(fn);
  return this;
};

/**
 * Adds an `event` listener that will be invoked a single
 * time then automatically removed.
 *
 * @param {String} event
 * @param {Function} fn
 * @return {Emitter}
 * @api public
 */

Emitter.prototype.once = function(event, fn){
  function on() {
    this.off(event, on);
    fn.apply(this, arguments);
  }

  on.fn = fn;
  this.on(event, on);
  return this;
};

/**
 * Remove the given callback for `event` or all
 * registered callbacks.
 *
 * @param {String} event
 * @param {Function} fn
 * @return {Emitter}
 * @api public
 */

Emitter.prototype.off =
Emitter.prototype.removeListener =
Emitter.prototype.removeAllListeners =
Emitter.prototype.removeEventListener = function(event, fn){
  this._callbacks = this._callbacks || {};

  // all
  if (0 == arguments.length) {
    this._callbacks = {};
    return this;
  }

  // specific event
  var callbacks = this._callbacks['$' + event];
  if (!callbacks) return this;

  // remove all handlers
  if (1 == arguments.length) {
    delete this._callbacks['$' + event];
    return this;
  }

  // remove specific handler
  var cb;
  for (var i = 0; i < callbacks.length; i++) {
    cb = callbacks[i];
    if (cb === fn || cb.fn === fn) {
      callbacks.splice(i, 1);
      break;
    }
  }
  return this;
};

/**
 * Emit `event` with the given args.
 *
 * @param {String} event
 * @param {Mixed} ...
 * @return {Emitter}
 */

Emitter.prototype.emit = function(event){
  this._callbacks = this._callbacks || {};
  var args = [].slice.call(arguments, 1)
    , callbacks = this._callbacks['$' + event];

  if (callbacks) {
    callbacks = callbacks.slice(0);
    for (var i = 0, len = callbacks.length; i < len; ++i) {
      callbacks[i].apply(this, args);
    }
  }

  return this;
};

/**
 * Return array of callbacks for `event`.
 *
 * @param {String} event
 * @return {Array}
 * @api public
 */

Emitter.prototype.listeners = function(event){
  this._callbacks = this._callbacks || {};
  return this._callbacks['$' + event] || [];
};

/**
 * Check if this emitter has `event` handlers.
 *
 * @param {String} event
 * @return {Boolean}
 * @api public
 */

Emitter.prototype.hasListeners = function(event){
  return !! this.listeners(event).length;
};

},{}],39:[function(_dereq_,module,exports){
arguments[4][17][0].apply(exports,arguments)
},{"./debug":40,"dup":17}],40:[function(_dereq_,module,exports){
arguments[4][18][0].apply(exports,arguments)
},{"dup":18,"ms":44}],41:[function(_dereq_,module,exports){
(function (global){

/*
 * Module requirements.
 */

var isArray = _dereq_('isarray');

/**
 * Module exports.
 */

module.exports = hasBinary;

/**
 * Checks for binary data.
 *
 * Right now only Buffer and ArrayBuffer are supported..
 *
 * @param {Object} anything
 * @api public
 */

function hasBinary(data) {

  function _hasBinary(obj) {
    if (!obj) return false;

    if ( (global.Buffer && global.Buffer.isBuffer && global.Buffer.isBuffer(obj)) ||
         (global.ArrayBuffer && obj instanceof ArrayBuffer) ||
         (global.Blob && obj instanceof Blob) ||
         (global.File && obj instanceof File)
        ) {
      return true;
    }

    if (isArray(obj)) {
      for (var i = 0; i < obj.length; i++) {
          if (_hasBinary(obj[i])) {
              return true;
          }
      }
    } else if (obj && 'object' == typeof obj) {
      // see: https://github.com/Automattic/has-binary/pull/4
      if (obj.toJSON && 'function' == typeof obj.toJSON) {
        obj = obj.toJSON();
      }

      for (var key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key) && _hasBinary(obj[key])) {
          return true;
        }
      }
    }

    return false;
  }

  return _hasBinary(data);
}

}).call(this,typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : typeof global !== "undefined" ? global : {})
},{"isarray":43}],42:[function(_dereq_,module,exports){
arguments[4][23][0].apply(exports,arguments)
},{"dup":23}],43:[function(_dereq_,module,exports){
arguments[4][24][0].apply(exports,arguments)
},{"dup":24}],44:[function(_dereq_,module,exports){
arguments[4][25][0].apply(exports,arguments)
},{"dup":25}],45:[function(_dereq_,module,exports){
arguments[4][28][0].apply(exports,arguments)
},{"dup":28}],46:[function(_dereq_,module,exports){
(function (global){
/*global Blob,File*/

/**
 * Module requirements
 */

var isArray = _dereq_('isarray');
var isBuf = _dereq_('./is-buffer');

/**
 * Replaces every Buffer | ArrayBuffer in packet with a numbered placeholder.
 * Anything with blobs or files should be fed through removeBlobs before coming
 * here.
 *
 * @param {Object} packet - socket.io event packet
 * @return {Object} with deconstructed packet and list of buffers
 * @api public
 */

exports.deconstructPacket = function(packet){
  var buffers = [];
  var packetData = packet.data;

  function _deconstructPacket(data) {
    if (!data) return data;

    if (isBuf(data)) {
      var placeholder = { _placeholder: true, num: buffers.length };
      buffers.push(data);
      return placeholder;
    } else if (isArray(data)) {
      var newData = new Array(data.length);
      for (var i = 0; i < data.length; i++) {
        newData[i] = _deconstructPacket(data[i]);
      }
      return newData;
    } else if ('object' == typeof data && !(data instanceof Date)) {
      var newData = {};
      for (var key in data) {
        newData[key] = _deconstructPacket(data[key]);
      }
      return newData;
    }
    return data;
  }

  var pack = packet;
  pack.data = _deconstructPacket(packetData);
  pack.attachments = buffers.length; // number of binary 'attachments'
  return {packet: pack, buffers: buffers};
};

/**
 * Reconstructs a binary packet from its placeholder packet and buffers
 *
 * @param {Object} packet - event packet with placeholders
 * @param {Array} buffers - binary buffers to put in placeholder positions
 * @return {Object} reconstructed packet
 * @api public
 */

exports.reconstructPacket = function(packet, buffers) {
  var curPlaceHolder = 0;

  function _reconstructPacket(data) {
    if (data && data._placeholder) {
      var buf = buffers[data.num]; // appropriate buffer (should be natural order anyway)
      return buf;
    } else if (isArray(data)) {
      for (var i = 0; i < data.length; i++) {
        data[i] = _reconstructPacket(data[i]);
      }
      return data;
    } else if (data && 'object' == typeof data) {
      for (var key in data) {
        data[key] = _reconstructPacket(data[key]);
      }
      return data;
    }
    return data;
  }

  packet.data = _reconstructPacket(packet.data);
  packet.attachments = undefined; // no longer useful
  return packet;
};

/**
 * Asynchronously removes Blobs or Files from data via
 * FileReader's readAsArrayBuffer method. Used before encoding
 * data as msgpack. Calls callback with the blobless data.
 *
 * @param {Object} data
 * @param {Function} callback
 * @api private
 */

exports.removeBlobs = function(data, callback) {
  function _removeBlobs(obj, curKey, containingObject) {
    if (!obj) return obj;

    // convert any blob
    if ((global.Blob && obj instanceof Blob) ||
        (global.File && obj instanceof File)) {
      pendingBlobs++;

      // async filereader
      var fileReader = new FileReader();
      fileReader.onload = function() { // this.result == arraybuffer
        if (containingObject) {
          containingObject[curKey] = this.result;
        }
        else {
          bloblessData = this.result;
        }

        // if nothing pending its callback time
        if(! --pendingBlobs) {
          callback(bloblessData);
        }
      };

      fileReader.readAsArrayBuffer(obj); // blob -> arraybuffer
    } else if (isArray(obj)) { // handle array
      for (var i = 0; i < obj.length; i++) {
        _removeBlobs(obj[i], i, obj);
      }
    } else if (obj && 'object' == typeof obj && !isBuf(obj)) { // and object
      for (var key in obj) {
        _removeBlobs(obj[key], key, obj);
      }
    }
  }

  var pendingBlobs = 0;
  var bloblessData = data;
  _removeBlobs(bloblessData);
  if (!pendingBlobs) {
    callback(bloblessData);
  }
};

}).call(this,typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : typeof global !== "undefined" ? global : {})
},{"./is-buffer":48,"isarray":43}],47:[function(_dereq_,module,exports){

/**
 * Module dependencies.
 */

var debug = _dereq_('debug')('socket.io-parser');
var json = _dereq_('json3');
var isArray = _dereq_('isarray');
var Emitter = _dereq_('component-emitter');
var binary = _dereq_('./binary');
var isBuf = _dereq_('./is-buffer');

/**
 * Protocol version.
 *
 * @api public
 */

exports.protocol = 4;

/**
 * Packet types.
 *
 * @api public
 */

exports.types = [
  'CONNECT',
  'DISCONNECT',
  'EVENT',
  'BINARY_EVENT',
  'ACK',
  'BINARY_ACK',
  'ERROR'
];

/**
 * Packet type `connect`.
 *
 * @api public
 */

exports.CONNECT = 0;

/**
 * Packet type `disconnect`.
 *
 * @api public
 */

exports.DISCONNECT = 1;

/**
 * Packet type `event`.
 *
 * @api public
 */

exports.EVENT = 2;

/**
 * Packet type `ack`.
 *
 * @api public
 */

exports.ACK = 3;

/**
 * Packet type `error`.
 *
 * @api public
 */

exports.ERROR = 4;

/**
 * Packet type 'binary event'
 *
 * @api public
 */

exports.BINARY_EVENT = 5;

/**
 * Packet type `binary ack`. For acks with binary arguments.
 *
 * @api public
 */

exports.BINARY_ACK = 6;

/**
 * Encoder constructor.
 *
 * @api public
 */

exports.Encoder = Encoder;

/**
 * Decoder constructor.
 *
 * @api public
 */

exports.Decoder = Decoder;

/**
 * A socket.io Encoder instance
 *
 * @api public
 */

function Encoder() {}

/**
 * Encode a packet as a single string if non-binary, or as a
 * buffer sequence, depending on packet type.
 *
 * @param {Object} obj - packet object
 * @param {Function} callback - function to handle encodings (likely engine.write)
 * @return Calls callback with Array of encodings
 * @api public
 */

Encoder.prototype.encode = function(obj, callback){
  debug('encoding packet %j', obj);

  if (exports.BINARY_EVENT == obj.type || exports.BINARY_ACK == obj.type) {
    encodeAsBinary(obj, callback);
  }
  else {
    var encoding = encodeAsString(obj);
    callback([encoding]);
  }
};

/**
 * Encode packet as string.
 *
 * @param {Object} packet
 * @return {String} encoded
 * @api private
 */

function encodeAsString(obj) {
  var str = '';
  var nsp = false;

  // first is type
  str += obj.type;

  // attachments if we have them
  if (exports.BINARY_EVENT == obj.type || exports.BINARY_ACK == obj.type) {
    str += obj.attachments;
    str += '-';
  }

  // if we have a namespace other than `/`
  // we append it followed by a comma `,`
  if (obj.nsp && '/' != obj.nsp) {
    nsp = true;
    str += obj.nsp;
  }

  // immediately followed by the id
  if (null != obj.id) {
    if (nsp) {
      str += ',';
      nsp = false;
    }
    str += obj.id;
  }

  // json data
  if (null != obj.data) {
    if (nsp) str += ',';
    str += json.stringify(obj.data);
  }

  debug('encoded %j as %s', obj, str);
  return str;
}

/**
 * Encode packet as 'buffer sequence' by removing blobs, and
 * deconstructing packet into object with placeholders and
 * a list of buffers.
 *
 * @param {Object} packet
 * @return {Buffer} encoded
 * @api private
 */

function encodeAsBinary(obj, callback) {

  function writeEncoding(bloblessData) {
    var deconstruction = binary.deconstructPacket(bloblessData);
    var pack = encodeAsString(deconstruction.packet);
    var buffers = deconstruction.buffers;

    buffers.unshift(pack); // add packet info to beginning of data list
    callback(buffers); // write all the buffers
  }

  binary.removeBlobs(obj, writeEncoding);
}

/**
 * A socket.io Decoder instance
 *
 * @return {Object} decoder
 * @api public
 */

function Decoder() {
  this.reconstructor = null;
}

/**
 * Mix in `Emitter` with Decoder.
 */

Emitter(Decoder.prototype);

/**
 * Decodes an ecoded packet string into packet JSON.
 *
 * @param {String} obj - encoded packet
 * @return {Object} packet
 * @api public
 */

Decoder.prototype.add = function(obj) {
  var packet;
  if ('string' == typeof obj) {
    packet = decodeString(obj);
    if (exports.BINARY_EVENT == packet.type || exports.BINARY_ACK == packet.type) { // binary packet's json
      this.reconstructor = new BinaryReconstructor(packet);

      // no attachments, labeled binary but no binary data to follow
      if (this.reconstructor.reconPack.attachments === 0) {
        this.emit('decoded', packet);
      }
    } else { // non-binary full packet
      this.emit('decoded', packet);
    }
  }
  else if (isBuf(obj) || obj.base64) { // raw binary data
    if (!this.reconstructor) {
      throw new Error('got binary data when not reconstructing a packet');
    } else {
      packet = this.reconstructor.takeBinaryData(obj);
      if (packet) { // received final buffer
        this.reconstructor = null;
        this.emit('decoded', packet);
      }
    }
  }
  else {
    throw new Error('Unknown type: ' + obj);
  }
};

/**
 * Decode a packet String (JSON data)
 *
 * @param {String} str
 * @return {Object} packet
 * @api private
 */

function decodeString(str) {
  var p = {};
  var i = 0;

  // look up type
  p.type = Number(str.charAt(0));
  if (null == exports.types[p.type]) return error();

  // look up attachments if type binary
  if (exports.BINARY_EVENT == p.type || exports.BINARY_ACK == p.type) {
    var buf = '';
    while (str.charAt(++i) != '-') {
      buf += str.charAt(i);
      if (i == str.length) break;
    }
    if (buf != Number(buf) || str.charAt(i) != '-') {
      throw new Error('Illegal attachments');
    }
    p.attachments = Number(buf);
  }

  // look up namespace (if any)
  if ('/' == str.charAt(i + 1)) {
    p.nsp = '';
    while (++i) {
      var c = str.charAt(i);
      if (',' == c) break;
      p.nsp += c;
      if (i == str.length) break;
    }
  } else {
    p.nsp = '/';
  }

  // look up id
  var next = str.charAt(i + 1);
  if ('' !== next && Number(next) == next) {
    p.id = '';
    while (++i) {
      var c = str.charAt(i);
      if (null == c || Number(c) != c) {
        --i;
        break;
      }
      p.id += str.charAt(i);
      if (i == str.length) break;
    }
    p.id = Number(p.id);
  }

  // look up json data
  if (str.charAt(++i)) {
    try {
      p.data = json.parse(str.substr(i));
    } catch(e){
      return error();
    }
  }

  debug('decoded %s as %j', str, p);
  return p;
}

/**
 * Deallocates a parser's resources
 *
 * @api public
 */

Decoder.prototype.destroy = function() {
  if (this.reconstructor) {
    this.reconstructor.finishedReconstruction();
  }
};

/**
 * A manager of a binary event's 'buffer sequence'. Should
 * be constructed whenever a packet of type BINARY_EVENT is
 * decoded.
 *
 * @param {Object} packet
 * @return {BinaryReconstructor} initialized reconstructor
 * @api private
 */

function BinaryReconstructor(packet) {
  this.reconPack = packet;
  this.buffers = [];
}

/**
 * Method to be called when binary data received from connection
 * after a BINARY_EVENT packet.
 *
 * @param {Buffer | ArrayBuffer} binData - the raw binary data received
 * @return {null | Object} returns null if more binary data is expected or
 *   a reconstructed packet object if all buffers have been received.
 * @api private
 */

BinaryReconstructor.prototype.takeBinaryData = function(binData) {
  this.buffers.push(binData);
  if (this.buffers.length == this.reconPack.attachments) { // done with buffer list
    var packet = binary.reconstructPacket(this.reconPack, this.buffers);
    this.finishedReconstruction();
    return packet;
  }
  return null;
};

/**
 * Cleans up binary packet reconstruction variables.
 *
 * @api private
 */

BinaryReconstructor.prototype.finishedReconstruction = function() {
  this.reconPack = null;
  this.buffers = [];
};

function error(data){
  return {
    type: exports.ERROR,
    data: 'parser error'
  };
}

},{"./binary":46,"./is-buffer":48,"component-emitter":49,"debug":39,"isarray":43,"json3":50}],48:[function(_dereq_,module,exports){
(function (global){

module.exports = isBuf;

/**
 * Returns true if obj is a buffer or an arraybuffer.
 *
 * @api private
 */

function isBuf(obj) {
  return (global.Buffer && global.Buffer.isBuffer(obj)) ||
         (global.ArrayBuffer && obj instanceof ArrayBuffer);
}

}).call(this,typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : typeof global !== "undefined" ? global : {})
},{}],49:[function(_dereq_,module,exports){
arguments[4][15][0].apply(exports,arguments)
},{"dup":15}],50:[function(_dereq_,module,exports){
(function (global){
/*! JSON v3.3.2 | http://bestiejs.github.io/json3 | Copyright 2012-2014, Kit Cambridge | http://kit.mit-license.org */
;(function () {
  // Detect the `define` function exposed by asynchronous module loaders. The
  // strict `define` check is necessary for compatibility with `r.js`.
  var isLoader = typeof define === "function" && define.amd;

  // A set of types used to distinguish objects from primitives.
  var objectTypes = {
    "function": true,
    "object": true
  };

  // Detect the `exports` object exposed by CommonJS implementations.
  var freeExports = objectTypes[typeof exports] && exports && !exports.nodeType && exports;

  // Use the `global` object exposed by Node (including Browserify via
  // `insert-module-globals`), Narwhal, and Ringo as the default context,
  // and the `window` object in browsers. Rhino exports a `global` function
  // instead.
  var root = objectTypes[typeof window] && window || this,
      freeGlobal = freeExports && objectTypes[typeof module] && module && !module.nodeType && typeof global == "object" && global;

  if (freeGlobal && (freeGlobal["global"] === freeGlobal || freeGlobal["window"] === freeGlobal || freeGlobal["self"] === freeGlobal)) {
    root = freeGlobal;
  }

  // Public: Initializes JSON 3 using the given `context` object, attaching the
  // `stringify` and `parse` functions to the specified `exports` object.
  function runInContext(context, exports) {
    context || (context = root["Object"]());
    exports || (exports = root["Object"]());

    // Native constructor aliases.
    var Number = context["Number"] || root["Number"],
        String = context["String"] || root["String"],
        Object = context["Object"] || root["Object"],
        Date = context["Date"] || root["Date"],
        SyntaxError = context["SyntaxError"] || root["SyntaxError"],
        TypeError = context["TypeError"] || root["TypeError"],
        Math = context["Math"] || root["Math"],
        nativeJSON = context["JSON"] || root["JSON"];

    // Delegate to the native `stringify` and `parse` implementations.
    if (typeof nativeJSON == "object" && nativeJSON) {
      exports.stringify = nativeJSON.stringify;
      exports.parse = nativeJSON.parse;
    }

    // Convenience aliases.
    var objectProto = Object.prototype,
        getClass = objectProto.toString,
        isProperty, forEach, undef;

    // Test the `Date#getUTC*` methods. Based on work by @Yaffle.
    var isExtended = new Date(-3509827334573292);
    try {
      // The `getUTCFullYear`, `Month`, and `Date` methods return nonsensical
      // results for certain dates in Opera >= 10.53.
      isExtended = isExtended.getUTCFullYear() == -109252 && isExtended.getUTCMonth() === 0 && isExtended.getUTCDate() === 1 &&
        // Safari < 2.0.2 stores the internal millisecond time value correctly,
        // but clips the values returned by the date methods to the range of
        // signed 32-bit integers ([-2 ** 31, 2 ** 31 - 1]).
        isExtended.getUTCHours() == 10 && isExtended.getUTCMinutes() == 37 && isExtended.getUTCSeconds() == 6 && isExtended.getUTCMilliseconds() == 708;
    } catch (exception) {}

    // Internal: Determines whether the native `JSON.stringify` and `parse`
    // implementations are spec-compliant. Based on work by Ken Snyder.
    function has(name) {
      if (has[name] !== undef) {
        // Return cached feature test result.
        return has[name];
      }
      var isSupported;
      if (name == "bug-string-char-index") {
        // IE <= 7 doesn't support accessing string characters using square
        // bracket notation. IE 8 only supports this for primitives.
        isSupported = "a"[0] != "a";
      } else if (name == "json") {
        // Indicates whether both `JSON.stringify` and `JSON.parse` are
        // supported.
        isSupported = has("json-stringify") && has("json-parse");
      } else {
        var value, serialized = '{"a":[1,true,false,null,"\\u0000\\b\\n\\f\\r\\t"]}';
        // Test `JSON.stringify`.
        if (name == "json-stringify") {
          var stringify = exports.stringify, stringifySupported = typeof stringify == "function" && isExtended;
          if (stringifySupported) {
            // A test function object with a custom `toJSON` method.
            (value = function () {
              return 1;
            }).toJSON = value;
            try {
              stringifySupported =
                // Firefox 3.1b1 and b2 serialize string, number, and boolean
                // primitives as object literals.
                stringify(0) === "0" &&
                // FF 3.1b1, b2, and JSON 2 serialize wrapped primitives as object
                // literals.
                stringify(new Number()) === "0" &&
                stringify(new String()) == '""' &&
                // FF 3.1b1, 2 throw an error if the value is `null`, `undefined`, or
                // does not define a canonical JSON representation (this applies to
                // objects with `toJSON` properties as well, *unless* they are nested
                // within an object or array).
                stringify(getClass) === undef &&
                // IE 8 serializes `undefined` as `"undefined"`. Safari <= 5.1.7 and
                // FF 3.1b3 pass this test.
                stringify(undef) === undef &&
                // Safari <= 5.1.7 and FF 3.1b3 throw `Error`s and `TypeError`s,
                // respectively, if the value is omitted entirely.
                stringify() === undef &&
                // FF 3.1b1, 2 throw an error if the given value is not a number,
                // string, array, object, Boolean, or `null` literal. This applies to
                // objects with custom `toJSON` methods as well, unless they are nested
                // inside object or array literals. YUI 3.0.0b1 ignores custom `toJSON`
                // methods entirely.
                stringify(value) === "1" &&
                stringify([value]) == "[1]" &&
                // Prototype <= 1.6.1 serializes `[undefined]` as `"[]"` instead of
                // `"[null]"`.
                stringify([undef]) == "[null]" &&
                // YUI 3.0.0b1 fails to serialize `null` literals.
                stringify(null) == "null" &&
                // FF 3.1b1, 2 halts serialization if an array contains a function:
                // `[1, true, getClass, 1]` serializes as "[1,true,],". FF 3.1b3
                // elides non-JSON values from objects and arrays, unless they
                // define custom `toJSON` methods.
                stringify([undef, getClass, null]) == "[null,null,null]" &&
                // Simple serialization test. FF 3.1b1 uses Unicode escape sequences
                // where character escape codes are expected (e.g., `\b` => `\u0008`).
                stringify({ "a": [value, true, false, null, "\x00\b\n\f\r\t"] }) == serialized &&
                // FF 3.1b1 and b2 ignore the `filter` and `width` arguments.
                stringify(null, value) === "1" &&
                stringify([1, 2], null, 1) == "[\n 1,\n 2\n]" &&
                // JSON 2, Prototype <= 1.7, and older WebKit builds incorrectly
                // serialize extended years.
                stringify(new Date(-8.64e15)) == '"-271821-04-20T00:00:00.000Z"' &&
                // The milliseconds are optional in ES 5, but required in 5.1.
                stringify(new Date(8.64e15)) == '"+275760-09-13T00:00:00.000Z"' &&
                // Firefox <= 11.0 incorrectly serializes years prior to 0 as negative
                // four-digit years instead of six-digit years. Credits: @Yaffle.
                stringify(new Date(-621987552e5)) == '"-000001-01-01T00:00:00.000Z"' &&
                // Safari <= 5.1.5 and Opera >= 10.53 incorrectly serialize millisecond
                // values less than 1000. Credits: @Yaffle.
                stringify(new Date(-1)) == '"1969-12-31T23:59:59.999Z"';
            } catch (exception) {
              stringifySupported = false;
            }
          }
          isSupported = stringifySupported;
        }
        // Test `JSON.parse`.
        if (name == "json-parse") {
          var parse = exports.parse;
          if (typeof parse == "function") {
            try {
              // FF 3.1b1, b2 will throw an exception if a bare literal is provided.
              // Conforming implementations should also coerce the initial argument to
              // a string prior to parsing.
              if (parse("0") === 0 && !parse(false)) {
                // Simple parsing test.
                value = parse(serialized);
                var parseSupported = value["a"].length == 5 && value["a"][0] === 1;
                if (parseSupported) {
                  try {
                    // Safari <= 5.1.2 and FF 3.1b1 allow unescaped tabs in strings.
                    parseSupported = !parse('"\t"');
                  } catch (exception) {}
                  if (parseSupported) {
                    try {
                      // FF 4.0 and 4.0.1 allow leading `+` signs and leading
                      // decimal points. FF 4.0, 4.0.1, and IE 9-10 also allow
                      // certain octal literals.
                      parseSupported = parse("01") !== 1;
                    } catch (exception) {}
                  }
                  if (parseSupported) {
                    try {
                      // FF 4.0, 4.0.1, and Rhino 1.7R3-R4 allow trailing decimal
                      // points. These environments, along with FF 3.1b1 and 2,
                      // also allow trailing commas in JSON objects and arrays.
                      parseSupported = parse("1.") !== 1;
                    } catch (exception) {}
                  }
                }
              }
            } catch (exception) {
              parseSupported = false;
            }
          }
          isSupported = parseSupported;
        }
      }
      return has[name] = !!isSupported;
    }

    if (!has("json")) {
      // Common `[[Class]]` name aliases.
      var functionClass = "[object Function]",
          dateClass = "[object Date]",
          numberClass = "[object Number]",
          stringClass = "[object String]",
          arrayClass = "[object Array]",
          booleanClass = "[object Boolean]";

      // Detect incomplete support for accessing string characters by index.
      var charIndexBuggy = has("bug-string-char-index");

      // Define additional utility methods if the `Date` methods are buggy.
      if (!isExtended) {
        var floor = Math.floor;
        // A mapping between the months of the year and the number of days between
        // January 1st and the first of the respective month.
        var Months = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];
        // Internal: Calculates the number of days between the Unix epoch and the
        // first day of the given month.
        var getDay = function (year, month) {
          return Months[month] + 365 * (year - 1970) + floor((year - 1969 + (month = +(month > 1))) / 4) - floor((year - 1901 + month) / 100) + floor((year - 1601 + month) / 400);
        };
      }

      // Internal: Determines if a property is a direct property of the given
      // object. Delegates to the native `Object#hasOwnProperty` method.
      if (!(isProperty = objectProto.hasOwnProperty)) {
        isProperty = function (property) {
          var members = {}, constructor;
          if ((members.__proto__ = null, members.__proto__ = {
            // The *proto* property cannot be set multiple times in recent
            // versions of Firefox and SeaMonkey.
            "toString": 1
          }, members).toString != getClass) {
            // Safari <= 2.0.3 doesn't implement `Object#hasOwnProperty`, but
            // supports the mutable *proto* property.
            isProperty = function (property) {
              // Capture and break the object's prototype chain (see section 8.6.2
              // of the ES 5.1 spec). The parenthesized expression prevents an
              // unsafe transformation by the Closure Compiler.
              var original = this.__proto__, result = property in (this.__proto__ = null, this);
              // Restore the original prototype chain.
              this.__proto__ = original;
              return result;
            };
          } else {
            // Capture a reference to the top-level `Object` constructor.
            constructor = members.constructor;
            // Use the `constructor` property to simulate `Object#hasOwnProperty` in
            // other environments.
            isProperty = function (property) {
              var parent = (this.constructor || constructor).prototype;
              return property in this && !(property in parent && this[property] === parent[property]);
            };
          }
          members = null;
          return isProperty.call(this, property);
        };
      }

      // Internal: Normalizes the `for...in` iteration algorithm across
      // environments. Each enumerated key is yielded to a `callback` function.
      forEach = function (object, callback) {
        var size = 0, Properties, members, property;

        // Tests for bugs in the current environment's `for...in` algorithm. The
        // `valueOf` property inherits the non-enumerable flag from
        // `Object.prototype` in older versions of IE, Netscape, and Mozilla.
        (Properties = function () {
          this.valueOf = 0;
        }).prototype.valueOf = 0;

        // Iterate over a new instance of the `Properties` class.
        members = new Properties();
        for (property in members) {
          // Ignore all properties inherited from `Object.prototype`.
          if (isProperty.call(members, property)) {
            size++;
          }
        }
        Properties = members = null;

        // Normalize the iteration algorithm.
        if (!size) {
          // A list of non-enumerable properties inherited from `Object.prototype`.
          members = ["valueOf", "toString", "toLocaleString", "propertyIsEnumerable", "isPrototypeOf", "hasOwnProperty", "constructor"];
          // IE <= 8, Mozilla 1.0, and Netscape 6.2 ignore shadowed non-enumerable
          // properties.
          forEach = function (object, callback) {
            var isFunction = getClass.call(object) == functionClass, property, length;
            var hasProperty = !isFunction && typeof object.constructor != "function" && objectTypes[typeof object.hasOwnProperty] && object.hasOwnProperty || isProperty;
            for (property in object) {
              // Gecko <= 1.0 enumerates the `prototype` property of functions under
              // certain conditions; IE does not.
              if (!(isFunction && property == "prototype") && hasProperty.call(object, property)) {
                callback(property);
              }
            }
            // Manually invoke the callback for each non-enumerable property.
            for (length = members.length; property = members[--length]; hasProperty.call(object, property) && callback(property));
          };
        } else if (size == 2) {
          // Safari <= 2.0.4 enumerates shadowed properties twice.
          forEach = function (object, callback) {
            // Create a set of iterated properties.
            var members = {}, isFunction = getClass.call(object) == functionClass, property;
            for (property in object) {
              // Store each property name to prevent double enumeration. The
              // `prototype` property of functions is not enumerated due to cross-
              // environment inconsistencies.
              if (!(isFunction && property == "prototype") && !isProperty.call(members, property) && (members[property] = 1) && isProperty.call(object, property)) {
                callback(property);
              }
            }
          };
        } else {
          // No bugs detected; use the standard `for...in` algorithm.
          forEach = function (object, callback) {
            var isFunction = getClass.call(object) == functionClass, property, isConstructor;
            for (property in object) {
              if (!(isFunction && property == "prototype") && isProperty.call(object, property) && !(isConstructor = property === "constructor")) {
                callback(property);
              }
            }
            // Manually invoke the callback for the `constructor` property due to
            // cross-environment inconsistencies.
            if (isConstructor || isProperty.call(object, (property = "constructor"))) {
              callback(property);
            }
          };
        }
        return forEach(object, callback);
      };

      // Public: Serializes a JavaScript `value` as a JSON string. The optional
      // `filter` argument may specify either a function that alters how object and
      // array members are serialized, or an array of strings and numbers that
      // indicates which properties should be serialized. The optional `width`
      // argument may be either a string or number that specifies the indentation
      // level of the output.
      if (!has("json-stringify")) {
        // Internal: A map of control characters and their escaped equivalents.
        var Escapes = {
          92: "\\\\",
          34: '\\"',
          8: "\\b",
          12: "\\f",
          10: "\\n",
          13: "\\r",
          9: "\\t"
        };

        // Internal: Converts `value` into a zero-padded string such that its
        // length is at least equal to `width`. The `width` must be <= 6.
        var leadingZeroes = "000000";
        var toPaddedString = function (width, value) {
          // The `|| 0` expression is necessary to work around a bug in
          // Opera <= 7.54u2 where `0 == -0`, but `String(-0) !== "0"`.
          return (leadingZeroes + (value || 0)).slice(-width);
        };

        // Internal: Double-quotes a string `value`, replacing all ASCII control
        // characters (characters with code unit values between 0 and 31) with
        // their escaped equivalents. This is an implementation of the
        // `Quote(value)` operation defined in ES 5.1 section 15.12.3.
        var unicodePrefix = "\\u00";
        var quote = function (value) {
          var result = '"', index = 0, length = value.length, useCharIndex = !charIndexBuggy || length > 10;
          var symbols = useCharIndex && (charIndexBuggy ? value.split("") : value);
          for (; index < length; index++) {
            var charCode = value.charCodeAt(index);
            // If the character is a control character, append its Unicode or
            // shorthand escape sequence; otherwise, append the character as-is.
            switch (charCode) {
              case 8: case 9: case 10: case 12: case 13: case 34: case 92:
                result += Escapes[charCode];
                break;
              default:
                if (charCode < 32) {
                  result += unicodePrefix + toPaddedString(2, charCode.toString(16));
                  break;
                }
                result += useCharIndex ? symbols[index] : value.charAt(index);
            }
          }
          return result + '"';
        };

        // Internal: Recursively serializes an object. Implements the
        // `Str(key, holder)`, `JO(value)`, and `JA(value)` operations.
        var serialize = function (property, object, callback, properties, whitespace, indentation, stack) {
          var value, className, year, month, date, time, hours, minutes, seconds, milliseconds, results, element, index, length, prefix, result;
          try {
            // Necessary for host object support.
            value = object[property];
          } catch (exception) {}
          if (typeof value == "object" && value) {
            className = getClass.call(value);
            if (className == dateClass && !isProperty.call(value, "toJSON")) {
              if (value > -1 / 0 && value < 1 / 0) {
                // Dates are serialized according to the `Date#toJSON` method
                // specified in ES 5.1 section 15.9.5.44. See section 15.9.1.15
                // for the ISO 8601 date time string format.
                if (getDay) {
                  // Manually compute the year, month, date, hours, minutes,
                  // seconds, and milliseconds if the `getUTC*` methods are
                  // buggy. Adapted from @Yaffle's `date-shim` project.
                  date = floor(value / 864e5);
                  for (year = floor(date / 365.2425) + 1970 - 1; getDay(year + 1, 0) <= date; year++);
                  for (month = floor((date - getDay(year, 0)) / 30.42); getDay(year, month + 1) <= date; month++);
                  date = 1 + date - getDay(year, month);
                  // The `time` value specifies the time within the day (see ES
                  // 5.1 section 15.9.1.2). The formula `(A % B + B) % B` is used
                  // to compute `A modulo B`, as the `%` operator does not
                  // correspond to the `modulo` operation for negative numbers.
                  time = (value % 864e5 + 864e5) % 864e5;
                  // The hours, minutes, seconds, and milliseconds are obtained by
                  // decomposing the time within the day. See section 15.9.1.10.
                  hours = floor(time / 36e5) % 24;
                  minutes = floor(time / 6e4) % 60;
                  seconds = floor(time / 1e3) % 60;
                  milliseconds = time % 1e3;
                } else {
                  year = value.getUTCFullYear();
                  month = value.getUTCMonth();
                  date = value.getUTCDate();
                  hours = value.getUTCHours();
                  minutes = value.getUTCMinutes();
                  seconds = value.getUTCSeconds();
                  milliseconds = value.getUTCMilliseconds();
                }
                // Serialize extended years correctly.
                value = (year <= 0 || year >= 1e4 ? (year < 0 ? "-" : "+") + toPaddedString(6, year < 0 ? -year : year) : toPaddedString(4, year)) +
                  "-" + toPaddedString(2, month + 1) + "-" + toPaddedString(2, date) +
                  // Months, dates, hours, minutes, and seconds should have two
                  // digits; milliseconds should have three.
                  "T" + toPaddedString(2, hours) + ":" + toPaddedString(2, minutes) + ":" + toPaddedString(2, seconds) +
                  // Milliseconds are optional in ES 5.0, but required in 5.1.
                  "." + toPaddedString(3, milliseconds) + "Z";
              } else {
                value = null;
              }
            } else if (typeof value.toJSON == "function" && ((className != numberClass && className != stringClass && className != arrayClass) || isProperty.call(value, "toJSON"))) {
              // Prototype <= 1.6.1 adds non-standard `toJSON` methods to the
              // `Number`, `String`, `Date`, and `Array` prototypes. JSON 3
              // ignores all `toJSON` methods on these objects unless they are
              // defined directly on an instance.
              value = value.toJSON(property);
            }
          }
          if (callback) {
            // If a replacement function was provided, call it to obtain the value
            // for serialization.
            value = callback.call(object, property, value);
          }
          if (value === null) {
            return "null";
          }
          className = getClass.call(value);
          if (className == booleanClass) {
            // Booleans are represented literally.
            return "" + value;
          } else if (className == numberClass) {
            // JSON numbers must be finite. `Infinity` and `NaN` are serialized as
            // `"null"`.
            return value > -1 / 0 && value < 1 / 0 ? "" + value : "null";
          } else if (className == stringClass) {
            // Strings are double-quoted and escaped.
            return quote("" + value);
          }
          // Recursively serialize objects and arrays.
          if (typeof value == "object") {
            // Check for cyclic structures. This is a linear search; performance
            // is inversely proportional to the number of unique nested objects.
            for (length = stack.length; length--;) {
              if (stack[length] === value) {
                // Cyclic structures cannot be serialized by `JSON.stringify`.
                throw TypeError();
              }
            }
            // Add the object to the stack of traversed objects.
            stack.push(value);
            results = [];
            // Save the current indentation level and indent one additional level.
            prefix = indentation;
            indentation += whitespace;
            if (className == arrayClass) {
              // Recursively serialize array elements.
              for (index = 0, length = value.length; index < length; index++) {
                element = serialize(index, value, callback, properties, whitespace, indentation, stack);
                results.push(element === undef ? "null" : element);
              }
              result = results.length ? (whitespace ? "[\n" + indentation + results.join(",\n" + indentation) + "\n" + prefix + "]" : ("[" + results.join(",") + "]")) : "[]";
            } else {
              // Recursively serialize object members. Members are selected from
              // either a user-specified list of property names, or the object
              // itself.
              forEach(properties || value, function (property) {
                var element = serialize(property, value, callback, properties, whitespace, indentation, stack);
                if (element !== undef) {
                  // According to ES 5.1 section 15.12.3: "If `gap` {whitespace}
                  // is not the empty string, let `member` {quote(property) + ":"}
                  // be the concatenation of `member` and the `space` character."
                  // The "`space` character" refers to the literal space
                  // character, not the `space` {width} argument provided to
                  // `JSON.stringify`.
                  results.push(quote(property) + ":" + (whitespace ? " " : "") + element);
                }
              });
              result = results.length ? (whitespace ? "{\n" + indentation + results.join(",\n" + indentation) + "\n" + prefix + "}" : ("{" + results.join(",") + "}")) : "{}";
            }
            // Remove the object from the traversed object stack.
            stack.pop();
            return result;
          }
        };

        // Public: `JSON.stringify`. See ES 5.1 section 15.12.3.
        exports.stringify = function (source, filter, width) {
          var whitespace, callback, properties, className;
          if (objectTypes[typeof filter] && filter) {
            if ((className = getClass.call(filter)) == functionClass) {
              callback = filter;
            } else if (className == arrayClass) {
              // Convert the property names array into a makeshift set.
              properties = {};
              for (var index = 0, length = filter.length, value; index < length; value = filter[index++], ((className = getClass.call(value)), className == stringClass || className == numberClass) && (properties[value] = 1));
            }
          }
          if (width) {
            if ((className = getClass.call(width)) == numberClass) {
              // Convert the `width` to an integer and create a string containing
              // `width` number of space characters.
              if ((width -= width % 1) > 0) {
                for (whitespace = "", width > 10 && (width = 10); whitespace.length < width; whitespace += " ");
              }
            } else if (className == stringClass) {
              whitespace = width.length <= 10 ? width : width.slice(0, 10);
            }
          }
          // Opera <= 7.54u2 discards the values associated with empty string keys
          // (`""`) only if they are used directly within an object member list
          // (e.g., `!("" in { "": 1})`).
          return serialize("", (value = {}, value[""] = source, value), callback, properties, whitespace, "", []);
        };
      }

      // Public: Parses a JSON source string.
      if (!has("json-parse")) {
        var fromCharCode = String.fromCharCode;

        // Internal: A map of escaped control characters and their unescaped
        // equivalents.
        var Unescapes = {
          92: "\\",
          34: '"',
          47: "/",
          98: "\b",
          116: "\t",
          110: "\n",
          102: "\f",
          114: "\r"
        };

        // Internal: Stores the parser state.
        var Index, Source;

        // Internal: Resets the parser state and throws a `SyntaxError`.
        var abort = function () {
          Index = Source = null;
          throw SyntaxError();
        };

        // Internal: Returns the next token, or `"$"` if the parser has reached
        // the end of the source string. A token may be a string, number, `null`
        // literal, or Boolean literal.
        var lex = function () {
          var source = Source, length = source.length, value, begin, position, isSigned, charCode;
          while (Index < length) {
            charCode = source.charCodeAt(Index);
            switch (charCode) {
              case 9: case 10: case 13: case 32:
                // Skip whitespace tokens, including tabs, carriage returns, line
                // feeds, and space characters.
                Index++;
                break;
              case 123: case 125: case 91: case 93: case 58: case 44:
                // Parse a punctuator token (`{`, `}`, `[`, `]`, `:`, or `,`) at
                // the current position.
                value = charIndexBuggy ? source.charAt(Index) : source[Index];
                Index++;
                return value;
              case 34:
                // `"` delimits a JSON string; advance to the next character and
                // begin parsing the string. String tokens are prefixed with the
                // sentinel `@` character to distinguish them from punctuators and
                // end-of-string tokens.
                for (value = "@", Index++; Index < length;) {
                  charCode = source.charCodeAt(Index);
                  if (charCode < 32) {
                    // Unescaped ASCII control characters (those with a code unit
                    // less than the space character) are not permitted.
                    abort();
                  } else if (charCode == 92) {
                    // A reverse solidus (`\`) marks the beginning of an escaped
                    // control character (including `"`, `\`, and `/`) or Unicode
                    // escape sequence.
                    charCode = source.charCodeAt(++Index);
                    switch (charCode) {
                      case 92: case 34: case 47: case 98: case 116: case 110: case 102: case 114:
                        // Revive escaped control characters.
                        value += Unescapes[charCode];
                        Index++;
                        break;
                      case 117:
                        // `\u` marks the beginning of a Unicode escape sequence.
                        // Advance to the first character and validate the
                        // four-digit code point.
                        begin = ++Index;
                        for (position = Index + 4; Index < position; Index++) {
                          charCode = source.charCodeAt(Index);
                          // A valid sequence comprises four hexdigits (case-
                          // insensitive) that form a single hexadecimal value.
                          if (!(charCode >= 48 && charCode <= 57 || charCode >= 97 && charCode <= 102 || charCode >= 65 && charCode <= 70)) {
                            // Invalid Unicode escape sequence.
                            abort();
                          }
                        }
                        // Revive the escaped character.
                        value += fromCharCode("0x" + source.slice(begin, Index));
                        break;
                      default:
                        // Invalid escape sequence.
                        abort();
                    }
                  } else {
                    if (charCode == 34) {
                      // An unescaped double-quote character marks the end of the
                      // string.
                      break;
                    }
                    charCode = source.charCodeAt(Index);
                    begin = Index;
                    // Optimize for the common case where a string is valid.
                    while (charCode >= 32 && charCode != 92 && charCode != 34) {
                      charCode = source.charCodeAt(++Index);
                    }
                    // Append the string as-is.
                    value += source.slice(begin, Index);
                  }
                }
                if (source.charCodeAt(Index) == 34) {
                  // Advance to the next character and return the revived string.
                  Index++;
                  return value;
                }
                // Unterminated string.
                abort();
              default:
                // Parse numbers and literals.
                begin = Index;
                // Advance past the negative sign, if one is specified.
                if (charCode == 45) {
                  isSigned = true;
                  charCode = source.charCodeAt(++Index);
                }
                // Parse an integer or floating-point value.
                if (charCode >= 48 && charCode <= 57) {
                  // Leading zeroes are interpreted as octal literals.
                  if (charCode == 48 && ((charCode = source.charCodeAt(Index + 1)), charCode >= 48 && charCode <= 57)) {
                    // Illegal octal literal.
                    abort();
                  }
                  isSigned = false;
                  // Parse the integer component.
                  for (; Index < length && ((charCode = source.charCodeAt(Index)), charCode >= 48 && charCode <= 57); Index++);
                  // Floats cannot contain a leading decimal point; however, this
                  // case is already accounted for by the parser.
                  if (source.charCodeAt(Index) == 46) {
                    position = ++Index;
                    // Parse the decimal component.
                    for (; position < length && ((charCode = source.charCodeAt(position)), charCode >= 48 && charCode <= 57); position++);
                    if (position == Index) {
                      // Illegal trailing decimal.
                      abort();
                    }
                    Index = position;
                  }
                  // Parse exponents. The `e` denoting the exponent is
                  // case-insensitive.
                  charCode = source.charCodeAt(Index);
                  if (charCode == 101 || charCode == 69) {
                    charCode = source.charCodeAt(++Index);
                    // Skip past the sign following the exponent, if one is
                    // specified.
                    if (charCode == 43 || charCode == 45) {
                      Index++;
                    }
                    // Parse the exponential component.
                    for (position = Index; position < length && ((charCode = source.charCodeAt(position)), charCode >= 48 && charCode <= 57); position++);
                    if (position == Index) {
                      // Illegal empty exponent.
                      abort();
                    }
                    Index = position;
                  }
                  // Coerce the parsed value to a JavaScript number.
                  return +source.slice(begin, Index);
                }
                // A negative sign may only precede numbers.
                if (isSigned) {
                  abort();
                }
                // `true`, `false`, and `null` literals.
                if (source.slice(Index, Index + 4) == "true") {
                  Index += 4;
                  return true;
                } else if (source.slice(Index, Index + 5) == "false") {
                  Index += 5;
                  return false;
                } else if (source.slice(Index, Index + 4) == "null") {
                  Index += 4;
                  return null;
                }
                // Unrecognized token.
                abort();
            }
          }
          // Return the sentinel `$` character if the parser has reached the end
          // of the source string.
          return "$";
        };

        // Internal: Parses a JSON `value` token.
        var get = function (value) {
          var results, hasMembers;
          if (value == "$") {
            // Unexpected end of input.
            abort();
          }
          if (typeof value == "string") {
            if ((charIndexBuggy ? value.charAt(0) : value[0]) == "@") {
              // Remove the sentinel `@` character.
              return value.slice(1);
            }
            // Parse object and array literals.
            if (value == "[") {
              // Parses a JSON array, returning a new JavaScript array.
              results = [];
              for (;; hasMembers || (hasMembers = true)) {
                value = lex();
                // A closing square bracket marks the end of the array literal.
                if (value == "]") {
                  break;
                }
                // If the array literal contains elements, the current token
                // should be a comma separating the previous element from the
                // next.
                if (hasMembers) {
                  if (value == ",") {
                    value = lex();
                    if (value == "]") {
                      // Unexpected trailing `,` in array literal.
                      abort();
                    }
                  } else {
                    // A `,` must separate each array element.
                    abort();
                  }
                }
                // Elisions and leading commas are not permitted.
                if (value == ",") {
                  abort();
                }
                results.push(get(value));
              }
              return results;
            } else if (value == "{") {
              // Parses a JSON object, returning a new JavaScript object.
              results = {};
              for (;; hasMembers || (hasMembers = true)) {
                value = lex();
                // A closing curly brace marks the end of the object literal.
                if (value == "}") {
                  break;
                }
                // If the object literal contains members, the current token
                // should be a comma separator.
                if (hasMembers) {
                  if (value == ",") {
                    value = lex();
                    if (value == "}") {
                      // Unexpected trailing `,` in object literal.
                      abort();
                    }
                  } else {
                    // A `,` must separate each object member.
                    abort();
                  }
                }
                // Leading commas are not permitted, object property names must be
                // double-quoted strings, and a `:` must separate each property
                // name and value.
                if (value == "," || typeof value != "string" || (charIndexBuggy ? value.charAt(0) : value[0]) != "@" || lex() != ":") {
                  abort();
                }
                results[value.slice(1)] = get(lex());
              }
              return results;
            }
            // Unexpected token encountered.
            abort();
          }
          return value;
        };

        // Internal: Updates a traversed object member.
        var update = function (source, property, callback) {
          var element = walk(source, property, callback);
          if (element === undef) {
            delete source[property];
          } else {
            source[property] = element;
          }
        };

        // Internal: Recursively traverses a parsed JSON object, invoking the
        // `callback` function for each value. This is an implementation of the
        // `Walk(holder, name)` operation defined in ES 5.1 section 15.12.2.
        var walk = function (source, property, callback) {
          var value = source[property], length;
          if (typeof value == "object" && value) {
            // `forEach` can't be used to traverse an array in Opera <= 8.54
            // because its `Object#hasOwnProperty` implementation returns `false`
            // for array indices (e.g., `![1, 2, 3].hasOwnProperty("0")`).
            if (getClass.call(value) == arrayClass) {
              for (length = value.length; length--;) {
                update(value, length, callback);
              }
            } else {
              forEach(value, function (property) {
                update(value, property, callback);
              });
            }
          }
          return callback.call(source, property, value);
        };

        // Public: `JSON.parse`. See ES 5.1 section 15.12.2.
        exports.parse = function (source, callback) {
          var result, value;
          Index = 0;
          Source = "" + source;
          result = get(lex());
          // If a JSON string contains multiple tokens, it is invalid.
          if (lex() != "$") {
            abort();
          }
          // Reset the parser state.
          Index = Source = null;
          return callback && getClass.call(callback) == functionClass ? walk((value = {}, value[""] = result, value), "", callback) : result;
        };
      }
    }

    exports["runInContext"] = runInContext;
    return exports;
  }

  if (freeExports && !isLoader) {
    // Export for CommonJS environments.
    runInContext(root, freeExports);
  } else {
    // Export for web browsers and JavaScript engines.
    var nativeJSON = root.JSON,
        previousJSON = root["JSON3"],
        isRestored = false;

    var JSON3 = runInContext(root, (root["JSON3"] = {
      // Public: Restores the original value of the global `JSON` object and
      // returns a reference to the `JSON3` object.
      "noConflict": function () {
        if (!isRestored) {
          isRestored = true;
          root.JSON = nativeJSON;
          root["JSON3"] = previousJSON;
          nativeJSON = previousJSON = null;
        }
        return JSON3;
      }
    }));

    root.JSON = {
      "parse": JSON3.parse,
      "stringify": JSON3.stringify
    };
  }

  // Export for asynchronous module loaders.
  if (isLoader) {
    define(function () {
      return JSON3;
    });
  }
}).call(this);

}).call(this,typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : typeof global !== "undefined" ? global : {})
},{}],51:[function(_dereq_,module,exports){
module.exports = toArray

function toArray(list, index) {
    var array = []

    index = index || 0

    for (var i = index || 0; i < list.length; i++) {
        array[i - index] = list[i]
    }

    return array
}

},{}]},{},[31])(31)
});

}
/*
 CloudApp
 */
CB.CloudApp = CB.CloudApp || {};
CB.CloudApp._isConnected = false;

CB.CloudApp.init = function(serverUrl, applicationId, applicationKey, opts) { //static function for initialisation of the app
    if(!applicationKey)
    {
        applicationKey=applicationId;
        applicationId=serverUrl;
    }else {        
        CB.apiUrl = serverUrl;             
    }

    if(typeof applicationKey === "object"){
        opts = applicationKey;
        applicationKey=applicationId;
        applicationId=serverUrl;
    }

    CB.appId = applicationId;
    CB.appKey = applicationKey;

    if(opts && opts.disableRealtime === true){
        CB._isRealtimeDisabled = true;
    }else{
        //load socket.io.
        if(CB._isNode)
        {
            CB.io = require('socket.io-client');
        }
        else {
            CB.io = io;
        }

        CB.Socket = CB.io(CB.apiUrl);        
    } 
    CB.CloudApp._isConnected = true;  
};

CB.CloudApp.onConnect = function(functionToFire) { //static function for initialisation of the app
    CB._validate();

    if(!CB.Socket){
        throw "Socket couldn't be found. Init app first.";
    }

    CB.Socket.on('connect', functionToFire);
    

};

CB.CloudApp.onDisconnect = function(functionToFire) { //static function for initialisation of the app
    CB._validate();

    if(!CB.Socket){
        throw "Socket couldn't be found. Init app first.";
    }

    CB.Socket.on('disconnect', functionToFire);

};

CB.CloudApp.connect = function() { //static function for initialisation of the app
    CB._validate();

    if(!CB.Socket){
        throw "Socket couldn't be found. Init app first.";
    }

    CB.Socket.connect();
    CB.CloudApp._isConnected = true;
};

CB.CloudApp.disconnect = function() { //static function for initialisation of the app
    CB._validate();

    if(!CB.Socket){
        throw "Socket couldn't be found. Init app first.";
    }

    CB.Socket.emit('socket-disconnect',CB.appId);
    CB.CloudApp._isConnected = false;
};
CB.ACL = function() { //constructor for ACL class
    this.document = {};
    this.document['read'] = {"allow":{"user":['all'],"role":[]},"deny":{"user":[],"role":[]}}; //by default allow read access to "all"
    this.document['write'] = {"allow":{"user":['all'],"role":[]},"deny":{"user":[],"role":[]}}; //by default allow write access to "all"
    this.parent = null;
};
CB.ACL.prototype.setPublicWriteAccess = function(value) { //for setting the public write access
    if (value) { //If asked to allow public write access
        this.document['write']['allow']['user'] = ['all'];
    } else {
        var index = this.document['write']['allow']['user'].indexOf('all');
        if (index > -1) {
            this.document['write']['allow']['user'].splice(index, 1); //remove the "all" value from the "write" array of "this" object
        }
    }

    if(this.parent){
        CB._modified(this.parent,'ACL');
    }
};
CB.ACL.prototype.setPublicReadAccess = function(value) { //for setting the public read access

    if (value) { //If asked to allow public read access
        this.document['read']['allow']['user'] = ['all'];
    } else {
        var index = this.document['read']['allow']['user'].indexOf('all');
        if (index > -1) {
            this.document['read']['allow']['user'].splice(index, 1); //remove the "all" value from the "read" array of "this" object
        }
    }

    if(this.parent){
        CB._modified(this.parent,'ACL');
    }
};
CB.ACL.prototype.setUserWriteAccess = function(userId, value) { //for setting the user write access

    if (value) { //If asked to allow user write access
        //remove public write access.
        var index = this.document['write']['allow']['user'].indexOf('all');
        if (index > -1) {
            this.document['write']['allow']['user'].splice(index, 1);
        }
        if (this.document['write']['allow']['user'].indexOf(userId) === -1) {
            this.document['write']['allow']['user'].push(userId);
        }
    } else {
        var index = this.document['write']['allow']['user'].indexOf(userId);
        if (index > -1) {
            this.document['write']['allow']['user'].splice(index, 1); //remove the "userId" value from the "write" array of "this" object
        }
        this.document['write']['deny']['user'].push(userId);
    }

    if(this.parent){
        CB._modified(this.parent,'ACL');
    }
};
CB.ACL.prototype.setUserReadAccess = function(userId, value) { //for setting the user read access

    if (value) { //If asked to allow user read access
        //remove public write access.
        var index = this.document['read']['allow']['user'].indexOf('all');
        if (index > -1) {
            this.document['read']['allow']['user'].splice(index, 1);
        }
        if (this.document['read']['allow']['user'].indexOf(userId) === -1) {
            this.document['read']['allow']['user'].push(userId);
        }
    } else {
        var index = this.document['read']['allow']['user'].indexOf(userId);
        if (index > -1) {
            this.document['read']['allow']['user'].splice(index, 1); //remove the "userId" value from the "read" array of "this" object
        }
        this.document['read']['deny']['user'].push(userId);
    }

    if(this.parent){
        CB._modified(this.parent,'ACL');
    }
};
CB.ACL.prototype.setRoleWriteAccess = function(roleId, value) {

    if (value) {
        //remove public write access.
        var index = this.document['write']['allow']['user'].indexOf('all');
        if (index > -1) {
            this.document['write']['allow']['user'].splice(index, 1);
        }
        if (this.document['write']['allow']['role'].indexOf(roleId) === -1) {
            this.document['write']['allow']['role'].push(roleId);
        }
    } else {
        var index = this.document['write']['allow']['role'].indexOf(roleId);
        if (index > -1) {
            this.document['write']['allow']['role'].splice(index, 1);
        }
        var index = this.document['write']['allow']['user'].indexOf('all');
        if (index > -1) {
            this.document['write']['allow']['user'].splice(index, 1);
        }

        this.document['write']['deny']['role'].push(roleId);
    }

    if(this.parent){
        CB._modified(this.parent,'ACL');
    }
};
CB.ACL.prototype.setRoleReadAccess = function(roleId, value) {

    if (value) {
        //remove public write access.
        var index = this.document['read']['allow']['user'].indexOf('all');
        if (index > -1) {
            this.document['read']['allow']['user'].splice(index, 1);
        }
        if (this.document['read']['allow']['role'].indexOf(roleId) === -1) {
            this.document['read']['allow']['role'].push(roleId);
        }
    } else {
        var index = this.document['read']['allow']['role'].indexOf(roleId);
        if (index > -1) {
            this.document['read']['allow']['role'].splice(index, 1);
        }
        var index = this.document['read']['allow']['user'].indexOf('all');
        if (index > -1) {
            this.document['read']['allow']['user'].splice(index, 1);
        }
        this.document['read']['deny']['role'].push(roleId);
    }

    if(this.parent){
        CB._modified(this.parent,'ACL');
    }
};

/* CloudNotificiation */

CB.CloudNotification = CB.CloudNotification || {};

CB.CloudNotification.on = function(channelName, callback, done) {

    if(CB._isRealtimeDisabled){
        throw "Realtime is disbaled for this app.";
    }

    CB._validate();

    var def;

    if (!done) {
        def = new CB.Promise();
    }

    CB.Socket.emit('join-custom-channel',CB.appId+channelName);
    CB.Socket.on(CB.appId+channelName, function(data){ //listen to events in custom channel.
        callback(data);
    });

    if(done && done.success)
        done.success();
    else
        def.resolve();

    if (!done) {
        return def;
    }

};

CB.CloudNotification.off = function(channelName, done) {

    if(CB._isRealtimeDisabled){
        throw "Realtime is disbaled for this app.";
    }

    CB._validate();

    var def;

    if (!done) {
        def = new CB.Promise();
    }

    CB.Socket.emit('leave-custom-channel',CB.appId+channelName);
    CB.Socket.removeAllListeners(CB.appId+channelName);
    if(done && done.success)
        done.success();
    else
        def.resolve();

    if (!done) {
        return def;
    }

};

CB.CloudNotification.publish = function(channelName, data, done) {

    if(CB._isRealtimeDisabled){
        throw "Realtime is disbaled for this app.";
    }

    CB._validate();

    var def;

    if (!done) {
        def = new CB.Promise();
    }

    CB.Socket.emit('publish-custom-channel',{channel:CB.appId+channelName,data : data});
    if(done && done.success)
        done.success();
    else
        def.resolve();

    if (!done) {
        return def;
    }

};

/*
 CloudObject
 */

CB.CloudObject = function(tableName, id) { //object for documents

    this.document = {};
    this.document._tableName = tableName; //the document object
    this.document.ACL = new CB.ACL(); //ACL(s) of the document
    this.document._type = 'custom';
    this.document.expires = null;
    this.document._hash = CB._generateHash();

    if(!id){
        this.document._modifiedColumns = ['createdAt','updatedAt','ACL','expires'];
        this.document._isModified = true;
    }
    else{
        this.document._modifiedColumns = [];
        this.document._isModified = false;
        this.document._id = id;
    }   
};

Object.defineProperty(CB.CloudObject.prototype, 'ACL', {
    get: function() {
        return this.document.ACL;
    },
    set: function(ACL) {
        this.document.ACL = ACL;
        this.document.ACL.parent = this;
        CB._modified(this,'ACL');
    }
});

Object.defineProperty(CB.CloudObject.prototype, 'id', {
    get: function() {
        return this.document._id;
    }
});

Object.defineProperty(CB.CloudObject.prototype, 'createdAt', {
    get: function() {
        return this.document.createdAt;
    },
    set: function(createdAt) {
        this.document.createdAt = createdAt;
        CB._modified(this,'createdAt');
    }
});

Object.defineProperty(CB.CloudObject.prototype, 'updatedAt', {
    get: function() {
        return this.document.updatedAt;
    },
    set: function(updatedAt) {
        this.document.updatedAt = updatedAt;
        CB._modified(this,'updatedAt');
    }
});


/* For Expire of objects */
Object.defineProperty(CB.CloudObject.prototype, 'expires', {
    get: function() {
        return this.document.expires;
    },
    set: function(expires) {
        this.document.expires = expires;
        CB._modified(this,'expires');
    }
});

/* This is Real time implementation of CloudObjects */
CB.CloudObject.on = function(tableName, eventType, cloudQuery, callback, done) {

    if(CB._isRealtimeDisabled){
        throw "Realtime is disbaled for this app.";
    }

    var def;

    //shift variables.
    if(cloudQuery && !(cloudQuery instanceof CB.CloudQuery)){
        //this is a function.
        if(callback !== null && typeof callback === 'object'){
            //callback is actually done.
            done = callback;
            callback = null;
        }
        callback = cloudQuery;
        cloudQuery = null;
    }

    if (!done) {
        def = new CB.Promise();
    }

    //validate query.
    if(cloudQuery && cloudQuery instanceof CB.CloudQuery){

        if(cloudQuery.tableName!== tableName){
            throw "CloudQuery TableName and CloudNotification TableName should be same.";
        }

        if(cloudQuery.query){
            if(cloudQuery.query.$include.length>0){
                throw "Include with CloudNotificaitons is not supported right now.";
            }
        }

        if(Object.keys(cloudQuery.select).length > 0){
            throw "You cannot pass the query with select in CloudNotifications.";
        }
    }

    tableName = tableName.toLowerCase();

    if (eventType instanceof Array) {
        //if event type is an array.
        for(var i=0;i<eventType.length;i++){
            CB.CloudObject.on(tableName, eventType[i], cloudQuery, callback);
            if(done && done.success)
                done.success();
            else
                def.resolve();
        }
    } else {
        eventType = eventType.toLowerCase();
        if(eventType==='created' || eventType === 'updated' || eventType === 'deleted'){

            var payload = {
                room :(CB.appId+'table'+tableName+eventType).toLowerCase(),
                sessionId : CB._getSessionId()
            };

            CB.Socket.emit('join-object-channel',payload);
            CB.Socket.on((CB.appId+'table'+tableName+eventType).toLowerCase(), function(data){ //listen to events in custom channel.
                data = CB.fromJSON(data);
                if(cloudQuery && cloudQuery instanceof CB.CloudQuery && CB.CloudObject._validateNotificationQuery(data, cloudQuery))
                    callback(data);
                else if(!cloudQuery)
                    callback(data);
            });

            if(done && done.success)
                done.success();
            else
                def.resolve();
        }else{
            throw 'created, updated, deleted are supported notification types.';
        }
    }

    if (!done) {
        return def;
    }
};

CB.CloudObject.off = function(tableName, eventType, done) {

    if(CB._isRealtimeDisabled){
        throw "Realtime is disbaled for this app.";
    }

    var def;

    if (!done) {
        def = new CB.Promise();
    }

    tableName = tableName.toLowerCase();

    if (eventType instanceof Array) {
        //if event type is an array.
        for(var i=0;i<eventType.length;i++){
            CB.CloudObject.off(tableName, eventType[i]);
            if(done && done.success)
                done.success();
            else
                def.resolve();
        }
    } else {

        eventType = eventType.toLowerCase();

        if(eventType==='created' || eventType === 'updated' || eventType === 'deleted'){
            CB.Socket.emit('leave-object-channel',(CB.appId+'table'+tableName+eventType).toLowerCase());
            CB.Socket.removeAllListeners((CB.appId+'table'+tableName+eventType).toLowerCase());
            if(done && done.success)
                done.success();
            else
                def.resolve();
        }else{
            throw 'created, updated, deleted are supported notification types.';
        }
    }

    if (!done) {
        return def;
    }
};

/* RealTime implementation ends here.  */

CB.CloudObject.prototype.set = function(columnName, data) { //for setting data for a particular column

    var keywords = ['_tableName', '_type', 'operator'];

    if(columnName=== 'id' || columnName === '_id')
        throw "You cannot set the id of a CloudObject";

    if (columnName === 'id')
        columnName = '_' + columnName;

    if (keywords.indexOf(columnName) > -1) {
        throw columnName + " is a keyword. Please choose a different column name.";
    }
    this.document[columnName] = data;
    CB._modified(this,columnName);
};


CB.CloudObject.prototype.relate = function(columnName, objectTableName, objectId) { //for setting data for a particular column

    var keywords = ['_tableName', '_type', 'operator'];

    if(columnName=== 'id' || columnName === '_id')
        throw "You cannot set the id of a CloudObject";

    if (columnName === 'id')
        throw "You cannot link an object to this column";

    if (keywords.indexOf(columnName) > -1) {
        throw columnName + " is a keyword. Please choose a different column name.";
    }

    this.document[columnName] = new CB.CloudObject(objectTableName,objectId);
    CB._modified(this,columnName);
};


CB.CloudObject.prototype.get = function(columnName) { //for getting data of a particular column

    if (columnName === 'id')
        columnName = '_' + columnName;

    return this.document[columnName];

};

CB.CloudObject.prototype.unset = function(columnName) { //to unset the data of the column
    this.document[columnName] = null;
    CB._modified(this,columnName);
};

/**
 * Saved CloudObject in Database.
 * @param callback
 * @returns {*}
 */

CB.CloudObject.prototype.save = function(callback) { //save the document to the db
    var def;
    CB._validate();

    if (!callback) {
        def = new CB.Promise();
    }
    var thisObj = this;
    CB._fileCheck(this).then(function(thisObj){

        var xmlhttp = CB._loadXml();
        var params=JSON.stringify({
            document: CB.toJSON(thisObj),
            key: CB.appKey
        });
        var url = CB.apiUrl + "/data/" + CB.appId + '/'+thisObj.document._tableName;
        CB._request('PUT',url,params).then(function(response){
            thisObj = CB.fromJSON(JSON.parse(response),thisObj);
            if (callback) {
                callback.success(thisObj);
            } else {
                def.resolve(thisObj);
            }
        },function(err){
            if(callback){
                callback.error(err);
            }else {
                def.reject(err);
            }
        });

    },function(err){
        if(callback){
            callback.error(err);
        }else {
            def.reject(err);
        }
    });
    if (!callback) {
        return def;
    }
};

CB.CloudObject.prototype.fetch = function(callback) { //fetch the document from the db
    if (!CB.appId) {
        throw "CB.appId is null.";
    }
    if (!this.document._id) {
        throw "Can't fetch an object which is not saved."
    }
    var thisObj = this;
    var def;
    if (!callback) {
        def = new CB.Promise();
    }
    var query = null;
    if(thisObj.document._type === 'file'){
        query = new CB.CloudQuery('_File');
    }else{
        query = new CB.CloudQuery(thisObj.document._tableName);
    }
    query.findById(thisObj.get('id')).then(function(res){
        if(!callback){
            def.resolve(res);
        }else{
            callback.success(res);
        }
    },function(err){
        if(!callback){
            def.reject(err);
        }else{
            callback.error(err);
        }
    });

    if (!callback) {
        return def;
    }

};

CB.CloudObject.prototype.delete = function(callback) { //delete an object matching the objectId
    if (!CB.appId) {
        throw "CB.appId is null.";
    }
    if (!this.document._id) {
        throw "You cannot delete an object which is not saved."
    }
    var thisObj = this;
    var def;
    if (!callback) {
        def = new CB.Promise();
    }

    var params=JSON.stringify({
        key: CB.appKey,
        document: CB.toJSON(thisObj),
        method:"DELETE"
    });
    
    var url = CB.apiUrl + "/data/" + CB.appId +'/'+thisObj.document._tableName;

    CB._request('PUT',url,params).then(function(response){
        if (callback) {
            callback.success(response);
        } else {
            def.resolve(response);
        }
    },function(err){
        if(callback){
            callback.error(err);
        }else {
            def.reject(err);
        }
    });

    if (!callback) {
        return def;
    }
};

CB.CloudObject.saveAll = function(array,callback){

    if(!array || array.constructor !== Array){
        throw "Array of CloudObjects is Null";
    }

    for(var i=0;i<array.length;i++){
        if(!(array[i] instanceof CB.CloudObject)){
            throw "Should Be an Array of CloudObjects";
        }
    }

    var def;
    if(!callback){
        def = new CB.Promise();
    }

    CB._bulkObjFileCheck(array).then(function(){
        var xmlhttp = CB._loadXml();
        var params=JSON.stringify({
            document: CB.toJSON(array),
            key: CB.appKey
        });
        var url = CB.apiUrl + "/data/" + CB.appId + '/'+array[0]._tableName;
        CB._request('PUT',url,params).then(function(response){
            var thisObj = CB.fromJSON(JSON.parse(response));
            if (callback) {
                callback.success(thisObj);
            } else {
                def.resolve(thisObj);
            }
        },function(err){
            if(callback){
                callback.error(err);
            }else {
                def.reject(err);
            }
        });

    },function(err){
        if(callback){
            callback.error(err);
        }else {
            def.reject(err);
        }
    });

    if (!callback) {
        return def;
    }

};

CB.CloudObject.deleteAll = function(array,callback){

    if(!array && array.constructor !== Array){
        throw "Array of CloudObjects is Null";
    }

    for(var i=0;i<array.length;i++){
        if(!(array[i] instanceof CB.CloudObject)){
            throw "Should Be an Array of CloudObjects";
        }
    }

    var def;
    if(!callback){
        def = new CB.Promise();
    }

    var xmlhttp = CB._loadXml();
    var params=JSON.stringify({
        document: CB.toJSON(array),
        key: CB.appKey,
        method:"DELETE"
    });
    var url = CB.apiUrl + "/data/" + CB.appId + '/'+array[0]._tableName;
    CB._request('PUT',url,params).then(function(response){
        var thisObj = CB.fromJSON(JSON.parse(response));
        if (callback) {
            callback.success(thisObj);
        } else {
            def.resolve(thisObj);
        }
    },function(err){
        if(callback){
            callback.error(err);
        }else {
            def.reject(err);
        }
    });

    if (!callback) {
        return def;
    }

};

/* Private Methods */
CB.CloudObject._validateNotificationQuery = function(cloudObject, cloudQuery) { //delete an object matching the objectId

   if(!cloudQuery)
        throw "CloudQuery is null";

    if(!cloudQuery.query)
        throw "There is no query in CloudQuery";

   //validate query.
   var query = cloudQuery.query;

   if(cloudQuery.limit===0)
        return false;

   if(cloudQuery.skip>0){
        --cloudQuery.skip;
        return false;
    }


   //delete include
   delete query.$include;

   if(CB.CloudQuery._validateQuery(cloudObject, query)){
        //redice limit of CloudQuery.
       --cloudQuery.limit;
       return true;
   }else{
    return false;
   }
};


/*
 CloudQuery
 */
CB.CloudQuery = function(tableName) { //constructor for the class CloudQuery

    if(!tableName)
        throw "Table Name cannot be null";

    this.tableName = tableName;
    this.query = {};
    this.query.$include = [];
    this.query.$includeList = [];
    this.select = {};
    this.sort = {};
    this.skip = 0;
    this.limit = 10; //default limit is 10
};

// Logical operations
CB.CloudQuery.or = function(obj1, obj2) {
    if (!obj1.tableName === obj2.tableName) {
        throw "Table names are not same";
    }
    var obj = new CB.CloudQuery(obj1.tableName);
    obj.query["$or"] = [obj1.query, obj2.query];
    return obj;
}


CB.CloudQuery.prototype.equalTo = function(columnName, data) {

    if (columnName === 'id')
        columnName = '_' + columnName;

    if(data !== null){
        if( data.constructor === CB.CloudObject){
            columnName = columnName+'._id';
            data = data.get('id');
        }

        this.query[columnName] = data;
    }else{

        //This is for people who code : obj.equalTo('column', null);
        this.doesNotExists(columnName);
    }

    return this;
};

CB.CloudQuery.prototype.includeList = function (columnName) {
    if (columnName === 'id')
        columnName = '_' + columnName;

    this.query.$includeList.push(columnName);

    return this;
};


CB.CloudQuery.prototype.include = function (columnName) {
    if (columnName === 'id')
        columnName = '_' + columnName;

    this.query.$include.push(columnName);

    return this;
};

CB.CloudQuery.prototype.all = function (columnName) {
    if (columnName === 'id')
        columnName = '_' + columnName;

    this.query.$all = columnName;

    return this;
};

CB.CloudQuery.prototype.any = function (columnName) {
    if (columnName === 'id')
        columnName = '_' + columnName;

    this.query.$any = columnName;

    return this;
};

CB.CloudQuery.prototype.first = function (columnName) {
    if (columnName === 'id')
        columnName = '_' + columnName;

    this.query.$first = columnName;

    return this;
};

CB.CloudQuery.prototype.notEqualTo = function(columnName, data) {
    if (columnName === 'id')
        columnName = '_' + columnName;

    if(data !== null){

        if(data.constructor === CB.CloudObject){
            columnName = columnName+'._id';
            data = data.get('id');
        }

        this.query[columnName] = {
            $ne: data
        };
    }else{
        //This is for people who code : obj.notEqualTo('column', null);
        this.exists(columnName); 
    }

    return this;
};
CB.CloudQuery.prototype.greaterThan = function(columnName, data) {

    if (columnName === 'id')
        columnName = '_' + columnName;

    if (!this.query[columnName]) {
        this.query[columnName] = {};
    }
    this.query[columnName]["$gt"] = data;

    return this;
};
CB.CloudQuery.prototype.greaterThanEqualTo = function(columnName, data) {

    if (columnName === 'id')
        columnName = '_' + columnName;

    if (!this.query[columnName]) {
        this.query[columnName] = {};
    }
    this.query[columnName]["$gte"] = data;

    return this;
};
CB.CloudQuery.prototype.lessThan = function(columnName, data) {

    if (columnName === 'id')
        columnName = '_' + columnName;


    if (!this.query[columnName]) {
        this.query[columnName] = {};
    }
    this.query[columnName]["$lt"] = data;

    return this;
};
CB.CloudQuery.prototype.lessThanEqualTo = function(columnName, data) {

    if (columnName === 'id')
        columnName = '_' + columnName;


    if (!this.query[columnName]) {
        this.query[columnName] = {};
    }
    this.query[columnName]["$lte"] = data;

    return this;
};

//Sorting
CB.CloudQuery.prototype.orderByAsc = function(columnName) {

    if (columnName === 'id')
        columnName = '_' + columnName;

    this.sort[columnName] = 1;

    return this;
};

CB.CloudQuery.prototype.orderByDesc = function(columnName) {

    if (columnName === 'id')
        columnName = '_' + columnName;

    this.sort[columnName] = -1;

    return this;
};

//Limit and skip
CB.CloudQuery.prototype.setLimit = function(data) {

    this.limit = data;
    return this;
};
CB.CloudQuery.prototype.setSkip = function(data) {
    this.skip = data;
    return this;
};

CB.CloudQuery.prototype.paginate = function(pageNo,totalItemsInPage,callback) {   

    if (!CB.appId) {
        throw "CB.appId is null.";
    }
    if (!this.tableName) {
        throw "TableName is null.";
    }
    var def;
    var callback;
    if(typeof callback === 'object' && typeof callback.success === 'function'){
        callback=callback;
    }    
    if (!callback) {
        def = new CB.Promise();
    }  

    if(pageNo && typeof pageNo === 'object' && typeof pageNo.success === 'function'){
        callback=pageNo;
        pageNo=null;
    }
    if(totalItemsInPage && typeof totalItemsInPage === 'object' && typeof totalItemsInPage.success === 'function'){
        callback=totalItemsInPage;
        totalItemsInPage=null;
    }    

    if(pageNo && typeof pageNo === 'number' && pageNo>0){
        if(typeof totalItemsInPage === 'number' && totalItemsInPage>0){
            var skip=(pageNo*totalItemsInPage)-totalItemsInPage;
            this.setSkip(skip);
            this.setLimit(totalItemsInPage);
        }
    }      

    if(totalItemsInPage && typeof totalItemsInPage === 'number' && totalItemsInPage>0){        
        this.setLimit(totalItemsInPage);
    }
    var thisObj=this;    

    var promises = [];
    promises.push(this.find());

    var countQuery = Object.create(this);
    countQuery.setSkip(0);
    countQuery.setLimit(99999999);

    promises.push(countQuery.count());

    CB.Promise.all(promises).then(function(list){
        var objectsList=null;
        var count=null;
        var totalPages=0;

        if(list && list.length>0){
            objectsList=list[0];
            count=list[1];
            if(!count){
                count=0;
                totalPages=0;
            }else{
                totalPages=Math.ceil(count/thisObj.limit);
            }            
            if(totalPages && totalPages<0){
                totalPages=0;
            }
        }
        if(callback) {
            callback.success(objectsList,count,totalPages);
        }else {            
            def.resolve(objectsList,count,totalPages);
        }
    },function(error){
        if(callback){
            callback.error(error);
        }else {
            def.reject(error);
        }
    });

    if (!callback) {
        return def;
    }  

};

//select/deselect columns to show
CB.CloudQuery.prototype.selectColumn = function(columnNames) {

    if(Object.keys(this.select).length === 0){
        this.select = {
            _id : 1,
            createdAt : 1,
            updatedAt : 1,
            ACL : 1,
            _type : 1,
            _tableName : 1
        }
    }

    if (Object.prototype.toString.call(columnNames) === '[object Object]') {
        this.select = columnNames;
    } else if (Object.prototype.toString.call(columnNames) === '[object Array]') {
        for (var i = 0; i < columnNames.length; i++) {
            this.select[columnNames[i]] = 1;
        }
    } else {
        this.select[columnNames] = 1;
    }

    return this;
};

CB.CloudQuery.prototype.doNotSelectColumn = function(columnNames) {
    if (Object.prototype.toString.call(columnNames) === '[object Object]') {
        this.select = columnNames;
    } else if (Object.prototype.toString.call(columnNames) === '[object Array]') {
        for (var i = 0; i < columnNames.length; i++) {
            this.select[columnNames[i]] = 0;
        }
    } else {
        this.select[columnNames] = 0;
    }

    return this;
};

CB.CloudQuery.prototype.containedIn = function(columnName, data) {

    var isCloudObject = false;

    var CbData = [];
    if (columnName === 'id')
        columnName = '_' + columnName;

    if (Object.prototype.toString.call(data) === '[object Object]' && !data instanceof CB.CloudObject) { //if object is passed as an argument
        throw 'Array / value / CloudObject expected as an argument';
    }


    if (Object.prototype.toString.call(data) === '[object Array]') { //if array is passed, then replace the whole

        for(var i=0; i<data.length; i++){
            if(data[i] instanceof CB.CloudObject){
                isCloudObject = true;
                if(!data[i].id){
                    throw "CloudObject passed should be saved and should have an id before being passed to containedIn";
                }
                CbData.push(data[i].id);
            }
        }
        if(CbData.length === 0){
            CbData = data;
        }

        if(isCloudObject){
            columnName = columnName+'._id';
        }


        if (!this.query[columnName]) {
            this.query[columnName] = {};
        }

        this.query[columnName]["$in"] = CbData;
        thisObj = this;
        if (typeof this.query[columnName]["$nin"] !== 'undefined') { //for removing dublicates
            CbData.forEach(function(val) {
                if ((index = thisObj.query[columnName]["$nin"].indexOf(val)) >= 0) {
                    thisObj.query[columnName]["$nin"].splice(index, 1);
                }
            });
        }
    } else { //if the argument is a string then push if it is not present already


        if(data instanceof CB.CloudObject){

            if(!data.id){
                throw "CloudObject passed should be saved and should have an id before being passed to containedIn";
            }

            columnName = columnName+'._id';
            CbData = data.id;
        }else
            CbData = data;

        if (!this.query[columnName]) {
            this.query[columnName] = {};
        }


        if (!this.query[columnName]["$in"]) {
            this.query[columnName]["$in"] = [];
        }
        if (this.query[columnName]["$in"].indexOf(CbData) === -1) {
            this.query[columnName]["$in"].push(CbData);
        }
        if (typeof this.query[columnName]["$nin"] !== 'undefined') {
            if ((index = this.query[columnName]["$nin"].indexOf(CbData)) >= 0) {
                this.query[columnName]["$nin"].splice(index, 1);
            }
        }
    }


    return this;
}

CB.CloudQuery.prototype.notContainedIn = function(columnName, data) {

    var isCloudObject = false;

    var CbData = [];
    if (columnName === 'id' )
        columnName = '_' + columnName;

    if (Object.prototype.toString.call(data) === '[object Object]' && !data instanceof CB.CloudObject) { //if object is passed as an argument
        throw 'Array or string expected as an argument';
    }

    if (Object.prototype.toString.call(data) === '[object Array]') { //if array is passed, then replace the whole

        for(var i=0; i<data.length; i++){
            if(data[i] instanceof CB.CloudObject){
                isCloudObject = true;
                if(!data[i].id){
                    throw "CloudObject passed should be saved and should have an id before being passed to notContainedIn";
                }

                CbData.push(data[i].id);
            }
        }
        if(CbData.length === 0){
            CbData = data;
        }

        if(isCloudObject){
            columnName = columnName+'._id';
        }


        if (!this.query[columnName]) {
            this.query[columnName] = {};
        }

        this.query[columnName]["$nin"] = CbData;
        if (typeof this.query[columnName]["$in"] !== 'undefined') { //for removing duplicates
            thisObj = this;
            CbData.forEach(function(val) {
                if ((index = thisObj.query[columnName]["$in"].indexOf(val)) >= 0) {
                    thisObj.query[columnName]["$in"].splice(index, 1);
                }
            });
        }
    } else { //if the argument is a string then push if it is not present already

        if(data instanceof CB.CloudObject){

            if(!data.id){
                throw "CloudObject passed should be saved and should have an id before being passed to notContainedIn";
            }

            columnName = columnName+'._id';
            CbData = data.id;
        }else
            CbData = data;

        if (!this.query[columnName]) {
            this.query[columnName] = {};
        }


        if (!this.query[columnName]["$nin"]) {
            this.query[columnName]["$nin"] = [];
        }
        if (this.query[columnName]["$nin"].indexOf(CbData) === -1) {
            this.query[columnName]["$nin"].push(CbData);
        }
        if (typeof this.query[columnName]["$in"] !== 'undefined') {
            if ((index = this.query[columnName]["$in"].indexOf(CbData)) >= 0) {
                this.query[columnName]["$in"].splice(index, 1);
            }
        }
    }

    return this;
}

CB.CloudQuery.prototype.exists = function(columnName) {
    if (columnName === 'id')
        columnName = '_' + columnName;

    if (!this.query[columnName]) {
        this.query[columnName] = {};
    }
    this.query[columnName]["$exists"] = true;

    return this;
}

CB.CloudQuery.prototype.doesNotExists = function(columnName) {
    if (columnName === 'id')
        columnName = '_' + columnName;

    if (!this.query[columnName]) {
        this.query[columnName] = {};
    }
    this.query[columnName]["$exists"] = false;

    return this;
}

CB.CloudQuery.prototype.containsAll = function(columnName, data) {

    var isCloudObject = false;

    var CbData = [];

    if (columnName === 'id')
        columnName = '_' + columnName;

    if (Object.prototype.toString.call(data) === '[object Object]' && !data instanceof CB.CloudObject) { //if object is passed as an argument
        throw 'Array or string expected as an argument';
    }

    if (Object.prototype.toString.call(data) === '[object Array]') { //if array is passed, then replace the whole



        for(var i=0; i<data.length; i++){
            if(data[i] instanceof CB.CloudObject){

                isCloudObject = true;

                if(!data[i].id){
                    throw "CloudObject passed should be saved and should have an id before being passed to containsAll";
                }

                CbData.push(data[i].id);
            }
        }

        if(CbData.length === 0){
            CbData = data;
        }

        if(isCloudObject){
            columnName = columnName+'._id';
        }

        if (!this.query[columnName]) {
            this.query[columnName] = {};
        }

        this.query[columnName]["$all"] = CbData;

    } else { //if the argument is a string then push if it is not present already

        if(data instanceof CB.CloudObject){

            if(!data.id){
                throw "CloudObject passed should be saved and should have an id before being passed to containsAll";
            }

            columnName = columnName+'._id';
            CbData = data.id;
        }else
            CbData = data;

        if (!this.query[columnName]) {
            this.query[columnName] = {};
        }


        if (!this.query[columnName]["$all"]) {
            this.query[columnName]["$all"] = [];
        }
        if (this.query[columnName]["$all"].indexOf(CbData) === -1) {
            this.query[columnName]["$all"].push(CbData);
        }

    }

    return this;
}


CB.CloudQuery.prototype.startsWith = function(columnName, value) {
    if (columnName === 'id' )
        columnName = '_' + columnName;

    var regex = '^' + value;
    if (!this.query[columnName]) {
        this.query[columnName] = {};
    } 

    this.query[columnName]["$regex"] = regex;
    this.query[columnName]["$options"] = 'im';
    
    return this;
}


CB.CloudQuery.prototype.regex = function(columnName, value) {
    if (columnName === 'id' )
        columnName = '_' + columnName;

    if (!this.query[columnName]) {
        this.query[columnName] = {};
    } 

    this.query[columnName]["$regex"] = value;
    
    return this;
}

CB.CloudQuery.prototype.substring = function(columnName, value) {

      if(typeof columnName === "string"){
        columnName = [columnName];
      }

      for(var j=0;j<columnName.length;j++){
          if(Object.prototype.toString.call(value) === '[object Array]' && value.length>0) {
            if(!this.query["$or"])
                this.query["$or"] = [];
            for(i=0; i < value.length; i++){
                var obj = {};
                obj[columnName[j]] = {};
                obj[columnName[j]]["$regex"] = ".*"+value[i]+".*";
                this.query["$or"].push(obj);
            }
          }else{
             if(columnName.length===1){
                this.regex(columnName[j],".*"+value+".*");
            }else{
                if(!this.query["$or"])
                    this.query["$or"] = [];
                var obj = {};
                obj[columnName[j]] = {};
                obj[columnName[j]]["$regex"] = ".*"+value+".*";
                this.query["$or"].push(obj);
            }
          }
      }

      return this;
}

//GeoPoint near query
CB.CloudQuery.prototype.near = function(columnName, geoPoint, maxDistance, minDistance){
    if(!this.query[columnName]){
        this.query[columnName] = {};
        this.query[columnName]['$near'] = {
            '$geometry': { coordinates: geoPoint['document'].coordinates, type:'Point'},
            '$maxDistance': maxDistance,
            '$minDistance': minDistance
        };
    }
};

//GeoPoint geoWithin query
CB.CloudQuery.prototype.geoWithin = function(columnName, geoPoint, radius){

    if(!radius){
        var coordinates = [];
        //extracting coordinates from each CloudGeoPoint Object
        if (Object.prototype.toString.call(geoPoint) === '[object Array]') {
            for(i=0; i < geoPoint.length; i++){
                if (geoPoint[i]['document'].hasOwnProperty('coordinates')) {
                    coordinates[i] = geoPoint[i]['document']['coordinates'];
                }
            }
        }else{
            throw 'Invalid Parameter, coordinates should be an array of CloudGeoPoint Object';
        }
        //2dSphere needs first and last coordinates to be same for polygon type
        //eg. for Triangle four coordinates need to pass, three points of triangle and fourth one should be same as first one
        coordinates[coordinates.length] = coordinates[0];
        var type = 'Polygon';
        if(!this.query[columnName]){
            this.query[columnName] = {};
            this.query[columnName]['$geoWithin'] = {};
            this.query[columnName]['$geoWithin']['$geometry'] = {
                'type': type,
                'coordinates': [ coordinates ]
            };
        }
    }else{
        if(!this.query[columnName]){
            this.query[columnName] = {};
            this.query[columnName]['$geoWithin'] = {
                '$centerSphere': [ geoPoint['document']['coordinates'], radius/3963.2 ]
            };
        }
    }
};

CB.CloudQuery.prototype.count = function(callback) {
    if (!CB.appId) {
        throw "CB.appId is null.";
    }
    if (!this.tableName) {
        throw "TableName is null.";
    }
    var def;
    if (!callback) {
        def = new CB.Promise();
    }
    var thisObj = this;
    var params=JSON.stringify({
        query: thisObj.query,
        limit: thisObj.limit,
        skip: thisObj.skip,
        key: CB.appKey
    });
    var url = CB.apiUrl + "/data/" + CB.appId + "/" + thisObj.tableName + '/count';

    CB._request('POST',url,params).then(function(response){
        response = parseInt(response);
        if (callback) {
            callback.success(response);
        } else {
            def.resolve(response);
        }
    },function(err){
        if(callback){
            callback.error(err);
        }else {
            def.reject(err);
        }
    });

    if (!callback) {
        return def;
    }


};

CB.CloudQuery.prototype.distinct = function(keys, callback) {


    if(keys === 'id'){
        keys = '_id';
    }

    if (!CB.appId) {
        throw "CB.appId is null.";
    }
    if (!this.tableName) {
        throw "TableName is null.";
    }
    if (Object.prototype.toString.call(keys) !== '[object Array]' && keys.length <= 0) {
        throw "keys should be array";
    }
    var def;
    if (!callback) {
        def = new CB.Promise();
    }

    var thisObj = this;
    
    var params=JSON.stringify({
        onKey: keys,
        query: thisObj.query,
        select: thisObj.select,
        sort: thisObj.sort,
        limit: thisObj.limit,
        skip: thisObj.skip,
        key: CB.appKey
    });
    url = CB.apiUrl + "/data/" + CB.appId + "/" + thisObj.tableName + '/distinct';

    CB._request('POST',url,params).then(function(response){
        var object = CB.fromJSON(JSON.parse(response));
        if (callback) {
            callback.success(object);
        } else {
            def.resolve(object);
        }
    },function(err){
        if(callback){
            callback.error(err);
        }else {
            def.reject(err);
        }
    });

    if (!callback) {
        return def;
    }
};

CB.CloudQuery.prototype.find = function(callback) { //find the document(s) matching the given query
    if (!CB.appId) {
        throw "CB.appId is null.";
    }
    if (!this.tableName) {
        throw "TableName is null.";
    }
    var def;
    if (!callback) {
        def = new CB.Promise();
    }

    var thisObj = this;

    var xmlhttp=CB._loadXml();
    var params=JSON.stringify({
        query: thisObj.query,
        select: thisObj.select,
        sort: thisObj.sort,
        limit: thisObj.limit,
        skip: thisObj.skip,
        key: CB.appKey
    });

    url = CB.apiUrl + "/data/" + CB.appId + "/" + thisObj.tableName + '/find';

    CB._request('POST',url,params).then(function(response){
        var object = CB.fromJSON(JSON.parse(response));
        if (callback) {
            callback.success(object);
        } else {
            def.resolve(object);
        }
    },function(err){
        if(callback){
            callback.error(err);
        }else {
            def.reject(err);
        }
    });


    if (!callback) {
        return def;
    }
};

CB.CloudQuery.prototype.get = function(objectId,callback){
    var query = new CB.CloudQuery(this.tableName);
    return query.findById(objectId,callback);
};

CB.CloudQuery.prototype.findById = function(objectId, callback) { //find the document(s) matching the given query
    
    var thisObj = this;

    if (!CB.appId) {
        throw "CB.appId is null.";
    }
    if (!this.tableName) {
        throw "TableName is null.";
    }
    var def;
    if (!callback) {
        def = new CB.Promise();
    }

    if(thisObj.skip && !thisObj.skip !== 0){
        throw "You cannot use skip and find object by Id in the same query";
    }

    if(thisObj.limit && thisObj.limit === 0){
        throw "You cannot use limit and find object by Id in the same query";
    }

    if(thisObj.sort && Object.getOwnPropertyNames(thisObj.sort).length > 0){
        throw "You cannot use sort and find object by Id in the same query";
    }

    thisObj.equalTo('id',objectId);

    var params=JSON.stringify({
        query: thisObj.query,
        select: thisObj.select,
        key: CB.appKey,
        limit : 1,
        skip : 0,
        sort : {}
    });

    var url = CB.apiUrl + "/data/" + CB.appId + "/" + thisObj.tableName + '/find';

    CB._request('POST',url,params).then(function(response){
        response = JSON.parse(response);
        if (Object.prototype.toString.call(response) === '[object Array]') {
            response = response[0];
        }
        if (callback) {
            callback.success(CB.fromJSON(response));
        } else {
            def.resolve(CB.fromJSON(response));
        }
    },function(err){
        if(callback){
            callback.error(err);
        }else {
            def.reject(err);
        }
    });

    if (!callback) {
        return def;
    }
};
CB.CloudQuery.prototype.findOne = function(callback) { //find a single document matching the given query
    if (!CB.appId) {
        throw "CB.appId is null.";
    }
    if (!this.tableName) {
        throw "TableName is null.";
    }
    var def;
    if (!callback) {
        def = new CB.Promise();
    }
    var params=JSON.stringify({
        query: this.query,
        select: this.select,
        sort: this.sort,
        skip: this.skip,
        key: CB.appKey
    });
    url = CB.apiUrl + "/data/" + CB.appId + "/" + this.tableName + '/findOne';

    CB._request('POST',url,params).then(function(response){
        var object = CB.fromJSON(JSON.parse(response));
        if (callback) {
            callback.success(object);
        } else {
            def.resolve(object);
        }
    },function(err){
        if(callback){
            callback.error(err);
        }else {
            def.reject(err);
        }
    });

    if (!callback) {
        return def;
    }
};


CB.CloudQuery._validateQuery = function(cloudObject, query){
    //validate query. 
   for(var key in query){
        
        if(query[key]){
            var value = query[key];
            if(typeof value === 'object'){

                if(key === '$or'){
                    if(query[key].length>0){
                        var isTrue = false;
                        for(var i=0;i<query[key].length;i++){
                            if(CB.CloudQuery._validateQuery(cloudObject,query[key][i])){
                                isTrue = true;
                                break;
                            }
                        }

                        if(!isTrue){
                            return false;
                        }
                    }
                }else{

                        for(var objectKeys in value){
                             //not equalTo query
                            if(objectKeys === '$ne'){
                                if(cloudObject.get(key) === query[key]['$ne']){
                                    return false;
                                }
                            }

                            //greater than
                            if(objectKeys === '$gt'){
                                if(cloudObject.get(key) <= query[key]['$gt']){
                                    return false;
                                }
                            }

                            //less than
                            if(objectKeys === '$lt'){
                                if(cloudObject.get(key) >= query[key]['$lt']){
                                    return false;
                                }
                            }

                            //greater than and equalTo. 
                            if(objectKeys === '$gte'){
                                if(cloudObject.get(key) < query[key]['$gte']){
                                    return false;
                                }
                            }


                            //less than and equalTo. 
                            if(objectKeys === '$lte'){
                                if(cloudObject.get(key) > query[key]['$lte']){
                                    return false;
                                }
                            }

                            //exists 
                            if(objectKeys === '$exists'){
                                if(query[key][objectKeys] && cloudObject.get(key)){
                                    //do nothing.
                                }else if(query[key][objectKeys]!==false){
                                    return false;
                                }
                            }

                            //doesNot exists. 
                            if(objectKeys === '$exists'){
                                if(!query[key][objectKeys] && cloudObject.get(key)){
                                    return false;
                                }
                            }

                            //startsWith. 
                            if(objectKeys === '$regex'){

                                var reg = new RegExp(query[key][objectKeys]);

                                if(!query[key]['$options'] ){
                                    if(!reg.test(cloudObject.get(key))) //test actial regex. 
                                        return false;
                                }else{
                                    if(query[key]['$options']==='im'){ //test starts with.
                                         //starts with.
                                        var value = trimStart('^', query[key][objectKeys]);
                                        if(cloudObject.get(key).indexOf(value)!==0)
                                            return false;
                                        }
                                }

                            }


                            //containedIn. 
                            if(objectKeys === '$in'){

                                if(query[key][objectKeys]){
                                    var arr =  query[key][objectKeys];
                                    var value = null;
                                    if(key.indexOf('.')>-1){ //for CloudObjects
                                        value = cloudObject.get(key.substr(0,key.indexOf('.')));
                                    }else{
                                        value = cloudObject.get(key);
                                    }

                                    if( Object.prototype.toString.call( value ) === '[object Array]' ) {
                                        var exists = false;
                                        for(var i=0;i<value.length;i++){
                                            if(value[i] instanceof CB.CloudObject){
                                                if(arr.indexOf(value[i].id)>-1){
                                                    exists = true;
                                                    break;
                                                }
                                            }else{
                                                if(arr.indexOf(value[i])>-1){
                                                    exists = true;
                                                    break;
                                                }
                                            }
                                           
                                        }

                                        if(!exists){
                                            return false;
                                        }

                                    }else{
                                        //if the element is not in the array then return false;
                                        if(arr.indexOf(value)===-1)
                                            return false;
                                    }

                                }
                            }

                            //doesNot containedIn. 
                            if(objectKeys === '$nin'){
                                if(query[key][objectKeys]){
                                    var arr =  query[key][objectKeys];
                                    var value = null;
                                    if(key.indexOf('.')>-1){ //for CloudObjects
                                        value = cloudObject.get(key.substr(0,key.indexOf('.')));
                                    }else{
                                        value = cloudObject.get(key);
                                    }

                                    if( Object.prototype.toString.call( value ) === '[object Array]' ) {
                                        var exists = false;
                                        for(var i=0;i<value.length;i++){
                                            if(value[i] instanceof CB.CloudObject){
                                                if(arr.indexOf(value[i].id)!==-1){
                                                    exists = true;
                                                    break;
                                                }
                                            }else{
                                                if(arr.indexOf(value[i])!==-1){
                                                    exists = true;
                                                    break;
                                                }
                                            }
                                            
                                        }
                                        
                                        if(exists){
                                            return false;
                                        }

                                    }else{
                                        //if the element is not in the array then return false;
                                        if(arr.indexOf(value)!==-1)
                                            return false;
                                    }

                                }
                            }

                            //containsAll. 
                             if(objectKeys === '$all'){
                                if(query[key][objectKeys]){
                                    var arr =  query[key][objectKeys];
                                    var value = null;
                                    if(key.indexOf('.')>-1){ //for CloudObjects
                                        value = cloudObject.get(key.substr(0,key.indexOf('.')));
                                    }else{
                                        value = cloudObject.get(key);
                                    }

                                    if( Object.prototype.toString.call( value ) === '[object Array]' ) {
                                        for(var i=0;i<value.length;i++){
                                            if(value[i] instanceof CB.CloudObject){
                                                if(arr.indexOf(value[i].id)===-1){
                                                    return false;
                                                }
                                            }else{
                                                if(arr.indexOf(value[i])===-1){
                                                    return false;
                                                }
                                            }
                                        }
                                    }else{
                                        //if the element is not in the array then return false;
                                        if(arr.indexOf(value)===-1)
                                            return false;
                                    }

                                }
                            }
                        }
                    
                }
            }else{
                //it might be a plain equalTo query. 
                if(key.indexOf('.')!==-1){ // for keys with "key._id" - This is for CloudObjects.
                    var temp = key.substring(0, key.indexOf('.'));
                    if(!cloudObject.get(temp)){
                        return false;
                    }

                    if(cloudObject.get(temp).id !== query[key]){
                        return false;
                    }
                }else{
                    if(cloudObject.get(key) !== query[key]){
                        return false;
                    }
                }
                
            }
        }
        
   }

   return true;
};





CB.SearchFilter = function(){

    this.bool = {};
    this.bool.must = []; //and
    this.bool.should = []; //or
    this.bool.must_not = []; //not
    this.$include = []; //include
};


CB.SearchFilter.prototype.notEqualTo = function(columnName, data) {

    if (columnName === 'id' || columnName === 'isSearchable' || columnName === 'expires')
        columnName = '_' + columnName;
    //data can bean array too!
    var term = {};
    if (data instanceof Array) {
        term.terms = {};
        term.terms[columnName] = data;
    } else {
        term.term = {};
        term.term[columnName] = data;
    }

    this.bool.must_not.push(term);

    return this;

};

CB.SearchFilter.prototype.equalTo = function(columnName, data) {

    if (columnName === 'id' || columnName === 'isSearchable' || columnName === 'expires')
        columnName = '_' + columnName;
    var term = {};
    if (data instanceof Array) {
        term.terms = {};
        term.terms[columnName] = data;
    } else {
        if(data !== null) {
            if (data.constructor === CB.CloudObject) {
                data = data.get('id');
                term.nested = {};
                term.nested.path = columnName;
                term.nested.filter = {};
                term.nested.filter.term = {};
                term.nested.filter.term[columnName+'._id'] = data;
            }else{
                term.term = {};
                term.term[columnName] = data;
            }
        }else{
            term.term[columnName] = data;
        }
    }

    this.bool.must.push(term);

    return this;
};

CB.SearchFilter.prototype.exists = function(columnName) {

    if (columnName === 'id' || columnName === 'isSearchable' || columnName === 'expires')
        columnName = '_' + columnName;
    var obj = {};
    obj.exists = {};
    obj.exists.field = columnName;

    this.bool.must.push(obj);

    return this;
};

CB.SearchFilter.prototype.doesNotExist = function(columnName) {

    if (columnName === 'id' || columnName === 'isSearchable' || columnName === 'expires')
        columnName = '_' + columnName;
    var obj = {};
    obj.missing = {};
    obj.missing.field = columnName;

    this.bool.must.push(obj);

    return this;
};

CB.SearchFilter.prototype.greaterThanOrEqual = function(columnName, data) {

    if (columnName === 'id' || columnName === 'isSearchable' || columnName === 'expires')
        columnName = '_' + columnName;
    var obj = {};
    obj.range = {};
    obj.range[columnName] = {};
    obj.range[columnName]['gte'] = data;

    this.bool.must.push(obj);

    return this;
};

CB.SearchFilter.prototype.greaterThan = function(columnName, data) {

    if (columnName === 'id' || columnName === 'isSearchable' || columnName === 'expires')
        columnName = '_' + columnName;
    var obj = {};
    obj.range = {};
    obj.range[columnName] = {};
    obj.range[columnName]['gt'] = data;

    this.bool.must.push(obj);

    return this;
};

CB.SearchFilter.prototype.lessThan = function(columnName, data) {

    if (columnName === 'id' || columnName === 'isSearchable' || columnName === 'expires')
        columnName = '_' + columnName;
    var obj = {};
    obj.range = {};
    obj.range[columnName] = {};
    obj.range[columnName]['lt'] = data;

    this.bool.must.push(obj);

    return this;
};

CB.SearchFilter.prototype.lessthanOrEqual = function(columnName, data) {

    if (columnName === 'id' || columnName === 'isSearchable' || columnName === 'expires')
        columnName = '_' + columnName;
    var obj = {};
    obj.range = {};
    obj.range[columnName] = {};
    obj.range[columnName]['lte'] = data;

    this.bool.must.push(obj);

    return this;
};

CB.SearchFilter.prototype.near = function(columnName,geoPoint,distance){

    var obj = {};
    obj.geo_distance = {};

    //distance is in meters here in accordance with what we have in Mongo

    obj.geo_distance.distance = distance.toString() + ' m';
    obj.geo_distance[columnName] = geoPoint.document.coordinates;

    this.bool.must.push(obj);
};

//And logical function. 
CB.SearchFilter.prototype.and = function(searchFilter) {

    if(searchFilter.$include.length>0){
        throw "You cannot have an include over AND. Have an CloudSearch Include over parent SearchFilter instead.";
    }

    delete searchFilter.$include;

    if(!searchFilter instanceof CB.SearchFilter){
        throw "data should be of type CB.SearchFilter";
    }

    this.bool.must.push(searchFilter);

    return this;
};

//OR Logical function
CB.SearchFilter.prototype.or = function(searchFilter) {

    if(searchFilter.$include.length>0){
        throw "You cannot have an include over OR. Have an CloudSearch Include over parent SearchFilter instead.";
    }

    delete searchFilter.$include;

    if(!searchFilter instanceof CB.SearchFilter){
        throw "data should be of type CB.SearchFilter";
    }

    this.bool.should.push(searchFilter);

    return this;
};


//NOT logical function
CB.SearchFilter.prototype.not = function(searchFilter) {

    if(searchFilter.$include.length>0){
        throw "You cannot have an include over NOT. Have an CloudSearch Include over parent SearchFilter instead.";
    }

    delete searchFilter.$include;

   if(!searchFilter instanceof CB.SearchFilter){
        throw "data should be of type CB.SearchFilter";
   }

   this.bool.must_not.push(searchFilter);

   return this;
};

CB.SearchFilter.prototype.include = function (columnName) {
    if (columnName === 'id')
        columnName = '_' + columnName;

    this.$include.push(columnName);

    return this;
};


/* This is Search Query*/

CB.SearchQuery = function(){
    this.bool = {};
    this.bool.must = []; //and
    this.bool.should = []; //or
    this.bool.must_not = []; //not
};

CB.SearchQuery.prototype._buildSearchPhrase = function(columns, query, slop, boost) {

    var obj = this._buildSearchOn(columns, query, null, null,null,boost);

     if (columns instanceof Array) {
        obj.multi_match.type = 'phrase';
        if(slop){
            obj.multi_match.slop = slop;
        }
     } else {
        obj.match[columns].type = 'phrase';
        if(slop){
            obj.match[columns].slop = slop;
        }
     }

     return obj;

}


CB.SearchQuery.prototype._buildBestColumns = function(columns, query, fuzziness, operator, match_percent, boost) {

    var obj = this._buildSearchOn(columns, query, fuzziness, operator, match_percent, boost);

     if (columns instanceof Array) {
        obj.multi_match.type = 'best_fields';
     } else {
        obj.match[columns].type = 'best_fields';
     }

     return obj;
};

CB.SearchQuery.prototype._buildMostColumns = function(columns, query, fuzziness,  operator, match_percent, boost) {

    var obj = this._buildSearchOn(columns, query, fuzziness, operator, match_percent, boost);

     if (columns instanceof Array) {
        obj.multi_match.type = 'most_fields';
     } else {
        obj.match[columns].type = 'most_fields';
     }

     return obj;
};

CB.SearchQuery.prototype._buildSearchOn = function(columns, query, fuzziness, operator, match_percent, boost) {

    var obj = {};

        if (columns instanceof Array) {
            //if columns is an array.
            obj.multi_match = {};
            obj.multi_match.query = query;
            obj.multi_match.fields = columns;
            
            if (operator) {
                obj.multi_match.operator = operator;
            } 

            if(match_percent){
                obj.multi_match.minimum_should_match = match_percent;
            }
            
            if(boost){
                obj.multi_match.boost = boost;
            }

            if(fuzziness){
                obj.multi_match.fuzziness = fuzziness;
            }

        } else {

            obj.match = {};
            obj.match[columns] = {};
            obj.match[columns].query = query;
            
            if (operator) {
                obj.match[columns].operator = operator;
            }

            if(match_percent){
                obj.match[columns].minimum_should_match = match_percent;
            }

            if(boost){
                obj.match[columns].boost = boost;
            }

            if(fuzziness){
                obj.match[columns].fuzziness = fuzziness;
            }
        }

        return obj;

}

CB.SearchQuery.prototype.searchOn = function(columns, query, fuzziness, all_words, match_percent, priority) {

    //this is actually 'operator'
    if(all_words){
        all_words='and';
    }
        
    var obj = this._buildSearchOn(columns,query, fuzziness,all_words,match_percent,priority);
    //save in query 'and' clause.
    this.bool.should.push(obj); 

    return this;
    
};

CB.SearchQuery.prototype.phrase = function(columns, query,fuzziness, priority) {

        
    var obj = this._buildSearchPhrase(columns, query,fuzziness, priority);
    //save in query 'and' clause.
    this.bool.should.push(obj); 

    return this;
};

CB.SearchQuery.prototype.bestColumns = function(columns, query, fuzziness, all_words, match_percent, priority) {

    if(!columns instanceof Array || columns.length<2)
           throw "There should be more than one columns in-order to use this function";

    if(all_words){
        all_words='and';
    }

    var obj = this._buildBestColumns(columns, query, fuzziness, all_words, match_percent, priority);
    //save in query 'and' clause.
    this.bool.should.push(obj); 

    return this;
};

CB.SearchQuery.prototype.mostColumns = function(columns, query, fuzziness, all_words, match_percent, priority) {

    if(!columns instanceof Array || columns.length<2)
           throw "There should be more than one columns in-order to use this function";

    if(all_words){
        all_words='and';
    }

    var obj = this._buildMostColumns(columns, query, fuzziness, all_words, match_percent, priority);
    //save in query 'and' clause.
    this.bool.should.push(obj); 

    return this;
};

CB.SearchQuery.prototype.startsWith = function(column, value, priority) {

    var obj = {};
    obj.prefix = {};
    obj.prefix[column] = {};
    obj.prefix[column].value = value;
    
    if(priority){
        obj.prefix[column].boost = priority;
    }

    this.bool.must.push(obj);
};

CB.SearchQuery.prototype.wildcard = function(column, value, priority) {

    var obj = {};
    obj.wildcard = {};
    obj.wildcard[column] = {};
    obj.wildcard[column].value = value;
    
    if(priority){
        obj.wildcard[column].boost = priority;
    }

    this.bool.should.push(obj);
};



CB.SearchQuery.prototype.regexp = function(column, value, priority) {

    var obj = {};
    obj.regexp = {};
    obj.regexp[column] = {};
    obj.regexp[column].value = value;
    
    if(priority){
        obj.regexp[column].boost = priority;
    }

    this.bool.must.push(obj);
};

//And logical function. 
CB.SearchQuery.prototype.and = function(searchQuery) {

    if(!searchQuery instanceof CB.SearchQuery){
        throw "data should be of type CB.SearchQuery";
    }

    this.bool.must.push(searchQuery);
};

//OR Logical function
CB.SearchQuery.prototype.or = function(searchQuery) {

    if(!searchQuery instanceof CB.SearchQuery){
        throw "data should be of type CB.SearchQuery";
    }

    this.bool.should.push(searchQuery);
};


//NOT logical function
CB.SearchQuery.prototype.not = function(searchQuery) {

    if(!searchQuery instanceof CB.SearchQuery){
        throw "data should be of type CB.SearchQuery";
    }

    this.bool.must_not.push(searchQuery);
};


/* This is CloudSearch Function, 

Params : 
CollectionNames : string or string[] of collection names. (Required)
SearchQuery : CB.SearchQuery Object (optional)
SearchFilter : CB.SearchFilter Object (optional)
*/

CB.CloudSearch = function(collectionNames, searchQuery, searchFilter) {

    this.collectionNames = collectionNames;
    //make a filterd query in elastic search.

    this.query = {};
    this.query.filtered = {};
    
    
    if(searchQuery){
        this.query.filtered.query = searchQuery;
    }else{
        this.query.filtered.query = {};
    }

    if(searchFilter){
        this.query.filtered.filter = searchFilter;
    }else{
        this.query.filtered.filter = {};
    }

    this.from = 0; //this is skip in usual terms.
    this.size = 10; //this is take in usual terms.
    this.sort = [];
};

Object.defineProperty(CB.CloudSearch.prototype, 'searchFilter', {
    get: function() {
        return this.query.filtered.filter;
    },
    set: function(searchFilter) {
        this.query.filtered.filter = searchFilter;
    }
});


Object.defineProperty(CB.CloudSearch.prototype, 'searchQuery', {
    get: function() {
        return this.query.filtered.query;
    },
    set: function(searchQuery) {
        this.query.filtered.query = searchQuery;
    }
});

CB.CloudSearch.prototype.setSkip = function(data) {
    this.from = data;
    return this;
};

CB.CloudSearch.prototype.setLimit = function(data) {
    this.size = data;
    return this;
};

CB.CloudSearch.prototype.orderByAsc = function(columnName) {

    if (columnName === 'id' || columnName === 'isSearchable' || columnName === 'expires')
        columnName = '_' + columnName;

    var obj = {};
    obj[columnName] = {};
    obj[columnName]['order'] = 'asc';
    this.sort.push(obj);

    return this;
};

CB.CloudSearch.prototype.orderByDesc = function(columnName) {

    if (columnName === 'id' || columnName === 'isSearchable' || columnName === 'expires')
        columnName = '_' + columnName;

    var obj = {};
    obj[columnName] = {};
    obj[columnName]['order'] = 'desc';
    this.sort.push(obj);

    return this;
};


CB.CloudSearch.prototype.search = function(callback) {

    CB._validate();

    var collectionName = null;

    var def;
    if (!callback) {
        def = new CB.Promise();
    }

    if (this.collectionNames instanceof Array) {
        collectionName = this.collectionNames.join(',');
    } else {
        collectionName = this.collectionNames;
    }


    var params=JSON.stringify({
        collectionName: collectionName,
        query: this.query,
        sort: this.sort,
        limit: this.size,
        skip: this.from,
        key: CB.appKey
    });

    var url = CB.apiUrl + "/data/" + CB.appId +'/'+ collectionName + "/search" ;

    CB._request('POST',url,params).then(function(response){
        var object = CB.fromJSON(JSON.parse(response));
        if (callback) {
            callback.success(object);
        } else {
            def.resolve(object);
        }
    },function(err){
        if(callback){
            callback.error(err);
        }else {
            def.reject(err);
        }
    });
    if(!callback) {
        return def;
    }
};

/*
 CloudRole
 */
CB.CloudRole = CB.CloudRole || function(roleName) { //calling the constructor.
    if (!this.document) this.document = {};
    this.document._tableName = 'Role';
    this.document._type = 'role';
    this.document.name = roleName;
    this.document.expires = null;
    this.document.ACL = new CB.ACL();
    this.document.expires = null;
    this.document._isModified = true;
    this.document._modifiedColumns = ['createdAt','updatedAt','ACL','name','expires'];
};

CB.CloudRole.prototype = Object.create(CB.CloudObject.prototype);

Object.defineProperty(CB.CloudRole.prototype, 'name', {
    get: function() {
        return this.document.name;
    },
    set: function(name) {
        this.document.name = name;
        CB._modified(this,name);
    }
});

/*
 CloudFiles
 */

CB.CloudFile = CB.CloudFile || function(file,data,type) {

    if (Object.prototype.toString.call(file) === '[object File]' || Object.prototype.toString.call(file) === '[object Blob]' ) {

        this.fileObj = file;
        this.document = {
            _id: null,
            _type: 'file',
            ACL: new CB.ACL(),
            name: (file && file.name && file.name !== "") ? file.name : 'unknown',
            size: file.size,
            url: null,
            expires: null,
            contentType : (typeof file.type !== "undefined" && file.type !== "") ? file.type : 'unknown'
        };

    } else if(typeof file === "string") {
        var regexp = RegExp("https?:\/\/(?:www\.|(?!www))[^\s\.]+\.[^\s]{2,}|www\.[^\s]+\.[^\s]{2,}");
        if (regexp.test(file)) {
            this.document = {
                _id: null,
                _type: 'file',
                ACL: new CB.ACL(),
                name: '',
                size: '',
                url: file,
                expires: null,
                contentType : ''
            };
        } else{
            if(data){
                this.data = data;
                if(!type){
                    type = file.split('.')[file.split('.').length-1];
                }
                this.document = {
                    _id: null,
                    _type: 'file',
                    ACL: new CB.ACL(),
                    name: file,
                    size: '',
                    url: null,
                    expires: null,
                    contentType : type
                };
            }else{
                this.document = {
                    _id: file,
                    _type: 'file'
                }
            }
        }
    }
};

CB.CloudFile.prototype = Object.create(CB.CloudObject.prototype);

Object.defineProperty(CB.CloudFile.prototype, 'type', {
    get: function() {
        return this.document.contentType;
    },
    set: function(type) {
        this.document.contentType = type;
    }
});

Object.defineProperty(CB.CloudFile.prototype, 'url', {
    get: function() {
        return this.document.url;
    },
    set: function(url) {
        this.document.url = url;
    }
});

Object.defineProperty(CB.CloudFile.prototype, 'size', {
    get: function() {
        return this.document.size;
    },
    set: function(size) {
        this.document.size = size;
    }
});

Object.defineProperty(CB.CloudFile.prototype, 'name', {
    get: function() {
        return this.document.name;
    },
    set: function(name) {
        this.document.name = name;
    }
});

/**
 * Uploads File
 *
 * @param callback
 * @returns {*}
 */

CB.CloudFile.prototype.save = function(callback) {

    var def;

    if (!callback) {
        def = new CB.Promise();
    }

    var thisObj = this;

    if(!this.fileObj && !this.data)
        throw "You cannot save a file which is null";

    if(!this.data) {
        var params = new FormData();
        params.append("fileToUpload", this.fileObj);
        params.append("key", CB.appKey);
        params.append("fileObj",JSON.stringify(CB.toJSON(thisObj)));
        var url = CB.apiUrl + '/file/' + CB.appId;

        var uploadProgressCallback = null;
        
        if(callback && callback.uploadProgress){
            uploadProgressCallback = callback.uploadProgress;
        }

        CB._request('POST',url,params,false,true, uploadProgressCallback).then(function(response){
            thisObj.document = JSON.parse(response);
            if (callback) {
                callback.success(thisObj);
            } else {
                def.resolve(thisObj);
            }
        },function(err){
            if(callback){
                callback.error(err);
            }else {
                def.reject(err);
            }
        });
    }else{
        var data = this.data;
        var params=JSON.stringify({
            data: data,
            fileObj:CB.toJSON(this),
            key: CB.appKey
        });
        url = CB.apiUrl + '/file/' + CB.appId;
        var uploadProgressCallback = null;

        if(callback && callback.uploadProgress){
            uploadProgressCallback = callback.uploadProgress;
        }

        CB._request('POST',url,params,null,null,uploadProgressCallback).then(function(response){
            thisObj.document = JSON.parse(response);
            delete thisObj.data;
            if (callback) {
                callback.success(thisObj);
            } else {
                def.resolve(thisObj);
            }
        },function(err){
            if(callback){
                callback.error(err);
            }else {
                def.reject(err);
            }
        });
    }

    if (!callback) {
        return def;
    }
};

/**
 * Removes a file from Database.
 *
 * @param callback
 * @returns {*}
 */


CB.CloudFile.prototype.delete = function(callback) {
    var def;

    if(!this.url) {
        throw "You cannot delete a file which does not have an URL";
    }
    if (!callback) {
        def = new CB.Promise();
    }
    var thisObj = this;

    var params=JSON.stringify({
        fileObj: CB.toJSON(thisObj),
        key: CB.appKey,
        method:"PUT"
    });
    var url = CB.apiUrl+'/file/' + CB.appId + '/' + this.document._id ;

    CB._request('PUT',url,params).then(function(response){
        thisObj.url = null;
        if (callback) {
            callback.success(thisObj);
        } else {
            def.resolve(thisObj);
        }
    },function(err){
        if(callback){
            callback.error(err);
        }else {
            def.reject(err);
        }
    });


    if (!callback) {
        return def;
    }
};


CB.CloudFile.prototype.getFileContent = function(callback){

    var def;

    if(!this.url) {
        throw "URL is null. Fetch this file object first using fetch()";
    }
    if (!callback) {
        def = new CB.Promise();
    }

    var params=JSON.stringify({
        key: CB.appKey
    });
    var url = this.url;

    CB._request('GET',url,params).then(function(response){
        if (callback) {
            callback.success(response);
        } else {
            def.resolve(response);
        }
    },function(err){
        if(callback){
            callback.error(err);
        }else {
            def.reject(err);
        }
    });

    if (!callback) {
        return def;
    }
};


/*
 *CloudGeoPoint
 */

CB.CloudGeoPoint = CB.CloudGeoPoint || function(longitude , latitude) {
    if((!latitude && latitude!==0) || (!longitude && longitude!==0))
        throw "Latitude or Longitude is empty.";

    if(isNaN(latitude))
        throw "Latitude "+ latitude +" is not a number type.";

    if(isNaN(longitude))
        throw "Longitude "+ longitude+" is not a number type.";

    this.document = {};
    this.document._type = "point";
    this.document._isModified = true;
    //The default datum for an earth-like sphere is WGS84. Coordinate-axis order is longitude, latitude.
    if((Number(latitude)>= -90 && Number(latitude)<=90)&&(Number(longitude)>= -180 && Number(longitude)<=180)) {
        this.document.coordinates = [Number(longitude), Number(latitude)];
        this.document.latitude = Number(latitude);
        this.document.longitude = Number(longitude);
    }
    else{
        throw "latitude and longitudes are not in range";
    }
};

Object.defineProperty(CB.CloudGeoPoint.prototype, 'latitude', {
    get: function() {
        return this.document.coordinates[1];
    },
    set: function(latitude) {
        if(Number(latitude)>= -90 && Number(latitude)<=90) {
            this.document.latitude = Number(latitude);
            this.document.coordinates[1] = Number(latitude);
            this.document._isModified = true;
        }
        else
            throw "Latitude is not in Range";
    }
});

Object.defineProperty(CB.CloudGeoPoint.prototype, 'longitude', {
    get: function() {
        return this.document.coordinates[0];
    },
    set: function(longitude) {
        if(Number(longitude)>= -180 && Number(longitude)<=180) {
            this.document.longitude = Number(longitude);
            this.document.coordinates[0] = Number(longitude);
            this.document._isModified = true;
        }
        else
            throw "Longitude is not in Range";
    }
});

CB.CloudGeoPoint.prototype.get = function(name) { //for getting data of a particular column

    return this.document[name];
};

CB.CloudGeoPoint.prototype.set = function(name,value) { //for getting data of a particular column

    if(name === 'latitude') {
        if(Number(value)>= -90 && Number(value)<=90) {
            this.document.latitude = Number(value);
            this.document.coordinates[1] = Number(value);
            this.document._isModified = true;
        }
        else
            throw "Latitude is not in Range";
    }
    else {
        if(Number(value)>= -180 && Number(value)<=180) {
            this.document.longitude = Number(value);
            this.document.coordinates[0] = Number(value);
            this.document._isModified = true;
        }
        else
            throw "Latitude is not in Range";
    }
};
CB.CloudGeoPoint.prototype.distanceInKMs = function(point) {

    var earthRedius = 6371; //in Kilometer
    return earthRedius * greatCircleFormula(this, point);
};

CB.CloudGeoPoint.prototype.distanceInMiles = function(point){

    var earthRedius = 3959 // in Miles
    return earthRedius * greatCircleFormula(this, point);

};

CB.CloudGeoPoint.prototype.distanceInRadians = function(point){

    return greatCircleFormula(this, point);
};

function greatCircleFormula(thisObj, point){

    var dLat =(thisObj.document.coordinates[1] - point.document.coordinates[1]).toRad();
    var dLon = (thisObj.document.coordinates[0] - point.document.coordinates[0]).toRad();
    var lat1 = (point.document.coordinates[1]).toRad();
    var lat2 = (thisObj.document.coordinates[1]).toRad();
    var a = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.sin(dLon/2) * Math.sin(dLon/2) * Math.cos(lat1) * Math.cos(lat2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return c;
}

if (typeof(Number.prototype.toRad) === "undefined") {
    Number.prototype.toRad = function() {
        return this * Math.PI / 180;
    }
}

/*
  CloudTable
 */

CB.CloudTable = function(tableName){  //new table constructor

  CB._tableValidation(tableName);
  this.document = {};
  this.document.name = tableName;
  this.document.appId = CB.appId;
  this.document._type = 'table';

  if(tableName.toLowerCase() === "user") {
      this.document.type = "user";
      this.document.maxCount = 1;
  }
  else if(tableName.toLowerCase() === "role") {
      this.document.type = "role";
      this.document.maxCount = 1;
  }
  else if(tableName.toLowerCase() === "device") {
      this.document.type = "device";
      this.document.maxCount = 1;
  }
  else {
      this.document.type = "custom";
      this.document.maxCount = 9999;
  }
  this.document.columns = CB._defaultColumns(this.document.type);
};

Object.defineProperty(CB.CloudTable.prototype,'columns',{
    get: function(){
        return this.document.columns;
    }
});

Object.defineProperty(CB.CloudTable.prototype,'name',{
    get: function(){
        return this.document.name;
    },
    set: function(){
        throw "You can not rename a table";
    }
});

Object.defineProperty(CB.CloudTable.prototype,'id',{
    get: function(){
        return this.document._id;
    }
});


CB.CloudTable.prototype.addColumn = function(column){
    if(Object.prototype.toString.call(column) === '[object String]') {
        var obj = new CB.Column(column);
        column = obj;
    }
  if (Object.prototype.toString.call(column) === '[object Object]') {
    if(CB._columnValidation(column, this))
      this.document.columns.push(column);

  } else if (Object.prototype.toString.call(column) === '[object Array]') {
      for(var i=0; i<column.length; i++){
        if(CB._columnValidation(column[i], this))
          this.document.columns.push(column[i]);
      }
  }
};

CB.CloudTable.prototype.getColumn = function(columnName){
    if(Object.prototype.toString.call(columnName) !== '[object String]') {
        throw "Should enter a columnName";
    }
    var columns = this.document.columns;
    for(var i=0;i<columns.length;i++){
        if(columns[i].name === columnName)
            return columns[i];
    }
    throw "Column Does Not Exists";
};

CB.CloudTable.prototype.updateColumn = function(column){
    if (Object.prototype.toString.call(column) === '[object Object]') {
        if (CB._columnValidation(column, this)){
            var columns = this.document.columns;
            for(var i=0;i<columns.length;i++){
                if(columns[i].name === column.name){
                    columns[i] = column;
                    this.document.columns = columns;
                    break;
                }
            }
        }else{
            throw "Invalid Column";
        }
    }else{
        throw "Invalid Column";
    }

};


CB.CloudTable.prototype.deleteColumn = function(column){
    if(Object.prototype.toString.call(column) === '[object String]') {
        var obj = new CB.Column(column);
        column = obj;
    }
  if (Object.prototype.toString.call(column) === '[object Object]') {
        if(CB._columnValidation(column, this)){
            var arr = [];
            for(var i=0;i<this.columns.length;i++){
                if(this.columns[i].name !== column.name)
                    arr.push(this.columns[i]);
            }
          this.document.columns = arr;
        }

  } else if (Object.prototype.toString.call(column) === '[object Array]') {
      var arr = [];
      for(var i=0; i<column.length; i++){
        if(CB._columnValidation(column[i], this)){
            for(var i=0;i<this.columns.length;i++){
                if(this.columns[i].name !== column[i].name)
                    arr.push(this.columns[i]);
            }
            this.document.columns = arr;
        }
      }
  }
};

/**
 * Gets All the Tables from an App
 *
 * @param callback
 * @returns {*}
 */

CB.CloudTable.getAll = function(callback){
  if (!CB.appId) {
      throw "CB.appId is null.";
  }

  var def;
  if (!callback) {
      def = new CB.Promise();
  }

  var params=JSON.stringify({
      key: CB.appKey
  });

  var url = CB.apiUrl+'/app/'+CB.appId +"/_getAll";
  CB._request('POST',url,params,true).then(function(response){
    response = JSON.parse(response);
    var obj = CB.fromJSON(response);
    if (callback) {
        callback.success(obj);
    } else {
        def.resolve(obj);
    }
  },function(err){
      if(callback){
          callback.error(err);
      }else {
          def.reject(err);
      }
  });
  if (!callback) {
      return def;
  }
}

/**
 * Gets a table
 *
 * @param table
 *  It is the CloudTable object
 * @param callback
 * @returns {*}
 */


CB.CloudTable.get = function(table, callback){
  if(Object.prototype.toString.call(table) === '[object String]') {
      var obj = new CB.CloudTable(table);
      table = obj;
  }
  if (Object.prototype.toString.call(table) === '[object Object]') {
    {
      if (!CB.appId) {
          throw "CB.appId is null.";
      }

      var def;
      if (!callback) {
          def = new CB.Promise();
      }

      var params=JSON.stringify({
          key: CB.appKey,
          appId: CB.appId
      });

      var url = CB.apiUrl + '/app/' + CB.appId + "/" + table.document.name;
      CB._request('POST',url,params,true).then(function(response){
          if(response === "null" || response === ""){
            obj = null;
        }else{
            response = JSON.parse(response);
            var obj = CB.fromJSON(response);
        }
          if (callback) {
              callback.success(obj);
          } else {
              def.resolve(obj);
          }
      },function(err){
          if(callback){
              callback.error(err);
          }else {
              def.reject(err);
          }
      });
      if (!callback) {
          return def;
      }

    }
  } else if (Object.prototype.toString.call(table) === '[object Array]') {
    throw "cannot fetch array of tables";
  }
}


/**
 * Deletes a table from database.
 *
 * @param table
 * @param callback
 * @returns {*}
 */

CB.CloudTable.prototype.delete = function(callback){
    CB._validate();

    var def;
    if (!callback) {
        def = new CB.Promise();
    }

    var params=JSON.stringify({
        key: CB.appKey,
        name: this.name,
        method:"DELETE"
    });

    var thisObj = this;

    var url = CB.apiUrl + '/app/' + CB.appId + "/" +this.name;

    CB._request('PUT',url,params,true).then(function(response){
        if (callback) {
            callback.success(thisObj);
        } else {
            def.resolve(thisObj);
        }
    },function(err){
        if(callback){
            callback.error(err);
        }else {
            def.reject(err);
        }
    });

    if (!callback) {
        return def;
    }
}

/**
 * Saves a table
 *
 * @param callback
 * @returns {*}
 */

CB.CloudTable.prototype.save = function(callback){
  var def;
  if (!callback) {
      def = new CB.Promise();
  }
  CB._validate();
  var thisObj = this;
  var params=JSON.stringify({
      key:CB.appKey,
      data:CB.toJSON(thisObj)
  });

  var thisObj = this;

  var url = CB.apiUrl +'/app/' + CB.appId + "/" + thisObj.document.name;

    CB._request('PUT',url,params,true).then(function(response){
      response = JSON.parse(response);
      thisObj = CB.fromJSON(response);
      if (callback) {
          callback.success(thisObj);
      } else {
          def.resolve(thisObj);
      }
  },function(err){
      if(callback){
          callback.error(err);
      }else {
          def.reject(err);
      }
  });

  if (!callback) {
      return def;
  }
};




/*
 Column.js
 */

 CB.Column = function(columnName, dataType, required, unique){
   this.document = {};
   if(columnName){
     CB._columnNameValidation(columnName);
     this.document.name = columnName;
     this.document._type = 'column';
   }

   if(dataType){
     CB._columnDataTypeValidation(dataType);
     this.document.dataType = dataType;
   }else{
     this.document.dataType = "Text";
   }

   if(typeof(required) === 'boolean')
     this.document.required = required;
   else
     this.document.required = false;

   if(typeof(unique) === 'boolean')
     this.document.unique = unique;
   else
     this.document.unique = false;
   this.document.relatedTo = null;
   this.document.relationType = null;

   this.document.isDeletable = true;
   this.document.isEditable = true;
   this.document.isRenamable = false;

};

Object.defineProperty(CB.Column.prototype,'name',{
    get: function() {
        return this.document.name;
    },
    set: function(name) {
        this.document.name = name;
    }
});

Object.defineProperty(CB.Column.prototype,'dataType',{
    get: function() {
        return this.document.dataType;
    },
    set: function(dataType) {
        this.document.dataType = dataType;
    }
});


Object.defineProperty(CB.Column.prototype,'unique',{
    get: function() {
        return this.document.unique;
    },
    set: function(unique) {
        this.document.unique = unique;
    }
});


Object.defineProperty(CB.Column.prototype,'relatedTo',{
    get: function() {
        return this.document.relatedTo;
    },
    set: function(relatedTo) {
        this.document.relatedTo = relatedTo;
    }
});

Object.defineProperty(CB.Column.prototype,'required',{
    get: function() {
        return this.document.required;
    },
    set: function(required) {
        this.document.required = required;
    }
});

/*
CloudQueue
 */

CB.CloudQueue = function(queueName,queueType){

    if(typeof queueName === 'undefined' || queueName == null){
        throw "Cannot create a queue with empty name";
    }

    this.document = {};
    this.document.ACL = new CB.ACL(); //ACL(s) of the document
    this.document._type = 'queue';
    this.document.expires = null;
    this.document.name = queueName;
    this.document.retry = null;
    this.document.subscribers = [];
    this.document.messages = [];
    
    if(queueType && queueType !== "push" && queueType !== "pull"){
        throw "Type can be push or pull";
    }
    if(queueType){
        this.document.queueType = queueType;
    }else{
        this.document.queueType = "pull";
    }
};

Object.defineProperty(CB.CloudQueue.prototype, 'retry', {
    get: function() {
        return this.document.retry;
    },
    set: function(retry) {

        if(this.queueType !== "push"){
            throw "Queue Type should be push to set this property";
        }

        this.document.retry = retry;
        CB._modified(this,'retry');
    }
});

Object.defineProperty(CB.CloudQueue.prototype, 'size', {
    get: function() {
        if(this.document.size)
            return this.document.size;
        else
            return 0;
    }
});

Object.defineProperty(CB.CloudQueue.prototype, 'name', {
    get: function() {
        return this.document.name;
    }
});

Object.defineProperty(CB.CloudQueue.prototype, 'subscribers', {
    get: function() {
        return this.document.subscribers;
    }
});

Object.defineProperty(CB.CloudQueue.prototype, 'type', {
    get: function() {
        return this.document.queueType;
    },
    set: function(queueType) {
        this.document.queueType = queueType;
        CB._modified(this,'queueType');
    }
});

Object.defineProperty(CB.CloudQueue.prototype, 'ACL', {
    get: function() {
        return this.document.ACL;
    },
    set: function(ACL) {
        this.document.ACL = ACL;
        CB._modified(this,'ACL');
    }
});

Object.defineProperty(CB.CloudQueue.prototype, 'id', {
    get: function() {
        return this.document._id;
    }
});

Object.defineProperty(CB.CloudQueue.prototype, 'createdAt', {
    get: function() {
        return this.document.createdAt;
    }
});

Object.defineProperty(CB.CloudQueue.prototype, 'updatedAt', {
    get: function() {
        return this.document.updatedAt;
    }
});


Object.defineProperty(CB.CloudQueue.prototype, 'expires', {
    get: function() {
        return this.document.expires;
    },
    set: function(expires) {
        this.document.expires = expires;
        CB._modified(this,'expires');
    }
});

CB.CloudQueue.prototype.addMessage = function(queueMessage, callback) {

    if(queueMessage == null)
        throw "Message cannot be null";

    var def;
    CB._validate();

    if (!callback) {
        def = new CB.Promise();
    }

    var messages = [];

    if(queueMessage.constructor !== Array){
        messages.push(queueMessage);
    }else{
        messages = queueMessage;
    }

    for(var i=0;i<messages.length; i++){
        if(!(messages[i] instanceof CB.QueueMessage)){
            messages[i] = new CB.QueueMessage(messages[i]);
        }
    }

    this.document.messages = messages;

    //PUT TO SERVER.
    var thisObj = this;

    var xmlhttp = CB._loadXml();

    var params=JSON.stringify({
        document: CB.toJSON(thisObj),
        key: CB.appKey
    });

    var url = CB.apiUrl + "/queue/" + CB.appId + '/'+thisObj.document.name+'/message';

    CB._request('PUT',url,params).then(function(response){
        var messages = CB.fromJSON(JSON.parse(response));
        if (callback) {
            callback.success(messages);
        } else {
            def.resolve(messages);
        }
    },function(err){
        if(callback){
            callback.error(err);
        }else {
            def.reject(err);
        }
    });
};

CB.CloudQueue.prototype.updateMessage = function(queueMessage, callback) {

    if(queueMessage == null)
        throw "Message cannot be null";

    var def;
    CB._validate();

    if (!callback) {
        def = new CB.Promise();
    }

    var messages = [];

    if(queueMessage.constructor !== Array){
        if(!queueMessage.id){
            throw "Message cannot be updated because it has never been saved.";
        }else{
            messages.push(queueMessage);
        }
       
    }else{
         messages = queueMessage;
         for(var i=0;i<messages.length; i++){
            if(!(messages[i] instanceof CB.QueueMessage)){
                throw "Message is not an instance of QueueMessage.";
            }

            if(!message[i].id){
                throw "Message cannot be updated because it has never been saved.";
            }
        }
    }

    return this.addMessage(queueMessage,callback);
};


CB.CloudQueue.prototype.getMessage = function(count,callback) {

    var def;
    CB._validate();

    if (!callback) {
        def = new CB.Promise();
    }

    if(typeof count === 'object' && !callback ){
        callback = count;
        count = null;
    }

    if(!count)
        count=1;

    var thisObj = this;

    var xmlhttp = CB._loadXml();

    var params=JSON.stringify({
        count: count,
        key: CB.appKey
    });

    var url = CB.apiUrl + "/queue/" + CB.appId + '/'+thisObj.document.name+'/getMessage';

    CB._request('POST',url,params).then(function(response){
        
        if(!response || response===""){
            response = null;
        }

        if (callback) {
            callback.success(CB.fromJSON(JSON.parse(response)));
        } else {
            def.resolve(CB.fromJSON(JSON.parse(response)));
        }
    },function(err){
        if(callback){
            callback.error(err);
        }else {
            def.reject(err);
        }
    });
};


CB.CloudQueue.prototype.getAllMessages = function(callback) {

    var def;
    CB._validate();

    if (!callback) {
        def = new CB.Promise();
    }

    if(typeof count === 'object' && !callback ){
        callback = count;
        count = null;
    }

    
    var thisObj = this;

    var xmlhttp = CB._loadXml();

    var params=JSON.stringify({
        key: CB.appKey
    });

    var url = CB.apiUrl + "/queue/" + CB.appId + '/'+thisObj.document.name+'/messages';

    CB._request('POST',url,params).then(function(response){
        
        if(!response || response===""){
            response = null;
        }

        if (callback) {
            callback.success(CB.fromJSON(JSON.parse(response)));
        } else {
            def.resolve(CB.fromJSON(JSON.parse(response)));
        }
    },function(err){
        if(callback){
            callback.error(err);
        }else {
            def.reject(err);
        }
    });
};

CB.CloudQueue.prototype.getMessageById = function(id, callback) {
    var def;

    CB._validate();

    if (!callback) {
        def = new CB.Promise();
    }

    var xmlhttp = CB._loadXml();

    var params=JSON.stringify({
        key: CB.appKey
    });

    var url = CB.apiUrl + "/queue/" + CB.appId + '/'+this.document.name+'/message/'+id;

    CB._request('POST',url,params).then(function(response){
        
        if(!response || response === ""){
            response = null;
        }

        if (callback) {
            callback.success(CB.fromJSON(JSON.parse(response)));
        } else {
            def.resolve(CB.fromJSON(JSON.parse(response)));
        }
    },function(err){
        if(callback){
            callback.error(err);
        }else {
            def.reject(err);
        }
    });
};

CB.CloudQueue.prototype.get = function(callback) {
    var def;
    
    CB._validate();

    if (!callback) {
        def = new CB.Promise();
    }

    var xmlhttp = CB._loadXml();

    var thisObj = this;

    var params=JSON.stringify({       
        key: CB.appKey
    });

    var url = CB.apiUrl + "/queue/" + CB.appId + '/'+thisObj.document.name+'/';

    CB._request('POST',url,params).then(function(response){
        if (callback) {
            callback.success(CB.fromJSON(JSON.parse(response),thisObj));
        } else {
            def.resolve(CB.fromJSON(JSON.parse(response),thisObj));
        }
    },function(err){
        if(callback){
            callback.error(err);
        }else {
            def.reject(err);
        }
    });
};

CB.CloudQueue.prototype.create = function(callback) {
    var def;
    
    CB._validate();

    if (!callback) {
        def = new CB.Promise();
    }

    var xmlhttp = CB._loadXml();

    var thisObj = this;

    var params=JSON.stringify({       
        key: CB.appKey,
        document : CB.toJSON(thisObj)
    });

    var url = CB.apiUrl + "/queue/" + CB.appId + '/'+thisObj.document.name+'/create';

    CB._request('POST',url,params).then(function(response){
        if (callback) {
            callback.success(CB.fromJSON(JSON.parse(response),thisObj));
        } else {
            def.resolve(CB.fromJSON(JSON.parse(response),thisObj));
        }
    },function(err){
        if(callback){
            callback.error(err);
        }else {
            def.reject(err);
        }
    });
};

CB.CloudQueue.prototype.addSubscriber = function(url,callback) {

    var def;

    CB._validate();

    if (!callback) {
        def = new CB.Promise();
    }

    var xmlhttp = CB._loadXml();

    var tempSubscribers =  this.document.subscribers;

    this.document.subscribers = [];

    if(url.constructor === Array){
        for(var i=0;i<url.length;i++){
            this.document.subscribers.push(url[i]);
        }
    }else{
        this.document.subscribers.push(url);
    }

    var params=JSON.stringify({       
        key: CB.appKey,
        document : CB.toJSON(this)
    });

   var thisObj = this;

   var url = CB.apiUrl + '/queue/' + CB.appId + '/'+thisObj.document.name+'/subscriber/';

   CB._request('POST',url,params).then(function(response){
        thisObj = CB.fromJSON(JSON.parse(response),thisObj);
        if (callback) {
            callback.success(thisObj);
        } else {
            def.resolve(thisObj);
        }
    },function(err){
        thisObj.document.subscribers = tempSubscribers;
        if(callback){
            callback.error(err);
        }else {
            def.reject(err);
        }
    });
};

CB.CloudQueue.prototype.removeSubscriber = function(url,callback) {

    var def;

    CB._validate();

    if (!callback) {
        def = new CB.Promise();
    }

    var xmlhttp = CB._loadXml();

    var tempSubscribers =  this.document.subscribers;

    this.document.subscribers = [];

    if(url.constructor === Array){
        for(var i=0;i<url.length;i++){
            this.document.subscribers.push(url[i]);
        }
    }else{
        this.document.subscribers.push(url);
    }

    var thisObj =this;

    var params=JSON.stringify({       
        key: CB.appKey,
        document : CB.toJSON(thisObj),
        method: "DELETE"
    });


   var url = CB.apiUrl + '/queue/' + CB.appId + '/'+thisObj.document.name+'/subscriber/';

   CB._request('PUT',url,params).then(function(response){
        thisObj = CB.fromJSON(JSON.parse(response),thisObj);
        if (callback) {
            callback.success(thisObj);
        } else {
            def.resolve(thisObj);
        }
    },function(err){
        this.document.subscribers = tempSubscribers;
        if(callback){
            callback.error(err);
        }else {
            def.reject(err);
        }
    });

};

CB.CloudQueue.prototype.peekMessage = function(count, callback) {

    var def;

    CB._validate();

    if (!callback) {
        def = new CB.Promise();
    }

    if(typeof count === 'object' && !callback ){
        callback = count;
        count = null;
    }

    if(!count)
        count=1; 
    
    var xmlhttp = CB._loadXml();

    var params=JSON.stringify({
        key: CB.appKey,
        count : count
    });

   var url = CB.apiUrl + "/queue/" + CB.appId + '/'+this.document.name+'/peekMessage';

   CB._request('POST',url,params).then(function(response){
        if (callback) {
            callback.success(CB.fromJSON(JSON.parse(response)));
        } else {
            def.resolve(CB.fromJSON(JSON.parse(response)));
        }
    },function(err){
        if(callback){
            callback.error(err);
        }else {
            def.reject(err);
        }
    });

};

CB.CloudQueue.prototype.delete = function(callback) {
    var def;

    CB._validate();

    if (!callback) {
        def = new CB.Promise();
    }

    var xmlhttp = CB._loadXml();

    var params=JSON.stringify({
        key: CB.appKey,
        document : CB.toJSON(this),
        method:"DELETE"
    });

   var thisObj = this;

   var url = CB.apiUrl + "/queue/" + CB.appId + '/'+thisObj.document.name;

   CB._request('PUT',url,params).then(function(response){
        thisObj = CB.fromJSON(JSON.parse(response),thisObj);
        if (callback) {
            callback.success(thisObj);
        } else {
            def.resolve(thisObj);
        }
    },function(err){
        if(callback){
            callback.error(err);
        }else {
            def.reject(err);
        }
    });
};

CB.CloudQueue.prototype.clear = function(callback) {
    var def;

    CB._validate();

    if (!callback) {
        def = new CB.Promise();
    }

    var xmlhttp = CB._loadXml();

    var params=JSON.stringify({
        key: CB.appKey,
        document : CB.toJSON(this),
        method: "DELETE"
    });

   var thisObj = this;

   var url = CB.apiUrl + "/queue/" + CB.appId + '/'+thisObj.document.name+"/clear";

   CB._request('PUT',url,params).then(function(response){
        thisObj = CB.fromJSON(JSON.parse(response),thisObj);
        if (callback) {
            callback.success(thisObj);
        } else {
            def.resolve(thisObj);
        }
    },function(err){
        if(callback){
            callback.error(err);
        }else {
            def.reject(err);
        }
    });
};

CB.CloudQueue.prototype.refreshMessageTimeout = function(id,timeout ,callback) {
    var def;

    CB._validate();

    if (!callback) {
        def = new CB.Promise();
    }

    if(!id)
        throw "Message Id cannot be null";

    if(id instanceof CB.QueueMessage){
        if(!id.id){
            throw "Queue Message should have an id.";
        }else{
            id = id.id;
        }
    }

    if(!callback && (timeout.success || timeout.error)){
        callback = timeout;
        timeout = null;
    }
    
    var xmlhttp = CB._loadXml();

    var params=JSON.stringify({
        key: CB.appKey,
        timeout : timeout
    });

   var thisObj = this;

   var url = CB.apiUrl + "/queue/" + CB.appId + '/'+thisObj.document.name+"/"+id+"/refresh-message-timeout";

   CB._request('PUT',url,params).then(function(response){
        if (callback) {
            callback.success(CB.fromJSON(JSON.parse(response)));
        } else {
            def.resolve(CB.fromJSON(JSON.parse(response)));
        }
    },function(err){
        if(callback){
            callback.error(err);
        }else {
            def.reject(err);
        }
    });
};


CB.CloudQueue.prototype.deleteMessage = function(id,callback) {
    var def;
    
    CB._validate();

    if(!id || (!(id instanceof CB.QueueMessage)&&typeof id !== 'string')){
        throw "Delete Message function should have id of the message or insance of QueueMessage as the first parameter. ";
    }

    if(id instanceof CB.QueueMessage){
        id = id.id;
    }

    if (!callback) {
        def = new CB.Promise();
    }

    var xmlhttp = CB._loadXml();

    var params=JSON.stringify({
        key: CB.appKey,
        method: "DELETE"
    });

   var thisObj = this;

   var url = CB.apiUrl + "/queue/" + CB.appId + '/'+thisObj.document.name+"/message/"+id;

   CB._request('PUT',url,params).then(function(response){
        if (callback) {
            callback.success(CB.fromJSON(JSON.parse(response)));
        } else {
            def.resolve(CB.fromJSON(JSON.parse(response)));
        }
    },function(err){
        if(callback){
            callback.error(err);
        }else {
            def.reject(err);
        }
    });
};

CB.CloudQueue.prototype.update = function(callback) {
    var def;
    
    CB._validate();

    if (!callback) {
        def = new CB.Promise();
    }
    
    var xmlhttp = CB._loadXml();

    var thisObj = this;

    var params=JSON.stringify({       
        key: CB.appKey,
        document : CB.toJSON(thisObj)
    });


   var url = CB.apiUrl + "/queue/" + CB.appId + '/'+thisObj.document.name;

   CB._request('PUT',url,params).then(function(response){
        if (callback) {
            callback.success(CB.fromJSON(JSON.parse(response),thisObj));
        } else {
            def.resolve(CB.fromJSON(JSON.parse(response),thisObj));
        }
    },function(err){
        if(callback){
            callback.error(err);
        }else {
            def.reject(err);
        }
    });
};

CB.CloudQueue.getAll = function(callback){
    
    var def;
    
    CB._validate();

    if (!callback) {
        def = new CB.Promise();
    }

    var xmlhttp = CB._loadXml();

    var thisObj = this;

    var params=JSON.stringify({       
        key: CB.appKey
    });

    var url = CB.apiUrl + "/queue/" + CB.appId + '/';

    CB._request('POST',url,params).then(function(response){

        if(response === ""){
            response = null;
        }

        if (callback) {
            callback.success(CB.fromJSON(JSON.parse(response)));
        } else {
            def.resolve(CB.fromJSON(JSON.parse(response)));
        }
    },function(err){
        if(callback){
            callback.error(err);
        }else {
            def.reject(err);
        }
    });
};

CB.CloudQueue.get = function(queueName,callback){
    var queue = new CB.CloudQueue(queueName);
    return queue.get(callback);
};

CB.CloudQueue.delete = function(queueName, callback){
    var queue = new CB.CloudQueue(queueName);
    return queue.delete(callback);
};

CB.QueueMessage = function(data) {

    this.document = {};
    this.document.ACL = new CB.ACL(); //ACL(s) of the document
    this.document._type = 'queue-message';
    this.document.expires = null;
    this.document.timeout = 1800; //30 mins by default.
    this.document.delay = null;
    this.document.message = data;
    this.document._id = null;
    this.document._modifiedColumns = ['createdAt','updatedAt','ACL','expires','timeout','delay','message'];
    this.document._isModified = true;

};

Object.defineProperty(CB.QueueMessage.prototype, 'message', {
    get: function() {
        return this.document.message;
    },
    set: function(message) {
        this.document.message = message;
        CB._modified(this,'message');
    }
});

Object.defineProperty(CB.QueueMessage.prototype, 'ACL', {
    get: function() {
        return this.document.ACL;
    },
    set: function(ACL) {
        this.document.ACL = ACL;
        CB._modified(this,'ACL');
    }
});

Object.defineProperty(CB.QueueMessage.prototype, 'id', {
    get: function() {
        return this.document._id;
    }
});

Object.defineProperty(CB.QueueMessage.prototype, 'createdAt', {
    get: function() {
        return this.document.createdAt;
    },
    set: function(createdAt) {
        this.document.createdAt = createdAt;
        CB._modified(this,'createdAt');
    }
});

Object.defineProperty(CB.QueueMessage.prototype, 'updatedAt', {
    get: function() {
        return this.document.updatedAt;
    },
    set: function(updatedAt) {
        this.document.updatedAt = updatedAt;
        CB._modified(this,'updatedAt');
    }
});


Object.defineProperty(CB.QueueMessage.prototype, 'expires', {
    get: function() {
        return this.document.expires;
    },
    set: function(expires) {
        this.document.expires = expires;
        CB._modified(this,'expires');
    }
});

Object.defineProperty(CB.QueueMessage.prototype, 'timeout', {
    get: function() {
        return this.document.timeout;
    },
    set: function(timeout) {
        this.document.timeout = timeout;
        CB._modified(this,'timeout');
    }
});


Object.defineProperty(CB.QueueMessage.prototype, 'delay', {
    get: function() {
        if(this.document.delay)
            return this.document.delay/1000;
        else
            return 0;
    },
    set: function(delay) {
        delay *=1000; //converting to seconds from milli seconds,
        this.document.delay = delay;
        CB._modified(this,'delay');
    }
});

/*
 CloudCache
 */

CB.CloudCache = function(cacheName){
  if(typeof cacheName === 'undefined' || cacheName === null || cacheName === ''){
        throw "Cannot create a cache with empty name";
    }
    this.document = {};
    this.document._tableName = "cache";
    this.document.name = cacheName;
    this.document.size = "";
    this.document.items = [];
};

Object.defineProperty(CB.CloudCache.prototype, 'name', {
    get: function() {
        return this.document.name;
    }
});

Object.defineProperty(CB.CloudCache.prototype, 'size', {
    get: function() {
        return this.document.size;
    }
});

Object.defineProperty(CB.CloudCache.prototype, 'items', {
    get: function() {
        return this.document.items;
    }
});

CB.CloudCache.prototype.set = function(key, value, callback){
  var def;
  CB._validate();

  if (!callback) {
      def = new CB.Promise();
  }

  if(typeof value === 'undefined'){
    throw "Value cannot be undefined.";
  }

  var params=JSON.stringify({
      key: CB.appKey,
      item:  value
  });

  var url = CB.apiUrl+'/cache/'+CB.appId+'/'+this.document.name+'/'+key;
  CB._request('PUT',url,params,true).then(function(response){
    if(CB._isJsonString(response)){
      response = JSON.parse(response);
    }
    
    var obj = CB.fromJSON(response);
    if (callback) {
        callback.success(obj);
    } else {
        def.resolve(obj);
    }
  },function(err){
      if(callback){
          callback.error(err);
      }else {
          def.reject(err);
      }
  });
  if (!callback) {
      return def;
  }
};

CB.CloudCache.prototype.deleteItem = function(key, callback){
  var def;
  CB._validate();

  if (!callback) {
      def = new CB.Promise();
  }


  var params=JSON.stringify({
      key: CB.appKey,
      method:"DELETE"
  });

  var url = CB.apiUrl+'/cache/'+CB.appId+'/'+this.document.name+'/item/'+key;
  CB._request('PUT',url,params,true).then(function(response){
    if(CB._isJsonString(response)){
      response = JSON.parse(response);
    }
    
    var obj = CB.fromJSON(response);
    if (callback) {
        callback.success(obj);
    } else {
        def.resolve(obj);
    }
  },function(err){
      if(callback){
          callback.error(err);
      }else {
          def.reject(err);
      }
  });
  if (!callback) {
      return def;
  }
};


CB.CloudCache.prototype.create = function(callback){
  var def;
  CB._validate();

  if (!callback) {
      def = new CB.Promise();
  }

  var params=JSON.stringify({
      key: CB.appKey
  });

  var thisObj= this;

  var url = CB.apiUrl+'/cache/'+CB.appId+'/'+this.document.name+'/create';
  CB._request('POST',url,params,true).then(function(response){
    if(CB._isJsonString(response)){
      response = JSON.parse(response);
    }
    var obj = CB.fromJSON(response,thisObj);
    if (callback) {
        callback.success(obj);
    } else {
        def.resolve(obj);
    }
  },function(err){
      if(callback){
          callback.error(err);
      }else {
          def.reject(err);
      }
  });
  if (!callback) {
      return def;
  }
};

CB.CloudCache.prototype.get = function(key, callback){

    var def;
    CB._validate();

    if (!callback) {
        def = new CB.Promise();
    }

  var params=JSON.stringify({
      key: CB.appKey
  });


  var url = CB.apiUrl+'/cache/'+CB.appId+'/'+this.document.name+'/'+key+'/item';
  CB._request('POST',url,params,true).then(function(response){
    if(CB._isJsonString(response)){
      response = JSON.parse(response);
    }
    var obj = CB.fromJSON(response);
    if (callback) {
        callback.success(obj);
    } else {
        def.resolve(obj);
    }
  },function(err){
      if(callback){
          callback.error(err);
      }else {
          def.reject(err);
      }
  });
  if (!callback) {
      return def;
  }

};


CB.CloudCache.prototype.getInfo = function(callback){
    var def;
    CB._validate();

    if (!callback) {
        def = new CB.Promise();
    }

  var params=JSON.stringify({
      key: CB.appKey
  });

  var thisObj= this;

  var url = CB.apiUrl+'/cache/'+CB.appId +'/'+this.document.name;
  CB._request('POST',url,params,true).then(function(response){
    if(CB._isJsonString(response)){
      response = JSON.parse(response);
    }
    var obj = CB.fromJSON(response, thisObj);
    if (callback) {
        callback.success(obj);
    } else {
        def.resolve(obj);
    }
  },function(err){
      if(callback){
          callback.error(err);
      }else {
          def.reject(err);
      }
  });
  if (!callback) {
      return def;
  }
};

CB.CloudCache.prototype.getItemsCount = function(callback){
    var def;
    CB._validate();

    if (!callback) {
        def = new CB.Promise();
    }

  var params=JSON.stringify({
      key: CB.appKey
  });

  var url = CB.apiUrl+'/cache/'+CB.appId +'/'+this.document.name+'/items/count';
  CB._request('POST',url,params,true).then(function(response){
    if(CB._isJsonString(response)){
      response = JSON.parse(response);
    }
    var obj = CB.fromJSON(response);
    if (callback) {
        callback.success(obj);
    } else {
        def.resolve(obj);
    }
  },function(err){
      if(callback){
          callback.error(err);
      }else {
          def.reject(err);
      }
  });
  if (!callback) {
      return def;
  }
};

CB.CloudCache.prototype.getAll = function(callback){
    var def;
    CB._validate();

    if (!callback) {
        def = new CB.Promise();
    }

     var thisObj= this;

  var params=JSON.stringify({
      key: CB.appKey
  });
  var url = CB.apiUrl+'/cache/'+CB.appId+'/'+this.document.name+'/items';
  CB._request('POST',url,params,true).then(function(response){
    if(CB._isJsonString(response)){
      response = JSON.parse(response);
    }
    var obj = CB.fromJSON(response); 
    
    thisObj.document.items = obj;

    if (callback) {
        callback.success(obj);
    } else {
        def.resolve(obj);
    }
  },function(err){
      if(callback){
          callback.error(err);
      }else {
          def.reject(err);
      }
  });
  if (!callback) {
      return def;
  }

};


CB.CloudCache.prototype.clear = function(callback){
    var def;
    CB._validate();

    if (!callback) {
        def = new CB.Promise();
    }

  var params=JSON.stringify({
      key: CB.appKey,
      method:"DELETE"
  });

  var thisObj = this;

  var url = CB.apiUrl+'/cache/'+CB.appId+'/'+this.document.name+'/clear/items';
  CB._request('PUT',url,params,true).then(function(response){
    if(CB._isJsonString(response)){
      response = JSON.parse(response);
    }
    var obj = CB.fromJSON(response, thisObj);
    if (callback) {
        callback.success(obj);
    } else {
        def.resolve(obj);
    }
  },function(err){
      if(callback){
          callback.error(err);
      }else {
          def.reject(err);
      }
  });
  if (!callback) {
      return def;
  }
};


CB.CloudCache.prototype.delete = function(callback){
    var def;
    CB._validate();

    if (!callback) {
        def = new CB.Promise();
    }

  var params=JSON.stringify({
      key: CB.appKey,
      method:"DELETE"
  });

  var thisObj = this;

  var url = CB.apiUrl+'/cache/'+CB.appId+'/'+this.document.name;
  CB._request('PUT',url,params,true).then(function(response){
    if(CB._isJsonString(response)){
      response = JSON.parse(response);
    }
    var obj = CB.fromJSON(response, thisObj);
    if (callback) {
        callback.success(obj);
    } else {
        def.resolve(obj);
    }
  },function(err){
      if(callback){
          callback.error(err);
      }else {
          def.reject(err);
      }
  });
  if (!callback) {
      return def;
  }
};

CB.CloudCache.getAll = function(callback){
    var def;
    CB._validate();

    if (!callback) {
        def = new CB.Promise();
    }

  var params=JSON.stringify({
      key: CB.appKey
  });

  var url = CB.apiUrl+'/cache/'+CB.appId;
  CB._request('POST',url,params,true).then(function(response){
    if(CB._isJsonString(response)){
      response = JSON.parse(response);
    }    
    var obj = CB.fromJSON(response);
    if (callback) {
        callback.success(obj);
    } else {
        def.resolve(obj);
    }
  },function(err){
      if(callback){
          callback.error(err);
      }else {
          def.reject(err);
      }
  });
  if (!callback) {
      return def;
  }
};

CB.CloudCache.deleteAll = function(callback){
    var def;
    CB._validate();

    if (!callback) {
        def = new CB.Promise();
    }

    var params=JSON.stringify({
        key: CB.appKey,
        method:"DELETE"
    });

    var url = CB.apiUrl+'/cache/'+CB.appId;
    CB._request('PUT',url,params,true).then(function(response){
      if(CB._isJsonString(response)){
      response = JSON.parse(response);
    }
      var obj = CB.fromJSON(response);
      if (callback) {
          callback.success(obj);
      } else {
          def.resolve(obj);
      }
    },function(err){
        if(callback){
            callback.error(err);
        }else {
            def.reject(err);
        }
    });
    if (!callback) {
        return def;
    }
};
/*CloudBoost Push Notifications*/

CB.CloudPush={};

CB.CloudPush.send = function(data,query,callback) {
	
	var tableName="Device";	

	if (!CB.appId) {
        throw "CB.appId is null.";
    }    
    var def;
    if (!callback) {
        def = new CB.Promise();
    }

    if(!data){
    	throw "data object is null.";
    }
    if(data && (!data.message)){
    	throw "message is not set.";
    }

	//Query Set
	if(query && Object.prototype.toString.call(query)=="[object Object]" && typeof query.success !== 'function'){
		var pushQuery=query;
	}
	//Channels List
	if(query && Object.prototype.toString.call(query)=="[object Array]" && typeof query.success !== 'function'){
		var pushQuery = new CB.CloudQuery(tableName);
		pushQuery.containedIn('channels', query);		
	}
	//Single Channel	
	if(query && Object.prototype.toString.call(query)=="[object String]" && typeof query.success !== 'function'){
		var pushQuery = new CB.CloudQuery(tableName);
		pushQuery.containedIn('channels', [query]);		
	}
    //when query param is callback
	if(query && Object.prototype.toString.call(query)=="[object Object]" && typeof query.success === 'function'){
		callback=query;
        var pushQuery = new CB.CloudQuery(tableName);
    } 
    //No query param
    if(!query){
        var pushQuery = new CB.CloudQuery(tableName);
    }
	
    var params=JSON.stringify({
        query    : pushQuery.query,        
        sort     : pushQuery.sort,
        limit    : pushQuery.limit,
        skip     : pushQuery.skip,
        key      : CB.appKey,        
        data     : data,
    });  

    url = CB.apiUrl + "/push/" + CB.appId + '/send';

    CB._request('POST',url,params).then(function(response){
        var object = JSON.parse(response);
        if (callback) {
            callback.success(object);
        } else {
            def.resolve(object);
        }
    },function(err){

        try{
            err = JSON.parse(err);
        }catch(e){
        }
        
        if(callback){
            callback.error(err);
        }else {
            def.reject(err);
        }
    });

    if (!callback) {
        return def;
    }
};    
/*
 CloudUser
 */
CB.CloudUser = CB.CloudUser || function() {
    if (!this.document) this.document = {};
    this.document._tableName = 'User';
    this.document.expires = null;
    this.document._type = 'user';
    this.document.expires = null;
    this.document.ACL = new CB.ACL();
    this.document._isModified = true;
    this.document._modifiedColumns = ['createdAt','updatedAt','ACL','expires'];
};

//Description  : This function gets the current user from the server by taking the sessionId from querystring.
//Params : 
//returns : CloudUser object if the current user is still in session or null. 
CB.CloudUser.getCurrentUser = function(callback){

    var cbtoken=CB._getQuerystringByKey("cbtoken");

    if (!cbtoken || cbtoken==="") {
        throw "cbtoken is null.";
    }

    if(cbtoken){
        localStorage.setItem('sessionID', cbtoken);
    }   

    var def;
    if (!callback) {
        def = new CB.Promise();
    }
    
    //now call the signup API.
    var params=JSON.stringify({        
        key: CB.appKey
    });

    url = CB.apiUrl + "/user/" + CB.appId + "/currentUser";

    CB._request('POST',url,params).then(function(response){        
        if(response){  
            try{
                var user = new CB.CloudUser();
                response=CB.fromJSON(JSON.parse(response),user);
                CB.CloudUser.current=response;
                CB.CloudUser._setCurrentUser(response);
            }catch(e){
            }            
        }
        
        if (callback) {
            callback.success(response);
        } else {
            def.resolve(response);
        }
        
    },function(err){
        if(callback){
            callback.error(err);
        }else {
            def.reject(err);
        }
    });

    if (!callback) {
        return def;
    }
};


//Private Static fucntions

//Description  : This function gets the current user from the cookie or from local storage.
//Params : 
//returns : CloudUser object if the current user is still in session or null. 
CB.CloudUser._getCurrentUser = function(){
    var content = CB._getCookie("CBCurrentUser");
    if(content && content.length > 0){
        return CB.fromJSON(JSON.parse(content));
    }else{
        return null;
    }
};

//Description  : This function saves the current user to the cookie or to local storage.
//Params : @user - Instance of CB.CloudUser Object.
//returns : void. 
CB.CloudUser._setCurrentUser = function(user){
    //save the user to the cookie. 
    if(!user){
        return;
    }
    
    //expiration time of 30 days.
    CB._createCookie("CBCurrentUser", JSON.stringify(CB.toJSON(user)),30*24*60*60*1000); 
};

//Description  : This function saves the current user to the cookie or to local storage.
//Params : @user - Instance of CB.CloudUser Object.
//returns : void. 
CB.CloudUser._removeCurrentUser = function(){
    //save the user to the cookie. 
    CB._deleteCookie("CBCurrentUser");
};

CB.CloudUser.resetPassword = function(email,callback){
    
    if (!email) {
        throw "Email is required.";
    }

    var def;
    if (!callback) {
        def = new CB.Promise();
    }
    
    //now call the signup API.
    var params=JSON.stringify({
        email: email,
        key: CB.appKey
    });

    url = CB.apiUrl + "/user/" + CB.appId + "/resetPassword";

    CB._request('POST',url,params).then(function(response){
        if (callback) {
            callback.success();
        } else {
            def.resolve();
        }
    },function(err){
        if(callback){
            callback.error(err);
        }else {
            def.reject(err);
        }
    });

    if (!callback) {
        return def;
    }
};

CB.CloudUser.prototype = Object.create(CB.CloudObject.prototype);

Object.defineProperty(CB.CloudUser.prototype, 'username', {
    get: function() {
        return this.document.username;
    },
    set: function(username) {
        this.document.username = username;
        CB._modified(this,'username');
    }
});
Object.defineProperty(CB.CloudUser.prototype, 'password', {
    get: function() {
        return this.document.password;
    },
    set: function(password) {
        this.document.password = password;
        CB._modified(this,'password');
    }
});
Object.defineProperty(CB.CloudUser.prototype, 'email', {
    get: function() {
        return this.document.email;
    },
    set: function(email) {
        this.document.email = email;
        CB._modified(this,'email');
    }
});

CB.CloudUser.current = CB.CloudUser._getCurrentUser();

CB.CloudUser.prototype.signUp = function(callback) {

    if(CB._isNode){
        throw "Error : You cannot signup the user on the server. Use CloudUser.save() instead.";
    }

    if (!this.document.username) {
        throw "Username is not set.";
    }
    if (!this.document.password) {
        throw "Password is not set.";
    }
    if (!this.document.email) {
        throw "Email is not set.";
    }
    var thisObj = this;
    var def;
    if (!callback) {
        def = new CB.Promise();
    }
    //now call the signup API.
    var params=JSON.stringify({
        document: CB.toJSON(thisObj),
        key: CB.appKey
    });
    url = CB.apiUrl + "/user/" + CB.appId + "/signup" ;

    CB._request('POST',url,params).then(function(response){
        CB.fromJSON(JSON.parse(response),thisObj);
        CB.CloudUser.current = thisObj;
        if (callback) {
            callback.success(thisObj);
        } else {
            def.resolve(thisObj);
        }
        CB.CloudUser._setCurrentUser(thisObj);
    },function(err){
        if(callback){
            callback.error(err);
        }else {
            def.reject(err);
        }
    });


    if (!callback) {
        return def;
    }
};


CB.CloudUser.prototype.changePassword = function(oldPassword, newPassword, callback) {

    var thisObj = this;
    var def;
    if (!callback) {
        def = new CB.Promise();
    }
    //now call the signup API.
    var params=JSON.stringify({
        oldPassword: oldPassword,
        newPassword : newPassword,
        key: CB.appKey
    });

    url = CB.apiUrl + "/user/" + CB.appId + "/changePassword" ;

    CB._request('PUT',url,params).then(function(response){
        if (callback) {
            callback.success(CB.fromJSON(JSON.parse(response),thisObj));
        } else {
            def.resolve(CB.fromJSON(JSON.parse(response),thisObj));
        }
    },function(err){
        if(callback){
            callback.error(err);
        }else {
            def.reject(err);
        }
    });

    if (!callback) {
        return def;
    }
};


CB.CloudUser.prototype.logIn = function(callback) {

    if(CB._isNode){
        throw "Error : You cannot login the user on the server.";
    }

    if (!this.document.username) {
        throw "Username is not set.";
    }
    if (!this.document.password) {
        throw "Password is not set.";
    }
    var thisObj = this;
    var def;
    if (!callback) {
        def = new CB.Promise();
    }
    //now call the signup API.
    var params=JSON.stringify({
        document: CB.toJSON(thisObj),
        key: CB.appKey
    });
    url = CB.apiUrl + "/user/" + CB.appId + "/login" ;

    CB._request('POST',url,params).then(function(response){
        thisObj = CB.fromJSON(JSON.parse(response),thisObj);
        CB.CloudUser.current = thisObj;
        if (callback) {
            callback.success(thisObj);
        } else {
            def.resolve(thisObj);
        }
        CB.CloudUser._setCurrentUser(thisObj);
    },function(err){
        if(callback){
            callback.error(err);
        }else {
            def.reject(err);
        }
    });

    if (!callback) {
        return def;
    }
};
CB.CloudUser.prototype.logOut = function(callback) {

    if(CB._isNode){
        throw "Error : You cannot logOut the user on the server.";
    }

    if (!this.document.username) {
        throw "Username is not set.";
    }
    if (!this.document.password) {
        throw "Password is not set.";
    }
    var thisObj = this;
    var def;
    if (!callback) {
        def = new CB.Promise();
    }
    //now call the logout API.
    var params=JSON.stringify({
        document: CB.toJSON(thisObj),
        key: CB.appKey
    });
    url = CB.apiUrl + "/user/" + CB.appId + "/logout" ;

    CB._request('POST',url,params).then(function(response){
        CB.fromJSON(JSON.parse(response),thisObj);
        CB.CloudUser.current = null;
        if (callback) {
            callback.success(thisObj);
        } else {
            def.resolve(thisObj);
        }
        CB.CloudUser._removeCurrentUser();
    },function(err){
        if(callback){
            callback.error(err);
        }else {
            def.reject(err);
        }
    });


    if (!callback) {
        return def;
    }
};
CB.CloudUser.prototype.addToRole = function(role, callback) {
    if (!role) {
        throw "Role is null";
    }
    var thisObj = this;
    var def;
    if (!callback) {
        def = new CB.Promise();
    }   

    //Call the addToRole API
    var params=JSON.stringify({
        user: CB.toJSON(thisObj),
        role: CB.toJSON(role),
        key: CB.appKey
    });
    url = CB.apiUrl + "/user/" + CB.appId + "/addToRole" ;

    CB._request('PUT',url,params).then(function(response){
        CB.fromJSON(JSON.parse(response),thisObj);
        if (callback) {
            callback.success(thisObj);
        } else {
            def.resolve(thisObj);
        }
    },function(err){
        if(callback){
            callback.error(err);
        }else {
            def.reject(err);
        }
    });

    if (!callback) {
        return def;
    }
};
CB.CloudUser.prototype.isInRole = function(role) {
    if (!role) {
        throw "role is null";
    }

    var roleArray=this.get('roles');
    var userRoleIds=[];

    if(roleArray && roleArray.length>0){
        for(var i=0;i<roleArray.length; ++i){
            userRoleIds.push(roleArray[i].document._id);
        }
    }
    
    return (userRoleIds.indexOf(role.document._id) >= 0);
};

CB.CloudUser.prototype.removeFromRole = function(role, callback) {
    if (!role) {
        throw "Role is null";
    }
    var thisObj = this;
    var def;
    if (!callback) {
        def = new CB.Promise();
    }
    //now call the removeFromRole API.
    var params=JSON.stringify({
        user: CB.toJSON(thisObj),
        role: CB.toJSON(role),
        key: CB.appKey
    });
    url = CB.apiUrl + "/user/" + CB.appId + "/removeFromRole" ;

    CB._request('PUT',url,params).then(function(response){
        CB.fromJSON(JSON.parse(response),thisObj);
        if (callback) {
            callback.success(thisObj);
        } else {
            def.resolve(thisObj);
        }
    },function(err){
        if(callback){
            callback.error(err);
        }else {
            def.reject(err);
        }
    });

    if (!callback) {
        return def;
    }
};

