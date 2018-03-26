describe("ACL on CloudObject Notifications", function () {

    it("Should create new user and listen to CloudNotification events.", function (done) {

        if(CB._isNode){
            
            done();
            return;
         }

        var isDone = false;

        this.timeout(20000);

        var username = util.makeString();
        var passwd = "abcd";
        var userObj = new CB.CloudUser();

        userObj.set('username', username);
        userObj.set('password',passwd);
        userObj.set('email',util.makeEmail());
        userObj.signUp().then(function(user) {
            
            CB.CloudObject.on('User', 'created', function(){
                CB.CloudObject.off('User','created');
                if(!isDone){
                    isDone=true;
                    done();
                }
                
            });

            var username = util.makeString();
            var passwd = "abcd";
            var userObj = new CB.CloudUser();

            userObj.set('username', username);
            userObj.set('password',passwd);
            userObj.set('email',util.makeEmail());

            userObj.save();
           
        }, function (error) {
            done("user create error");
        });

    });

    it("Should NOT receieve a  notification when public read access is false;", function (done) {

        if(CB._isNode){
            
            done();
            return;
         }

        var isDone = false;

        this.timeout(30000);

        var username = util.makeString();
        var passwd = "abcd";
        var userObj = new CB.CloudUser();

        userObj.set('username', username);
        userObj.set('password',passwd);
        userObj.set('email',util.makeEmail());
        userObj.signUp().then(function(user) {
            
            CB.CloudObject.on('User', 'created', function(data){
                CB.CloudObject.off('User','created');
                if(!isDone){
                    isDone=true;
                     done("Sent notification when set public read access is false");
                }
            });

            var username = util.makeString();
            var passwd = "abcd";
            var userObj = new CB.CloudUser();

            userObj.set('username', username);
            userObj.set('password',passwd);
            userObj.set('email',util.makeEmail());

            userObj.ACL = new CB.ACL();
            userObj.ACL.setPublicReadAccess(false);

            userObj.save();

            setTimeout(function(){ 
                
                if(!isDone){
                    isDone=true;
                    done();
                }

            }, 1000); //wait for sometime and done! 
           
        }, function (error) {
            throw "user create error";
        });

    });

    it("Should NOT receivee an event when user read access is false;", function (done) {

        if(CB._isNode){
            
            done();
            return;
         }

        this.timeout(30000);

        var isDone = false;

        var username = util.makeString();
        var passwd = "abcd";
        var userObj = new CB.CloudUser();

        userObj.set('username', username);
        userObj.set('password',passwd);
        userObj.set('email',util.makeEmail());
        userObj.signUp().then(function(user) {
            
            CB.CloudObject.on('User', 'created', function(){
                CB.CloudObject.off('User','created');
                if(!isDone){
                    isDone=true;
                     done("Sent notification when set public read access is false");
                }
            });

            var username = util.makeString();
            var passwd = "abcd";
            var userObj = new CB.CloudUser();

            userObj.set('username', username);
            userObj.set('password',passwd);
            userObj.set('email',util.makeEmail());

            userObj.ACL = new CB.ACL();
            userObj.ACL.setUserReadAccess(user.id, false);

            userObj.save();

            setTimeout(function(){ 
               if(!isDone){
                    isDone=true;
                    done();
                }
            }, 10000); //wait for sometime and done! 
           
        }, function (error) {
            done("user create error");
        });

    });

    it("Should NOT receieve a  notification when public read access is true but user is false;", function (done) {

        if(CB._isNode){
            
            done();
            return;
         }

        this.timeout(30000);

        var isDone = false;

        var username = util.makeString();
        var passwd = "abcd";
        var userObj = new CB.CloudUser();

        userObj.set('username', username);
        userObj.set('password',passwd);
        userObj.set('email',util.makeEmail());
        userObj.signUp().then(function(user) {
            
            CB.CloudObject.on('User', 'created', function(){
                CB.CloudObject.off('User','created');
                if(!isDone){
                    isDone=true;
                     done("Sent notification when set public read access is false");
                }
               
            });

            var username = util.makeString();
            var passwd = "abcd";
            var userObj = new CB.CloudUser();

            userObj.set('username', username);
            userObj.set('password',passwd);
            userObj.set('email',util.makeEmail());

            userObj.ACL = new CB.ACL();
            userObj.ACL.setPublicReadAccess(true);
            userObj.ACL.setUserReadAccess(user.id, false);

            userObj.save();

            setTimeout(function(){ 
                if(!isDone){
                    isDone=true;
                    done();
                }
             }, 10000); //wait for sometime and done! 
           
        }, function (error) {
            done("user create error");
        });

    });


    it("Should receieve a notification when public read access is false but user is true;", function (done) {

        if(CB._isNode){
            
            done();
            return;
         }

        this.timeout(30000);

        var isDone = false;

        var username = util.makeString();
        var passwd = "abcd";
        var userObj = new CB.CloudUser();

        userObj.set('username', username);
        userObj.set('password',passwd);
        userObj.set('email',util.makeEmail());
        userObj.signUp().then(function(user) {
            
            CB.CloudObject.on('User', 'created', function(){
               CB.CloudObject.off('User','created');
               if(!isDone){
                    isDone=true;
                    done();
                }
            });

            var username = util.makeString();
            var passwd = "abcd";
            var userObj = new CB.CloudUser();

            userObj.set('username', username);
            userObj.set('password',passwd);
            userObj.set('email',util.makeEmail());

            userObj.ACL = new CB.ACL();
            userObj.ACL.setPublicReadAccess(false);
            userObj.ACL.setUserReadAccess(user.id, true);

            userObj.save();

        }, function (error) {
            done("user create error");
        });

    });

    it("Should NOT receieve a notification when user is logged out.", function (done) {

        if(CB._isNode){
            
            done();
            return;
         }

        this.timeout(30000);

        var isDone = false;

        var username = util.makeString();
        var passwd = "abcd";
        var userObj = new CB.CloudUser();

        userObj.set('username', username);
        userObj.set('password',passwd);
        userObj.set('email',util.makeEmail());
        userObj.signUp().then(function(user) {
            
            CB.CloudObject.on('Custom1', 'created', function(){
               CB.CloudObject.off('Custom1','created');
               if(!isDone){
                    isDone=true;
                    done("Wrong event fired");
                }
            });

            var obj = new CB.CloudObject('Custom1'); 
            obj.set('newColumn', 'Sample');
            obj.ACL = new CB.ACL();
            obj.ACL.setPublicReadAccess(false);
            obj.ACL.setPublicWriteAccess(true);
            obj.ACL.setUserReadAccess(user.id, true);

            user.logOut({
                success: function(user){

                    obj.save();

                    setTimeout(function(){ 
                        if(!isDone){
                            isDone=true;
                            done();
                        }
                     }, 10000); //wait for sometime and done! 

                }, error : function(error){
                    done("Error");
                }
            });

        }, function (error) {
            done("user create error");
        });

    });

    it("Should receieve a notification when user is logged out and logged back in.", function (done) {

        if(CB._isNode){
            
            done();
            return;
         }

        this.timeout(30000);

        var isDone = false;

        var username = util.makeString();
        var passwd = "abcd";
        var userObj = new CB.CloudUser();

        userObj.set('username', username);
        userObj.set('password',passwd);
        userObj.set('email',util.makeEmail());
        userObj.signUp().then(function(user) {
            
            CB.CloudObject.on('Custom1', 'created', function(){
               CB.CloudObject.off('Custom1','created');
               if(!isDone){
                    isDone=true;
                    done();
                }
            });

            var obj = new CB.CloudObject('Custom1'); 
            obj.set('newColumn', 'Sample');
            obj.ACL = new CB.ACL();
            obj.ACL.setPublicReadAccess(false);
            obj.ACL.setPublicWriteAccess(true);
            obj.ACL.setUserReadAccess(user.id, true);

            user.logOut({
                success: function(user){
                
                    user.set("password",passwd);
                    user.logIn({
                        success : function(){
                             obj.save();

                        }, error: function(){
                            done("Failed to login a user");
                        }
                    });

                   

                }, error : function(error){
                    done("Error");
                }
            });

        }, function (error) {
            done("user create error");
        });

    });
});

