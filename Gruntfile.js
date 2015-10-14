module.exports = function (grunt) {
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        eslint: {
            target: {
                src: ['index.js', 'test/*.js']
            }
        },
        babel: {
            build: {
                options: {
                    sourceMap: true,
                    stage: 0,
                    optional: ['runtime']
                },
                files: {
                    'lib/ver-iterator.js': './index.js'
                }
            }
        }
    });

    grunt.registerTask('eslint', 'eslint:target');
    grunt.registerTask('build', ['eslint:target', 'babel:build']);

    require('load-grunt-tasks')(grunt);
};