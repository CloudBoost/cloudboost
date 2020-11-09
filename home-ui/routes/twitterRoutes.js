var express = require('express');
var app = express();
var Twitter = require('twitter-node-client').Twitter;

//Get this data from your twitter apps dashboard
var config = {
    "consumerKey": "AxVAcyr0qzimttHA8UHOwjKlQ",
    "consumerSecret": "J5FYzrOGVbgp9YStWZcwlNBYest5fPqWvrDuzKpwDlAwnnSAWe",
    "accessToken": "4171861882-Qg5syohGeGYIBsthzjbZigX01U0x9DBzumTjATA",
    "accessTokenSecret": "pIAN1tHRdVLc6Qp5W1UrqyvwLoRa43pNsMF9aQXIrVg0f"
}
var twitter = new Twitter(config);

module.exports = function() {

    // routes
    app.get('/twitter/search', function(req,res,next) {

    	twitter.getHomeTimeline({'count': 10}, function (err, response, body) {    		
		    return res.status(500).send(err); 
		  }, function (data) {
		  	console.log("Data retrieved");
		    var obj=JSON.parse(data);    

		    var returnJson={twitterFeed : obj};
		    return res.status(200).json(returnJson);		
		  });
    });

	app.get('/twitter/:tweetId', function(req,res,next) {
		var tweetId=req.params.tweetId;
		//tweetId=JSON.stringify(tweetId);		

	    twitter.getCustomApiCall('/statuses/oembed.json',{hide_media: true,id: tweetId}, function(err,response,body){
	    	  //console.log(err);
	    	  return res.status(500).send(err); 
		    },function(newobj){
		      // console.log(JSON.parse(newobj));
		      return res.status(200).json(JSON.parse(newobj));		      
		    });	    
			   
	    });

    return app;
}


  