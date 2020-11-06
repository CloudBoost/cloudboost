describe("Query on Cloud Object Notifications ", function() {

    //Use Sample Table.
    // -> Which has columns :
    // name : string : required.

    it("limit : 1", function(done) {

        this.timeout(4000);
        //create the query.
        var query = new CB.CloudQuery('Student');
        query.limit = 2;

        var count = 0;

        var timeout = setTimeout(function() {
            done(new Error("Limit Error"));
        }, 3000);

        CB.CloudObject.on('Student', 'created', query, function() {
            ++count;
            if(count == 2){
                clearTimeout(timeout);
                done();
            }
        });

        for (var i = 0; i < 3; i++) {
            //attach it to the event.
            var obj = new CB.CloudObject('Student');
            obj.set('name', 'Nawaz');
            obj.save();
        }

    });

    it("near : 1", function(done) {
        //Custom5 table has location field.

        this.timeout(3000);
        var loc = new CB.CloudGeoPoint("76.991204", "28.605977");
        var query = new CB.CloudQuery('Custom5');
        query.near("location", loc, 40000); //40km
        var timeout = setTimeout(function() {
            done(new Error('event not fired'));
        }, 2000);
        CB.CloudObject.on('Custom5', 'created', query, function() {
            CB.CloudObject.off('Custom5', 'created');
            clearTimeout(timeout);
            done();
        });
        loc = new CB.CloudGeoPoint("77.061327", "28.621272");
        var obj = new CB.CloudObject('Custom5');
        obj.set('location', loc);
        obj.save();

    });

    it("near : 2", function(done) {
        //Custom5 table has location field.

        this.timeout(1000);
        var loc = new CB.CloudGeoPoint("76.991204", "28.605977");
        var query = new CB.CloudQuery('Custom5');
        var isDone = false;
        query.near("location", loc, 40000); //40km

        var timeout = setTimeout(function() {
            if (!isDone) {
                done();
            }
        }, 500);

        CB.CloudObject.on('Custom5', 'created', query, function() {
            CB.CloudObject.off('Custom5', 'created');
            isDone = true;
            clearTimeout(timeout);
            done(new Error('event fired'));
        });
        loc = new CB.CloudGeoPoint("78.486671", "17.385044");
        var obj = new CB.CloudObject('Custom5');
        obj.set('location', loc);
        obj.save();

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
