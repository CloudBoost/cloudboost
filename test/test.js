
var SECURE_KEY = "1227d1c4-1385-4d5f-ae73-23e99f74b006";
var URL = "http://localhost:4730";

   var util = {
     makeString : function(){
	    var text = "x";
	    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

	    for( var i=0; i < 5; i++ )
	        text += possible.charAt(Math.floor(Math.random() * possible.length));

	    return 'x'+text;
	},	

	makeEmail : function(){
	    return this.makeString()+'@sample.com';
	}

   };

   

	

var window = window || null;
var request = require('request');
var CB = require('../sdk/dist/cloudboost');
var equal = require('deep-equal');
describe("Cloud App", function() {
    
    it("MongoDb,RedisDb & Elastic SearchDb Statuses..", function(done) {
        this.timeout(100000);
       
        var url = URL+'/status'; 
        var params = {};    
        params.url = URL;

        if(!window){
        	//Lets configure and request
			request({
			    url: url, //URL to hit
			    method: 'GET'			  
			}, function(error, response, body){

			    if(error || response.statusCode === 500 || response.statusCode === 400 || body === 'Error'){  
		          	done("Something went wrong..");
		        }else {  
		        	done();	          
			    }
			});

        } else{
        	$.ajax({ 
			    // The URL for the request
			    url: url,			
			    // Whether this is a POST or GET request
			    type: "GET",			   
			    // Code to run if the request succeeds;
			    // the response is passed to the function
			    success: function( resp ) {
			       done();
			    },			 
			    // Code to run if the request fails; the raw request and
			    // status codes are passed to the function
			    error: function( xhr, status, errorThrown ) {
			        done("Something went wrong..");
			    },
			 
			});
        }

    });

    it("Change the Server URL", function(done) {
        this.timeout(100000);
        var appId = util.makeString();
        var url = URL+'/server/url';
        var params = {};
        params.secureKey = SECURE_KEY;
        params.url = URL;

        if(!window){
        	//Lets configure and request
			request({
			    url: url, //URL to hit
			    method: 'POST',
			    headers: {
			        'Content-Type': 'application/json'
			    },
			    json: params //Set the body as a string
			}, function(error, response, body){
			    if(error) {
			        done(error);
			    } else {
			       done();
			    }
			});
        } else{
        	$.ajax({
 
			    // The URL for the request
			    url: url,
			    // The data to send (will be converted to a query string)
			    data: params,
			    // Whether this is a POST or GET request
			    type: "POST",
			    // The type of data we expect back
			    dataType : "json",
			    // Code to run if the request succeeds;
			    // the response is passed to the function
			    success: function( json ) {
			       done();
			    },
			 
			    // Code to run if the request fails; the raw request and
			    // status codes are passed to the function
			    error: function( xhr, status, errorThrown ) {
			        done("Error thrown.");
			    },
			 
			});
        }

    });


    it("should create the app and init the CloudApp.", function(done) {
        this.timeout(100000);
        var appId = util.makeString();
        var url = URL+'/app/'+appId;
        var params = {};
        params.secureKey = SECURE_KEY;
        if(!window){        	
        	//Lets configure and request
			request({
			    url: url, //URL to hit
			    method: 'POST',
			    headers: {
			        'Content-Type': 'application/json'
			    },
			    json: params //Set the body as a string
			}, function(error, response, json){
			    if(error) {
			        done(error);
			    } 
				else {
			       CB.CloudApp.init(URL, json.appId, json.keys.js);
			       CB.masterKey = json.keys.master;
			       CB.jsKey = json.keys.js;
			       done();
			    }
			});
       	} else{
	       $.ajax({
	 
			    // The URL for the request
			    url: url,
			 
			    // The data to send (will be converted to a query string)
			    data: params,
			 
			    // Whether this is a POST or GET request
			    type: "POST",
			 
			    // The type of data we expect back
			    dataType : "json",
			 
			    // Code to run if the request succeeds;
			    // the response is passed to the function
			    success: function( json ) {
			       CB.CloudApp.init(URL, json.appId, json.keys.js);
			       CB.masterKey = json.keys.master;
			       CB.jsKey = json.keys.js;
			       done();
			    },
			 
			    // Code to run if the request fails; the raw request and
			    // status codes are passed to the function
			    error: function( xhr, status, errorThrown ) {
			        done("Error thrown.");
			    },
			 
			});
		}

	 });


    it("should add a sample setting to an app.", function(done) {
        this.timeout(100000);
        var url = URL+'/settings/'+CB.appId+"/settings";
        var params = {};
        params.key = CB.masterKey;
        params.settings = {
        	"keykey" : "valuevalue"
        };
          if(!window){
        	//Lets configure and request
			request({
			    url: url, //URL to hit
			    method: 'PUT',
			    headers: {
			        'Content-Type': 'application/json'
			    },
			    json: params //Set the body as a string
			}, function(error, response, json){
			    if(error) {
			        done(error);
			    } else {
			      done();
			    }
			});
        }else{
	       $.ajax({
	 
			    // The URL for the request
			    url: url,
			    // The data to send (will be converted to a query string)
			    data: params,
			    // Whether this is a POST or GET request
			    type: "PUT",
			    // The type of data we expect back
			    dataType : "json",
			    // Code to run if the request succeeds;
			    // the response is passed to the function
			    success: function( json ) {			    			    	
			       if(json.category === "settings"){
			       	 done();
			       }else{
			       	 done("Wrong json.");
			       }
			    },
			    // Code to run if the request fails; the raw request and
			    // status codes are passed to the function
			    error: function( xhr, status, errorThrown ) {
			        done("Error thrown.");
			    },
			 
			});
		}
	 });


	it("should get sample setting to an app.", function(done) {
        this.timeout(100000);
        var url = URL+'/settings/'+CB.appId;
        var params = {};
        params.key = CB.masterKey;
        
        if(!window){
        	//Lets configure and request
			request({
			    url: url, //URL to hit
			    method: 'POST',
			    headers: {
			        'Content-Type': 'application/json'
			    },
			    json: params //Set the body as a string
			}, function(error, response, json){
			    if(error) {
			      done(error);
			    } else {
			      done();
			    }
			});
        }else{
	       $.ajax({
	 
			    // The URL for the request
			    url: url,
			 
			    // The data to send (will be converted to a query string)
			    data: params,
			 
			    // Whether this is a POST or GET request
			    type: "POST",
			 
			    // The type of data we expect back
			    dataType : "json",
			 
			    // Code to run if the request succeeds;
			    // the response is passed to the function
			    success: function( json ) {
			       if(json[0]._id){
			       	done();
			       }else{
			       	done("Success but Id not defined.");
			       }
			    },
			 
			    // Code to run if the request fails; the raw request and
			    // status codes are passed to the function
			    error: function( xhr, status, errorThrown ) {
			        done("Error thrown.");
			    }
			 
			});
		}
	});

	
});

describe("Should Create All Test Tables", function(done) {

    before(function() {
        this.timeout(10000);
        CB.appKey = CB.masterKey;
    });

    it("Should create a table", function(done) {
        this.timeout(50000);
        var Age = new CB.Column('Age');
        Age.dataType = 'Number';
        var Name = new CB.Column('Name');
        Name.dataType = 'Text';
        var IsCXO = new CB.Column('isCXO');
        IsCXO.dataType = 'Boolean';
        obj = new CB.CloudTable('Employee');
        obj.addColumn(IsCXO);
        obj.addColumn(Age);
        obj.addColumn(Name);
        var dob = new CB.Column('dob');
        dob.dataType = 'DateTime';
        obj.addColumn(dob);
        var password = new CB.Column('password');
        password.dataType = 'EncryptedText';
        obj.addColumn(password);
        obj.save().then(function(res) {
            //
            done();
        }, function(err) {
            throw "Unable to Create Table";
        });
    });

    it("should create an empty table", function(done) {

        this.timeout(50000);

        var obj = new CB.CloudTable('Empty');

        obj.save().then(function(res) {
            if (res.id) {
                done();
            } else
                done("Table saved but didnot return the id.");
            }
        , function(err) {
            throw "Unable to Create Table";
        });
    });

    it("should create a table with two underscore columns", function(done) {

        this.timeout(50000);

        obj = new CB.CloudTable('UnderScoreTable_a');

        var Age = new CB.Column('Age_a');
        Age.dataType = 'Text';

        obj.addColumn(Age);

        obj.save().then(function(obj) {

            var Age = new CB.Column('Age_b');
            Age.dataType = 'Text';

            obj.addColumn(Age);
            obj.save().then(function(obj) {
                done();
            }, function(err) {
                done("Cannot save two underscore columns.");
            });

        }, function(err) {
            throw "Unable to Create Table";
        });
    });

    it("should create a table", function(done) {

        this.timeout(50000);

        var obj = new CB.CloudTable('Company');
        var Revenue = new CB.Column('Revenue');
        Revenue.dataType = 'Number';
        var Name = new CB.Column('Name');
        Name.dataType = 'Text';
        var File = new CB.Column('File');
        File.dataType = 'File';
        obj.addColumn(Revenue);
        obj.addColumn(Name);
        obj.addColumn(File);
        obj.save().then(function(res) {
            //
            done();
        }, function() {
            throw "Unable to Create Table";
        });
    });

    it("should create a table", function(done) {

        this.timeout(50000);

        var obj = new CB.CloudTable('Address');
        var City = new CB.Column('City');
        City.dataType = 'Text';
        var PinCode = new CB.Column('PinCode');
        PinCode.dataType = 'Number';
        obj.addColumn(City);
        obj.addColumn(PinCode);
        obj.save().then(function(res) {
            //
            done();
        }, function() {
            throw "Unable to Create Table";
        });
    });

    it("Should update the table schema", function(done) {

        this.timeout(50000);

        var obj = new CB.CloudTable('Employee');
        CB.CloudTable.get(obj).then(function(res) {
            var Company = new CB.Column('Company');
            Company.dataType = 'Relation';
            Company.relatedTo = 'Company';
            res.addColumn(Company);
            var Address = new CB.Column('Address');
            Address.dataType = 'Relation';
            Address.relatedTo = 'Address';
            res.addColumn(Address);
            res.save().then(function(res) {
                //
                done();
            }, function(err) {
                throw "Unable to Update schema of the table";
            })
        }, function() {
            throw "Unable to get table";
        });
    });

    it("Should update the table schema", function(done) {

        this.timeout(50000);

        var obj = new CB.CloudTable('Company');
        CB.CloudTable.get(obj).then(function(res) {
            var Employee = new CB.Column('Employee');
            Employee.dataType = 'List';
            Employee.relatedTo = 'Employee';
            res.addColumn(Employee);
            var Address = new CB.Column('Address');
            Address.dataType = 'Relation';
            Address.relatedTo = 'Address';
            res.addColumn(Address);
            res.save().then(function(res) {
                //
                done();
            }, function(err) {
                throw "Unable to Update schema of the table";
            });
        }, function() {
            throw "Unable to get table";
        });
    });

    it("should create table student4", function(done) {

        this.timeout(50000);
        var student = new CB.CloudTable('student4');
        var subject = new CB.Column('subject');
        subject.dataType = 'List';
        subject.relatedTo = 'Text';
        var age = new CB.Column('age');
        age.dataType = 'Number';
        student.addColumn(subject);
        student.addColumn(age);
        student.save().then(function(res) {
            done();
        }, function() {
            throw "Unable to create Student";
        });
    });

    it("should create table Role", function(done) {

        this.timeout(50000);

        var role = new CB.CloudTable('Role');
        role.save().then(function(res) {
            done();
        }, function() {
            throw "Unable to create Role";
        });

    });

    it("should create table user", function(done) {

        this.timeout(50000);

        var user = new CB.CloudTable('User');

        var newColumn = new CB.Column('newColumn');
        newColumn.dataType = 'Text';
        user.addColumn(newColumn);

        user.save().then(function(user) {
            var newColumn1 = new CB.Column('newColumn1');
            newColumn1.dataType = 'Text';
            user.addColumn(newColumn1);

            user.save().then(function(res) {
                done();
            }, function(error) {
                throw "Unable to create user";
            });
        }, function(error) {
            throw "Unable to create user";
        });
    });

    it("should create table device", function(done) {

        this.timeout(50000);

        var device = new CB.CloudTable('Device');

        var newColumn = new CB.Column('newColumn');
        newColumn.dataType = 'Text';
        device.addColumn(newColumn);

        device.save().then(function(device) {
            var newColumn1 = new CB.Column('newColumn1');
            newColumn1.dataType = 'Text';
            device.addColumn(newColumn1);

            device.save().then(function(res) {
                done();
            }, function(error) {
                throw "Unable to create device";
            });
        }, function(error) {
            throw "Unable to create device";
        });
    });

    it("should create table Custom", function(done) {

        this.timeout(60000);

        var custom = new CB.CloudTable('Custom');
        var newColumn = new CB.Column('newColumn');
        newColumn.dataType = 'Email';
        custom.addColumn(newColumn);
        var newColumn1 = new CB.Column('newColumn1');
        newColumn1.dataType = 'Text';
        custom.addColumn(newColumn1);
        var newColumn2 = new CB.Column('newColumn2');
        newColumn2.dataType = 'URL';
        custom.addColumn(newColumn2);
        var newColumn3 = new CB.Column('newColumn3');
        newColumn3.dataType = 'Number';
        custom.addColumn(newColumn3);
        var newColumn4 = new CB.Column('newColumn4');
        newColumn4.dataType = 'Boolean';
        custom.addColumn(newColumn4);
        var newColumn5 = new CB.Column('newColumn5');
        newColumn5.dataType = 'DateTime';
        custom.addColumn(newColumn5);
        var newColumn6 = new CB.Column('newColumn6');
        newColumn6.dataType = 'Object';
        var newColumn7 = new CB.Column('location');
        newColumn7.dataType = 'GeoPoint';
        custom.addColumn(newColumn7);
        custom.addColumn(newColumn6);
        custom.save().then(function(res) {
            done();
        }, function() {
            throw "Unable to create user";
        });
    });

    it("should update custom table ", function(done) {

        this.timeout(60000);

        var custom = new CB.CloudTable('Custom');
        CB.CloudTable.get(custom).then(function(custom) {
            var newColumn7 = new CB.Column('newColumn7');
            newColumn7.dataType = 'List';
            newColumn7.relatedTo = 'Custom';
            custom.addColumn(newColumn7);
            custom.save().then(function(res) {
                done();
            }, function() {
                throw "Unable to create user";
            });
        }, function() {
            throw "Unable to get Table";
        });
    });

    it("should create table Custom5", function(done) {

        this.timeout(30000);

        var custom = new CB.CloudTable('Custom5');
        var newColumn = new CB.Column('location');
        newColumn.dataType = 'GeoPoint';
        custom.addColumn(newColumn);
        custom.save().then(function(res) {
            done();
        }, function(error) {
            throw "Unable to create Custom5";
        });
    });

    it("should create table Sample", function(done) {

        this.timeout(50000);

        var custom = new CB.CloudTable('Sample');
        var newColumn = new CB.Column('name');
        newColumn.dataType = 'Text';
        newColumn.required = true;
        custom.addColumn(newColumn);
        var newColumn1 = new CB.Column('unique');
        newColumn1.dataType = 'Text';
        newColumn1.unique = true;
        custom.addColumn(newColumn1);
        var newColumn2 = new CB.Column('stringArray');
        newColumn2.dataType = 'List';
        newColumn2.relatedTo = 'Text';
        custom.addColumn(newColumn2);
        var newColumn3 = new CB.Column('objectArray');
        newColumn3.dataType = 'List';
        newColumn3.relatedTo = 'Object';
        custom.addColumn(newColumn3);
        var newColumn6 = new CB.Column('file');
        newColumn6.dataType = 'File';
        custom.addColumn(newColumn6);
        var newColumn7 = new CB.Column('fileList');
        newColumn7.dataType = 'List';
        newColumn7.relatedTo = 'File';
        custom.addColumn(newColumn7);
        custom.save().then(function(res) {
            done();
        }, function() {
            throw "Unable to create Sample";
        });
    });

    it("should update Sample table ", function(done) {

        this.timeout(50000);

        var custom = new CB.CloudTable('Sample');
        CB.CloudTable.get(custom).then(function(custom) {
            var newColumn = new CB.Column('uniqueRelation');
            newColumn.dataType = 'Relation';
            newColumn.relatedTo = 'Sample';
            newColumn.unique = true;
            custom.addColumn(newColumn);
            var newColumn4 = new CB.Column('sameRelation');
            newColumn4.dataType = 'Relation';
            newColumn4.relatedTo = 'Sample';
            custom.addColumn(newColumn4);
            var newColumn5 = new CB.Column('relationArray');
            newColumn5.dataType = 'List';
            newColumn5.relatedTo = 'Sample';
            custom.addColumn(newColumn5);
            custom.save().then(function(res) {
                done();
            }, function() {
                throw "Unable to Update Sample";
            });
        }, function() {
            throw "Unable to get Table";
        });
    });

    it("should create table hostel", function(done) {

        this.timeout(50000);

        var custom = new CB.CloudTable('hostel');
        var newColumn = new CB.Column('room');
        newColumn.dataType = 'Number';
        custom.addColumn(newColumn);
        var newColumn1 = new CB.Column('name');
        newColumn1.dataType = 'Text';
        custom.addColumn(newColumn1);
        custom.save().then(function(res) {
            done();
        }, function() {
            throw "Unable to create hostel";
        });

    });

    //create Hostel
    it("should create table student1", function(done) {

        this.timeout(50000);

        var custom = new CB.CloudTable('student1');
        var newColumn = new CB.Column('age');
        newColumn.dataType = 'Number';
        custom.addColumn(newColumn);
        var newColumn2 = new CB.Column('newColumn');
        newColumn2.dataType = 'Relation';
        newColumn2.relatedTo = 'hostel';
        custom.addColumn(newColumn2);
        var newColumn3 = new CB.Column('name');
        newColumn3.dataType = 'Text';
        custom.addColumn(newColumn3);
        custom.save().then(function(res) {
            done();
        }, function() {
            throw "Unable to create Sample";
        });
    });

    it("should create table Student", function(done) {

        this.timeout(50000);

        var custom = new CB.CloudTable('Student');
        var newColumn = new CB.Column('name');
        newColumn.dataType = 'Text';
        custom.addColumn(newColumn);
        var newColumn1 = new CB.Column('age');
        newColumn1.dataType = 'Number';
        custom.addColumn(newColumn1);
        var newColumn2 = new CB.Column('class');
        newColumn2.dataType = 'Text';
        custom.addColumn(newColumn2);
        var newColumn3 = new CB.Column('description');
        newColumn3.dataType = 'Text';
        custom.addColumn(newColumn3);
        custom.save().then(function(res) {
            done();
        }, function() {
            throw "Unable to create Student";
        });

    });

    it("should create table Offline", function(done) {

        this.timeout(50000);

        var custom = new CB.CloudTable('Offline');
        var newColumn = new CB.Column('name');
        newColumn.dataType = 'Text';
        custom.addColumn(newColumn);
        var newColumn1 = new CB.Column('age');
        newColumn1.dataType = 'Number';
        custom.addColumn(newColumn1);
        var newColumn2 = new CB.Column('class');
        newColumn2.dataType = 'Text';
        custom.addColumn(newColumn2);
        var newColumn3 = new CB.Column('description');
        newColumn3.dataType = 'Text';
        custom.addColumn(newColumn3);
        custom.save().then(function(res) {
            done();
        }, function() {
            throw "Unable to create Student";
        });

    });

    it("should create table Custom18", function(done) {

        this.timeout(50000);

        var custom = new CB.CloudTable('Custom18');
        var newColumn = new CB.Column('number');
        newColumn.dataType = 'Number';
        custom.addColumn(newColumn);
        custom.save().then(function(res) {
            done();
        }, function() {
            throw "Unable to create Custom18";
        });

    });

    it("should create table Custom3", function(done) {

        this.timeout(50000);

        var custom = new CB.CloudTable('Custom3');
        var newColumn = new CB.Column('address');
        newColumn.dataType = 'Text';
        custom.addColumn(newColumn);
        custom.save().then(function(res) {
            done();
        }, function() {
            throw "Unable to create Custom3";
        });
    });

    it("should create table Custom7", function(done) {

        this.timeout(50000);

        var custom = new CB.CloudTable('Custom7');
        var newColumn = new CB.Column('requiredNumber');
        newColumn.dataType = 'Number';
        custom.addColumn(newColumn);
        custom.save().then(function(res) {
            done();
        }, function() {
            throw "Unable to create Custom7";
        });
    });

    it("should create table Custom2", function(done) {

        this.timeout(50000);

        var custom = new CB.CloudTable('Custom2');
        var newColumn = new CB.Column('newColumn1');
        newColumn.dataType = 'Text';
        custom.addColumn(newColumn);
        var newColumn1 = new CB.Column('newColumn7');
        newColumn1.dataType = 'Relation';
        newColumn1.relatedTo = 'student1';
        custom.addColumn(newColumn1);
        var newColumn2 = new CB.Column('newColumn2');
        newColumn2.dataType = 'Relation';
        newColumn2.relatedTo = 'Custom3';
        custom.addColumn(newColumn2);
        custom.save().then(function(res) {
            done();
        }, function() {
            throw "Unable to create Custom2";
        });
    });

    it("should create table Custom4", function(done) {

        this.timeout(50000);

        var custom = new CB.CloudTable('Custom4');
        var newColumn = new CB.Column('newColumn1');
        newColumn.dataType = 'Text';
        custom.addColumn(newColumn);
        var newColumn1 = new CB.Column('newColumn7');
        newColumn1.dataType = 'List';
        newColumn1.relatedTo = 'student1';
        custom.addColumn(newColumn1);
        custom.save().then(function(res) {
            done();
        }, function() {
            throw "Unable to create Custom4";
        });

    });

    it("should create table Custom14", function(done) {

        this.timeout(50000);

        var custom = new CB.CloudTable('Custom14');
        var newColumn = new CB.Column('ListNumber');
        newColumn.dataType = 'List';
        newColumn.relatedTo = 'Number';
        custom.addColumn(newColumn);
        var newColumn1 = new CB.Column('ListGeoPoint');
        newColumn1.dataType = 'List';
        newColumn1.relatedTo = 'GeoPoint';
        custom.addColumn(newColumn1);
        custom.save().then(function(res) {
            done();
        }, function() {
            throw "Unable to create Custom14";
        });

    });

    it("should create table Custom1", function(done) {

        this.timeout(50000);

        var custom = new CB.CloudTable('Custom1');
        var newColumn = new CB.Column('description');
        newColumn.dataType = 'Text';
        custom.addColumn(newColumn);
        var newColumn1 = new CB.Column('newColumn');
        newColumn1.dataType = 'Text';
        custom.addColumn(newColumn1);
        var newColumn2 = new CB.Column('newColumn1');
        newColumn2.dataType = 'Boolean';
        custom.addColumn(newColumn2);

        custom.save().then(function(res) {
            done();
        }, function() {
            throw "Unable to create Custom1";
        });

    });

    it("should create table and delete table", function(done) {

        this.timeout(50000);

        var custom = new CB.CloudTable('CustomDelete');

        var newColumn = new CB.Column('description');
        newColumn.dataType = 'Text';
        custom.addColumn(newColumn);

        var newColumn1 = new CB.Column('newColumn');
        newColumn1.dataType = 'Text';
        custom.addColumn(newColumn1);

        var newColumn2 = new CB.Column('newColumn1');
        newColumn2.dataType = 'Boolean';
        custom.addColumn(newColumn2);

        custom.save().then(function(res) {

            res.delete().then(function(delRes) {
                done();
            }, function(err) {
                done(err);
                throw "Unable to delete a table.";
            });

        }, function() {
            throw "Unable to delete a table.";
        });

    });
    it("should create tables", function(done) {

        this.timeout(50000);

        var custom = new CB.CloudTable('CustomDelete');

        var newColumn = new CB.Column('name');
        newColumn.dataType = 'Text';
        custom.addColumn(newColumn);

        var newColumn1 = new CB.Column('age');
        newColumn1.dataType = 'Number';
        custom.addColumn(newColumn1);

        custom.save().then(function(res) {

            res.delete().then(function(delRes) {
                done();
            }, function(err) {
                done(err);
                throw "Unable to delete a table.";
            });

        }, function() {
            throw "Unable to delete a table.";
        });

    });

    after(function() {
        CB.appKey = CB.jsKey;
    });

});


