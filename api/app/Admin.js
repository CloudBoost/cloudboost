/*
#     CloudBoost - Core Engine that powers Bakend as a Service
#     (c) 2014 HackerBay, Inc. 
#     CloudBoost may be freely distributed under the Apache 2 License
*/

module.exports = function() {   

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
