
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
                        console.log(e);
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
                                console.log(err);
                                done(err);
                                throw "Unable to save file";
                            });
                        }, function (err) {
                            throw err
                        });
                    } catch (e) {
                        console.log(e);
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
