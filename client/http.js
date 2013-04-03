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

  var frames = []
  exports.Converter = Object.create({
     init: function (canvas, host){

       return this
     },
     emit: function (type, chunk){
       frames.push([type].concat(chunk))
     },
     process: function (cb){
       request({
        url: '/canvas/video',
        method: 'POST',
        data: JSON.stringify(frames),
        callback: function (st){
          var response = JSON.parse(st.response)    
          if (response.status === 'ok') cb(null, response)
          else cb(response)
        }
      })
     }
   })

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
