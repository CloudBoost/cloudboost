module.exports = function(grunt) {
  
  grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),

		cssmin: {  
			applib: {  
					options: {},  
					files: {  
							'public/dist/css/applib.min.css':[
								"public/lib/css/bootstrap.min.css",
								"public/lib/css/font-awesome.min.css",
								'public/lib/css/googlefonts.css',
								"public/lib/css/flexslider.min.css",
								"public/lib/css/normalize.min.css",
								"public/lib/css/animate.min.css",
								"public/lib/css/ion.rangeSlider.min.css",
								"public/lib/css/ion.rangeSlider.skinFlat.min.css",
								"public/lib/css/ionicons.min.css",
								"public/css/styles.css"
							]
						}
				}  
		},
		
		imagemin: {
			dynamic: {
				files: [{
					expand: true,
					cwd: 'public/images/',
					src: ['**/*.{png,jpg,gif,svg}'],
					dest: 'public/dist/images/'
				}]
			}
		},

		uglify: {
			options: {  
					compress: true
			},
			joinus: {
				src: [
					'public/plugins/jquery-1.11.1.min.js',
					'public/plugins/jquery-migrate-1.2.1.min.js',
					'public/plugins/bootstrap/js/bootstrap.min.js',
					'public/plugins/bootstrap-hover-dropdown.min.js',
					'public/plugins/back-to-top.js',
					'public/plugins/jquery-placeholder/jquery.placeholder.js',
					'public/plugins/FitVids/jquery.fitvids.js',
					'plugins/flexslider/jquery.flexslider-min.js'
				],
				dest: 'public/dist/js/plugins.js',
			},  
			applib: {  
					src: [
						'public/app.js',  
						'public/lib/js/q.js',
						'public/lib/js/jquery.min.js',
						'public/lib/js/ion.rangeSlider.min.js',
						'public/script.js'
					],  
					dest: 'public/dist/js/applib.js'  
			}  
	}

	});



	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-cssmin');
	grunt.loadNpmTasks('grunt-contrib-imagemin');
	grunt.registerTask('build', ['uglify', 'cssmin', 'imagemin']);

};