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
