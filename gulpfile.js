const autoprefixer = require('autoprefixer')
const clean = require('gulp-clean')
const concat = require('gulp-concat')
const cssnano = require('gulp-cssnano')
const data = require('gulp-data')
const ghPages = require('gulp-gh-pages')
const gulp = require('gulp')
const imagemin = require('gulp-imagemin')
const jsmin = require('gulp-jsmin')
const postcss = require('gulp-postcss')
const postImport = require('postcss-import')
const path = require('path')
const pug = require('gulp-pug')
const rename = require('gulp-rename')
const revision = require('gulp-rev')
const revDelete = require('gulp-rev-delete-original')
const sequence = require('gulp-sequence')

const DEST_FOLDER = 'dist/'

const MANIFEST_CONFIG = {
	merge: true,
	dir: 'src/data/',
	fullPath: path.join(__dirname, 'src/data/', 'rev-manifest.json')
}

gulp.task('build', ['clean'], callback => {
	let revTask = ''
	if (process.env.PRD)
		revTask = 'revision'

	sequence(['css', 'image', 'copy-files'], revTask, 'pug')(callback)
})

gulp.task('clean', ['deleteManifest'], () => {
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
		interlaced: true,
		progressive: true,
		optimizationLevel: 5,
		svgoPlugins: [{
			removeViewBox: true
		}]
	}

	return gulp.src('src/img/**/*')
		.pipe(imagemin(CONFIG))
		.pipe(gulp.dest(DEST_FOLDER + 'img/'))
})

gulp.task('deleteManifest', () => {

	return gulp.src(MANIFEST_CONFIG.fullPath)
		.pipe(clean())
})

gulp.task('deploy', () => {
	return gulp.src('./dist/**/*')
		.pipe(ghPages())
})

gulp.task('pug', () => {
	return gulp.src('src/index.pug')
		.pipe(data(() => {
			let result = {}
			try {
				result.assets = require('./src/data/rev-manifest.json')
			} finally {
				return result
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
		.pipe(gulp.dest(MANIFEST_CONFIG.dir))
})


gulp.task('watch', () => {
	gulp.watch('src/**/*.pug', ['pug'])
	gulp.watch('src/**/*.css', ['css'])
	//gulp.watch('src/**/*.js', ['js', 'pug'])
})
