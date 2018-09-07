
/*
#     CloudBoost - Core Engine that powers Bakend as a Service
#     (c) 2014 HackerBay, Inc.
#     CloudBoost may be freely distributed under the Apache 2 License
*/


var smtpConfig = require('../config/config').smtp;
var _ = require('underscore');
var jsdom = require("jsdom");
var fs = require("fs");
var appService = require('../services/app');
var keyService = require('../database-connect/keyService');
var q = require('q');
var winston = require('winston');

var mail = {};

/*Desc   : Send Reset Password Email
  Params : appId, email, user, passwordResetKey
  Returns: Promise
           Resolve->Success Message
           Reject->Error on getAllSettings() or _getEmailSettings() or _getEmailTemplate() or getMyUrl() or _mergeVariablesInTemplate() or sendMail
*/
mail.sendResetPasswordMail = function(appId, email, user, passwordResetKey){

    var deferred = q.defer();

    try{

        var emailSettings=null;
        var emailTemplate=null;
        var serverUrl=null;

        appService.getAllSettings(appId).then(function(settings){

            var promises=[];
            promises.push(_getEmailSettings(settings,true));
            promises.push(_getEmailTemplate(settings,"reset-password"));
            promises.push(keyService.getMyUrl());

            q.all(promises).then(function(list){

                //Resolved data
                emailSettings=list[0];
                emailTemplate=list[1];
                serverUrl=list[2];

                var username= user.name || user.firstName || user.username || " ";

                var variableArray=[{
                    "domClass": "username",
                    "content": username,
                    "contentType": "text"
                },{
                    "domClass": "link",
                    "content": encodeURI(serverUrl+"/page/"+appId+"/reset-password?user="+username+"&resetKey="+passwordResetKey),
                    "contentType": "anchortag"
                }];

                return _mergeVariablesInTemplate(emailTemplate, variableArray);

            }).then(function(mergedTemplate){

                emailSettings.emailTo=email;
                emailSettings.subject="Reset Password";
                emailSettings.template=mergedTemplate;

                if(emailSettings.provider=="mandrill"){
                    return _mandrill(emailSettings);
                }else if(emailSettings.provider=="mailgun"){
                    return _mailGun(emailSettings);
                }

            }).then(function(response){
                deferred.resolve(response);
            },function(error){
                deferred.reject(error);
            });

        },function(error){
            deferred.reject(error);
        });

    } catch(err){
        winston.log('error',{"error":String(err),"stack": new Error().stack});
        deferred.reject(err);
    }

    return deferred.promise;

};

/*Desc   : Send Sign Email
  Params : appId, user, activateKey
  Returns: Promise
           Resolve->Success Message
           Reject->Error on getAllSettings() or _getEmailSettings() or _getEmailTemplate() or getMyUrl() or _mergeVariablesInTemplate() or sendMail
*/
mail.sendSignupMail = function(appId, user, activateKey){

    var deferred = q.defer();

    try{

        var emailSettings=null;
        var emailTemplate=null;
        var serverUrl=null;

        appService.getAllSettings(appId).then(function(settings){

            //Check email on sign up enabled
            var emailOnSignupEnabled=false;
            var auth=_.first(_.where(settings, {category: "auth"}));
            if(auth && auth.settings && auth.settings.signupEmail && auth.settings.signupEmail.enabled){
                emailOnSignupEnabled=true;
            }

            if(emailOnSignupEnabled){
                var promises=[];
                promises.push(_getEmailSettings(settings,true));
                promises.push(_getEmailTemplate(settings,"sign-up"));
                promises.push(keyService.getMyUrl());

                q.all(promises).then(function(list){

                    //Resolved data
                    emailSettings=list[0];
                    emailTemplate=list[1];
                    serverUrl=list[2];

                    var username= user.name || user.firstName || user.username || " ";

                    var variableArray=[{
                        "domClass": "username",
                        "content": username,
                        "contentType": "text"
                    },{
                        "domClass": "link",
                        "content": encodeURI(serverUrl+"/page/"+appId+"/verify?activateKey="+activateKey),
                        "contentType": "anchortag"
                    }];

                    return _mergeVariablesInTemplate(emailTemplate, variableArray);

                }).then(function(mergedTemplate){

                    emailSettings.emailTo=user.email;
                    emailSettings.subject="Activate Account";
                    emailSettings.template=mergedTemplate;

                    if(emailSettings.provider=="mandrill"){
                        return _mandrill(emailSettings);
                    }else if(emailSettings.provider=="mailgun"){
                        return _mailGun(emailSettings);
                    }

                }).then(function(response){
                    deferred.resolve(response);
                },function(error){
                    deferred.reject(error);
                });
            }else{
                deferred.resolve("Email on signup not enabled.");
            }

        },function(error){
            deferred.reject(error);
        });

    } catch(err){
        winston.log('error',{"error":String(err),"stack": new Error().stack});
        deferred.reject(err);
    }

    return deferred.promise;

};

