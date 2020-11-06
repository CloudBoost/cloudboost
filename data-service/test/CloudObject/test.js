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
