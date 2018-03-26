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