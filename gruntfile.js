﻿/*
#     CloudBoost - Core Engine that powers Bakend as a Service
#     (c) 2014 HackerBay, Inc. 
#     CloudBoost may be freely distributed under the Apache 2 License
*/

module.exports = function (grunt) {
   
    var pkg = require("./package.json");

    var pjson = grunt.file.readJSON('package.json');

    var config = {
        bumpup: 'package.json',
        env : {
          build : {
                CLOUDBOOST_VERSION : pkg.version 
            },
         },
         eslint : {
            all:["*.js","**/*.js","api/**/*.js","!node_modules/**/*.js"]
         },

        concat: {
            sdk: {
                // the files to concatenate
                src: [
                    'sdk/src/Promises.js',
                    'sdk/src/PrivateMethods.js',
                    'sdk/src/CloudSocketClientLib.js',
                    'sdk/src/CloudApp.js',
                    'sdk/src/ACL.js',
                    'sdk/src/CloudNotifications.js',
                    'sdk/src/CloudObject.js',
                    'sdk/src/CloudQuery.js',
                    'sdk/src/CloudRole.js',
                    'sdk/src/CloudFile.js',
                    'sdk/src/CloudGeoPoint.js',
                    'sdk/src/CloudTable.js',
                    'sdk/src/Column.js',
                    'sdk/src/CloudQueue.js',
                    'sdk/src/CloudCache.js',
                    'sdk/src/CloudPush.js',
                    'sdk/src/CloudUser.js',
                    'sdk/src/CloudEvent.js'
                ],
                // the location of the resulting JS file
                dest: 'sdk/dist/cloudboost.js'
            },
            test: {
                // the files to concatenate
                src: [
                    'test/config.js',
                    'test/util/util.js',
                    'test/requireCloudBoost.js',
                    'test/init/init.js',
                    'test/CloudTable/createTestTables.js',
                    'test/misc/exportimportTable.js',
                    'test/CloudFile/CloudFile.js',
                    'test/CloudUser/userTest.js',
                    'test/CloudEvent/test.js',
                    'test/CloudDevice/deviceTest.js',
                    'test/CloudPush/pushSend.js',
                    'test/CloudCache/CloudCache.js',
                    'test/CloudQueue/tests.js',
                    'test/CloudObject/test.js',
                    'test/CloudObject/bulkApi.js',
                    'test/CloudObject/file.js',
                    'test/CloudFile/FileACL.js',
                    'test/CloudObject/expire.js',
                    'test/CloudObject/notification.js',
                    'test/CloudObject/notificationQueries.js',
                    'test/CloudObject/offlineMode.js',
                    'test/CloudObject/encryption.js',
                    'test/CloudExpire/test.js',
                    'test/CloudQuery/includeList.js',
                    'test/CloudQuery/queryTest.js',
                    'test/CloudQuery/encryption.js',
                    'test/CloudRole/role.js',
                    'test/ACL/aclTest1.js',
                    'test/ACL/queryAcl.js',
                    'test/ACL/searchAcl.js',
                    'test/CloudNotification/test.js',
                    'test/ACL/masterKeyACL.js',
                    'test/CloudGeoPoint/CloudGeoPoint.js',
                    'test/CloudObject/versionTest.js',
                    'test/CloudTable/test.js',
                    'test/CloudTable/cloudtable.js',
                    'test/CloudTable/acl.js',
                    'test/CloudApp/acl.js',
                    'test/CloudApp/authPage.js',
                    'test/AtomicityTests/atomicity.js',
                    'test/CloudTable/deleteTestTables.js',
                    'test/CloudApp/deleteApp.js',
                    'test/DisabledRealtime/init.js',
                    'test/DisabledRealtime/CloudNotificationTests.js',
                    'test/DisabledRealtime/CloudObjectNotification.js',
                    'test/DisabledRealtime/CloudObject.js'
                ],
                dest: 'test/test.js'
            },

            sdkRelease: {
                // the files to concatenate
                src: ['sdk/dist/cloudboost.js'],

                // the location of the resulting JS file
                dest: 'sdk/dist/' + pjson.version + '.js'
            }
        },

        uglify: {
            uglifyDev: {
                files: {
                    'sdk/dist/cloudboost.min.js': ['sdk/dist/cloudboost.js']
                }
            },
            uglifyRelease: {
                files: {}
            }
        },
    };

    config.uglify.uglifyRelease.files['dist/' + pjson.version + '.min.js'] = ['dist/' + pjson.version + '.js'];

    grunt.initConfig(config);

    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-bumpup');
    grunt.loadNpmTasks("grunt-env");
    grunt.loadNpmTasks("grunt-eslint");
    
    grunt.registerTask('default', ['bumpup', "env:build",'concat:test',]);
    grunt.registerTask('release', ['concat:sdkRelease', 'uglify:uglifyRelease']);
};


