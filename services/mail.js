var nodemailer = require('nodemailer');
var smtpConfig = null;
var defaultTransporter = null;

module.exports = function(){
     try{
            console.log("In mail service");
            smtpConfig = require('../config/smtp.json');
            var transporterConnectionString = "";
            if(smtpConfig.smtps){
                transporterConnectionString = "smtps://"
            }else{
                transporterConnectionString = "smtp://"
            }
            transporterConnectionString+=smtpConfig.username.replace("@","%40")+":"+smtpConfig.password+"@"+smtpConfig.server;
            defaultTransporter = nodemailer.createTransport(transporterConnectionString);
            console.log("Mail Transporter Status : OK");
        }catch(e){
            //probably file not found or is in incorrect format.
            console.log("Mail services disabled because SMTP Config not found or is invalid. Please add correct smtp.json in config to enable mail services."); 
            smtpConfig = null;
        }    
    
    var obj = {};
    
    obj.send = function(appId, to, subject, text, html, from){
        
        console.log("Sending an email.");
        console.log("App ID : "+appId);
        console.log("To "+to);
        console.log("Subject : "+subject);
        console.log("Text "+text);
        
        var deferred = q.defer();
   
        // create reusable transporter object using the default SMTP transport
        if(!smtpConfig){
            return;
        }
        
        if(!from){
            from = smtpConfig.from;
        }
        
        // setup e-mail data with unicode symbols
        var mailOptions = {
            from: from, // sender address
            to: to, // list of receivers
            subject: subject, // Subject line
            text: text, // plaintext body
            html: html // html body
        };
        
        console.log("Sending...");
        
        // send mail with defined transport object
        defaultTransporter.sendMail(mailOptions, function(error, info){
            if(error){
                console.log("Mail Error.");
                console.log(error);    
                deferred.reject(error);
            }else{
                console.log('Message sent : ' + info.response);
                deferred.resolve();
            }
        });
        
        return deferred.promise;
    };
    
    return obj;
};
   
   