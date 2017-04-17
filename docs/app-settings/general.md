
# Adding general settings to your CloudBoost App

## Properties to set

* appName: (String) Your desired app name
* appInProduction: (Boolean) Let CloudBoost know if your app is in production 
* appIcon: (File URL) Your app icon file url, which must be .png format

Example:
```
{
	appName:"To-do",
	appInProduction: true,
	appIcon:"https://www.dropbox.com/s/upslbb2dn36celv/todo-logo.png?raw=1"
}
```   

## Make REST request
To save general settings make a PUT REST request to CloudBoost API on with JSON as request body.
</br>
Request: "&lt;your-server-url&gt;/settings/&lt;your-appId&gt;/general";

Example:
```
var settings={
	appName:"To-do",
	appInProduction: true,
	appIcon:"https://www.dropbox.com/s/upslbb2dn36celv/todo-logo.png?raw=1"
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
xhttp.open("PUT",<your-server-url>/settings/<your-appId>/general, true);        
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
