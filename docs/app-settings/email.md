
# Adding email settings to your CloudBoost App

## Properties to set

* mandrill:   
  * enabled: (Boolean) Set to true if you want to send email through Mandrill
  * apiKey:(String) Your [Mandrill](https://www.mandrill.com/) API Key

* mailgun:   
  * enabled: (Boolean) Set to true if you want to send email through Mailgun
  * apiKey:(String) Your [Mailgun](https://www.mailgun.com/) API Key
  * domain: (URL) Your Mailgun domain name

* fromEmail: (email) Email which you want to send mails from 
* fromName: (String) From Name which is displayed from whom the email is sent.

Example:
```
{
  mandrill:{
    enabled:true,
    apiKey:"sdfskdh-222-sdfsdsdsd"    
  },
  mailgun:{
    enabled:false
    apiKey:null,
    domain:null    
  },
  fromEmail:"support@your-domain.com",
  fromName:"Admin John"

}
```   

## Make REST request
To save email settings make a PUT REST request to CloudBoost API on with JSON as request body.
</br>
Request: "&lt;your-server-url&gt;/settings/&lt;your-appId&gt;/email";

Example:
```
var settings={
  mandrill:{
    enabled:true,
    apiKey:"sdfskdh-222-sdfsdsdsd"    
  },
  mailgun:{
    enabled:false
    apiKey:null,
    domain:null    
  },
  fromEmail:"support@your-domain.com",
  fromName:"Admin John"

}

var data = new FormData();        
data.append('key', "your-app-masterKey");
data.append('settings', JSON.stringify(settings));

var xhttp = new XMLHttpRequest();
xhttp.onload  = function() {
if(xhttp.readyState == 4 && xhttp.status == 200) {
  if(xhttp.responseText){
    //Success
  }            
}else if(xhttp.status != 200){
  //Error
}
};
xhttp.open("PUT",<your-server-url>/settings/<your-appId>/email, true);        
xhttp.send(data);
``` 

## Retrieve App Settings
Make a POST REST request to ClouBoost API to retrive your app settings
</br>
Request:&lt;your-server-url&gt;/settings/&lt;your-appId&gt;

Example:
```
var data = new FormData();
data.append('key', "your-masterKey");

var xhttp = new XMLHttpRequest();
xhttp.onload  = function() {
if (xhttp.readyState == 4 && xhttp.status == 200) {
  if(xhttp.responseText){
    //Success
  }            
}else if(xhttp.status!==200){
  //Error
}
};
xhttp.open("POST", <your-server-url>/settings/<your-appId>, true);        
xhttp.send(data);
```

# Contribute
If you want to contribute to this repo. Please make sure you spell check everything and make sure you have tested the code with the live CloudBoost API before sending us the pull request.
