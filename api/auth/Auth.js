
/*
#     CloudBoost - Core Engine that powers Bakend as a Service
#     (c) 2014 HackerBay, Inc. 
#     CloudBoost may be freely distributed under the Apache 2 License
*/



var q = require("q");
var _ = require('underscore');
var uuid = require('uuid');

var customHelper = require('../../helpers/custom.js');

var twitterHelper = require('../../helpers/twitter.js');
var githubHelper = require('../../helpers/github.js');
var linkedinHelper = require('../../helpers/linkedin.js');
var googleHelper = require('../../helpers/google.js');
var facebookHelper = require('../../helpers/facebook.js');

var sessionHelper = require('../../helpers/session');
var appService = require('../../services/app');
var authService = require('../../services/auth');

module.exports = function(app) {  

    app.get("/auth/:appId/twitter", function(req, res) {     
    
        _getAppSettings(req, res).then(function(respObj){

            var appId=respObj.appId;
            var authSettings=respObj.authSettings;            

            twitterHelper.getLoginUrl(req, appId, authSettings).then(function(data){
                return res.status(200).json({url:data.loginUrl});
            },function(err){
                res.status(500).send(err);
            }); 

        });                
    }); 

    app.get("/auth/:appId/twitter/callback", function(req, res) {

        var requestToken = req.query.oauth_token;
        var verifier = req.query.oauth_verifier;

        var sessionLength=30;//Default

        _getAppSettings(req, res).then(function(respObj){

            var appId=respObj.appId;
            var authSettings=respObj.authSettings;           

            //Check Session Length from app Settings                      
            if(authSettings.sessions && authSettings.sessions.sessionLength){
                var temp=Number(authSettings.sessions.sessionLength);
                if(!isNaN(temp)){
                    sessionLength=temp;
                }
            }

            var twitterTokens=null; 
            var twitterReqSecret=null;           

            //Make twitter requests
            twitterHelper.getAccessToken(req, appId, authSettings ,requestToken, twitterReqSecret, verifier)
            .then(function(data){

                twitterTokens=data;
                delete req.session.twitterReqSecret;     

                return twitterHelper.getUserByTokens(req, appId, authSettings, data.accessToken, data.accessSecret);

            }).then(function(user){

                

                var provider="twitter";
                var providerUserId=user.id;
                var providerAccessToken=twitterTokens.accessToken;
                var providerAccessSecret=twitterTokens.accessSecret;

                //save the user
                return authService.upsertUserWithProvider(appId,customHelper.getAccessList(req),provider,providerUserId,providerAccessToken, providerAccessSecret);

            }).then(function(result){

                //create sessions
                var session=setSession(req, appId, sessionLength, result,res);                        
                return res.redirect(authSettings.general.callbackURL+"?cbtoken="+session.id);

            },function(err){
                delete req.session.twitterReqSecret;
                res.status(500).send(err);
            });         

        });        
    }); 


    app.get("/auth/:appId/github", function(req, res) {  

        _getAppSettings(req, res).then(function(respObj){

            var appId=respObj.appId;
            var authSettings=respObj.authSettings;            

            githubHelper.getLoginUrl(req, appId, authSettings).then(function(data){
                return res.status(200).json({url:data.loginUrl});
            },function(error){
                res.status(500).send(error);
            });           

        });         
    });    

    app.get('/auth/:appId/github/callback',function(req, res) { 

        var code = req.query.code;  

        var sessionLength=30;//Default
        _getAppSettings(req, res).then(function(respObj){

            var appId=respObj.appId;
            var authSettings=respObj.authSettings;  

            //Check Session Length from app Settings                      
            if(authSettings.sessions && authSettings.sessions.sessionLength){
                var temp=Number(authSettings.sessions.sessionLength);
                if(!isNaN(temp)){
                    sessionLength=temp;
                }
            }

            var githubAccessToken=null;          

            githubHelper.getOAuthAccessToken(req, appId, authSettings, code).then(function(accessToken){
                githubAccessToken=accessToken;
                return githubHelper.getUserByAccessToken(req, appId, authSettings, accessToken);
            }).then(function(user){

                var provider="github";
                var providerUserId=user.id;                
                var providerAccessToken=githubAccessToken;
                var providerAccessSecret=null;                

                return authService.upsertUserWithProvider(appId,customHelper.getAccessList(req),provider,providerUserId,providerAccessToken,providerAccessSecret);

            }).then(function(result){

                //create sessions
                var session=setSession(req, appId, sessionLength,result,res);                        
                return res.redirect(authSettings.general.callbackURL+"?cbtoken="+session.id);

            },function(error){
                res.status(400).json({
                    error: error
                });
            });            
            
        });
    }); 

    app.get('/auth/:appId/linkedin', function(req, res) {

        _getAppSettings(req, res).then(function(respObj){

            var appId=respObj.appId;
            var authSettings=respObj.authSettings;
           
            linkedinHelper.getLoginUrl(req, appId, authSettings).then(function(data){
                return res.status(200).json({url:data.loginUrl});
            },function(error){
                res.status(500).send(error);
            });         
           
        });        
    }); 

    app.get('/auth/:appId/linkedin/callback', function(req, res) {

        var sessionLength=30;//Default
        _getAppSettings(req, res).then(function(respObj){

            var appId=respObj.appId;
            var authSettings=respObj.authSettings;

            //Check Session Length from app Settings                      
            if(authSettings.sessions && authSettings.sessions.sessionLength){
                var temp=Number(authSettings.sessions.sessionLength);
                if(!isNaN(temp)){
                    sessionLength=temp;
                }
            }

            var linkedinAccessToken=null;
           
            linkedinHelper.getAccessToken(req, appId, authSettings, res, req.query.code, req.query.state)
            .then(function(accessToken){

                linkedinAccessToken=accessToken;
                
                linkedinHelper.getUserByAccessToken(req, appId, authSettings, accessToken).then(function(user){

                    var provider="linkedin";
                    var providerUserId=user.id;
                    var providerAccessToken=linkedinAccessToken;
                    var providerAccessSecret=null;                    

                    authService.upsertUserWithProvider(appId,customHelper.getAccessList(req),provider,providerUserId,providerAccessToken,providerAccessSecret)
                    .then(function(result){
                        //create sessions
                        var session=setSession(req, appId, sessionLength, result,res);                        
                        return res.redirect(authSettings.general.callbackURL+"?cbtoken="+session.id);
                    },function(error){
                        res.status(500).send(error);
                    });

                },function(error){
                    res.status(500).send(error);
                });

            },function(error){
                res.status(500).send(error);
            });          
           
        });
    }); 


    app.get('/auth/:appId/google', function(req, res) { 
        
        _getAppSettings(req, res).then(function(respObj){

            var appId=respObj.appId;
            var authSettings=respObj.authSettings;
            
            googleHelper.getLoginUrl(req, appId, authSettings).then(function(data){
                return res.status(200).json({url:data.loginUrl});
            },function(error){
                res.status(500).send(error);
            });             

        });         
    }); 

    app.get('/auth/:appId/google/callback', function(req, res) {  
           
        var code = req.query.code;                

        var sessionLength=30;//Default
        _getAppSettings(req, res).then(function(respObj){

            var appId=respObj.appId;
            var authSettings=respObj.authSettings;

            //Check Session Length from app Settings                      
            if(authSettings.sessions && authSettings.sessions.sessionLength){
                var temp=Number(authSettings.sessions.sessionLength);
                if(!isNaN(temp)){
                    sessionLength=temp;
                }
            }

            var googleTokens=null;
            googleHelper.getToken(req, appId, authSettings, code).then(function(tokens){
                googleTokens=tokens;
                return googleHelper.getUserByTokens(req, appId, authSettings, tokens.access_token, tokens.refresh_token);
            }).then(function(profile){

                var provider="google";
                var providerUserId=profile.id;
                var providerAccessToken=googleTokens.access_token;
                var providerAccessSecret=null;                

                return authService.upsertUserWithProvider(appId,customHelper.getAccessList(req),provider,providerUserId,providerAccessToken,providerAccessSecret);

            }).then(function(result){

                //create sessions
                var session=setSession(req, appId, sessionLength, result,res);                        
                return res.redirect(authSettings.general.callbackURL+"?cbtoken="+session.id);

            },function(error){
                res.status(500).send(error);
            });              
              
        });      
    }); 

    app.get('/auth/:appId/facebook', function(req, res) {

        _getAppSettings(req, res).then(function(respObj){

            var appId=respObj.appId;
            var authSettings=respObj.authSettings;
            
            facebookHelper.getLoginUrl(req, appId, authSettings).then(function(data){
                return res.status(200).json({url:data.loginUrl});
            },function(error){
                res.status(500).send(error);
            });                     

        });
        
    }); 

    app.get('/auth/:appId/facebook/callback', function(req, res) {  
        
        var code = req.query.code;

        var sessionLength=30;//Default
        _getAppSettings(req, res).then(function(respObj){

            var appId=respObj.appId;            
            var authSettings=respObj.authSettings;

             //Check Session Length from app Settings                      
            if(authSettings.sessions && authSettings.sessions.sessionLength){
                var temp=Number(authSettings.sessions.sessionLength);
                if(!isNaN(temp)){
                    sessionLength=temp;
                }
            }

            var fbAccessToken=null;
            facebookHelper.getAccessToken(req, appId, authSettings, code).then(function(accessToken){
                fbAccessToken=accessToken;
                return facebookHelper.getUserByAccessToken(req, appId, authSettings, accessToken);

            }).then(function(user){

                var provider="facebook";
                var providerUserId=user.id;
                var providerAccessToken=fbAccessToken;
                var providerAccessSecret=null;                

                return authService.upsertUserWithProvider(appId,customHelper.getAccessList(req),provider,providerUserId,providerAccessToken,providerAccessSecret);
                        
            }).then(function(result){

                //create sessions
                var session=setSession(req, appId, sessionLength,result,res);                        
                return res.redirect(authSettings.general.callbackURL+"?cbtoken="+session.id);

            },function(error){
                res.status(500).send(error);
            });         
        });
    });  
};    

/************************ Private Functions *************************/

function setSession(req, appId, sessionLength, result,res) {
    if(!req.session.id) {
        req.session = {};
        req.session.id = uuid.v1();
    }
    res.header('sessionID',req.session.id);     
    
    var obj = {
        id : req.session.id,
        userId : result._id,
        loggedIn : true,
        appId : appId,
        roles : _.map(result.roles, function (role) { return role._id ; })        
    };

    req.session = obj;
    
    sessionHelper.saveSession(obj,sessionLength);
    return req.session;
}

function _getAppSettings(req,res){

    var deferred = q.defer();

    var appId = req.params.appId || null; 

    if(!appId){
        return res.status(400).send("AppId is invalid.");
    }

    var promises=[];

    promises.push(appService.getAllSettings(appId));    
    q.all(promises).then(function(list){       

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

        var response={
            appId:appId,            
            authSettings:authSettings
        };
        deferred.resolve(response);

    },function(error){
        return res.status(400).send(error);
    });

    return deferred.promise ;   
}




