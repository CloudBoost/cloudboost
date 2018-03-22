// to check if default values are being set properly on the Column Object
describe("cliend side tests of Cloud Column", function(){

    before(function(){
        CB.appKey = CB.masterKey;
    });
   
   it("should add a Default Text Value to a Cloumn",function(done){
            this.timeout(40000);
            var column = new CB.Column('Name', 'Text', true, false);
            try {
                            column.defaultValue = "Default Text";
                            done();
            }
            catch (err) {
                            done(err)
            }
    });

    it("should not add an invalid Default Text Value to a Cloumn",function(done){
        this.timeout(40000);
        var column = new CB.Column('Name', 'Text', true, false);
        try {
                        column.defaultValue = 56;
                        done(new TypeError("Validation did not work"));
        }
        catch (err) {
                        done();
        }
    });

    it("should add a Default Number Value to a Cloumn",function(done){
                this.timeout(40000);
                var column = new CB.Column('Name', 'Number', true, false);
                try {
                                column.defaultValue = 56;
                                done();
                }
                catch (err) {
                                done(err);
                }
    });

    it("should not add an invalid Default Number Value to a Cloumn",function(done){
                this.timeout(40000);
                var column = new CB.Column('Name', 'Number', true, false);
                try {
                                column.defaultValue = "Invalid Value";
                                done("Validation did not work");
                }
                catch (err) {
                                done();
                }
    });


    it("should add a Default Bool Value to a Cloumn",function(done){
                this.timeout(40000);
                var column = new CB.Column('Name', 'Boolean', true, false);
                try {
                                column.defaultValue = true;
                                done();
                }
                catch (err) {
                                done(err)
                }
    });


    it("should not add an Invalid Default Bool Value to a Cloumn",function(done){
                this.timeout(40000);
                var column = new CB.Column('Name', 'Boolean', true, false);
                try {
                                column.defaultValue = "Invalid Value";
                                done("Validation did not work");
                            }
                catch (err) {
                                done();
                }
    });


    it("should add a Default Date Time Value to a Cloumn",function(done){
                this.timeout(40000);
                var column = new CB.Column('Name', 'DateTime', true, false);
                try {
                                column.defaultValue = "1994-11-05T08:15:30-05:00";
                                done();
                }
                catch (err) {
                                done(err);
                }
    });


    it("should not add an invalid Default Date Time Value to a Cloumn",function(done){
                this.timeout(40000);
                var column = new CB.Column('Name', 'DateTime', true, false);
                try {
                                column.defaultValue = 45;
                                done("Validation did not work");
                }
                catch (err) {
                                done();
                }
    });


    it("should add a Default Object Value to a Cloumn",function(done){
                this.timeout(40000);
                var column = new CB.Column('Name', 'Object', true, false);
                try {
                                column.defaultValue = {};
                                done();
                }
                catch (err) {
                                done(err)
                }
    });


    it("should not add an invalid Default Object Value to a Cloumn",function(done){
                this.timeout(40000);
                var column = new CB.Column('Name', 'Object', true, false);
                try {
                                column.defaultValue = "Invalid Value";
                                done("Validation did not work");
                }
                catch (err) {
                                done();
                }
    });


    it("should add a Default Encrypted Text Value to a Cloumn",function(done){
                this.timeout(40000);
                var column = new CB.Column('Name', 'EncryptedText', true, false);
                try {
                                column.defaultValue = "ljklwej4543434";
                                done();
                }
                catch (err) {
                                done(err);
                }
    });

    it("should not add an Invalid Default Encrypted Text Value to a Cloumn",function(done){
                this.timeout(40000);
                var column = new CB.Column('Name', 'EncryptedText', true, false);
                try {
                                column.defaultValue = {};
                                done("Validation did not work");
                            }
                catch (err) {
                                done();
                }
    });


    it("should add a Default URL Value to a Cloumn", function(done){
                this.timeout(40000);
                var column = new CB.Column('Name', 'URL', true, false);
                try {
                                column.defaultValue = "https://cloudboost.io/";
                                done();
                }
                catch (err) {
                                done(err);
                }
    });


    it("should not add an Invalid Default URL Value to a Cloumn", function(done){
                this.timeout(40000);
                var column = new CB.Column('Name', 'URL', true, false);
                try {
                                column.defaultValue = "Invalid URL";
                                done("Validation did not work");
                }
                catch (err) {
                                done();
                }
    });


    it("should add a Default Email Value to a Cloumn",function(done){
                this.timeout(40000);
                var column = new CB.Column('Name', 'Email', true, false);
                try {
                                column.defaultValue = "test@cloudboost.io";
                                done();
                }
                catch (err) {
                                done(err)
                }
    });


    it("should not add an Invalid Default Email Value to a Cloumn",function(done){
                this.timeout(40000);
                var column = new CB.Column('Name', 'Email', true, false);
                try {
                                column.defaultValue = "Invalid Email";
                                done("Validation did not work");
                }
                catch (err) {
                                done();
                }
    });

    after(function() {
    	CB.appKey = CB.jsKey;
  	});


});
