let resolve = require('rollup-plugin-node-resolve');
let commonjs = require('rollup-plugin-commonjs');
let rpt2 = require('rollup-plugin-typescript2');

module.exports = {
  entry: './src/arga.ts',
  format: 'cjs',
  plugins: [
    rpt2({
      rollupCommonJSResolveHack: true
    }),
    /*resolve({
      extensions: ['.js', '.ts']
    }),*/
    commonjs({
      extensions: ['.js', '.ts'],
      namedExports: {
        'lodash': ['property', 'get','set','has', 'uniqueId']
      }
    })
  ]
}