/*Desc   : Send Push Campaign Email
  Params : appId,user, email body
  Returns: Promise
           Resolve->Success Message
           Reject->Error on getAllSettings() or _getEmailSettings() or sendMail
*/
mail.emailCampaign = function(appId,userEmail,emailBody,emailSubject){
    var deferred = q.defer();

    try{

        var emailSettings=null;

        appService.getAllSettings(appId).then(function(settings){

            var promises=[];
            promises.push(_getEmailSettings(settings,false));

            q.all(promises).then(function(list){

                //Resolved data
                emailSettings=list[0];

                emailSettings.emailTo=userEmail;
                emailSettings.subject=emailSubject;
                emailSettings.template=emailBody;

                if(emailSettings.provider=="mandrill"){
                    return _mandrill(emailSettings);
                }else if(emailSettings.provider=="mailgun"){
                    return _mailGun(emailSettings);
                }

            }).then(function(response){
                deferred.resolve(response);
            },function(error){
                deferred.reject(error);
            });

        },function(error){
            deferred.reject(error);
        });

    } catch(err){
        winston.log('error',{"error":String(err),"stack": new Error().stack});
        deferred.reject(err);
    }

    return deferred.promise;
};

module.exports = mail;


/*Desc   : Send Email through Mandrill
  Params : emailSettings Json
  Returns: Promise
           Resolve->Success Message
           Reject-> Failure message to send
*/
function _mandrill(emailSettings){

    var deferred = q.defer();

    try{
        var mandrill = require('mandrill-api/mandrill');
        var mandrill_client = new mandrill.Mandrill(emailSettings.apiKey);

        var message = {
            "html": emailSettings.template,
            "subject": emailSettings.subject,
            "from_email": emailSettings.fromEmail,
            "from_name": emailSettings.fromName,
            "to": [{
                    "email": emailSettings.emailTo
            }]
        };

        var async = false;

        mandrill_client.messages.send({"message": message, "async": async, "ip_pool": null, "send_at": null}, function(result) {
            if(result && result[0]){
                if(result[0].status=="sent"){

                    deferred.resolve(result[0].status);
                }
                if(result[0].status=="rejected"){

                    deferred.reject(result[0].status);
                }
            }else{

                deferred.reject("Failed to send!");
            }

        }, function(e) {
            deferred.reject(e);
        });

    } catch(err){
        winston.log('error',{"error":String(err),"stack": new Error().stack});
        deferred.reject(err);
    }

    return deferred.promise;
}

/*Desc   : Send Email through Mailgun
  Params : emailSettings Json
  Returns: Promise
           Resolve->Success Message
           Reject-> Failure message to send
*/
function _mailGun(emailSettings){

    var deferred = q.defer();

    try{

        var nodemailer = require('nodemailer');
        var mailgun = require('nodemailer-mailgun-transport');
        var nodemailerMailgun = nodemailer.createTransport(mailgun({
          auth: {
            api_key: emailSettings.apiKey,
            domain: emailSettings.domain
          }
        }));

        nodemailerMailgun.sendMail({
          from: emailSettings.fromEmail,
          to: emailSettings.emailTo,
          subject: emailSettings.subject,
          html: emailSettings.template
        }, function (err, info) {
          if (err) {

            deferred.reject(err);
          }else {

            deferred.resolve(info);
          }
        });

    } catch(err){
        winston.log('error',{"error":String(err),"stack": new Error().stack});
        deferred.reject(err);
    }

    return deferred.promise;
}

