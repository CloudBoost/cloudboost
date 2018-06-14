
describe("Export & Import Database", function () {

    var savedObject = [];
    var defaultTables = ["_Schema", "Device", "_Event", "_File", "_Funnel", "Role", "User", "_Settings"];
    var tables = [];

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
            tables.push("Hospital");
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

    it("Export Database and Import Database", function (done) {
        this.timeout(200000);
        var default_count = 0;
        var table_count = 0;
        var exportUrl = CB.apiUrl + "/backup/" + CB.appId + "/exportdb";
        var importUrl = CB.apiUrl + "/backup/" + CB.appId + "/importdb";
        var exportParams = { key: CB.appKey };
        var importParams = {};
        if (!window) {
            CB._request('POST', exportUrl, exportParams).then(function (resp) {
                data = JSON.parse(resp);
                if (typeof data == "object") {
                    data.map(function (element) {
                            if (defaultTables.indexOf(element.name) != -1) {
                                default_count++;
                            } else if (tables.indexOf(element.name) != -1) {
                                table_count++;
                            }
                    });
                    if (table_count >= tables.length && default_count == defaultTables.length) {
                        done();
                    } else {
                        done("Data Inappropriate");
                    }
                }
            }, function (err) {
                done(err)
            });
        } else {
            $.ajax({
                url: exportUrl,
                type: "POST",
                data: exportParams,
                success: function (resp) {
                    try {
                        data = JSON.parse(resp);
                        if (typeof data == "object") {
                            data.map(function (element) {
                                    if (defaultTables.indexOf(element.name) != -1) {
                                        default_count++;
                                    } else if (tables.indexOf(element.name) != -1) {
                                        table_count++;
                                    }
                            });
                            if (table_count >= tables.length && default_count == defaultTables.length) {
                                done();
                            } else {
                                done("Data Inappropriate");
                            }
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

});
