/*
 * Simple script for running emcc on ARToolKit
 * @author zz85 github.com/zz85
 */


var
	exec = require('child_process').exec,
	path = require('path'),
	fs = require('fs'),
	child;

var HAVE_NFT = 1;

var EMSCRIPTEN_PATH = process.env.EMSCRIPTEN;
var ARTOOLKIT5_ROOT = process.env.ARTOOLKIT5_ROOT || "../emscripten/artoolkit5";
var LIBJPEG_ROOT = process.env.LIBJPEG_ROOT || "../emscripten/jpeg-6b";

if (!EMSCRIPTEN_PATH) {
	console.log("\nWarning: EMSCRIPTEN environment variable not found.")
	console.log("If you get a \"command not found\" error,\ndo `source <path to emsdk>/emsdk_env.sh` and try again.");
}

var EMCC = EMSCRIPTEN_PATH ? path.resolve(EMSCRIPTEN_PATH, 'emcc') : 'emcc';
var EMPP = EMSCRIPTEN_PATH ? path.resolve(EMSCRIPTEN_PATH, 'em++') : 'em++';
var OPTIMIZE_FLAGS = ' -Oz '; // -Oz for smallest size
var MEM = 256 * 1024 * 1024; // 64MB


var SOURCE_PATH = path.resolve(__dirname, '../emscripten/') + '/';
var OUTPUT_PATH = path.resolve(__dirname, '../build/') + '/';
var BUILD_FILE = 'artoolkit.debug.js';
var BUILD_MIN_FILE = 'artoolkit.min.js';

var MAIN_SOURCES = [
	'ARToolKitJS.cpp'
];

MAIN_SOURCES = MAIN_SOURCES.map(function(src) {
	return path.resolve(SOURCE_PATH, src);
}).join(' ');

var ar_sources = [
	'AR/arLabelingSub/*.c',
	'AR/*.c',
	'ARICP/*.c',
	'ARMulti/*.c',
	'Gl/gsub_lite.c',
].map(function(src) {
	return path.resolve(__dirname, ARTOOLKIT5_ROOT + '/lib/SRC/', src);
});

var ar2_sources = [
	'handle.c',
	'imageSet.c',
	'jpeg.c',
	'marker.c',
	'featureMap.c',
	'featureSet.c',
	'selectTemplate.c',
	'surface.c',
	'tracking.c',
	'tracking2d.c',
	'matching.c',
	'matching2.c',
	'template.c',
	'searchPoint.c',
	'coord.c',
	'util.c',
].map(function(src) {
	return path.resolve(__dirname, ARTOOLKIT5_ROOT + '/lib/SRC/AR2/', src);
});

var kpm_sources = [
	'kpmHandle.c*',
	'kpmRefDataSet.c*',
	'kpmMatching.c*',
	'kpmResult.c*',
	'kpmUtil.c*',
	'kpmFopen.c*',
	'FreakMatcher/detectors/DoG_scale_invariant_detector.c*',
	'FreakMatcher/detectors/gaussian_scale_space_pyramid.c*',
	'FreakMatcher/detectors/gradients.c*',
	'FreakMatcher/detectors/harris.c*',
	'FreakMatcher/detectors/orientation_assignment.c*',
	'FreakMatcher/detectors/pyramid.c*',
	'FreakMatcher/facade/visual_database_facade.c*',
	'FreakMatcher/matchers/hough_similarity_voting.c*',
	'FreakMatcher/matchers/freak.c*',
	'FreakMatcher/framework/date_time.c*',
	'FreakMatcher/framework/image.c*',
	'FreakMatcher/framework/logger.c*',
	'FreakMatcher/framework/timers.c*',
].map(function(src) {
	return path.resolve(__dirname, ARTOOLKIT5_ROOT + '/lib/SRC/KPM/', src);
});

if (HAVE_NFT) {
	ar_sources = ar_sources
	.concat(ar2_sources)
	.concat(kpm_sources);
}

var DEFINES = ' ';

var FLAGS = '' + OPTIMIZE_FLAGS;
FLAGS += ' -s TOTAL_MEMORY=' + MEM + ' ';
FLAGS += ' -s NO_BROWSER=1 '; // for 20k less
FLAGS += ' --memory-init-file 0 '; // for memless file

var PRE_FLAGS = ' --pre-js ' + path.resolve(__dirname, '../js/artoolkit.api.js') +' ';

FLAGS += ' --bind ';

/* DEBUG FLAGS */
var DEBUG_FLAGS = ' -g ';
// DEBUG_FLAGS += ' -s ASSERTIONS=2 '
DEBUG_FLAGS += ' -s ASSERTIONS=1 '
// DEBUG_FLAGS += ' --profiling-funcs '
// DEBUG_FLAGS += ' -s EMTERPRETIFY_ADVISE=1 '
DEBUG_FLAGS += ' -s ALLOW_MEMORY_GROWTH=1';
DEBUG_FLAGS += '  -s DEMANGLE_SUPPORT=1 ';

var INCLUDES = [
	path.resolve(__dirname, ARTOOLKIT5_ROOT + '/include'),
	OUTPUT_PATH,
	SOURCE_PATH,
	path.resolve(__dirname, ARTOOLKIT5_ROOT + '/lib/SRC/KPM/FreakMatcher'),
	path.resolve(__dirname, LIBJPEG_ROOT),
].map(function(s) { return '-I' + s }).join(' ');

