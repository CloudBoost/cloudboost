var smtpConfig = null;
var defaultTransporter = null;
var mandrill = require('mandrill-api/mandrill');


module.exports = function(){
         
    var obj = {};
    
    obj.send = function(appId, to, subject, text, html, from){
            
        try{
            console.log("In mail service");
            smtpConfig = require('../config/smtp.json');
            var mandrill_client = new mandrill.Mandrill(smtpConfig.mandrill_api_key);
        }catch(e){
            //probably file not found or is in incorrect format.
            console.log("Mail services disabled because SMTP Config not found or is invalid. Please add correct smtp.json in config to enable mail services."); 
            smtpConfig = null;
        }    
        
        var deferred = q.defer();
        
        // create reusable transporter object using the default SMTP transport
        if(!smtpConfig){
            return;
        }
        
        if(!from){
            from = smtpConfig.from;
        }
        
        var fromName  = null;
        
        if(!fromName)
            fromName = smtpConfig.from_name;
        
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
            deferred.resolve();
        }, function(e) {
            deferred.reject(e);
        });
        
        return deferred.promise;
    };
    
    return obj;
};
   
   