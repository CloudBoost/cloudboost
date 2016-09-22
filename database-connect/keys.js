
/*
#     CloudBoost - Core Engine that powers Bakend as a Service
#     (c) 2014 HackerBay, Inc. 
#     CloudBoost may be freely distributed under the Apache 2 License
*/


module.exports = function (){
    return  {
        //Defaults. 
        appExpirationTimeFromCache: 86400,
        cacheAppPrefix : 'app',
        cacheSchemaPrefix: 'schema',
        schemaExpirationTimeFromCache: 86400, 
        analyticsUrl: 'https://analytics.cloudboost.io',
        globalDb : "_GLOBAL",
        globalSettings : "_Settings",
        analyticsKey : "109eb359-3d22-4165-9e21-21439637f975",
        logToken : "c064fc7e-4fc6-41e6-b51f-32c30deafdcc",
        logglySubDomain : "cloudboost"
    };
};
