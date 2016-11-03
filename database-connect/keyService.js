

/*
#     CloudBoost - Core Engine that powers Bakend as a Service
#     (c) 2014 HackerBay, Inc. 
#     CloudBoost may be freely distributed under the Apache 2 License
*/

var q = require('q');
var uuid = require('node-uuid');


//This file manages encryption keys, Host URL, etc etc. 
module.exports = {
        initSecureKey : function () {
            try {
                var deferred = q.defer();
                
                console.log("Initializing Secure Key...");

                var key = null;

                if (global.keys.secureKey) {
                    console.log("Secure Key : " + global.keys.secureKey);
                    deferred.resolve(global.keys.secureKey);
                } else {

                    //get it from mongodb, If does not exist, create a new random key and return;
                    var collection = global.mongoClient.db(global.keys.globalDb).collection(global.keys.globalSettings);

                    collection.find({}).toArray(function (err, docs) {
                        if (err) {
                            console.log("Error retrieveing Global Settings");
                            console.log(err);
                            deferred.reject(err);
                        } else {

                            var key = uuid.v4(); //generate a new key.

                            if (docs.length >= 1) {
                                if (docs[0].secureKey) {
                                    global.keys.secureKey = docs[0].secureKey;
                                    console.log("Secure Key : " + global.keys.secureKey);
                                    deferred.resolve(global.keys.secureKey);
                                } else {

                                    //save in mongodb.
                                    if (!docs[0])
                                        docs[0] = {};

                                    docs[0]["secureKey"] = key;



                                    collection.save(docs[0], function (err, doc) {
                                        if (err) {
                                            console.log("Error while saving Global Settings");
                                            console.log(err);
                                            deferred.reject(err);
                                        } else {
                                            //resolve if not an error
                                            global.keys.secureKey = key;
                                            console.log("Secure Key : " + global.keys.secureKey);
                                            deferred.resolve(key);
                                        }
                                    });
                                }
                            }else{
                                //create a new document.
                                var doc = {};
                                doc.secureKey = key;
                                global.keys.secureKey = key;
                                collection.save(doc, function (err, doc) {
                                    if (err) {
                                        console.log("Error while saving Global Settings");
                                        console.log(err);
                                        deferred.reject(err);
                                    } else {
                                        //resolve if not an error
                                        console.log("Secure Key : " + global.keys.secureKey);
                                        deferred.resolve(key);
                                    }
                                });
                            }
                        }
                    });

                }

                return deferred.promise;
            }catch(e){
                console.log("Error Init Encrypt Key");
                console.log(e);
                global.winston.log('error',{"error":String(e),"stack": new Error().stack});   
            }
        },

    initClusterKey : function () {
        try {

            console.log("Initializing Cluster Key...");

            var key = null;

            if (global.keys.secureKey) {
                console.log("Cluster Key : " + global.keys.clusterKey);
                deferred.resolve(global.keys.clusterKey);
            } else {

                //get it from mongodb, If does not exist, create a new random key and return;
                var deferred = q.defer();

                var collection = global.mongoClient.db(global.keys.globalDb).collection(global.keys.globalSettings);

                collection.find({}).toArray(function (err, docs) {
                    if (err) {
                        console.log("Error retrieveing Global Settings");
                        console.log(err);
                        deferred.reject(err);
                    } else {

                        var key = uuid.v4(); //generate a new key.

                        if (docs.length >= 1) {
                            if (docs[0].clusterKey) {
                                global.keys.clusterKey = docs[0].clusterKey;
                                console.log("Cluster Key : " + global.keys.clusterKey);
                                deferred.resolve(global.keys.clusterKey);
                            } else {

                                //save in mongodb.
                                if (!docs[0])
                                    docs[0] = {};

                                docs[0]["clusterKey"] = key;

                                collection.save(docs[0], function (err, doc) {
                                    if (err) {
                                        console.log("Error while saving Global Settings");
                                        console.log(err);
                                        deferred.reject(err);
                                    } else {
                                        //resolve if not an error
                                        global.keys.clusterKey = key;
                                        console.log("Cluster Key : " + global.keys.clusterKey);
                                        deferred.resolve(key);
                                    }
                                });
                            }
                        }else{
                            //create a new document.
                            var doc = {};
                            doc.clusterKey = key;
                            global.keys.clusterKey = key;
                            collection.save(doc, function (err, doc) {
                                if (err) {
                                    console.log("Error while saving Global Settings");
                                    console.log(err);
                                    deferred.reject(err);
                                } else {
                                    //resolve if not an error
                                    console.log("Cluster Key : " + global.keys.clusterKey);
                                    deferred.resolve(key);
                                }
                            });
                        }
                    }
                });


            }

            return deferred.promise;
        }catch(e){
            console.log("Error Init Cluster Key");
            console.log(e);
            global.winston.log('error',{"error":String(e),"stack": new Error().stack});       
        }
    },

    getMyUrl : function () { 

                var deferred = q.defer();
                
                try{
                    if (global.keys.myURL) {
                        deferred.resolve(global.keys.myURL);
                    } else {
                        console.log("Retrieving Cluster URL...");
                        //get it from mongodb, If does not exist, create a new random key and return; 
                        var deferred = q.defer();
                        
                        var collection = global.mongoClient.db(global.keys.globalDb).collection(global.keys.globalSettings);
                        
                        collection.find({}).toArray(function (err, docs) {
                            if (err) {
                                console.log("Error retrieving Global Settings");
                                console.log(err);
                                deferred.reject(err);
                            } else {

                                if (docs.length >= 1) {
                                    if (docs[0].myURL) {
                                        console.log("Cluster URL : "+docs[0].myURL);
                                        global.keys.myURL = docs[0].myURL;
                                        deferred.resolve(global.keys.myURL);
                                    } else {
                                        // FOR TESTING, FIX LATER
                                        deferred.resolve("http://localhost:4730");
                                    }
                                } else {
                                    // FOR TESTING, FIX LATER
                                    deferred.resolve("http://localhost:4730");
                                }
                            }
                        });

                    }

                }catch(e){                    
                    global.winston.log('error',{"error":String(e),"stack": new Error().stack}); 
                    deferred.reject(e);  
                }
                
                return deferred.promise;
        },

    changeUrl : function (url) {

        var deferred = q.defer();

        try{
            var collection = global.mongoClient.db(global.keys.globalDb).collection(global.keys.globalSettings);

            collection.find({}).toArray(function (err, docs) {
                if (err) {
                    console.log("Error retrieving Global Settings");
                    console.log(err);
                    deferred.reject(err);
                } else {

                    if (docs.length >= 1) {
                        console.log("URL Record Found");
                        docs[0].myURL = url;
                        console.log("Updating...");
                        collection.save(docs[0], function(err, doc){

                            if(err){
                                console.log("Error Updating");
                                deferred.reject("Error, cannot change the cluster URL.");
                            }else{
                                console.log("Updated.");
                                global.keys.myURL = url;
                                deferred.resolve(url);
                            }
                        });
                    } else {
                        deferred.reject("Global record not found. Restart the cluster.");
                    }
                }
            });

        }catch(e){                    
            global.winston.log('error',{"error":String(e),"stack": new Error().stack}); 
            deferred.reject(e);  
        }

        return deferred.promise;

    }
};