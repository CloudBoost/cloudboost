describe("CloudDevice", function () {

    it("Should create new device with all fields", function (done) {
        if(CB._isNode){
           done();
           return;
        }

        this.timeout(300000);       

        var obj = new CB.CloudObject('Device');
        obj.set('deviceToken', "data");
        obj.set('deviceOS', "windows");
        obj.set('timezone', "chile");
        obj.set('channels', ["pirates","hackers","stealers"]);
        obj.set('metadata', {"appname":"hdhfhfhfhf"});
        obj.save({
            success : function(savedObj){
                if(savedObj){
                    done();
                }else{
                    done("error on creating device object");
                }
            },error : function(error){
                done(error);
            }
        });
    });

    it("Should fail on creating device with same deviceToken twice", function (done) {
        if(CB._isNode){
           done();
           return;
        }

        this.timeout(300000);       

        var obj = new CB.CloudObject('Device');
        obj.set('deviceToken', "hdgdd");        
        obj.save({
            success : function(savedObj){
                if(savedObj){

                    var obj = new CB.CloudObject('Device');
                    obj.set('deviceToken', "hdgdd");        
                    obj.save({
                        success : function(savedObj2){
                            if(savedObj2){
                               done("created twice with same deviceToken");
                            }else{
                                done();
                            }
                        },error : function(error){
                            done();
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

    it("Should update device", function (done) {
        if(CB._isNode){
           done();
           return;
        }

        this.timeout(300000);       

        var obj = new CB.CloudObject('Device');
        obj.set('deviceToken', "token");
        obj.set('deviceOS', "windows");
        obj.set('timezone', "chile");
        obj.set('channels', ["pirates","hackers","stealers"]);
        obj.set('metadata', {"appname":"hdhfhfhfhf"});
        obj.save({
            success : function(savedObj){
                if(savedObj){

                    savedObj.set('deviceToken', "toke2");
                    savedObj.set('deviceOS', "windows2");
                    savedObj.set('timezone', "chile2");
                    savedObj.set('channels', ["pirates2","hackers2","stealers2"]);
                    savedObj.set('metadata', {"appname":"hdhfhfhfhf2"});
                    savedObj.save({
                        success : function(savedObj2){
                            if(savedObj2){
                                done();
                            }else{
                                done("error on updating device object");
                            }
                        },error : function(error){
                            done(error);
                        }
                    });

                }else{
                    done("error on creating device object for the first time");
                }
            },error : function(error){
                done(error);
            }
        });
    });    

});