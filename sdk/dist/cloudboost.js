(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory(require("axios"), require("socket.io-client"));
	else if(typeof define === 'function' && define.amd)
		define("cloudboost", ["axios", "socket.io-client"], factory);
	else if(typeof exports === 'object')
		exports["cloudboost"] = factory(require("axios"), require("socket.io-client"));
	else
		root["cloudboost"] = factory(root["axios"], root["socket.io-client"]);
})(this, function(__WEBPACK_EXTERNAL_MODULE_49__, __WEBPACK_EXTERNAL_MODULE_74__) {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var _CB = __webpack_require__(1);

	var _CB2 = _interopRequireDefault(_CB);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	try {
	    if (window) {
	        if (navigator.product == 'ReactNative') {
	            // for react native turn node and native flags to true
	            _CB2.default._isNode = true;
	            _CB2.default._isNative = true;
	        } else {
	            // if window is found then node is false
	            _CB2.default._isNode = false;
	        }
	    }
	} catch (e) {
	    // if window is not found , then turn node flag to true
	    _CB2.default._isNode = true;
	} ///<reference path="./cloudboost.d.ts" />

	__webpack_require__(41);
	__webpack_require__(72);
	__webpack_require__(76);
	__webpack_require__(77);
	__webpack_require__(78);
	__webpack_require__(79);
	__webpack_require__(80);
	__webpack_require__(81);
	__webpack_require__(82);
	__webpack_require__(83);
	__webpack_require__(85);
	__webpack_require__(86);
	__webpack_require__(87);
	__webpack_require__(88);

	try {
	    window.CB = _CB2.default;
	} catch (e) {}
	module.exports = _CB2.default;

/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(process) {'use strict';

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	var _bluebird = __webpack_require__(3);

	var _bluebird2 = _interopRequireDefault(_bluebird);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	var CloudBoost = function () {
	    function CloudBoost() {
	        _classCallCheck(this, CloudBoost);

	        // to check if the env is node
	        this._isNode = false;
	        // to check if env is native ( react native , native script etc. )
	        this._isNative = false;
	        this.Socket = null;
	        this.io = null; //socket.io library is saved here.
	        this.apiUrl = 'https://api.cloudboost.io';
	        if (typeof process !== "undefined" && process.versions && process.versions.node) {
	            this._isNode = true;
	        } else {
	            this._isNode = false;
	        }
	        this.Events = { trigger: this.trigger.bind(this) };
	    }

	    _createClass(CloudBoost, [{
	        key: '_ajaxIE8',
	        value: function _ajaxIE8(method, url, data) {
	            var promise = new this.Promise();
	            var xdr = new XDomainRequest();
	            xdr.onload = function () {
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
	            xdr.onerror = xdr.ontimeout = function () {
	                // Let's fake a real error message.
	                var fakeResponse = {
	                    responseText: JSON.stringify({
	                        code: 500,
	                        error: "IE's XDomainRequest does not supply error info."
	                    })
	                };
	                promise.reject(fakeResponse);
	            };
	            xdr.onprogress = function () {};
	            xdr.open(method, url);
	            xdr.send(data);
	            return promise;
	        }
	    }, {
	        key: 'trigger',
	        value: function trigger(events) {
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
	    }, {
	        key: 'Promise',
	        value: function Promise() {
	            var resolve, reject;
	            var promise = new _bluebird2.default(function () {
	                resolve = arguments[0];
	                reject = arguments[1];
	            });
	            return {
	                resolve: resolve,
	                reject: reject,
	                promise: promise
	            };
	        }
	    }]);

	    return CloudBoost;
	}();

	var CB = new CloudBoost();

	// inheriting BlueBird Promise Library
	if (Object.setPrototypeOf) {
	    Object.setPrototypeOf(CB.Promise, _bluebird2.default);
	} else {
	    CB.Promise.prototype = _bluebird2.default.prototype;
	}

	exports.default = CB;
	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(2)))

/***/ },
/* 2 */
/***/ function(module, exports) {

	// shim for using process in browser
	var process = module.exports = {};

	// cached from whatever global is present so that test runners that stub it
	// don't break things.  But we need to wrap it in a try catch in case it is
	// wrapped in strict mode code which doesn't define any globals.  It's inside a
	// function because try/catches deoptimize in certain engines.

	var cachedSetTimeout;
	var cachedClearTimeout;

	function defaultSetTimout() {
	    throw new Error('setTimeout has not been defined');
	}
	function defaultClearTimeout () {
	    throw new Error('clearTimeout has not been defined');
	}
	(function () {
	    try {
	        if (typeof setTimeout === 'function') {
	            cachedSetTimeout = setTimeout;
	        } else {
	            cachedSetTimeout = defaultSetTimout;
	        }
	    } catch (e) {
	        cachedSetTimeout = defaultSetTimout;
	    }
	    try {
	        if (typeof clearTimeout === 'function') {
	            cachedClearTimeout = clearTimeout;
	        } else {
	            cachedClearTimeout = defaultClearTimeout;
	        }
	    } catch (e) {
	        cachedClearTimeout = defaultClearTimeout;
	    }
	} ())
	function runTimeout(fun) {
	    if (cachedSetTimeout === setTimeout) {
	        //normal enviroments in sane situations
	        return setTimeout(fun, 0);
	    }
	    // if setTimeout wasn't available but was latter defined
	    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
	        cachedSetTimeout = setTimeout;
	        return setTimeout(fun, 0);
	    }
	    try {
	        // when when somebody has screwed with setTimeout but no I.E. maddness
	        return cachedSetTimeout(fun, 0);
	    } catch(e){
	        try {
	            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
	            return cachedSetTimeout.call(null, fun, 0);
	        } catch(e){
	            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
	            return cachedSetTimeout.call(this, fun, 0);
	        }
	    }


	}
	function runClearTimeout(marker) {
	    if (cachedClearTimeout === clearTimeout) {
	        //normal enviroments in sane situations
	        return clearTimeout(marker);
	    }
	    // if clearTimeout wasn't available but was latter defined
	    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
	        cachedClearTimeout = clearTimeout;
	        return clearTimeout(marker);
	    }
	    try {
	        // when when somebody has screwed with setTimeout but no I.E. maddness
	        return cachedClearTimeout(marker);
	    } catch (e){
	        try {
	            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
	            return cachedClearTimeout.call(null, marker);
	        } catch (e){
	            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
	            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
	            return cachedClearTimeout.call(this, marker);
	        }
	    }



	}
	var queue = [];
	var draining = false;
	var currentQueue;
	var queueIndex = -1;

	function cleanUpNextTick() {
	    if (!draining || !currentQueue) {
	        return;
	    }
	    draining = false;
	    if (currentQueue.length) {
	        queue = currentQueue.concat(queue);
	    } else {
	        queueIndex = -1;
	    }
	    if (queue.length) {
	        drainQueue();
	    }
	}

	function drainQueue() {
	    if (draining) {
	        return;
	    }
	    var timeout = runTimeout(cleanUpNextTick);
	    draining = true;

	    var len = queue.length;
	    while(len) {
	        currentQueue = queue;
	        queue = [];
	        while (++queueIndex < len) {
	            if (currentQueue) {
	                currentQueue[queueIndex].run();
	            }
	        }
	        queueIndex = -1;
	        len = queue.length;
	    }
	    currentQueue = null;
	    draining = false;
	    runClearTimeout(timeout);
	}

	process.nextTick = function (fun) {
	    var args = new Array(arguments.length - 1);
	    if (arguments.length > 1) {
	        for (var i = 1; i < arguments.length; i++) {
	            args[i - 1] = arguments[i];
	        }
	    }
	    queue.push(new Item(fun, args));
	    if (queue.length === 1 && !draining) {
	        runTimeout(drainQueue);
	    }
	};

	// v8 likes predictible objects
	function Item(fun, array) {
	    this.fun = fun;
	    this.array = array;
	}
	Item.prototype.run = function () {
	    this.fun.apply(null, this.array);
	};
	process.title = 'browser';
	process.browser = true;
	process.env = {};
	process.argv = [];
	process.version = ''; // empty string to avoid regexp issues
	process.versions = {};

	function noop() {}

	process.on = noop;
	process.addListener = noop;
	process.once = noop;
	process.off = noop;
	process.removeListener = noop;
	process.removeAllListeners = noop;
	process.emit = noop;
	process.prependListener = noop;
	process.prependOnceListener = noop;

	process.listeners = function (name) { return [] }

	process.binding = function (name) {
	    throw new Error('process.binding is not supported');
	};

	process.cwd = function () { return '/' };
	process.chdir = function (dir) {
	    throw new Error('process.chdir is not supported');
	};
	process.umask = function() { return 0; };


/***/ },
/* 3 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var old;
	if (typeof Promise !== "undefined") old = Promise;
	function noConflict() {
	    try { if (Promise === bluebird) Promise = old; }
	    catch (e) {}
	    return bluebird;
	}
	var bluebird = __webpack_require__(4)();
	bluebird.noConflict = noConflict;
	module.exports = bluebird;


/***/ },
/* 4 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(process) {"use strict";
	module.exports = function() {
	var makeSelfResolutionError = function () {
	    return new TypeError("circular promise resolution chain\u000a\u000a    See http://goo.gl/MqrFmX\u000a");
	};
	var reflectHandler = function() {
	    return new Promise.PromiseInspection(this._target());
	};
	var apiRejection = function(msg) {
	    return Promise.reject(new TypeError(msg));
	};
	function Proxyable() {}
	var UNDEFINED_BINDING = {};
	var util = __webpack_require__(5);

	var getDomain;
	if (util.isNode) {
	    getDomain = function() {
	        var ret = process.domain;
	        if (ret === undefined) ret = null;
	        return ret;
	    };
	} else {
	    getDomain = function() {
	        return null;
	    };
	}
	util.notEnumerableProp(Promise, "_getDomain", getDomain);

	var es5 = __webpack_require__(6);
	var Async = __webpack_require__(7);
	var async = new Async();
	es5.defineProperty(Promise, "_async", {value: async});
	var errors = __webpack_require__(12);
	var TypeError = Promise.TypeError = errors.TypeError;
	Promise.RangeError = errors.RangeError;
	var CancellationError = Promise.CancellationError = errors.CancellationError;
	Promise.TimeoutError = errors.TimeoutError;
	Promise.OperationalError = errors.OperationalError;
	Promise.RejectionError = errors.OperationalError;
	Promise.AggregateError = errors.AggregateError;
	var INTERNAL = function(){};
	var APPLY = {};
	var NEXT_FILTER = {};
	var tryConvertToPromise = __webpack_require__(13)(Promise, INTERNAL);
	var PromiseArray =
	    __webpack_require__(14)(Promise, INTERNAL,
	                               tryConvertToPromise, apiRejection, Proxyable);
	var Context = __webpack_require__(15)(Promise);
	 /*jshint unused:false*/
	var createContext = Context.create;
	var debug = __webpack_require__(16)(Promise, Context);
	var CapturedTrace = debug.CapturedTrace;
	var PassThroughHandlerContext =
	    __webpack_require__(17)(Promise, tryConvertToPromise, NEXT_FILTER);
	var catchFilter = __webpack_require__(18)(NEXT_FILTER);
	var nodebackForPromise = __webpack_require__(19);
	var errorObj = util.errorObj;
	var tryCatch = util.tryCatch;
	function check(self, executor) {
	    if (self == null || self.constructor !== Promise) {
	        throw new TypeError("the promise constructor cannot be invoked directly\u000a\u000a    See http://goo.gl/MqrFmX\u000a");
	    }
	    if (typeof executor !== "function") {
	        throw new TypeError("expecting a function but got " + util.classString(executor));
	    }

	}

	function Promise(executor) {
	    if (executor !== INTERNAL) {
	        check(this, executor);
	    }
	    this._bitField = 0;
	    this._fulfillmentHandler0 = undefined;
	    this._rejectionHandler0 = undefined;
	    this._promise0 = undefined;
	    this._receiver0 = undefined;
	    this._resolveFromExecutor(executor);
	    this._promiseCreated();
	    this._fireEvent("promiseCreated", this);
	}

	Promise.prototype.toString = function () {
	    return "[object Promise]";
	};

	Promise.prototype.caught = Promise.prototype["catch"] = function (fn) {
	    var len = arguments.length;
	    if (len > 1) {
	        var catchInstances = new Array(len - 1),
	            j = 0, i;
	        for (i = 0; i < len - 1; ++i) {
	            var item = arguments[i];
	            if (util.isObject(item)) {
	                catchInstances[j++] = item;
	            } else {
	                return apiRejection("Catch statement predicate: " +
	                    "expecting an object but got " + util.classString(item));
	            }
	        }
	        catchInstances.length = j;
	        fn = arguments[i];
	        return this.then(undefined, catchFilter(catchInstances, fn, this));
	    }
	    return this.then(undefined, fn);
	};

	Promise.prototype.reflect = function () {
	    return this._then(reflectHandler,
	        reflectHandler, undefined, this, undefined);
	};

	Promise.prototype.then = function (didFulfill, didReject) {
	    if (debug.warnings() && arguments.length > 0 &&
	        typeof didFulfill !== "function" &&
	        typeof didReject !== "function") {
	        var msg = ".then() only accepts functions but was passed: " +
	                util.classString(didFulfill);
	        if (arguments.length > 1) {
	            msg += ", " + util.classString(didReject);
	        }
	        this._warn(msg);
	    }
	    return this._then(didFulfill, didReject, undefined, undefined, undefined);
	};

	Promise.prototype.done = function (didFulfill, didReject) {
	    var promise =
	        this._then(didFulfill, didReject, undefined, undefined, undefined);
	    promise._setIsFinal();
	};

	Promise.prototype.spread = function (fn) {
	    if (typeof fn !== "function") {
	        return apiRejection("expecting a function but got " + util.classString(fn));
	    }
	    return this.all()._then(fn, undefined, undefined, APPLY, undefined);
	};

	Promise.prototype.toJSON = function () {
	    var ret = {
	        isFulfilled: false,
	        isRejected: false,
	        fulfillmentValue: undefined,
	        rejectionReason: undefined
	    };
	    if (this.isFulfilled()) {
	        ret.fulfillmentValue = this.value();
	        ret.isFulfilled = true;
	    } else if (this.isRejected()) {
	        ret.rejectionReason = this.reason();
	        ret.isRejected = true;
	    }
	    return ret;
	};

	Promise.prototype.all = function () {
	    if (arguments.length > 0) {
	        this._warn(".all() was passed arguments but it does not take any");
	    }
	    return new PromiseArray(this).promise();
	};

	Promise.prototype.error = function (fn) {
	    return this.caught(util.originatesFromRejection, fn);
	};

	Promise.getNewLibraryCopy = module.exports;

	Promise.is = function (val) {
	    return val instanceof Promise;
	};

	Promise.fromNode = Promise.fromCallback = function(fn) {
	    var ret = new Promise(INTERNAL);
	    ret._captureStackTrace();
	    var multiArgs = arguments.length > 1 ? !!Object(arguments[1]).multiArgs
	                                         : false;
	    var result = tryCatch(fn)(nodebackForPromise(ret, multiArgs));
	    if (result === errorObj) {
	        ret._rejectCallback(result.e, true);
	    }
	    if (!ret._isFateSealed()) ret._setAsyncGuaranteed();
	    return ret;
	};

	Promise.all = function (promises) {
	    return new PromiseArray(promises).promise();
	};

	Promise.cast = function (obj) {
	    var ret = tryConvertToPromise(obj);
	    if (!(ret instanceof Promise)) {
	        ret = new Promise(INTERNAL);
	        ret._captureStackTrace();
	        ret._setFulfilled();
	        ret._rejectionHandler0 = obj;
	    }
	    return ret;
	};

	Promise.resolve = Promise.fulfilled = Promise.cast;

	Promise.reject = Promise.rejected = function (reason) {
	    var ret = new Promise(INTERNAL);
	    ret._captureStackTrace();
	    ret._rejectCallback(reason, true);
	    return ret;
	};

	Promise.setScheduler = function(fn) {
	    if (typeof fn !== "function") {
	        throw new TypeError("expecting a function but got " + util.classString(fn));
	    }
	    return async.setScheduler(fn);
	};

	Promise.prototype._then = function (
	    didFulfill,
	    didReject,
	    _,    receiver,
	    internalData
	) {
	    var haveInternalData = internalData !== undefined;
	    var promise = haveInternalData ? internalData : new Promise(INTERNAL);
	    var target = this._target();
	    var bitField = target._bitField;

	    if (!haveInternalData) {
	        promise._propagateFrom(this, 3);
	        promise._captureStackTrace();
	        if (receiver === undefined &&
	            ((this._bitField & 2097152) !== 0)) {
	            if (!((bitField & 50397184) === 0)) {
	                receiver = this._boundValue();
	            } else {
	                receiver = target === this ? undefined : this._boundTo;
	            }
	        }
	        this._fireEvent("promiseChained", this, promise);
	    }

	    var domain = getDomain();
	    if (!((bitField & 50397184) === 0)) {
	        var handler, value, settler = target._settlePromiseCtx;
	        if (((bitField & 33554432) !== 0)) {
	            value = target._rejectionHandler0;
	            handler = didFulfill;
	        } else if (((bitField & 16777216) !== 0)) {
	            value = target._fulfillmentHandler0;
	            handler = didReject;
	            target._unsetRejectionIsUnhandled();
	        } else {
	            settler = target._settlePromiseLateCancellationObserver;
	            value = new CancellationError("late cancellation observer");
	            target._attachExtraTrace(value);
	            handler = didReject;
	        }

	        async.invoke(settler, target, {
	            handler: domain === null ? handler
	                : (typeof handler === "function" &&
	                    util.domainBind(domain, handler)),
	            promise: promise,
	            receiver: receiver,
	            value: value
	        });
	    } else {
	        target._addCallbacks(didFulfill, didReject, promise, receiver, domain);
	    }

	    return promise;
	};

	Promise.prototype._length = function () {
	    return this._bitField & 65535;
	};

	Promise.prototype._isFateSealed = function () {
	    return (this._bitField & 117506048) !== 0;
	};

	Promise.prototype._isFollowing = function () {
	    return (this._bitField & 67108864) === 67108864;
	};

	Promise.prototype._setLength = function (len) {
	    this._bitField = (this._bitField & -65536) |
	        (len & 65535);
	};

	Promise.prototype._setFulfilled = function () {
	    this._bitField = this._bitField | 33554432;
	    this._fireEvent("promiseFulfilled", this);
	};

	Promise.prototype._setRejected = function () {
	    this._bitField = this._bitField | 16777216;
	    this._fireEvent("promiseRejected", this);
	};

	Promise.prototype._setFollowing = function () {
	    this._bitField = this._bitField | 67108864;
	    this._fireEvent("promiseResolved", this);
	};

	Promise.prototype._setIsFinal = function () {
	    this._bitField = this._bitField | 4194304;
	};

	Promise.prototype._isFinal = function () {
	    return (this._bitField & 4194304) > 0;
	};

	Promise.prototype._unsetCancelled = function() {
	    this._bitField = this._bitField & (~65536);
	};

	Promise.prototype._setCancelled = function() {
	    this._bitField = this._bitField | 65536;
	    this._fireEvent("promiseCancelled", this);
	};

	Promise.prototype._setWillBeCancelled = function() {
	    this._bitField = this._bitField | 8388608;
	};

	Promise.prototype._setAsyncGuaranteed = function() {
	    if (async.hasCustomScheduler()) return;
	    this._bitField = this._bitField | 134217728;
	};

	Promise.prototype._receiverAt = function (index) {
	    var ret = index === 0 ? this._receiver0 : this[
	            index * 4 - 4 + 3];
	    if (ret === UNDEFINED_BINDING) {
	        return undefined;
	    } else if (ret === undefined && this._isBound()) {
	        return this._boundValue();
	    }
	    return ret;
	};

	Promise.prototype._promiseAt = function (index) {
	    return this[
	            index * 4 - 4 + 2];
	};

	Promise.prototype._fulfillmentHandlerAt = function (index) {
	    return this[
	            index * 4 - 4 + 0];
	};

	Promise.prototype._rejectionHandlerAt = function (index) {
	    return this[
	            index * 4 - 4 + 1];
	};

	Promise.prototype._boundValue = function() {};

	Promise.prototype._migrateCallback0 = function (follower) {
	    var bitField = follower._bitField;
	    var fulfill = follower._fulfillmentHandler0;
	    var reject = follower._rejectionHandler0;
	    var promise = follower._promise0;
	    var receiver = follower._receiverAt(0);
	    if (receiver === undefined) receiver = UNDEFINED_BINDING;
	    this._addCallbacks(fulfill, reject, promise, receiver, null);
	};

	Promise.prototype._migrateCallbackAt = function (follower, index) {
	    var fulfill = follower._fulfillmentHandlerAt(index);
	    var reject = follower._rejectionHandlerAt(index);
	    var promise = follower._promiseAt(index);
	    var receiver = follower._receiverAt(index);
	    if (receiver === undefined) receiver = UNDEFINED_BINDING;
	    this._addCallbacks(fulfill, reject, promise, receiver, null);
	};

	Promise.prototype._addCallbacks = function (
	    fulfill,
	    reject,
	    promise,
	    receiver,
	    domain
	) {
	    var index = this._length();

	    if (index >= 65535 - 4) {
	        index = 0;
	        this._setLength(0);
	    }

	    if (index === 0) {
	        this._promise0 = promise;
	        this._receiver0 = receiver;
	        if (typeof fulfill === "function") {
	            this._fulfillmentHandler0 =
	                domain === null ? fulfill : util.domainBind(domain, fulfill);
	        }
	        if (typeof reject === "function") {
	            this._rejectionHandler0 =
	                domain === null ? reject : util.domainBind(domain, reject);
	        }
	    } else {
	        var base = index * 4 - 4;
	        this[base + 2] = promise;
	        this[base + 3] = receiver;
	        if (typeof fulfill === "function") {
	            this[base + 0] =
	                domain === null ? fulfill : util.domainBind(domain, fulfill);
	        }
	        if (typeof reject === "function") {
	            this[base + 1] =
	                domain === null ? reject : util.domainBind(domain, reject);
	        }
	    }
	    this._setLength(index + 1);
	    return index;
	};

	Promise.prototype._proxy = function (proxyable, arg) {
	    this._addCallbacks(undefined, undefined, arg, proxyable, null);
	};

	Promise.prototype._resolveCallback = function(value, shouldBind) {
	    if (((this._bitField & 117506048) !== 0)) return;
	    if (value === this)
	        return this._rejectCallback(makeSelfResolutionError(), false);
	    var maybePromise = tryConvertToPromise(value, this);
	    if (!(maybePromise instanceof Promise)) return this._fulfill(value);

	    if (shouldBind) this._propagateFrom(maybePromise, 2);

	    var promise = maybePromise._target();

	    if (promise === this) {
	        this._reject(makeSelfResolutionError());
	        return;
	    }

	    var bitField = promise._bitField;
	    if (((bitField & 50397184) === 0)) {
	        var len = this._length();
	        if (len > 0) promise._migrateCallback0(this);
	        for (var i = 1; i < len; ++i) {
	            promise._migrateCallbackAt(this, i);
	        }
	        this._setFollowing();
	        this._setLength(0);
	        this._setFollowee(promise);
	    } else if (((bitField & 33554432) !== 0)) {
	        this._fulfill(promise._value());
	    } else if (((bitField & 16777216) !== 0)) {
	        this._reject(promise._reason());
	    } else {
	        var reason = new CancellationError("late cancellation observer");
	        promise._attachExtraTrace(reason);
	        this._reject(reason);
	    }
	};

	Promise.prototype._rejectCallback =
	function(reason, synchronous, ignoreNonErrorWarnings) {
	    var trace = util.ensureErrorObject(reason);
	    var hasStack = trace === reason;
	    if (!hasStack && !ignoreNonErrorWarnings && debug.warnings()) {
	        var message = "a promise was rejected with a non-error: " +
	            util.classString(reason);
	        this._warn(message, true);
	    }
	    this._attachExtraTrace(trace, synchronous ? hasStack : false);
	    this._reject(reason);
	};

	Promise.prototype._resolveFromExecutor = function (executor) {
	    if (executor === INTERNAL) return;
	    var promise = this;
	    this._captureStackTrace();
	    this._pushContext();
	    var synchronous = true;
	    var r = this._execute(executor, function(value) {
	        promise._resolveCallback(value);
	    }, function (reason) {
	        promise._rejectCallback(reason, synchronous);
	    });
	    synchronous = false;
	    this._popContext();

	    if (r !== undefined) {
	        promise._rejectCallback(r, true);
	    }
	};

	Promise.prototype._settlePromiseFromHandler = function (
	    handler, receiver, value, promise
	) {
	    var bitField = promise._bitField;
	    if (((bitField & 65536) !== 0)) return;
	    promise._pushContext();
	    var x;
	    if (receiver === APPLY) {
	        if (!value || typeof value.length !== "number") {
	            x = errorObj;
	            x.e = new TypeError("cannot .spread() a non-array: " +
	                                    util.classString(value));
	        } else {
	            x = tryCatch(handler).apply(this._boundValue(), value);
	        }
	    } else {
	        x = tryCatch(handler).call(receiver, value);
	    }
	    var promiseCreated = promise._popContext();
	    bitField = promise._bitField;
	    if (((bitField & 65536) !== 0)) return;

	    if (x === NEXT_FILTER) {
	        promise._reject(value);
	    } else if (x === errorObj) {
	        promise._rejectCallback(x.e, false);
	    } else {
	        debug.checkForgottenReturns(x, promiseCreated, "",  promise, this);
	        promise._resolveCallback(x);
	    }
	};

	Promise.prototype._target = function() {
	    var ret = this;
	    while (ret._isFollowing()) ret = ret._followee();
	    return ret;
	};

	Promise.prototype._followee = function() {
	    return this._rejectionHandler0;
	};

	Promise.prototype._setFollowee = function(promise) {
	    this._rejectionHandler0 = promise;
	};

	Promise.prototype._settlePromise = function(promise, handler, receiver, value) {
	    var isPromise = promise instanceof Promise;
	    var bitField = this._bitField;
	    var asyncGuaranteed = ((bitField & 134217728) !== 0);
	    if (((bitField & 65536) !== 0)) {
	        if (isPromise) promise._invokeInternalOnCancel();

	        if (receiver instanceof PassThroughHandlerContext &&
	            receiver.isFinallyHandler()) {
	            receiver.cancelPromise = promise;
	            if (tryCatch(handler).call(receiver, value) === errorObj) {
	                promise._reject(errorObj.e);
	            }
	        } else if (handler === reflectHandler) {
	            promise._fulfill(reflectHandler.call(receiver));
	        } else if (receiver instanceof Proxyable) {
	            receiver._promiseCancelled(promise);
	        } else if (isPromise || promise instanceof PromiseArray) {
	            promise._cancel();
	        } else {
	            receiver.cancel();
	        }
	    } else if (typeof handler === "function") {
	        if (!isPromise) {
	            handler.call(receiver, value, promise);
	        } else {
	            if (asyncGuaranteed) promise._setAsyncGuaranteed();
	            this._settlePromiseFromHandler(handler, receiver, value, promise);
	        }
	    } else if (receiver instanceof Proxyable) {
	        if (!receiver._isResolved()) {
	            if (((bitField & 33554432) !== 0)) {
	                receiver._promiseFulfilled(value, promise);
	            } else {
	                receiver._promiseRejected(value, promise);
	            }
	        }
	    } else if (isPromise) {
	        if (asyncGuaranteed) promise._setAsyncGuaranteed();
	        if (((bitField & 33554432) !== 0)) {
	            promise._fulfill(value);
	        } else {
	            promise._reject(value);
	        }
	    }
	};

	Promise.prototype._settlePromiseLateCancellationObserver = function(ctx) {
	    var handler = ctx.handler;
	    var promise = ctx.promise;
	    var receiver = ctx.receiver;
	    var value = ctx.value;
	    if (typeof handler === "function") {
	        if (!(promise instanceof Promise)) {
	            handler.call(receiver, value, promise);
	        } else {
	            this._settlePromiseFromHandler(handler, receiver, value, promise);
	        }
	    } else if (promise instanceof Promise) {
	        promise._reject(value);
	    }
	};

	Promise.prototype._settlePromiseCtx = function(ctx) {
	    this._settlePromise(ctx.promise, ctx.handler, ctx.receiver, ctx.value);
	};

	Promise.prototype._settlePromise0 = function(handler, value, bitField) {
	    var promise = this._promise0;
	    var receiver = this._receiverAt(0);
	    this._promise0 = undefined;
	    this._receiver0 = undefined;
	    this._settlePromise(promise, handler, receiver, value);
	};

	Promise.prototype._clearCallbackDataAtIndex = function(index) {
	    var base = index * 4 - 4;
	    this[base + 2] =
	    this[base + 3] =
	    this[base + 0] =
	    this[base + 1] = undefined;
	};

	Promise.prototype._fulfill = function (value) {
	    var bitField = this._bitField;
	    if (((bitField & 117506048) >>> 16)) return;
	    if (value === this) {
	        var err = makeSelfResolutionError();
	        this._attachExtraTrace(err);
	        return this._reject(err);
	    }
	    this._setFulfilled();
	    this._rejectionHandler0 = value;

	    if ((bitField & 65535) > 0) {
	        if (((bitField & 134217728) !== 0)) {
	            this._settlePromises();
	        } else {
	            async.settlePromises(this);
	        }
	    }
	};

	Promise.prototype._reject = function (reason) {
	    var bitField = this._bitField;
	    if (((bitField & 117506048) >>> 16)) return;
	    this._setRejected();
	    this._fulfillmentHandler0 = reason;

	    if (this._isFinal()) {
	        return async.fatalError(reason, util.isNode);
	    }

	    if ((bitField & 65535) > 0) {
	        async.settlePromises(this);
	    } else {
	        this._ensurePossibleRejectionHandled();
	    }
	};

	Promise.prototype._fulfillPromises = function (len, value) {
	    for (var i = 1; i < len; i++) {
	        var handler = this._fulfillmentHandlerAt(i);
	        var promise = this._promiseAt(i);
	        var receiver = this._receiverAt(i);
	        this._clearCallbackDataAtIndex(i);
	        this._settlePromise(promise, handler, receiver, value);
	    }
	};

	Promise.prototype._rejectPromises = function (len, reason) {
	    for (var i = 1; i < len; i++) {
	        var handler = this._rejectionHandlerAt(i);
	        var promise = this._promiseAt(i);
	        var receiver = this._receiverAt(i);
	        this._clearCallbackDataAtIndex(i);
	        this._settlePromise(promise, handler, receiver, reason);
	    }
	};

	Promise.prototype._settlePromises = function () {
	    var bitField = this._bitField;
	    var len = (bitField & 65535);

	    if (len > 0) {
	        if (((bitField & 16842752) !== 0)) {
	            var reason = this._fulfillmentHandler0;
	            this._settlePromise0(this._rejectionHandler0, reason, bitField);
	            this._rejectPromises(len, reason);
	        } else {
	            var value = this._rejectionHandler0;
	            this._settlePromise0(this._fulfillmentHandler0, value, bitField);
	            this._fulfillPromises(len, value);
	        }
	        this._setLength(0);
	    }
	    this._clearCancellationData();
	};

	Promise.prototype._settledValue = function() {
	    var bitField = this._bitField;
	    if (((bitField & 33554432) !== 0)) {
	        return this._rejectionHandler0;
	    } else if (((bitField & 16777216) !== 0)) {
	        return this._fulfillmentHandler0;
	    }
	};

	function deferResolve(v) {this.promise._resolveCallback(v);}
	function deferReject(v) {this.promise._rejectCallback(v, false);}

	Promise.defer = Promise.pending = function() {
	    debug.deprecated("Promise.defer", "new Promise");
	    var promise = new Promise(INTERNAL);
	    return {
	        promise: promise,
	        resolve: deferResolve,
	        reject: deferReject
	    };
	};

	util.notEnumerableProp(Promise,
	                       "_makeSelfResolutionError",
	                       makeSelfResolutionError);

	__webpack_require__(20)(Promise, INTERNAL, tryConvertToPromise, apiRejection,
	    debug);
	__webpack_require__(21)(Promise, INTERNAL, tryConvertToPromise, debug);
	__webpack_require__(22)(Promise, PromiseArray, apiRejection, debug);
	__webpack_require__(23)(Promise);
	__webpack_require__(24)(Promise);
	__webpack_require__(25)(
	    Promise, PromiseArray, tryConvertToPromise, INTERNAL, async, getDomain);
	Promise.Promise = Promise;
	Promise.version = "3.5.1";
	__webpack_require__(26)(Promise, PromiseArray, apiRejection, tryConvertToPromise, INTERNAL, debug);
	__webpack_require__(27)(Promise);
	__webpack_require__(28)(Promise, apiRejection, tryConvertToPromise, createContext, INTERNAL, debug);
	__webpack_require__(29)(Promise, INTERNAL, debug);
	__webpack_require__(30)(Promise, apiRejection, INTERNAL, tryConvertToPromise, Proxyable, debug);
	__webpack_require__(31)(Promise);
	__webpack_require__(32)(Promise, INTERNAL);
	__webpack_require__(33)(Promise, PromiseArray, tryConvertToPromise, apiRejection);
	__webpack_require__(34)(Promise, INTERNAL, tryConvertToPromise, apiRejection);
	__webpack_require__(35)(Promise, PromiseArray, apiRejection, tryConvertToPromise, INTERNAL, debug);
	__webpack_require__(36)(Promise, PromiseArray, debug);
	__webpack_require__(37)(Promise, PromiseArray, apiRejection);
	__webpack_require__(38)(Promise, INTERNAL);
	__webpack_require__(39)(Promise, INTERNAL);
	__webpack_require__(40)(Promise);
	                                                         
	    util.toFastProperties(Promise);                                          
	    util.toFastProperties(Promise.prototype);                                
	    function fillTypes(value) {                                              
	        var p = new Promise(INTERNAL);                                       
	        p._fulfillmentHandler0 = value;                                      
	        p._rejectionHandler0 = value;                                        
	        p._promise0 = value;                                                 
	        p._receiver0 = value;                                                
	    }                                                                        
	    // Complete slack tracking, opt out of field-type tracking and           
	    // stabilize map                                                         
	    fillTypes({a: 1});                                                       
	    fillTypes({b: 2});                                                       
	    fillTypes({c: 3});                                                       
	    fillTypes(1);                                                            
	    fillTypes(function(){});                                                 
	    fillTypes(undefined);                                                    
	    fillTypes(false);                                                        
	    fillTypes(new Promise(INTERNAL));                                        
	    debug.setBounds(Async.firstLineError, util.lastLineError);               
	    return Promise;                                                          

	};

	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(2)))

/***/ },
/* 5 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(global, process) {"use strict";
	var es5 = __webpack_require__(6);
	var canEvaluate = typeof navigator == "undefined";

	var errorObj = {e: {}};
	var tryCatchTarget;
	var globalObject = typeof self !== "undefined" ? self :
	    typeof window !== "undefined" ? window :
	    typeof global !== "undefined" ? global :
	    this !== undefined ? this : null;

	function tryCatcher() {
	    try {
	        var target = tryCatchTarget;
	        tryCatchTarget = null;
	        return target.apply(this, arguments);
	    } catch (e) {
	        errorObj.e = e;
	        return errorObj;
	    }
	}
	function tryCatch(fn) {
	    tryCatchTarget = fn;
	    return tryCatcher;
	}

	var inherits = function(Child, Parent) {
	    var hasProp = {}.hasOwnProperty;

	    function T() {
	        this.constructor = Child;
	        this.constructor$ = Parent;
	        for (var propertyName in Parent.prototype) {
	            if (hasProp.call(Parent.prototype, propertyName) &&
	                propertyName.charAt(propertyName.length-1) !== "$"
	           ) {
	                this[propertyName + "$"] = Parent.prototype[propertyName];
	            }
	        }
	    }
	    T.prototype = Parent.prototype;
	    Child.prototype = new T();
	    return Child.prototype;
	};


	function isPrimitive(val) {
	    return val == null || val === true || val === false ||
	        typeof val === "string" || typeof val === "number";

	}

	function isObject(value) {
	    return typeof value === "function" ||
	           typeof value === "object" && value !== null;
	}

	function maybeWrapAsError(maybeError) {
	    if (!isPrimitive(maybeError)) return maybeError;

	    return new Error(safeToString(maybeError));
	}

	function withAppended(target, appendee) {
	    var len = target.length;
	    var ret = new Array(len + 1);
	    var i;
	    for (i = 0; i < len; ++i) {
	        ret[i] = target[i];
	    }
	    ret[i] = appendee;
	    return ret;
	}

	function getDataPropertyOrDefault(obj, key, defaultValue) {
	    if (es5.isES5) {
	        var desc = Object.getOwnPropertyDescriptor(obj, key);

	        if (desc != null) {
	            return desc.get == null && desc.set == null
	                    ? desc.value
	                    : defaultValue;
	        }
	    } else {
	        return {}.hasOwnProperty.call(obj, key) ? obj[key] : undefined;
	    }
	}

	function notEnumerableProp(obj, name, value) {
	    if (isPrimitive(obj)) return obj;
	    var descriptor = {
	        value: value,
	        configurable: true,
	        enumerable: false,
	        writable: true
	    };
	    es5.defineProperty(obj, name, descriptor);
	    return obj;
	}

	function thrower(r) {
	    throw r;
	}

	var inheritedDataKeys = (function() {
	    var excludedPrototypes = [
	        Array.prototype,
	        Object.prototype,
	        Function.prototype
	    ];

	    var isExcludedProto = function(val) {
	        for (var i = 0; i < excludedPrototypes.length; ++i) {
	            if (excludedPrototypes[i] === val) {
	                return true;
	            }
	        }
	        return false;
	    };

	    if (es5.isES5) {
	        var getKeys = Object.getOwnPropertyNames;
	        return function(obj) {
	            var ret = [];
	            var visitedKeys = Object.create(null);
	            while (obj != null && !isExcludedProto(obj)) {
	                var keys;
	                try {
	                    keys = getKeys(obj);
	                } catch (e) {
	                    return ret;
	                }
	                for (var i = 0; i < keys.length; ++i) {
	                    var key = keys[i];
	                    if (visitedKeys[key]) continue;
	                    visitedKeys[key] = true;
	                    var desc = Object.getOwnPropertyDescriptor(obj, key);
	                    if (desc != null && desc.get == null && desc.set == null) {
	                        ret.push(key);
	                    }
	                }
	                obj = es5.getPrototypeOf(obj);
	            }
	            return ret;
	        };
	    } else {
	        var hasProp = {}.hasOwnProperty;
	        return function(obj) {
	            if (isExcludedProto(obj)) return [];
	            var ret = [];

	            /*jshint forin:false */
	            enumeration: for (var key in obj) {
	                if (hasProp.call(obj, key)) {
	                    ret.push(key);
	                } else {
	                    for (var i = 0; i < excludedPrototypes.length; ++i) {
	                        if (hasProp.call(excludedPrototypes[i], key)) {
	                            continue enumeration;
	                        }
	                    }
	                    ret.push(key);
	                }
	            }
	            return ret;
	        };
	    }

	})();

	var thisAssignmentPattern = /this\s*\.\s*\S+\s*=/;
	function isClass(fn) {
	    try {
	        if (typeof fn === "function") {
	            var keys = es5.names(fn.prototype);

	            var hasMethods = es5.isES5 && keys.length > 1;
	            var hasMethodsOtherThanConstructor = keys.length > 0 &&
	                !(keys.length === 1 && keys[0] === "constructor");
	            var hasThisAssignmentAndStaticMethods =
	                thisAssignmentPattern.test(fn + "") && es5.names(fn).length > 0;

	            if (hasMethods || hasMethodsOtherThanConstructor ||
	                hasThisAssignmentAndStaticMethods) {
	                return true;
	            }
	        }
	        return false;
	    } catch (e) {
	        return false;
	    }
	}

	function toFastProperties(obj) {
	    /*jshint -W027,-W055,-W031*/
	    function FakeConstructor() {}
	    FakeConstructor.prototype = obj;
	    var l = 8;
	    while (l--) new FakeConstructor();
	    return obj;
	    eval(obj);
	}

	var rident = /^[a-z$_][a-z$_0-9]*$/i;
	function isIdentifier(str) {
	    return rident.test(str);
	}

	function filledRange(count, prefix, suffix) {
	    var ret = new Array(count);
	    for(var i = 0; i < count; ++i) {
	        ret[i] = prefix + i + suffix;
	    }
	    return ret;
	}

	function safeToString(obj) {
	    try {
	        return obj + "";
	    } catch (e) {
	        return "[no string representation]";
	    }
	}

	function isError(obj) {
	    return obj instanceof Error ||
	        (obj !== null &&
	           typeof obj === "object" &&
	           typeof obj.message === "string" &&
	           typeof obj.name === "string");
	}

	function markAsOriginatingFromRejection(e) {
	    try {
	        notEnumerableProp(e, "isOperational", true);
	    }
	    catch(ignore) {}
	}

	function originatesFromRejection(e) {
	    if (e == null) return false;
	    return ((e instanceof Error["__BluebirdErrorTypes__"].OperationalError) ||
	        e["isOperational"] === true);
	}

	function canAttachTrace(obj) {
	    return isError(obj) && es5.propertyIsWritable(obj, "stack");
	}

	var ensureErrorObject = (function() {
	    if (!("stack" in new Error())) {
	        return function(value) {
	            if (canAttachTrace(value)) return value;
	            try {throw new Error(safeToString(value));}
	            catch(err) {return err;}
	        };
	    } else {
	        return function(value) {
	            if (canAttachTrace(value)) return value;
	            return new Error(safeToString(value));
	        };
	    }
	})();

	function classString(obj) {
	    return {}.toString.call(obj);
	}

	function copyDescriptors(from, to, filter) {
	    var keys = es5.names(from);
	    for (var i = 0; i < keys.length; ++i) {
	        var key = keys[i];
	        if (filter(key)) {
	            try {
	                es5.defineProperty(to, key, es5.getDescriptor(from, key));
	            } catch (ignore) {}
	        }
	    }
	}

	var asArray = function(v) {
	    if (es5.isArray(v)) {
	        return v;
	    }
	    return null;
	};

	if (typeof Symbol !== "undefined" && Symbol.iterator) {
	    var ArrayFrom = typeof Array.from === "function" ? function(v) {
	        return Array.from(v);
	    } : function(v) {
	        var ret = [];
	        var it = v[Symbol.iterator]();
	        var itResult;
	        while (!((itResult = it.next()).done)) {
	            ret.push(itResult.value);
	        }
	        return ret;
	    };

	    asArray = function(v) {
	        if (es5.isArray(v)) {
	            return v;
	        } else if (v != null && typeof v[Symbol.iterator] === "function") {
	            return ArrayFrom(v);
	        }
	        return null;
	    };
	}

	var isNode = typeof process !== "undefined" &&
	        classString(process).toLowerCase() === "[object process]";

	var hasEnvVariables = typeof process !== "undefined" &&
	    typeof process.env !== "undefined";

	function env(key) {
	    return hasEnvVariables ? process.env[key] : undefined;
	}

	function getNativePromise() {
	    if (typeof Promise === "function") {
	        try {
	            var promise = new Promise(function(){});
	            if ({}.toString.call(promise) === "[object Promise]") {
	                return Promise;
	            }
	        } catch (e) {}
	    }
	}

	function domainBind(self, cb) {
	    return self.bind(cb);
	}

	var ret = {
	    isClass: isClass,
	    isIdentifier: isIdentifier,
	    inheritedDataKeys: inheritedDataKeys,
	    getDataPropertyOrDefault: getDataPropertyOrDefault,
	    thrower: thrower,
	    isArray: es5.isArray,
	    asArray: asArray,
	    notEnumerableProp: notEnumerableProp,
	    isPrimitive: isPrimitive,
	    isObject: isObject,
	    isError: isError,
	    canEvaluate: canEvaluate,
	    errorObj: errorObj,
	    tryCatch: tryCatch,
	    inherits: inherits,
	    withAppended: withAppended,
	    maybeWrapAsError: maybeWrapAsError,
	    toFastProperties: toFastProperties,
	    filledRange: filledRange,
	    toString: safeToString,
	    canAttachTrace: canAttachTrace,
	    ensureErrorObject: ensureErrorObject,
	    originatesFromRejection: originatesFromRejection,
	    markAsOriginatingFromRejection: markAsOriginatingFromRejection,
	    classString: classString,
	    copyDescriptors: copyDescriptors,
	    hasDevTools: typeof chrome !== "undefined" && chrome &&
	                 typeof chrome.loadTimes === "function",
	    isNode: isNode,
	    hasEnvVariables: hasEnvVariables,
	    env: env,
	    global: globalObject,
	    getNativePromise: getNativePromise,
	    domainBind: domainBind
	};
	ret.isRecentNode = ret.isNode && (function() {
	    var version = process.versions.node.split(".").map(Number);
	    return (version[0] === 0 && version[1] > 10) || (version[0] > 0);
	})();

	if (ret.isNode) ret.toFastProperties(process);

	try {throw new Error(); } catch (e) {ret.lastLineError = e;}
	module.exports = ret;

	/* WEBPACK VAR INJECTION */}.call(exports, (function() { return this; }()), __webpack_require__(2)))

/***/ },
/* 6 */
/***/ function(module, exports) {

	var isES5 = (function(){
	    "use strict";
	    return this === undefined;
	})();

	if (isES5) {
	    module.exports = {
	        freeze: Object.freeze,
	        defineProperty: Object.defineProperty,
	        getDescriptor: Object.getOwnPropertyDescriptor,
	        keys: Object.keys,
	        names: Object.getOwnPropertyNames,
	        getPrototypeOf: Object.getPrototypeOf,
	        isArray: Array.isArray,
	        isES5: isES5,
	        propertyIsWritable: function(obj, prop) {
	            var descriptor = Object.getOwnPropertyDescriptor(obj, prop);
	            return !!(!descriptor || descriptor.writable || descriptor.set);
	        }
	    };
	} else {
	    var has = {}.hasOwnProperty;
	    var str = {}.toString;
	    var proto = {}.constructor.prototype;

	    var ObjectKeys = function (o) {
	        var ret = [];
	        for (var key in o) {
	            if (has.call(o, key)) {
	                ret.push(key);
	            }
	        }
	        return ret;
	    };

	    var ObjectGetDescriptor = function(o, key) {
	        return {value: o[key]};
	    };

	    var ObjectDefineProperty = function (o, key, desc) {
	        o[key] = desc.value;
	        return o;
	    };

	    var ObjectFreeze = function (obj) {
	        return obj;
	    };

	    var ObjectGetPrototypeOf = function (obj) {
	        try {
	            return Object(obj).constructor.prototype;
	        }
	        catch (e) {
	            return proto;
	        }
	    };

	    var ArrayIsArray = function (obj) {
	        try {
	            return str.call(obj) === "[object Array]";
	        }
	        catch(e) {
	            return false;
	        }
	    };

	    module.exports = {
	        isArray: ArrayIsArray,
	        keys: ObjectKeys,
	        names: ObjectKeys,
	        defineProperty: ObjectDefineProperty,
	        getDescriptor: ObjectGetDescriptor,
	        freeze: ObjectFreeze,
	        getPrototypeOf: ObjectGetPrototypeOf,
	        isES5: isES5,
	        propertyIsWritable: function() {
	            return true;
	        }
	    };
	}


/***/ },
/* 7 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(process) {"use strict";
	var firstLineError;
	try {throw new Error(); } catch (e) {firstLineError = e;}
	var schedule = __webpack_require__(8);
	var Queue = __webpack_require__(11);
	var util = __webpack_require__(5);

	function Async() {
	    this._customScheduler = false;
	    this._isTickUsed = false;
	    this._lateQueue = new Queue(16);
	    this._normalQueue = new Queue(16);
	    this._haveDrainedQueues = false;
	    this._trampolineEnabled = true;
	    var self = this;
	    this.drainQueues = function () {
	        self._drainQueues();
	    };
	    this._schedule = schedule;
	}

	Async.prototype.setScheduler = function(fn) {
	    var prev = this._schedule;
	    this._schedule = fn;
	    this._customScheduler = true;
	    return prev;
	};

	Async.prototype.hasCustomScheduler = function() {
	    return this._customScheduler;
	};

	Async.prototype.enableTrampoline = function() {
	    this._trampolineEnabled = true;
	};

	Async.prototype.disableTrampolineIfNecessary = function() {
	    if (util.hasDevTools) {
	        this._trampolineEnabled = false;
	    }
	};

	Async.prototype.haveItemsQueued = function () {
	    return this._isTickUsed || this._haveDrainedQueues;
	};


	Async.prototype.fatalError = function(e, isNode) {
	    if (isNode) {
	        process.stderr.write("Fatal " + (e instanceof Error ? e.stack : e) +
	            "\n");
	        process.exit(2);
	    } else {
	        this.throwLater(e);
	    }
	};

	Async.prototype.throwLater = function(fn, arg) {
	    if (arguments.length === 1) {
	        arg = fn;
	        fn = function () { throw arg; };
	    }
	    if (typeof setTimeout !== "undefined") {
	        setTimeout(function() {
	            fn(arg);
	        }, 0);
	    } else try {
	        this._schedule(function() {
	            fn(arg);
	        });
	    } catch (e) {
	        throw new Error("No async scheduler available\u000a\u000a    See http://goo.gl/MqrFmX\u000a");
	    }
	};

	function AsyncInvokeLater(fn, receiver, arg) {
	    this._lateQueue.push(fn, receiver, arg);
	    this._queueTick();
	}

	function AsyncInvoke(fn, receiver, arg) {
	    this._normalQueue.push(fn, receiver, arg);
	    this._queueTick();
	}

	function AsyncSettlePromises(promise) {
	    this._normalQueue._pushOne(promise);
	    this._queueTick();
	}

	if (!util.hasDevTools) {
	    Async.prototype.invokeLater = AsyncInvokeLater;
	    Async.prototype.invoke = AsyncInvoke;
	    Async.prototype.settlePromises = AsyncSettlePromises;
	} else {
	    Async.prototype.invokeLater = function (fn, receiver, arg) {
	        if (this._trampolineEnabled) {
	            AsyncInvokeLater.call(this, fn, receiver, arg);
	        } else {
	            this._schedule(function() {
	                setTimeout(function() {
	                    fn.call(receiver, arg);
	                }, 100);
	            });
	        }
	    };

	    Async.prototype.invoke = function (fn, receiver, arg) {
	        if (this._trampolineEnabled) {
	            AsyncInvoke.call(this, fn, receiver, arg);
	        } else {
	            this._schedule(function() {
	                fn.call(receiver, arg);
	            });
	        }
	    };

	    Async.prototype.settlePromises = function(promise) {
	        if (this._trampolineEnabled) {
	            AsyncSettlePromises.call(this, promise);
	        } else {
	            this._schedule(function() {
	                promise._settlePromises();
	            });
	        }
	    };
	}

	Async.prototype._drainQueue = function(queue) {
	    while (queue.length() > 0) {
	        var fn = queue.shift();
	        if (typeof fn !== "function") {
	            fn._settlePromises();
	            continue;
	        }
	        var receiver = queue.shift();
	        var arg = queue.shift();
	        fn.call(receiver, arg);
	    }
	};

	Async.prototype._drainQueues = function () {
	    this._drainQueue(this._normalQueue);
	    this._reset();
	    this._haveDrainedQueues = true;
	    this._drainQueue(this._lateQueue);
	};

	Async.prototype._queueTick = function () {
	    if (!this._isTickUsed) {
	        this._isTickUsed = true;
	        this._schedule(this.drainQueues);
	    }
	};

	Async.prototype._reset = function () {
	    this._isTickUsed = false;
	};

	module.exports = Async;
	module.exports.firstLineError = firstLineError;

	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(2)))

/***/ },
/* 8 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(global, process, setImmediate) {"use strict";
	var util = __webpack_require__(5);
	var schedule;
	var noAsyncScheduler = function() {
	    throw new Error("No async scheduler available\u000a\u000a    See http://goo.gl/MqrFmX\u000a");
	};
	var NativePromise = util.getNativePromise();
	if (util.isNode && typeof MutationObserver === "undefined") {
	    var GlobalSetImmediate = global.setImmediate;
	    var ProcessNextTick = process.nextTick;
	    schedule = util.isRecentNode
	                ? function(fn) { GlobalSetImmediate.call(global, fn); }
	                : function(fn) { ProcessNextTick.call(process, fn); };
	} else if (typeof NativePromise === "function" &&
	           typeof NativePromise.resolve === "function") {
	    var nativePromise = NativePromise.resolve();
	    schedule = function(fn) {
	        nativePromise.then(fn);
	    };
	} else if ((typeof MutationObserver !== "undefined") &&
	          !(typeof window !== "undefined" &&
	            window.navigator &&
	            (window.navigator.standalone || window.cordova))) {
	    schedule = (function() {
	        var div = document.createElement("div");
	        var opts = {attributes: true};
	        var toggleScheduled = false;
	        var div2 = document.createElement("div");
	        var o2 = new MutationObserver(function() {
	            div.classList.toggle("foo");
	            toggleScheduled = false;
	        });
	        o2.observe(div2, opts);

	        var scheduleToggle = function() {
	            if (toggleScheduled) return;
	            toggleScheduled = true;
	            div2.classList.toggle("foo");
	        };

	        return function schedule(fn) {
	            var o = new MutationObserver(function() {
	                o.disconnect();
	                fn();
	            });
	            o.observe(div, opts);
	            scheduleToggle();
	        };
	    })();
	} else if (typeof setImmediate !== "undefined") {
	    schedule = function (fn) {
	        setImmediate(fn);
	    };
	} else if (typeof setTimeout !== "undefined") {
	    schedule = function (fn) {
	        setTimeout(fn, 0);
	    };
	} else {
	    schedule = noAsyncScheduler;
	}
	module.exports = schedule;

	/* WEBPACK VAR INJECTION */}.call(exports, (function() { return this; }()), __webpack_require__(2), __webpack_require__(9).setImmediate))

/***/ },
/* 9 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(setImmediate, clearImmediate) {var nextTick = __webpack_require__(10).nextTick;
	var apply = Function.prototype.apply;
	var slice = Array.prototype.slice;
	var immediateIds = {};
	var nextImmediateId = 0;

	// DOM APIs, for completeness

	exports.setTimeout = function() {
	  return new Timeout(apply.call(setTimeout, window, arguments), clearTimeout);
	};
	exports.setInterval = function() {
	  return new Timeout(apply.call(setInterval, window, arguments), clearInterval);
	};
	exports.clearTimeout =
	exports.clearInterval = function(timeout) { timeout.close(); };

	function Timeout(id, clearFn) {
	  this._id = id;
	  this._clearFn = clearFn;
	}
	Timeout.prototype.unref = Timeout.prototype.ref = function() {};
	Timeout.prototype.close = function() {
	  this._clearFn.call(window, this._id);
	};

	// Does not start the time, just sets up the members needed.
	exports.enroll = function(item, msecs) {
	  clearTimeout(item._idleTimeoutId);
	  item._idleTimeout = msecs;
	};

	exports.unenroll = function(item) {
	  clearTimeout(item._idleTimeoutId);
	  item._idleTimeout = -1;
	};

	exports._unrefActive = exports.active = function(item) {
	  clearTimeout(item._idleTimeoutId);

	  var msecs = item._idleTimeout;
	  if (msecs >= 0) {
	    item._idleTimeoutId = setTimeout(function onTimeout() {
	      if (item._onTimeout)
	        item._onTimeout();
	    }, msecs);
	  }
	};

	// That's not how node.js implements it but the exposed api is the same.
	exports.setImmediate = typeof setImmediate === "function" ? setImmediate : function(fn) {
	  var id = nextImmediateId++;
	  var args = arguments.length < 2 ? false : slice.call(arguments, 1);

	  immediateIds[id] = true;

	  nextTick(function onNextTick() {
	    if (immediateIds[id]) {
	      // fn.call() is faster so we optimize for the common use-case
	      // @see http://jsperf.com/call-apply-segu
	      if (args) {
	        fn.apply(null, args);
	      } else {
	        fn.call(null);
	      }
	      // Prevent ids from leaking
	      exports.clearImmediate(id);
	    }
	  });

	  return id;
	};

	exports.clearImmediate = typeof clearImmediate === "function" ? clearImmediate : function(id) {
	  delete immediateIds[id];
	};
	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(9).setImmediate, __webpack_require__(9).clearImmediate))

/***/ },
/* 10 */
/***/ function(module, exports) {

	// shim for using process in browser
	var process = module.exports = {};

	// cached from whatever global is present so that test runners that stub it
	// don't break things.  But we need to wrap it in a try catch in case it is
	// wrapped in strict mode code which doesn't define any globals.  It's inside a
	// function because try/catches deoptimize in certain engines.

	var cachedSetTimeout;
	var cachedClearTimeout;

	function defaultSetTimout() {
	    throw new Error('setTimeout has not been defined');
	}
	function defaultClearTimeout () {
	    throw new Error('clearTimeout has not been defined');
	}
	(function () {
	    try {
	        if (typeof setTimeout === 'function') {
	            cachedSetTimeout = setTimeout;
	        } else {
	            cachedSetTimeout = defaultSetTimout;
	        }
	    } catch (e) {
	        cachedSetTimeout = defaultSetTimout;
	    }
	    try {
	        if (typeof clearTimeout === 'function') {
	            cachedClearTimeout = clearTimeout;
	        } else {
	            cachedClearTimeout = defaultClearTimeout;
	        }
	    } catch (e) {
	        cachedClearTimeout = defaultClearTimeout;
	    }
	} ())
	function runTimeout(fun) {
	    if (cachedSetTimeout === setTimeout) {
	        //normal enviroments in sane situations
	        return setTimeout(fun, 0);
	    }
	    // if setTimeout wasn't available but was latter defined
	    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
	        cachedSetTimeout = setTimeout;
	        return setTimeout(fun, 0);
	    }
	    try {
	        // when when somebody has screwed with setTimeout but no I.E. maddness
	        return cachedSetTimeout(fun, 0);
	    } catch(e){
	        try {
	            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
	            return cachedSetTimeout.call(null, fun, 0);
	        } catch(e){
	            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
	            return cachedSetTimeout.call(this, fun, 0);
	        }
	    }


	}
	function runClearTimeout(marker) {
	    if (cachedClearTimeout === clearTimeout) {
	        //normal enviroments in sane situations
	        return clearTimeout(marker);
	    }
	    // if clearTimeout wasn't available but was latter defined
	    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
	        cachedClearTimeout = clearTimeout;
	        return clearTimeout(marker);
	    }
	    try {
	        // when when somebody has screwed with setTimeout but no I.E. maddness
	        return cachedClearTimeout(marker);
	    } catch (e){
	        try {
	            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
	            return cachedClearTimeout.call(null, marker);
	        } catch (e){
	            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
	            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
	            return cachedClearTimeout.call(this, marker);
	        }
	    }



	}
	var queue = [];
	var draining = false;
	var currentQueue;
	var queueIndex = -1;

	function cleanUpNextTick() {
	    if (!draining || !currentQueue) {
	        return;
	    }
	    draining = false;
	    if (currentQueue.length) {
	        queue = currentQueue.concat(queue);
	    } else {
	        queueIndex = -1;
	    }
	    if (queue.length) {
	        drainQueue();
	    }
	}

	function drainQueue() {
	    if (draining) {
	        return;
	    }
	    var timeout = runTimeout(cleanUpNextTick);
	    draining = true;

	    var len = queue.length;
	    while(len) {
	        currentQueue = queue;
	        queue = [];
	        while (++queueIndex < len) {
	            if (currentQueue) {
	                currentQueue[queueIndex].run();
	            }
	        }
	        queueIndex = -1;
	        len = queue.length;
	    }
	    currentQueue = null;
	    draining = false;
	    runClearTimeout(timeout);
	}

	process.nextTick = function (fun) {
	    var args = new Array(arguments.length - 1);
	    if (arguments.length > 1) {
	        for (var i = 1; i < arguments.length; i++) {
	            args[i - 1] = arguments[i];
	        }
	    }
	    queue.push(new Item(fun, args));
	    if (queue.length === 1 && !draining) {
	        runTimeout(drainQueue);
	    }
	};

	// v8 likes predictible objects
	function Item(fun, array) {
	    this.fun = fun;
	    this.array = array;
	}
	Item.prototype.run = function () {
	    this.fun.apply(null, this.array);
	};
	process.title = 'browser';
	process.browser = true;
	process.env = {};
	process.argv = [];
	process.version = ''; // empty string to avoid regexp issues
	process.versions = {};

	function noop() {}

	process.on = noop;
	process.addListener = noop;
	process.once = noop;
	process.off = noop;
	process.removeListener = noop;
	process.removeAllListeners = noop;
	process.emit = noop;
	process.prependListener = noop;
	process.prependOnceListener = noop;

	process.listeners = function (name) { return [] }

	process.binding = function (name) {
	    throw new Error('process.binding is not supported');
	};

	process.cwd = function () { return '/' };
	process.chdir = function (dir) {
	    throw new Error('process.chdir is not supported');
	};
	process.umask = function() { return 0; };


/***/ },
/* 11 */
/***/ function(module, exports) {

	"use strict";
	function arrayMove(src, srcIndex, dst, dstIndex, len) {
	    for (var j = 0; j < len; ++j) {
	        dst[j + dstIndex] = src[j + srcIndex];
	        src[j + srcIndex] = void 0;
	    }
	}

	function Queue(capacity) {
	    this._capacity = capacity;
	    this._length = 0;
	    this._front = 0;
	}

	Queue.prototype._willBeOverCapacity = function (size) {
	    return this._capacity < size;
	};

	Queue.prototype._pushOne = function (arg) {
	    var length = this.length();
	    this._checkCapacity(length + 1);
	    var i = (this._front + length) & (this._capacity - 1);
	    this[i] = arg;
	    this._length = length + 1;
	};

	Queue.prototype.push = function (fn, receiver, arg) {
	    var length = this.length() + 3;
	    if (this._willBeOverCapacity(length)) {
	        this._pushOne(fn);
	        this._pushOne(receiver);
	        this._pushOne(arg);
	        return;
	    }
	    var j = this._front + length - 3;
	    this._checkCapacity(length);
	    var wrapMask = this._capacity - 1;
	    this[(j + 0) & wrapMask] = fn;
	    this[(j + 1) & wrapMask] = receiver;
	    this[(j + 2) & wrapMask] = arg;
	    this._length = length;
	};

	Queue.prototype.shift = function () {
	    var front = this._front,
	        ret = this[front];

	    this[front] = undefined;
	    this._front = (front + 1) & (this._capacity - 1);
	    this._length--;
	    return ret;
	};

	Queue.prototype.length = function () {
	    return this._length;
	};

	Queue.prototype._checkCapacity = function (size) {
	    if (this._capacity < size) {
	        this._resizeTo(this._capacity << 1);
	    }
	};

	Queue.prototype._resizeTo = function (capacity) {
	    var oldCapacity = this._capacity;
	    this._capacity = capacity;
	    var front = this._front;
	    var length = this._length;
	    var moveItemsCount = (front + length) & (oldCapacity - 1);
	    arrayMove(this, 0, this, oldCapacity, moveItemsCount);
	};

	module.exports = Queue;


/***/ },
/* 12 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var es5 = __webpack_require__(6);
	var Objectfreeze = es5.freeze;
	var util = __webpack_require__(5);
	var inherits = util.inherits;
	var notEnumerableProp = util.notEnumerableProp;

	function subError(nameProperty, defaultMessage) {
	    function SubError(message) {
	        if (!(this instanceof SubError)) return new SubError(message);
	        notEnumerableProp(this, "message",
	            typeof message === "string" ? message : defaultMessage);
	        notEnumerableProp(this, "name", nameProperty);
	        if (Error.captureStackTrace) {
	            Error.captureStackTrace(this, this.constructor);
	        } else {
	            Error.call(this);
	        }
	    }
	    inherits(SubError, Error);
	    return SubError;
	}

	var _TypeError, _RangeError;
	var Warning = subError("Warning", "warning");
	var CancellationError = subError("CancellationError", "cancellation error");
	var TimeoutError = subError("TimeoutError", "timeout error");
	var AggregateError = subError("AggregateError", "aggregate error");
	try {
	    _TypeError = TypeError;
	    _RangeError = RangeError;
	} catch(e) {
	    _TypeError = subError("TypeError", "type error");
	    _RangeError = subError("RangeError", "range error");
	}

	var methods = ("join pop push shift unshift slice filter forEach some " +
	    "every map indexOf lastIndexOf reduce reduceRight sort reverse").split(" ");

	for (var i = 0; i < methods.length; ++i) {
	    if (typeof Array.prototype[methods[i]] === "function") {
	        AggregateError.prototype[methods[i]] = Array.prototype[methods[i]];
	    }
	}

	es5.defineProperty(AggregateError.prototype, "length", {
	    value: 0,
	    configurable: false,
	    writable: true,
	    enumerable: true
	});
	AggregateError.prototype["isOperational"] = true;
	var level = 0;
	AggregateError.prototype.toString = function() {
	    var indent = Array(level * 4 + 1).join(" ");
	    var ret = "\n" + indent + "AggregateError of:" + "\n";
	    level++;
	    indent = Array(level * 4 + 1).join(" ");
	    for (var i = 0; i < this.length; ++i) {
	        var str = this[i] === this ? "[Circular AggregateError]" : this[i] + "";
	        var lines = str.split("\n");
	        for (var j = 0; j < lines.length; ++j) {
	            lines[j] = indent + lines[j];
	        }
	        str = lines.join("\n");
	        ret += str + "\n";
	    }
	    level--;
	    return ret;
	};

	function OperationalError(message) {
	    if (!(this instanceof OperationalError))
	        return new OperationalError(message);
	    notEnumerableProp(this, "name", "OperationalError");
	    notEnumerableProp(this, "message", message);
	    this.cause = message;
	    this["isOperational"] = true;

	    if (message instanceof Error) {
	        notEnumerableProp(this, "message", message.message);
	        notEnumerableProp(this, "stack", message.stack);
	    } else if (Error.captureStackTrace) {
	        Error.captureStackTrace(this, this.constructor);
	    }

	}
	inherits(OperationalError, Error);

	var errorTypes = Error["__BluebirdErrorTypes__"];
	if (!errorTypes) {
	    errorTypes = Objectfreeze({
	        CancellationError: CancellationError,
	        TimeoutError: TimeoutError,
	        OperationalError: OperationalError,
	        RejectionError: OperationalError,
	        AggregateError: AggregateError
	    });
	    es5.defineProperty(Error, "__BluebirdErrorTypes__", {
	        value: errorTypes,
	        writable: false,
	        enumerable: false,
	        configurable: false
	    });
	}

	module.exports = {
	    Error: Error,
	    TypeError: _TypeError,
	    RangeError: _RangeError,
	    CancellationError: errorTypes.CancellationError,
	    OperationalError: errorTypes.OperationalError,
	    TimeoutError: errorTypes.TimeoutError,
	    AggregateError: errorTypes.AggregateError,
	    Warning: Warning
	};


/***/ },
/* 13 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	module.exports = function(Promise, INTERNAL) {
	var util = __webpack_require__(5);
	var errorObj = util.errorObj;
	var isObject = util.isObject;

	function tryConvertToPromise(obj, context) {
	    if (isObject(obj)) {
	        if (obj instanceof Promise) return obj;
	        var then = getThen(obj);
	        if (then === errorObj) {
	            if (context) context._pushContext();
	            var ret = Promise.reject(then.e);
	            if (context) context._popContext();
	            return ret;
	        } else if (typeof then === "function") {
	            if (isAnyBluebirdPromise(obj)) {
	                var ret = new Promise(INTERNAL);
	                obj._then(
	                    ret._fulfill,
	                    ret._reject,
	                    undefined,
	                    ret,
	                    null
	                );
	                return ret;
	            }
	            return doThenable(obj, then, context);
	        }
	    }
	    return obj;
	}

	function doGetThen(obj) {
	    return obj.then;
	}

	function getThen(obj) {
	    try {
	        return doGetThen(obj);
	    } catch (e) {
	        errorObj.e = e;
	        return errorObj;
	    }
	}

	var hasProp = {}.hasOwnProperty;
	function isAnyBluebirdPromise(obj) {
	    try {
	        return hasProp.call(obj, "_promise0");
	    } catch (e) {
	        return false;
	    }
	}

	function doThenable(x, then, context) {
	    var promise = new Promise(INTERNAL);
	    var ret = promise;
	    if (context) context._pushContext();
	    promise._captureStackTrace();
	    if (context) context._popContext();
	    var synchronous = true;
	    var result = util.tryCatch(then).call(x, resolve, reject);
	    synchronous = false;

	    if (promise && result === errorObj) {
	        promise._rejectCallback(result.e, true, true);
	        promise = null;
	    }

	    function resolve(value) {
	        if (!promise) return;
	        promise._resolveCallback(value);
	        promise = null;
	    }

	    function reject(reason) {
	        if (!promise) return;
	        promise._rejectCallback(reason, synchronous, true);
	        promise = null;
	    }
	    return ret;
	}

	return tryConvertToPromise;
	};


/***/ },
/* 14 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	module.exports = function(Promise, INTERNAL, tryConvertToPromise,
	    apiRejection, Proxyable) {
	var util = __webpack_require__(5);
	var isArray = util.isArray;

	function toResolutionValue(val) {
	    switch(val) {
	    case -2: return [];
	    case -3: return {};
	    case -6: return new Map();
	    }
	}

	function PromiseArray(values) {
	    var promise = this._promise = new Promise(INTERNAL);
	    if (values instanceof Promise) {
	        promise._propagateFrom(values, 3);
	    }
	    promise._setOnCancel(this);
	    this._values = values;
	    this._length = 0;
	    this._totalResolved = 0;
	    this._init(undefined, -2);
	}
	util.inherits(PromiseArray, Proxyable);

	PromiseArray.prototype.length = function () {
	    return this._length;
	};

	PromiseArray.prototype.promise = function () {
	    return this._promise;
	};

	PromiseArray.prototype._init = function init(_, resolveValueIfEmpty) {
	    var values = tryConvertToPromise(this._values, this._promise);
	    if (values instanceof Promise) {
	        values = values._target();
	        var bitField = values._bitField;
	        ;
	        this._values = values;

	        if (((bitField & 50397184) === 0)) {
	            this._promise._setAsyncGuaranteed();
	            return values._then(
	                init,
	                this._reject,
	                undefined,
	                this,
	                resolveValueIfEmpty
	           );
	        } else if (((bitField & 33554432) !== 0)) {
	            values = values._value();
	        } else if (((bitField & 16777216) !== 0)) {
	            return this._reject(values._reason());
	        } else {
	            return this._cancel();
	        }
	    }
	    values = util.asArray(values);
	    if (values === null) {
	        var err = apiRejection(
	            "expecting an array or an iterable object but got " + util.classString(values)).reason();
	        this._promise._rejectCallback(err, false);
	        return;
	    }

	    if (values.length === 0) {
	        if (resolveValueIfEmpty === -5) {
	            this._resolveEmptyArray();
	        }
	        else {
	            this._resolve(toResolutionValue(resolveValueIfEmpty));
	        }
	        return;
	    }
	    this._iterate(values);
	};

	PromiseArray.prototype._iterate = function(values) {
	    var len = this.getActualLength(values.length);
	    this._length = len;
	    this._values = this.shouldCopyValues() ? new Array(len) : this._values;
	    var result = this._promise;
	    var isResolved = false;
	    var bitField = null;
	    for (var i = 0; i < len; ++i) {
	        var maybePromise = tryConvertToPromise(values[i], result);

	        if (maybePromise instanceof Promise) {
	            maybePromise = maybePromise._target();
	            bitField = maybePromise._bitField;
	        } else {
	            bitField = null;
	        }

	        if (isResolved) {
	            if (bitField !== null) {
	                maybePromise.suppressUnhandledRejections();
	            }
	        } else if (bitField !== null) {
	            if (((bitField & 50397184) === 0)) {
	                maybePromise._proxy(this, i);
	                this._values[i] = maybePromise;
	            } else if (((bitField & 33554432) !== 0)) {
	                isResolved = this._promiseFulfilled(maybePromise._value(), i);
	            } else if (((bitField & 16777216) !== 0)) {
	                isResolved = this._promiseRejected(maybePromise._reason(), i);
	            } else {
	                isResolved = this._promiseCancelled(i);
	            }
	        } else {
	            isResolved = this._promiseFulfilled(maybePromise, i);
	        }
	    }
	    if (!isResolved) result._setAsyncGuaranteed();
	};

	PromiseArray.prototype._isResolved = function () {
	    return this._values === null;
	};

	PromiseArray.prototype._resolve = function (value) {
	    this._values = null;
	    this._promise._fulfill(value);
	};

	PromiseArray.prototype._cancel = function() {
	    if (this._isResolved() || !this._promise._isCancellable()) return;
	    this._values = null;
	    this._promise._cancel();
	};

	PromiseArray.prototype._reject = function (reason) {
	    this._values = null;
	    this._promise._rejectCallback(reason, false);
	};

	PromiseArray.prototype._promiseFulfilled = function (value, index) {
	    this._values[index] = value;
	    var totalResolved = ++this._totalResolved;
	    if (totalResolved >= this._length) {
	        this._resolve(this._values);
	        return true;
	    }
	    return false;
	};

	PromiseArray.prototype._promiseCancelled = function() {
	    this._cancel();
	    return true;
	};

	PromiseArray.prototype._promiseRejected = function (reason) {
	    this._totalResolved++;
	    this._reject(reason);
	    return true;
	};

	PromiseArray.prototype._resultCancelled = function() {
	    if (this._isResolved()) return;
	    var values = this._values;
	    this._cancel();
	    if (values instanceof Promise) {
	        values.cancel();
	    } else {
	        for (var i = 0; i < values.length; ++i) {
	            if (values[i] instanceof Promise) {
	                values[i].cancel();
	            }
	        }
	    }
	};

	PromiseArray.prototype.shouldCopyValues = function () {
	    return true;
	};

	PromiseArray.prototype.getActualLength = function (len) {
	    return len;
	};

	return PromiseArray;
	};


/***/ },
/* 15 */
/***/ function(module, exports) {

	"use strict";
	module.exports = function(Promise) {
	var longStackTraces = false;
	var contextStack = [];

	Promise.prototype._promiseCreated = function() {};
	Promise.prototype._pushContext = function() {};
	Promise.prototype._popContext = function() {return null;};
	Promise._peekContext = Promise.prototype._peekContext = function() {};

	function Context() {
	    this._trace = new Context.CapturedTrace(peekContext());
	}
	Context.prototype._pushContext = function () {
	    if (this._trace !== undefined) {
	        this._trace._promiseCreated = null;
	        contextStack.push(this._trace);
	    }
	};

	Context.prototype._popContext = function () {
	    if (this._trace !== undefined) {
	        var trace = contextStack.pop();
	        var ret = trace._promiseCreated;
	        trace._promiseCreated = null;
	        return ret;
	    }
	    return null;
	};

	function createContext() {
	    if (longStackTraces) return new Context();
	}

	function peekContext() {
	    var lastIndex = contextStack.length - 1;
	    if (lastIndex >= 0) {
	        return contextStack[lastIndex];
	    }
	    return undefined;
	}
	Context.CapturedTrace = null;
	Context.create = createContext;
	Context.deactivateLongStackTraces = function() {};
	Context.activateLongStackTraces = function() {
	    var Promise_pushContext = Promise.prototype._pushContext;
	    var Promise_popContext = Promise.prototype._popContext;
	    var Promise_PeekContext = Promise._peekContext;
	    var Promise_peekContext = Promise.prototype._peekContext;
	    var Promise_promiseCreated = Promise.prototype._promiseCreated;
	    Context.deactivateLongStackTraces = function() {
	        Promise.prototype._pushContext = Promise_pushContext;
	        Promise.prototype._popContext = Promise_popContext;
	        Promise._peekContext = Promise_PeekContext;
	        Promise.prototype._peekContext = Promise_peekContext;
	        Promise.prototype._promiseCreated = Promise_promiseCreated;
	        longStackTraces = false;
	    };
	    longStackTraces = true;
	    Promise.prototype._pushContext = Context.prototype._pushContext;
	    Promise.prototype._popContext = Context.prototype._popContext;
	    Promise._peekContext = Promise.prototype._peekContext = peekContext;
	    Promise.prototype._promiseCreated = function() {
	        var ctx = this._peekContext();
	        if (ctx && ctx._promiseCreated == null) ctx._promiseCreated = this;
	    };
	};
	return Context;
	};


/***/ },
/* 16 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(process) {"use strict";
	module.exports = function(Promise, Context) {
	var getDomain = Promise._getDomain;
	var async = Promise._async;
	var Warning = __webpack_require__(12).Warning;
	var util = __webpack_require__(5);
	var canAttachTrace = util.canAttachTrace;
	var unhandledRejectionHandled;
	var possiblyUnhandledRejection;
	var bluebirdFramePattern =
	    /[\\\/]bluebird[\\\/]js[\\\/](release|debug|instrumented)/;
	var nodeFramePattern = /\((?:timers\.js):\d+:\d+\)/;
	var parseLinePattern = /[\/<\(](.+?):(\d+):(\d+)\)?\s*$/;
	var stackFramePattern = null;
	var formatStack = null;
	var indentStackFrames = false;
	var printWarning;
	var debugging = !!(util.env("BLUEBIRD_DEBUG") != 0 &&
	                        (false ||
	                         util.env("BLUEBIRD_DEBUG") ||
	                         util.env("NODE_ENV") === "development"));

	var warnings = !!(util.env("BLUEBIRD_WARNINGS") != 0 &&
	    (debugging || util.env("BLUEBIRD_WARNINGS")));

	var longStackTraces = !!(util.env("BLUEBIRD_LONG_STACK_TRACES") != 0 &&
	    (debugging || util.env("BLUEBIRD_LONG_STACK_TRACES")));

	var wForgottenReturn = util.env("BLUEBIRD_W_FORGOTTEN_RETURN") != 0 &&
	    (warnings || !!util.env("BLUEBIRD_W_FORGOTTEN_RETURN"));

	Promise.prototype.suppressUnhandledRejections = function() {
	    var target = this._target();
	    target._bitField = ((target._bitField & (~1048576)) |
	                      524288);
	};

	Promise.prototype._ensurePossibleRejectionHandled = function () {
	    if ((this._bitField & 524288) !== 0) return;
	    this._setRejectionIsUnhandled();
	    var self = this;
	    setTimeout(function() {
	        self._notifyUnhandledRejection();
	    }, 1);
	};

	Promise.prototype._notifyUnhandledRejectionIsHandled = function () {
	    fireRejectionEvent("rejectionHandled",
	                                  unhandledRejectionHandled, undefined, this);
	};

	Promise.prototype._setReturnedNonUndefined = function() {
	    this._bitField = this._bitField | 268435456;
	};

	Promise.prototype._returnedNonUndefined = function() {
	    return (this._bitField & 268435456) !== 0;
	};

	Promise.prototype._notifyUnhandledRejection = function () {
	    if (this._isRejectionUnhandled()) {
	        var reason = this._settledValue();
	        this._setUnhandledRejectionIsNotified();
	        fireRejectionEvent("unhandledRejection",
	                                      possiblyUnhandledRejection, reason, this);
	    }
	};

	Promise.prototype._setUnhandledRejectionIsNotified = function () {
	    this._bitField = this._bitField | 262144;
	};

	Promise.prototype._unsetUnhandledRejectionIsNotified = function () {
	    this._bitField = this._bitField & (~262144);
	};

	Promise.prototype._isUnhandledRejectionNotified = function () {
	    return (this._bitField & 262144) > 0;
	};

	Promise.prototype._setRejectionIsUnhandled = function () {
	    this._bitField = this._bitField | 1048576;
	};

	Promise.prototype._unsetRejectionIsUnhandled = function () {
	    this._bitField = this._bitField & (~1048576);
	    if (this._isUnhandledRejectionNotified()) {
	        this._unsetUnhandledRejectionIsNotified();
	        this._notifyUnhandledRejectionIsHandled();
	    }
	};

	Promise.prototype._isRejectionUnhandled = function () {
	    return (this._bitField & 1048576) > 0;
	};

	Promise.prototype._warn = function(message, shouldUseOwnTrace, promise) {
	    return warn(message, shouldUseOwnTrace, promise || this);
	};

	Promise.onPossiblyUnhandledRejection = function (fn) {
	    var domain = getDomain();
	    possiblyUnhandledRejection =
	        typeof fn === "function" ? (domain === null ?
	                                            fn : util.domainBind(domain, fn))
	                                 : undefined;
	};

	Promise.onUnhandledRejectionHandled = function (fn) {
	    var domain = getDomain();
	    unhandledRejectionHandled =
	        typeof fn === "function" ? (domain === null ?
	                                            fn : util.domainBind(domain, fn))
	                                 : undefined;
	};

	var disableLongStackTraces = function() {};
	Promise.longStackTraces = function () {
	    if (async.haveItemsQueued() && !config.longStackTraces) {
	        throw new Error("cannot enable long stack traces after promises have been created\u000a\u000a    See http://goo.gl/MqrFmX\u000a");
	    }
	    if (!config.longStackTraces && longStackTracesIsSupported()) {
	        var Promise_captureStackTrace = Promise.prototype._captureStackTrace;
	        var Promise_attachExtraTrace = Promise.prototype._attachExtraTrace;
	        config.longStackTraces = true;
	        disableLongStackTraces = function() {
	            if (async.haveItemsQueued() && !config.longStackTraces) {
	                throw new Error("cannot enable long stack traces after promises have been created\u000a\u000a    See http://goo.gl/MqrFmX\u000a");
	            }
	            Promise.prototype._captureStackTrace = Promise_captureStackTrace;
	            Promise.prototype._attachExtraTrace = Promise_attachExtraTrace;
	            Context.deactivateLongStackTraces();
	            async.enableTrampoline();
	            config.longStackTraces = false;
	        };
	        Promise.prototype._captureStackTrace = longStackTracesCaptureStackTrace;
	        Promise.prototype._attachExtraTrace = longStackTracesAttachExtraTrace;
	        Context.activateLongStackTraces();
	        async.disableTrampolineIfNecessary();
	    }
	};

	Promise.hasLongStackTraces = function () {
	    return config.longStackTraces && longStackTracesIsSupported();
	};

	var fireDomEvent = (function() {
	    try {
	        if (typeof CustomEvent === "function") {
	            var event = new CustomEvent("CustomEvent");
	            util.global.dispatchEvent(event);
	            return function(name, event) {
	                var domEvent = new CustomEvent(name.toLowerCase(), {
	                    detail: event,
	                    cancelable: true
	                });
	                return !util.global.dispatchEvent(domEvent);
	            };
	        } else if (typeof Event === "function") {
	            var event = new Event("CustomEvent");
	            util.global.dispatchEvent(event);
	            return function(name, event) {
	                var domEvent = new Event(name.toLowerCase(), {
	                    cancelable: true
	                });
	                domEvent.detail = event;
	                return !util.global.dispatchEvent(domEvent);
	            };
	        } else {
	            var event = document.createEvent("CustomEvent");
	            event.initCustomEvent("testingtheevent", false, true, {});
	            util.global.dispatchEvent(event);
	            return function(name, event) {
	                var domEvent = document.createEvent("CustomEvent");
	                domEvent.initCustomEvent(name.toLowerCase(), false, true,
	                    event);
	                return !util.global.dispatchEvent(domEvent);
	            };
	        }
	    } catch (e) {}
	    return function() {
	        return false;
	    };
	})();

	var fireGlobalEvent = (function() {
	    if (util.isNode) {
	        return function() {
	            return process.emit.apply(process, arguments);
	        };
	    } else {
	        if (!util.global) {
	            return function() {
	                return false;
	            };
	        }
	        return function(name) {
	            var methodName = "on" + name.toLowerCase();
	            var method = util.global[methodName];
	            if (!method) return false;
	            method.apply(util.global, [].slice.call(arguments, 1));
	            return true;
	        };
	    }
	})();

	function generatePromiseLifecycleEventObject(name, promise) {
	    return {promise: promise};
	}

	var eventToObjectGenerator = {
	    promiseCreated: generatePromiseLifecycleEventObject,
	    promiseFulfilled: generatePromiseLifecycleEventObject,
	    promiseRejected: generatePromiseLifecycleEventObject,
	    promiseResolved: generatePromiseLifecycleEventObject,
	    promiseCancelled: generatePromiseLifecycleEventObject,
	    promiseChained: function(name, promise, child) {
	        return {promise: promise, child: child};
	    },
	    warning: function(name, warning) {
	        return {warning: warning};
	    },
	    unhandledRejection: function (name, reason, promise) {
	        return {reason: reason, promise: promise};
	    },
	    rejectionHandled: generatePromiseLifecycleEventObject
	};

	var activeFireEvent = function (name) {
	    var globalEventFired = false;
	    try {
	        globalEventFired = fireGlobalEvent.apply(null, arguments);
	    } catch (e) {
	        async.throwLater(e);
	        globalEventFired = true;
	    }

	    var domEventFired = false;
	    try {
	        domEventFired = fireDomEvent(name,
	                    eventToObjectGenerator[name].apply(null, arguments));
	    } catch (e) {
	        async.throwLater(e);
	        domEventFired = true;
	    }

	    return domEventFired || globalEventFired;
	};

	Promise.config = function(opts) {
	    opts = Object(opts);
	    if ("longStackTraces" in opts) {
	        if (opts.longStackTraces) {
	            Promise.longStackTraces();
	        } else if (!opts.longStackTraces && Promise.hasLongStackTraces()) {
	            disableLongStackTraces();
	        }
	    }
	    if ("warnings" in opts) {
	        var warningsOption = opts.warnings;
	        config.warnings = !!warningsOption;
	        wForgottenReturn = config.warnings;

	        if (util.isObject(warningsOption)) {
	            if ("wForgottenReturn" in warningsOption) {
	                wForgottenReturn = !!warningsOption.wForgottenReturn;
	            }
	        }
	    }
	    if ("cancellation" in opts && opts.cancellation && !config.cancellation) {
	        if (async.haveItemsQueued()) {
	            throw new Error(
	                "cannot enable cancellation after promises are in use");
	        }
	        Promise.prototype._clearCancellationData =
	            cancellationClearCancellationData;
	        Promise.prototype._propagateFrom = cancellationPropagateFrom;
	        Promise.prototype._onCancel = cancellationOnCancel;
	        Promise.prototype._setOnCancel = cancellationSetOnCancel;
	        Promise.prototype._attachCancellationCallback =
	            cancellationAttachCancellationCallback;
	        Promise.prototype._execute = cancellationExecute;
	        propagateFromFunction = cancellationPropagateFrom;
	        config.cancellation = true;
	    }
	    if ("monitoring" in opts) {
	        if (opts.monitoring && !config.monitoring) {
	            config.monitoring = true;
	            Promise.prototype._fireEvent = activeFireEvent;
	        } else if (!opts.monitoring && config.monitoring) {
	            config.monitoring = false;
	            Promise.prototype._fireEvent = defaultFireEvent;
	        }
	    }
	    return Promise;
	};

	function defaultFireEvent() { return false; }

	Promise.prototype._fireEvent = defaultFireEvent;
	Promise.prototype._execute = function(executor, resolve, reject) {
	    try {
	        executor(resolve, reject);
	    } catch (e) {
	        return e;
	    }
	};
	Promise.prototype._onCancel = function () {};
	Promise.prototype._setOnCancel = function (handler) { ; };
	Promise.prototype._attachCancellationCallback = function(onCancel) {
	    ;
	};
	Promise.prototype._captureStackTrace = function () {};
	Promise.prototype._attachExtraTrace = function () {};
	Promise.prototype._clearCancellationData = function() {};
	Promise.prototype._propagateFrom = function (parent, flags) {
	    ;
	    ;
	};

	function cancellationExecute(executor, resolve, reject) {
	    var promise = this;
	    try {
	        executor(resolve, reject, function(onCancel) {
	            if (typeof onCancel !== "function") {
	                throw new TypeError("onCancel must be a function, got: " +
	                                    util.toString(onCancel));
	            }
	            promise._attachCancellationCallback(onCancel);
	        });
	    } catch (e) {
	        return e;
	    }
	}

	function cancellationAttachCancellationCallback(onCancel) {
	    if (!this._isCancellable()) return this;

	    var previousOnCancel = this._onCancel();
	    if (previousOnCancel !== undefined) {
	        if (util.isArray(previousOnCancel)) {
	            previousOnCancel.push(onCancel);
	        } else {
	            this._setOnCancel([previousOnCancel, onCancel]);
	        }
	    } else {
	        this._setOnCancel(onCancel);
	    }
	}

	function cancellationOnCancel() {
	    return this._onCancelField;
	}

	function cancellationSetOnCancel(onCancel) {
	    this._onCancelField = onCancel;
	}

	function cancellationClearCancellationData() {
	    this._cancellationParent = undefined;
	    this._onCancelField = undefined;
	}

	function cancellationPropagateFrom(parent, flags) {
	    if ((flags & 1) !== 0) {
	        this._cancellationParent = parent;
	        var branchesRemainingToCancel = parent._branchesRemainingToCancel;
	        if (branchesRemainingToCancel === undefined) {
	            branchesRemainingToCancel = 0;
	        }
	        parent._branchesRemainingToCancel = branchesRemainingToCancel + 1;
	    }
	    if ((flags & 2) !== 0 && parent._isBound()) {
	        this._setBoundTo(parent._boundTo);
	    }
	}

	function bindingPropagateFrom(parent, flags) {
	    if ((flags & 2) !== 0 && parent._isBound()) {
	        this._setBoundTo(parent._boundTo);
	    }
	}
	var propagateFromFunction = bindingPropagateFrom;

	function boundValueFunction() {
	    var ret = this._boundTo;
	    if (ret !== undefined) {
	        if (ret instanceof Promise) {
	            if (ret.isFulfilled()) {
	                return ret.value();
	            } else {
	                return undefined;
	            }
	        }
	    }
	    return ret;
	}

	function longStackTracesCaptureStackTrace() {
	    this._trace = new CapturedTrace(this._peekContext());
	}

	function longStackTracesAttachExtraTrace(error, ignoreSelf) {
	    if (canAttachTrace(error)) {
	        var trace = this._trace;
	        if (trace !== undefined) {
	            if (ignoreSelf) trace = trace._parent;
	        }
	        if (trace !== undefined) {
	            trace.attachExtraTrace(error);
	        } else if (!error.__stackCleaned__) {
	            var parsed = parseStackAndMessage(error);
	            util.notEnumerableProp(error, "stack",
	                parsed.message + "\n" + parsed.stack.join("\n"));
	            util.notEnumerableProp(error, "__stackCleaned__", true);
	        }
	    }
	}

	function checkForgottenReturns(returnValue, promiseCreated, name, promise,
	                               parent) {
	    if (returnValue === undefined && promiseCreated !== null &&
	        wForgottenReturn) {
	        if (parent !== undefined && parent._returnedNonUndefined()) return;
	        if ((promise._bitField & 65535) === 0) return;

	        if (name) name = name + " ";
	        var handlerLine = "";
	        var creatorLine = "";
	        if (promiseCreated._trace) {
	            var traceLines = promiseCreated._trace.stack.split("\n");
	            var stack = cleanStack(traceLines);
	            for (var i = stack.length - 1; i >= 0; --i) {
	                var line = stack[i];
	                if (!nodeFramePattern.test(line)) {
	                    var lineMatches = line.match(parseLinePattern);
	                    if (lineMatches) {
	                        handlerLine  = "at " + lineMatches[1] +
	                            ":" + lineMatches[2] + ":" + lineMatches[3] + " ";
	                    }
	                    break;
	                }
	            }

	            if (stack.length > 0) {
	                var firstUserLine = stack[0];
	                for (var i = 0; i < traceLines.length; ++i) {

	                    if (traceLines[i] === firstUserLine) {
	                        if (i > 0) {
	                            creatorLine = "\n" + traceLines[i - 1];
	                        }
	                        break;
	                    }
	                }

	            }
	        }
	        var msg = "a promise was created in a " + name +
	            "handler " + handlerLine + "but was not returned from it, " +
	            "see http://goo.gl/rRqMUw" +
	            creatorLine;
	        promise._warn(msg, true, promiseCreated);
	    }
	}

	function deprecated(name, replacement) {
	    var message = name +
	        " is deprecated and will be removed in a future version.";
	    if (replacement) message += " Use " + replacement + " instead.";
	    return warn(message);
	}

	function warn(message, shouldUseOwnTrace, promise) {
	    if (!config.warnings) return;
	    var warning = new Warning(message);
	    var ctx;
	    if (shouldUseOwnTrace) {
	        promise._attachExtraTrace(warning);
	    } else if (config.longStackTraces && (ctx = Promise._peekContext())) {
	        ctx.attachExtraTrace(warning);
	    } else {
	        var parsed = parseStackAndMessage(warning);
	        warning.stack = parsed.message + "\n" + parsed.stack.join("\n");
	    }

	    if (!activeFireEvent("warning", warning)) {
	        formatAndLogError(warning, "", true);
	    }
	}

	function reconstructStack(message, stacks) {
	    for (var i = 0; i < stacks.length - 1; ++i) {
	        stacks[i].push("From previous event:");
	        stacks[i] = stacks[i].join("\n");
	    }
	    if (i < stacks.length) {
	        stacks[i] = stacks[i].join("\n");
	    }
	    return message + "\n" + stacks.join("\n");
	}

	function removeDuplicateOrEmptyJumps(stacks) {
	    for (var i = 0; i < stacks.length; ++i) {
	        if (stacks[i].length === 0 ||
	            ((i + 1 < stacks.length) && stacks[i][0] === stacks[i+1][0])) {
	            stacks.splice(i, 1);
	            i--;
	        }
	    }
	}

	function removeCommonRoots(stacks) {
	    var current = stacks[0];
	    for (var i = 1; i < stacks.length; ++i) {
	        var prev = stacks[i];
	        var currentLastIndex = current.length - 1;
	        var currentLastLine = current[currentLastIndex];
	        var commonRootMeetPoint = -1;

	        for (var j = prev.length - 1; j >= 0; --j) {
	            if (prev[j] === currentLastLine) {
	                commonRootMeetPoint = j;
	                break;
	            }
	        }

	        for (var j = commonRootMeetPoint; j >= 0; --j) {
	            var line = prev[j];
	            if (current[currentLastIndex] === line) {
	                current.pop();
	                currentLastIndex--;
	            } else {
	                break;
	            }
	        }
	        current = prev;
	    }
	}

	function cleanStack(stack) {
	    var ret = [];
	    for (var i = 0; i < stack.length; ++i) {
	        var line = stack[i];
	        var isTraceLine = "    (No stack trace)" === line ||
	            stackFramePattern.test(line);
	        var isInternalFrame = isTraceLine && shouldIgnore(line);
	        if (isTraceLine && !isInternalFrame) {
	            if (indentStackFrames && line.charAt(0) !== " ") {
	                line = "    " + line;
	            }
	            ret.push(line);
	        }
	    }
	    return ret;
	}

	function stackFramesAsArray(error) {
	    var stack = error.stack.replace(/\s+$/g, "").split("\n");
	    for (var i = 0; i < stack.length; ++i) {
	        var line = stack[i];
	        if ("    (No stack trace)" === line || stackFramePattern.test(line)) {
	            break;
	        }
	    }
	    if (i > 0 && error.name != "SyntaxError") {
	        stack = stack.slice(i);
	    }
	    return stack;
	}

	function parseStackAndMessage(error) {
	    var stack = error.stack;
	    var message = error.toString();
	    stack = typeof stack === "string" && stack.length > 0
	                ? stackFramesAsArray(error) : ["    (No stack trace)"];
	    return {
	        message: message,
	        stack: error.name == "SyntaxError" ? stack : cleanStack(stack)
	    };
	}

	function formatAndLogError(error, title, isSoft) {
	    if (typeof console !== "undefined") {
	        var message;
	        if (util.isObject(error)) {
	            var stack = error.stack;
	            message = title + formatStack(stack, error);
	        } else {
	            message = title + String(error);
	        }
	        if (typeof printWarning === "function") {
	            printWarning(message, isSoft);
	        } else if (typeof console.log === "function" ||
	            typeof console.log === "object") {
	            console.log(message);
	        }
	    }
	}

	function fireRejectionEvent(name, localHandler, reason, promise) {
	    var localEventFired = false;
	    try {
	        if (typeof localHandler === "function") {
	            localEventFired = true;
	            if (name === "rejectionHandled") {
	                localHandler(promise);
	            } else {
	                localHandler(reason, promise);
	            }
	        }
	    } catch (e) {
	        async.throwLater(e);
	    }

	    if (name === "unhandledRejection") {
	        if (!activeFireEvent(name, reason, promise) && !localEventFired) {
	            formatAndLogError(reason, "Unhandled rejection ");
	        }
	    } else {
	        activeFireEvent(name, promise);
	    }
	}

	function formatNonError(obj) {
	    var str;
	    if (typeof obj === "function") {
	        str = "[function " +
	            (obj.name || "anonymous") +
	            "]";
	    } else {
	        str = obj && typeof obj.toString === "function"
	            ? obj.toString() : util.toString(obj);
	        var ruselessToString = /\[object [a-zA-Z0-9$_]+\]/;
	        if (ruselessToString.test(str)) {
	            try {
	                var newStr = JSON.stringify(obj);
	                str = newStr;
	            }
	            catch(e) {

	            }
	        }
	        if (str.length === 0) {
	            str = "(empty array)";
	        }
	    }
	    return ("(<" + snip(str) + ">, no stack trace)");
	}

	function snip(str) {
	    var maxChars = 41;
	    if (str.length < maxChars) {
	        return str;
	    }
	    return str.substr(0, maxChars - 3) + "...";
	}

	function longStackTracesIsSupported() {
	    return typeof captureStackTrace === "function";
	}

	var shouldIgnore = function() { return false; };
	var parseLineInfoRegex = /[\/<\(]([^:\/]+):(\d+):(?:\d+)\)?\s*$/;
	function parseLineInfo(line) {
	    var matches = line.match(parseLineInfoRegex);
	    if (matches) {
	        return {
	            fileName: matches[1],
	            line: parseInt(matches[2], 10)
	        };
	    }
	}

	function setBounds(firstLineError, lastLineError) {
	    if (!longStackTracesIsSupported()) return;
	    var firstStackLines = firstLineError.stack.split("\n");
	    var lastStackLines = lastLineError.stack.split("\n");
	    var firstIndex = -1;
	    var lastIndex = -1;
	    var firstFileName;
	    var lastFileName;
	    for (var i = 0; i < firstStackLines.length; ++i) {
	        var result = parseLineInfo(firstStackLines[i]);
	        if (result) {
	            firstFileName = result.fileName;
	            firstIndex = result.line;
	            break;
	        }
	    }
	    for (var i = 0; i < lastStackLines.length; ++i) {
	        var result = parseLineInfo(lastStackLines[i]);
	        if (result) {
	            lastFileName = result.fileName;
	            lastIndex = result.line;
	            break;
	        }
	    }
	    if (firstIndex < 0 || lastIndex < 0 || !firstFileName || !lastFileName ||
	        firstFileName !== lastFileName || firstIndex >= lastIndex) {
	        return;
	    }

	    shouldIgnore = function(line) {
	        if (bluebirdFramePattern.test(line)) return true;
	        var info = parseLineInfo(line);
	        if (info) {
	            if (info.fileName === firstFileName &&
	                (firstIndex <= info.line && info.line <= lastIndex)) {
	                return true;
	            }
	        }
	        return false;
	    };
	}

	function CapturedTrace(parent) {
	    this._parent = parent;
	    this._promisesCreated = 0;
	    var length = this._length = 1 + (parent === undefined ? 0 : parent._length);
	    captureStackTrace(this, CapturedTrace);
	    if (length > 32) this.uncycle();
	}
	util.inherits(CapturedTrace, Error);
	Context.CapturedTrace = CapturedTrace;

	CapturedTrace.prototype.uncycle = function() {
	    var length = this._length;
	    if (length < 2) return;
	    var nodes = [];
	    var stackToIndex = {};

	    for (var i = 0, node = this; node !== undefined; ++i) {
	        nodes.push(node);
	        node = node._parent;
	    }
	    length = this._length = i;
	    for (var i = length - 1; i >= 0; --i) {
	        var stack = nodes[i].stack;
	        if (stackToIndex[stack] === undefined) {
	            stackToIndex[stack] = i;
	        }
	    }
	    for (var i = 0; i < length; ++i) {
	        var currentStack = nodes[i].stack;
	        var index = stackToIndex[currentStack];
	        if (index !== undefined && index !== i) {
	            if (index > 0) {
	                nodes[index - 1]._parent = undefined;
	                nodes[index - 1]._length = 1;
	            }
	            nodes[i]._parent = undefined;
	            nodes[i]._length = 1;
	            var cycleEdgeNode = i > 0 ? nodes[i - 1] : this;

	            if (index < length - 1) {
	                cycleEdgeNode._parent = nodes[index + 1];
	                cycleEdgeNode._parent.uncycle();
	                cycleEdgeNode._length =
	                    cycleEdgeNode._parent._length + 1;
	            } else {
	                cycleEdgeNode._parent = undefined;
	                cycleEdgeNode._length = 1;
	            }
	            var currentChildLength = cycleEdgeNode._length + 1;
	            for (var j = i - 2; j >= 0; --j) {
	                nodes[j]._length = currentChildLength;
	                currentChildLength++;
	            }
	            return;
	        }
	    }
	};

	CapturedTrace.prototype.attachExtraTrace = function(error) {
	    if (error.__stackCleaned__) return;
	    this.uncycle();
	    var parsed = parseStackAndMessage(error);
	    var message = parsed.message;
	    var stacks = [parsed.stack];

	    var trace = this;
	    while (trace !== undefined) {
	        stacks.push(cleanStack(trace.stack.split("\n")));
	        trace = trace._parent;
	    }
	    removeCommonRoots(stacks);
	    removeDuplicateOrEmptyJumps(stacks);
	    util.notEnumerableProp(error, "stack", reconstructStack(message, stacks));
	    util.notEnumerableProp(error, "__stackCleaned__", true);
	};

	var captureStackTrace = (function stackDetection() {
	    var v8stackFramePattern = /^\s*at\s*/;
	    var v8stackFormatter = function(stack, error) {
	        if (typeof stack === "string") return stack;

	        if (error.name !== undefined &&
	            error.message !== undefined) {
	            return error.toString();
	        }
	        return formatNonError(error);
	    };

	    if (typeof Error.stackTraceLimit === "number" &&
	        typeof Error.captureStackTrace === "function") {
	        Error.stackTraceLimit += 6;
	        stackFramePattern = v8stackFramePattern;
	        formatStack = v8stackFormatter;
	        var captureStackTrace = Error.captureStackTrace;

	        shouldIgnore = function(line) {
	            return bluebirdFramePattern.test(line);
	        };
	        return function(receiver, ignoreUntil) {
	            Error.stackTraceLimit += 6;
	            captureStackTrace(receiver, ignoreUntil);
	            Error.stackTraceLimit -= 6;
	        };
	    }
	    var err = new Error();

	    if (typeof err.stack === "string" &&
	        err.stack.split("\n")[0].indexOf("stackDetection@") >= 0) {
	        stackFramePattern = /@/;
	        formatStack = v8stackFormatter;
	        indentStackFrames = true;
	        return function captureStackTrace(o) {
	            o.stack = new Error().stack;
	        };
	    }

	    var hasStackAfterThrow;
	    try { throw new Error(); }
	    catch(e) {
	        hasStackAfterThrow = ("stack" in e);
	    }
	    if (!("stack" in err) && hasStackAfterThrow &&
	        typeof Error.stackTraceLimit === "number") {
	        stackFramePattern = v8stackFramePattern;
	        formatStack = v8stackFormatter;
	        return function captureStackTrace(o) {
	            Error.stackTraceLimit += 6;
	            try { throw new Error(); }
	            catch(e) { o.stack = e.stack; }
	            Error.stackTraceLimit -= 6;
	        };
	    }

	    formatStack = function(stack, error) {
	        if (typeof stack === "string") return stack;

	        if ((typeof error === "object" ||
	            typeof error === "function") &&
	            error.name !== undefined &&
	            error.message !== undefined) {
	            return error.toString();
	        }
	        return formatNonError(error);
	    };

	    return null;

	})([]);

	if (typeof console !== "undefined" && typeof console.warn !== "undefined") {
	    printWarning = function (message) {
	        console.warn(message);
	    };
	    if (util.isNode && process.stderr.isTTY) {
	        printWarning = function(message, isSoft) {
	            var color = isSoft ? "\u001b[33m" : "\u001b[31m";
	            console.warn(color + message + "\u001b[0m\n");
	        };
	    } else if (!util.isNode && typeof (new Error().stack) === "string") {
	        printWarning = function(message, isSoft) {
	            console.warn("%c" + message,
	                        isSoft ? "color: darkorange" : "color: red");
	        };
	    }
	}

	var config = {
	    warnings: warnings,
	    longStackTraces: false,
	    cancellation: false,
	    monitoring: false
	};

	if (longStackTraces) Promise.longStackTraces();

	return {
	    longStackTraces: function() {
	        return config.longStackTraces;
	    },
	    warnings: function() {
	        return config.warnings;
	    },
	    cancellation: function() {
	        return config.cancellation;
	    },
	    monitoring: function() {
	        return config.monitoring;
	    },
	    propagateFromFunction: function() {
	        return propagateFromFunction;
	    },
	    boundValueFunction: function() {
	        return boundValueFunction;
	    },
	    checkForgottenReturns: checkForgottenReturns,
	    setBounds: setBounds,
	    warn: warn,
	    deprecated: deprecated,
	    CapturedTrace: CapturedTrace,
	    fireDomEvent: fireDomEvent,
	    fireGlobalEvent: fireGlobalEvent
	};
	};

	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(2)))

/***/ },
/* 17 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	module.exports = function(Promise, tryConvertToPromise, NEXT_FILTER) {
	var util = __webpack_require__(5);
	var CancellationError = Promise.CancellationError;
	var errorObj = util.errorObj;
	var catchFilter = __webpack_require__(18)(NEXT_FILTER);

	function PassThroughHandlerContext(promise, type, handler) {
	    this.promise = promise;
	    this.type = type;
	    this.handler = handler;
	    this.called = false;
	    this.cancelPromise = null;
	}

	PassThroughHandlerContext.prototype.isFinallyHandler = function() {
	    return this.type === 0;
	};

	function FinallyHandlerCancelReaction(finallyHandler) {
	    this.finallyHandler = finallyHandler;
	}

	FinallyHandlerCancelReaction.prototype._resultCancelled = function() {
	    checkCancel(this.finallyHandler);
	};

	function checkCancel(ctx, reason) {
	    if (ctx.cancelPromise != null) {
	        if (arguments.length > 1) {
	            ctx.cancelPromise._reject(reason);
	        } else {
	            ctx.cancelPromise._cancel();
	        }
	        ctx.cancelPromise = null;
	        return true;
	    }
	    return false;
	}

	function succeed() {
	    return finallyHandler.call(this, this.promise._target()._settledValue());
	}
	function fail(reason) {
	    if (checkCancel(this, reason)) return;
	    errorObj.e = reason;
	    return errorObj;
	}
	function finallyHandler(reasonOrValue) {
	    var promise = this.promise;
	    var handler = this.handler;

	    if (!this.called) {
	        this.called = true;
	        var ret = this.isFinallyHandler()
	            ? handler.call(promise._boundValue())
	            : handler.call(promise._boundValue(), reasonOrValue);
	        if (ret === NEXT_FILTER) {
	            return ret;
	        } else if (ret !== undefined) {
	            promise._setReturnedNonUndefined();
	            var maybePromise = tryConvertToPromise(ret, promise);
	            if (maybePromise instanceof Promise) {
	                if (this.cancelPromise != null) {
	                    if (maybePromise._isCancelled()) {
	                        var reason =
	                            new CancellationError("late cancellation observer");
	                        promise._attachExtraTrace(reason);
	                        errorObj.e = reason;
	                        return errorObj;
	                    } else if (maybePromise.isPending()) {
	                        maybePromise._attachCancellationCallback(
	                            new FinallyHandlerCancelReaction(this));
	                    }
	                }
	                return maybePromise._then(
	                    succeed, fail, undefined, this, undefined);
	            }
	        }
	    }

	    if (promise.isRejected()) {
	        checkCancel(this);
	        errorObj.e = reasonOrValue;
	        return errorObj;
	    } else {
	        checkCancel(this);
	        return reasonOrValue;
	    }
	}

	Promise.prototype._passThrough = function(handler, type, success, fail) {
	    if (typeof handler !== "function") return this.then();
	    return this._then(success,
	                      fail,
	                      undefined,
	                      new PassThroughHandlerContext(this, type, handler),
	                      undefined);
	};

	Promise.prototype.lastly =
	Promise.prototype["finally"] = function (handler) {
	    return this._passThrough(handler,
	                             0,
	                             finallyHandler,
	                             finallyHandler);
	};


	Promise.prototype.tap = function (handler) {
	    return this._passThrough(handler, 1, finallyHandler);
	};

	Promise.prototype.tapCatch = function (handlerOrPredicate) {
	    var len = arguments.length;
	    if(len === 1) {
	        return this._passThrough(handlerOrPredicate,
	                                 1,
	                                 undefined,
	                                 finallyHandler);
	    } else {
	         var catchInstances = new Array(len - 1),
	            j = 0, i;
	        for (i = 0; i < len - 1; ++i) {
	            var item = arguments[i];
	            if (util.isObject(item)) {
	                catchInstances[j++] = item;
	            } else {
	                return Promise.reject(new TypeError(
	                    "tapCatch statement predicate: "
	                    + "expecting an object but got " + util.classString(item)
	                ));
	            }
	        }
	        catchInstances.length = j;
	        var handler = arguments[i];
	        return this._passThrough(catchFilter(catchInstances, handler, this),
	                                 1,
	                                 undefined,
	                                 finallyHandler);
	    }

	};

	return PassThroughHandlerContext;
	};


/***/ },
/* 18 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	module.exports = function(NEXT_FILTER) {
	var util = __webpack_require__(5);
	var getKeys = __webpack_require__(6).keys;
	var tryCatch = util.tryCatch;
	var errorObj = util.errorObj;

	function catchFilter(instances, cb, promise) {
	    return function(e) {
	        var boundTo = promise._boundValue();
	        predicateLoop: for (var i = 0; i < instances.length; ++i) {
	            var item = instances[i];

	            if (item === Error ||
	                (item != null && item.prototype instanceof Error)) {
	                if (e instanceof item) {
	                    return tryCatch(cb).call(boundTo, e);
	                }
	            } else if (typeof item === "function") {
	                var matchesPredicate = tryCatch(item).call(boundTo, e);
	                if (matchesPredicate === errorObj) {
	                    return matchesPredicate;
	                } else if (matchesPredicate) {
	                    return tryCatch(cb).call(boundTo, e);
	                }
	            } else if (util.isObject(e)) {
	                var keys = getKeys(item);
	                for (var j = 0; j < keys.length; ++j) {
	                    var key = keys[j];
	                    if (item[key] != e[key]) {
	                        continue predicateLoop;
	                    }
	                }
	                return tryCatch(cb).call(boundTo, e);
	            }
	        }
	        return NEXT_FILTER;
	    };
	}

	return catchFilter;
	};


/***/ },
/* 19 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var util = __webpack_require__(5);
	var maybeWrapAsError = util.maybeWrapAsError;
	var errors = __webpack_require__(12);
	var OperationalError = errors.OperationalError;
	var es5 = __webpack_require__(6);

	function isUntypedError(obj) {
	    return obj instanceof Error &&
	        es5.getPrototypeOf(obj) === Error.prototype;
	}

	var rErrorKey = /^(?:name|message|stack|cause)$/;
	function wrapAsOperationalError(obj) {
	    var ret;
	    if (isUntypedError(obj)) {
	        ret = new OperationalError(obj);
	        ret.name = obj.name;
	        ret.message = obj.message;
	        ret.stack = obj.stack;
	        var keys = es5.keys(obj);
	        for (var i = 0; i < keys.length; ++i) {
	            var key = keys[i];
	            if (!rErrorKey.test(key)) {
	                ret[key] = obj[key];
	            }
	        }
	        return ret;
	    }
	    util.markAsOriginatingFromRejection(obj);
	    return obj;
	}

	function nodebackForPromise(promise, multiArgs) {
	    return function(err, value) {
	        if (promise === null) return;
	        if (err) {
	            var wrapped = wrapAsOperationalError(maybeWrapAsError(err));
	            promise._attachExtraTrace(wrapped);
	            promise._reject(wrapped);
	        } else if (!multiArgs) {
	            promise._fulfill(value);
	        } else {
	            var $_len = arguments.length;var args = new Array(Math.max($_len - 1, 0)); for(var $_i = 1; $_i < $_len; ++$_i) {args[$_i - 1] = arguments[$_i];};
	            promise._fulfill(args);
	        }
	        promise = null;
	    };
	}

	module.exports = nodebackForPromise;


/***/ },
/* 20 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	module.exports =
	function(Promise, INTERNAL, tryConvertToPromise, apiRejection, debug) {
	var util = __webpack_require__(5);
	var tryCatch = util.tryCatch;

	Promise.method = function (fn) {
	    if (typeof fn !== "function") {
	        throw new Promise.TypeError("expecting a function but got " + util.classString(fn));
	    }
	    return function () {
	        var ret = new Promise(INTERNAL);
	        ret._captureStackTrace();
	        ret._pushContext();
	        var value = tryCatch(fn).apply(this, arguments);
	        var promiseCreated = ret._popContext();
	        debug.checkForgottenReturns(
	            value, promiseCreated, "Promise.method", ret);
	        ret._resolveFromSyncValue(value);
	        return ret;
	    };
	};

	Promise.attempt = Promise["try"] = function (fn) {
	    if (typeof fn !== "function") {
	        return apiRejection("expecting a function but got " + util.classString(fn));
	    }
	    var ret = new Promise(INTERNAL);
	    ret._captureStackTrace();
	    ret._pushContext();
	    var value;
	    if (arguments.length > 1) {
	        debug.deprecated("calling Promise.try with more than 1 argument");
	        var arg = arguments[1];
	        var ctx = arguments[2];
	        value = util.isArray(arg) ? tryCatch(fn).apply(ctx, arg)
	                                  : tryCatch(fn).call(ctx, arg);
	    } else {
	        value = tryCatch(fn)();
	    }
	    var promiseCreated = ret._popContext();
	    debug.checkForgottenReturns(
	        value, promiseCreated, "Promise.try", ret);
	    ret._resolveFromSyncValue(value);
	    return ret;
	};

	Promise.prototype._resolveFromSyncValue = function (value) {
	    if (value === util.errorObj) {
	        this._rejectCallback(value.e, false);
	    } else {
	        this._resolveCallback(value, true);
	    }
	};
	};


/***/ },
/* 21 */
/***/ function(module, exports) {

	"use strict";
	module.exports = function(Promise, INTERNAL, tryConvertToPromise, debug) {
	var calledBind = false;
	var rejectThis = function(_, e) {
	    this._reject(e);
	};

	var targetRejected = function(e, context) {
	    context.promiseRejectionQueued = true;
	    context.bindingPromise._then(rejectThis, rejectThis, null, this, e);
	};

	var bindingResolved = function(thisArg, context) {
	    if (((this._bitField & 50397184) === 0)) {
	        this._resolveCallback(context.target);
	    }
	};

	var bindingRejected = function(e, context) {
	    if (!context.promiseRejectionQueued) this._reject(e);
	};

	Promise.prototype.bind = function (thisArg) {
	    if (!calledBind) {
	        calledBind = true;
	        Promise.prototype._propagateFrom = debug.propagateFromFunction();
	        Promise.prototype._boundValue = debug.boundValueFunction();
	    }
	    var maybePromise = tryConvertToPromise(thisArg);
	    var ret = new Promise(INTERNAL);
	    ret._propagateFrom(this, 1);
	    var target = this._target();
	    ret._setBoundTo(maybePromise);
	    if (maybePromise instanceof Promise) {
	        var context = {
	            promiseRejectionQueued: false,
	            promise: ret,
	            target: target,
	            bindingPromise: maybePromise
	        };
	        target._then(INTERNAL, targetRejected, undefined, ret, context);
	        maybePromise._then(
	            bindingResolved, bindingRejected, undefined, ret, context);
	        ret._setOnCancel(maybePromise);
	    } else {
	        ret._resolveCallback(target);
	    }
	    return ret;
	};

	Promise.prototype._setBoundTo = function (obj) {
	    if (obj !== undefined) {
	        this._bitField = this._bitField | 2097152;
	        this._boundTo = obj;
	    } else {
	        this._bitField = this._bitField & (~2097152);
	    }
	};

	Promise.prototype._isBound = function () {
	    return (this._bitField & 2097152) === 2097152;
	};

	Promise.bind = function (thisArg, value) {
	    return Promise.resolve(value).bind(thisArg);
	};
	};


/***/ },
/* 22 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	module.exports = function(Promise, PromiseArray, apiRejection, debug) {
	var util = __webpack_require__(5);
	var tryCatch = util.tryCatch;
	var errorObj = util.errorObj;
	var async = Promise._async;

	Promise.prototype["break"] = Promise.prototype.cancel = function() {
	    if (!debug.cancellation()) return this._warn("cancellation is disabled");

	    var promise = this;
	    var child = promise;
	    while (promise._isCancellable()) {
	        if (!promise._cancelBy(child)) {
	            if (child._isFollowing()) {
	                child._followee().cancel();
	            } else {
	                child._cancelBranched();
	            }
	            break;
	        }

	        var parent = promise._cancellationParent;
	        if (parent == null || !parent._isCancellable()) {
	            if (promise._isFollowing()) {
	                promise._followee().cancel();
	            } else {
	                promise._cancelBranched();
	            }
	            break;
	        } else {
	            if (promise._isFollowing()) promise._followee().cancel();
	            promise._setWillBeCancelled();
	            child = promise;
	            promise = parent;
	        }
	    }
	};

	Promise.prototype._branchHasCancelled = function() {
	    this._branchesRemainingToCancel--;
	};

	Promise.prototype._enoughBranchesHaveCancelled = function() {
	    return this._branchesRemainingToCancel === undefined ||
	           this._branchesRemainingToCancel <= 0;
	};

	Promise.prototype._cancelBy = function(canceller) {
	    if (canceller === this) {
	        this._branchesRemainingToCancel = 0;
	        this._invokeOnCancel();
	        return true;
	    } else {
	        this._branchHasCancelled();
	        if (this._enoughBranchesHaveCancelled()) {
	            this._invokeOnCancel();
	            return true;
	        }
	    }
	    return false;
	};

	Promise.prototype._cancelBranched = function() {
	    if (this._enoughBranchesHaveCancelled()) {
	        this._cancel();
	    }
	};

	Promise.prototype._cancel = function() {
	    if (!this._isCancellable()) return;
	    this._setCancelled();
	    async.invoke(this._cancelPromises, this, undefined);
	};

	Promise.prototype._cancelPromises = function() {
	    if (this._length() > 0) this._settlePromises();
	};

	Promise.prototype._unsetOnCancel = function() {
	    this._onCancelField = undefined;
	};

	Promise.prototype._isCancellable = function() {
	    return this.isPending() && !this._isCancelled();
	};

	Promise.prototype.isCancellable = function() {
	    return this.isPending() && !this.isCancelled();
	};

	Promise.prototype._doInvokeOnCancel = function(onCancelCallback, internalOnly) {
	    if (util.isArray(onCancelCallback)) {
	        for (var i = 0; i < onCancelCallback.length; ++i) {
	            this._doInvokeOnCancel(onCancelCallback[i], internalOnly);
	        }
	    } else if (onCancelCallback !== undefined) {
	        if (typeof onCancelCallback === "function") {
	            if (!internalOnly) {
	                var e = tryCatch(onCancelCallback).call(this._boundValue());
	                if (e === errorObj) {
	                    this._attachExtraTrace(e.e);
	                    async.throwLater(e.e);
	                }
	            }
	        } else {
	            onCancelCallback._resultCancelled(this);
	        }
	    }
	};

	Promise.prototype._invokeOnCancel = function() {
	    var onCancelCallback = this._onCancel();
	    this._unsetOnCancel();
	    async.invoke(this._doInvokeOnCancel, this, onCancelCallback);
	};

	Promise.prototype._invokeInternalOnCancel = function() {
	    if (this._isCancellable()) {
	        this._doInvokeOnCancel(this._onCancel(), true);
	        this._unsetOnCancel();
	    }
	};

	Promise.prototype._resultCancelled = function() {
	    this.cancel();
	};

	};


/***/ },
/* 23 */
/***/ function(module, exports) {

	"use strict";
	module.exports = function(Promise) {
	function returner() {
	    return this.value;
	}
	function thrower() {
	    throw this.reason;
	}

	Promise.prototype["return"] =
	Promise.prototype.thenReturn = function (value) {
	    if (value instanceof Promise) value.suppressUnhandledRejections();
	    return this._then(
	        returner, undefined, undefined, {value: value}, undefined);
	};

	Promise.prototype["throw"] =
	Promise.prototype.thenThrow = function (reason) {
	    return this._then(
	        thrower, undefined, undefined, {reason: reason}, undefined);
	};

	Promise.prototype.catchThrow = function (reason) {
	    if (arguments.length <= 1) {
	        return this._then(
	            undefined, thrower, undefined, {reason: reason}, undefined);
	    } else {
	        var _reason = arguments[1];
	        var handler = function() {throw _reason;};
	        return this.caught(reason, handler);
	    }
	};

	Promise.prototype.catchReturn = function (value) {
	    if (arguments.length <= 1) {
	        if (value instanceof Promise) value.suppressUnhandledRejections();
	        return this._then(
	            undefined, returner, undefined, {value: value}, undefined);
	    } else {
	        var _value = arguments[1];
	        if (_value instanceof Promise) _value.suppressUnhandledRejections();
	        var handler = function() {return _value;};
	        return this.caught(value, handler);
	    }
	};
	};


/***/ },
/* 24 */
/***/ function(module, exports) {

	"use strict";
	module.exports = function(Promise) {
	function PromiseInspection(promise) {
	    if (promise !== undefined) {
	        promise = promise._target();
	        this._bitField = promise._bitField;
	        this._settledValueField = promise._isFateSealed()
	            ? promise._settledValue() : undefined;
	    }
	    else {
	        this._bitField = 0;
	        this._settledValueField = undefined;
	    }
	}

	PromiseInspection.prototype._settledValue = function() {
	    return this._settledValueField;
	};

	var value = PromiseInspection.prototype.value = function () {
	    if (!this.isFulfilled()) {
	        throw new TypeError("cannot get fulfillment value of a non-fulfilled promise\u000a\u000a    See http://goo.gl/MqrFmX\u000a");
	    }
	    return this._settledValue();
	};

	var reason = PromiseInspection.prototype.error =
	PromiseInspection.prototype.reason = function () {
	    if (!this.isRejected()) {
	        throw new TypeError("cannot get rejection reason of a non-rejected promise\u000a\u000a    See http://goo.gl/MqrFmX\u000a");
	    }
	    return this._settledValue();
	};

	var isFulfilled = PromiseInspection.prototype.isFulfilled = function() {
	    return (this._bitField & 33554432) !== 0;
	};

	var isRejected = PromiseInspection.prototype.isRejected = function () {
	    return (this._bitField & 16777216) !== 0;
	};

	var isPending = PromiseInspection.prototype.isPending = function () {
	    return (this._bitField & 50397184) === 0;
	};

	var isResolved = PromiseInspection.prototype.isResolved = function () {
	    return (this._bitField & 50331648) !== 0;
	};

	PromiseInspection.prototype.isCancelled = function() {
	    return (this._bitField & 8454144) !== 0;
	};

	Promise.prototype.__isCancelled = function() {
	    return (this._bitField & 65536) === 65536;
	};

	Promise.prototype._isCancelled = function() {
	    return this._target().__isCancelled();
	};

	Promise.prototype.isCancelled = function() {
	    return (this._target()._bitField & 8454144) !== 0;
	};

	Promise.prototype.isPending = function() {
	    return isPending.call(this._target());
	};

	Promise.prototype.isRejected = function() {
	    return isRejected.call(this._target());
	};

	Promise.prototype.isFulfilled = function() {
	    return isFulfilled.call(this._target());
	};

	Promise.prototype.isResolved = function() {
	    return isResolved.call(this._target());
	};

	Promise.prototype.value = function() {
	    return value.call(this._target());
	};

	Promise.prototype.reason = function() {
	    var target = this._target();
	    target._unsetRejectionIsUnhandled();
	    return reason.call(target);
	};

	Promise.prototype._value = function() {
	    return this._settledValue();
	};

	Promise.prototype._reason = function() {
	    this._unsetRejectionIsUnhandled();
	    return this._settledValue();
	};

	Promise.PromiseInspection = PromiseInspection;
	};


/***/ },
/* 25 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	module.exports =
	function(Promise, PromiseArray, tryConvertToPromise, INTERNAL, async,
	         getDomain) {
	var util = __webpack_require__(5);
	var canEvaluate = util.canEvaluate;
	var tryCatch = util.tryCatch;
	var errorObj = util.errorObj;
	var reject;

	if (true) {
	if (canEvaluate) {
	    var thenCallback = function(i) {
	        return new Function("value", "holder", "                             \n\
	            'use strict';                                                    \n\
	            holder.pIndex = value;                                           \n\
	            holder.checkFulfillment(this);                                   \n\
	            ".replace(/Index/g, i));
	    };

	    var promiseSetter = function(i) {
	        return new Function("promise", "holder", "                           \n\
	            'use strict';                                                    \n\
	            holder.pIndex = promise;                                         \n\
	            ".replace(/Index/g, i));
	    };

	    var generateHolderClass = function(total) {
	        var props = new Array(total);
	        for (var i = 0; i < props.length; ++i) {
	            props[i] = "this.p" + (i+1);
	        }
	        var assignment = props.join(" = ") + " = null;";
	        var cancellationCode= "var promise;\n" + props.map(function(prop) {
	            return "                                                         \n\
	                promise = " + prop + ";                                      \n\
	                if (promise instanceof Promise) {                            \n\
	                    promise.cancel();                                        \n\
	                }                                                            \n\
	            ";
	        }).join("\n");
	        var passedArguments = props.join(", ");
	        var name = "Holder$" + total;


	        var code = "return function(tryCatch, errorObj, Promise, async) {    \n\
	            'use strict';                                                    \n\
	            function [TheName](fn) {                                         \n\
	                [TheProperties]                                              \n\
	                this.fn = fn;                                                \n\
	                this.asyncNeeded = true;                                     \n\
	                this.now = 0;                                                \n\
	            }                                                                \n\
	                                                                             \n\
	            [TheName].prototype._callFunction = function(promise) {          \n\
	                promise._pushContext();                                      \n\
	                var ret = tryCatch(this.fn)([ThePassedArguments]);           \n\
	                promise._popContext();                                       \n\
	                if (ret === errorObj) {                                      \n\
	                    promise._rejectCallback(ret.e, false);                   \n\
	                } else {                                                     \n\
	                    promise._resolveCallback(ret);                           \n\
	                }                                                            \n\
	            };                                                               \n\
	                                                                             \n\
	            [TheName].prototype.checkFulfillment = function(promise) {       \n\
	                var now = ++this.now;                                        \n\
	                if (now === [TheTotal]) {                                    \n\
	                    if (this.asyncNeeded) {                                  \n\
	                        async.invoke(this._callFunction, this, promise);     \n\
	                    } else {                                                 \n\
	                        this._callFunction(promise);                         \n\
	                    }                                                        \n\
	                                                                             \n\
	                }                                                            \n\
	            };                                                               \n\
	                                                                             \n\
	            [TheName].prototype._resultCancelled = function() {              \n\
	                [CancellationCode]                                           \n\
	            };                                                               \n\
	                                                                             \n\
	            return [TheName];                                                \n\
	        }(tryCatch, errorObj, Promise, async);                               \n\
	        ";

	        code = code.replace(/\[TheName\]/g, name)
	            .replace(/\[TheTotal\]/g, total)
	            .replace(/\[ThePassedArguments\]/g, passedArguments)
	            .replace(/\[TheProperties\]/g, assignment)
	            .replace(/\[CancellationCode\]/g, cancellationCode);

	        return new Function("tryCatch", "errorObj", "Promise", "async", code)
	                           (tryCatch, errorObj, Promise, async);
	    };

	    var holderClasses = [];
	    var thenCallbacks = [];
	    var promiseSetters = [];

	    for (var i = 0; i < 8; ++i) {
	        holderClasses.push(generateHolderClass(i + 1));
	        thenCallbacks.push(thenCallback(i + 1));
	        promiseSetters.push(promiseSetter(i + 1));
	    }

	    reject = function (reason) {
	        this._reject(reason);
	    };
	}}

	Promise.join = function () {
	    var last = arguments.length - 1;
	    var fn;
	    if (last > 0 && typeof arguments[last] === "function") {
	        fn = arguments[last];
	        if (true) {
	            if (last <= 8 && canEvaluate) {
	                var ret = new Promise(INTERNAL);
	                ret._captureStackTrace();
	                var HolderClass = holderClasses[last - 1];
	                var holder = new HolderClass(fn);
	                var callbacks = thenCallbacks;

	                for (var i = 0; i < last; ++i) {
	                    var maybePromise = tryConvertToPromise(arguments[i], ret);
	                    if (maybePromise instanceof Promise) {
	                        maybePromise = maybePromise._target();
	                        var bitField = maybePromise._bitField;
	                        ;
	                        if (((bitField & 50397184) === 0)) {
	                            maybePromise._then(callbacks[i], reject,
	                                               undefined, ret, holder);
	                            promiseSetters[i](maybePromise, holder);
	                            holder.asyncNeeded = false;
	                        } else if (((bitField & 33554432) !== 0)) {
	                            callbacks[i].call(ret,
	                                              maybePromise._value(), holder);
	                        } else if (((bitField & 16777216) !== 0)) {
	                            ret._reject(maybePromise._reason());
	                        } else {
	                            ret._cancel();
	                        }
	                    } else {
	                        callbacks[i].call(ret, maybePromise, holder);
	                    }
	                }

	                if (!ret._isFateSealed()) {
	                    if (holder.asyncNeeded) {
	                        var domain = getDomain();
	                        if (domain !== null) {
	                            holder.fn = util.domainBind(domain, holder.fn);
	                        }
	                    }
	                    ret._setAsyncGuaranteed();
	                    ret._setOnCancel(holder);
	                }
	                return ret;
	            }
	        }
	    }
	    var $_len = arguments.length;var args = new Array($_len); for(var $_i = 0; $_i < $_len; ++$_i) {args[$_i] = arguments[$_i];};
	    if (fn) args.pop();
	    var ret = new PromiseArray(args).promise();
	    return fn !== undefined ? ret.spread(fn) : ret;
	};

	};


/***/ },
/* 26 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	module.exports = function(Promise,
	                          PromiseArray,
	                          apiRejection,
	                          tryConvertToPromise,
	                          INTERNAL,
	                          debug) {
	var getDomain = Promise._getDomain;
	var util = __webpack_require__(5);
	var tryCatch = util.tryCatch;
	var errorObj = util.errorObj;
	var async = Promise._async;

	function MappingPromiseArray(promises, fn, limit, _filter) {
	    this.constructor$(promises);
	    this._promise._captureStackTrace();
	    var domain = getDomain();
	    this._callback = domain === null ? fn : util.domainBind(domain, fn);
	    this._preservedValues = _filter === INTERNAL
	        ? new Array(this.length())
	        : null;
	    this._limit = limit;
	    this._inFlight = 0;
	    this._queue = [];
	    async.invoke(this._asyncInit, this, undefined);
	}
	util.inherits(MappingPromiseArray, PromiseArray);

	MappingPromiseArray.prototype._asyncInit = function() {
	    this._init$(undefined, -2);
	};

	MappingPromiseArray.prototype._init = function () {};

	MappingPromiseArray.prototype._promiseFulfilled = function (value, index) {
	    var values = this._values;
	    var length = this.length();
	    var preservedValues = this._preservedValues;
	    var limit = this._limit;

	    if (index < 0) {
	        index = (index * -1) - 1;
	        values[index] = value;
	        if (limit >= 1) {
	            this._inFlight--;
	            this._drainQueue();
	            if (this._isResolved()) return true;
	        }
	    } else {
	        if (limit >= 1 && this._inFlight >= limit) {
	            values[index] = value;
	            this._queue.push(index);
	            return false;
	        }
	        if (preservedValues !== null) preservedValues[index] = value;

	        var promise = this._promise;
	        var callback = this._callback;
	        var receiver = promise._boundValue();
	        promise._pushContext();
	        var ret = tryCatch(callback).call(receiver, value, index, length);
	        var promiseCreated = promise._popContext();
	        debug.checkForgottenReturns(
	            ret,
	            promiseCreated,
	            preservedValues !== null ? "Promise.filter" : "Promise.map",
	            promise
	        );
	        if (ret === errorObj) {
	            this._reject(ret.e);
	            return true;
	        }

	        var maybePromise = tryConvertToPromise(ret, this._promise);
	        if (maybePromise instanceof Promise) {
	            maybePromise = maybePromise._target();
	            var bitField = maybePromise._bitField;
	            ;
	            if (((bitField & 50397184) === 0)) {
	                if (limit >= 1) this._inFlight++;
	                values[index] = maybePromise;
	                maybePromise._proxy(this, (index + 1) * -1);
	                return false;
	            } else if (((bitField & 33554432) !== 0)) {
	                ret = maybePromise._value();
	            } else if (((bitField & 16777216) !== 0)) {
	                this._reject(maybePromise._reason());
	                return true;
	            } else {
	                this._cancel();
	                return true;
	            }
	        }
	        values[index] = ret;
	    }
	    var totalResolved = ++this._totalResolved;
	    if (totalResolved >= length) {
	        if (preservedValues !== null) {
	            this._filter(values, preservedValues);
	        } else {
	            this._resolve(values);
	        }
	        return true;
	    }
	    return false;
	};

	MappingPromiseArray.prototype._drainQueue = function () {
	    var queue = this._queue;
	    var limit = this._limit;
	    var values = this._values;
	    while (queue.length > 0 && this._inFlight < limit) {
	        if (this._isResolved()) return;
	        var index = queue.pop();
	        this._promiseFulfilled(values[index], index);
	    }
	};

	MappingPromiseArray.prototype._filter = function (booleans, values) {
	    var len = values.length;
	    var ret = new Array(len);
	    var j = 0;
	    for (var i = 0; i < len; ++i) {
	        if (booleans[i]) ret[j++] = values[i];
	    }
	    ret.length = j;
	    this._resolve(ret);
	};

	MappingPromiseArray.prototype.preservedValues = function () {
	    return this._preservedValues;
	};

	function map(promises, fn, options, _filter) {
	    if (typeof fn !== "function") {
	        return apiRejection("expecting a function but got " + util.classString(fn));
	    }

	    var limit = 0;
	    if (options !== undefined) {
	        if (typeof options === "object" && options !== null) {
	            if (typeof options.concurrency !== "number") {
	                return Promise.reject(
	                    new TypeError("'concurrency' must be a number but it is " +
	                                    util.classString(options.concurrency)));
	            }
	            limit = options.concurrency;
	        } else {
	            return Promise.reject(new TypeError(
	                            "options argument must be an object but it is " +
	                             util.classString(options)));
	        }
	    }
	    limit = typeof limit === "number" &&
	        isFinite(limit) && limit >= 1 ? limit : 0;
	    return new MappingPromiseArray(promises, fn, limit, _filter).promise();
	}

	Promise.prototype.map = function (fn, options) {
	    return map(this, fn, options, null);
	};

	Promise.map = function (promises, fn, options, _filter) {
	    return map(promises, fn, options, _filter);
	};


	};


/***/ },
/* 27 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var cr = Object.create;
	if (cr) {
	    var callerCache = cr(null);
	    var getterCache = cr(null);
	    callerCache[" size"] = getterCache[" size"] = 0;
	}

	module.exports = function(Promise) {
	var util = __webpack_require__(5);
	var canEvaluate = util.canEvaluate;
	var isIdentifier = util.isIdentifier;

	var getMethodCaller;
	var getGetter;
	if (true) {
	var makeMethodCaller = function (methodName) {
	    return new Function("ensureMethod", "                                    \n\
	        return function(obj) {                                               \n\
	            'use strict'                                                     \n\
	            var len = this.length;                                           \n\
	            ensureMethod(obj, 'methodName');                                 \n\
	            switch(len) {                                                    \n\
	                case 1: return obj.methodName(this[0]);                      \n\
	                case 2: return obj.methodName(this[0], this[1]);             \n\
	                case 3: return obj.methodName(this[0], this[1], this[2]);    \n\
	                case 0: return obj.methodName();                             \n\
	                default:                                                     \n\
	                    return obj.methodName.apply(obj, this);                  \n\
	            }                                                                \n\
	        };                                                                   \n\
	        ".replace(/methodName/g, methodName))(ensureMethod);
	};

	var makeGetter = function (propertyName) {
	    return new Function("obj", "                                             \n\
	        'use strict';                                                        \n\
	        return obj.propertyName;                                             \n\
	        ".replace("propertyName", propertyName));
	};

	var getCompiled = function(name, compiler, cache) {
	    var ret = cache[name];
	    if (typeof ret !== "function") {
	        if (!isIdentifier(name)) {
	            return null;
	        }
	        ret = compiler(name);
	        cache[name] = ret;
	        cache[" size"]++;
	        if (cache[" size"] > 512) {
	            var keys = Object.keys(cache);
	            for (var i = 0; i < 256; ++i) delete cache[keys[i]];
	            cache[" size"] = keys.length - 256;
	        }
	    }
	    return ret;
	};

	getMethodCaller = function(name) {
	    return getCompiled(name, makeMethodCaller, callerCache);
	};

	getGetter = function(name) {
	    return getCompiled(name, makeGetter, getterCache);
	};
	}

	function ensureMethod(obj, methodName) {
	    var fn;
	    if (obj != null) fn = obj[methodName];
	    if (typeof fn !== "function") {
	        var message = "Object " + util.classString(obj) + " has no method '" +
	            util.toString(methodName) + "'";
	        throw new Promise.TypeError(message);
	    }
	    return fn;
	}

	function caller(obj) {
	    var methodName = this.pop();
	    var fn = ensureMethod(obj, methodName);
	    return fn.apply(obj, this);
	}
	Promise.prototype.call = function (methodName) {
	    var $_len = arguments.length;var args = new Array(Math.max($_len - 1, 0)); for(var $_i = 1; $_i < $_len; ++$_i) {args[$_i - 1] = arguments[$_i];};
	    if (true) {
	        if (canEvaluate) {
	            var maybeCaller = getMethodCaller(methodName);
	            if (maybeCaller !== null) {
	                return this._then(
	                    maybeCaller, undefined, undefined, args, undefined);
	            }
	        }
	    }
	    args.push(methodName);
	    return this._then(caller, undefined, undefined, args, undefined);
	};

	function namedGetter(obj) {
	    return obj[this];
	}
	function indexedGetter(obj) {
	    var index = +this;
	    if (index < 0) index = Math.max(0, index + obj.length);
	    return obj[index];
	}
	Promise.prototype.get = function (propertyName) {
	    var isIndex = (typeof propertyName === "number");
	    var getter;
	    if (!isIndex) {
	        if (canEvaluate) {
	            var maybeGetter = getGetter(propertyName);
	            getter = maybeGetter !== null ? maybeGetter : namedGetter;
	        } else {
	            getter = namedGetter;
	        }
	    } else {
	        getter = indexedGetter;
	    }
	    return this._then(getter, undefined, undefined, propertyName, undefined);
	};
	};


/***/ },
/* 28 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	module.exports = function (Promise, apiRejection, tryConvertToPromise,
	    createContext, INTERNAL, debug) {
	    var util = __webpack_require__(5);
	    var TypeError = __webpack_require__(12).TypeError;
	    var inherits = __webpack_require__(5).inherits;
	    var errorObj = util.errorObj;
	    var tryCatch = util.tryCatch;
	    var NULL = {};

	    function thrower(e) {
	        setTimeout(function(){throw e;}, 0);
	    }

	    function castPreservingDisposable(thenable) {
	        var maybePromise = tryConvertToPromise(thenable);
	        if (maybePromise !== thenable &&
	            typeof thenable._isDisposable === "function" &&
	            typeof thenable._getDisposer === "function" &&
	            thenable._isDisposable()) {
	            maybePromise._setDisposable(thenable._getDisposer());
	        }
	        return maybePromise;
	    }
	    function dispose(resources, inspection) {
	        var i = 0;
	        var len = resources.length;
	        var ret = new Promise(INTERNAL);
	        function iterator() {
	            if (i >= len) return ret._fulfill();
	            var maybePromise = castPreservingDisposable(resources[i++]);
	            if (maybePromise instanceof Promise &&
	                maybePromise._isDisposable()) {
	                try {
	                    maybePromise = tryConvertToPromise(
	                        maybePromise._getDisposer().tryDispose(inspection),
	                        resources.promise);
	                } catch (e) {
	                    return thrower(e);
	                }
	                if (maybePromise instanceof Promise) {
	                    return maybePromise._then(iterator, thrower,
	                                              null, null, null);
	                }
	            }
	            iterator();
	        }
	        iterator();
	        return ret;
	    }

	    function Disposer(data, promise, context) {
	        this._data = data;
	        this._promise = promise;
	        this._context = context;
	    }

	    Disposer.prototype.data = function () {
	        return this._data;
	    };

	    Disposer.prototype.promise = function () {
	        return this._promise;
	    };

	    Disposer.prototype.resource = function () {
	        if (this.promise().isFulfilled()) {
	            return this.promise().value();
	        }
	        return NULL;
	    };

	    Disposer.prototype.tryDispose = function(inspection) {
	        var resource = this.resource();
	        var context = this._context;
	        if (context !== undefined) context._pushContext();
	        var ret = resource !== NULL
	            ? this.doDispose(resource, inspection) : null;
	        if (context !== undefined) context._popContext();
	        this._promise._unsetDisposable();
	        this._data = null;
	        return ret;
	    };

	    Disposer.isDisposer = function (d) {
	        return (d != null &&
	                typeof d.resource === "function" &&
	                typeof d.tryDispose === "function");
	    };

	    function FunctionDisposer(fn, promise, context) {
	        this.constructor$(fn, promise, context);
	    }
	    inherits(FunctionDisposer, Disposer);

	    FunctionDisposer.prototype.doDispose = function (resource, inspection) {
	        var fn = this.data();
	        return fn.call(resource, resource, inspection);
	    };

	    function maybeUnwrapDisposer(value) {
	        if (Disposer.isDisposer(value)) {
	            this.resources[this.index]._setDisposable(value);
	            return value.promise();
	        }
	        return value;
	    }

	    function ResourceList(length) {
	        this.length = length;
	        this.promise = null;
	        this[length-1] = null;
	    }

	    ResourceList.prototype._resultCancelled = function() {
	        var len = this.length;
	        for (var i = 0; i < len; ++i) {
	            var item = this[i];
	            if (item instanceof Promise) {
	                item.cancel();
	            }
	        }
	    };

	    Promise.using = function () {
	        var len = arguments.length;
	        if (len < 2) return apiRejection(
	                        "you must pass at least 2 arguments to Promise.using");
	        var fn = arguments[len - 1];
	        if (typeof fn !== "function") {
	            return apiRejection("expecting a function but got " + util.classString(fn));
	        }
	        var input;
	        var spreadArgs = true;
	        if (len === 2 && Array.isArray(arguments[0])) {
	            input = arguments[0];
	            len = input.length;
	            spreadArgs = false;
	        } else {
	            input = arguments;
	            len--;
	        }
	        var resources = new ResourceList(len);
	        for (var i = 0; i < len; ++i) {
	            var resource = input[i];
	            if (Disposer.isDisposer(resource)) {
	                var disposer = resource;
	                resource = resource.promise();
	                resource._setDisposable(disposer);
	            } else {
	                var maybePromise = tryConvertToPromise(resource);
	                if (maybePromise instanceof Promise) {
	                    resource =
	                        maybePromise._then(maybeUnwrapDisposer, null, null, {
	                            resources: resources,
	                            index: i
	                    }, undefined);
	                }
	            }
	            resources[i] = resource;
	        }

	        var reflectedResources = new Array(resources.length);
	        for (var i = 0; i < reflectedResources.length; ++i) {
	            reflectedResources[i] = Promise.resolve(resources[i]).reflect();
	        }

	        var resultPromise = Promise.all(reflectedResources)
	            .then(function(inspections) {
	                for (var i = 0; i < inspections.length; ++i) {
	                    var inspection = inspections[i];
	                    if (inspection.isRejected()) {
	                        errorObj.e = inspection.error();
	                        return errorObj;
	                    } else if (!inspection.isFulfilled()) {
	                        resultPromise.cancel();
	                        return;
	                    }
	                    inspections[i] = inspection.value();
	                }
	                promise._pushContext();

	                fn = tryCatch(fn);
	                var ret = spreadArgs
	                    ? fn.apply(undefined, inspections) : fn(inspections);
	                var promiseCreated = promise._popContext();
	                debug.checkForgottenReturns(
	                    ret, promiseCreated, "Promise.using", promise);
	                return ret;
	            });

	        var promise = resultPromise.lastly(function() {
	            var inspection = new Promise.PromiseInspection(resultPromise);
	            return dispose(resources, inspection);
	        });
	        resources.promise = promise;
	        promise._setOnCancel(resources);
	        return promise;
	    };

	    Promise.prototype._setDisposable = function (disposer) {
	        this._bitField = this._bitField | 131072;
	        this._disposer = disposer;
	    };

	    Promise.prototype._isDisposable = function () {
	        return (this._bitField & 131072) > 0;
	    };

	    Promise.prototype._getDisposer = function () {
	        return this._disposer;
	    };

	    Promise.prototype._unsetDisposable = function () {
	        this._bitField = this._bitField & (~131072);
	        this._disposer = undefined;
	    };

	    Promise.prototype.disposer = function (fn) {
	        if (typeof fn === "function") {
	            return new FunctionDisposer(fn, this, createContext());
	        }
	        throw new TypeError();
	    };

	};


/***/ },
/* 29 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	module.exports = function(Promise, INTERNAL, debug) {
	var util = __webpack_require__(5);
	var TimeoutError = Promise.TimeoutError;

	function HandleWrapper(handle)  {
	    this.handle = handle;
	}

	HandleWrapper.prototype._resultCancelled = function() {
	    clearTimeout(this.handle);
	};

	var afterValue = function(value) { return delay(+this).thenReturn(value); };
	var delay = Promise.delay = function (ms, value) {
	    var ret;
	    var handle;
	    if (value !== undefined) {
	        ret = Promise.resolve(value)
	                ._then(afterValue, null, null, ms, undefined);
	        if (debug.cancellation() && value instanceof Promise) {
	            ret._setOnCancel(value);
	        }
	    } else {
	        ret = new Promise(INTERNAL);
	        handle = setTimeout(function() { ret._fulfill(); }, +ms);
	        if (debug.cancellation()) {
	            ret._setOnCancel(new HandleWrapper(handle));
	        }
	        ret._captureStackTrace();
	    }
	    ret._setAsyncGuaranteed();
	    return ret;
	};

	Promise.prototype.delay = function (ms) {
	    return delay(ms, this);
	};

	var afterTimeout = function (promise, message, parent) {
	    var err;
	    if (typeof message !== "string") {
	        if (message instanceof Error) {
	            err = message;
	        } else {
	            err = new TimeoutError("operation timed out");
	        }
	    } else {
	        err = new TimeoutError(message);
	    }
	    util.markAsOriginatingFromRejection(err);
	    promise._attachExtraTrace(err);
	    promise._reject(err);

	    if (parent != null) {
	        parent.cancel();
	    }
	};

	function successClear(value) {
	    clearTimeout(this.handle);
	    return value;
	}

	function failureClear(reason) {
	    clearTimeout(this.handle);
	    throw reason;
	}

	Promise.prototype.timeout = function (ms, message) {
	    ms = +ms;
	    var ret, parent;

	    var handleWrapper = new HandleWrapper(setTimeout(function timeoutTimeout() {
	        if (ret.isPending()) {
	            afterTimeout(ret, message, parent);
	        }
	    }, ms));

	    if (debug.cancellation()) {
	        parent = this.then();
	        ret = parent._then(successClear, failureClear,
	                            undefined, handleWrapper, undefined);
	        ret._setOnCancel(handleWrapper);
	    } else {
	        ret = this._then(successClear, failureClear,
	                            undefined, handleWrapper, undefined);
	    }

	    return ret;
	};

	};


/***/ },
/* 30 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	module.exports = function(Promise,
	                          apiRejection,
	                          INTERNAL,
	                          tryConvertToPromise,
	                          Proxyable,
	                          debug) {
	var errors = __webpack_require__(12);
	var TypeError = errors.TypeError;
	var util = __webpack_require__(5);
	var errorObj = util.errorObj;
	var tryCatch = util.tryCatch;
	var yieldHandlers = [];

	function promiseFromYieldHandler(value, yieldHandlers, traceParent) {
	    for (var i = 0; i < yieldHandlers.length; ++i) {
	        traceParent._pushContext();
	        var result = tryCatch(yieldHandlers[i])(value);
	        traceParent._popContext();
	        if (result === errorObj) {
	            traceParent._pushContext();
	            var ret = Promise.reject(errorObj.e);
	            traceParent._popContext();
	            return ret;
	        }
	        var maybePromise = tryConvertToPromise(result, traceParent);
	        if (maybePromise instanceof Promise) return maybePromise;
	    }
	    return null;
	}

	function PromiseSpawn(generatorFunction, receiver, yieldHandler, stack) {
	    if (debug.cancellation()) {
	        var internal = new Promise(INTERNAL);
	        var _finallyPromise = this._finallyPromise = new Promise(INTERNAL);
	        this._promise = internal.lastly(function() {
	            return _finallyPromise;
	        });
	        internal._captureStackTrace();
	        internal._setOnCancel(this);
	    } else {
	        var promise = this._promise = new Promise(INTERNAL);
	        promise._captureStackTrace();
	    }
	    this._stack = stack;
	    this._generatorFunction = generatorFunction;
	    this._receiver = receiver;
	    this._generator = undefined;
	    this._yieldHandlers = typeof yieldHandler === "function"
	        ? [yieldHandler].concat(yieldHandlers)
	        : yieldHandlers;
	    this._yieldedPromise = null;
	    this._cancellationPhase = false;
	}
	util.inherits(PromiseSpawn, Proxyable);

	PromiseSpawn.prototype._isResolved = function() {
	    return this._promise === null;
	};

	PromiseSpawn.prototype._cleanup = function() {
	    this._promise = this._generator = null;
	    if (debug.cancellation() && this._finallyPromise !== null) {
	        this._finallyPromise._fulfill();
	        this._finallyPromise = null;
	    }
	};

	PromiseSpawn.prototype._promiseCancelled = function() {
	    if (this._isResolved()) return;
	    var implementsReturn = typeof this._generator["return"] !== "undefined";

	    var result;
	    if (!implementsReturn) {
	        var reason = new Promise.CancellationError(
	            "generator .return() sentinel");
	        Promise.coroutine.returnSentinel = reason;
	        this._promise._attachExtraTrace(reason);
	        this._promise._pushContext();
	        result = tryCatch(this._generator["throw"]).call(this._generator,
	                                                         reason);
	        this._promise._popContext();
	    } else {
	        this._promise._pushContext();
	        result = tryCatch(this._generator["return"]).call(this._generator,
	                                                          undefined);
	        this._promise._popContext();
	    }
	    this._cancellationPhase = true;
	    this._yieldedPromise = null;
	    this._continue(result);
	};

	PromiseSpawn.prototype._promiseFulfilled = function(value) {
	    this._yieldedPromise = null;
	    this._promise._pushContext();
	    var result = tryCatch(this._generator.next).call(this._generator, value);
	    this._promise._popContext();
	    this._continue(result);
	};

	PromiseSpawn.prototype._promiseRejected = function(reason) {
	    this._yieldedPromise = null;
	    this._promise._attachExtraTrace(reason);
	    this._promise._pushContext();
	    var result = tryCatch(this._generator["throw"])
	        .call(this._generator, reason);
	    this._promise._popContext();
	    this._continue(result);
	};

	PromiseSpawn.prototype._resultCancelled = function() {
	    if (this._yieldedPromise instanceof Promise) {
	        var promise = this._yieldedPromise;
	        this._yieldedPromise = null;
	        promise.cancel();
	    }
	};

	PromiseSpawn.prototype.promise = function () {
	    return this._promise;
	};

	PromiseSpawn.prototype._run = function () {
	    this._generator = this._generatorFunction.call(this._receiver);
	    this._receiver =
	        this._generatorFunction = undefined;
	    this._promiseFulfilled(undefined);
	};

	PromiseSpawn.prototype._continue = function (result) {
	    var promise = this._promise;
	    if (result === errorObj) {
	        this._cleanup();
	        if (this._cancellationPhase) {
	            return promise.cancel();
	        } else {
	            return promise._rejectCallback(result.e, false);
	        }
	    }

	    var value = result.value;
	    if (result.done === true) {
	        this._cleanup();
	        if (this._cancellationPhase) {
	            return promise.cancel();
	        } else {
	            return promise._resolveCallback(value);
	        }
	    } else {
	        var maybePromise = tryConvertToPromise(value, this._promise);
	        if (!(maybePromise instanceof Promise)) {
	            maybePromise =
	                promiseFromYieldHandler(maybePromise,
	                                        this._yieldHandlers,
	                                        this._promise);
	            if (maybePromise === null) {
	                this._promiseRejected(
	                    new TypeError(
	                        "A value %s was yielded that could not be treated as a promise\u000a\u000a    See http://goo.gl/MqrFmX\u000a\u000a".replace("%s", String(value)) +
	                        "From coroutine:\u000a" +
	                        this._stack.split("\n").slice(1, -7).join("\n")
	                    )
	                );
	                return;
	            }
	        }
	        maybePromise = maybePromise._target();
	        var bitField = maybePromise._bitField;
	        ;
	        if (((bitField & 50397184) === 0)) {
	            this._yieldedPromise = maybePromise;
	            maybePromise._proxy(this, null);
	        } else if (((bitField & 33554432) !== 0)) {
	            Promise._async.invoke(
	                this._promiseFulfilled, this, maybePromise._value()
	            );
	        } else if (((bitField & 16777216) !== 0)) {
	            Promise._async.invoke(
	                this._promiseRejected, this, maybePromise._reason()
	            );
	        } else {
	            this._promiseCancelled();
	        }
	    }
	};

	Promise.coroutine = function (generatorFunction, options) {
	    if (typeof generatorFunction !== "function") {
	        throw new TypeError("generatorFunction must be a function\u000a\u000a    See http://goo.gl/MqrFmX\u000a");
	    }
	    var yieldHandler = Object(options).yieldHandler;
	    var PromiseSpawn$ = PromiseSpawn;
	    var stack = new Error().stack;
	    return function () {
	        var generator = generatorFunction.apply(this, arguments);
	        var spawn = new PromiseSpawn$(undefined, undefined, yieldHandler,
	                                      stack);
	        var ret = spawn.promise();
	        spawn._generator = generator;
	        spawn._promiseFulfilled(undefined);
	        return ret;
	    };
	};

	Promise.coroutine.addYieldHandler = function(fn) {
	    if (typeof fn !== "function") {
	        throw new TypeError("expecting a function but got " + util.classString(fn));
	    }
	    yieldHandlers.push(fn);
	};

	Promise.spawn = function (generatorFunction) {
	    debug.deprecated("Promise.spawn()", "Promise.coroutine()");
	    if (typeof generatorFunction !== "function") {
	        return apiRejection("generatorFunction must be a function\u000a\u000a    See http://goo.gl/MqrFmX\u000a");
	    }
	    var spawn = new PromiseSpawn(generatorFunction, this);
	    var ret = spawn.promise();
	    spawn._run(Promise.spawn);
	    return ret;
	};
	};


/***/ },
/* 31 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	module.exports = function(Promise) {
	var util = __webpack_require__(5);
	var async = Promise._async;
	var tryCatch = util.tryCatch;
	var errorObj = util.errorObj;

	function spreadAdapter(val, nodeback) {
	    var promise = this;
	    if (!util.isArray(val)) return successAdapter.call(promise, val, nodeback);
	    var ret =
	        tryCatch(nodeback).apply(promise._boundValue(), [null].concat(val));
	    if (ret === errorObj) {
	        async.throwLater(ret.e);
	    }
	}

	function successAdapter(val, nodeback) {
	    var promise = this;
	    var receiver = promise._boundValue();
	    var ret = val === undefined
	        ? tryCatch(nodeback).call(receiver, null)
	        : tryCatch(nodeback).call(receiver, null, val);
	    if (ret === errorObj) {
	        async.throwLater(ret.e);
	    }
	}
	function errorAdapter(reason, nodeback) {
	    var promise = this;
	    if (!reason) {
	        var newReason = new Error(reason + "");
	        newReason.cause = reason;
	        reason = newReason;
	    }
	    var ret = tryCatch(nodeback).call(promise._boundValue(), reason);
	    if (ret === errorObj) {
	        async.throwLater(ret.e);
	    }
	}

	Promise.prototype.asCallback = Promise.prototype.nodeify = function (nodeback,
	                                                                     options) {
	    if (typeof nodeback == "function") {
	        var adapter = successAdapter;
	        if (options !== undefined && Object(options).spread) {
	            adapter = spreadAdapter;
	        }
	        this._then(
	            adapter,
	            errorAdapter,
	            undefined,
	            this,
	            nodeback
	        );
	    }
	    return this;
	};
	};


/***/ },
/* 32 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	module.exports = function(Promise, INTERNAL) {
	var THIS = {};
	var util = __webpack_require__(5);
	var nodebackForPromise = __webpack_require__(19);
	var withAppended = util.withAppended;
	var maybeWrapAsError = util.maybeWrapAsError;
	var canEvaluate = util.canEvaluate;
	var TypeError = __webpack_require__(12).TypeError;
	var defaultSuffix = "Async";
	var defaultPromisified = {__isPromisified__: true};
	var noCopyProps = [
	    "arity",    "length",
	    "name",
	    "arguments",
	    "caller",
	    "callee",
	    "prototype",
	    "__isPromisified__"
	];
	var noCopyPropsPattern = new RegExp("^(?:" + noCopyProps.join("|") + ")$");

	var defaultFilter = function(name) {
	    return util.isIdentifier(name) &&
	        name.charAt(0) !== "_" &&
	        name !== "constructor";
	};

	function propsFilter(key) {
	    return !noCopyPropsPattern.test(key);
	}

	function isPromisified(fn) {
	    try {
	        return fn.__isPromisified__ === true;
	    }
	    catch (e) {
	        return false;
	    }
	}

	function hasPromisified(obj, key, suffix) {
	    var val = util.getDataPropertyOrDefault(obj, key + suffix,
	                                            defaultPromisified);
	    return val ? isPromisified(val) : false;
	}
	function checkValid(ret, suffix, suffixRegexp) {
	    for (var i = 0; i < ret.length; i += 2) {
	        var key = ret[i];
	        if (suffixRegexp.test(key)) {
	            var keyWithoutAsyncSuffix = key.replace(suffixRegexp, "");
	            for (var j = 0; j < ret.length; j += 2) {
	                if (ret[j] === keyWithoutAsyncSuffix) {
	                    throw new TypeError("Cannot promisify an API that has normal methods with '%s'-suffix\u000a\u000a    See http://goo.gl/MqrFmX\u000a"
	                        .replace("%s", suffix));
	                }
	            }
	        }
	    }
	}

	function promisifiableMethods(obj, suffix, suffixRegexp, filter) {
	    var keys = util.inheritedDataKeys(obj);
	    var ret = [];
	    for (var i = 0; i < keys.length; ++i) {
	        var key = keys[i];
	        var value = obj[key];
	        var passesDefaultFilter = filter === defaultFilter
	            ? true : defaultFilter(key, value, obj);
	        if (typeof value === "function" &&
	            !isPromisified(value) &&
	            !hasPromisified(obj, key, suffix) &&
	            filter(key, value, obj, passesDefaultFilter)) {
	            ret.push(key, value);
	        }
	    }
	    checkValid(ret, suffix, suffixRegexp);
	    return ret;
	}

	var escapeIdentRegex = function(str) {
	    return str.replace(/([$])/, "\\$");
	};

	var makeNodePromisifiedEval;
	if (true) {
	var switchCaseArgumentOrder = function(likelyArgumentCount) {
	    var ret = [likelyArgumentCount];
	    var min = Math.max(0, likelyArgumentCount - 1 - 3);
	    for(var i = likelyArgumentCount - 1; i >= min; --i) {
	        ret.push(i);
	    }
	    for(var i = likelyArgumentCount + 1; i <= 3; ++i) {
	        ret.push(i);
	    }
	    return ret;
	};

	var argumentSequence = function(argumentCount) {
	    return util.filledRange(argumentCount, "_arg", "");
	};

	var parameterDeclaration = function(parameterCount) {
	    return util.filledRange(
	        Math.max(parameterCount, 3), "_arg", "");
	};

	var parameterCount = function(fn) {
	    if (typeof fn.length === "number") {
	        return Math.max(Math.min(fn.length, 1023 + 1), 0);
	    }
	    return 0;
	};

	makeNodePromisifiedEval =
	function(callback, receiver, originalName, fn, _, multiArgs) {
	    var newParameterCount = Math.max(0, parameterCount(fn) - 1);
	    var argumentOrder = switchCaseArgumentOrder(newParameterCount);
	    var shouldProxyThis = typeof callback === "string" || receiver === THIS;

	    function generateCallForArgumentCount(count) {
	        var args = argumentSequence(count).join(", ");
	        var comma = count > 0 ? ", " : "";
	        var ret;
	        if (shouldProxyThis) {
	            ret = "ret = callback.call(this, {{args}}, nodeback); break;\n";
	        } else {
	            ret = receiver === undefined
	                ? "ret = callback({{args}}, nodeback); break;\n"
	                : "ret = callback.call(receiver, {{args}}, nodeback); break;\n";
	        }
	        return ret.replace("{{args}}", args).replace(", ", comma);
	    }

	    function generateArgumentSwitchCase() {
	        var ret = "";
	        for (var i = 0; i < argumentOrder.length; ++i) {
	            ret += "case " + argumentOrder[i] +":" +
	                generateCallForArgumentCount(argumentOrder[i]);
	        }

	        ret += "                                                             \n\
	        default:                                                             \n\
	            var args = new Array(len + 1);                                   \n\
	            var i = 0;                                                       \n\
	            for (var i = 0; i < len; ++i) {                                  \n\
	               args[i] = arguments[i];                                       \n\
	            }                                                                \n\
	            args[i] = nodeback;                                              \n\
	            [CodeForCall]                                                    \n\
	            break;                                                           \n\
	        ".replace("[CodeForCall]", (shouldProxyThis
	                                ? "ret = callback.apply(this, args);\n"
	                                : "ret = callback.apply(receiver, args);\n"));
	        return ret;
	    }

	    var getFunctionCode = typeof callback === "string"
	                                ? ("this != null ? this['"+callback+"'] : fn")
	                                : "fn";
	    var body = "'use strict';                                                \n\
	        var ret = function (Parameters) {                                    \n\
	            'use strict';                                                    \n\
	            var len = arguments.length;                                      \n\
	            var promise = new Promise(INTERNAL);                             \n\
	            promise._captureStackTrace();                                    \n\
	            var nodeback = nodebackForPromise(promise, " + multiArgs + ");   \n\
	            var ret;                                                         \n\
	            var callback = tryCatch([GetFunctionCode]);                      \n\
	            switch(len) {                                                    \n\
	                [CodeForSwitchCase]                                          \n\
	            }                                                                \n\
	            if (ret === errorObj) {                                          \n\
	                promise._rejectCallback(maybeWrapAsError(ret.e), true, true);\n\
	            }                                                                \n\
	            if (!promise._isFateSealed()) promise._setAsyncGuaranteed();     \n\
	            return promise;                                                  \n\
	        };                                                                   \n\
	        notEnumerableProp(ret, '__isPromisified__', true);                   \n\
	        return ret;                                                          \n\
	    ".replace("[CodeForSwitchCase]", generateArgumentSwitchCase())
	        .replace("[GetFunctionCode]", getFunctionCode);
	    body = body.replace("Parameters", parameterDeclaration(newParameterCount));
	    return new Function("Promise",
	                        "fn",
	                        "receiver",
	                        "withAppended",
	                        "maybeWrapAsError",
	                        "nodebackForPromise",
	                        "tryCatch",
	                        "errorObj",
	                        "notEnumerableProp",
	                        "INTERNAL",
	                        body)(
	                    Promise,
	                    fn,
	                    receiver,
	                    withAppended,
	                    maybeWrapAsError,
	                    nodebackForPromise,
	                    util.tryCatch,
	                    util.errorObj,
	                    util.notEnumerableProp,
	                    INTERNAL);
	};
	}

	function makeNodePromisifiedClosure(callback, receiver, _, fn, __, multiArgs) {
	    var defaultThis = (function() {return this;})();
	    var method = callback;
	    if (typeof method === "string") {
	        callback = fn;
	    }
	    function promisified() {
	        var _receiver = receiver;
	        if (receiver === THIS) _receiver = this;
	        var promise = new Promise(INTERNAL);
	        promise._captureStackTrace();
	        var cb = typeof method === "string" && this !== defaultThis
	            ? this[method] : callback;
	        var fn = nodebackForPromise(promise, multiArgs);
	        try {
	            cb.apply(_receiver, withAppended(arguments, fn));
	        } catch(e) {
	            promise._rejectCallback(maybeWrapAsError(e), true, true);
	        }
	        if (!promise._isFateSealed()) promise._setAsyncGuaranteed();
	        return promise;
	    }
	    util.notEnumerableProp(promisified, "__isPromisified__", true);
	    return promisified;
	}

	var makeNodePromisified = canEvaluate
	    ? makeNodePromisifiedEval
	    : makeNodePromisifiedClosure;

	function promisifyAll(obj, suffix, filter, promisifier, multiArgs) {
	    var suffixRegexp = new RegExp(escapeIdentRegex(suffix) + "$");
	    var methods =
	        promisifiableMethods(obj, suffix, suffixRegexp, filter);

	    for (var i = 0, len = methods.length; i < len; i+= 2) {
	        var key = methods[i];
	        var fn = methods[i+1];
	        var promisifiedKey = key + suffix;
	        if (promisifier === makeNodePromisified) {
	            obj[promisifiedKey] =
	                makeNodePromisified(key, THIS, key, fn, suffix, multiArgs);
	        } else {
	            var promisified = promisifier(fn, function() {
	                return makeNodePromisified(key, THIS, key,
	                                           fn, suffix, multiArgs);
	            });
	            util.notEnumerableProp(promisified, "__isPromisified__", true);
	            obj[promisifiedKey] = promisified;
	        }
	    }
	    util.toFastProperties(obj);
	    return obj;
	}

	function promisify(callback, receiver, multiArgs) {
	    return makeNodePromisified(callback, receiver, undefined,
	                                callback, null, multiArgs);
	}

	Promise.promisify = function (fn, options) {
	    if (typeof fn !== "function") {
	        throw new TypeError("expecting a function but got " + util.classString(fn));
	    }
	    if (isPromisified(fn)) {
	        return fn;
	    }
	    options = Object(options);
	    var receiver = options.context === undefined ? THIS : options.context;
	    var multiArgs = !!options.multiArgs;
	    var ret = promisify(fn, receiver, multiArgs);
	    util.copyDescriptors(fn, ret, propsFilter);
	    return ret;
	};

	Promise.promisifyAll = function (target, options) {
	    if (typeof target !== "function" && typeof target !== "object") {
	        throw new TypeError("the target of promisifyAll must be an object or a function\u000a\u000a    See http://goo.gl/MqrFmX\u000a");
	    }
	    options = Object(options);
	    var multiArgs = !!options.multiArgs;
	    var suffix = options.suffix;
	    if (typeof suffix !== "string") suffix = defaultSuffix;
	    var filter = options.filter;
	    if (typeof filter !== "function") filter = defaultFilter;
	    var promisifier = options.promisifier;
	    if (typeof promisifier !== "function") promisifier = makeNodePromisified;

	    if (!util.isIdentifier(suffix)) {
	        throw new RangeError("suffix must be a valid identifier\u000a\u000a    See http://goo.gl/MqrFmX\u000a");
	    }

	    var keys = util.inheritedDataKeys(target);
	    for (var i = 0; i < keys.length; ++i) {
	        var value = target[keys[i]];
	        if (keys[i] !== "constructor" &&
	            util.isClass(value)) {
	            promisifyAll(value.prototype, suffix, filter, promisifier,
	                multiArgs);
	            promisifyAll(value, suffix, filter, promisifier, multiArgs);
	        }
	    }

	    return promisifyAll(target, suffix, filter, promisifier, multiArgs);
	};
	};



/***/ },
/* 33 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	module.exports = function(
	    Promise, PromiseArray, tryConvertToPromise, apiRejection) {
	var util = __webpack_require__(5);
	var isObject = util.isObject;
	var es5 = __webpack_require__(6);
	var Es6Map;
	if (typeof Map === "function") Es6Map = Map;

	var mapToEntries = (function() {
	    var index = 0;
	    var size = 0;

	    function extractEntry(value, key) {
	        this[index] = value;
	        this[index + size] = key;
	        index++;
	    }

	    return function mapToEntries(map) {
	        size = map.size;
	        index = 0;
	        var ret = new Array(map.size * 2);
	        map.forEach(extractEntry, ret);
	        return ret;
	    };
	})();

	var entriesToMap = function(entries) {
	    var ret = new Es6Map();
	    var length = entries.length / 2 | 0;
	    for (var i = 0; i < length; ++i) {
	        var key = entries[length + i];
	        var value = entries[i];
	        ret.set(key, value);
	    }
	    return ret;
	};

	function PropertiesPromiseArray(obj) {
	    var isMap = false;
	    var entries;
	    if (Es6Map !== undefined && obj instanceof Es6Map) {
	        entries = mapToEntries(obj);
	        isMap = true;
	    } else {
	        var keys = es5.keys(obj);
	        var len = keys.length;
	        entries = new Array(len * 2);
	        for (var i = 0; i < len; ++i) {
	            var key = keys[i];
	            entries[i] = obj[key];
	            entries[i + len] = key;
	        }
	    }
	    this.constructor$(entries);
	    this._isMap = isMap;
	    this._init$(undefined, isMap ? -6 : -3);
	}
	util.inherits(PropertiesPromiseArray, PromiseArray);

	PropertiesPromiseArray.prototype._init = function () {};

	PropertiesPromiseArray.prototype._promiseFulfilled = function (value, index) {
	    this._values[index] = value;
	    var totalResolved = ++this._totalResolved;
	    if (totalResolved >= this._length) {
	        var val;
	        if (this._isMap) {
	            val = entriesToMap(this._values);
	        } else {
	            val = {};
	            var keyOffset = this.length();
	            for (var i = 0, len = this.length(); i < len; ++i) {
	                val[this._values[i + keyOffset]] = this._values[i];
	            }
	        }
	        this._resolve(val);
	        return true;
	    }
	    return false;
	};

	PropertiesPromiseArray.prototype.shouldCopyValues = function () {
	    return false;
	};

	PropertiesPromiseArray.prototype.getActualLength = function (len) {
	    return len >> 1;
	};

	function props(promises) {
	    var ret;
	    var castValue = tryConvertToPromise(promises);

	    if (!isObject(castValue)) {
	        return apiRejection("cannot await properties of a non-object\u000a\u000a    See http://goo.gl/MqrFmX\u000a");
	    } else if (castValue instanceof Promise) {
	        ret = castValue._then(
	            Promise.props, undefined, undefined, undefined, undefined);
	    } else {
	        ret = new PropertiesPromiseArray(castValue).promise();
	    }

	    if (castValue instanceof Promise) {
	        ret._propagateFrom(castValue, 2);
	    }
	    return ret;
	}

	Promise.prototype.props = function () {
	    return props(this);
	};

	Promise.props = function (promises) {
	    return props(promises);
	};
	};


/***/ },
/* 34 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	module.exports = function(
	    Promise, INTERNAL, tryConvertToPromise, apiRejection) {
	var util = __webpack_require__(5);

	var raceLater = function (promise) {
	    return promise.then(function(array) {
	        return race(array, promise);
	    });
	};

	function race(promises, parent) {
	    var maybePromise = tryConvertToPromise(promises);

	    if (maybePromise instanceof Promise) {
	        return raceLater(maybePromise);
	    } else {
	        promises = util.asArray(promises);
	        if (promises === null)
	            return apiRejection("expecting an array or an iterable object but got " + util.classString(promises));
	    }

	    var ret = new Promise(INTERNAL);
	    if (parent !== undefined) {
	        ret._propagateFrom(parent, 3);
	    }
	    var fulfill = ret._fulfill;
	    var reject = ret._reject;
	    for (var i = 0, len = promises.length; i < len; ++i) {
	        var val = promises[i];

	        if (val === undefined && !(i in promises)) {
	            continue;
	        }

	        Promise.cast(val)._then(fulfill, reject, undefined, ret, null);
	    }
	    return ret;
	}

	Promise.race = function (promises) {
	    return race(promises, undefined);
	};

	Promise.prototype.race = function () {
	    return race(this, undefined);
	};

	};


/***/ },
/* 35 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	module.exports = function(Promise,
	                          PromiseArray,
	                          apiRejection,
	                          tryConvertToPromise,
	                          INTERNAL,
	                          debug) {
	var getDomain = Promise._getDomain;
	var util = __webpack_require__(5);
	var tryCatch = util.tryCatch;

	function ReductionPromiseArray(promises, fn, initialValue, _each) {
	    this.constructor$(promises);
	    var domain = getDomain();
	    this._fn = domain === null ? fn : util.domainBind(domain, fn);
	    if (initialValue !== undefined) {
	        initialValue = Promise.resolve(initialValue);
	        initialValue._attachCancellationCallback(this);
	    }
	    this._initialValue = initialValue;
	    this._currentCancellable = null;
	    if(_each === INTERNAL) {
	        this._eachValues = Array(this._length);
	    } else if (_each === 0) {
	        this._eachValues = null;
	    } else {
	        this._eachValues = undefined;
	    }
	    this._promise._captureStackTrace();
	    this._init$(undefined, -5);
	}
	util.inherits(ReductionPromiseArray, PromiseArray);

	ReductionPromiseArray.prototype._gotAccum = function(accum) {
	    if (this._eachValues !== undefined && 
	        this._eachValues !== null && 
	        accum !== INTERNAL) {
	        this._eachValues.push(accum);
	    }
	};

	ReductionPromiseArray.prototype._eachComplete = function(value) {
	    if (this._eachValues !== null) {
	        this._eachValues.push(value);
	    }
	    return this._eachValues;
	};

	ReductionPromiseArray.prototype._init = function() {};

	ReductionPromiseArray.prototype._resolveEmptyArray = function() {
	    this._resolve(this._eachValues !== undefined ? this._eachValues
	                                                 : this._initialValue);
	};

	ReductionPromiseArray.prototype.shouldCopyValues = function () {
	    return false;
	};

	ReductionPromiseArray.prototype._resolve = function(value) {
	    this._promise._resolveCallback(value);
	    this._values = null;
	};

	ReductionPromiseArray.prototype._resultCancelled = function(sender) {
	    if (sender === this._initialValue) return this._cancel();
	    if (this._isResolved()) return;
	    this._resultCancelled$();
	    if (this._currentCancellable instanceof Promise) {
	        this._currentCancellable.cancel();
	    }
	    if (this._initialValue instanceof Promise) {
	        this._initialValue.cancel();
	    }
	};

	ReductionPromiseArray.prototype._iterate = function (values) {
	    this._values = values;
	    var value;
	    var i;
	    var length = values.length;
	    if (this._initialValue !== undefined) {
	        value = this._initialValue;
	        i = 0;
	    } else {
	        value = Promise.resolve(values[0]);
	        i = 1;
	    }

	    this._currentCancellable = value;

	    if (!value.isRejected()) {
	        for (; i < length; ++i) {
	            var ctx = {
	                accum: null,
	                value: values[i],
	                index: i,
	                length: length,
	                array: this
	            };
	            value = value._then(gotAccum, undefined, undefined, ctx, undefined);
	        }
	    }

	    if (this._eachValues !== undefined) {
	        value = value
	            ._then(this._eachComplete, undefined, undefined, this, undefined);
	    }
	    value._then(completed, completed, undefined, value, this);
	};

	Promise.prototype.reduce = function (fn, initialValue) {
	    return reduce(this, fn, initialValue, null);
	};

	Promise.reduce = function (promises, fn, initialValue, _each) {
	    return reduce(promises, fn, initialValue, _each);
	};

	function completed(valueOrReason, array) {
	    if (this.isFulfilled()) {
	        array._resolve(valueOrReason);
	    } else {
	        array._reject(valueOrReason);
	    }
	}

	function reduce(promises, fn, initialValue, _each) {
	    if (typeof fn !== "function") {
	        return apiRejection("expecting a function but got " + util.classString(fn));
	    }
	    var array = new ReductionPromiseArray(promises, fn, initialValue, _each);
	    return array.promise();
	}

	function gotAccum(accum) {
	    this.accum = accum;
	    this.array._gotAccum(accum);
	    var value = tryConvertToPromise(this.value, this.array._promise);
	    if (value instanceof Promise) {
	        this.array._currentCancellable = value;
	        return value._then(gotValue, undefined, undefined, this, undefined);
	    } else {
	        return gotValue.call(this, value);
	    }
	}

	function gotValue(value) {
	    var array = this.array;
	    var promise = array._promise;
	    var fn = tryCatch(array._fn);
	    promise._pushContext();
	    var ret;
	    if (array._eachValues !== undefined) {
	        ret = fn.call(promise._boundValue(), value, this.index, this.length);
	    } else {
	        ret = fn.call(promise._boundValue(),
	                              this.accum, value, this.index, this.length);
	    }
	    if (ret instanceof Promise) {
	        array._currentCancellable = ret;
	    }
	    var promiseCreated = promise._popContext();
	    debug.checkForgottenReturns(
	        ret,
	        promiseCreated,
	        array._eachValues !== undefined ? "Promise.each" : "Promise.reduce",
	        promise
	    );
	    return ret;
	}
	};


/***/ },
/* 36 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	module.exports =
	    function(Promise, PromiseArray, debug) {
	var PromiseInspection = Promise.PromiseInspection;
	var util = __webpack_require__(5);

	function SettledPromiseArray(values) {
	    this.constructor$(values);
	}
	util.inherits(SettledPromiseArray, PromiseArray);

	SettledPromiseArray.prototype._promiseResolved = function (index, inspection) {
	    this._values[index] = inspection;
	    var totalResolved = ++this._totalResolved;
	    if (totalResolved >= this._length) {
	        this._resolve(this._values);
	        return true;
	    }
	    return false;
	};

	SettledPromiseArray.prototype._promiseFulfilled = function (value, index) {
	    var ret = new PromiseInspection();
	    ret._bitField = 33554432;
	    ret._settledValueField = value;
	    return this._promiseResolved(index, ret);
	};
	SettledPromiseArray.prototype._promiseRejected = function (reason, index) {
	    var ret = new PromiseInspection();
	    ret._bitField = 16777216;
	    ret._settledValueField = reason;
	    return this._promiseResolved(index, ret);
	};

	Promise.settle = function (promises) {
	    debug.deprecated(".settle()", ".reflect()");
	    return new SettledPromiseArray(promises).promise();
	};

	Promise.prototype.settle = function () {
	    return Promise.settle(this);
	};
	};


/***/ },
/* 37 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	module.exports =
	function(Promise, PromiseArray, apiRejection) {
	var util = __webpack_require__(5);
	var RangeError = __webpack_require__(12).RangeError;
	var AggregateError = __webpack_require__(12).AggregateError;
	var isArray = util.isArray;
	var CANCELLATION = {};


	function SomePromiseArray(values) {
	    this.constructor$(values);
	    this._howMany = 0;
	    this._unwrap = false;
	    this._initialized = false;
	}
	util.inherits(SomePromiseArray, PromiseArray);

	SomePromiseArray.prototype._init = function () {
	    if (!this._initialized) {
	        return;
	    }
	    if (this._howMany === 0) {
	        this._resolve([]);
	        return;
	    }
	    this._init$(undefined, -5);
	    var isArrayResolved = isArray(this._values);
	    if (!this._isResolved() &&
	        isArrayResolved &&
	        this._howMany > this._canPossiblyFulfill()) {
	        this._reject(this._getRangeError(this.length()));
	    }
	};

	SomePromiseArray.prototype.init = function () {
	    this._initialized = true;
	    this._init();
	};

	SomePromiseArray.prototype.setUnwrap = function () {
	    this._unwrap = true;
	};

	SomePromiseArray.prototype.howMany = function () {
	    return this._howMany;
	};

	SomePromiseArray.prototype.setHowMany = function (count) {
	    this._howMany = count;
	};

	SomePromiseArray.prototype._promiseFulfilled = function (value) {
	    this._addFulfilled(value);
	    if (this._fulfilled() === this.howMany()) {
	        this._values.length = this.howMany();
	        if (this.howMany() === 1 && this._unwrap) {
	            this._resolve(this._values[0]);
	        } else {
	            this._resolve(this._values);
	        }
	        return true;
	    }
	    return false;

	};
	SomePromiseArray.prototype._promiseRejected = function (reason) {
	    this._addRejected(reason);
	    return this._checkOutcome();
	};

	SomePromiseArray.prototype._promiseCancelled = function () {
	    if (this._values instanceof Promise || this._values == null) {
	        return this._cancel();
	    }
	    this._addRejected(CANCELLATION);
	    return this._checkOutcome();
	};

	SomePromiseArray.prototype._checkOutcome = function() {
	    if (this.howMany() > this._canPossiblyFulfill()) {
	        var e = new AggregateError();
	        for (var i = this.length(); i < this._values.length; ++i) {
	            if (this._values[i] !== CANCELLATION) {
	                e.push(this._values[i]);
	            }
	        }
	        if (e.length > 0) {
	            this._reject(e);
	        } else {
	            this._cancel();
	        }
	        return true;
	    }
	    return false;
	};

	SomePromiseArray.prototype._fulfilled = function () {
	    return this._totalResolved;
	};

	SomePromiseArray.prototype._rejected = function () {
	    return this._values.length - this.length();
	};

	SomePromiseArray.prototype._addRejected = function (reason) {
	    this._values.push(reason);
	};

	SomePromiseArray.prototype._addFulfilled = function (value) {
	    this._values[this._totalResolved++] = value;
	};

	SomePromiseArray.prototype._canPossiblyFulfill = function () {
	    return this.length() - this._rejected();
	};

	SomePromiseArray.prototype._getRangeError = function (count) {
	    var message = "Input array must contain at least " +
	            this._howMany + " items but contains only " + count + " items";
	    return new RangeError(message);
	};

	SomePromiseArray.prototype._resolveEmptyArray = function () {
	    this._reject(this._getRangeError(0));
	};

	function some(promises, howMany) {
	    if ((howMany | 0) !== howMany || howMany < 0) {
	        return apiRejection("expecting a positive integer\u000a\u000a    See http://goo.gl/MqrFmX\u000a");
	    }
	    var ret = new SomePromiseArray(promises);
	    var promise = ret.promise();
	    ret.setHowMany(howMany);
	    ret.init();
	    return promise;
	}

	Promise.some = function (promises, howMany) {
	    return some(promises, howMany);
	};

	Promise.prototype.some = function (howMany) {
	    return some(this, howMany);
	};

	Promise._SomePromiseArray = SomePromiseArray;
	};


/***/ },
/* 38 */
/***/ function(module, exports) {

	"use strict";
	module.exports = function(Promise, INTERNAL) {
	var PromiseMap = Promise.map;

	Promise.prototype.filter = function (fn, options) {
	    return PromiseMap(this, fn, options, INTERNAL);
	};

	Promise.filter = function (promises, fn, options) {
	    return PromiseMap(promises, fn, options, INTERNAL);
	};
	};


/***/ },
/* 39 */
/***/ function(module, exports) {

	"use strict";
	module.exports = function(Promise, INTERNAL) {
	var PromiseReduce = Promise.reduce;
	var PromiseAll = Promise.all;

	function promiseAllThis() {
	    return PromiseAll(this);
	}

	function PromiseMapSeries(promises, fn) {
	    return PromiseReduce(promises, fn, INTERNAL, INTERNAL);
	}

	Promise.prototype.each = function (fn) {
	    return PromiseReduce(this, fn, INTERNAL, 0)
	              ._then(promiseAllThis, undefined, undefined, this, undefined);
	};

	Promise.prototype.mapSeries = function (fn) {
	    return PromiseReduce(this, fn, INTERNAL, INTERNAL);
	};

	Promise.each = function (promises, fn) {
	    return PromiseReduce(promises, fn, INTERNAL, 0)
	              ._then(promiseAllThis, undefined, undefined, promises, undefined);
	};

	Promise.mapSeries = PromiseMapSeries;
	};



/***/ },
/* 40 */
/***/ function(module, exports) {

	"use strict";
	module.exports = function(Promise) {
	var SomePromiseArray = Promise._SomePromiseArray;
	function any(promises) {
	    var ret = new SomePromiseArray(promises);
	    var promise = ret.promise();
	    ret.setHowMany(1);
	    ret.setUnwrap();
	    ret.init();
	    return promise;
	}

	Promise.any = function (promises) {
	    return any(promises);
	};

	Promise.prototype.any = function () {
	    return any(this);
	};

	};


/***/ },
/* 41 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});

	var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

	var _CB = __webpack_require__(1);

	var _CB2 = _interopRequireDefault(_CB);

	var _util = __webpack_require__(42);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	if (typeof localStorage === "undefined" || localStorage === null) {
	    var localStorage = __webpack_require__(45);
	}

	function lsWrapper() {
	    if (typeof localStorage === "undefined" || localStorage === null) {
	        var localStorage = __webpack_require__(45);
	        var nodeLocalStorage = true;
	    }

	    return {
	        setItem: function setItem(key, value) {
	            if (nodeLocalStorage) {
	                localStorage.setItem(key, value).catch(errorCB);
	            } else {
	                localStorage.setItem(key, value);
	            }
	        },

	        removeItem: function removeItem(key) {
	            if (nodeLocalStorage) {
	                localStorage.getItem(key);
	            }
	        }

	    };
	}

	/* PRIVATE METHODS */
	_CB2.default.toJSON = function (thisObj) {

	    if (thisObj.constructor === Array) {
	        for (var i = 0; i < thisObj.length; i++) {
	            thisObj[i] = _CB2.default.toJSON(thisObj[i]);
	        }
	        return thisObj;
	    }

	    var id = null;
	    var columnName = null;
	    var tableName = null;
	    var latitude = null;
	    var longitude = null;

	    if (thisObj instanceof _CB2.default.CloudGeoPoint) {
	        latitude = thisObj.document.latitude;
	        longitude = thisObj.document.longitude;
	    }

	    if (thisObj instanceof _CB2.default.CloudFile) id = thisObj.document._id;

	    if (thisObj instanceof _CB2.default.Column) columnName = thisObj.document.name;

	    if (thisObj instanceof _CB2.default.CloudTable) tableName = thisObj.document.name;

	    var obj = _CB2.default._clone(thisObj, id, longitude, latitude, tableName || columnName);

	    if (!obj instanceof _CB2.default.CloudObject || !obj instanceof _CB2.default.CloudFile || !obj instanceof _CB2.default.CloudGeoPoint || !obj instanceof _CB2.default.CloudTable || !obj instanceof _CB2.default.Column) {
	        throw "Data passed is not an instance of CloudObject or CloudFile or CloudGeoPoint";
	    }

	    if (obj instanceof _CB2.default.Column) return obj.document;

	    if (obj instanceof _CB2.default.CloudGeoPoint) return obj.document;

	    var doc = obj.document;

	    for (var key in doc) {
	        if (doc[key] instanceof _CB2.default.CloudObject || doc[key] instanceof _CB2.default.CloudFile || doc[key] instanceof _CB2.default.CloudGeoPoint || doc[key] instanceof _CB2.default.Column) {
	            //if something is a relation.
	            doc[key] = _CB2.default.toJSON(doc[key]); //serialize this object.
	        } else if (key === 'ACL') {
	            //if this is an ACL, then. Convert this from CB.ACL object to JSON - to strip all the ACL Methods.
	            var acl = doc[key].document;
	            doc[key] = acl;
	        } else if (doc[key] instanceof Array) {
	            //if this is an array.
	            //then check if this is an array of CloudObjects, if yes, then serialize every CloudObject.
	            if (doc[key][0] && (doc[key][0] instanceof _CB2.default.CloudObject || doc[key][0] instanceof _CB2.default.CloudFile || doc[key][0] instanceof _CB2.default.CloudGeoPoint || doc[key][0] instanceof _CB2.default.Column)) {
	                var arr = [];
	                for (var i = 0; i < doc[key].length; i++) {
	                    arr.push(_CB2.default.toJSON(doc[key][i]));
	                }
	                doc[key] = arr;
	            }
	        }
	    }

	    return doc;
	};

	_CB2.default.fromJSON = function (data, thisObj) {

	    //prevObj : is a copy of object before update.
	    //this is to deserialize JSON to a document which can be shoved into CloudObject. :)
	    //if data is a list it will return a list of Cl oudObjects.
	    if (!data || data === "") return null;

	    if (data instanceof Array) {

	        if (data[0] && data[0] instanceof Object) {

	            var arr = [];

	            for (var i = 0; i < data.length; i++) {
	                obj = _CB2.default.fromJSON(data[i]);
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
	            if (data[key] instanceof Array) {
	                document[key] = _CB2.default.fromJSON(data[key]);
	            } else if (data[key] instanceof Object) {
	                if (key === 'ACL') {
	                    //this is an ACL.
	                    document[key] = new _CB2.default.ACL();
	                    document[key].document = data[key];
	                } else if (data[key]._type) {
	                    if (thisObj) document[key] = _CB2.default.fromJSON(data[key], thisObj.get(key));else document[key] = _CB2.default.fromJSON(data[key]);
	                } else {
	                    document[key] = data[key];
	                }
	            } else {
	                document[key] = data[key];
	            }
	        }
	        var id = thisObj;
	        if (thisObj instanceof Object) id = thisObj._id || thisObj.id;
	        if (!thisObj || data['_id'] === id) {
	            var id = null;
	            var latitude = null;
	            var longitude = null;
	            var name = null;
	            if (document._type === "file") id = document._id;
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
	            var obj = _CB2.default._getObjectByType(document._type, id, longitude, latitude, name);
	            obj.document = document;

	            thisObj = obj;
	        } else {
	            thisObj.document = document;
	        }

	        if (thisObj instanceof _CB2.default.CloudObject || thisObj instanceof _CB2.default.CloudUser || thisObj instanceof _CB2.default.CloudRole || thisObj instanceof _CB2.default.CloudFile) {
	            //activate ACL.
	            if (thisObj.document["ACL"]) thisObj.document["ACL"].parent = thisObj;
	        }

	        return thisObj;
	    } else {
	        //if this is plain json.
	        return data;
	    }
	};

	_CB2.default._getObjectByType = function (type, id, longitude, latitude, name) {

	    var obj = null;

	    if (type === 'custom') {
	        obj = new _CB2.default.CloudObject();
	    }

	    if (type === 'role') {
	        obj = new _CB2.default.CloudRole();
	    }

	    if (type === 'user') {
	        obj = new _CB2.default.CloudUser();
	    }

	    if (type === 'file') {
	        obj = new _CB2.default.CloudFile(id);
	    }

	    if (type === 'point') {
	        obj = new _CB2.default.CloudGeoPoint(0, 0);
	        obj.document.latitude = Number(latitude);
	        obj.document.longitude = Number(longitude);
	    }

	    if (type === 'table') {
	        obj = new _CB2.default.CloudTable(name);
	    }

	    if (type === 'column') {
	        obj = new _CB2.default.Column(name);
	    }

	    return obj;
	};

	_CB2.default._validate = function () {
	    if (!_CB2.default.appId) {
	        throw "AppID is null. Please use CB.CloudApp.init to initialize your app.";
	    }

	    if (!_CB2.default.appKey) {
	        throw "AppKey is null. Please use CB.CloudApp.init to initialize your app.";
	    }
	};

	function _all(arrayOfPromises) {
	    //this is simplilar to Q.all for jQuery promises.
	    return jQuery.when.apply(jQuery, arrayOfPromises).then(function () {
	        return Array.prototype.slice.call(arguments, 0);
	    });
	};

	_CB2.default._clone = function (obj, id, longitude, latitude, name) {
	    var n_obj = {};
	    if (obj.document._type && obj.document._type != 'point') {
	        n_obj = _CB2.default._getObjectByType(obj.document._type, id, longitude, latitude, name);
	        var doc = obj.document;
	        var doc2 = {};
	        for (var key in doc) {
	            if (doc[key] instanceof _CB2.default.CloudFile) doc2[key] = _CB2.default._clone(doc[key], doc[key].document._id);else if (doc[key] instanceof _CB2.default.CloudObject) {
	                doc2[key] = _CB2.default._clone(doc[key], null);
	            } else if (doc[key] instanceof _CB2.default.CloudGeoPoint) {
	                doc2[key] = _CB2.default._clone(doc[key], null);
	            } else doc2[key] = doc[key];
	        }
	    } else if (obj instanceof _CB2.default.CloudGeoPoint) {
	        n_obj = new _CB2.default.CloudGeoPoint(obj.get('longitude'), obj.get('latitude'));
	        return n_obj;
	    }

	    n_obj.document = doc2;

	    return n_obj;
	};

	_CB2.default._request = function (method, url, params, isServiceUrl, isFile, progressCallback) {

	    _CB2.default._validate();

	    // if(!params){
	    //     var params = {};
	    // }
	    // if(typeof params != "object"){
	    //     params = JSON.parse(params);
	    // }

	    // params.sdk = "JavaScript"
	    // params = JSON.stringify(params)

	    if (!_CB2.default.CloudApp._isConnected) throw "Your CloudApp is disconnected. Please use CB.CloudApp.connect() and try again.";

	    var def = new _CB2.default.Promise();
	    var Axios;
	    var headers = {};
	    var axiosRetry = __webpack_require__(46);

	    if (_CB2.default._isNode) {
	        Axios = __webpack_require__(49);
	    } else {
	        Axios = __webpack_require__(50);
	    }

	    if (!isServiceUrl) {
	        var ssid = _CB2.default._getSessionId();
	        if (ssid != null) headers.sessionID = ssid;
	    }

	    if (params && (typeof params === 'undefined' ? 'undefined' : _typeof(params)) != "object") {
	        params = JSON.parse(params);
	    }
	    axiosRetry(Axios, { retryDelay: axiosRetry.exponentialDelay });
	    Axios({
	        method: method,
	        url: url,
	        data: params,
	        headers: headers,
	        onUploadProgress: function onUploadProgress(event) {
	            if (event.lengthComputable) {
	                var percentComplete = event.loaded / event.total;
	                if (progressCallback) progressCallback(percentComplete);
	            }
	        }
	    }).then(function (res) {
	        if (!isServiceUrl) {
	            var sessionID = res.headers.sessionid;
	            if (sessionID) localStorage.setItem('sessionID', sessionID);else localStorage.removeItem('sessionID');
	        }
	        def.resolve(JSON.stringify(res.data));
	    }, function (err) {
	        def.reject(err);
	    });

	    return def.promise;
	};

	_CB2.default._getSessionId = function () {
	    return localStorage.getItem('sessionID');
	};

	_CB2.default._columnValidation = function (column, cloudtable) {
	    var defaultColumn = ['id', 'createdAt', 'updatedAt', 'ACL'];
	    if (cloudtable.document.type == 'user') {
	        defaultColumn.concat(['username', 'email', 'password', 'roles']);
	    } else if (cloudtable.document.type == 'role') {
	        defaultColumn.push('name');
	    }

	    var index = defaultColumn.indexOf(column.name.toLowerCase());
	    if (index === -1) return true;else return false;
	};

	_CB2.default._tableValidation = function (tableName) {

	    if (!tableName) //if table name is empty
	        throw "table name cannot be empty";

	    if (!isNaN(tableName[0])) throw "table name should not start with a number";

	    if (!tableName.match(/^\S+$/)) throw "table name should not contain spaces";

	    var pattern = new RegExp(/[~`!#$%\^&*+=\-\[\]\\';,/{}|\\":<>\?]/);
	    if (pattern.test(tableName)) throw "table not shoul not contain special characters";
	};

	_CB2.default._modified = function (thisObj, columnName) {
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

	_CB2.default._columnNameValidation = function (columnName) {
	    if (!columnName) //if table name is empty
	        throw "table name cannot be empty";

	    if (!isNaN(columnName[0])) throw "column name should not start with a number";

	    if (!columnName.match(/^\S+$/)) throw "column name should not contain spaces";

	    var pattern = new RegExp(/[~`!#$%\^&*+=\-\[\]\\';,/{}|\\":<>\?]/);
	    if (pattern.test(columnName)) throw "column name not should not contain special characters";
	};

	_CB2.default._columnDataTypeValidation = function (dataType) {

	    if (!dataType) throw "data type cannot be empty";

	    var dataTypeList = ['Text', 'Email', 'URL', 'Number', 'Boolean', 'DateTime', 'GeoPoint', 'File', 'List', 'Relation', 'Object', 'EncryptedText'];
	    var index = dataTypeList.indexOf(dataType);
	    if (index < 0) throw "invalid data type";
	};

	_CB2.default._defaultColumns = function (type) {
	    var id = new _CB2.default.Column('id');
	    id.dataType = 'Id';
	    id.required = true;
	    id.unique = true;
	    id.document.isDeletable = false;
	    id.document.isEditable = false;

	    var expires = new _CB2.default.Column('expires');
	    expires.dataType = 'DateTime';
	    expires.document.isDeletable = false;
	    expires.document.isEditable = false;

	    var createdAt = new _CB2.default.Column('createdAt');
	    createdAt.dataType = 'DateTime';
	    createdAt.required = true;
	    createdAt.document.isDeletable = false;
	    createdAt.document.isEditable = false;

	    var updatedAt = new _CB2.default.Column('updatedAt');
	    updatedAt.dataType = 'DateTime';
	    updatedAt.required = true;
	    updatedAt.document.isDeletable = false;
	    updatedAt.document.isEditable = false;

	    var ACL = new _CB2.default.Column('ACL');
	    ACL.dataType = 'ACL';
	    ACL.required = true;
	    ACL.document.isDeletable = false;
	    ACL.document.isEditable = false;

	    var col = [id, expires, updatedAt, createdAt, ACL];
	    if (type === "custom") {
	        return col;
	    } else if (type === "user") {
	        var username = new _CB2.default.Column('username');
	        username.dataType = 'Text';
	        username.required = false;
	        username.unique = true;
	        username.document.isDeletable = false;
	        username.document.isEditable = false;

	        var email = new _CB2.default.Column('email');
	        email.dataType = 'Email';
	        email.unique = true;
	        email.document.isDeletable = false;
	        email.document.isEditable = false;

	        var password = new _CB2.default.Column('password');
	        password.dataType = 'EncryptedText';
	        password.required = false;
	        password.document.isDeletable = false;
	        password.document.isEditable = false;

	        var roles = new _CB2.default.Column('roles');
	        roles.dataType = 'List';
	        roles.relatedTo = 'Role';
	        roles.relatedToType = 'role';
	        roles.document.relationType = 'table';
	        roles.document.isDeletable = false;
	        roles.document.isEditable = false;

	        var socialAuth = new _CB2.default.Column('socialAuth');
	        socialAuth.dataType = 'List';
	        socialAuth.relatedTo = 'Object';
	        socialAuth.required = false;
	        socialAuth.document.isDeletable = false;
	        socialAuth.document.isEditable = false;

	        var verified = new _CB2.default.Column('verified');
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
	        var name = new _CB2.default.Column('name');
	        name.dataType = 'Text';
	        name.unique = true;
	        name.required = true;
	        name.document.isDeletable = false;
	        name.document.isEditable = false;
	        col.push(name);
	        return col;
	    } else if (type === "device") {
	        var channels = new _CB2.default.Column('channels');
	        channels.dataType = 'List';
	        channels.relatedTo = 'Text';
	        channels.document.isDeletable = false;
	        channels.document.isEditable = false;

	        var deviceToken = new _CB2.default.Column('deviceToken');
	        deviceToken.dataType = 'Text';
	        deviceToken.unique = true;
	        deviceToken.document.isDeletable = false;
	        deviceToken.document.isEditable = false;

	        var deviceOS = new _CB2.default.Column('deviceOS');
	        deviceOS.dataType = 'Text';
	        deviceOS.document.isDeletable = false;
	        deviceOS.document.isEditable = false;

	        var timezone = new _CB2.default.Column('timezone');
	        timezone.dataType = 'Text';
	        timezone.document.isDeletable = false;
	        timezone.document.isEditable = false;

	        var metadata = new _CB2.default.Column('metadata');
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

	_CB2.default._fileCheck = function (obj) {

	    //obj is an instance of CloudObject.
	    var deferred = new _CB2.default.Promise();
	    var promises = [];
	    for (var key in obj.document) {
	        if (obj.document[key] instanceof Array && obj.document[key][0] instanceof _CB2.default.CloudFile) {
	            for (var i = 0; i < obj.document[key].length; i++) {
	                if (!obj.document[key][i].id) promises.push(obj.document[key][i].save());
	            }
	        } else if (obj.document[key] instanceof Object && obj.document[key] instanceof _CB2.default.CloudFile) {
	            if (!obj.document[key].id) promises.push(obj.document[key].save());
	        }
	    }
	    if (promises.length > 0) {
	        _CB2.default.Promise.all(promises).then(function () {
	            var res = arguments;
	            var j = 0;
	            for (var key in obj.document) {
	                if (obj.document[key] instanceof Array && obj.document[key][0] instanceof _CB2.default.CloudFile) {
	                    for (var i = 0; i < obj.document[key].length; i++) {
	                        if (!obj.document[key][i].id) {
	                            obj.document[key][i] = res[j];
	                            j = j + 1;
	                        }
	                    }
	                } else if (obj.document[key] instanceof Object && obj.document[key] instanceof _CB2.default.CloudFile) {
	                    if (!obj.document[key].id) {
	                        obj.document[key] = res[j];
	                        j = j + 1;
	                    }
	                }
	            }
	            deferred.resolve(obj);
	        }, function (err) {
	            deferred.reject(err);
	        });
	    } else {
	        deferred.resolve(obj);
	    }
	    return deferred.promise;
	};

	_CB2.default._bulkObjFileCheck = function (array) {
	    var deferred = new _CB2.default.Promise();
	    var promises = [];
	    for (var i = 0; i < array.length; i++) {
	        promises.push(_CB2.default._fileCheck(array[i]));
	    }
	    _CB2.default.Promise.all(promises).then(function () {
	        deferred.resolve(arguments);
	    }, function (err) {
	        deferred.reject(err);
	    });
	    return deferred.promise;
	};

	_CB2.default._generateHash = function () {
	    var hash = "";
	    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
	    for (var i = 0; i < 8; i++) {
	        hash = hash + possible.charAt(Math.floor(Math.random() * possible.length));
	    }
	    return hash;
	};

	_CB2.default._isJsonString = function (str) {
	    try {
	        JSON.parse(str);
	    } catch (e) {
	        return false;
	    }
	    return true;
	};

	_CB2.default._isJsonObject = function (obj) {
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
	_CB2.default._getCookie = function (name) {
	    if (typeof Storage !== "undefined") {
	        // Code for localStorage/sessionStorage.
	        if (new Date(localStorage.getItem(name + "_expires")) > new Date()) {
	            return localStorage.getItem(name);
	        } else {
	            _CB2.default._deleteCookie(name);
	        }
	    } else {
	        // Sorry! No Web Storage support..
	        if (typeof document !== 'undefined') {
	            var name = name + "=";
	            var ca = document.cookie.split(';');
	            for (var i = 0; i < ca.length; i++) {
	                var c = ca[i];
	                while (c.charAt(0) == ' ') {
	                    c = c.substring(1);
	                }if (c.indexOf(name) == 0) return c.substring(name.length, c.length);
	            }
	            return "";
	        }
	    }
	};

	//Description : Deletes the cookie
	//Params : @name : Name of the cookie.
	//Returns : void
	_CB2.default._deleteCookie = function (name) {
	    //save the user to the cookie.
	    if (typeof Storage !== "undefined") {
	        // Code for localStorage/sessionStorage.
	        localStorage.removeItem(name);
	        localStorage.removeItem(name + "_expires");
	    } else {
	        if (typeof document !== 'undefined') {
	            var d = new Date();
	            d.setTime(d.getTime() + 0 * 0 * 0 * 0 * 0);
	            var expires = "expires=" + d.toUTCString();
	            document.cookie = name + "=" + +"; " + expires;
	        }
	    }
	};

	//Description : Creates cookie.
	//Params : @name : Name of the cookie.
	//         @content : Content as string / JSON / int / etc.
	//         @expires : Expiration time in millisecinds.
	//Returns : content as string.
	_CB2.default._createCookie = function (name, content, expires) {
	    var d = new Date();
	    d.setTime(d.getTime() + expires);
	    if (typeof Storage !== "undefined") {
	        // Code for localStorage/sessionStorage.
	        localStorage.setItem(name, content.toString());
	        localStorage.setItem(name + "_expires", d);
	    } else {
	        if (typeof document !== 'undefined') {

	            var expires = "expires=" + d.toUTCString();
	            document.cookie = +name + "=" + content.toString() + "; " + expires;
	        }
	    }
	};

	//Description : returns query string.
	//Params : @key : key
	//Returns : query string.
	_CB2.default._getQuerystringByKey = function (key) {
	    key = key.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
	    var regex = new RegExp("[\\?&]" + key + "=([^&#]*)"),
	        results = regex.exec(location.search);
	    return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
	};

	//Set sessionId if cbtoken is found in url
	if (typeof location !== 'undefined' && location.search) {
	    var cbtoken = _CB2.default._getQuerystringByKey("cbtoken");
	    if (cbtoken && cbtoken !== "") {
	        localStorage.setItem('sessionID', cbtoken);
	    }
	}

	//Description : returns browser name
	//Params : null
	//Returns : browser name.
	_CB2.default._getThisBrowserName = function () {

	    // check if library is used as a Node.js module
	    if (typeof window !== 'undefined') {

	        // store navigator properties to use later
	        var userAgent = 'navigator' in window && 'userAgent' in navigator && navigator.userAgent.toLowerCase() || '';
	        var vendor = 'navigator' in window && 'vendor' in navigator && navigator.vendor.toLowerCase() || '';
	        var appVersion = 'navigator' in window && 'appVersion' in navigator && navigator.appVersion.toLowerCase() || '';

	        var is = {};

	        // is current browser chrome?
	        is.chrome = function () {
	            return (/chrome|chromium/i.test(userAgent) && /google inc/.test(vendor)
	            );
	        };

	        // is current browser firefox?
	        is.firefox = function () {
	            return (/firefox/i.test(userAgent)
	            );
	        };

	        // is current browser edge?
	        is.edge = function () {
	            return (/edge/i.test(userAgent)
	            );
	        };

	        // is current browser internet explorer?
	        // parameter is optional
	        is.ie = function (version) {
	            if (!version) {
	                return (/msie/i.test(userAgent) || "ActiveXObject" in window
	                );
	            }
	            if (version >= 11) {
	                return "ActiveXObject" in window;
	            }
	            return new RegExp('msie ' + version).test(userAgent);
	        };

	        // is current browser opera?
	        is.opera = function () {
	            return (/^Opera\//.test(userAgent) || // Opera 12 and older versions
	                /\x20OPR\//.test(userAgent)
	            ); // Opera 15+
	        };

	        // is current browser safari?
	        is.safari = function () {
	            return (/safari/i.test(userAgent) && /apple computer/i.test(vendor)
	            );
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
	};

	exports.default = true;

/***/ },
/* 42 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(global, process) {// Copyright Joyent, Inc. and other Node contributors.
	//
	// Permission is hereby granted, free of charge, to any person obtaining a
	// copy of this software and associated documentation files (the
	// "Software"), to deal in the Software without restriction, including
	// without limitation the rights to use, copy, modify, merge, publish,
	// distribute, sublicense, and/or sell copies of the Software, and to permit
	// persons to whom the Software is furnished to do so, subject to the
	// following conditions:
	//
	// The above copyright notice and this permission notice shall be included
	// in all copies or substantial portions of the Software.
	//
	// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
	// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
	// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
	// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
	// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
	// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
	// USE OR OTHER DEALINGS IN THE SOFTWARE.

	var formatRegExp = /%[sdj%]/g;
	exports.format = function(f) {
	  if (!isString(f)) {
	    var objects = [];
	    for (var i = 0; i < arguments.length; i++) {
	      objects.push(inspect(arguments[i]));
	    }
	    return objects.join(' ');
	  }

	  var i = 1;
	  var args = arguments;
	  var len = args.length;
	  var str = String(f).replace(formatRegExp, function(x) {
	    if (x === '%%') return '%';
	    if (i >= len) return x;
	    switch (x) {
	      case '%s': return String(args[i++]);
	      case '%d': return Number(args[i++]);
	      case '%j':
	        try {
	          return JSON.stringify(args[i++]);
	        } catch (_) {
	          return '[Circular]';
	        }
	      default:
	        return x;
	    }
	  });
	  for (var x = args[i]; i < len; x = args[++i]) {
	    if (isNull(x) || !isObject(x)) {
	      str += ' ' + x;
	    } else {
	      str += ' ' + inspect(x);
	    }
	  }
	  return str;
	};


	// Mark that a method should not be used.
	// Returns a modified function which warns once by default.
	// If --no-deprecation is set, then it is a no-op.
	exports.deprecate = function(fn, msg) {
	  // Allow for deprecating things in the process of starting up.
	  if (isUndefined(global.process)) {
	    return function() {
	      return exports.deprecate(fn, msg).apply(this, arguments);
	    };
	  }

	  if (process.noDeprecation === true) {
	    return fn;
	  }

	  var warned = false;
	  function deprecated() {
	    if (!warned) {
	      if (process.throwDeprecation) {
	        throw new Error(msg);
	      } else if (process.traceDeprecation) {
	        console.trace(msg);
	      } else {
	        console.error(msg);
	      }
	      warned = true;
	    }
	    return fn.apply(this, arguments);
	  }

	  return deprecated;
	};


	var debugs = {};
	var debugEnviron;
	exports.debuglog = function(set) {
	  if (isUndefined(debugEnviron))
	    debugEnviron = process.env.NODE_DEBUG || '';
	  set = set.toUpperCase();
	  if (!debugs[set]) {
	    if (new RegExp('\\b' + set + '\\b', 'i').test(debugEnviron)) {
	      var pid = process.pid;
	      debugs[set] = function() {
	        var msg = exports.format.apply(exports, arguments);
	        console.error('%s %d: %s', set, pid, msg);
	      };
	    } else {
	      debugs[set] = function() {};
	    }
	  }
	  return debugs[set];
	};


	/**
	 * Echos the value of a value. Trys to print the value out
	 * in the best way possible given the different types.
	 *
	 * @param {Object} obj The object to print out.
	 * @param {Object} opts Optional options object that alters the output.
	 */
	/* legacy: obj, showHidden, depth, colors*/
	function inspect(obj, opts) {
	  // default options
	  var ctx = {
	    seen: [],
	    stylize: stylizeNoColor
	  };
	  // legacy...
	  if (arguments.length >= 3) ctx.depth = arguments[2];
	  if (arguments.length >= 4) ctx.colors = arguments[3];
	  if (isBoolean(opts)) {
	    // legacy...
	    ctx.showHidden = opts;
	  } else if (opts) {
	    // got an "options" object
	    exports._extend(ctx, opts);
	  }
	  // set default options
	  if (isUndefined(ctx.showHidden)) ctx.showHidden = false;
	  if (isUndefined(ctx.depth)) ctx.depth = 2;
	  if (isUndefined(ctx.colors)) ctx.colors = false;
	  if (isUndefined(ctx.customInspect)) ctx.customInspect = true;
	  if (ctx.colors) ctx.stylize = stylizeWithColor;
	  return formatValue(ctx, obj, ctx.depth);
	}
	exports.inspect = inspect;


	// http://en.wikipedia.org/wiki/ANSI_escape_code#graphics
	inspect.colors = {
	  'bold' : [1, 22],
	  'italic' : [3, 23],
	  'underline' : [4, 24],
	  'inverse' : [7, 27],
	  'white' : [37, 39],
	  'grey' : [90, 39],
	  'black' : [30, 39],
	  'blue' : [34, 39],
	  'cyan' : [36, 39],
	  'green' : [32, 39],
	  'magenta' : [35, 39],
	  'red' : [31, 39],
	  'yellow' : [33, 39]
	};

	// Don't use 'blue' not visible on cmd.exe
	inspect.styles = {
	  'special': 'cyan',
	  'number': 'yellow',
	  'boolean': 'yellow',
	  'undefined': 'grey',
	  'null': 'bold',
	  'string': 'green',
	  'date': 'magenta',
	  // "name": intentionally not styling
	  'regexp': 'red'
	};


	function stylizeWithColor(str, styleType) {
	  var style = inspect.styles[styleType];

	  if (style) {
	    return '\u001b[' + inspect.colors[style][0] + 'm' + str +
	           '\u001b[' + inspect.colors[style][1] + 'm';
	  } else {
	    return str;
	  }
	}


	function stylizeNoColor(str, styleType) {
	  return str;
	}


	function arrayToHash(array) {
	  var hash = {};

	  array.forEach(function(val, idx) {
	    hash[val] = true;
	  });

	  return hash;
	}


	function formatValue(ctx, value, recurseTimes) {
	  // Provide a hook for user-specified inspect functions.
	  // Check that value is an object with an inspect function on it
	  if (ctx.customInspect &&
	      value &&
	      isFunction(value.inspect) &&
	      // Filter out the util module, it's inspect function is special
	      value.inspect !== exports.inspect &&
	      // Also filter out any prototype objects using the circular check.
	      !(value.constructor && value.constructor.prototype === value)) {
	    var ret = value.inspect(recurseTimes, ctx);
	    if (!isString(ret)) {
	      ret = formatValue(ctx, ret, recurseTimes);
	    }
	    return ret;
	  }

	  // Primitive types cannot have properties
	  var primitive = formatPrimitive(ctx, value);
	  if (primitive) {
	    return primitive;
	  }

	  // Look up the keys of the object.
	  var keys = Object.keys(value);
	  var visibleKeys = arrayToHash(keys);

	  if (ctx.showHidden) {
	    keys = Object.getOwnPropertyNames(value);
	  }

	  // IE doesn't make error fields non-enumerable
	  // http://msdn.microsoft.com/en-us/library/ie/dww52sbt(v=vs.94).aspx
	  if (isError(value)
	      && (keys.indexOf('message') >= 0 || keys.indexOf('description') >= 0)) {
	    return formatError(value);
	  }

	  // Some type of object without properties can be shortcutted.
	  if (keys.length === 0) {
	    if (isFunction(value)) {
	      var name = value.name ? ': ' + value.name : '';
	      return ctx.stylize('[Function' + name + ']', 'special');
	    }
	    if (isRegExp(value)) {
	      return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
	    }
	    if (isDate(value)) {
	      return ctx.stylize(Date.prototype.toString.call(value), 'date');
	    }
	    if (isError(value)) {
	      return formatError(value);
	    }
	  }

	  var base = '', array = false, braces = ['{', '}'];

	  // Make Array say that they are Array
	  if (isArray(value)) {
	    array = true;
	    braces = ['[', ']'];
	  }

	  // Make functions say that they are functions
	  if (isFunction(value)) {
	    var n = value.name ? ': ' + value.name : '';
	    base = ' [Function' + n + ']';
	  }

	  // Make RegExps say that they are RegExps
	  if (isRegExp(value)) {
	    base = ' ' + RegExp.prototype.toString.call(value);
	  }

	  // Make dates with properties first say the date
	  if (isDate(value)) {
	    base = ' ' + Date.prototype.toUTCString.call(value);
	  }

	  // Make error with message first say the error
	  if (isError(value)) {
	    base = ' ' + formatError(value);
	  }

	  if (keys.length === 0 && (!array || value.length == 0)) {
	    return braces[0] + base + braces[1];
	  }

	  if (recurseTimes < 0) {
	    if (isRegExp(value)) {
	      return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
	    } else {
	      return ctx.stylize('[Object]', 'special');
	    }
	  }

	  ctx.seen.push(value);

	  var output;
	  if (array) {
	    output = formatArray(ctx, value, recurseTimes, visibleKeys, keys);
	  } else {
	    output = keys.map(function(key) {
	      return formatProperty(ctx, value, recurseTimes, visibleKeys, key, array);
	    });
	  }

	  ctx.seen.pop();

	  return reduceToSingleString(output, base, braces);
	}


	function formatPrimitive(ctx, value) {
	  if (isUndefined(value))
	    return ctx.stylize('undefined', 'undefined');
	  if (isString(value)) {
	    var simple = '\'' + JSON.stringify(value).replace(/^"|"$/g, '')
	                                             .replace(/'/g, "\\'")
	                                             .replace(/\\"/g, '"') + '\'';
	    return ctx.stylize(simple, 'string');
	  }
	  if (isNumber(value))
	    return ctx.stylize('' + value, 'number');
	  if (isBoolean(value))
	    return ctx.stylize('' + value, 'boolean');
	  // For some reason typeof null is "object", so special case here.
	  if (isNull(value))
	    return ctx.stylize('null', 'null');
	}


	function formatError(value) {
	  return '[' + Error.prototype.toString.call(value) + ']';
	}


	function formatArray(ctx, value, recurseTimes, visibleKeys, keys) {
	  var output = [];
	  for (var i = 0, l = value.length; i < l; ++i) {
	    if (hasOwnProperty(value, String(i))) {
	      output.push(formatProperty(ctx, value, recurseTimes, visibleKeys,
	          String(i), true));
	    } else {
	      output.push('');
	    }
	  }
	  keys.forEach(function(key) {
	    if (!key.match(/^\d+$/)) {
	      output.push(formatProperty(ctx, value, recurseTimes, visibleKeys,
	          key, true));
	    }
	  });
	  return output;
	}


	function formatProperty(ctx, value, recurseTimes, visibleKeys, key, array) {
	  var name, str, desc;
	  desc = Object.getOwnPropertyDescriptor(value, key) || { value: value[key] };
	  if (desc.get) {
	    if (desc.set) {
	      str = ctx.stylize('[Getter/Setter]', 'special');
	    } else {
	      str = ctx.stylize('[Getter]', 'special');
	    }
	  } else {
	    if (desc.set) {
	      str = ctx.stylize('[Setter]', 'special');
	    }
	  }
	  if (!hasOwnProperty(visibleKeys, key)) {
	    name = '[' + key + ']';
	  }
	  if (!str) {
	    if (ctx.seen.indexOf(desc.value) < 0) {
	      if (isNull(recurseTimes)) {
	        str = formatValue(ctx, desc.value, null);
	      } else {
	        str = formatValue(ctx, desc.value, recurseTimes - 1);
	      }
	      if (str.indexOf('\n') > -1) {
	        if (array) {
	          str = str.split('\n').map(function(line) {
	            return '  ' + line;
	          }).join('\n').substr(2);
	        } else {
	          str = '\n' + str.split('\n').map(function(line) {
	            return '   ' + line;
	          }).join('\n');
	        }
	      }
	    } else {
	      str = ctx.stylize('[Circular]', 'special');
	    }
	  }
	  if (isUndefined(name)) {
	    if (array && key.match(/^\d+$/)) {
	      return str;
	    }
	    name = JSON.stringify('' + key);
	    if (name.match(/^"([a-zA-Z_][a-zA-Z_0-9]*)"$/)) {
	      name = name.substr(1, name.length - 2);
	      name = ctx.stylize(name, 'name');
	    } else {
	      name = name.replace(/'/g, "\\'")
	                 .replace(/\\"/g, '"')
	                 .replace(/(^"|"$)/g, "'");
	      name = ctx.stylize(name, 'string');
	    }
	  }

	  return name + ': ' + str;
	}


	function reduceToSingleString(output, base, braces) {
	  var numLinesEst = 0;
	  var length = output.reduce(function(prev, cur) {
	    numLinesEst++;
	    if (cur.indexOf('\n') >= 0) numLinesEst++;
	    return prev + cur.replace(/\u001b\[\d\d?m/g, '').length + 1;
	  }, 0);

	  if (length > 60) {
	    return braces[0] +
	           (base === '' ? '' : base + '\n ') +
	           ' ' +
	           output.join(',\n  ') +
	           ' ' +
	           braces[1];
	  }

	  return braces[0] + base + ' ' + output.join(', ') + ' ' + braces[1];
	}


	// NOTE: These type checking functions intentionally don't use `instanceof`
	// because it is fragile and can be easily faked with `Object.create()`.
	function isArray(ar) {
	  return Array.isArray(ar);
	}
	exports.isArray = isArray;

	function isBoolean(arg) {
	  return typeof arg === 'boolean';
	}
	exports.isBoolean = isBoolean;

	function isNull(arg) {
	  return arg === null;
	}
	exports.isNull = isNull;

	function isNullOrUndefined(arg) {
	  return arg == null;
	}
	exports.isNullOrUndefined = isNullOrUndefined;

	function isNumber(arg) {
	  return typeof arg === 'number';
	}
	exports.isNumber = isNumber;

	function isString(arg) {
	  return typeof arg === 'string';
	}
	exports.isString = isString;

	function isSymbol(arg) {
	  return typeof arg === 'symbol';
	}
	exports.isSymbol = isSymbol;

	function isUndefined(arg) {
	  return arg === void 0;
	}
	exports.isUndefined = isUndefined;

	function isRegExp(re) {
	  return isObject(re) && objectToString(re) === '[object RegExp]';
	}
	exports.isRegExp = isRegExp;

	function isObject(arg) {
	  return typeof arg === 'object' && arg !== null;
	}
	exports.isObject = isObject;

	function isDate(d) {
	  return isObject(d) && objectToString(d) === '[object Date]';
	}
	exports.isDate = isDate;

	function isError(e) {
	  return isObject(e) &&
	      (objectToString(e) === '[object Error]' || e instanceof Error);
	}
	exports.isError = isError;

	function isFunction(arg) {
	  return typeof arg === 'function';
	}
	exports.isFunction = isFunction;

	function isPrimitive(arg) {
	  return arg === null ||
	         typeof arg === 'boolean' ||
	         typeof arg === 'number' ||
	         typeof arg === 'string' ||
	         typeof arg === 'symbol' ||  // ES6 symbol
	         typeof arg === 'undefined';
	}
	exports.isPrimitive = isPrimitive;

	exports.isBuffer = __webpack_require__(43);

	function objectToString(o) {
	  return Object.prototype.toString.call(o);
	}


	function pad(n) {
	  return n < 10 ? '0' + n.toString(10) : n.toString(10);
	}


	var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep',
	              'Oct', 'Nov', 'Dec'];

	// 26 Feb 16:19:34
	function timestamp() {
	  var d = new Date();
	  var time = [pad(d.getHours()),
	              pad(d.getMinutes()),
	              pad(d.getSeconds())].join(':');
	  return [d.getDate(), months[d.getMonth()], time].join(' ');
	}


	// log is just a thin wrapper to console.log that prepends a timestamp
	exports.log = function() {
	  console.log('%s - %s', timestamp(), exports.format.apply(exports, arguments));
	};


	/**
	 * Inherit the prototype methods from one constructor into another.
	 *
	 * The Function.prototype.inherits from lang.js rewritten as a standalone
	 * function (not on Function.prototype). NOTE: If this file is to be loaded
	 * during bootstrapping this function needs to be rewritten using some native
	 * functions as prototype setup using normal JavaScript does not work as
	 * expected during bootstrapping (see mirror.js in r114903).
	 *
	 * @param {function} ctor Constructor function which needs to inherit the
	 *     prototype.
	 * @param {function} superCtor Constructor function to inherit prototype from.
	 */
	exports.inherits = __webpack_require__(44);

	exports._extend = function(origin, add) {
	  // Don't do anything if add isn't an object
	  if (!add || !isObject(add)) return origin;

	  var keys = Object.keys(add);
	  var i = keys.length;
	  while (i--) {
	    origin[keys[i]] = add[keys[i]];
	  }
	  return origin;
	};

	function hasOwnProperty(obj, prop) {
	  return Object.prototype.hasOwnProperty.call(obj, prop);
	}

	/* WEBPACK VAR INJECTION */}.call(exports, (function() { return this; }()), __webpack_require__(2)))

/***/ },
/* 43 */
/***/ function(module, exports) {

	module.exports = function isBuffer(arg) {
	  return arg && typeof arg === 'object'
	    && typeof arg.copy === 'function'
	    && typeof arg.fill === 'function'
	    && typeof arg.readUInt8 === 'function';
	}

/***/ },
/* 44 */
/***/ function(module, exports) {

	if (typeof Object.create === 'function') {
	  // implementation from standard node.js 'util' module
	  module.exports = function inherits(ctor, superCtor) {
	    ctor.super_ = superCtor
	    ctor.prototype = Object.create(superCtor.prototype, {
	      constructor: {
	        value: ctor,
	        enumerable: false,
	        writable: true,
	        configurable: true
	      }
	    });
	  };
	} else {
	  // old school shim for old browsers
	  module.exports = function inherits(ctor, superCtor) {
	    ctor.super_ = superCtor
	    var TempCtor = function () {}
	    TempCtor.prototype = superCtor.prototype
	    ctor.prototype = new TempCtor()
	    ctor.prototype.constructor = ctor
	  }
	}


/***/ },
/* 45 */
/***/ function(module, exports) {

	/* WEBPACK VAR INJECTION */(function(global) {// http://www.rajdeepd.com/articles/chrome/localstrg/LocalStorageSample.htm

	// NOTE:
	// this varies from actual localStorage in some subtle ways

	// also, there is no persistence
	// TODO persist
	(function () {
	  "use strict";

	  var db;

	  function LocalStorage() {
	  }
	  db = LocalStorage;

	  db.prototype.getItem = function (key) {
	    if (this.hasOwnProperty(key)) {
	      return String(this[key]);
	    }
	    return null;
	  };

	  db.prototype.setItem = function (key, val) {
	    this[key] = String(val);
	  };

	  db.prototype.removeItem = function (key) {
	    delete this[key];
	  };

	  db.prototype.clear = function () {
	    var self = this;
	    Object.keys(self).forEach(function (key) {
	      self[key] = undefined;
	      delete self[key];
	    });
	  };

	  db.prototype.key = function (i) {
	    i = i || 0;
	    return Object.keys(this)[i];
	  };

	  db.prototype.__defineGetter__('length', function () {
	    return Object.keys(this).length;
	  });

	  if (global.localStorage) {
	    module.exports = localStorage;
	  } else {
	    module.exports = new LocalStorage();
	  }
	}());

	/* WEBPACK VAR INJECTION */}.call(exports, (function() { return this; }())))

/***/ },
/* 46 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = __webpack_require__(47).default;

/***/ },
/* 47 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.isNetworkError = isNetworkError;
	exports.isRetryableError = isRetryableError;
	exports.isSafeRequestError = isSafeRequestError;
	exports.isIdempotentRequestError = isIdempotentRequestError;
	exports.isNetworkOrIdempotentRequestError = isNetworkOrIdempotentRequestError;
	exports.exponentialDelay = exponentialDelay;
	exports.default = axiosRetry;

	var _isRetryAllowed = __webpack_require__(48);

	var _isRetryAllowed2 = _interopRequireDefault(_isRetryAllowed);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	var namespace = 'axios-retry';

	/**
	 * @param  {Error}  error
	 * @return {boolean}
	 */
	function isNetworkError(error) {
	  return !error.response && Boolean(error.code) // Prevents retrying cancelled requests
	  && error.code !== 'ECONNABORTED' // Prevents retrying timed out requests
	  && (0, _isRetryAllowed2.default)(error); // Prevents retrying unsafe errors
	}

	var SAFE_HTTP_METHODS = ['get', 'head', 'options'];
	var IDEMPOTENT_HTTP_METHODS = SAFE_HTTP_METHODS.concat(['put', 'delete']);

	/**
	 * @param  {Error}  error
	 * @return {boolean}
	 */
	function isRetryableError(error) {
	  return error.code !== 'ECONNABORTED' && (!error.response || error.response.status >= 500 && error.response.status <= 599);
	}

	/**
	 * @param  {Error}  error
	 * @return {boolean}
	 */
	function isSafeRequestError(error) {
	  if (!error.config) {
	    // Cannot determine if the request can be retried
	    return false;
	  }

	  return isRetryableError(error) && SAFE_HTTP_METHODS.indexOf(error.config.method) !== -1;
	}

	/**
	 * @param  {Error}  error
	 * @return {boolean}
	 */
	function isIdempotentRequestError(error) {
	  if (!error.config) {
	    // Cannot determine if the request can be retried
	    return false;
	  }

	  return isRetryableError(error) && IDEMPOTENT_HTTP_METHODS.indexOf(error.config.method) !== -1;
	}

	/**
	 * @param  {Error}  error
	 * @return {boolean}
	 */
	function isNetworkOrIdempotentRequestError(error) {
	  return isNetworkError(error) || isIdempotentRequestError(error);
	}

	/**
	 * @return {number} - delay in milliseconds, always 0
	 */
	function noDelay() {
	  return 0;
	}

	/**
	 * @param  {number} [retryNumber=0]
	 * @return {number} - delay in milliseconds
	 */
	function exponentialDelay() {
	  var retryNumber = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;

	  var delay = Math.pow(2, retryNumber) * 100;
	  var randomSum = delay * 0.2 * Math.random(); // 0-20% of the delay
	  return delay + randomSum;
	}

	/**
	 * Initializes and returns the retry state for the given request/config
	 * @param  {AxiosRequestConfig} config
	 * @return {Object}
	 */
	function getCurrentState(config) {
	  var currentState = config[namespace] || {};
	  currentState.retryCount = currentState.retryCount || 0;
	  config[namespace] = currentState;
	  return currentState;
	}

	/**
	 * Returns the axios-retry options for the current request
	 * @param  {AxiosRequestConfig} config
	 * @param  {AxiosRetryConfig} defaultOptions
	 * @return {AxiosRetryConfig}
	 */
	function getRequestOptions(config, defaultOptions) {
	  return Object.assign({}, defaultOptions, config[namespace]);
	}

	/**
	 * @param  {Axios} axios
	 * @param  {AxiosRequestConfig} config
	 */
	function fixConfig(axios, config) {
	  if (axios.defaults.agent === config.agent) {
	    delete config.agent;
	  }
	  if (axios.defaults.httpAgent === config.httpAgent) {
	    delete config.httpAgent;
	  }
	  if (axios.defaults.httpsAgent === config.httpsAgent) {
	    delete config.httpsAgent;
	  }
	}

	/**
	 * Adds response interceptors to an axios instance to retry requests failed due to network issues
	 *
	 * @example
	 *
	 * import axios from 'axios';
	 *
	 * axiosRetry(axios, { retries: 3 });
	 *
	 * axios.get('http://example.com/test') // The first request fails and the second returns 'ok'
	 *   .then(result => {
	 *     result.data; // 'ok'
	 *   });
	 *
	 * // Exponential back-off retry delay between requests
	 * axiosRetry(axios, { retryDelay : axiosRetry.exponentialDelay});
	 *
	 * // Custom retry delay
	 * axiosRetry(axios, { retryDelay : (retryCount) => {
	 *   return retryCount * 1000;
	 * }});
	 *
	 * // Also works with custom axios instances
	 * const client = axios.create({ baseURL: 'http://example.com' });
	 * axiosRetry(client, { retries: 3 });
	 *
	 * client.get('/test') // The first request fails and the second returns 'ok'
	 *   .then(result => {
	 *     result.data; // 'ok'
	 *   });
	 *
	 * // Allows request-specific configuration
	 * client
	 *   .get('/test', {
	 *     'axios-retry': {
	 *       retries: 0
	 *     }
	 *   })
	 *   .catch(error => { // The first request fails
	 *     error !== undefined
	 *   });
	 *
	 * @param {Axios} axios An axios instance (the axios object or one created from axios.create)
	 * @param {Object} [defaultOptions]
	 * @param {number} [defaultOptions.retries=3] Number of retries
	 * @param {boolean} [defaultOptions.shouldResetTimeout=false]
	 *        Defines if the timeout should be reset between retries
	 * @param {Function} [defaultOptions.retryCondition=isNetworkOrIdempotentRequestError]
	 *        A function to determine if the error can be retried
	 * @param {Function} [defaultOptions.retryDelay=noDelay]
	 *        A function to determine the delay between retry requests
	 */
	function axiosRetry(axios, defaultOptions) {
	  axios.interceptors.request.use(function (config) {
	    var currentState = getCurrentState(config);
	    currentState.lastRequestTime = Date.now();
	    return config;
	  });

	  axios.interceptors.response.use(null, function (error) {
	    var config = error.config;

	    // If we have no information to retry the request
	    if (!config) {
	      return Promise.reject(error);
	    }

	    var _getRequestOptions = getRequestOptions(config, defaultOptions),
	        _getRequestOptions$re = _getRequestOptions.retries,
	        retries = _getRequestOptions$re === undefined ? 3 : _getRequestOptions$re,
	        _getRequestOptions$re2 = _getRequestOptions.retryCondition,
	        retryCondition = _getRequestOptions$re2 === undefined ? isNetworkOrIdempotentRequestError : _getRequestOptions$re2,
	        _getRequestOptions$re3 = _getRequestOptions.retryDelay,
	        retryDelay = _getRequestOptions$re3 === undefined ? noDelay : _getRequestOptions$re3,
	        _getRequestOptions$sh = _getRequestOptions.shouldResetTimeout,
	        shouldResetTimeout = _getRequestOptions$sh === undefined ? false : _getRequestOptions$sh;

	    var currentState = getCurrentState(config);

	    var shouldRetry = retryCondition(error) && currentState.retryCount < retries;

	    if (shouldRetry) {
	      currentState.retryCount++;
	      var delay = retryDelay(currentState.retryCount, error);

	      // Axios fails merging this configuration to the default configuration because it has an issue
	      // with circular structures: https://github.com/mzabriskie/axios/issues/370
	      fixConfig(axios, config);

	      if (!shouldResetTimeout && config.timeout && currentState.lastRequestTime) {
	        var lastRequestDuration = Date.now() - currentState.lastRequestTime;
	        // Minimum 1ms timeout (passing 0 or less to XHR means no timeout)
	        config.timeout = Math.max(config.timeout - lastRequestDuration - delay, 1);
	      }

	      return new Promise(function (resolve) {
	        return setTimeout(function () {
	          return resolve(axios(config));
	        }, delay);
	      });
	    }

	    return Promise.reject(error);
	  });
	}

	// Compatibility with CommonJS
	axiosRetry.isNetworkError = isNetworkError;
	axiosRetry.isSafeRequestError = isSafeRequestError;
	axiosRetry.isIdempotentRequestError = isIdempotentRequestError;
	axiosRetry.isNetworkOrIdempotentRequestError = isNetworkOrIdempotentRequestError;
	axiosRetry.exponentialDelay = exponentialDelay;
	axiosRetry.isRetryableError = isRetryableError;
	//# sourceMappingURL=index.js.map

/***/ },
/* 48 */
/***/ function(module, exports) {

	'use strict';

	var WHITELIST = [
		'ETIMEDOUT',
		'ECONNRESET',
		'EADDRINUSE',
		'ESOCKETTIMEDOUT',
		'ECONNREFUSED',
		'EPIPE'
	];

	var BLACKLIST = [
		'ENOTFOUND',
		'ENETUNREACH',

		// SSL errors from https://github.com/nodejs/node/blob/ed3d8b13ee9a705d89f9e0397d9e96519e7e47ac/src/node_crypto.cc#L1950
		'UNABLE_TO_GET_ISSUER_CERT',
		'UNABLE_TO_GET_CRL',
		'UNABLE_TO_DECRYPT_CERT_SIGNATURE',
		'UNABLE_TO_DECRYPT_CRL_SIGNATURE',
		'UNABLE_TO_DECODE_ISSUER_PUBLIC_KEY',
		'CERT_SIGNATURE_FAILURE',
		'CRL_SIGNATURE_FAILURE',
		'CERT_NOT_YET_VALID',
		'CERT_HAS_EXPIRED',
		'CRL_NOT_YET_VALID',
		'CRL_HAS_EXPIRED',
		'ERROR_IN_CERT_NOT_BEFORE_FIELD',
		'ERROR_IN_CERT_NOT_AFTER_FIELD',
		'ERROR_IN_CRL_LAST_UPDATE_FIELD',
		'ERROR_IN_CRL_NEXT_UPDATE_FIELD',
		'OUT_OF_MEM',
		'DEPTH_ZERO_SELF_SIGNED_CERT',
		'SELF_SIGNED_CERT_IN_CHAIN',
		'UNABLE_TO_GET_ISSUER_CERT_LOCALLY',
		'UNABLE_TO_VERIFY_LEAF_SIGNATURE',
		'CERT_CHAIN_TOO_LONG',
		'CERT_REVOKED',
		'INVALID_CA',
		'PATH_LENGTH_EXCEEDED',
		'INVALID_PURPOSE',
		'CERT_UNTRUSTED',
		'CERT_REJECTED'
	];

	module.exports = function (err) {
		if (!err || !err.code) {
			return true;
		}

		if (WHITELIST.indexOf(err.code) !== -1) {
			return true;
		}

		if (BLACKLIST.indexOf(err.code) !== -1) {
			return false;
		}

		return true;
	};


/***/ },
/* 49 */
/***/ function(module, exports) {

	module.exports = __WEBPACK_EXTERNAL_MODULE_49__;

/***/ },
/* 50 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = __webpack_require__(51);

/***/ },
/* 51 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var utils = __webpack_require__(52);
	var bind = __webpack_require__(53);
	var Axios = __webpack_require__(54);

	/**
	 * Create an instance of Axios
	 *
	 * @param {Object} defaultConfig The default config for the instance
	 * @return {Axios} A new instance of Axios
	 */
	function createInstance(defaultConfig) {
	  var context = new Axios(defaultConfig);
	  var instance = bind(Axios.prototype.request, context);

	  // Copy axios.prototype to instance
	  utils.extend(instance, Axios.prototype, context);

	  // Copy context to instance
	  utils.extend(instance, context);

	  return instance;
	}

	// Create the default instance to be exported
	var axios = createInstance();

	// Expose Axios class to allow class inheritance
	axios.Axios = Axios;

	// Factory for creating new instances
	axios.create = function create(defaultConfig) {
	  return createInstance(defaultConfig);
	};

	// Expose all/spread
	axios.all = function all(promises) {
	  return Promise.all(promises);
	};
	axios.spread = __webpack_require__(71);

	module.exports = axios;

	// Allow use of default import syntax in TypeScript
	module.exports.default = axios;


/***/ },
/* 52 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var bind = __webpack_require__(53);

	/*global toString:true*/

	// utils is a library of generic helper functions non-specific to axios

	var toString = Object.prototype.toString;

	/**
	 * Determine if a value is an Array
	 *
	 * @param {Object} val The value to test
	 * @returns {boolean} True if value is an Array, otherwise false
	 */
	function isArray(val) {
	  return toString.call(val) === '[object Array]';
	}

	/**
	 * Determine if a value is an ArrayBuffer
	 *
	 * @param {Object} val The value to test
	 * @returns {boolean} True if value is an ArrayBuffer, otherwise false
	 */
	function isArrayBuffer(val) {
	  return toString.call(val) === '[object ArrayBuffer]';
	}

	/**
	 * Determine if a value is a FormData
	 *
	 * @param {Object} val The value to test
	 * @returns {boolean} True if value is an FormData, otherwise false
	 */
	function isFormData(val) {
	  return (typeof FormData !== 'undefined') && (val instanceof FormData);
	}

	/**
	 * Determine if a value is a view on an ArrayBuffer
	 *
	 * @param {Object} val The value to test
	 * @returns {boolean} True if value is a view on an ArrayBuffer, otherwise false
	 */
	function isArrayBufferView(val) {
	  var result;
	  if ((typeof ArrayBuffer !== 'undefined') && (ArrayBuffer.isView)) {
	    result = ArrayBuffer.isView(val);
	  } else {
	    result = (val) && (val.buffer) && (val.buffer instanceof ArrayBuffer);
	  }
	  return result;
	}

	/**
	 * Determine if a value is a String
	 *
	 * @param {Object} val The value to test
	 * @returns {boolean} True if value is a String, otherwise false
	 */
	function isString(val) {
	  return typeof val === 'string';
	}

	/**
	 * Determine if a value is a Number
	 *
	 * @param {Object} val The value to test
	 * @returns {boolean} True if value is a Number, otherwise false
	 */
	function isNumber(val) {
	  return typeof val === 'number';
	}

	/**
	 * Determine if a value is undefined
	 *
	 * @param {Object} val The value to test
	 * @returns {boolean} True if the value is undefined, otherwise false
	 */
	function isUndefined(val) {
	  return typeof val === 'undefined';
	}

	/**
	 * Determine if a value is an Object
	 *
	 * @param {Object} val The value to test
	 * @returns {boolean} True if value is an Object, otherwise false
	 */
	function isObject(val) {
	  return val !== null && typeof val === 'object';
	}

	/**
	 * Determine if a value is a Date
	 *
	 * @param {Object} val The value to test
	 * @returns {boolean} True if value is a Date, otherwise false
	 */
	function isDate(val) {
	  return toString.call(val) === '[object Date]';
	}

	/**
	 * Determine if a value is a File
	 *
	 * @param {Object} val The value to test
	 * @returns {boolean} True if value is a File, otherwise false
	 */
	function isFile(val) {
	  return toString.call(val) === '[object File]';
	}

	/**
	 * Determine if a value is a Blob
	 *
	 * @param {Object} val The value to test
	 * @returns {boolean} True if value is a Blob, otherwise false
	 */
	function isBlob(val) {
	  return toString.call(val) === '[object Blob]';
	}

	/**
	 * Determine if a value is a Function
	 *
	 * @param {Object} val The value to test
	 * @returns {boolean} True if value is a Function, otherwise false
	 */
	function isFunction(val) {
	  return toString.call(val) === '[object Function]';
	}

	/**
	 * Determine if a value is a Stream
	 *
	 * @param {Object} val The value to test
	 * @returns {boolean} True if value is a Stream, otherwise false
	 */
	function isStream(val) {
	  return isObject(val) && isFunction(val.pipe);
	}

	/**
	 * Determine if a value is a URLSearchParams object
	 *
	 * @param {Object} val The value to test
	 * @returns {boolean} True if value is a URLSearchParams object, otherwise false
	 */
	function isURLSearchParams(val) {
	  return typeof URLSearchParams !== 'undefined' && val instanceof URLSearchParams;
	}

	/**
	 * Trim excess whitespace off the beginning and end of a string
	 *
	 * @param {String} str The String to trim
	 * @returns {String} The String freed of excess whitespace
	 */
	function trim(str) {
	  return str.replace(/^\s*/, '').replace(/\s*$/, '');
	}

	/**
	 * Determine if we're running in a standard browser environment
	 *
	 * This allows axios to run in a web worker, and react-native.
	 * Both environments support XMLHttpRequest, but not fully standard globals.
	 *
	 * web workers:
	 *  typeof window -> undefined
	 *  typeof document -> undefined
	 *
	 * react-native:
	 *  typeof document.createElement -> undefined
	 */
	function isStandardBrowserEnv() {
	  return (
	    typeof window !== 'undefined' &&
	    typeof document !== 'undefined' &&
	    typeof document.createElement === 'function'
	  );
	}

	/**
	 * Iterate over an Array or an Object invoking a function for each item.
	 *
	 * If `obj` is an Array callback will be called passing
	 * the value, index, and complete array for each item.
	 *
	 * If 'obj' is an Object callback will be called passing
	 * the value, key, and complete object for each property.
	 *
	 * @param {Object|Array} obj The object to iterate
	 * @param {Function} fn The callback to invoke for each item
	 */
	function forEach(obj, fn) {
	  // Don't bother if no value provided
	  if (obj === null || typeof obj === 'undefined') {
	    return;
	  }

	  // Force an array if not already something iterable
	  if (typeof obj !== 'object' && !isArray(obj)) {
	    /*eslint no-param-reassign:0*/
	    obj = [obj];
	  }

	  if (isArray(obj)) {
	    // Iterate over array values
	    for (var i = 0, l = obj.length; i < l; i++) {
	      fn.call(null, obj[i], i, obj);
	    }
	  } else {
	    // Iterate over object keys
	    for (var key in obj) {
	      if (obj.hasOwnProperty(key)) {
	        fn.call(null, obj[key], key, obj);
	      }
	    }
	  }
	}

	/**
	 * Accepts varargs expecting each argument to be an object, then
	 * immutably merges the properties of each object and returns result.
	 *
	 * When multiple objects contain the same key the later object in
	 * the arguments list will take precedence.
	 *
	 * Example:
	 *
	 * ```js
	 * var result = merge({foo: 123}, {foo: 456});
	 * console.log(result.foo); // outputs 456
	 * ```
	 *
	 * @param {Object} obj1 Object to merge
	 * @returns {Object} Result of all merge properties
	 */
	function merge(/* obj1, obj2, obj3, ... */) {
	  var result = {};
	  function assignValue(val, key) {
	    if (typeof result[key] === 'object' && typeof val === 'object') {
	      result[key] = merge(result[key], val);
	    } else {
	      result[key] = val;
	    }
	  }

	  for (var i = 0, l = arguments.length; i < l; i++) {
	    forEach(arguments[i], assignValue);
	  }
	  return result;
	}

	/**
	 * Extends object a by mutably adding to it the properties of object b.
	 *
	 * @param {Object} a The object to be extended
	 * @param {Object} b The object to copy properties from
	 * @param {Object} thisArg The object to bind function to
	 * @return {Object} The resulting value of object a
	 */
	function extend(a, b, thisArg) {
	  forEach(b, function assignValue(val, key) {
	    if (thisArg && typeof val === 'function') {
	      a[key] = bind(val, thisArg);
	    } else {
	      a[key] = val;
	    }
	  });
	  return a;
	}

	module.exports = {
	  isArray: isArray,
	  isArrayBuffer: isArrayBuffer,
	  isFormData: isFormData,
	  isArrayBufferView: isArrayBufferView,
	  isString: isString,
	  isNumber: isNumber,
	  isObject: isObject,
	  isUndefined: isUndefined,
	  isDate: isDate,
	  isFile: isFile,
	  isBlob: isBlob,
	  isFunction: isFunction,
	  isStream: isStream,
	  isURLSearchParams: isURLSearchParams,
	  isStandardBrowserEnv: isStandardBrowserEnv,
	  forEach: forEach,
	  merge: merge,
	  extend: extend,
	  trim: trim
	};


/***/ },
/* 53 */
/***/ function(module, exports) {

	'use strict';

	module.exports = function bind(fn, thisArg) {
	  return function wrap() {
	    var args = new Array(arguments.length);
	    for (var i = 0; i < args.length; i++) {
	      args[i] = arguments[i];
	    }
	    return fn.apply(thisArg, args);
	  };
	};


/***/ },
/* 54 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var defaults = __webpack_require__(55);
	var utils = __webpack_require__(52);
	var InterceptorManager = __webpack_require__(57);
	var dispatchRequest = __webpack_require__(58);
	var isAbsoluteURL = __webpack_require__(69);
	var combineURLs = __webpack_require__(70);

	/**
	 * Create a new instance of Axios
	 *
	 * @param {Object} defaultConfig The default config for the instance
	 */
	function Axios(defaultConfig) {
	  this.defaults = utils.merge(defaults, defaultConfig);
	  this.interceptors = {
	    request: new InterceptorManager(),
	    response: new InterceptorManager()
	  };
	}

	/**
	 * Dispatch a request
	 *
	 * @param {Object} config The config specific for this request (merged with this.defaults)
	 */
	Axios.prototype.request = function request(config) {
	  /*eslint no-param-reassign:0*/
	  // Allow for axios('example/url'[, config]) a la fetch API
	  if (typeof config === 'string') {
	    config = utils.merge({
	      url: arguments[0]
	    }, arguments[1]);
	  }

	  config = utils.merge(defaults, this.defaults, { method: 'get' }, config);

	  // Support baseURL config
	  if (config.baseURL && !isAbsoluteURL(config.url)) {
	    config.url = combineURLs(config.baseURL, config.url);
	  }

	  // Hook up interceptors middleware
	  var chain = [dispatchRequest, undefined];
	  var promise = Promise.resolve(config);

	  this.interceptors.request.forEach(function unshiftRequestInterceptors(interceptor) {
	    chain.unshift(interceptor.fulfilled, interceptor.rejected);
	  });

	  this.interceptors.response.forEach(function pushResponseInterceptors(interceptor) {
	    chain.push(interceptor.fulfilled, interceptor.rejected);
	  });

	  while (chain.length) {
	    promise = promise.then(chain.shift(), chain.shift());
	  }

	  return promise;
	};

	// Provide aliases for supported request methods
	utils.forEach(['delete', 'get', 'head'], function forEachMethodNoData(method) {
	  /*eslint func-names:0*/
	  Axios.prototype[method] = function(url, config) {
	    return this.request(utils.merge(config || {}, {
	      method: method,
	      url: url
	    }));
	  };
	});

	utils.forEach(['post', 'put', 'patch'], function forEachMethodWithData(method) {
	  /*eslint func-names:0*/
	  Axios.prototype[method] = function(url, data, config) {
	    return this.request(utils.merge(config || {}, {
	      method: method,
	      url: url,
	      data: data
	    }));
	  };
	});

	module.exports = Axios;


/***/ },
/* 55 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var utils = __webpack_require__(52);
	var normalizeHeaderName = __webpack_require__(56);

	var PROTECTION_PREFIX = /^\)\]\}',?\n/;
	var DEFAULT_CONTENT_TYPE = {
	  'Content-Type': 'application/x-www-form-urlencoded'
	};

	function setContentTypeIfUnset(headers, value) {
	  if (!utils.isUndefined(headers) && utils.isUndefined(headers['Content-Type'])) {
	    headers['Content-Type'] = value;
	  }
	}

	module.exports = {
	  transformRequest: [function transformRequest(data, headers) {
	    normalizeHeaderName(headers, 'Content-Type');
	    if (utils.isFormData(data) ||
	      utils.isArrayBuffer(data) ||
	      utils.isStream(data) ||
	      utils.isFile(data) ||
	      utils.isBlob(data)
	    ) {
	      return data;
	    }
	    if (utils.isArrayBufferView(data)) {
	      return data.buffer;
	    }
	    if (utils.isURLSearchParams(data)) {
	      setContentTypeIfUnset(headers, 'application/x-www-form-urlencoded;charset=utf-8');
	      return data.toString();
	    }
	    if (utils.isObject(data)) {
	      setContentTypeIfUnset(headers, 'application/json;charset=utf-8');
	      return JSON.stringify(data);
	    }
	    return data;
	  }],

	  transformResponse: [function transformResponse(data) {
	    /*eslint no-param-reassign:0*/
	    if (typeof data === 'string') {
	      data = data.replace(PROTECTION_PREFIX, '');
	      try {
	        data = JSON.parse(data);
	      } catch (e) { /* Ignore */ }
	    }
	    return data;
	  }],

	  headers: {
	    common: {
	      'Accept': 'application/json, text/plain, */*'
	    },
	    patch: utils.merge(DEFAULT_CONTENT_TYPE),
	    post: utils.merge(DEFAULT_CONTENT_TYPE),
	    put: utils.merge(DEFAULT_CONTENT_TYPE)
	  },

	  timeout: 0,

	  xsrfCookieName: 'XSRF-TOKEN',
	  xsrfHeaderName: 'X-XSRF-TOKEN',

	  maxContentLength: -1,

	  validateStatus: function validateStatus(status) {
	    return status >= 200 && status < 300;
	  }
	};


/***/ },
/* 56 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var utils = __webpack_require__(52);

	module.exports = function normalizeHeaderName(headers, normalizedName) {
	  utils.forEach(headers, function processHeader(value, name) {
	    if (name !== normalizedName && name.toUpperCase() === normalizedName.toUpperCase()) {
	      headers[normalizedName] = value;
	      delete headers[name];
	    }
	  });
	};


/***/ },
/* 57 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var utils = __webpack_require__(52);

	function InterceptorManager() {
	  this.handlers = [];
	}

	/**
	 * Add a new interceptor to the stack
	 *
	 * @param {Function} fulfilled The function to handle `then` for a `Promise`
	 * @param {Function} rejected The function to handle `reject` for a `Promise`
	 *
	 * @return {Number} An ID used to remove interceptor later
	 */
	InterceptorManager.prototype.use = function use(fulfilled, rejected) {
	  this.handlers.push({
	    fulfilled: fulfilled,
	    rejected: rejected
	  });
	  return this.handlers.length - 1;
	};

	/**
	 * Remove an interceptor from the stack
	 *
	 * @param {Number} id The ID that was returned by `use`
	 */
	InterceptorManager.prototype.eject = function eject(id) {
	  if (this.handlers[id]) {
	    this.handlers[id] = null;
	  }
	};

	/**
	 * Iterate over all the registered interceptors
	 *
	 * This method is particularly useful for skipping over any
	 * interceptors that may have become `null` calling `eject`.
	 *
	 * @param {Function} fn The function to call for each interceptor
	 */
	InterceptorManager.prototype.forEach = function forEach(fn) {
	  utils.forEach(this.handlers, function forEachHandler(h) {
	    if (h !== null) {
	      fn(h);
	    }
	  });
	};

	module.exports = InterceptorManager;


/***/ },
/* 58 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(process) {'use strict';

	var utils = __webpack_require__(52);
	var transformData = __webpack_require__(59);

	/**
	 * Dispatch a request to the server using whichever adapter
	 * is supported by the current environment.
	 *
	 * @param {object} config The config that is to be used for the request
	 * @returns {Promise} The Promise to be fulfilled
	 */
	module.exports = function dispatchRequest(config) {
	  // Ensure headers exist
	  config.headers = config.headers || {};

	  // Transform request data
	  config.data = transformData(
	    config.data,
	    config.headers,
	    config.transformRequest
	  );

	  // Flatten headers
	  config.headers = utils.merge(
	    config.headers.common || {},
	    config.headers[config.method] || {},
	    config.headers || {}
	  );

	  utils.forEach(
	    ['delete', 'get', 'head', 'post', 'put', 'patch', 'common'],
	    function cleanHeaderConfig(method) {
	      delete config.headers[method];
	    }
	  );

	  var adapter;

	  if (typeof config.adapter === 'function') {
	    // For custom adapter support
	    adapter = config.adapter;
	  } else if (typeof XMLHttpRequest !== 'undefined') {
	    // For browsers use XHR adapter
	    adapter = __webpack_require__(60);
	  } else if (typeof process !== 'undefined') {
	    // For node use HTTP adapter
	    adapter = __webpack_require__(60);
	  }

	  return Promise.resolve(config)
	    // Wrap synchronous adapter errors and pass configuration
	    .then(adapter)
	    .then(function onFulfilled(response) {
	      // Transform response data
	      response.data = transformData(
	        response.data,
	        response.headers,
	        config.transformResponse
	      );

	      return response;
	    }, function onRejected(error) {
	      // Transform response data
	      if (error && error.response) {
	        error.response.data = transformData(
	          error.response.data,
	          error.response.headers,
	          config.transformResponse
	        );
	      }

	      return Promise.reject(error);
	    });
	};

	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(2)))

/***/ },
/* 59 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var utils = __webpack_require__(52);

	/**
	 * Transform the data for a request or a response
	 *
	 * @param {Object|String} data The data to be transformed
	 * @param {Array} headers The headers for the request or response
	 * @param {Array|Function} fns A single function or Array of functions
	 * @returns {*} The resulting transformed data
	 */
	module.exports = function transformData(data, headers, fns) {
	  /*eslint no-param-reassign:0*/
	  utils.forEach(fns, function transform(fn) {
	    data = fn(data, headers);
	  });

	  return data;
	};


/***/ },
/* 60 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(process) {'use strict';

	var utils = __webpack_require__(52);
	var settle = __webpack_require__(61);
	var buildURL = __webpack_require__(64);
	var parseHeaders = __webpack_require__(65);
	var isURLSameOrigin = __webpack_require__(66);
	var createError = __webpack_require__(62);
	var btoa = (typeof window !== 'undefined' && window.btoa) || __webpack_require__(67);

	module.exports = function xhrAdapter(config) {
	  return new Promise(function dispatchXhrRequest(resolve, reject) {
	    var requestData = config.data;
	    var requestHeaders = config.headers;

	    if (utils.isFormData(requestData)) {
	      delete requestHeaders['Content-Type']; // Let the browser set it
	    }

	    var request = new XMLHttpRequest();
	    var loadEvent = 'onreadystatechange';
	    var xDomain = false;

	    // For IE 8/9 CORS support
	    // Only supports POST and GET calls and doesn't returns the response headers.
	    // DON'T do this for testing b/c XMLHttpRequest is mocked, not XDomainRequest.
	    if (process.env.NODE_ENV !== 'test' &&
	        typeof window !== 'undefined' &&
	        window.XDomainRequest && !('withCredentials' in request) &&
	        !isURLSameOrigin(config.url)) {
	      request = new window.XDomainRequest();
	      loadEvent = 'onload';
	      xDomain = true;
	      request.onprogress = function handleProgress() {};
	      request.ontimeout = function handleTimeout() {};
	    }

	    // HTTP basic authentication
	    if (config.auth) {
	      var username = config.auth.username || '';
	      var password = config.auth.password || '';
	      requestHeaders.Authorization = 'Basic ' + btoa(username + ':' + password);
	    }

	    request.open(config.method.toUpperCase(), buildURL(config.url, config.params, config.paramsSerializer), true);

	    // Set the request timeout in MS
	    request.timeout = config.timeout;

	    // Listen for ready state
	    request[loadEvent] = function handleLoad() {
	      if (!request || (request.readyState !== 4 && !xDomain)) {
	        return;
	      }

	      // The request errored out and we didn't get a response, this will be
	      // handled by onerror instead
	      if (request.status === 0) {
	        return;
	      }

	      // Prepare the response
	      var responseHeaders = 'getAllResponseHeaders' in request ? parseHeaders(request.getAllResponseHeaders()) : null;
	      var responseData = !config.responseType || config.responseType === 'text' ? request.responseText : request.response;
	      var response = {
	        data: responseData,
	        // IE sends 1223 instead of 204 (https://github.com/mzabriskie/axios/issues/201)
	        status: request.status === 1223 ? 204 : request.status,
	        statusText: request.status === 1223 ? 'No Content' : request.statusText,
	        headers: responseHeaders,
	        config: config,
	        request: request
	      };

	      settle(resolve, reject, response);

	      // Clean up request
	      request = null;
	    };

	    // Handle low level network errors
	    request.onerror = function handleError() {
	      // Real errors are hidden from us by the browser
	      // onerror should only fire if it's a network error
	      reject(createError('Network Error', config));

	      // Clean up request
	      request = null;
	    };

	    // Handle timeout
	    request.ontimeout = function handleTimeout() {
	      reject(createError('timeout of ' + config.timeout + 'ms exceeded', config, 'ECONNABORTED'));

	      // Clean up request
	      request = null;
	    };

	    // Add xsrf header
	    // This is only done if running in a standard browser environment.
	    // Specifically not if we're in a web worker, or react-native.
	    if (utils.isStandardBrowserEnv()) {
	      var cookies = __webpack_require__(68);

	      // Add xsrf header
	      var xsrfValue = (config.withCredentials || isURLSameOrigin(config.url)) && config.xsrfCookieName ?
	          cookies.read(config.xsrfCookieName) :
	          undefined;

	      if (xsrfValue) {
	        requestHeaders[config.xsrfHeaderName] = xsrfValue;
	      }
	    }

	    // Add headers to the request
	    if ('setRequestHeader' in request) {
	      utils.forEach(requestHeaders, function setRequestHeader(val, key) {
	        if (typeof requestData === 'undefined' && key.toLowerCase() === 'content-type') {
	          // Remove Content-Type if data is undefined
	          delete requestHeaders[key];
	        } else {
	          // Otherwise add header to the request
	          request.setRequestHeader(key, val);
	        }
	      });
	    }

	    // Add withCredentials to request if needed
	    if (config.withCredentials) {
	      request.withCredentials = true;
	    }

	    // Add responseType to request if needed
	    if (config.responseType) {
	      try {
	        request.responseType = config.responseType;
	      } catch (e) {
	        if (request.responseType !== 'json') {
	          throw e;
	        }
	      }
	    }

	    // Handle progress if needed
	    if (typeof config.onDownloadProgress === 'function') {
	      request.addEventListener('progress', config.onDownloadProgress);
	    }

	    // Not all browsers support upload events
	    if (typeof config.onUploadProgress === 'function' && request.upload) {
	      request.upload.addEventListener('progress', config.onUploadProgress);
	    }


	    if (requestData === undefined) {
	      requestData = null;
	    }

	    // Send the request
	    request.send(requestData);
	  });
	};

	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(2)))

/***/ },
/* 61 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var createError = __webpack_require__(62);

	/**
	 * Resolve or reject a Promise based on response status.
	 *
	 * @param {Function} resolve A function that resolves the promise.
	 * @param {Function} reject A function that rejects the promise.
	 * @param {object} response The response.
	 */
	module.exports = function settle(resolve, reject, response) {
	  var validateStatus = response.config.validateStatus;
	  // Note: status is not exposed by XDomainRequest
	  if (!response.status || !validateStatus || validateStatus(response.status)) {
	    resolve(response);
	  } else {
	    reject(createError(
	      'Request failed with status code ' + response.status,
	      response.config,
	      null,
	      response
	    ));
	  }
	};


/***/ },
/* 62 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var enhanceError = __webpack_require__(63);

	/**
	 * Create an Error with the specified message, config, error code, and response.
	 *
	 * @param {string} message The error message.
	 * @param {Object} config The config.
	 * @param {string} [code] The error code (for example, 'ECONNABORTED').
	 @ @param {Object} [response] The response.
	 * @returns {Error} The created error.
	 */
	module.exports = function createError(message, config, code, response) {
	  var error = new Error(message);
	  return enhanceError(error, config, code, response);
	};


/***/ },
/* 63 */
/***/ function(module, exports) {

	'use strict';

	/**
	 * Update an Error with the specified config, error code, and response.
	 *
	 * @param {Error} error The error to update.
	 * @param {Object} config The config.
	 * @param {string} [code] The error code (for example, 'ECONNABORTED').
	 @ @param {Object} [response] The response.
	 * @returns {Error} The error.
	 */
	module.exports = function enhanceError(error, config, code, response) {
	  error.config = config;
	  if (code) {
	    error.code = code;
	  }
	  error.response = response;
	  return error;
	};


/***/ },
/* 64 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var utils = __webpack_require__(52);

	function encode(val) {
	  return encodeURIComponent(val).
	    replace(/%40/gi, '@').
	    replace(/%3A/gi, ':').
	    replace(/%24/g, '$').
	    replace(/%2C/gi, ',').
	    replace(/%20/g, '+').
	    replace(/%5B/gi, '[').
	    replace(/%5D/gi, ']');
	}

	/**
	 * Build a URL by appending params to the end
	 *
	 * @param {string} url The base of the url (e.g., http://www.google.com)
	 * @param {object} [params] The params to be appended
	 * @returns {string} The formatted url
	 */
	module.exports = function buildURL(url, params, paramsSerializer) {
	  /*eslint no-param-reassign:0*/
	  if (!params) {
	    return url;
	  }

	  var serializedParams;
	  if (paramsSerializer) {
	    serializedParams = paramsSerializer(params);
	  } else if (utils.isURLSearchParams(params)) {
	    serializedParams = params.toString();
	  } else {
	    var parts = [];

	    utils.forEach(params, function serialize(val, key) {
	      if (val === null || typeof val === 'undefined') {
	        return;
	      }

	      if (utils.isArray(val)) {
	        key = key + '[]';
	      }

	      if (!utils.isArray(val)) {
	        val = [val];
	      }

	      utils.forEach(val, function parseValue(v) {
	        if (utils.isDate(v)) {
	          v = v.toISOString();
	        } else if (utils.isObject(v)) {
	          v = JSON.stringify(v);
	        }
	        parts.push(encode(key) + '=' + encode(v));
	      });
	    });

	    serializedParams = parts.join('&');
	  }

	  if (serializedParams) {
	    url += (url.indexOf('?') === -1 ? '?' : '&') + serializedParams;
	  }

	  return url;
	};


/***/ },
/* 65 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var utils = __webpack_require__(52);

	/**
	 * Parse headers into an object
	 *
	 * ```
	 * Date: Wed, 27 Aug 2014 08:58:49 GMT
	 * Content-Type: application/json
	 * Connection: keep-alive
	 * Transfer-Encoding: chunked
	 * ```
	 *
	 * @param {String} headers Headers needing to be parsed
	 * @returns {Object} Headers parsed into an object
	 */
	module.exports = function parseHeaders(headers) {
	  var parsed = {};
	  var key;
	  var val;
	  var i;

	  if (!headers) { return parsed; }

	  utils.forEach(headers.split('\n'), function parser(line) {
	    i = line.indexOf(':');
	    key = utils.trim(line.substr(0, i)).toLowerCase();
	    val = utils.trim(line.substr(i + 1));

	    if (key) {
	      parsed[key] = parsed[key] ? parsed[key] + ', ' + val : val;
	    }
	  });

	  return parsed;
	};


/***/ },
/* 66 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var utils = __webpack_require__(52);

	module.exports = (
	  utils.isStandardBrowserEnv() ?

	  // Standard browser envs have full support of the APIs needed to test
	  // whether the request URL is of the same origin as current location.
	  (function standardBrowserEnv() {
	    var msie = /(msie|trident)/i.test(navigator.userAgent);
	    var urlParsingNode = document.createElement('a');
	    var originURL;

	    /**
	    * Parse a URL to discover it's components
	    *
	    * @param {String} url The URL to be parsed
	    * @returns {Object}
	    */
	    function resolveURL(url) {
	      var href = url;

	      if (msie) {
	        // IE needs attribute set twice to normalize properties
	        urlParsingNode.setAttribute('href', href);
	        href = urlParsingNode.href;
	      }

	      urlParsingNode.setAttribute('href', href);

	      // urlParsingNode provides the UrlUtils interface - http://url.spec.whatwg.org/#urlutils
	      return {
	        href: urlParsingNode.href,
	        protocol: urlParsingNode.protocol ? urlParsingNode.protocol.replace(/:$/, '') : '',
	        host: urlParsingNode.host,
	        search: urlParsingNode.search ? urlParsingNode.search.replace(/^\?/, '') : '',
	        hash: urlParsingNode.hash ? urlParsingNode.hash.replace(/^#/, '') : '',
	        hostname: urlParsingNode.hostname,
	        port: urlParsingNode.port,
	        pathname: (urlParsingNode.pathname.charAt(0) === '/') ?
	                  urlParsingNode.pathname :
	                  '/' + urlParsingNode.pathname
	      };
	    }

	    originURL = resolveURL(window.location.href);

	    /**
	    * Determine if a URL shares the same origin as the current location
	    *
	    * @param {String} requestURL The URL to test
	    * @returns {boolean} True if URL shares the same origin, otherwise false
	    */
	    return function isURLSameOrigin(requestURL) {
	      var parsed = (utils.isString(requestURL)) ? resolveURL(requestURL) : requestURL;
	      return (parsed.protocol === originURL.protocol &&
	            parsed.host === originURL.host);
	    };
	  })() :

	  // Non standard browser envs (web workers, react-native) lack needed support.
	  (function nonStandardBrowserEnv() {
	    return function isURLSameOrigin() {
	      return true;
	    };
	  })()
	);


/***/ },
/* 67 */
/***/ function(module, exports) {

	'use strict';

	// btoa polyfill for IE<10 courtesy https://github.com/davidchambers/Base64.js

	var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';

	function E() {
	  this.message = 'String contains an invalid character';
	}
	E.prototype = new Error;
	E.prototype.code = 5;
	E.prototype.name = 'InvalidCharacterError';

	function btoa(input) {
	  var str = String(input);
	  var output = '';
	  for (
	    // initialize result and counter
	    var block, charCode, idx = 0, map = chars;
	    // if the next str index does not exist:
	    //   change the mapping table to "="
	    //   check if d has no fractional digits
	    str.charAt(idx | 0) || (map = '=', idx % 1);
	    // "8 - idx % 1 * 8" generates the sequence 2, 4, 6, 8
	    output += map.charAt(63 & block >> 8 - idx % 1 * 8)
	  ) {
	    charCode = str.charCodeAt(idx += 3 / 4);
	    if (charCode > 0xFF) {
	      throw new E();
	    }
	    block = block << 8 | charCode;
	  }
	  return output;
	}

	module.exports = btoa;


/***/ },
/* 68 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var utils = __webpack_require__(52);

	module.exports = (
	  utils.isStandardBrowserEnv() ?

	  // Standard browser envs support document.cookie
	  (function standardBrowserEnv() {
	    return {
	      write: function write(name, value, expires, path, domain, secure) {
	        var cookie = [];
	        cookie.push(name + '=' + encodeURIComponent(value));

	        if (utils.isNumber(expires)) {
	          cookie.push('expires=' + new Date(expires).toGMTString());
	        }

	        if (utils.isString(path)) {
	          cookie.push('path=' + path);
	        }

	        if (utils.isString(domain)) {
	          cookie.push('domain=' + domain);
	        }

	        if (secure === true) {
	          cookie.push('secure');
	        }

	        document.cookie = cookie.join('; ');
	      },

	      read: function read(name) {
	        var match = document.cookie.match(new RegExp('(^|;\\s*)(' + name + ')=([^;]*)'));
	        return (match ? decodeURIComponent(match[3]) : null);
	      },

	      remove: function remove(name) {
	        this.write(name, '', Date.now() - 86400000);
	      }
	    };
	  })() :

	  // Non standard browser env (web workers, react-native) lack needed support.
	  (function nonStandardBrowserEnv() {
	    return {
	      write: function write() {},
	      read: function read() { return null; },
	      remove: function remove() {}
	    };
	  })()
	);


/***/ },
/* 69 */
/***/ function(module, exports) {

	'use strict';

	/**
	 * Determines whether the specified URL is absolute
	 *
	 * @param {string} url The URL to test
	 * @returns {boolean} True if the specified URL is absolute, otherwise false
	 */
	module.exports = function isAbsoluteURL(url) {
	  // A URL is considered absolute if it begins with "<scheme>://" or "//" (protocol-relative URL).
	  // RFC 3986 defines scheme name as a sequence of characters beginning with a letter and followed
	  // by any combination of letters, digits, plus, period, or hyphen.
	  return /^([a-z][a-z\d\+\-\.]*:)?\/\//i.test(url);
	};


/***/ },
/* 70 */
/***/ function(module, exports) {

	'use strict';

	/**
	 * Creates a new URL by combining the specified URLs
	 *
	 * @param {string} baseURL The base URL
	 * @param {string} relativeURL The relative URL
	 * @returns {string} The combined URL
	 */
	module.exports = function combineURLs(baseURL, relativeURL) {
	  return baseURL.replace(/\/+$/, '') + '/' + relativeURL.replace(/^\/+/, '');
	};


/***/ },
/* 71 */
/***/ function(module, exports) {

	'use strict';

	/**
	 * Syntactic sugar for invoking a function and expanding an array for arguments.
	 *
	 * Common use case would be to use `Function.prototype.apply`.
	 *
	 *  ```js
	 *  function f(x, y, z) {}
	 *  var args = [1, 2, 3];
	 *  f.apply(null, args);
	 *  ```
	 *
	 * With `spread` this example can be re-written.
	 *
	 *  ```js
	 *  spread(function(x, y, z) {})([1, 2, 3]);
	 *  ```
	 *
	 * @param {Function} callback
	 * @returns {Function}
	 */
	module.exports = function spread(callback) {
	  return function wrap(arr) {
	    return callback.apply(null, arr);
	  };
	};


/***/ },
/* 72 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});

	var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	var _localforage = __webpack_require__(73);

	var _localforage2 = _interopRequireDefault(_localforage);

	var _CB = __webpack_require__(1);

	var _CB2 = _interopRequireDefault(_CB);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	/*
	 CloudApp
	 */
	var CloudApp = function () {
	    function CloudApp() {
	        _classCallCheck(this, CloudApp);

	        this._isConnected = false;
	    }

	    _createClass(CloudApp, [{
	        key: 'init',
	        value: function init(serverUrl, applicationId, applicationKey, opts) {
	            //static function for initialisation of the app
	            if (!applicationKey) {
	                applicationKey = applicationId;
	                applicationId = serverUrl;
	            } else {
	                _CB2.default.apiUrl = stripTrailingSlash(serverUrl);
	            }

	            if ((typeof applicationKey === 'undefined' ? 'undefined' : _typeof(applicationKey)) === "object") {
	                opts = applicationKey;
	                applicationKey = applicationId;
	                applicationId = serverUrl;
	            }

	            _CB2.default.appId = applicationId;
	            _CB2.default.appKey = applicationKey;

	            if (opts && opts.disableRealtime === true) {
	                _CB2.default._isRealtimeDisabled = true;
	            } else {
	                var socketRelativeUrl = getUrlFromUri(_CB2.default.apiUrl);
	                var urlWithoutNamespace = getUrlWithoutNsc(_CB2.default.apiUrl, socketRelativeUrl);
	                if (_CB2.default._isNode) {
	                    _CB2.default.io = __webpack_require__(74);
	                    _CB2.default.Socket = _CB2.default.io(urlWithoutNamespace, {
	                        jsonp: false,
	                        transports: ['websocket'],
	                        path: socketRelativeUrl + '/socket.io'
	                    });
	                } else {
	                    _CB2.default.io = __webpack_require__(75);
	                    _CB2.default.Socket = _CB2.default.io(urlWithoutNamespace, {
	                        path: socketRelativeUrl + '/socket.io'
	                    });
	                }
	            }
	            _CB2.default.CloudApp._isConnected = true;
	            _confirmConnection();
	            if (!_CB2.default._isRealtimeDisabled) {
	                this.onConnect(function () {
	                    _CB2.default.CloudApp._isConnected = true;
	                    _CB2.default.CloudObject.sync();
	                });
	                this.onDisconnect(function () {
	                    _CB2.default.CloudApp._isConnected = false;
	                });
	            }
	        }
	    }, {
	        key: 'onConnect',
	        value: function onConnect(functionToFire) {
	            //static function for initialisation of the app
	            _CB2.default._validate();
	            if (!_CB2.default.Socket) {
	                throw "Socket couldn't be found. Init app first.";
	            }
	            _CB2.default.Socket.on('connect', functionToFire);
	        }
	    }, {
	        key: 'onDisconnect',
	        value: function onDisconnect(functionToFire) {
	            //static function for initialisation of the app
	            _CB2.default._validate();

	            if (!_CB2.default.Socket) {
	                throw "Socket couldn't be found. Init app first.";
	            }
	            _CB2.default.Socket.on('disconnect', functionToFire);
	        }
	    }, {
	        key: 'connect',
	        value: function connect() {
	            //static function for initialisation of the app
	            _CB2.default._validate();

	            if (!_CB2.default.Socket) {
	                throw "Socket couldn't be found. Init app first.";
	            }

	            _CB2.default.Socket.connect();
	            this._isConnected = true;
	        }
	    }, {
	        key: 'disconnect',
	        value: function disconnect() {
	            //static function for initialisation of the app
	            _CB2.default._validate();

	            if (!_CB2.default.Socket) {
	                throw "Socket couldn't be found. Init app first.";
	            }

	            _CB2.default.Socket.emit('socket-disconnect', _CB2.default.appId);
	            this._isConnected = false;
	        }
	    }]);

	    return CloudApp;
	}();

	Object.defineProperty(CloudApp.prototype, 'isConnected', {
	    get: function get() {
	        return this._isConnected;
	    }
	});

	function _confirmConnection(callback) {
	    var URL = _CB2.default.apiUrl + '/status';
	    _CB2.default._request('GET', URL).then(function (res) {
	        _CB2.default.CloudApp._isConnected = true;
	    }, function (err) {
	        _CB2.default.CloudApp._isConnected = false;
	    });
	}

	function stripTrailingSlash(url) {
	    if (url[url.length - 1] == '/') {
	        url = url.split('');
	        url.splice(-1, 1);
	        url = url.join('');
	    }
	    return url;
	}

	function getUrlFromUri(url) {
	    var socketRelativeUrl = url;
	    socketRelativeUrl = socketRelativeUrl.replace('://', '');
	    socketRelativeUrl = socketRelativeUrl.split('/');
	    // remove null value
	    socketRelativeUrl = socketRelativeUrl.filter(function (x) {
	        return x;
	    });
	    if (socketRelativeUrl.length > 1) {
	        socketRelativeUrl.splice(0, 1, '');
	        url = socketRelativeUrl.join('/');
	    } else {
	        url = "";
	    }
	    return url;
	}

	function getUrlWithoutNsc(uri, url) {
	    if (url == "") {
	        return uri;
	    }
	    return uri.replace(url, '');
	}

	_CB2.default.CloudApp = new CloudApp();

	exports.default = CloudApp;

/***/ },
/* 73 */
/***/ function(module, exports) {

	/*!
	    localForage -- Offline Storage, Improved
	    Version 1.7.1
	    https://localforage.github.io/localForage
	    (c) 2013-2017 Mozilla, Apache License 2.0
	*/
	(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.localforage = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw (f.code="MODULE_NOT_FOUND", f)}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(_dereq_,module,exports){
	(function (global){
	'use strict';
	var Mutation = global.MutationObserver || global.WebKitMutationObserver;

	var scheduleDrain;

	{
	  if (Mutation) {
	    var called = 0;
	    var observer = new Mutation(nextTick);
	    var element = global.document.createTextNode('');
	    observer.observe(element, {
	      characterData: true
	    });
	    scheduleDrain = function () {
	      element.data = (called = ++called % 2);
	    };
	  } else if (!global.setImmediate && typeof global.MessageChannel !== 'undefined') {
	    var channel = new global.MessageChannel();
	    channel.port1.onmessage = nextTick;
	    scheduleDrain = function () {
	      channel.port2.postMessage(0);
	    };
	  } else if ('document' in global && 'onreadystatechange' in global.document.createElement('script')) {
	    scheduleDrain = function () {

	      // Create a <script> element; its readystatechange event will be fired asynchronously once it is inserted
	      // into the document. Do so, thus queuing up the task. Remember to clean up once it's been called.
	      var scriptEl = global.document.createElement('script');
	      scriptEl.onreadystatechange = function () {
	        nextTick();

	        scriptEl.onreadystatechange = null;
	        scriptEl.parentNode.removeChild(scriptEl);
	        scriptEl = null;
	      };
	      global.document.documentElement.appendChild(scriptEl);
	    };
	  } else {
	    scheduleDrain = function () {
	      setTimeout(nextTick, 0);
	    };
	  }
	}

	var draining;
	var queue = [];
	//named nextTick for less confusing stack traces
	function nextTick() {
	  draining = true;
	  var i, oldQueue;
	  var len = queue.length;
	  while (len) {
	    oldQueue = queue;
	    queue = [];
	    i = -1;
	    while (++i < len) {
	      oldQueue[i]();
	    }
	    len = queue.length;
	  }
	  draining = false;
	}

	module.exports = immediate;
	function immediate(task) {
	  if (queue.push(task) === 1 && !draining) {
	    scheduleDrain();
	  }
	}

	}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
	},{}],2:[function(_dereq_,module,exports){
	'use strict';
	var immediate = _dereq_(1);

	/* istanbul ignore next */
	function INTERNAL() {}

	var handlers = {};

	var REJECTED = ['REJECTED'];
	var FULFILLED = ['FULFILLED'];
	var PENDING = ['PENDING'];

	module.exports = Promise;

	function Promise(resolver) {
	  if (typeof resolver !== 'function') {
	    throw new TypeError('resolver must be a function');
	  }
	  this.state = PENDING;
	  this.queue = [];
	  this.outcome = void 0;
	  if (resolver !== INTERNAL) {
	    safelyResolveThenable(this, resolver);
	  }
	}

	Promise.prototype["catch"] = function (onRejected) {
	  return this.then(null, onRejected);
	};
	Promise.prototype.then = function (onFulfilled, onRejected) {
	  if (typeof onFulfilled !== 'function' && this.state === FULFILLED ||
	    typeof onRejected !== 'function' && this.state === REJECTED) {
	    return this;
	  }
	  var promise = new this.constructor(INTERNAL);
	  if (this.state !== PENDING) {
	    var resolver = this.state === FULFILLED ? onFulfilled : onRejected;
	    unwrap(promise, resolver, this.outcome);
	  } else {
	    this.queue.push(new QueueItem(promise, onFulfilled, onRejected));
	  }

	  return promise;
	};
	function QueueItem(promise, onFulfilled, onRejected) {
	  this.promise = promise;
	  if (typeof onFulfilled === 'function') {
	    this.onFulfilled = onFulfilled;
	    this.callFulfilled = this.otherCallFulfilled;
	  }
	  if (typeof onRejected === 'function') {
	    this.onRejected = onRejected;
	    this.callRejected = this.otherCallRejected;
	  }
	}
	QueueItem.prototype.callFulfilled = function (value) {
	  handlers.resolve(this.promise, value);
	};
	QueueItem.prototype.otherCallFulfilled = function (value) {
	  unwrap(this.promise, this.onFulfilled, value);
	};
	QueueItem.prototype.callRejected = function (value) {
	  handlers.reject(this.promise, value);
	};
	QueueItem.prototype.otherCallRejected = function (value) {
	  unwrap(this.promise, this.onRejected, value);
	};

	function unwrap(promise, func, value) {
	  immediate(function () {
	    var returnValue;
	    try {
	      returnValue = func(value);
	    } catch (e) {
	      return handlers.reject(promise, e);
	    }
	    if (returnValue === promise) {
	      handlers.reject(promise, new TypeError('Cannot resolve promise with itself'));
	    } else {
	      handlers.resolve(promise, returnValue);
	    }
	  });
	}

	handlers.resolve = function (self, value) {
	  var result = tryCatch(getThen, value);
	  if (result.status === 'error') {
	    return handlers.reject(self, result.value);
	  }
	  var thenable = result.value;

	  if (thenable) {
	    safelyResolveThenable(self, thenable);
	  } else {
	    self.state = FULFILLED;
	    self.outcome = value;
	    var i = -1;
	    var len = self.queue.length;
	    while (++i < len) {
	      self.queue[i].callFulfilled(value);
	    }
	  }
	  return self;
	};
	handlers.reject = function (self, error) {
	  self.state = REJECTED;
	  self.outcome = error;
	  var i = -1;
	  var len = self.queue.length;
	  while (++i < len) {
	    self.queue[i].callRejected(error);
	  }
	  return self;
	};

	function getThen(obj) {
	  // Make sure we only access the accessor once as required by the spec
	  var then = obj && obj.then;
	  if (obj && (typeof obj === 'object' || typeof obj === 'function') && typeof then === 'function') {
	    return function appyThen() {
	      then.apply(obj, arguments);
	    };
	  }
	}

	function safelyResolveThenable(self, thenable) {
	  // Either fulfill, reject or reject with error
	  var called = false;
	  function onError(value) {
	    if (called) {
	      return;
	    }
	    called = true;
	    handlers.reject(self, value);
	  }

	  function onSuccess(value) {
	    if (called) {
	      return;
	    }
	    called = true;
	    handlers.resolve(self, value);
	  }

	  function tryToUnwrap() {
	    thenable(onSuccess, onError);
	  }

	  var result = tryCatch(tryToUnwrap);
	  if (result.status === 'error') {
	    onError(result.value);
	  }
	}

	function tryCatch(func, value) {
	  var out = {};
	  try {
	    out.value = func(value);
	    out.status = 'success';
	  } catch (e) {
	    out.status = 'error';
	    out.value = e;
	  }
	  return out;
	}

	Promise.resolve = resolve;
	function resolve(value) {
	  if (value instanceof this) {
	    return value;
	  }
	  return handlers.resolve(new this(INTERNAL), value);
	}

	Promise.reject = reject;
	function reject(reason) {
	  var promise = new this(INTERNAL);
	  return handlers.reject(promise, reason);
	}

	Promise.all = all;
	function all(iterable) {
	  var self = this;
	  if (Object.prototype.toString.call(iterable) !== '[object Array]') {
	    return this.reject(new TypeError('must be an array'));
	  }

	  var len = iterable.length;
	  var called = false;
	  if (!len) {
	    return this.resolve([]);
	  }

	  var values = new Array(len);
	  var resolved = 0;
	  var i = -1;
	  var promise = new this(INTERNAL);

	  while (++i < len) {
	    allResolver(iterable[i], i);
	  }
	  return promise;
	  function allResolver(value, i) {
	    self.resolve(value).then(resolveFromAll, function (error) {
	      if (!called) {
	        called = true;
	        handlers.reject(promise, error);
	      }
	    });
	    function resolveFromAll(outValue) {
	      values[i] = outValue;
	      if (++resolved === len && !called) {
	        called = true;
	        handlers.resolve(promise, values);
	      }
	    }
	  }
	}

	Promise.race = race;
	function race(iterable) {
	  var self = this;
	  if (Object.prototype.toString.call(iterable) !== '[object Array]') {
	    return this.reject(new TypeError('must be an array'));
	  }

	  var len = iterable.length;
	  var called = false;
	  if (!len) {
	    return this.resolve([]);
	  }

	  var i = -1;
	  var promise = new this(INTERNAL);

	  while (++i < len) {
	    resolver(iterable[i]);
	  }
	  return promise;
	  function resolver(value) {
	    self.resolve(value).then(function (response) {
	      if (!called) {
	        called = true;
	        handlers.resolve(promise, response);
	      }
	    }, function (error) {
	      if (!called) {
	        called = true;
	        handlers.reject(promise, error);
	      }
	    });
	  }
	}

	},{"1":1}],3:[function(_dereq_,module,exports){
	(function (global){
	'use strict';
	if (typeof global.Promise !== 'function') {
	  global.Promise = _dereq_(2);
	}

	}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
	},{"2":2}],4:[function(_dereq_,module,exports){
	'use strict';

	var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	function getIDB() {
	    /* global indexedDB,webkitIndexedDB,mozIndexedDB,OIndexedDB,msIndexedDB */
	    try {
	        if (typeof indexedDB !== 'undefined') {
	            return indexedDB;
	        }
	        if (typeof webkitIndexedDB !== 'undefined') {
	            return webkitIndexedDB;
	        }
	        if (typeof mozIndexedDB !== 'undefined') {
	            return mozIndexedDB;
	        }
	        if (typeof OIndexedDB !== 'undefined') {
	            return OIndexedDB;
	        }
	        if (typeof msIndexedDB !== 'undefined') {
	            return msIndexedDB;
	        }
	    } catch (e) {
	        return;
	    }
	}

	var idb = getIDB();

	function isIndexedDBValid() {
	    try {
	        // Initialize IndexedDB; fall back to vendor-prefixed versions
	        // if needed.
	        if (!idb) {
	            return false;
	        }
	        // We mimic PouchDB here;
	        //
	        // We test for openDatabase because IE Mobile identifies itself
	        // as Safari. Oh the lulz...
	        var isSafari = typeof openDatabase !== 'undefined' && /(Safari|iPhone|iPad|iPod)/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent) && !/BlackBerry/.test(navigator.platform);

	        var hasFetch = typeof fetch === 'function' && fetch.toString().indexOf('[native code') !== -1;

	        // Safari <10.1 does not meet our requirements for IDB support (#5572)
	        // since Safari 10.1 shipped with fetch, we can use that to detect it
	        return (!isSafari || hasFetch) && typeof indexedDB !== 'undefined' &&
	        // some outdated implementations of IDB that appear on Samsung
	        // and HTC Android devices <4.4 are missing IDBKeyRange
	        // See: https://github.com/mozilla/localForage/issues/128
	        // See: https://github.com/mozilla/localForage/issues/272
	        typeof IDBKeyRange !== 'undefined';
	    } catch (e) {
	        return false;
	    }
	}

	// Abstracts constructing a Blob object, so it also works in older
	// browsers that don't support the native Blob constructor. (i.e.
	// old QtWebKit versions, at least).
	// Abstracts constructing a Blob object, so it also works in older
	// browsers that don't support the native Blob constructor. (i.e.
	// old QtWebKit versions, at least).
	function createBlob(parts, properties) {
	    /* global BlobBuilder,MSBlobBuilder,MozBlobBuilder,WebKitBlobBuilder */
	    parts = parts || [];
	    properties = properties || {};
	    try {
	        return new Blob(parts, properties);
	    } catch (e) {
	        if (e.name !== 'TypeError') {
	            throw e;
	        }
	        var Builder = typeof BlobBuilder !== 'undefined' ? BlobBuilder : typeof MSBlobBuilder !== 'undefined' ? MSBlobBuilder : typeof MozBlobBuilder !== 'undefined' ? MozBlobBuilder : WebKitBlobBuilder;
	        var builder = new Builder();
	        for (var i = 0; i < parts.length; i += 1) {
	            builder.append(parts[i]);
	        }
	        return builder.getBlob(properties.type);
	    }
	}

	// This is CommonJS because lie is an external dependency, so Rollup
	// can just ignore it.
	if (typeof Promise === 'undefined') {
	    // In the "nopromises" build this will just throw if you don't have
	    // a global promise object, but it would throw anyway later.
	    _dereq_(3);
	}
	var Promise$1 = Promise;

	function executeCallback(promise, callback) {
	    if (callback) {
	        promise.then(function (result) {
	            callback(null, result);
	        }, function (error) {
	            callback(error);
	        });
	    }
	}

	function executeTwoCallbacks(promise, callback, errorCallback) {
	    if (typeof callback === 'function') {
	        promise.then(callback);
	    }

	    if (typeof errorCallback === 'function') {
	        promise["catch"](errorCallback);
	    }
	}

	function normalizeKey(key) {
	    // Cast the key to a string, as that's all we can set as a key.
	    if (typeof key !== 'string') {
	        console.warn(key + ' used as a key, but it is not a string.');
	        key = String(key);
	    }

	    return key;
	}

	function getCallback() {
	    if (arguments.length && typeof arguments[arguments.length - 1] === 'function') {
	        return arguments[arguments.length - 1];
	    }
	}

	// Some code originally from async_storage.js in
	// [Gaia](https://github.com/mozilla-b2g/gaia).

	var DETECT_BLOB_SUPPORT_STORE = 'local-forage-detect-blob-support';
	var supportsBlobs = void 0;
	var dbContexts = {};
	var toString = Object.prototype.toString;

	// Transaction Modes
	var READ_ONLY = 'readonly';
	var READ_WRITE = 'readwrite';

	// Transform a binary string to an array buffer, because otherwise
	// weird stuff happens when you try to work with the binary string directly.
	// It is known.
	// From http://stackoverflow.com/questions/14967647/ (continues on next line)
	// encode-decode-image-with-base64-breaks-image (2013-04-21)
	function _binStringToArrayBuffer(bin) {
	    var length = bin.length;
	    var buf = new ArrayBuffer(length);
	    var arr = new Uint8Array(buf);
	    for (var i = 0; i < length; i++) {
	        arr[i] = bin.charCodeAt(i);
	    }
	    return buf;
	}

	//
	// Blobs are not supported in all versions of IndexedDB, notably
	// Chrome <37 and Android <5. In those versions, storing a blob will throw.
	//
	// Various other blob bugs exist in Chrome v37-42 (inclusive).
	// Detecting them is expensive and confusing to users, and Chrome 37-42
	// is at very low usage worldwide, so we do a hacky userAgent check instead.
	//
	// content-type bug: https://code.google.com/p/chromium/issues/detail?id=408120
	// 404 bug: https://code.google.com/p/chromium/issues/detail?id=447916
	// FileReader bug: https://code.google.com/p/chromium/issues/detail?id=447836
	//
	// Code borrowed from PouchDB. See:
	// https://github.com/pouchdb/pouchdb/blob/master/packages/node_modules/pouchdb-adapter-idb/src/blobSupport.js
	//
	function _checkBlobSupportWithoutCaching(idb) {
	    return new Promise$1(function (resolve) {
	        var txn = idb.transaction(DETECT_BLOB_SUPPORT_STORE, READ_WRITE);
	        var blob = createBlob(['']);
	        txn.objectStore(DETECT_BLOB_SUPPORT_STORE).put(blob, 'key');

	        txn.onabort = function (e) {
	            // If the transaction aborts now its due to not being able to
	            // write to the database, likely due to the disk being full
	            e.preventDefault();
	            e.stopPropagation();
	            resolve(false);
	        };

	        txn.oncomplete = function () {
	            var matchedChrome = navigator.userAgent.match(/Chrome\/(\d+)/);
	            var matchedEdge = navigator.userAgent.match(/Edge\//);
	            // MS Edge pretends to be Chrome 42:
	            // https://msdn.microsoft.com/en-us/library/hh869301%28v=vs.85%29.aspx
	            resolve(matchedEdge || !matchedChrome || parseInt(matchedChrome[1], 10) >= 43);
	        };
	    })["catch"](function () {
	        return false; // error, so assume unsupported
	    });
	}

	function _checkBlobSupport(idb) {
	    if (typeof supportsBlobs === 'boolean') {
	        return Promise$1.resolve(supportsBlobs);
	    }
	    return _checkBlobSupportWithoutCaching(idb).then(function (value) {
	        supportsBlobs = value;
	        return supportsBlobs;
	    });
	}

	function _deferReadiness(dbInfo) {
	    var dbContext = dbContexts[dbInfo.name];

	    // Create a deferred object representing the current database operation.
	    var deferredOperation = {};

	    deferredOperation.promise = new Promise$1(function (resolve, reject) {
	        deferredOperation.resolve = resolve;
	        deferredOperation.reject = reject;
	    });

	    // Enqueue the deferred operation.
	    dbContext.deferredOperations.push(deferredOperation);

	    // Chain its promise to the database readiness.
	    if (!dbContext.dbReady) {
	        dbContext.dbReady = deferredOperation.promise;
	    } else {
	        dbContext.dbReady = dbContext.dbReady.then(function () {
	            return deferredOperation.promise;
	        });
	    }
	}

	function _advanceReadiness(dbInfo) {
	    var dbContext = dbContexts[dbInfo.name];

	    // Dequeue a deferred operation.
	    var deferredOperation = dbContext.deferredOperations.pop();

	    // Resolve its promise (which is part of the database readiness
	    // chain of promises).
	    if (deferredOperation) {
	        deferredOperation.resolve();
	        return deferredOperation.promise;
	    }
	}

	function _rejectReadiness(dbInfo, err) {
	    var dbContext = dbContexts[dbInfo.name];

	    // Dequeue a deferred operation.
	    var deferredOperation = dbContext.deferredOperations.pop();

	    // Reject its promise (which is part of the database readiness
	    // chain of promises).
	    if (deferredOperation) {
	        deferredOperation.reject(err);
	        return deferredOperation.promise;
	    }
	}

	function _getConnection(dbInfo, upgradeNeeded) {
	    return new Promise$1(function (resolve, reject) {
	        dbContexts[dbInfo.name] = dbContexts[dbInfo.name] || createDbContext();

	        if (dbInfo.db) {
	            if (upgradeNeeded) {
	                _deferReadiness(dbInfo);
	                dbInfo.db.close();
	            } else {
	                return resolve(dbInfo.db);
	            }
	        }

	        var dbArgs = [dbInfo.name];

	        if (upgradeNeeded) {
	            dbArgs.push(dbInfo.version);
	        }

	        var openreq = idb.open.apply(idb, dbArgs);

	        if (upgradeNeeded) {
	            openreq.onupgradeneeded = function (e) {
	                var db = openreq.result;
	                try {
	                    db.createObjectStore(dbInfo.storeName);
	                    if (e.oldVersion <= 1) {
	                        // Added when support for blob shims was added
	                        db.createObjectStore(DETECT_BLOB_SUPPORT_STORE);
	                    }
	                } catch (ex) {
	                    if (ex.name === 'ConstraintError') {
	                        console.warn('The database "' + dbInfo.name + '"' + ' has been upgraded from version ' + e.oldVersion + ' to version ' + e.newVersion + ', but the storage "' + dbInfo.storeName + '" already exists.');
	                    } else {
	                        throw ex;
	                    }
	                }
	            };
	        }

	        openreq.onerror = function (e) {
	            e.preventDefault();
	            reject(openreq.error);
	        };

	        openreq.onsuccess = function () {
	            resolve(openreq.result);
	            _advanceReadiness(dbInfo);
	        };
	    });
	}

	function _getOriginalConnection(dbInfo) {
	    return _getConnection(dbInfo, false);
	}

	function _getUpgradedConnection(dbInfo) {
	    return _getConnection(dbInfo, true);
	}

	function _isUpgradeNeeded(dbInfo, defaultVersion) {
	    if (!dbInfo.db) {
	        return true;
	    }

	    var isNewStore = !dbInfo.db.objectStoreNames.contains(dbInfo.storeName);
	    var isDowngrade = dbInfo.version < dbInfo.db.version;
	    var isUpgrade = dbInfo.version > dbInfo.db.version;

	    if (isDowngrade) {
	        // If the version is not the default one
	        // then warn for impossible downgrade.
	        if (dbInfo.version !== defaultVersion) {
	            console.warn('The database "' + dbInfo.name + '"' + " can't be downgraded from version " + dbInfo.db.version + ' to version ' + dbInfo.version + '.');
	        }
	        // Align the versions to prevent errors.
	        dbInfo.version = dbInfo.db.version;
	    }

	    if (isUpgrade || isNewStore) {
	        // If the store is new then increment the version (if needed).
	        // This will trigger an "upgradeneeded" event which is required
	        // for creating a store.
	        if (isNewStore) {
	            var incVersion = dbInfo.db.version + 1;
	            if (incVersion > dbInfo.version) {
	                dbInfo.version = incVersion;
	            }
	        }

	        return true;
	    }

	    return false;
	}

	// encode a blob for indexeddb engines that don't support blobs
	function _encodeBlob(blob) {
	    return new Promise$1(function (resolve, reject) {
	        var reader = new FileReader();
	        reader.onerror = reject;
	        reader.onloadend = function (e) {
	            var base64 = btoa(e.target.result || '');
	            resolve({
	                __local_forage_encoded_blob: true,
	                data: base64,
	                type: blob.type
	            });
	        };
	        reader.readAsBinaryString(blob);
	    });
	}

	// decode an encoded blob
	function _decodeBlob(encodedBlob) {
	    var arrayBuff = _binStringToArrayBuffer(atob(encodedBlob.data));
	    return createBlob([arrayBuff], { type: encodedBlob.type });
	}

	// is this one of our fancy encoded blobs?
	function _isEncodedBlob(value) {
	    return value && value.__local_forage_encoded_blob;
	}

	// Specialize the default `ready()` function by making it dependent
	// on the current database operations. Thus, the driver will be actually
	// ready when it's been initialized (default) *and* there are no pending
	// operations on the database (initiated by some other instances).
	function _fullyReady(callback) {
	    var self = this;

	    var promise = self._initReady().then(function () {
	        var dbContext = dbContexts[self._dbInfo.name];

	        if (dbContext && dbContext.dbReady) {
	            return dbContext.dbReady;
	        }
	    });

	    executeTwoCallbacks(promise, callback, callback);
	    return promise;
	}

	// Try to establish a new db connection to replace the
	// current one which is broken (i.e. experiencing
	// InvalidStateError while creating a transaction).
	function _tryReconnect(dbInfo) {
	    _deferReadiness(dbInfo);

	    var dbContext = dbContexts[dbInfo.name];
	    var forages = dbContext.forages;

	    for (var i = 0; i < forages.length; i++) {
	        var forage = forages[i];
	        if (forage._dbInfo.db) {
	            forage._dbInfo.db.close();
	            forage._dbInfo.db = null;
	        }
	    }
	    dbInfo.db = null;

	    return _getOriginalConnection(dbInfo).then(function (db) {
	        dbInfo.db = db;
	        if (_isUpgradeNeeded(dbInfo)) {
	            // Reopen the database for upgrading.
	            return _getUpgradedConnection(dbInfo);
	        }
	        return db;
	    }).then(function (db) {
	        // store the latest db reference
	        // in case the db was upgraded
	        dbInfo.db = dbContext.db = db;
	        for (var i = 0; i < forages.length; i++) {
	            forages[i]._dbInfo.db = db;
	        }
	    })["catch"](function (err) {
	        _rejectReadiness(dbInfo, err);
	        throw err;
	    });
	}

	// FF doesn't like Promises (micro-tasks) and IDDB store operations,
	// so we have to do it with callbacks
	function createTransaction(dbInfo, mode, callback, retries) {
	    if (retries === undefined) {
	        retries = 1;
	    }

	    try {
	        var tx = dbInfo.db.transaction(dbInfo.storeName, mode);
	        callback(null, tx);
	    } catch (err) {
	        if (retries > 0 && (!dbInfo.db || err.name === 'InvalidStateError' || err.name === 'NotFoundError')) {
	            return Promise$1.resolve().then(function () {
	                if (!dbInfo.db || err.name === 'NotFoundError' && !dbInfo.db.objectStoreNames.contains(dbInfo.storeName) && dbInfo.version <= dbInfo.db.version) {
	                    // increase the db version, to create the new ObjectStore
	                    if (dbInfo.db) {
	                        dbInfo.version = dbInfo.db.version + 1;
	                    }
	                    // Reopen the database for upgrading.
	                    return _getUpgradedConnection(dbInfo);
	                }
	            }).then(function () {
	                return _tryReconnect(dbInfo).then(function () {
	                    createTransaction(dbInfo, mode, callback, retries - 1);
	                });
	            })["catch"](callback);
	        }

	        callback(err);
	    }
	}

	function createDbContext() {
	    return {
	        // Running localForages sharing a database.
	        forages: [],
	        // Shared database.
	        db: null,
	        // Database readiness (promise).
	        dbReady: null,
	        // Deferred operations on the database.
	        deferredOperations: []
	    };
	}

	// Open the IndexedDB database (automatically creates one if one didn't
	// previously exist), using any options set in the config.
	function _initStorage(options) {
	    var self = this;
	    var dbInfo = {
	        db: null
	    };

	    if (options) {
	        for (var i in options) {
	            dbInfo[i] = options[i];
	        }
	    }

	    // Get the current context of the database;
	    var dbContext = dbContexts[dbInfo.name];

	    // ...or create a new context.
	    if (!dbContext) {
	        dbContext = createDbContext();
	        // Register the new context in the global container.
	        dbContexts[dbInfo.name] = dbContext;
	    }

	    // Register itself as a running localForage in the current context.
	    dbContext.forages.push(self);

	    // Replace the default `ready()` function with the specialized one.
	    if (!self._initReady) {
	        self._initReady = self.ready;
	        self.ready = _fullyReady;
	    }

	    // Create an array of initialization states of the related localForages.
	    var initPromises = [];

	    function ignoreErrors() {
	        // Don't handle errors here,
	        // just makes sure related localForages aren't pending.
	        return Promise$1.resolve();
	    }

	    for (var j = 0; j < dbContext.forages.length; j++) {
	        var forage = dbContext.forages[j];
	        if (forage !== self) {
	            // Don't wait for itself...
	            initPromises.push(forage._initReady()["catch"](ignoreErrors));
	        }
	    }

	    // Take a snapshot of the related localForages.
	    var forages = dbContext.forages.slice(0);

	    // Initialize the connection process only when
	    // all the related localForages aren't pending.
	    return Promise$1.all(initPromises).then(function () {
	        dbInfo.db = dbContext.db;
	        // Get the connection or open a new one without upgrade.
	        return _getOriginalConnection(dbInfo);
	    }).then(function (db) {
	        dbInfo.db = db;
	        if (_isUpgradeNeeded(dbInfo, self._defaultConfig.version)) {
	            // Reopen the database for upgrading.
	            return _getUpgradedConnection(dbInfo);
	        }
	        return db;
	    }).then(function (db) {
	        dbInfo.db = dbContext.db = db;
	        self._dbInfo = dbInfo;
	        // Share the final connection amongst related localForages.
	        for (var k = 0; k < forages.length; k++) {
	            var forage = forages[k];
	            if (forage !== self) {
	                // Self is already up-to-date.
	                forage._dbInfo.db = dbInfo.db;
	                forage._dbInfo.version = dbInfo.version;
	            }
	        }
	    });
	}

	function getItem(key, callback) {
	    var self = this;

	    key = normalizeKey(key);

	    var promise = new Promise$1(function (resolve, reject) {
	        self.ready().then(function () {
	            createTransaction(self._dbInfo, READ_ONLY, function (err, transaction) {
	                if (err) {
	                    return reject(err);
	                }

	                try {
	                    var store = transaction.objectStore(self._dbInfo.storeName);
	                    var req = store.get(key);

	                    req.onsuccess = function () {
	                        var value = req.result;
	                        if (value === undefined) {
	                            value = null;
	                        }
	                        if (_isEncodedBlob(value)) {
	                            value = _decodeBlob(value);
	                        }
	                        resolve(value);
	                    };

	                    req.onerror = function () {
	                        reject(req.error);
	                    };
	                } catch (e) {
	                    reject(e);
	                }
	            });
	        })["catch"](reject);
	    });

	    executeCallback(promise, callback);
	    return promise;
	}

	// Iterate over all items stored in database.
	function iterate(iterator, callback) {
	    var self = this;

	    var promise = new Promise$1(function (resolve, reject) {
	        self.ready().then(function () {
	            createTransaction(self._dbInfo, READ_ONLY, function (err, transaction) {
	                if (err) {
	                    return reject(err);
	                }

	                try {
	                    var store = transaction.objectStore(self._dbInfo.storeName);
	                    var req = store.openCursor();
	                    var iterationNumber = 1;

	                    req.onsuccess = function () {
	                        var cursor = req.result;

	                        if (cursor) {
	                            var value = cursor.value;
	                            if (_isEncodedBlob(value)) {
	                                value = _decodeBlob(value);
	                            }
	                            var result = iterator(value, cursor.key, iterationNumber++);

	                            // when the iterator callback retuns any
	                            // (non-`undefined`) value, then we stop
	                            // the iteration immediately
	                            if (result !== void 0) {
	                                resolve(result);
	                            } else {
	                                cursor["continue"]();
	                            }
	                        } else {
	                            resolve();
	                        }
	                    };

	                    req.onerror = function () {
	                        reject(req.error);
	                    };
	                } catch (e) {
	                    reject(e);
	                }
	            });
	        })["catch"](reject);
	    });

	    executeCallback(promise, callback);

	    return promise;
	}

	function setItem(key, value, callback) {
	    var self = this;

	    key = normalizeKey(key);

	    var promise = new Promise$1(function (resolve, reject) {
	        var dbInfo;
	        self.ready().then(function () {
	            dbInfo = self._dbInfo;
	            if (toString.call(value) === '[object Blob]') {
	                return _checkBlobSupport(dbInfo.db).then(function (blobSupport) {
	                    if (blobSupport) {
	                        return value;
	                    }
	                    return _encodeBlob(value);
	                });
	            }
	            return value;
	        }).then(function (value) {
	            createTransaction(self._dbInfo, READ_WRITE, function (err, transaction) {
	                if (err) {
	                    return reject(err);
	                }

	                try {
	                    var store = transaction.objectStore(self._dbInfo.storeName);

	                    // The reason we don't _save_ null is because IE 10 does
	                    // not support saving the `null` type in IndexedDB. How
	                    // ironic, given the bug below!
	                    // See: https://github.com/mozilla/localForage/issues/161
	                    if (value === null) {
	                        value = undefined;
	                    }

	                    var req = store.put(value, key);

	                    transaction.oncomplete = function () {
	                        // Cast to undefined so the value passed to
	                        // callback/promise is the same as what one would get out
	                        // of `getItem()` later. This leads to some weirdness
	                        // (setItem('foo', undefined) will return `null`), but
	                        // it's not my fault localStorage is our baseline and that
	                        // it's weird.
	                        if (value === undefined) {
	                            value = null;
	                        }

	                        resolve(value);
	                    };
	                    transaction.onabort = transaction.onerror = function () {
	                        var err = req.error ? req.error : req.transaction.error;
	                        reject(err);
	                    };
	                } catch (e) {
	                    reject(e);
	                }
	            });
	        })["catch"](reject);
	    });

	    executeCallback(promise, callback);
	    return promise;
	}

	function removeItem(key, callback) {
	    var self = this;

	    key = normalizeKey(key);

	    var promise = new Promise$1(function (resolve, reject) {
	        self.ready().then(function () {
	            createTransaction(self._dbInfo, READ_WRITE, function (err, transaction) {
	                if (err) {
	                    return reject(err);
	                }

	                try {
	                    var store = transaction.objectStore(self._dbInfo.storeName);
	                    // We use a Grunt task to make this safe for IE and some
	                    // versions of Android (including those used by Cordova).
	                    // Normally IE won't like `.delete()` and will insist on
	                    // using `['delete']()`, but we have a build step that
	                    // fixes this for us now.
	                    var req = store["delete"](key);
	                    transaction.oncomplete = function () {
	                        resolve();
	                    };

	                    transaction.onerror = function () {
	                        reject(req.error);
	                    };

	                    // The request will be also be aborted if we've exceeded our storage
	                    // space.
	                    transaction.onabort = function () {
	                        var err = req.error ? req.error : req.transaction.error;
	                        reject(err);
	                    };
	                } catch (e) {
	                    reject(e);
	                }
	            });
	        })["catch"](reject);
	    });

	    executeCallback(promise, callback);
	    return promise;
	}

	function clear(callback) {
	    var self = this;

	    var promise = new Promise$1(function (resolve, reject) {
	        self.ready().then(function () {
	            createTransaction(self._dbInfo, READ_WRITE, function (err, transaction) {
	                if (err) {
	                    return reject(err);
	                }

	                try {
	                    var store = transaction.objectStore(self._dbInfo.storeName);
	                    var req = store.clear();

	                    transaction.oncomplete = function () {
	                        resolve();
	                    };

	                    transaction.onabort = transaction.onerror = function () {
	                        var err = req.error ? req.error : req.transaction.error;
	                        reject(err);
	                    };
	                } catch (e) {
	                    reject(e);
	                }
	            });
	        })["catch"](reject);
	    });

	    executeCallback(promise, callback);
	    return promise;
	}

	function length(callback) {
	    var self = this;

	    var promise = new Promise$1(function (resolve, reject) {
	        self.ready().then(function () {
	            createTransaction(self._dbInfo, READ_ONLY, function (err, transaction) {
	                if (err) {
	                    return reject(err);
	                }

	                try {
	                    var store = transaction.objectStore(self._dbInfo.storeName);
	                    var req = store.count();

	                    req.onsuccess = function () {
	                        resolve(req.result);
	                    };

	                    req.onerror = function () {
	                        reject(req.error);
	                    };
	                } catch (e) {
	                    reject(e);
	                }
	            });
	        })["catch"](reject);
	    });

	    executeCallback(promise, callback);
	    return promise;
	}

	function key(n, callback) {
	    var self = this;

	    var promise = new Promise$1(function (resolve, reject) {
	        if (n < 0) {
	            resolve(null);

	            return;
	        }

	        self.ready().then(function () {
	            createTransaction(self._dbInfo, READ_ONLY, function (err, transaction) {
	                if (err) {
	                    return reject(err);
	                }

	                try {
	                    var store = transaction.objectStore(self._dbInfo.storeName);
	                    var advanced = false;
	                    var req = store.openCursor();

	                    req.onsuccess = function () {
	                        var cursor = req.result;
	                        if (!cursor) {
	                            // this means there weren't enough keys
	                            resolve(null);

	                            return;
	                        }

	                        if (n === 0) {
	                            // We have the first key, return it if that's what they
	                            // wanted.
	                            resolve(cursor.key);
	                        } else {
	                            if (!advanced) {
	                                // Otherwise, ask the cursor to skip ahead n
	                                // records.
	                                advanced = true;
	                                cursor.advance(n);
	                            } else {
	                                // When we get here, we've got the nth key.
	                                resolve(cursor.key);
	                            }
	                        }
	                    };

	                    req.onerror = function () {
	                        reject(req.error);
	                    };
	                } catch (e) {
	                    reject(e);
	                }
	            });
	        })["catch"](reject);
	    });

	    executeCallback(promise, callback);
	    return promise;
	}

	function keys(callback) {
	    var self = this;

	    var promise = new Promise$1(function (resolve, reject) {
	        self.ready().then(function () {
	            createTransaction(self._dbInfo, READ_ONLY, function (err, transaction) {
	                if (err) {
	                    return reject(err);
	                }

	                try {
	                    var store = transaction.objectStore(self._dbInfo.storeName);
	                    var req = store.openCursor();
	                    var keys = [];

	                    req.onsuccess = function () {
	                        var cursor = req.result;

	                        if (!cursor) {
	                            resolve(keys);
	                            return;
	                        }

	                        keys.push(cursor.key);
	                        cursor["continue"]();
	                    };

	                    req.onerror = function () {
	                        reject(req.error);
	                    };
	                } catch (e) {
	                    reject(e);
	                }
	            });
	        })["catch"](reject);
	    });

	    executeCallback(promise, callback);
	    return promise;
	}

	function dropInstance(options, callback) {
	    callback = getCallback.apply(this, arguments);

	    var currentConfig = this.config();
	    options = typeof options !== 'function' && options || {};
	    if (!options.name) {
	        options.name = options.name || currentConfig.name;
	        options.storeName = options.storeName || currentConfig.storeName;
	    }

	    var self = this;
	    var promise;
	    if (!options.name) {
	        promise = Promise$1.reject('Invalid arguments');
	    } else {
	        var isCurrentDb = options.name === currentConfig.name && self._dbInfo.db;

	        var dbPromise = isCurrentDb ? Promise$1.resolve(self._dbInfo.db) : _getOriginalConnection(options).then(function (db) {
	            var dbContext = dbContexts[options.name];
	            var forages = dbContext.forages;
	            dbContext.db = db;
	            for (var i = 0; i < forages.length; i++) {
	                forages[i]._dbInfo.db = db;
	            }
	            return db;
	        });

	        if (!options.storeName) {
	            promise = dbPromise.then(function (db) {
	                _deferReadiness(options);

	                var dbContext = dbContexts[options.name];
	                var forages = dbContext.forages;

	                db.close();
	                for (var i = 0; i < forages.length; i++) {
	                    var forage = forages[i];
	                    forage._dbInfo.db = null;
	                }

	                var dropDBPromise = new Promise$1(function (resolve, reject) {
	                    var req = idb.deleteDatabase(options.name);

	                    req.onerror = req.onblocked = function (err) {
	                        var db = req.result;
	                        if (db) {
	                            db.close();
	                        }
	                        reject(err);
	                    };

	                    req.onsuccess = function () {
	                        var db = req.result;
	                        if (db) {
	                            db.close();
	                        }
	                        resolve(db);
	                    };
	                });

	                return dropDBPromise.then(function (db) {
	                    dbContext.db = db;
	                    for (var i = 0; i < forages.length; i++) {
	                        var _forage = forages[i];
	                        _advanceReadiness(_forage._dbInfo);
	                    }
	                })["catch"](function (err) {
	                    (_rejectReadiness(options, err) || Promise$1.resolve())["catch"](function () {});
	                    throw err;
	                });
	            });
	        } else {
	            promise = dbPromise.then(function (db) {
	                if (!db.objectStoreNames.contains(options.storeName)) {
	                    return;
	                }

	                var newVersion = db.version + 1;

	                _deferReadiness(options);

	                var dbContext = dbContexts[options.name];
	                var forages = dbContext.forages;

	                db.close();
	                for (var i = 0; i < forages.length; i++) {
	                    var forage = forages[i];
	                    forage._dbInfo.db = null;
	                    forage._dbInfo.version = newVersion;
	                }

	                var dropObjectPromise = new Promise$1(function (resolve, reject) {
	                    var req = idb.open(options.name, newVersion);

	                    req.onerror = function (err) {
	                        var db = req.result;
	                        db.close();
	                        reject(err);
	                    };

	                    req.onupgradeneeded = function () {
	                        var db = req.result;
	                        db.deleteObjectStore(options.storeName);
	                    };

	                    req.onsuccess = function () {
	                        var db = req.result;
	                        db.close();
	                        resolve(db);
	                    };
	                });

	                return dropObjectPromise.then(function (db) {
	                    dbContext.db = db;
	                    for (var j = 0; j < forages.length; j++) {
	                        var _forage2 = forages[j];
	                        _forage2._dbInfo.db = db;
	                        _advanceReadiness(_forage2._dbInfo);
	                    }
	                })["catch"](function (err) {
	                    (_rejectReadiness(options, err) || Promise$1.resolve())["catch"](function () {});
	                    throw err;
	                });
	            });
	        }
	    }

	    executeCallback(promise, callback);
	    return promise;
	}

	var asyncStorage = {
	    _driver: 'asyncStorage',
	    _initStorage: _initStorage,
	    _support: isIndexedDBValid(),
	    iterate: iterate,
	    getItem: getItem,
	    setItem: setItem,
	    removeItem: removeItem,
	    clear: clear,
	    length: length,
	    key: key,
	    keys: keys,
	    dropInstance: dropInstance
	};

	function isWebSQLValid() {
	    return typeof openDatabase === 'function';
	}

	// Sadly, the best way to save binary data in WebSQL/localStorage is serializing
	// it to Base64, so this is how we store it to prevent very strange errors with less
	// verbose ways of binary <-> string data storage.
	var BASE_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

	var BLOB_TYPE_PREFIX = '~~local_forage_type~';
	var BLOB_TYPE_PREFIX_REGEX = /^~~local_forage_type~([^~]+)~/;

	var SERIALIZED_MARKER = '__lfsc__:';
	var SERIALIZED_MARKER_LENGTH = SERIALIZED_MARKER.length;

	// OMG the serializations!
	var TYPE_ARRAYBUFFER = 'arbf';
	var TYPE_BLOB = 'blob';
	var TYPE_INT8ARRAY = 'si08';
	var TYPE_UINT8ARRAY = 'ui08';
	var TYPE_UINT8CLAMPEDARRAY = 'uic8';
	var TYPE_INT16ARRAY = 'si16';
	var TYPE_INT32ARRAY = 'si32';
	var TYPE_UINT16ARRAY = 'ur16';
	var TYPE_UINT32ARRAY = 'ui32';
	var TYPE_FLOAT32ARRAY = 'fl32';
	var TYPE_FLOAT64ARRAY = 'fl64';
	var TYPE_SERIALIZED_MARKER_LENGTH = SERIALIZED_MARKER_LENGTH + TYPE_ARRAYBUFFER.length;

	var toString$1 = Object.prototype.toString;

	function stringToBuffer(serializedString) {
	    // Fill the string into a ArrayBuffer.
	    var bufferLength = serializedString.length * 0.75;
	    var len = serializedString.length;
	    var i;
	    var p = 0;
	    var encoded1, encoded2, encoded3, encoded4;

	    if (serializedString[serializedString.length - 1] === '=') {
	        bufferLength--;
	        if (serializedString[serializedString.length - 2] === '=') {
	            bufferLength--;
	        }
	    }

	    var buffer = new ArrayBuffer(bufferLength);
	    var bytes = new Uint8Array(buffer);

	    for (i = 0; i < len; i += 4) {
	        encoded1 = BASE_CHARS.indexOf(serializedString[i]);
	        encoded2 = BASE_CHARS.indexOf(serializedString[i + 1]);
	        encoded3 = BASE_CHARS.indexOf(serializedString[i + 2]);
	        encoded4 = BASE_CHARS.indexOf(serializedString[i + 3]);

	        /*jslint bitwise: true */
	        bytes[p++] = encoded1 << 2 | encoded2 >> 4;
	        bytes[p++] = (encoded2 & 15) << 4 | encoded3 >> 2;
	        bytes[p++] = (encoded3 & 3) << 6 | encoded4 & 63;
	    }
	    return buffer;
	}

	// Converts a buffer to a string to store, serialized, in the backend
	// storage library.
	function bufferToString(buffer) {
	    // base64-arraybuffer
	    var bytes = new Uint8Array(buffer);
	    var base64String = '';
	    var i;

	    for (i = 0; i < bytes.length; i += 3) {
	        /*jslint bitwise: true */
	        base64String += BASE_CHARS[bytes[i] >> 2];
	        base64String += BASE_CHARS[(bytes[i] & 3) << 4 | bytes[i + 1] >> 4];
	        base64String += BASE_CHARS[(bytes[i + 1] & 15) << 2 | bytes[i + 2] >> 6];
	        base64String += BASE_CHARS[bytes[i + 2] & 63];
	    }

	    if (bytes.length % 3 === 2) {
	        base64String = base64String.substring(0, base64String.length - 1) + '=';
	    } else if (bytes.length % 3 === 1) {
	        base64String = base64String.substring(0, base64String.length - 2) + '==';
	    }

	    return base64String;
	}

	// Serialize a value, afterwards executing a callback (which usually
	// instructs the `setItem()` callback/promise to be executed). This is how
	// we store binary data with localStorage.
	function serialize(value, callback) {
	    var valueType = '';
	    if (value) {
	        valueType = toString$1.call(value);
	    }

	    // Cannot use `value instanceof ArrayBuffer` or such here, as these
	    // checks fail when running the tests using casper.js...
	    //
	    // TODO: See why those tests fail and use a better solution.
	    if (value && (valueType === '[object ArrayBuffer]' || value.buffer && toString$1.call(value.buffer) === '[object ArrayBuffer]')) {
	        // Convert binary arrays to a string and prefix the string with
	        // a special marker.
	        var buffer;
	        var marker = SERIALIZED_MARKER;

	        if (value instanceof ArrayBuffer) {
	            buffer = value;
	            marker += TYPE_ARRAYBUFFER;
	        } else {
	            buffer = value.buffer;

	            if (valueType === '[object Int8Array]') {
	                marker += TYPE_INT8ARRAY;
	            } else if (valueType === '[object Uint8Array]') {
	                marker += TYPE_UINT8ARRAY;
	            } else if (valueType === '[object Uint8ClampedArray]') {
	                marker += TYPE_UINT8CLAMPEDARRAY;
	            } else if (valueType === '[object Int16Array]') {
	                marker += TYPE_INT16ARRAY;
	            } else if (valueType === '[object Uint16Array]') {
	                marker += TYPE_UINT16ARRAY;
	            } else if (valueType === '[object Int32Array]') {
	                marker += TYPE_INT32ARRAY;
	            } else if (valueType === '[object Uint32Array]') {
	                marker += TYPE_UINT32ARRAY;
	            } else if (valueType === '[object Float32Array]') {
	                marker += TYPE_FLOAT32ARRAY;
	            } else if (valueType === '[object Float64Array]') {
	                marker += TYPE_FLOAT64ARRAY;
	            } else {
	                callback(new Error('Failed to get type for BinaryArray'));
	            }
	        }

	        callback(marker + bufferToString(buffer));
	    } else if (valueType === '[object Blob]') {
	        // Conver the blob to a binaryArray and then to a string.
	        var fileReader = new FileReader();

	        fileReader.onload = function () {
	            // Backwards-compatible prefix for the blob type.
	            var str = BLOB_TYPE_PREFIX + value.type + '~' + bufferToString(this.result);

	            callback(SERIALIZED_MARKER + TYPE_BLOB + str);
	        };

	        fileReader.readAsArrayBuffer(value);
	    } else {
	        try {
	            callback(JSON.stringify(value));
	        } catch (e) {
	            console.error("Couldn't convert value into a JSON string: ", value);

	            callback(null, e);
	        }
	    }
	}

	// Deserialize data we've inserted into a value column/field. We place
	// special markers into our strings to mark them as encoded; this isn't
	// as nice as a meta field, but it's the only sane thing we can do whilst
	// keeping localStorage support intact.
	//
	// Oftentimes this will just deserialize JSON content, but if we have a
	// special marker (SERIALIZED_MARKER, defined above), we will extract
	// some kind of arraybuffer/binary data/typed array out of the string.
	function deserialize(value) {
	    // If we haven't marked this string as being specially serialized (i.e.
	    // something other than serialized JSON), we can just return it and be
	    // done with it.
	    if (value.substring(0, SERIALIZED_MARKER_LENGTH) !== SERIALIZED_MARKER) {
	        return JSON.parse(value);
	    }

	    // The following code deals with deserializing some kind of Blob or
	    // TypedArray. First we separate out the type of data we're dealing
	    // with from the data itself.
	    var serializedString = value.substring(TYPE_SERIALIZED_MARKER_LENGTH);
	    var type = value.substring(SERIALIZED_MARKER_LENGTH, TYPE_SERIALIZED_MARKER_LENGTH);

	    var blobType;
	    // Backwards-compatible blob type serialization strategy.
	    // DBs created with older versions of localForage will simply not have the blob type.
	    if (type === TYPE_BLOB && BLOB_TYPE_PREFIX_REGEX.test(serializedString)) {
	        var matcher = serializedString.match(BLOB_TYPE_PREFIX_REGEX);
	        blobType = matcher[1];
	        serializedString = serializedString.substring(matcher[0].length);
	    }
	    var buffer = stringToBuffer(serializedString);

	    // Return the right type based on the code/type set during
	    // serialization.
	    switch (type) {
	        case TYPE_ARRAYBUFFER:
	            return buffer;
	        case TYPE_BLOB:
	            return createBlob([buffer], { type: blobType });
	        case TYPE_INT8ARRAY:
	            return new Int8Array(buffer);
	        case TYPE_UINT8ARRAY:
	            return new Uint8Array(buffer);
	        case TYPE_UINT8CLAMPEDARRAY:
	            return new Uint8ClampedArray(buffer);
	        case TYPE_INT16ARRAY:
	            return new Int16Array(buffer);
	        case TYPE_UINT16ARRAY:
	            return new Uint16Array(buffer);
	        case TYPE_INT32ARRAY:
	            return new Int32Array(buffer);
	        case TYPE_UINT32ARRAY:
	            return new Uint32Array(buffer);
	        case TYPE_FLOAT32ARRAY:
	            return new Float32Array(buffer);
	        case TYPE_FLOAT64ARRAY:
	            return new Float64Array(buffer);
	        default:
	            throw new Error('Unkown type: ' + type);
	    }
	}

	var localforageSerializer = {
	    serialize: serialize,
	    deserialize: deserialize,
	    stringToBuffer: stringToBuffer,
	    bufferToString: bufferToString
	};

	/*
	 * Includes code from:
	 *
	 * base64-arraybuffer
	 * https://github.com/niklasvh/base64-arraybuffer
	 *
	 * Copyright (c) 2012 Niklas von Hertzen
	 * Licensed under the MIT license.
	 */

	function createDbTable(t, dbInfo, callback, errorCallback) {
	    t.executeSql('CREATE TABLE IF NOT EXISTS ' + dbInfo.storeName + ' ' + '(id INTEGER PRIMARY KEY, key unique, value)', [], callback, errorCallback);
	}

	// Open the WebSQL database (automatically creates one if one didn't
	// previously exist), using any options set in the config.
	function _initStorage$1(options) {
	    var self = this;
	    var dbInfo = {
	        db: null
	    };

	    if (options) {
	        for (var i in options) {
	            dbInfo[i] = typeof options[i] !== 'string' ? options[i].toString() : options[i];
	        }
	    }

	    var dbInfoPromise = new Promise$1(function (resolve, reject) {
	        // Open the database; the openDatabase API will automatically
	        // create it for us if it doesn't exist.
	        try {
	            dbInfo.db = openDatabase(dbInfo.name, String(dbInfo.version), dbInfo.description, dbInfo.size);
	        } catch (e) {
	            return reject(e);
	        }

	        // Create our key/value table if it doesn't exist.
	        dbInfo.db.transaction(function (t) {
	            createDbTable(t, dbInfo, function () {
	                self._dbInfo = dbInfo;
	                resolve();
	            }, function (t, error) {
	                reject(error);
	            });
	        }, reject);
	    });

	    dbInfo.serializer = localforageSerializer;
	    return dbInfoPromise;
	}

	function tryExecuteSql(t, dbInfo, sqlStatement, args, callback, errorCallback) {
	    t.executeSql(sqlStatement, args, callback, function (t, error) {
	        if (error.code === error.SYNTAX_ERR) {
	            t.executeSql('SELECT name FROM sqlite_master ' + "WHERE type='table' AND name = ?", [name], function (t, results) {
	                if (!results.rows.length) {
	                    // if the table is missing (was deleted)
	                    // re-create it table and retry
	                    createDbTable(t, dbInfo, function () {
	                        t.executeSql(sqlStatement, args, callback, errorCallback);
	                    }, errorCallback);
	                } else {
	                    errorCallback(t, error);
	                }
	            }, errorCallback);
	        } else {
	            errorCallback(t, error);
	        }
	    }, errorCallback);
	}

	function getItem$1(key, callback) {
	    var self = this;

	    key = normalizeKey(key);

	    var promise = new Promise$1(function (resolve, reject) {
	        self.ready().then(function () {
	            var dbInfo = self._dbInfo;
	            dbInfo.db.transaction(function (t) {
	                tryExecuteSql(t, dbInfo, 'SELECT * FROM ' + dbInfo.storeName + ' WHERE key = ? LIMIT 1', [key], function (t, results) {
	                    var result = results.rows.length ? results.rows.item(0).value : null;

	                    // Check to see if this is serialized content we need to
	                    // unpack.
	                    if (result) {
	                        result = dbInfo.serializer.deserialize(result);
	                    }

	                    resolve(result);
	                }, function (t, error) {
	                    reject(error);
	                });
	            });
	        })["catch"](reject);
	    });

	    executeCallback(promise, callback);
	    return promise;
	}

	function iterate$1(iterator, callback) {
	    var self = this;

	    var promise = new Promise$1(function (resolve, reject) {
	        self.ready().then(function () {
	            var dbInfo = self._dbInfo;

	            dbInfo.db.transaction(function (t) {
	                tryExecuteSql(t, dbInfo, 'SELECT * FROM ' + dbInfo.storeName, [], function (t, results) {
	                    var rows = results.rows;
	                    var length = rows.length;

	                    for (var i = 0; i < length; i++) {
	                        var item = rows.item(i);
	                        var result = item.value;

	                        // Check to see if this is serialized content
	                        // we need to unpack.
	                        if (result) {
	                            result = dbInfo.serializer.deserialize(result);
	                        }

	                        result = iterator(result, item.key, i + 1);

	                        // void(0) prevents problems with redefinition
	                        // of `undefined`.
	                        if (result !== void 0) {
	                            resolve(result);
	                            return;
	                        }
	                    }

	                    resolve();
	                }, function (t, error) {
	                    reject(error);
	                });
	            });
	        })["catch"](reject);
	    });

	    executeCallback(promise, callback);
	    return promise;
	}

	function _setItem(key, value, callback, retriesLeft) {
	    var self = this;

	    key = normalizeKey(key);

	    var promise = new Promise$1(function (resolve, reject) {
	        self.ready().then(function () {
	            // The localStorage API doesn't return undefined values in an
	            // "expected" way, so undefined is always cast to null in all
	            // drivers. See: https://github.com/mozilla/localForage/pull/42
	            if (value === undefined) {
	                value = null;
	            }

	            // Save the original value to pass to the callback.
	            var originalValue = value;

	            var dbInfo = self._dbInfo;
	            dbInfo.serializer.serialize(value, function (value, error) {
	                if (error) {
	                    reject(error);
	                } else {
	                    dbInfo.db.transaction(function (t) {
	                        tryExecuteSql(t, dbInfo, 'INSERT OR REPLACE INTO ' + dbInfo.storeName + ' ' + '(key, value) VALUES (?, ?)', [key, value], function () {
	                            resolve(originalValue);
	                        }, function (t, error) {
	                            reject(error);
	                        });
	                    }, function (sqlError) {
	                        // The transaction failed; check
	                        // to see if it's a quota error.
	                        if (sqlError.code === sqlError.QUOTA_ERR) {
	                            // We reject the callback outright for now, but
	                            // it's worth trying to re-run the transaction.
	                            // Even if the user accepts the prompt to use
	                            // more storage on Safari, this error will
	                            // be called.
	                            //
	                            // Try to re-run the transaction.
	                            if (retriesLeft > 0) {
	                                resolve(_setItem.apply(self, [key, originalValue, callback, retriesLeft - 1]));
	                                return;
	                            }
	                            reject(sqlError);
	                        }
	                    });
	                }
	            });
	        })["catch"](reject);
	    });

	    executeCallback(promise, callback);
	    return promise;
	}

	function setItem$1(key, value, callback) {
	    return _setItem.apply(this, [key, value, callback, 1]);
	}

	function removeItem$1(key, callback) {
	    var self = this;

	    key = normalizeKey(key);

	    var promise = new Promise$1(function (resolve, reject) {
	        self.ready().then(function () {
	            var dbInfo = self._dbInfo;
	            dbInfo.db.transaction(function (t) {
	                tryExecuteSql(t, dbInfo, 'DELETE FROM ' + dbInfo.storeName + ' WHERE key = ?', [key], function () {
	                    resolve();
	                }, function (t, error) {
	                    reject(error);
	                });
	            });
	        })["catch"](reject);
	    });

	    executeCallback(promise, callback);
	    return promise;
	}

	// Deletes every item in the table.
	// TODO: Find out if this resets the AUTO_INCREMENT number.
	function clear$1(callback) {
	    var self = this;

	    var promise = new Promise$1(function (resolve, reject) {
	        self.ready().then(function () {
	            var dbInfo = self._dbInfo;
	            dbInfo.db.transaction(function (t) {
	                tryExecuteSql(t, dbInfo, 'DELETE FROM ' + dbInfo.storeName, [], function () {
	                    resolve();
	                }, function (t, error) {
	                    reject(error);
	                });
	            });
	        })["catch"](reject);
	    });

	    executeCallback(promise, callback);
	    return promise;
	}

	// Does a simple `COUNT(key)` to get the number of items stored in
	// localForage.
	function length$1(callback) {
	    var self = this;

	    var promise = new Promise$1(function (resolve, reject) {
	        self.ready().then(function () {
	            var dbInfo = self._dbInfo;
	            dbInfo.db.transaction(function (t) {
	                // Ahhh, SQL makes this one soooooo easy.
	                tryExecuteSql(t, dbInfo, 'SELECT COUNT(key) as c FROM ' + dbInfo.storeName, [], function (t, results) {
	                    var result = results.rows.item(0).c;
	                    resolve(result);
	                }, function (t, error) {
	                    reject(error);
	                });
	            });
	        })["catch"](reject);
	    });

	    executeCallback(promise, callback);
	    return promise;
	}

	// Return the key located at key index X; essentially gets the key from a
	// `WHERE id = ?`. This is the most efficient way I can think to implement
	// this rarely-used (in my experience) part of the API, but it can seem
	// inconsistent, because we do `INSERT OR REPLACE INTO` on `setItem()`, so
	// the ID of each key will change every time it's updated. Perhaps a stored
	// procedure for the `setItem()` SQL would solve this problem?
	// TODO: Don't change ID on `setItem()`.
	function key$1(n, callback) {
	    var self = this;

	    var promise = new Promise$1(function (resolve, reject) {
	        self.ready().then(function () {
	            var dbInfo = self._dbInfo;
	            dbInfo.db.transaction(function (t) {
	                tryExecuteSql(t, dbInfo, 'SELECT key FROM ' + dbInfo.storeName + ' WHERE id = ? LIMIT 1', [n + 1], function (t, results) {
	                    var result = results.rows.length ? results.rows.item(0).key : null;
	                    resolve(result);
	                }, function (t, error) {
	                    reject(error);
	                });
	            });
	        })["catch"](reject);
	    });

	    executeCallback(promise, callback);
	    return promise;
	}

	function keys$1(callback) {
	    var self = this;

	    var promise = new Promise$1(function (resolve, reject) {
	        self.ready().then(function () {
	            var dbInfo = self._dbInfo;
	            dbInfo.db.transaction(function (t) {
	                tryExecuteSql(t, dbInfo, 'SELECT key FROM ' + dbInfo.storeName, [], function (t, results) {
	                    var keys = [];

	                    for (var i = 0; i < results.rows.length; i++) {
	                        keys.push(results.rows.item(i).key);
	                    }

	                    resolve(keys);
	                }, function (t, error) {
	                    reject(error);
	                });
	            });
	        })["catch"](reject);
	    });

	    executeCallback(promise, callback);
	    return promise;
	}

	// https://www.w3.org/TR/webdatabase/#databases
	// > There is no way to enumerate or delete the databases available for an origin from this API.
	function getAllStoreNames(db) {
	    return new Promise$1(function (resolve, reject) {
	        db.transaction(function (t) {
	            t.executeSql('SELECT name FROM sqlite_master ' + "WHERE type='table' AND name <> '__WebKitDatabaseInfoTable__'", [], function (t, results) {
	                var storeNames = [];

	                for (var i = 0; i < results.rows.length; i++) {
	                    storeNames.push(results.rows.item(i).name);
	                }

	                resolve({
	                    db: db,
	                    storeNames: storeNames
	                });
	            }, function (t, error) {
	                reject(error);
	            });
	        }, function (sqlError) {
	            reject(sqlError);
	        });
	    });
	}

	function dropInstance$1(options, callback) {
	    callback = getCallback.apply(this, arguments);

	    var currentConfig = this.config();
	    options = typeof options !== 'function' && options || {};
	    if (!options.name) {
	        options.name = options.name || currentConfig.name;
	        options.storeName = options.storeName || currentConfig.storeName;
	    }

	    var self = this;
	    var promise;
	    if (!options.name) {
	        promise = Promise$1.reject('Invalid arguments');
	    } else {
	        promise = new Promise$1(function (resolve) {
	            var db;
	            if (options.name === currentConfig.name) {
	                // use the db reference of the current instance
	                db = self._dbInfo.db;
	            } else {
	                db = openDatabase(options.name, '', '', 0);
	            }

	            if (!options.storeName) {
	                // drop all database tables
	                resolve(getAllStoreNames(db));
	            } else {
	                resolve({
	                    db: db,
	                    storeNames: [options.storeName]
	                });
	            }
	        }).then(function (operationInfo) {
	            return new Promise$1(function (resolve, reject) {
	                operationInfo.db.transaction(function (t) {
	                    function dropTable(storeName) {
	                        return new Promise$1(function (resolve, reject) {
	                            t.executeSql('DROP TABLE IF EXISTS ' + storeName, [], function () {
	                                resolve();
	                            }, function (t, error) {
	                                reject(error);
	                            });
	                        });
	                    }

	                    var operations = [];
	                    for (var i = 0, len = operationInfo.storeNames.length; i < len; i++) {
	                        operations.push(dropTable(operationInfo.storeNames[i]));
	                    }

	                    Promise$1.all(operations).then(function () {
	                        resolve();
	                    })["catch"](function (e) {
	                        reject(e);
	                    });
	                }, function (sqlError) {
	                    reject(sqlError);
	                });
	            });
	        });
	    }

	    executeCallback(promise, callback);
	    return promise;
	}

	var webSQLStorage = {
	    _driver: 'webSQLStorage',
	    _initStorage: _initStorage$1,
	    _support: isWebSQLValid(),
	    iterate: iterate$1,
	    getItem: getItem$1,
	    setItem: setItem$1,
	    removeItem: removeItem$1,
	    clear: clear$1,
	    length: length$1,
	    key: key$1,
	    keys: keys$1,
	    dropInstance: dropInstance$1
	};

	function isLocalStorageValid() {
	    try {
	        return typeof localStorage !== 'undefined' && 'setItem' in localStorage &&
	        // in IE8 typeof localStorage.setItem === 'object'
	        !!localStorage.setItem;
	    } catch (e) {
	        return false;
	    }
	}

	function _getKeyPrefix(options, defaultConfig) {
	    var keyPrefix = options.name + '/';

	    if (options.storeName !== defaultConfig.storeName) {
	        keyPrefix += options.storeName + '/';
	    }
	    return keyPrefix;
	}

	// Check if localStorage throws when saving an item
	function checkIfLocalStorageThrows() {
	    var localStorageTestKey = '_localforage_support_test';

	    try {
	        localStorage.setItem(localStorageTestKey, true);
	        localStorage.removeItem(localStorageTestKey);

	        return false;
	    } catch (e) {
	        return true;
	    }
	}

	// Check if localStorage is usable and allows to save an item
	// This method checks if localStorage is usable in Safari Private Browsing
	// mode, or in any other case where the available quota for localStorage
	// is 0 and there wasn't any saved items yet.
	function _isLocalStorageUsable() {
	    return !checkIfLocalStorageThrows() || localStorage.length > 0;
	}

	// Config the localStorage backend, using options set in the config.
	function _initStorage$2(options) {
	    var self = this;
	    var dbInfo = {};
	    if (options) {
	        for (var i in options) {
	            dbInfo[i] = options[i];
	        }
	    }

	    dbInfo.keyPrefix = _getKeyPrefix(options, self._defaultConfig);

	    if (!_isLocalStorageUsable()) {
	        return Promise$1.reject();
	    }

	    self._dbInfo = dbInfo;
	    dbInfo.serializer = localforageSerializer;

	    return Promise$1.resolve();
	}

	// Remove all keys from the datastore, effectively destroying all data in
	// the app's key/value store!
	function clear$2(callback) {
	    var self = this;
	    var promise = self.ready().then(function () {
	        var keyPrefix = self._dbInfo.keyPrefix;

	        for (var i = localStorage.length - 1; i >= 0; i--) {
	            var key = localStorage.key(i);

	            if (key.indexOf(keyPrefix) === 0) {
	                localStorage.removeItem(key);
	            }
	        }
	    });

	    executeCallback(promise, callback);
	    return promise;
	}

	// Retrieve an item from the store. Unlike the original async_storage
	// library in Gaia, we don't modify return values at all. If a key's value
	// is `undefined`, we pass that value to the callback function.
	function getItem$2(key, callback) {
	    var self = this;

	    key = normalizeKey(key);

	    var promise = self.ready().then(function () {
	        var dbInfo = self._dbInfo;
	        var result = localStorage.getItem(dbInfo.keyPrefix + key);

	        // If a result was found, parse it from the serialized
	        // string into a JS object. If result isn't truthy, the key
	        // is likely undefined and we'll pass it straight to the
	        // callback.
	        if (result) {
	            result = dbInfo.serializer.deserialize(result);
	        }

	        return result;
	    });

	    executeCallback(promise, callback);
	    return promise;
	}

	// Iterate over all items in the store.
	function iterate$2(iterator, callback) {
	    var self = this;

	    var promise = self.ready().then(function () {
	        var dbInfo = self._dbInfo;
	        var keyPrefix = dbInfo.keyPrefix;
	        var keyPrefixLength = keyPrefix.length;
	        var length = localStorage.length;

	        // We use a dedicated iterator instead of the `i` variable below
	        // so other keys we fetch in localStorage aren't counted in
	        // the `iterationNumber` argument passed to the `iterate()`
	        // callback.
	        //
	        // See: github.com/mozilla/localForage/pull/435#discussion_r38061530
	        var iterationNumber = 1;

	        for (var i = 0; i < length; i++) {
	            var key = localStorage.key(i);
	            if (key.indexOf(keyPrefix) !== 0) {
	                continue;
	            }
	            var value = localStorage.getItem(key);

	            // If a result was found, parse it from the serialized
	            // string into a JS object. If result isn't truthy, the
	            // key is likely undefined and we'll pass it straight
	            // to the iterator.
	            if (value) {
	                value = dbInfo.serializer.deserialize(value);
	            }

	            value = iterator(value, key.substring(keyPrefixLength), iterationNumber++);

	            if (value !== void 0) {
	                return value;
	            }
	        }
	    });

	    executeCallback(promise, callback);
	    return promise;
	}

	// Same as localStorage's key() method, except takes a callback.
	function key$2(n, callback) {
	    var self = this;
	    var promise = self.ready().then(function () {
	        var dbInfo = self._dbInfo;
	        var result;
	        try {
	            result = localStorage.key(n);
	        } catch (error) {
	            result = null;
	        }

	        // Remove the prefix from the key, if a key is found.
	        if (result) {
	            result = result.substring(dbInfo.keyPrefix.length);
	        }

	        return result;
	    });

	    executeCallback(promise, callback);
	    return promise;
	}

	function keys$2(callback) {
	    var self = this;
	    var promise = self.ready().then(function () {
	        var dbInfo = self._dbInfo;
	        var length = localStorage.length;
	        var keys = [];

	        for (var i = 0; i < length; i++) {
	            var itemKey = localStorage.key(i);
	            if (itemKey.indexOf(dbInfo.keyPrefix) === 0) {
	                keys.push(itemKey.substring(dbInfo.keyPrefix.length));
	            }
	        }

	        return keys;
	    });

	    executeCallback(promise, callback);
	    return promise;
	}

	// Supply the number of keys in the datastore to the callback function.
	function length$2(callback) {
	    var self = this;
	    var promise = self.keys().then(function (keys) {
	        return keys.length;
	    });

	    executeCallback(promise, callback);
	    return promise;
	}

	// Remove an item from the store, nice and simple.
	function removeItem$2(key, callback) {
	    var self = this;

	    key = normalizeKey(key);

	    var promise = self.ready().then(function () {
	        var dbInfo = self._dbInfo;
	        localStorage.removeItem(dbInfo.keyPrefix + key);
	    });

	    executeCallback(promise, callback);
	    return promise;
	}

	// Set a key's value and run an optional callback once the value is set.
	// Unlike Gaia's implementation, the callback function is passed the value,
	// in case you want to operate on that value only after you're sure it
	// saved, or something like that.
	function setItem$2(key, value, callback) {
	    var self = this;

	    key = normalizeKey(key);

	    var promise = self.ready().then(function () {
	        // Convert undefined values to null.
	        // https://github.com/mozilla/localForage/pull/42
	        if (value === undefined) {
	            value = null;
	        }

	        // Save the original value to pass to the callback.
	        var originalValue = value;

	        return new Promise$1(function (resolve, reject) {
	            var dbInfo = self._dbInfo;
	            dbInfo.serializer.serialize(value, function (value, error) {
	                if (error) {
	                    reject(error);
	                } else {
	                    try {
	                        localStorage.setItem(dbInfo.keyPrefix + key, value);
	                        resolve(originalValue);
	                    } catch (e) {
	                        // localStorage capacity exceeded.
	                        // TODO: Make this a specific error/event.
	                        if (e.name === 'QuotaExceededError' || e.name === 'NS_ERROR_DOM_QUOTA_REACHED') {
	                            reject(e);
	                        }
	                        reject(e);
	                    }
	                }
	            });
	        });
	    });

	    executeCallback(promise, callback);
	    return promise;
	}

	function dropInstance$2(options, callback) {
	    callback = getCallback.apply(this, arguments);

	    options = typeof options !== 'function' && options || {};
	    if (!options.name) {
	        var currentConfig = this.config();
	        options.name = options.name || currentConfig.name;
	        options.storeName = options.storeName || currentConfig.storeName;
	    }

	    var self = this;
	    var promise;
	    if (!options.name) {
	        promise = Promise$1.reject('Invalid arguments');
	    } else {
	        promise = new Promise$1(function (resolve) {
	            if (!options.storeName) {
	                resolve(options.name + '/');
	            } else {
	                resolve(_getKeyPrefix(options, self._defaultConfig));
	            }
	        }).then(function (keyPrefix) {
	            for (var i = localStorage.length - 1; i >= 0; i--) {
	                var key = localStorage.key(i);

	                if (key.indexOf(keyPrefix) === 0) {
	                    localStorage.removeItem(key);
	                }
	            }
	        });
	    }

	    executeCallback(promise, callback);
	    return promise;
	}

	var localStorageWrapper = {
	    _driver: 'localStorageWrapper',
	    _initStorage: _initStorage$2,
	    _support: isLocalStorageValid(),
	    iterate: iterate$2,
	    getItem: getItem$2,
	    setItem: setItem$2,
	    removeItem: removeItem$2,
	    clear: clear$2,
	    length: length$2,
	    key: key$2,
	    keys: keys$2,
	    dropInstance: dropInstance$2
	};

	var sameValue = function sameValue(x, y) {
	    return x === y || typeof x === 'number' && typeof y === 'number' && isNaN(x) && isNaN(y);
	};

	var includes = function includes(array, searchElement) {
	    var len = array.length;
	    var i = 0;
	    while (i < len) {
	        if (sameValue(array[i], searchElement)) {
	            return true;
	        }
	        i++;
	    }

	    return false;
	};

	var isArray = Array.isArray || function (arg) {
	    return Object.prototype.toString.call(arg) === '[object Array]';
	};

	// Drivers are stored here when `defineDriver()` is called.
	// They are shared across all instances of localForage.
	var DefinedDrivers = {};

	var DriverSupport = {};

	var DefaultDrivers = {
	    INDEXEDDB: asyncStorage,
	    WEBSQL: webSQLStorage,
	    LOCALSTORAGE: localStorageWrapper
	};

	var DefaultDriverOrder = [DefaultDrivers.INDEXEDDB._driver, DefaultDrivers.WEBSQL._driver, DefaultDrivers.LOCALSTORAGE._driver];

	var OptionalDriverMethods = ['dropInstance'];

	var LibraryMethods = ['clear', 'getItem', 'iterate', 'key', 'keys', 'length', 'removeItem', 'setItem'].concat(OptionalDriverMethods);

	var DefaultConfig = {
	    description: '',
	    driver: DefaultDriverOrder.slice(),
	    name: 'localforage',
	    // Default DB size is _JUST UNDER_ 5MB, as it's the highest size
	    // we can use without a prompt.
	    size: 4980736,
	    storeName: 'keyvaluepairs',
	    version: 1.0
	};

	function callWhenReady(localForageInstance, libraryMethod) {
	    localForageInstance[libraryMethod] = function () {
	        var _args = arguments;
	        return localForageInstance.ready().then(function () {
	            return localForageInstance[libraryMethod].apply(localForageInstance, _args);
	        });
	    };
	}

	function extend() {
	    for (var i = 1; i < arguments.length; i++) {
	        var arg = arguments[i];

	        if (arg) {
	            for (var _key in arg) {
	                if (arg.hasOwnProperty(_key)) {
	                    if (isArray(arg[_key])) {
	                        arguments[0][_key] = arg[_key].slice();
	                    } else {
	                        arguments[0][_key] = arg[_key];
	                    }
	                }
	            }
	        }
	    }

	    return arguments[0];
	}

	var LocalForage = function () {
	    function LocalForage(options) {
	        _classCallCheck(this, LocalForage);

	        for (var driverTypeKey in DefaultDrivers) {
	            if (DefaultDrivers.hasOwnProperty(driverTypeKey)) {
	                var driver = DefaultDrivers[driverTypeKey];
	                var driverName = driver._driver;
	                this[driverTypeKey] = driverName;

	                if (!DefinedDrivers[driverName]) {
	                    // we don't need to wait for the promise,
	                    // since the default drivers can be defined
	                    // in a blocking manner
	                    this.defineDriver(driver);
	                }
	            }
	        }

	        this._defaultConfig = extend({}, DefaultConfig);
	        this._config = extend({}, this._defaultConfig, options);
	        this._driverSet = null;
	        this._initDriver = null;
	        this._ready = false;
	        this._dbInfo = null;

	        this._wrapLibraryMethodsWithReady();
	        this.setDriver(this._config.driver)["catch"](function () {});
	    }

	    // Set any config values for localForage; can be called anytime before
	    // the first API call (e.g. `getItem`, `setItem`).
	    // We loop through options so we don't overwrite existing config
	    // values.


	    LocalForage.prototype.config = function config(options) {
	        // If the options argument is an object, we use it to set values.
	        // Otherwise, we return either a specified config value or all
	        // config values.
	        if ((typeof options === 'undefined' ? 'undefined' : _typeof(options)) === 'object') {
	            // If localforage is ready and fully initialized, we can't set
	            // any new configuration values. Instead, we return an error.
	            if (this._ready) {
	                return new Error("Can't call config() after localforage " + 'has been used.');
	            }

	            for (var i in options) {
	                if (i === 'storeName') {
	                    options[i] = options[i].replace(/\W/g, '_');
	                }

	                if (i === 'version' && typeof options[i] !== 'number') {
	                    return new Error('Database version must be a number.');
	                }

	                this._config[i] = options[i];
	            }

	            // after all config options are set and
	            // the driver option is used, try setting it
	            if ('driver' in options && options.driver) {
	                return this.setDriver(this._config.driver);
	            }

	            return true;
	        } else if (typeof options === 'string') {
	            return this._config[options];
	        } else {
	            return this._config;
	        }
	    };

	    // Used to define a custom driver, shared across all instances of
	    // localForage.


	    LocalForage.prototype.defineDriver = function defineDriver(driverObject, callback, errorCallback) {
	        var promise = new Promise$1(function (resolve, reject) {
	            try {
	                var driverName = driverObject._driver;
	                var complianceError = new Error('Custom driver not compliant; see ' + 'https://mozilla.github.io/localForage/#definedriver');

	                // A driver name should be defined and not overlap with the
	                // library-defined, default drivers.
	                if (!driverObject._driver) {
	                    reject(complianceError);
	                    return;
	                }

	                var driverMethods = LibraryMethods.concat('_initStorage');
	                for (var i = 0, len = driverMethods.length; i < len; i++) {
	                    var driverMethodName = driverMethods[i];

	                    // when the property is there,
	                    // it should be a method even when optional
	                    var isRequired = !includes(OptionalDriverMethods, driverMethodName);
	                    if ((isRequired || driverObject[driverMethodName]) && typeof driverObject[driverMethodName] !== 'function') {
	                        reject(complianceError);
	                        return;
	                    }
	                }

	                var configureMissingMethods = function configureMissingMethods() {
	                    var methodNotImplementedFactory = function methodNotImplementedFactory(methodName) {
	                        return function () {
	                            var error = new Error('Method ' + methodName + ' is not implemented by the current driver');
	                            var promise = Promise$1.reject(error);
	                            executeCallback(promise, arguments[arguments.length - 1]);
	                            return promise;
	                        };
	                    };

	                    for (var _i = 0, _len = OptionalDriverMethods.length; _i < _len; _i++) {
	                        var optionalDriverMethod = OptionalDriverMethods[_i];
	                        if (!driverObject[optionalDriverMethod]) {
	                            driverObject[optionalDriverMethod] = methodNotImplementedFactory(optionalDriverMethod);
	                        }
	                    }
	                };

	                configureMissingMethods();

	                var setDriverSupport = function setDriverSupport(support) {
	                    if (DefinedDrivers[driverName]) {
	                        console.info('Redefining LocalForage driver: ' + driverName);
	                    }
	                    DefinedDrivers[driverName] = driverObject;
	                    DriverSupport[driverName] = support;
	                    // don't use a then, so that we can define
	                    // drivers that have simple _support methods
	                    // in a blocking manner
	                    resolve();
	                };

	                if ('_support' in driverObject) {
	                    if (driverObject._support && typeof driverObject._support === 'function') {
	                        driverObject._support().then(setDriverSupport, reject);
	                    } else {
	                        setDriverSupport(!!driverObject._support);
	                    }
	                } else {
	                    setDriverSupport(true);
	                }
	            } catch (e) {
	                reject(e);
	            }
	        });

	        executeTwoCallbacks(promise, callback, errorCallback);
	        return promise;
	    };

	    LocalForage.prototype.driver = function driver() {
	        return this._driver || null;
	    };

	    LocalForage.prototype.getDriver = function getDriver(driverName, callback, errorCallback) {
	        var getDriverPromise = DefinedDrivers[driverName] ? Promise$1.resolve(DefinedDrivers[driverName]) : Promise$1.reject(new Error('Driver not found.'));

	        executeTwoCallbacks(getDriverPromise, callback, errorCallback);
	        return getDriverPromise;
	    };

	    LocalForage.prototype.getSerializer = function getSerializer(callback) {
	        var serializerPromise = Promise$1.resolve(localforageSerializer);
	        executeTwoCallbacks(serializerPromise, callback);
	        return serializerPromise;
	    };

	    LocalForage.prototype.ready = function ready(callback) {
	        var self = this;

	        var promise = self._driverSet.then(function () {
	            if (self._ready === null) {
	                self._ready = self._initDriver();
	            }

	            return self._ready;
	        });

	        executeTwoCallbacks(promise, callback, callback);
	        return promise;
	    };

	    LocalForage.prototype.setDriver = function setDriver(drivers, callback, errorCallback) {
	        var self = this;

	        if (!isArray(drivers)) {
	            drivers = [drivers];
	        }

	        var supportedDrivers = this._getSupportedDrivers(drivers);

	        function setDriverToConfig() {
	            self._config.driver = self.driver();
	        }

	        function extendSelfWithDriver(driver) {
	            self._extend(driver);
	            setDriverToConfig();

	            self._ready = self._initStorage(self._config);
	            return self._ready;
	        }

	        function initDriver(supportedDrivers) {
	            return function () {
	                var currentDriverIndex = 0;

	                function driverPromiseLoop() {
	                    while (currentDriverIndex < supportedDrivers.length) {
	                        var driverName = supportedDrivers[currentDriverIndex];
	                        currentDriverIndex++;

	                        self._dbInfo = null;
	                        self._ready = null;

	                        return self.getDriver(driverName).then(extendSelfWithDriver)["catch"](driverPromiseLoop);
	                    }

	                    setDriverToConfig();
	                    var error = new Error('No available storage method found.');
	                    self._driverSet = Promise$1.reject(error);
	                    return self._driverSet;
	                }

	                return driverPromiseLoop();
	            };
	        }

	        // There might be a driver initialization in progress
	        // so wait for it to finish in order to avoid a possible
	        // race condition to set _dbInfo
	        var oldDriverSetDone = this._driverSet !== null ? this._driverSet["catch"](function () {
	            return Promise$1.resolve();
	        }) : Promise$1.resolve();

	        this._driverSet = oldDriverSetDone.then(function () {
	            var driverName = supportedDrivers[0];
	            self._dbInfo = null;
	            self._ready = null;

	            return self.getDriver(driverName).then(function (driver) {
	                self._driver = driver._driver;
	                setDriverToConfig();
	                self._wrapLibraryMethodsWithReady();
	                self._initDriver = initDriver(supportedDrivers);
	            });
	        })["catch"](function () {
	            setDriverToConfig();
	            var error = new Error('No available storage method found.');
	            self._driverSet = Promise$1.reject(error);
	            return self._driverSet;
	        });

	        executeTwoCallbacks(this._driverSet, callback, errorCallback);
	        return this._driverSet;
	    };

	    LocalForage.prototype.supports = function supports(driverName) {
	        return !!DriverSupport[driverName];
	    };

	    LocalForage.prototype._extend = function _extend(libraryMethodsAndProperties) {
	        extend(this, libraryMethodsAndProperties);
	    };

	    LocalForage.prototype._getSupportedDrivers = function _getSupportedDrivers(drivers) {
	        var supportedDrivers = [];
	        for (var i = 0, len = drivers.length; i < len; i++) {
	            var driverName = drivers[i];
	            if (this.supports(driverName)) {
	                supportedDrivers.push(driverName);
	            }
	        }
	        return supportedDrivers;
	    };

	    LocalForage.prototype._wrapLibraryMethodsWithReady = function _wrapLibraryMethodsWithReady() {
	        // Add a stub for each driver API method that delays the call to the
	        // corresponding driver method until localForage is ready. These stubs
	        // will be replaced by the driver methods as soon as the driver is
	        // loaded, so there is no performance impact.
	        for (var i = 0, len = LibraryMethods.length; i < len; i++) {
	            callWhenReady(this, LibraryMethods[i]);
	        }
	    };

	    LocalForage.prototype.createInstance = function createInstance(options) {
	        return new LocalForage(options);
	    };

	    return LocalForage;
	}();

	// The actual localForage object that we expose as a module or via a
	// global. It's extended by pulling in one of our other libraries.


	var localforage_js = new LocalForage();

	module.exports = localforage_js;

	},{"3":3}]},{},[4])(4)
	});


/***/ },
/* 74 */
/***/ function(module, exports) {

	module.exports = __WEBPACK_EXTERNAL_MODULE_74__;

/***/ },
/* 75 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;var require;var require;/* WEBPACK VAR INJECTION */(function(global) {"use strict";

	var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

	if (!CB._isNode) {
	    //Socket.io Client library
	    (function (f) {
	        if (( false ? "undefined" : _typeof(exports)) === "object" && typeof module !== "undefined") {
	            module.exports = f();
	        } else if (true) {
	            !(__WEBPACK_AMD_DEFINE_ARRAY__ = [], __WEBPACK_AMD_DEFINE_FACTORY__ = (f), __WEBPACK_AMD_DEFINE_RESULT__ = (typeof __WEBPACK_AMD_DEFINE_FACTORY__ === 'function' ? (__WEBPACK_AMD_DEFINE_FACTORY__.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__)) : __WEBPACK_AMD_DEFINE_FACTORY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
	        } else {
	            var g;
	            if (typeof window !== "undefined") {
	                g = window;
	            } else if (typeof global !== "undefined") {
	                g = global;
	            } else if (typeof self !== "undefined") {
	                g = self;
	            } else {
	                g = this;
	            }
	            g.io = f();
	        }
	    })(function () {
	        var define, module, exports;
	        return function e(t, n, r) {
	            function s(o, u) {
	                if (!n[o]) {
	                    if (!t[o]) {
	                        var a = typeof require == "function" && require;
	                        if (!u && a) return require(o, !0);
	                        if (i) return i(o, !0);
	                        var f = new Error("Cannot find module '" + o + "'");
	                        throw f.code = "MODULE_NOT_FOUND", f;
	                    }
	                    var l = n[o] = {
	                        exports: {}
	                    };
	                    t[o][0].call(l.exports, function (e) {
	                        var n = t[o][1][e];
	                        return s(n ? n : e);
	                    }, l, l.exports, e, t, n, r);
	                }
	                return n[o].exports;
	            }
	            var i = typeof require == "function" && require;
	            for (var o = 0; o < r.length; o++) {
	                s(r[o]);
	            }return s;
	        }({
	            1: [function (_dereq_, module, exports) {

	                module.exports = _dereq_('./lib/');
	            }, {
	                "./lib/": 2
	            }],
	            2: [function (_dereq_, module, exports) {

	                module.exports = _dereq_('./socket');

	                /**
	                * Exports parser
	                *
	                * @api public
	                *
	                */
	                module.exports.parser = _dereq_('engine.io-parser');
	            }, {
	                "./socket": 3,
	                "engine.io-parser": 19
	            }],
	            3: [function (_dereq_, module, exports) {
	                (function (global) {
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

	                    function noop() {}

	                    /**
	                    * Socket constructor.
	                    *
	                    * @param {String|Object} uri or options
	                    * @param {Object} options
	                    * @api public
	                    */

	                    function Socket(uri, opts) {
	                        if (!(this instanceof Socket)) return new Socket(uri, opts);

	                        opts = opts || {};

	                        if (uri && 'object' == (typeof uri === "undefined" ? "undefined" : _typeof(uri))) {
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

	                        this.secure = null != opts.secure ? opts.secure : global.location && 'https:' == location.protocol;

	                        if (opts.hostname && !opts.port) {
	                            // if no port is specified manually, use the protocol default
	                            opts.port = this.secure ? '443' : '80';
	                        }

	                        this.agent = opts.agent || false;
	                        this.hostname = opts.hostname || (global.location ? location.hostname : 'localhost');
	                        this.port = opts.port || (global.location && location.port ? location.port : this.secure ? 443 : 80);
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
	                        this.perMessageDeflate = false !== opts.perMessageDeflate ? opts.perMessageDeflate || {} : false;

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
	                        var freeGlobal = (typeof global === "undefined" ? "undefined" : _typeof(global)) == 'object' && global;
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

	                    function clone(obj) {
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
	                            setTimeout(function () {
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

	                    Socket.prototype.setTransport = function (transport) {
	                        debug('setting transport %s', transport.name);
	                        var self = this;

	                        if (this.transport) {
	                            debug('clearing existing transport %s', this.transport.name);
	                            this.transport.removeAllListeners();
	                        }

	                        // set up transport
	                        this.transport = transport;

	                        // set up transport listeners
	                        transport.on('drain', function () {
	                            self.onDrain();
	                        }).on('packet', function (packet) {
	                            self.onPacket(packet);
	                        }).on('error', function (e) {
	                            self.onError(e);
	                        }).on('close', function () {
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
	                        var transport = this.createTransport(name, { probe: 1 }),
	                            failed = false,
	                            self = this;

	                        Socket.priorWebsocketSuccess = false;

	                        function onTransportOpen() {
	                            if (self.onlyBinaryUpgrades) {
	                                var upgradeLosesBinary = !this.supportsBinary && self.transport.supportsBinary;
	                                failed = failed || upgradeLosesBinary;
	                            }
	                            if (failed) return;

	                            debug('probe transport "%s" opened', name);
	                            transport.send([{
	                                type: 'ping',
	                                data: 'probe'
	                            }]);
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
	                                        transport.send([{
	                                            type: 'upgrade'
	                                        }]);
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

	                        function onTransportClose() {
	                            onerror("transport closed");
	                        }

	                        //When the socket is closed while we're probing
	                        function onclose() {
	                            onerror("socket closed");
	                        }

	                        //When the socket is upgraded while we're probing
	                        function onupgrade(to) {
	                            if (transport && to.name != transport.name) {
	                                debug('"%s" works - aborting "%s"', to.name, transport.name);
	                                freezeTransport();
	                            }
	                        }

	                        //Remove all listeners on the transport and on self
	                        function cleanup() {
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
	                        if ('closed' == this.readyState) return;
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
	                        }, timeout || self.pingInterval + self.pingTimeout);
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
	                        this.sendPacket('ping', function () {
	                            self.emit('ping');
	                        });
	                    };

	                    /**
	                    * Called on `drain` event
	                    *
	                    * @api private
	                    */

	                    Socket.prototype.onDrain = function () {
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
	                        if ('closed' != this.readyState && this.transport.writable && !this.upgrading && this.writeBuffer.length) {
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

	                    Socket.prototype.write = Socket.prototype.send = function (msg, options, fn) {
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
	                        if ('function' == typeof data) {
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
	                                this.once('drain', function () {
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
	                        for (var i = 0, j = upgrades.length; i < j; i++) {
	                            if (~index(this.transports, upgrades[i])) filteredUpgrades.push(upgrades[i]);
	                        }
	                        return filteredUpgrades;
	                    };
	                }).call(this, typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : typeof global !== "undefined" ? global : {});
	            }, {
	                "./transport": 4,
	                "./transports": 5,
	                "component-emitter": 15,
	                "debug": 17,
	                "engine.io-parser": 19,
	                "indexof": 23,
	                "parsejson": 26,
	                "parseqs": 27,
	                "parseuri": 28
	            }],
	            4: [function (_dereq_, module, exports) {
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

	                function Transport(opts) {
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

	                Transport.prototype.send = function (packets) {
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

	                Transport.prototype.onData = function (data) {
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
	            }, {
	                "component-emitter": 15,
	                "engine.io-parser": 19
	            }],
	            5: [function (_dereq_, module, exports) {
	                (function (global) {
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

	                    function polling(opts) {
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
	                }).call(this, typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : typeof global !== "undefined" ? global : {});
	            }, {
	                "./polling-jsonp": 6,
	                "./polling-xhr": 7,
	                "./websocket": 9,
	                "xmlhttprequest-ssl": 10
	            }],
	            6: [function (_dereq_, module, exports) {
	                (function (global) {

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

	                    function empty() {}

	                    /**
	                    * JSONP Polling constructor.
	                    *
	                    * @param {Object} opts.
	                    * @api public
	                    */

	                    function JSONPPolling(opts) {
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
	                        script.onerror = function (e) {
	                            self.onError('jsonp poll error', e);
	                        };

	                        var insertAt = document.getElementsByTagName('script')[0];
	                        if (insertAt) {
	                            insertAt.parentNode.insertBefore(script, insertAt);
	                        } else {
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

	                        function complete() {
	                            initIframe();
	                            fn();
	                        }

	                        function initIframe() {
	                            if (self.iframe) {
	                                try {
	                                    self.form.removeChild(self.iframe);
	                                } catch (e) {
	                                    self.onError('jsonp polling iframe removal error', e);
	                                }
	                            }

	                            try {
	                                // ie6 dynamic iframes with target="" support (thanks Chris Lambacher)
	                                var html = '<iframe src="javascript:0" name="' + self.iframeId + '">';
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
	                        } catch (e) {}

	                        if (this.iframe.attachEvent) {
	                            this.iframe.onreadystatechange = function () {
	                                if (self.iframe.readyState == 'complete') {
	                                    complete();
	                                }
	                            };
	                        } else {
	                            this.iframe.onload = complete;
	                        }
	                    };
	                }).call(this, typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : typeof global !== "undefined" ? global : {});
	            }, {
	                "./polling": 8,
	                "component-inherit": 16
	            }],
	            7: [function (_dereq_, module, exports) {
	                (function (global) {
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

	                    function empty() {}

	                    /**
	                    * XHR Polling constructor.
	                    *
	                    * @param {Object} opts
	                    * @api public
	                    */

	                    function XHR(opts) {
	                        Polling.call(this, opts);

	                        if (global.location) {
	                            var isSSL = 'https:' == location.protocol;
	                            var port = location.port;

	                            // some user agents have empty `location.port`
	                            if (!port) {
	                                port = isSSL ? 443 : 80;
	                            }

	                            this.xd = opts.hostname != global.location.hostname || port != opts.port;
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

	                    XHR.prototype.request = function (opts) {
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

	                    XHR.prototype.doWrite = function (data, fn) {
	                        var isBinary = typeof data !== 'string' && data !== undefined;
	                        var req = this.request({ method: 'POST', data: data, isBinary: isBinary });
	                        var self = this;
	                        req.on('success', fn);
	                        req.on('error', function (err) {
	                            self.onError('xhr post error', err);
	                        });
	                        this.sendXhr = req;
	                    };

	                    /**
	                    * Starts a poll cycle.
	                    *
	                    * @api private
	                    */

	                    XHR.prototype.doPoll = function () {
	                        debug('xhr poll');
	                        var req = this.request();
	                        var self = this;
	                        req.on('data', function (data) {
	                            self.onData(data);
	                        });
	                        req.on('error', function (err) {
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

	                    function Request(opts) {
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

	                    Request.prototype.create = function () {
	                        var opts = {
	                            agent: this.agent,
	                            xdomain: this.xd,
	                            xscheme: this.xs,
	                            enablesXDR: this.enablesXDR
	                        };

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
	                                xhr.onload = function () {
	                                    self.onLoad();
	                                };
	                                xhr.onerror = function () {
	                                    self.onError(xhr.responseText);
	                                };
	                            } else {
	                                xhr.onreadystatechange = function () {
	                                    if (4 != xhr.readyState) return;
	                                    if (200 == xhr.status || 1223 == xhr.status) {
	                                        self.onLoad();
	                                    } else {
	                                        // make sure the `error` event handler that's user-set
	                                        // does not throw in the same tick and gets caught here
	                                        setTimeout(function () {
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
	                            setTimeout(function () {
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

	                    Request.prototype.onSuccess = function () {
	                        this.emit('success');
	                        this.cleanup();
	                    };

	                    /**
	                    * Called if we have data.
	                    *
	                    * @api private
	                    */

	                    Request.prototype.onData = function (data) {
	                        this.emit('data', data);
	                        this.onSuccess();
	                    };

	                    /**
	                    * Called upon error.
	                    *
	                    * @api private
	                    */

	                    Request.prototype.onError = function (err) {
	                        this.emit('error', err);
	                        this.cleanup(true);
	                    };

	                    /**
	                    * Cleans up house.
	                    *
	                    * @api private
	                    */

	                    Request.prototype.cleanup = function (fromError) {
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
	                            } catch (e) {}
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

	                    Request.prototype.onLoad = function () {
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

	                    Request.prototype.hasXDR = function () {
	                        return 'undefined' !== typeof global.XDomainRequest && !this.xs && this.enablesXDR;
	                    };

	                    /**
	                    * Aborts the request.
	                    *
	                    * @api public
	                    */

	                    Request.prototype.abort = function () {
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
	                }).call(this, typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : typeof global !== "undefined" ? global : {});
	            }, {
	                "./polling": 8,
	                "component-emitter": 15,
	                "component-inherit": 16,
	                "debug": 17,
	                "xmlhttprequest-ssl": 10
	            }],
	            8: [function (_dereq_, module, exports) {
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

	                var hasXHR2 = function () {
	                    var XMLHttpRequest = _dereq_('xmlhttprequest-ssl');
	                    var xhr = new XMLHttpRequest({ xdomain: false });
	                    return null != xhr.responseType;
	                }();

	                /**
	                * Polling interface.
	                *
	                * @param {Object} opts
	                * @api private
	                */

	                function Polling(opts) {
	                    var forceBase64 = opts && opts.forceBase64;
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

	                Polling.prototype.doOpen = function () {
	                    this.poll();
	                };

	                /**
	                * Pauses polling.
	                *
	                * @param {Function} callback upon buffers are flushed and transport is paused
	                * @api private
	                */

	                Polling.prototype.pause = function (onPause) {
	                    var pending = 0;
	                    var self = this;

	                    this.readyState = 'pausing';

	                    function pause() {
	                        debug('paused');
	                        self.readyState = 'paused';
	                        onPause();
	                    }

	                    if (this.polling || !this.writable) {
	                        var total = 0;

	                        if (this.polling) {
	                            debug('we are currently polling - waiting to pause');
	                            total++;
	                            this.once('pollComplete', function () {
	                                debug('pre-pause polling complete');
	                                --total || pause();
	                            });
	                        }

	                        if (!this.writable) {
	                            debug('we are currently writing - waiting to pause');
	                            total++;
	                            this.once('drain', function () {
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

	                Polling.prototype.poll = function () {
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

	                Polling.prototype.onData = function (data) {
	                    var self = this;
	                    debug('polling got data %s', data);
	                    var callback = function callback(packet, index, total) {
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

	                Polling.prototype.doClose = function () {
	                    var self = this;

	                    function close() {
	                        debug('writing close packet');
	                        self.write([{
	                            type: 'close'
	                        }]);
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

	                Polling.prototype.write = function (packets) {
	                    var self = this;
	                    this.writable = false;
	                    var callbackfn = function callbackfn() {
	                        self.writable = true;
	                        self.emit('drain');
	                    };

	                    var self = this;
	                    parser.encodePayload(packets, this.supportsBinary, function (data) {
	                        self.doWrite(data, callbackfn);
	                    });
	                };

	                /**
	                * Generates uri for connection.
	                *
	                * @api private
	                */

	                Polling.prototype.uri = function () {
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
	                    if (this.port && ('https' == schema && this.port != 443 || 'http' == schema && this.port != 80)) {
	                        port = ':' + this.port;
	                    }

	                    // prepend ? to query
	                    if (query.length) {
	                        query = '?' + query;
	                    }

	                    var ipv6 = this.hostname.indexOf(':') !== -1;
	                    return schema + '://' + (ipv6 ? '[' + this.hostname + ']' : this.hostname) + port + this.path + query;
	                };
	            }, {
	                "../transport": 4,
	                "component-inherit": 16,
	                "debug": 17,
	                "engine.io-parser": 19,
	                "parseqs": 27,
	                "xmlhttprequest-ssl": 10,
	                "yeast": 30
	            }],
	            9: [function (_dereq_, module, exports) {
	                (function (global) {
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
	                        } catch (e) {}
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

	                    function WS(opts) {
	                        var forceBase64 = opts && opts.forceBase64;
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

	                    WS.prototype.doOpen = function () {
	                        if (!this.check()) {
	                            // let probe timeout
	                            return;
	                        }

	                        var self = this;
	                        var uri = this.uri();
	                        var protocols = void 0;
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

	                    WS.prototype.addEventListeners = function () {
	                        var self = this;

	                        this.ws.onopen = function () {
	                            self.onOpen();
	                        };
	                        this.ws.onclose = function () {
	                            self.onClose();
	                        };
	                        this.ws.onmessage = function (ev) {
	                            self.onData(ev.data);
	                        };
	                        this.ws.onerror = function (e) {
	                            self.onError('websocket error', e);
	                        };
	                    };

	                    /**
	                    * Override `onData` to use a timer on iOS.
	                    * See: https://gist.github.com/mloughran/2052006
	                    *
	                    * @api private
	                    */

	                    if ('undefined' != typeof navigator && /iPad|iPhone|iPod/i.test(navigator.userAgent)) {
	                        WS.prototype.onData = function (data) {
	                            var self = this;
	                            setTimeout(function () {
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

	                    WS.prototype.write = function (packets) {
	                        var self = this;
	                        this.writable = false;

	                        // encodePacket efficient as it uses WS framing
	                        // no need for encodePayload
	                        var total = packets.length;
	                        for (var i = 0, l = total; i < l; i++) {
	                            (function (packet) {
	                                parser.encodePacket(packet, self.supportsBinary, function (data) {
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
	                                    } catch (e) {
	                                        debug('websocket closed before onclose event');
	                                    }

	                                    --total || done();
	                                });
	                            })(packets[i]);
	                        }

	                        function done() {
	                            self.emit('flush');

	                            // fake drain
	                            // defer to next tick to allow Socket to clear writeBuffer
	                            setTimeout(function () {
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

	                    WS.prototype.onClose = function () {
	                        Transport.prototype.onClose.call(this);
	                    };

	                    /**
	                    * Closes socket.
	                    *
	                    * @api private
	                    */

	                    WS.prototype.doClose = function () {
	                        if (typeof this.ws !== 'undefined') {
	                            this.ws.close();
	                        }
	                    };

	                    /**
	                    * Generates uri for connection.
	                    *
	                    * @api private
	                    */

	                    WS.prototype.uri = function () {
	                        var query = this.query || {};
	                        var schema = this.secure ? 'wss' : 'ws';
	                        var port = '';

	                        // avoid port if default for schema
	                        if (this.port && ('wss' == schema && this.port != 443 || 'ws' == schema && this.port != 80)) {
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

	                    WS.prototype.check = function () {
	                        return !!WebSocket && !('__initialize' in WebSocket && this.name === WS.prototype.name);
	                    };
	                }).call(this, typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : typeof global !== "undefined" ? global : {});
	            }, {
	                "../transport": 4,
	                "component-inherit": 16,
	                "debug": 17,
	                "engine.io-parser": 19,
	                "parseqs": 27,
	                "ws": undefined,
	                "yeast": 30
	            }],
	            10: [function (_dereq_, module, exports) {
	                // browser shim for xmlhttprequest module
	                var hasCORS = _dereq_('has-cors');

	                module.exports = function (opts) {
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
	                    } catch (e) {}

	                    // Use XDomainRequest for IE8 if enablesXDR is true
	                    // because loading bar keeps flashing when using jsonp-polling
	                    // https://github.com/yujiosaka/socke.io-ie8-loading-example
	                    try {
	                        if ('undefined' != typeof XDomainRequest && !xscheme && enablesXDR) {
	                            return new XDomainRequest();
	                        }
	                    } catch (e) {}

	                    if (!xdomain) {
	                        try {
	                            return new ActiveXObject('Microsoft.XMLHTTP');
	                        } catch (e) {}
	                    }
	                };
	            }, {
	                "has-cors": 22
	            }],
	            11: [function (_dereq_, module, exports) {
	                module.exports = after;

	                function after(count, callback, err_cb) {
	                    var bail = false;
	                    err_cb = err_cb || noop;
	                    proxy.count = count;

	                    return count === 0 ? callback() : proxy;

	                    function proxy(err, result) {
	                        if (proxy.count <= 0) {
	                            throw new Error('after called too many times');
	                        }
	                        --proxy.count;

	                        // after first error, rest are passed to err_cb
	                        if (err) {
	                            bail = true;
	                            callback(err);
	                            // future error callbacks will go to error handler
	                            callback = err_cb;
	                        } else if (proxy.count === 0 && !bail) {
	                            callback(null, result);
	                        }
	                    }
	                }

	                function noop() {}
	            }, {}],
	            12: [function (_dereq_, module, exports) {
	                /**
	                * An abstraction for slicing an arraybuffer even when
	                * ArrayBuffer.prototype.slice is not supported
	                *
	                * @api public
	                */

	                module.exports = function (arraybuffer, start, end) {
	                    var bytes = arraybuffer.byteLength;
	                    start = start || 0;
	                    end = end || bytes;

	                    if (arraybuffer.slice) {
	                        return arraybuffer.slice(start, end);
	                    }

	                    if (start < 0) {
	                        start += bytes;
	                    }
	                    if (end < 0) {
	                        end += bytes;
	                    }
	                    if (end > bytes) {
	                        end = bytes;
	                    }

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
	            }, {}],
	            13: [function (_dereq_, module, exports) {
	                /*
	                * base64-arraybuffer
	                * https://github.com/niklasvh/base64-arraybuffer
	                *
	                * Copyright (c) 2012 Niklas von Hertzen
	                * Licensed under the MIT license.
	                */
	                (function (chars) {
	                    "use strict";

	                    exports.encode = function (arraybuffer) {
	                        var bytes = new Uint8Array(arraybuffer),
	                            i,
	                            len = bytes.length,
	                            base64 = "";

	                        for (i = 0; i < len; i += 3) {
	                            base64 += chars[bytes[i] >> 2];
	                            base64 += chars[(bytes[i] & 3) << 4 | bytes[i + 1] >> 4];
	                            base64 += chars[(bytes[i + 1] & 15) << 2 | bytes[i + 2] >> 6];
	                            base64 += chars[bytes[i + 2] & 63];
	                        }

	                        if (len % 3 === 2) {
	                            base64 = base64.substring(0, base64.length - 1) + "=";
	                        } else if (len % 3 === 1) {
	                            base64 = base64.substring(0, base64.length - 2) + "==";
	                        }

	                        return base64;
	                    };

	                    exports.decode = function (base64) {
	                        var bufferLength = base64.length * 0.75,
	                            len = base64.length,
	                            i,
	                            p = 0,
	                            encoded1,
	                            encoded2,
	                            encoded3,
	                            encoded4;

	                        if (base64[base64.length - 1] === "=") {
	                            bufferLength--;
	                            if (base64[base64.length - 2] === "=") {
	                                bufferLength--;
	                            }
	                        }

	                        var arraybuffer = new ArrayBuffer(bufferLength),
	                            bytes = new Uint8Array(arraybuffer);

	                        for (i = 0; i < len; i += 4) {
	                            encoded1 = chars.indexOf(base64[i]);
	                            encoded2 = chars.indexOf(base64[i + 1]);
	                            encoded3 = chars.indexOf(base64[i + 2]);
	                            encoded4 = chars.indexOf(base64[i + 3]);

	                            bytes[p++] = encoded1 << 2 | encoded2 >> 4;
	                            bytes[p++] = (encoded2 & 15) << 4 | encoded3 >> 2;
	                            bytes[p++] = (encoded3 & 3) << 6 | encoded4 & 63;
	                        }

	                        return arraybuffer;
	                    };
	                })("ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/");
	            }, {}],
	            14: [function (_dereq_, module, exports) {
	                (function (global) {
	                    /**
	                    * Create a blob builder even when vendor prefixes exist
	                    */

	                    var BlobBuilder = global.BlobBuilder || global.WebKitBlobBuilder || global.MSBlobBuilder || global.MozBlobBuilder;

	                    /**
	                    * Check if Blob constructor is supported
	                    */

	                    var blobSupported = function () {
	                        try {
	                            var a = new Blob(['hi']);
	                            return a.size === 2;
	                        } catch (e) {
	                            return false;
	                        }
	                    }();

	                    /**
	                    * Check if Blob constructor supports ArrayBufferViews
	                    * Fails in Safari 6, so we need to map to ArrayBuffers there.
	                    */

	                    var blobSupportsArrayBufferView = blobSupported && function () {
	                        try {
	                            var b = new Blob([new Uint8Array([1, 2])]);
	                            return b.size === 2;
	                        } catch (e) {
	                            return false;
	                        }
	                    }();

	                    /**
	                    * Check if BlobBuilder is supported
	                    */

	                    var blobBuilderSupported = BlobBuilder && BlobBuilder.prototype.append && BlobBuilder.prototype.getBlob;

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

	                        return options.type ? bb.getBlob(options.type) : bb.getBlob();
	                    };

	                    function BlobConstructor(ary, options) {
	                        mapArrayBufferViews(ary);
	                        return new Blob(ary, options || {});
	                    };

	                    module.exports = function () {
	                        if (blobSupported) {
	                            return blobSupportsArrayBufferView ? global.Blob : BlobConstructor;
	                        } else if (blobBuilderSupported) {
	                            return BlobBuilderConstructor;
	                        } else {
	                            return undefined;
	                        }
	                    }();
	                }).call(this, typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : typeof global !== "undefined" ? global : {});
	            }, {}],
	            15: [function (_dereq_, module, exports) {

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

	                Emitter.prototype.on = Emitter.prototype.addEventListener = function (event, fn) {
	                    this._callbacks = this._callbacks || {};
	                    (this._callbacks[event] = this._callbacks[event] || []).push(fn);
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

	                Emitter.prototype.once = function (event, fn) {
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

	                Emitter.prototype.off = Emitter.prototype.removeListener = Emitter.prototype.removeAllListeners = Emitter.prototype.removeEventListener = function (event, fn) {
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

	                Emitter.prototype.emit = function (event) {
	                    this._callbacks = this._callbacks || {};
	                    var args = [].slice.call(arguments, 1),
	                        callbacks = this._callbacks[event];

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

	                Emitter.prototype.listeners = function (event) {
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

	                Emitter.prototype.hasListeners = function (event) {
	                    return !!this.listeners(event).length;
	                };
	            }, {}],
	            16: [function (_dereq_, module, exports) {

	                module.exports = function (a, b) {
	                    var fn = function fn() {};
	                    fn.prototype = b.prototype;
	                    a.prototype = new fn();
	                    a.prototype.constructor = a;
	                };
	            }, {}],
	            17: [function (_dereq_, module, exports) {

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
	                exports.storage = 'undefined' != typeof chrome && 'undefined' != typeof chrome.storage ? chrome.storage.local : localstorage();

	                /**
	                * Colors.
	                */

	                exports.colors = ['lightseagreen', 'forestgreen', 'goldenrod', 'dodgerblue', 'darkorchid', 'crimson'];

	                /**
	                * Currently only WebKit-based Web Inspectors, Firefox >= v31,
	                * and the Firebug extension (any Firefox version) are known
	                * to support "%c" CSS customizations.
	                *
	                * TODO: add a `localStorage` variable to explicitly enable/disable colors
	                */

	                function useColors() {
	                    // is webkit? http://stackoverflow.com/a/16459606/376773
	                    return 'WebkitAppearance' in document.documentElement.style ||
	                    // is firebug? http://stackoverflow.com/a/398120/376773
	                    window.console && (console.firebug || console.exception && console.table) ||
	                    // is firefox >= v31?
	                    // https://developer.mozilla.org/en-US/docs/Tools/Web_Console#Styling_messages
	                    navigator.userAgent.toLowerCase().match(/firefox\/(\d+)/) && parseInt(RegExp.$1, 10) >= 31;
	                }

	                /**
	                * Map %j to `JSON.stringify()`, since no Web Inspectors do that by default.
	                */

	                exports.formatters.j = function (v) {
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

	                    args[0] = (useColors ? '%c' : '') + this.namespace + (useColors ? ' %c' : ' ') + args[0] + (useColors ? '%c ' : ' ') + '+' + exports.humanize(this.diff);

	                    if (!useColors) return args;

	                    var c = 'color: ' + this.color;
	                    args = [args[0], c, 'color: inherit'].concat(Array.prototype.slice.call(args, 1));

	                    // the final "%c" is somewhat tricky, because there could be other
	                    // arguments passed either before or after the %c, so we need to
	                    // figure out the correct index to insert the CSS into
	                    var index = 0;
	                    var lastC = 0;
	                    args[0].replace(/%[a-z%]/g, function (match) {
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
	                    return 'object' === (typeof console === "undefined" ? "undefined" : _typeof(console)) && console.log && Function.prototype.apply.call(console.log, console, arguments);
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
	                    } catch (e) {}
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
	                    } catch (e) {}
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

	                function localstorage() {
	                    try {
	                        return window.localStorage;
	                    } catch (e) {}
	                }
	            }, {
	                "./debug": 18
	            }],
	            18: [function (_dereq_, module, exports) {

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
	                    function disabled() {}
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
	                        args[0] = args[0].replace(/%([a-z%])/g, function (match, format) {
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
	            }, {
	                "ms": 25
	            }],
	            19: [function (_dereq_, module, exports) {
	                (function (global) {
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
	                        open: 0, // non-ws
	                        close: 1, // non-ws
	                        ping: 2,
	                        pong: 3,
	                        message: 4,
	                        upgrade: 5,
	                        noop: 6
	                    };

	                    var packetslist = keys(packets);

	                    /**
	                    * Premade error packet.
	                    */

	                    var err = {
	                        type: 'error',
	                        data: 'parser error'
	                    };

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

	                        var data = packet.data === undefined ? undefined : packet.data.buffer || packet.data;

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
	                            resultBuffer[i + 1] = contentArray[i];
	                        }

	                        return callback(resultBuffer.buffer);
	                    }

	                    function encodeBlobAsArrayBuffer(packet, supportsBinary, callback) {
	                        if (!supportsBinary) {
	                            return exports.encodeBase64Packet(packet, callback);
	                        }

	                        var fr = new FileReader();
	                        fr.onload = function () {
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

	                    exports.encodeBase64Packet = function (packet, callback) {
	                        var message = 'b' + exports.packets[packet.type];
	                        if (Blob && packet.data instanceof global.Blob) {
	                            var fr = new FileReader();
	                            fr.onload = function () {
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

	                    exports.decodeBase64Packet = function (msg, binaryType) {
	                        var type = packetslist[msg.charAt(0)];
	                        if (!global.ArrayBuffer) {
	                            return {
	                                type: type,
	                                data: {
	                                    base64: true,
	                                    data: msg.substr(1)
	                                }
	                            };
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
	                            exports.encodePacket(packet, !isBinary ? false : supportsBinary, true, function (message) {
	                                doneCallback(null, setLengthHeader(message));
	                            });
	                        }

	                        map(packets, encodeOne, function (err, results) {
	                            return callback(results.join(''));
	                        });
	                    };

	                    /**
	                    * Async array map using after
	                    */

	                    function map(ary, each, done) {
	                        var result = new Array(ary.length);
	                        var next = after(ary.length, done);

	                        var eachWithIndex = function eachWithIndex(i, el, cb) {
	                            each(el, function (error, msg) {
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

	                        var length = '',
	                            n,
	                            msg;

	                        for (var i = 0, l = data.length; i < l; i++) {
	                            var chr = data.charAt(i);

	                            if (':' != chr) {
	                                length += chr;
	                            } else {
	                                if ('' == length || length != (n = Number(length))) {
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

	                    exports.encodePayloadAsArrayBuffer = function (packets, callback) {
	                        if (!packets.length) {
	                            return callback(new ArrayBuffer(0));
	                        }

	                        function encodeOne(packet, doneCallback) {
	                            exports.encodePacket(packet, true, true, function (data) {
	                                return doneCallback(null, data);
	                            });
	                        }

	                        map(packets, encodeOne, function (err, encodedPackets) {
	                            var totalLength = encodedPackets.reduce(function (acc, p) {
	                                var len;
	                                if (typeof p === 'string') {
	                                    len = p.length;
	                                } else {
	                                    len = p.byteLength;
	                                }
	                                return acc + len.toString().length + len + 2; // string/binary identifier + separator = 2
	                            }, 0);

	                            var resultArray = new Uint8Array(totalLength);

	                            var bufferIndex = 0;
	                            encodedPackets.forEach(function (p) {
	                                var isString = typeof p === 'string';
	                                var ab = p;
	                                if (isString) {
	                                    var view = new Uint8Array(p.length);
	                                    for (var i = 0; i < p.length; i++) {
	                                        view[i] = p.charCodeAt(i);
	                                    }
	                                    ab = view.buffer;
	                                }

	                                if (isString) {
	                                    // not true binary
	                                    resultArray[bufferIndex++] = 0;
	                                } else {
	                                    // true binary
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

	                    exports.encodePayloadAsBlob = function (packets, callback) {
	                        function encodeOne(packet, doneCallback) {
	                            exports.encodePacket(packet, true, true, function (encoded) {
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

	                                var len = encoded instanceof ArrayBuffer ? encoded.byteLength : encoded.size;

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

	                        map(packets, encodeOne, function (err, results) {
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

	                            for (var i = 1;; i++) {
	                                if (tailArray[i] == 255) break;

	                                if (msgLength.length > 310) {
	                                    numberTooLong = true;
	                                    break;
	                                }

	                                msgLength += tailArray[i];
	                            }

	                            if (numberTooLong) return callback(err, 0, 1);

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
	                        buffers.forEach(function (buffer, i) {
	                            callback(exports.decodePacket(buffer, binaryType, true), i, total);
	                        });
	                    };
	                }).call(this, typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : typeof global !== "undefined" ? global : {});
	            }, {
	                "./keys": 20,
	                "after": 11,
	                "arraybuffer.slice": 12,
	                "base64-arraybuffer": 13,
	                "blob": 14,
	                "has-binary": 21,
	                "utf8": 29
	            }],
	            20: [function (_dereq_, module, exports) {

	                /**
	                * Gets the keys for an object.
	                *
	                * @return {Array} keys
	                * @api private
	                */

	                module.exports = Object.keys || function keys(obj) {
	                    var arr = [];
	                    var has = Object.prototype.hasOwnProperty;

	                    for (var i in obj) {
	                        if (has.call(obj, i)) {
	                            arr.push(i);
	                        }
	                    }
	                    return arr;
	                };
	            }, {}],
	            21: [function (_dereq_, module, exports) {
	                (function (global) {

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

	                            if (global.Buffer && global.Buffer.isBuffer(obj) || global.ArrayBuffer && obj instanceof ArrayBuffer || global.Blob && obj instanceof Blob || global.File && obj instanceof File) {
	                                return true;
	                            }

	                            if (isArray(obj)) {
	                                for (var i = 0; i < obj.length; i++) {
	                                    if (_hasBinary(obj[i])) {
	                                        return true;
	                                    }
	                                }
	                            } else if (obj && 'object' == (typeof obj === "undefined" ? "undefined" : _typeof(obj))) {
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
	                }).call(this, typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : typeof global !== "undefined" ? global : {});
	            }, {
	                "isarray": 24
	            }],
	            22: [function (_dereq_, module, exports) {

	                /**
	                * Module exports.
	                *
	                * Logic borrowed from Modernizr:
	                *
	                *   - https://github.com/Modernizr/Modernizr/blob/master/feature-detects/cors.js
	                */

	                try {
	                    module.exports = typeof XMLHttpRequest !== 'undefined' && 'withCredentials' in new XMLHttpRequest();
	                } catch (err) {
	                    // if XMLHttp support is disabled in IE then it will throw
	                    // when trying to create
	                    module.exports = false;
	                }
	            }, {}],
	            23: [function (_dereq_, module, exports) {

	                var indexOf = [].indexOf;

	                module.exports = function (arr, obj) {
	                    if (indexOf) return arr.indexOf(obj);
	                    for (var i = 0; i < arr.length; ++i) {
	                        if (arr[i] === obj) return i;
	                    }
	                    return -1;
	                };
	            }, {}],
	            24: [function (_dereq_, module, exports) {
	                module.exports = Array.isArray || function (arr) {
	                    return Object.prototype.toString.call(arr) == '[object Array]';
	                };
	            }, {}],
	            25: [function (_dereq_, module, exports) {
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

	                module.exports = function (val, options) {
	                    options = options || {};
	                    if ('string' == typeof val) return parse(val);
	                    return options.long ? long(val) : short(val);
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
	                    return plural(ms, d, 'day') || plural(ms, h, 'hour') || plural(ms, m, 'minute') || plural(ms, s, 'second') || ms + ' ms';
	                }

	                /**
	                * Pluralization helper.
	                */

	                function plural(ms, n, name) {
	                    if (ms < n) return;
	                    if (ms < n * 1.5) return Math.floor(ms / n) + ' ' + name;
	                    return Math.ceil(ms / n) + ' ' + name + 's';
	                }
	            }, {}],
	            26: [function (_dereq_, module, exports) {
	                (function (global) {
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

	                        if (rvalidchars.test(data.replace(rvalidescape, '@').replace(rvalidtokens, ']').replace(rvalidbraces, ''))) {
	                            return new Function('return ' + data)();
	                        }
	                    };
	                }).call(this, typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : typeof global !== "undefined" ? global : {});
	            }, {}],
	            27: [function (_dereq_, module, exports) {
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

	                exports.decode = function (qs) {
	                    var qry = {};
	                    var pairs = qs.split('&');
	                    for (var i = 0, l = pairs.length; i < l; i++) {
	                        var pair = pairs[i].split('=');
	                        qry[decodeURIComponent(pair[0])] = decodeURIComponent(pair[1]);
	                    }
	                    return qry;
	                };
	            }, {}],
	            28: [function (_dereq_, module, exports) {
	                /**
	                * Parses an URI
	                *
	                * @author Steven Levithan <stevenlevithan.com> (MIT license)
	                * @api private
	                */

	                var re = /^(?:(?![^:@]+:[^:@\/]*@)(http|https|ws|wss):\/\/)?((?:(([^:@]*)(?::([^:@]*))?)?@)?((?:[a-f0-9]{0,4}:){2,7}[a-f0-9]{0,4}|[^:\/?#]*)(?::(\d*))?)(((\/(?:[^?#](?![^?#\/]*\.[^?#\/.]+(?:[?#]|$)))*\/?)?([^?#\/]*))(?:\?([^#]*))?(?:#(.*))?)/;

	                var parts = ['source', 'protocol', 'authority', 'userInfo', 'user', 'password', 'host', 'port', 'relative', 'path', 'directory', 'file', 'query', 'anchor'];

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
	            }, {}],
	            29: [function (_dereq_, module, exports) {
	                (function (global) {
	                    /*! https://mths.be/utf8js v2.0.0 by @mathias */;
	                    (function (root) {

	                        // Detect free variables `exports`
	                        var freeExports = (typeof exports === "undefined" ? "undefined" : _typeof(exports)) == 'object' && exports;

	                        // Detect free variable `module`
	                        var freeModule = (typeof module === "undefined" ? "undefined" : _typeof(module)) == 'object' && module && module.exports == freeExports && module;

	                        // Detect free variable `global`, from Node.js or Browserified code,
	                        // and use it as `root`
	                        var freeGlobal = (typeof global === "undefined" ? "undefined" : _typeof(global)) == 'object' && global;
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
	                                    if ((extra & 0xFC00) == 0xDC00) {
	                                        // low surrogate
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
	                                throw Error('Lone surrogate U+' + codePoint.toString(16).toUpperCase() + ' is not a scalar value');
	                            }
	                        }
	                        /*--------------------------------------------------------------------------*/

	                        function createByte(codePoint, shift) {
	                            return stringFromCharCode(codePoint >> shift & 0x3F | 0x80);
	                        }

	                        function encodeCodePoint(codePoint) {
	                            if ((codePoint & 0xFFFFFF80) == 0) {
	                                // 1-byte sequence
	                                return stringFromCharCode(codePoint);
	                            }
	                            var symbol = '';
	                            if ((codePoint & 0xFFFFF800) == 0) {
	                                // 2-byte sequence
	                                symbol = stringFromCharCode(codePoint >> 6 & 0x1F | 0xC0);
	                            } else if ((codePoint & 0xFFFF0000) == 0) {
	                                // 3-byte sequence
	                                checkScalarValue(codePoint);
	                                symbol = stringFromCharCode(codePoint >> 12 & 0x0F | 0xE0);
	                                symbol += createByte(codePoint, 6);
	                            } else if ((codePoint & 0xFFE00000) == 0) {
	                                // 4-byte sequence
	                                symbol = stringFromCharCode(codePoint >> 18 & 0x07 | 0xF0);
	                                symbol += createByte(codePoint, 12);
	                                symbol += createByte(codePoint, 6);
	                            }
	                            symbol += stringFromCharCode(codePoint & 0x3F | 0x80);
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
	                                codePoint = (byte1 & 0x1F) << 6 | byte2;
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
	                                codePoint = (byte1 & 0x0F) << 12 | byte2 << 6 | byte3;
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
	                                codePoint = (byte1 & 0x0F) << 0x12 | byte2 << 0x0C | byte3 << 0x06 | byte4;
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
	                        if (typeof define == 'function' && _typeof(define.amd) == 'object' && define.amd) {
	                            define(function () {
	                                return utf8;
	                            });
	                        } else if (freeExports && !freeExports.nodeType) {
	                            if (freeModule) {
	                                // in Node.js or RingoJS v0.8.0+
	                                freeModule.exports = utf8;
	                            } else {
	                                // in Narwhal or RingoJS v0.7.0-
	                                var object = {};
	                                var hasOwnProperty = object.hasOwnProperty;
	                                for (var key in utf8) {
	                                    hasOwnProperty.call(utf8, key) && (freeExports[key] = utf8[key]);
	                                }
	                            }
	                        } else {
	                            // in Rhino or a web browser
	                            root.utf8 = utf8;
	                        }
	                    })(this);
	                }).call(this, typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : typeof global !== "undefined" ? global : {});
	            }, {}],
	            30: [function (_dereq_, module, exports) {
	                'use strict';

	                var alphabet = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz-_'.split(''),
	                    length = 64,
	                    map = {},
	                    seed = 0,
	                    i = 0,
	                    prev;

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
	                    return now + '.' + encode(seed++);
	                }

	                //
	                // Map each character to its index.
	                //
	                for (; i < length; i++) {
	                    map[alphabet[i]] = i;
	                } //
	                // Expose the `yeast`, `encode` and `decode` functions.
	                //
	                yeast.encode = encode;
	                yeast.decode = decode;
	                module.exports = yeast;
	            }, {}],
	            31: [function (_dereq_, module, exports) {

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
	                    if ((typeof uri === "undefined" ? "undefined" : _typeof(uri)) == 'object') {
	                        opts = uri;
	                        uri = undefined;
	                    }

	                    opts = opts || {};

	                    var parsed = url(uri);
	                    var source = parsed.source;
	                    var id = parsed.id;
	                    var path = parsed.path;
	                    var sameNamespace = cache[id] && path in cache[id].nsps;
	                    var newConnection = opts.forceNew || opts['force new connection'] || false === opts.multiplex || sameNamespace;

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
	            }, {
	                "./manager": 32,
	                "./socket": 34,
	                "./url": 35,
	                "debug": 39,
	                "socket.io-parser": 47
	            }],
	            32: [function (_dereq_, module, exports) {

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

	                function Manager(uri, opts) {
	                    if (!(this instanceof Manager)) return new Manager(uri, opts);
	                    if (uri && 'object' == (typeof uri === "undefined" ? "undefined" : _typeof(uri))) {
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
	                    this.backoff = new Backoff({ min: this.reconnectionDelay(), max: this.reconnectionDelayMax(), jitter: this.randomizationFactor() });
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

	                Manager.prototype.emitAll = function () {
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

	                Manager.prototype.updateSocketIds = function () {
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

	                Manager.prototype.reconnection = function (v) {
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

	                Manager.prototype.reconnectionAttempts = function (v) {
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

	                Manager.prototype.reconnectionDelay = function (v) {
	                    if (!arguments.length) return this._reconnectionDelay;
	                    this._reconnectionDelay = v;
	                    this.backoff && this.backoff.setMin(v);
	                    return this;
	                };

	                Manager.prototype.randomizationFactor = function (v) {
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

	                Manager.prototype.reconnectionDelayMax = function (v) {
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

	                Manager.prototype.timeout = function (v) {
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

	                Manager.prototype.maybeReconnectOnOpen = function () {
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

	                Manager.prototype.open = Manager.prototype.connect = function (fn) {
	                    debug('readyState %s', this.readyState);
	                    if (~this.readyState.indexOf('open')) return this;

	                    debug('opening %s', this.uri);
	                    this.engine = eio(this.uri, this.opts);
	                    var socket = this.engine;
	                    var self = this;
	                    this.readyState = 'opening';
	                    this.skipReconnect = false;

	                    // emit `open`
	                    var openSub = on(socket, 'open', function () {
	                        self.onopen();
	                        fn && fn();
	                    });

	                    // emit `connect_error`
	                    var errorSub = on(socket, 'error', function (data) {
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
	                        var timer = setTimeout(function () {
	                            debug('connect attempt timed out after %d', timeout);
	                            openSub.destroy();
	                            socket.close();
	                            socket.emit('error', 'timeout');
	                            self.emitAll('connect_timeout', timeout);
	                        }, timeout);

	                        this.subs.push({
	                            destroy: function destroy() {
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

	                Manager.prototype.onopen = function () {
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

	                Manager.prototype.onping = function () {
	                    this.lastPing = new Date();
	                    this.emitAll('ping');
	                };

	                /**
	                * Called upon a packet.
	                *
	                * @api private
	                */

	                Manager.prototype.onpong = function () {
	                    this.emitAll('pong', new Date() - this.lastPing);
	                };

	                /**
	                * Called with data.
	                *
	                * @api private
	                */

	                Manager.prototype.ondata = function (data) {
	                    this.decoder.add(data);
	                };

	                /**
	                * Called when parser fully decodes a packet.
	                *
	                * @api private
	                */

	                Manager.prototype.ondecoded = function (packet) {
	                    this.emit('packet', packet);
	                };

	                /**
	                * Called upon socket error.
	                *
	                * @api private
	                */

	                Manager.prototype.onerror = function (err) {
	                    debug('error', err);
	                    this.emitAll('error', err);
	                };

	                /**
	                * Creates a new socket for the given `nsp`.
	                *
	                * @return {Socket}
	                * @api public
	                */

	                Manager.prototype.socket = function (nsp) {
	                    var socket = this.nsps[nsp];
	                    if (!socket) {
	                        socket = new Socket(this, nsp);
	                        this.nsps[nsp] = socket;
	                        var self = this;
	                        socket.on('connecting', onConnecting);
	                        socket.on('connect', function () {
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

	                Manager.prototype.destroy = function (socket) {
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

	                Manager.prototype.packet = function (packet) {
	                    debug('writing packet %j', packet);
	                    var self = this;

	                    if (!self.encoding) {
	                        // encode, then write to engine with result
	                        self.encoding = true;
	                        this.encoder.encode(packet, function (encodedPackets) {
	                            for (var i = 0; i < encodedPackets.length; i++) {
	                                self.engine.write(encodedPackets[i], packet.options);
	                            }
	                            self.encoding = false;
	                            self.processPacketQueue();
	                        });
	                    } else {
	                        // add packet to the queue
	                        self.packetBuffer.push(packet);
	                    }
	                };

	                /**
	                * If packet buffer is non-empty, begins encoding the
	                * next packet in line.
	                *
	                * @api private
	                */

	                Manager.prototype.processPacketQueue = function () {
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

	                Manager.prototype.cleanup = function () {
	                    debug('cleanup');

	                    var sub;
	                    while (sub = this.subs.shift()) {
	                        sub.destroy();
	                    }this.packetBuffer = [];
	                    this.encoding = false;
	                    this.lastPing = null;

	                    this.decoder.destroy();
	                };

	                /**
	                * Close the current socket.
	                *
	                * @api private
	                */

	                Manager.prototype.close = Manager.prototype.disconnect = function () {
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

	                Manager.prototype.onclose = function (reason) {
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

	                Manager.prototype.reconnect = function () {
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
	                        var timer = setTimeout(function () {
	                            if (self.skipReconnect) return;

	                            debug('attempting reconnect');
	                            self.emitAll('reconnect_attempt', self.backoff.attempts);
	                            self.emitAll('reconnecting', self.backoff.attempts);

	                            // check again for the case socket closed in above events
	                            if (self.skipReconnect) return;

	                            self.open(function (err) {
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
	                            destroy: function destroy() {
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

	                Manager.prototype.onreconnect = function () {
	                    var attempt = this.backoff.attempts;
	                    this.reconnecting = false;
	                    this.backoff.reset();
	                    this.updateSocketIds();
	                    this.emitAll('reconnect', attempt);
	                };
	            }, {
	                "./on": 33,
	                "./socket": 34,
	                "backo2": 36,
	                "component-bind": 37,
	                "component-emitter": 38,
	                "debug": 39,
	                "engine.io-client": 1,
	                "indexof": 42,
	                "socket.io-parser": 47
	            }],
	            33: [function (_dereq_, module, exports) {

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
	                        destroy: function destroy() {
	                            obj.removeListener(ev, fn);
	                        }
	                    };
	                }
	            }, {}],
	            34: [function (_dereq_, module, exports) {

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

	                function Socket(io, nsp) {
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

	                Socket.prototype.subEvents = function () {
	                    if (this.subs) return;

	                    var io = this.io;
	                    this.subs = [on(io, 'open', bind(this, 'onopen')), on(io, 'packet', bind(this, 'onpacket')), on(io, 'close', bind(this, 'onclose'))];
	                };

	                /**
	                * "Opens" the socket.
	                *
	                * @api public
	                */

	                Socket.prototype.open = Socket.prototype.connect = function () {
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

	                Socket.prototype.send = function () {
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

	                Socket.prototype.emit = function (ev) {
	                    if (events.hasOwnProperty(ev)) {
	                        emit.apply(this, arguments);
	                        return this;
	                    }

	                    var args = toArray(arguments);
	                    var parserType = parser.EVENT; // default
	                    if (hasBin(args)) {
	                        parserType = parser.BINARY_EVENT;
	                    } // binary
	                    var packet = {
	                        type: parserType,
	                        data: args
	                    };

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

	                Socket.prototype.packet = function (packet) {
	                    packet.nsp = this.nsp;
	                    this.io.packet(packet);
	                };

	                /**
	                * Called upon engine `open`.
	                *
	                * @api private
	                */

	                Socket.prototype.onopen = function () {
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

	                Socket.prototype.onclose = function (reason) {
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

	                Socket.prototype.onpacket = function (packet) {
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

	                Socket.prototype.onevent = function (packet) {
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

	                Socket.prototype.ack = function (id) {
	                    var self = this;
	                    var sent = false;
	                    return function () {
	                        // prevent double callbacks
	                        if (sent) return;
	                        sent = true;
	                        var args = toArray(arguments);
	                        debug('sending ack %j', args);

	                        var type = hasBin(args) ? parser.BINARY_ACK : parser.ACK;
	                        self.packet({ type: type, id: id, data: args });
	                    };
	                };

	                /**
	                * Called upon a server acknowlegement.
	                *
	                * @param {Object} packet
	                * @api private
	                */

	                Socket.prototype.onack = function (packet) {
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

	                Socket.prototype.onconnect = function () {
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

	                Socket.prototype.emitBuffered = function () {
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

	                Socket.prototype.ondisconnect = function () {
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

	                Socket.prototype.destroy = function () {
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

	                Socket.prototype.close = Socket.prototype.disconnect = function () {
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

	                Socket.prototype.compress = function (compress) {
	                    this.flags = this.flags || {};
	                    this.flags.compress = compress;
	                    return this;
	                };
	            }, {
	                "./on": 33,
	                "component-bind": 37,
	                "component-emitter": 38,
	                "debug": 39,
	                "has-binary": 41,
	                "socket.io-parser": 47,
	                "to-array": 51
	            }],
	            35: [function (_dereq_, module, exports) {
	                (function (global) {

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

	                    function url(uri, loc) {
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
	                            } else if (/^(http|ws)s$/.test(obj.protocol)) {
	                                obj.port = '443';
	                            }
	                        }

	                        obj.path = obj.path || '/';

	                        var ipv6 = obj.host.indexOf(':') !== -1;
	                        var host = ipv6 ? '[' + obj.host + ']' : obj.host;

	                        // define unique id
	                        obj.id = obj.protocol + '://' + host + ':' + obj.port;
	                        // define href
	                        obj.href = obj.protocol + '://' + host + (loc && loc.port == obj.port ? '' : ':' + obj.port);

	                        return obj;
	                    }
	                }).call(this, typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : typeof global !== "undefined" ? global : {});
	            }, {
	                "debug": 39,
	                "parseuri": 45
	            }],
	            36: [function (_dereq_, module, exports) {

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

	                Backoff.prototype.duration = function () {
	                    var ms = this.ms * Math.pow(this.factor, this.attempts++);
	                    if (this.jitter) {
	                        var rand = Math.random();
	                        var deviation = Math.floor(rand * this.jitter * ms);
	                        ms = (Math.floor(rand * 10) & 1) == 0 ? ms - deviation : ms + deviation;
	                    }
	                    return Math.min(ms, this.max) | 0;
	                };

	                /**
	                * Reset the number of attempts.
	                *
	                * @api public
	                */

	                Backoff.prototype.reset = function () {
	                    this.attempts = 0;
	                };

	                /**
	                * Set the minimum duration
	                *
	                * @api public
	                */

	                Backoff.prototype.setMin = function (min) {
	                    this.ms = min;
	                };

	                /**
	                * Set the maximum duration
	                *
	                * @api public
	                */

	                Backoff.prototype.setMax = function (max) {
	                    this.max = max;
	                };

	                /**
	                * Set the jitter
	                *
	                * @api public
	                */

	                Backoff.prototype.setJitter = function (jitter) {
	                    this.jitter = jitter;
	                };
	            }, {}],
	            37: [function (_dereq_, module, exports) {
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

	                module.exports = function (obj, fn) {
	                    if ('string' == typeof fn) fn = obj[fn];
	                    if ('function' != typeof fn) throw new Error('bind() requires a function');
	                    var args = slice.call(arguments, 2);
	                    return function () {
	                        return fn.apply(obj, args.concat(slice.call(arguments)));
	                    };
	                };
	            }, {}],
	            38: [function (_dereq_, module, exports) {

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

	                Emitter.prototype.on = Emitter.prototype.addEventListener = function (event, fn) {
	                    this._callbacks = this._callbacks || {};
	                    (this._callbacks['$' + event] = this._callbacks['$' + event] || []).push(fn);
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

	                Emitter.prototype.once = function (event, fn) {
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

	                Emitter.prototype.off = Emitter.prototype.removeListener = Emitter.prototype.removeAllListeners = Emitter.prototype.removeEventListener = function (event, fn) {
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

	                Emitter.prototype.emit = function (event) {
	                    this._callbacks = this._callbacks || {};
	                    var args = [].slice.call(arguments, 1),
	                        callbacks = this._callbacks['$' + event];

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

	                Emitter.prototype.listeners = function (event) {
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

	                Emitter.prototype.hasListeners = function (event) {
	                    return !!this.listeners(event).length;
	                };
	            }, {}],
	            39: [function (_dereq_, module, exports) {
	                arguments[4][17][0].apply(exports, arguments);
	            }, {
	                "./debug": 40,
	                "dup": 17
	            }],
	            40: [function (_dereq_, module, exports) {
	                arguments[4][18][0].apply(exports, arguments);
	            }, {
	                "dup": 18,
	                "ms": 44
	            }],
	            41: [function (_dereq_, module, exports) {
	                (function (global) {

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

	                            if (global.Buffer && global.Buffer.isBuffer && global.Buffer.isBuffer(obj) || global.ArrayBuffer && obj instanceof ArrayBuffer || global.Blob && obj instanceof Blob || global.File && obj instanceof File) {
	                                return true;
	                            }

	                            if (isArray(obj)) {
	                                for (var i = 0; i < obj.length; i++) {
	                                    if (_hasBinary(obj[i])) {
	                                        return true;
	                                    }
	                                }
	                            } else if (obj && 'object' == (typeof obj === "undefined" ? "undefined" : _typeof(obj))) {
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
	                }).call(this, typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : typeof global !== "undefined" ? global : {});
	            }, {
	                "isarray": 43
	            }],
	            42: [function (_dereq_, module, exports) {
	                arguments[4][23][0].apply(exports, arguments);
	            }, {
	                "dup": 23
	            }],
	            43: [function (_dereq_, module, exports) {
	                arguments[4][24][0].apply(exports, arguments);
	            }, {
	                "dup": 24
	            }],
	            44: [function (_dereq_, module, exports) {
	                arguments[4][25][0].apply(exports, arguments);
	            }, {
	                "dup": 25
	            }],
	            45: [function (_dereq_, module, exports) {
	                arguments[4][28][0].apply(exports, arguments);
	            }, {
	                "dup": 28
	            }],
	            46: [function (_dereq_, module, exports) {
	                (function (global) {
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

	                    exports.deconstructPacket = function (packet) {
	                        var buffers = [];
	                        var packetData = packet.data;

	                        function _deconstructPacket(data) {
	                            if (!data) return data;

	                            if (isBuf(data)) {
	                                var placeholder = {
	                                    _placeholder: true,
	                                    num: buffers.length
	                                };
	                                buffers.push(data);
	                                return placeholder;
	                            } else if (isArray(data)) {
	                                var newData = new Array(data.length);
	                                for (var i = 0; i < data.length; i++) {
	                                    newData[i] = _deconstructPacket(data[i]);
	                                }
	                                return newData;
	                            } else if ('object' == (typeof data === "undefined" ? "undefined" : _typeof(data)) && !(data instanceof Date)) {
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
	                        return { packet: pack, buffers: buffers };
	                    };

	                    /**
	                    * Reconstructs a binary packet from its placeholder packet and buffers
	                    *
	                    * @param {Object} packet - event packet with placeholders
	                    * @param {Array} buffers - binary buffers to put in placeholder positions
	                    * @return {Object} reconstructed packet
	                    * @api public
	                    */

	                    exports.reconstructPacket = function (packet, buffers) {
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
	                            } else if (data && 'object' == (typeof data === "undefined" ? "undefined" : _typeof(data))) {
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

	                    exports.removeBlobs = function (data, callback) {
	                        function _removeBlobs(obj, curKey, containingObject) {
	                            if (!obj) return obj;

	                            // convert any blob
	                            if (global.Blob && obj instanceof Blob || global.File && obj instanceof File) {
	                                pendingBlobs++;

	                                // async filereader
	                                var fileReader = new FileReader();
	                                fileReader.onload = function () {
	                                    // this.result == arraybuffer
	                                    if (containingObject) {
	                                        containingObject[curKey] = this.result;
	                                    } else {
	                                        bloblessData = this.result;
	                                    }

	                                    // if nothing pending its callback time
	                                    if (! --pendingBlobs) {
	                                        callback(bloblessData);
	                                    }
	                                };

	                                fileReader.readAsArrayBuffer(obj); // blob -> arraybuffer
	                            } else if (isArray(obj)) {
	                                // handle array
	                                for (var i = 0; i < obj.length; i++) {
	                                    _removeBlobs(obj[i], i, obj);
	                                }
	                            } else if (obj && 'object' == (typeof obj === "undefined" ? "undefined" : _typeof(obj)) && !isBuf(obj)) {
	                                // and object
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
	                }).call(this, typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : typeof global !== "undefined" ? global : {});
	            }, {
	                "./is-buffer": 48,
	                "isarray": 43
	            }],
	            47: [function (_dereq_, module, exports) {

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

	                exports.types = ['CONNECT', 'DISCONNECT', 'EVENT', 'BINARY_EVENT', 'ACK', 'BINARY_ACK', 'ERROR'];

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

	                Encoder.prototype.encode = function (obj, callback) {
	                    debug('encoding packet %j', obj);

	                    if (exports.BINARY_EVENT == obj.type || exports.BINARY_ACK == obj.type) {
	                        encodeAsBinary(obj, callback);
	                    } else {
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

	                Decoder.prototype.add = function (obj) {
	                    var packet;
	                    if ('string' == typeof obj) {
	                        packet = decodeString(obj);
	                        if (exports.BINARY_EVENT == packet.type || exports.BINARY_ACK == packet.type) {
	                            // binary packet's json
	                            this.reconstructor = new BinaryReconstructor(packet);

	                            // no attachments, labeled binary but no binary data to follow
	                            if (this.reconstructor.reconPack.attachments === 0) {
	                                this.emit('decoded', packet);
	                            }
	                        } else {
	                            // non-binary full packet
	                            this.emit('decoded', packet);
	                        }
	                    } else if (isBuf(obj) || obj.base64) {
	                        // raw binary data
	                        if (!this.reconstructor) {
	                            throw new Error('got binary data when not reconstructing a packet');
	                        } else {
	                            packet = this.reconstructor.takeBinaryData(obj);
	                            if (packet) {
	                                // received final buffer
	                                this.reconstructor = null;
	                                this.emit('decoded', packet);
	                            }
	                        }
	                    } else {
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
	                        } catch (e) {
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

	                Decoder.prototype.destroy = function () {
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

	                BinaryReconstructor.prototype.takeBinaryData = function (binData) {
	                    this.buffers.push(binData);
	                    if (this.buffers.length == this.reconPack.attachments) {
	                        // done with buffer list
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

	                BinaryReconstructor.prototype.finishedReconstruction = function () {
	                    this.reconPack = null;
	                    this.buffers = [];
	                };

	                function error(data) {
	                    return { type: exports.ERROR, data: 'parser error' };
	                }
	            }, {
	                "./binary": 46,
	                "./is-buffer": 48,
	                "component-emitter": 49,
	                "debug": 39,
	                "isarray": 43,
	                "json3": 50
	            }],
	            48: [function (_dereq_, module, exports) {
	                (function (global) {

	                    module.exports = isBuf;

	                    /**
	                    * Returns true if obj is a buffer or an arraybuffer.
	                    *
	                    * @api private
	                    */

	                    function isBuf(obj) {
	                        return global.Buffer && global.Buffer.isBuffer(obj) || global.ArrayBuffer && obj instanceof ArrayBuffer;
	                    }
	                }).call(this, typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : typeof global !== "undefined" ? global : {});
	            }, {}],
	            49: [function (_dereq_, module, exports) {
	                arguments[4][15][0].apply(exports, arguments);
	            }, {
	                "dup": 15
	            }],
	            50: [function (_dereq_, module, exports) {
	                (function (global) {
	                    /*! JSON v3.3.2 | http://bestiejs.github.io/json3 | Copyright 2012-2014, Kit Cambridge | http://kit.mit-license.org */;
	                    (function () {
	                        // Detect the `define` function exposed by asynchronous module loaders. The
	                        // strict `define` check is necessary for compatibility with `r.js`.
	                        var isLoader = typeof define === "function" && define.amd;

	                        // A set of types used to distinguish objects from primitives.
	                        var objectTypes = {
	                            "function": true,
	                            "object": true
	                        };

	                        // Detect the `exports` object exposed by CommonJS implementations.
	                        var freeExports = objectTypes[typeof exports === "undefined" ? "undefined" : _typeof(exports)] && exports && !exports.nodeType && exports;

	                        // Use the `global` object exposed by Node (including Browserify via
	                        // `insert-module-globals`), Narwhal, and Ringo as the default context,
	                        // and the `window` object in browsers. Rhino exports a `global` function
	                        // instead.
	                        var root = objectTypes[typeof window === "undefined" ? "undefined" : _typeof(window)] && window || this,
	                            freeGlobal = freeExports && objectTypes[typeof module === "undefined" ? "undefined" : _typeof(module)] && module && !module.nodeType && (typeof global === "undefined" ? "undefined" : _typeof(global)) == "object" && global;

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
	                            if ((typeof nativeJSON === "undefined" ? "undefined" : _typeof(nativeJSON)) == "object" && nativeJSON) {
	                                exports.stringify = nativeJSON.stringify;
	                                exports.parse = nativeJSON.parse;
	                            }

	                            // Convenience aliases.
	                            var objectProto = Object.prototype,
	                                getClass = objectProto.toString,
	                                _isProperty,
	                                _forEach,
	                                undef;

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
	                                    var value,
	                                        serialized = "{\"a\":[1,true,false,null,\"\\u0000\\b\\n\\f\\r\\t\"]}";
	                                    // Test `JSON.stringify`.
	                                    if (name == "json-stringify") {
	                                        var stringify = exports.stringify,
	                                            stringifySupported = typeof stringify == "function" && isExtended;
	                                        if (stringifySupported) {
	                                            // A test function object with a custom `toJSON` method.
	                                            (value = function value() {
	                                                return 1;
	                                            }).toJSON = value;
	                                            try {
	                                                stringifySupported =
	                                                // Firefox 3.1b1 and b2 serialize string, number, and boolean
	                                                // primitives as object literals.
	                                                stringify(0) === "0" &&
	                                                // FF 3.1b1, b2, and JSON 2 serialize wrapped primitives as object
	                                                // literals.
	                                                stringify(new Number()) === "0" && stringify(new String()) == '""' &&
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
	                                                stringify(value) === "1" && stringify([value]) == "[1]" &&
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
	                                                stringify({
	                                                    "a": [value, true, false, null, "\x00\b\n\f\r\t"]
	                                                }) == serialized &&
	                                                // FF 3.1b1 and b2 ignore the `filter` and `width` arguments.
	                                                stringify(null, value) === "1" && stringify([1, 2], null, 1) == "[\n 1,\n 2\n]" &&
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
	                                    var getDay = function getDay(year, month) {
	                                        return Months[month] + 365 * (year - 1970) + floor((year - 1969 + (month = +(month > 1))) / 4) - floor((year - 1901 + month) / 100) + floor((year - 1601 + month) / 400);
	                                    };
	                                }

	                                // Internal: Determines if a property is a direct property of the given
	                                // object. Delegates to the native `Object#hasOwnProperty` method.
	                                if (!(_isProperty = objectProto.hasOwnProperty)) {
	                                    _isProperty = function isProperty(property) {
	                                        var members = {},
	                                            constructor;
	                                        if ((members.__proto__ = null, members.__proto__ = {
	                                            // The *proto* property cannot be set multiple times in recent
	                                            // versions of Firefox and SeaMonkey.
	                                            "toString": 1
	                                        }, members).toString != getClass) {
	                                            // Safari <= 2.0.3 doesn't implement `Object#hasOwnProperty`, but
	                                            // supports the mutable *proto* property.
	                                            _isProperty = function isProperty(property) {
	                                                // Capture and break the object's prototype chain (see section 8.6.2
	                                                // of the ES 5.1 spec). The parenthesized expression prevents an
	                                                // unsafe transformation by the Closure Compiler.
	                                                var original = this.__proto__,
	                                                    result = property in (this.__proto__ = null, this);
	                                                // Restore the original prototype chain.
	                                                this.__proto__ = original;
	                                                return result;
	                                            };
	                                        } else {
	                                            // Capture a reference to the top-level `Object` constructor.
	                                            constructor = members.constructor;
	                                            // Use the `constructor` property to simulate `Object#hasOwnProperty` in
	                                            // other environments.
	                                            _isProperty = function isProperty(property) {
	                                                var parent = (this.constructor || constructor).prototype;
	                                                return property in this && !(property in parent && this[property] === parent[property]);
	                                            };
	                                        }
	                                        members = null;
	                                        return _isProperty.call(this, property);
	                                    };
	                                }

	                                // Internal: Normalizes the `for...in` iteration algorithm across
	                                // environments. Each enumerated key is yielded to a `callback` function.
	                                _forEach = function forEach(object, callback) {
	                                    var size = 0,
	                                        Properties,
	                                        members,
	                                        property;

	                                    // Tests for bugs in the current environment's `for...in` algorithm. The
	                                    // `valueOf` property inherits the non-enumerable flag from
	                                    // `Object.prototype` in older versions of IE, Netscape, and Mozilla.
	                                    (Properties = function Properties() {
	                                        this.valueOf = 0;
	                                    }).prototype.valueOf = 0;

	                                    // Iterate over a new instance of the `Properties` class.
	                                    members = new Properties();
	                                    for (property in members) {
	                                        // Ignore all properties inherited from `Object.prototype`.
	                                        if (_isProperty.call(members, property)) {
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
	                                        _forEach = function forEach(object, callback) {
	                                            var isFunction = getClass.call(object) == functionClass,
	                                                property,
	                                                length;
	                                            var hasProperty = !isFunction && typeof object.constructor != "function" && objectTypes[_typeof(object.hasOwnProperty)] && object.hasOwnProperty || _isProperty;
	                                            for (property in object) {
	                                                // Gecko <= 1.0 enumerates the `prototype` property of functions under
	                                                // certain conditions; IE does not.
	                                                if (!(isFunction && property == "prototype") && hasProperty.call(object, property)) {
	                                                    callback(property);
	                                                }
	                                            }
	                                            // Manually invoke the callback for each non-enumerable property.
	                                            for (length = members.length; property = members[--length]; hasProperty.call(object, property) && callback(property)) {}
	                                        };
	                                    } else if (size == 2) {
	                                        // Safari <= 2.0.4 enumerates shadowed properties twice.
	                                        _forEach = function forEach(object, callback) {
	                                            // Create a set of iterated properties.
	                                            var members = {},
	                                                isFunction = getClass.call(object) == functionClass,
	                                                property;
	                                            for (property in object) {
	                                                // Store each property name to prevent double enumeration. The
	                                                // `prototype` property of functions is not enumerated due to cross-
	                                                // environment inconsistencies.
	                                                if (!(isFunction && property == "prototype") && !_isProperty.call(members, property) && (members[property] = 1) && _isProperty.call(object, property)) {
	                                                    callback(property);
	                                                }
	                                            }
	                                        };
	                                    } else {
	                                        // No bugs detected; use the standard `for...in` algorithm.
	                                        _forEach = function forEach(object, callback) {
	                                            var isFunction = getClass.call(object) == functionClass,
	                                                property,
	                                                isConstructor;
	                                            for (property in object) {
	                                                if (!(isFunction && property == "prototype") && _isProperty.call(object, property) && !(isConstructor = property === "constructor")) {
	                                                    callback(property);
	                                                }
	                                            }
	                                            // Manually invoke the callback for the `constructor` property due to
	                                            // cross-environment inconsistencies.
	                                            if (isConstructor || _isProperty.call(object, property = "constructor")) {
	                                                callback(property);
	                                            }
	                                        };
	                                    }
	                                    return _forEach(object, callback);
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
	                                    var toPaddedString = function toPaddedString(width, value) {
	                                        // The `|| 0` expression is necessary to work around a bug in
	                                        // Opera <= 7.54u2 where `0 == -0`, but `String(-0) !== "0"`.
	                                        return (leadingZeroes + (value || 0)).slice(-width);
	                                    };

	                                    // Internal: Double-quotes a string `value`, replacing all ASCII control
	                                    // characters (characters with code unit values between 0 and 31) with
	                                    // their escaped equivalents. This is an implementation of the
	                                    // `Quote(value)` operation defined in ES 5.1 section 15.12.3.
	                                    var unicodePrefix = "\\u00";
	                                    var quote = function quote(value) {
	                                        var result = '"',
	                                            index = 0,
	                                            length = value.length,
	                                            useCharIndex = !charIndexBuggy || length > 10;
	                                        var symbols = useCharIndex && (charIndexBuggy ? value.split("") : value);
	                                        for (; index < length; index++) {
	                                            var charCode = value.charCodeAt(index);
	                                            // If the character is a control character, append its Unicode or
	                                            // shorthand escape sequence; otherwise, append the character as-is.
	                                            switch (charCode) {
	                                                case 8:
	                                                case 9:
	                                                case 10:
	                                                case 12:
	                                                case 13:
	                                                case 34:
	                                                case 92:
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
	                                    var serialize = function serialize(property, object, callback, properties, whitespace, indentation, stack) {
	                                        var value, className, year, month, date, time, hours, minutes, seconds, milliseconds, results, element, index, length, prefix, result;
	                                        try {
	                                            // Necessary for host object support.
	                                            value = object[property];
	                                        } catch (exception) {}
	                                        if ((typeof value === "undefined" ? "undefined" : _typeof(value)) == "object" && value) {
	                                            className = getClass.call(value);
	                                            if (className == dateClass && !_isProperty.call(value, "toJSON")) {
	                                                if (value > -1 / 0 && value < 1 / 0) {
	                                                    // Dates are serialized according to the `Date#toJSON` method
	                                                    // specified in ES 5.1 section 15.9.5.44. See section 15.9.1.15
	                                                    // for the ISO 8601 date time string format.
	                                                    if (getDay) {
	                                                        // Manually compute the year, month, date, hours, minutes,
	                                                        // seconds, and milliseconds if the `getUTC*` methods are
	                                                        // buggy. Adapted from @Yaffle's `date-shim` project.
	                                                        date = floor(value / 864e5);
	                                                        for (year = floor(date / 365.2425) + 1970 - 1; getDay(year + 1, 0) <= date; year++) {}
	                                                        for (month = floor((date - getDay(year, 0)) / 30.42); getDay(year, month + 1) <= date; month++) {}
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
	                                                    value = (year <= 0 || year >= 1e4 ? (year < 0 ? "-" : "+") + toPaddedString(6, year < 0 ? -year : year) : toPaddedString(4, year)) + "-" + toPaddedString(2, month + 1) + "-" + toPaddedString(2, date) +
	                                                    // Months, dates, hours, minutes, and seconds should have two
	                                                    // digits; milliseconds should have three.
	                                                    "T" + toPaddedString(2, hours) + ":" + toPaddedString(2, minutes) + ":" + toPaddedString(2, seconds) +
	                                                    // Milliseconds are optional in ES 5.0, but required in 5.1.
	                                                    "." + toPaddedString(3, milliseconds) + "Z";
	                                                } else {
	                                                    value = null;
	                                                }
	                                            } else if (typeof value.toJSON == "function" && (className != numberClass && className != stringClass && className != arrayClass || _isProperty.call(value, "toJSON"))) {
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
	                                        if ((typeof value === "undefined" ? "undefined" : _typeof(value)) == "object") {
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
	                                                result = results.length ? whitespace ? "[\n" + indentation + results.join(",\n" + indentation) + "\n" + prefix + "]" : "[" + results.join(",") + "]" : "[]";
	                                            } else {
	                                                // Recursively serialize object members. Members are selected from
	                                                // either a user-specified list of property names, or the object
	                                                // itself.
	                                                _forEach(properties || value, function (property) {
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
	                                                result = results.length ? whitespace ? "{\n" + indentation + results.join(",\n" + indentation) + "\n" + prefix + "}" : "{" + results.join(",") + "}" : "{}";
	                                            }
	                                            // Remove the object from the traversed object stack.
	                                            stack.pop();
	                                            return result;
	                                        }
	                                    };

	                                    // Public: `JSON.stringify`. See ES 5.1 section 15.12.3.
	                                    exports.stringify = function (source, filter, width) {
	                                        var whitespace, callback, properties, className;
	                                        if (objectTypes[typeof filter === "undefined" ? "undefined" : _typeof(filter)] && filter) {
	                                            if ((className = getClass.call(filter)) == functionClass) {
	                                                callback = filter;
	                                            } else if (className == arrayClass) {
	                                                // Convert the property names array into a makeshift set.
	                                                properties = {};
	                                                for (var index = 0, length = filter.length, value; index < length; value = filter[index++], (className = getClass.call(value), className == stringClass || className == numberClass) && (properties[value] = 1)) {}
	                                            }
	                                        }
	                                        if (width) {
	                                            if ((className = getClass.call(width)) == numberClass) {
	                                                // Convert the `width` to an integer and create a string containing
	                                                // `width` number of space characters.
	                                                if ((width -= width % 1) > 0) {
	                                                    for (whitespace = "", width > 10 && (width = 10); whitespace.length < width; whitespace += " ") {}
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
	                                    var abort = function abort() {
	                                        Index = Source = null;
	                                        throw SyntaxError();
	                                    };

	                                    // Internal: Returns the next token, or `"$"` if the parser has reached
	                                    // the end of the source string. A token may be a string, number, `null`
	                                    // literal, or Boolean literal.
	                                    var lex = function lex() {
	                                        var source = Source,
	                                            length = source.length,
	                                            value,
	                                            begin,
	                                            position,
	                                            isSigned,
	                                            charCode;
	                                        while (Index < length) {
	                                            charCode = source.charCodeAt(Index);
	                                            switch (charCode) {
	                                                case 9:
	                                                case 10:
	                                                case 13:
	                                                case 32:
	                                                    // Skip whitespace tokens, including tabs, carriage returns, line
	                                                    // feeds, and space characters.
	                                                    Index++;
	                                                    break;
	                                                case 123:
	                                                case 125:
	                                                case 91:
	                                                case 93:
	                                                case 58:
	                                                case 44:
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
	                                                                case 92:
	                                                                case 34:
	                                                                case 47:
	                                                                case 98:
	                                                                case 116:
	                                                                case 110:
	                                                                case 102:
	                                                                case 114:
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
	                                                        if (charCode == 48 && (charCode = source.charCodeAt(Index + 1), charCode >= 48 && charCode <= 57)) {
	                                                            // Illegal octal literal.
	                                                            abort();
	                                                        }
	                                                        isSigned = false;
	                                                        // Parse the integer component.
	                                                        for (; Index < length && (charCode = source.charCodeAt(Index), charCode >= 48 && charCode <= 57); Index++) {
	                                                            // Floats cannot contain a leading decimal point; however, this
	                                                            // case is already accounted for by the parser.
	                                                            if (source.charCodeAt(Index) == 46) {
	                                                                position = ++Index;
	                                                                // Parse the decimal component.
	                                                                for (; position < length && (charCode = source.charCodeAt(position), charCode >= 48 && charCode <= 57); position++) {}
	                                                                if (position == Index) {
	                                                                    // Illegal trailing decimal.
	                                                                    abort();
	                                                                }
	                                                                Index = position;
	                                                            }
	                                                        } // Parse exponents. The `e` denoting the exponent is
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
	                                                            for (position = Index; position < length && (charCode = source.charCodeAt(position), charCode >= 48 && charCode <= 57); position++) {}
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
	                                    var get = function get(value) {
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
	                                    var update = function update(source, property, callback) {
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
	                                    var walk = function walk(source, property, callback) {
	                                        var value = source[property],
	                                            length;
	                                        if ((typeof value === "undefined" ? "undefined" : _typeof(value)) == "object" && value) {
	                                            // `forEach` can't be used to traverse an array in Opera <= 8.54
	                                            // because its `Object#hasOwnProperty` implementation returns `false`
	                                            // for array indices (e.g., `![1, 2, 3].hasOwnProperty("0")`).
	                                            if (getClass.call(value) == arrayClass) {
	                                                for (length = value.length; length--;) {
	                                                    update(value, length, callback);
	                                                }
	                                            } else {
	                                                _forEach(value, function (property) {
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

	                            var JSON3 = runInContext(root, root["JSON3"] = {
	                                // Public: Restores the original value of the global `JSON` object and
	                                // returns a reference to the `JSON3` object.
	                                "noConflict": function noConflict() {
	                                    if (!isRestored) {
	                                        isRestored = true;
	                                        root.JSON = nativeJSON;
	                                        root["JSON3"] = previousJSON;
	                                        nativeJSON = previousJSON = null;
	                                    }
	                                    return JSON3;
	                                }
	                            });

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
	                }).call(this, typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : typeof global !== "undefined" ? global : {});
	            }, {}],
	            51: [function (_dereq_, module, exports) {
	                module.exports = toArray;

	                function toArray(list, index) {
	                    var array = [];

	                    index = index || 0;

	                    for (var i = index || 0; i < list.length; i++) {
	                        array[i - index] = list[i];
	                    }

	                    return array;
	                }
	            }, {}]
	        }, {}, [31])(31);
	    });
	}
	/* WEBPACK VAR INJECTION */}.call(exports, (function() { return this; }())))

/***/ },
/* 76 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});

	var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

	var _CB = __webpack_require__(1);

	var _CB2 = _interopRequireDefault(_CB);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	/*
	 Column.js
	 */
	var Column = function Column(columnName, dataType, required, unique) {
	    _classCallCheck(this, Column);

	    this.document = {};

	    if (!columnName || columnName === '') throw "Column Name is required.";

	    if (typeof columnName !== 'string') {
	        throw "Column Name should be of type string.";
	    }

	    if (columnName) {
	        _CB2.default._columnNameValidation(columnName);
	        this.document.name = columnName;
	        this.document._type = 'column';
	    }

	    if (dataType) {
	        _CB2.default._columnDataTypeValidation(dataType);
	        this.document.dataType = dataType;
	    } else {
	        this.document.dataType = "Text";
	    }

	    if (typeof required === 'boolean') {
	        this.document.required = required;
	    } else {
	        this.document.required = false;
	    }

	    if (typeof unique === 'boolean') {
	        this.document.unique = unique;
	    } else {
	        this.document.unique = false;
	    }

	    if (dataType === "Text") {
	        this.document.isSearchable = true;
	    }

	    this.document.relatedTo = null;
	    this.document.relationType = null;

	    this.document.isDeletable = true;
	    this.document.isEditable = true;
	    this.document.isRenamable = false;
	    this.document.editableByMasterKey = false;
	    this.document.defaultValue = null;
	};

	Object.defineProperty(Column.prototype, 'name', {
	    get: function get() {
	        return this.document.name;
	    },
	    set: function set(name) {
	        this.document.name = name;
	    }
	});

	Object.defineProperty(Column.prototype, 'dataType', {
	    get: function get() {
	        return this.document.dataType;
	    },
	    set: function set(dataType) {
	        this.document.dataType = dataType;
	    }
	});

	Object.defineProperty(Column.prototype, 'unique', {
	    get: function get() {
	        return this.document.unique;
	    },
	    set: function set(unique) {
	        this.document.unique = unique;
	    }
	});

	Object.defineProperty(Column.prototype, 'relatedTo', {
	    get: function get() {
	        return this.document.relatedTo;
	    },
	    set: function set(relatedTo) {
	        this.document.relatedTo = relatedTo;
	    }
	});

	Object.defineProperty(Column.prototype, 'required', {
	    get: function get() {
	        return this.document.required;
	    },
	    set: function set(required) {
	        this.document.required = required;
	    }
	});

	Object.defineProperty(Column.prototype, 'defaultValue', {
	    get: function get() {
	        return this.document.defaultValue;
	    },
	    set: function set(defaultValue) {

	        if (typeof defaultValue === 'string') {
	            var supportedStringDataTypes = ['Text', 'EncryptedText'];
	            if (supportedStringDataTypes.indexOf(this.document.dataType) > -1) {
	                this.document.defaultValue = defaultValue;
	            } else if (this.document.dataType === 'URL') {
	                if (defaultValue.match(/^(http:\/\/www\.|https:\/\/www\.|http:\/\/|https:\/\/)[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,5}(:[0-9]{1,5})?(\/.*)?$/i)[0] === defaultValue) {
	                    this.document.defaultValue = defaultValue;
	                } else {
	                    throw new TypeError("Invalid URL");
	                }
	            } else if (this.document.dataType === 'Email') {
	                if (defaultValue.match(/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/i)[0] === defaultValue) {
	                    this.document.defaultValue = defaultValue;
	                } else {
	                    throw new TypeError("Invalid Email");
	                }
	            } else if (this.document.dataType === 'DateTime') {
	                if (new Date(defaultValue) == 'Invalid Date') {
	                    throw new TypeError("Invalid default value for DateTime Field");
	                }
	                this.document.defaultValue = defaultValue;
	            } else {
	                throw new TypeError("Unsupported DataType");
	            }
	        } else if (defaultValue !== null && ['number', 'boolean', 'object', 'undefined'].indexOf(typeof defaultValue === 'undefined' ? 'undefined' : _typeof(defaultValue)) > -1) {
	            if (this.document.dataType.toUpperCase() === (typeof defaultValue === 'undefined' ? 'undefined' : _typeof(defaultValue)).toUpperCase()) {
	                this.document.defaultValue = defaultValue;
	            } else {
	                throw new TypeError("Unsupported DataType");
	            }
	        } else if (defaultValue === null) {
	            this.document.defaultValue = defaultValue;
	        } else {
	            throw new TypeError("Unsupported DataType");
	        }
	    }
	});

	Object.defineProperty(Column.prototype, 'editableByMasterKey', {
	    get: function get() {
	        return this.document.editableByMasterKey;
	    },
	    set: function set(editableByMasterKey) {
	        this.document.editableByMasterKey = editableByMasterKey;
	    }
	});

	Object.defineProperty(Column.prototype, 'isSearchable', {
	    get: function get() {
	        return this.document.isSearchable;
	    },
	    set: function set(isSearchable) {
	        this.document.isSearchable = isSearchable;
	    }
	});

	_CB2.default.Column = Column;

	exports.default = _CB2.default.Column;

/***/ },
/* 77 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	var _CB = __webpack_require__(1);

	var _CB2 = _interopRequireDefault(_CB);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	/*
	  CloudTable
	 */
	var CloudTable = function () {
	    function CloudTable(tableName) {
	        _classCallCheck(this, CloudTable);

	        _CB2.default._tableValidation(tableName);
	        this.document = {};
	        this.document.name = tableName;
	        this.document.appId = _CB2.default.appId;
	        this.document._type = 'table';
	        this.document.isEditableByClientKey = false;

	        if (tableName.toLowerCase() === "user") {
	            this.document.type = "user";
	            this.document.maxCount = 1;
	        } else if (tableName.toLowerCase() === "role") {
	            this.document.type = "role";
	            this.document.maxCount = 1;
	        } else if (tableName.toLowerCase() === "device") {
	            this.document.type = "device";
	            this.document.maxCount = 1;
	        } else {
	            this.document.type = "custom";
	            this.document.maxCount = 9999;
	        }
	        this.document.columns = _CB2.default._defaultColumns(this.document.type);
	    }

	    _createClass(CloudTable, [{
	        key: 'addColumn',
	        value: function addColumn(column) {
	            if (Object.prototype.toString.call(column) === '[object String]') {
	                var obj = new _CB2.default.Column(column);
	                column = obj;
	            }
	            if (Object.prototype.toString.call(column) === '[object Object]') {
	                if (_CB2.default._columnValidation(column, this)) this.document.columns.push(column);
	            } else if (Object.prototype.toString.call(column) === '[object Array]') {
	                for (var i = 0; i < column.length; i++) {
	                    if (_CB2.default._columnValidation(column[i], this)) this.document.columns.push(column[i]);
	                }
	            }
	        }
	    }, {
	        key: 'getColumn',
	        value: function getColumn(columnName) {
	            if (Object.prototype.toString.call(columnName) !== '[object String]') {
	                throw "Should enter a columnName";
	            }
	            var columns = this.document.columns;
	            for (var i = 0; i < columns.length; i++) {
	                if (columns[i].name === columnName) return columns[i];
	            }
	            throw "Column Does Not Exists";
	        }
	    }, {
	        key: 'updateColumn',
	        value: function updateColumn(column) {
	            if (Object.prototype.toString.call(column) === '[object Object]') {
	                if (_CB2.default._columnValidation(column, this)) {
	                    var columns = this.document.columns;
	                    for (var i = 0; i < columns.length; i++) {
	                        if (columns[i].name === column.name) {
	                            columns[i] = column;
	                            this.document.columns = columns;
	                            break;
	                        }
	                    }
	                } else {
	                    throw "Invalid Column";
	                }
	            } else {
	                throw "Invalid Column";
	            }
	        }
	    }, {
	        key: 'deleteColumn',
	        value: function deleteColumn(column) {
	            if (Object.prototype.toString.call(column) === '[object String]') {
	                var obj = new _CB2.default.Column(column);
	                column = obj;
	            }
	            if (Object.prototype.toString.call(column) === '[object Object]') {
	                if (_CB2.default._columnValidation(column, this)) {
	                    var arr = [];
	                    for (var i = 0; i < this.columns.length; i++) {
	                        if (this.columns[i].name !== column.name) arr.push(this.columns[i]);
	                    }
	                    this.document.columns = arr;
	                }
	            } else if (Object.prototype.toString.call(column) === '[object Array]') {
	                var arr = [];
	                for (var i = 0; i < column.length; i++) {
	                    if (_CB2.default._columnValidation(column[i], this)) {
	                        for (var i = 0; i < this.columns.length; i++) {
	                            if (this.columns[i].name !== column[i].name) arr.push(this.columns[i]);
	                        }
	                        this.document.columns = arr;
	                    }
	                }
	            }
	        }
	    }, {
	        key: 'delete',

	        /**
	         * Deletes a table from database.
	         *
	         * @param table
	         * @param callback
	         * @returns {*}
	         */

	        value: function _delete(callback) {
	            _CB2.default._validate();

	            var def;
	            if (!callback) {
	                def = new _CB2.default.Promise();
	            }

	            var params = JSON.stringify({
	                key: _CB2.default.appKey,
	                name: this.name,
	                method: "DELETE"
	            });

	            var thisObj = this;

	            var url = _CB2.default.apiUrl + '/app/' + _CB2.default.appId + "/" + this.name;

	            _CB2.default._request('PUT', url, params, true).then(function (response) {
	                if (callback) {
	                    callback.success(thisObj);
	                } else {
	                    def.resolve(thisObj);
	                }
	            }, function (err) {
	                if (callback) {
	                    callback.error(err);
	                } else {
	                    def.reject(err);
	                }
	            });

	            if (!callback) {
	                return def.promise;
	            }
	        }

	        /**
	         * Saves a table
	         *
	         * @param callback
	         * @returns {*}
	         */

	    }, {
	        key: 'save',
	        value: function save(callback) {
	            var def;
	            if (!callback) {
	                def = new _CB2.default.Promise();
	            }
	            _CB2.default._validate();
	            var thisObj = this;
	            var params = JSON.stringify({
	                key: _CB2.default.appKey,
	                data: _CB2.default.toJSON(thisObj)
	            });

	            var thisObj = this;

	            var url = _CB2.default.apiUrl + '/app/' + _CB2.default.appId + "/" + thisObj.document.name;

	            _CB2.default._request('PUT', url, params, true).then(function (response) {
	                response = JSON.parse(response);
	                thisObj = _CB2.default.fromJSON(response);
	                if (callback) {
	                    callback.success(thisObj);
	                } else {
	                    def.resolve(thisObj);
	                }
	            }, function (err) {
	                if (callback) {
	                    callback.error(err);
	                } else {
	                    def.reject(err);
	                }
	            });

	            if (!callback) {
	                return def.promise;
	            }
	        }
	    }]);

	    return CloudTable;
	}();

	Object.defineProperty(CloudTable.prototype, 'columns', {
	    get: function get() {
	        return this.document.columns;
	    }
	});

	Object.defineProperty(CloudTable.prototype, 'name', {
	    get: function get() {
	        return this.document.name;
	    },
	    set: function set() {
	        throw "You can not rename a table";
	    }
	});

	Object.defineProperty(CloudTable.prototype, 'id', {
	    get: function get() {
	        return this.document._id;
	    }
	});

	Object.defineProperty(CloudTable.prototype, 'isEditableByClientKey', {
	    get: function get() {
	        return this.document.isEditableByClientKey;
	    },
	    set: function set(isEditableByClientKey) {
	        this.document.isEditableByClientKey = isEditableByClientKey;
	    }
	});

	_CB2.default.CloudTable = CloudTable;

	/**
	 * Gets All the Tables from an App
	 *
	 * @param callback
	 * @returns {*}
	 */

	_CB2.default.CloudTable.getAll = function (callback) {
	    if (!_CB2.default.appId) {
	        throw "CB.appId is null.";
	    }

	    var def;
	    if (!callback) {
	        def = new _CB2.default.Promise();
	    }

	    var params = JSON.stringify({
	        key: _CB2.default.appKey
	    });

	    var url = _CB2.default.apiUrl + '/app/' + _CB2.default.appId + "/_getAll";
	    _CB2.default._request('POST', url, params, true).then(function (response) {
	        response = JSON.parse(response);
	        var obj = _CB2.default.fromJSON(response);
	        if (callback) {
	            callback.success(obj);
	        } else {
	            def.resolve(obj);
	        }
	    }, function (err) {
	        if (callback) {
	            callback.error(err);
	        } else {
	            def.reject(err);
	        }
	    });
	    if (!callback) {
	        return def.promise;
	    }
	};

	/**
	 * Gets a table
	 *
	 * @param table
	 *  It is the CloudTable object
	 * @param callback
	 * @returns {*}
	 */

	_CB2.default.CloudTable.get = function (table, callback) {
	    if (Object.prototype.toString.call(table) === '[object String]') {
	        var obj = new this(table);
	        table = obj;
	    }
	    if (Object.prototype.toString.call(table) === '[object Object]') {
	        {
	            if (!_CB2.default.appId) {
	                throw "CB.appId is null.";
	            }

	            var def;
	            if (!callback) {
	                def = new _CB2.default.Promise();
	            }

	            var params = JSON.stringify({
	                key: _CB2.default.appKey,
	                appId: _CB2.default.appId
	            });

	            var url = _CB2.default.apiUrl + '/app/' + _CB2.default.appId + "/" + table.document.name;
	            _CB2.default._request('POST', url, params, true).then(function (response) {
	                if (response === "null" || response === "") {
	                    obj = null;
	                } else {
	                    response = JSON.parse(response);
	                    var obj = _CB2.default.fromJSON(response);
	                }
	                if (callback) {
	                    callback.success(obj);
	                } else {
	                    def.resolve(obj);
	                }
	            }, function (err) {
	                if (callback) {
	                    callback.error(err);
	                } else {
	                    def.reject(err);
	                }
	            });
	            if (!callback) {
	                return def.promise;
	            }
	        }
	    } else if (Object.prototype.toString.call(table) === '[object Array]') {
	        throw "cannot fetch array of tables";
	    }
	};

	exports.default = _CB2.default.CloudTable;

/***/ },
/* 78 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});

	var _CB = __webpack_require__(1);

	var _CB2 = _interopRequireDefault(_CB);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	_CB2.default.ACL = function () {
	    //constructor for ACL class
	    this.document = {};
	    this.document['read'] = { "allow": { "user": ['all'], "role": [] }, "deny": { "user": [], "role": [] } }; //by default allow read access to "all"
	    this.document['write'] = { "allow": { "user": ['all'], "role": [] }, "deny": { "user": [], "role": [] } }; //by default allow write access to "all"
	    this.parent = null;
	};
	_CB2.default.ACL.prototype.setPublicWriteAccess = function (value) {
	    //for setting the public write access
	    if (value) {
	        //If asked to allow public write access
	        this.document['write']['allow']['user'] = ['all'];
	    } else {
	        var index = this.document['write']['allow']['user'].indexOf('all');
	        if (index > -1) {
	            this.document['write']['allow']['user'].splice(index, 1); //remove the "all" value from the "write" array of "this" object
	        }
	    }

	    if (this.parent) {
	        _CB2.default._modified(this.parent, 'ACL');
	    }
	};
	_CB2.default.ACL.prototype.setPublicReadAccess = function (value) {
	    //for setting the public read access

	    if (value) {
	        //If asked to allow public read access
	        this.document['read']['allow']['user'] = ['all'];
	    } else {
	        var index = this.document['read']['allow']['user'].indexOf('all');
	        if (index > -1) {
	            this.document['read']['allow']['user'].splice(index, 1); //remove the "all" value from the "read" array of "this" object
	        }
	    }

	    if (this.parent) {
	        _CB2.default._modified(this.parent, 'ACL');
	    }
	};
	_CB2.default.ACL.prototype.setUserWriteAccess = function (userId, value) {
	    //for setting the user write access

	    if (value) {
	        //If asked to allow user write access
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

	    if (this.parent) {
	        _CB2.default._modified(this.parent, 'ACL');
	    }
	};
	_CB2.default.ACL.prototype.setUserReadAccess = function (userId, value) {
	    //for setting the user read access

	    if (value) {
	        //If asked to allow user read access
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

	    if (this.parent) {
	        _CB2.default._modified(this.parent, 'ACL');
	    }
	};
	_CB2.default.ACL.prototype.setRoleWriteAccess = function (roleId, value) {

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

	    if (this.parent) {
	        _CB2.default._modified(this.parent, 'ACL');
	    }
	};
	_CB2.default.ACL.prototype.setRoleReadAccess = function (roleId, value) {

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

	    if (this.parent) {
	        _CB2.default._modified(this.parent, 'ACL');
	    }
	};

	exports.default = _CB2.default.ACL;

/***/ },
/* 79 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	var _CB = __webpack_require__(1);

	var _CB2 = _interopRequireDefault(_CB);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	/*
	 *CloudGeoPoint
	 */

	var CloudGeoPoint = function () {
	    function CloudGeoPoint(longitude, latitude) {
	        _classCallCheck(this, CloudGeoPoint);

	        if (!latitude && latitude !== 0 || !longitude && longitude !== 0) throw "Latitude or Longitude is empty.";

	        if (isNaN(latitude)) throw "Latitude " + latitude + " is not a number type.";

	        if (isNaN(longitude)) throw "Longitude " + longitude + " is not a number type.";

	        this.document = {};
	        this.document._type = "point";
	        this.document._isModified = true;
	        //The default datum for an earth-like sphere is WGS84. Coordinate-axis order is longitude, latitude.
	        if (Number(latitude) >= -90 && Number(latitude) <= 90 && Number(longitude) >= -180 && Number(longitude) <= 180) {
	            this.document.coordinates = [Number(longitude), Number(latitude)];
	            this.document.latitude = Number(latitude);
	            this.document.longitude = Number(longitude);
	        } else {
	            throw "latitude and longitudes are not in range";
	        }
	    }

	    _createClass(CloudGeoPoint, [{
	        key: "get",
	        value: function get(name) {
	            //for getting data of a particular column

	            return this.document[name];
	        }
	    }, {
	        key: "set",
	        value: function set(name, value) {
	            //for getting data of a particular column

	            if (name === 'latitude') {
	                if (Number(value) >= -90 && Number(value) <= 90) {
	                    this.document.latitude = Number(value);
	                    this.document.coordinates[1] = Number(value);
	                    this.document._isModified = true;
	                } else throw "Latitude is not in Range";
	            } else {
	                if (Number(value) >= -180 && Number(value) <= 180) {
	                    this.document.longitude = Number(value);
	                    this.document.coordinates[0] = Number(value);
	                    this.document._isModified = true;
	                } else throw "Latitude is not in Range";
	            }
	        }
	    }, {
	        key: "distanceInKMs",
	        value: function distanceInKMs(point) {

	            var earthRedius = 6371; //in Kilometer
	            return earthRedius * greatCircleFormula(this, point);
	        }
	    }, {
	        key: "distanceInMiles",
	        value: function distanceInMiles(point) {

	            var earthRedius = 3959; // in Miles
	            return earthRedius * greatCircleFormula(this, point);
	        }
	    }, {
	        key: "distanceInRadians",
	        value: function distanceInRadians(point) {

	            return greatCircleFormula(this, point);
	        }
	    }]);

	    return CloudGeoPoint;
	}();

	Object.defineProperty(CloudGeoPoint.prototype, 'latitude', {
	    get: function get() {
	        return this.document.coordinates[1];
	    },
	    set: function set(latitude) {
	        if (Number(latitude) >= -90 && Number(latitude) <= 90) {
	            this.document.latitude = Number(latitude);
	            this.document.coordinates[1] = Number(latitude);
	            this.document._isModified = true;
	        } else throw "Latitude is not in Range";
	    }
	});

	Object.defineProperty(CloudGeoPoint.prototype, 'longitude', {
	    get: function get() {
	        return this.document.coordinates[0];
	    },
	    set: function set(longitude) {
	        if (Number(longitude) >= -180 && Number(longitude) <= 180) {
	            this.document.longitude = Number(longitude);
	            this.document.coordinates[0] = Number(longitude);
	            this.document._isModified = true;
	        } else throw "Longitude is not in Range";
	    }
	});

	function greatCircleFormula(thisObj, point) {

	    var dLat = (thisObj.document.coordinates[1] - point.document.coordinates[1]).toRad();
	    var dLon = (thisObj.document.coordinates[0] - point.document.coordinates[0]).toRad();
	    var lat1 = point.document.coordinates[1].toRad();
	    var lat2 = thisObj.document.coordinates[1].toRad();
	    var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
	    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
	    return c;
	}

	if (typeof Number.prototype.toRad === "undefined") {
	    Number.prototype.toRad = function () {
	        return this * Math.PI / 180;
	    };
	}

	_CB2.default.CloudGeoPoint = _CB2.default.CloudGeoPoint || CloudGeoPoint;

	exports.default = _CB2.default.CloudGeoPoint;

/***/ },
/* 80 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});

	var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	var _CB = __webpack_require__(1);

	var _CB2 = _interopRequireDefault(_CB);

	var _localforage = __webpack_require__(73);

	var _localforage2 = _interopRequireDefault(_localforage);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	/*
	 CloudObject
	 */
	var CloudObject = function () {
	    function CloudObject(tableName, id) {
	        _classCallCheck(this, CloudObject);

	        //object for documents
	        this.document = {};
	        this.document._tableName = tableName; //the document object
	        this.document.ACL = new _CB2.default.ACL(); //ACL(s) of the document
	        this.document._type = 'custom';
	        this.document.expires = null;
	        this.document._hash = _CB2.default._generateHash();

	        if (!id) {
	            this.document._modifiedColumns = ['createdAt', 'updatedAt', 'ACL', 'expires'];
	            this.document._isModified = true;
	        } else {
	            this.document._modifiedColumns = [];
	            this.document._isModified = false;
	            this.document._id = id;
	        }
	    }

	    _createClass(CloudObject, [{
	        key: 'set',

	        /* RealTime implementation ends here.  */

	        value: function set(columnName, data) {
	            //for setting data for a particular column

	            var keywords = ['_tableName', '_type', 'operator'];

	            if (columnName === 'id' || columnName === '_id') throw "You cannot set the id of a CloudObject";

	            if (columnName === 'id') columnName = '_' + columnName;

	            if (keywords.indexOf(columnName) > -1) {
	                throw columnName + " is a keyword. Please choose a different column name.";
	            }
	            this.document[columnName] = data;
	            _CB2.default._modified(this, columnName);
	        }
	    }, {
	        key: 'relate',
	        value: function relate(columnName, objectTableName, objectId) {
	            //for setting data for a particular column

	            var keywords = ['_tableName', '_type', 'operator'];

	            if (columnName === 'id' || columnName === '_id') throw "You cannot set the id of a CloudObject";

	            if (columnName === 'id') throw "You cannot link an object to this column";

	            if (keywords.indexOf(columnName) > -1) {
	                throw columnName + " is a keyword. Please choose a different column name.";
	            }

	            this.document[columnName] = new _CB2.default.CloudObject(objectTableName, objectId);
	            _CB2.default._modified(this, columnName);
	        }
	    }, {
	        key: 'get',
	        value: function get(columnName) {
	            //for getting data of a particular column

	            if (columnName === 'id') columnName = '_' + columnName;

	            return this.document[columnName];
	        }
	    }, {
	        key: 'unset',
	        value: function unset(columnName) {
	            //to unset the data of the column
	            this.document[columnName] = null;
	            _CB2.default._modified(this, columnName);
	        }
	    }, {
	        key: 'save',


	        /**
	         * Saved CloudObject in Database.
	         * @param callback
	         * @returns {*}
	         */

	        value: function save(callback) {
	            //save the document to the db
	            var def;
	            _CB2.default._validate();

	            if (!callback) {
	                def = new _CB2.default.Promise();
	            }
	            var thisObj = this;
	            _CB2.default._fileCheck(this).then(function (thisObj) {

	                var params = JSON.stringify({ document: _CB2.default.toJSON(thisObj), key: _CB2.default.appKey });
	                var url = _CB2.default.apiUrl + "/data/" + _CB2.default.appId + '/' + thisObj.document._tableName;
	                _CB2.default._request('PUT', url, params).then(function (response) {
	                    thisObj = _CB2.default.fromJSON(JSON.parse(response), thisObj);
	                    if (callback) {
	                        callback.success(thisObj);
	                    } else {
	                        def.resolve(thisObj);
	                    }
	                }, function (err) {
	                    if (callback) {
	                        callback.error(err);
	                    } else {
	                        def.reject(err);
	                    }
	                });
	            }, function (err) {
	                if (callback) {
	                    callback.error(err);
	                } else {
	                    def.reject(err);
	                }
	            });
	            if (!callback) {
	                return def.promise;
	            }
	        }
	    }, {
	        key: 'pin',
	        value: function pin(callback) {
	            //pins the document to the local store
	            _CB2.default.CloudObject.pin(this, callback);
	        }
	    }, {
	        key: 'unPin',
	        value: function unPin(callback) {
	            //pins the document to the local store
	            _CB2.default.CloudObject.unPin(this, callback);
	        }
	    }, {
	        key: 'saveEventually',
	        value: function saveEventually(callback) {

	            var thisObj = this;
	            var def;
	            if (!callback) {
	                def = new _CB2.default.Promise();
	            }
	            _CB2.default._validate();
	            _localforage2.default.getItem('cb-saveEventually-' + _CB2.default.appId).then(function (value) {
	                var arr = [];
	                if (value) arr = value;
	                arr.push({ saved: false, document: _CB2.default.toJSON(thisObj) });
	                _localforage2.default.setItem('cb-saveEventually-' + _CB2.default.appId, arr).then(function (value) {
	                    CloudObject.pin(thisObj, {
	                        success: function success(obj) {
	                            if (!callback) {
	                                def.resolve(value);
	                            } else {
	                                callback.success(value);
	                            }
	                        },
	                        error: function error(err) {
	                            if (!callback) {
	                                def.reject(err);
	                            } else {
	                                callback.error(err);
	                            }
	                        }
	                    });
	                }).catch(function (err) {
	                    if (!callback) {
	                        def.reject(err);
	                    } else {
	                        callback.error(err);
	                    }
	                });
	            }).catch(function (err) {
	                if (!callback) {
	                    def.reject(err);
	                } else {
	                    callback.error(err);
	                }
	            });
	            if (!callback) {
	                return def.promise;
	            }
	        }
	    }, {
	        key: 'disableSync',
	        value: function disableSync(callback) {
	            _CB2.default.CloudObject.disableSync(this.document, callback);
	        }
	    }, {
	        key: 'fetch',
	        value: function fetch(callback) {
	            //fetch the document from the db
	            if (!_CB2.default.appId) {
	                throw "CB.appId is null.";
	            }
	            if (!this.document._id) {
	                throw "Can't fetch an object which is not saved.";
	            }
	            var thisObj = this;
	            var def;
	            if (!callback) {
	                def = new _CB2.default.Promise();
	            }
	            var query = null;
	            if (thisObj.document._type === 'file') {
	                query = new _CB2.default.CloudQuery('_File');
	            } else {
	                query = new _CB2.default.CloudQuery(thisObj.document._tableName);
	            }
	            query.findById(thisObj.get('id')).then(function (res) {
	                if (!callback) {
	                    def.resolve(res);
	                } else {
	                    callback.success(res);
	                }
	            }, function (err) {
	                if (!callback) {
	                    def.reject(err);
	                } else {
	                    callback.error(err);
	                }
	            });

	            if (!callback) {
	                return def.promise;
	            }
	        }
	    }, {
	        key: 'delete',
	        value: function _delete(callback) {
	            //delete an object matching the objectId
	            if (!_CB2.default.appId) {
	                throw "CB.appId is null.";
	            }
	            if (!this.document._id) {
	                throw "You cannot delete an object which is not saved.";
	            }
	            var thisObj = this;
	            var def;
	            if (!callback) {
	                def = new _CB2.default.Promise();
	            }

	            var params = JSON.stringify({ key: _CB2.default.appKey, document: _CB2.default.toJSON(thisObj), method: "DELETE" });

	            var url = _CB2.default.apiUrl + "/data/" + _CB2.default.appId + '/' + thisObj.document._tableName;

	            _CB2.default._request('PUT', url, params).then(function (response) {
	                thisObj = _CB2.default.fromJSON(JSON.parse(response), thisObj);
	                if (callback) {
	                    callback.success(thisObj);
	                } else {
	                    def.resolve(thisObj);
	                }
	            }, function (err) {
	                if (callback) {
	                    callback.error(err);
	                } else {
	                    def.reject(err);
	                }
	            });

	            if (!callback) {
	                return def.promise;
	            }
	        }
	    }]);

	    return CloudObject;
	}();

	Object.defineProperty(CloudObject.prototype, 'ACL', {
	    get: function get() {
	        return this.document.ACL;
	    },
	    set: function set(ACL) {
	        this.document.ACL = ACL;
	        this.document.ACL.parent = this;
	        _CB2.default._modified(this, 'ACL');
	    }
	});

	Object.defineProperty(CloudObject.prototype, 'id', {
	    get: function get() {
	        return this.document._id;
	    }
	});

	Object.defineProperty(CloudObject.prototype, 'createdAt', {
	    get: function get() {
	        return this.document.createdAt;
	    }
	});

	Object.defineProperty(CloudObject.prototype, 'updatedAt', {
	    get: function get() {
	        return this.document.updatedAt;
	    }
	});

	/* For Expire of objects */
	Object.defineProperty(CloudObject.prototype, 'expires', {
	    get: function get() {
	        return this.document.expires;
	    },
	    set: function set(expires) {
	        this.document.expires = expires;
	        _CB2.default._modified(this, 'expires');
	    }
	});

	/* This is Real time implementation of CloudObjects */
	CloudObject.on = function (tableName, eventType, cloudQuery, callback, done) {

	    if (_CB2.default._isRealtimeDisabled) {
	        throw "Realtime is disbaled for this app.";
	    }

	    var def;

	    //shift variables.
	    if (cloudQuery && !(cloudQuery instanceof _CB2.default.CloudQuery)) {
	        //this is a function.
	        if (callback !== null && (typeof callback === 'undefined' ? 'undefined' : _typeof(callback)) === 'object') {
	            //callback is actually done.
	            done = callback;
	            callback = null;
	        }
	        callback = cloudQuery;
	        cloudQuery = null;
	    }

	    if (!done) {
	        def = new _CB2.default.Promise();
	    }

	    //validate query.
	    if (cloudQuery && cloudQuery instanceof _CB2.default.CloudQuery) {

	        if (cloudQuery.tableName !== tableName) {
	            throw "CloudQuery TableName and CloudNotification TableName should be same.";
	        }

	        if (cloudQuery.query) {
	            if (cloudQuery.query.$include.length > 0) {
	                throw "Include with CloudNotificaitons is not supported right now.";
	            }
	        }

	        if (Object.keys(cloudQuery.select).length > 0) {
	            throw "You cannot pass the query with select in CloudNotifications.";
	        }
	    }

	    tableName = tableName.toLowerCase();

	    if (eventType instanceof Array) {
	        //if event type is an array.
	        for (var i = 0; i < eventType.length; i++) {
	            _CB2.default.CloudObject.on(tableName, eventType[i], cloudQuery, callback);
	            if (i == eventType.length - 1) {
	                if (done && done.success) done.success();else def.resolve();
	            }
	        }
	    } else {

	        eventType = eventType.toLowerCase();
	        if (eventType === 'created' || eventType === 'updated' || eventType === 'deleted') {
	            //var timestamp = Date.now();
	            var timestamp = _CB2.default._generateHash();
	            var payload = {
	                room: (_CB2.default.appId + 'table' + tableName + eventType).toLowerCase() + timestamp,
	                sessionId: _CB2.default._getSessionId(),
	                data: {
	                    query: cloudQuery,
	                    timestamp: timestamp,
	                    eventType: eventType,
	                    appKey: _CB2.default.appKey
	                }
	            };

	            _CB2.default.Socket.emit('join-object-channel', payload);
	            _CB2.default.Socket.on(payload.room, function (data) {
	                //listen to events in custom channel.
	                data = JSON.parse(data);
	                data = _CB2.default.fromJSON(data);
	                if (cloudQuery && cloudQuery instanceof _CB2.default.CloudQuery && _CB2.default.CloudObject._validateNotificationQuery(data, cloudQuery)) callback(data);else if (!cloudQuery) callback(data);
	            });

	            if (done && done.success) done.success();else def.resolve();
	        } else {
	            throw 'created, updated, deleted are supported notification types.';
	        }
	    }

	    if (!done) {
	        return def.promise;
	    }
	};

	CloudObject.off = function (tableName, eventType, done) {

	    if (_CB2.default._isRealtimeDisabled) {
	        throw "Realtime is disbaled for this app.";
	    }

	    var def;

	    if (!done) {
	        def = new _CB2.default.Promise();
	    }

	    tableName = tableName.toLowerCase();

	    if (eventType instanceof Array) {
	        //if event type is an array.
	        for (var i = 0; i < eventType.length; i++) {
	            _CB2.default.CloudObject.off(tableName, eventType[i]);
	            if (i == eventType.length - 1) {
	                if (done && done.success) done.success();else def.resolve();
	            }
	        }
	    } else {

	        eventType = eventType.toLowerCase();
	        //        var timestamp = Date.now();
	        var timestamp = _CB2.default._generateHash();
	        if (eventType === 'created' || eventType === 'updated' || eventType === 'deleted') {
	            _CB2.default.Socket.emit('leave-object-channel', {
	                event: (_CB2.default.appId + 'table' + tableName + eventType).toLowerCase(),
	                timestamp: timestamp,
	                eventType: eventType
	            });
	            _CB2.default.Socket.on('leave' + (_CB2.default.appId + 'table' + tableName + eventType).toLowerCase() + timestamp, function (data) {
	                _CB2.default.Socket.removeAllListeners((_CB2.default.appId + 'table' + tableName + eventType).toLowerCase() + data);
	            });
	            if (done && done.success) done.success();else def.resolve();
	        } else {
	            throw 'created, updated, deleted are supported notification types.';
	        }
	    }

	    if (!done) {
	        return def.promise;
	    }
	};

	CloudObject.saveAll = function (array, callback) {

	    if (!array || array.constructor !== Array) {
	        throw "Array of CloudObjects is Null";
	    }

	    for (var i = 0; i < array.length; i++) {
	        if (!(array[i] instanceof _CB2.default.CloudObject)) {
	            throw "Should Be an Array of CloudObjects";
	        }
	    }

	    var def;
	    if (!callback) {
	        def = new _CB2.default.Promise();
	    }

	    _CB2.default._bulkObjFileCheck(array).then(function () {

	        var params = JSON.stringify({ document: _CB2.default.toJSON(array), key: _CB2.default.appKey });
	        var url = _CB2.default.apiUrl + "/data/" + _CB2.default.appId + '/' + array[0]._tableName;
	        _CB2.default._request('PUT', url, params).then(function (response) {
	            var thisObj = _CB2.default.fromJSON(JSON.parse(response));
	            if (callback) {
	                callback.success(thisObj);
	            } else {
	                def.resolve(thisObj);
	            }
	        }, function (err) {
	            if (callback) {
	                callback.error(err);
	            } else {
	                def.reject(err);
	            }
	        });
	    }, function (err) {
	        if (callback) {
	            callback.error(err);
	        } else {
	            def.reject(err);
	        }
	    });

	    if (!callback) {
	        return def.promise;
	    }
	};

	CloudObject.deleteAll = function (array, callback) {

	    if (!array && array.constructor !== Array) {
	        throw "Array of CloudObjects is Null";
	    }

	    for (var i = 0; i < array.length; i++) {
	        if (!(array[i] instanceof _CB2.default.CloudObject)) {
	            throw "Should Be an Array of CloudObjects";
	        }
	    }

	    var def;
	    if (!callback) {
	        def = new _CB2.default.Promise();
	    }

	    var params = JSON.stringify({ document: _CB2.default.toJSON(array), key: _CB2.default.appKey, method: "DELETE" });
	    var url = _CB2.default.apiUrl + "/data/" + _CB2.default.appId + '/' + array[0]._tableName;
	    _CB2.default._request('PUT', url, params).then(function (response) {
	        var thisObj = _CB2.default.fromJSON(JSON.parse(response));
	        if (callback) {
	            callback.success(thisObj);
	        } else {
	            def.resolve(thisObj);
	        }
	    }, function (err) {
	        if (callback) {
	            callback.error(err);
	        } else {
	            def.reject(err);
	        }
	    });

	    if (!callback) {
	        return def.promise;
	    }
	};

	CloudObject.pin = function (cloudObjects, callback) {

	    if (!cloudObjects) throw "cloudObject(s) is required.";
	    var def;
	    if (!callback) def = new _CB2.default.Promise();
	    _CB2.default._validate();
	    if (!(cloudObjects instanceof Array)) {
	        cloudObjects = [cloudObjects];
	        CloudObject.pin(cloudObjects, callback);
	    } else {
	        var groupedObjects = _groupObjects(cloudObjects);
	        groupedObjects.forEach(function (object) {
	            var arr = [];
	            _localforage2.default.getItem(_CB2.default.appId + '-' + object.tableName).then(function (value) {
	                if (value) arr = value;
	                _localforage2.default.setItem(_CB2.default.appId + '-' + object.tableName, arr.concat(object.object)).then(function (value) {
	                    if (!callback) {
	                        def.resolve(value);
	                    } else {
	                        callback.success(value);
	                    }
	                }).catch(function (err) {
	                    if (!callback) {
	                        def.reject(err);
	                    } else {
	                        callback.error(err);
	                    }
	                });
	            }).catch(function (err) {
	                if (!callback) {
	                    def.reject(err);
	                } else {
	                    callback.error(err);
	                }
	            });
	        });
	    }
	    if (!callback) {
	        return def.promise;
	    }
	};

	CloudObject.unPin = function (cloudObjects, callback) {

	    if (!cloudObjects) throw "cloudObject(s) is required.";
	    var def;
	    if (!callback) def = new _CB2.default.Promise();
	    _CB2.default._validate();
	    if (!(cloudObjects instanceof Array)) {
	        cloudObjects = [cloudObjects];
	        CloudObject.unPin(cloudObjects);
	    } else {
	        var groupedObjects = _groupObjects(cloudObjects);
	        groupedObjects.forEach(function (object) {
	            _localforage2.default.getItem(_CB2.default.appId + '-' + object.tableName).then(function (objects) {
	                var arr = [];
	                objects.forEach(function (obj) {
	                    object.object.forEach(function (cloudObject) {
	                        if (cloudObject._hash != obj._hash) {
	                            arr.push(obj);
	                        }
	                    });
	                });
	                _localforage2.default.setItem(_CB2.default.appId + '-' + object.tableName, arr).then(function (obj) {
	                    if (!callback) {
	                        def.resolve(obj);
	                    } else {
	                        callback.success(obj);
	                    }
	                }).catch(function (err) {
	                    if (!callback) {
	                        def.reject(err);
	                    } else {
	                        callback.error(err);
	                    }
	                });
	            }).catch(function (err) {
	                if (!callback) {
	                    def.reject(err);
	                } else {
	                    callback.error(err);
	                }
	            });
	        });
	    }
	    if (!callback) {
	        return def.promise;
	    }
	};

	CloudObject.clearLocalStore = function (callback) {
	    _CB2.default._validate();
	    var def;
	    if (!callback) def = new _CB2.default.Promise();
	    _localforage2.default.clear().then(function () {
	        if (!callback) {
	            def.resolve();
	        } else {
	            callback.success();
	        }
	    }).catch(function (err) {
	        if (!callback) {
	            def.reject(err);
	        } else {
	            callback.error(err);
	        }
	    });
	    if (!callback) {
	        return def.promise;
	    }
	};

	function _groupObjects(objects) {
	    var groups = {};
	    for (var i = 0; i < objects.length; i++) {
	        if (!(objects[i] instanceof _CB2.default.CloudObject)) {
	            throw "Should Be an instance of CloudObjects";
	        }
	        var groupName = objects[i].document._tableName;
	        if (!groups[groupName]) {
	            groups[groupName] = [];
	        }
	        groups[groupName].push(objects[i].document);
	    }
	    objects = [];
	    for (var groupName in groups) {
	        objects.push({ tableName: groupName, object: groups[groupName] });
	    }
	    return objects;
	}

	CloudObject.sync = function (callback) {

	    var def;
	    if (!callback) def = new _CB2.default.Promise();
	    _CB2.default._validate();
	    if (_CB2.default.CloudApp._isConnected) {
	        _localforage2.default.getItem('cb-saveEventually-' + _CB2.default.appId).then(function (documents) {
	            var cloudObjects = [];
	            var count = 0;
	            var cloudObject = null;
	            if (documents) {
	                var length = documents.length;

	                documents.forEach(function (document) {
	                    length--;
	                    if (!document.saved) {
	                        cloudObject = _CB2.default.fromJSON(document.document);
	                        cloudObject.save({
	                            success: function success(obj) {
	                                count++;
	                                _CB2.default.CloudObject.disableSync(document.document, {
	                                    success: function success(obj) {
	                                        if (!callback) {
	                                            def.resolve(count);
	                                        } else {
	                                            callback.success(count);
	                                        }
	                                    },
	                                    error: function error(err) {
	                                        if (!callback) {
	                                            def.reject(err);
	                                        } else {
	                                            callback.error(err);
	                                        }
	                                    }
	                                });
	                            },
	                            error: function error(err) {
	                                if (!callback) {
	                                    def.reject(err);
	                                } else {
	                                    callback.error(err);
	                                }
	                            }
	                        });
	                    }
	                });
	            } else {
	                if (!callback) {
	                    def.resolve('Already up to date.');
	                } else {
	                    callback.success('Already up to date');
	                }
	            }
	        }).catch(function (err) {
	            if (!callback) {
	                def.reject(err);
	            } else {
	                callback.error(err);
	            }
	        });
	    } else {
	        if (!callback) {
	            def.reject('Internet connection not found.');
	        } else {
	            callback.error('Internet connection not found.');
	        }
	    }
	    if (!callback) {
	        return def.promise;
	    }
	};

	CloudObject.disableSync = function (document, callback) {

	    var def;
	    if (!callback) def = new _CB2.default.Promise();
	    _CB2.default._validate();
	    _localforage2.default.getItem('cb-saveEventually-' + _CB2.default.appId).then(function (values) {
	        var arr = [];
	        values.forEach(function (value) {
	            if (value.document._hash != document._hash) arr.push(value);
	        });
	        _localforage2.default.setItem('cb-saveEventually-' + _CB2.default.appId, arr).then(function (obj) {
	            if (!callback) {
	                def.resolve(obj);
	            } else {
	                callback.success(obj);
	            }
	        }).catch(function (err) {
	            if (!callback) {
	                def.reject(err);
	            } else {
	                callback.error(err);
	            }
	        });
	    }).catch(function (err) {
	        if (!callback) {
	            def.reject(err);
	        } else {
	            callback.error(err);
	        }
	    });
	    if (!callback) {
	        return def.promise;
	    }
	};

	/* Private Methods */
	CloudObject._validateNotificationQuery = function (cloudObject, cloudQuery) {
	    //delete an object matching the objectId

	    if (!cloudQuery) throw "CloudQuery is null";

	    if (!cloudQuery.query) throw "There is no query in CloudQuery";

	    //validate query.
	    var query = cloudQuery.query;

	    if (cloudQuery.limit === 0) return false;

	    if (cloudQuery.skip > 0) {
	        --cloudQuery.skip;
	        return false;
	    }

	    //redice limit of CloudQuery.
	    --cloudQuery.limit;
	    return true;
	};

	_CB2.default.CloudObject = CloudObject;
	exports.default = _CB2.default.CloudObject;

/***/ },
/* 81 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});

	var _CB = __webpack_require__(1);

	var _CB2 = _interopRequireDefault(_CB);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	/*
	 CloudFiles
	 */

	_CB2.default.CloudFile = _CB2.default.CloudFile || function (file, data, type, path) {
	    if (!path) path = '/' + _CB2.default.appId;
	    if (Object.prototype.toString.call(file) === '[object File]' || Object.prototype.toString.call(file) === '[object Blob]') {

	        this.fileObj = file;
	        this.document = {
	            _id: null,
	            _type: 'file',
	            _tableName: '_File',
	            ACL: new _CB2.default.ACL(),
	            name: file && file.name && file.name !== "" ? file.name : 'default.file',
	            size: file.size,
	            url: null,
	            expires: null,
	            path: path,
	            updatedAt: Date.now(),
	            createdAt: Date.now(),
	            contentType: typeof file.type !== "undefined" && file.type !== "" ? file.type : 'unknown'
	        };
	        this.document._modifiedColumns = ['name', 'updatedAt', 'ACL', 'expires', 'size', 'url', 'path', 'createdAt', 'contentType'];
	        this.document._isModified = true;
	    } else if (typeof file === "string") {
	        var regexp = RegExp("https?:\/\/(?:www\.|(?!www))[^\s\.]+\.[^\s]{2,}|www\.[^\s]+\.[^\s]{2,}");
	        if (regexp.test(file)) {
	            this.document = {
	                _id: null,
	                _type: 'file',
	                _tableName: '_File',
	                ACL: new _CB2.default.ACL(),
	                name: '',
	                size: '',
	                url: file,
	                expires: null,
	                path: path,
	                updatedAt: Date.now(),
	                createdAt: Date.now(),
	                contentType: ''
	            };
	            this.document._modifiedColumns = ['name', 'updatedAt', 'ACL', 'expires', 'size', 'url', 'path', 'createdAt', 'contentType'];
	            this.document._isModified = true;
	        } else {
	            if (data) {
	                this.data = data;
	                if (!type) {
	                    type = file.split('.')[file.split('.').length - 1];
	                }
	                this.document = {
	                    _id: null,
	                    _type: 'file',
	                    _tableName: '_File',
	                    ACL: new _CB2.default.ACL(),
	                    name: file,
	                    size: '',
	                    url: null,
	                    path: path,
	                    updatedAt: Date.now(),
	                    createdAt: Date.now(),
	                    expires: null,
	                    contentType: type
	                };
	                this.document._modifiedColumns = ['name', 'updatedAt', 'ACL', 'expires', 'size', 'url', 'path', 'createdAt', 'contentType'];
	                this.document._isModified = true;
	            } else {
	                this.document = {
	                    _id: file,
	                    _type: 'file',
	                    _tableName: '_File'
	                };
	                this.document._modifiedColumns = ['name', 'updatedAt', 'ACL', 'expires', 'size', 'url', 'path', 'createdAt', 'contentType'];
	                this.document._isModified = true;
	            }
	        }
	    }
	};

	_CB2.default.CloudFile.prototype = Object.create(_CB2.default.CloudObject.prototype);

	Object.defineProperty(_CB2.default.CloudFile.prototype, 'type', {
	    get: function get() {
	        return this.document.contentType;
	    },
	    set: function set(type) {
	        this.document.contentType = type;
	    }
	});

	Object.defineProperty(_CB2.default.CloudFile.prototype, 'url', {
	    get: function get() {
	        return this.document.url;
	    },
	    set: function set(url) {
	        this.document.url = url;
	    }
	});

	Object.defineProperty(_CB2.default.CloudFile.prototype, 'size', {
	    get: function get() {
	        return this.document.size;
	    }
	});

	Object.defineProperty(_CB2.default.CloudFile.prototype, 'name', {
	    get: function get() {
	        return this.document.name;
	    },
	    set: function set(name) {
	        this.document.name = name;
	    }
	});

	Object.defineProperty(_CB2.default.CloudFile.prototype, 'path', {
	    get: function get() {
	        return this.document.path;
	    },
	    set: function set(path) {
	        this.document.path = path;
	    }
	});

	Object.defineProperty(_CB2.default.CloudFile.prototype, 'createdAt', {
	    get: function get() {
	        return this.document.createdAt;
	    }
	});

	Object.defineProperty(_CB2.default.CloudFile.prototype, 'updatedAt', {
	    get: function get() {
	        return this.document.updatedAt;
	    }
	});
	/**
	 * Uploads File
	 *
	 * @param callback
	 * @returns {*}
	 */

	_CB2.default.CloudFile.prototype.save = function (callback) {

	    var def;

	    if (!callback) {
	        def = new _CB2.default.Promise();
	    }

	    var thisObj = this;
	    if (!this.fileObj && !this.data && this.type != 'folder' && !this.url) throw "You cannot save a file which is null";

	    if (!this.data) {
	        var params;
	        try {
	            if (!window) {
	                params = {};

	                params['fileToUpload'] = this.fileObj;
	                params['key'] = _CB2.default.appKey;
	                params['fileObj'] = JSON.stringify(_CB2.default.toJSON(thisObj));
	            } else {
	                params = new FormData();
	                params.append("fileToUpload", this.fileObj);
	                params.append("key", _CB2.default.appKey);
	                params.append("fileObj", JSON.stringify(_CB2.default.toJSON(thisObj)));
	            }
	        } catch (e) {
	            params = {};

	            params['fileToUpload'] = this.fileObj;
	            params['key'] = _CB2.default.appKey;
	            params['fileObj'] = JSON.stringify(_CB2.default.toJSON(thisObj));
	        }
	        var url = _CB2.default.apiUrl + '/file/' + _CB2.default.appId;

	        var uploadProgressCallback = null;

	        if (callback && callback.uploadProgress) {
	            uploadProgressCallback = callback.uploadProgress;
	        }

	        _CB2.default._request('POST', url, params, false, true, uploadProgressCallback).then(function (response) {
	            thisObj.document = JSON.parse(response);
	            if (callback) {
	                callback.success(thisObj);
	            } else {
	                def.resolve(thisObj);
	            }
	        }, function (err) {
	            if (callback) {
	                callback.error(err);
	            } else {
	                def.reject(err);
	            }
	        });
	    } else {
	        var data = this.data;
	        var params = JSON.stringify({ data: data, fileObj: _CB2.default.toJSON(this), key: _CB2.default.appKey });
	        var url = _CB2.default.apiUrl + '/file/' + _CB2.default.appId;
	        var uploadProgressCallback = null;

	        if (callback && callback.uploadProgress) {
	            uploadProgressCallback = callback.uploadProgress;
	        }

	        _CB2.default._request('POST', url, params, null, null, uploadProgressCallback).then(function (response) {
	            thisObj.document = JSON.parse(response);
	            delete thisObj.data;
	            if (callback) {
	                callback.success(thisObj);
	            } else {
	                def.resolve(thisObj);
	            }
	        }, function (err) {
	            if (callback) {
	                callback.error(err);
	            } else {
	                def.reject(err);
	            }
	        });
	    }

	    if (!callback) {
	        return def.promise;
	    }
	};

	/**
	 * Removes a file from Database.
	 *
	 * @param callback
	 * @returns {*}
	 */

	_CB2.default.CloudFile.prototype.delete = function (callback) {
	    var def;

	    if (!this.url) {
	        throw "You cannot delete a file which does not have an URL";
	    }
	    if (!callback) {
	        def = new _CB2.default.Promise();
	    }
	    var thisObj = this;

	    var params = JSON.stringify({ fileObj: _CB2.default.toJSON(thisObj), key: _CB2.default.appKey, method: "PUT" });
	    var url = _CB2.default.apiUrl + '/file/' + _CB2.default.appId + '/' + this.document._id;

	    _CB2.default._request('PUT', url, params).then(function (response) {
	        thisObj.url = null;
	        if (callback) {
	            callback.success(thisObj);
	        } else {
	            def.resolve(thisObj);
	        }
	    }, function (err) {
	        if (callback) {
	            callback.error(err);
	        } else {
	            def.reject(err);
	        }
	    });

	    if (!callback) {
	        return def.promise;
	    }
	};

	_CB2.default.CloudFile.prototype.getFileContent = function (callback) {

	    var def;

	    if (!this.url) {
	        throw "URL is null. Fetch this file object first using fetch()";
	    }
	    if (!callback) {
	        def = new _CB2.default.Promise();
	    }

	    var params = JSON.stringify({ key: _CB2.default.appKey });
	    var url = this.url;

	    _CB2.default._request('POST', url, params).then(function (response) {
	        if (callback) {
	            callback.success(response);
	        } else {
	            def.resolve(response);
	        }
	    }, function (err) {
	        if (callback) {
	            callback.error(err);
	        } else {
	            def.reject(err);
	        }
	    });

	    if (!callback) {
	        return def.promise;
	    }
	};

	exports.default = _CB2.default.CloudFile;

/***/ },
/* 82 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});

	var _CB = __webpack_require__(1);

	var _CB2 = _interopRequireDefault(_CB);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	/*
	 CloudRole
	 */

	var CloudRole = function CloudRole(roleName) {
	    _classCallCheck(this, CloudRole);

	    //calling the constructor.
	    if (!this.document) this.document = {};
	    this.document._tableName = 'Role';
	    this.document._type = 'role';
	    this.document.name = roleName;
	    this.document.expires = null;
	    this.document.ACL = new _CB2.default.ACL();
	    this.document.expires = null;
	    this.document._isModified = true;
	    this.document._modifiedColumns = ['createdAt', 'updatedAt', 'ACL', 'name', 'expires'];
	};

	CloudRole.prototype = Object.create(_CB2.default.CloudObject.prototype);

	Object.defineProperty(CloudRole.prototype, 'name', {
	    get: function get() {
	        return this.document.name;
	    },
	    set: function set(name) {
	        this.document.name = name;
	        _CB2.default._modified(this, name);
	    }
	});

	_CB2.default.CloudRole = _CB2.default.CloudRole || CloudRole;

	exports.default = _CB2.default.CloudRole;

/***/ },
/* 83 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});

	var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

	var _CB = __webpack_require__(1);

	var _CB2 = _interopRequireDefault(_CB);

	var _axios = __webpack_require__(50);

	var _axios2 = _interopRequireDefault(_axios);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	var os = __webpack_require__(84);
	/*
	 CloudEvent
	 */

	var CloudEvent = function CloudEvent() {
	    _classCallCheck(this, CloudEvent);
	};

	CloudEvent.track = function (name, data, type, callback) {
	    var def;
	    if ((typeof type === 'undefined' ? 'undefined' : _typeof(type)) === 'object') {
	        if (callback != null) {
	            throw '\'type\' cannot be an object.';
	        } else {
	            callback = type;
	            type = 'Custom';
	        }
	    }
	    if (!type) type = 'Custom';
	    if (!callback) def = new _CB2.default.Promise();

	    CloudEvent._getDeviceInformation({
	        success: function success(object) {
	            data['device'] = object;
	            var obj = new _CB2.default.CloudObject('_Event');
	            obj.ACL = new _CB2.default.ACL();
	            obj.ACL.setPublicReadAccess(false);
	            obj.ACL.setPublicWriteAccess(false);
	            obj.set('user', _CB2.default.CloudUser.current);
	            obj.set('name', name);
	            obj.set('data', data);
	            obj.set('type', type);
	            obj.save({
	                success: function success(obj) {
	                    if (callback) {
	                        callback.success(obj);
	                    } else {
	                        def.resolve(obj);
	                    }
	                },
	                error: function error(err) {
	                    if (callback) {
	                        callback.error(err);
	                    } else {
	                        def.reject(err);
	                    }
	                }
	            });
	        }
	    });
	    if (!callback) return def.promise;
	};

	CloudEvent._getDeviceInformation = function (callback) {
	    var obj = new Object();
	    if (!_CB2.default._isNode) obj['browser'] = _getBrowser();else obj['browser'] = 'node';

	    _getLocation(obj, {
	        success: function success(object) {
	            callback.success(object);
	        }
	    });
	};

	CloudEvent._os = function () {};

	function _getBrowser() {
	    // Opera 8.0+
	    try {
	        var isOpera = !!window.opr && !!opr.addons || !!window.opera || navigator.userAgent.indexOf(' OPR/') >= 0;

	        // Firefox 1.0+
	        var isFirefox = typeof InstallTrigger !== 'undefined';

	        // Safari 3.0+ "[object HTMLElementConstructor]"
	        var isSafari = /constructor/i.test(window.HTMLElement) || function (p) {
	            return p.toString() === "[object SafariRemoteNotification]";
	        }(!window['safari'] || safari.pushNotification);

	        // Internet Explorer 6-11
	        var isIE = /*@cc_on!@*/
	        false || !!document.documentMode;

	        // Edge 20+
	        var isEdge = !isIE && !!window.StyleMedia;

	        // Chrome 1+
	        var isChrome = !!window.chrome && !!window.chrome.webstore;

	        if (isChrome) return 'Chrome';else if (isEdge) return 'Edge';else if (isIE) return 'Internet Explorer';else if (isSafari) return 'Safari';else if (isFirefox) return 'Firefox';else if (isOpera) return 'Opera';else {
	            return 'Other';
	        }
	    } catch (e) {
	        return 'other';
	    }
	}

	function _getLocation(obj, callback) {
	    _axios2.default.get('https://ipinfo.io/json').then(function (data) {

	        obj['ip'] = data.data.ip;
	        obj['city'] = data.data.city;
	        obj['region'] = data.data.region;
	        obj['country'] = data.data.country;
	        obj['loc'] = data.data.loc;
	        callback.success(obj);
	    }).catch(function (err) {
	        obj['message'] = 'App is Offline';
	        callback.success(obj);
	    });
	}

	_CB2.default.CloudEvent = CloudEvent;

	exports.default = CloudEvent;

/***/ },
/* 84 */
/***/ function(module, exports) {

	exports.endianness = function () { return 'LE' };

	exports.hostname = function () {
	    if (typeof location !== 'undefined') {
	        return location.hostname
	    }
	    else return '';
	};

	exports.loadavg = function () { return [] };

	exports.uptime = function () { return 0 };

	exports.freemem = function () {
	    return Number.MAX_VALUE;
	};

	exports.totalmem = function () {
	    return Number.MAX_VALUE;
	};

	exports.cpus = function () { return [] };

	exports.type = function () { return 'Browser' };

	exports.release = function () {
	    if (typeof navigator !== 'undefined') {
	        return navigator.appVersion;
	    }
	    return '';
	};

	exports.networkInterfaces
	= exports.getNetworkInterfaces
	= function () { return {} };

	exports.arch = function () { return 'javascript' };

	exports.platform = function () { return 'browser' };

	exports.tmpdir = exports.tmpDir = function () {
	    return '/tmp';
	};

	exports.EOL = '\n';


/***/ },
/* 85 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});

	var _CB = __webpack_require__(1);

	var _CB2 = _interopRequireDefault(_CB);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	/*
	 CloudUser
	 */

	var CloudUser = function CloudUser() {
	    _classCallCheck(this, CloudUser);

	    if (!this.document) this.document = {};
	    this.document._tableName = 'User';
	    this.document.expires = null;
	    this.document._type = 'user';
	    this.document.expires = null;
	    this.document.ACL = new _CB2.default.ACL();
	    this.document._isModified = true;
	    this.document._modifiedColumns = ['createdAt', 'updatedAt', 'ACL', 'expires'];
	};

	_CB2.default.CloudUser = _CB2.default.CloudUser || CloudUser;

	//Description  : This function gets the current user from the server by taking the sessionId from querystring.
	//Params :
	//returns : CloudUser object if the current user is still in session or null.
	_CB2.default.CloudUser.getCurrentUser = function (callback) {

	    var def;
	    if (!callback) {
	        def = new _CB2.default.Promise();
	    }

	    //now call the signup API.
	    var params = JSON.stringify({ key: _CB2.default.appKey });

	    var url = _CB2.default.apiUrl + "/user/" + _CB2.default.appId + "/currentUser";

	    _CB2.default._request('POST', url, params).then(function (response) {
	        var user = response;
	        if (response) {
	            try {
	                user = new _CB2.default.CloudUser();
	                _CB2.default.fromJSON(JSON.parse(response), user);
	                _CB2.default.CloudUser.current = user;
	                _CB2.default.CloudUser._setCurrentUser(user);
	            } catch (e) {}
	        }

	        if (callback) {
	            callback.success(user);
	        } else {
	            def.resolve(user);
	        }
	    }, function (err) {
	        if (callback) {
	            callback.error(err);
	        } else {
	            def.reject(err);
	        }
	    });

	    if (!callback) {
	        return def.promise;
	    }
	};

	//Private Static fucntions

	//Description  : This function gets the current user from the cookie or from local storage.
	//Params :
	//returns : CloudUser object if the current user is still in session or null.
	_CB2.default.CloudUser._getCurrentUser = function () {
	    var content = _CB2.default._getCookie("CBCurrentUser");
	    if (content && content.length > 0) {
	        return _CB2.default.fromJSON(JSON.parse(content));
	    } else {
	        return null;
	    }
	};

	//Description  : This function saves the current user to the cookie or to local storage.
	//Params : @user - Instance of CB.CloudUser Object.
	//returns : void.
	_CB2.default.CloudUser._setCurrentUser = function (user) {
	    //save the user to the cookie.
	    if (!user) {
	        return;
	    }

	    //expiration time of 30 days.
	    _CB2.default._createCookie("CBCurrentUser", JSON.stringify(_CB2.default.toJSON(user)), 30 * 24 * 60 * 60 * 1000);
	};

	//Description  : This function saves the current user to the cookie or to local storage.
	//Params : @user - Instance of CB.CloudUser Object.
	//returns : void.
	_CB2.default.CloudUser._removeCurrentUser = function () {
	    //save the user to the cookie.
	    _CB2.default._deleteCookie("CBCurrentUser");
	};

	_CB2.default.CloudUser.resetPassword = function (email, callback) {

	    if (!email) {
	        throw "Email is required.";
	    }

	    var def;
	    if (!callback) {
	        def = new _CB2.default.Promise();
	    }

	    //now call the signup API.
	    var params = JSON.stringify({ email: email, key: _CB2.default.appKey });

	    var url = _CB2.default.apiUrl + "/user/" + _CB2.default.appId + "/resetPassword";

	    _CB2.default._request('POST', url, params).then(function (response) {
	        if (callback) {
	            callback.success();
	        } else {
	            def.resolve();
	        }
	    }, function (err) {
	        if (callback) {
	            callback.error(err);
	        } else {
	            def.reject(err);
	        }
	    });

	    if (!callback) {
	        return def.promise;
	    }
	};

	_CB2.default.CloudUser.prototype = Object.create(_CB2.default.CloudObject.prototype);

	Object.defineProperty(_CB2.default.CloudUser.prototype, 'username', {
	    get: function get() {
	        return this.document.username;
	    },
	    set: function set(username) {
	        this.document.username = username;
	        _CB2.default._modified(this, 'username');
	    }
	});
	Object.defineProperty(_CB2.default.CloudUser.prototype, 'password', {
	    get: function get() {
	        return this.document.password;
	    },
	    set: function set(password) {
	        this.document.password = password;
	        _CB2.default._modified(this, 'password');
	    }
	});
	Object.defineProperty(_CB2.default.CloudUser.prototype, 'email', {
	    get: function get() {
	        return this.document.email;
	    },
	    set: function set(email) {
	        this.document.email = email;
	        _CB2.default._modified(this, 'email');
	    }
	});

	_CB2.default.CloudUser.current = _CB2.default.CloudUser._getCurrentUser();

	_CB2.default.CloudUser.prototype.signUp = function (callback) {

	    // check if node env but not native, this method wont execute for node env's
	    if (_CB2.default._isNode && !_CB2.default._isNative) {
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
	        def = new _CB2.default.Promise();
	    }
	    //now call the signup API.
	    var params = JSON.stringify({ document: _CB2.default.toJSON(thisObj), key: _CB2.default.appKey });
	    var url = _CB2.default.apiUrl + "/user/" + _CB2.default.appId + "/signup";

	    _CB2.default._request('POST', url, params).then(function (user) {

	        var response = null;
	        if (user && user != "") {
	            _CB2.default.fromJSON(JSON.parse(user), thisObj);
	            _CB2.default.CloudUser.current = thisObj;
	            _CB2.default.CloudUser._setCurrentUser(thisObj);
	            response = thisObj;

	            (function (thisObj) {
	                setTimeout(function () {
	                    _CB2.default.CloudEvent.track('Signup', {
	                        username: thisObj.username,
	                        email: thisObj.email
	                    });
	                }, 1000);
	            })(thisObj);
	        }

	        if (callback) {
	            callback.success(response);
	        } else {
	            def.resolve(response);
	        }
	    }, function (err) {
	        if (callback) {
	            callback.error(err);
	        } else {
	            def.reject(err);
	        }
	    });

	    if (!callback) {
	        return def.promise;
	    }
	};

	_CB2.default.CloudUser.prototype.changePassword = function (oldPassword, newPassword, callback) {

	    var thisObj = this;
	    var def;
	    if (!callback) {
	        def = new _CB2.default.Promise();
	    }
	    //now call the signup API.
	    var params = JSON.stringify({ oldPassword: oldPassword, newPassword: newPassword, key: _CB2.default.appKey });

	    var url = _CB2.default.apiUrl + "/user/" + _CB2.default.appId + "/changePassword";

	    _CB2.default._request('PUT', url, params).then(function (response) {
	        if (callback) {
	            callback.success(_CB2.default.fromJSON(JSON.parse(response), thisObj));
	        } else {
	            def.resolve(_CB2.default.fromJSON(JSON.parse(response), thisObj));
	        }
	    }, function (err) {
	        if (callback) {
	            callback.error(err);
	        } else {
	            def.reject(err);
	        }
	    });

	    if (!callback) {
	        return def.promise;
	    }
	};

	_CB2.default.CloudUser.prototype.logIn = function (callback) {

	    // check if node env but not native, this method wont execute for node env's
	    if (_CB2.default._isNode && !_CB2.default._isNative) {
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
	        def = new _CB2.default.Promise();
	    }
	    //now call the signup API.
	    var params = JSON.stringify({ document: _CB2.default.toJSON(thisObj), key: _CB2.default.appKey });
	    var url = _CB2.default.apiUrl + "/user/" + _CB2.default.appId + "/login";

	    _CB2.default._request('POST', url, params).then(function (response) {
	        thisObj = _CB2.default.fromJSON(JSON.parse(response), thisObj);
	        _CB2.default.CloudUser.current = thisObj;
	        if (callback) {
	            callback.success(thisObj);
	        } else {
	            def.resolve(thisObj);
	        }
	        _CB2.default.CloudUser._setCurrentUser(thisObj);
	        _CB2.default.CloudEvent.track('Login', {
	            username: thisObj.username,
	            email: thisObj.email
	        });
	    }, function (err) {
	        if (callback) {
	            callback.error(err);
	        } else {
	            def.reject(err);
	        }
	    });

	    if (!callback) {
	        return def.promise;
	    }
	};

	_CB2.default.CloudUser.authenticateWithProvider = function (dataJson, callback) {

	    // check if node env but not native, this method wont execute for node env's
	    if (_CB2.default._isNode && !_CB2.default._isNative) {
	        throw "Error : You cannot login the user on the server.";
	    }

	    var def;
	    if (!callback) {
	        def = new _CB2.default.Promise();
	    }

	    if (!dataJson) {
	        throw "data object is null.";
	    }

	    if (dataJson && !dataJson.provider) {
	        throw "provider is not set.";
	    }

	    if (dataJson && !dataJson.accessToken) {
	        throw "accessToken is not set.";
	    }

	    if (dataJson.provider.toLowerCase() === "twiter" && !dataJson.accessSecret) {
	        throw "accessSecret is required for provider twitter.";
	    }

	    var params = JSON.stringify({ provider: dataJson.provider, accessToken: dataJson.accessToken, accessSecret: dataJson.accessSecret, key: _CB2.default.appKey });

	    var url = _CB2.default.apiUrl + "/user/" + _CB2.default.appId + "/loginwithprovider";

	    _CB2.default._request('POST', url, params).then(function (response) {
	        var user = response;
	        if (response) {
	            try {
	                user = new _CB2.default.CloudUser();
	                _CB2.default.fromJSON(JSON.parse(response), user);
	                _CB2.default.CloudUser.current = user;
	                _CB2.default.CloudUser._setCurrentUser(user);
	            } catch (e) {}
	        }

	        if (callback) {
	            callback.success(user);
	        } else {
	            def.resolve(user);
	        }
	    }, function (err) {
	        if (callback) {
	            callback.error(err);
	        } else {
	            def.reject(err);
	        }
	    });

	    if (!callback) {
	        return def.promise;
	    }
	};

	_CB2.default.CloudUser.prototype.logOut = function (callback) {

	    // check if node env but not native, this method wont execute for node env's
	    if (_CB2.default._isNode && !_CB2.default._isNative) {
	        throw "Error : You cannot logOut the user on the server.";
	    }

	    var thisObj = this;
	    var def;
	    if (!callback) {
	        def = new _CB2.default.Promise();
	    }
	    //now call the logout API.
	    var params = JSON.stringify({ document: _CB2.default.toJSON(thisObj), key: _CB2.default.appKey });
	    var url = _CB2.default.apiUrl + "/user/" + _CB2.default.appId + "/logout";

	    _CB2.default._request('POST', url, params).then(function (response) {
	        _CB2.default.fromJSON(JSON.parse(response), thisObj);
	        _CB2.default.CloudUser.current = null;
	        if (callback) {
	            callback.success(thisObj);
	        } else {
	            def.resolve(thisObj);
	        }
	        _CB2.default.CloudUser._removeCurrentUser();
	    }, function (err) {
	        if (callback) {
	            callback.error(err);
	        } else {
	            def.reject(err);
	        }
	    });

	    if (!callback) {
	        return def.promise;
	    }
	};
	_CB2.default.CloudUser.prototype.addToRole = function (role, callback) {
	    if (!role) {
	        throw "Role is null";
	    }
	    var thisObj = this;
	    var def;
	    if (!callback) {
	        def = new _CB2.default.Promise();
	    }

	    //Call the addToRole API
	    var params = JSON.stringify({ user: _CB2.default.toJSON(thisObj), role: _CB2.default.toJSON(role), key: _CB2.default.appKey });
	    var url = _CB2.default.apiUrl + "/user/" + _CB2.default.appId + "/addToRole";

	    _CB2.default._request('PUT', url, params).then(function (response) {
	        _CB2.default.fromJSON(JSON.parse(response), thisObj);
	        if (callback) {
	            callback.success(thisObj);
	        } else {
	            def.resolve(thisObj);
	        }
	    }, function (err) {
	        if (callback) {
	            callback.error(err);
	        } else {
	            def.reject(err);
	        }
	    });

	    if (!callback) {
	        return def.promise;
	    }
	};
	_CB2.default.CloudUser.prototype.isInRole = function (role) {
	    if (!role) {
	        throw "role is null";
	    }

	    var roleArray = this.get('roles');
	    var userRoleIds = [];

	    if (roleArray && roleArray.length > 0) {
	        for (var i = 0; i < roleArray.length; ++i) {
	            userRoleIds.push(roleArray[i].document._id);
	        }
	    }

	    return userRoleIds.indexOf(role.document._id) >= 0;
	};

	_CB2.default.CloudUser.prototype.removeFromRole = function (role, callback) {
	    if (!role) {
	        throw "Role is null";
	    }
	    var thisObj = this;
	    var def;
	    if (!callback) {
	        def = new _CB2.default.Promise();
	    }
	    //now call the removeFromRole API.
	    var params = JSON.stringify({ user: _CB2.default.toJSON(thisObj), role: _CB2.default.toJSON(role), key: _CB2.default.appKey });
	    var url = _CB2.default.apiUrl + "/user/" + _CB2.default.appId + "/removeFromRole";

	    _CB2.default._request('PUT', url, params).then(function (response) {
	        _CB2.default.fromJSON(JSON.parse(response), thisObj);
	        if (callback) {
	            callback.success(thisObj);
	        } else {
	            def.resolve(thisObj);
	        }
	    }, function (err) {
	        if (callback) {
	            callback.error(err);
	        } else {
	            def.reject(err);
	        }
	    });

	    if (!callback) {
	        return def.promise;
	    }
	};

	exports.default = _CB2.default.CloudUser;

/***/ },
/* 86 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});

	var _CB = __webpack_require__(1);

	var _CB2 = _interopRequireDefault(_CB);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	/* CloudNotificiation */

	_CB2.default.CloudNotification = _CB2.default.CloudNotification || {};

	_CB2.default.CloudNotification.on = function (channelName, callback, done) {

	    if (_CB2.default._isRealtimeDisabled) {
	        throw "Realtime is disbaled for this app.";
	    }

	    _CB2.default._validate();

	    var def;

	    if (!done) {
	        def = new _CB2.default.Promise();
	    }

	    _CB2.default.Socket.emit('join-custom-channel', _CB2.default.appId + channelName);
	    _CB2.default.Socket.on(_CB2.default.appId + channelName, function (data) {
	        //listen to events in custom channel.
	        callback(data);
	    });

	    if (done && done.success) done.success();else def.resolve();

	    if (!done) {
	        return def.promise;
	    }
	};

	_CB2.default.CloudNotification.off = function (channelName, done) {

	    if (_CB2.default._isRealtimeDisabled) {
	        throw "Realtime is disbaled for this app.";
	    }

	    _CB2.default._validate();

	    var def;

	    if (!done) {
	        def = new _CB2.default.Promise();
	    }

	    _CB2.default.Socket.emit('leave-custom-channel', _CB2.default.appId + channelName);
	    _CB2.default.Socket.removeAllListeners(_CB2.default.appId + channelName);
	    if (done && done.success) done.success();else def.resolve();

	    if (!done) {
	        return def.promise;
	    }
	};

	_CB2.default.CloudNotification.publish = function (channelName, data, done) {

	    if (_CB2.default._isRealtimeDisabled) {
	        throw "Realtime is disbaled for this app.";
	    }

	    _CB2.default._validate();

	    var def;

	    if (!done) {
	        def = new _CB2.default.Promise();
	    }

	    _CB2.default.Socket.emit('publish-custom-channel', { channel: _CB2.default.appId + channelName, data: data });
	    if (done && done.success) done.success();else def.resolve();

	    if (!done) {
	        return def.promise;
	    }
	};

	exports.default = _CB2.default.CloudNotification;

/***/ },
/* 87 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});

	var _CB = __webpack_require__(1);

	var _CB2 = _interopRequireDefault(_CB);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	/*CloudBoost Push Notifications*/

	_CB2.default.CloudPush = {};

	_CB2.default.CloudPush.send = function (data, query, callback) {

	    var tableName = "Device";

	    if (!_CB2.default.appId) {
	        throw "CB.appId is null.";
	    }
	    var def;
	    if (!callback) {
	        def = new _CB2.default.Promise();
	    }

	    if (!data) {
	        throw "data object is null.";
	    }
	    if (data && !data.message) {
	        throw "message is not set.";
	    }

	    //Query Set
	    if (query && Object.prototype.toString.call(query) == "[object Object]" && typeof query.success !== 'function') {
	        var pushQuery = query;
	    }
	    //Channels List
	    if (query && Object.prototype.toString.call(query) == "[object Array]" && typeof query.success !== 'function') {
	        var pushQuery = new _CB2.default.CloudQuery(tableName);
	        pushQuery.containedIn('channels', query);
	    }
	    //Single Channel    
	    if (query && Object.prototype.toString.call(query) == "[object String]" && typeof query.success !== 'function') {
	        var pushQuery = new _CB2.default.CloudQuery(tableName);
	        pushQuery.containedIn('channels', [query]);
	    }
	    //when query param is callback
	    if (query && Object.prototype.toString.call(query) == "[object Object]" && typeof query.success === 'function') {
	        callback = query;
	        var pushQuery = new _CB2.default.CloudQuery(tableName);
	    }
	    //No query param
	    if (!query) {
	        var pushQuery = new _CB2.default.CloudQuery(tableName);
	    }

	    var params = JSON.stringify({
	        query: pushQuery.query,
	        sort: pushQuery.sort,
	        limit: pushQuery.limit,
	        skip: pushQuery.skip,
	        key: _CB2.default.appKey,
	        data: data
	    });

	    var url = _CB2.default.apiUrl + "/push/" + _CB2.default.appId + '/send';

	    _CB2.default._request('POST', url, params).then(function (response) {
	        var object = response;
	        if (_CB2.default._isJsonString(response)) {
	            object = JSON.parse(response);
	        }

	        if (callback) {
	            callback.success(object);
	        } else {
	            def.resolve(object);
	        }
	    }, function (err) {

	        if (_CB2.default._isJsonString(err)) {
	            err = JSON.parse(err);
	        }

	        if (callback) {
	            callback.error(err);
	        } else {
	            def.reject(err);
	        }
	    });

	    if (!callback) {
	        return def.promise;
	    }
	};

	_CB2.default.CloudPush.enableWebNotifications = function (callback) {

	    var def;
	    if (!callback) {
	        def = new _CB2.default.Promise();
	    }

	    //Check document
	    if (typeof document !== 'undefined') {

	        _CB2.default.CloudPush._requestBrowserNotifications().then(function (response) {

	            if ('serviceWorker' in navigator) {
	                return navigator.serviceWorker.register('serviceWorker.js', { scope: './' });
	            } else {
	                var noServerDef = new _CB2.default.Promise();
	                noServerDef.reject('Service workers aren\'t supported in this browser.');
	                return noServerDef;
	            }
	        }).then(function (registration) {

	            if (!registration.showNotification) {
	                var noServerDef = new _CB2.default.Promise();
	                noServerDef.reject('Notifications aren\'t supported on service workers.');
	                return noServerDef;
	            } else {
	                return _CB2.default.CloudPush._subscribe();
	            }
	        }).then(function (subscription) {

	            //PublicKey for secure connection with server
	            var browserKey = subscription.getKey ? subscription.getKey('p256dh') : '';
	            browserKey = browserKey ? btoa(String.fromCharCode.apply(null, new Uint8Array(browserKey))) : '';

	            //AuthKey for secure connection with server
	            var authKey = subscription.getKey ? subscription.getKey('auth') : '';
	            authKey = authKey ? btoa(String.fromCharCode.apply(null, new Uint8Array(authKey))) : '';

	            _CB2.default.CloudPush._addDevice(_CB2.default._getThisBrowserName(), subscription.endpoint, browserKey, authKey, {
	                success: function success(obj) {
	                    if (callback) {
	                        callback.success();
	                    } else {
	                        def.resolve();
	                    }
	                }, error: function error(_error) {
	                    if (callback) {
	                        callback.error(_error);
	                    } else {
	                        def.reject(_error);
	                    }
	                }
	            });
	        }, function (error) {
	            if (callback) {
	                callback.error(error);
	            } else {
	                def.reject(error);
	            }
	        });
	    } else {
	        if (callback) {
	            callback.error("Browser document not found");
	        } else {
	            def.reject("Browser document not found");
	        }
	    }

	    if (!callback) {
	        return def.promise;
	    }
	};

	_CB2.default.CloudPush.disableWebNotifications = function (callback) {

	    var def;
	    if (!callback) {
	        def = new _CB2.default.Promise();
	    }

	    //Check document
	    if (typeof document !== 'undefined') {

	        _CB2.default.CloudPush._getSubscription().then(function (subscription) {

	            //No subscription 
	            if (!subscription) {
	                if (callback) {
	                    callback.success();
	                } else {
	                    def.resolve();
	                }
	            }

	            if (subscription) {
	                var promises = [];

	                //We have a subcription, so call unsubscribe on it
	                promises.push(subscription.unsubscribe());
	                //Remove Device Objects
	                promises.push(_CB2.default.CloudPush._deleteDevice(_CB2.default._getThisBrowserName(), subscription.endpoint));

	                _CB2.default.Promise.all(promises).then(function (successful) {
	                    if (callback) {
	                        callback.success();
	                    } else {
	                        def.resolve();
	                    }
	                }, function (error) {
	                    if (callback) {
	                        callback.error(error);
	                    } else {
	                        def.reject(error);
	                    }
	                });
	            }
	        }, function (error) {
	            if (callback) {
	                callback.error(error);
	            } else {
	                def.reject(error);
	            }
	        });
	    } else {
	        if (callback) {
	            callback.error("Browser document not found");
	        } else {
	            def.reject("Browser document not found");
	        }
	    }

	    if (!callback) {
	        return def.promise;
	    }
	};

	_CB2.default.CloudPush._subscribe = function () {

	    var def = new _CB2.default.Promise();

	    // Check if push messaging is supported  
	    if (!('PushManager' in window)) {
	        return def.reject('Push messaging isn\'t supported.');
	    }

	    navigator.serviceWorker.ready.then(function (reg) {

	        reg.pushManager.getSubscription().then(function (subscription) {

	            if (!subscription) {
	                reg.pushManager.subscribe({ userVisibleOnly: true }).then(function (subscription) {
	                    def.resolve(subscription);
	                }).catch(function (err) {
	                    def.reject(err);
	                });
	            } else {
	                def.resolve(subscription);
	            }
	        }).catch(function (err) {
	            def.reject(err);
	        });
	    }, function (error) {
	        def.reject(error);
	    });

	    return def.promise;
	};

	_CB2.default.CloudPush._getSubscription = function () {

	    var def = new _CB2.default.Promise();

	    navigator.serviceWorker.ready.then(function (reg) {

	        reg.pushManager.getSubscription().then(function (subscription) {

	            if (!subscription) {
	                def.resolve(null);
	            } else {
	                def.resolve(subscription);
	            }
	        }).catch(function (err) {
	            def.reject(err);
	        });
	    }, function (error) {
	        def.reject(error);
	    });

	    return def.promise;
	};

	_CB2.default.CloudPush._requestBrowserNotifications = function () {

	    var def = new _CB2.default.Promise();

	    if (!("Notification" in window)) {
	        def.reject("This browser does not support system notifications");
	    } else if (Notification.permission === "granted") {

	        def.resolve("Permission granted");
	    } else if (Notification.permission !== 'denied') {

	        Notification.requestPermission(function (permission) {

	            if (permission === "granted") {
	                def.resolve("Permission granted");
	            }

	            if (permission === "denied") {
	                def.reject("Permission denied");
	            }
	        });
	    }

	    return def.promise;
	};

	//save the device document to the db
	_CB2.default.CloudPush._addDevice = function (deviceOS, endPoint, browserKey, authKey, callback) {

	    var def;
	    _CB2.default._validate();

	    //Set Fields
	    var thisObj = new _CB2.default.CloudObject('Device');
	    thisObj.set('deviceOS', deviceOS);
	    thisObj.set('deviceToken', endPoint);
	    thisObj.set('metadata', { browserKey: browserKey, authKey: authKey });

	    if (!callback) {
	        def = new _CB2.default.Promise();
	    }

	    var params = JSON.stringify({
	        document: _CB2.default.toJSON(thisObj),
	        key: _CB2.default.appKey
	    });

	    var url = _CB2.default.apiUrl + "/push/" + _CB2.default.appId;
	    _CB2.default._request('PUT', url, params).then(function (response) {
	        thisObj = _CB2.default.fromJSON(JSON.parse(response), thisObj);
	        if (callback) {
	            callback.success(thisObj);
	        } else {
	            def.resolve(thisObj);
	        }
	    }, function (err) {
	        if (callback) {
	            callback.error(err);
	        } else {
	            def.reject(err);
	        }
	    });

	    if (!callback) {
	        return def.promise;
	    }
	};

	_CB2.default.CloudPush._deleteDevice = function (deviceOS, endPoint, callback) {
	    //delete an object matching the objectId
	    if (!_CB2.default.appId) {
	        throw "CB.appId is null.";
	    }

	    var def;
	    if (!callback) {
	        def = new _CB2.default.Promise();
	    }

	    var data = {
	        deviceOS: deviceOS,
	        deviceToken: endPoint
	    };

	    var params = JSON.stringify({
	        key: _CB2.default.appKey,
	        document: data,
	        method: "DELETE"
	    });

	    var url = _CB2.default.apiUrl + "/push/" + _CB2.default.appId;

	    _CB2.default._request('PUT', url, params).then(function (response) {
	        if (callback) {
	            callback.success(response);
	        } else {
	            def.resolve(response);
	        }
	    }, function (err) {
	        if (callback) {
	            callback.error(err);
	        } else {
	            def.reject(err);
	        }
	    });

	    if (!callback) {
	        return def.promise;
	    }
	};

	exports.default = _CB2.default.CloudPush;

/***/ },
/* 88 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});

	var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	var _CB = __webpack_require__(1);

	var _CB2 = _interopRequireDefault(_CB);

	var _localforage = __webpack_require__(73);

	var _localforage2 = _interopRequireDefault(_localforage);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	/*
	 CloudQuery
	 */
	var CloudQuery = function () {
	    function CloudQuery(tableName) {
	        _classCallCheck(this, CloudQuery);

	        //constructor for the class CloudQuery
	        if (!tableName) throw "Table Name cannot be null";

	        this.tableName = tableName;
	        this.query = {};
	        this.query.$include = [];
	        this.query.$includeList = [];
	        this.select = {};
	        this.sort = {};
	        this.skip = 0;
	        this.limit = 10; //default limit is 10
	    }

	    _createClass(CloudQuery, [{
	        key: 'search',
	        value: function search(_search, language, caseSensitive, diacriticSensitive) {

	            //Validations
	            if (typeof _search !== "string") {
	                throw "First parameter is required and it should be a string.";
	            }

	            if (language !== null && typeof language !== "undefined" && typeof language !== "string") {
	                throw "Second parameter should be a string.";
	            }

	            if (caseSensitive !== null && typeof caseSensitive !== "undefined" && typeof caseSensitive !== "boolean") {
	                throw "Third parameter should be a boolean.";
	            }

	            if (diacriticSensitive !== null && typeof diacriticSensitive !== "undefined" && typeof diacriticSensitive !== "boolean") {
	                throw "Fourth parameter should be a boolean.";
	            }

	            //Set the fields
	            this.query["$text"] = {};
	            if (typeof _search === "string") {
	                this.query["$text"]["$search"] = _search;
	            }

	            if (language !== null && typeof language !== "undefined" && typeof language === "string") {
	                this.query["$text"]["$language"] = language;
	            }

	            if (caseSensitive !== null && typeof caseSensitive !== "undefined" && typeof caseSensitive === "boolean") {
	                this.query["$text"]["$caseSensitive"] = caseSensitive;
	            }

	            if (diacriticSensitive !== null && typeof diacriticSensitive !== "undefined" && typeof diacriticSensitive === "boolean") {
	                this.query["$text"]["$diacriticSensitive"] = diacriticSensitive;
	            }

	            return this;
	        }
	    }, {
	        key: 'equalTo',
	        value: function equalTo(columnName, data) {

	            if (columnName === 'id') columnName = '_' + columnName;

	            if (!!data) {
	                if (data.constructor === _CB2.default.CloudObject) {
	                    columnName = columnName + '._id';
	                    data = data.get('id');
	                }
	            }

	            this.query[columnName] = data;

	            return this;
	        }
	    }, {
	        key: 'delete',
	        value: function _delete(callback) {
	            var def;
	            if (!callback) def = new _CB2.default.Promise();
	            this.find({
	                success: function success(obj) {
	                    _CB2.default.CloudObject.deleteAll(obj, callback);
	                },
	                error: function error(err) {
	                    if (callback) {
	                        callback.error(err);
	                    } else {
	                        def.reject(err);
	                    }
	                }
	            });
	        }
	    }, {
	        key: 'includeList',
	        value: function includeList(columnName) {
	            if (columnName === 'id') columnName = '_' + columnName;

	            this.query.$includeList.push(columnName);

	            return this;
	        }
	    }, {
	        key: 'include',
	        value: function include(columnName) {
	            if (columnName === 'id') columnName = '_' + columnName;

	            this.query.$include.push(columnName);

	            return this;
	        }
	    }, {
	        key: 'all',
	        value: function all(columnName) {
	            if (columnName === 'id') columnName = '_' + columnName;

	            this.query.$all = columnName;

	            return this;
	        }
	    }, {
	        key: 'any',
	        value: function any(columnName) {
	            if (columnName === 'id') columnName = '_' + columnName;

	            this.query.$any = columnName;

	            return this;
	        }
	    }, {
	        key: 'first',
	        value: function first(columnName) {
	            if (columnName === 'id') columnName = '_' + columnName;

	            this.query.$first = columnName;

	            return this;
	        }
	    }, {
	        key: 'notEqualTo',
	        value: function notEqualTo(columnName, data) {
	            if (columnName === 'id') columnName = '_' + columnName;

	            if (data !== null) {
	                if (data.constructor === _CB2.default.CloudObject) {
	                    columnName = columnName + '._id';
	                    data = data.get('id');
	                }
	            }

	            this.query[columnName] = {
	                $ne: data
	            };

	            return this;
	        }
	    }, {
	        key: 'greaterThan',
	        value: function greaterThan(columnName, data) {

	            if (columnName === 'id') columnName = '_' + columnName;

	            if (!this.query[columnName]) {
	                this.query[columnName] = {};
	            }
	            this.query[columnName]["$gt"] = data;

	            return this;
	        }
	    }, {
	        key: 'greaterThanEqualTo',
	        value: function greaterThanEqualTo(columnName, data) {

	            if (columnName === 'id') columnName = '_' + columnName;

	            if (!this.query[columnName]) {
	                this.query[columnName] = {};
	            }
	            this.query[columnName]["$gte"] = data;

	            return this;
	        }
	    }, {
	        key: 'lessThan',
	        value: function lessThan(columnName, data) {

	            if (columnName === 'id') columnName = '_' + columnName;

	            if (!this.query[columnName]) {
	                this.query[columnName] = {};
	            }
	            this.query[columnName]["$lt"] = data;

	            return this;
	        }
	    }, {
	        key: 'lessThanEqualTo',
	        value: function lessThanEqualTo(columnName, data) {

	            if (columnName === 'id') columnName = '_' + columnName;

	            if (!this.query[columnName]) {
	                this.query[columnName] = {};
	            }
	            this.query[columnName]["$lte"] = data;

	            return this;
	        }
	    }, {
	        key: 'orderByAsc',


	        //Sorting
	        value: function orderByAsc(columnName) {

	            if (columnName === 'id') columnName = '_' + columnName;

	            this.sort[columnName] = 1;

	            return this;
	        }
	    }, {
	        key: 'orderByDesc',
	        value: function orderByDesc(columnName) {

	            if (columnName === 'id') columnName = '_' + columnName;

	            this.sort[columnName] = -1;

	            return this;
	        }
	    }, {
	        key: 'setLimit',


	        //Limit and skip
	        value: function setLimit(data) {

	            this.limit = data;
	            return this;
	        }
	    }, {
	        key: 'setSkip',
	        value: function setSkip(data) {
	            this.skip = data;
	            return this;
	        }
	    }, {
	        key: 'paginate',
	        value: function paginate(pageNo, totalItemsInPage, callback) {

	            if (!_CB2.default.appId) {
	                throw "CB.appId is null.";
	            }
	            if (!this.tableName) {
	                throw "TableName is null.";
	            }
	            var def;
	            var callback;
	            if ((typeof callback === 'undefined' ? 'undefined' : _typeof(callback)) === 'object' && typeof callback.success === 'function') {
	                callback = callback;
	            }
	            if (!callback) {
	                def = new _CB2.default.Promise();
	            }

	            if (pageNo && (typeof pageNo === 'undefined' ? 'undefined' : _typeof(pageNo)) === 'object' && typeof pageNo.success === 'function') {
	                callback = pageNo;
	                pageNo = null;
	            }
	            if (totalItemsInPage && (typeof totalItemsInPage === 'undefined' ? 'undefined' : _typeof(totalItemsInPage)) === 'object' && typeof totalItemsInPage.success === 'function') {
	                callback = totalItemsInPage;
	                totalItemsInPage = null;
	            }

	            if (pageNo && typeof pageNo === 'number' && pageNo > 0) {
	                if (typeof totalItemsInPage === 'number' && totalItemsInPage > 0) {
	                    var skip = pageNo * totalItemsInPage - totalItemsInPage;
	                    this.setSkip(skip);
	                    this.setLimit(totalItemsInPage);
	                }
	            }

	            if (totalItemsInPage && typeof totalItemsInPage === 'number' && totalItemsInPage > 0) {
	                this.setLimit(totalItemsInPage);
	            }
	            var thisObj = this;

	            var promises = [];
	            promises.push(this.find());

	            var countQuery = Object.create(this);
	            countQuery.setSkip(0);
	            countQuery.setLimit(99999999);

	            promises.push(countQuery.count());

	            _CB2.default.Promise.all(promises).then(function (list) {
	                var objectsList = null;
	                var count = null;
	                var totalPages = 0;

	                if (list && list.length > 0) {
	                    objectsList = list[0];
	                    count = list[1];
	                    if (!count) {
	                        count = 0;
	                        totalPages = 0;
	                    } else {
	                        totalPages = Math.ceil(count / thisObj.limit);
	                    }
	                    if (totalPages && totalPages < 0) {
	                        totalPages = 0;
	                    }
	                }
	                if (callback) {
	                    callback.success(objectsList, count, totalPages);
	                } else {
	                    def.resolve(objectsList, count, totalPages);
	                }
	            }, function (error) {
	                if (callback) {
	                    callback.error(error);
	                } else {
	                    def.reject(error);
	                }
	            });

	            if (!callback) {
	                return def.promise;
	            }
	        }
	    }, {
	        key: 'selectColumn',


	        //select/deselect columns to show
	        value: function selectColumn(columnNames) {

	            if (Object.keys(this.select).length === 0) {
	                this.select = {
	                    _id: 1,
	                    createdAt: 1,
	                    updatedAt: 1,
	                    ACL: 1,
	                    _type: 1,
	                    _tableName: 1
	                };
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
	        }
	    }, {
	        key: 'doNotSelectColumn',
	        value: function doNotSelectColumn(columnNames) {
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
	        }
	    }, {
	        key: 'containedIn',
	        value: function containedIn(columnName, data) {

	            var isCloudObject = false;

	            var CbData = [];
	            if (columnName === 'id') columnName = '_' + columnName;

	            if (Object.prototype.toString.call(data) === '[object Object]' && !data instanceof _CB2.default.CloudObject) {
	                //if object is passed as an argument
	                throw 'Array / value / CloudObject expected as an argument';
	            }

	            if (Object.prototype.toString.call(data) === '[object Array]') {
	                //if array is passed, then replace the whole

	                for (var i = 0; i < data.length; i++) {
	                    if (data[i] instanceof _CB2.default.CloudObject) {
	                        isCloudObject = true;
	                        if (!data[i].id) {
	                            throw "CloudObject passed should be saved and should have an id before being passed to containedIn";
	                        }
	                        CbData.push(data[i].id);
	                    }
	                }
	                if (CbData.length === 0) {
	                    CbData = data;
	                }

	                if (isCloudObject) {
	                    columnName = columnName + '._id';
	                }

	                if (!this.query[columnName]) {
	                    this.query[columnName] = {};
	                }

	                this.query[columnName]["$in"] = CbData;
	                var thisObj = this;
	                if (typeof this.query[columnName]["$nin"] !== 'undefined') {
	                    //for removing dublicates
	                    CbData.forEach(function (val) {
	                        if ((index = thisObj.query[columnName]["$nin"].indexOf(val)) >= 0) {
	                            thisObj.query[columnName]["$nin"].splice(index, 1);
	                        }
	                    });
	                }
	            } else {
	                //if the argument is a string then push if it is not present already

	                if (data instanceof _CB2.default.CloudObject) {

	                    if (!data.id) {
	                        throw "CloudObject passed should be saved and should have an id before being passed to containedIn";
	                    }

	                    columnName = columnName + '._id';
	                    CbData = data.id;
	                } else CbData = data;

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
	    }, {
	        key: 'notContainedIn',
	        value: function notContainedIn(columnName, data) {

	            var isCloudObject = false;

	            var CbData = [];
	            if (columnName === 'id') columnName = '_' + columnName;

	            if (Object.prototype.toString.call(data) === '[object Object]' && !data instanceof _CB2.default.CloudObject) {
	                //if object is passed as an argument
	                throw 'Array or string expected as an argument';
	            }

	            if (Object.prototype.toString.call(data) === '[object Array]') {
	                //if array is passed, then replace the whole

	                for (var i = 0; i < data.length; i++) {
	                    if (data[i] instanceof _CB2.default.CloudObject) {
	                        isCloudObject = true;
	                        if (!data[i].id) {
	                            throw "CloudObject passed should be saved and should have an id before being passed to notContainedIn";
	                        }

	                        CbData.push(data[i].id);
	                    }
	                }
	                if (CbData.length === 0) {
	                    CbData = data;
	                }

	                if (isCloudObject) {
	                    columnName = columnName + '._id';
	                }

	                if (!this.query[columnName]) {
	                    this.query[columnName] = {};
	                }

	                this.query[columnName]["$nin"] = CbData;
	                if (typeof this.query[columnName]["$in"] !== 'undefined') {
	                    //for removing duplicates
	                    thisObj = this;
	                    CbData.forEach(function (val) {
	                        if ((index = thisObj.query[columnName]["$in"].indexOf(val)) >= 0) {
	                            thisObj.query[columnName]["$in"].splice(index, 1);
	                        }
	                    });
	                }
	            } else {
	                //if the argument is a string then push if it is not present already

	                if (data instanceof _CB2.default.CloudObject) {

	                    if (!data.id) {
	                        throw "CloudObject passed should be saved and should have an id before being passed to notContainedIn";
	                    }

	                    columnName = columnName + '._id';
	                    CbData = data.id;
	                } else CbData = data;

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
	    }, {
	        key: 'exists',
	        value: function exists(columnName) {
	            if (columnName === 'id') columnName = '_' + columnName;

	            if (!this.query[columnName]) {
	                this.query[columnName] = {};
	            }
	            this.query[columnName]["$exists"] = true;

	            return this;
	        }
	    }, {
	        key: 'doesNotExists',
	        value: function doesNotExists(columnName) {
	            if (columnName === 'id') columnName = '_' + columnName;

	            if (!this.query[columnName]) {
	                this.query[columnName] = {};
	            }
	            this.query[columnName]["$exists"] = false;

	            return this;
	        }
	    }, {
	        key: 'containsAll',
	        value: function containsAll(columnName, data) {

	            var isCloudObject = false;

	            var CbData = [];

	            if (columnName === 'id') columnName = '_' + columnName;

	            if (Object.prototype.toString.call(data) === '[object Object]' && !data instanceof _CB2.default.CloudObject) {
	                //if object is passed as an argument
	                throw 'Array or string expected as an argument';
	            }

	            if (Object.prototype.toString.call(data) === '[object Array]') {
	                //if array is passed, then replace the whole

	                for (var i = 0; i < data.length; i++) {
	                    if (data[i] instanceof _CB2.default.CloudObject) {

	                        isCloudObject = true;

	                        if (!data[i].id) {
	                            throw "CloudObject passed should be saved and should have an id before being passed to containsAll";
	                        }

	                        CbData.push(data[i].id);
	                    }
	                }

	                if (CbData.length === 0) {
	                    CbData = data;
	                }

	                if (isCloudObject) {
	                    columnName = columnName + '._id';
	                }

	                if (!this.query[columnName]) {
	                    this.query[columnName] = {};
	                }

	                this.query[columnName]["$all"] = CbData;
	            } else {
	                //if the argument is a string then push if it is not present already

	                if (data instanceof _CB2.default.CloudObject) {

	                    if (!data.id) {
	                        throw "CloudObject passed should be saved and should have an id before being passed to containsAll";
	                    }

	                    columnName = columnName + '._id';
	                    CbData = data.id;
	                } else CbData = data;

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
	    }, {
	        key: 'startsWith',
	        value: function startsWith(columnName, value) {
	            if (columnName === 'id') columnName = '_' + columnName;

	            var regex = '^' + value;
	            if (!this.query[columnName]) {
	                this.query[columnName] = {};
	            }

	            this.query[columnName]["$regex"] = regex;
	            this.query[columnName]["$options"] = 'im';

	            return this;
	        }
	    }, {
	        key: 'regex',
	        value: function regex(columnName, value, isCaseInsensitive) {
	            if (columnName === 'id') columnName = '_' + columnName;

	            if (!this.query[columnName]) {
	                this.query[columnName] = {};
	            }

	            this.query[columnName]["$regex"] = value;

	            if (isCaseInsensitive) {
	                this.query[columnName]["$options"] = "i";
	            }

	            return this;
	        }
	    }, {
	        key: 'substring',
	        value: function substring(columnName, value, isCaseInsensitive) {

	            if (typeof columnName === "string") {
	                columnName = [columnName];
	            }

	            for (var j = 0; j < columnName.length; j++) {
	                if (Object.prototype.toString.call(value) === '[object Array]' && value.length > 0) {
	                    if (!this.query["$or"]) this.query["$or"] = [];
	                    for (var i = 0; i < value.length; i++) {
	                        var obj = {};
	                        obj[columnName[j]] = {};
	                        obj[columnName[j]]["$regex"] = ".*" + value[i] + ".*";

	                        if (isCaseInsensitive) {
	                            obj[columnName[j]]["$options"] = "i";
	                        }

	                        this.query["$or"].push(obj);
	                    }
	                } else {
	                    if (columnName.length === 1) {
	                        this.regex(columnName[j], ".*" + value + ".*", isCaseInsensitive);
	                    } else {
	                        if (!this.query["$or"]) this.query["$or"] = [];
	                        var obj = {};
	                        obj[columnName[j]] = {};
	                        obj[columnName[j]]["$regex"] = ".*" + value + ".*";

	                        if (isCaseInsensitive) {
	                            obj[columnName[j]]["$options"] = "i";
	                        }

	                        this.query["$or"].push(obj);
	                    }
	                }
	            }

	            return this;
	        }

	        //GeoPoint near query

	    }, {
	        key: 'near',
	        value: function near(columnName, geoPoint, maxDistance, minDistance) {
	            if (!this.query[columnName]) {
	                this.query[columnName] = {};
	                this.query[columnName]['$near'] = {
	                    '$geometry': {
	                        coordinates: geoPoint['document'].coordinates,
	                        type: 'Point'
	                    },
	                    '$maxDistance': maxDistance,
	                    '$minDistance': minDistance
	                };
	            }
	        }
	    }, {
	        key: 'geoWithin',


	        //GeoPoint geoWithin query
	        value: function geoWithin(columnName, geoPoint, radius) {

	            if (!radius) {
	                var coordinates = [];
	                //extracting coordinates from each CloudGeoPoint Object
	                if (Object.prototype.toString.call(geoPoint) === '[object Array]') {
	                    for (var i = 0; i < geoPoint.length; i++) {
	                        if (geoPoint[i]['document'].hasOwnProperty('coordinates')) {
	                            coordinates[i] = geoPoint[i]['document']['coordinates'];
	                        }
	                    }
	                } else {
	                    throw 'Invalid Parameter, coordinates should be an array of CloudGeoPoint Object';
	                }
	                //2dSphere needs first and last coordinates to be same for polygon type
	                //eg. for Triangle four coordinates need to pass, three points of triangle and fourth one should be same as first one
	                coordinates[coordinates.length] = coordinates[0];
	                var type = 'Polygon';
	                if (!this.query[columnName]) {
	                    this.query[columnName] = {};
	                    this.query[columnName]['$geoWithin'] = {};
	                    this.query[columnName]['$geoWithin']['$geometry'] = {
	                        'type': type,
	                        'coordinates': [coordinates]
	                    };
	                }
	            } else {
	                if (!this.query[columnName]) {
	                    this.query[columnName] = {};
	                    this.query[columnName]['$geoWithin'] = {
	                        '$centerSphere': [geoPoint['document']['coordinates'], radius / 3963.2]
	                    };
	                }
	            }
	        }
	    }, {
	        key: 'count',
	        value: function count(callback) {
	            if (!_CB2.default.appId) {
	                throw "CB.appId is null.";
	            }
	            if (!this.tableName) {
	                throw "TableName is null.";
	            }
	            var def;
	            if (!callback) {
	                def = new _CB2.default.Promise();
	            }
	            var thisObj = this;
	            var params = JSON.stringify({ query: thisObj.query, limit: thisObj.limit, skip: thisObj.skip, key: _CB2.default.appKey });
	            var url = _CB2.default.apiUrl + "/data/" + _CB2.default.appId + "/" + thisObj.tableName + '/count';

	            _CB2.default._request('POST', url, params).then(function (response) {
	                response = parseInt(response);
	                if (callback) {
	                    callback.success(response);
	                } else {
	                    def.resolve(response);
	                }
	            }, function (err) {
	                if (callback) {
	                    callback.error(err);
	                } else {
	                    def.reject(err);
	                }
	            });

	            if (!callback) {
	                return def.promise;
	            }
	        }
	    }, {
	        key: 'distinct',
	        value: function distinct(keys, callback) {

	            if (keys === 'id') {
	                keys = '_id';
	            }

	            if (!_CB2.default.appId) {
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
	                def = new _CB2.default.Promise();
	            }

	            var thisObj = this;

	            var params = JSON.stringify({
	                onKey: keys,
	                query: thisObj.query,
	                select: thisObj.select,
	                sort: thisObj.sort,
	                limit: thisObj.limit,
	                skip: thisObj.skip,
	                key: _CB2.default.appKey
	            });
	            var url = _CB2.default.apiUrl + "/data/" + _CB2.default.appId + "/" + thisObj.tableName + '/distinct';

	            _CB2.default._request('POST', url, params).then(function (response) {
	                var object = _CB2.default.fromJSON(JSON.parse(response));
	                if (callback) {
	                    callback.success(object);
	                } else {
	                    def.resolve(object);
	                }
	            }, function (err) {
	                if (callback) {
	                    callback.error(err);
	                } else {
	                    def.reject(err);
	                }
	            });

	            if (!callback) {
	                return def.promise;
	            }
	        }
	    }, {
	        key: 'find',
	        value: function find(callback) {
	            //find the document(s) matching the given query
	            if (!_CB2.default.appId) {
	                throw "CB.appId is null.";
	            }
	            if (!this.tableName) {
	                throw "TableName is null.";
	            }
	            var def;
	            if (!callback) {
	                def = new _CB2.default.Promise();
	            }

	            var thisObj = this;

	            var params = JSON.stringify({
	                query: thisObj.query,
	                select: thisObj.select,
	                sort: thisObj.sort,
	                limit: thisObj.limit,
	                skip: thisObj.skip,
	                key: _CB2.default.appKey
	            });

	            var url = _CB2.default.apiUrl + "/data/" + _CB2.default.appId + "/" + thisObj.tableName + '/find';

	            _CB2.default._request('POST', url, params).then(function (response) {
	                var object = _CB2.default.fromJSON(JSON.parse(response));
	                if (callback) {
	                    callback.success(object);
	                } else {
	                    def.resolve(object);
	                }
	            }, function (err) {
	                if (callback) {
	                    callback.error(err);
	                } else {
	                    def.reject(err);
	                }
	            });

	            if (!callback) {
	                return def.promise;
	            }
	        }
	    }, {
	        key: 'findFromLocalStore',
	        value: function findFromLocalStore(callback) {

	            var thisObj = this;
	            if (!thisObj.tableName) {
	                throw "TableName is null.";
	            }
	            _CB2.default._validate();
	            var def;
	            if (!callback) def = new _CB2.default.Promise();
	            _localforage2.default.getItem(_CB2.default.appId + '-' + thisObj.tableName).then(function (documents) {
	                var cloudObjects = [];
	                var cloudObject = null;
	                if (documents) documents.forEach(function (document) {
	                    cloudObject = _CB2.default.fromJSON(document);
	                    if (CloudQuery._validateQuery(cloudObject, thisObj.query)) cloudObjects.push(cloudObject);
	                });
	                if (!callback) {
	                    def.resolve(cloudObjects);
	                } else {
	                    callback.success(cloudObjects);
	                }
	            }).catch(function (err) {
	                if (!callback) {
	                    def.reject(err);
	                } else {
	                    callback.error(err);
	                }
	            });
	            if (!callback) {
	                return def.promise;
	            }
	        }
	    }, {
	        key: 'get',
	        value: function get(objectId, callback) {
	            var query = new _CB2.default.CloudQuery(this.tableName);
	            return query.findById(objectId, callback);
	        }
	    }, {
	        key: 'findById',
	        value: function findById(objectId, callback) {
	            //find the document(s) matching the given query

	            var thisObj = this;

	            if (!_CB2.default.appId) {
	                throw "CB.appId is null.";
	            }
	            if (!this.tableName) {
	                throw "TableName is null.";
	            }
	            var def;
	            if (!callback) {
	                def = new _CB2.default.Promise();
	            }

	            if (thisObj.skip && !thisObj.skip !== 0) {
	                throw "You cannot use skip and find object by Id in the same query";
	            }

	            if (thisObj.limit && thisObj.limit === 0) {
	                throw "You cannot use limit and find object by Id in the same query";
	            }

	            if (thisObj.sort && Object.getOwnPropertyNames(thisObj.sort).length > 0) {
	                throw "You cannot use sort and find object by Id in the same query";
	            }

	            thisObj.equalTo('id', objectId);

	            var params = JSON.stringify({
	                query: thisObj.query,
	                select: thisObj.select,
	                key: _CB2.default.appKey,
	                limit: 1,
	                skip: 0,
	                sort: {}
	            });

	            var url = _CB2.default.apiUrl + "/data/" + _CB2.default.appId + "/" + thisObj.tableName + '/find';

	            _CB2.default._request('POST', url, params).then(function (response) {
	                response = JSON.parse(response);
	                if (Object.prototype.toString.call(response) === '[object Array]') {
	                    response = response[0];
	                }
	                if (callback) {
	                    callback.success(_CB2.default.fromJSON(response));
	                } else {
	                    def.resolve(_CB2.default.fromJSON(response));
	                }
	            }, function (err) {
	                if (callback) {
	                    callback.error(err);
	                } else {
	                    def.reject(err);
	                }
	            });

	            if (!callback) {
	                return def.promise;
	            }
	        }
	    }, {
	        key: 'findOne',
	        value: function findOne(callback) {
	            //find a single document matching the given query
	            if (!_CB2.default.appId) {
	                throw "CB.appId is null.";
	            }
	            if (!this.tableName) {
	                throw "TableName is null.";
	            }
	            var def;
	            if (!callback) {
	                def = new _CB2.default.Promise();
	            }
	            var params = JSON.stringify({ query: this.query, select: this.select, sort: this.sort, skip: this.skip, key: _CB2.default.appKey });
	            var url = _CB2.default.apiUrl + "/data/" + _CB2.default.appId + "/" + this.tableName + '/findOne';

	            _CB2.default._request('POST', url, params).then(function (response) {
	                var object = _CB2.default.fromJSON(JSON.parse(response));
	                if (callback) {
	                    callback.success(object);
	                } else {
	                    def.resolve(object);
	                }
	            }, function (err) {
	                if (callback) {
	                    callback.error(err);
	                } else {
	                    def.reject(err);
	                }
	            });

	            if (!callback) {
	                return def.promise;
	            }
	        }
	    }]);

	    return CloudQuery;
	}();

	// Logical operations


	CloudQuery.or = function (obj1, obj2) {

	    var tableName;
	    var queryArray = [];

	    if (Object.prototype.toString.call(obj1) === "[object Array]") {
	        tableName = obj1[0].tableName;
	        for (var i = 0; i < obj1.length; ++i) {
	            if (obj1[i].tableName != tableName) {
	                throw "Table names are not same";
	                break;
	            }
	            if (!obj1[i] instanceof _CB2.default.CloudQuery) {
	                throw "Array items are not instanceof of CloudQuery";
	                break;
	            }
	            queryArray.push(obj1[i].query);
	        }
	    }

	    if (typeof obj2 !== 'undefined' && typeof obj1 !== 'undefined' && Object.prototype.toString.call(obj1) !== "[object Array]") {

	        if (Object.prototype.toString.call(obj2) === "[object Array]") {
	            throw "First and second parameter should be an instance of CloudQuery object";
	        }
	        if (!obj1.tableName === obj2.tableName) {
	            throw "Table names are not same";
	        }
	        if (!obj1 instanceof _CB2.default.CloudQuery) {
	            throw "Data passed is not an instance of CloudQuery";
	        }
	        if (!obj2 instanceof _CB2.default.CloudQuery) {
	            throw "Data passed is not an instance of CloudQuery";
	        }
	        tableName = obj1.tableName;
	        queryArray.push(obj1.query);
	        queryArray.push(obj2.query);
	    }
	    if (typeof tableName === 'undefined') {
	        throw "Invalid operation";
	    }
	    var obj = new _CB2.default.CloudQuery(tableName);
	    obj.query["$or"] = queryArray;
	    return obj;
	};
	CloudQuery._validateQuery = function (cloudObject, query) {
	    //validate query.
	    for (var key in query) {

	        if (query[key]) {
	            var value = query[key];
	            if ((typeof value === 'undefined' ? 'undefined' : _typeof(value)) === 'object') {

	                if (key === '$or') {
	                    if (query[key].length > 0) {
	                        var isTrue = false;
	                        for (var i = 0; i < query[key].length; i++) {
	                            if (_CB2.default.CloudQuery._validateQuery(cloudObject, query[key][i])) {
	                                isTrue = true;
	                                break;
	                            }
	                        }

	                        if (!isTrue) {
	                            return false;
	                        }
	                    }
	                } else {

	                    for (var objectKeys in value) {
	                        //not equalTo query
	                        if (objectKeys === '$ne') {
	                            if (cloudObject.get(key) === query[key]['$ne']) {
	                                return false;
	                            }
	                        }

	                        //greater than
	                        if (objectKeys === '$gt') {
	                            if (cloudObject.get(key) <= query[key]['$gt']) {
	                                return false;
	                            }
	                        }

	                        //less than
	                        if (objectKeys === '$lt') {
	                            if (cloudObject.get(key) >= query[key]['$lt']) {
	                                return false;
	                            }
	                        }

	                        //greater than and equalTo.
	                        if (objectKeys === '$gte') {
	                            if (cloudObject.get(key) < query[key]['$gte']) {
	                                return false;
	                            }
	                        }

	                        //less than and equalTo.
	                        if (objectKeys === '$lte') {
	                            if (cloudObject.get(key) > query[key]['$lte']) {
	                                return false;
	                            }
	                        }

	                        //exists
	                        if (objectKeys === '$exists') {
	                            if (query[key][objectKeys] && cloudObject.get(key)) {
	                                //do nothing.
	                            } else if (query[key][objectKeys] !== false) {
	                                return false;
	                            }
	                        }

	                        //doesNot exists.
	                        if (objectKeys === '$exists') {
	                            if (!query[key][objectKeys] && cloudObject.get(key)) {
	                                return false;
	                            }
	                        }

	                        //startsWith.
	                        if (objectKeys === '$regex') {

	                            var reg = new RegExp(query[key][objectKeys]);

	                            if (!query[key]['$options']) {
	                                if (!reg.test(cloudObject.get(key))) //test actial regex.
	                                    return false;
	                            } else {
	                                if (query[key]['$options'] === 'im') {
	                                    //test starts with.
	                                    //starts with.
	                                    var value = trimStart('^', query[key][objectKeys]);
	                                    if (cloudObject.get(key).indexOf(value) !== 0) return false;
	                                }
	                            }
	                        }

	                        //containedIn.
	                        if (objectKeys === '$in') {

	                            if (query[key][objectKeys]) {
	                                var arr = query[key][objectKeys];
	                                var value = null;
	                                if (key.indexOf('.') > -1) {
	                                    //for CloudObjects
	                                    value = cloudObject.get(key.substr(0, key.indexOf('.')));
	                                } else {
	                                    value = cloudObject.get(key);
	                                }

	                                if (Object.prototype.toString.call(value) === '[object Array]') {
	                                    var exists = false;
	                                    for (var i = 0; i < value.length; i++) {
	                                        if (value[i] instanceof _CB2.default.CloudObject) {
	                                            if (arr.indexOf(value[i].id) > -1) {
	                                                exists = true;
	                                                break;
	                                            }
	                                        } else {
	                                            if (arr.indexOf(value[i]) > -1) {
	                                                exists = true;
	                                                break;
	                                            }
	                                        }
	                                    }

	                                    if (!exists) {
	                                        return false;
	                                    }
	                                } else {
	                                    //if the element is not in the array then return false;
	                                    if (arr.indexOf(value) === -1) return false;
	                                }
	                            }
	                        }

	                        //doesNot containedIn.
	                        if (objectKeys === '$nin') {
	                            if (query[key][objectKeys]) {
	                                var arr = query[key][objectKeys];
	                                var value = null;
	                                if (key.indexOf('.') > -1) {
	                                    //for CloudObjects
	                                    value = cloudObject.get(key.substr(0, key.indexOf('.')));
	                                } else {
	                                    value = cloudObject.get(key);
	                                }

	                                if (Object.prototype.toString.call(value) === '[object Array]') {
	                                    var exists = false;
	                                    for (var i = 0; i < value.length; i++) {
	                                        if (value[i] instanceof _CB2.default.CloudObject) {
	                                            if (arr.indexOf(value[i].id) !== -1) {
	                                                exists = true;
	                                                break;
	                                            }
	                                        } else {
	                                            if (arr.indexOf(value[i]) !== -1) {
	                                                exists = true;
	                                                break;
	                                            }
	                                        }
	                                    }

	                                    if (exists) {
	                                        return false;
	                                    }
	                                } else {
	                                    //if the element is not in the array then return false;
	                                    if (arr.indexOf(value) !== -1) return false;
	                                }
	                            }
	                        }

	                        //containsAll.
	                        if (objectKeys === '$all') {
	                            if (query[key][objectKeys]) {
	                                var arr = query[key][objectKeys];
	                                var value = null;
	                                if (key.indexOf('.') > -1) {
	                                    //for CloudObjects
	                                    value = cloudObject.get(key.substr(0, key.indexOf('.')));
	                                } else {
	                                    value = cloudObject.get(key);
	                                }

	                                if (Object.prototype.toString.call(value) === '[object Array]') {
	                                    for (var i = 0; i < value.length; i++) {
	                                        if (value[i] instanceof _CB2.default.CloudObject) {
	                                            if (arr.indexOf(value[i].id) === -1) {
	                                                return false;
	                                            }
	                                        } else {
	                                            if (arr.indexOf(value[i]) === -1) {
	                                                return false;
	                                            }
	                                        }
	                                    }
	                                } else {
	                                    //if the element is not in the array then return false;
	                                    if (arr.indexOf(value) === -1) return false;
	                                }
	                            }
	                        }
	                    }
	                }
	            } else {
	                //it might be a plain equalTo query.
	                if (key.indexOf('.') !== -1) {
	                    // for keys with "key._id" - This is for CloudObjects.
	                    var temp = key.substring(0, key.indexOf('.'));
	                    if (!cloudObject.get(temp)) {
	                        return false;
	                    }

	                    if (cloudObject.get(temp).id !== query[key]) {
	                        return false;
	                    }
	                } else {
	                    if (cloudObject.get(key) !== query[key]) {
	                        return false;
	                    }
	                }
	            }
	        }
	    }

	    return true;
	};

	_CB2.default.CloudQuery = CloudQuery;

	exports.default = _CB2.default.CloudQuery;

/***/ }
/******/ ])
});
;