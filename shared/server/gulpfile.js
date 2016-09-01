var gulp = require('gulp'),
    apidoc = require('gulp-apidoc');
 
gulp.task('doc', function(done){
          apidoc({
            src: "routes/",
            dest: "build/"
          },done);
});