# gulp-cache-refresh

Forked combination of both [gulp-cache-bust](https://www.npmjs.com/package/gulp-cache-bust) and [cache-bust](https://www.npmjs.com/package/cache-bust), removed old dependencies and added some additional functionality.

### Static dependency versions to reduce breaks during dependency updates
    "cheerio": "0.19.0",
    "graceful-fs": "4.1.2",
    "gulp-util": "3.0.7",
    "map-stream": "0.0.6",
    "temp-write": "1.1.0"
    
## Usage
First, install `gulp-cache-refresh` as a development dependency:

`npm install --save gulp-cache-refresh`

Then, add it to your `gulpfile.js`:
    
    var cachebust = require('gulp-cache-refresh');

    gulp.src('./dist/*/*.html')
	    .pipe(cachebust({
		type: 'timestamp'
	    }))
	.pipe(gulp.dest('./dist'));

If you want to use a custom value, any value other than `'timestamp'` will be appended. 

    var cachebust = require('gulp-cache-refresh');
    var Foo = Environment.BuildNumber;
    
    gulp.src('./dist/*/*.html')
	    .pipe(cachebust({
		type: Foo
	    }))
	.pipe(gulp.dest('./dist'));

## API
MD5 has been removed from this fork of cache-bust. 

cache-bust(options)

####options.type: value

    Type: String
    Default: 'timestamp'

Most common usage, appends timestamp to path

    Type: String
    Value: 'timestamp'

Other usages, append any custom variable such as environment build number

    Type: String
    Value: Custom Variable

Misc: Null or Undefined values will be defaulted to to an appended 'timestamp' it falls differently in code logic to allow for easy customization.

## License
MIT