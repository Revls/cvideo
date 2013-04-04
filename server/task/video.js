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


var CustomObject = require('../objects')
  , processFrames = require('./frames')

module.exports = function (job, opts){//'use strict';

  var promise = new RSVP.Promise() 

  debug('\033[96m - starting job \033[39m');
  process.nextTick(function(){
    processVideo(job, opts)
      .then(
        promise.resolve.bind(promise),
        promise.reject.bind(promise)
      )
  })
  return promise
}


debug = function debug(){
  if (process.env.DEBUG) {
    console.log.apply(console.log, arguments)
  }
}

function processVideo(job, opts){
  var promise = new RSVP.Promise()
    , start = +new Date
    , ipath = path.join(opts.g('path'), String(job.id) , String(job.id) + '-')
    , vpath = path.join(opts.g('vpath'), String(job.id) , 'video-' + String(job.id) + '.mp4')

  new ffmpeg({ source: ipath + '%d.png'})
    .withFps(opts.g('rate'))
    .toFormat('mp4')
    .saveToFile(vpath, function(stdout, stderr) {
      // Borrando frames
      debug(stdout, stderr)
      debug('\033[90m - cleaning the house\033[39m')
      removeFrames()
    });
  function removeFrames(){
    cp.exec('rm  -rf ' + opts.g('path') + job.id, function(error){
      if (error) return promise.reject(error)
      debug('\033[96m - OK!\033[39m');
      debug('\033[96m - video ready at: %s\033[39m', opts.vpath)
      
      return promise.resolve({
        status: 'ok',
        vtime: (+new Date - start),
        ttime: +new Date - Number(job.id),
        video: vpath
      })
    })
  }
  return promise
}



