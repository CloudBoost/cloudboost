describe("Disabled Cloud Object test", function() {

    before(function(){
        this.timeout(10000);
        CB.appKey = CB.masterKey;
    });

    it("should save cloudObject", function(done) {
        this.timeout('30000');

        var table = new CB.CloudTable('uniqueTablename');
        var column = new CB.Column('name');
        column.dataType = 'Text';
        table.addColumn(column);
        table.save({
            success : function(table){

                var obj = new CB.CloudObject('uniqueTablename');
                obj.set('name', 'sample');
                obj.save({
                    success : function(newObj){
                        if(obj.get('name') !== 'sample'){
                            done("name is not equal to what was saved.");
                            throw 'name is not equal to what was saved.';
                        }
                        if(!obj.id){
                            done('id is not updated after save.');
                            throw 'id is not updated after save.';
                        }

                        done();
                    }, error : function(error){
                        done(error);
                        throw 'Error saving the object';
                    }
                });

            }, error : function(error){
                done(error);
            }
        });        

    });

    after(function() {
        CB.appKey = CB.jsKey;
    });

});