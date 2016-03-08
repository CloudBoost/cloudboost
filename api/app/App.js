module.exports = function() {

	global.app.get('/app/:appId/status', function(req, res) { //get the app object containing keys
        console.log(' GET APP HANDLER');
		var appId = req.params.appId;
        var sdk = req.body.sdk || "REST";
		console.log(appId+' : is online.');
		res.send(200, {status : 'online', appId : appId});
        
        global.apiTracker.log(appId,"App / Status", req.url,sdk);
        
	});

    //create a new app.
    global.app.post('/app/:appId', function (req, res) {

        console.log("++++ Create App API ++++++");

        var appId = req.params.appId;
        console.log("App ID : "+appId);

        var sdk = req.body.sdk || "REST";

        if (global.keys.secureKey === req.body.secureKey) {
            console.log("Secure Key Valid. Creating app...");
            global.appService.createApp(appId).then(function (app){
                console.log("Success : App Successfully Created.");
                res.status(200).send(app);
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
    });

    //delete app.
	global.app.delete('/app/:appId', function(req, res) { //delete the app and all of its data.
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
		}else{
            console.log("Unauthorized");
			return res.status(401).send({status : 'Unauthorized'});
		}

        global.apiTracker.log(appId,"App / Delete", req.url,sdk);
        
	});

    //delete a table.
	global.app.delete('/app/:appId/:tableName', function(req, res) { //delete the app and all of its data.

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
	});

    //create a table.
    global.app.put('/app/:appId/:tableName',function(req,res){

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

                if(global.mongoDisconnected || global.elasticDisconnected){
                    return res.status(500).send('Storage / Search / Cache Backend are temporarily down.');
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

    });
    
    //Update Settings for the App
    global.app.put('/settings/:appId/:category',function(req,res){

        console.log('++++++++ General App Settings API +++++++++');

        var appId = req.params.appId;
        var body = req.body || {};
        var category = req.params.category;
        var sdk = req.body.sdk || "REST";
        var settings = req.body.settings || {};
        var appKey = req.body.key || req.params.key;

        if(typeof settings=="string"){
            settings=JSON.parse(settings);
        }

        global.appService.isMasterKey(appId, appKey).then(function (isMasterKey) {
            if(isMasterKey){
                
                if(global.mongoDisconnected || global.elasticDisconnected){
                    return res.status(500).send('Storage / Search / Cache Backend are temporarily down.');
                }
                
                global.appService.updateSettings(appId,category,settings).then(function(settings){
                    return res.status(200).send(settings);
                },function(err){
                    return res.status(500).send('Error');
                });
                
            }else{
                return res.status(401).send({status : 'Unauthorized'});
            }
        }, function(error){
            return res.status(500).send('Cannot retrieve security keys.');
        });

        global.apiTracker.log(appId,"App / Settings", req.url,sdk);

    });
    
    //Get Settings for the App
    global.app.post('/settings/:appId',function(req,res){

        console.log('++++++++ General App Settings API +++++++++');       

        var appId = req.params.appId;
        var body = req.body || {};
        var sdk = req.body.sdk || "REST";
        var appKey = req.body.key || req.params.key;

        global.appService.isMasterKey(appId, appKey).then(function (isMasterKey) {
            if(isMasterKey){

                if(global.mongoDisconnected || global.elasticDisconnected){
                    return res.status(500).send('Storage / Search / Cache Backend are temporarily down.');
                }

                global.appService.getAllSettings(appId).then(function(settings){
                    return res.status(200).send(settings);
                },function(err){
                    return res.status(500).send('Error');
                });
                
            }else{
                return res.status(401).send({status : 'Unauthorized'});
            }
        }, function(error){
            return res.status(500).send('Cannot retrieve security keys.');
        });

        global.apiTracker.log(appId,"App / Settings", req.url,sdk);

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
};