function format(str) {
	for (var f = 1; f < arguments.length; f++) {
		str = str.replace(/{\w*}/, arguments[f]);
	}
	return str;
}

// Lib JPEG Compilation

// Memory Allocations
// jmemansi.c jmemname.c jmemnobs.c jmemdos.c jmemmac.c
var libjpeg_sources = 'jcapimin.c jcapistd.c jccoefct.c jccolor.c jcdctmgr.c jchuff.c \
		jcinit.c jcmainct.c jcmarker.c jcmaster.c jcomapi.c jcparam.c \
		jcphuff.c jcprepct.c jcsample.c jctrans.c jdapimin.c jdapistd.c \
		jdatadst.c jdatasrc.c jdcoefct.c jdcolor.c jddctmgr.c jdhuff.c \
		jdinput.c jdmainct.c jdmarker.c jdmaster.c jdmerge.c jdphuff.c \
		jdpostct.c jdsample.c jdtrans.c jerror.c jfdctflt.c jfdctfst.c \
		jfdctint.c jidctflt.c jidctfst.c jidctint.c jidctred.c jquant1.c \
		jquant2.c jutils.c jmemmgr.c \
		jmemansi.c \
		jcapimin.c jcapistd.c jctrans.c jcparam.c \
		jdatadst.c jcinit.c jcmaster.c jcmarker.c jcmainct.c \
		jcprepct.c jccoefct.c jccolor.c jcsample.c jchuff.c \
		jcphuff.c jcdctmgr.c jfdctfst.c jfdctflt.c \
		jfdctint.c'.split(/\s+/).join(' ' + path.resolve(__dirname, LIBJPEG_ROOT) + '/')

function clean_builds() {
	try {
		var stats = fs.statSync(OUTPUT_PATH);
	} catch (e) {
		fs.mkdirSync(OUTPUT_PATH);
	}

	try {
		var files = fs.readdirSync(OUTPUT_PATH);
		if (files.length > 0)
		for (var i = 0; i < files.length; i++) {
			var filePath = OUTPUT_PATH + '/' + files[i];
			if (fs.statSync(filePath).isFile())
				fs.unlinkSync(filePath);
		}
	}
	catch(e) { return console.log(e); }
}

var compile_arlib = format(EMCC + ' ' + INCLUDES + ' '
	+ ar_sources.join(' ')
	+ FLAGS + ' ' + DEFINES + ' -o {OUTPUT_PATH}libar.bc ',
		OUTPUT_PATH);

// var compile_kpm = format(EMCC + ' ' + INCLUDES + ' '
// 	+ kpm_sources.join(' ')
// 	+ FLAGS + ' ' + DEFINES + ' -o {OUTPUT_PATH}libkpm.bc ',
// 		OUTPUT_PATH);

var compile_libjpeg = format(EMCC + ' ' + INCLUDES + ' '
    + path.resolve(__dirname, LIBJPEG_ROOT) + '/' + libjpeg_sources
	+ FLAGS + ' ' + DEFINES + ' -o {OUTPUT_PATH}libjpeg.bc ',
		OUTPUT_PATH);

var compile_combine = format(EMCC + ' ' + INCLUDES + ' '
	+ ' {OUTPUT_PATH}*.bc ' + MAIN_SOURCES
	+ FLAGS + ' '  + DEBUG_FLAGS + DEFINES + ' -o {OUTPUT_PATH}{BUILD_FILE} ',
	OUTPUT_PATH, OUTPUT_PATH, BUILD_FILE);

var compile_combine_min = format(EMCC + ' ' + INCLUDES + ' '
	+ ' {OUTPUT_PATH}*.bc ' + MAIN_SOURCES
	+ FLAGS + ' ' + DEFINES + PRE_FLAGS + ' -o {OUTPUT_PATH}{BUILD_FILE} ',
	OUTPUT_PATH, OUTPUT_PATH, BUILD_MIN_FILE);

var compile_all = format(EMCC + ' ' + INCLUDES + ' '
	+ ar_sources.join(' ')
	+ FLAGS + ' ' + DEFINES + ' -o {OUTPUT_PATH}{BUILD_FILE} ',
		OUTPUT_PATH, BUILD_FILE);

/*
 * Run commands
 */

function onExec(error, stdout, stderr) {
	if (stdout) console.log('stdout: ' + stdout);
	if (stderr) console.log('stderr: ' + stderr);
	if (error !== null) {
		console.log('exec error: ' + error);
	} else {
		runJob();
	}
}

function runJob() {
	if (!jobs.length) {
		console.log('Jobs completed');
		return;
	}
	var cmd = jobs.shift();

	if (typeof cmd === 'function') {
		cmd();
		runJob();
		return;
	}

	console.log('\nRunning command: ' + cmd + '\n');
	exec(cmd, onExec);
}

var jobs = [];

function addJob(job) {
	jobs.push(job);
}

addJob(clean_builds);
addJob(compile_arlib);
// addJob(compile_kpm);
// compile_kpm
addJob(compile_libjpeg);
addJob(compile_combine);
addJob(compile_combine_min);
// addJob(compile_all);

runJob();
