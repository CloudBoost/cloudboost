// To check if cloud objects are being saved properly on the server side with the default Values if not already provided with a value.
describe("Setting Default Values for Cloud Object", function(){

    var tableName = util.makeString();
    var globalTable;

    before(function(done){
        CB.appKey = CB.masterKey;
        var table = new CB.CloudTable(tableName);
        globalTable = table;
        var currDate = new Date().toString()
        defaults = {
            Text: "Default Text",
            Number: 56,
            Boolean: true,
            DateTime: currDate,
            Object: {},
            EncryptedText: "ljklwej4543434",
            URL: "https://cloudboost.io/",
            Email: "test@cloudboost.io"
        }

        var columnText = new CB.Column('NameText', 'Text', true, false);
        columnText.defaultValue = defaults.Text;

        var columnNumber = new CB.Column('NameNumber', 'Number', true, false);
        columnNumber.defaultValue = defaults.Number; 

        var columnBool = new CB.Column('NameBool', 'Boolean', true, false);
        columnBool.defaultValue = defaults.Boolean;

        var columnDate = new CB.Column('NameDate', 'DateTime', true, false);
        columnDate.defaultValue = defaults.DateTime;

        var columnObj = new CB.Column('NameObj', 'Object', true, false);
        columnObj.defaultValue = defaults.Object;

        var columnET = new CB.Column('NameET', 'EncryptedText', true, false);
        columnET.defaultValue = defaults.EncryptedText;

        var columnURL = new CB.Column('NameURL', 'URL', true, false);
        columnURL.defaultValue = defaults.URL;

        var columnEmail = new CB.Column('NameEmail', 'Email', true, false);
        columnEmail.defaultValue = defaults.Email;

        table.addColumn(columnText);
        table.addColumn(columnNumber);
        table.addColumn(columnBool);
        table.addColumn(columnDate);
        table.addColumn(columnObj);
        table.addColumn(columnET);
        table.addColumn(columnURL);
        table.addColumn(columnEmail);

        table.save({
            success : function(table){
                console.log("table created");
                done();
            },
            error : function(error){
                done(err);
            }
        });
    });

   
   it("should add the Default Value to a Text Cloumn if Column not provided with a value",function(done){
        this.timeout(40000);
        var obj = new CB.CloudObject(tableName);
        obj.save({
            success : function(obj){
                if(obj.get("NameText") === defaults.Text){
                    done()
                }
                else {
                    done("Not setting default Value for Text columns")
                }
            },error : function(err){
                done(err)
            }
        });
    });

   
   it("should not add the Default Value to a Text Cloumn if already provided with a value",function(done){
        this.timeout(40000);
        var obj = new CB.CloudObject(tableName);
        obj.set('NameText', "Some Value");
        obj.save({
            success : function(obj){
                if(obj.get("NameText") === "Some Value"){
                    done()
                }
                else if (obj.get("NameText") === defaults.Text) {
                    done("Setting the default value instead of the provided Value for Text columns")
                }
                else {
                    done("Not setting the provided Value for Text columns");
                }
            },error : function(err){
                done(err)
            }
        });
    });


    it("should add the Default Value to a Number Column if Column not provided with a value",function(done){
        this.timeout(40000);
        var obj = new CB.CloudObject(tableName);
        obj.save({
            success : function(obj){
                if(obj.get("NameNumber") === defaults.Number){
                    done()
                }
                else {
                    done("Not setting default Value for Number columns")
                }
            },error : function(err){
                done(err)
            }
        });
    });

   
   it("should not add the Default Value to a Number Cloumn if already provided with a value",function(done){
        this.timeout(40000);
        var obj = new CB.CloudObject(tableName);
        obj.set('NameNumber', 47);
        obj.save({
            success : function(obj){
                if(obj.get("NameNumber") === 47){
                    done()
                }
                else if (obj.get("NameNumber") === defaults.Number) {
                    done("Setting the default value instead of the provided Value for Text columns")
                }
                else {
                    done("Not setting the provided Value for Text columns");
                }
            },error : function(err){
                done(err)
            }
        });
    });


    it("should add the Default Value to a Boolean Column if Column not provided with a value",function(done){
        this.timeout(40000);
        var obj = new CB.CloudObject(tableName);
        obj.save({
            success : function(obj){
                if(obj.get("NameBool") === defaults.Boolean){
                    done()
                }
                else {
                    done("Not setting default Value for Boolean columns")
                }
            },error : function(err){
                done(err)
            }
        });
    });

   
   it("should not add the Default Value to a Boolean Cloumn if already provided with a value",function(done){
        this.timeout(40000);
        var obj = new CB.CloudObject(tableName);
        obj.set('NameBool', false);
        obj.save({
            success : function(obj){
                if(obj.get("NameBool") === false){
                    done()
                }
                else if (obj.get("NameBool") === defaults.Boolean) {
                    done("Setting the default value instead of the provided Value for Text columns")
                }
                else {
                    done("Not setting the provided Value for Text columns");
                }
            },error : function(err){
                done(err)
            }
        });
    });


    it("should add the Default Value to a DateTime Column if Column not provided with a value",function(done){
        this.timeout(40000);
        var obj = new CB.CloudObject(tableName);
        obj.save({
            success : function(obj){
                try{
                    if(new Date(obj.get("NameDate")).toLocaleDateString() == new Date(defaults.DateTime).toLocaleDateString()){
                        done()
                    } else {
                        done("Not setting default Value for Boolean columns")
                    }
                } catch(e){
                    done("Not setting default Value for Boolean columns")
                }
            },error : function(err){
                done(err)
            }
        });
    });


    it("should add the Default Value to a Object Column if Column not provided with a value",function(done){
        this.timeout(40000);
        var obj = new CB.CloudObject(tableName);
        obj.save({
            success : function(obj){
                if(JSON.stringify(obj.get("NameObj")) === JSON.stringify(defaults.Object)){
                    done();
                }
                else {
                    done("Not setting default Value for Boolean columns")
                }
            },error : function(err){
                done(err)
            }
        });
    });

   
   it("should not add the Default Value to a Object Cloumn if already provided with a value",function(done){
        this.timeout(40000);
        var obj = new CB.CloudObject(tableName);
        obj.set('NameObj', { someKey: "someValue" });
        obj.save({
            success : function(obj){
                if(JSON.stringify(obj.get("NameObj")) == JSON.stringify({ someKey: "someValue" })){
                    done()
                }
                else if (JSON.stringify(obj.get("NameObj")) == JSON.stringify(defaults.Object)) {
                    done("Setting the default value instead of the provided Value for Text columns")
                }
                else {
                    done("Not setting the provided Value for Object columns");
                }
            },error : function(err){
                done(err)
            }
        });
    });


    it("should add the Default Value to a EncryptedText Column if Column not provided with a value",function(done){
        this.timeout(40000);
        var obj = new CB.CloudObject(tableName);
        obj.save({
            success : function(obj){
                console.log(obj.get("NameET"));
                if(obj.get("NameET") === defaults.EncryptedText){
                    done()
                }
                else {
                    done("Not setting default Value for Boolean columns")
                }
            },error : function(err){
                done(err)
            }
        });
    });


    it("should add the Default Value to a URL Column if Column not provided with a value",function(done){
        this.timeout(40000);
        var obj = new CB.CloudObject(tableName);
        obj.save({
            success : function(obj){
                if(obj.get("NameURL") === defaults.URL){
                    done()
                }
                else {
                    done("Not setting default Value for Boolean columns")
                }
            },error : function(err){
                done(err)
            }
        });
    });

   
   it("should not add the Default Value to a URL Cloumn if already provided with a value",function(done){
        this.timeout(40000);
        var obj = new CB.CloudObject(tableName);
        obj.set('NameURL', "http://google.com");
        obj.save({
            success : function(obj){
                if(obj.get("NameURL") === "http://google.com"){
                    done()
                }
                else if (obj.get("NameURL") === defaults.URL) {
                    done("Setting the default value instead of the provided Value for Text columns")
                }
                else {
                    done("Not setting the provided Value for Text columns");
                }
            },error : function(err){
                done(err)
            }
        });
    });


    it("should add the Default Value to a Email Column if Column not provided with a value",function(done){
        this.timeout(40000);
        var obj = new CB.CloudObject(tableName);
        obj.save({
            success : function(obj){
                if(obj.get("NameEmail") === defaults.Email){
                    done()
                }
                else {
                    done("Not setting default Value for Boolean columns")
                }
            },error : function(err){
                done(err)
            }
        });
    });

   
   it("should not add the Default Value to a Email Cloumn if already provided with a value",function(done){
        this.timeout(40000);
        var obj = new CB.CloudObject(tableName);
        obj.set('NameEmail', "test@google.com");
        obj.save({
            success : function(obj){
                if(obj.get("NameEmail") === "test@google.com"){
                    done()
                }
                else if (obj.get("NameEmail") === defaults.Email) {
                    done("Setting the default value instead of the provided Value for Text columns")
                }
                else {
                    done("Not setting the provided Value for Text columns");
                }
            },error : function(err){
                done(err)
            }
        });
    });

    after(function() {
    	CB.appKey = CB.jsKey;
        
        globalTable.delete({
            success : function(table){
                console.log("Testing Complete")
            }, 
            error : function(err){
                console.log(err)
            }
        });
        
  	});

});