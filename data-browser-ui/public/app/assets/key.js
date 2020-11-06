var __isDevelopment = false;
var __isHosted = false;
var __isStaging = window.location.hostname.includes('staging');
var USER_SERVICE_URL = null,
 __isBrowser = true,
 SERVER_URL = null,
 DASHBOARD_URL = null,
 ACCOUNTS_URL = null,
 DATABROWSER_URL = null,
 FILES_URL=null,
 ANALYTICS_URL=null,
 LANDING_URL = 'https://www.cloudboost.io';

function reqListener () {
	eval(this.responseText);
}

var oReq = new XMLHttpRequest();
oReq.addEventListener("load", reqListener);
oReq.open("GET", "/app/keys");
oReq.send();