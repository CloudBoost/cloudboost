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
