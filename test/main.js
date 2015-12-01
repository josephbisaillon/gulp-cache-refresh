/*global describe, it*/
'use strict';

var fs = require('fs'),
  es = require('event-stream'),
  should = require('should');

require('mocha');

delete require.cache[require.resolve('../')];

var gutil = require('gulp-util'),
  cachebust = require('../');

describe('gulp-cache-refresh', function () {

  var expectedFile = new gutil.File({
    path: 'test/target/default_test.html',
    cwd: 'test/',
    base: 'test/target',
    contents: fs.readFileSync('test/target/static_result.html')
  });

  it('should produce expected file via buffer', function (done) {

    var srcFile = new gutil.File({
      path: 'test/source/default_test.html',
      cwd: 'test/',
      base: 'test/source',
      contents: fs.readFileSync('test/source/default_test.html')
    });

    var stream = cachebust( { type: 'ErrNoVarPassed'} );

    stream.on('error', function(err) {
      should.exist(err);
      done(err);
    });

    stream.on('data', function (newFile) {

      should.exist(newFile);
      should.exist(newFile.contents);

      String(newFile.contents).should.equal(String(expectedFile.contents));
      done();
    });

    stream.write(srcFile);
    stream.end();
  });

  it('should error on stream', function (done) {
    var srcFile = new gutil.File({
      path: 'test/source/default_test.html',
      cwd: 'test/',
      base: 'test/source',
      contents: fs.createReadStream('test/source/default_test.html')
    });

    var stream = cachebust( { type: 'ErrNoVarPassed'} );

    stream.on('error', function(err) {
      should.exist(err);
      done();
    });

    stream.on('data', function (newFile) {
      newFile.contents.pipe(es.wait(function(err, data) {
        done(err);
      }));
    });

    stream.write(srcFile);
    stream.end();
  });
});
