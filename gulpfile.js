var gulp      = require('gulp');
var concat    = require('gulp-concat');
var uglify    = require('gulp-uglify');
var rename    = require('gulp-rename');

var scripts = ['bower_components/imagesloaded/imagesloaded.pkgd.js',
                'bower_components/get-style-property/get-style-property.js',
                'bower_components/get-size/get-size.js',
                'bower_components/matches-selector/matches-selector.js',
                'bower_components/eventEmitter/EventEmitter.js',
                'bower_components/eventie/eventie.js',
                'bower_components/doc-ready/doc-ready.js',
                'bower_components/fizzy-ui-utils/utils.js',
                'bower_components/outlayer/item.js',
                'bower_components/outlayer/outlayer.js',
                'any-grid.js'];

gulp.task('default', ['build']);

gulp.task('build', function() {
    gulp.src(scripts)
        .pipe(concat('any-grid.js'))
        .pipe(gulp.dest('dist'))
        .pipe(uglify({
            mangle: false
            }))
        .pipe(rename('any-grid.min.js'))
        .pipe(gulp.dest('dist'));
});