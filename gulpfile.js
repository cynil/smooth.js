var gulp = require('gulp')
var rename = require('gulp-rename')

var sass = require('gulp-sass')
var autoprefixer = require('gulp-autoprefixer')

gulp.task('scss', function(){
    return gulp.src('./style/merge.scss')
        .pipe(sass())
        .pipe(autoprefixer())
        .pipe(rename('smooth.css'))
        .pipe(gulp.dest('./dist/'))
})