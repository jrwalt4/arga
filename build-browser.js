var fs = require('fs');
//fs.mkdirSync('./build/browser')
var outFile = fs.createWriteStream('./build/browser/arga.min.js');

var browserify = require('browserify');
var tsify = require('tsify');
//var minifyify = require('minifyify');

browserify(['./src/arga.ts'], {
    debug:true,
    standalone:'arga',
    plugin:[
        tsify
    ]
})
/*
.plugin(minifyify, {
        map:'./build/arga.js.map',
        output:'./build/browser/arga.min.js.map'
    })
//*/
    .bundle()
    .pipe(outFile);