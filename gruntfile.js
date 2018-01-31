﻿/*
#     CloudBoost - Core Engine that powers Bakend as a Service
#     (c) 2014 HackerBay, Inc. 
#     CloudBoost may be freely distributed under the Apache 2 License
*/

module.exports = function (grunt) {

    var pkg = require("./package.json");
    var config = {
        concat: {
            test: {
                // the files to concatenate
                src: [
                    'test/config.js',
                    'test/util/util.js',
                    'test/requireModules.js',
                    'test/init/init.js',
                    'test/app/CloudApp.js',
                    'test/users/CloudUsers.js',
                    'test/email/CloudEmail.js',
                    'test/app/DeleteApp.js'
                ],
                dest: 'test/test.js'
            }
        },
        bumpup: 'package.json',
        env: {
            build: {
                CLOUDBOOST_VERSION: pkg.version
            },
        },
        eslint: {
            all: ["*.js", "**/*.js", "api/**/*.js", "!node_modules/**/*.js"]
        },


    }
    grunt.initConfig(config);


    grunt.loadNpmTasks("grunt-bumpup");
    grunt.loadNpmTasks("grunt-env");
    grunt.loadNpmTasks("grunt-eslint");
    grunt.loadNpmTasks('grunt-contrib-concat');


    grunt.registerTask('test', ['concat:test']);
    grunt.registerTask('default', ['bumpup', "env:build", "eslint:all"]);
};