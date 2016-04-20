var q = require("q");
var util = require("../../helpers/util.js");
var customHelper = require('../../helpers/custom.js');
var _ = require('underscore');
var request = require('request');

module.exports = function() {  

    app.get("/auth/:appId/twitter", function(req, res) {   
   
    
        _getAppSettings(req, res).then(function(respObj){

            var appId=respObj.appId;
            var authSettings=respObj.authSettings;

            var Twitter = require("node-twitter-api");

            var consumerKey=authSettings.twitter.appId;
            var consumerSecret=authSettings.twitter.appSecret;

            var twitter = new Twitter({
                consumerKey: consumerKey ,
                consumerSecret: consumerSecret,
                callback: req.protocol + '://' + req.headers.host + "/auth/"+appId+"/twitter/callback",
                x_auth_access_type: "write"
            });

            twitter.getRequestToken(function(err, requestToken, requestSecret) {
                if (err){
                    res.status(500).send(err);
                }else {
                    if(!req.session){
                        req.session = {};
                    }                    
                    req.session.twitterReqSecret=requestSecret;   

                    var url= "https://api.twitter.com/oauth/authenticate?oauth_token=" + requestToken;
                    return res.status(200).json({url:url});                                      
                }
            });
        });                
    }); 

    app.get("/auth/:appId/twitter/callback", function(req, res) {

        var requestToken = req.query.oauth_token;
        var verifier = req.query.oauth_verifier;

        _getAppSettings(req, res).then(function(respObj){

            var appId=respObj.appId;
            var authSettings=respObj.authSettings;

            var Twitter = require("node-twitter-api");
            
            var consumerKey=authSettings.twitter.appId;
            var consumerSecret=authSettings.twitter.appSecret;
            
            var twitter = new Twitter({
                consumerKey: consumerKey ,
                consumerSecret: consumerSecret,
                callback: req.protocol + '://' + req.headers.host + "/auth/"+appId+"/twitter/callback",
                x_auth_access_type: "write"
            });

            twitter.getAccessToken(requestToken, req.session.twitterReqSecret, verifier, function(err, accessToken, accessSecret) {
                if (err){
                    delete req.session.twitterReqSecret;
                    res.status(500).send(err);
                }else{
                    delete req.session.twitterReqSecret;
                    twitter.verifyCredentials(accessToken, accessSecret, function(err, user) {
                        if (err){
                            res.status(500).send(err);
                        }else{
                            console.log(user);

                            var provider="twitter";
                            var providerUserId=user.id;
                            global.authService.authUser(appId,customHelper.getAccessList(req),provider,providerUserId,accessToken)
                            .then(function(result){                            
                                //create sessions
                                setSession(req, appId, result,res);                        
                                return res.redirect(authSettings.custom.callbackURL);
                            },function(error){
                                res.status(400).json({
                                    error: error
                                });
                            });                             
                        }
                    });
                }    
            });

        });        
    }); 


    app.get("/auth/:appId/github", function(req, res) {  

        _getAppSettings(req, res).then(function(respObj){

            var appId=respObj.appId;
            var authSettings=respObj.authSettings;
             
            var githhubClientId=authSettings.github.appId;
            var githubClientSecret=authSettings.github.appSecret;  
            var oauth = require("oauth").OAuth2;          
            
            var OAuth2 = new oauth(githhubClientId, githubClientSecret, "https://github.com/", "login/oauth/authorize", "login/oauth/access_token");
           
            var url= OAuth2.getAuthorizeUrl({
                redirect_uri: req.protocol + '://' + req.headers.host +'/auth/'+appId+'/github/callback',
                scope: _getGithubFieldString(authSettings).concat(_getGithubScopeString(authSettings))
            });           
           
            return res.status(200).json({url:url});

        });         
    });    

    app.get('/auth/:appId/github/callback',function(req, res) { 

        var code = req.query.code;  

        _getAppSettings(req, res).then(function(respObj){

            var appId=respObj.appId;
            var authSettings=respObj.authSettings;            

            var githhubClientId=authSettings.github.appId;
            var githubClientSecret=authSettings.github.appSecret; 

            var github = require('octonode');
            var oauth = require("oauth").OAuth2; 
            var OAuth2 = new oauth(githhubClientId, githubClientSecret, "https://github.com/", "login/oauth/authorize", "login/oauth/access_token");    
            
            OAuth2.getOAuthAccessToken(code, {}, function (err, access_token, refresh_token) {
                if (err) {
                  console.log(err);
                  res.status(500).send(err);
                }else{                   
                    // authenticate github API
                    console.log("AccessToken: "+access_token+"\n");
                    
                    var client = github.client(access_token);

                    client.get('/user', {}, function (err, status, body, headers) {
                        console.log(body); //json object

                        var provider="github";
                        var providerUserId=body.id;
                        global.authService.authUser(appId,customHelper.getAccessList(req),provider,providerUserId,access_token)
                        .then(function(result){                            
                            //create sessions
                            setSession(req, appId, result,res);                        
                            return res.redirect(authSettings.custom.callbackURL);
                        },function(error){
                            res.status(400).json({
                                error: error
                            });
                        });
                    });
                }            
            });
            
        });
    }); 

    app.get('/auth/:appId/linkedin', function(req, res) {

        _getAppSettings(req, res).then(function(respObj){

            var appId=respObj.appId;
            var authSettings=respObj.authSettings;
           
            var clienId=authSettings.linkedIn.appId;
            var clientSecret=authSettings.linkedIn.appSecret;

            var Linkedin = require('node-linkedin')(clienId, clientSecret);
          
            Linkedin.setCallback(req.protocol + '://' + req.headers.host + '/auth/'+appId+'/linkedin/callback');
            var scope = _getLinkedinScopeString(authSettings);
            
            var url = Linkedin.auth.authorize(scope);
            return res.status(200).json({url:url});

        });        
    }); 

    app.get('/auth/:appId/linkedin/callback', function(req, res) {

        _getAppSettings(req, res).then(function(respObj){

            var appId=respObj.appId;
            var authSettings=respObj.authSettings;

            var clienId=authSettings.linkedIn.appId;
            var clientSecret=authSettings.linkedIn.appSecret;
            
            var Linkedin = require('node-linkedin')(clienId, clientSecret);

            Linkedin.setCallback(req.protocol + '://' + req.headers.host + '/auth/'+appId+'/linkedin/callback');

            Linkedin.auth.getAccessToken(res, req.query.code, req.query.state, function(err, results) {
                if ( err ){
                    console.error(err);
                    return res.status(500).send(err);
                }else{
                    
                    var linkedin = Linkedin.init(results.access_token);

                    linkedin.people.me(function(err, $in) {
                        // Loads the profile of access token owner. 
                        console.log($in);
                        var provider="linkedin";
                        var providerUserId=$in.id;
                        global.authService.authUser(appId,customHelper.getAccessList(req),provider,providerUserId,results.access_token)
                        .then(function(result){                            
                            //create sessions
                            setSession(req, appId, result,res);                        
                            return res.redirect(authSettings.custom.callbackURL);
                        },function(error){
                            res.status(400).json({
                                error: error
                            });
                        }); 
                    });
                     
                }            
            });
        });
    }); 


    app.get('/auth/:appId/google', function(req, res) { 
        
        _getAppSettings(req, res).then(function(respObj){

            var appId=respObj.appId;
            var authSettings=respObj.authSettings;
            
            var google = require('googleapis');
            var OAuth2Client = google.auth.OAuth2;

            var clientId = authSettings.google.appId;
            var clientSecret = authSettings.google.appSecret;
            var redirect = req.protocol + '://' + req.headers.host +'/auth/'+appId+'/google/callback';  

            oauth2Client = new OAuth2Client(clientId, clientSecret, redirect);             

            var url = oauth2Client.generateAuthUrl({
              access_type: 'offline',
              scope:_getGoogleFieldString(authSettings).concat(_getGoogleScopeString(authSettings))
            }); 

            return res.status(200).json({url:url});

        });         
    }); 

    app.get('/auth/:appId/google/callback', function(req, res) {  
           
        var code = req.query.code;                

        _getAppSettings(req, res).then(function(respObj){

            var appId=respObj.appId;
            var authSettings=respObj.authSettings;

            var google = require('googleapis');
            var plus = google.plus('v1');
            var OAuth2Client = google.auth.OAuth2;

            var clientId = authSettings.google.appId;
            var clientSecret = authSettings.google.appSecret;
            var redirect = req.protocol + '://' + req.headers.host +'/auth/'+appId+'/google/callback';  

            oauth2Client = new OAuth2Client(clientId, clientSecret, redirect);
            
            oauth2Client.getToken(code, function(err, tokens) {              
              if(err){
                return res.status(500).send(err);
              }else {            
                oauth2Client.setCredentials(tokens);
                plus.people.get({ userId: 'me', auth: oauth2Client }, function(err, profile) {
                    if (err) {
                      console.log('An error occured', err);
                      return res.status(500).send(err);                  
                    }else{
                        console.log(profile);
                        var accessToken=tokens.access_token;

                        var provider="google";
                        var providerUserId=profile.id;
                        global.authService.authUser(appId,customHelper.getAccessList(req),provider,providerUserId,accessToken)
                        .then(function(result){                            
                            //create sessions
                            setSession(req, appId, result,res);                        
                            return res.redirect(authSettings.custom.callbackURL);
                        },function(error){
                            res.status(400).json({
                                error: error
                            });
                        });
                    }
                    
                });
              }
            }); 
        });      
    }); 

    app.get('/auth/:appId/facebook', function(req, res) {

        _getAppSettings(req, res).then(function(respObj){

            var appId=respObj.appId;
            var authSettings=respObj.authSettings;
            
            var FB = require('fb');

            var fbAppId=authSettings.facebook.appId;
            var fbAppSecret=authSettings.facebook.appSecret;
           
            FB.options({
                appId:          fbAppId,
                appSecret:      fbAppSecret,
                redirectUri:    req.protocol + '://' + req.headers.host+"/auth/"+appId+"/facebook/callback"
            });

            var url=FB.getLoginUrl({ scope: _getFbScopeString(authSettings) });                                       
            return res.status(200).json({url:url});            

        });
        
    }); 

    app.get('/auth/:appId/facebook/callback', function(req, res) {  
        
        var code = req.query.code;

        _getAppSettings(req, res).then(function(respObj){

            var appId=respObj.appId;            
            var authSettings=respObj.authSettings;

            var FB = require('fb');

            var fbAppId=authSettings.facebook.appId;
            var fbAppSecret=authSettings.facebook.appSecret;

            FB.options({
                appId:          fbAppId,
                appSecret:      fbAppSecret,
                redirectUri:    req.protocol + '://' + req.headers.host+"/auth/"+appId+"/facebook/callback"
            });

            FB.api('oauth/access_token', {
                client_id:      FB.options('appId'),
                client_secret:  FB.options('appSecret'),
                redirect_uri:   FB.options('redirectUri'),
                code:           code
            }, function (results) {
                if(!results || results.error) {
                    console.log(res.error);
                    return res.status(500).send(results.error); 
                }else{
             
                    var accessToken = results.access_token;                    
                    
                    FB.setAccessToken(accessToken);
                    FB.api('me', { fields: _getFbFieldString(authSettings), access_token: accessToken }, function (fbRes) {

                        console.log(fbRes);

                        var provider="facebook";
                        var providerUserId=fbRes.id;
                        global.authService.authUser(appId,customHelper.getAccessList(req),provider,providerUserId,accessToken)
                        .then(function(result){                            
                            //create sessions
                            var session=setSession(req, appId, result,res);                        
                            return res.redirect(authSettings.custom.callbackURL+"?sessionId="+session.id);
                        },function(error){
                            res.status(400).json({
                                error: error
                            });
                        });                        
                                            
                    });
                }
            });
        });
    });  
}    

