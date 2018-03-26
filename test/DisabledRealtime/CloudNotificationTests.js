describe("Disabled CloudNotification", function() {
 
    it("should subscribe to a channel", function(done) {
    	try{
	      this.timeout(20000);
	        CB.CloudNotification.on('sample',
	      function(data){
	      }, 
	      {
	      	success : function(){
	      		done();
	      	}, 
	      	error : function(){
	      		throw 'Error subscribing to a CloudNotification.';
	      	}
	      });
	    }catch(e){
	    	done();
	    }
    });

    it("should publish data to the channel.", function(done) {
    	try{
	        this.timeout(30000);
	        CB.CloudNotification.on('sample',
	      function(data){
	      	if(data === 'data'){
	      		done();
	      	}else{
	      		throw 'Error wrong data received.';
	      	}
	      }, 
	      {
	      	success : function(){
	      		//publish to a channel. 
	      		CB.CloudNotification.publish('sample', 'data',{
					success : function(){
						//succesfully published. //do nothing. 
					},
					error : function(err){
						//error
						throw 'Error publishing to a channel in CloudNotification.';
					}
					});
	      	}, 
	      	error : function(){
	      		throw 'Error subscribing to a CloudNotification.';
	      	}

	      });
	    }catch(e){
	    	done();
	    }
    });


    it("should stop listening to a channel", function(done) {

    	try{

	    	this.timeout(20000);

	     	CB.CloudNotification.on('sample', 
		      function(data){
		      	throw 'stopped listening, but still receiving data.';
		      }, 
		      {
		      	success : function(){
		      		//stop listening to a channel. 
		      		CB.CloudNotification.off('sample', {
						success : function(){
							//succesfully stopped listening.
							//now try to publish. 
							CB.CloudNotification.publish('sample', 'data',{
								success : function(){
									//succesfully published.
									//wait for 5 seconds.
									setTimeout(function(){ 
										done();
									}, 5000);
								},
								error : function(err){
									//error
									throw 'Error publishing to a channel.';
								}
							});
						},
						error : function(err){
							//error
							throw 'error in sop listening.';
						}
					});
		      	}, 
		      	error : function(){
		      		throw 'Error subscribing to a CloudNotification.';
		      	}
		      });
     }catch(e){
     	done();
     }
    });

});