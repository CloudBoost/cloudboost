describe("CloudApp Socket Test", function () {

    it("Should fire an event when disconnect", function (done) {

       this.timeout(40000);

       CB.CloudApp.onDisconnect(function(){
        done();
       });

       CB.CloudApp.disconnect();

    });

    it("Should fire an event when connect.", function (done) {

       this.timeout(30000);

       CB.CloudApp.onConnect(function(){
        done();
       });

       CB.CloudApp.connect();

    });


});