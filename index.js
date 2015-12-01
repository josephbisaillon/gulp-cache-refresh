'use strict';

var path = require('path'),
    fs = require('graceful-fs'),
    gutil = require('gulp-util'),
    map = require('map-stream'),
    tempWrite = require('temp-write'),
    $ = require('cheerio');

var Busted = function(fileContents, options){


    if (options.type === 'timestamp') {
        var timestamp = new Date().getTime();
    }
    else {
        var buildnumber;
        if ( typeof(options.type) !== "undefined" && options.type !== null ) {
             buildnumber = options.type;
        }
        else{
             buildnumber = 'ErrNoVarPassed';
        }
    }

    var protocolRegEx = /^http(s)?/,
        $scripts = $(fileContents).find('script'),
        $styles = $(fileContents).find('link[rel=stylesheet]');

    // Loop the stylesheet hrefs
    for (var i = 0; i < $styles.length; i++) {
        var styleHref = $styles[i].attribs.href;

        // Test for http(s) and don't cache bust if (assumed) served from CDN
        if (!protocolRegEx.test(styleHref)) {
            if (options.type === 'timestamp') {
                fileContents = fileContents.replace(styleHref, styleHref + '?t=' + timestamp);
                console.log(fileContents);
            } else {
                fileContents = fileContents.replace(styleHref, styleHref + '?t=' + buildnumber);
            }
        }
    }

    // Loop the script srcs
    for (var i = 0; i < $scripts.length; i++) {
        var scriptSrc = $scripts[i].attribs.src;

        // Test for http(s) and don't cache bust if (assumed) served from CDN
        if (!protocolRegEx.test(scriptSrc)) {
            if (options.type === 'timestamp') {
                fileContents = fileContents.replace(scriptSrc, scriptSrc + '?t=' + timestamp);
            } else {
                fileContents = fileContents.replace(scriptSrc, scriptSrc + '?t=' + buildnumber);
            }
        }
    }

    return fileContents;
};

var cachebust = {
    busted: Busted
};

module.exports = function (options) {
    return map(function (file, cb) {
        console.log(file.path);

        if (file.isNull()) {
            return cb(null, file);
        }

        if (file.isStream()) {
            return cb(new gutil.PluginError('gulp-cache-refresh', 'Streaming not supported'));
        }

        tempWrite(file.contents, path.extname(file.path), function (err, tempFile) {

            if (err) {
                return cb(new gutil.PluginError('gulp-cache-refresh', err));
            }

            fs.stat(tempFile, function (err, stats) {
                if (err) {
                    return cb(new gutil.PluginError('gulp-cache-refresh', err));
                }

                options = options || {};

                fs.readFile(tempFile, { encoding : 'UTF-8'}, function(err, data) {
                    if (err) {
                        return cb(new gutil.PluginError('gulp-cache-refresh', err));
                    }

                    // Call the Node module
                    var processedContents = cachebust.busted(data, options);

                    if (options.showLog) {
                        gutil.log('gulp-cache-refresh:', gutil.colors.green('✔ ') + file.relative);
                    }

                    file.contents = new Buffer(processedContents);

                    cb(null, file);
                });

            });
        });
    });
};

