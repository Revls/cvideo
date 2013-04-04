module.exports.init = WebSockets

var fs = require('fs')
  , processVideo = require('../task/video')

function WebSockets(server, path){
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
