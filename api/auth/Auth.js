var q = require("q");
var util = require("../../helpers/util.js");
var request = require('request');
var Twitter = require("node-twitter-api");

var twitter = new Twitter({
    consumerKey: "dfrs6seDhmMrH1kg7K9cDONQg" ,
    consumerSecret: "9kLrZWFfBu6YVHgXaOxcDpbRrgaJI3Fh94TYXEjJFdU0kNu4Ux",
    callback: "http://localhost:4730/auth/twitter/callback"
});

var githhubClientId="711f470cf34a3faa0bba";
var githubClientSecret="05b25184ff5df287ed0f204db52b9370db64444c";

var oauth = require("oauth").OAuth2;
var OAuth2 = new oauth(githhubClientId, githubClientSecret, "https://github.com/", "login/oauth/authorize", "login/oauth/access_token");

var github = require('octonode');

module.exports = function() {  

    app.get("/auth/twitter/request-token", function(req, res) {       

        twitter.getRequestToken(function(err, requestToken, requestSecret) {
            if (err)
                res.status(500).send(err);
            else {
                _requestSecret = requestSecret;
                res.redirect("https://api.twitter.com/oauth/authenticate?oauth_token=" + requestToken);
            }
        });
    }); 

    app.get("/auth/twitter/callback", function(req, res) {

        var requestToken = req.query.oauth_token;
        var verifier = req.query.oauth_verifier;

        twitter.getAccessToken(requestToken, _requestSecret, verifier, function(err, accessToken, accessSecret) {
            if (err){
                res.status(500).send(err);
            }
            else{
                twitter.verifyCredentials(accessToken, accessSecret, function(err, user) {
                    if (err){
                        res.status(500).send(err);
                    }
                    else{
                        console.log(user);
                        res.send(user);
                    }
                });
            }    
        });
    }); 


    app.get("/auth/github/request-token", function(req, res) {         

        res.writeHead(303, {
         Location: OAuth2.getAuthorizeUrl({
           redirect_uri: 'http://localhost:4730/auth/github/callback'
         })
        });
        res.end();
    });    

    app.get('/auth/github/callback',function(req, res) {         
        var code = req.query.code;       
        OAuth2.getOAuthAccessToken(code, {}, function (err, access_token, refresh_token) {
            if (err) {
              console.log(err);
            }
            accessToken = access_token;
            // authenticate github API
            console.log("AccessToken: "+accessToken+"\n");

            var client = github.client(accessToken);

            client.get('/user', {}, function (err, status, body, headers) {
              console.log(body); //json object
            });
        });

       res.redirect('http://www.google.com');
    });      
}    

