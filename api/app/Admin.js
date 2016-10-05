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

    //MongoDb Native Access
    global.app.post('/admin/dbaccess/enable/:appId',function(req, res) {
        console.log("++++ MongoDb Native Access ++++++");
        try {    
            if (global.keys.secureKey === req.body.secureKey) {
                var username = Math.random().toString(36).substring(7)
                var password = Math.random().toString(36).substring(7)
                var Db = require('mongodb').Db
                Server = require('mongodb').Server
                var db = new Db(req.params.appId, new Server('localhost', 27017))
                db.open(function(err, db) {
                    db.addUser(username, password, { roles: [
                                { role: "readWrite", db: req.params.appId }
                                ]},function(err, result) {
                            if(err) res.status(500).send("Server Erorr");
                                else res.status(200).json({'Success':true,data:req.body,app:req.params.appId,user:{username:username,password:password}})
                    });
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
