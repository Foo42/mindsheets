module.exports = function(grunt) {
    grunt.initConfig({
        qunit: {
            all: ['./tests/TestRunnerPage.html']
        },
        watch: {
            scripts: {
                files: ['**/*.js'],
                tasks: ['qunit'],
                options: {
                    spawn: false
                }
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-qunit');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-notify');

    grunt.registerTask('default', ['qunit', 'watch']);
};