describe("MasterKey ACL", function () {

     before(function(){
        CB.appKey = CB.masterKey;
      });


    it("Should save an object with master key with no ACL access.", function (done) {

        this.timeout(50000);

        var obj = new CB.CloudObject('student4');
        obj.ACL = new CB.ACL();
        obj.ACL.setPublicReadAccess(false);
        obj.ACL.setPublicWriteAccess(false);
        
        obj.save().then(function(obj) {

            if(obj.id){
                 obj.set('age',19);        
                 obj.save().then(function(obj) {
                    if(obj.id){
                        done();
                    }else{
                        done("Obj did not save.");
                    }
                }, function (error) {
                    done(error);
                });
            }else{
                done("Obj did not save.");
            }
        
        }, function (error) {
           done(error);
        });
    });

    it("Should delete the userId from the ACL", function (done) {

        this.timeout(20000);

        var obj = new CB.CloudObject('Employee');
        obj.ACL = new CB.ACL();
        obj.ACL.setUserWriteAccess("x",true);
        obj.save().then(function(list) {
            list.ACL.setUserWriteAccess("x",false);
            list.save().then(function(obj) {
                var query = new CB.CloudQuery("Employee");
                query.findById(obj.id, {
                    success : function(obj){
                        if(obj.ACL.document.write.allow.user.indexOf("x") === -1) {
                            done();
                        }
                        else
                            done("Cannot delete the user from the ACL");
                    }, error : function(error) {
                         done(error);
                    }
                })
            }, function(error){
                done(error);
            });           
        }, function (error) {
             done(error);
        });
        
    });

     after(function(){
        CB.appKey = CB.jsKey;
     });

});

