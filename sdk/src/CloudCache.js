import CB from './CB'
/*
 CloudCache
 */

class CloudCache {
    constructor(cacheName) {
        if (typeof cacheName === 'undefined' || cacheName === null || cacheName === '') {
            throw "Cannot create a cache with empty name";
        }
        this.document = {};
        this.document._tableName = "cache";
        this.document.name = cacheName;
        this.document.size = "";
        this.document.items = [];
    }

    set(key, value, callback) {
        var def;
        CB._validate();

        if (!callback) {
            def = new CB.Promise();
        }

        if (typeof value === 'undefined') {
            throw "Value cannot be undefined.";
        }

        var params = JSON.stringify({key: CB.appKey, item: value});

        var url = CB.apiUrl + '/cache/' + CB.appId + '/' + this.document.name + '/' + key;
        CB._request('PUT', url, params, true).then(function(response) {
            if (CB._isJsonString(response)) {
                response = JSON.parse(response);
            }

            var obj = CB.fromJSON(response);
            if (callback) {
                callback.success(obj);
            } else {
                def.resolve(obj);
            }
        }, function(err) {
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

    deleteItem(key, callback) {
        var def;
        CB._validate();

        if (!callback) {
            def = new CB.Promise();
        }

        var params = JSON.stringify({key: CB.appKey, method: "DELETE"});

        var url = CB.apiUrl + '/cache/' + CB.appId + '/' + this.document.name + '/item/' + key;
        CB._request('PUT', url, params, true).then(function(response) {
            if (CB._isJsonString(response)) {
                response = JSON.parse(response);
            }

            var obj = CB.fromJSON(response);
            if (callback) {
                callback.success(obj);
            } else {
                def.resolve(obj);
            }
        }, function(err) {
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

    create(callback) {
        var def;
        CB._validate();

        if (!callback) {
            def = new CB.Promise();
        }

        var params = JSON.stringify({key: CB.appKey});

        var thisObj = this;

        var url = CB.apiUrl + '/cache/' + CB.appId + '/' + this.document.name + '/create';
        CB._request('POST', url, params, true).then(function(response) {
            if (CB._isJsonString(response)) {
                response = JSON.parse(response);
            }
            var obj = CB.fromJSON(response, thisObj);
            if (callback) {
                callback.success(obj);
            } else {
                def.resolve(obj);
            }
        }, function(err) {
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

    get(key, callback) {

        var def;
        CB._validate();

        if (!callback) {
            def = new CB.Promise();
        }

        var params = JSON.stringify({key: CB.appKey});

        var url = CB.apiUrl + '/cache/' + CB.appId + '/' + this.document.name + '/' + key + '/item';
        CB._request('POST', url, params, true).then(function(response) {
            if (CB._isJsonString(response)) {
                response = JSON.parse(response);
            }
            var obj = CB.fromJSON(response);
            if (callback) {
                callback.success(obj);
            } else {
                def.resolve(obj);
            }
        }, function(err) {
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

    getInfo(callback) {
        var def;
        CB._validate();

        if (!callback) {
            def = new CB.Promise();
        }

        var params = JSON.stringify({key: CB.appKey});

        var thisObj = this;

        var url = CB.apiUrl + '/cache/' + CB.appId + '/' + this.document.name;
        CB._request('POST', url, params, true).then(function(response) {
            if (CB._isJsonString(response)) {
                response = JSON.parse(response);
            }
            var obj = CB.fromJSON(response, thisObj);
            if (callback) {
                callback.success(obj);
            } else {
                def.resolve(obj);
            }
        }, function(err) {
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

    getItemsCount(callback) {
        var def;
        CB._validate();

        if (!callback) {
            def = new CB.Promise();
        }

        var params = JSON.stringify({key: CB.appKey});

        var url = CB.apiUrl + '/cache/' + CB.appId + '/' + this.document.name + '/items/count';
        CB._request('POST', url, params, true).then(function(response) {
            if (CB._isJsonString(response)) {
                response = JSON.parse(response);
            }
            var obj = CB.fromJSON(response);
            if (callback) {
                callback.success(obj);
            } else {
                def.resolve(obj);
            }
        }, function(err) {
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

    getAll(callback) {
        var def;
        CB._validate();

        if (!callback) {
            def = new CB.Promise();
        }

        var thisObj = this;

        var params = JSON.stringify({key: CB.appKey});
        var url = CB.apiUrl + '/cache/' + CB.appId + '/' + this.document.name + '/items';
        CB._request('POST', url, params, true).then(function(response) {
            if (CB._isJsonString(response)) {
                response = JSON.parse(response);
            }
            var obj = CB.fromJSON(response);

            thisObj.document.items = obj;

            if (callback) {
                callback.success(obj);
            } else {
                def.resolve(obj);
            }
        }, function(err) {
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

    clear(callback) {
        var def;
        CB._validate();

        if (!callback) {
            def = new CB.Promise();
        }

        var params = JSON.stringify({key: CB.appKey, method: "DELETE"});

        var thisObj = this;

        var url = CB.apiUrl + '/cache/' + CB.appId + '/' + this.document.name + '/clear/items';
        CB._request('PUT', url, params, true).then(function(response) {
            if (CB._isJsonString(response)) {
                response = JSON.parse(response);
            }
            var obj = CB.fromJSON(response, thisObj);
            if (callback) {
                callback.success(obj);
            } else {
                def.resolve(obj);
            }
        }, function(err) {
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

    delete(callback) {
        var def;
        CB._validate();

        if (!callback) {
            def = new CB.Promise();
        }

        var params = JSON.stringify({key: CB.appKey, method: "DELETE"});

        var thisObj = this;

        var url = CB.apiUrl + '/cache/' + CB.appId + '/' + this.document.name;
        CB._request('PUT', url, params, true).then(function(response) {
            if (CB._isJsonString(response)) {
                response = JSON.parse(response);
            }
            var obj = CB.fromJSON(response, thisObj);
            if (callback) {
                callback.success(obj);
            } else {
                def.resolve(obj);
            }
        }, function(err) {
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
}

CloudCache.getAll = function(callback) {
    var def;
    CB._validate();

    if (!callback) {
        def = new CB.Promise();
    }

    var params = JSON.stringify({key: CB.appKey});

    var url = CB.apiUrl + '/cache/' + CB.appId;
    CB._request('POST', url, params, true).then(function(response) {
        if (CB._isJsonString(response)) {
            response = JSON.parse(response);
        }
        var obj = CB.fromJSON(response);
        if (callback) {
            callback.success(obj);
        } else {
            def.resolve(obj);
        }
    }, function(err) {
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

CloudCache.deleteAll = function(callback) {
    var def;
    CB._validate();

    if (!callback) {
        def = new CB.Promise();
    }

    var params = JSON.stringify({key: CB.appKey, method: "DELETE"});

    var url = CB.apiUrl + '/cache/' + CB.appId;
    CB._request('PUT', url, params, true).then(function(response) {
        if (CB._isJsonString(response)) {
            response = JSON.parse(response);
        }
        var obj = CB.fromJSON(response);
        if (callback) {
            callback.success(obj);
        } else {
            def.resolve(obj);
        }
    }, function(err) {
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

Object.defineProperty(CloudCache.prototype, 'name', {
    get: function() {
        return this.document.name;
    }
});

Object.defineProperty(CloudCache.prototype, 'size', {
    get: function() {
        return this.document.size;
    }
});

Object.defineProperty(CloudCache.prototype, 'items', {
    get: function() {
        return this.document.items;
    }
});

CB.CloudCache = CloudCache

export default CB.CloudCache
