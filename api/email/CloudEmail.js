
/*
#     CloudBoost - Core Engine that powers Bakend as a Service
#     (c) 2014 HackerBay, Inc. 
#     CloudBoost may be freely distributed under the Apache 2 License
*/


var q = require("q");

module.exports = function() {   

   /**
    *Description : Send Email to all users in the selected aplication
    *Params: 
    *- Param secureKey: Secure key of System
    *Returns:
    -Success : success on emails sent
    -Error : Error Data( 'Server Error' : status 500 )
    */
    global.app.post('/email/:appId/campaign', function (req, res) {
        console.log("++++ Email Campaign ++++++");
        try{
            var appId = req.params.appId;
            var appKey = req.body.key;
            var emailBody = req.body.emailBody
            var emailSubject = req.body.emailSubject

            global.appService.isMasterKey(appId,appKey).then(function (isMasterKey) {
                if (isMasterKey) {
                    global.emailService.sendEmail(appId,emailBody,emailSubject,isMasterKey).then(function(data){
                        res.status(200).send(null)
                    },function(err){
                        if(err === "Email Configuration is not found." || err === "No users found"){
                            res.status(400).send({error:err});
                        } else {
                            res.status(500).json({message:"Something went wrong",error:err});
                        }
                    })
                } else {
                    res.status(401).send({status : 'Unauthorized'});
                }
            }, function (error) {
                return res.status(500).send('Cannot retrieve security keys.');
            });      
        } catch(e){
            console.log(e);
        }
                
        
    });

};


