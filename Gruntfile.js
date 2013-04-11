/*global module:false*/
module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    // Metadata.
    pkg: grunt.file.readJSON('package.json'),
    banner: '/*\n * <%= pkg.title || pkg.name %> - v<%= pkg.version %> - ' +
      '<%= grunt.template.today("yyyy-mm-dd") %>\n' +
      '<%= pkg.homepage ? "* " + pkg.homepage + "\\n" : "" %>' +
      ' * Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author.name %>;' +
      ' Licensed <%= _.pluck(pkg.licenses, "type").join(", ") %> \n */\n',
    // Task configuration.
    concat: {
      options: {
        banner: '<%= banner %>',
        stripBanners: true
      },
      http: {
        src: ['client/kue.js','client/_http.js'],
        dest: 'client/http.js'
      }
    },
    esmangle: {
      http: {
        options: {
          banner: '<%= banner %>',
        },
        files: {'client/http.min.js':'client/http.js'},
      }
    }, 
  });

  // These plugins provide necessary tasks.
  grunt.loadNpmTasks('grunt-contrib-concat')
  grunt.loadNpmTasks('grunt-esmangle')

  // Default task.
  grunt.registerTask('http', ['concat:http', 'esmangle:http']);

};