/************************ Private Functions *************************/

function setSession(req, appId, result,res) {
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
        roles : _.map(result.roles, function (role) { return role._id })        
    };

    req.session = obj;
    
    global.sessionHelper.saveSession(obj);
    return req.session;
}

function _getAppSettings(req,res){

    var deferred = global.q.defer();

    var appId = req.params.appId || null; 

    if(!appId){
        return res.status(400).send("AppId is invalid.");
    }

    var promises=[];

    promises.push(global.appService.getAllSettings(appId));    
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

    return deferred.promise    
}

function _getFbScopeString(authSettings){
    var json=authSettings.facebook.permissions;

    var scopeArray=[];
    for (var key in json) {
        if (json.hasOwnProperty(key) && json[key].enabled) {
          scopeArray.push(json[key].scope);
        }
    }

    return scopeArray.toString();
}

function _getFbFieldString(authSettings){
    var json=authSettings.facebook.attributes;

    var fieldArray=[];
    for (var key in json) {
        if (json.hasOwnProperty(key) && json[key]) {
          fieldArray.push(key.toString());
        }
    }

    return fieldArray;
} 


function _getGoogleFieldString(authSettings){
    var json=authSettings.google.attributes;

    var scopeString=''; 
    var isFirst=false;
    
    for (var key in json) {
        if (json.hasOwnProperty(key) && json[key].enabled) {  
            var scope;
            if(!isFirst){
                scope=json[key].scope;
                isFirst=true;
            }else{
                scope=" "+json[key].scope;
            }
            scopeString = scopeString.concat(scope);
        }
    }

    return scopeString;
} 

function _getGoogleScopeString(authSettings){
    var json=authSettings.google.permissions;       
    
    var scopeString=''; 
    for (var key in json) {
        if (json.hasOwnProperty(key) && json[key].enabled) {                
            scopeString = scopeString.concat(" "+json[key].scope);
        }
    }

    return scopeString;
}


function _getGithubFieldString(authSettings){
    var json=authSettings.github.attributes;

    var scopeArray=[];
    for (var key in json) {
        if (json.hasOwnProperty(key) && json[key].enabled) {
          scopeArray.push(json[key].scope);
        }
    }

    return scopeArray;
}

function _getGithubScopeString(authSettings){
    var json=authSettings.github.permissions;

    var scopeArray=[];
    for (var key in json) {
        if (json.hasOwnProperty(key) && json[key].enabled) {
          scopeArray.push(json[key].scope);
        }
    }

    return scopeArray;
}

function _getLinkedinScopeString(authSettings){
    var json=authSettings.linkedIn.permissions;

    var scopeArray=[];
    for (var key in json) {
        if (json.hasOwnProperty(key) && json[key]) {
          scopeArray.push(key.toString());
        }
    }

    return scopeArray;
}