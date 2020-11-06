describe("Delete App", function() {
    it("should delete the app and teardown", function(done) {
        this.timeout(100000);
        var appId = util.makeString();
        var url = URL+'/app/'+CB.appId;
        var params = {};
        params.secureKey = SECURE_KEY;
        params.method = "DELETE";

         if(!window){
        	//Lets configure and request
			request({
			    url: url, //URL to hit
			    method: 'POST',
			    headers: {
			        'Content-Type': 'application/json'
			    },
			    json: params //Set the body as a string
			}, function(error, response, body){
			    if(error) {
			        done(error);
			    } else {
			       done();
			    }
			});
        }else{

	       $.ajax({
	 
			    // The URL for the request
			    url: url,
			 
			    // The data to send (will be converted to a query string)
			    data: params,
			 
			    // Whether this is a POST or GET request
			    type: "PUT",
			 
			    // The type of data we expect back
			    dataType : "json",
			 
			    // Code to run if the request succeeds;
			    // the response is passed to the function
			    success: function( json ) {
			       done();
			    },
			 
			    // Code to run if the request fails; the raw request and
			    // status codes are passed to the function
			    error: function( xhr, status, errorThrown ) {
			        done("Error");
			    },
			 
			   
			});
	   }


    });
});
