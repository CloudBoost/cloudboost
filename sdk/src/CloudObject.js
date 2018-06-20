import CB from './CB'
import localforage from 'localforage'

/*
 CloudObject
 */
class CloudObject {
    constructor(tableName, id) { //object for documents
        this.document = {};
        this.document._tableName = tableName; //the document object
        this.document.ACL = new CB.ACL(); //ACL(s) of the document
        this.document._type = 'custom';
        this.document.expires = null;
        this.document._hash = CB._generateHash();

        if (!id) {
            this.document._modifiedColumns = ['createdAt', 'updatedAt', 'ACL', 'expires'];
            this.document._isModified = true;
        } else {
            this.document._modifiedColumns = [];
            this.document._isModified = false;
            this.document._id = id;
        }
    };
    /* RealTime implementation ends here.  */

    set(columnName, data) { //for setting data for a particular column

        var keywords = ['_tableName', '_type', 'operator'];

        if (columnName === 'id' || columnName === '_id')
            throw "You cannot set the id of a CloudObject";

        if (columnName === 'id')
            columnName = '_' + columnName;

        if (keywords.indexOf(columnName) > -1) {
            throw columnName + " is a keyword. Please choose a different column name.";
        }
        this.document[columnName] = data;
        CB._modified(this, columnName);
    };

    relate(columnName, objectTableName, objectId) { //for setting data for a particular column

        var keywords = ['_tableName', '_type', 'operator'];

        if (columnName === 'id' || columnName === '_id')
            throw "You cannot set the id of a CloudObject";

        if (columnName === 'id')
            throw "You cannot link an object to this column";

        if (keywords.indexOf(columnName) > -1) {
            throw columnName + " is a keyword. Please choose a different column name.";
        }

        this.document[columnName] = new CB.CloudObject(objectTableName, objectId);
        CB._modified(this, columnName);
    };

    get(columnName) { //for getting data of a particular column

        if (columnName === 'id')
            columnName = '_' + columnName;

        return this.document[columnName];

    };

    unset(columnName) { //to unset the data of the column
        this.document[columnName] = null;
        CB._modified(this, columnName);
    };

    /**
     * Saved CloudObject in Database.
     * @param callback
     * @returns {*}
     */

