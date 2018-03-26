    describe("Search_ACL", function () {

    var obj = new CB.CloudObject('student4');
    obj.set('age',150);

        var username = util.makeString();
        var passwd = "abcd";
        var user = new CB.CloudUser();
        it("Should create new user", function (done) {

            if(CB._isNode){
            
            done();
            return;
         }

            this.timeout(20000);
            user.set('username', username);
            user.set('password',passwd);
            user.set('email',util.makeEmail());
            user.signUp().then(function(list) {
                if(list.get('username') === username)
                    done();
                else
                    throw "create user error"
            }, function () {
                throw "user create error";
            });

        });  

});

