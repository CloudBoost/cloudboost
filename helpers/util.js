var URL = require('url');

module.exports = {
	
	isUrlValid : function(data){
        try{
            var obj = URL.parse(data);
            if(!obj.protocol || !obj.hostname)
                return false;
            return true;
        }catch(err){                    
            global.winston.log('error',{"error":String(err),"stack": new Error().stack});                                                            
        }   
	},

	isEmailValid : function(data){
        try{
            var re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
            return re.test(data);
        }catch(err){                    
            global.winston.log('error',{"error":String(err),"stack": new Error().stack});                                                            
        }
	},

    getId: function() {
        try{
            var id="";
            var possible="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
            for(var i=0;i<8;i++)
            {
                id = id + possible.charAt(Math.floor(Math.random()*possible.length));
            }
            return id;

        }catch(err){                    
            global.winston.log('error',{"error":String(err),"stack": new Error().stack});                                                            
        }
    }
};