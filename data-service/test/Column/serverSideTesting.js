// to check if default values been set on the Column Object are getting saved on the sever side without error
describe("server side tests of Cloud Column", function(){

    before(function(){
        CB.appKey = CB.masterKey;
    });

    var tableName = util.makeString();

   
   it("should add a Default Text Value to a Cloumn",function(done){
        this.timeout(40000);
        var table = new CB.CloudTable(tableName);

        var column = new CB.Column('Name', 'Text', true, false);
        column.document.defaultValue = "Default Text";

        table.addColumn(column);

        table.save({
            success : function(table){
                done();
            },
            error : function(error){
                done(err)
            }
        });
    });


    it("should not add an invalid Default Text Value to a Cloumn",function(done){
        this.timeout(40000);
        var table = new CB.CloudTable(tableName);

        var column = new CB.Column('Name', 'Text', true, false);
        column.document.defaultValue = 56;
        
        table.addColumn(column);

        table.save({
            success : function(table){
                done(new TypeError("Validation did not work"));
            }, 
            error : function(error){
                done()
            }
        });
    });


    it("should add a Default Number Value to a Cloumn",function(done){
        this.timeout(40000);
        var table = new CB.CloudTable(tableName);

        var column = new CB.Column('Name', 'Number', true, false);
        column.document.defaultValue = 56;
        
        table.addColumn(column);

        table.save({
            success : function(table){
                done()
                
            }, 
            error : function(err){
                done(err);
            }
        });
    });


    it("should not add an invalid Default Number Value to a Cloumn",function(done){
        this.timeout(40000);
        var table = new CB.CloudTable(tableName);
        
        var column = new CB.Column('Name', 'Number', true, false);
        column.document.defaultValue = "Invalid Value";
        
        table.addColumn(column);

        table.save({
            success : function(table){
                done("Validation did not work");   
            }, 
            error : function(err){
                done();
            }
        });
    });


    it("should add a Default Bool Value to a Cloumn", function(done){
        this.timeout(40000);
        var table = new CB.CloudTable(tableName);

        var column = new CB.Column('Name', 'Boolean', true, false);
        column.document.defaultValue = true;
        
        table.addColumn(column);

        table.save({
            success : function(table){
                done();  
            }, 
            error : function(err){
                done(err);
            }
        });
    });


    it("should not add an Invalid Default Bool Value to a Cloumn",function(done){
        this.timeout(40000);
        var table = new CB.CloudTable(tableName);

        var column = new CB.Column('Name', 'Boolean', true, false);
        column.document.defaultValue = "Invalid Value";
        
        table.addColumn(column);

        table.save({
            success : function(table){
                done("Validation did not work");   
            }, 
            error : function(err){
                done();
            }
        });
    });


    it("should add a Default Date Time Value to a Cloumn",function(done){
        this.timeout(40000);
        var table = new CB.CloudTable(tableName);

        var column = new CB.Column('Name', 'DateTime', true, false);
        column.document.defaultValue = "1994-11-05T08:15:30-05:00";
        
        table.addColumn(column);

        table.save({
            success : function(table){
                done();  
            }, 
            error : function(err){
                done(err);
            }
        });
    });


    it("should not add an invalid Default Date Time Value to a Cloumn",function(done){
        this.timeout(40000);
        var table = new CB.CloudTable(tableName);

        var column = new CB.Column('Name', 'DateTime', true, false);
        column.document.defaultValue = 45;
        
        table.addColumn(column);

        table.save({
            success : function(table){
                done("Validation did not work");   
            }, 
            error : function(err){
                done();
            }
        });
    });


    it("should add a Default Object Value to a Cloumn",function(done){
        this.timeout(40000);
        var table = new CB.CloudTable(tableName);

        var column = new CB.Column('Name', 'Object', true, false);
        column.document.defaultValue = {};
        
        table.addColumn(column);

        table.save({
            success : function(table){
                done();  
            }, 
            error : function(err){
                done(err);
            }
        });     
    });


    it("should not add an invalid Default Object Value to a Cloumn",function(done){
        this.timeout(40000);
        var table = new CB.CloudTable(tableName);

        var column = new CB.Column('Name', 'Object', true, false);
        column.document.defaultValue = "Invalid Value";
        
        table.addColumn(column);

        table.save({
            success : function(table){
                done("Validation did not work");   
            }, 
            error : function(err){
                done();
            }
        });
    });


    it("should add a Default Encrypted Text Value to a Cloumn",function(done){
        this.timeout(40000);
        var table = new CB.CloudTable(tableName);

        var column = new CB.Column('Name', 'EncryptedText', true, false);
        column.document.defaultValue = "ljklwej4543434";
        
        table.addColumn(column);

        table.save({
            success : function(table){
                done();  
            }, 
            error : function(err){
                done(err);
            }
        });     
    });


    it("should not add an Invalid Default Encrypted Text Value to a Cloumn",function(done){
        this.timeout(40000);
        var table = new CB.CloudTable(tableName);

        var column = new CB.Column('Name', 'EncryptedText', true, false);
        column.document.defaultValue = {};
        
        table.addColumn(column);

        table.save({
            success : function(table){
                done("Validation did not work");   
            }, 
            error : function(err){
                done();
            }
        });    
    });


    it("should add a Default URL Value to a Cloumn", function(done){
        this.timeout(40000);
        var table = new CB.CloudTable(tableName);

        var column = new CB.Column('Name', 'URL', true, false);
        column.document.defaultValue = "https://cloudboost.io/";
        
        table.addColumn(column);

        table.save({
            success : function(table){
                done();   
            }, 
            error : function(err){
                done(err);
            }
        });    
    });


    it("should not add an Invalid Default URL Value to a Cloumn", function(done){
        this.timeout(40000);
        var table = new CB.CloudTable(tableName);

        var column = new CB.Column('Name', 'URL', true, false);
        column.document.defaultValue = "Invalid URL";
        
        table.addColumn(column);

        table.save({
            success : function(table){
                done("Validation did not work");   
            }, 
            error : function(err){
                done();
            }
        }); 
    });


    it("should add a Default Email Value to a Cloumn",function(done){
        this.timeout(40000);
        var table = new CB.CloudTable(tableName);

        var column = new CB.Column('Name', 'Email', true, false);
        column.document.defaultValue = "test@cloudboost.io";
        
        table.addColumn(column);

        table.save({
            success : function(table){
                done();
            }, 
            error : function(err){
                done(err);
            }
        }); 
    });


    it("should not add an Invalid Default Email Value to a Cloumn",function(done){
        this.timeout(40000);
        var table = new CB.CloudTable(tableName);

        var column = new CB.Column('Name', 'Email', true, false);
        column.document.defaultValue = "Invalid Email";
        
        table.addColumn(column);

        table.save({
            success : function(table){
                done("Validation did not work");   
            }, 
            error : function(err){
                done();
            }
        }); 
    });

    after(function() {
    	CB.appKey = CB.jsKey;
  	});

});