window.onload = function(){

  var canvas = document.getElementById('ctx')
    , ctx = canvas.getContext('2d')
    , converter = Converter.init('/video')
    

  var noop = function(){}

  ctx.strokeStyle='red'

  window.onmousedown = function(ev){
    if (ev.clientX < 600 && ev.clientY < 400){
      ctx.beginPath()
      ctx.moveTo(ev.clientX,ev.clientY)
      converter.emit('path', [ev.clientX, ev.clientY])
      window.onmousemove = move
    }
  }

  function move(ev){
    if (ev.clientX < 600 && ev.clientY < 400){
      ctx.lineTo(ev.clientX, ev.clientY)
      ctx.stroke()
      converter.emit('line',[ev.clientX, ev.clientY])
    }
  }

  window.onmouseup = function(){
    window.onmousemove = noop
  }

  document.getElementById("color").onclick = function(){
    var val = prompt("Ingrese el color")
    ctx.strokeStyle = val
    converter.emit('style', val)
  }

  var r = document.getElementById('s')
  var log = document.getElementById('log');
  
  r.addEventListener('click', function(ev){
    var p = document.createElement('p')
    ev.preventDefault()
    r.innerHTML = 'Sending file...'
    
    converter.process(function(error, status){
      if (status.msg === 'ok'){
        p.innerHTML = '<a href="' + status.url + '">Video Saved</a>';
      } else {
        p.innerHTML = '<p> Error saving </p>'
      }
      log.appendChild(p);
    })
  })
}
