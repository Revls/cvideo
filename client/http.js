!function (exports){
  
  var requestAnimationFrame = (function(){
    return window.requestAnimationFrame   || 
       window.webkitRequestAnimationFrame || 
       window.mozRequestAnimationFrame    || 
       window.oRequestAnimationFrame      || 
       window.msRequestAnimationFrame     || 
       function (callback) {
         setTimeout(callback, 1000 / 60); // Default to 60fps
       };
  })();

  function debug(){
    console.log.apply(console, arguments)
  }

  function StreamFrames(canvas){
    canvas = canvas || document.querySelector('canvas')
    if (!canvas) throw new Error('no canvas in the DOM')
    if (typeof canvas.toDataURL !== 'function' ) throw new Error('You need to provide a valid canvas')
    this._job = +new Date
    this._canvas = canvas
    this._frames = []
    this._failed = []
    this._sended = []
  }

  StreamFrames.create = function (canvas){
    return new StreamFrames(canvas)
  }

  StreamFrames.prototype.start
  StreamFrames.prototype.init = function(cb){
    var self = this
    request({
      method: 'POST',
      url: '/canvas/video/start',
      data: JSON.stringify({id: this._job, author: this._author || 'anon'}),
      callback: function (resp){
        resp = JSON.parse(resp.response)
        self._frame()
        self.STATUS = 1
        if (cb) cb(resp)
      }
    })
    
    return this
  }

  StreamFrames.prototype._frame = function() {
    var self = this
    if (self.STATUS === 0) return
    requestAnimationFrame(function(){
      self._frame()
    })
    var frame = self._canvas.toDataURL('image/png').substr(22)
    self._frames.push(frame)
    if (self._frames.length % 100 === 0) self._sendPacket(self._frames.length)
  }
  StreamFrames.prototype._sendPacket = function (fin, length, cb){
    if (!length) length = 100
    var packet = {
      id: this._job,
      frames: this._frames.slice(fin - length, fin),
      packet: fin / 100
    }, self = this

    request({
      method: 'POST',
      url: '/canvas/video/frames',
      data: JSON.stringify(packet),
      callback: function (resp){
        resp = JSON.parse(resp.response)
        
        if (resp.status === 'ok') {
          debug('Packet sended: %d', packet.packet)
          if (cb) cb(null, resp)
          return self._sended.push(packet.packet)
        }
        debug('Packet failed: %d', packet.packet)
        if (cb) cb(resp)
        self._failed.push(fin)
      }
    })
  }

  StreamFrames.prototype.sendMissingFrames = function() {
    this._failed.map(function(packet){
      this._sendPacket(packet)
      return null
    }, this)
  }

  StreamFrames.prototype.convertToVideo = function (cb){
    var left = this._frames.length % 100, self = this
    self.STATUS = 0
    if (left !== 0){
      this._sendPacket(left, left, function (error, resp){
        if (error) return console.log(error)
        request({
          url: '/canvas/video/encode',
          method: 'POST',
          data: JSON.stringify({id: self._job}),
          callback: function (res){
            res = JSON.parse(res.response)
            if (res.status === 'ok') cb(null, res)
            else cb(res)
          }
        })
      })
    }
  }

  exports.CanvasVideo = StreamFrames

  //---- Helpers -----
  function request(o, cb){
    document.body.setAttribute('data-loading', '')
    var xhr = new XMLHttpRequest()
      , method = o.method || 'GET'
      , data = o.data || {}
      , query =  []
      , callback

    o.headers = o.headers || {}

    xhr.open(method, o.url, !o.sync)

    if (method !== 'GET' && !o.headers['Content-type'] && !o.headers['Content-Type']) {
      xhr.setRequestHeader("Content-type", "application/json")
    }

    for (var header in o.headers) xhr.setRequestHeader(header, o.headers[header]);

    function callback(){
      document.body.removeAttribute('data-loading')
      if (o.callback) o.callback(xhr)
      if (cb) cb(xhr)
    }

    xhr.onreadystatechange = function() {
      if (xhr.readyState === 4) callback(xhr)
    }
    xhr.send(method === 'GET' ? null : data)

    return xhr
  }

}(window)
