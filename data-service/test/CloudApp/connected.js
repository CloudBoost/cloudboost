describe("Cloud App is connected.", function() {

    //Use Sample Table.
    // -> Which has columns :
    // name : string : required.

    it("Should check if the CloudApp is connected. ",function(done){

        this.timeout(30000);

        var tableName = util.makeString();

        if(CB.CloudApp.isConnected){
            done();
        }else{
            done("Cloud App is not connected.");
        }
    })
    
});