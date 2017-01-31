/*
#     CloudBoost - Core Engine that powers Bakend as a Service
#     (c) 2014 HackerBay, Inc. 
#     CloudBoost may be freely distributed under the Apache 2 License
*/

module.exports = function() {   

      //create a new key for an existing app.
    global.app.put('/admin/:appId/key', function (req, res) { 

        console.log("++++ Create App API ++++++");

        try{
            console.log("SecureKey to create app:"+req.body.secureKey);

            var appId   = req.params.appId;
            var keyType = req.body.keyType.toLowerCase();
            var name    = req.body.name;
         
            console.log("App ID : "+appId);

            var sdk = req.body.sdk || "REST";

            if (global.keys.secureKey === req.body.secureKey) 
            {
                console.log("Secure Key Valid. Creating keys for app...");
                if(appId && keyType && name)
                {
                    global.appService.createAppKeys(appId,keyType,name).then(function (app){
                        console.log("Success : App Keys Successfully Created.");
                        res.status(200).send(app);
                    }, function (err){
                        console.log("Error : Cannot create keys for app.");
                        console.log(err);
                        res.status(500).send("Error");
                    });

                } else{
                    console.log("Params Missing ");
                    res.status(401).send("Params Missing");

                }
            } else {
                console.log("Unauthorized: Invalid Secure Key ");
                res.status(401).send("Unauthorized");
            }
            
            global.apiTracker.log(appId,"App /  keys /:appId", req.url,sdk);
            
        }catch(e){
            console.log(e);
        }
    });

    /**
    *Description : Adds a user to its specefic database as a read/write admin
    *Params: 
    *- Param appID : Database Name
    *- Param secureKey: Secure key of System
    *Returns:
    -Success : User data (username,password)
    -Error : Error Data( 'Server Error' : status 500 )
    */
    global.app.post('/admin/dbaccess/enable/:appId',function(req, res) {
        console.log("++++ MongoDb Native Access ++++++");
        try {
            if (global.keys.secureKey === req.body.secureKey) {
                global.appService.createDatabaseUser(req.params.appId).then(function (userData){
                    res.status(200).json({user:userData})
                }, function (err){
                    res.status(500).send("Server Erorr");
                });
            } else {
                console.log("Unauthorized: Invalid Secure Key ");
                res.status(401).send("Unauthorized");
            } 
  
        } catch(e){
            console.log(e);
        }
    });
};
