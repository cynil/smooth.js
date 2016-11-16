var gulp = require('gulp')
var rename = require('gulp-rename')

//scripts
var browserify = require('browserify')
var vinyl = require('vinyl-source-stream')
var buffer = require('vinyl-buffer')
var uglify = require('gulp-uglify')

//style
var sass = require('gulp-sass')
var autoprefixer = require('gulp-autoprefixer')
var minify = require('gulp-minify-css')

//serve
var sync = require('browser-sync')
    reload = sync.reload

///////////////////
//build
gulp.task('scss', function(){
    return gulp.src('./style/app.scss')
        .pipe(sass())
        .pipe(autoprefixer())
        .pipe(minify())
        .pipe(rename('dist.css'))
        .pipe(gulp.dest('./build/'))
        .pipe(reload({stream: true}))
})

gulp.task('js', function(){
    return browserify('./src/app.js')
        .bundle()
        .pipe(vinyl('dist.js'))//source
        .pipe(buffer())
        //.pipe(uglify())
        .pipe(gulp.dest('./build/'))
        .pipe(reload({stream: true}))
})

gulp.task('default', ['scss', 'js'], function(){
    sync({
        server: {
            baseDir: './build' 
        }
    })

    gulp.watch(['./style/*.scss','./src/*.js','./build/index.html'], ['scss', 'js'])
})

/////////////////////
//to dist
gulp.task('scss-dist', function(){
    return gulp.src('./style/merge.scss')
        .pipe(sass())
        .pipe(autoprefixer())
        .pipe(minify())
        .pipe(rename('smooth.css'))
        .pipe(gulp.dest('./dist/'))
})
gulp.task('js-dist', function(){
    return gulp.src('./src/smooth.js')
        .pipe(gulp.dest('./dist/'))
})
gulp.task('dist', ['scss-dist', 'js-dist'], function(){
    console.log('build success')
})