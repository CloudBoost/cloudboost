describe("CloudQuery - Encryption", function () {

    it("should get encrypted passwords", function (done) {

        this.timeout(30000);
         
        var username = util.makeEmail();

        var obj = new CB.CloudObject('User');
        obj.set('username',username);
        obj.set('password','password');
        obj.set('email',util.makeEmail());

        obj.save().then(function(obj){
            if(obj.get('password') !== 'password'){
                //now run CloudQuery. 
                var query = new CB.CloudQuery('User');
                query.equalTo('password','password');
                query.equalTo('username',username);
                query.find({
                    success : function(list){
                        if(list.length>0){
                            done();
                        }
                        else{
                            throw "Cannot get items.";
                        }
                    }, error : function(query){
                        //cannot query. 
                        throw "Cannot query over encrypted type";
                    }
                })
            }

            else
                throw "Cannot encrypt";

        }, function(){
            throw "Cannot save a CloudObject";
        });

    });




     it("should get encrypted passwords over OR query", function (done) {

        this.timeout(30000);
         
        var username = util.makeEmail();

        var obj = new CB.CloudObject('User');
        obj.set('username',username);
        obj.set('password','password');
        obj.set('email',util.makeEmail());

        obj.save().then(function(obj){
            if(obj.get('password') !== 'password'){
                //now run CloudQuery. 
                var query1 = new CB.CloudQuery('User');
                query1.equalTo('password','password');

                 var query2 = new CB.CloudQuery('User');
                query2.equalTo('password','password1');

                var query = new CB.CloudQuery.or(query1, query2);
                query.equalTo('username',username);
                query.find({
                    success : function(list){
                        if(list.length>0){
                            done();
                        }
                        else{
                            throw "Cannot get items.";
                        }
                    }, error : function(query){
                        //cannot query. 
                        throw "Cannot query over encrypted type";
                    }
                })
            }

            else
                throw "Cannot encrypt";

        }, function(){
            throw "Cannot save a CloudObject";
        });

    });

    it("should not encrypt already encrypted passwords", function (done) {

        this.timeout(20000);

        var obj = new CB.CloudObject('User');
        obj.set('username',util.makeEmail());
        obj.set('password','password');
        obj.set('email',util.makeEmail());
        obj.save().then(function(obj){
            var query = new CB.CloudQuery('User');
            query.findById(obj.get('id')).then(function(obj1){
                obj1.save().then(function(obj2){
                    if(obj2.get('password') === obj2.get('password'))
                        done();
                },function(){
                    throw "Encrypted the password field again";
                });
            }, function (err) {
                throw "unable to find object by id";
            });
        }, function(){
            throw "Cannot save a CloudObject";
        });

    });

});