/*Desc   : Get EMail Settings
  Params : appSettings Json,
           returnDefault(default cloudboost setting will be returned if no email setting found on settings param)
  Returns: Promise
           Resolve->Settings Json
           Reject-> Error on retriving Json from Internal File or Confirguration not found
*/
function _getEmailSettings(settings,returnDefault){

    var deferred = q.defer();

    try{

        var emailConfig={};

        var emailSettingsFound=false;

        if(settings && settings.length>0){
            var emailSettings=_.where(settings, {category: "email"});
            if(emailSettings && emailSettings.length>0){
                if(emailSettings[0].settings && (emailSettings[0].settings.mandrill.apiKey || emailSettings[0].settings.mailgun.apiKey)){
                    emailSettingsFound=true;
                }
            }
        }

        if(emailSettingsFound){
            if(emailSettings[0].settings.mandrill.enabled && emailSettings[0].settings.mandrill.apiKey){
                //provider is mandrill
                //Note api key
                emailConfig.provider="mandrill";
                emailConfig.apiKey=emailSettings[0].settings.mandrill.apiKey;
                emailConfig.fromEmail=emailSettings[0].settings.fromEmail;
                emailConfig.fromName=emailSettings[0].settings.fromName;
            }
            if(emailSettings[0].settings.mailgun.enabled && emailSettings[0].settings.mailgun.apiKey && emailSettings[0].settings.mailgun.domain){
                //provider is mailgun
                //Note api key and domain
                emailConfig.provider="mailgun";
                emailConfig.apiKey=emailSettings[0].settings.mailgun.apiKey;
                emailConfig.domain=emailSettings[0].settings.mailgun.domain;
                emailConfig.fromEmail=emailSettings[0].settings.fromEmail;
            }
        } else if ( returnDefault == true ) {

            if(!smtpConfig.provider){
                deferred.reject("SMTP Configuration file not found.");
            } else {
                emailConfig=smtpConfig;
            }
        }

        //Final Check
        if(emailConfig.apiKey){
            deferred.resolve(emailConfig);
        }else{
            deferred.reject("Email Configuration is not found.");
        }

    } catch(err){
        winston.log('error',{"error":String(err),"stack": new Error().stack});
        deferred.reject(err);
    }

    return deferred.promise;
}

/*Desc   : Get Email Template
  Params : settings,templateName
  Returns: Promise
           Resolve->template
           Reject-> Error on retriving Template from Internal File
*/
function _getEmailTemplate(settings,templateName){

    var deferred = q.defer();

    try{

        var functionName=null;

        if(templateName=="sign-up"){
            functionName="signupEmail";
        }
        if(templateName=="reset-password"){
            functionName="resetPasswordEmail";
        }

        var emailTemplateFound=false;

        if(settings && settings.length>0){
            var authSettings=_.where(settings, {category: "auth"});
            if(authSettings && authSettings.length>0 && functionName){
                if(authSettings[0].settings && authSettings[0].settings[functionName].enabled &&  authSettings[0].settings[functionName].template){
                    emailTemplateFound=true;
                    deferred.resolve(authSettings[0].settings[functionName].template);
                }
            }
        }

        if(!emailTemplateFound){
            _getTemplateByName(templateName).then(function(defaultTemp){
                deferred.resolve(defaultTemp);
            },function(err){
                deferred.reject(err);
            });
        }

    } catch(err){
        winston.log('error',{"error":String(err),"stack": new Error().stack});
        deferred.reject(err);
    }

    return deferred.promise;

}

/*Desc   : Retrive file from internal repo
  Params : templateName
  Returns: Promise
           Resolve->file
           Reject-> Error on retriving file from Internal File
*/
function _getTemplateByName(templateName){
    var deferred = q.defer();
    try{
        fs.readFile('./mail-templates/'+templateName+'.html', 'utf8', function(error, data) {
            if(error){
                deferred.reject(error);
            }else if(data){
                deferred.resolve(data);
            }
        });

    } catch(err){
        winston.log('error',{"error":String(err),"stack": new Error().stack});
        deferred.reject(err);
    }

    return deferred.promise;
}

/*Desc   : Merge varianbles in  template
  Params : template, variableArray
  Returns: Promise
           Resolve->merged Template
           Reject-> Error on process DOM activities
*/
function _mergeVariablesInTemplate(template, variableArray){

    var deferred = q.defer();

    try{

        //Parse Template
        jsdom.env(template, [], function (error, window) {
            if(error){
                deferred.reject("Cannot parse mail template.");
            }else{

                var $ = require('jquery')(window);

                for(var i=0;i<variableArray.length;++i){

                    //Plain text
                    if(variableArray[i].contentType=="text"){
                        $("."+variableArray[i].domClass).text(variableArray[i].content);
                    }

                    //href link
                    if(variableArray[i].contentType=="anchortag"){
                        $("."+variableArray[i].domClass).attr("href", variableArray[i].content);
                    }

                    //html content
                    if(variableArray[i].contentType=="html"){
                        $("."+variableArray[i].domClass).html(variableArray[i].content);
                    }
                }

                deferred.resolve(window.document.documentElement.outerHTML);
            }
        });

    } catch(err){
        winston.log('error',{"error":String(err),"stack": new Error().stack});
        deferred.reject(err);
    }

    return deferred.promise;
}


