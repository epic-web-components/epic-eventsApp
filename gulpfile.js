/*jslint node:true */

'use strict';

var gulp = require('gulp'),
    autoprefixer = require('gulp-autoprefixer'),
    minify = require('gulp-minify'),
    input = './css/style.css',
    output = './css';

gulp.task('default', function () {
    gulp.start('compress');
    return gulp.src(input)
        .pipe(autoprefixer({
            browsers: ['last 3 versions'],
            cascade: false
        }))
        .pipe(gulp.dest(output));
});

gulp.task('compress', function () {
    gulp.src('./js/*.js')
        .pipe(minify({
            ext: {
                min: '.min.js'
            }
        }))
        .pipe(gulp.dest('./js'));
});