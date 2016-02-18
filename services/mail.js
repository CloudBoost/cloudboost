var nodemailer = require('nodemailer');
var smtpConfig = null;
var defaultTransporter = null;

try{
    smtpConfig = require('../config/smtp.json');
    var transporterConnectionString = "";
    
    if(smtpConfig.secure){
        transporterConnectionString = "smtps://"
    }else{
        transporterConnectionString = "smtp://"
    }
    
    transporterConnectionString+=smtpConfig.username+":"+smtpConfig.password+"@"+smtpConfig.server;
    defaultTransporter = nodemailer.createTransport(transporterConnectionString);
    
}catch(e){
    //probably file not found or is in incorrect format.
    console.log("Mail services disabled because SMTP Config not found or is invalid. Please add correct smtp.json in config to enable mail services."); 
    smtpConfig = null;
}

module.export = function(appId, to, subject, text, html, from){
   
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

    // send mail with defined transport object
    defaultTransporter.sendMail(mailOptions, function(error, info){
        if(error){
            return console.log(error);
        }
        
        console.log('Message sent : ' + info.response);
    });
};