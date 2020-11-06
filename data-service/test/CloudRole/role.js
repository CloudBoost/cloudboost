describe("CloudRole", function (done) {

    it("Should create a role", function (done) {

        this.timeout(40000);
        var roleName5 = util.makeString();
        var role5 = new CB.CloudRole(roleName5);
        role5.save().then(function(list){           
            if(!list)
                throw "Should create a role";
            done();
        },function(){
            throw "unable to create a role.";
        });
    });

    it("Should Retrieve a role", function (done) {
		
        this.timeout(40000);

        var roleName5 = util.makeString();
        var role5 = new CB.CloudRole(roleName5);
        role5.save().then(function(list){
            var query = new CB.CloudQuery('Role');
            if(!role5.get('id')){
                done();
            }
            query.equalTo('id',role5.get('id'));
            query.find().then(function(list){                
                if(!list)
                    throw "Should retrieve the cloud role";
                done();
            },function(){
                throw "Should retrieve the cloud role";
            });
        },function(){
            throw "unable to create a role.";
        })


    });
});
