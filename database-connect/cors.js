module.exports = function(){
	try{	
	  var cors = require('cors');
	  global.app.use(cors());
 	} catch(err){           
        global.winston.log('error',err);                      
    }
};