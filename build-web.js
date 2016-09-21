var fs = require('fs');
console.log('starting...');
var start = Date.now();
(new Promise(function (resolve, reject) {
    fs.mkdir('build', undefined, function (err) {
        if (!err) {
            resolve();
        } else {
            if (err.code == "EEXIST") {
                resolve();
            } else {
                reject(err);
            }
        }
    })
})).then(function () {
    return new Promise(function (resolve, reject) {
        fs.mkdir('build/browser', undefined, function (err) {
            if (!err) {
                resolve();
            } else {
                if (err.code == "EEXIST") {
                    resolve();
                } else {
                    reject(err);
                }
            }
        })
    })
}).then(function () {

    var browserify = require('browserify');
    var tsify = require('tsify');
    var minifyify = require('minifyify');

    //var outJs = fs.createWriteStream('./build/browser/arga.js');
    var outMin = fs.createWriteStream('./build/browser/arga.min.js');

    var b = browserify(['./src/arga.ts'], {
        debug: true,
        standalone: 'arga'
    }).plugin(tsify)
    .plugin(minifyify, {
        output:'./build/browser/arga.min.js.map',
        map:'arga.min.js.map'
    }).bundle().pipe(outMin);

}).catch(function (err) {
    console.error(err);
})

process.on('exit', function(code){
    console.log(`finished in ${Date.now() - start} ms`)
})