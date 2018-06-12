
/*
#     CloudBoost - Core Engine that powers Bakend as a Service
#     (c) 2014 HackerBay, Inc. 
#     CloudBoost may be freely distributed under the Apache 2 License
*/


module.exports = function(app){
	try{	

 	} catch(err){           
        global.winston.log('error',{"error":String(err),"stack": new Error().stack});                      
    }
};