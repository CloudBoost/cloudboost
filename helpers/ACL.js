
/*
#     CloudBoost - Core Engine that powers Bakend as a Service
#     (c) 2014 HackerBay, Inc. 
#     CloudBoost may be freely distributed under the Apache 2 License
*/

var winston = require('winston');

module.exports = {
    
    //Takes in userId, rolesId, and ACL and returns true if read access is allowed. Otherwise returns false;
    //@userId - Id of the user.
    //@rolesId - Array of string - RoleId
    //ACL - ACL Object.
    isAllowedReadAccess : function (userId, rolesId, acl) {
        
        try{
            if (acl) {
                if (acl.read) {
                    
                    //when public is allowed.
                    if (acl.read.allow.user.indexOf('all') > -1) {
                        if (userId && acl.read.deny && acl.read.deny.user && (acl.read.deny.user.indexOf(userId) === -1)) {
                            return true;
                        }
                        if (!userId) { 
                            return true;
                        }
                    }
                    
                    //user
                    if (acl.read.deny && acl.read.deny.user && (acl.read.deny.user.indexOf(userId)>-1 || acl.read.deny.user.indexOf('all') > -1)) {
                        return false;
                    }
                    
                    if (acl.read.allow && acl.read.allow.user && (acl.read.allow.user.indexOf(userId)>-1 || acl.read.deny.user.indexOf('all') > -1)) {
                        return true;
                    }
                    
                    if (rolesId && rolesId.length>0) {
                        
                        //role
                        if (acl.read.deny && acl.read.deny.role && _contains(rolesId, acl.read.deny.role)) {
                            return false;
                        }
                        
                        if (acl.read.allow && acl.read.allow.role && _contains(rolesId, acl.read.deny.role)) {
                            return true;
                        }
                    }
                }
            }

            return false;

        }catch(err){                    
            winston.log('error',{"error":String(err),"stack": new Error().stack});                                                  
        }
    }
};


function _contains(list1, list2) {
    try{
        if (list1 && list2) {
            for (var i = 0; i < list1.length; list1++) {
                if (list2.indexOf(list1[i]) > -1) {
                    return true;
                }
            }
        } else { 
            return true;
        }

        return false;

    }catch(err){                    
        winston.log('error',{"error":String(err),"stack": new Error().stack});                                                  
    }
} 