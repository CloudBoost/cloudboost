var mongoose = require('mongoose');

module.exports = function(){
	try{
		console.log("SCHEMA MONGODB URL : "+global.keys.prodSchemaConnectionString);
	    mongoose.connect(global.keys.prodSchemaConnectionString);
		return mongoose; 
	}catch(e){                    
        global.winston.log('error',e);                                
    }
};
