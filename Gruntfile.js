/*jshint node: true */
"use strict";
module.exports = function (grunt) {
  var pkgInfo = grunt.file.readJSON('package.json');

  grunt.initConfig({
    pkg: pkgInfo,

    exec: {
      firefox: {
        command: 'zip -r release/Inline-translator-' + pkgInfo.version + '.xpi . -i \\*.xul -i \\*.js -i \\*.html -i \\*.properties -i \\*.dtd -i \\*.css -i \\*.png -i \\*.manifest -i \\*.rdf -x release\\* -x node_modules\\*'
      }
    }
  });

  // load plugins
  grunt.loadNpmTasks('grunt-exec');

  // default task
  grunt.registerTask('default', ['exec']);
};
