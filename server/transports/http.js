var processVideo = require('../task/video')

module.exports = Object.create({
  url: '/canvas/video',
  init: function (server, opts){
    this._opts = opts
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
        self._opts.frames = JSON.parse(frames)
      } catch (ex){
        res.statusCode = 500
        return res.end(ex.stack)
      }

      processVideo(self._opts.frames, self._opts).then(function (success){
        res.statusCode = 200
        res.setHeader('Content-Type', 'application/json')
        success.video = success.video.split('/tasks')[1]
        res.end(JSON.stringify(success))
      }, function (error){
        console.log(error.stack)
        res.statusCode = 500
        res.end(error.stack)
      })  
    })
  }
})

