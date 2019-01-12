/* eslint consistent-return: 0 */
/*
#     CloudBoost - Core Engine that powers Bakend as a Service
#     (c) 2014 HackerBay, Inc.
#     CloudBoost may be freely distributed under the Apache 2 License
*/

const winston = require('winston');
const { getNestedValue: gnv } = require('./util');

function _contains(list1, list2) {
  try {
    if (list1 && list2) {
      for (let i = 0; i < list1.length; i++) {
        if (list2.indexOf(list1[i]) > -1) {
          return true;
        }
      }
      return false;
    }
    return true;
  } catch (err) {
    winston.log('error', { error: String(err), stack: new Error().stack });
  }
}

module.exports = {

  // Takes in userId, rolesId, and ACL and returns true if read access is allowed. Otherwise returns false;
  // @userId - Id of the user.
  // @rolesId - Array of string - RoleId
  // ACL - ACL Object.
  isAllowedReadAccess(userId, rolesId, acl) {
    try {
      if (acl) {
        if (acl.read) {
          // when public is allowed.
          const allowedUsers = gnv(['read', 'allow', 'user'], acl);
          const deniedUsers = gnv(['read', 'deny', 'user'], acl);
          const allowedRoles = gnv(['read', 'allow', 'role'], acl);
          const deniedRoles = gnv(['read', 'deny', 'role'], acl);

          if (allowedUsers && allowedUsers.indexOf('all') > -1) {
            if (userId && deniedUsers && (deniedUsers.indexOf(userId) === -1)) {
              return true;
            }
            if (!userId) {
              return true;
            }
          }

          // user
          if (deniedUsers && (deniedUsers.indexOf(userId) > -1 || deniedUsers.indexOf('all') > -1)) {
            return false;
          }

          if (allowedUsers && (allowedUsers.indexOf(userId) > -1 || allowedUsers.indexOf('all') > -1)) {
            return true;
          }

          if (rolesId && rolesId.length > 0) {
            // role
            if (deniedRoles && _contains(rolesId, deniedRoles)) {
              return false;
            }

            if (allowedRoles && _contains(rolesId, allowedRoles)) {
              return true;
            }
          }
        }
        return false;
      }

      return false;
    } catch (err) {
      winston.log('error', { error: String(err), stack: new Error().stack });
    }
  },
};
