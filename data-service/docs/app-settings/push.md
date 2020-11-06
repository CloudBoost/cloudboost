
# Adding push settings to your CloudBoost App

## Properties to set

* apple:   
  * certificates: (Array) Push Apple .p12 certificate file URL which is obtained after uploading .p12 certificate to CloudBoost which is explained below in the section upload Apple certificate

* android:   
  * credentials:(Array) Push Google credentials object whith following properties
    * senderId:(String) Your Google Sender ID 
    * apiKey:(String) Your Google API Key

* windows:   
  * credentials:(Array) Push Windows credentials object whith following properties
    * securityId:(String) Your Windows Package Security Identifier
    * clientSecret:(String) Your Windows Client Secret  

Example:
```
{
  apple:{
    certificates:["https://api.cloudboost.io/settings/shsh133/file/applecertficate"]
  },
  android:{
    credentials:[{
      senderId:"googlesenderId",
      apiKey:"googleapikey";
    }]
  },
  windows:{
    credentials:[{
      securityId:"windowssecutiryid",
      clientSecret:"windowsclientsecret"
    }]
  }
}
```   

## Make REST request
To save email settings make a PUT REST request to CloudBoost API on with JSON as request body.
</br>
Request: "&lt;your-server-url&gt;/settings/&lt;your-appId&gt;/push";

Example:
```
var settings={
  apple:{
    certificates:["https://api.cloudboost.io/settings/shsh133/file/applecertficate"]
  },
  android:{
    credentials:[{
      senderId:"googlesenderId",
      apiKey:"googleapikey";
    }]
  },
  windows:{
    credentials:[{
      securityId:"windowssecutiryid",
      clientSecret:"windowsclientsecret"
    }]
  }
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
xhttp.open("PUT",<your-server-url>/settings/<your-appId>/push, true);        
xhttp.send(data);
``` 
## Upload Apple certificate to CloudBoost
Make PUT REST request to your CloudBoost with Apple .p12 certificate file to get file URL which can be used to save apple push settings.
</br>
Request: &lt;your-server-url&gt;/settings/&lt;your-appId&gt;/file/push;

Example:
```
var data = new FormData();        
data.append('file', appleFileObject);        
data.append('key', "your-app-masterKey");        

var xhttp = new XMLHttpRequest();
xhttp.onload  = function() {
  if(xhttp.readyState == 4 && xhttp.status == 200) {
    if(xhttp.responseText){            
      //File url
    }            
  }else if(xhttp.status != 200){
    //Error
  }
};
xhttp.open("PUT", <your-server-url>/settings/<your-appId>/file/push, true);        
xhttp.send(data);
```

## Retrieve App Settings
Make a POST REST request to ClouBoost API to retrive your app settings
</br>
Request:&lt;your-server-url&gt;/settings/&lt;your-appId&gt;

Example:
```
var data = new FormData();
data.append('key', "your-app-masterKey");

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
