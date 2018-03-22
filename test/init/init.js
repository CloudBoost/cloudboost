describe("Cloud App", function() {
    
    it("MongoDb,RedisDb & Elastic SearchDb Statuses..", function(done) {
        this.timeout(100000);
       
        var url = URL+'/status'; 
        var params = {};    
        params.url = URL;

        if(!window){
        	//Lets configure and request
			request({
			    url: url, //URL to hit
			    method: 'GET'			  
			}, function(error, response, body){

			    if(error || response.statusCode === 500 || response.statusCode === 400 || body === 'Error'){  
		          	done("Something went wrong..");
		        }else {  
		        	done();	          
			    }
			});

        } else{
        	$.ajax({ 
			    // The URL for the request
			    url: url,			
			    // Whether this is a POST or GET request
			    type: "GET",			   
			    // Code to run if the request succeeds;
			    // the response is passed to the function
			    success: function( resp ) {
			       done();
			    },			 
			    // Code to run if the request fails; the raw request and
			    // status codes are passed to the function
			    error: function( xhr, status, errorThrown ) {
			        done("Something went wrong..");
			    },
			 
			});
        }

    });

    it("Change the Server URL", function(done) {
        this.timeout(100000);
        var appId = util.makeString();
        var url = URL+'/server/url';
        var params = {};
        params.secureKey = SECURE_KEY;
        params.url = URL;

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
        } else{
        	$.ajax({
 
			    // The URL for the request
			    url: url,
			    // The data to send (will be converted to a query string)
			    data: params,
			    // Whether this is a POST or GET request
			    type: "POST",
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
			        done("Error thrown.");
			    },
			 
			});
        }

    });


    it("should create the app and init the CloudApp.", function(done) {
        this.timeout(100000);
        var appId = util.makeString();
        var url = URL+'/app/'+appId;
        var params = {};
        params.secureKey = SECURE_KEY;
        if(!window){        	
        	//Lets configure and request
			request({
			    url: url, //URL to hit
			    method: 'POST',
			    headers: {
			        'Content-Type': 'application/json'
			    },
			    json: params //Set the body as a string
			}, function(error, response, json){
			    if(error) {
			        done(error);
			    } 
				else {
			       CB.CloudApp.init(URL, json.appId, json.keys.js);
			       CB.masterKey = json.keys.master;
			       CB.jsKey = json.keys.js;
			       done();
			    }
			});
       	} else{
	       $.ajax({
	 
			    // The URL for the request
			    url: url,
			 
			    // The data to send (will be converted to a query string)
			    data: params,
			 
			    // Whether this is a POST or GET request
			    type: "POST",
			 
			    // The type of data we expect back
			    dataType : "json",
			 
			    // Code to run if the request succeeds;
			    // the response is passed to the function
			    success: function( json ) {
			       CB.CloudApp.init(URL, json.appId, json.keys.js);
			       CB.masterKey = json.keys.master;
			       CB.jsKey = json.keys.js;
			       done();
			    },
			 
			    // Code to run if the request fails; the raw request and
			    // status codes are passed to the function
			    error: function( xhr, status, errorThrown ) {
			        done("Error thrown.");
			    },
			 
			});
		}

	 });


    it("should add a sample setting to an app.", function(done) {
        this.timeout(100000);
        var url = URL+'/settings/'+CB.appId+"/settings";
        var params = {};
        params.key = CB.masterKey;
        params.settings = {
        	"keykey" : "valuevalue"
        };
          if(!window){
        	//Lets configure and request
			request({
			    url: url, //URL to hit
			    method: 'PUT',
			    headers: {
			        'Content-Type': 'application/json'
			    },
			    json: params //Set the body as a string
			}, function(error, response, json){
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
			       if(json.category === "settings"){
			       	 done();
			       }else{
			       	 done("Wrong json.");
			       }
			    },
			    // Code to run if the request fails; the raw request and
			    // status codes are passed to the function
			    error: function( xhr, status, errorThrown ) {
			        done("Error thrown.");
			    },
			 
			});
		}
	 });


	it("should get sample setting to an app.", function(done) {
        this.timeout(100000);
        var url = URL+'/settings/'+CB.appId;
        var params = {};
        params.key = CB.masterKey;
        
        if(!window){
        	//Lets configure and request
			request({
			    url: url, //URL to hit
			    method: 'POST',
			    headers: {
			        'Content-Type': 'application/json'
			    },
			    json: params //Set the body as a string
			}, function(error, response, json){
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
			    type: "POST",
			 
			    // The type of data we expect back
			    dataType : "json",
			 
			    // Code to run if the request succeeds;
			    // the response is passed to the function
			    success: function( json ) {
			       if(json[0]._id){
			       	done();
			       }else{
			       	done("Success but Id not defined.");
			       }
			    },
			 
			    // Code to run if the request fails; the raw request and
			    // status codes are passed to the function
			    error: function( xhr, status, errorThrown ) {
			        done("Error thrown.");
			    }
			 
			});
		}
	});

	
});
