describe("Bulk API",function(done){

    it("should save array of CloudObject using bulk Api",function(done){

        this.timeout(20000);

        var obj = new CB.CloudObject('Student');
        obj.set('name','Vipul');
        var obj1 = new CB.CloudObject('Student');
        obj1.set('name','ABCD');
        var arr = [obj,obj1];
        CB.CloudObject.saveAll(arr).then(function(res){          
            done();
        },function(err){
            throw "Unable to Save CloudObject";
        });
    });

    it("should save and then delete array of CloudObject using bulk Api",function(done){

        this.timeout(40000);

        var obj = new CB.CloudObject('Student');
        obj.set('name','Vipul');
        var obj1 = new CB.CloudObject('Student');
        obj1.set('name','ABCD');
        var arr = [obj,obj1];
        CB.CloudObject.saveAll(arr).then(function(res){           
            CB.CloudObject.deleteAll(res).then(function(res){               
                done();
            },function(err){
                throw "Unable to Delete CloudObject";
            });
        },function(err){
            throw "Unable to Save CloudObject";
        });
    });

    try {
        if(window) {

            it("Should save CloudObject Array with unsaved files", function (done) {

                this.timeout(40000);

                var data = 'akldaskdhklahdasldhd';
                var name = 'abc.txt';
                var type = 'txt';
                var fileObj = new CB.CloudFile(name, data, type);
                var obj = new CB.CloudObject('Sample');
                obj.set('name', 'vipul');
                obj.set('file', fileObj);
                var data = 'akldaskdhklahdasldhd';
                var name = 'abc.txt';
                var type = 'txt';
                var fileObj1 = new CB.CloudFile(name, data, type);
                var obj1 = new CB.CloudObject('Sample');
                obj1.set('name', 'ABCD');
                obj1.set('file', fileObj1);
                CB.CloudObject.saveAll([obj, obj1]).then(function (res) {
                    if(res[0].get('file').get('id') && res[1].get('file').get('id'))
                        done();
                    else
                        throw "Object saved but unable to save file";
                }, function (err) {
                    throw "Unable to Save CloudObject";
                });

            });
        }
    }catch(e){
        
    }

    it("Should properly save a relation in Bulk API",function(done){

        this.timeout(30000);

        var obj = new CB.CloudObject('Custom2');
        obj.set('newColumn1', 'Course');
        var obj3 = new CB.CloudObject('Custom3');
        obj3.set('address','progress');
        obj.set('newColumn2',obj3);
        CB.CloudObject.saveAll([obj,obj3]).then(function(res) {
            if(res[1].get('id') === res[0].get('newColumn2').get('id'))
                done();
            else
                throw "Unable to Save Relation properly";
        }, function () {
            throw "Relation Save error";
        });
    });

    it("Should properly save a relation in Bulk API",function(done){

        this.timeout(30000);

        var obj = new CB.CloudObject('Custom2');
        obj.set('newColumn1', 'Course');
        var obj3 = new CB.CloudObject('Custom3');
        obj3.set('address','progress');
        obj.set('newColumn2',obj3);
        CB.CloudObject.saveAll([obj3,obj]).then(function(res) {
            if(res[0].get('id') === res[1].get('newColumn2').get('id'))
                done();
            else
                throw "Unable to Save Relation properly";
        }, function () {
            throw "Relation Save error";
        });
    });
});