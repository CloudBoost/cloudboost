var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var request = require('request');
var path = require('path');
var minifyHTML = require('express-minify-html');
var compression = require('compression');
var minify = require('express-minify');
var responseTime = require('response-time');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

global.keys = require('./config/keys.js');

app.use(responseTime());

//If its in production, then compress everything. 
app.use(compression());
if(process.env && process.env.PRODUCTION){
	app.use(minify());
	app.use(minifyHTML({
		override:      true,
		exception_url: false,
		htmlMinifier: {
			removeComments:            true,
			collapseWhitespace:        true,
			collapseBooleanAttributes: true,
			removeAttributeQuotes:     true,
			removeEmptyAttributes:     true,
			minifyJS:                  true
		}
	}));
}

//Convert the Content
//For Production SDK
app.get('/js-sdk/:id', function(req, res) {

	request('https://raw.githubusercontent.com/CloudBoost/cloudboost/master/sdk/dist/'+req.params.id, function (error, response, body) {
	    if (!error && response.statusCode == 200) {
	        res.header("content-type","text/javascript");
	        res.send(body);
	    }else{
	    	res.status(404).send('Sorry, we cannot find the SDK. For more info, Please visit https://docs.cloudboost.io');
	    }
	});

});

//Convert the Content
/****************************************************************************************************/

//Routers
var routes = require('./routes/routes');
var twitterRoutes=require('./routes/twitterRoutes')();

app.use('*', function(req, res, next) {
	if(process.env && process.env.PRODUCTION){
		res.setHeader('Cache-Control', 'public, max-age=2592000');
	}
	else
		res.setHeader('Cache-Control', 'no-cache');
	next();
});

//View engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(express.static(path.join(__dirname, 'public'), { maxAge: 2592000 }));

app.use('/', routes);
app.use('/', twitterRoutes);

app.use(function(req, res, next) {
	res.status(400).render('404');
});


app.set('port', process.env.PORT || 1444);

var server = app.listen(app.get('port'), function() {
	console.log("Server running on port:"+app.get('port'));
});
