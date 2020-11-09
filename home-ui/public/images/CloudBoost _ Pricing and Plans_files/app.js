var __isDevelopment = false;

var isLocalhost = window.location.host.indexOf('localhost') > -1;
var isStaging = window.location.host.indexOf('staging') > -1;

if (isLocalhost || isStaging) {
  __isDevelopment = true;
}

var serverURL = null,
  dashboardURL = null;
var signUpURL = '';
var loginURL = '';
var tutorialURL = '';
var selfServerUrl = '';

if (isLocalhost) {
  serverURL = "http://localhost:3000";
  dashboardURL = "http://localhost:1440";
  signUpURL = "http://localhost:1447/#/signup";
  loginURL = "http://localhost:1447";
  tutorialURL = "http://localhost:1446";
  selfServerUrl = "http://localhost:1444";
} else if (isStaging) {
	serverURL = "https://staging.cloudboost.io";
  dashboardURL = "https://staging.cloudboost.io/dashboard";
  signUpURL = "https://staging.cloudboost.io/accounts/#/signup";
  loginURL = "https://staging.cloudboost.io/accounts";
  tutorialURL = "https://staging-tutorials.cloudboost.io";
  selfServerUrl = "https://staging.cloudboost.io";
} else {
  serverURL = "https://cloudboost.io";
  dashboardURL = "https://cloudboost.io/dashboard";
  signUpURL = "https://accounts.cloudboost.io/#/signup";
  loginURL = "https://accounts.cloudboost.io";
  tutorialURL = "https://tutorials.cloudboost.io";
  selfServerUrl = "https://cloudboost.io";
}
