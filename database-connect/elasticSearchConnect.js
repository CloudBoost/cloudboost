module.exports = function(){

	try{
		var elasticsearch = require('elasticsearch');
		var client = new elasticsearch.Client({ //elastic search client.
	        hosts: global.keys.elasticSearch, //Elastic Search Server.
	        requestTimeout: 60000
		});
		return client;

	} catch(err){           
        global.winston.log('error',{"error":String(err),"stack": new Error().stack});                      
    }
};