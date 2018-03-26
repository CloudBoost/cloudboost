describe("ACL", function () {

     it("Should update the ACL object.", function (done) {

        this.timeout(20000);

        if(CB._isNode){
            
            done();
            return;
        }

        var obj = new CB.CloudObject('Employee');
        obj.ACL = new CB.ACL();
        obj.ACL.setRoleWriteAccess("x",true);
        obj.ACL.setPublicWriteAccess(true);
        obj.save().then(function(list) {
            list.ACL.setRoleWriteAccess("y",true);
            list.ACL.setPublicWriteAccess(true);
            list.save().then(function(obj) {
                var query = new CB.CloudQuery("Employee");
                query.findById(obj.id, {
                    success : function(obj){
                        if(obj.ACL.document.write.allow.role.length === 2) {
                            done();
                        }
                        else
                            done("Cannot update the ACL");
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

    it("Should set the public write access", function (done) {

        this.timeout(20000);

        if(CB._isNode){
            
            done();
            return;
        }

        var obj = new CB.CloudObject('student4');
        obj.ACL = new CB.ACL();
        obj.ACL.setPublicWriteAccess(false);
        obj.save().then(function(list) {
            var acl=list.get('ACL');
            if(acl.document.write.deny.user.length === 0) {
                obj.set('age',15);
                obj.save().then(function(){
                    throw "Should not save object with no right access";
                },function(){
                    done();
                });
            }
            else
                throw "public write access set error"
        }, function () {
            throw "public write access save error";
        });
    });

     it("Should persist ACL object inside of CloudObject after save.", function (done) {

        this.timeout(20000);

    
        var obj = new CB.CloudObject('student4');
        obj.ACL = new CB.ACL();
        obj.ACL.setUserWriteAccess('id',true);
        obj.save().then(function(obj) {
            var acl=obj.get('ACL');
            if(acl.document.write.allow.user.length === 1 && acl.document.write.allow.user[0] === 'id') {
               //query this object and see if ACL persisted. 
               var query = new CB.CloudQuery("student4");
               query.equalTo('id',obj.id);
               query.find({
                    success : function(list){
                        if(list.length ===1)
                        {
                            var acl = list[0].ACL;
                            if(acl.document.write.allow.user.length === 1 && acl.document.write.allow.user[0] === 'id'){
                                done();
                            }else{
                                done("Cannot persist ACL object");
                            }
                        }   
                        else{
                            done("Cannot get cloudobject");
                        }
                    }, error : function(error){

                    }
               });
            }
            else
                done("ACL write access on user cannot be set");
        }, function () {
            throw "public write access save error";
        });
    });

    it("Should set the public read access", function (done) {

        this.timeout(20000);

        if(CB._isNode){
            
            done();
            return;
        }


        var obj = new CB.CloudObject('student4');
        obj.ACL = new CB.ACL();
        obj.ACL.setPublicReadAccess(false);
        obj.save().then(function(list) {
            var acl=list.get('ACL');
            if(acl.document.read.deny.user.length === 0)
                done();
            else
                throw "public read access set error"
        }, function () {
            throw "public read access save error";
        });

    });


    var username = util.makeString();
    var passwd = "abcd";
    var userObj = new CB.CloudUser();

    it("Should create new user", function (done) {

        if(CB._isNode){
            
            done();
            return;
         }

        this.timeout(20000);

        userObj.set('username', username);
        userObj.set('password',passwd);
        userObj.set('email',util.makeEmail());
        userObj.signUp().then(function(list) {
            if(list.get('username') === username)
                done();
            else
                done('User unable to log in');
        }, function (err) {
            done(err);
        });

    });

    it("Should set the user read access", function (done) {

        if(CB._isNode){
            
            done();
            return;
         }

        this.timeout(20000);

        var obj = new CB.CloudObject('student4');
        obj.ACL = new CB.ACL();
        obj.ACL.setUserReadAccess(userObj.get('id'),true);
        obj.save().then(function(list) {
            acl=list.get('ACL');
            if(acl.document.read.allow.user.indexOf(userObj.get('id')) >= 0)
                done();
            else
                throw "user read access set error"
        }, function () {
            throw "user read access save error";
        });

    });

    it("Should allow users of role to write", function (done) {
        if(CB._isNode){
            
            done();
            return;
         }


        this.timeout(20000);

        var obj = new CB.CloudObject('student4');
        obj.ACL = new CB.ACL();
        obj.ACL.setRoleWriteAccess(userObj.get('id'),true);
        obj.save().then(function(list) {
            acl=list.get('ACL');
            if(acl.document.write.allow.role.indexOf(userObj.get('id'))>=0)
                done();
            else
                throw "user role write access set error"
        }, function () {
            throw "user role write access save error";
        });

    });

    it("Should allow users of role to read", function (done) {

        if(CB._isNode){
            
            done();
            return;
        }

        this.timeout(20000);

        var obj = new CB.CloudObject('student4');
        obj.ACL.setRoleReadAccess(userObj.get('id'),true);
        obj.save().then(function(list) {
            acl=list.get('ACL');
            if(acl.document.read.allow.role.indexOf(userObj.get('id'))>=0)
                done();
            else
                throw "user role read access set error"
        }, function () {
            throw "user role read access save error";
        });

    });
});

