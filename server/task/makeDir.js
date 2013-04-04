var cp = require('child_process')
var RSVP = require('rsvp-that-works')

module.exports = function makeDir(meta, opts){
  var promise = new RSVP.Promise()
  cp.exec(['mkdir -p ' + opts.g('path') + meta.id,
    '&&',
    'mkdir -p ' + opts.g('vpath') + meta.id,
    '&&',
    'touch '+ opts.g('vpath') + meta.id + '/' +(meta.author || 'anon') + '.author'
    ].join(' '), function (error){
    if (error) return promise.reject(error)
    return promise.resolve()
  })
  return promise
}
