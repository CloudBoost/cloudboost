var pjson = require('../package.json');
var fs = require('fs');
var q = require('q');

module.exports = {
    upgradeServer: function (newVersion, prevVersion) {
        if (newVersion == pjson.version) {
            console.log("Upgrading from version : " + prevVersion + " to new version : " + newVersion);
            console.log("Please Wait ......");
            //server upgradation logic here
            console.log("Server Upgradation Completed!!");
            console.log("Upgrading DB .....");
            console.log("Please Wait ......");
            //upgrade server version in db
            upgradeDBVersion().then(function () {
                console.log("DB Upgradation Completed!!");
            });
        } else {
            console.log("Please upgrade package.json to new version and then restart to proceed further");
        }
    }
}

function upgradeDBVersion() {
    var deferred = q.defer();

    var collection = global.mongoClient.db(global.keys.globalDb).collection(global.keys.globalSettings);

    collection.find({}).toArray(function (err, docs) {
        if (err) {
            console.log("Error retrieveing Global Settings");
            console.log(err);
            deferred.reject(err);
        } else {

            var key = pjson.version;
            if (docs.length >= 1) {
                if (docs[0].server_version) {
                    if (docs[0].server_version !== key) {
                        console.log("Previous Server Version : " + docs[0].server_version);
                        docs[0]["server_version"] = key;

                        collection.save(docs[0], function (err, doc) {
                            if (err) {
                                console.log("Error while saving Global Settings");
                                console.log(err);
                                deferred.reject(err);
                            } else {
                                //resolve if not an error
                                global.keys.server_version = key;
                                console.log("New Server Version" + global.keys.server_version);
                                console.log("resolved")
                                deferred.resolve(key);
                            }
                        });
                    } else {
                        console.log("Server already upgraded to latest version");
                    }
                } else {

                    //save in mongodb.
                    if (!docs[0])
                        docs[0] = {};

                    docs[0]["server_version"] = key;

                    collection.save(docs[0], function (err, doc) {
                        if (err) {
                            console.log("Error while saving Global Settings");
                            console.log(err);
                            deferred.reject(err);
                        } else {
                            //resolve if not an error
                            global.keys.server_version = key;
                            console.log("New Server Version" + global.keys.server_version);
                            deferred.resolve(key);
                        }
                    });
                }
            } else {
                //create a new document.
                var doc = {};
                doc.server_version = key;
                global.keys.server_version = key;
                collection.save(doc, function (err, doc) {
                    if (err) {
                        console.log("Error while saving Global Settings");
                        console.log(err);
                        deferred.reject(err);
                    } else {
                        //resolve if not an error
                        console.log("New Server Version : " + global.keys.server_version);
                        deferred.resolve(key);
                    }
                });
            }
        }
    });


}
