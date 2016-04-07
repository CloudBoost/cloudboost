var _ = require('underscore');
var customHelper = require('../../helpers/custom.js');
var fs = require('fs');

module.exports = function() {
    

    global.app.get('/page/:appId/reset-password', function(req, res, next) {
        fs.readFile('./page-templates/user/password-reset.html', function(error, content) {
            if (error) {
                res.writeHead(500);
                res.end();
            }
            else {
                res.writeHead(200, { 'Content-Type': 'text/html' });
                res.end(content, 'utf-8');
            }
        });
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
        
        global.appService.getAllSettings(appId).then(function(appSettingsObject){
        
            console.log(appSettingsObject);

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

            res.render(global.rootPath+'/page-templates/user/login',{
                generalSettings: generalSettings,
                authSettings: authSettings,                       
            });

        },function(error){

        });   
        
        
        global.apiTracker.log(appId,"User / Reset User Password", req.url,sdk);
    });
};