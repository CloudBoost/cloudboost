describe("CloudBoost Email API", function () {

   it('should send emails successfully', done => {
        this.timeout(100000);
        let params = {
            key: testMasterKey,
            emailBody: 'test12',
            emailSubject: 'test12',
            query: ''
        }

        request({
            url: URL + '/email/' + testAppId + '/campaign', //URL to hit
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            json: params //Set the body as a string
        }, function (error, response, json) {
            if (error) {
                done(error);
            } else {
                done();
            }
        });

    });


});