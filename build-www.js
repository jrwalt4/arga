var fs = require('fs');
var outFile = fs.createWriteStream('./build/www/arga.js')
var browserify = require('browserify');
browserify('./build/arga.js', {
    debug:true,
    standalone:true
}).bundle().pipe(outFile);