!function(exports){

  if (typeof io === 'undefined') throw new Error('You must load socket.io first')
  var ws
    , frames = []
    , ToVideo = Object.create({
    init: function (channel, host){
      if (host) channel = host + channel
      ws = io.connect(channel)
      ws.emit('record:started', {date: +new Date})
      return this
    },
    emit: function (type, chunk){
      frames.push([type].concat(chunk))
      ws.emit(type, {data: chunk})
    },
    process: function (cb){
      ws.emit('allframes', frames)
      ws.emit('record:end', {date: +new Date})
      ws.on('video:encoded', function (val){
        cb(null, val)
      })
      ws.on('video:error', function (error){
        cb(error)
      })
    }
  })
  exports.Converter = ToVideo
}(window)
