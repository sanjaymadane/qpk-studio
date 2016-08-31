var gulp = require('gulp'),
	less = require('gulp-less'),
	minifyCSS = require('gulp-minify-css'),
	minify = require('gulp-minify'),
	concat = require('gulp-concat'),
	uglify = require('gulp-uglify'),
	run_sequence = require('run-sequence'),
	gutil = require('gulp-util');

var build_dir = 'build/';
var paths = {
  scripts: 'js/**/*.js',
  views: 'views/**/*.html',
  resources: ['resources/img/**/*','resources/font/**/*','resources/locales/**/*'],
  index: 'index.html',
  index: 'SpecRunner.html',
  lib:'lib/**/*',
  styles:'resources/css/**/*'
};

gulp.task('resourcecopyfiles', function(){	
	// copy images
	gulp.src('./resources/img/**/*')
		.pipe(gulp.dest(build_dir + 'resources/img'));

	// copy fonts
	gulp.src('./resources/font/**/*')
		.pipe(gulp.dest(build_dir + 'resources/font'));

	// copy locales
	gulp.src('./resources/locales/**/*')
		.pipe(gulp.dest(build_dir + 'resources/locales'));

});
gulp.task('libcopyfiles', function(){

	// copy libraries
	return gulp.src('./lib/**/*')
		.pipe(gulp.dest(build_dir + 'lib'));

});
gulp.task('cpIndexHtml', function(){
	gulp.src('./index.html')
		.pipe(gulp.dest(build_dir));

  gulp.src('./SpecRunner.html')
    .pipe(gulp.dest(build_dir));

  gulp.src('./callback.html')
    .pipe(gulp.dest(build_dir));
});
gulp.task('cpViews', function(){
	gulp.src('./views/**/*')
		.pipe(gulp.dest(build_dir+ 'views'));
});

gulp.task('scripts', function() {
   gulp.src(['./js/config.js'])
        //.pipe(minify())
        //.pipe(uglify())
        .pipe(concat('config.min.js'))
        .pipe(gulp.dest(build_dir + 'js'));

    gulp.src(['./js/app.js'])
        //.pipe(minify())
        //.pipe(uglify())
        .pipe(concat('app.min.js'))
        .pipe(gulp.dest(build_dir + 'js'));

    gulp.src(['./js/controllers/**/*.js'])
        //.pipe(minify())
        //.pipe(uglify())
        .pipe(concat('controllers.min.js'))
        .pipe(gulp.dest(build_dir + 'js'));

    gulp.src(['./js/services/*.js'])
        //.pipe(minify())
        //.pipe(uglify())
        .pipe(concat('services.min.js'))
        .pipe(gulp.dest(build_dir + 'js'));

    gulp.src(['./js/directives/*.js'])
        //.pipe(minify())
        //.pipe(uglify())
        .pipe(concat('directives.min.js'))
        .pipe(gulp.dest(build_dir + 'js'));

    gulp.src(['./js/specs/*.js'])
        //.pipe(minify())
        //.pipe(uglify())
        .pipe(concat('specs.min.js'))
        .pipe(gulp.dest(build_dir + 'js'));
});

gulp.task('styles', function() {
    return gulp.src(['./resources/css/*.less','./resources/css/*.css'])
        .pipe(less())
        //.pipe(minifyCSS())
        .pipe(concat('app.min.css'))
        .pipe(gulp.dest(build_dir + 'resources/css'));
});

gulp.task('default', function() {
    gulp.run('cpIndexHtml','resourcecopyfiles','libcopyfiles','cpIndexHtml','cpViews','styles','scripts');
    return gutil.log('Gulp task completed');
});

gulp.task('watch', function() {
  gulp.watch(paths.index, ['cpIndexHtml']);
  gulp.watch(paths.views, ['cpViews']);
  gulp.watch(paths.resources, ['resourcecopyfiles']);
  gulp.watch(paths.scripts, ['scripts']);
  gulp.watch(paths.styles, ['styles']);
  gulp.watch(paths.lib, ['libcopyfiles']);
});