var gulp = require('gulp');
var concat = require('gulp-concat');
var minifyCSS = require('gulp-minify-css');
var path = require('path');
var less = require('gulp-less');

var paths = {
    less: ['./app/less/*.less'],
    js: ['./app/js/**/*.js']
};

gulp.task('default', ['less', 'concatApp', 'copyIndex', 'copyFonts']);

gulp.task('less', function () {
    return gulp.src('./app/less/style.less')
        .pipe(less({
            paths: [path.join(__dirname, 'less', 'includes')]
        }))
        .pipe(minifyCSS())
        .pipe(gulp.dest('./wwwroot/assets/css/'));
});

gulp.task('copyFonts', function () {
    gulp.src([
        './bower_components/font-awesome/fonts/*',
        './bower_components/bootstrap/dist/fonts/*'
    ])
        .pipe(gulp.dest('./wwwroot/assets/font/'))
});

gulp.task('copyIndex', function () {
    gulp.src('./app/index.html').pipe(gulp.dest('./wwwroot/'))
});

gulp.task('concatApp', function () {
    return gulp.src([
        './app/js/HtmlHelper.js',
        './app/js/StorageService.js',
        './app/js/TreeModel.js',
        './app/js/VanillaTree.js',
    ])
        .pipe(concat('app.js'))
        .pipe(gulp.dest('./wwwroot/assets/js/'));
});

gulp.task('watch', function () {
    gulp.watch(paths.less, ['less']);
    gulp.watch(paths.js, ['concatApp']);
});