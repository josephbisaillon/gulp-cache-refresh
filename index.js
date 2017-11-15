'use strict';

var path = require('path'),
    fs = require('graceful-fs'),
    gutil = require('gulp-util'),
    map = require('map-stream'),
    tempWrite = require('temp-write'),
    cheerio = require('cheerio');


function loadAttribute(content) {
    if (content.name.toLowerCase() === 'link') {
        return content.attribs.href;
    }


    if (content.name.toLowerCase() === 'script') {
        return content.attribs.src;
    }

    throw "No content awaited in this step of process";
}

var Busted = function(fileContents, options){

    var self = this, $ = cheerio.load(fileContents);

    self.timestamp = function(fileContents, originalAttrValue, options) {
        var lastIndex = originalAttrValue.lastIndexOf('?t=');
        var originalAttrValueWithoutCacheBusting = ( lastIndex >= 0 ) ? originalAttrValue.substr(0, lastIndex) : originalAttrValue;
        return fileContents.replace(originalAttrValue, originalAttrValueWithoutCacheBusting + '?t=' + options.currentTimestamp);
    };

    self.customTag =  function(fileContents, originalAttrValue, options) {
        var lastIndex = originalAttrValue.lastIndexOf('?t=');
        var originalAttrValueWithoutCacheBusting = ( lastIndex >= 0 ) ? originalAttrValue.substr(0, lastIndex) : originalAttrValue;
        return fileContents.replace(originalAttrValue, originalAttrValueWithoutCacheBusting + '?t=' + options.customTag);
    };

    options = {
        basePath : options.basePath || "",
        type : options.type || "timestamp",
        currentTimestamp : new Date().getTime(),
        customTag: options.type
    };

    var protocolRegEx = /^http(s)?/, elements = $('script[src], link[rel=stylesheet][href], link[rel=icon][href], link[rel="shortcut icon"][href], link[rel=apple-touch-icon][href]').not(".ignore");

    for (var i = 0, len = elements.length; i < len; i++) {
        var originalAttrValue = loadAttribute(elements[i]);

        // Test for http(s) and don't cache bust if (assumed) served from CDN
        if (!protocolRegEx.test(originalAttrValue)) {
            if (options.type === "timestamp") {
                fileContents = self[options.type](fileContents, originalAttrValue, options);
            }
            else {
                fileContents = self.customTag(fileContents, originalAttrValue, options);
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

