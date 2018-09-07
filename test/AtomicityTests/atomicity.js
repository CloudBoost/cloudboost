describe("Atomicity Tests",function(done){

    it("Should Attach the Database",function(done){

        this.timeout(10000);

        var url = CB.apiUrl+'/db/mongo/connect';  
        CB._request('POST',url).then(function() {
            done();
        },function(err){
            done(err);            
        });
    });

    it("Should Delete CloudObjects from other databases if not saved in one",function(done){

        this.timeout(50000);

        var obj = new CB.CloudObject('student1');
        obj.set('name','let');
        obj.save().then(function(res){
           var id = res.get('id');
            var url = CB.apiUrl + '/db/mongo/Disconnect';
            CB._request('POST',url).then(function(){
                res.set('name','what');
                res.save().then(function(){
                   done(new Error("DB disconnected should not save"));
                },function(){
                    var url = CB.apiUrl + '/db/mongo/connect';
                    CB._request('POST',url).then(function() {
                        var query = new CB.CloudQuery('student1');
                        query.findById(id).then(function(res){
                            if(res.get('name') === 'let')
                                done();
                            else
                                done(new Error("Save is Not Atomic"));
                        },function(){
                            done(new Error("Unable to run find Query"));
                        });
                    },function(){
                        done(new Error("Unable to connect back Mongo"));
                    });
                });
            },function(err){
                done(new Error("Unable to disconnect Mongo"));
            });
        },function(){
            done(new Error("Unable to Save Object"));
        });

    });

    it("Should Attach the Database",function(done){

        this.timeout(10000);

        var url = CB.apiUrl + '/db/mongo/connect';
        CB._request('POST',url).then(function() {
            done();
        },function(){
            done(new Error("Unable to connect back Mongo"));
        });
    });

    it("should delete a saved record",function(done){

        this.timeout(50000);

        var obj = new CB.CloudObject('student1');
        obj.set('name','abcdef');
        obj.save().then(function(res){
            var url = CB.apiUrl + '/db/mongo/Disconnect';
            CB._request('POST',url).then(function(){
                var id = res.get('id');
                res.delete().then(function(){
                    throw "Should Not delete with db disconnected";
                },function(){
                    var url = CB.apiUrl + '/db/mongo/connect';
                    CB._request('POST',url).then(function() {
                        var query = new CB.CloudQuery('student1');
                        query.findById(id).then(function(res) {
                            if(res) {                               
                                done();
                            }else{
                                throw "should get the record back";
                            }
                        },function(){
                            throw "unable to do find by id"
                        });
                    },function(){
                        throw "Unable to connect back Mongo";
                    });

                });
            },function(){
                throw "Unable to delete"
            });
        }, function (err) {
            throw "Unable to find document by Id";
        })
    });

    it("Should Attach the Database",function(done){

        this.timeout(10000);

        var url = CB.apiUrl + '/db/mongo/connect';
        CB._request('POST',url).then(function() {
            done();
        },function(){
            throw "Unable to connect back Mongo";
        });
    });

    it("should create a table",function(done){

        this.timeout(50000);

        CB.appKey = CB.masterKey;


        var tableName = util.makeString();
        var url = CB.apiUrl + '/db/mongo/Disconnect';
        CB._request('POST',url).then(function(){
            var table = new CB.CloudTable(tableName);
            table.save().then(function(){
                done("should not create the table when DB is disconnected");
            },function(error){
                CB.CloudTable.get(table).then(function(res){
                    if(!res)
                        done();
                    else
                        done("Unable to have atomicity in create table");
                },function(){
                    done("Unable to run get query");
                });
            });
        },function(err){
            done("Unable to disconnect Mongo");
        });

    });

    it("Connect back to MongoDB",function(done) {
        this.timeout(10000);
        CB.appKey = CB.jsKey;
        var url = CB.apiUrl + '/db/mongo/connect';
        CB._request('POST',url).then(function() {
            done();
        },function(){
            done("Unable to connect back Mongo");
        });
    });


});