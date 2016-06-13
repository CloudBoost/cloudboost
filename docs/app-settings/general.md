
# How to add general settings to your CloudBoost 

## Properties to set

* appName: (String)Your desired app name
* appInProduction: (Boolean) Let CloudBoost know that your app is in production by settings this
* appIcon: (File Uri) Your app icon file url, which must be .png format

Example:
```
{
	appName:"To-do",
	appInProduction: true,
	appIcon:"https://www.dropbox.com/s/upslbb2dn36celv/todo-logo.png"
}
```   

## Make REST request
Once make your JSON object like above with properties, to save general settings make a PUT REST request to CloudBoost API on wrapping up JSON as body.
Request to: "https://api.cloudboost.io/settings/{your-appId}/general";

Example:
```
var generalSettings={
	appName:"To-do",
	appInProduction: true,
	appIcon:"https://www.dropbox.com/s/upslbb2dn36celv/todo-logo.png"
}

var data = new FormData();        
data.append('key', "your-masterKey");
data.append('settings', JSON.stringify(generalSettings));

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
xhttp.open("PUT",https://api.cloudboost.io/settings/{your-appId}/general, true);        
xhttp.send(data);
``` 

##Retrieve App Settings
Make a POST REST request to ClouBoost API to retrive your app settings
Request to:https://api.cloudboost.io/settings/{your-appId}

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
xhttp.open("POST", https://api.cloudboost.io/settings/{your-appId}, true);        
xhttp.send(data);
```

#Contribute
If you want to contribute to this repo. Please make sure you spell check everything and make sure you have tested the code with the live CloudBoost API before sending us the pull request.
