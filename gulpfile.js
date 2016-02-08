var gulp = require('gulp');
var babel = require('gulp-babel');
var mocha = require('gulp-mocha');

gulp.task('compile', function () {
  return gulp.src('src/**/*.js').pipe(babel()).pipe(gulp.dest('target'));
});

gulp.task('test', ['compile'], function () {
  return gulp.src('target/test/**/*.js').pipe(mocha());
});

gulp.task('default', ['compile', 'test']);
