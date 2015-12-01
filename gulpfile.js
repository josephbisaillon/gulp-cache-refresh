// Require Gulp
var gulp = require('gulp'),
  gutil = require('gulp-util');

// Require tasks
var cachebust = require('./index');

// This plugin's task
gulp.task('cache-refresh', function () {
  console.log('Gulp Task Running...');
  return gulp.src('test/source/**/*.html')
    .pipe(cachebust({
      type: 'ErrNoVarPassed'
    }))
    .pipe(gulp.dest('./tmp'));
});

// Default task does all of the things
gulp.task('default', [
  'cache-refresh'
]);
