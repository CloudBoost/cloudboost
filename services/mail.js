var smtpConfig = null;
var defaultTransporter = null;
var mandrill = require('mandrill-api/mandrill');
var _ = require('underscore');


module.exports = function(){
         
    var obj = {};
    
    /*Desc   : Send Reset Password Email
      Params : appId,to,Subject,Text,htmlTemplate,from
      Returns: Promise
               Resolve->Mail Sent successfully('success')
               Reject->Error on no smtp config file or getAllSettings() or failed to send mail
    */
    obj.send = function(appId, to, subject, text, html, from){
         
        console.log("***************Reset Password Email***********************");
         
        var deferred = q.defer();

        var mandrill_api_key=null;
        var from=null;
        var fromName  = null;

        try{
            console.log("In mail service");
            smtpConfig = require('../config/smtp.json');
            mandrill_api_key=smtpConfig.mandrill_api_key;
            // create reusable transporter object using the default SMTP transport
            if(!smtpConfig){
                return deferred.reject("SMTP Configuration file not found.");
            }                
            if(!from){
                from = smtpConfig.from;
            }
            if(!fromName){
                fromName = smtpConfig.from_name;
            }

        }catch(e){
            //probably file not found or is in incorrect format.
            console.log("Mail services disabled because SMTP Config not found or is invalid. Please add correct smtp.json in config to enable mail services."); 
            smtpConfig = null;
            return deferred.reject("Mail services disabled because SMTP Config not found or is invalid. Please add correct smtp.json in config to enable mail services.");
        }

        global.appService.getAllSettings(appId).then(function(settings){            

            if(settings && settings.length>0){
                var emailSettings=_.where(settings, {category: "email"});
                if(emailSettings && emailSettings.length>0 && emailSettings[0].settings.mandrillApiKey){

                  if(emailSettings[0].settings.email && emailSettings[0].settings.email!=""){

                    mandrill_api_key=emailSettings[0].settings.mandrillApiKey;
                    from=emailSettings[0].settings.email;

                    if(emailSettings[0].settings.from && emailSettings[0].settings.from!=""){
                        fromName=emailSettings[0].settings.from;
                    }
                  }                
                  
                } 
            }

            if(mandrill_api_key){
                var mandrill_client = new mandrill.Mandrill(mandrill_api_key);

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
            }      
      
        },function(err){  
            deferred.reject(err);          
        });        
        
        return deferred.promise;
    };
    
    return obj;
};
   
   