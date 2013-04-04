/**
 * Task:video
 * ------------
 * Process (n) frames to video
 * 
 */

var cp     = require('child_process')
  , path   = require('path')
  , fs     = require('fs')

var RSVP   = require('rsvp-that-works')
  , ffmpeg = require('fluent-ffmpeg')
  , Canvas = require('canvas')

var CustomObject = require('../objects')

module.exports = function (frames, options){//'use strict';

  var promise = new RSVP.Promise() 
    , job = Date.now() + ''
    , opts = CustomObject.create({separator: ':'})
  
  opts.mixin({
    'path': __dirname + '/../tasks/frames/',
    'vpath': __dirname + '/../tasks/videos/',
    'job:id': job,
    'job:frames': frames,
    'job:width': 600,
    'job:height': 400,
    'rate': 30,
  })

  
  if (options) opts.mixin(options)
  // debug(opts)
  
  opts.mixin({
    'job:path': path.join(opts.g('path'), job , job + '-'),
    'job:vpath': path.join(opts.g('vpath'), job ,'video-' + job + '.mp4'),
  })

  debug('\033[96m - starting job \033[39m');

  if (Array.isArray(frames) && frames.length){
    makeDir(opts)
      .then(function(){
        return processFrames(opts)  
      })
      .then(function () {
        return processVideo(opts)
      })
      .then(
        promise.resolve.bind(promise),
        promise.reject.bind(promise)
      )
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

function processVideo(opts){
  var promise = new RSVP.Promise()
    , start = +new Date
  new ffmpeg({ source: opts.g('job:path') + '%d.png'})
    .withFps(opts.g('rate'))
    .toFormat('mp4')
    .saveToFile(opts.g('job:vpath'), function(stdout, stderr) {
      // Borrando frames
      debug(stdout, stderr)
      debug('\033[90m - cleaning the house\033[39m')
      removeFrames()
    });
  function removeFrames(){
    cp.exec('rm  -rf ' + opts.g('path') + opts.g('job:id'), function(error){
      if (error) return promise.reject(error)
      debug('\033[96m - OK!\033[39m');
      debug('\033[96m - video ready at: %s\033[39m', opts.vpath)
      
      return promise.resolve({
        status: 'ok',
        vtime: (+new Date - start),
        ttime: +new Date - Number(opts.job.id),
        video: opts.job.vpath
      })
    })
  }
  return promise
}

function processFrames(opts){
  debug('\033[90m - processing %s frames \033[39m', opts.job.frames.length)
  // Inicializando el canvas
  var promise = new RSVP.Promise()
    , canvas = new Canvas(opts.job.width, opts.job.height)
    , ctx = canvas.getContext('2d')

  ctx.strokeStyle ='red'
  // Creando Frames
  process.nextTick(function(){
    var errors = []
    opts.g('job:frames').forEach(function(frame, i){
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
        fs.writeFile(opts.g('job:path') + (i + 1) + '.png', b, function (error, data){
          if (error)  errors.push(error)
          if (i === (opts.job.frames.length - 1)){
            if (errors.length > 0) return promise.reject(errors)
            return promise.resolve({ status: 'ok'})
          }
        })
      })
    })
    
  })
  return promise
}

function makeDir(opts){
  var promise = new RSVP.Promise()
  cp.exec(['mkdir -p ' + opts.g('path') + opts.g('job:id'),
    '&&',
    'mkdir -p ' + opts.g('vpath') + opts.g('job:id'),
    ].join(' '), function (error){
    if (error) return promise.reject(error)
    return promise.resolve()
  })
  return promise
}
