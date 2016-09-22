
/*
#     CloudBoost - Core Engine that powers Bakend as a Service
#     (c) 2014 HackerBay, Inc. 
#     CloudBoost may be freely distributed under the Apache 2 License
*/


var q = require("q");
var _ = require('underscore');
var fs = require('fs');
var customHelper = require('../../helpers/custom.js');


var twitterHelper = require('../../helpers/twitter.js');
var githubHelper = require('../../helpers/github.js');
var linkedinHelper = require('../../helpers/linkedin.js');
var googleHelper = require('../../helpers/google.js');
var facebookHelper = require('../../helpers/facebook.js');

module.exports = function() {
    
    /**
     * Get User from Sessions
     * 
     */

    global.app.post('/user/:appId/currentUser', function(req, res) { //for login
        console.log("CURRENT USER API");           

        var appId = req.params.appId;
        var appKey = req.body.key || req.param('key');
        var sdk = req.body.sdk || "REST";

        var accessList=customHelper.getAccessList(req);

        if(!accessList || !accessList.userId){
            return res.status(200).send(null);
        }

        var collectionName = "User";                
        var select = {};
        var sort = {};
        var skip = 0;               

        var query = {};
        query.$include = [];
        query.$includeList = [];
        query["_id"] = accessList.userId;

        global.appService.isMasterKey(appId, appKey).then(function (isMasterKey) {
            return global.customService.findOne(appId, collectionName, query, select, sort, skip, accessList, isMasterKey);
        }).then(function (result) {
            res.json(result);
        }, function (error) {
            res.status(400).send(error);
        });                
        
        global.apiTracker.log(appId,"User / CurrentUser", req.url,sdk);
    });

    /**
     * User Login Api
     * 
     */

	global.app.post('/user/:appId/login', function(req, res) { //for login
        console.log("LOGIN API");
        var appId = req.params.appId;
		var document = req.body.document; //document contains the credentials
		var appKey = req.body.key || req.param('key');
        var userId = req.session.userId || null;
		var sdk = req.body.sdk || "REST";
        
        var isMasterKey=false;
        var sessionLength=30;//Default       

        var promises=[];        
        promises.push(global.appService.getAllSettings(appId));
        promises.push(global.appService.isMasterKey(appId,appKey));

        q.all(promises).then(function(list){
            isMasterKey=list[1];            

            //Check Session Length from app Settings
            if(list[0] && list[0].length>0){
                var auth=_.first(_.where(list[0], {category: "auth"}));           
                if(auth && auth.settings && auth.settings.sessions && auth.settings.sessions.sessionLength){
                    var temp=Number(auth.settings.sessions.sessionLength);
                    if(!isNaN(temp)){
                        sessionLength=temp;
                    }
                }                
            }

            //Make request
            return global.userService.login(appId, document.username, document.password, customHelper.getAccessList(req),isMasterKey);
        }).then(function(result) {
            //create sessions
            setSession(req, appId, sessionLength, result,res);
            res.json(result);
        }, function(error) {
            res.status(400).json({
                error: error
            });
        });	
        
		global.apiTracker.log(appId,"User / Login", req.url,sdk);
    });


     /**
     * User Login with provider
     * 
     */

    global.app.post('/user/:appId/loginwithprovider', function(req, res) { 

        console.log("LOGIN WITH PROVIDER");

        var appId = req.params.appId;
        var appKey = req.body.key || req.param('key');

        var provider= req.body.provider;
        var accessToken= req.body.accessToken; 
        var accessSecret= req.body.accessSecret || null;           
        
        var sdk = req.body.sdk || "REST";
        var sessionLength=30;//Default

        if(!provider){
            res.status(400).json({
                "message": "provider is required."
            });
            return;
        }

        provider=provider.toLowerCase();

        if(!accessToken){
            res.status(400).json({
                "message": "accessToken is required."
            });
            return;
        }       

        if(provider==="twitter" && !accessSecret){
            res.status(400).json({
                "message": "accessSecret is required for given provider."
            });
            return;
        }

        var promises=[];        
        promises.push(global.appService.getAllSettings(appId));
        promises.push(global.appService.isMasterKey(appId,appKey));

        q.all(promises).then(function(list){

            var isMasterKey=list[1];          

            if(!list[0] || list[0].length==0){
                return res.status(400).send("App Settings not found.");
            }

            var auth=_.first(_.where(list[0], {category: "auth"}));           
            if(auth){
                var authSettings=auth.settings;
            }

            if(!authSettings){
                return res.status(400).send("Authentication Settings not found.");
            }

            //Check Session Length from app Settings                      
            if(authSettings.sessions && authSettings.sessions.sessionLength){
                var temp=Number(authSettings.sessions.sessionLength);
                if(!isNaN(temp)){
                    sessionLength=temp;
                }
            }        
            

            //Get user by accessToken
            var authPromises=[];
            if(provider==="facebook"){
                authPromises.push(facebookHelper.getUserByAccessToken(req, appId, authSettings, accessToken));
            }
            if(provider==="google"){
                authPromises.push(googleHelper.getUserByTokens(req, appId, authSettings, accessToken,null));
            } 
            if(provider==="github"){
                authPromises.push(githubHelper.getUserByAccessToken(req, appId, authSettings, accessToken));
            } 
            if(provider==="linkedin"){
                authPromises.push(linkedinHelper.getUserByAccessToken(req, appId, authSettings, accessToken));
            } 
            if(provider==="twitter"){
                authPromises.push(twitterHelper.getUserByTokens(req, appId, authSettings, accessToken, accessSecret));
            } 
           
            q.all(authPromises).then(function(user){

                if(user && user.length>0 && user[0].id){
                    var providerUserId=user[0].id;
                    return global.authService.upsertUserWithProvider(appId,customHelper.getAccessList(req),provider,providerUserId,accessToken,accessSecret);
                }else{
                    var deferred = global.q.defer();
                    deferred.reject("Invalid accessToken");
                    return deferred.promise
                }
                
            }).then(function(result){                
                //create sessions
                setSession(req, appId, sessionLength,result,res); 
                res.json(result);
            },function(error){
                return res.status(400).send(error);
            });

        },function(error){
            return res.status(400).send(error);
        });    
        
        global.apiTracker.log(appId,"User / Login with provider", req.url,sdk);
    });
    
    /**
     * User SignUp API
     */

	global.app.post('/user/:appId/signup', function(req, res) { //for user registeration
        console.log("SIGNUP API");
        var appId = req.params.appId;
		var document = req.body.document;
		var appKey = req.body.key || req.param('key');
        var userId = req.session.userId || null;
		var sdk = req.body.sdk || "REST";

        var isMasterKey=false;
        var sessionLength=30;//Default       

        var promises=[];        
        promises.push(global.appService.getAllSettings(appId));
        promises.push(global.appService.isMasterKey(appId,appKey));

        q.all(promises).then(function(list){
            isMasterKey=list[1];           

            //Check Session Length from app Settings
            if(list[0] && list[0].length>0){
                var auth=_.first(_.where(list[0], {category: "auth"}));           
                if(auth && auth.settings && auth.settings.sessions && auth.settings.sessions.sessionLength){
                    var temp=Number(auth.settings.sessions.sessionLength);
                    if(!isNaN(temp)){
                        sessionLength=temp;
                    }
                }                
            }

            //Make request
            return global.userService.signup(appId, document,customHelper.getAccessList(req),isMasterKey);
        }).then(function(result) {
            if(result){
                //create sessions
                setSession(req, appId, sessionLength, result,res);
                res.json(result);
            }else{
                res.send(null);
            }
        }, function(error) {
            res.status(400).json({
                error: error
            });
        });	
		
        global.apiTracker.log(appId,"User / Signup", req.url,sdk);
    });
    
    /**
     * User Logout Api 
     */

	global.app.post('/user/:appId/logout', function(req, res) { //for logging user out
        var appId = req.params.appId || null;
        var userId = req.session.userId || null;
		var sdk = req.body.sdk || "REST";
		if (req.session.loggedIn === true) {
            req.session.userId = null;
            req.session.loggedIn = false;
            req.session.appId = null;
            req.session.email = null;
            req.session.roles = null;
            global.sessionHelper.saveSession(req.session,function(err,reply){
                console.log(reply);
            });
            res.json(req.body.document);
 		} else {
			res.status(400).json({
				"message": "You are not logged in"
			});
		}
        global.apiTracker.log(appId,"User / Logout", req.url,sdk);
    });
    
    /*
    * Change Password.
    */
    
    global.app.put('/user/:appId/changePassword', function(req, res) { //for logging user out
        var appId = req.params.appId || null;
        var userId = req.session.userId || null;
		var sdk = req.body.sdk || "REST";
        var oldPassword = req.body.oldPassword || "";
        var newPassword = req.body.newPassword || "";
        var appKey = req.body.key || "";
        
        if(!oldPassword || oldPassword === ""){
            res.status(400).json({
				"message": "Old Password is required."
			});
        }
        
        if(!newPassword || newPassword === ""){
            res.status(400).json({
				"message": "New Password is required."
			});
        }
        
		if (req.session.loggedIn === false) {
            res.status(400).json({
				"message": "User should be logged in to change the password."
			});
 		} else {
			var userId = req.session.userId;
            
            global.appService.isMasterKey(appId,appKey).then(function(isMasterKey){
                return global.userService.changePassword(appId, userId, oldPassword, newPassword, customHelper.getAccessList(req), isMasterKey)
            }).then(function(result) {
                res.json(result);
            }, function(error) {
                res.json(400, {
                    error: error
                });
            });
            
		}
        global.apiTracker.log(appId,"User / Logout", req.url,sdk);
    }); 
    
    
     /**
     * User Reset Password 
     */
    

	global.app.post('/user/:appId/resetPassword', function(req, res) { 
        var appId = req.params.appId || null;
        var email = req.body.email || null;
		var sdk = req.body.sdk || "REST";
        
        if(!email){
            return res.status(400).json({
				"message": "Email not found."
			});
        }
        
		if (req.session.loggedIn === true) {
            return res.status(400).json({
				"message": "Password cannot be reset because the user is already logged in. Use change password instead."
			});
 		} 
         
        global.userService.resetPassword(appId, email, customHelper.getAccessList(req), true).then(function(result) {
            res.status(200).json({
				"message": "Password reset email sent."
			});
        }, function(error) {
            res.json(400, {
                error: error
            });
        });
		
        global.apiTracker.log(appId,"User / ResetPassword", req.url,sdk);
    });

    
    /**
     * Add To Role Api 
     */

	global.app.put('/user/:appId/addToRole', function(req, res) { //for assigning user to a role
        console.log("ADD TO ROLE API");
        var appId = req.params.appId;
		var user = req.body.user;
		var role = req.body.role;
		var userId = req.session.userId || "";
		var appKey = req.body.key || req.param('key');
		var sdk = req.body.sdk || "REST";
		
		global.appService.isMasterKey(appId,appKey).then(function(isMasterKey){
			return global.userService.addToRole(appId, user._id, role._id, customHelper.getAccessList(req), isMasterKey)
		}).then(function(result) {
			res.json(result);
 		}, function(error) {
			res.json(400, {
				error: error
			});
		});
        global.apiTracker.log(appId,"User / Role / Add", req.url,sdk);
	});   
    
	global.app.put('/user/:appId/removeFromRole', function(req, res, next) { //for removing role from the user
        console.log("REMOVE FROM ROLE API");
        var appId = req.params.appId;
		var user = req.body.user;
		var role = req.body.role;
		var userId = req.session.userId || "";
		var appKey = req.body.key || req.param('key');
		var sdk = req.body.sdk || "REST";


		global.appService.isMasterKey(appId,appKey).then(function(isMasterKey){
			return global.userService.removeFromRole(appId, user._id, role._id, customHelper.getAccessList(req),isMasterKey);
		}).then(function(result) {
			res.json(result);
 		}, function(error) {
			res.status(400).json({
				error: error
			});
		});
        
        global.apiTracker.log(appId,"User / Role / Remove", req.url,sdk);
	});


	/* Private Methods */ 

	function setSession(req, appId, sessionLength, result,res) {
        if(!req.session.id) {
            req.session = {};
            req.session.id = global.uuid.v1();
        }
        res.header('sessionID',req.session.id);		
        
        var obj = {
            id : req.session.id,
            userId : result._id,
            loggedIn : true,
            appId : appId,
            email : result.email,
            roles : _.map(result.roles, function (role) { return role._id })
        };
        
        req.session = obj;
        
        global.sessionHelper.saveSession(obj,sessionLength);
	}
};