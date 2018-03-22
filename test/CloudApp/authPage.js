describe('render page', function() {

    it("should render the Login authentication page.", function(done) {
        this.timeout(100000);
        var url = URL + '/page/' + CB.appId + '/authentication';
        if (!window) {
            request({
                url: url, //URL to hit
                method: 'GET'
            }, function(error, response, body) {

                if (error || response.statusCode === 500 || response.statusCode === 400) {
                    done("something went wrong...");
                } else if (body === 'App Not found' || response.statusCode === 404) {
                    done("App not found");
                } else {
                    if (body.indexOf("template") === -1) {
                        done();
                    }
                }
            });
        } else {
            $.ajax({
                url: url,
                type: "GET",
                success: function(response) {

                    if (error || response.statusCode === 500 || response.statusCode === 400) {
                        done("something went wrong...");
                    } else if (body === 'App Not found' || response.statusCode === 404) {
                        done("App not found");
                    } else {

                        if (body.indexOf("template") === -1) {
                            done();
                        }

                    }
                },
                error: function(xhr, status, errorThrown) {
                    done("Something went wrong..");
                },
            });
        }
    });
});
