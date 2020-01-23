'use strict';

var gulp = require('gulp'),
	del = require('del'),
	sass = require('gulp-sass'),
	rename = require('gulp-rename'),
	sourcemaps = require('gulp-sourcemaps'),
	prefixer = require('gulp-autoprefixer'),
	rigger = require('gulp-rigger'),
	concat = require('gulp-concat'),
	uglify = require('gulp-uglify'),
	imagemin = require('gulp-imagemin'),
    imgCompress = require('imagemin-jpeg-recompress'),
	browserSync = require('browser-sync').create();

var path = {
    dist: {
        html: 'dist/',
        js: 'dist/js/',
        css: 'dist/css/',
        images: 'dist/images/',
        fonts: 'dist/fonts/'
    },
    app: {
        html: 'app/*.html',
        js: 'app/js/main.js',
        styles: 'app/styles/main.scss',
        images: 'app/images/**/*.*',
        fonts: 'app/fonts/**/*.*'
    },
    watch: {
        html: 'app/**/*.html',
        js: 'app/js/**/*.js',
        styles: 'app/styles/**/*.scss',
        images: 'app/images/**/*.*',
        fonts: 'app/fonts/**/*.*'
    },
    script: {
    	jquery: 'node_modules/jquery/dist/jquery.min.js'
    	// slick: 'node_modules/slick-carousel/slick/slick.min.js' 
    },
    clean: 'dist/**'
};

gulp.task('serve', function() {
	browserSync.init({
        server: {
            baseDir: './dist'
        }
    });

    gulp.watch('app/**/*.*').on('change', browserSync.reload);
});

gulp.task('html', function () {
    return gulp.src(path.app.html)
        .pipe(rigger())
        .pipe(gulp.dest(path.dist.html))
});

gulp.task('scss', function () {
    return gulp.src(path.app.styles)
        .pipe(sourcemaps.init())
        .pipe(sass().on('error', sass.logError))
        .pipe(prefixer())
        .pipe(sourcemaps.write())
        .pipe(gulp.dest(path.dist.css))
});

gulp.task('scss:build', function () {
    return gulp.src(path.app.styles)
        .pipe(sourcemaps.init())
        .pipe(sass({outputStyle: 'compressed'}).on('error', sass.logError))
        .pipe(rename({suffix: ".min"}))
        .pipe(prefixer())
        .pipe(sourcemaps.write())
        .pipe(gulp.dest(path.dist.css))
});

gulp.task('js', function () {
    return gulp.src(path.app.js)
        .pipe(rigger())
        .pipe(gulp.dest(path.dist.js))
});

gulp.task('js:build', function () {
    return gulp.src(path.app.js)
        .pipe(rigger())
        .pipe(rename({suffix: ".min"}))
        .pipe(uglify())
        .pipe(gulp.dest(path.dist.js))
});

gulp.task('scripts', function() {
	return gulp.src([
		path.script.jquery,
		path.script.slick
		])
		.pipe(concat('libs.min.js'))
		.pipe(gulp.dest(path.dist.js))
});

gulp.task('images', function () {
    return gulp.src(path.app.images)
        .pipe(gulp.dest(path.dist.images))
});

gulp.task('images:build', function () {
    return gulp.src(path.app.images)
    	.pipe(imagemin([
		    imgCompress({
		    	loops: 4,
		    	min: 70,
		    	max: 80,
		    	quality: 'high'
		    }),
	    	imagemin.gifsicle(),
	    	imagemin.optipng(),
	    	imagemin.svgo()
		]))
        .pipe(gulp.dest(path.dist.images))
});

gulp.task('fonts', function() {
    return gulp.src(path.app.fonts)
        .pipe(gulp.dest(path.dist.fonts))
});

gulp.task('watch', function () {
	gulp.watch(path.watch.html, gulp.series('html'));
	gulp.watch(path.watch.styles, gulp.series('scss'));
	gulp.watch(path.watch.js, gulp.series('js'));
	gulp.watch(path.watch.images, gulp.series('images'));
	gulp.watch(path.watch.fonts, gulp.series('fonts'));
});

gulp.task('dev', gulp.series(
	gulp.parallel(
		'html',
		'scss',
		'js',
		'scripts',
		'images',
		'fonts'
	)
));

gulp.task('build', gulp.series(
	gulp.parallel(
		'html',
		'scss:build',
		'js:build',
		'scripts',
		'images:build',
		'fonts'
	)
));

gulp.task('clean', function() {
  return del.sync([path.clean]);
});

gulp.task('gulp-build', gulp.series(
	'build',
	gulp.parallel('watch', 'serve')
));

gulp.task('default', gulp.series(
	'dev',
	gulp.parallel('watch', 'serve')
));