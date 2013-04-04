
var processVideo = require('../task/video')
  , processFrames = require('../task/frames')
  , makeDir = require('../task/makeDir')
  , send    = require('../task/send')
  , watch = require('../task/watch')
  , CustomObject = require('../objects')


module.exports = Object.create({
  url: '/canvas/video',
  init: function (server, options){
    var opts = CustomObject.create({separator: ':'})
  
    opts.mixin({
      'path': __dirname + '/../tasks/frames/',
      'vpath': __dirname + '/../tasks/videos/',
      'job:width': 600,
      'job:height': 400,
      'rate': 30,
      'max:videos': 30,
      'max:frames': 30
    })

    
    if (options) opts.merge(options)
    // debug(opts)
    
    this._opts = opts
    watch(this._opts)
    this._server = server
    return this
  },
  process: function (req, res){
    if (req.method.toLowerCase() !== 'post') {
      res.statusCode = 404
      return res.end('not found')
    }

    var frames = '', self = this
    req.on('data', function (chunk){
      frames += chunk
    })
    req.on('end', function (){
      try {
        frames = JSON.parse(frames)
      } catch (ex){
        res.statusCode = 500
        return res.end(ex.stack)
      }

      if (~req.url.indexOf('/start')) return self.makeDir(frames, res)
      if (~req.url.indexOf('/encode')) return self.processVideo(frames, res)
      if (~req.url.indexOf('/frames')) return self.processFrames(frames, res)
    })
  },
  processFrames: function (frames, res){
    var self = this
    processFrames(frames, self._opts).then(function (data){
      self.endReq(data, res)
    }, function (error){
      debug(error.stack)
      self.endReq({status: 'nok', id: frames.id, code: 500}, res)
    })
  },
  processVideo: function (frames, res){
    var self = this
    processVideo(frames, self._opts).then(function (success){
      success.video = success.video.split('/tasks')[1]
      self.endReq(success, res)
    }, function (error){
      debug(error.stack)
      res.statusCode = 500
      res.end(error.stack)
    })  
  },
  makeDir: function (meta, res){
    var self = this
    makeDir(meta, this._opts).then(function (){
      self.endReq({status: 'ok', id: meta.id}, res)
    }, function (error){
      debug(error.stack)
      self.endReq({status: 'nok', id: meta.id, code: 500}, res)
    })
  },
  endReq: function (json, res){
    res.statusCode = json.code || 200
    res.setHeader('Content-Type', 'application/json')
    res.end(JSON.stringify(json))
  },
  sendVideo: function (req, res){
    send.call(this, req, res)
  }
})

