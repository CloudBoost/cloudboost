module.exports = function (grunt) {
   
    var pkg = require("./package.json");
    
    grunt.initConfig({
        bumpup: 'package.json',
        env : {
          build : {
                CLOUDBOOST_VERSION : pkg.version 
            },
         } 
    });
   
    grunt.loadNpmTasks("grunt-bumpup");
    grunt.loadNpmTasks("grunt-env");
    
    grunt.registerTask('default', ['bumpup', "env:build"]);
};
