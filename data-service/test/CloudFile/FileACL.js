describe("ACL Tests Over Files",function(done){

    before(function(){
         CB.appKey = CB.jsKey;
    });

    it("should not get file Object with not read access",function(done){

        this.timeout(30000);

        var data = 'akldaskdhklahdasldhd';
        var name = 'abc.txt';
        var type = 'txt';
        var fileObj = new CB.CloudFile(name,data,type);
        fileObj.ACL.setPublicReadAccess(false);
        fileObj.save().then(function(res){
            res.fetch().then(function(res){
                if(!res)
                    done();
                else
                    throw "Unable to get ACL working";
            },function(){
                throw "Unable to perform query";
            });
        },function(){
            throw "Unable to save file";
        });

    });


    it("should not get file with no read access",function(done){

        this.timeout(30000);

        var data = 'akldaskdhklahdasldhd';
        var name = 'abc.txt';
        var type = 'txt';
        var fileObj = new CB.CloudFile(name,data,type);
        fileObj.ACL.setPublicReadAccess(false);
        fileObj.save().then(function(res){
            res.getFileContent().then(function(res){
                throw "Should not retrieve file";
            },function(err){               
                done();
            });
        },function(){
            throw "Unable to save file";
        });

    });

    it("should not delete file no write access",function(done){

        this.timeout(30000);

        var data = 'akldaskdhklahdasldhd';
        var name = 'abc.txt';
        var type = 'txt';
        var fileObj = new CB.CloudFile(name,data,type);
        fileObj.ACL.setPublicWriteAccess(false);
        fileObj.save().then(function(res){
            res.delete().then(function(res){
                throw "Should not retrieve file";
            },function(err){               
                done();
            });
        },function(){
            throw "Unable to save file";
        });

    });

});