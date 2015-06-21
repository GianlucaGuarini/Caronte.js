'use strict'

var utils = require('./_utils'),
    babel = require('babel'),
    path = require('path'),
    fs = require('fs')

module.exports = function() {

  // delete the old ./dist folder
  utils.clean('./dist')

  var core = fs.readFileSync('src/index.js'),
      start = fs.readFileSync('src/wrap/start.frag'),
      end = fs.readFileSync('src/wrap/end.frag'),
      transpiled = babel.transform(core).code

  /**
   * Create a promise based on the result of the webpack compiling script
   */

  return utils.exec('mkdir', ['dist']).then(function(){
    fs.writeFileSync(
      path.join('dist', global.library) + '.js',
      // concat
      [
        start,
        transpiled,
        end
      ].join('\n')
    )
  })


}
