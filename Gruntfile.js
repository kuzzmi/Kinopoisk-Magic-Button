// Generated on 2015-01-10 using generator-angular 0.10.0
'use strict';

// # Globbing
// for performance reasons we're only matching one level down:
// 'test/spec/{,*/}*.js'
// use this if you want to recursively match all subfolders:
// 'test/spec/**/*.js'

module.exports = function(grunt) {

    // Load grunt tasks automatically
    require('load-grunt-tasks')(grunt);

    // Time how long tasks take. Can help when optimizing build times
    require('time-grunt')(grunt);

    // Configurable paths for the application
    var config = {
        src: 'src',
        dist: 'dist',
        version: require('./src/manifest.json').version
    };

    grunt.initConfig({
        config: config,

        compress: {
            main: {
                options: {
                    archive: '<%= config.dist %>/<%= config.version%>.zip'
                },
                expand: true,
                cwd: '<%= config.src %>/',
                src: ['**/*']
            }
        },

        clean: {
            dist: {
                files: [{
                    dot: true,
                    src: [
                        '.tmp',
                        '<%= config.dist %>/{,*/}*',
                        '!<%= config.dist %>/.git{,*/}*'
                    ]
                }]
            },
            server: '.tmp'
        }
    });
};