module.exports = function(){

	var elasticsearch = require('elasticsearch');
	var client = new elasticsearch.Client({ //elastic search client.
        hosts: global.keys.elasticSearch, //Elastic Search Server.
        requestTimeout: 60000
	});
	return client;
};