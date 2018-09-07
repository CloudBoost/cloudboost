
/*
#     CloudBoost - Core Engine that powers Backend as a Service
#     (c) 2014 HackerBay, Inc. 
#     CloudBoost may be freely distributed under the Apache 2 License
*/



var _ = require('underscore');
var customHelper = require('../../helpers/custom.js');
var q = require('q');
var apiTracker = require('../../database-connect/apiTracker');
var userService = require('../../services/cloudUser');
var appService = require('../../services/app');
var config = require('../../config/config');
var winston = require('winston');

module.exports = function(app) {
    

    app.get('/page/:appId/reset-password', function(req, res) {           
        var appId = req.params.appId || null;      
        var sdk = req.body.sdk || "REST";     
        
        var promises=[];
        promises.push(appService.getApp(appId));
        promises.push(appService.getAllSettings(appId));        

        q.all(promises).then(function(list){
            var appKeys={};
            appKeys.appId=appId;

            appKeys.masterKey=list[0].keys.master;
            var appSettingsObject=list[1];
            list[0].keys.encryption_key ? delete list[0].keys.encryption_key : null;

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

            res.render(config.rootPath+'/page-templates/user/password-reset',{
                appKeys:appKeys,
                generalSettings: generalSettings,
                authSettings: authSettings,                       
            });

        },function(error){
            res.status(400).send(error);
        });   
            
        apiTracker.log(appId,"User / Reset User Password", req.url,sdk);
       
    });

    /*
    Reset Password : This API is used from CloudBoost Reset Password Page. 
    */    
    app.post('/page/:appId/reset-user-password', function(req, res) { 
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
        
        appService.getApp(appId).then(function (application) {
            userService.resetUserPassword(appId, username, newPassword, resetKey, customHelper.getAccessList(req), true, application.keys.encryption_key)
            .then(function() {
                res.json({message : "Password changed successfully."});
            }, function(error) {
                res.json(400, {
                    error: error
                });
            });
        });
        
        apiTracker.log(appId,"User / Reset User Password", req.url,sdk);
    });

    /*Desc   : Render Authentication Page
      Params : appId
      Returns: Authentication html page
    */
    app.get('/page/:appId/authentication', function(req, res) { 

        var appId = req.params.appId || null;      
        var sdk = req.body.sdk || "REST";     

        var promises=[];
        promises.push(appService.getApp(appId));
        promises.push(appService.getAllSettings(appId));        

        q.all(promises).then(function(list){            
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

            if(authSettings && authSettings.resetPasswordEmail && authSettings.resetPasswordEmail.template){
                delete authSettings.resetPasswordEmail.template;
            }

            if(authSettings && authSettings.signupEmail && authSettings.signupEmail.template){
                delete authSettings.signupEmail.template;
            }
            
            res.render(config.rootPath+'/page-templates/user/login',{
                appKeys: appKeys,
                generalSettings: generalSettings,
                authSettings: authSettings     
            });

        },function(error){
            res.status(400).send(error);
        });   
        
        
        apiTracker.log(appId,"User / Reset User Password", req.url,sdk);
    });


    /*Desc   : Verify User Account And render Activation page
      Params : appId
      Returns: Activation html page
    */
    app.get('/page/:appId/verify', function(req, res) { 

        

        var appId = req.params.appId || null;      
        var sdk = req.body.sdk || "REST"; 
        var activateCode = req.query.activateKey; 

        if(!activateCode){
           res.status(400).send("ActivateCode not found"); 
        }       
        

        var promises=[];
        promises.push(userService.verifyActivateCode(appId, activateCode, customHelper.getAccessList(req)));
        promises.push(appService.getAllSettings(appId));        

        q.all(promises).then(function(list){            
           
            var appSettingsObject=list[1];

            var general=_.first(_.where(appSettingsObject, {category: "general"}));
           
            var generalSettings=null;
            if(general){
                generalSettings=general.settings;
            }            

            res.render(config.rootPath+'/page-templates/user/signup-activate',{               
                generalSettings: generalSettings,
                verified:true                                   
            });

        },function(err){
            winston.error({
                error: err
            });
            res.render(config.rootPath+'/page-templates/user/signup-activate',{               
                verified:false                                   
            });
        });
        
        apiTracker.log(appId,"User / Reset User Password", req.url,sdk);
    });
};