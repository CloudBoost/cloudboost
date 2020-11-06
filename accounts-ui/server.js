require("babel-register");
var path = require('path');
var express = require('express');
var app = express();
var React = require('react')
var renderToString = require('react-dom/server').renderToString
var match = require('react-router').match
var RouterContext = require('react-router').RouterContext

var config = {
	__isDevelopment: process.env["CLOUDBOOST_DEVELOPMENT"] || false,
 	__isHosted: process.env["CLOUDBOOST_HOSTED"] || false,
 	__isStaging: process.env["NODE_ENV"] === 'staging',
	USER_SERVICE_URL: process.env["USER_SERVICE"] || 'http://localhost:3000',
	 __isBrowser: true,
 	SERVER_URL: process.env["SERVER_URL"] || 'http://localhost:4730',
 	DASHBOARD_URL: process.env["DASHBOARD_URL"] || 'http://localhost:1440',
 	ACCOUNTS_URL: process.env["ACCOUNTS_URL"] || 'http://localhost:1447',
 	DATABROWSER_URL: process.env["DATABROWSER_URL"] || 'http://localhost:3333',
 	FILES_URL: process.env["FILES_URL"] || 'http://localhost:3012',
 	ANALYTICS_URL: process.env["ANALYTICS_URL"] || 'http://localhost:5555',
	LANDING_URL: process.env["LANDING_URL"] || 'http://localhost:1444',
	STRIPE_KEY: process.env['PUB_STRIPE_KEY'] || 'pk_test_FueQ6KFwm3HxCM56qzlz0F5F'
};

//View engine setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// define the folder that will be used for static assets
app.use('*/public/',express.static(path.join(__dirname, 'app')));

global.navigator = { navigator: 'all' };
global.__isHosted = process.env["CLOUDBOOST_HOSTED"] || false
global.__isBrowser = false;

var routes = require('./app/routes.js');

global.USER_SERVICE_URL = process.env['USER_SERVICE_URL'] || "https://localhost:3000";
global.SERVER_DOMAIN = process.env['SERVER_DOMAIN'] || "cloudboost.io";
global.SERVER_URL = process.env['SERVER_URL'] || "https://localhost:4730";
global.DASHBOARD_URL = process.env['DASHBOARD_URL'] || "https://localhost:1440";
global.ACCOUNTS_URL = process.env['ACCOUNTS_URL'] || "https://localhost:1447";

// universal routing and rendering
app.get('*', (req, res) => {
	match(
		{ routes, location: req.url },
		(err, redirectLocation, renderProps) => {
			// in case of error display the error message
			if (err) {
				return res.status(500).send(err.message);
			}

			// in case of redirect propagate the redirect to the browser
			if (redirectLocation) {
				return res.redirect(302, redirectLocation.pathname + redirectLocation.search);
			}

			// generate the React markup for the current route
			let markup;
			if (renderProps) {
				// if the current route matched we have renderProps
				markup = renderToString(React.createElement(RouterContext, renderProps));
			} else {
				if(req.url !=="/"){
					// otherwise we can render a 404 page
					markup = renderToString((React.createElement('h1', null, '...')))
					res.status(404);
				}else{
					res.status(200);
				}
			}

			config.SERVER_DOMAIN = process.env['SERVER_DOMAIN'] || req.protocol + '://' + req.hostname;
			// render the index template with the embedded React markup
			return res.render('index', { markup, config: JSON.stringify(config) });
		}
	);
});

//Ending
app.set('port', process.env.PORT || 1447);
app.listen(app.get('port'), function () {
	console.log("Accounts started on PORT:" + app.get('port'));
});
