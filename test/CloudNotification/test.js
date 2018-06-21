describe("CloudNotification", function() {

    it("should subscribe to a channel", function(done) {
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
    });

    it("should publish data to the channel.", function(done) {

		this.timeout(30000);
		var setimer;
        CB.CloudNotification.on('sample1',  function(data){
	      	if(data === 'data1'){
				clearTimeout(setimer);
				done();
	      	}else{
	      		throw 'Error wrong data received.';
	      	}
	      },
      	{
      	success : function(){
      		//publish to a channel.
      		CB.CloudNotification.publish('sample1', 'data1',{
				success : function(){
					//succesfully published. //do nothing.
					setimer = setTimeout(done, 25000);
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
    });


    it("should stop listening to a channel", function(done) {

    	this.timeout(20000);

     	CB.CloudNotification.on('sample2',
	      function(data){
	      	throw 'stopped listening, but still receiving data.';
	      },
	      {
	      	success : function(){
	      		//stop listening to a channel.
	      		CB.CloudNotification.off('sample2', {
					success : function(){
						//succesfully stopped listening.
						//now try to publish.
						CB.CloudNotification.publish('sample2', 'data',{
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


    });

});
