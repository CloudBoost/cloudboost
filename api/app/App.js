
/*
#     CloudBoost - Core Engine that powers Bakend as a Service
#     (c) 2014 HackerBay, Inc. 
#     CloudBoost may be freely distributed under the Apache 2 License
*/

module.exports = function() {

    //create a new app.
    global.app.post('/app/:appId', function (req, res) {

        console.log("++++ Create App API ++++++");

        try{
            console.log("SecureKey to create app:"+req.body.secureKey);

            var appId = req.params.appId;
            console.log("App ID : "+appId);

            var sdk = req.body.sdk || "REST";

            if (global.keys.secureKey === req.body.secureKey) {
                console.log("Secure Key Valid. Creating app...");
                global.appService.createApp(appId).then(function (app){

                    global.appService.createDefaultTables(appId).then(function(){
                        console.log("Success : App Successfully Created.");
                        res.status(200).send(app);
                    },function(err){
                        console.log("Error : Cannot create an app.");
                        console.log(err);
                        res.status(500).send("Error");
                    })

                }, function (err){
                    console.log("Error : Cannot create an app.");
                    console.log(err);
                    res.status(500).send("Error");
                });
            } else {
                console.log("Unauthorized: Invalid Secure Key ");
                res.status(401).send("Unauthorized");
            }
            
            global.apiTracker.log(appId,"App / Create", req.url,sdk);

        }catch(e){
            console.log(e);
        }
    });

    //delete app.
	global.app.delete('/app/:appId', _deleteApp);
    global.app.put('/app/:appId', _deleteApp);

    function _deleteApp(req, res){ //delete the app and all of its data.
        console.log('+++++++++++++ APP DELETE HANDLER +++++++++++');
        var appId = req.params.appId;
        var sdk = req.body.sdk || "REST";

        var body = req.body || {};

        if(global.keys.secureKey === body.secureKey){
            console.log("Authorized");
            //delete all code here.
            global.appService.deleteApp(appId).then(function(){
                console.log("App deleted");
                return res.status(200).send({status : 'Success'});
            }, function(){
                console.log("Internal Server Error");
                return res.status(500).send({status : 'Error'});
            });
        } else{
            console.log("Unauthorized");
            return res.status(401).send({status : 'Unauthorized'});
        }

        global.apiTracker.log(appId,"App / Delete", req.url,sdk);
        
    }

    //delete a table.
	global.app.delete('/app/:appId/:tableName', _deleteTable);

    function _deleteTable(req, res) { //delete the app and all of its data.

        try {
            //this method is to delete a particular collection from an global.app.
            console.log('++++++ Table Delete API+++++++');
            var appId = req.params.appId;
            var tableName = req.params.tableName;

            var body = req.body || {};
            var sdk = req.body.sdk || "REST";

            var appKey = req.body.key || req.params.key;

            global.appService.isMasterKey(appId, appKey).then(function (isMasterKey) {
                if (isMasterKey) {
                    //delete all code here.
                    global.appService.deleteTable(appId, tableName).then(function (table) {
                        res.status(200).send(table);
                    }, function (error) {
                        console.log("Table Delete Error");
                        console.log(error);
                        res.status(500).send('Cannot delete table at this point in time. Please try again later.');
                    });
                } else {
                    res.status(401).send({status : 'Unauthorized'});
                }
            }, function (error) {
                return res.status(500).send('Cannot retrieve security keys.');
            });
        }catch(e){
            console.log("Delete Table Error");
            console.log(e);
            return res.status(500).send('Cannot delete table.');
        }
        
        global.apiTracker.log(appId,"App / Table / Delete", req.url,sdk);
    }

    //create a table.
    global.app.put('/app/:appId/:tableName',function(req,res){

        console.log("Create or Delete table Api...");

        if(req.body && req.body.method=="DELETE"){
            /***************************DELETE******************************/
            _deleteTable(req,res);
            /***************************DELETE******************************/
        }else{

            /***************************UPDATE******************************/
            console.log('++++++++ UPDATE TABLE API +++++++++');
            var appId = req.params.appId;
            var tableName = req.params.tableName;
            var body = req.body || {};
            var schema = req.body.schema;
            var sdk = req.body.sdk || "REST";
            var appKey = req.body.key || req.params.key;

            global.appService.isMasterKey(appId, appKey).then(function (isMasterKey) {
                if(isMasterKey){
                    //delete all code here.

                    if(global.mongoDisconnected){
                        return res.status(500).send('Storage / Cache Backend are temporarily down.');
                    }

                    global.appService.upsertTable(appId,tableName,body.data.columns).then(function(table){
                        return res.status(200).send(table);
                    },function(err){
                        return res.status(500).send('Error');
                    });
                }else{
                    return res.status(401).send({status : 'Unauthorized'});
                }
            }, function(error){
                return res.status(500).send('Cannot retrieve security keys.');
            });

            global.apiTracker.log(appId,"App / Table / Create", req.url,sdk);
            
        }

    });

    //get a table.
    global.app.post('/app/:appId/:tableName',_getTable);
    global.app.get('/app/:appId/:tableName',_getTable);

    function _getTable(req,res){
        console.log('++++++++ GET TABLE API +++++++++');

        var appId = req.params.appId;
        var tableName = req.params.tableName;
        var body = req.body || {};
        var sdk = req.body.sdk || "REST";
        var appKey = req.body.key || req.params.key;

        global.appService.isMasterKey(appId, appKey).then(function (isMasterKey) {
            if(isMasterKey){
                //delete all code here.
                if(tableName === "_getAll"){
                    global.appService.getAllTables(appId).then(function(tables){
                        return res.status(200).send(tables);
                    },function(err){
                        return res.status(500).send('Error');
                    });
                }else{
                    global.appService.getTable(appId,tableName).then(function(table){
                        return res.status(200).send(table);
                    },function(err){
                        return res.status(500).send('Error');
                    });
                }

            }else{
                return res.status(401).send({status : 'Unauthorized'});
            }
        }, function(error){
            return res.status(500).send('Cannot retrieve security keys.');
        });

        global.apiTracker.log(appId,"App / Table / Get", req.url,sdk);
    }


    //Export Database for :appID
    global.app.post('/backup/:appId/exportdb',function(req, res) {
        console.log("++++ Export Database ++++++");
        try{
            var appKey = req.body.key;
            var appId = req.params.appId;

            global.appService.isMasterKey(appId,appKey).then(function (isMasterKey) {

                if (isMasterKey) {
                    global.appService.exportDatabase(appId).then(function(data){
                        res.writeHead(200, {
                          "Content-Type": "application/octet-stream",
                          "Content-Disposition" : "attachment; filename=dump"+(new Date())+".json"
                        });
                        res.end(JSON.stringify(data))
                    },function (err){
                        console.log("Error : Exporting Database.");
                        console.log(err);
                        res.status(500).send("Error");
                    })
                } else {
                    res.status(401).send({status : 'Unauthorized'});
                }
            }, function (error) {
                return res.status(500).send('Cannot retrieve security keys.');
            });
        } catch(e) {
            console.log(e);
        }
    });

    //Import Database for :appID
    global.app.post('/backup/:appId/importdb',function(req, res) {
        console.log("++++ Import Database ++++++");
        try{         
            var appKey = req.body.key
            var appId = req.params.appId;
            global.appService.isMasterKey(appId,appKey).then(function (isMasterKey) {
                if (isMasterKey) {
                    var file;
                    if(req.files && req.files.file){
                        file = req.files.file.data                            
                    }
                    if(file){
                        global.appService.importDatabase(appId,file).then(function(data){
                            if(data){
                                res.status(200).json({Success:true})
                            } else {
                                res.status(500).json({success:false})
                            }
                        },function (err){
                            console.log("Error : Exporting Database.");
                            console.log(err);
                            res.status(500).send("Error");
                        })
                    }
                } else {
                    res.status(401).send({status : 'Unauthorized'});
                }
            }, function (error) {
                return res.status(500).send('Cannot retrieve security keys.');
            });
        } catch(e) {
            console.log(e);
        }
    });
};
