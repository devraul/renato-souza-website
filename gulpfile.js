const autoprefixer = require('autoprefixer')
const clean = require('gulp-clean')
const concat = require('gulp-concat')
const cssnano = require('gulp-cssnano')
const data = require('gulp-data')
const gulp = require('gulp')
const imagemin = require('gulp-imagemin')
const jsmin = require('gulp-jsmin')
const postcss = require('gulp-postcss')
const postImport = require('postcss-import')
const pug = require('gulp-pug')
const rename = require('gulp-rename')
const revision = require('gulp-rev')
const revDelete = require('gulp-rev-delete-original')
const sequence = require('gulp-sequence')

const DEST_FOLDER = 'dist/'

const MANIFEST_CONFIG = {
	merge: true,
	manifestName: 'rev-manifest.json',
	manifestPath: 'src/data/'
}

gulp.task('build', ['clean'], callback =>
	sequence(['css', 'image', 'copy-files'], 'revision', 'pug')(callback)
)

gulp.task('clean', () => {
	return gulp.src(DEST_FOLDER)
		.pipe(clean())
})

gulp.task('copy-files', () => {
	return gulp.src('src/video/**/*')
		.pipe(gulp.dest(DEST_FOLDER + '/video/'))
})

gulp.task('css', () => {
	return gulp.src('src/css/index.css')
		.pipe(postcss([autoprefixer(), postImport()]))
		.pipe(cssnano())
		.pipe(rename({
			suffix: '.min'
		}))
		.pipe(gulp.dest(DEST_FOLDER))
})

gulp.task('image', () => {
	const CONFIG = {
		progressive: true
	}

	return gulp.src('src/img/**/*')
		.pipe(imagemin({
			interlaced: true,
			progressive: true,
			optimizationLevel: 5,
			svgoPlugins: [{
				removeViewBox: true
			}]
		}))
		.pipe(gulp.dest(DEST_FOLDER + 'img/'))
})


gulp.task('pug', () => {
	return gulp.src('src/index.pug')
		.pipe(data(() => {
			return {
				assets: require('./src/data/rev-manifest.json')
			}
		}))
		.pipe(pug({}))
		.pipe(gulp.dest(DEST_FOLDER))
})

gulp.task('revision', () => {
	return gulp.src('dist/**/*.+(css|js)')
		.pipe(revision())
		.pipe(gulp.dest('dist/'))
		.pipe(revDelete())
		.pipe(revision.manifest(MANIFEST_CONFIG))
		.pipe(gulp.dest(MANIFEST_CONFIG.manifestPath))
})


gulp.task('watch', () => {
	gulp.watch('src/**/*.pug', ['pug'])
	gulp.watch('src/**/*.css', ['css'])
	//gulp.watch('src/**/*.js', ['js', 'pug'])
})
