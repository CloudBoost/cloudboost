describe("Should delete All Test Tables",function(done){

    before(function(){
        this.timeout(10000);
        CB.appKey = CB.masterKey;
    });

  it("should delete tables",function(done){

        this.timeout(30000);
        var obj = new CB.CloudTable('Address');
        obj.delete().then(function(){
            done();
        },function(error){
            throw "Unable to delete";
        });
    });

    it("should delete tables",function(done){

        this.timeout(30000);
        var obj = new CB.CloudTable('UnderScoreTable_a');
        obj.delete().then(function(){
            done();
        },function(){
            throw "Unable to delete";
        });

    });

    it("should delete tables",function(done){

        this.timeout(30000);
        var obj = new CB.CloudTable('Company');
        obj.delete().then(function(){
            done();
        },function(){
            throw "Unable to delete";
        });

    });

    it("should delete empty table",function(done){

        this.timeout(30000);
        var obj = new CB.CloudTable('Empty');
        obj.delete().then(function(){
            done();
        },function(){
            throw "Unable to delete";
        });

    }); 


    it("should delete tables",function(done){

        this.timeout(30000);

        var obj = new CB.CloudTable('Employee');
        obj.delete().then(function(){
            done();
        },function(){
            throw "Unable to delete";
        });

    });
});