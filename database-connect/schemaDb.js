var mongoose = require('mongoose');

module.exports = function(){
	console.log("SCHEMA MONGODB URL : "+global.keys.prodSchemaConnectionString);
    mongoose.connect(global.keys.prodSchemaConnectionString);
	return mongoose; 
};
