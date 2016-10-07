
/*
#     CloudBoost - Core Engine that powers Bakend as a Service
#     (c) 2014 HackerBay, Inc. 
#     CloudBoost may be freely distributed under the Apache 2 License
*/


module.exports = function (){

    //Add Items to the cache.
    global.app.put('/cache/:appId/:name/:key', function(req, res){
        var appId =      req.params.appId;
        var cacheName =  req.params.name;
        var key =        req.params.key;
        var item =       req.body.item;
        var appKey =     req.body.key;
        var sdk = req.body.sdk || "REST";
        global.appService.isMasterKey(appId, appKey).then(function(isMasterKey){
          if(isMasterKey){
            global.cacheService.put(appId, cacheName, key, item).then(function(item){
                console.log('+++ PUT Success +++');
                console.log(item);
                
                //convert number to string because express res.send() considers sending numbber as HTTP Status Code
                if(typeof item === "number"){
                    item = item.toString();
                }
                
                res.status(200).send(item);
            }).catch(function(err){
                console.log('++++++ PUT Error +++++++');
                console.log(err);
                res.status(400).send(err);
            });
        }else{
             res.status(401).send("Unauthorized access. Cache API's can be used only by using master key. ");
        }
     });
     
     global.apiTracker.log(appId,"Cache / Item / Save", req.url,sdk);
      
    });
    
    //Delete Cache
    global.app.delete('/cache/:appId/:name', _deleteCache);
    global.app.put('/cache/:appId/:name', _deleteCache);

    function _deleteCache(req, res){
        var appId =       req.params.appId;
        var cacheName =   req.params.name;
        var appKey =     req.body.key;
        var sdk = req.body.sdk || "REST";
        global.appService.isMasterKey(appId, appKey).then(function(isMasterKey){
            if(isMasterKey){
                global.cacheService.deleteCache(appId, cacheName).then(function(cache){
                    console.log('+++ CACHE DELETE Success +++');
                    console.log(cache);
                    res.status(200).json(cache);
                }).catch(function(err){
                    console.log('++++++ CACHE DELETE Error +++++++');
                    console.log(err);
                    res.status(400).send(err);
                });
            }else{
                res.status(401).send("Unauthorized access. Cache API's can be used only by using master key.");
            }
        });
        
        global.apiTracker.log(appId,"Cache / Delete", req.url,sdk);
    }
    
    //delete item.
    global.app.delete('/cache/:appId/:name/item/:key', _deleteItem);
    global.app.put('/cache/:appId/:name/item/:key', _deleteItem);

    function _deleteItem(req, res){
        var appId =       req.params.appId;
        var cacheName =   req.params.name;
        var key = req.params.key;
        var appKey =     req.body.key;
        var sdk = req.body.sdk || "REST";
        global.appService.isMasterKey(appId, appKey).then(function(isMasterKey){
            if(isMasterKey){
                global.cacheService.deleteItem(appId, cacheName,key).then(function(item){
                    console.log('+++ ITEM DELETE Success +++');
                    console.log(item);
                    res.status(200).json(item);
                }).catch(function(err){
                    console.log('++++++ ITEM DELETE Error +++++++');
                    console.log(err);
                    res.status(400).send(err);
                });
            }else{
                res.status(401).send("Unauthorized access. Cache API's can be used only by using master key.");
            }
        });
        
        global.apiTracker.log(appId,"Cache / Item  / Delete", req.url,sdk);
    }
    
    //Create a Cache
    global.app.post('/cache/:appId/:name/create', function (req, res) {
        var appId = req.params.appId;
        var cacheName = req.params.name;
        var appKey = req.body.key;
        var sdk = req.body.sdk || "REST";
        global.appService.isMasterKey(appId, appKey).then(function (isMasterKey) {
            if (isMasterKey) {
                global.cacheService.create(appId, cacheName).then(function (cache) {
                    console.log('+++ CACHE Create Success +++');
                    console.log(cache);
                    res.status(200).json(cache);
                }).catch(function (err) {
                    console.log('++++++ CACHE Create Error +++++++');
                    console.log(err);
                    res.status(400).send(err);
                });
            } else {
                res.status(401).send("Unauthorized access. Cache API's can be used only by using master key.");
            }
        });
        
        global.apiTracker.log(appId,"Cache / Create", req.url,sdk);
    });
    
    //Clear Cache
    global.app.delete('/cache/:appId/:name/clear', _clearCache);
    global.app.put('/cache/:appId/:name/clear/items', _clearCache);

    function _clearCache(req, res) {
        var appId = req.params.appId;
        var cacheName = req.params.name;
        var appKey = req.body.key;
        var sdk = req.body.sdk || "REST";
        global.appService.isMasterKey(appId, appKey).then(function (isMasterKey) {
            if (isMasterKey) {
                global.cacheService.clearCache(appId, cacheName).then(function (cache) {
                    console.log('+++ CACHE Clear Success +++');
                    console.log(cache);
                    res.status(200).json(cache);
                }).catch(function (err) {
                    console.log('++++++ CACHE Clear Error +++++++');
                    console.log(err);
                    res.status(400).send(err);
                });
            } else {
                res.status(401).send("Unauthorized access. Cache API's can be used only by using master key.");
            }
        });
        
        global.apiTracker.log(appId,"Cache / Clear", req.url,sdk);
    }
    
    //get single item from a cache. 
    global.app.post('/cache/:appId/:name/:key/item', _getItem);
    global.app.get('/cache/:appId/:name/:key/item', _getItem);
    
    //getb all items from a cache. 
    global.app.post('/cache/:appId/:name/items', _getAllItems);
    global.app.get('/cache/:appId/:name/items', _getAllItems);
    
    //get cache info.
    global.app.post('/cache/:appId/:name', _getInfo);
    global.app.get('/cache/:appId/:name', _getInfo);
    
    //get all app cache info.
    global.app.post('/cache/:appId', _getAllAppCache);
    global.app.get('/cache/:appId', _getAllAppCache);
    
    //get items count.
    global.app.post('/cache/:appId/:name/items/count', _getItemsCount);
    global.app.get('/cache/:appId/:name/items/count', _getItemsCount);
    
    
    //Delete All Caches
    global.app.delete('/cache/:appId', _deleteAllCache);
    global.app.put('/cache/:appId', _deleteAllCache);

    function _deleteAllCache(req, res){
        var appId = req.params.appId;
        var appKey = req.body.key;
        var sdk = req.body.sdk || "REST";
        global.appService.isMasterKey(appId, appKey).then(function(isMasterKey){
            if(isMasterKey){
                global.cacheService.deleteAllAppCache(appId).then(function(cache){
                    console.log('+++ DELETE ALL APP CACHE Success +++');
                    console.log(cache);
                    res.status(200).json(cache);
                }).catch(function(err){
                    console.log('++++++ DELETE ALL APP CACHE Error +++++++');
                    console.log(err);
                    res.status(400).send(err);
                });
        }else{
           res.status(401).send("Unauthorized access. Cache API's can be used only by using master key. ");
        }
        });
        
        global.apiTracker.log(appId,"Cache / DeleteAll", req.url,sdk);
    }


    function _getItem(req, res, next){
        var appId =      req.params.appId;
        var cacheName =  req.params.name;
        var key =        req.params.key;
        var appKey =     req.body.key;
        var sdk = req.body.sdk || "REST";
        global.appService.isMasterKey(appId, appKey).then(function(isMasterKey){
            if(isMasterKey){
                global.cacheService.getItem(appId, cacheName, key).then(function(item){
                    console.log('+++ GET CACHE ITEM Success +++');
                    console.log(item);
                    res.status(200).json(item);
                }).catch(function(err){
                    console.log('++++++ GET CACHE ITEM  Error +++++++');
                    console.log(err);
                    res.status(400).send(err);
                });
        }else{
            res.status(401).send("Unauthorized access. Cache API's can be used only by using master key. ");
        }
        });
        
        global.apiTracker.log(appId,"Cache / Item / Get", req.url,sdk);
    };
    
    
    function _getItemsCount(req, res, next) {
        var appId = req.params.appId;
        var cacheName = req.params.name;
        var key = req.params.key;
        var appKey = req.body.key;
        var sdk = req.body.sdk || "REST";
        global.appService.isMasterKey(appId, appKey).then(function (isMasterKey) {
            if (isMasterKey) {
                global.cacheService.getItemsCount(appId, cacheName, key).then(function (item) {
                    console.log('+++ Get Items count +++');
                    console.log(item);
                    res.status(200).json(item);
                }).catch(function (err) {
                    console.log('+++ Get Items count +++');
                    console.log(err);
                    res.status(400).send(err);
                });
            } else {
                res.status(401).send("Unauthorized access. Cache API's can be used only by using master key. ");
            }
        });
        
        global.apiTracker.log(appId,"Cache / Item / Count", req.url,sdk);
    };

    function _getCache(req, res, next){
        var appId =      req.params.appId;
        var cacheName =  req.params.name;
        var appKey =     req.body.key;
        var sdk = req.body.sdk || "REST";
        global.appService.isMasterKey(appId, appKey).then(function(isMasterKey){
            if(isMasterKey){
                global.cacheService.getCache(appId, cacheName).then(function(cache){
                    console.log('+++ GET CACHE Success +++');
                    console.log(cache);
                    res.status(200).send(cache);
                }).catch(function(err){
                    console.log('++++++ GET CACHE Error +++++++');
                    console.log(err);
                    res.status(400).send(err);
                });
        }else{
            res.status(401).send("Unauthorized access. Cache API's can be used only by using master key. ");
        }
        });
        
        global.apiTracker.log(appId,"Cache / Get", req.url,sdk);
    };

    function _getAllAppCache(req, res, next){
        var appId =     req.params.appId;
        var appKey =    req.body.key;
        var sdk = req.body.sdk || "REST";
        global.appService.isMasterKey(appId, appKey).then(function(isMasterKey){
            if(isMasterKey){
                global.cacheService.getAllAppCache(appId).then(function(caches){
                    console.log('+++ GET ALL APP CACHE Success +++');
                    console.log(caches);
                    res.status(200).send(caches);
                }).catch(function(err){
                    console.log('++++++ GET ALL CACHE APP Error +++++++');
                    console.log(err);
                    res.status(400).send(err);
                });
            } else{
                res.status(401).send("Unauthorized access. Cache API's can be used only by using master key. ");
            }
        });
        
        global.apiTracker.log(appId,"Cache / GetAll", req.url,sdk);
    };

    function _getAllItems(req, res, next){
        var appId =      req.params.appId;
        var cacheName =  req.params.name;
        var appKey    =  req.body.key;
        var sdk = req.body.sdk || "REST";
        global.appService.isMasterKey(appId, appKey).then(function(isMasterKey){
            if(isMasterKey){
                global.cacheService.getAllItems(appId, cacheName).then(function(items){
                    console.log('+++ GET ALL CACHE Success +++');
                    console.log(items);
                    res.status(200).json(items);
                }).catch(function(err){
                    console.log('++++++ GET ALL CACHE Error +++++++');
                    console.log(err);
                    res.status(400).send(err);
                });
            }else{
                res.status(401).send("Unauthorized access. Cache API's can be used only by using master key. ");
            }
        });
        
        global.apiTracker.log(appId,"Cache / Item/ GetAll", req.url,sdk);
    };

    function _getInfo(req, res, next){
        var appId =      req.params.appId;
        var cacheName =  req.params.name;
        var appKey =     req.body.key;
        var sdk = req.body.sdk || "REST";
        global.appService.isMasterKey(appId, appKey).then(function(isMasterKey){
            if(isMasterKey){
                global.cacheService.getInfo(appId, cacheName).then(function(info){
                    console.log('+++ GET CACHE INFO Success +++');
                    console.log(info);
                    res.status(200).json(info);
                }).catch(function(err){
                    console.log('++++++ GET CACHE INFO  Error +++++++');
                    console.log(err);
                    res.status(400).send(err);
                });
            }else{
                res.status(401).send("Unauthorized access. Cache API's can be used only by using master key. ");
            }
        });
        
        global.apiTracker.log(appId,"Cache / GetInfo", req.url,sdk);
    };

};