module.exports = function (grunt) {
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        eslint: {
            target: {
                src: ['index.js', 'src/*.js', 'test/*.js']
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
        },
        mochaTest: {
            test: {
                options: {
                    reporter: 'spec',
                    require: function () {
                        require('babel/register')({stage: 0});
                    }
                },
                src: ['./test/**/*.js']
            }
        },
    });

    grunt.registerTask('eslint', 'eslint:target');
    grunt.registerTask('build', ['eslint:target', 'babel:build']);
    grunt.registerTask('test', ['eslint:target', 'mochaTest:test']);

    require('load-grunt-tasks')(grunt);
};