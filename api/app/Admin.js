/*
#     CloudBoost - Core Engine that powers Bakend as a Service
#     (c) 2014 HackerBay, Inc. 
#     CloudBoost may be freely distributed under the Apache 2 License
*/

module.exports = function() {   

    //Change MasterKey/ClientKey
    global.app.put('/admin/:appId/clientkey',function(req, res) { 
        console.log("++++ Change ClientKey ++++++");

        try{          

            var appId = req.params.appId;   

            if (global.keys.secureKey === req.body.secureKey) {
                console.log("Secure Key Valid. Changing ClientKey...");

                global.appService.changeAppClientKey(appId,req.body.value).then(function (app){
                    console.log("Success : Changing ClientKey.");
                    res.status(200).json(app);
                }, function (err){
                    console.log("Error : Changing ClientKey.");
                    console.log(err);
                    res.status(500).send("Error");
                });

            } else {
                console.log("Unauthorized: Invalid Secure Key ");
                res.status(401).send("Unauthorized");
            }        
            

        }catch(e){
            console.log(e);
        }
    });

    //Change MasterKey/ClientKey
    global.app.put('/admin/:appId/masterkey',function(req, res) {
        console.log("++++ Change Masterkey ++++++");

        try{          

            var appId = req.params.appId;   

            if (global.keys.secureKey === req.body.secureKey) {
                console.log("Secure Key Valid. Changing Masterkey...");

                global.appService.changeAppMasterKey(appId,req.body.value).then(function (app){
                    console.log("Success : Changing Masterkey.");
                    res.status(200).json(app);
                }, function (err){
                    console.log("Error : Changing Masterkey.");
                    console.log(err);
                    res.status(500).send("Error");
                });

            } else {
                console.log("Unauthorized: Invalid Secure Key ");
                res.status(401).send("Unauthorized");
            }        
            

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
