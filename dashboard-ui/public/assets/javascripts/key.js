var __isDevelopment = false;
var __isHosted = false;
var __isStaging = window.location.hostname.includes('staging');
var USER_SERVICE_URL = null,
 __isBrowser = true,
 SERVER_URL = null,
 DASHBOARD_URL = null,
 ACCOUNTS_URL = null,
 DATABROWSER_URL = null,
 ANALYTICS_URL=null,
 LANDING_URL = 'https://www.cloudboost.io';

function reqListener () {
	eval(this.responseText);
    if (__isHosted && !__isStaging) {
		Stripe.setPublishableKey('pk_live_MjYxtmApqlNsX2RKmZXA2j7s');
	} else {
		Stripe.setPublishableKey('pk_test_FueQ6KFwm3HxCM56qzlz0F5F');
	}
}

var oReq = new XMLHttpRequest();
oReq.addEventListener("load", reqListener);
oReq.open("GET", "/app/keys");
oReq.send();