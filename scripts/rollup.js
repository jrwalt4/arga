let fs = require('fs');
let rollup = require('rollup');
let resolve = require('rollup-plugin-node-resolve');
let commonjs = require('rollup-plugin-commonjs');
let rpt2 = require('rollup-plugin-typescript2');

rollup.rollup({
  entry: './src/arga.ts',
  format: 'cjs',
  external: (id) => {
    if(id.startsWith('lodash')) {
      return true;
    }
    if (id.startsWith('collections')) {
      return true;
    }
    return false;
  },
  plugins: [
    rpt2({
      rollupCommonJSResolveHack: true
    }),
    resolve({
      extensions: ['.js', '.ts']
    }),
    commonjs({
      extensions: ['.js', '.ts'],
      namedExports: {
        'lodash': ['property', 'get','set','has', 'uniqueId']
      }
    })
  ]
}).then((bundle)=>{
  return bundle.write({
    format:'cjs',
    dest:'./build/bundle.js'
  });
}).then( (result) => {
  return Promise.resolve();
}).then((complete)=>{
  console.log('generated bundle');
}).catch((err) => {
  console.error(err);
})
