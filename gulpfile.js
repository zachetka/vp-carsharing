const { src, dest, series, parallel, watch } = require('gulp');
const env = process.env.NODE_ENV;
const del = require('del');
const browserSync = require('browser-sync').create();
const concat = require('gulp-concat');
const sourcemaps = require('gulp-sourcemaps');
const htmlmin = require('gulp-htmlmin');
const replace = require('gulp-replace');
const sass = require('gulp-sass');
sass.compiler = require('node-sass');
const sassGlob = require('gulp-sass-glob');
const postcss = require('gulp-postcss');
const pxtorem = require('postcss-pxtorem');
const autoprefixer = require('autoprefixer');
const mqpacker = require('mqpacker');
const babel = require('gulp-babel');
const uglify = require('gulp-uglify');
const imagemin = require('gulp-imagemin');
const changed = require('gulp-changed');

/* Paths */
const srcPath = 'src';
const destPath = 'docs';
const path = {
    clean: destPath,
    src: {
        html: `${srcPath}/*.html`,
        css: `${srcPath}/styles/main.scss`,
        js: `${srcPath}/scripts/main.js`,        
        img: `${srcPath}/images/**/*.{jpg,png,svg,gif,ico}`,
    },
    watch: {
        html: `${srcPath}/**/*.html`,
        css: `${srcPath}/**/*.scss`,
        js: `${srcPath}/**/*.js`,
        img: `${srcPath}/images/**/*.{jpg,png,svg,gif,ico}`,
    },
    build: {
        html: destPath,
        css: `${destPath}/assets`,
        js: `${destPath}/assets`,
        img: `${destPath}/assets/images`,    
    },
    styleLibs: [
        'node_modules/slick-carousel/slick/slick.css'
    ],
    scriptLibs: [
        'node_modules/jquery/dist/jquery.js',
        'node_modules/slick-carousel/slick/slick.min.js'
    ],
};

/* Tasks */
function clean() {
    return del(path.clean);
}

function server() {
    browserSync.init({
        watch: true,
        server: destPath,
    });
}

function observe() {
    watch(path.watch.html, html);
    watch(path.watch.css, css);
    watch(path.watch.js, js);
    watch(path.watch.img, img);
}

function html() {
    return src(path.src.html)
        .pipe(
            htmlmin({
                removeComments: true,
                collapseWhitespace: true,
            })
        )
        .pipe(replace('/src/images', 'assets/images'))
        .pipe(dest(path.build.html));
}

function css() {
    if (env === 'prod') {
        return src([...path.styleLibs, path.src.css])
            .pipe(concat('style.min.css'))
            .pipe(sassGlob())
            .pipe(
                sass({ outputStyle: 'compressed' }).on('error', sass.logError)
            )
            .pipe(
                postcss([
                    autoprefixer({ grid: true }),
                    mqpacker({
                        sort: true,
                    }),
                    pxtorem({
                        rootValue: 16,
                        unitPrecision: 5,
                        propList: ['*'],
                        replace: true,
                        mediaQuery: false,
                        minPixelValue: 2,
                    }),
                ])
            )
            .pipe(replace('/src/images', 'images'))
            .pipe(dest(path.build.css));
    } else {
        return src([...path.styleLibs, path.src.css])
            .pipe(sourcemaps.init())
            .pipe(concat('style.min.css'))
            .pipe(sassGlob())
            .pipe(sass({ outputStyle: 'expanded' }).on('error', sass.logError))
            .pipe(sourcemaps.write())
            .pipe(replace('/src/images', 'images'))
            .pipe(dest(path.build.css));
    }
}

function js() {
    if (env === 'prod') {
        return src([...path.scriptLibs, path.src.js])
            .pipe(concat('script.min.js', { newLine: ';' }))
            .pipe(
                babel({
                    presets: ['@babel/env'],
                })
            )
            .pipe(uglify())
            .pipe(dest(path.build.js));
    } else {
        return src([...path.scriptLibs, path.src.js])
            .pipe(sourcemaps.init())
            .pipe(concat('script.min.js', { newLine: ';' }))
            .pipe(sourcemaps.write())
            .pipe(dest(path.build.js));
    }
}

function img() {    
    return src(path.src.img)
        .pipe(changed(path.build.img))
        .pipe(
            imagemin([
                imagemin.gifsicle({ interlaced: true }),
                imagemin.mozjpeg({ quality: 75, progressive: true }),
                imagemin.optipng({ optimizationLevel: 5 }),
                imagemin.svgo({
                    plugins: [{ removeViewBox: true }, { cleanupIDs: false }],
                }),
            ])
        )
        .pipe(dest(path.build.img));
}

exports.default = series(
    clean,
    parallel(html, css, js, img),
    parallel(observe, server)
);
