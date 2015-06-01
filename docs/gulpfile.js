var gulp      = require('gulp');
var connect   = require('gulp-connect');
var sourcemaps = require('gulp-sourcemaps');
var notify    = require("gulp-notify");
var less      = require('gulp-less');
var watch     = require('gulp-watch');

var svgs = [
  'bower_components/material-design-icons/navigation/svg/production/ic_arrow_forward_36px.svg',
  'bower_components/material-design-icons/navigation/svg/production/ic_arrow_back_36px.svg'
];

gulp.task('server', function() {
    connect.server({
        port: 8888,
        fallback: 'index.html'
    });
});

gulp.task('default', ['watch', 'process-css']);

gulp.task('watch', function () {
    gulp.watch(['app/Resources/css/*.less', 'app/Resources/css/*.scss'], ['process-css']);
});

gulp.task('process-css', function () {
    return gulp.src(['app/Resources/css/*.less', '!app/Resources/css/variables.less'])
      .pipe(sourcemaps.init())
      .pipe(less().on('error', function (err) {
           notify().write(err);
           this.emit('end');
      }))
      .pipe(sourcemaps.write())
      .pipe(gulp.dest('app/Resources/css'));
});

gulp.task('copy-svg', function() {
    gulp.src(svgs)
      .pipe(gulp.dest('app/Resources/svg'));
});