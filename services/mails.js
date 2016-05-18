var smtpConfig = null;
var defaultTransporter = null;
var mandrill = require('mandrill-api/mandrill');
var _ = require('underscore');
var jsdom = require("jsdom");
var fs = require("fs");

module.exports = function(){
         
    var mail = {}; 

    /*Desc   : Send Reset Password Email
      Params : appId,to,subject,text,from,userObj,passwordResetKey,urlToReset
      Returns: Promise
               Resolve->Success Message
               Reject->Error on getAllSettings() or _getDefaultTemplate() or _mergeVariableInTemplate() or _getCredentials() or self.send()
    */
    mail.sendResetPasswordMail = function(appId, email, user, passwordResetKey){

        var deferred = q.defer();

        try{         

            var emailSettings=null;
            var emailTemplate=null;
            var serverUrl=null;

            global.appService.getAllSettings(appId).then(function(settings){

                var promises=[];
                promises.push(_getEmailSettings(settings));
                promises.push(_getEmailTemplate(settings,"resetpassword"));
                promises.push(global.keyService.getMyUrl());

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

                },function(error){
                });              

            },function(error){
            });    

        } catch(err){           
            global.winston.log('error',{"error":String(err),"stack": new Error().stack});
            deferred.reject(err);
        }

        return deferred.promise;
         
    };

    /*Desc   : Send Reset Password Email
      Params : appId,to,subject,text,from,userObj,passwordResetKey,urlToReset
      Returns: Promise
               Resolve->Success Message
               Reject->Error on getAllSettings() or _getDefaultTemplate() or _mergeVariableInTemplate() or _getCredentials() or self.send()
    */
    mail.sendSignUpMail = function(appId, user, passwordResetKey){

        var deferred = q.defer();

        try{         

            var emailSettings=null;
            var emailTemplate=null;
            global.appService.getAllSettings(appId).then(function(settings){

                var promises=[];
                promises.push(_getEmailSettings(settings));
                promises.push(_getEmailTemplate(settings,"signup"));

                q.all(promises).then(function(list){
                    _mergeVariablesInTemplate(list[0]);
                },function(error){
                });              

            },function(error){
            });    

        } catch(err){           
            global.winston.log('error',{"error":String(err),"stack": new Error().stack});
            deferred.reject(err);
        }

        return deferred.promise;
         
    };     
  
    return mail;

};


function _getEmailSettings(settings){

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
                emailConfig.fromEmail=emailSettings[0].settings.mandrill.fromEmail;
            }
            if(emailSettings[0].settings.mailgun.enabled && emailSettings[0].settings.mailgun.apiKey && emailSettings[0].settings.mailgun.domain){
                //provider is mailgun
                //Note api key and domain
                emailConfig.provider="mailgun";
                emailConfig.apiKey=emailSettings[0].settings.mailgun.apiKey;
                emailConfig.fromEmail=emailSettings[0].settings.mailgun.fromEmail;
            }
        }else{

            try{
                var smtpConfig = require('../config/smtp.json');
            }catch(e){
                return deferred.reject("SMTP Configuration file not found.");
            }
                 
            if(!smtpConfig){
                deferred.reject("SMTP Configuration file not found.");
            }else{
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
        global.winston.log('error',{"error":String(err),"stack": new Error().stack});
        deferred.reject(err);
    }

    return deferred.promise;
}

function _getEmailTemplate(settings,templateName){

    var deferred = q.defer();

    try{ 

        var functionName=null;

        if(templateName=="signup"){
            functionName="signupEmail";
        }
        if(templateName=="resetpassword"){
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
            _getTemplateByName("sign-up").then(function(defaultTemp){
                deferred.resolve(defaultTemp);
            },function(error){
                deferred.reject(err);
            });
        } 

    } catch(err){           
        global.winston.log('error',{"error":String(err),"stack": new Error().stack});
        deferred.reject(err);
    }

    return deferred.promise;

}

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
        global.winston.log('error',{"error":String(err),"stack": new Error().stack});
        deferred.reject(err);
    }

    return deferred.promise;
}

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

                    // href link
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
        global.winston.log('error',{"error":String(err),"stack": new Error().stack});
        deferred.reject(err);
    }  

    return deferred.promise;
}

