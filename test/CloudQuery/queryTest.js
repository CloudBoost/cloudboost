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
