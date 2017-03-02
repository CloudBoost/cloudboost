﻿﻿/*
#     CloudBoost - Core Engine that powers Bakend as a Service
#     (c) 2014 HackerBay, Inc. 
#     CloudBoost may be freely distributed under the Apache 2 License
*/

module.exports = function (grunt) {
   
    var pkg = require("./package.json");
    
    grunt.initConfig({
        bumpup: 'package.json',
        env : {
          build : {
                CLOUDBOOST_VERSION : pkg.version 
            },
         },
         eslint : {
            all:["*.js","**/*.js","api/**/*.js","!node_modules/**/*.js"]
         }
         
    });
   
    grunt.loadNpmTasks("grunt-bumpup");
    grunt.loadNpmTasks("grunt-env");
    grunt.loadNpmTasks("grunt-eslint");
    
    grunt.registerTask('default', ['bumpup', "env:build","eslint:all"]);
};