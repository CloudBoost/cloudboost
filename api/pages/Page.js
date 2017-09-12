
/*
#     CloudBoost - Core Engine that powers Backend as a Service
#     (c) 2014 HackerBay, Inc. 
#     CloudBoost may be freely distributed under the Apache 2 License
*/



var _ = require('underscore');
var customHelper = require('../../helpers/custom.js');
var q = require('q');

module.exports = function() {
    

    global.app.get('/page/:appId/reset-password', function(req, res) {
       
           
        var appId = req.params.appId || null;      
        var sdk = req.body.sdk || "REST";     
        
        var promises=[];
        promises.push(global.appService.getApp(appId));
        promises.push(global.appService.getAllSettings(appId));        

        q.all(promises).then(function(list){            

            console.log(list);
            
            var appKeys={};
            appKeys.appId=appId;

            appKeys.masterKey=list[0].keys.master;
            var appSettingsObject=list[1];

            var general=_.first(_.where(appSettingsObject, {category: "general"}));
            var auth=_.first(_.where(appSettingsObject, {category: "auth"}));

            var generalSettings=null;
            if(general){
                generalSettings=general.settings;
            }
            var authSettings=null;
            if(auth){
                authSettings=auth.settings;
            }

            res.render(global.rootPath+'/page-templates/user/password-reset',{
                appKeys:appKeys,
                generalSettings: generalSettings,
                authSettings: authSettings,                       
            });

        },function(error){
            res.status(400).send(error);
        });   
            
        global.apiTracker.log(appId,"User / Reset User Password", req.url,sdk);
       
    });

    /*
    Reset Password : This API is used from CloudBoost Reset Password Page. 
    */    
    global.app.post('/page/:appId/reset-user-password', function(req, res) { 
        var appId = req.params.appId || null;
        var username = req.body.username || null;
        var sdk = req.body.sdk || "REST";
        var resetKey = req.body.resetKey || "";
        var newPassword = req.body.newPassword || "";
        
        if(!newPassword || newPassword === ""){
            res.status(400).json({
                "message": "New Password is required."
            });
        }
            
        global.userService.resetUserPassword(appId, username, newPassword, resetKey, customHelper.getAccessList(req), true)
        .then(function(result) {
            res.json({message : "Password changed successfully."});
        }, function(error) {
            res.json(400, {
                error: error
            });
        });
        
        global.apiTracker.log(appId,"User / Reset User Password", req.url,sdk);
    });

    /*Desc   : Render Authentication Page
      Params : appId
      Returns: Authentication html page
    */
    global.app.get('/page/:appId/authentication', function(req, res) { 

        console.log("Render Authentication Page..");

        var appId = req.params.appId || null;      
        var sdk = req.body.sdk || "REST";     

        var promises=[];
        promises.push(global.appService.getApp(appId));
        promises.push(global.appService.getAllSettings(appId));        

        q.all(promises).then(function(list){            

            console.log(list);
            
            var appKeys={};
            appKeys.appId=appId;

            appKeys.masterKey=list[0].keys.master;
            var appSettingsObject=list[1];

            var general=_.first(_.where(appSettingsObject, {category: "general"}));
            var auth=_.first(_.where(appSettingsObject, {category: "auth"}));

            var generalSettings=null;
            if(general){
                generalSettings=general.settings;
            }
            var authSettings=null;
            if(auth){
                authSettings=auth.settings;
            }

            delete authSettings.resetPasswordEmail.template;
            delete authSettings.signupEmail.template;

            res.render(global.rootPath+'/page-templates/user/login',{
                appKeys:appKeys,
                generalSettings: generalSettings,
                authSettings: authSettings                    
            });

        },function(error){
            res.status(400).send(error);
        });   
        
        
        global.apiTracker.log(appId,"User / Reset User Password", req.url,sdk);
    });


    /*Desc   : Verify User Account And render Activation page
      Params : appId
      Returns: Activation html page
    */
    global.app.get('/page/:appId/verify', function(req, res) { 

        console.log("Render Aactivation Page..");

        var appId = req.params.appId || null;      
        var sdk = req.body.sdk || "REST"; 
        var activateCode = req.query.activateKey; 

        if(!activateCode){
           res.status(400).send("ActivateCode not found"); 
        }       
        

        var promises=[];
        promises.push(global.userService.verifyActivateCode(appId, activateCode, customHelper.getAccessList(req)));
        promises.push(global.appService.getAllSettings(appId));        

        q.all(promises).then(function(list){            
           
            var appSettingsObject=list[1];

            var general=_.first(_.where(appSettingsObject, {category: "general"}));
           
            var generalSettings=null;
            if(general){
                generalSettings=general.settings;
            }            

            res.render(global.rootPath+'/page-templates/user/signup-activate',{               
                generalSettings: generalSettings,
                verified:true                                   
            });

        },function(error){
            res.render(global.rootPath+'/page-templates/user/signup-activate',{               
                verified:false                                   
            });
        });
        
        global.apiTracker.log(appId,"User / Reset User Password", req.url,sdk);
    });
};