describe("Export & Import Table", function () {

    var savedObject = [];

    before(function () {
        this.timeout(10000);
        CB.appKey = CB.masterKey;
    });

    it("should create a table", function (done) {

        this.timeout(50000);

        var obj = new CB.CloudTable('Hospital');
        var Revenue = new CB.Column('Revenue');
        Revenue.dataType = 'Number';
        var Name = new CB.Column('Name');
        Name.dataType = 'Text';
        obj.addColumn(Revenue);
        obj.addColumn(Name);
        obj.save().then(function (res) {
            done();
        }, function (err) {
            throw err
        });
    });

    it("should add data to table", function (done) {

        this.timeout(50000);
        var obj = new CB.CloudObject('Hospital');
        obj.set('Revenue', 1234);
        obj.set('Name', 'kashish');
        obj.save({
            success: function (obj) {
                savedObject.push(obj.document)
                done();
            }, error: function (error) {
                done(error);
            }
        });
    });

    it("should add data to table", function (done) {

        this.timeout(50000);
        var obj = new CB.CloudObject('Hospital');
        obj.set('Revenue', 3453);
        obj.set('Name', 'kash');
        obj.save({
            success: function (obj) {
                savedObject.push(obj.document)
                done();
            }, error: function (error) {
                done(error);
            }
        });
    });

    it("Export JSON Table and Import JSON Table", function (done) {
        this.timeout(50000);
        var url = CB.apiUrl + "/export/" + CB.appId + "/Hospital";
        var exportParams = { exportType: "json", key: CB.appKey };
        if (!window) {
            CB._request('POST', url, exportParams).then(function (data) {

                data = JSON.parse(data);
                if (data.length !== savedObject.length) {
                    return done('ERROR')
                }
                var flag = false;
                for (let i in savedObject) {
                    delete savedObject[i].ACL;
                    delete savedObject[i]._type;
                    delete savedObject[i].expires;
                    delete savedObject[i]._id;
                    delete savedObject[i].createdAt;
                    delete savedObject[i].updatedAt;
                    delete savedObject[i]._version;
                    delete savedObject[i]._tableName;
                    delete data[i].ACL;
                    if (equal(data[i], savedObject[i])) {
                        flag = true;
                    }
                    if (!flag) {
                        done('ERROR');
                        break;
                    }
                }
                if (flag) {
                    var name = 'abc.json';
                    var type = 'application/json';
                    var importData = data;
                    var obj = new CB.CloudTable('abc');
                    obj.save().then(function (res) {
                        var fileObj = new CB.CloudFile(name, JSON.stringify(importData), type);
                        fileObj.save().then(function (file) {
                            if (file.url) {
                                var params = {};
                                params["key"] = CB.appKey;
                                params["fileId"] = file.document._id;
                                params["fileName"] = file.document.name;
                                params["tableName"] = "abc";
                                var url = URL + "/import/" + CB.appId;

                                CB._request('POST', url, params, false, true, null).then(function (response) {
                                    response = JSON.parse(response);
                                    var flag = false;
                                    response.map(function (ele) {
                                        if (typeof ele["Revenue"] == "number" && typeof ele["Name"] == "string") {
                                            flag = true;
                                        } else {
                                            done("Type mismatch")
                                        }
                                    });
                                    if (flag == true) {
                                        file.delete().then(function (file) {
                                            if (file.url === null)
                                                done();
                                            else
                                                throw "file delete error"
                                        }, function (err) {
                                            done(err);
                                            throw "unable to delete file";
                                        });
                                    }
                                }, function (error) {
                                    done(error);
                                    throw error;
                                });
                            } else {
                                throw 'únable to get the url';
                            }
                        }, function (err) {
                            done(err);
                            throw "Unable to save file";
                        });
                    }, function (err) {
                        throw err
                    });
                }
            }, function (err) {
                done(err)
            });
        } else {
            $.ajax({
                url: url,
                type: "POST",
                data: exportParams,
                success: function (resp) {
                    try {
                        var data = resp
                        if (data.length !== savedObject.length) {
                            return done('ERROR')
                        }
                        var flag = false;
                        for (let i in savedObject) {
                            delete savedObject[i].ACL;
                            delete savedObject[i]._type;
                            delete savedObject[i].expires;
                            delete savedObject[i]._id;
                            delete savedObject[i].createdAt;
                            delete savedObject[i].updatedAt;
                            delete savedObject[i]._version;
                            delete savedObject[i]._tableName;
                            delete data[i].ACL;
                            if (data[i]._id === savedObject[i]._id) {
                                flag = true;
                            }
                            if (!flag) {
                                done('ERROR');
                                break;
                            }
                        }
                        if (flag) {
                            var name = 'abc.json';
                            var type = 'application/json';
                            var importData = data;
                            var obj = new CB.CloudTable('abc');
                            obj.save().then(function (res) {
                                var fileObj = new CB.CloudFile(name, JSON.stringify(importData), type);
                                fileObj.save().then(function (file) {
                                    if (file.url) {
                                        var params = {};
                                        params["key"] = CB.appKey;
                                        params["fileId"] = file.document._id;
                                        params["fileName"] = file.document.name;
                                        params["tableName"] = "abc";
                                        var url = URL + "/import/" + CB.appId;

                                        $.ajax({
                                            url: url,
                                            data: params,
                                            type: "POST",
                                            success: function (data) {
                                                var flag = false;
                                                data.map(function (ele) {
                                                    if (typeof ele["Revenue"] == "number" && typeof ele["Name"] == "string") {
                                                        flag = true;
                                                    } else {
                                                        done("Type mismatch")
                                                    }
                                                });
                                                if (flag == true) {
                                                    file.delete().then(function (file) {
                                                        if (file.url === null)
                                                            done();
                                                        else
                                                            throw "file delete error"
                                                    }, function (err) {
                                                        done(err);
                                                        throw "unable to delete file";
                                                    });
                                                }
                                            },
                                            error: function (xhr, status, errorThrown) {
                                                done("Error thrown.");
                                            },
                                        });
                                    } else {
                                        throw 'únable to get the url';
                                    }
                                }, function (err) {
                                    done(err);
                                    throw "Unable to save file";
                                });
                            }, function (err) {
                                throw err
                            });
                        }
                    } catch (e) {
                        
                        done(e);
                    }
                },
                error: function (xhr, status, errorThrown) {
                    done("Something went wrong..");
                },

            });
        }

    });

    it("Export CSV Table and Import CSV Table", function (done) {
        this.timeout(50000);
        var url = CB.apiUrl + "/export/" + CB.appId + "/Hospital";
        var exportParams = { exportType: "csv", key: CB.appKey };
        if (!window) {
            var Buffer = require('buffer/').Buffer;
            CB._request('POST', url, exportParams).then(function (exportData) {
                var exportData = exportData.replace(/\\"/g, '"');
                var exportData = exportData.replace(/""/g, "'");
                var exportData = exportData.replace(/,,/g, ',"",');
                var importData = exportData.substring(0, exportData.length - 1);
                importData = importData.replace("'", '"');
                importData = importData + '"';
                var csvStrings = importData.split("\\n");
                var importString = "";
                for (var i = 0; i < csvStrings.length; i++) {
                    importString += csvStrings[i] + "\n";
                }
                var importCSV = Buffer.from(importString, 'utf8');
                var name = 'abc.csv';
                var type = 'text/csv';
                var obj = new CB.CloudTable('abc2');
                obj.save().then(function (res) {
                    var fileObj = new CB.CloudFile(name, importCSV.toString('utf-8'), type);
                    fileObj.save().then(function (file) {
                        if (file.url) {
                            var params = {};
                            params["key"] = CB.appKey;
                            params["fileId"] = file.document._id;
                            params["fileName"] = file.document.name;
                            params["tableName"] = "abc2";
                            var url = URL + "/import/" + CB.appId;
                            CB._request('POST', url, params, false, true, null).then(function (response) {
                                response = JSON.parse(response);
                                var flag = false;
                                response.map(function (ele) {
                                    if (typeof ele["Revenue"] == "number" && typeof ele["Name"] == "string") {
                                        flag = true;
                                    } else {
                                        done("Type mismatch")
                                    }
                                });
                                if (flag == true) {
                                    file.delete().then(function (file) {
                                        if (file.url === null)
                                            done();
                                        else
                                            throw "file delete error"
                                    }, function (err) {
                                        done(err);
                                        throw "unable to delete file";
                                    });
                                }
                            }, function (error) {
                                done(error);
                                throw error;
                            });
                        } else {
                            throw 'únable to get the url';
                        }
                    }, function (err) {
                        done(err);
                        throw "Unable to save file";
                    });
                }, function (err) {
                    throw err
                });
            }, function (err) {
                done(err)
            });
        } else {
            $.ajax({
                url: url,
                type: "POST",
                data: exportParams,
                success: function (exportData) {
                    try {
                        var exportData = exportData.replace(/\\"/g, '"');
                        var exportData = exportData.replace(/""/g, "'");
                        var exportData = exportData.replace(/,,/g, ',"",');
                        var importData = exportData.substring(0, exportData.length - 1);
                        importData = importData.replace("'", '"');
                        importData = importData + '"';
                        var name = 'abc.csv';
                        var type = 'text/csv';
                        var obj = new CB.CloudTable('abc2');
                        obj.save().then(function (res) {
                            var fileObj = new CB.CloudFile(new Blob([importData], { type: "text/csv" }));
                            fileObj.set('name',name);
                            fileObj.save().then(function (file) {
                                if (file.url) {
                                    var params = {};
                                    params["key"] = CB.appKey;
                                    params["fileId"] = file.document._id;
                                    params["fileName"] = file.document.name;
                                    params["tableName"] = "abc2";
                                    var url = URL + "/import/" + CB.appId;
                                    CB._request('POST', url, params, false, true, null).then(function (response) {
                                        response = JSON.parse(response);
                                        var flag = false;
                                        response.map(function (ele) {
                                            if (typeof ele["Revenue"] == "number" && typeof ele["Name"] == "string") {
                                                flag = true;
                                            } else {
                                                done("Type mismatch")
                                            }
                                        });
                                        if (flag == true) {
                                            file.delete().then(function (file) {
                                                if (file.url === null)
                                                    done();
                                                else
                                                    throw "file delete error"
                                            }, function (err) {
                                                done(err);
                                                throw "unable to delete file";
                                            });
                                        }
                                    }, function (error) {
                                        done(error);
                                        throw error;
                                    });
                                } else {
                                    throw 'únable to get the url';
                                }
                            }, function (err) {
                                
                                done(err);
                                throw "Unable to save file";
                            });
                        }, function (err) {
                            throw err
                        });
                    } catch (e) {
                        
                        done(e);
                    }
                },
                error: function (xhr, status, errorThrown) {
                    done("Something went wrong..");
                },

            });
        }
    });
});

describe("Cloud Files", function(done) {

    it("Should Save a file with file data and name", function(done) {

        this.timeout(30000);

        var data = 'akldaskdhklahdasldhd';
        var name = 'abc.txt';
        var type = 'txt';
        var fileObj = new CB.CloudFile(name, data, type);
        fileObj.save().then(function(file) {
            //
            if (file.url) {

                if (!window) {
                    //Lets configure and request
                    request({
                        url: file.url, //URL to hit
                        method: 'GET'
                    }, function(error, response, body) {
                        if (error) {
                            done(error);
                        } else {
                            done();
                        }
                    });
                } else {
                    $.ajax({
                        // The URL for the request
                        url: file.url,
                        // Whether this is a POST or GET request
                        type: "GET",
                        // Code to run if the request succeeds;
                        // the response is passed to the function
                        success: function(text) {
                            done();
                        },
                        // Code to run if the request fails; the raw request and
                        // status codes are passed to the function
                        error: function(xhr, status, errorThrown) {
                            done(errorThrown);
                            done("Error thrown.");
                        }
                    });
                }
            } else {
                throw 'únable to get the url';
            }
        }, function(err) {
            done(err);
            throw "Unable to save file";
        });
    });

    it("Should rename a file", function(done) {

        this.timeout(30000);

        var data = 'akldaskdhklahdasldhd';
        var name = 'abc.txt';
        var type = 'txt';
        var fileObj = new CB.CloudFile(name, data, type);
        fileObj.save().then(function(file) {
            if (file.url) {

                if (!window) {
                    //Lets configure and request
                    request({
                        url: file.url, //URL to hit
                        method: 'GET'
                    }, function(error, response, body) {
                        if (error) {
                            done(error);
                        } else {
                            file.set('name', 'haha.txt');
                            file.save().then(function(f) {
                                if (f.name == 'haha.txt')
                                    done();
                                else {
                                    done('Rename failed.');
                                }
                            }, function(err) {
                                done(err);
                            })
                        }
                    });
                } else {
                    $.ajax({
                        // The URL for the request
                        url: file.url,
                        // Whether this is a POST or GET request
                        type: "GET",
                        // Code to run if the request succeeds;
                        // the response is passed to the function
                        success: function(text) {
                            file.set('name', 'haha.txt');
                            file.save().then(function(f) {
                                if (f.name == 'haha.txt')
                                    done();
                                else {
                                    done('Rename failed.');
                                }
                            }, function(err) {
                                done(err);
                            })

                        },
                        // Code to run if the request fails; the raw request and
                        // status codes are passed to the function
                        error: function(xhr, status, errorThrown) {
                            done(errorThrown);
                            done("Error thrown.");
                        }
                    });
                }
            } else {
                throw 'únable to get the url';
            }
        }, function(err) {
            done(err);
            throw "Unable to save file";
        });
    });

    it("Should return the file with CloudObject", function(done) {

        this.timeout(30000);

        var data = 'akldaskdhklahdasldhd';
        var name = 'abc.txt';
        var type = 'txt';
        var fileObj = new CB.CloudFile(name, data, type);
        fileObj.save().then(function(file) {
            if (file.url) {

                var obj = new CB.CloudObject('Company');
                obj.set('File', file);
                obj.save({
                    success: function(obj) {
                        if (obj.get('File').url) {
                            done();
                        } else {
                            done("Did not get the file object back.");
                        }
                    },
                    error: function(error) {
                        done(error);
                    }
                });

            } else {
                done('ún able to get the url');
            }
        }, function(err) {
            done(err);
        });
    });

    it("Should count progress bar", function(done) {

        this.timeout(30000);

        if (CB._isNode) {
            done();
        } else {
            var data = 'akldaskdhklahdasldhd';
            var name = 'abc.txt';
            var type = 'txt';
            var fileObj = new CB.CloudFile(name, data, type);
            fileObj.save({
                uploadProgress: function(progress) {
                    done();
                },
                success: function() {},
                error: function() {}
            });
        }
    });

    it("Should return the fileList with CloudObject", function(done) {

        this.timeout(34000);

        var data = 'akldaskdhklahdasldhd';
        var name = 'abc.txt';
        var type = 'txt';
        var fileObj = new CB.CloudFile(name, data, type);

        var promises = [];
        promises.push(fileObj.save());

        var data = 'DFSAF';
        var name = 'aDSbc.txt';
        var type = 'txt';
        var fileObj2 = new CB.CloudFile(name, data, type);

        promises.push(fileObj2.save());

        CB.Promise.all(promises).then(function(files) {
            if (files.length > 0) {
                var obj = new CB.CloudObject('Sample');
                obj.set('name', 'sample');
                obj.set('fileList', files);
                obj.save({
                    success: function(obj) {
                        if (obj.get('fileList').length > 0) {
                            if (obj.get('fileList')[0].url && obj.get('fileList')[1].url) {
                                done();
                            } else {
                                done("Did not get the URL's back");
                            }
                        } else {
                            done("Didnot get the file object back.");
                        }
                    },
                    error: function(error) {
                        done(error);
                    }
                });

            } else {
                throw 'ún able to get the url';
            }
        }, function(error) {
            done(error);
        });
    });

    it("Should return the fileList with findById", function(done) {

        this.timeout(35000);

        var data = 'akldaskdhklahdasldhd';
        var name = 'abc.txt';
        var type = 'txt';
        var fileObj = new CB.CloudFile(name, data, type);

        var promises = [];
        promises.push(fileObj.save());

        var data = 'DFSAF';
        var name = 'aDSbc.txt';
        var type = 'txt';
        var fileObj2 = new CB.CloudFile(name, data, type);

        promises.push(fileObj2.save());

        CB.Promise.all(promises).then(function(files) {
            if (files.length > 0) {
                var obj = new CB.CloudObject('Sample');
                obj.set('name', 'sample');
                obj.set('fileList', files);
                obj.save({
                    success: function(obj) {
                        var query = new CB.CloudQuery("Sample");
                        query.include('fileList');

                        setTimeout(function() {

                            query.findById(obj.id, {
                                success: function(newObj) {
                                    if (newObj.get('fileList').length > 0) {
                                        if (newObj.get('fileList')[0].url && newObj.get('fileList')[1].url) {
                                            done();
                                        } else {
                                            done("Did not get the URL's back");
                                        }
                                    } else {
                                        done("Didnot get the file object back.");
                                    }
                                },
                                error: function(error) {
                                    done(error);
                                }
                            });

                        }, 4000);

                    },
                    error: function(error) {
                        done(error);
                    }
                });

            } else {
                throw 'ún able to get the url';
            }
        }, function(error) {
            done(error);
        });
    });

    it("Should Save a file and give the url", function(done) {

        this.timeout(30000);

        var data = 'akldaskdhklahdasldhd';
        var name = 'abc.txt';
        var type = 'txt';
        var fileObj = new CB.CloudFile(name, data, type);
        fileObj.save().then(function(file) {
            if (file.url) {
                if (!window) {
                    //Lets configure and request
                    request({
                        url: file.url, //URL to hit
                        method: 'GET'
                    }, function(error, response, body) {
                        if (error) {
                            done(error);
                        } else {
                            done();
                        }
                    });
                } else {
                    $.ajax({
                        // The URL for the request
                        url: file.url,
                        // Whether this is a POST or GET request
                        type: "GET",
                        // Code to run if the request succeeds;
                        // the response is passed to the function
                        success: function(text) {
                            done();
                        },
                        // Code to run if the request fails; the raw request and
                        // status codes are passed to the function
                        error: function(xhr, status, errorThrown) {
                            done(errorThrown);
                            done("Error thrown.");
                        }
                    });
                }
            } else {
                throw 'ún able to get the url';
            }
        }, function(err) {
            throw "Unable to save file";
        });
    });

    it("Should delete a file with file data and name", function(done) {

        this.timeout(30000);

        var data = 'akldaskdhklahdasldhd';
        var name = 'abc.txt';
        var type = 'txt';
        var fileObj = new CB.CloudFile(name, data, type);
        fileObj.save().then(function(file) {
            if (file.url) {
                file.delete().then(function(file) {
                    if (file.url === null)
                        done();
                    else
                        throw "file delete error"
                }, function(err) {
                    throw "unable to delete file";
                });
            } else {
                throw 'unable to get the url';
            }
        }, function(err) {
            throw "Unable to save file";
        });
    });

    try {

        if (window) {

            //Check Blob availability..
            var blobAvail = true;
            try {
                new Blob(['<a id="a"><b id="b">hey!</b></a>'], {type: "text/html"});
                blobAvail = true;
            } catch (e) {
                blobAvail = false;
            }

            it("should save a new file", function(done) {

                this.timeout(30000);

                if (blobAvail) {
                    var aFileParts = ['<a id="a"><b id="b">hey!</b></a>'];
                    try {
                        var oMyBlob = new Blob(aFileParts, {type: "text/html"});
                    } catch (e) {
                        var builder = new WebKitBlobBuilder();
                        builder.append(aFileParts);
                        var oMyBlob = builder.getBlob();

                    }
                    var file = new CB.CloudFile(oMyBlob);

                    file.save().then(function(file) {
                        if (file.url) {
                            if (!window) {
                                //Lets configure and request
                                request({
                                    url: file.url, //URL to hit
                                    method: 'GET'
                                }, function(error, response, body) {
                                    if (error) {
                                        done(error);
                                    } else {
                                        done();
                                    }
                                });
                            } else {
                                $.ajax({
                                    // The URL for the request
                                    url: file.url,
                                    // Whether this is a POST or GET request
                                    type: "GET",
                                    // Code to run if the request succeeds;
                                    // the response is passed to the function
                                    success: function(text) {
                                        done();
                                    },
                                    // Code to run if the request fails; the raw request and
                                    // status codes are passed to the function
                                    error: function(xhr, status, errorThrown) {
                                        done(errorThrown);
                                        done("Error thrown.");
                                    }
                                });
                            }
                        } else {
                            throw "Upload success. But cannot find the URL.";
                        }
                    }, function(err) {
                        done(err);
                        throw "Error uploading file";
                    });
                } else {
                    done();
                }

            });

            it("should delete a file", function(done) {

                this.timeout(30000);

                if (blobAvail) {
                    var aFileParts = ['<a id="a"><b id="b">hey!</b></a>'];
                    try {
                        var oMyBlob = new Blob(aFileParts, {type: "text/html"});
                    } catch (e) {
                        var builder = new WebKitBlobBuilder();
                        builder.append(aFileParts);
                        var oMyBlob = builder.getBlob();
                    }
                    var file = new CB.CloudFile(oMyBlob);

                    file.save().then(function(file) {
                        if (file.url) {

                            file.delete().then(function(file) {
                                if (file.url === null) {
                                    done();
                                } else {
                                    throw "File deleted, url in SDK not deleted";
                                }
                            }, function(err) {
                                throw "Error deleting file";
                            })
                        } else {
                            throw "Upload success. But cannot find the URL.";
                        }
                    }, function(err) {
                        throw "Error uploading file";
                    });
                } else {
                    done();
                }
            });

            it("should save a new file", function(done) {

                this.timeout(30000);

                if (blobAvail) {
                    var aFileParts = ['<a id="a"><b id="b">hey!</b></a>'];
                    try {
                        var oMyBlob = new Blob(aFileParts, {type: "text/html"});
                    } catch (e) {
                        var builder = new WebKitBlobBuilder();
                        builder.append(aFileParts);
                        var oMyBlob = builder.getBlob();
                    }
                    var file = new CB.CloudFile(oMyBlob);
                    var file1 = new CB.CloudFile(oMyBlob);

                    var obj = new CB.CloudObject('Sample');
                    obj.set('fileList', [file, file1]);
                    obj.set('name', 'abcd');
                    obj.save().then(function(file) {
                        if (file.get('fileList')[0].get('id') && file.get('fileList')[1].get('id')) {
                            done();
                        } else {
                            throw "Upload success. But cannot find the URL.";
                        }
                    }, function(err) {
                        done(err);
                        throw "Error uploading file";
                    });
                } else {
                    done();
                }

            });
        }
    } catch (e) {
        
    }

    it("Should Save a file file data and name then fetch it", function(done) {

        this.timeout(30000);

        var data = 'akldaskdhklahdasldhd';
        var name = 'abc.txt';
        var type = 'txt';
        var fileObj = new CB.CloudFile(name, data, type);
        fileObj.save().then(function(file) {
            //
            if (file.url) {
                file.fetch().then(function(res) {
                    res.getFileContent().then(function(res) {
                        done();
                    }, function(err) {
                        done(err);
                    });
                }, function(err) {
                    done(err);
                });
            } else {
                done('únable to get the url');
            }
        }, function(err) {
            done(err);
        });
    });

    it("Include Over File", function(done) {

        this.timeout(30000);

        var data = 'akldaskdhklahdasldhd';
        var name = 'abc.txt';
        var type = 'txt';
        var fileObj = new CB.CloudFile(name, data, type);
        var obj = new CB.CloudObject('Sample');
        obj.set('file', fileObj);
        obj.set('name', 'abcd');
        obj.save().then(function(res) {
            //
            var id = res.get('id');
            var query = new CB.CloudQuery('Sample');
            query.equalTo('id', id);
            query.include('file');
            query.find().then(function(res) {
                done();
            }, function() {
                throw "Unable to Find";
            });
        }, function(err) {
            throw "unable to save object";
        });
    });

    it("Should Save a file file data and name then fetch it", function(done) {

        this.timeout(30000);

        var data = 'akldaskdhklahdasldhd';
        var name = 'abc.txt';
        var type = 'txt';
        var fileObj = new CB.CloudFile(name, data, type);
        var obj = new CB.CloudObject('Sample');
        obj.set('file', fileObj);
        obj.set('name', 'abcd');
        obj.save().then(function(res) {

            var file = res.get('file');
            file.fetch().then(function(res) {
                if (res.get('url')) {
                    done();
                } else {
                    done("No Url found..");
                }

            }, function(err) {
                done(err);
            });
        }, function(err) {
            done(err);
        });
    });

    it("should save a file and get from a relation", function(done) {

        this.timeout(300000);

        var obj1 = new CB.CloudObject('Employee');
        var obj2 = new CB.CloudObject('Company');
        obj1.set('Name', 'abcd');
        obj2.set('Name', 'pqrs');
        var data = 'akldaskdhklahdasldhd';
        var name = 'abc.txt';
        var type = 'txt';
        var fileObj = new CB.CloudFile(name, data, type);
        fileObj.save().then(function(res) {
            obj2.set('File', res);
            obj1.set('Company', obj2);
            obj1.save().then(function(res) {
                var query = new CB.CloudQuery('Employee');
                query.include('Company.File');
                query.equalTo('id', res.get('id'));
                query.find().then(function(res) {
                    // 
                    done();
                }, function(err) {
                    done(err);
                });
            }, function(err) {
                done(err);
            });
        }, function(err) {
            done(err);
        });
    });

    // it("Should get the image",function(done){

    //     this.timeout(20000);
    //     var url = "http://localhost:4730/file/sample123/youthempowerment.jpg";
    //     var xhttp = new XMLHttpRequest();
    //     xhttp.onreadystatechange = getImage;
    //     xhttp.open('GET', url, true);
    //     xhttp.onload = function(e){
    //         if(xhttp.readyState === 4){
    //             if(xhttp.status === 200){
    //                 done();
    //             }else{
    //                 throw "Failed to get the image";
    //             }
    //         };
    //         xhttp.onerror = function(e){
    //             throw "Error"
    //         }

    //     };

    //     function getImage(){
    //         
    //     }

    //     xhttp.send(null);

    // });

    // it("Should resize the image",function(done){

    //     this.timeout(20000);
    //     var url = "http://localhost:4730/file/sample123/youthempowerment.jpg?resizeWidth=100&resizeHeight=100";
    //     var xhttp = new XMLHttpRequest();
    //     xhttp.onreadystatechange = resizeImage;
    //     xhttp.open('GET', url, true);
    //     xhttp.onload = function(e){
    //         if(xhttp.readyState === 4){
    //             if(xhttp.status === 200){
    //                 done();
    //             }else{
    //                 throw "Failed to resize the image";
    //             }
    //         };
    //         xhttp.onerror = function(e){
    //             throw "Error"
    //         }

    //     };
    //       function resizeImage(){
    //         
    //       }
    //     xhttp.send(null);

    //     });
    // it("Should crop the image",function(done){

    //     this.timeout(30000);
    //     var url = "http://localhost:4730/file/sample123/youthempowerment.jpg?cropX=50&cropY=50&cropW=50&cropH=50";
    //     var xhttp = new XMLHttpRequest();
    //     xhttp.open('GET', url, true);
    //     xhttp.onload = function(e){
    //         if(xhttp.readyState === 4){
    //             if(xhttp.status === 200){
    //                 done();
    //             }else{
    //                 throw "Failed to crop the image";
    //             }
    //         };
    //         xhttp.onerror = function(e){
    //             throw "Error"
    //         }

    //     };

    //     xhttp.send(null);

    //     });

    // it("Should change the quality of the image",function(done){

    //     this.timeout(30000);
    //     var url = "http://localhost:4730/file/sample123/youthempowerment.jpg?quality=2";
    //     var xhttp = new XMLHttpRequest();
    //     xhttp.open('GET', url, true);
    //     xhttp.onload = function(e){
    //         if(xhttp.readyState === 4){
    //             if(xhttp.status === 200){
    //                 done();
    //             }else{
    //                 throw "Failed to change the quality of the image";
    //             }
    //         };
    //         xhttp.onerror = function(e){
    //             throw "Error"
    //         }

    //     };

    //     xhttp.send(null);

    //     });

    // it("Should change the opacity of the image",function(done){

    //     this.timeout(30000);
    //     var url = "http://localhost:4730/file/sample123/youthempowerment.jpg?opacity=0.4";
    //     var xhttp = new XMLHttpRequest();
    //     xhttp.open('GET', url, true);
    //     xhttp.onload = function(e){
    //         if(xhttp.readyState === 4){
    //             if(xhttp.status === 200){
    //                 done();
    //             }else{
    //                 throw "Failed to change the opacity of the image";
    //             }
    //         };
    //         xhttp.onerror = function(e){
    //             throw "Error"
    //         }

    //     };

    //     xhttp.send(null);

    //     });

    // it("Should scale the image",function(done){

    //     this.timeout(30000);
    //     var url = "http://localhost:4730/file/sample123/youthempowerment.jpg?scale=2";
    //     var xhttp = new XMLHttpRequest();
    //     xhttp.open('GET', url, true);
    //     xhttp.onload = function(e){
    //         if(xhttp.readyState === 4){
    //             if(xhttp.status === 200){
    //                 done();
    //             }else{
    //                 throw "Failed to scale the image";
    //             }
    //         };
    //         xhttp.onerror = function(e){
    //             throw "Error"
    //         }

    //     };

    //     xhttp.send(null);

    //     });
    // it("Should contain the image",function(done){

    //     this.timeout(30000);
    //     var url = "http://localhost:4730/file/sample123/youthempowerment.jpg?containWidth=100&containHeight=100";
    //     var xhttp = new XMLHttpRequest();
    //     xhttp.open('GET', url, true);
    //     xhttp.onload = function(e){
    //         if(xhttp.readyState === 4){
    //             if(xhttp.status === 200){
    //                 done();
    //             }else{
    //                 throw "Failed to contain the image";
    //             }
    //         };
    //         xhttp.onerror = function(e){
    //             throw "Error"
    //         }

    //     };

    //     xhttp.send(null);

    //     });

    // it("Should rotate the image",function(done){

    //     this.timeout(30000);
    //     var url = "http://localhost:4730/file/sample123/youthempowerment.jpg?rDegs=0.45";
    //     var xhttp = new XMLHttpRequest();
    //     xhttp.open('GET', url, true);
    //     xhttp.onload = function(e){
    //         if(xhttp.readyState === 4){
    //             if(xhttp.status === 200){
    //                 done();
    //             }else{
    //                 throw "Failed to rotate the image";
    //             }
    //         };
    //         xhttp.onerror = function(e){
    //             throw "Error"
    //         }

    //     };

    //     xhttp.send(null);

    //     });

    // it("Should blur the image",function(done){

    //     this.timeout(30000);
    //     var url = "http://localhost:4730/file/sample123/youthempowerment.jpg?bSigma";
    //     var xhttp = new XMLHttpRequest();
    //     xhttp.open('GET', url, true);
    //     xhttp.onload = function(e){
    //         if(xhttp.readyState === 4){
    //             if(xhttp.status === 200){
    //                 done();
    //             }else{
    //                 throw "Failed to blur the image";
    //             }
    //         };
    //         xhttp.onerror = function(e){
    //             throw "Error"
    //         }

    //     };

    //     xhttp.send(null);

    //     });

});

describe("CloudUser", function () {
    var username = util.makeString();
    var passwd = "abcd";


    it("Should create new user", function (done) {
        if (CB._isNode) {
            done();
            return;
        }

        this.timeout(300000);

        var obj = new CB.CloudUser();
        obj.set('username', username);
        obj.set('password', passwd);
        obj.set('email', util.makeEmail());
        obj.signUp().then(function (list) {
            if (list.get('username') === username) {
                done();
            }
            else {
                throw "create user error"
            }
        }, function (error) {
            throw error;
        });
    });

    it("Should create new user and change the password.", function (done) {
        if (CB._isNode) {
            done();
            return;
        }

        this.timeout(300000);

        var oldPassword = passwd;

        var obj = new CB.CloudUser();
        obj.set('username', username + "1");
        obj.set('password', oldPassword);
        obj.set('email', util.makeEmail());
        obj.signUp().then(function (list) {
            if (list.get('username'))
                CB.CloudUser.current.changePassword(oldPassword, 'newPassword', {
                    success: function (user) {
                        done();
                    }, error: function (error) {
                        done(error);
                    }
                });
            else
                done("create user error");
        }, function (error) {
            throw error;
        });

    });

    it('Should save a CloudUser and then login', function(done){


        if (CB._isNode) {
            done();
            return;
        }

        this.timeout(50000);

        var user = new CB.CloudUser();
        user.set('username', 'randomUsername');
        user.set('password', 'password');
        user.set('email', 'random-email@email.com');
        user.save().then(function(){
            var newUser = new CB.CloudUser();
            newUser.set('username', 'randomUsername');
            newUser.set('password', 'password');
            newUser.set('email', 'random-email@email.com');
            newUser.logIn().then(function(){
                done();
            }, function(error){
                done("Cannot log in")
            });
        }, function(error){
            done("Cannot save a user.")
        })

    });

    it("Should create new user, change the password and log in.", function (done) {
        if (CB._isNode) {
            done();
            return;
        }

        this.timeout(300000);

        var oldPassword = passwd;

        var obj = new CB.CloudUser();
        obj.set('username', username + "123");
        obj.set('password', oldPassword);
        obj.set('email', util.makeEmail());
        obj.signUp().then(function (list) {
            if (list.get('username'))
                CB.CloudUser.current.changePassword(oldPassword, 'newPassword', {
                    success: function (user) {
                        CB.CloudUser.current.logOut({
                            success: function () {
                              obj.set('password','newPassword');
                               obj.logIn( {
                                    success: function () {
                                        done();
                                    }, error: function (err) {
                                        done("Error signing in.")
                                    }
                                });
                            }, error: function () {
                                done("Cannot log out");
                            }
                        })
                    }, error: function (error) {
                        done(error);
                    }
                });
            else
                done("create user error");
        }, function (error) {
            throw error;
        });

    });


    it("Should not reset the password when old password is wrong.", function (done) {
        if (CB._isNode) {
            done();
            return;
        }

        this.timeout(300000);

        var oldPassword = passwd;

        var obj = new CB.CloudUser();
        obj.set('username', username + "2");
        obj.set('password', oldPassword);
        obj.set('email', util.makeEmail());
        obj.signUp().then(function (list) {
            if (list.get('username'))
                CB.CloudUser.current.changePassword("sample", 'newPassword', {
                    success: function (user) {
                        done("Password reset with old password is wrong.");
                    }, error: function (error) {
                        done();
                    }
                });
            else
                done("create user error");
        }, function (error) {
            throw error;
        });

    });


    it("Should not reset the password when user is logged in.", function (done) {
        if (CB._isNode) {
            done();
            return;
        }

        this.timeout(300000);

        CB.CloudUser.current.logOut({
            success: function () {
                try {
                    CB.CloudUser.current.changePassword("sample", 'newPassword', {
                        success: function (user) {
                            done("Password reset when user is not logged in.");
                        }, error: function (error) {
                            done();
                        }
                    });
                } catch (e) {
                    done();
                }
            }, error: function (error) {
                done("Failed to log out a user. ")
            }
        });
    });

    it("Should not reset Password when user is logged in.", function (done) {
        if (CB._isNode) {
            done();
            return;
        }

        this.timeout(300000);

        var obj = new CB.CloudUser();
        obj.set('username', "911@cloudboost.io");
        obj.set('password', passwd);
        obj.set('email', "911@cloudboost.io");
        obj.signUp().then(function (list) {
            if (list.get('username') === "911@cloudboost.io")
                CB.CloudUser.resetPassword("911@cloudboost.io", {
                    success: function () {
                        CB.CloudUser.current.logOut({
                            success: function () {
                                done("Reset password called when the user is logged in.");
                            }, error: function () {
                                done("Reset password called when the user is logged in.");
                            }
                        });
                        done("Reset password when the user is logged in.");
                    }, error: function (error) {
                        CB.CloudUser.current.logOut({
                            success: function () {
                                done();
                            }, error: function () {
                                done("Failed to log out.");
                            }
                        });
                    }
                });
            else
                throw "create user error"
        }, function (error) {
            throw error;
        });

    });

    it("Should reset Password", function (done) {
        if (CB._isNode) {
            done();
            return;
        }

        this.timeout(300000);
        CB.CloudUser.resetPassword("911@cloudboost.io", {
            success: function () {
                done()
            }, error: function (error) {
                done();
            }
        });
    });


    it("Should create a user and get version", function (done) {

        if (CB._isNode) {
            done();
            return;
        }

        this.timeout(30000);
        var user = new CB.CloudUser();
        var usrname = util.makeString();
        var passwd = "abcd";
        user.set('username', usrname);
        user.set('password', passwd);
        user.set('email', util.makeEmail());
        user.signUp().then(function (list) {
            if (list.get('username') === usrname && list.get('_version') >= 0) {
                done();
            }
            else
                throw "create user error"
        }, function () {
            throw "user create error";
        });
    });

    it("should do a query on user", function (done) {


        if (CB._isNode) {
            done();
            return;
        }


        this.timeout(30000);
        var user = new CB.CloudUser();
        var usrname = util.makeString();
        var passwd = "abcd";
        user.set('username', usrname);
        user.set('password', passwd);
        user.set('email', util.makeEmail());
        user.signUp().then(function (list) {
            if (list.get('username') === usrname && list.get('_version') >= 0) {
                var query = new CB.CloudQuery('User');
                query.findById(user.get('id')).then(function (obj) {

                    done();
                }, function (err) {

                });
            }
            else
                throw "create user error"
        }, function () {
            throw "user create error";
        });

    });

    it('should logout the user', function (done) {

        if (CB._isNode) {
            done();
            return;
        }


        this.timeout(30000);
        CB.CloudUser.current.logOut().then(function () {
            done();
        }, function () {
            throw "err";
        });
    });


    it("Should login user", function (done) {

        if (CB._isNode) {
            done();
            return;
        }

        this.timeout(30000);

        var obj = new CB.CloudUser();
        obj.set('username', username);
        obj.set('password', passwd);
        obj.logIn().then(function (list) {
            if (list.get("username") === username)
                done();
        }, function () {
            throw "user login error";
        });

    });

    var roleName2 = util.makeString();
    var role1 = new CB.CloudRole(roleName2);
    role1.set('name', roleName2);

    it("Should assign role to user", function (done) {

        if (CB._isNode) {
            done();
            return;
        }

        this.timeout(400000);

        var obj = new CB.CloudUser();
        obj.set('username', username);
        obj.set('password', passwd);
        obj.logIn().then(function (loggedUser) {
            role1.save().then(function (role) {
                loggedUser.addToRole(role).then(function (savedUser) {

                    var query = new CB.CloudQuery("User");
                    query.equalTo('username', username);
                    query.find({
                        success: function (list) {
                            list = list[0];

                            if (list && list.get("roles")) {
                                var rolesList = list.get("roles");
                                var userRoleIds = [];
                                for (var i = 0; i < rolesList.length; ++i) {
                                    userRoleIds.push(rolesList[i].document._id);
                                }

                                if (userRoleIds.indexOf(role.document._id) > -1) {
                                    done();
                                } else {
                                    done("addToRole failed");
                                }
                            }
                        },
                        error: function (error) {
                            done(error);
                        }
                    });

                }, function (error) {
                    throw error;
                });
            }, function (error) {
                throw error;
            });
        }, function () {
            throw "role create error";
        })

    });

    it("Should remove role assigned role to user", function (done) {

        if (CB._isNode) {
            done();
            return;
        }


        this.timeout(4000000);

        var obj = new CB.CloudUser();
        var roleName3 = util.makeString();
        var role2 = new CB.CloudRole(roleName3);
        role2.set('name', roleName3);
        obj.set('username', username);
        obj.set('password', passwd);
        obj.logIn().then(function (loggedUser) {

            role2.save().then(function (role2) {
                loggedUser.addToRole(role2).then(function (list) {

                    CB.CloudUser.current.removeFromRole(role2).then(function () {

                        var query = new CB.CloudQuery("User");
                        query.equalTo('username', username);
                        query.find({
                            success: function (list) {
                                list = list[0];

                                if (list && list.get("roles")) {
                                    var rolesList = list.get("roles");
                                    var userRoleIds = [];
                                    for (var i = 0; i < rolesList.length; ++i) {
                                        userRoleIds.push(rolesList[i].document._id);
                                    }

                                    if (userRoleIds.indexOf(role2.document._id) < 0) {
                                        done();
                                    } else {
                                        done("removeFromRole failed");
                                    }
                                }
                            },
                            error: function (error) {
                                done(error);
                            }
                        });

                    }, function (error) {
                        done(error);
                    });
                }, function (error) {
                    done(error);
                });
            }, function (error) {
                done(error);
            });
        }, function (error) {
            done(error);
        });

    });


    it("Should check isInRole", function (done) {

        if (CB._isNode) {
            done();
            return;
        }


        this.timeout(4000000);

        var obj = new CB.CloudUser();
        var roleName3 = util.makeString();
        var role2 = new CB.CloudRole(roleName3);
        role2.set('name', roleName3);
        obj.set('username', username);
        obj.set('password', passwd);
        obj.logIn().then(function (loggedUser) {

            role2.save().then(function (role2) {
                loggedUser.addToRole(role2).then(function (list) {

                    var query = new CB.CloudQuery("User");
                    query.equalTo('username', username);
                    query.find({
                        success: function (list) {
                            list = list[0];

                            obj.set("roles", list.get("roles"));

                            if (CB.CloudUser.current.isInRole(role2)) {
                                done();
                            } else {
                                done("isInRole Failed..");
                            }

                        },
                        error: function (error) {
                            done(error);
                        }
                    });

                }, function (error) {
                    done(error);
                });
            }, function (error) {
                done(error);
            });
        }, function (error) {
            done(error);
        });

    });


    it('should encrypt user password', function (done) {

        this.timeout(300000);

        var pass = passwd;

        var obj = new CB.CloudUser();
        obj.set('username', util.makeString());
        obj.set('password', pass);
        obj.set('email', util.makeEmail());
        obj.save().then(function (obj) {
            if (obj.get('password') === pass)
                throw "Password is not encrypted.";
            else
                done();
        }, function (err) {
            throw "user create error";
        });

    });

    it("Should Create a New User", function (done) {

        this.timeout(30000);

        var obj = new CB.CloudUser();
        obj.set('username', util.makeString());
        obj.set('email', util.makeEmail());
        obj.set('password', 'pass');
        obj.save().then(function (res) {
            var query = new CB.CloudQuery('User');
            query.get(res.get('id')).then(function (res1) {
                if (res1) {
                    done();
                } else {
                    throw "Unable to retrieve User";
                }
            }, function () {
                throw "Unable to Get User By ID";
            })
        }, function (err) {
            throw "Unable to Create User";
        });
    });

    it("Should Create a New User", function (done) {

        this.timeout(30000);

        var obj = new CB.CloudUser();
        obj.set('username', util.makeString());
        obj.set('email', util.makeEmail());
        obj.set('password', 'pass');
        obj.save().then(function (res) {
            var query = new CB.CloudQuery('User');
            query.get(res.get('id')).then(function (res1) {
                if (res1) {
                    done();
                } else {
                    throw "Unable to retrieve User";
                }
            }, function () {
                throw "Unable to Get User By ID";
            })
        }, function (err) {
            throw "Unable to Create User";
        });
    });

    it("Should Create a New User", function (done) {

        this.timeout(30000);

        var obj = new CB.CloudUser();
        obj.set('username', util.makeString());
        obj.set('email', util.makeEmail());
        obj.set('password', 'pass');
        obj.save().then(function (res) {
            var query = new CB.CloudQuery('User');
            query.get(res.get('id')).then(function (res1) {
                if (res1) {
                    done();
                } else {
                    throw "Unable to retrieve User";
                }
            }, function () {
                throw "Unable to Get User By ID";
            })
        }, function (err) {
            throw "Unable to Create User";
        });
    });

    it('should logout the user', function (done) {

        if (CB._isNode) {
            done();
            return;
        }


        this.timeout(30000);
        CB.CloudUser.current.logOut().then(function () {
            done();
        }, function () {
            throw "err";
        });
    });

    it("should send a Reset Email with Email Settings with default Template.", function (done) {
        this.timeout(100000);
        var url = URL + '/settings/' + CB.appId + "/email";

        var emailSettings = {
            mandrill: {
                apiKey: null,
                enabled: true
            },
            mailgun: {
                apiKey: "key-f66ed97c75c75cf864990730517d0445",
                domain: "cloudboost.io",
                enabled: true
            },
            fromEmail: "test@cloudboost.io",
            fromName: "CloudBoost.io"
        };

        emailSettings = JSON.stringify(emailSettings);


        var params = {};
        params.key = CB.masterKey;
        params.settings = emailSettings;

        function createUserAndSendResetPassword() {
            //Create cloudUser
            var obj = new CB.CloudUser();
            obj.set('username', "Flower");
            obj.set('password', passwd);
            obj.set('email', "support@cloudboost.io");

            obj.save({
                success: function (newObj) {
                    CB.CloudUser.resetPassword("support@cloudboost.io", {
                        success: function (resp) {
                            done();
                        }, error: function (error) {
                            done(error);
                        }
                    });
                }, error: function (err) {
                    done(err);
                }
            });
        }

        if (!window) {
            //Lets configure and request
            request({
                url: url, //URL to hit
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                json: params //Set the body as a string
            }, function (error, response, json) {
                if (error) {
                    done(error);
                } else {
                    createUserAndSendResetPassword();
                }
            });
        } else {
            $.ajax({

                // The URL for the request
                url: url,
                // The data to send (will be converted to a query string)
                data: params,
                // Whether this is a POST or GET request
                type: "PUT",
                // The type of data we expect back
                dataType: "json",
                // Code to run if the request succeeds;
                // the response is passed to the function
                success: function (json) {
                    if (json.category === "email") {
                        createUserAndSendResetPassword();
                    } else {
                        done("Wrong json.");
                    }
                },
                // Code to run if the request fails; the raw request and
                // status codes are passed to the function
                error: function (xhr, status, errorThrown) {
                    done("Error thrown.");
                },

            });
        }
    });


    it("should send a Reset Email with email Template with no Email Settings.", function (done) {
        this.timeout(100000);
        var url = URL + '/settings/' + CB.appId + "/auth";

        var authSettings = {
            general: {
                enabled: true,
                callbackURL: null,
                primaryColor: "#549afc"
            },
            custom: {
                enabled: true
            },
            signupEmail: {
                enabled: false,
                allowOnlyVerifiedLogins: false,
                template: ""
            },
            resetPasswordEmail: {
                enabled: false,
                template: "<h3>TEST(No email Setting only template):Forgot your password? We're there to help.</h3><p>Hi <span class='username></span></p><p>ease click on the button below which will help you reset your password and once you're done, You're good to go!</p><a class='link'></a><p>If you need any help, Just reply to this email and we'll be there to help.</p><p>Thanks, have a great day.</p><p>CloudBoost.io Team</p>"
            }
        };


        authSettings = JSON.stringify(authSettings);

        var params = {};
        params.key = CB.masterKey;
        params.settings = authSettings;

        function createUserAndSendResetPassword() {
            //Create cloudUser
            var obj = new CB.CloudUser();
            obj.set('username', "Tree");
            obj.set('password', passwd);
            obj.set('email', "contact@cloudboost.io");

            obj.save({
                success: function (newObj) {
                    CB.CloudUser.resetPassword("contact@cloudboost.io", {
                        success: function (resp) {
                            done();
                        }, error: function (error) {
                            done(error);
                        }
                    });
                }, error: function (err) {
                    done(err);
                }
            });
        }

        if (!window) {
            //Lets configure and request
            request({
                url: url, //URL to hit
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                json: params //Set the body as a string
            }, function (error, response, json) {
                if (error) {
                    done(error);
                } else {
                    createUserAndSendResetPassword();
                }
            });
        } else {
            $.ajax({

                // The URL for the request
                url: url,
                // The data to send (will be converted to a query string)
                data: params,
                // Whether this is a POST or GET request
                type: "PUT",
                // The type of data we expect back
                dataType: "json",
                // Code to run if the request succeeds;
                // the response is passed to the function
                success: function (json) {
                    if (json.category === "auth") {
                        createUserAndSendResetPassword();
                    } else {
                        done("Wrong json.");
                    }
                },
                // Code to run if the request fails; the raw request and
                // status codes are passed to the function
                error: function (xhr, status, errorThrown) {
                    done("Error thrown.");
                },

            });
        }
    });

    it("Should create new user and should fail to login without verified.", function (done) {
        if (CB._isNode) {
            done();
            return;
        }

        this.timeout(300000);

        var url = URL + '/settings/' + CB.appId + "/auth";

        var authSettings = {
            general: {
                enabled: true,
                callbackURL: "http://cloudboost.io",
                primaryColor: "#549afc"
            },
            custom: {
                enabled: true
            },
            signupEmail: {
                enabled: true,
                allowOnlyVerifiedLogins: true,
                template: "<h3>TEST(No email Setting only template):Signup? We're there to help.</h3><p>Hi <span class='username></span></p><p>ease click on the button below which will help you reset your password and once you're done, You're good to go!</p><a class='link'></a><p>If you need any help, Just reply to this email and we'll be there to help.</p><p>Thanks, have a great day.</p><p>CloudBoost.io Team</p>"
            },
            resetPasswordEmail: {
                enabled: false,
                template: null
            }
        };

        authSettings = JSON.stringify(authSettings);

        var params = {};
        params.key = CB.masterKey;
        params.settings = authSettings;

        function signupandlogin() {
            var oldPassword = passwd;
            var obj = new CB.CloudUser();
            obj.set('username', username + "19");
            obj.set('password', oldPassword);
            obj.set('email', util.makeEmail());
            obj.signUp().then(function (list) {

                var obj = new CB.CloudUser();
                obj.set('username', username + "19");
                obj.set('password', oldPassword);
                obj.logIn().then(function (user) {
                    done("User logged in without verification");
                }, function (error) {
                    done();
                });

            }, function (error) {
                throw error;
            });
        }

        if (!window) {
            //Lets configure and request
            request({
                url: url, //URL to hit
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                json: params //Set the body as a string
            }, function (error, response, json) {
                if (error) {
                    done(error);
                } else {
                    signupandlogin();
                }
            });
        } else {
            $.ajax({

                // The URL for the request
                url: url,
                // The data to send (will be converted to a query string)
                data: params,
                // Whether this is a POST or GET request
                type: "PUT",
                // The type of data we expect back
                dataType: "json",
                // Code to run if the request succeeds;
                // the response is passed to the function
                success: function (json) {
                    if (json.category === "auth") {
                        signupandlogin();
                    } else {
                        done("Wrong json.");
                    }
                },
                // Code to run if the request fails; the raw request and
                // status codes are passed to the function
                error: function (xhr, status, errorThrown) {
                    done("Error thrown.");
                },

            });
        }


    });

    it("Should nullify the auth custom settings.", function (done) {
        if (CB._isNode) {
            done();
            return;
        }

        this.timeout(300000);

        var url = URL + '/settings/' + CB.appId + "/auth";

        var authSettings = {
            general: {
                enabled: true,
                callbackURL: "http://cloudboost.io",
                primaryColor: "#549afc"
            },
            custom: {
                enabled: true
            },
            signupEmail: {
                enabled: false,
                allowOnlyVerifiedLogins: false,
                template: null
            },
            resetPasswordEmail: {
                enabled: false,
                template: null
            }
        };

        authSettings = JSON.stringify(authSettings);

        var params = {};
        params.key = CB.masterKey;
        params.settings = authSettings;

        if (!window) {
            //Lets configure and request
            request({
                url: url, //URL to hit
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                json: params //Set the body as a string
            }, function (error, response, json) {
                if (error) {
                    done(error);
                } else {
                    done();
                }
            });
        } else {
            $.ajax({

                // The URL for the request
                url: url,
                // The data to send (will be converted to a query string)
                data: params,
                // Whether this is a POST or GET request
                type: "PUT",
                // The type of data we expect back
                dataType: "json",
                // Code to run if the request succeeds;
                // the response is passed to the function
                success: function (json) {
                    if (json.category === "auth") {
                        done();
                    } else {
                        done("Wrong json.");
                    }
                },
                // Code to run if the request fails; the raw request and
                // status codes are passed to the function
                error: function (xhr, status, errorThrown) {
                    done("Error thrown.");
                },

            });
        }


    });

});
describe("CloudEvent", function() {
    var username = 'ritishgumber';
    var passwd = 'ritish4321';
    it("should track signup event.", function(done) {
        CB.CloudApp.init(URL, CB.appId, CB.masterKey);
        if (CB._isNode) {
            done();
            return;
        }

        this.timeout(30000);

        var obj = new CB.CloudUser();
        obj.set('username', username);
        obj.set('password', passwd);
        obj.set('email', util.makeEmail());
        obj.signUp();
        setTimeout(() => {
            var query = new CB.CloudQuery('_Event');
            query.equalTo('data.username', username);
            query.equalTo('name', 'Signup');
            query.findOne().then(function(obj) {
                if (obj.get('name') === 'Signup')
                    done();
                }
            , function(err) {
                done(err);
            });
        }, 10000)

    });

    it("Should track login event", function(done) {

        if (CB._isNode) {
            done();
            return;
        }

        this.timeout(30000);

        var obj = new CB.CloudUser();
        obj.set('username', username);
        obj.set('password', passwd);
        obj.logIn();
        setTimeout(() => {
            var query = new CB.CloudQuery('_Event');
            query.equalTo('data.username', username);
            query.equalTo('name', 'Login');
            query.findOne().then(function(obj) {
                if (obj.get('name') === 'Login') {
                    CB.CloudApp.init(URL, CB.appId, CB.jsKey);
                    done();
                }
            }, function(err) {
                done(err);
            });
        }, 10000)

    });

});

describe("Cloud Object", function() {

    //Use Sample Table.
    // -> Which has columns :
    // name : string : required.

    it("should automatically create table if it does not exist",function(done){

        this.timeout(30000);

        var tableName = util.makeString();

        var obj = new CB.CloudObject(tableName);
        obj.save().then(function(res){
                var query = new CB.CloudQuery(tableName);
                query.find({
                    success : function(list){
                        if(list.length>0){
                            done();
                        }
                        else{
                            done("Cannot create table.");
                        }
                    }, error : function(query){
                        //cannot query. 
                        
                        done("Cannot query");
                    }
                });
            },function(err){
                done(err);
        });
    });


    it("should automatically create column if it does not exist",function(done){

        this.timeout(30000);
        CB.appKey = CB.masterKey;

        var aNewTableName = util.makeString();
        var queryText = util.makeString();
        var queryEmail = util.makeEmail();
        var queryRelation = new CB.CloudObject('Custom');
        var queryDate = new Date();
        var queryObject = {name: "Nawaz", company: "Cloudboost"};
        var queryList = ["Hi", "Hello", "Howdy"];
        var queryLocation = {latitude: 17.7, longitude: 78.9};
        var queryFile = {name: util.makeString(), type: "txt", data: util.makeString()};
        var autoColumns = {
            Text : util.makeString(),
            Email : util.makeString(),
            URL: util.makeString(),
            Number: util.makeString(),
            Boolean: util.makeString(),
            DateTime: util.makeString(),
            Relation: util.makeString(),
            Object: util.makeString(),
            List: util.makeString(),
            GeoPoint: util.makeString(),
            File: util.makeString()
        }

        var obj = new CB.CloudObject(aNewTableName);
        var geoPoint = new CB.CloudGeoPoint(queryLocation.longitude, queryLocation.latitude);
        var file = new CB.CloudFile(queryFile.name, queryFile.data, queryFile.type);
        file.save().then(function(fileObj){
            obj.set(autoColumns.Text, queryText);
            obj.set(autoColumns.Email, queryEmail);
            obj.set(autoColumns.DateTime, queryDate);
            obj.set(autoColumns.URL, "http://cloudboost.io");
            obj.set(autoColumns.Number, 46);
            obj.set(autoColumns.Boolean, true);
            obj.set(autoColumns.Relation, queryRelation);
            obj.set(autoColumns.Object, queryObject);
            obj.set(autoColumns.List, queryList);
            obj.set(autoColumns.GeoPoint, geoPoint);
            obj.set(autoColumns.File, fileObj);
            obj.save().then(
                function(res){
                    CB.CloudTable.get(aNewTableName, {
                        success : function(table) {
                            let missingColumn = checkForColumnsExistance(table.document.columns);
                            if(missingColumn){
                                done("Couldn't creat column of type " + missingColumn);
                            }
                            else {                  
                                var query = new CB.CloudQuery(aNewTableName);
                                query.equalTo(autoColumns.Text, queryText);
                                query.equalTo(autoColumns.Email, queryEmail);
                                query.equalTo(autoColumns.DateTime, queryDate);
                                query.equalTo(autoColumns.URL, "http://cloudboost.io");
                                query.equalTo(autoColumns.Number, 46);
                                query.equalTo(autoColumns.Boolean, true);
                                query.equalTo(autoColumns.Relation, queryRelation);
                                query.find({
                                    success : function(list){
                                        if(list.length>0){
                                            if(JSON.stringify(queryObject) !== JSON.stringify(list[0].document[autoColumns.Object])){
                                                done("Can't add correct data to Object type column");
                                            }
                                            if(JSON.stringify(queryList) !== JSON.stringify(list[0].document[autoColumns.List])){
                                                done("Can't add correct data to List type column");
                                            }
                                            if(list[0].document[autoColumns.Relation].document._tableName !== 'Custom'){
                                                done("Can't add correct data to Relation type column");
                                            }
                                            if(list[0].document[autoColumns.GeoPoint].document.latitude !== queryLocation.latitude){
                                                done("Can't add correct data to GeoPoint type column");
                                            }
                                            if(list[0].document[autoColumns.File].document._type !== "file"){
                                                done("Can't add correct data to File type column");
                                            }
                                            done();
                                        }
                                        else{
                                            done("Columns created but data not added.");
                                        }
                                    },
                                    error : function(query){
                                        
                                        done("Cannot query");
                                    }
                                });
                            }
                        },
                        error : function(error) {
                            done(err);
                        }
                    });
                },
                function(err){
                    done(err);
                }
            );
        });

        function checkForColumnsExistance(columns) {
            var defaultColumns = ["id", "expires", "updatedAt", "createdAt", "ACL"];
            var customColumns = [];
            for(var i = 0, length = columns.length; i < length; i++){
                //filter out custom coulumns for check
                if(defaultColumns.indexOf(columns[i].document.name) < 0){
                    customColumns.push(JSON.stringify({
                            type: columns[i].document.dataType,
                            name: columns[i].document.name
                        })
                    )
                }
            }
            for (column in autoColumns) {
                // if column to be added is not actually added
                var columnString = JSON.stringify({type: column, name: autoColumns[column]});
                if(customColumns.indexOf(columnString) < 0)
                    return column;
            }
            return null;
        }
    });
 
    it("Should add a null value in a column", function(done) {

        this.timeout(30000);

        var obj = new CB.CloudObject('Employee');
        obj.set('dob', null);
        obj.save().then(function(res) {
            if (res.document.dob === null) {
                done();
            } else {
                done("Unable to Save Object with a null value");
            }
        }, function(err) {
            done(err);
        });
    });

    it("Should Save data in Custom date field", function(done) {

        this.timeout(30000);

        var obj = new CB.CloudObject('Employee');
        obj.set('dob', new Date());
        obj.save().then(function(res) {
            if (res)
                done();
            else
                done("Unable to Save Object");
            }
        , function(err) {
            done(err);
        });
    });

    it("Should NOT Save data in email field with incorrect email", function(done) {

        this.timeout(30000);

        var obj = new CB.CloudObject('Custom');
        obj.set('newColumn', "email");
        obj.save().then(function(res) {
            done("Saved with a valid email.");
        }, function(err) {
            done();
        });
    });

    it("Should save data in email field", function(done) {

        this.timeout(30000);

        var obj = new CB.CloudObject('Custom');
        obj.set('newColumn', "email@email.com");
        obj.save().then(function(res) {
            done();
        }, function(err) {
            done("Cannot save email");
        });
    });

    it("Should Save data in a CloudObject without attaching a file.", function(done) {

        this.timeout(30000);

        var obj = new CB.CloudObject('Company');
        obj.set('Name', 'sample');
        obj.save().then(function(res) {
            if (res)
                done();
            else
                done("Unable to Save Object");
            }
        , function(err) {
            done(err);
        });
    });

    it("Should NOT Save data in URL field with incorrect URL", function(done) {

        this.timeout(30000);

        var obj = new CB.CloudObject('Custom');
        obj.set('newColumn2', "url");
        obj.save().then(function(res) {
            done("Saved with an invalid.");
        }, function(err) {
            done();
        });

    });

    it("Should save data in URL field", function(done) {

        this.timeout(30000);

        var obj = new CB.CloudObject('Custom');
        obj.set('newColumn2', "https://localhost.com");
        obj.save().then(function(res) {
            done();
        }, function(err) {
            done("Cannot save URL");
        });
    });

    it("Should Save geo point", function(done) {

        this.timeout(30000);

        var obj = new CB.CloudObject('Custom5');
        obj.set('location', new CB.CloudGeoPoint(100, 80));
        obj.save().then(function(res) {
            if (res)
                done();
            else
                throw "Unable to Save Object";
            }
        , function(err) {
            throw "Unable to Save Date TIme";
        });
    });

    it("should not save a string into date column", function(done) {

        this.timeout(30000);

        var obj = new CB.CloudObject('Sample');
        obj.set('createdAt', 'abcd');
        obj.set('name', 'sample');
        obj.save().then(function(res) {
            if (res.createdAt === 'abcd')
                throw("should not have saved string in datetime field");
            else
                done();
            }
        , function() {
            done();
        });
    });

    it("should not set the id", function(done) {

        try {
            this.timeout(30000);

            var obj = new CB.CloudObject('Sample');
            obj.set('id', '123');
            throw "CLoudObject can set the id";
        } catch (e) {
            done();
        }

    });

    it("should save.", function(done) {

        this.timeout('30000');

        var obj = new CB.CloudObject('Sample');
        obj.set('name', 'sample');
        obj.save({
            success: function(newObj) {
                if (obj.get('name') !== 'sample') {
                    throw 'name is not equal to what was saved.';
                }
                if (!obj.id) {
                    throw 'id is not updated after save.';
                }

                done();
            },
            error: function(error) {
                throw 'Error saving the object';
            }
        });
    });

    it("should update the object after save and update.", function(done) {
        this.timeout('30000');

        var obj = new CB.CloudObject('Sample');
        obj.set('name', 'sample');
        obj.save({
            success: function(newObj) {

                var oldId = newObj.id;

                if (obj.get('name') !== 'sample') {
                    throw 'name is not equal to what was saved.';
                }

                if (!obj.id) {
                    throw 'id is not updated after save.';
                }

                obj.set('name', 'sample1');
                obj.save({
                    success: function(newObj) {

                        if (obj.get('name') !== 'sample1') {
                            throw 'name is not equal to what was saved.';
                        }

                        if (!obj.id) {
                            throw 'id is not updated after save.';
                        }

                        if (obj.id !== oldId) {
                            throw "did not update the object, but saved.";
                        }

                        done();
                    },
                    error: function(error) {
                        throw 'Error updating the object';
                    }
                });

            },
            error: function(error) {
                throw 'Error saving the object';
            }
        });
    });

    it("should update a saved CloudObject", function(done) {

        this.timeout(30000);

        var obj = new CB.CloudObject('student1');
        var obj1 = new CB.CloudObject('hostel');
        obj1.set('room', 8787);
        obj1.save().then(function(res) {
            obj1 = res;
            obj.set('name', 'vipul');
            obj.save().then(function(res) {
                obj = res;
                obj.set('newColumn', obj1);
                obj.save().then(function(res) {
                    done();
                }, function(err) {
                    throw "Should save";
                });
            }, function() {
                throw "Error while saving";
            });
        }, function() {
            throw "Error";
        });
    });

    it("should delete an object after save.", function(done) {

        this.timeout('50000');

        var obj = new CB.CloudObject('Sample');
        obj.set('name', 'sample');
        obj.save({
            success: function(newObj) {
                obj.delete({
                    success: function(obj) {
                        done();
                    },
                    error: function(error) {
                        throw 'Error deleting the object';
                    }
                });
            },
            error: function(error) {
                throw 'Error saving the object';
            }
        });
    });

    it("should not save an object which has required column which is missing. ", function(done) {
        this.timeout('30000');

        var obj = new CB.CloudObject('Sample');
        //name is required which is missing.
        obj.save({
            success: function(newObj) {
                throw "Saved an object even when required is missing.";
            },
            error: function(error) {
                done();
            }
        });
    });

    it("should not save an object with wrong dataType.", function(done) {
        this.timeout('30000');

        var obj = new CB.CloudObject('Sample');
        //name is string and we have a wrong datatype here.
        obj.set('name', 10); //number instead of string.
        obj.save({
            success: function(newObj) {
                throw "Saved an object even when required is missing.";
            },
            error: function(error) {
                done();
            }
        });
    });

    it("should not save an object with duplicate values in unique fields.", function(done) {

        this.timeout('30000');

        var text = util.makeString();

        var obj = new CB.CloudObject('Sample');
        obj.set('name', 'sample');
        obj.set('unique', text);

        obj.save({
            success: function(newObj) {
                var obj = new CB.CloudObject('Sample');
                obj.set('name', 'sample');
                obj.set('unique', text); //saving with sample text
                obj.save({
                    success: function(newObj) {
                        throw "Saved an object violated unique constraint.";
                    },
                    error: function(error) {
                        done();
                    }
                });

            },
            error: function(error) {
                throw "Saved Error";
            }
        });
    });

    it("should save an array.", function(done) {

        this.timeout('30000');

        var text = util.makeString();

        var obj = new CB.CloudObject('Sample');
        obj.set('name', 'sample');
        obj.set('stringArray', [text, text]); //saving with sample text
        obj.save({
            success: function(newObj) {
                done();
            },
            error: function(error) {
                throw "Error saving object. ";
            }
        });
    });

    it("should not save wrong datatype in an  array.", function(done) {

        this.timeout(30000);

        var obj = new CB.CloudObject('Sample');
        obj.set('name', 'sample');
        obj.set('stringArray', [10, 20]); //saving with sample text
        obj.save({
            success: function(newObj) {
                throw 'Wrong datatype in an array saved.';
            },
            error: function(error) {
                done();
            }
        });
    });

    it("should not allow multiple dataTypes in an array. ", function(done) {

        this.timeout(30000);

        var text = util.makeString();

        var obj = new CB.CloudObject('Sample');
        obj.set('name', 'sample');
        obj.set('stringArray', [text, 20]); //saving with sample text
        obj.save({
            success: function(newObj) {
                throw 'Multiple datatype in an array saved.';
            },
            error: function(error) {
                done();
            }
        });
    });

    it("should save an array with JSON objects. ", function(done) {

        this.timeout(30000);

        var obj = new CB.CloudObject('Sample');
        obj.set('name', 'sample');
        obj.set('objectArray', [
            {
                sample: 'sample'
            }, {
                sample: 'sample'
            }
        ]); //saving with sample text
        obj.save({
            success: function(newObj) {
                done();
            },
            error: function(error) {
                throw "Error saving object. ";
            }
        });
    });

    it("should save a CloudObject as a relation. ", function(done) {
        this.timeout(30000);

        var obj = new CB.CloudObject('Sample');
        obj.set('name', 'sample');

        var obj1 = new CB.CloudObject('Sample');
        obj1.set('name', 'sample');

        obj.set('sameRelation', obj1); //saving with sample text

        obj.save({
            success: function(newObj) {
                done();
            },
            error: function(error) {
                throw "Error saving object. ";
            }
        });
    });

    it("should save a CloudObject as a relation when id is passed as string. ", function(done) {
        this.timeout(30000);

        var obj = new CB.CloudObject('student1');
        obj.save({
            success: function(newObj) {
                var obj1 = new CB.CloudObject('Custom2');
                obj1.set('newColumn7', newObj.id);
                obj1.save({
                    success: function(newObj2) {
                        var doc = newObj2.get('newColumn7').document;
                        if (doc._id === newObj.id && doc._tableName === 'student1' && doc._type === 'custom')
                            done();
                        else {
                            throw "Object is not related"
                        }
                    },
                    error: function(error) {
                        throw "Error saving object. ";
                    }
                });

            },
            error: function(error) {
                throw "Error saving object. ";
            }
        });

    });

    it("should save a CloudObject as a relation when id is passed as 'id' key. ", function(done) {
        this.timeout(30000);

        var obj = new CB.CloudObject('student1');
        obj.save({
            success: function(newObj) {
                var obj1 = new CB.CloudObject('Custom2');
                obj1.set('newColumn7', {id: newObj.id});
                obj1.save({
                    success: function(newObj2) {
                        var doc = newObj2.get('newColumn7').document;
                        if (doc._id === newObj.id && doc._tableName === 'student1' && doc._type === 'custom')
                            done();
                        else {
                            throw "Object is not related"
                        }
                    },
                    error: function(error) {
                        throw "Error saving object. ";
                    }
                });

            },
            error: function(error) {
                throw "Error saving object. ";
            }
        });

    });

    it("should save a CloudObject as a relation when id is passed as '_id' key. ", function(done) {
        this.timeout(30000);

        var obj = new CB.CloudObject('student1');
        obj.save({
            success: function(newObj) {
                var obj1 = new CB.CloudObject('Custom2');
                obj1.set('newColumn7', {_id: newObj.id});
                obj1.save({
                    success: function(newObj2) {
                        var doc = newObj2.get('newColumn7').document;
                        if (doc._id === newObj.id && doc._tableName === 'student1' && doc._type === 'custom')
                            done();
                        else {
                            throw "Object is not related"
                        }
                    },
                    error: function(error) {
                        throw "Error saving object. ";
                    }
                });

            },
            error: function(error) {
                throw "Error saving object. ";
            }
        });

    });

    it("should save a CloudObject as a relation with relate function. ", function(done) {
        this.timeout(30000);

        var obj = new CB.CloudObject('Sample');
        obj.set('name', 'sample');

        var obj1 = new CB.CloudObject('Sample');
        obj1.set('name', 'sample');
        obj1.save({
            success: function(newObj) {
                obj.relate('sameRelation', 'Sample', newObj.id); //saving with sample text

                obj.save({
                    success: function(newObj) {
                        done();
                    },
                    error: function(error) {
                        throw "Error saving object. ";
                    }
                });
            },
            error: function(error) {
                throw "Error saving object. ";
            }
        });

    });

    it("should keep relations intact.", function(done) {
        this.timeout(30000);

        var obj = new CB.CloudObject('Custom2');
        obj.set('newColumn2', new CB.CloudObject('Custom3'));

        obj.set('newColumn7', new CB.CloudObject('student1'));

        obj.save({
            success: function(newObj) {

                if (newObj.get('newColumn2').document._tableName === 'Custom3' && newObj.get('newColumn7').document._tableName === 'student1') {
                    done();
                }

            },
            error: function(error) {
                throw "Error saving object. ";
            }
        });

    });

    it("should not save a a wrong relation.", function(done) {
        this.timeout(30000);

        var obj = new CB.CloudObject('Sample');
        obj.set('name', 'sample');

        var obj1 = new CB.CloudObject('Student');
        obj1.set('name', 'sample');

        obj.set('sameRelation', obj1); //saving with sample text

        obj.save({
            success: function(newObj) {
                throw "Saved an object with a wrong relation."
            },
            error: function(error) {
                done();
            }
        });
    });

    it("should not save a CloudObject Relation when the schema of a related object is wrong. ", function(done) {
        this.timeout(30000);

        var obj = new CB.CloudObject('Sample');
        obj.set('name', 'sample');

        var obj1 = new CB.CloudObject('Sample');
        //name is required , which means the schema is wrong.

        obj.set('sameRelation', obj1); //saving with sample text

        obj.save({
            success: function(newObj) {
                throw "Saved an object in a relation with an invalid schema.";
            },
            error: function(error) {
                done();
            }
        });
    });

    it("should not save a duplicate relation in unique fields. ", function(done) {

        this.timeout(30000);

        var obj = new CB.CloudObject('Sample');
        obj.set('name', 'sample');

        var obj1 = new CB.CloudObject('Sample');
        obj1.set('name', 'sample');

        obj.set('uniqueRelation', obj1); //saving with sample text

        obj.save({
            success: function(newObj) {
                var obj2 = new CB.CloudObject('Sample');
                obj2.set('name', 'sample');
                obj2.set('uniqueRelation', obj1);
                obj2.save({
                    success: function(newObj) {
                        throw "Saved a duplicate relation on a unique field.";
                    },
                    error: function(error) {
                        done();
                    }
                });

            },
            error: function(error) {
                throw "Cannot save an object";
            }
        });
    });

    it("should save an array of CloudObject with an empty array", function(done) {
        this.timeout(30000);

        var obj = new CB.CloudObject('Sample');
        obj.set('name', 'sample');

        var obj1 = new CB.CloudObject('Sample');
        obj1.set('name', 'sample');

        var obj2 = new CB.CloudObject('Sample');
        obj2.set('name', 'sample');
        obj2.set('relationArray', []);

        obj.save({
            success: function(newObj) {

                obj2.save({
                    success: function(newObj) {
                        done();
                    },
                    error: function(error) {
                        throw "Cannot save an object in a relation.";
                    }
                });
            }
        });
    });

    it("should save an array of CloudObject.", function(done) {
        this.timeout(30000);

        var obj = new CB.CloudObject('Sample');
        obj.set('name', 'sample');

        var obj1 = new CB.CloudObject('Sample');
        obj1.set('name', 'sample');

        var obj2 = new CB.CloudObject('Sample');
        obj2.set('name', 'sample');
        obj2.set('relationArray', [obj1, obj]);

        obj.save({
            success: function(newObj) {

                obj2.save({
                    success: function(newObj) {
                        done();
                    },
                    error: function(error) {
                        throw "Cannot save an object in a relation.";
                    }
                });
            }
        });
    });

    it("should modify the list relation of a saved CloudObject.", function(done) {
        this.timeout(30000);

        var obj = new CB.CloudObject('Sample');
        obj.set('name', 'sample');

        var obj1 = new CB.CloudObject('Sample');
        obj1.set('name', 'sample');

        var obj2 = new CB.CloudObject('Sample');
        obj2.set('name', 'sample');
        obj2.set('relationArray', [obj1, obj]);

        obj.save({
            success: function(newObj) {
                obj2.save({
                    success: function(Obj3) {
                        var relationArray = Obj3.get('relationArray');
                        if (relationArray.length !== 2)
                            throw "unable to save relation properly";
                        relationArray.splice(1);
                        Obj3.set('relationArray', relationArray);
                        Obj3.save().then(function(Obj4) {
                            if (relationArray.length === 1)
                                done();
                            }
                        , function() {
                            throw "should save";
                        });
                    },
                    error: function(error) {
                        throw "Cannot save an object in a relation.";
                    }
                });
            }
        });
    });

    it("should save an array of CloudObject with some objects saved and others unsaved.", function(done) {
        this.timeout(30000);

        var obj = new CB.CloudObject('Sample');
        obj.set('name', 'sample');

        obj.save({

            success: function(newObj) {

                var obj1 = new CB.CloudObject('Sample');
                obj1.set('name', 'sample');

                var obj2 = new CB.CloudObject('Sample');
                obj2.set('name', 'sample');
                obj2.set('relationArray', [obj1, obj]);

                obj2.save({
                    success: function(newObj) {
                        done();
                    },
                    error: function(error) {
                        throw "Cannot save an object in a relation.";
                    }
                });

            }
        });

    });

    it("should not save an array of different CloudObjects.", function(done) {
        this.timeout(30000);

        var obj = new CB.CloudObject('Student');
        obj.set('name', 'sample');

        var obj1 = new CB.CloudObject('Sample');
        obj1.set('name', 'sample');

        var obj2 = new CB.CloudObject('Sample');
        obj2.set('name', 'sample');
        obj2.set('relationArray', [obj1, obj]);

        obj.save({
            success: function(newObj) {

                obj2.save({
                    success: function(newObj) {
                        throw "Saved different types of CloudObject in a single list";
                    },
                    error: function(error) {
                        done();
                    }
                });
            },
            error: function(error) {
                throw "Cannot save obj";
            }
        });
    });

    // Test for error of getting duplicate objects while saving a object after updating
    it("Should not duplicate the values in a list after updating", function(done) {
        this.timeout(30000);

        var obj = new CB.CloudObject('student1');
        obj.set('age', 5);
        obj.set('name', 'abcd');

        var obj1 = new CB.CloudObject('Custom4');
        obj1.set('newColumn7', [obj, obj]);

        obj1.save().then(function(list) {

            nc7 = list.get('newColumn7');
            nc7.push(obj);
            obj1.set('newColumn7', nc7);
            obj1.save().then(function(list) {
                if (list.get('newColumn7').length === 1)
                    done();
                else
                    done("should not save duplicate objects");
                }
            , function(err) {
                done(err);
            });

        }, function(err) {
            done(err);
        });
    });

    // Test Case for error saving an object in a column
    it("should save a JSON object in a column", function(done) {
        this.timeout(30000);
        var json = {
            "name": "vipul",
            "location": "uoh",
            "age": 10
        };
        var obj = new CB.CloudObject('Custom');
        obj.set('newColumn6', json);
        obj.save().then(function(list) {
            var obje = list.get('newColumn6');
            if (obje.name === 'vipul' && obje.location === 'uoh' && obje.age === 10)
                done();
            else
                throw "error in saving json object";
            }
        , function() {
            throw "should save JSON object in cloud";
        });
    });

    it("should save list of numbers", function(done) {

        this.timeout(30000);

        var obj = new CB.CloudObject('Custom14');
        obj.set('ListNumber', [1, 2, 3]);
        obj.save().then(function(list) {
            done();
        }, function() {
            throw "should save the list of numbers";
        });
    });

    it("should save a list of GeoPoint", function(done) {

        this.timeout(30000);

        var obj = new CB.CloudObject('Custom14');
        var GP1 = new CB.CloudGeoPoint(17, 89);
        var GP2 = new CB.CloudGeoPoint(66, 78);
        obj.set('ListGeoPoint', [GP1, GP2]);
        obj.save().then(function(list) {
            done();
        }, function() {
            throw "should save list of geopoint";
        });
    });

    it("should save the relation", function(done) {

        this.timeout(30000);

        var obj1 = new CB.CloudObject('hostel');
        obj1.set('room', 123);
        obj1.save().then(function(obj) {
            if (obj) {
                obj1 = obj;
            } else {
                throw "should save the object";
            }
            obj = new CB.CloudObject('student1');
            obj2 = new CB.CloudObject('hostel', obj1.get('id'));
            obj.set('newColumn', obj2);
            obj.save().then(function(list) {
                done();
            }, function() {
                throw "should save the object";
            });
        }, function() {
            throw "should save the object";
        });
    });

    it("should display correct error message when you save a string in a number field. ", function(done) {

        this.timeout(30000);

        var obj = new CB.CloudObject('Custom7');
        obj.set('requiredNumber', 'sample');

        obj.save({
            success: function(newObj) {
                throw 'Wrong datatype in an array saved.';
            },
            error: function(error) {
                done();
            }
        });
    });

    it("should unset the field. ", function(done) {

        this.timeout(30000);

        var obj1 = new CB.CloudObject('hostel');
        obj1.set('room', 123);
        obj1.save().then(function(obj) {

            if (obj.get('room') === 123) {
                obj.unset('room');
                obj1.save().then(function(obj) {
                    if (!obj.get('room')) {
                        done();
                    } else
                        throw "Didnot unset the data from an object";

                    }
                , function() {
                    throw "should save the object";
                });
            } else
                throw "Didnot set the data to an object";

            }
        , function() {
            throw "should save the object";
        });
    });

    it("should add multiple relations to CLoudObject -> save -> should maintain the order of those relations. ", function(done) {

        this.timeout(30000);

        var obj1 = new CB.CloudObject('hostel');
        obj1.set('room', 123);
        obj1.save().then(function(obj) {

            if (obj.get('room') === 123) {
                obj.unset('room');
                obj1.save().then(function(obj) {
                    if (!obj.get('room')) {
                        done();
                    } else
                        throw "DidNot unset the data from an object";

                    }
                , function() {
                    throw "should save the object";
                });
            } else
                throw "DidNot set the data to an object";

            }
        , function() {
            throw "should save the object";
        });
    });

    it("should save a required number with 0.", function(done) {

        this.timeout(30000);

        var obj1 = new CB.CloudObject('Custom18');
        obj1.set('number', 0);
        obj1.save().then(function(obj) {
            done();
        }, function() {
            throw "should save the object";
        });
    });

    it("should fetch a CloudObject", function(done) {

        this.timeout(30000);

        var obj1 = new CB.CloudObject('Custom18');
        obj1.set('number', 0);
        obj1.save().then(function(obj) {
            delete obj1.document.number;
            obj1.fetch().then(function(res) {
                if (res.get('number') === 0)
                    done();
                else
                    throw "Unable to Fetch Data Using fetch function";
                }
            , function(err) {
                throw "Unable to fetch";
            });
        }, function() {
            throw "should save the object";
        });
    });

    it("should not update the createdAt when the object is updated.", function(done) {

        this.timeout('40000');

        var obj = new CB.CloudObject('Sample');
        obj.set('name', 'sample');
        obj.save({
            success: function(newObj) {
                var createdAt = Date.parse(newObj.createdAt);

                obj.set('name', 'sample1');

                setTimeout(function() {

                    if (createdAt == null) {
                        done("Error : Didnot save CreatedAt");
                    }

                    obj.save({
                        success: function(newObj) {
                            //
                            //
                            //

                            if (Date.parse(newObj.createdAt) === createdAt && Date.parse(newObj.updatedAt) !== createdAt) {
                                done();
                            } else {
                                done("Throw CreatedAt updated when the object is updated.")
                            }

                        },
                        error: function(error) {
                            throw 'Error saving the object';
                        }
                    });
                }, 10000);

            },
            error: function(error) {
                throw 'Error saving the object';
            }
        });

    });

    it("should only save data of column with master key.", function(done) {
        this.timeout('40000');

        //MasterKey
        CB.appKey = CB.masterKey;

        var table = new CB.CloudTable('ColByMaster');
        var Name = new CB.Column('Name');
        Name.dataType = 'Text';
        Name.editableByMasterKey = true;
        table.addColumn(Name);

        table.save().then(function(res) {

            //Switched to ClientKey
            CB.appKey = CB.jsKey;

            var obj = new CB.CloudObject('ColByMaster');
            obj.set('Name', "doNotAllowMe");
            obj.save({
                success: function(obj) {
                    done("Column saved with Client Key");
                },
                error: function(error) {
                    done();
                }
            });

        }, function(err) {
            done(err);
        });

    });

    it("should save data of columns other than editableByMasterKey.", function(done) {
        this.timeout('40000');

        //MasterKey
        CB.appKey = CB.masterKey;

        var table = new CB.CloudTable('ColByMaster2');
        var Name = new CB.Column('Name');
        Name.dataType = 'Text';
        Name.editableByMasterKey = true;
        table.addColumn(Name);

        var Surname = new CB.Column('Surname');
        Surname.dataType = 'Text';
        table.addColumn(Surname);

        table.save().then(function(res) {

            //Switched to ClientKey
            CB.appKey = CB.jsKey;

            var obj = new CB.CloudObject('ColByMaster2');
            obj.set('Surname', "AllowMe");
            obj.save({
                success: function(obj) {
                    done();
                },
                error: function(error) {
                    done(error);
                }
            });

        }, function(err) {
            done(err);
        });

    });

    it("Should Save false a boolean column when data is null", function(done) {

        this.timeout(30000);

        var obj = new CB.CloudObject('Employee');
        obj.save().then(function(res) {
            if (res.get("isCXO")===false)
                done();
            else
                done("False not saved by default.");
            }
        , function(err) {
            done(err);
        });
    });

});

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
describe("Cloud Objects Files", function() {

    try {
        if(window) {

            //Check Blob availability..
            var blobAvail=true;
            try {                    
                new Blob(['<a id="a"><b id="b">hey!</b></a>'], {type: "text/html"});
                blobAvail=true;
            } catch (e) {                   
                blobAvail=false;
            }

            var obj = new CB.CloudObject('Student');

            it("should save a file inside of an object", function (done) {

                this.timeout(40000);

                if(blobAvail){

                    //save file first.
                    var aFileParts = ['<a id="a"><b id="b">hey!</b></a>'];
                    try {
                        var oMyBlob = new Blob(aFileParts, {type: "text/html"});
                    } catch (e) {
                        var builder = new WebKitBlobBuilder();
                        builder.append(aFileParts);
                        var oMyBlob = builder.getBlob();
                    }
                    var file = new CB.CloudFile(oMyBlob);

                    file.save().then(function (file) {
                        if (file.url) {
                            
                            //create a new object.
                            var obj = new CB.CloudObject('Sample');
                            obj.set('name', 'sample');
                            obj.set('file', file);

                            obj.save().then(function (newobj) {
                                
                                if (newobj.get('file') instanceof CB.CloudFile && newobj.get('file').document._id) {
                                    done();
                                } else {
                                    throw "object saved but didnot return file.";
                                }
                            }, function (error) {
                                throw "error saving an object.";
                            });

                        } else {
                            throw "upload success. but cannot find the url.";
                        }
                    }, function (err) {
                        throw "error uploading file";
                    });

                }else{
                    done();
                }

            });


             it("should save a file inside of an object and can update the CloudObject", function (done) {

                this.timeout(40000);

                if(blobAvail){
                    //save file first.
                    var aFileParts = ['<a id="a"><b id="b">hey!</b></a>'];
                    try {
                        var oMyBlob = new Blob(aFileParts, {type: "text/html"});
                    } catch (e) {
                        var builder = new WebKitBlobBuilder();
                        builder.append(aFileParts);
                        var oMyBlob = builder.getBlob();
                    }
                    var file = new CB.CloudFile(oMyBlob);

                    file.save().then(function (file) {
                        if (file.url) {
                           
                            //create a new object.
                            var obj = new CB.CloudObject('Sample');
                            obj.set('name', 'sample');
                            obj.set('file', file);

                            obj.save().then(function (newobj) {
                                
                                if (newobj.get('file') instanceof CB.CloudFile && newobj.get('file').document._id) {
                                   
                                    newobj.set('name','sample2');
                                    newobj.save().then(function(){
                                        done();
                                    }, function(){
                                        done("Error saving CLoudObject");
                                    });

                                } else {
                                    throw "object saved but didnot return file.";
                                }
                            }, function (error) {
                                throw "error saving an object.";
                            });

                        } else {
                            throw "upload success. but cannot find the url.";
                        }
                    }, function (err) {
                        throw "error uploading file";
                    });
                }else{
                    done();
                }

            });

            it("should save an array of files.", function (done) {
                this.timeout(400000);

                if(blobAvail){
                    //save file first.
                    var aFileParts = ['<a id="a"><b id="b">hey!</b></a>'];
                    try {
                        var oMyBlob = new Blob(aFileParts, {type: "text/html"});
                    } catch (e) {
                        var builder = new WebKitBlobBuilder();
                        builder.append(aFileParts);
                        var oMyBlob = builder.getBlob();
                    }
                    var file = new CB.CloudFile(oMyBlob);

                    file.save().then(function (file) {
                        if (file.url) {

                            var aFileParts = ['<a id="a"><b id="b">hey!</b></a>'];
                            try {
                                var oMyBlob = new Blob(aFileParts, {type: "text/html"});
                            } catch (e) {
                                var builder = new WebKitBlobBuilder();
                                builder.append(aFileParts);
                                var oMyBlob = builder.getBlob();
                            }
                            var file1 = new CB.CloudFile(oMyBlob);

                            file1.save().then(function (file1) {
                                if (file1.url) {

                                    //create a new object.
                                    var obj = new CB.CloudObject('Sample');
                                    obj.set('name', 'sample');
                                    obj.set('fileList', [file, file1]);

                                    obj.save().then(function (newObj) {
                                        done();
                                    }, function (error) {
                                        throw "Error Saving an object.";
                                    });

                                } else {
                                    throw "Upload success. But cannot find the URL.";
                                }
                            }, function (err) {
                                throw "Error uploading file";
                            });

                        } else {
                            throw "Upload success. But cannot find the URL.";
                        }
                    }, function (err) {
                        throw "Error uploading file";
                    });
                }else{
                    done();
                }
            });

        }
    }catch(e){
        
    }

});
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
describe("CloudObjectExpires", function () {

    it("should save a CloudObject after expire is set", function (done) {

        this.timeout(20000);
        var obj = new CB.CloudObject('student1');
        obj.set('name', 'vipul');
        obj.set('age', 10);
        obj.save().then(function(obj1) {
            done();
        }, function (err) {           
            throw "Cannot save an object after expire is set";
        });

    });

    it("objects expired should not show up in query", function (done) {


        this.timeout(20000);

        var obj = new CB.CloudObject('student1');
        obj.set('name', 'vipul');
        obj.set('age', 10);
        obj.save().then(function(obj1) {
          //Object saved..

            var curr=new Date().getTime();
            var query1 = new CB.CloudQuery('student1');
            query1.equalTo('name','vipul');
            var query2 = new CB.CloudQuery('student1');
            query2.lessThan('age',12);
            var query =  CB.CloudQuery.or(query1,query2);

            query.find().then(function(list){
                if(list && list.length>0){
                    for(var i=0;i<list.length;i++){
                        if(list[i].expires > curr || !list[i].expires){
                            break;
                        }
                        else{
                            throw "Expired Object Retrieved";
                        }
                    }                    
                }
                done();

            }, function(error){
                done(error);
            });


        }, function (err) {           
           done("Cannot save an object after expire is set");
        });     

    });

    it("objects should show up in query if expires is set at a future date.", function (done) {

        this.timeout(20000);

        var tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 10);
        
        var obj = new CB.CloudObject('student1');
        obj.set('name', 'vipul');
        obj.set('age', 10);
        obj.expires = tomorrow;
        obj.save().then(function(obj1) {
            var query = new CB.CloudQuery('student1');
            query.findById(obj1.id).then(function(obj){
               if(obj){
                done();
               }else{
                done("Object not found");
               }
            }, function(error){
                done(error);
            });
        }, function (err) {
            done(err);
        });        

    });

});
describe("Cloud Objects Notification", function () {

	var obj = new CB.CloudObject('Student');
	var obj1 = new CB.CloudObject('student4');

	it("should alert when the object is created.", function (done) {

		this.timeout(40000);
		CB.CloudObject.on('Student', 'created', function (data) {
			if (data.get('name') === 'sample') {
				done();
				CB.CloudObject.off('Student', 'created', { success: function () { }, error: function () { } });
			}
			else
				throw "Wrong data received.";
		}, {
				success: function () {
					obj.set('name', 'sample');
					obj.save().then(function (newObj) {
						obj = newObj;
					});
				}, error: function (error) {
					throw 'Error listening to an event.';
				}
			});
	});

	it("should not alert when objects ACL is public deny", function (done) {

		this.timeout(40000);
		CB.CloudObject.on('Student', 'created', function (data) {
			done('should not have triggered this event')
		}, {
				success: function () {
					var obj = new CB.CloudObject('Student');
					obj.set('name', 'sample');
					obj.ACL = new CB.ACL();
					obj.ACL.setPublicReadAccess(false);
					obj.ACL.setPublicWriteAccess(false);
					setTimeout(function () {
						obj.save()
					}, 2000)

				}, error: function (error) {
					throw 'Error listening to an event.';
				}
			});

		setTimeout(function () {
			CB.CloudObject.off('Student', 'created', { success: function () { }, error: function () { } });
			done()
		}, 5000)
	});



	it("should throw an error when wrong event type is entered. ", function (done) {

		this.timeout(40000);
		try {
			CB.CloudObject.on('Student', 'wrongtype', function (data) {
				throw 'Fired event to wrong type.';
			});

			throw 'Listening to wrong event type.';
		} catch (e) {
			done();
		}

	});

	it("should alert when the object is updated.", function (done) {

		this.timeout(40000);
		CB.CloudObject.on('student4', 'updated', function (data) {
			done();
			CB.CloudObject.off('student4', 'updated', { success: function () { }, error: function () { } });
		}, {
				success: function () {
					obj1.save().then(function () {
						obj1.set('age', 15);
						obj1.save().then(function (newObj) {
							obj1 = newObj;
						}, function () {
							throw 'Error Saving an object.';
						});
					}, function () {
						throw 'Error Saving an object.'
					});
				}, error: function (error) {
					throw 'Error listening to an event.';
				}

			});
	});

	it("should alert when the object is deleted.", function (done) {

		this.timeout(50000);

		CB.CloudObject.on('Student', 'deleted', function (data) {
			if (data instanceof CB.CloudObject) {
				done();
				CB.CloudObject.off('Student', 'deleted', { success: function () { }, error: function () { } });
			}
			else
				throw "Wrong data received.";
		}, {
				success: function () {
					obj.set('name', 'sample');
					obj.delete();
				}, error: function (error) {
					throw 'Error listening to an event.';
				}
			});
	});

	it("should alert when multiple events are passed.", function (done) {
		this.timeout(40000);
		var cloudObject = new CB.CloudObject('Student');
		var count = 0;
		CB.CloudObject.on('Student', ['created', 'deleted'], function (data) {
			count++;
			if (count === 2) {
				done();
			}
		}, {
				success: function () {
					cloudObject.set('name', 'sample');
					cloudObject.save({
						success: function (newObj) {
							cloudObject = newObj;
							cloudObject.set('name', 'sample1');
							cloudObject.save();
							cloudObject.delete();
						}
					});

				}, error: function (error) {
					throw 'Error listening to an event.';
				}
			});
	});

	it("should alert when all three events are passed", function (done) {

		this.timeout(40000);

		var cloudObject = new CB.CloudObject('Student');
		var count = 0;
		CB.CloudObject.on('Student', ['created', 'deleted', 'updated'], function (data) {
			count++;
			if (count === 3) {
				done();
			}
		}, {
				success: function () {
					cloudObject.set('name', 'sample');
					cloudObject.save({
						success: function (newObj) {
							cloudObject = newObj;
							cloudObject.set('name', 'sample1');
							cloudObject.save({
								success: function (newObj) {
									cloudObject = newObj;
									cloudObject.delete();
								}
							});
						}
					});
				}, error: function (error) {
					throw 'Error listening to an event.';
				}
			});
	});

	it("should stop listening.", function (done) {

		this.timeout(44000);

		var cloudObject = new CB.CloudObject('Student');
		var count = 0;
		CB.CloudObject.on('Student', ['created', 'updated', 'deleted'], function (data) {
			count++;
		}, {
				success: function () {
					CB.CloudObject.off('Student', ['created', 'updated', 'deleted'], {
						success: function () {
							cloudObject.save();
						}, error: function (error) {
							done(error);
						}
					});
				}, error: function (error) {
					done(error);
				}
			});

		setTimeout(function () {
			if (count === 0) {
				done();
			} else {
				done('Listening to events even if its stopped.');
			}

		}, 6000);
	});

});
describe("Query on Cloud Object Notifications ", function() {

    //Use Sample Table.
    // -> Which has columns :
    // name : string : required.

    it("limit : 1", function(done) {

        var isDone = false;

        this.timeout(40000);
        //create the query.
        var query = new CB.CloudQuery('Student');
        query.limit = 2;

        var count = 0;

        CB.CloudObject.on('Student', 'created', query, function() {
            ++count;
        });

        for (var i = 0; i < 3; i++) {
            //attach it to the event.
            var obj = new CB.CloudObject('Student');
            obj.set('name', 'Nawaz');
            obj.save();
        }

        setTimeout(function() {
            if (count === 2) {
                if (!isDone) {
                    isDone = true;
                    done();
                };
            } else {
                if (!isDone) {
                    isDone = true;
                    done("Limit Error");
                };
            }
        }, 30000)

    });

    it("near : 1", function(done) {
        //Custom5 table has location field.

        this.timeout(30000);
        var loc = new CB.CloudGeoPoint("76.991204", "28.605977");
        var query = new CB.CloudQuery('Custom5');
        var isDone = false;
        query.near("location", loc, 40000); //40km

        CB.CloudObject.on('Custom5', 'created', query, function() {
            CB.CloudObject.off('Custom5', 'created');
            isDone = true;

        });
        loc = new CB.CloudGeoPoint("77.061327", "28.621272");
        var obj = new CB.CloudObject('Custom5');
        obj.set('location', loc);
        obj.save();
        setTimeout(function() {
            if (isDone) {
                done();
            } else {
                done('event not fired');
            }
        }, 20000);
    });

    it("near : 2", function(done) {
        //Custom5 table has location field.

        this.timeout(30000);
        var loc = new CB.CloudGeoPoint("76.991204", "28.605977");
        var query = new CB.CloudQuery('Custom5');
        var isDone = false;
        query.near("location", loc, 40000); //40km

        CB.CloudObject.on('Custom5', 'created', query, function() {
            CB.CloudObject.off('Custom5', 'created');
            isDone = true;

        });
        loc = new CB.CloudGeoPoint("78.486671", "17.385044");
        var obj = new CB.CloudObject('Custom5');
        obj.set('location', loc);
        obj.save();
        setTimeout(function() {
            if (!isDone) {
                done();
            } else {
                done('event  fired');
            }
        }, 20000);
    });

    it("should only fire the second event and not the first one. ", function(done) {
        var message = "unmodified";
        var isDone = false;

        this.timeout(30000);
        //create the query.
        var query = new CB.CloudQuery('Student');
        query.equalTo('name', 'Sample');

        CB.CloudObject.on('Student', 'created', query, function() {
            CB.CloudObject.off('Student', 'created');
            if (!isDone) {
                isDone = true;
                message = 'first event fired.';
            } else {
                message = 'first event fired after second.';
            }
        });

        query = new CB.CloudQuery('Student');
        query.equalTo('age', 10);

        CB.CloudObject.on('Student', 'created', query, function() {
            CB.CloudObject.off('Student', 'created');
            if (!isDone) {
                isDone = true;
            } else {
                message = 'second event fired after first';
            }
        });

        //attach it to the event.
        var obj = new CB.CloudObject('Student');
        obj.set('age', 10);
        obj.save();

        setTimeout(function() {
            if (message == 'unmodified') {
                done();
            } else {
                done(message);
            }
        }, 20000);

    });

    it("should only fire the first event and not the second one. ", function(done) {
        var message = "unmodified";
        var isDone = false;

        this.timeout(30000);
        //create the query.
        var query = new CB.CloudQuery('Student');
        query.equalTo('name', 'Sample');

        CB.CloudObject.on('Student', 'created', query, function() {
            CB.CloudObject.off('Student', 'created');
            if (!isDone) {
                isDone = true;
            } else {
                message = 'first event fired after second.';
            }
        });

        query = new CB.CloudQuery('Student');
        query.equalTo('age', 10);

        CB.CloudObject.on('Student', 'created', query, function() {
            CB.CloudObject.off('Student', 'created');
            if (!isDone) {
                isDone = true;
                message = 'second event fired.';
            } else {
                message = 'second event fired after first';
            }
        });

        //attach it to the event.
        var obj = new CB.CloudObject('Student');
        obj.set('name', 'Sample');
        obj.save();

        setTimeout(function() {
            if (message == 'unmodified') {
                done();
            } else {
                done(message);
            }
        }, 20000);

    });

    it("skip : 1", function(done) {

        var isDone = false;

        this.timeout(40000);
        //create the query.
        var query = new CB.CloudQuery('Student');
        query.skip = 1;

        var count = 0;

        CB.CloudObject.on('Student', 'created', query, function(data) {
            ++count;
        });

        for (var i = 0; i < 3; i++) {
            //attach it to the event.
            var obj = new CB.CloudObject('Student');
            obj.set('name', 'Nawaz');
            obj.save();
        }

        setTimeout(function() {
            if (count === 2) {
                if (!isDone) {
                    isDone = true;
                    done();
                };
            } else {
                if (!isDone) {
                    isDone = true;
                    done("Limit Error");
                };
            }
        }, 20000);

    });

    it("notification should work on equalTo Columns", function(done) {

        var isDone = false;

        this.timeout(30000);
        //create the query.
        var query = new CB.CloudQuery('Student');
        query.equalTo('name', 'Sample');

        CB.CloudObject.on('Student', 'created', query, function() {
            CB.CloudObject.off('Student', 'created');
            if (!isDone) {
                isDone = true;
                done();
            }
        });

        //attach it to the event.
        var obj = new CB.CloudObject('Student');
        obj.set('name', 'Sample');
        obj.save();

    });

    it("should work on equalTo Columns : 2", function(done) {

        var isDone = false;

        this.timeout(30000);
        //create the query.
        var query = new CB.CloudQuery('Student');
        query.equalTo('name', 'Sample');

        CB.CloudObject.on('Student', 'created', query, function() {
            CB.CloudObject.off('Student', 'created');
            if (!isDone) {
                isDone = true;
                done("Fired a wrong event");
            }
        });

        //attach it to the event.
        var obj = new CB.CloudObject('Student');
        obj.set('name', 'Sample1');
        obj.save();

        setTimeout(function() {
            if (!isDone) {
                isDone = true;
                done();
            }
        }, 10000);
    });

    it("should work on notEqualTo Columns : 1", function(done) {

        var isDone = false;

        this.timeout(30000);
        //create the query.
        var query = new CB.CloudQuery('Student');
        query.notEqualTo('name', 'Sample');

        CB.CloudObject.on('Student', 'created', query, function() {
            CB.CloudObject.off('Student', 'created');
            if (!isDone) {
                isDone = true;
                done();
            };
        });

        //attach it to the event.
        var obj = new CB.CloudObject('Student');
        obj.set('name', 'Sample1');
        obj.save();

    });

    it("should work on notEqualTo Columns : 2", function(done) {

        var isDone = false;

        this.timeout(30000);
        //create the query.
        var query = new CB.CloudQuery('Student');
        query.notEqualTo('name', 'Sample');

        CB.CloudObject.on('Student', 'created', query, function() {
            CB.CloudObject.off('Student', 'created');
            if (!isDone) {
                isDone = true;
                done("Fired a wrong event");
            }
        });

        //attach it to the event.
        var obj = new CB.CloudObject('Student');
        obj.set('name', 'Sample');
        obj.save();

        setTimeout(function() {
            if (!isDone) {
                isDone = true;
                done();
            };
        }, 10000);
    });

    it("greaterThan : 1", function(done) {

        var isDone = false;

        this.timeout(30000);
        //create the query.
        var query = new CB.CloudQuery('Student');
        query.greaterThan('age', 10);

        CB.CloudObject.on('Student', 'created', query, function() {
            if (!isDone) {
                isDone = true;
                done();
            };
        });

        //attach it to the event.
        var obj = new CB.CloudObject('Student');
        obj.set('age', 11);
        obj.save();
    });

    it("greaterThan : 2", function(done) {

        var isDone = false;

        this.timeout(30000);
        //create the query.
        var query = new CB.CloudQuery('Student');
        query.greaterThan('age', 10);

        CB.CloudObject.on('Student', 'created', query, function() {
            CB.CloudObject.off('Student', 'created');
            if (!isDone) {
                isDone = true;
                done("Fired a wrong event");
            }
        });

        //attach it to the event.
        var obj = new CB.CloudObject('Student');
        obj.set('age', 9);
        obj.save();

        setTimeout(function() {
            if (!isDone) {
                isDone = true;
                done();
            };
        }, 10000);

    });

    it("lessThan : 1", function(done) {

        var isDone = false;

        this.timeout(30000);
        //create the query.
        var query = new CB.CloudQuery('Student');
        query.lessThan('age', 10);

        CB.CloudObject.on('Student', 'created', query, function() {
            if (!isDone) {
                isDone = true;
                done();
            };
        });

        //attach it to the event.
        var obj = new CB.CloudObject('Student');
        obj.set('age', 9);
        obj.save();
    });

    it("lessThan : 2", function(done) {

        var isDone = false;

        this.timeout(30000);
        //create the query.
        var query = new CB.CloudQuery('Student');
        query.lessThan('age', 10);

        CB.CloudObject.on('Student', 'created', query, function() {
            CB.CloudObject.off('Student', 'created');
            if (!isDone) {
                isDone = true;
                done("Fired a wrong event");
            }
        });

        //attach it to the event.
        var obj = new CB.CloudObject('Student');
        obj.set('age', 11);
        obj.save();

        setTimeout(function() {
            if (!isDone) {
                isDone = true;
                done();
            };
        }, 10000);

    });

    it("Exists : 1", function(done) {

        var isDone = false;

        this.timeout(30000);
        //create the query.
        var query = new CB.CloudQuery('Student');
        query.exists('age');

        CB.CloudObject.on('Student', 'created', query, function() {
            if (!isDone) {
                isDone = true;
                done();
            };
        });

        //attach it to the event.
        var obj = new CB.CloudObject('Student');
        obj.set('age', 11);
        obj.save();
    });

    it("Exists : 2", function(done) {

        var isDone = false;

        this.timeout(30000);
        //create the query.
        var query = new CB.CloudQuery('Student');
        query.exists('name');

        CB.CloudObject.on('Student', 'created', query, function() {
            CB.CloudObject.off('Student', 'created');
            if (!isDone) {
                isDone = true;
                done("Fired a wrong event");
            }
        });

        //attach it to the event.
        var obj = new CB.CloudObject('Student');
        obj.set('age', 9);
        obj.save();

        setTimeout(function() {
            if (!isDone) {
                isDone = true;
                done();
            };
        }, 10000);

    });

    it("doesNotExist : 1", function(done) {

        var isDone = false;

        this.timeout(30000);
        //create the query.
        var query = new CB.CloudQuery('Student');
        query.doesNotExists('name');

        CB.CloudObject.on('Student', 'created', query, function() {
            if (!isDone) {
                isDone = true;
                done();
            };
        });

        //attach it to the event.
        var obj = new CB.CloudObject('Student');
        obj.set('age', 11);
        obj.save();
    });

    it("doesNotExist : 2", function(done) {

        var isDone = false;

        this.timeout(30000);
        //create the query.
        var query = new CB.CloudQuery('Student');
        query.doesNotExists('age');

        CB.CloudObject.on('Student', 'created', query, function() {
            CB.CloudObject.off('Student', 'created');
            if (!isDone) {
                isDone = true;
                done("Fired a wrong event");
            }
        });

        //attach it to the event.
        var obj = new CB.CloudObject('Student');
        obj.set('age', 9);
        obj.save();

        setTimeout(function() {
            if (!isDone) {
                isDone = true;
                done();
            };
        }, 10000);

    });

    it("GTE : 1", function(done) {

        var isDone = false;

        this.timeout(30000);
        //create the query.
        var query = new CB.CloudQuery('Student');
        query.greaterThanEqualTo('age', 11);

        CB.CloudObject.on('Student', 'created', query, function() {
            if (!isDone) {
                isDone = true;
                done();
            };
        });

        //attach it to the event.
        var obj = new CB.CloudObject('Student');
        obj.set('age', 11);
        obj.save();
    });

    it("GTE : 2", function(done) {

        var isDone = false;

        this.timeout(30000);
        //create the query.
        var query = new CB.CloudQuery('Student');
        query.greaterThanEqualTo('age', 9);

        CB.CloudObject.on('Student', 'created', query, function() {
            CB.CloudObject.off('Student', 'created');
            if (!isDone) {
                isDone = true;
                done("Fired a wrong event");
            }
        });

        //attach it to the event.
        var obj = new CB.CloudObject('Student');
        obj.set('age', 8);
        obj.save();

        setTimeout(function() {
            if (!isDone) {
                isDone = true;
                done();
            };
        }, 10000);

    });

    it("LTE : 1", function(done) {

        var isDone = false;

        this.timeout(30000);
        //create the query.
        var query = new CB.CloudQuery('Student');
        query.lessThanEqualTo('age', 11);

        CB.CloudObject.on('Student', 'created', query, function() {
            if (!isDone) {
                isDone = true;
                done();
            };
        });

        //attach it to the event.
        var obj = new CB.CloudObject('Student');
        obj.set('age', 11);
        obj.save();
    });

    it("LTE : 2", function(done) {

        var isDone = false;

        this.timeout(30000);
        //create the query.
        var query = new CB.CloudQuery('Student');
        query.lessThanEqualTo('age', 9);

        CB.CloudObject.on('Student', 'created', query, function() {
            CB.CloudObject.off('Student', 'created');
            if (!isDone) {
                isDone = true;
                done("Fired a wrong event");
            }
        });

        //attach it to the event.
        var obj = new CB.CloudObject('Student');
        obj.set('age', 11);
        obj.save();

        setTimeout(function() {
            if (!isDone) {
                isDone = true;
                done();
            };
        }, 10000);

    });

    it("containedIn : 1", function(done) {

        var isDone = false;

        this.timeout(30000);
        //create the query.
        var query = new CB.CloudQuery('Student');
        query.containedIn('age', [11]);

        CB.CloudObject.on('Student', 'created', query, function() {
            if (!isDone) {
                isDone = true;
                done();
            };
        });

        //attach it to the event.
        var obj = new CB.CloudObject('Student');
        obj.set('age', 11);
        obj.save();
    });

    it("containedIn : 2", function(done) {

        var isDone = false;

        this.timeout(30000);
        //create the query.
        var query = new CB.CloudQuery('Student');
        query.containedIn('age', [9]);

        CB.CloudObject.on('Student', 'created', query, function() {
            CB.CloudObject.off('Student', 'created');
            if (!isDone) {
                isDone = true;
                done("Fired a wrong event");
            }
        });

        //attach it to the event.
        var obj = new CB.CloudObject('Student');
        obj.set('age', 11);
        obj.save();

        setTimeout(function() {
            if (!isDone) {
                isDone = true;
                done();
            };
        }, 10000);

    });

    it("notContainedIn : 1", function(done) {

        var isDone = false;

        this.timeout(30000);
        //create the query.
        var query = new CB.CloudQuery('Student');
        query.notContainedIn('age', [10]);

        CB.CloudObject.on('Student', 'created', query, function() {
            if (!isDone) {
                isDone = true;
                done();
            };
        });

        //attach it to the event.
        var obj = new CB.CloudObject('Student');
        obj.set('age', 11);
        obj.save();
    });

    it("notContainedIn : 2", function(done) {

        var isDone = false;

        this.timeout(30000);
        //create the query.
        var query = new CB.CloudQuery('Student');
        query.notContainedIn('age', [9]);

        CB.CloudObject.on('Student', 'created', query, function() {
            CB.CloudObject.off('Student', 'created');
            if (!isDone) {
                isDone = true;
                done("Fired a wrong event");
            }
        });

        //attach it to the event.
        var obj = new CB.CloudObject('Student');
        obj.set('age', 9);
        obj.save();

        setTimeout(function() {
            if (!isDone) {
                isDone = true;
                done();
            };
        }, 10000);

    });

    it("containsAll : 1", function(done) {

        var isDone = false;

        this.timeout(30000);
        //create the query.
        var query = new CB.CloudQuery('Student');
        query.containsAll('age', [11]);

        CB.CloudObject.on('Student', 'created', query, function() {
            if (!isDone) {
                isDone = true;
                done();
            };
        });

        //attach it to the event.
        var obj = new CB.CloudObject('Student');
        obj.set('age', 11);
        obj.save();
    });

    it("containsAll : 2", function(done) {

        var isDone = false;

        this.timeout(30000);
        //create the query.
        var query = new CB.CloudQuery('Student');
        query.containsAll('age', [8]);

        CB.CloudObject.on('Student', 'created', query, function() {
            CB.CloudObject.off('Student', 'created');
            if (!isDone) {
                isDone = true;
                done("Fired a wrong event");
            }
        });

        //attach it to the event.
        var obj = new CB.CloudObject('Student');
        obj.set('age', 9);
        obj.save();

        setTimeout(function() {
            if (!isDone) {
                isDone = true;
                done();
            };
        }, 10000);

    });

    it("or : 1", function(done) {

        var isDone = false;

        this.timeout(30000);
        //create the query.
        var query1 = new CB.CloudQuery('Student');
        query1.equalTo('age', 8);

        var query2 = new CB.CloudQuery('Student');
        query2.equalTo('name', 'Nawaz');

        var query = CB.CloudQuery.or(query1, query2);

        CB.CloudObject.on('Student', 'created', query, function() {
            if (!isDone) {
                isDone = true;
                done();
            };
        });

        //attach it to the event.
        var obj = new CB.CloudObject('Student');
        obj.set('age', 8);
        obj.save();
    });

    it("or : 2", function(done) {

        var isDone = false;

        this.timeout(30000);
        //create the query.
        var query1 = new CB.CloudQuery('Student');
        query1.equalTo('age', 8);

        var query2 = new CB.CloudQuery('Student');
        query2.equalTo('name', 'Nawaz');

        var query = CB.CloudQuery.or(query1, query2);

        CB.CloudObject.on('Student', 'created', query, function() {
            CB.CloudObject.off('Student', 'created');
            if (!isDone) {
                isDone = true;
                done("Fired a wrong event");
            }
        });

        //attach it to the event.
        var obj = new CB.CloudObject('Student');
        obj.set('age', 9);
        obj.save();

        setTimeout(function() {
            if (!isDone) {
                isDone = true;
                done();
            };
        }, 10000);

    });

    // it("startsWith : 1",function(done){

    //     var isDone = false;

    //     this.timeout(30000);
    //     //create the query.
    //     var query = new CB.CloudQuery('Student');
    //     query.startsWith('name','N');

    //     CB.CloudObject.on('Student', 'created', query, function(){
    //        if(!isDone){
    //                 isDone=true;
    //                 done();
    //             };
    //     });

    //     //attach it to the event.
    //     var obj = new CB.CloudObject('Student');
    //     obj.set('name','Nawaz');
    //     obj.save();
    // });

    // it("startsWith : 2",function(done){

    //     var isDone = false;

    //     this.timeout(30000);

    //     var query = new CB.CloudQuery('Student');
    //     query.startsWith('name','N');

    //     CB.CloudObject.on('Student', 'created', query, function(){
    //         CB.CloudObject.off('Student','created');
    //         if(!isDone){
    //                 isDone=true;
    //                 done("Fired a wrong event");
    //             }
    //     });

    //     //attach it to the event.
    //     var obj = new CB.CloudObject('Student');
    //     obj.set('name','x');
    //     obj.save();

    //     setTimeout(function(){
    //         if(!isDone){
    //                 isDone=true;
    //                 done();
    //             };
    //     }, 10000);

    // });

    it("EqualTo over CloudObjects : 1", function(done) {

        var isDone = false;

        this.timeout(40000);

        var child = new CB.CloudObject('student1');
        child.save({
            success: function(child) {

                //create the query.
                var query = new CB.CloudQuery('Custom2');
                query.equalTo('newColumn7', child);

                CB.CloudObject.on('Custom2', 'created', query, function(data) {
                    if (!isDone) {
                        isDone = true;
                        done();
                    }
                });

                var obj = new CB.CloudObject('Custom2');
                obj.set('newColumn7', child);
                obj.save();

            },
            error: function(error) {
                done("Object cannot be saved");
            }
        });
    });

    it("EqualTo over CloudObjects : 2", function(done) {

        var isDone = false;

        this.timeout(40000);

        var child = new CB.CloudObject('student1');

        child.save({
            success: function(child) {
                var child2 = new CB.CloudObject('student1');

                child2.save({
                    success: function(child2) {
                        //create the query.
                        var query = new CB.CloudQuery('Custom2');
                        query.equalTo('newColumn7', child2);

                        CB.CloudObject.on('Custom2', 'created', query, function(data) {
                            if (!isDone) {
                                isDone = true;
                                done("Wrong event fired");
                            }
                        });

                        var obj = new CB.CloudObject('Custom2');
                        obj.set('newColumn7', child);
                        obj.save();

                        setTimeout(function() {
                            if (!isDone) {
                                isDone = true;
                                done();
                            };
                        }, 10000);
                    },
                    error: function(error) {
                        done("Object cannot be saved");
                    }
                });

            },
            error: function(error) {
                done("Object cannot be saved");
            }
        });
    });

    it("ContainedIn : 1", function(done) {

        var isDone = false;

        this.timeout(40000);

        var child = new CB.CloudObject('student1');
        child.save({
            success: function(child) {

                //create the query.
                var query = new CB.CloudQuery('Custom4');
                query.containedIn('newColumn7', [child]);

                CB.CloudObject.on('Custom4', 'created', query, function(data) {
                    if (!isDone) {
                        isDone = true;
                        done();
                    }
                });

                var obj = new CB.CloudObject('Custom4');
                obj.set('newColumn7', [child]);
                obj.save();

            },
            error: function(error) {
                done("Object cannot be saved");
            }
        });
    });

    it("ContainedIn : 2", function(done) {

        var isDone = false;

        this.timeout(40000);

        var child = new CB.CloudObject('student1');

        child.save({
            success: function(child) {
                var child2 = new CB.CloudObject('student1');

                child2.save({
                    success: function(child2) {
                        //create the query.
                        var query = new CB.CloudQuery('Custom4');
                        query.containedIn('newColumn7', [child2]);

                        CB.CloudObject.on('Custom4', 'created', query, function(data) {
                            if (!isDone) {
                                isDone = true;
                                done("Wrong event fired");
                            }
                        });

                        var obj = new CB.CloudObject('Custom4');
                        obj.set('newColumn7', [child]);
                        obj.save();

                        setTimeout(function() {
                            if (!isDone) {
                                isDone = true;
                                done();
                            };
                        }, 10000);
                    },
                    error: function(error) {
                        done("Object cannot be saved");
                    }
                });

            },
            error: function(error) {
                done("Object cannot be saved");
            }
        });
    });

    it("ContainsAll : 1", function(done) {

        var isDone = false;

        this.timeout(40000);

        var child = new CB.CloudObject('student1');
        child.save({
            success: function(child) {

                //create the query.
                var query = new CB.CloudQuery('Custom4');
                query.containsAll('newColumn7', [child]);

                CB.CloudObject.on('Custom4', 'created', query, function(data) {
                    if (!isDone) {
                        isDone = true;
                        done();
                    }
                });

                var obj = new CB.CloudObject('Custom4');
                obj.set('newColumn7', [child]);
                obj.save();

            },
            error: function(error) {
                done("Object cannot be saved");
            }
        });
    });

    it("ContainsAll : 2", function(done) {

        var isDone = false;

        this.timeout(40000);

        var child = new CB.CloudObject('student1');

        child.save({
            success: function(child) {
                var child2 = new CB.CloudObject('student1');

                child2.save({
                    success: function(child2) {
                        //create the query.
                        var query = new CB.CloudQuery('Custom4');
                        query.containsAll('newColumn7', [child2]);

                        CB.CloudObject.on('Custom4', 'created', query, function(data) {
                            if (!isDone) {
                                isDone = true;
                                done("Wrong event fired");
                            }
                        });

                        var obj = new CB.CloudObject('Custom4');
                        obj.set('newColumn7', [child]);
                        obj.save();

                        setTimeout(function() {
                            if (!isDone) {
                                isDone = true;
                                done();
                            };
                        }, 10000);
                    },
                    error: function(error) {
                        done("Object cannot be saved");
                    }
                });

            },
            error: function(error) {
                done("Object cannot be saved");
            }
        });
    });

    it("notContainedIn : 1", function(done) {

        var isDone = false;

        this.timeout(40000);

        var child = new CB.CloudObject('student1');
        child.save({
            success: function(child) {

                //create the query.
                var query = new CB.CloudQuery('Custom4');
                query.notContainedIn('newColumn7', [child]);

                CB.CloudObject.on('Custom4', 'created', query, function(data) {
                    if (!isDone) {
                        isDone = true;
                        done("Wrong event fired");
                    }
                });

                var obj = new CB.CloudObject('Custom4');
                obj.set('newColumn7', [child]);
                obj.save();

                setTimeout(function() {
                    if (!isDone) {
                        isDone = true;
                        done();
                    };
                }, 10000);

            },
            error: function(error) {
                done("Object cannot be saved");
            }
        });
    });

    it("notContainedIn : 2", function(done) {

        var isDone = false;

        this.timeout(40000);

        var child = new CB.CloudObject('student1');

        child.save({
            success: function(child) {
                var child2 = new CB.CloudObject('student1');

                child2.save({
                    success: function(child2) {
                        //create the query.
                        var query = new CB.CloudQuery('Custom4');
                        query.notContainedIn('newColumn7', [child2]);

                        CB.CloudObject.on('Custom4', 'created', query, function(data) {
                            if (!isDone) {
                                isDone = true;
                                done();
                            }
                        });

                        var obj = new CB.CloudObject('Custom4');
                        obj.set('newColumn7', [child]);
                        obj.save();

                    },
                    error: function(error) {
                        done("Object cannot be saved");
                    }
                });

            },
            error: function(error) {
                done("Object cannot be saved");
            }
        });
    });

});

describe("CloudObject - Encryption", function (done) {

    it("should encrypt passwords", function (done) {

        this.timeout(20000);
        
        var obj = new CB.CloudObject('User');
        obj.set('username',util.makeEmail());
        obj.set('password','password');
        obj.set('email',util.makeEmail());
        obj.save().then(function(obj){
            if(obj.get('password') !== 'password')
                done();
            else
                throw "Cannot encrypt";
        }, function(){
            throw "Cannot save a CloudObject";
        });

    });

    it("should not encrypt already encrypted passwords", function (done) {

        this.timeout(20000);

        var obj = new CB.CloudObject('User');
        obj.set('username',util.makeEmail());
        obj.set('password','password');
        obj.set('email',util.makeEmail());
        obj.save().then(function(obj){
            var query = new CB.CloudQuery('User');
            query.findById(obj.get('id')).then(function(obj1){
                obj1.set('updatedAt',new Date());
                obj1.save().then(function(obj2){
                    if(obj1.get('password') === obj2.get('password'))
                        done();
                    else
                        throw "password encrypted twice";
                },function(){
                    throw "Encrypted the password field again";
                });
            }, function (err) {
                throw "unable to find object by id";
            });
        }, function(){
            throw "Cannot save a CloudObject";
        });

    });

});
describe("CloudExpire", function () {

    it("Sets Expire in Cloud Object.", function (done) {

        this.timeout(30000);
        //create an object.
        var obj = new CB.CloudObject('Custom');
        obj.set('newColumn1', 'abcd');
        obj.save().then(function(obj1) {
            if(obj1)
                done();
            else
                throw "unable to save expires";
        }, function (err) {           
            throw "Relation Expire error";
        });

    });

    it("Checks if the expired object shows up in the search or not", function (done) {

        this.timeout(30000);
        var curr=new Date().getTime();
        var query = new CB.CloudQuery('Custom');
        query.find().then(function(list){
            if(list.length>0){
                var __success = false;
                for(var i=0;i<list.length;i++){
                    if(list[i].get('expires')>curr || !list[i].get('expires')){
                           __success = true;
                            done();
                            break;
                        }
                    else{
                        throw "Expired Values also shown Up";
                    }
                    }
            }else{
                done();
            }

        }, function(error){
            done(error);
        })

    });

});
describe("CloudQuery Include", function (done) {
    
   
    
    it("save a relation.", function (done) {
        
        this.timeout(30000);

        //create an object. 
        var obj = new CB.CloudObject('Custom4');
        obj.set('newColumn1', 'Course');
        var obj1 = new CB.CloudObject('student1');
        obj1.set('name', 'Vipul');
        var obj2= new CB.CloudObject('student1');
        obj2.set('name', 'Nawaz');
        obje=[obj1,obj2];
        obj.set('newColumn7', obje);
        obj.save().then(function() {
            done();
        }, function () { 
            throw "Relation Save error";
        });

    });

    it("save a Multi-Join.", function (done) {

        this.timeout(30000);

        //create an object.
        var obj = new CB.CloudObject('Custom2');
        obj.set('newColumn1', 'Course');
        var obj1 = new CB.CloudObject('student1');
        var obj2 = new CB.CloudObject('hostel');
        var obj3 = new CB.CloudObject('Custom3');
        obj3.set('address','progress');
        obj.set('newColumn2',obj3);
        obj2.set('room',509);
        obj1.set('name', 'Vipul');
        obj.set('newColumn7', obj1);
        obj1.set('newColumn',obj2);
        obj.save().then(function() {
            done();
        }, function () {
            throw "Relation Save error";
        });

    });

    it("should include a relation object when include is requested in a query.", function (done) {

        this.timeout(30000);

        var obj = new CB.CloudObject('Custom2');
        obj.set('newColumn1', 'Course');
        var obj1 = new CB.CloudObject('student1');
        var obj2 = new CB.CloudObject('hostel');
        var obj3 = new CB.CloudObject('Custom3');
        obj3.set('address','progress');
        obj.set('newColumn2',obj3);
        obj2.set('room',509);
        obj1.set('name', 'Vipul');
        obj.set('newColumn7', obj1);
        obj1.set('newColumn',obj2);
        obj.set('newColumn7', obj1);
        obj.save().then(function(obj) {
            var query = new CB.CloudQuery('Custom2');
            query.include('newColumn7');
            query.include('newColumn7.newColumn');
            query.include('newColumn2');
            query.equalTo('id',obj.id);
            query.find().then(function(list){
                if(list.length>0){
                    for(var i=0;i<list.length;i++){
                        var student_obj=list[i].get('newColumn7');
                        var room=student_obj.get('newColumn');
                        var address=list[i].get('newColumn2');
                        if(!student_obj.get('name') || !room.get('room') || !address.get('address'))
                            throw "Unsuccessful Join";
                    }
                    done();
                }else{
                    throw "Cannot retrieve a saved relation.";
                }
            }, function(error){
                    throw "Cannot find";
            });
            
        }, function () { 
            throw "Relation Save error";
        });
    });


    it("should not return duplicate objects in relation list after saving", function (done) {

        this.timeout(30000);     
       
        var obj1 = new CB.CloudObject('student1');
        obj1.set('name', 'Vipul');
       
        var obj = new CB.CloudObject('Custom4');
        obj.set('newColumn7', [obj1,obj1]);
        obj.save().then(function(respObj) {

            if(respObj.get("newColumn7").length==2){
                done("returning duplicate objects");
            }else{
                done();
            }            
        }, function (error) {
            done(error);            
        });
    });

    it("should not return duplicate objects in relation list on Querying", function (done) {

        this.timeout(30000);     
       
        var obj1 = new CB.CloudObject('student1');
        obj1.set('name', 'sjdgsduj');
       
        var obj = new CB.CloudObject('Custom4');
        obj.set('newColumn7', [obj1,obj1]);
        obj.save().then(function(respObj) {

            var obj = new CB.CloudQuery('Custom4');
            obj.include('newColumn7');
            obj.findById(respObj.get("id"),{success : function(queriedObj){ 

                if(queriedObj.get("newColumn7").length==2){
                    done("returning duplicate objects");
                }else{
                    done();
                } 
            }, error : function(error){ 
              done(error);             
            }});

            
        }, function (error) { 
            done(error);
        });
    });


    it("should include a relation on distinct.", function (done) {

        this.timeout(30000);

        var obj = new CB.CloudObject('Custom2');
        obj.set('newColumn1', 'text');

        var obj1 = new CB.CloudObject('student1');
        obj1.set('name', 'Vipul');
        obj.set('newColumn7', obj1);
    
        obj.save({
            success : function(obj){
                var query = new CB.CloudQuery('Custom2');
                query.include('newColumn7');
                query.distinct('newColumn1').then(function(list){
                    var status = false;
                    if(list.length>0){
                        for(var i=0;i<list.length;i++){
                            var student_obj=list[i].get('newColumn7');
                            if(student_obj && student_obj.get('name'))
                                status = true;
                        }
                        if(status === true){
                            done();
                        }else{
                            throw "Cannot retrieve a saved relation.";
                        }
                    }else{
                        throw "Cannot retrieve a saved relation.";
                    }
                }, function(error){
                    throw "Unsuccessful join"
                });
            }, error : function(error){
                throw "Cannot save a CloudObject";
            }
        })
    });

    it("should query over a linked column if a object is passed in equalTo",function(done){
            this.timeout(30000);

            var hostel = new CB.CloudObject('hostel');
            var student = new CB.CloudObject('student1');
            hostel.set('room',789);
            student.set('newColumn',hostel);
            student.save().then(function(list){
                var query1 = new CB.CloudQuery('student1');
                var temp = list.get('newColumn');
                query1.equalTo('newColumn',temp);
                query1.find().then(function(obj){
                    //
                    done();
                }, function () {
                    throw "";
                });
                //
            },function(){
                throw "unable to save data";
            })
    });


    it("should run containedIn over list of CloudObjects",function(done){

            this.timeout(300000);

            var obj = new CB.CloudObject('Custom');
            var obj1 = new CB.CloudObject('Custom');

            var obj2 = new CB.CloudObject('Custom');

            obj.set('newColumn7', [obj2,obj1]);

            obj.save().then(function(obj){
                var query = new CB.CloudQuery('Custom');
                query.containedIn('newColumn7', obj.get('newColumn7')[0]);
                query.find().then(function(list){
                    if(list.length>0){
                        done();
                    }else{
                        throw "Cannot query";
                    }
                }, function(error){
                    throw "Cannot query";
                });
            }, function(error){
                throw "Cannot save an object";
            });

            
    });


     it("should run containedIn over list of CloudObjects by passing a list of CloudObjects",function(done){

            this.timeout(300000);

            var obj = new CB.CloudObject('Custom');
            var obj1 = new CB.CloudObject('Custom');

            var obj2 = new CB.CloudObject('Custom');

            obj.set('newColumn7', [obj2,obj1]);

            obj.save().then(function(obj){
                var query = new CB.CloudQuery('Custom');
                query.containedIn('newColumn7', obj.get('newColumn7'));
                query.find().then(function(list){
                    if(list.length>0){
                        done();
                    }else{
                        throw "Cannot query";
                    }
                }, function(error){
                    throw "Cannot query";
                });
            }, function(error){
                throw "Cannot save an object";
            });

            
    });

    it("should include with findById",function(done){

            this.timeout(300000);
            var obj = new CB.CloudObject('Custom');
            var obj1 = new CB.CloudObject('Custom');
            var obj2 = new CB.CloudObject('Custom');
            obj2.set('newColumn1','sample');
            obj.set('newColumn7', [obj2,obj1]);
            obj.save().then(function(obj){
                var query = new CB.CloudQuery('Custom');
                query.include('newColumn7');
                query.findById(obj.id).then(function(obj){
                   if(obj.get('newColumn7').length>0){
                     if(obj.get('newColumn7')[0].get('newColumn1') === 'sample'){
                        done();
                     }else{
                        throw "did not include sub documents";
                     }
                   }else{
                        throw "Cannot get the list";
                   }
                }, function(error){
                    throw "Cannot query";
                });
            }, function(error){
                throw "Cannot save an object";
            });            
    });

});
describe("CloudQuery", function(done) {

    var obj = new CB.CloudObject('student1');

    it("Should save data with a particular value.", function(done) {

        this.timeout(30000);

        obj.set('name', 'vipul');
        obj.save().then(function(list) {
            if (list.get('name') === 'vipul')
                done();
            else
                throw "object could not saved properly";
            }
        , function() {
            throw "data Save error";
        });

    });

    it("Should save data with a particular value.", function(done) {

        this.timeout(30000);

        obj.set('name', 'abrakadabra');
        obj.save().then(function(list) {
            if (list.get('name') === 'abrakadabra') {
                var query = new CB.CloudQuery('student1');
                query.substring("name", "kad");
                query.find({
                    success: function(list) {
                        if (list.length > 0) {
                            if (list[0].get("name") === "abrakadabra") {
                                done();
                            } else {
                                done("Got the list but got incorrect name");
                            }
                        } else {
                            done("Failed to get the list");
                        }
                    },
                    error: function(error) {
                        done("Failed to save the object");
                    }
                });
            } else
                done("object could not saved properly");
            }
        , function() {
            throw "data Save error";
        });
    });

    it("Should query with substring and case insensitive.", function(done) {

        this.timeout(30000);

        obj.set('name', 'VIPUL');
        obj.save().then(function(list) {
            if (list.get('name') === 'VIPUL') {

                var query = new CB.CloudQuery('student1');
                query.substring("name", "pu", true);
                query.find({
                    success: function(list) {

                        if (list.length > 0) {

                            var foundObj = false;
                            for (var i = 0; i < list.length; ++i) {
                                if (list[i].get("name") === "VIPUL") {
                                    foundObj = true;
                                }
                            }

                            if (foundObj) {
                                done();
                            } else {
                                done("Got the list but got incorrect name");
                            }

                        } else {
                            done("Failed to get the list");
                        }

                    },
                    error: function(error) {
                        done("Failed to save the object");
                    }
                });

            } else
                done("object could not saved properly");
            }
        , function() {
            throw "data Save error";
        });
    });

    it("Substring with an array.", function(done) {

        this.timeout(30000);

        var obj2 = new CB.CloudObject('student1');
        obj2.set('name', 'nawaz');
        obj2.save().then(function(list) {
            if (list.get('name') === 'nawaz') {
                var query = new CB.CloudQuery('student1');
                query.substring("name", ["pu", "aw"]);
                query.find({
                    success: function(list) {
                        if (list.length > 0) {
                            done();
                        } else {
                            done("Failed to get the list");
                        }
                    },
                    error: function(error) {
                        done("Failed to save the object");
                    }
                });
            } else
                done("object could not saved properly");
            }
        , function() {
            throw "data Save error";
        });
    });

    it("Substring with an array and array.", function(done) {

        this.timeout(30000);

        var obj2 = new CB.CloudObject('student1');
        obj2.set('name', 'nawaz');
        obj2.save().then(function(list) {
            if (list.get('name') === 'nawaz') {
                var query = new CB.CloudQuery('student1');
                query.substring([
                    "name", "age"
                ], ["pu", "aw"]);
                query.find({
                    success: function(list) {
                        if (list.length > 0) {
                            done();
                        } else {
                            done("Failed to get the list");
                        }
                    },
                    error: function(error) {
                        done("Failed to save the object");
                    }
                });
            } else
                done("object could not saved properly");
            }
        , function() {
            throw "data Save error";
        });
    });

    it("select column should work on find", function(done) {
        this.timeout(30000);
        var obj1 = new CB.CloudObject('Custom1');
        obj1.set('newColumn', 'sample');
        obj1.set('description', 'sample2');
        obj1.save().then(function(obj) {
            var cbQuery = new CB.CloudQuery('Custom1');
            cbQuery.equalTo('id', obj.id);
            cbQuery.selectColumn('newColumn');
            cbQuery.find({
                success: function(objList) {
                    if (objList.length > 0)
                        if (!objList[0].get('description'))
                            done();
                        else
                            throw "Select doesn't work";
                else
                        throw "Cannot query over select ";
                    }
                ,
                error: function(err) {
                    throw "Error querying object.";
                }
            });
        }, function() {
            throw "should save the object";
        });
    });

    it("containedIn should work on Id", function(done) {
        this.timeout(30000);
        var obj1 = new CB.CloudObject('Custom1');
        obj1.set('newColumn', 'sample');
        obj1.set('description', 'sample2');
        obj1.save().then(function(obj1) {
            var obj2 = new CB.CloudObject('Custom1');
            obj2.set('newColumn', 'sample');
            obj2.set('description', 'sample2');
            obj2.save().then(function(obj2) {
                var obj3 = new CB.CloudObject('Custom1');
                obj3.set('newColumn', 'sample');
                obj3.set('description', 'sample2');
                obj3.save().then(function(obj3) {

                    var cbQuery = new CB.CloudQuery('Custom1');
                    cbQuery.containedIn('id', [obj1.id, obj3.id]);
                    cbQuery.find({
                        success: function(objList) {
                            if (objList.length === 2)
                                done();
                            else
                                done("Cannot do contains in on Id");
                            }
                        ,
                        error: function(err) {
                            throw "Error querying object.";
                        }
                    });
                }, function() {
                    throw "should save the object";
                });

            }, function() {
                throw "should save the object";
            });

        }, function() {
            throw "should save the object";
        });
    });

    it("select column should work on distinct", function(done) {
        this.timeout(30000);
        var obj1 = new CB.CloudObject('Custom1');
        obj1.set('newColumn', 'sample');
        obj1.set('description', 'sample2');
        obj1.save().then(function(obj) {
            var cbQuery = new CB.CloudQuery('Custom1');
            cbQuery.equalTo('id', obj.id);
            cbQuery.selectColumn('newColumn');
            cbQuery.distinct('id', {
                success: function(objList) {
                    if (objList.length > 0)
                        if (!objList[0].get('description'))
                            done();
                        else
                            throw "Select doesn't work";
                else
                        throw "Cannot query over select ";
                    }
                ,
                error: function(err) {
                    throw "Error querying object.";
                }
            });

        }, function() {
            throw "should save the object";
        });
    });

    it("should retrieve items when column name is null (from equalTo function)", function(done) {
        this.timeout(30000);

        var obj = new CB.CloudObject('student1');
        obj.save().then(function(obj) {
            var query = new CB.CloudQuery('student1');
            query.equalTo('name', null);
            query.find().then(function(list) {

                //check all the objects returned.
                for (var i = 0; i < list.length; i++) {
                    if (list[i].get('name')) {
                        throw "Name exists";
                    }
                }

                if (list.length > 0) {
                    done();
                } else
                    throw "object could not queried properly";
                }
            , function(err) {
                done(err);
            });
        }, function(error) {
            throw "object could not saved properly";
        });
    });

    it("should retrieve items when column name is NOT null (from NotEqualTo function)", function(done) {
        this.timeout(30000);

        var obj = new CB.CloudObject('student1');
        obj.set('name', 'sampleName');
        obj.save().then(function(obj) {
            var query = new CB.CloudQuery('student1');
            query.notEqualTo('name', null);
            query.find().then(function(list) {

                //check all the objects returned.
                for (var i = 0; i < list.length; i++) {
                    if (!list[i].get('name')) {
                        throw "Name does not exists";
                    }
                }
                if (list.length > 0)
                    done();
                else
                    throw "object could not queried properly";
                }
            , function(err) {
                done(err);
            });
        }, function(error) {
            throw "object could not saved properly";
        });

    });

    it("should retrieve items when column name is not null (from notEqualTo function)", function(done) {
        this.timeout(30000);

        var query = new CB.CloudQuery('student1');
        query.equalTo('id', obj.get('id'));
        query.find().then(function(list) {
            if (list.length > 0)
                done();
            else
                throw "object could not saved properly";
            }
        , function(err) {
            done(err);
        });
    });

    it("should find data with id", function(done) {

        this.timeout(30000);

        var query = new CB.CloudQuery('student1');
        query.equalTo("id", obj.get('id'));
        query.find().then(function(list) {
            if (list.length > 0) {
                done();
            } else {
                throw "unable to retrive data";
            }
        }, function(err) {
            throw "unable to retrieve data";
        });

    });

    it("should return count as an integer", function(done) {

        this.timeout(30000);

        var query = new CB.CloudQuery('student1');
        query.count({
            success: function(count) {
                //count is the count of data which belongs to the query
                if (count === parseInt(count, 10))
                    done();
                else
                    throw "Count returned is not of type integer.";
                }
            ,
            error: function(err) {
                //Error in retrieving the data.
                throw "Error getting count.";
            }
        });

    });

    it("Should count the no.of objects", function(done) {

        this.timeout(40000);

        CB.appKey = CB.masterKey;

        var Name = new CB.Column('name');
        Name.dataType = 'Text';

        var table = new CB.CloudTable('countobjectsxx');
        table.addColumn(Name);

        table.save().then(function(res) {

            CB.appKey = CB.jsKey;

            var obj1 = new CB.CloudObject('countobjectsxx');
            obj1.set('name', 'abcd');

            var obj2 = new CB.CloudObject('countobjectsxx');
            obj2.set('name', 'pqrs');

            var obj3 = new CB.CloudObject('countobjectsxx');
            obj3.set('name', 'gdgd');

            var obj4 = new CB.CloudObject('countobjectsxx');
            obj4.set('name', 'sjdhsjd');

            CB.CloudObject.saveAll([
                obj1, obj2, obj3, obj4
            ], {
                success: function(res) {

                    var totalObjectsInDB = res.length;

                    var obj = new CB.CloudQuery('countobjectsxx');
                    obj.count({
                        success: function(number) {
                            if (number != totalObjectsInDB) {
                                done("Count is not as expected.");
                            } else {
                                done();
                            }
                        },
                        error: function(error) {
                            done(error);
                        }
                    });

                },
                error: function(err) {
                    done(err);
                }
            });

        }, function(err) {
            CB.appKey = CB.jsKey;
            done(err);
            throw "Unable to Create Table";
        });

    });

    it("Should count with OR query", function(done) {

        this.timeout(40000);

        CB.appKey = CB.masterKey;

        var Name = new CB.Column('name');
        Name.dataType = 'Text';

        var table = new CB.CloudTable('countorquery');
        table.addColumn(Name);

        table.save().then(function(res) {

            CB.appKey = CB.jsKey;

            var obj1 = new CB.CloudObject('countorquery');
            obj1.set('name', 'pqrs');

            var obj2 = new CB.CloudObject('countorquery');
            obj2.set('name', 'pqrs');

            var obj3 = new CB.CloudObject('countorquery');
            obj3.set('name', 'sjdhsjd');

            var obj4 = new CB.CloudObject('countorquery');
            obj4.set('name', 'sjdhsjd');

            CB.CloudObject.saveAll([
                obj1, obj2, obj3, obj4
            ], {
                success: function(res) {

                    var totalObjectsInDB = res.length;

                    var query1 = new CB.CloudQuery('countorquery');
                    var query2 = new CB.CloudQuery('countorquery');

                    query1.equalTo('name', "sjdhsjd");
                    query2.equalTo('name', "pqrs");

                    var query = CB.CloudQuery.or(query1, query2);

                    query.count({
                        success: function(number) {
                            done();
                        },
                        error: function(error) {
                            done(error);
                        }
                    });

                },
                error: function(err) {
                    done(err);
                }
            });

        }, function(err) {
            CB.appKey = CB.jsKey;
            done(err);
            throw "Unable to Create Table";
        });

    });

    it("Should count with Multi level OR query", function(done) {

        this.timeout(40000);

        CB.appKey = CB.masterKey;

        var Name = new CB.Column('name');
        Name.dataType = 'Text';

        var table = new CB.CloudTable('countmultiorquery');
        table.addColumn(Name);

        table.save().then(function(res) {

            CB.appKey = CB.jsKey;

            var obj1 = new CB.CloudObject('countmultiorquery');
            obj1.set('name', 'pqrs');

            var obj2 = new CB.CloudObject('countmultiorquery');
            obj2.set('name', 'pqrs');

            var obj3 = new CB.CloudObject('countmultiorquery');
            obj3.set('name', 'sjdhsjd');

            var obj4 = new CB.CloudObject('countmultiorquery');
            obj4.set('name', 'sjdhsjd');

            CB.CloudObject.saveAll([
                obj1, obj2, obj3, obj4
            ], {
                success: function(res) {

                    var totalObjectsInDB = res.length;

                    var multiquery1 = new CB.CloudQuery('countmultiorquery');
                    var multiquery2 = new CB.CloudQuery('countmultiorquery');

                    multiquery1.equalTo('name', "pqrs");
                    multiquery2.equalTo('name', "sjdhsjd");

                    var query1 = CB.CloudQuery.or(multiquery1, multiquery2);

                    var query2 = new CB.CloudQuery('countmultiorquery');
                    query2.equalTo('name', "pqrs");

                    var query = CB.CloudQuery.or(query1, query2);

                    query.count({
                        success: function(number) {
                            done();
                        },
                        error: function(error) {
                            done(error);
                        }
                    });

                },
                error: function(err) {
                    done(err);
                }
            });

        }, function(err) {
            CB.appKey = CB.jsKey;
            done(err);
            throw "Unable to Create Table";
        });

    });

    it("should find item by id", function(done) {
        this.timeout(30000);
        var query = new CB.CloudQuery('student1');
        query.equalTo('id', obj.get('id'));
        query.find().then(function(list) {
            if (list.length > 0)
                done();
            else
                done (new Error("object could not saved properly"));
            }
        , function(err) {
            done(err);
        });
    });

    it("should run a find one query", function(done) {

        this.timeout(40000);

        CB.appKey = CB.masterKey;

        var Name = new CB.Column('name');
        Name.dataType = 'Text';

        var table = new CB.CloudTable('findonequery');
        table.addColumn(Name);

        table.save().then(function(res) {

            CB.appKey = CB.jsKey;

            var obj1 = new CB.CloudObject('findonequery');
            obj1.set('name', 'vipul');

            CB.CloudObject.saveAll([obj1], {
                success: function(res) {

                    var query = new CB.CloudQuery('findonequery');
                    query.equalTo('name', 'vipul');
                    query.findOne().then(function(list) {
                        if (list.get('name') === 'vipul')
                            done();
                        else {
                            done("unable to get");
                        }
                    }, function(err) {
                        done(err);
                    });

                },
                error: function(err) {
                    done(err);
                }
            });

        }, function(err) {
            CB.appKey = CB.jsKey;
            done(err);
            throw "Unable to Create Table";
        });

    });

    it("Should retrieve data with a particular value.", function(done) {

        this.timeout(40000);

        CB.appKey = CB.masterKey;

        var Name = new CB.Column('name');
        Name.dataType = 'Text';

        var table = new CB.CloudTable('particularquery');
        table.addColumn(Name);

        table.save().then(function(res) {

            CB.appKey = CB.jsKey;

            var obj1 = new CB.CloudObject('particularquery');
            obj1.set('name', 'vipul');

            CB.CloudObject.saveAll([obj1], {
                success: function(res) {

                    var obj = new CB.CloudQuery('particularquery');
                    obj.equalTo('name', 'vipul');
                    obj.find().then(function(list) {
                        if (list.length > 0) {
                            var found = false;
                            for (var i = 0; i < list.length; i++) {
                                if (list[i].get('name') == 'vipul') {
                                    found = true;
                                    break;
                                }
                            }
                        } else {
                            done("failed to retrieve saved data with particular value ");
                        }
                        if (found) {
                            done();
                        } else {
                            done("failed to retrieve saved data with particular value ");
                        }

                    }, function(error) {
                        done(error);
                    });

                },
                error: function(err) {
                    done(err);
                }
            });

        }, function(err) {
            CB.appKey = CB.jsKey;
            done(err);
            throw "Unable to Create Table";
        });

    });

    it("Should perform OR query with 2 Query Objects", function(done) {

        this.timeout(40000);

        CB.appKey = CB.masterKey;

        var Name = new CB.Column('name');
        Name.dataType = 'Text';

        var table = new CB.CloudTable('ortwoquery');
        table.addColumn(Name);

        table.save().then(function(res) {

            CB.appKey = CB.jsKey;

            var obj1 = new CB.CloudObject('ortwoquery');
            obj1.set('name', 'pqrs');

            var obj2 = new CB.CloudObject('ortwoquery');
            obj2.set('name', 'pqrs');

            var obj3 = new CB.CloudObject('ortwoquery');
            obj3.set('name', 'sjdhsjd');

            var obj4 = new CB.CloudObject('ortwoquery');
            obj4.set('name', 'sjdhsjd');

            CB.CloudObject.saveAll([
                obj1, obj2, obj3, obj4
            ], {
                success: function(res) {

                    var query1 = new CB.CloudQuery('ortwoquery');
                    var query2 = new CB.CloudQuery('ortwoquery');

                    query1.equalTo('name', "pqrs");
                    query2.equalTo('name', "sjdhsjd");

                    var query = CB.CloudQuery.or(query1, query2);

                    query.find({
                        success: function(data) {
                            if (data) {
                                done();
                            } else {
                                done("Failed to retrieve data with OR query");
                            }

                        },
                        error: function(error) {
                            done(error);
                        }
                    });

                },
                error: function(err) {
                    done(err);
                }
            });

        }, function(err) {
            CB.appKey = CB.jsKey;
            done(err);
            throw "Unable to Create Table";
        });

    });

    it("Should perform OR query with Array of Queries", function(done) {

        this.timeout(40000);

        CB.appKey = CB.masterKey;

        var Name = new CB.Column('name');
        Name.dataType = 'Text';

        var table = new CB.CloudTable('orarrayquery');
        table.addColumn(Name);

        table.save().then(function(res) {

            CB.appKey = CB.jsKey;

            var obj1 = new CB.CloudObject('orarrayquery');
            obj1.set('name', 'pqrs');

            var obj2 = new CB.CloudObject('orarrayquery');
            obj2.set('name', 'pqrs');

            var obj3 = new CB.CloudObject('orarrayquery');
            obj3.set('name', 'sjdhsjd');

            var obj4 = new CB.CloudObject('orarrayquery');
            obj4.set('name', 'sjdhsjd');

            CB.CloudObject.saveAll([
                obj1, obj2, obj3, obj4
            ], {
                success: function(res) {

                    var query1 = new CB.CloudQuery('orarrayquery');
                    var query2 = new CB.CloudQuery('orarrayquery');

                    query1.equalTo('name', "pqrs");
                    query2.equalTo('name', "sjdhsjd");

                    var queryArray = [];
                    queryArray.push(query1);
                    queryArray.push(query2);

                    var query = CB.CloudQuery.or(queryArray);

                    query.find({
                        success: function(data) {
                            if (data) {
                                done();
                            } else {
                                done("Failed to retrieve data with OR query");
                            }

                        },
                        error: function(error) {
                            done(error);
                        }
                    });

                },
                error: function(err) {
                    done(err);
                }
            });

        }, function(err) {
            CB.appKey = CB.jsKey;
            done(err);
            throw "Unable to Create Table";
        });

    });

    it("Should save list with in column", function(done) {

        this.timeout(30000);

        var obj = new CB.CloudObject('student4');
        obj.set('subject', ['java', 'python']);
        obj.save().then(function() {
            done();
        }, function() {
            throw "list Save error";
        });

    });

    it("Should retrieve list matching with several different values", function(done) {

        this.timeout(30000);
        var obj = new CB.CloudObject('student4');
        obj.set('subject', ['java', 'python']);
        obj.save().then(function() {
            var obj = new CB.CloudQuery('student4');
            obj.containsAll('subject', ['java', 'python']);
            obj.find().then(function(list) {
                if (list.length > 0) {
                    for (var i = 0; i < list.length; i++) {
                        var subject = list[i].get('subject');
                        for (var j = 0; j < subject.length; j++) {
                            if (subject[j] != 'java' && subject[j] != 'python')
                                throw "should retrieve saved data with particular value ";
                            }
                        }
                } else {
                    throw "should retrieve data matching a set of values ";
                }
                done();
            }, function(err) {
                done(err);
            });
        }, function(err) {
            done(err);
        });

    });

    it("Should retrieve data where column name starts which a given string", function(done) {

        this.timeout(30000);

        var obj = new CB.CloudQuery('student1');
        obj.startsWith('name', 'v');
        obj.find().then(function(list) {
            if (list.length > 0) {
                for (var i = 0; i < list.length; i++) {
                    if (list[i].get('name')[0] != 'v' && list[i].get('name')[0] != 'V')
                        throw "should retrieve saved data with particular value ";
                    }
                } else {
                throw "should retrieve data matching a set of values ";
            }
            done();
        }, function() {
            throw "find data error";
        });

    });

    it("Should save list with in column", function(done) {

        this.timeout(30000);

        var obj = new CB.CloudObject('student4');
        obj.set('subject', ['C#', 'python']);
        obj.save().then(function() {
            done();
        }, function() {
            throw "list Save error";
        });

    });

    it("Should not retrieve data with a particular value.", function(done) {

        this.timeout(30000);

        var obj = new CB.CloudQuery('student1');
        obj.notEqualTo('name', 'vipul');
        obj.find().then(function(list) {
            if (list.length > 0) {
                for (var i = 0; i < list.length; i++) {
                    if (list[i].get('name') === 'vipul')
                        throw "should not retrieve data with particular value ";
                    }
                } else {
                throw "should not retrieve data with particular value ";
            }
            done();
        }, function() {
            throw "find data error";
        });

    });

    it("Should not retrieve data including a set of different values", function(done) {

        this.timeout(30000);

        var obj = new CB.CloudQuery('student4');
        obj.notContainedIn('subject', ['java', 'python']);
        obj.find().then(function(list) {

            if (list && list.length > 0) {
                for (var i = 0; i < list.length; i++) {

                    if (list[i].get('subject')) {
                        var subject = list[i].get('subject');
                        for (var j = 0; j < subject.length; j++) {
                            if (subject[j] === 'java' || subject[j] === 'python')
                                throw "should retrieve saved data with particular value ";

                            }
                        }
                }
            }
            done();
        }, function(err) {
            done(err);
        });

    });

    it("Should save data with a particular value.", function(done) {

        this.timeout(30000);

        var obj = new CB.CloudObject('student4');
        obj.set('age', 15);
        obj.set('subject', ['C#', 'C']);
        obj.save().then(function() {
            done();
        }, function() {
            throw "data Save error";
        });

    });

    it("Should retrieve data which is greater that a particular value.", function(done) {

        this.timeout(30000);

        var obj = new CB.CloudQuery('student4');
        obj.greaterThan('age', 10);
        obj.find().then(function(list) {
            if (list.length > 0) {
                for (var i = 0; i < list.length; i++) {
                    if (list[i].get('age') <= 10)
                        throw "received value less than the required value";
                    }
                } else {
                throw "received value less than the required value";
            }
            done();
        }, function() {
            throw "find data error";
        });

    });

    it("Should retrieve data which is greater equal to a particular value.", function(done) {

        this.timeout(30000);

        var obj = new CB.CloudQuery('student4');
        obj.greaterThanEqualTo('age', 15);
        obj.find().then(function(list) {
            if (list.length > 0) {
                for (var i = 0; i < list.length; i++) {
                    if (list[i].get('age') < 10)
                        throw "received value less than the required value";
                    }
                } else {
                throw "received value less than the required value";
            }
            done();
        }, function() {
            throw "find data error";
        });

    });

    it("Should retrieve data which is less than a particular value.", function(done) {

        this.timeout(30000);

        var obj = new CB.CloudQuery('student4');
        obj.lessThan('age', 20);
        obj.find().then(function(list) {
            if (list.length > 0) {
                for (var i = 0; i < list.length; i++) {
                    if (list[i].get('age') >= 20)
                        throw "received value greater than the required value";
                    }
                } else {
                throw "received value greater than the required value";
            }
            done();
        }, function() {
            throw "find data error";
        });

    });

    it("Should retrieve data which is less or equal to a particular value.", function(done) {

        this.timeout(30000);

        var obj = new CB.CloudQuery('student4');
        obj.lessThanEqualTo('age', 15);
        obj.find().then(function(list) {
            if (list.length > 0) {
                for (var i = 0; i < list.length; i++) {
                    if (list[i].get('age') > 15)
                        throw "received value greater than the required value";
                    }
                } else {
                throw "received value greater than the required value";
            }
            done();
        }, function() {
            throw "find data error";
        });

    });

    it("Should retrieve data with a particular value.", function(done) {

        this.timeout(30000);

        var obj1 = new CB.CloudQuery('student4');
        obj1.equalTo('subject', ['java', 'python']);
        var obj2 = new CB.CloudQuery('student4');
        obj2.equalTo('age', 12);
        var obj = new CB.CloudQuery.or(obj1, obj2);
        obj.find().then(function(list) {
            if (list.length > 0) {
                for (var i = 0; i < list.length; i++) {
                    if (list[i].get('age') === 12) {
                        continue;
                    } else {
                        var subject = list[i].get('subject');
                        for (var j = 0; j < subject.length; j++) {
                            if (subject[j] === 'java' || subject[j] === 'python') {
                                continue;
                            } else {
                                throw "should retrieve saved data with particular value ";
                            }
                        }
                    }
                    continue;
                }
            } else
                throw "should return data";
            done();
        }, function() {
            throw "find data error";
        });

    });

    it("Should retrieve data in ascending order", function(done) {

        this.timeout(30000);
        var age = null;
        var obj = new CB.CloudQuery('student4');
        obj.orderByAsc('age');
        obj.find().then(function(list) {
            if (list.length > 0) {
                age = list[0].get('age');
                for (var i = 1; i < list.length; i++) {
                    if (age > list[i].get('age'))
                        throw "received value greater than the required value";
                    age = list[i].get('age');
                }
            } else {
                throw "received value greater than the required value";
            }
            done();
        }, function() {
            throw "find data error";
        });

    });

    it("Should retrieve data in descending order", function(done) {

        this.timeout(30000);
        var age = null;
        var obj = new CB.CloudQuery('student4');
        obj.orderByDesc('age');
        obj.find().then(function(list) {
            if (list.length > 0) {
                age = list[0].get('age');
                for (var i = 1; i < list.length; i++) {
                    if (age < list[i].get('age'))
                        throw "received value greater than the required value";
                    age = list[i].get('age');
                }
            } else {
                throw "received value greater than the required value";
            }
            done();
        }, function() {
            throw "find data error";
        });

    });

    it("Should limit the number of data items received", function(done) {

        this.timeout(30000);
        var age = null;
        var obj = new CB.CloudQuery('student4');
        obj.setLimit(5);
        obj.find().then(function(list) {
            if (list.length > 5)
                throw "received number of items are greater than the required value";
            else
                done();
            }
        , function() {
            throw "find data error";
        });

    });

    it("Should paginate with all params (return list of limited objects,count and totalpages)", function(done) {

        this.timeout(40000);

        var obj1 = new CB.CloudObject('student1');
        obj1.set('name', 'abcd');

        var obj2 = new CB.CloudObject('student1');
        obj2.set('name', 'pqrs');

        var obj3 = new CB.CloudObject('student1');
        obj3.set('name', 'gdgd');

        var obj4 = new CB.CloudObject('student1');
        obj4.set('name', 'sjdhsjd');

        CB.CloudObject.saveAll([
            obj1, obj2, obj3, obj4
        ], {
            success: function(res) {

                var pageNumber = 1;
                var totalItemsInPage = 2;

                var obj = new CB.CloudQuery('student1');
                obj.paginate(pageNumber, totalItemsInPage, {
                    success: function(objectsList, count, totalPages) {

                        if (objectsList && objectsList.length > totalItemsInPage) {
                            throw "received number of items are greater than the required value";
                            done("paginate data error");
                        } else if (Math.ceil(count / totalItemsInPage) != totalPages) {
                            done("totalpages is not recieved as expected");
                        } else {
                            done();
                        }
                    },
                    error: function(error) {
                        throw "paginate data error";
                        done("paginate data error");
                    }
                });

            },
            error: function(err) {
                done(err);
            }
        });

    });

    it("Should paginate with null params", function(done) {

        this.timeout(40000);

        var obj1 = new CB.CloudObject('student1');
        obj1.set('name', 'abcd');

        var obj2 = new CB.CloudObject('student1');
        obj2.set('name', 'pqrs');

        var obj3 = new CB.CloudObject('student1');
        obj3.set('name', 'gdgd');

        var obj4 = new CB.CloudObject('student1');
        obj4.set('name', 'sjdhsjd');

        CB.CloudObject.saveAll([
            obj1, obj2, obj3, obj4
        ], {
            success: function(res) {

                var obj = new CB.CloudQuery('student1');
                obj.paginate().then(function(objectsList, count, totalPages) {
                    if (objectsList && objectsList.length == 0) {
                        throw "received 0 objects";
                        done("paginate received 0 objects");
                    } else {
                        done();
                    }
                }, function(error) {
                    done(error);
                });

            },
            error: function(err) {
                done(err);
            }
        });

    });

    it("Should paginate with callback as first param", function(done) {

        this.timeout(40000);

        var obj1 = new CB.CloudObject('student1');
        obj1.set('name', 'abcd');

        var obj2 = new CB.CloudObject('student1');
        obj2.set('name', 'pqrs');

        var obj3 = new CB.CloudObject('student1');
        obj3.set('name', 'gdgd');

        var obj4 = new CB.CloudObject('student1');
        obj4.set('name', 'sjdhsjd');

        CB.CloudObject.saveAll([
            obj1, obj2, obj3, obj4
        ], {
            success: function(res) {

                var obj = new CB.CloudQuery('student1');
                obj.paginate({
                    success: function(objectsList, count, totalPages) {
                        if (objectsList && objectsList.length == 0) {
                            throw "received 0 objects";
                            done("received 0 objectsr");
                        } else {
                            done();
                        }
                    },
                    error: function(error) {
                        throw "paginate data error";
                        done("paginate data error");
                    }
                });

            },
            error: function(err) {
                done(err);
            }
        });

    });

    it("Should paginate with callback as second param", function(done) {

        this.timeout(40000);

        var obj1 = new CB.CloudObject('student1');
        obj1.set('name', 'abcd');

        var obj2 = new CB.CloudObject('student1');
        obj2.set('name', 'pqrs');

        var obj3 = new CB.CloudObject('student1');
        obj3.set('name', 'gdgd');

        var obj4 = new CB.CloudObject('student1');
        obj4.set('name', 'sjdhsjd');

        CB.CloudObject.saveAll([
            obj1, obj2, obj3, obj4
        ], {
            success: function(res) {

                var obj = new CB.CloudQuery('student1');
                obj.paginate(null, {
                    success: function(objectsList, count, totalPages) {

                        if (objectsList && objectsList.length == 0) {
                            throw "received 0 objects";
                            done("received 0 objects");
                        } else {
                            done();
                        }
                    },
                    error: function(error) {
                        throw "paginate data error";
                        done("paginate data error");
                    }
                });

            },
            error: function(err) {
                done(err);
            }
        });

    });

    it("Should paginate with callback as third param", function(done) {

        this.timeout(40000);

        var obj1 = new CB.CloudObject('student1');
        obj1.set('name', 'abcd');

        var obj2 = new CB.CloudObject('student1');
        obj2.set('name', 'pqrs');

        var obj3 = new CB.CloudObject('student1');
        obj3.set('name', 'gdgd');

        var obj4 = new CB.CloudObject('student1');
        obj4.set('name', 'sjdhsjd');

        CB.CloudObject.saveAll([
            obj1, obj2, obj3, obj4
        ], {
            success: function(res) {

                var obj = new CB.CloudQuery('student1');
                obj.paginate(null, null, {
                    success: function(objectsList, count, totalPages) {

                        if (objectsList && objectsList.length == 0) {
                            throw "received 0 objcts";
                            done("paginate received 0 objcts");
                        } else {
                            done();
                        }
                    },
                    error: function(error) {
                        throw "paginate data error";
                        done("paginate data error");
                    }
                });

            },
            error: function(err) {
                done(err);
            }
        });

    });

    it("Should paginate with as pageNumber null and totalItemsInPage with value", function(done) {

        this.timeout(40000);

        var obj1 = new CB.CloudObject('student1');
        obj1.set('name', 'abcd');

        var obj2 = new CB.CloudObject('student1');
        obj2.set('name', 'pqrs');

        var obj3 = new CB.CloudObject('student1');
        obj3.set('name', 'gdgd');

        var obj4 = new CB.CloudObject('student1');
        obj4.set('name', 'sjdhsjd');

        CB.CloudObject.saveAll([
            obj1, obj2, obj3, obj4
        ], {
            success: function(res) {

                var pageNumber = null;
                var totalItemsInPage = 2;

                var obj = new CB.CloudQuery('student1');
                obj.paginate(null, totalItemsInPage, {
                    success: function(objectsList, count, totalPages) {

                        if (objectsList && objectsList.length == 0) {
                            throw "received 0 objects";
                            done("paginate received 0 objects");
                        } else if (Math.ceil(count / totalItemsInPage) != totalPages) {
                            done("totalpages is not recieved as expected");
                        } else {
                            done();
                        }
                    },
                    error: function(error) {
                        throw "paginate data error";
                        done("paginate data error");
                    }
                });

            },
            error: function(err) {
                done(err);
            }
        });

    });

    it("Should paginate with pageNumber and totalItemsInPage as null", function(done) {

        this.timeout(40000);

        var obj1 = new CB.CloudObject('student1');
        obj1.set('name', 'abcd');

        var obj2 = new CB.CloudObject('student1');
        obj2.set('name', 'pqrs');

        var obj3 = new CB.CloudObject('student1');
        obj3.set('name', 'gdgd');

        var obj4 = new CB.CloudObject('student1');
        obj4.set('name', 'sjdhsjd');

        CB.CloudObject.saveAll([
            obj1, obj2, obj3, obj4
        ], {
            success: function(res) {

                var pageNumber = 1;
                var totalItemsInPage = null;

                var obj = new CB.CloudQuery('student1');
                obj.paginate(pageNumber, null, {
                    success: function(objectsList, count, totalPages) {

                        if (objectsList && objectsList.length == 0) {
                            throw "received 0 objects";
                            done("paginate received 0 objects");
                        } else {
                            done();
                        }
                    },
                    error: function(error) {
                        throw "paginate data error";
                        done("paginate data error");
                    }
                });

            },
            error: function(err) {
                done(err);
            }
        });

    });

    it("Should limit the number of data items received to one", function(done) {

        this.timeout(30000);
        var age = null;
        var obj = new CB.CloudQuery('student4');
        obj.findOne().then(function(list) {
            if (list.length > 1)
                throw "received number of items are greater than the required value";
            else
                done();
            }
        , function() {
            throw "find data error";
        });

    });

    it("Should give distinct elements", function(done) {

        this.timeout(30000);
        var age = [];
        var obj = new CB.CloudQuery('student4');
        obj.distinct('age').then(function(list) {
            if (list.length > 0) {
                for (var i = 0; i < list.length; i++) {
                    if (list[i].get('age')) {
                        if (age.indexOf(list[i].get('age')) > 0)
                            throw "received item with duplicate age";
                        else
                            age.push(list[i].get('age'));
                        }
                    }
                done();
            }
        }, function() {
            throw "find data error";
        });

    });

    var getidobj = new CB.CloudObject('student1');

    it("Should save data with a particular value.", function(done) {

        this.timeout(30000);
        getidobj.set('name', 'abcd');
        getidobj.save().then(function() {
            done();
        }, function() {
            throw "data Save error";
        });

    });

    it("Should get element with a given id", function(done) {

        this.timeout(30000);
        var obj = new CB.CloudQuery('student1');
        obj.get(getidobj.get('id')).then(function(list) {
            if (list.length > 0) {
                throw "received number of items are greater than the required value";
            } else {
                if (list.get('name') === 'abcd')
                    done();
                else
                    throw "received wrong data";
                }
            }, function() {
            throw "find data error";
        });

    });

    it("Should get element having a given column name", function(done) {

        this.timeout(30000);
        var obj = new CB.CloudQuery('student4');
        obj.exists('age');
        obj.find().then(function(list) {
            if (list.length > 0) {
                for (var i = 0; i < list.length; i++) {
                    //if (!list[i].get('age'))
                    if (list[i].get('age') !== null && !list[i].get('age')) {
                        //throw "received wrong data";
                        done("received wrong data");
                    }
                }
                done();
            } else {
                throw "data not received"
            }
        }, function() {
            throw "find data error";
        });
    });

    it("Should not get any element if queried with an invalid column name to exist", function(done) {
        this.timeout(30000);
        var obj = new CB.CloudQuery('student4');
        obj.exists('aNonExistingColumn');
        obj.find().then(function(list) {
            if (list.length > 0) {
                done("Reciveing data");
            } else {
                done();
            }
        }, function() {
            throw "find data error";
        });
    });

    it("Should not get elements that exist will non-null value if queried with a valid column name", function(done) {
        this.timeout(30000);
        var obj = new CB.CloudQuery('student4');
        obj.doesNotExists('age');
        obj.find().then(function(list) {
            if (list.length > 0) {
                for (var i = 0; i < list.length; i++) {
                    if (list[i].get('age')) {
                        done(new Error("Recieving data"));                     
                    }
                }
                done();
            } else {
                done();
            }
        }, function() {
            throw "find data error";
        });
    });

    it("Should not give element with a given relation", function(done) {

        this.timeout(30000);

        var obj1 = new CB.CloudObject('hostel');
        obj1.set('room', 123);
        obj1.save().then(function(obj) {
            if (obj) {
                obj1 = obj;
            } else {
                throw "should save the object";
            }
            obj = new CB.CloudObject('student1');
            obj.set('newColumn', obj1);
            obj.save().then(function(list) {
                var query = new CB.CloudQuery('student1');
                query.notEqualTo('newColumn', obj1);
                query.find().then(function(list) {
                    for (var i = 0; i < list.length; i++) {
                        if (list[i].get('newColumn')) {
                            if (list[i].get('newColumn').get('id') === obj1.get('id'))
                                throw "Should not get the id in not equal to";
                            }
                        }
                    done();
                }, function() {
                    throw "should do query";
                });
            }, function() {
                throw "should save the object";
            });
        }, function() {
            throw "should save the object";
        });
    });

    it("Should query over boolean dataType", function(done) {
        this.timeout(30000);
        var obj1 = new CB.CloudObject('Custom1');
        obj1.set('newColumn1', false);
        obj1.save().then(function(obj) {
            var cbQuery = new CB.CloudQuery('Custom1');
            cbQuery.equalTo('newColumn1', false);
            cbQuery.find({
                success: function(objList) {
                    if (objList.length > 0)
                        done();
                    else
                        throw "Cannot query over boolean datatype ";
                    }
                ,
                error: function(err) {
                    throw "Error querying object.";
                }
            });

        }, function() {
            throw "should save the object";
        });
    });

    //Search Tests
    it("Should perform Stemming search ", function(done) {

        this.timeout(40000);

        CB.appKey = CB.masterKey;

        var Name = new CB.Column('name');
        Name.dataType = 'Text';
        Name.isSearchable = true;

        var table = new CB.CloudTable('stemsearch');
        table.addColumn(Name);

        table.save().then(function(res) {

            CB.appKey = CB.jsKey;

            var obj1 = new CB.CloudObject('stemsearch');
            obj1.set('name', 'Joe owns a dog');

            var obj2 = new CB.CloudObject('stemsearch');
            obj2.set('name', 'Dogs eat cats');

            CB.CloudObject.saveAll([
                obj1, obj2
            ], {
                success: function(res) {

                    var query = new CB.CloudQuery('stemsearch');
                    query.search("dog");
                    query.find({
                        success: function(list) {
                            if (list.length == 2) {
                                done();
                            } else {
                                done("Failed to stemmer search");
                            }

                        },
                        error: function(error) {
                            done(error);
                        }
                    });

                },
                error: function(err) {
                    done(err);
                }
            });

        }, function(err) {
            CB.appKey = CB.jsKey;
            done(err);
            throw "Unable to Create Table";
        });

    });

    it("Should perform Phrase search ", function(done) {

        this.timeout(40000);

        CB.appKey = CB.masterKey;

        var Name = new CB.Column('name');
        Name.dataType = 'Text';
        Name.isSearchable = true;

        var table = new CB.CloudTable('phrasesearch');
        table.addColumn(Name);

        table.save().then(function(res) {

            CB.appKey = CB.jsKey;

            var obj1 = new CB.CloudObject('phrasesearch');
            obj1.set('name', 'Joe owns a dog');

            var obj2 = new CB.CloudObject('phrasesearch');
            obj2.set('name', 'Dogs eat cats');

            CB.CloudObject.saveAll([
                obj1, obj2
            ], {
                success: function(res) {

                    var query = new CB.CloudQuery('phrasesearch');
                    query.search("dog cat");
                    query.find({
                        success: function(list) {
                            if (list.length == 2) {
                                done();
                            } else {
                                done("Failed to phrase search");
                            }

                        },
                        error: function(error) {
                            done(error);
                        }
                    });

                },
                error: function(err) {
                    done(err);
                }
            });

        }, function(err) {
            CB.appKey = CB.jsKey;
            done(err);
            throw "Unable to Create Table";
        });

    });

    it("Should perform AND search ", function(done) {

        this.timeout(40000);

        CB.appKey = CB.masterKey;

        var Name = new CB.Column('name');
        Name.dataType = 'Text';
        Name.isSearchable = true;

        var table = new CB.CloudTable('andsearch');
        table.addColumn(Name);

        table.save().then(function(res) {

            CB.appKey = CB.jsKey;

            var obj1 = new CB.CloudObject('andsearch');
            obj1.set('name', 'Joe owns a dog');

            var obj2 = new CB.CloudObject('andsearch');
            obj2.set('name', 'Dogs eat cats');

            CB.CloudObject.saveAll([
                obj1, obj2
            ], {
                success: function(res) {

                    var query = new CB.CloudQuery('andsearch');
                    query.search("\"Dogs eat\"");
                    query.find({
                        success: function(list) {
                            if (list.length == 1) {
                                done();
                            } else {
                                done("Failed  AND search");
                            }

                        },
                        error: function(error) {
                            done(error);
                        }
                    });

                },
                error: function(err) {
                    done(err);
                }
            });

        }, function(err) {
            CB.appKey = CB.jsKey;
            done(err);
            throw "Unable to Create Table";
        });

    });

    it("Should perform Negation search ", function(done) {

        this.timeout(40000);

        CB.appKey = CB.masterKey;

        var Name = new CB.Column('name');
        Name.dataType = 'Text';
        Name.isSearchable = true;

        var table = new CB.CloudTable('negsearch');
        table.addColumn(Name);

        table.save().then(function(res) {

            CB.appKey = CB.jsKey;

            var obj1 = new CB.CloudObject('negsearch');
            obj1.set('name', 'Joe owns a dog');

            var obj2 = new CB.CloudObject('negsearch');
            obj2.set('name', 'Dogs eat cats');

            CB.CloudObject.saveAll([
                obj1, obj2
            ], {
                success: function(res) {

                    var query = new CB.CloudQuery('negsearch');
                    query.search("dog -cats");
                    query.find({
                        success: function(list) {
                            if (list.length == 1) {
                                done();
                            } else {
                                done("Failed  Negation search");
                            }

                        },
                        error: function(error) {
                            done(error);
                        }
                    });

                },
                error: function(err) {
                    done(err);
                }
            });

        }, function(err) {
            CB.appKey = CB.jsKey;
            done(err);
            throw "Unable to Create Table";
        });

    });

    it("Should perform Case sensitive search ", function(done) {

        this.timeout(40000);

        CB.appKey = CB.masterKey;

        var Name = new CB.Column('name');
        Name.dataType = 'Text';
        Name.isSearchable = true;

        var table = new CB.CloudTable('casesearch');
        table.addColumn(Name);

        table.save().then(function(res) {

            CB.appKey = CB.jsKey;

            var obj1 = new CB.CloudObject('casesearch');
            obj1.set('name', 'Joe owns a dog');

            var obj2 = new CB.CloudObject('casesearch');
            obj2.set('name', 'Dogs eat cats');

            CB.CloudObject.saveAll([
                obj1, obj2
            ], {
                success: function(res) {

                    var query = new CB.CloudQuery('casesearch');
                    query.search("Dog", null, true);
                    query.find({
                        success: function(list) {
                            if (list.length == 1) {
                                done();
                            } else {
                                done("Failed  Case senstive search");
                            }

                        },
                        error: function(error) {
                            done(error);
                        }
                    });

                },
                error: function(err) {
                    done(err);
                }
            });

        }, function(err) {
            CB.appKey = CB.jsKey;
            done(err);
            throw "Unable to Create Table";
        });

    });

    it("Should perform Diacritic Sensitive  search ", function(done) {

        this.timeout(40000);

        CB.appKey = CB.masterKey;

        var Name = new CB.Column('name');
        Name.dataType = 'Text';
        Name.isSearchable = true;

        var table = new CB.CloudTable('diacriticsearch');
        table.addColumn(Name);

        table.save().then(function(res) {

            CB.appKey = CB.jsKey;

            var obj1 = new CB.CloudObject('diacriticsearch');
            obj1.set('name', 'Joe eats fish');

            var obj2 = new CB.CloudObject('diacriticsearch');
            obj2.set('name', 'Dogs êat cats');

            CB.CloudObject.saveAll([
                obj1, obj2
            ], {
                success: function(res) {

                    var query = new CB.CloudQuery('diacriticsearch');
                    query.search("êat", null, null, true);
                    query.find({
                        success: function(list) {
                            if (list.length == 1) {
                                done();
                            } else {
                                done("Failed  Diacritic Sensitive search");
                            }

                        },
                        error: function(error) {
                            done(error);
                        }
                    });

                },
                error: function(err) {
                    done(err);
                }
            });

        }, function(err) {
            CB.appKey = CB.jsKey;
            done(err);
            throw "Unable to Create Table";
        });

    });

    it("Should perform language Stop words  search ", function(done) {

        this.timeout(40000);

        CB.appKey = CB.masterKey;

        var Name = new CB.Column('name');
        Name.dataType = 'Text';
        Name.isSearchable = true;

        var table = new CB.CloudTable('stopsearch');
        table.addColumn(Name);

        table.save().then(function(res) {

            CB.appKey = CB.jsKey;

            var obj1 = new CB.CloudObject('stopsearch');
            obj1.set('name', 'algunas comidas');

            var obj2 = new CB.CloudObject('stopsearch');
            obj2.set('name', 'antes de dormir');

            //algunas and antes are stop words in spanish

            CB.CloudObject.saveAll([
                obj1, obj2
            ], {
                success: function(res) {

                    var query = new CB.CloudQuery('stopsearch');
                    query.search("algunas", "es");
                    query.find({
                        success: function(list) {
                            if (list.length == 0) {
                                done();
                            } else {
                                done("Failed  Language Stop words search");
                            }

                        },
                        error: function(error) {
                            done(error);
                        }
                    });

                },
                error: function(err) {
                    done(err);
                }
            });

        }, function(err) {
            CB.appKey = CB.jsKey;
            done(err);
            throw "Unable to Create Table";
        });

    });

    it("Should delete data based on query.", function(done) {

        this.timeout(30000);

        obj.set('name', 'Ritish');
        obj.save().then(function(list) {
            if (list.get('name') === 'Ritish') {
                var query = new CB.CloudQuery('student1');
                query.equalTo('name', 'Ritish');
                query.delete({
                    success: function(obj) {
                        query = new CB.CloudQuery('student1');
                        query.find({
                            success: function(list) {

                                if (list.length > 0) {

                                    var foundObj = false;
                                    for (var i = 0; i < list.length; ++i) {
                                        if (list[i].get("name") === "Ritish") {
                                            foundObj = true;
                                        }
                                    }

                                    if (!foundObj) {
                                        done();
                                    } else {
                                        done("Object not deleted");
                                    }

                                } else {
                                    done("Failed to get the list");
                                }

                            },
                            error: function(error) {
                                done("Failed to save the object");
                            }
                        });
                    },
                    error: function(err) {
                        done(err);
                    }
                })
            } else
                throw "object could not saved properly";
            }
        , function() {
            throw "data Save error";
        });

    });

});

describe("CloudQuery - Encryption", function () {

    it("should get encrypted passwords", function (done) {

        this.timeout(30000);
         
        var username = util.makeEmail();

        var obj = new CB.CloudObject('User');
        obj.set('username',username);
        obj.set('password','password');
        obj.set('email',util.makeEmail());

        obj.save().then(function(obj){
            if(obj.get('password') !== 'password'){
                //now run CloudQuery. 
                var query = new CB.CloudQuery('User');
                query.equalTo('password','password');
                query.equalTo('username',username);
                query.find({
                    success : function(list){
                        if(list.length>0){
                            done();
                        }
                        else{
                            throw "Cannot get items.";
                        }
                    }, error : function(query){
                        //cannot query. 
                        throw "Cannot query over encrypted type";
                    }
                })
            }

            else
                throw "Cannot encrypt";

        }, function(){
            throw "Cannot save a CloudObject";
        });

    });




     it("should get encrypted passwords over OR query", function (done) {

        this.timeout(30000);
         
        var username = util.makeEmail();

        var obj = new CB.CloudObject('User');
        obj.set('username',username);
        obj.set('password','password');
        obj.set('email',util.makeEmail());

        obj.save().then(function(obj){
            if(obj.get('password') !== 'password'){
                //now run CloudQuery. 
                var query1 = new CB.CloudQuery('User');
                query1.equalTo('password','password');

                 var query2 = new CB.CloudQuery('User');
                query2.equalTo('password','password1');

                var query = new CB.CloudQuery.or(query1, query2);
                query.equalTo('username',username);
                query.find({
                    success : function(list){
                        if(list.length>0){
                            done();
                        }
                        else{
                            throw "Cannot get items.";
                        }
                    }, error : function(query){
                        //cannot query. 
                        throw "Cannot query over encrypted type";
                    }
                })
            }

            else
                throw "Cannot encrypt";

        }, function(){
            throw "Cannot save a CloudObject";
        });

    });

    it("should not encrypt already encrypted passwords", function (done) {

        this.timeout(20000);

        var obj = new CB.CloudObject('User');
        obj.set('username',util.makeEmail());
        obj.set('password','password');
        obj.set('email',util.makeEmail());
        obj.save().then(function(obj){
            var query = new CB.CloudQuery('User');
            query.findById(obj.get('id')).then(function(obj1){
                obj1.save().then(function(obj2){
                    if(obj2.get('password') === obj2.get('password'))
                        done();
                },function(){
                    throw "Encrypted the password field again";
                });
            }, function (err) {
                throw "unable to find object by id";
            });
        }, function(){
            throw "Cannot save a CloudObject";
        });

    });

});
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

describe("ACL", function () {

     it("Should update the ACL object.", function (done) {

        this.timeout(20000);

        if(CB._isNode){
            
            done();
            return;
        }

        var obj = new CB.CloudObject('Employee');
        obj.ACL = new CB.ACL();
        obj.ACL.setRoleWriteAccess("x",true);
        obj.ACL.setPublicWriteAccess(true);
        obj.save().then(function(list) {
            list.ACL.setRoleWriteAccess("y",true);
            list.ACL.setPublicWriteAccess(true);
            list.save().then(function(obj) {
                var query = new CB.CloudQuery("Employee");
                query.findById(obj.id, {
                    success : function(obj){
                        if(obj.ACL.document.write.allow.role.length === 2) {
                            done();
                        }
                        else
                            done("Cannot update the ACL");
                    }, error : function(error) {
                         done(error);
                    }
                })
            }, function(error){
                done(error);
            });

           
        }, function (error) {
             done(error);
        });
    });

    it("Should set the public write access", function (done) {

        this.timeout(20000);

        if(CB._isNode){
            
            done();
            return;
        }

        var obj = new CB.CloudObject('student4');
        obj.ACL = new CB.ACL();
        obj.ACL.setPublicWriteAccess(false);
        obj.save().then(function(list) {
            var acl=list.get('ACL');
            if(acl.document.write.deny.user.length === 0) {
                obj.set('age',15);
                obj.save().then(function(){
                    throw "Should not save object with no right access";
                },function(){
                    done();
                });
            }
            else
                throw "public write access set error"
        }, function () {
            throw "public write access save error";
        });
    });

     it("Should persist ACL object inside of CloudObject after save.", function (done) {

        this.timeout(20000);

    
        var obj = new CB.CloudObject('student4');
        obj.ACL = new CB.ACL();
        obj.ACL.setUserWriteAccess('id',true);
        obj.save().then(function(obj) {
            var acl=obj.get('ACL');
            if(acl.document.write.allow.user.length === 1 && acl.document.write.allow.user[0] === 'id') {
               //query this object and see if ACL persisted. 
               var query = new CB.CloudQuery("student4");
               query.equalTo('id',obj.id);
               query.find({
                    success : function(list){
                        if(list.length ===1)
                        {
                            var acl = list[0].ACL;
                            if(acl.document.write.allow.user.length === 1 && acl.document.write.allow.user[0] === 'id'){
                                done();
                            }else{
                                done("Cannot persist ACL object");
                            }
                        }   
                        else{
                            done("Cannot get cloudobject");
                        }
                    }, error : function(error){

                    }
               });
            }
            else
                done("ACL write access on user cannot be set");
        }, function () {
            throw "public write access save error";
        });
    });

    it("Should set the public read access", function (done) {

        this.timeout(20000);

        if(CB._isNode){
            
            done();
            return;
        }


        var obj = new CB.CloudObject('student4');
        obj.ACL = new CB.ACL();
        obj.ACL.setPublicReadAccess(false);
        obj.save().then(function(list) {
            var acl=list.get('ACL');
            if(acl.document.read.deny.user.length === 0)
                done();
            else
                throw "public read access set error"
        }, function () {
            throw "public read access save error";
        });

    });


    var username = util.makeString();
    var passwd = "abcd";
    var userObj = new CB.CloudUser();

    it("Should create new user", function (done) {

        if(CB._isNode){
            
            done();
            return;
         }

        this.timeout(20000);

        userObj.set('username', username);
        userObj.set('password',passwd);
        userObj.set('email',util.makeEmail());
        userObj.signUp().then(function(list) {
            if(list.get('username') === username)
                done();
            else
                done('User unable to log in');
        }, function (err) {
            done(err);
        });

    });

    it("Should set the user read access", function (done) {

        if(CB._isNode){
            
            done();
            return;
         }

        this.timeout(20000);

        var obj = new CB.CloudObject('student4');
        obj.ACL = new CB.ACL();
        obj.ACL.setUserReadAccess(userObj.get('id'),true);
        obj.save().then(function(list) {
            acl=list.get('ACL');
            if(acl.document.read.allow.user.indexOf(userObj.get('id')) >= 0)
                done();
            else
                throw "user read access set error"
        }, function () {
            throw "user read access save error";
        });

    });

    it("Should allow users of role to write", function (done) {
        if(CB._isNode){
            
            done();
            return;
         }


        this.timeout(20000);

        var obj = new CB.CloudObject('student4');
        obj.ACL = new CB.ACL();
        obj.ACL.setRoleWriteAccess(userObj.get('id'),true);
        obj.save().then(function(list) {
            acl=list.get('ACL');
            if(acl.document.write.allow.role.indexOf(userObj.get('id'))>=0)
                done();
            else
                throw "user role write access set error"
        }, function () {
            throw "user role write access save error";
        });

    });

    it("Should allow users of role to read", function (done) {

        if(CB._isNode){
            
            done();
            return;
        }

        this.timeout(20000);

        var obj = new CB.CloudObject('student4');
        obj.ACL.setRoleReadAccess(userObj.get('id'),true);
        obj.save().then(function(list) {
            acl=list.get('ACL');
            if(acl.document.read.allow.role.indexOf(userObj.get('id'))>=0)
                done();
            else
                throw "user role read access set error"
        }, function () {
            throw "user role read access save error";
        });

    });
});


describe("Query_ACL", function () {

    var obj = new CB.CloudObject('student4');
    obj.isSearchable = true;
    obj.set('age',55);

    var username = util.makeString();
    var passwd = "abcd";
    var user = new CB.CloudUser();
    it("Should create new user", function (done) {

        if(CB._isNode){
            
            done();
            return;
         }

        this.timeout(20000);
        user.set('username', username);
        user.set('password',passwd);
        user.set('email',util.makeEmail());
        user.signUp().then(function(list) {
            if(list.get('username') === username)
                done();
            else
                throw "create user error"
        }, function () {
            throw "user create error";
        });

    });

    it("Should set the public read access", function (done) {

        if(CB._isNode){
            
            done();
            return;
         }


        this.timeout(20000);

        obj.ACL = new CB.ACL();
        obj.ACL.setPublicReadAccess(false);
        obj.save().then(function(list) {
            acl=list.get('ACL');
            if(acl.document.read.allow.user.length === 0) {
                var cq = new CB.CloudQuery('student4');
                cq. equalTo('age',55);
                cq.find().then(function(list){
                    if(list.length>0)
                    {
                        throw "should not return items";
                    }
                    else
                        done();
                },function(){
                    throw "should perform the query";
                });
            }
            else
                throw "public read access set error"
        }, function () {
            throw "public read access save error";
        });

    });

    var obj1 = new CB.CloudObject('student4');
    obj1.isSearchable = true;
    obj1.set('age',60);
    it("Should search object with user read access", function (done) {

        if(CB._isNode){
            
            done();
            return;
         }

        this.timeout(20000);
        obj1.ACL = new CB.ACL();
        obj1.ACL.setUserReadAccess(user.document._id,false);
        obj1.save().then(function(list) {
            acl=list.get('ACL');
           // if(acl.read.indexOf(user.document._id) >= 0) {
                var user = new CB.CloudUser();
                user.set('username', username);
                user.set('password', passwd);
                user.logIn().then(function(){
                    var cq = new CB.CloudQuery('student4');
                    cq.equalTo('age',60);
                    cq.find().then(function(){
                        done();
                    },function(){
                        throw "should retrieve object with user read access";
                    });
                },function(){
                    throw "should login";
                });
        }, function () {
            throw "user read access save error";
        });

    });



});


    describe("Search_ACL", function () {

    var obj = new CB.CloudObject('student4');
    obj.set('age',150);

        var username = util.makeString();
        var passwd = "abcd";
        var user = new CB.CloudUser();
        it("Should create new user", function (done) {

            if(CB._isNode){
            
            done();
            return;
         }

            this.timeout(20000);
            user.set('username', username);
            user.set('password',passwd);
            user.set('email',util.makeEmail());
            user.signUp().then(function(list) {
                if(list.get('username') === username)
                    done();
                else
                    throw "create user error"
            }, function () {
                throw "user create error";
            });

        });  

});


describe("CloudNotification", function() {
 
    it("should subscribe to a channel", function(done) {
      this.timeout(20000);
        CB.CloudNotification.on('sample',
      function(data){
      }, 
      {
      	success : function(){
      		done();
      	}, 
      	error : function(){
      		throw 'Error subscribing to a CloudNotification.';
      	}
      });
    });

    it("should publish data to the channel.", function(done) {

        this.timeout(30000);
        CB.CloudNotification.on('sample1',  function(data){
	      	if(data === 'data1'){
	      		done();
	      	}else{
	      		throw 'Error wrong data received.';
	      	}
	      }, 
      	{
      	success : function(){
      		//publish to a channel. 
      		CB.CloudNotification.publish('sample1', 'data1',{
				success : function(){
					//succesfully published. //do nothing. 
					
				},
				error : function(err){
					//error
					throw 'Error publishing to a channel in CloudNotification.';
				}
				});
      	}, 
      	error : function(){
      		throw 'Error subscribing to a CloudNotification.';
      	}

      });
    });


    it("should stop listening to a channel", function(done) {

    	this.timeout(20000);

     	CB.CloudNotification.on('sample2', 
	      function(data){
	      	throw 'stopped listening, but still receiving data.';
	      }, 
	      {
	      	success : function(){
	      		//stop listening to a channel. 
	      		CB.CloudNotification.off('sample2', {
					success : function(){
						//succesfully stopped listening.
						//now try to publish. 
						CB.CloudNotification.publish('sample2', 'data',{
							success : function(){
								//succesfully published.
								//wait for 5 seconds.
								setTimeout(function(){ 
									done();
								}, 5000);
							},
							error : function(err){
								//error
								throw 'Error publishing to a channel.';
							}
						});
					},
					error : function(err){
						//error
						throw 'error in sop listening.';
					}
				});
	      	}, 
	      	error : function(){
	      		throw 'Error subscribing to a CloudNotification.';
	      	}
	      });


    });

});

describe("MasterKey ACL", function () {

     before(function(){
        CB.appKey = CB.masterKey;
      });


    it("Should save an object with master key with no ACL access.", function (done) {

        this.timeout(50000);

        var obj = new CB.CloudObject('student4');
        obj.ACL = new CB.ACL();
        obj.ACL.setPublicReadAccess(false);
        obj.ACL.setPublicWriteAccess(false);
        
        obj.save().then(function(obj) {

            if(obj.id){
                 obj.set('age',19);        
                 obj.save().then(function(obj) {
                    if(obj.id){
                        done();
                    }else{
                        done("Obj did not save.");
                    }
                }, function (error) {
                    done(error);
                });
            }else{
                done("Obj did not save.");
            }
        
        }, function (error) {
           done(error);
        });
    });

    it("Should delete the userId from the ACL", function (done) {

        this.timeout(20000);

        var obj = new CB.CloudObject('Employee');
        obj.ACL = new CB.ACL();
        obj.ACL.setUserWriteAccess("x",true);
        obj.save().then(function(list) {
            list.ACL.setUserWriteAccess("x",false);
            list.save().then(function(obj) {
                var query = new CB.CloudQuery("Employee");
                query.findById(obj.id, {
                    success : function(obj){
                        if(obj.ACL.document.write.allow.user.indexOf("x") === -1) {
                            done();
                        }
                        else
                            done("Cannot delete the user from the ACL");
                    }, error : function(error) {
                         done(error);
                    }
                })
            }, function(error){
                done(error);
            });           
        }, function (error) {
             done(error);
        });
        
    });

     after(function(){
        CB.appKey = CB.jsKey;
     });

});


describe("Cloud GeoPoint Test", function() {
    
    before(function(){
        CB.appKey = CB.masterKey;
    });

    it('should create table with Geo point', function (done) {
        this.timeout(80000);
        var table = new CB.CloudTable('Custom5');
        var columnGeoPoint = new CB.Column('location', 'GeoPoint', true, false);   
        table.addColumn(columnGeoPoint);
        table.save().then(function(){
            return done();
        }, done);
    });
    
    it("should save a latitude and longitude when passing data are number type", function(done) {

        this.timeout(30000);

        var obj = new CB.CloudObject('Custom5');
        var loc = new CB.CloudGeoPoint(17.7,78.9);
        obj.set("location", loc);
        obj.save({
            success : function(newObj){
                done();
            }, error : function(error){
                throw 'Error saving the object';
            }
        });
    });

     it("should create a GeoPoint with 0,0", function(done) {

        this.timeout(30000);

        try{
            var loc = new CB.CloudGeoPoint(0,0);
            done();
        }catch(e){
            done("Canot create a geo point");
        }
        
    });

    it("should save a latitude and longitude when passing a valid numeric data as string type", function(done) {

        this.timeout(40000);

        var obj = new CB.CloudObject('Custom5');
        var loc = new CB.CloudGeoPoint("18.19","79.3");
        loc.latitude = 78;
        loc.longitude = 17;
        obj.set("location", loc);
        obj.save({
            success : function(newObj){
                done();
            }, error : function(error){
                throw 'Error saving the object';
            }
        });
    });

	it("should save a latitude and longitude when passing data are number type", function(done) {

        this.timeout(30000);

		var obj = new CB.CloudObject('Custom5');
     	var loc = new CB.CloudGeoPoint(17.7,80.9);
		obj.set("location", loc);
        obj.save({
     		success : function(newObj){
     			done();
     		}, error : function(error){
     			throw 'Error saving the object';
     		}
     	});
	});

	it("should save a latitude and longitude when passing a valid numeric data as string type", function(done) {

        this.timeout(40000);

        var obj = new CB.CloudObject('Custom5');
     	var loc = new CB.CloudGeoPoint("17.19","79.3");
		loc.latitude = 78;
        loc.longitude = 17; 
        obj.set("location", loc);
		obj.save({
     		success : function(newObj){
     			done();
     		}, error : function(error){
     			throw 'Error saving the object';
     		}
     	});
	});


	it("should get data from server for near function", function(done) {
     	this.timeout(20000);
        var loc = new CB.CloudGeoPoint("17.7","80.3");
        var query = new CB.CloudQuery('Custom5');
        query.near("location", loc, 400000);
		query.find().then(function(list) {
            if(list.length>0){
                done();
            } else{
                done(new Error("should retrieve saved data with particular value "));
            }
        }, function (err) {
            done(err);
        })
	});
	
	it("should get list of CloudGeoPoint Object from server Polygon type geoWithin", function(done) {
     	this.timeout(40000);
        var loc1 = new CB.CloudGeoPoint(18.4,78.9);
     	var loc2 = new CB.CloudGeoPoint(17.4,78.4);
     	var loc3 = new CB.CloudGeoPoint(17.7,80.4);
        var query = new CB.CloudQuery('Custom5');
		query.geoWithin("location", [loc1, loc2, loc3]);
		query.find().then(function(list) {
            if(list.length>0){
                done();
            } else{
                throw "should retrieve saved data with particular value ";
            }
            
        }, function () {
            throw "find data error";
        })
	});
	
	it("should get list of CloudGeoPoint Object from server Polygon type geoWithin + equal to + limit", function(done) {
     	this.timeout(40000);
        var loc1 = new CB.CloudGeoPoint(18.4,78.9);
     	var loc2 = new CB.CloudGeoPoint(17.4,78.4);
     	var loc3 = new CB.CloudGeoPoint(17.7,80.4);
        var query = new CB.CloudQuery('Custom5');
        query.setLimit(4);
		query.geoWithin("location", [loc1, loc2, loc3]);
		query.find().then(function(list) {
            if(list.length>0){
               done();
            } else{
                throw "should retrieve saved data with particular value ";
            }
            
        }, function () {
            throw "find data error";
        })
	});
	
	it("1. should get list of CloudGeoPoint Object from server for Circle type geoWithin", function(done) {
     	this.timeout(40000);
        var loc = new CB.CloudGeoPoint(17.3, 78.3);
        var query = new CB.CloudQuery('Custom5');
		query.geoWithin("location", loc, 1000);
		query.find().then(function(list) {
            if(list.length>0){
               done();
            } else{
               done("didnot retrieve the records.")
            }
        }, function (error) {
            
            done(error);
        });
	});
	
	it("1. should get list of CloudGeoPoint Object from server for Circle type geoWithin + equal to + limit", function(done) {
     	this.timeout(40000);
        var loc = new CB.CloudGeoPoint(17.3, 78.3);
        var query = new CB.CloudQuery('Custom5');
		query.geoWithin("location", loc, 1000);
		query.setLimit(4);
		query.find().then(function(list) {
            if(list.length>0){
               done();
            } else{
                throw "should retrieve saved data with particular value ";
            }
        }, function () {
            throw "find data error";
        })
	});

    it("should update a saved GeoPoint", function(done) {
        this.timeout(30000);
        var obj = new CB.CloudObject('Custom5');
        var loc = new CB.CloudGeoPoint(17.9,79.6);
        obj.set("location", loc);
        obj.save({
            success : function(newObj){
                obj = newObj;
                obj.get('location').set('latitude',55);
                obj.save().then(function(obj1){                  
                    done()
                },function(){
                    throw "";
                });
            }, error : function(error){
                throw 'Error saving the object';
            }
        });
    });

    it("should take latitude in range",function(done){

        this.timeout(40000);

        var obj = new CB.CloudGeoPoint(10,20);
        try{
            obj.set('latitude',-100);
            throw "should take latitude in range";
        }catch(err){
            done();
        }
    });

    it("should take longitude in range",function(done){

        this.timeout(40000);

        var obj = new CB.CloudGeoPoint(10,20);
        try{
            obj.set('longitude',-200);
            throw "should take longitude in range";
        }catch(err){
            done();
        }
    });
});

describe("Version Test",function(done){

    it("should set the Modified array",function(done){
        var obj = new CB.CloudObject('sample');
        obj.set('expires',0);
        obj.set('name','vipul');
        if(obj.get('_modifiedColumns').length > 0) {
            done();
        }else{
            throw "Unable to set Modified Array";
        }
    });

    var obj = new CB.CloudObject('Sample');

    it("should save.", function(done) {

        this.timeout(20000);
        obj.set('name', 'sample');
        obj.save({
            success : function(newObj){
                if(obj.get('name') !== 'sample'){
                    throw 'name is not equal to what was saved.';
                }
                if(!obj.id){
                    throw 'id is not updated after save.';
                }
                done();
            }, error : function(error){
                throw 'Error saving the object';
            }
        });
    });

    it("should get the saved CO with version",function(done){
        this.timeout(20000);
        var query = new CB.CloudQuery('Sample');
        query.findById(obj.get('id')).then(function(list){
            var version = list.get('_version');
            if(version>=0){
                done();
            }else{
                throw "unable to get Version";
            }
        },function(){
            throw "unable to find saved object";
        });
    });


    it("should update the version of a saved object", function (done) {
        this.timeout(15000);
        var query = new CB.CloudQuery('Sample');
        query.equalTo('id',obj.get('id'));
        query.find().then(function(list){
            
            list[0].set('name','abcd');
            list[0].save().then(function(){
                var query1 = new CB.CloudQuery('Sample');
                query1.equalTo('id',obj.get('id'));
                query1.find().then(function(list){
                    if(list[0].get('_version') === 1){
                        done();
                    }else{
                        throw "version number should update";
                    }
                },function(){
                    throw "unable to find saved object";
                })
            }, function () {
                throw "unable to save object";
            })
        },function(){
            throw "unable to find saved object";
        })
    });

    var username = util.makeString();
    var passwd = "abcd";
    var user = new CB.CloudUser();
    it("Should create new user with version", function (done) {

        if(CB._isNode){
            
            done();
            return;
         }

        this.timeout(20000);

        user.set('username', username);
        user.set('password',passwd);
        user.set('email',util.makeEmail());
        user.signUp().then(function(list) {
            if(list.get('username') === username && list.get('_version')>=0){
                done();
            }
            else
                throw "create user error"
        }, function () {
            throw "user create error";
        });

    });

    var roleName1 = util.makeString();

    it("Should create a role with version", function (done) {

        this.timeout(20000);
        var role = new CB.CloudRole(roleName1);
        role.save().then(function (list) {
            if (!list)
                throw "Should retrieve the cloud role";
            if (list.get('_version') >= 0)
                done();
            else
                throw "Unable to save version number with CloudRole";
        }, function () {
            throw "Should retrieve the cloud role";
        });
    });

    var parent = new CB.CloudObject('Custom4');
    var child = new CB.CloudObject('student1');

    it("Should Store a relation with version",function(done){

        this.timeout(20000);
        child.set('name','vipul');
        parent.set('newColumn7',[child]);
        parent.save().then(function(list){
            if(list)
            done();
        },function(err){
            throw "should save the relation";
        });

    });
    it("Should retrieve a saved user object",function(done){

        if(CB._isNode){
            
            done();
            return;
         }
         
        this.timeout(20000);
        var query = new CB.CloudQuery('User');
        query.get(user.get('id')).then(function (user) {
            if(user.get('username') === username)
                done();
        }, function () {
            throw "unable to get a doc";
        });
    });

    it("Should save object with a relation and don't have a child object",function(done){

        this.timeout(20000);
        var obj = new CB.CloudObject('Sample');
        obj.set('name','vipul');
        obj.save().then(function(obj1){
            if(obj1.get('name') === 'vipul')
                done();
            else
                throw "unable to save the object";
        },function(){
            throw "unable to save object";
        });
    });
});
describe("Table Tests", function (done) {

    before(function (done) {
        CB.appKey = CB.masterKey;
        done();
    });

    it("Should Give all the tables", function (done) {

        this.timeout(30000);

        CB.CloudTable.getAll().then(function (res) {
            done();
        }, function () {
            throw "Unable to get tables";
        });
    });

    it("Should Give specific tables", function (done) {

        this.timeout(10000);

        var obj = new CB.CloudTable('Role');
        CB.CloudTable.get(obj).then(function (res) {
            done();
        }, function () {
            throw "Unable to get tables";
        });
    });

    it("Should give table with tableName", function (done) {

        this.timeout(10000);

        CB.CloudTable.get('Employee').then(function (res) {
            if (res) {
                done();
            } else
                done(new Error("Unable to Get table by name"));
        }, function (err) {
            done(err);
        });
    });

    it("should create a column and then delete it", function (done) {

        this.timeout(20000);

        CB.CloudTable.get('Employee').then(function (emp) {
            var column = new CB.Column('Test2');
            emp.addColumn(column);
            emp.save().then(function (emp) {
                emp.deleteColumn('Test2');
                emp.save().then(function () {
                    done();
                }, function (err) {
                    done(err);
                });
            }, function (err) {
                done(err);
            });
        }, function (err) {
            done(err);
        });
    });

    it("Should wait for other tests to run", function (done) {

        this.timeout(100000);

        setTimeout(function () {
            done();
        }, 10000);

    });

    after(function (done) {
        CB.appKey = CB.jsKey;
        done();
    });

});
describe("Cloud Table", function(){

    before(function(){
        CB.appKey = CB.masterKey;
    });

    var tableName = util.makeString();

    it("should create a table",function(done){

        this.timeout(80000);

        var obj = new CB.CloudTable(tableName);

        obj.save().then(function(table){
            if(table.id){
              done();
            }else{
              done("Table cannot be created");
            }
        },function(){
            throw "Should Create a table";
        });
    });

    it("should first create a table and then delete that table",function(done){
        this.timeout(100000);
        var tableName = util.makeString();
        var obj = new CB.CloudTable(tableName);
        obj.save().then(function(){
          obj.delete().then(function(){
              done();
          },function(){
              throw("should have delete the table");
          });
        },function(){
            throw("should have create the table");
        });
    });

    it("should get a table information",function(done){
        this.timeout(40000);
        var obj = new CB.CloudTable('Address');
        CB.CloudTable.get(obj).then(function(res){
            done();
        },function(){
            throw("should fetch the table");
        });
    });

    it("should get all tables from an app",function(done){
        this.timeout(40000);
        CB.CloudTable.getAll().then(function(res){
            if(res)
                done();
            else
                throw "Unable to Get table Data";
        },function(){
            throw("should get the all table");
        });
    });

    it("should update new column into the table",function(done){

        this.timeout(80000);

        var tableName1 = util.makeString();
        var tableName2 = util.makeString();
        var obj = new CB.CloudTable(tableName1);
        var obj1 = new CB.CloudTable(tableName2);
        obj.save().then(function () {
            obj1.save().then(function(){
                CB.CloudTable.get(obj, {
                    success: function(table){
                        var column1 = new CB.Column('Name11', 'Relation', true, false);
                        column1.relatedTo = tableName2;
                        table.addColumn(column1);
                        table.save().then(function(newTable){
                            var column2 = new CB.Column('Name11');
                            newTable.deleteColumn(column2);
                            newTable.save().then(function(){
                                done();
                            },function(){
                                throw("should save the table");
                            });
                        },function(){
                            throw("should save the table");
                        });
                    },
                    error: function(err){
                        throw("should fetch the table");
                    }
                });
            },function(){
                throw "Should Save Table";
            })
        },function(){
            throw "Should Save Table";
        });
    });

    it("should first create a table and then delete that table",function(done){

        this.timeout(80000);

        var tableName = util.makeString();
        var obj = new CB.CloudTable(tableName);
        obj.save().then(function(newTable){
          newTable.delete().then(function(){
              done();
          },function(){
              done("should have delete the table");
          });
        },function(){
            done("should have create the table");
        });

    });
	
	it("should add a column to an existing table",function(done){
        this.timeout(90000);
        var obj = new CB.CloudTable(tableName);
        CB.CloudTable.get(obj).then(function(table){
        	var column1 = new CB.Column('city', 'Text', true, false);
		    table.addColumn(column1);
		    table.save().then(function(table){
		          done();
		    },function(){
                throw "Unable to add column to existing table"
            });
        },function(){
            done("should fetch the table");
        });
        
    });

    it("Should not be able to add empy columnn name",function(done){
        this.timeout(90000);
        var obj = new CB.CloudTable(tableName);
        CB.CloudTable.get(obj).then(function(table){
            try{
                var column1 = new CB.Column('', 'Text', true, false);
                table.addColumn(column1);
                table.save().then(function(table){
                    done("Saved a table with an empty column.");
                },function(){
                    done();
                });
            }
            catch(e){
                done();
            }
        },function(){
            done("should fetch the table");
        });
        
    });
    
	it("should add a column to the table after save.",function(done){
        this.timeout(80000);

        var tableName = util.makeString();
        var table = new CB.CloudTable(tableName);
        table.save().then(function(table){
            var column1 = new CB.Column('Name1', 'Text', true, false);
            table.addColumn(column1);
            table.save().then(function(newTable){
              done();
              newTable.delete();
            });
        });
    });
    
    it("should get a table information",function(done){
        this.timeout(40000);
        var obj = new CB.CloudTable(tableName);
        CB.CloudTable.get(obj).then(function(){
            done();
        },function(){
            done("should fetch the table");
        });
    });
    
    it("should get all tables from an app",function(done){
        this.timeout(40000);
        CB.CloudTable.getAll().then(function(table){
            done();
        },function(){
            done("should get the all table");
        });
    });

    it("should not rename a table",function(done){

        this.timeout(80000);

        var obj = new CB.CloudTable(tableName);
        CB.CloudTable.get(obj).then(function(table){
            table.document.name = "sadjhkasj";
            table.save().then(function(res){
               if(res.id !== table.id){
                done();
               }else{
                done("Table renamed");
               }
            },function(){
               done();
            });
        },function(){
            done("should fetch the table");
        });
    });


    it("should not change type of table",function(done){

        this.timeout(80000);

      var obj = new CB.CloudTable(tableName);
      CB.CloudTable.get(obj).then(function(table){
          table.document.type = "NewType";
          table.save().then(function(newTable){
              CB.CloudTable.get(obj).then(function(table){
                if(table.document.type === "NewType"){
                  done("Error. Cnanged the type of the table "+table.name);
                }else{
                  done();
                }
              }, function(error){
                done("Cannot get the table");
              });
          },function(){
              done();
          });
      },function(){
          done("should fetch the table");
      });
    });

    it("should not rename a column",function(done){
        this.timeout(80000);
        var obj = new CB.CloudTable(tableName);
        CB.CloudTable.get(obj).then(function(table){
            table.document.columns[0].name = "abcd";
            table.save().then(function(){
                done("should not update the column name");
            },function(){
                done();
            });
        },function(){
            done("should fetch the table");
        });
    });

    it("should not change data type of a column",function(done){
      this.timeout(80000);
      var obj = new CB.CloudTable(tableName);
      CB.CloudTable.get(obj).then(function(table){
          table.document.columns[0].dataType = "abcd";
          table.save().then(function(){
              done("should not update the column dataType");
          },function(){
              done();
          });
      },function(){
          done("should fetch the table");
      });
    });

    it("should not change unique property of a default column",function(done){
      this.timeout(80000);
      var obj = new CB.CloudTable(tableName);
      CB.CloudTable.get(obj).then(function(table){
          table.document.columns[0].unique = false;
          table.save().then(function(){
              done("should not change unique property of a default column");
          },function(){
              done();
          });
      },function(){
          done("should fetch the table");
      });
    });

    it("should not change required property of a default column",function(done){
      this.timeout(80000);
      var obj = new CB.CloudTable(tableName);
      CB.CloudTable.get(obj).then(function(table){
          table.document.columns[0].required = false;
          table.save().then(function(){
              done("should not change required property of a default column");
          },function(){
              done();
          });
      },function(){
          done("should fetch the table");
      });
    });

    it("should not change unique property of a pre defined column",function(done){
      this.timeout(80000);
      var obj = new CB.CloudTable(tableName);
      CB.CloudTable.get(obj).then(function(table){
          if(table.document.columns[0].unique)
            table.document.columns[0].unique = false;
          else
            table.document.columns[0].unique = true;
          table.save().then(function(newTable){
              if(newTable.document.columns[0].unique !== table.columns[0].unique)
                done();
              else
                done("shouldChange unique property of a user defined column");
          },function(){
              done();
          });
      },function(){
          done("should fetch the table");
      });
    });

    it("should change required property of a user defined column",function(done){

      this.timeout(80000);


      var obj = new CB.CloudTable(util.makeString());
      var name = new CB.Column("abc");
        name.required = true;
        obj.addColumn(name);
        obj.save().then(function(table){
          if(table.columns[5].required)
            table.columns[5].required = false;
          else
            table.columns[5].required = true;
          table.save().then(function(newTable){
              if(newTable.columns[5].required === table.columns[5].required)
                done();
              else
                done("should change required property of a user defined column");
          },function(){
              done("should change required property of a user defined column");

          });
      },function(){
          done("should fetch the table");
      });
    });

    it("should not delete a default column of a table",function(done){

        this.timeout(80000);
      var obj = new CB.CloudTable(tableName);
      CB.CloudTable.get(obj).then(function(table){
          table.deleteColumn('id');
          table.save().then(function(newTable){
              if(newTable.columns) {
                  if (newTable.columns[0].name === "id")
                      done();
                  else
                      done("Should not change the behaviour of predefined columns");
              }else
                done();
          },function(){
              done();
          });
      });
    });

    it("should get column from a table",function(done){

        this.timeout(50000);
        var obj = new CB.CloudTable('abcd');
        var column = obj.getColumn('ACL');
        if(column){
            done();
        }else{
            throw "Get Column is Not Working";
        }
    });

    it("should update column in a table",function(done){

        this.timeout(50000);
        var obj = new CB.CloudTable('abcd');
        var column = new CB.Column('name');
        column.required = true;
        obj.addColumn(column);
        var col2 = obj.getColumn('name');
        col2.required = false;
        obj.updateColumn(col2);
        column = obj.getColumn('name');
        if(column.required === false){
            done();
        }else{
            throw "Unable to Update Column";
        }
    });

    it("should not pass string in update column",function(done){

        this.timeout(50000);
        var obj = new CB.CloudTable('abcd');
        var column = new CB.Column('name');
        column.required = true;
        obj.addColumn(column);
        try {
            obj.updateColumn("abcd");
            throw "Update Column should not take string";
        }catch(e){
            done();
        }
    });

    after(function() {
    	CB.appKey = CB.jsKey;
  	});


});

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

describe("Cloud App is connected.", function() {

    //Use Sample Table.
    // -> Which has columns :
    // name : string : required.

    it("Should check if the CloudApp is connected. ",function(done){

        this.timeout(30000);

        var tableName = util.makeString();

        if(CB.CloudApp.isConnected){
            done();
        }else{
            done("Cloud App is not connected.");
        }
    })
    
});
describe("App level ACL, for adding deleting tables of an app via clientKey", function(){

    before(function(){
        CB.appKey = CB.masterKey;
    });

    var tableName = util.makeString();

    it("should not get tables of an app via clientKey",function(done){

        this.timeout(80000);

        var obj = new CB.CloudTable(tableName);

        obj.save().then(function(table){
            if(table.id){
                CB.appKey = CB.jsKey;
                CB.CloudTable.getAll().then(function(table){
                    done('tables should not be fetched via clientKey')
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

    it("should set isTableEditableByClientKey of an app",function(done){

        this.timeout(100000);
        var url = URL+'/settings/'+CB.appId+"/general";
        var params = {};
        params.key = CB.masterKey;
        params.settings = {
        	"isTableEditableByClientKey" : true
        };
          if(!window){
        	//Lets configure and request
			request({
			    url: url, //URL to hit
			    method: 'PUT',
			    headers: {
			        'Content-Type': 'application/json'
			    },
			    json: params //Set the body as a string
			}, function(error, response, json){
			    if(error) {
			        done(error);
			    } else {
			      done();
			    }
			});
        }else{
	       $.ajax({
	 
			    // The URL for the request
			    url: url,
			    // The data to send (will be converted to a query string)
			    data: params,
			    // Whether this is a POST or GET request
			    type: "PUT",
			    // The type of data we expect back
			    dataType : "json",
			    // Code to run if the request succeeds;
			    // the response is passed to the function
			    success: function( json ) {			    			    	
			       if(json.category === "general"){
			       	 done();
			       }else{
			       	 done("Wrong json.");
			       }
			    },
			    // Code to run if the request fails; the raw request and
			    // status codes are passed to the function
			    error: function( xhr, status, errorThrown ) {
			        done("Error thrown.");
			    },
			 
			});
		}
        
    
    });

    it("should now get all the tables via client key",function(done){

        this.timeout(80000);
        CB.appKey = CB.jsKey;
        CB.CloudTable.getAll().then(function(tables){
            if(tables){
                done()
            }else{
                done("Table cannot be created");
            }
        },function(err){
            done(err)
        })
    
    });

    it("should now add a table via client key",function(done){

        this.timeout(80000);
        CB.appKey = CB.jsKey;
        var obj = new CB.CloudTable(util.makeString());

        obj.save().then(function(table){
            if(table.id){
                done()
                table.delete()
            }else{
              done("Table cannot be created");
            }
        },function(err){
            done(err)
        });
        
    
    });

    after(function() {
    	CB.appKey = CB.jsKey;
  	});


});

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
describe("Delete App", function() {
    it("should delete the app and teardown", function(done) {
        this.timeout(100000);
        var appId = util.makeString();
        var url = URL+'/app/'+CB.appId;
        var params = {};
        params.secureKey = SECURE_KEY;
        params.method = "DELETE";

         if(!window){
        	//Lets configure and request
			request({
			    url: url, //URL to hit
			    method: 'POST',
			    headers: {
			        'Content-Type': 'application/json'
			    },
			    json: params //Set the body as a string
			}, function(error, response, body){
			    if(error) {
			        done(error);
			    } else {
			       done();
			    }
			});
        }else{

	       $.ajax({
	 
			    // The URL for the request
			    url: url,
			 
			    // The data to send (will be converted to a query string)
			    data: params,
			 
			    // Whether this is a POST or GET request
			    type: "PUT",
			 
			    // The type of data we expect back
			    dataType : "json",
			 
			    // Code to run if the request succeeds;
			    // the response is passed to the function
			    success: function( json ) {
			       done();
			    },
			 
			    // Code to run if the request fails; the raw request and
			    // status codes are passed to the function
			    error: function( xhr, status, errorThrown ) {
			        done("Error");
			    },
			 
			   
			});
	   }


    });
});

describe("Disabled Realtime Tests", function() {
   


    it("should create the app and init the CloudApp.", function(done) {
        this.timeout(100000);
        var appId = util.makeString();
        var url = URL+'/app/'+appId;
        var params = {};
        params.secureKey = SECURE_KEY;
          if(!window){
        	//Lets configure and request
			request({
			    url: url, //URL to hit
			    method: 'POST',
			    headers: {
			        'Content-Type': 'application/json'
			    },
			    json: params //Set the body as a string
			}, function(error, response, json){
			    if(error) {
			        done(error);
			    } else {
			       CB.CloudApp.init(URL, json.appId, json.keys.js,{disableRealtime : true});
			       CB.masterKey = json.keys.master;
			       CB.jsKey = json.keys.js;
			       done();
			    }
			});
        }else{
	       $.ajax({
	 
			    // The URL for the request
			    url: url,
			 
			    // The data to send (will be converted to a query string)
			    data: params,
			 
			    // Whether this is a POST or GET request
			    type: "POST",
			 
			    // The type of data we expect back
			    dataType : "json",
			 
			    // Code to run if the request succeeds;
			    // the response is passed to the function
			    success: function( json ) {
			       CB.CloudApp.init(URL, json.appId, json.keys.js,{disableRealtime : true});
			       CB.masterKey = json.keys.master;
			       CB.jsKey = json.keys.js;
			       done();
			    },
			 
			    // Code to run if the request fails; the raw request and
			    // status codes are passed to the function
			    error: function( xhr, status, errorThrown ) {
			        done("Error thrown.");
			    },
			 
			});
		}

	 });
});

describe("Disabled CloudNotification", function() {
 
    it("should subscribe to a channel", function(done) {
    	try{
	      this.timeout(20000);
	        CB.CloudNotification.on('sample',
	      function(data){
	      }, 
	      {
	      	success : function(){
	      		done();
	      	}, 
	      	error : function(){
	      		throw 'Error subscribing to a CloudNotification.';
	      	}
	      });
	    }catch(e){
	    	done();
	    }
    });

    it("should publish data to the channel.", function(done) {
    	try{
	        this.timeout(30000);
	        CB.CloudNotification.on('sample',
	      function(data){
	      	if(data === 'data'){
	      		done();
	      	}else{
	      		throw 'Error wrong data received.';
	      	}
	      }, 
	      {
	      	success : function(){
	      		//publish to a channel. 
	      		CB.CloudNotification.publish('sample', 'data',{
					success : function(){
						//succesfully published. //do nothing. 
					},
					error : function(err){
						//error
						throw 'Error publishing to a channel in CloudNotification.';
					}
					});
	      	}, 
	      	error : function(){
	      		throw 'Error subscribing to a CloudNotification.';
	      	}

	      });
	    }catch(e){
	    	done();
	    }
    });


    it("should stop listening to a channel", function(done) {

    	try{

	    	this.timeout(20000);

	     	CB.CloudNotification.on('sample', 
		      function(data){
		      	throw 'stopped listening, but still receiving data.';
		      }, 
		      {
		      	success : function(){
		      		//stop listening to a channel. 
		      		CB.CloudNotification.off('sample', {
						success : function(){
							//succesfully stopped listening.
							//now try to publish. 
							CB.CloudNotification.publish('sample', 'data',{
								success : function(){
									//succesfully published.
									//wait for 5 seconds.
									setTimeout(function(){ 
										done();
									}, 5000);
								},
								error : function(err){
									//error
									throw 'Error publishing to a channel.';
								}
							});
						},
						error : function(err){
							//error
							throw 'error in sop listening.';
						}
					});
		      	}, 
		      	error : function(){
		      		throw 'Error subscribing to a CloudNotification.';
		      	}
		      });
     }catch(e){
     	done();
     }
    });

});
describe("Disabled - Cloud Objects Notification", function() {
  
	  var obj = new CB.CloudObject('Student');
    var obj1 = new CB.CloudObject('student4');

    it("should alert when the object is created.", function(done) {
      try{
        this.timeout(40000);

        CB.CloudObject.on('Student', 'created', function(data){
         if(data.get('name') === 'sample') {
             
             CB.CloudObject.off('Student','created',{success:function(){},error:function(){}});
         }
         else
          throw "Wrong data received.";
        }, {
        	success : function(){
        		obj.set('name', 'sample');
        		obj.save().then(function(newObj){
        			obj = newObj;
        		});
        	}, error : function(error){
        		throw 'Error listening to an event.';
        	}
        });
      }catch(e){
        done();
      }

    });



   it("should throw an error when wrong event type is entered. ", function(done) {

       this.timeout(40000);
     	try{
     	  CB.CloudObject.on('Student', 'wrongtype', function(data){
	      	throw 'Fired event to wrong type.';
	      });

	      throw 'Listening to wrong event type.';
     	}catch(e){
     		done();
     	}     

    });

    it("should alert when the object is updated.", function(done) {
      try{
          this.timeout(40000);
          CB.CloudObject.on('student4', 'updated', function(data){
              CB.CloudObject.off('student4','updated',{success:function(){},error:function(){}});
          }, {
          	success : function(){
                obj1.save().then(function(){
          		    obj1.set('age', 15);
          		    obj1.save().then(function(newObj){
          			    obj1 = newObj;
          		    }, function(){
          			    throw 'Error Saving an object.';
          		    });
                },function(){
                    throw 'Error Saving an object.'
                });
          	}, error : function(error){
          		throw 'Error listening to an event.';
          	}

          });
      }catch(e){
          done();
      }
    });

    it("should alert when the object is deleted.", function(done) {
      try{
        this.timeout(50000);

        CB.CloudObject.on('Student', 'deleted', function(data){
        	if(data instanceof CB.CloudObject) {
              CB.CloudObject.off('Student','deleted',{success:function(){},error:function(){}});
          }
          else
            throw "Wrong data received.";
        }, {
        	success : function(){
        		obj.set('name', 'sample');
        		obj.delete();
        	}, error : function(error){
        		throw 'Error listening to an event.';
        	}
        });
      }catch(e){
        done();
      }
    });

    it("should alert when multiple events are passed.", function(done) {
      try{
        this.timeout(40000);
        var cloudObject = new CB.CloudObject('Student');
        var count = 0;
        CB.CloudObject.on('Student', ['created', 'deleted'], function(data){
        	count++;
        	if(count === 2){
        	}
        }, {
        	success : function(){
        		cloudObject.set('name', 'sample');
        		cloudObject.save({
        			success: function(newObj){
        				cloudObject = newObj;
        				cloudObject.set('name', 'sample1');
        				cloudObject.save();
        				cloudObject.delete();
        			}
        		});

        	}, error : function(error){
        		throw 'Error listening to an event.';
        	}
        });
      }catch(e){
        done();
      }
    });

    it("should alert when all three events are passed", function(done) {
      try{
        this.timeout(40000);
         
        var cloudObject = new CB.CloudObject('Student');
        var count = 0;
        CB.CloudObject.on('Student', ['created', 'deleted', 'updated'], function(data){
        	count++;
        }, {
        	success : function(){
        		cloudObject.set('name', 'sample');
        		cloudObject.save({
        			success : function(newObj){
        				cloudObject = newObj; 
        				cloudObject.set('name', 'sample1');
        				cloudObject.save({success : function(newObj){
  	      				cloudObject = newObj; 
  	      				cloudObject.delete();
  	      			}
  	      			});
        			}
        		});
        	}, error : function(error){
        		throw 'Error listening to an event.';
        	}
        });
      }catch(e){
        done();
      }
    });

    it("should stop listening.", function(done) {
      try{
        this.timeout(40000);
        var cloudObject = new CB.CloudObject('Student');
        var count = 0;
        CB.CloudObject.on('Student', ['created','updated','deleted'], function(data){
            count++;
        }, {
        	success : function(){
        		CB.CloudObject.off('Student', ['created','updated','deleted'], {
  		      	success : function(){
  		      		cloudObject.save();
  		      	}, error : function(error){
  		      		throw 'Error on stopping listening to an event.';
  		      	}
  		      });
        	}, error : function(error){
        		throw 'Error listening to an event.';
        	}
        });

        setTimeout(function(){
        	if(count ===  0){
        		done();
        	}else{
        		throw 'Listening to events even if its stopped.';
        	}
        }, 5000);
      }catch(e){
        done();
      }
    });

});