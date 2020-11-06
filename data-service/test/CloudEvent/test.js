describe("CloudEvent", function() {
    var username = 'ritishgumber';
    var passwd = 'ritish4321';
    it("should track signup event.", function(done) {
        CB.CloudApp.init(URL, CB.appId, CB.masterKey);
        if (CB._isNode) {
            done();
            return;
        }

        this.timeout(30000);

        var obj = new CB.CloudUser();
        obj.set('username', username);
        obj.set('password', passwd);
        obj.set('email', util.makeEmail());
        obj.signUp();
        setTimeout(() => {
            var query = new CB.CloudQuery('_Event');
            query.equalTo('data.username', username);
            query.equalTo('name', 'Signup');
            query.findOne().then(function(obj) {
                if (obj.get('name') === 'Signup')
                    done();
                }
            , function(err) {
                done(err);
            });
        }, 10000)

    });

    it("Should track login event", function(done) {

        if (CB._isNode) {
            done();
            return;
        }

        this.timeout(30000);

        var obj = new CB.CloudUser();
        obj.set('username', username);
        obj.set('password', passwd);
        obj.logIn();
        setTimeout(() => {
            var query = new CB.CloudQuery('_Event');
            query.equalTo('data.username', username);
            query.equalTo('name', 'Login');
            query.findOne().then(function(obj) {
                if (obj.get('name') === 'Login') {
                    CB.CloudApp.init(URL, CB.appId, CB.jsKey);
                    done();
                }
            }, function(err) {
                done(err);
            });
        }, 10000)

    });

});
