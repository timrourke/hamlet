var gulp =            require('gulp');
var sass =            require('gulp-sass');
var sourcemaps =      require('gulp-sourcemaps');
var minifyCSS =       require('gulp-minify-css');
var mainBowerFiles =  require('main-bower-files');
var uglify =          require('gulp-uglify');
var concat =          require('gulp-concat');
var notify =          require('gulp-notify');
var autoprefixer =    require('gulp-autoprefixer');
var browserSync =     require('browser-sync').create();
var htmlmin =         require('gulp-htmlmin');
var jshint =          require('gulp-jshint');
var rename =          require('gulp-rename');
var responsive =      require('gulp-responsive');
var newer =           require('gulp-newer');
var changed =         require('gulp-changed');
var plumber =         require('gulp-plumber');
var svgmin =          require('gulp-svgmin');
var svgstore =        require('gulp-svgstore');
var inject =          require('gulp-inject');
var cheerio =         require('gulp-cheerio');

// libsass
gulp.task('sass', function () {
  return gulp.src('./scss/style.scss')
    .pipe(sourcemaps.init())
    .pipe(sass({
      includePaths: [
        './node_modules/susy/sass' //required for sass
      ]
    }))
    .pipe(autoprefixer('> 5%', 'last 2 version', 'Firefox ESR', 'Opera 12.1', 'ie 11', 'ie 10', 'ie 9'))
    .pipe(minifyCSS()) //move to prod settings
    .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest('./public/assets/css/'))
    .pipe(browserSync.stream());
});

// libsass for ie stylsheets
gulp.task('sass-ie', function () {
  return gulp.src('./scss/style-ie.scss')
    .pipe(sourcemaps.init())
    .pipe(sass({
      includePaths: [
        './node_modules/susy/sass' //required for sass
      ]
    }))
    .pipe(autoprefixer('> 5%', 'last 2 version', 'Firefox ESR', 'Opera 12.1', 'ie 11', 'ie 10', 'ie 9'))
    .pipe(minifyCSS()) //move to prod settings
    .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest('./public/assets/css/'))
    .pipe(browserSync.stream());
});

// javascripts
gulp.task('js', ['bower'], function() {
  return gulp.src(['./js/vendor/vendor.js', './js/global.js'])
    .pipe(concat('./js-build/global.build.js'))
    .pipe(jshint())
    .pipe(rename('global.min.js'))
    .pipe(uglify())
    .pipe(gulp.dest('./public/assets/js/'))
    .pipe(browserSync.stream());
});

// grab all main bower files, concat them, and put into my vendor.js file
gulp.task('bower', function() {
  return gulp.src(mainBowerFiles(), { base: './bower_components/**'})
    .pipe(sourcemaps.init())
    .pipe(concat('vendor.js'))
    .pipe(sourcemaps.write())
    .pipe(gulp.dest('./js/vendor/'))
});

// gulp.task('images', function() {
//   browserSync.notify('Responsive images starting.');
//   return gulp.src('images-source/**/*.{jpg,jpeg,png,tiff,webp,gif}')
//     .pipe(newer('./public/images/'))
//     .pipe(plumber())
//     .pipe(responsive({
//       '**/*.{jpg,png,tiff,webp,gif}': [{
//           width: 320,
//           rename: {
//             suffix: "-320"
//           },
//           withoutEnlargment: true,
//           passThroughUnused: false,
//           errorOnUnusedImage: false,
//           errorOnUnusedConfig: false,
//           errorOnEnlargement: false
//       },{
//           width: 480,
//           rename: {
//             suffix: "-480"
//           },
//           withoutEnlargment: true,
//           passThroughUnused: false,
//           errorOnUnusedImage: false,
//           errorOnUnusedConfig: false,
//           errorOnEnlargement: false
//       },{
//           width: 640,
//           rename: {
//             suffix: "-640"
//           },
//           withoutEnlargment: true,
//           passThroughUnused: false,
//           errorOnUnusedImage: false,
//           errorOnUnusedConfig: false,
//           errorOnEnlargement: false
//       },{
//           width: 800,
//           rename: {
//             suffix: "-800"
//           },
//           withoutEnlargment: true,
//           passThroughUnused: false,
//           errorOnUnusedImage: false,
//           errorOnUnusedConfig: false,
//           errorOnEnlargement: false
//       },{
//           width: 1024,
//           rename: {
//             suffix: "-1024"
//           },
//           withoutEnlargment: true,
//           passThroughUnused: false,
//           errorOnUnusedImage: false,
//           errorOnUnusedConfig: false,
//           errorOnEnlargement: false
//       },{
//           width: 1280,
//           rename: {
//             suffix: "-1280"
//           },
//           withoutEnlargment: true,
//           passThroughUnused: false,
//           errorOnUnusedImage: false,
//           errorOnUnusedConfig: false,
//           errorOnEnlargement: false
//       },{
//           width: 1600,
//           rename: {
//             suffix: "-1600"
//           },
//           withoutEnlargment: true,
//           passThroughUnused: false,
//           errorOnUnusedImage: false,
//           errorOnUnusedConfig: false,
//           errorOnEnlargement: false
//       },{
//           width: 1890,
//           rename: {
//             suffix: "-1890"
//           },
//           withoutEnlargment: true,
//           passThroughUnused: false,
//           errorOnUnusedImage: false,
//           errorOnUnusedConfig: false,
//           errorOnEnlargement: false
//       },{
//           width: 2400,
//           rename: {
//             suffix: "-2400"
//           },
//           withoutEnlargment: true,
//           passThroughUnused: false,
//           errorOnUnusedImage: false,
//           errorOnUnusedConfig: false,
//           errorOnEnlargement: false
//       },{
//           rename: {
//             suffix: "-original"
//           },
//           withoutEnlargment: true,
//           passThroughUnused: false,
//           errorOnUnusedImage: false,
//           errorOnUnusedConfig: false,
//           errorOnEnlargement: false
//       }]
//     }))
//     .pipe(gulp.dest('./public/images/'));
// });

gulp.task('svgstore', function() {
  return gulp.src('./svg-source/**/*.svg')
    .pipe(svgmin())
    .pipe(cheerio({
      run: function($) {
        $('[fill]').removeAttr('fill');
      },
      parserOptions: { xmlMode: true }
    }))
    .pipe(svgstore())
    .pipe(gulp.dest('./public/assets/svg/'));
});

// watch tasks and serve via browserSync
gulp.task('serve', ['sass', 'sass-ie', 'js',/* 'images',*/ 'svgstore'], function() {
  browserSync.init({
    proxy: 'localhost:9292'
  });

  //gulp.watch('images-source/**/*.{jpg,jpeg,png,tiff,webp,gif}', ['images']);
  gulp.watch('./bower_components/**/*.js', ['js']);
  gulp.watch('./js/**/*.js', ['js']);
  gulp.watch('./svg-source/**/*.svg', ['svgstore']);
  gulp.watch('./scss/**', ['sass', 'sass-ie']);
  gulp.watch("./views/**/*.erb").on("change", browserSync.reload);
});

gulp.task('default', ['serve']);
