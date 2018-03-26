describe("Offline Mode", function() {

    var obj1 = new CB.CloudObject('Student');
    obj1.set('name', 'Student');
    var obj2 = new CB.CloudObject('Sample');
    obj2.set('name', 'Sample');
    var obj3 = new CB.CloudObject('Custom3');
    obj3.set('address', 'Najafgarh New Delhi');

    it("should pin the object to local store", function(done) {
        this.timeout(70000);

        
        CB.CloudApp.disconnect();
        setTimeout(function() {
            var found = false;
            var obj = new CB.CloudObject('Student');
            obj.set('name', 'Ritish');
            obj.pin({
                success: function(data) {
                    found = data.some(function(element) {
                        return element._hash == obj.document._hash;
                    })
                },
                error: function(err) {
                    done(err);
                }
            });
            setTimeout(function() {
                if (found)
                    done();
                else {
                    done('object not found in local store.')
                }
            }, 5000);

        }, 50000);

    });

    it("should pin multiple objects to local store", function(done) {

        this.timeout(30000);
        var count = 0;
        obj1.pin({
            success: function(data) {
                data.some(function(element) {
                    if (element._hash == obj1.document._hash)
                        count++;
                    }
                );
            },
            error: function(err) {
                done(err);
            }
        });
        CB.CloudObject.pin([
            obj2, obj3
        ], {
            success: function(data) {
                data.some(function(element) {
                    if (element._hash == obj1.document._hash)
                        count++;
                    else if (element._hash == obj2.document._hash)
                        count++;
                    else if (element._hash == obj3.document._hash)
                        count++;
                    }
                );
            },
            error: function(err) {
                done(err);
            }
        });
        setTimeout(function() {
            if (count == 3)
                done();
            else {
                done('object not found in local store.')
            }
        }, 5000);
    });

    it("should unpin the object from the local store", function(done) {

        this.timeout(30000);
        var count = 0;

        obj1.unPin({
            success: function(data) {
                data.some(function(element) {
                    if (element._hash == obj1.document._hash)
                        count++;
                    }
                );
            },
            error: function(err) {
                done(err);
            }
        });
        setTimeout(function() {
            if (count == 0)
                done();
            else {
                done('object found in local store.')
            }
        }, 5000);

    });

    it("should unpin multiple objects from the local store", function(done) {

        this.timeout(30000);
        var count = 0;

        CB.CloudObject.unPin([
            obj2, obj3
        ], {
            success: function(data) {
                data.some(function(element) {
                    if (element._hash == obj2.document._hash)
                        count++;
                    else if (element._hash == obj3.document._hash)
                        count++;

                    }
                );
            },
            error: function(err) {
                done(err);
            }
        });
        setTimeout(function() {
            if (count == 0)
                done();
            else {
                done('objects found in local store.')
            }
        }, 5000);

    });

    it("should save the objects eventually", function(done) {

        this.timeout(30000);
        var count = 0;

        var obj2 = new CB.CloudObject('Student');
        obj2.set('name', 'Offline-Student');
        obj2.set('age', 79);
        obj2.saveEventually({
            success: function(obj) {
                count++;
            },
            error: function(err) {
                done(err);
            }
        });

        setTimeout(function() {
            var obj1 = new CB.CloudObject('Offline');
            obj1.set('name', 'Offline-offline');
            obj1.set('age', 79);
            obj1.saveEventually({
                success: function(obj) {
                    count++;
                },
                error: function(err) {
                    done(err);
                }
            });
        }, 1000);

        setTimeout(function() {
            if (count == 2)
                done();
            else {
                done('objects not saved.')
            }
        }, 5000);

    });

    it("should query the local store", function(done) {

        this.timeout(30000);
        var query = new CB.CloudQuery('Offline');
        query.equalTo('name', 'Offline-offline');
        query.findFromLocalStore({
            success: function(obj) {
                
                if (obj[0].get('name') == 'Offline-offline')
                    done();
                else
                    done('Not found');
                }
            ,
            error: function(err) {
                done(err);
            }
        })

    });

    it("should call sync function on onConnect", function(done) {

        this.timeout(30000);
        var count = 0;
        
        CB.CloudApp.connect();

        setTimeout(function() {
            var query = new CB.CloudQuery('Student');
            query.equalTo('name', 'Offline-Student');
            query.find({
                success: function(obj) {
                    
                    if (obj[0].get('name') == 'Offline-Student')
                        done();
                    else
                        done('Not found');
                    }
                ,
                error: function(err) {
                    done(err);
                }
            })
        }, 10000);

    });

    it("should clear the local store", function(done) {

        this.timeout(30000);
        CB.CloudObject.clearLocalStore({
            success: function(obj) {
                done();
            },
            error: function(err) {
                done(err);
            }
        })

    });

});
