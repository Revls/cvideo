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
    var self = this
    canvas = canvas || document.querySelector('canvas')
    if (!canvas) throw new Error('no canvas in the DOM')
    if (typeof canvas.toDataURL !== 'function' ) throw new Error('You need to provide a valid canvas')
    this._job = +new Date
    this._canvas = canvas
    this._frames = []
    this._failed = []
    this._sended = []
    this._kue = new Kue
    this._kue.on('taskr', function (data){
      self.emit('progress', data)
    })
  }


  StreamFrames.create = function (canvas){
    return new StreamFrames(canvas)
  }
  StreamFrames.prototype = Object.create(Events.prototype, {
    constructor: StreamFrames
  })
  StreamFrames.prototype.start
  StreamFrames.prototype.init = function(cb){
    var self = this
    this._kue.add(function (done){
      request({
        method: 'POST',
        url: '/canvas/video/start',
        data: JSON.stringify({id: this._job, author: this._author || 'anon'}),
        callback: function (resp){
          resp = JSON.parse(resp.response)
          self._frame()
          self.STATUS = 1
          if (cb) cb(resp)
          done(null, resp)
        }
      })
    })
    return this
  }

  StreamFrames.prototype._frame = function() {
    var self = this
    if (self.STATUS === 0) return
    requestAnimationFrame(function(){
      self._frame()
    })
    var frame = canvasToImage(self._canvas, self._background || 'white')
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
    this._kue.add(function(done){
      request({
        method: 'POST',
        url: '/canvas/video/frames',
        data: JSON.stringify(packet),
        callback: function (resp){
          resp = JSON.parse(resp.response)
          
          if (resp.status === 'ok') {
            debug('Packet sended: %d', packet.packet)
            if (cb) cb(null, resp)
            done(null, resp)
            return self._sended.push(packet.packet)
          }
          debug('Packet failed: %d', packet.packet)
          if (cb) cb(resp)
          done(resp, null)
          self._failed.push(fin)
        }
      })
    })
  }

  StreamFrames.prototype.sendMissingFrames = function() {
    this._failed.map(function(packet){
      this._sendPacket(packet)
      return null
    }, this)
  }

  StreamFrames.prototype.convertToVideo = function (cb){
    var left = this._frames.length % 100, self = this, resp
    self.STATUS = 0
    if (left !== 0){
      this._sendPacket( left, left, function (done){
        request({
          url: '/canvas/video/encode',
          method: 'POST',
          data: JSON.stringify({id: self._job}),
          callback: function (res){
            resp = res = JSON.parse(res.response)
            if (res.status === 'ok') cb(null, res)
            else cb(res)
          }
        })
      })
      // this._kue.resolve(function (data){
      //   console.log(data)
      //   if (resp.status == 'ok') return cb(null, resp)
      //   cb(resp)
      // })
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

  //Returns contents of a canvas as a png based data url, with the specified
  //background color
  function canvasToImage(canvas, backgroundColor){
    //cache height and width    
    var w = canvas.width;
    var h = canvas.height;
    var context = canvas.getContext('2d')
    var data;
   
    if(backgroundColor) {
      //get the current ImageData for the canvas.
      data = context.getImageData(0, 0, w, h);
      //store the current globalCompositeOperation
      var compositeOperation = context.globalCompositeOperation;
      //set to draw behind current content
      context.globalCompositeOperation = "destination-over";
      //set background color
      context.fillStyle = backgroundColor;
      //draw background / rect on entire canvas
      context.fillRect(0,0,w,h);
    }
   
    //get the image data from the canvas
    var imageData = canvas.toDataURL("image/png").substr(22)
   
    if(backgroundColor) {
      //clear the canvas
      context.clearRect(0,0,w,h);
      //restore it with original / cached ImageData
      context.putImageData(data, 0,0);    
      //reset the globalCompositeOperation to what it was
      context.globalCompositeOperation = compositeOperation;
    }
   
    //return the Base64 encoded data url string
    return imageData;
  }
}(window)
