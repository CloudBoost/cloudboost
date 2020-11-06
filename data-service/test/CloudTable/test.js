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