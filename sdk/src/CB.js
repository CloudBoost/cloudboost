import Promise_BlueBird from 'bluebird'

class CloudBoost {
	constructor(){
        // to check if the env is node
		this._isNode = false
        // to check if env is native ( react native , native script etc. )
        this._isNative = false
		this.Socket = null
		this.io = null //socket.io library is saved here.
		this.apiUrl = 'https://api.cloudboost.io'
		if (typeof(process) !== "undefined" &&
		    process.versions &&
		    process.versions.node) {
		    this._isNode = true
		} else {
		    this._isNode = false
		}
        this.Events = {trigger:this.trigger.bind(this)}
	}
    _ajaxIE8(method, url, data){
        var promise = new this.Promise();
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
    }
    trigger(events) {
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
    Promise(){
        var resolve, reject;
        var promise = new Promise_BlueBird(function() {
            resolve = arguments[0];
            reject = arguments[1];
        });
        return {
            resolve: resolve,
            reject: reject,
            promise: promise
        }
    }
}

let CB = new CloudBoost()


// inheriting BlueBird Promise Library
if(Object.setPrototypeOf){
    Object.setPrototypeOf(CB.Promise,Promise_BlueBird)
} else {
    CB.Promise.prototype = Promise_BlueBird.prototype
}

export default CB






