var querystring = require("querystring");

module.exports = function (){
    var obj={};
    obj.log = function(appId, actionName, url,sdk){     
            global.keyService.getMyUrl().then(function (url) { 
                var post_data = JSON.stringify({
                    host : url,
                    key : global.keys.analyticsKey,
                    appId : appId, 
                    category : actionName.split('/')[0] || null,
                    subCategory : actionName.split('/')[1] || null,
                    sdk : sdk || "REST"
                });
                
                global.request.post({
                    url: global.keys.analyticsUrl, 
                    headers: {
                        'content-type': 'application/json',
                        'content-length': post_data.length
                    },
                    body: post_data
                });

            }, function (error) { 
                console.log("The Application URL not found.");
                console.log(error);
            });
    };
    
    return obj;
};
