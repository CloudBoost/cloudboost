describe("Table level ACL, for editing and getting table via clientKey", function(){

    before(function(){
        CB.appKey = CB.masterKey;
    });

    var tableName = util.makeString();

    it("should not get table via clientKey",function(done){

        this.timeout(80000);

        var obj = new CB.CloudTable(tableName);

        obj.save().then(function(table){
            if(table.id){
                CB.appKey = CB.jsKey;
                CB.CloudTable.get(tableName).then(function(table){
                    done('table should not be fetched via clientKey')
                },function(err){
                    done()
                })
            }else{
              done("Table cannot be created");
            }
        },function(){
            throw "Should Create a table";
        });
    });

    it("should set isEditableByClientKey of a table",function(done){

        this.timeout(80000);
        CB.appKey = CB.masterKey;
        CB.CloudTable.get(tableName).then(function(table){
            table.isEditableByClientKey = true
            table.save().then(function(res){
                done()
            },function(err){
                done(err)
            })
        },function(err){
            done(err)
        })
    
    });

    it("should now get the table via client key",function(done){

        this.timeout(80000);
        CB.appKey = CB.jsKey;
        CB.CloudTable.get(tableName).then(function(table){
            if(table.id){
                done()
            }else{
                done("Table cannot be created");
            }
        },function(err){
            done(err)
        })
    
    });

    it("should now edit the table via client key",function(done){

        this.timeout(80000);
        CB.appKey = CB.jsKey;

        CB.CloudTable.get(tableName).then(function(table){
            if(table.id){
                var column1 = new CB.Column('Name1', 'Text', true, false);
                table.addColumn(column1);
                table.save().then(function(newTable){
                    done();
                    newTable.delete();
                });
            }else{
                done("Table cannot be created");
            }
        },function(err){
            done(err)
        })
    
    });

    after(function() {
    	CB.appKey = CB.jsKey;
  	});


});
