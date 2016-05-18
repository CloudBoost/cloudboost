var smtpConfig = null;
var defaultTransporter = null;
var mandrill = require('mandrill-api/mandrill');
var _ = require('underscore');
var jsdom = require("jsdom");
var fs = require("fs");

module.exports = function(){
         
    var obj = {};
    
    /*Desc   : Send Mail
      Params : appId, toEmail, subject, text, htmlTemplate, fromEmail,fromName,mandrillApiKey
      Returns: Promise
               Resolve->Mail Sent successfully('success')
               Reject->failed to send mail
    */
    obj.send = function(appId, to, subject, text, html, from, fromName, mandrillApiKey){
         
        console.log("***************Reset Password Email***********************");
         
        var deferred = q.defer();

        try{
           
            var mandrill_client = new mandrill.Mandrill(mandrillApiKey);

            var message = {
                "html": html,
                "text": text,
                "subject": subject,
                "from_email": from,
                "from_name": fromName,
                "to": [{
                        "email": to
                    }]
            };
            
            var async = false;
            
            mandrill_client.messages.send({"message": message, "async": async, "ip_pool": null, "send_at": null}, function(result) {
                if(result && result[0]){
                    if(result[0].status=="sent"){ 
                        console.log("Reset password email sent!.");                   
                        deferred.resolve(result[0].status);
                    }
                    if(result[0].status=="rejected"){
                        console.log("Reset password email rejected");
                        deferred.reject(result[0].status);
                    }
                }else{
                    console.log("Failed to send reset password email!.");
                    deferred.reject("Failed to send!");
                }
                
            }, function(e) {
                deferred.reject(e);
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
    obj.sendResetPassword = function(appId,to,subject,text,from,user,passwordResetKey){

        var deferred = q.defer();

        try{
            var self = this;

            var emailSettings=null;
            var emailSettingsFound=false;

            var authSettings=null;
            var signupTemplateFound=false;

            var html=null;

            global.appService.getAllSettings(appId).then(function(settings){                         

                //Check Template in Email Settings
                if(settings && settings.length>0){
                    emailSettings=_.where(settings, {category: "email"});
                    if(emailSettings && emailSettings.length>0 && emailSettings[0].settings.mandrillApiKey){                  
                        emailSettingsFound=true;                                                           
                    }

                    authSettings=_.where(settings, {category: "auth"});
                    if(authSettings && authSettings.length>0){                  
                        if(authSettings[0].settings && authSettings[0].settings.signupEmail.template && authSettings[0].settings.signupEmail.template!=""){ 
                            signupTemplateFound=true;
                        }                                   
                    } 
                }

                if(!emailSettingsFound || !signupTemplateFound){
                    //Get Default CloudBoost Mail Template
                    return _getDefaultTemplate("signup-mail");
                }else{                
                    var templatePromise= q.defer();
                    templatePromise.resolve(authSettings[0].settings.signupEmail.template);
                    return templatePromise.promise;
                }
                    
            }).then(function(template){
                return _mergeVariablesInTemplate(template,appId,user,passwordResetKey);
            }).then(function(mergedHtml){
                html=mergedHtml;
                return _getCredentials(emailSettings,from);
            }).then(function(credentialsJson){
                //Send Email
                return self.send(appId, to, subject, text, html, credentialsJson.fromEmail,credentialsJson.fromName,credentialsJson.mandrillApiKey);
            }).then(function(resp){
                return deferred.resolve(resp);
            },function(error){
                return deferred.reject(error);
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
    obj.sendSignUpMail = function(appId,to,subject,text,from,user,passwordResetKey){

        var deferred = q.defer();

        try{
            var self = this;

            var emailSettings=null;
            var emailSettingsFound=false;
            var html=null;

            global.appService.getAllSettings(appId).then(function(settings){                         

                //Check Template in Email Settings
                if(settings && settings.length>0){
                    emailSettings=_.where(settings, {category: "email"});
                    if(emailSettings && emailSettings.length>0){                  
                        if(emailSettings[0].settings && emailSettings[0].settings.template && emailSettings[0].settings.template!=""){ 
                            emailSettingsFound=true;
                        }                                   
                    } 
                }

                if(!emailSettingsFound){
                    //Get Default CloudBoost Mail Template
                    return _getDefaultTemplate("reset-password");
                }else{                
                    var templatePromise= q.defer();
                    templatePromise.resolve(emailSettings[0].settings.template);
                    return templatePromise.promise;
                }
                    
            }).then(function(template){
                return _mergeVariablesInTemplate(template,appId,user,passwordResetKey);
            }).then(function(mergedHtml){
                html=mergedHtml;
                return _getCredentials(emailSettings,from);
            }).then(function(credentialsJson){
                //Send Email
                return self.send(appId, to, subject, text, html, credentialsJson.fromEmail,credentialsJson.fromName,credentialsJson.mandrillApiKey);
            }).then(function(resp){
                return deferred.resolve(resp);
            },function(error){
                return deferred.reject(error);
            }); 

        } catch(err){           
            global.winston.log('error',{"error":String(err),"stack": new Error().stack});
            deferred.reject(err);
        }

        return deferred.promise;
         
    };   
    
    return obj;
};

/*Desc   : Merge Variables in htmlTemplate
  Params : template,appId,userObj,passwordResetKey,resetURL
  Returns: Promise
           Resolve->mergedHtml
           Reject->Error on getMyUrl() or parsing template
*/
function _mergeVariablesInTemplate(template,appId,user,passwordResetKey){

    var deferred = q.defer();

    try{
        global.keyService.getMyUrl().then(function(myUrl){

            var uri = encodeURI(myUrl+"/page/"+appId+"/reset-password?user="+user.username+"&resetKey="+passwordResetKey);
            

            var userName = user.name || user.firstName || user.username;
            if(!userName){
                userName=" ";
            }

            console.log("This is the user name:"+userName);

            //Parse Template
            jsdom.env(template, [], function (error, window) {
                if(error){
                    deferred.reject("Cannot parse mail template.");
                }else{

                    var $ = require('jquery')(window);                 

                    $('body').find("a[href='*|LINK|*']").attr("href",uri);
                    $('body').children().each(function(){ 
                        if(userName){
                            $(this).html( $(this).html().replace('*|NAME|*',userName));
                        } 
                        $(this).html( $(this).html().replace('*|LINK|*',uri));                                                       
                    });                           
                    
                    deferred.resolve(window.document.documentElement.outerHTML);   
                }
            });

        },function(error){
            deferred.reject(error);
        }); 

    } catch(err){           
        global.winston.log('error',{"error":String(err),"stack": new Error().stack});
        deferred.reject(err);
    }  

    return deferred.promise;
}   

/*Desc   : Get Default Email Template
  Params : 
  Returns: Promise
           Resolve->email Template
           Reject->Error on reading file 
*/
function _getDefaultTemplate(templateName){
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

/*Desc   : Get Credentials of mail to send
  Params : emailSettingsArray,fromEmail
  Returns: Promise
           Resolve->JSON(mandrillApiKey,fromName,fromEmail)
           Reject->Error on no smtpConfig 
*/
function _getCredentials(emailSettings,fromEmail){
    var deferred = q.defer();

    try{
        var credentialsJson={
            mandrillApiKey:null,
            fromName:null,
            fromEmail:fromEmail
        };    

        //Init with Default values of cloudboost
        try{        
            smtpConfig = require('../config/smtp.json');     
            if(!smtpConfig){
                return deferred.reject("SMTP Configuration file not found.");
            } 
            if(!credentialsJson.mandrillApiKey){
                credentialsJson.mandrillApiKey=smtpConfig.mandrill_api_key;
            }               
            if(!credentialsJson.fromEmail){
                credentialsJson.fromEmail = smtpConfig.from;
            }
            if(!credentialsJson.fromName){
                credentialsJson.fromName = smtpConfig.from_name;
            }

        }catch(e){        
            return deferred.reject("Mail services disabled because SMTP Config not found or is invalid. Please add correct smtp.json in config to enable mail services.");
        } 

        //Checking in Email Settings to overwrite(Set only if mandrillApiKey and email are found)
        if(emailSettings && emailSettings.length>0 && emailSettings[0].settings.mandrillApiKey){

          if(emailSettings[0].settings.email && emailSettings[0].settings.email!=""){

            credentialsJson.mandrillApiKey=emailSettings[0].settings.mandrillApiKey;
            credentialsJson.fromEmail=emailSettings[0].settings.email;

            if(emailSettings[0].settings.from && emailSettings[0].settings.from!=""){
                credentialsJson.fromName=emailSettings[0].settings.from;
            }
          }                
          
        }

        deferred.resolve(credentialsJson);
    
    } catch(err){           
        global.winston.log('error',{"error":String(err),"stack": new Error().stack});
        deferred.reject(err);
    }
    return deferred.promise;    
}   