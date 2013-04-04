var fs = require('fs')
  , path = require('path')

var RSVP = require('rsvp-that-works')

module.exports = function processFrames(job, opts){
  debug('\033[90m - processing %s frames for %d \033[39m', job.frames.length, job.id)

  var promise = new RSVP.Promise()
  var ipath = path.join(opts.g('path'), String(job.id) , String(job.id) + '-')
  // Creando Frames
  process.nextTick(function(){
    var errors = [], packet = (job.packet * 100) - (job.offset || 100)
    job.frames.forEach(function(frame, i){
      fs.writeFile(
        ipath + (packet++) + '.png'
        , new Buffer(frame, 'base64')
        , 'binary'
      , function (error, data){
        if (error)  errors.push(error)
        if (i === (job.frames.length - 1)){
          if (errors.length > 0) return promise.reject(errors)
          return promise.resolve({ status: 'ok'})
        }
      })
    })
  })
  return promise
}
