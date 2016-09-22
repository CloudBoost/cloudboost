
/*
#     CloudBoost - Core Engine that powers Bakend as a Service
#     (c) 2014 HackerBay, Inc. 
#     CloudBoost may be freely distributed under the Apache 2 License
*/


var q = require('q');

module.exports = function () {
    return {
        _makeHashKey: function (appId, cacheName) {
            try{
                return appId + ":" + cacheName;
            }catch(err){
                global.winston.log('error',{"error":String(err),"stack": new Error().stack});
                return null;
            }
        },

        _makeCacheDocument : function(cacheName, size) {
            try{
                return { _type : 'cache', name: cacheName, size : size };
            }catch(err){
                global.winston.log('error',{"error":String(err),"stack": new Error().stack});
                return null;
            }
        },

        _getCaches: function (cacheName) {
            var deferred = q.defer();

            try{
                global.redisClient.hvals(cacheName, function (err, cacheItems) {
                    if (err) {
                        deferred.reject(err);
                    } else {
                        var cacheDocument = { _type : 'cache', name: null, size : null, items: null };
                        cacheDocument.name = String(cacheName).slice(cacheName.indexOf(":") + 1, cacheName.length);
                        cacheDocument.size = String(parseFloat(Buffer.byteLength(cacheItems, 'utf8') / 1025).toFixed(4)) + "kb";
                        cacheDocument.items = cacheItems;

                    }
                    deferred.resolve(cacheDocument);
                });

            } catch(err){           
                global.winston.log('error',{"error":String(err),"stack": new Error().stack});
                deferred.reject(err);
            }
            return deferred.promise;
        },


        create: function (appId, cacheName) {

            var deferred = q.defer();

            try{
                var hashKey = global.cacheService._makeHashKey(appId, cacheName);                
                global.redisClient.hset(appId, hashKey, hashKey, function (err) {
                    if (err)
                        deferred.reject(err);
                    deferred.resolve(global.cacheService._makeCacheDocument(cacheName, "0kb"));
                });
            } catch(err){           
                global.winston.log('error',{"error":String(err),"stack": new Error().stack});
                deferred.reject(err);
            }
            
            return deferred.promise;
        },

        put: function (appId, cacheName, key, item) {
            var deferred = q.defer();
            try{
                var namespace = key;
                var hashKey = global.cacheService._makeHashKey(appId, cacheName);
                global.redisClient.hset(hashKey, namespace, JSON.stringify(item), function (err) {
                    if (err)
                        deferred.reject(err);
                    global.redisClient.hset(appId, hashKey, hashKey);
                    deferred.resolve(item);
                });
            } catch(err){           
                global.winston.log('error',{"error":String(err),"stack": new Error().stack});
                deferred.reject(err);
            }
            return deferred.promise;
        },
        getItem: function (appId, cacheName, key) {
            var deferred = q.defer();

            try{
                var namespace = key;
                var hashKey = global.cacheService._makeHashKey(appId, cacheName);
                global.redisClient.hget(hashKey, namespace, function (err, result) {
                    if (err)
                        deferred.reject(err);
                    deferred.resolve(JSON.parse(result));
                });
            } catch(err){           
                global.winston.log('error',{"error":String(err),"stack": new Error().stack});
                deferred.reject(err);
            }

            return deferred.promise;
        },
        getAllItems: function (appId, cacheName) {
            var deferred = q.defer();

            try{
                var hashKey = global.cacheService._makeHashKey(appId, cacheName);
                global.redisClient.hgetall(hashKey, function (err, items) {
                    if (err) deferred.reject(err);
                    var values = [];
                    for (var prop in items) {
                        values.push({key :prop, value : JSON.parse(items[prop])});
                    }
                    deferred.resolve(values);
                });

            } catch(err){           
                global.winston.log('error',{"error":String(err),"stack": new Error().stack});
                deferred.reject(err);
            }

            return deferred.promise;
        },
        getItemsCount: function (appId, cacheName) {
            var deferred = q.defer();

            try{
                var hashKey = global.cacheService._makeHashKey(appId, cacheName);
                global.redisClient.hlen(hashKey, function (err, count) {
                    if (err) deferred.reject(err);
                    deferred.resolve(count);
                });

            } catch(err){           
                global.winston.log('error',{"error":String(err),"stack": new Error().stack});
                deferred.reject(err);
            }
            return deferred.promise;
        },
        getInfo: function (appId, cacheName) {
            var deferred = q.defer();

            try{
                var hashKey = global.cacheService._makeHashKey(appId, cacheName);

                global.redisClient.hget(appId, hashKey, function (err, value) {
                    if (err) deferred.reject(err);
                    if (!value) {
                        deferred.resolve(null);
                    } else {
                        global.redisClient.hvals(hashKey, function (err, caches) {
                            if (err) deferred.reject(err);
                            var cacheSize = String(parseFloat(Buffer.byteLength(caches, 'utf8') / 1025).toFixed(4)) + "kb";
                            deferred.resolve(global.cacheService._makeCacheDocument(cacheName, cacheSize));
                        });
                    }

                });

            } catch(err){           
                global.winston.log('error',{"error":String(err),"stack": new Error().stack});
                deferred.reject(err);
            }

            return deferred.promise;
        },
        getCache: function (appId, cacheName) {
            var deferred = q.defer();

            try{
                var hashKey = global.cacheService._makeHashKey(appId, cacheName);
                global.redisClient.hvals(hashKey, function (err, caches) {
                    if (err) deferred.reject(err);
                    var cacheDocument = { _type : 'cache', name: null, size : null, items: [] };
                    cacheDocument.name = String(cacheName).slice(cacheName.indexOf(":") + 1, cacheName.length);
                    cacheDocument.size = String(parseFloat(Buffer.byteLength(caches, 'utf8') / 1025).toFixed(4)) + "kb";
                    cacheDocument.items.push(JSON.parse(caches));
                    deferred.resolve(cacheDocument);
                });

            } catch(err){           
                global.winston.log('error',{"error":String(err),"stack": new Error().stack});
                deferred.reject(err);
            }
            return deferred.promise;
        },
        getAllAppCache: function (appId) {
            var deferred = global.q.defer();

            try{
                global.redisClient.hvals(appId, function (err, caches) {
                    if (err)
                        deferred.reject(err);
                    // var i = 0;
                    var promises = [];
                    for (var i = 0; i < caches.length; i++) {
                        promises.push(global.cacheService._getCaches(caches[i]));
                    }
                    q.all(promises).then(function (cacheItems) {
                        deferred.resolve(cacheItems);
                    }, function (err) {
                        deferred.reject(err)
                    });

                });
            } catch(err){           
                global.winston.log('error',{"error":String(err),"stack": new Error().stack});
                deferred.reject(err);
            }

            return deferred.promise;
        },

        deleteCache: function (appId, cacheName) {
            var deferred = q.defer();
            try{
                var hashKey = global.cacheService._makeHashKey(appId, cacheName);
                global.redisClient.hget(appId, hashKey, function (err, value) {
                    if (err)
                        deferred.reject(err);
                    if (!value) {
                        deferred.reject("Cache does not exist");
                    } else {
                        global.redisClient.del(hashKey, function (err, caches) {
                            if (err)
                                deferred.reject(err);

                            global.redisClient.hdel(appId, hashKey, function (err, caches) {
                                if (err)
                                    deferred.reject(err);
                                deferred.resolve(global.cacheService._makeCacheDocument(cacheName, "0kb"));
                            });

                        });
                    }
                });

            } catch(err){           
                global.winston.log('error',{"error":String(err),"stack": new Error().stack});
                deferred.reject(err);
            }

            return deferred.promise;
        },

        deleteItem: function (appId, cacheName, key) {
            var deferred = q.defer();

            try{

                var hashKey = global.cacheService._makeHashKey(appId, cacheName);
                global.redisClient.hdel(hashKey, key, function (err, item) {
                    if (err)
                        deferred.reject(err);
                    deferred.resolve(key);
                });

            } catch(err){           
                global.winston.log('error',{"error":String(err),"stack": new Error().stack});
                deferred.reject(err);
            }
            return deferred.promise;
        },

        clearCache: function (appId, cacheName) {
            var deferred = q.defer();

            try{
                var hashKey = global.cacheService._makeHashKey(appId, cacheName);
                global.redisClient.hget(appId, hashKey, function (err, value) {
                    if (err)
                        deferred.reject(err);
                    if (!value) {
                        deferred.reject("Cache does not exist");
                    } else {
                        global.redisClient.del(hashKey, function (err, caches) {
                            if (err)
                                deferred.reject(err);
                            deferred.resolve(global.cacheService._makeCacheDocument(cacheName, "0kb"));
                        });
                    }
                });

            } catch(err){           
                global.winston.log('error',{"error":String(err),"stack": new Error().stack});
                deferred.reject(err);
            }

            return deferred.promise;
        },

        deleteAllAppCache: function (appId) {
            var deferred = q.defer();

            try{
                global.redisClient.hvals(appId, function (err, caches) {
                    if (err)
                        deferred.reject(err);
                    var promises = [];
                    for (var i = 0; i < caches.length; i++) {
                        promises.push(global.cacheService.deleteCache(appId, caches[i].split(':')[1]));
                    }

                    global.q.all(promises).then(function (values) {
                        deferred.resolve(values);
                    }, function (error) {
                        deferred.reject(error);
                    });

                    deferred.resolve(caches);

                });

            } catch(err){           
                global.winston.log('error',{"error":String(err),"stack": new Error().stack});
                deferred.reject(err);
            }
            return deferred.promise;
        }

    };

};

