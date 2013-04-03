var fs = require('fs')
  , Canvas = require('canvas')
  , RSVP = require('rsvp-that-works')
  , cp  = require('child_process')

process.env.DEBUG = 'true'

module.exports = function (frames){
  var promise = new RSVP.Promise() 
    , job = Date.now()
    , path = __dirname + '/frames/' + job + '-'

  debug('\033[96m - starting job \033[39m');

  if (Array.isArray(frames) && frames.length){
    processFrames(frames, path)
      .then(function(ok){
        return processVideo({
          path: path,
          vpath: 'video-'+ job + '.mp4'
        })
      })
      .then(function (dt){
        promise.resolve()
      }, function (error) {
        return promise.reject(error)
      })
  } else {
    process.nextTick(function(){
      promise.reject(new Error('frames are not an Array'))
    })
  }
  return promise
}


function debug(){
  if (process.env.DEBUG) {
    console.log.apply(console.log, arguments)
  }
}

function processVideo(options){
  var promise = new RSVP.Promise()
    , start = +new Date

  cp.exec([
    'ffmpeg',
    '-r 30',
    '-f mp4',
    '-i ' + options.path + '%d.png',
    __dirname + '/videos/' + options.vpath
    ].join(' '), function(er){
    if (er) return promise.reject(er)
    // Borrando frames
    debug('\033[90m - cleaning the house\033[39m')
    exec([
      'cd ' + __dirname + '/frames',
      ' && rm ' + path + '*'
     ].join(' '), function(error){
      if (error) return promise.reject(error)
      debug('\033[96m - OK!\033[39m');
      debug('\033[96m - video ready at: videos/%s\033[39m', options.vpath)
      
      return promise.resolve({
        status: 'ok',
        time: (+new Date - start),
        video: options.vpath
      })
    })
  })
  return promise
}

function processFrames(frames, path){
  debug('\033[90m - processing %s frames \033[39m', frames.length)
  // Inicializando el canvas
  var promise = new RSVP.Promise()
    , canvas = new Canvas(600, 400)
    , ctx = canvas.getContext('2d')

  ctx.strokeStyle ='red'
  // Creando Frames
  process.nextTick(function(){
    var errors = []
    frames.forEach(function(frame, i){
      switch (frame[0]){
        case 'path':
          ctx.beginPath()
          ctx.moveTo(frame[1], frame[2])
          break
        case 'line':
          ctx.lineTo(frame[1], frame[2])
          ctx.stroke()
          break
        case 'style':
          ctx.strokeStyle = frame[1]
      }
      canvas.toBuffer(function(e, b){
        if (e) return errors.push(e)
        fs.writeFileSync(path + (i + 1) + '.png', b)
        if (i === (frames.length - 1)){
          if (errors.length > 0) return promise.reject(errors)
          return promise.resolve({ status: 'ok'})
        }
      })
    })
    
  })
  return promise
}