    save(callback) { //save the document to the db
        var def;
        CB._validate();

        if (!callback) {
            def = new CB.Promise();
        }
        var thisObj = this;
        CB._fileCheck(this).then(function(thisObj) {

            var params = JSON.stringify({document: CB.toJSON(thisObj), key: CB.appKey});
            var url = CB.apiUrl + "/data/" + CB.appId + '/' + thisObj.document._tableName;
            CB._request('PUT', url, params).then(function(response) {
                thisObj = CB.fromJSON(JSON.parse(response), thisObj);
                if (callback) {
                    callback.success(thisObj);
                } else {
                    def.resolve(thisObj);
                }
            }, function(err) {
                if (callback) {
                    callback.error(err);
                } else {
                    def.reject(err);
                }
            });

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

    pin(callback) { //pins the document to the local store
        CB.CloudObject.pin(this, callback);
    };

    unPin(callback) { //pins the document to the local store
        CB.CloudObject.unPin(this, callback);
    };

    saveEventually(callback) {

        var thisObj = this;
        var def;
        if (!callback) {
            def = new CB.Promise();
        }
        CB._validate();
        localforage.getItem('cb-saveEventually-' + CB.appId).then(function(value) {
            var arr = [];
            if (value)
                arr = value;
            arr.push({saved: false, document: CB.toJSON(thisObj)});
            localforage.setItem('cb-saveEventually-' + CB.appId, arr).then(function(value) {
                CloudObject.pin(thisObj, {
                    success: function(obj) {
                        if (!callback) {
                            def.resolve(value);
                        } else {
                            callback.success(value);
                        }
                    },
                    error: function(err) {
                        if (!callback) {
                            def.reject(err);
                        } else {
                            callback.error(err);
                        }
                    }
                });
            }).catch(function(err) {
                if (!callback) {
                    def.reject(err);
                } else {
                    callback.error(err);
                }
            });
        }).catch(function(err) {
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

    disableSync(callback) {
        CB.CloudObject.disableSync(this.document, callback);
    }

    fetch(callback) { //fetch the document from the db
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
        if (thisObj.document._type === 'file') {
            query = new CB.CloudQuery('_File');
        } else {
            query = new CB.CloudQuery(thisObj.document._tableName);
        }
        query.findById(thisObj.get('id')).then(function(res) {
            if (!callback) {
                def.resolve(res);
            } else {
                callback.success(res);
            }
        }, function(err) {
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

    delete(callback) { //delete an object matching the objectId
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

        var params = JSON.stringify({key: CB.appKey, document: CB.toJSON(thisObj), method: "DELETE"});

        var url = CB.apiUrl + "/data/" + CB.appId + '/' + thisObj.document._tableName;

        CB._request('PUT', url, params).then(function(response) {
            thisObj = CB.fromJSON(JSON.parse(response), thisObj);
            if (callback) {
                callback.success(thisObj);
            } else {
                def.resolve(thisObj);
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

Object.defineProperty(CloudObject.prototype, 'ACL', {
    get: function() {
        return this.document.ACL;
    },
    set: function(ACL) {
        this.document.ACL = ACL;
        this.document.ACL.parent = this;
        CB._modified(this, 'ACL');
    }
});

Object.defineProperty(CloudObject.prototype, 'id', {
    get: function() {
        return this.document._id;
    }
});

Object.defineProperty(CloudObject.prototype, 'createdAt', {
    get: function() {
        return this.document.createdAt;
    }
});

Object.defineProperty(CloudObject.prototype, 'updatedAt', {
    get: function() {
        return this.document.updatedAt;
    }
});

/* For Expire of objects */
Object.defineProperty(CloudObject.prototype, 'expires', {
    get: function() {
        return this.document.expires;
    },
    set: function(expires) {
        this.document.expires = expires;
        CB._modified(this, 'expires');
    }
});

/* This is Real time implementation of CloudObjects */
CloudObject.on = function(tableName, eventType, cloudQuery, callback, done) {

    if (CB._isRealtimeDisabled) {
        throw "Realtime is disbaled for this app.";
    }

    var def;

    //shift variables.
    if (cloudQuery && !(cloudQuery instanceof CB.CloudQuery)) {
        //this is a function.
        if (callback !== null && typeof callback === 'object') {
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
    if (cloudQuery && cloudQuery instanceof CB.CloudQuery) {

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
            CB.CloudObject.on(tableName, eventType[i], cloudQuery, callback);
            if (i == (eventType.length - 1)) {
                if (done && done.success)
                    done.success();
                else
                    def.resolve();
                }
            }
    } else {

        eventType = eventType.toLowerCase();
        if (eventType === 'created' || eventType === 'updated' || eventType === 'deleted') {
            //var timestamp = Date.now();
            var timestamp = CB._generateHash();
            var payload = {
                room: (CB.appId + 'table' + tableName + eventType).toLowerCase() + timestamp,
                sessionId: CB._getSessionId(),
                data: {
                    query: cloudQuery,
                    timestamp: timestamp,
                    eventType: eventType,
                    appKey: CB.appKey
                }
            };

            CB.Socket.emit('join-object-channel', payload);
            CB.Socket.on(payload.room, function(data) { //listen to events in custom channel.
                data = JSON.parse(data);
                data = CB.fromJSON(data);
                if (cloudQuery && cloudQuery instanceof CB.CloudQuery && CB.CloudObject._validateNotificationQuery(data, cloudQuery))
                    callback(data);
                else if (!cloudQuery)
                    callback(data);
                }
            );

            if (done && done.success)
                done.success();
            else
                def.resolve();
            }
        else {
            throw 'created, updated, deleted are supported notification types.';
        }
    }

    if (!done) {
        return def.promise;
    }
};

CloudObject.off = function(tableName, eventType, done) {

    if (CB._isRealtimeDisabled) {
        throw "Realtime is disbaled for this app.";
    }

    var def;

    if (!done) {
        def = new CB.Promise();
    }

    tableName = tableName.toLowerCase();

    if (eventType instanceof Array) {
        //if event type is an array.
        for (var i = 0; i < eventType.length; i++) {
            CB.CloudObject.off(tableName, eventType[i]);
            if (i == (eventType.length - 1)) {
                if (done && done.success)
                    done.success();
                else
                    def.resolve()
            }
        }
    } else {

        eventType = eventType.toLowerCase();
        //        var timestamp = Date.now();
        var timestamp = CB._generateHash();
        if (eventType === 'created' || eventType === 'updated' || eventType === 'deleted') {
            CB.Socket.emit('leave-object-channel', {
                event: (CB.appId + 'table' + tableName + eventType).toLowerCase(),
                timestamp: timestamp,
                eventType: eventType
            });
            CB.Socket.on('leave' + (CB.appId + 'table' + tableName + eventType).toLowerCase() + timestamp, function(data) {
                CB.Socket.removeAllListeners((CB.appId + 'table' + tableName + eventType).toLowerCase() + data);
            });
            if (done && done.success)
                done.success();
            else
                def.resolve();
            }
        else {
            throw 'created, updated, deleted are supported notification types.';
        }
    }

    if (!done) {
        return def.promise;
    }
};

CloudObject.saveAll = function(array, callback) {

    if (!array || array.constructor !== Array) {
        throw "Array of CloudObjects is Null";
    }

    for (var i = 0; i < array.length; i++) {
        if (!(array[i]instanceof CB.CloudObject)) {
            throw "Should Be an Array of CloudObjects";
        }
    }

    var def;
    if (!callback) {
        def = new CB.Promise();
    }

    CB._bulkObjFileCheck(array).then(function() {

        var params = JSON.stringify({document: CB.toJSON(array), key: CB.appKey});
        var url = CB.apiUrl + "/data/" + CB.appId + '/' + array[0]._tableName;
        CB._request('PUT', url, params).then(function(response) {
            var thisObj = CB.fromJSON(JSON.parse(response));
            if (callback) {
                callback.success(thisObj);
            } else {
                def.resolve(thisObj);
            }
        }, function(err) {
            if (callback) {
                callback.error(err);
            } else {
                def.reject(err);
            }
        });

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

CloudObject.deleteAll = function(array, callback) {

    if (!array && array.constructor !== Array) {
        throw "Array of CloudObjects is Null";
    }

    for (var i = 0; i < array.length; i++) {
        if (!(array[i]instanceof CB.CloudObject)) {
            throw "Should Be an Array of CloudObjects";
        }
    }

    var def;
    if (!callback) {
        def = new CB.Promise();
    }

    var params = JSON.stringify({document: CB.toJSON(array), key: CB.appKey, method: "DELETE"});
    var url = CB.apiUrl + "/data/" + CB.appId + '/' + array[0]._tableName;
    CB._request('PUT', url, params).then(function(response) {
        var thisObj = CB.fromJSON(JSON.parse(response));
        if (callback) {
            callback.success(thisObj);
        } else {
            def.resolve(thisObj);
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

CloudObject.pin = function(cloudObjects, callback) {

    

    if (!cloudObjects)
        throw "cloudObject(s) is required.";
    var def;
    if (!callback)
        def = new CB.Promise();
    CB._validate();
    if (!(cloudObjects instanceof Array)) {
        cloudObjects = [cloudObjects];
        CloudObject.pin(cloudObjects, callback);
    } else {
        var groupedObjects = _groupObjects(cloudObjects);
        groupedObjects.forEach((object) => {
            var arr = [];
            localforage.getItem(CB.appId + '-' + object.tableName).then(function(value) {
                if (value)
                    arr = value;
                localforage.setItem(CB.appId + '-' + object.tableName, arr.concat(object.object)).then(function(value) {
                    if (!callback) {
                        def.resolve(value);
                    } else {
                        callback.success(value);
                    }
                }).catch(function(err) {
                    if (!callback) {
                        def.reject(err);
                    } else {
                        callback.error(err);
                    }
                });

            }).catch(function(err) {
                if (!callback) {
                    def.reject(err);
                } else {
                    callback.error(err);
                }
            });
        })

    }
    if (!callback) {
        return def.promise;
    }
}

CloudObject.unPin = function(cloudObjects, callback) {

    if (!cloudObjects)
        throw "cloudObject(s) is required.";
    var def;
    if (!callback)
        def = new CB.Promise();
    CB._validate();
    if (!(cloudObjects instanceof Array)) {
        cloudObjects = [cloudObjects];
        CloudObject.unPin(cloudObjects);
    } else {
        var groupedObjects = _groupObjects(cloudObjects);
        groupedObjects.forEach((object) => {
            localforage.getItem(CB.appId + '-' + object.tableName).then(function(objects) {
                var arr = [];
                objects.forEach((obj) => {
                    object.object.forEach((cloudObject) => {
                        if (cloudObject._hash != obj._hash) {
                            arr.push(obj);
                        }
                    });
                });
                localforage.setItem(CB.appId + '-' + object.tableName, arr).then(function(obj) {
                    if (!callback) {
                        def.resolve(obj);
                    } else {
                        callback.success(obj);
                    }
                }).catch(function(err) {
                    if (!callback) {
                        def.reject(err);
                    } else {
                        callback.error(err);
                    }
                })

            }).catch(function(err) {
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

}

CloudObject.clearLocalStore = function(callback) {
    CB._validate();
    var def;
    if (!callback)
        def = new CB.Promise();
    localforage.clear().then(function() {
        if (!callback) {
            def.resolve();
        } else {
            callback.success();
        }
    }).catch(function(err) {
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

function _groupObjects(objects) {
    var groups = {};
    for (var i = 0; i < objects.length; i++) {
        if (!(objects[i]instanceof CB.CloudObject)) {
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
        objects.push({tableName: groupName, object: groups[groupName]});
    }
    return objects;
}

CloudObject.sync = function(callback) {
        
    var def;
    if (!callback)
        def = new CB.Promise();
    CB._validate();
    if (CB.CloudApp._isConnected) {
        localforage.getItem('cb-saveEventually-' + CB.appId).then(function(documents) {
            var cloudObjects = [];
            var count = 0;
            var cloudObject = null;
            if (documents) {
                var length = documents.length;

                documents.forEach((document) => {
                    length--;
                    if (!document.saved) {
                        cloudObject = CB.fromJSON(document.document);
                        cloudObject.save({
                            success: function(obj) {
                                count++;
                                CB.CloudObject.disableSync(document.document, {
                                    success: function(obj) {
                                        if (!callback) {
                                            def.resolve(count);
                                        } else {
                                            callback.success(count);
                                        }
                                    },
                                    error: function(err) {
                                        if (!callback) {
                                            def.reject(err);
                                        } else {
                                            callback.error(err);
                                        }
                                    }
                                })
                            },
                            error: function(err) {
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
        }).catch(function(err) {
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
}

CloudObject.disableSync = function(document, callback) {

    var def;
    if (!callback)
        def = new CB.Promise();
    CB._validate();
    localforage.getItem('cb-saveEventually-' + CB.appId).then(function(values) {
        var arr = [];
        values.forEach((value) => {
            if (value.document._hash != document._hash)
                arr.push(value);
            }
        );
        localforage.setItem('cb-saveEventually-' + CB.appId, arr).then(function(obj) {
            if (!callback) {
                def.resolve(obj);
            } else {
                callback.success(obj);
            }
        }).catch(function(err) {
            if (!callback) {
                def.reject(err);
            } else {
                callback.error(err);
            }
        })

    }).catch(function(err) {
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

/* Private Methods */
CloudObject._validateNotificationQuery = function(cloudObject, cloudQuery) { //delete an object matching the objectId

    if (!cloudQuery)
        throw "CloudQuery is null";

    if (!cloudQuery.query)
        throw "There is no query in CloudQuery";

    //validate query.
    var query = cloudQuery.query;

    if (cloudQuery.limit === 0)
        return false;

    if (cloudQuery.skip > 0) {
        --cloudQuery.skip;
        return false;
    }

    //redice limit of CloudQuery.
    --cloudQuery.limit;
    return true;

};

CB.CloudObject = CloudObject;
export default CB.CloudObject
