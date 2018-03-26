describe("App level ACL, for adding deleting tables of an app via clientKey", function(){

    before(function(){
        CB.appKey = CB.masterKey;
    });

    var tableName = util.makeString();

    it("should not get tables of an app via clientKey",function(done){

        this.timeout(80000);

        var obj = new CB.CloudTable(tableName);

        obj.save().then(function(table){
            if(table.id){
                CB.appKey = CB.jsKey;
                CB.CloudTable.getAll().then(function(table){
                    done('tables should not be fetched via clientKey')
                },function(err){
                    done()
                })
            }else{
              done("Table cannot be created");
            }
        },function(){
            throw "Should Create a table";
        });
    });

    it("should set isTableEditableByClientKey of an app",function(done){

        this.timeout(100000);
        var url = URL+'/settings/'+CB.appId+"/general";
        var params = {};
        params.key = CB.masterKey;
        params.settings = {
        	"isTableEditableByClientKey" : true
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
			       if(json.category === "general"){
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

    it("should now get all the tables via client key",function(done){

        this.timeout(80000);
        CB.appKey = CB.jsKey;
        CB.CloudTable.getAll().then(function(tables){
            if(tables){
                done()
            }else{
                done("Table cannot be created");
            }
        },function(err){
            done(err)
        })
    
    });

    it("should now add a table via client key",function(done){

        this.timeout(80000);
        CB.appKey = CB.jsKey;
        var obj = new CB.CloudTable(util.makeString());

        obj.save().then(function(table){
            if(table.id){
                done()
                table.delete()
            }else{
              done("Table cannot be created");
            }
        },function(err){
            done(err)
        });
        
    
    });

    after(function() {
    	CB.appKey = CB.jsKey;
  	});


});
