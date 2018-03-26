describe("CloudExpire", function () {

    it("Sets Expire in Cloud Object.", function (done) {

        this.timeout(30000);
        //create an object.
        var obj = new CB.CloudObject('Custom');
        obj.set('newColumn1', 'abcd');
        obj.save().then(function(obj1) {
            if(obj1)
                done();
            else
                throw "unable to save expires";
        }, function (err) {           
            throw "Relation Expire error";
        });

    });

    it("Checks if the expired object shows up in the search or not", function (done) {

        this.timeout(30000);
        var curr=new Date().getTime();
        var query = new CB.CloudQuery('Custom');
        query.find().then(function(list){
            if(list.length>0){
                var __success = false;
                for(var i=0;i<list.length;i++){
                    if(list[i].get('expires')>curr || !list[i].get('expires')){
                           __success = true;
                            done();
                            break;
                        }
                    else{
                        throw "Expired Values also shown Up";
                    }
                    }
            }else{
                done();
            }

        }, function(error){
            done(error);
        })

    });

});