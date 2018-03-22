
describe("CloudPush", function (done) {

    it("Should fail to send notification without push settings", function (done) {

        this.timeout(30000);

        var obj = new CB.CloudObject('Device');
        obj.set('deviceToken', "helloasgsgdsd");
        obj.set('deviceOS', "android");
        obj.set('timezone', "chile");
        obj.set('channels', ["pirates","hackers","stealers"]);
        obj.set('metadata', {"appname":"hdhfhfhfhf"});
        obj.save({
            success : function(savedObj){
               
                var query = new CB.CloudQuery("Device");
                query.containedIn('channels', "hackers");

                CB.CloudPush.send({title:"RT Bathula",message:"check this"},query,{
                    success:function(data){
                        done("Sent without notifications.");
                    },
                    error:function(error){
                        done();
                    }
                });

               
            },error : function(error){
                done(error);
            }
        });

        
    });

    it("should add a sample setting to an app.", function(done) {
        this.timeout(100000);
        var url = URL+'/settings/'+CB.appId+"/push";
        var params = {};
        params.key = CB.masterKey;
        params.settings = JSON.stringify({
          apple:{
            certificates:[]
          },
          android:{
            credentials:[{senderId:"612557492786",apiKey:"AIzaSyCrJe7JeAmEULaZbEWBVZ8-t6GkvrkQXvI"}]
          },
          windows:{
            credentials:[{securityId:"sdsd",clientSecret:"sdjhds"}]
          }
        });

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
                   if(json.category === "push"){
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
    
    it("Should send message with data,query and callback", function (done) {

        this.timeout(30000);

        var obj = new CB.CloudObject('Device');
        obj.set('deviceToken', "fOek_RfEqUw:APA91bGGWKZzgM0-s4Z-NK9t7cdDqUBsskidJ09bn_vTruycmRgk_zS2IYE591GMVP1SuaSc3m81spmw8lad23vtkMI8E8dZB-F9lTz44Ij1uw9Zy1m3405dscjnfnOHru0IpJQe3jef");
        obj.set('deviceOS', "android");
        obj.set('timezone', "chile");
        obj.set('channels', ["pirates","hackers","stealers"]);
        obj.set('metadata', {"appname":"hdhfhfhfhf"});
        obj.save({
            success : function(savedObj){
                if(savedObj){

                    var query = new CB.CloudQuery("Device");
                    query.containedIn('channels', "hackers");

                    CB.CloudPush.send({title:"RT Bathula",message:"check this"},query,{
                        success:function(data){
                            done();
                        },
                        error:function(error){
                            done(error);
                        }
                    });

                }else{
                    done("error on creating device object");
                }
            },error : function(error){
                done(error);
            }
        });

        
    });

    
    it("Should send message with data and callback", function (done) {

            this.timeout(30000);

            var obj = new CB.CloudObject('Device');
            obj.set('deviceToken', "datasdsdszafu");
            obj.set('deviceOS', "android");
            obj.set('timezone', "chile");
            obj.set('channels', ["pirates","hackers","stealers"]);
            obj.set('metadata', {"appname":"hdhfhfhfhf"});
            obj.save({
                success : function(savedObj){
                    if(savedObj){
                       
                        CB.CloudPush.send({title:"RT Bathula",message:"check this"},{
                            success:function(data){
                                done();
                            },
                            error:function(error){
                                done(error);
                            }
                        });

                    }else{
                        done("error on creating device object");
                    }
                },error : function(error){
                    done(error);
                }
            });
            
        });

    it("Should send message with data,channelsArray and callback", function (done) {

        this.timeout(30000);

        var obj = new CB.CloudObject('Device');
        obj.set('deviceToken', "dddtasdrehf");
        obj.set('deviceOS', "android");
        obj.set('timezone', "chile");
        obj.set('channels', ["pirates","hackers","stealers"]);
        obj.set('metadata', {"appname":"hdhfhfhfhf"});
        obj.save({
            success : function(savedObj){
                if(savedObj){
                   
                    CB.CloudPush.send({title:"RT Bathula",message:"check this"},["pirates","hackers"],{
                        success:function(data){
                            done();
                        },
                        error:function(error){
                            done(error);
                        }
                    });

                }else{
                    done("error on creating device object");
                }
            },error : function(error){
                done(error);
            }
        });
        
    });

    it("Should send message with data,string and callback", function (done) {

        this.timeout(30000);

        var obj = new CB.CloudObject('Device');
        obj.set('deviceToken', "jwhdtabaltasdrehf");
        obj.set('deviceOS', "android");
        obj.set('timezone', "chile");
        obj.set('channels', ["pirates","hackers","stealers"]);
        obj.set('metadata', {"appname":"hdhfhfhfhf"});
        obj.save({
            success : function(savedObj){
                if(savedObj){
                   
                    CB.CloudPush.send({title:"RT Bathula",message:"check this"},"hackers",{
                        success:function(data){
                            done();
                        },
                        error:function(error){
                            done(error);
                        }
                    });

                }else{
                    done("error on creating device object");
                }
            },error : function(error){
                done(error);
            }
        });
        
    });

    it("Should send message with data, no callback passed", function (done) {

        this.timeout(30000);

        this.timeout(30000);

        var obj = new CB.CloudObject('Device');
        obj.set('deviceToken', "jwhdtabal123");
        obj.set('deviceOS', "android");
        obj.set('timezone', "chile");
        obj.set('channels', ["pirates","hackers","stealers"]);
        obj.set('metadata', {"appname":"hdhfhfhfhf"});
        obj.save({
            success : function(savedObj){
                if(savedObj){
                   
                    CB.CloudPush.send({title:"RT Bathula",message:"check this"})
                    .then(function(response){
                        done();
                    },function(error){
                        done(error);
                    });

                }else{
                    done("error on creating device object");
                }
            },error : function(error){
                done(error);
            }
        });       
        
    });

    it("Should fail to send message without data object", function (done) {

        this.timeout(30000);

        this.timeout(30000);

        var obj = new CB.CloudObject('Device');
        obj.set('deviceToken', "jwhdtabal124");
        obj.set('deviceOS', "android");
        obj.set('timezone', "chile");
        obj.set('channels', ["pirates","hackers","stealers"]);
        obj.set('metadata', {"appname":"hdhfhfhfhf"});
        obj.save({
            success : function(savedObj){
                if(savedObj){

                    var query = new CB.CloudQuery("Device");
                    query.containedIn('channels', "hackers");

                try{    
                    CB.CloudPush.send(query,{
                        success:function(data){
                            done("Sent without data");
                        },
                        error:function(error){
                            done("Sent without data");
                        }
                    });
                 }catch(e){
                    done();
                 }                        

                }else{
                    done("error on creating device object");
                }
            },error : function(error){
                done(error);
            }
        });       
        
    });

    it("Should fail to send message without setting data.message property", function (done) {

        this.timeout(30000);

        this.timeout(30000);

        var obj = new CB.CloudObject('Device');
        obj.set('deviceToken', "jwhdtabal126");
        obj.set('deviceOS', "android");
        obj.set('timezone', "chile");
        obj.set('channels', ["pirates","hackers","stealers"]);
        obj.set('metadata', {"appname":"hdhfhfhfhf"});
        obj.save({
            success : function(savedObj){
                if(savedObj){

                    var query = new CB.CloudQuery("Device");
                    query.containedIn('channels', "hackers");

                    try{

                        CB.CloudPush.send({title:"Hola"},query,{
                            success:function(data){
                                done("Sent,without message");
                            },
                            error:function(error){
                                done("Sent,without message");
                            }
                        });

                    }catch(e){
                        done();
                    }                  

                }else{
                    done("error on creating device object");
                }
            },error : function(error){
                done(error);
            }
        });       
        
    });  

}); 

  
