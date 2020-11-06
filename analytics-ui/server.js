var path = require('path');
var Express = require('express');
var app = Express();

app.use('*/src/',Express.static(path.join(__dirname, 'src')));

app.use('*/node_modules', Express.static(path.join(__dirname, 'node_modules')));

app.get('*/app/key.js', function(req, res) {
    res.setHeader('Content-type', 'text/plain');
    res.charset = 'UTF-8';
    var content = "";

    /***************************************************Connecting URLs*********************************************************/
    content += "var __isDevelopment = " + (process.env["CLOUDBOOST_DEVELOPMENT"] || "false") + ";\n";
    content += "var __isHosted = " + (process.env["CLOUDBOOST_HOSTED"] || "false") + ";\n";
    content += "var __isStaging = window.location.hostname.includes('staging');\n";
	content += "var USER_SERVICE_URL = null,\n";
	content += "__isBrowser = true,\n";
    content += "SERVER_URL = null,\n";
    content += "DASHBOARD_URL = null,\n";
    content += "ACCOUNTS_URL = null,\n";
    content += "DATABROWSER_URL = null,\n";
    content += "FILES_URL=null,";
    content += "ANALYTICS_URL=null,";
    content += "LANDING_URL = 'https://www.cloudboost.io';\n";
    content += "if(__isHosted){\n";
    content += "USER_SERVICE_URL = '/service/';\n";
    content += "SERVER_DOMAIN = window.location.hostname;\n";
    content += "SERVER_URL =  window.location.protocol+'//'+window.location.hostname + '/api/';\n";
    content += "DASHBOARD_URL =  '/dashboard/';\n";
    content += "ACCOUNTS_URL =  '/accounts/';\n";
    content += "DATABROWSER_URL =  '/tables/';\n";
    content += "ANALYTICS_URL =  '/analytics/';\n";
    content += "FILES_URL =  '/files/';\n";
    content += "}else{\n";
    content += "USER_SERVICE_URL = window.location.protocol+'//'+window.location.hostname + ':3000/';\n";
    content += "SERVER_DOMAIN = window.location.hostname;\n";
    content += "SERVER_URL =  window.location.protocol+'//'+window.location.hostname + ':4730/';\n";
    content += "DASHBOARD_URL =  window.location.protocol+'//'+window.location.hostname + ':1440/';\n";
    content += "ACCOUNTS_URL =  window.location.protocol+'//'+window.location.hostname + ':1447/';\n";
    content += "DATABROWSER_URL =  window.location.protocol+'//'+window.location.hostname + ':3333/';\n";
    content += "ANALYTICS_URL =  window.location.protocol+'//'+window.location.hostname + ':3013/';\n";
    content += "FILES_URL =  window.location.protocol+'//'+window.location.hostname + ':3012/';\n";
    content += "}\n";

    res.write(content);
    res.end();
});

app.get('/status', function(req, res, next) {
    res.status(200).json({status: 200, message: "CloudBoost | Analytics  Status : OK"});
});

app.use(function(req, res) {
    res.sendFile('index.html', {root: './src/'})
})

let port = process.env.PORT || 3013;

app.listen(port, function() {
    console.log("CloudBoost Analytics Ui running  on ", port);
});
