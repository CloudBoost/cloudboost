/* eslint-disable 
 */
module.exports = function (grunt) {
  // initConfig will take our configuration object. This specifies which tasks
  // and plugins we want to use
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    // specify that we would like to use the uglify plugin with the build and option parameters
    uglify: {
      options: {
        // places a timestamp on top of our minified file
        banner: '/*! <%= pkg.name %> <%= grunt.template.today("dd-mm-yyyy") %> */\n',
      },
    },

    mochaTest: {
      test: {
        options: {
          reporter: 'spec',
          require: [function () {
            mocha = require('mocha');
            chai = require('chai');
            expect = chai.expect;
            chaiHttp = require('chai-http');
            chai.use(chaiHttp);
            URL = 'http://localhost:3000';
            supertest = require('supertest');
            app = require('./app.js')(require('express')(), () => {});
            request = supertest(app);
            fs = require('fs');
            util = {
              makeString() {
                let text = '';
                const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

                for (let i = 0; i < 5; i++) text += possible.charAt(Math.floor(Math.random() * possible.length));

                return text;
              },
              makeEmail() {
                return `${this.makeString()}@sample.com`;
              },
              generateRandomString() {
                let text = '';
                const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

                for (let i = 0; i < 8; i++) text += possible.charAt(Math.floor(Math.random() * possible.length));

                return text;
              },
            };
          },
          ],
        },
        src: ['test/**/*.js'],
      },
    }

  });

  // /////////////////////////////////////////////////////////
  // /Load the uglify and mocha plugins and set it
  // /as the default task
  // /////////////////////////////////////////////////////////
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-mocha-test');

  grunt.registerTask('default', ['mochaTest']);
};
