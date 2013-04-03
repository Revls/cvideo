var canvas = require('canvas')
  , fs = require('fs')
  , sio = require('socket.io')
  , processVideo = require('./processing')
  , clientLib = fs.readFileSync('./nvideo.client.js', 'utf8')


module.exports = function(server, path){'use strict';
  
  fixListeners(server)
  var ws = sio.listen(server)
  ws.disable('log')
  var video = ws.of(path || '/video')
  
  video.on('connection', function (socket){

    var instance = { frames: []}
    socket.on('record:started', function (time){
      instance.startTime = time.date
    })
    socket.on('path', function (msg){
      save('path', msg.data)
    })
    socket.on('line', function (msg){
      save('line', msg.data)
    })
    socket.on('style', function (msg){
      save('style', msg.data)
    })
    socket.on('allframes', function (frames){
      console.log('writing frames')
      fs.writeFileSync('./data-'+ +new Date + '.json', JSON.stringify(frames))

    })
    socket.on('record:end', function (time){
      instance.endTime = time
      console.log('processing instance by ' + socket.id)
      processVideo(instance.frames).then(function (meta){
        instance = []
        socket.emit('video:encoded', meta)
      }, function (error){
        socket.emit('video:error', {
          status: 'nok',
          error: error
        })
      })
    })
    function save(type, val){
      if (!Array.isArray(val)) val = [val]
      console.log('writing frame type:' + type)
      instance.frames.push([type].concat(val))
    }
  })
}


function fixListeners(server){
  var oldListeners = server.listeners('request').splice(0);
  server.removeAllListeners('request')

  server.on('request', function (req, res){
    if (req.url === '/nvideo/nvideo.client.js') {
      res.statusCode = 200
      res.writeHeader('Content-type', 'application/javascript')
      res.end(clientLib)
    } else {
      for (var i = 0, l = oldListeners.length; i < l; i++) {
        oldListeners[i].call(server, req, res);
      }
    }
  })

}

