# CanvasVideo

CanvasVideo es un módulo escrito en JavaScript en el cual tú puedes convertir
tus animaciones hechas con `Canvas` a video, especificamente en formato mp4.

### Como funciona

CanvasVideo ya que realiza una serie de tareas altamente costosas para el CPU
y memoria ha sido altamente optimizado para requerir de la menor cantidad de
recursos, la manera más lógica ha sido el capturar cada cuadro de animación
y luego en el servidor convertir todos los cuadros a un video.

Los cuadros son obtenidos en un intervalo suficientemente corto para no perder
calidad de codificación.


## Uso

CanvasVideo es un módulo que puede ser agregado a tu servidor escrito en 
Node.js sin ningún problema.


### Requisitos

- Necesitas tener instalado [Node.js](http://nodejs.org), el proceso de instalación es sencillo, en el sitio web existen los binarios correspondientes.
- [`ffmpeg`](http://www.ffmpeg.org/) él cual dependiendo de la plataforma se descarga los binarios correspondientes.

Si cumples con los requisitos ya puedes crear un servidor http y agregar `CanvasVideo`
sin mucha complicación.

### Ejemplo

Supongamos tienes el siguiente servidor http (`server.js`):


```javascript
var http = require('http');
var express = require('express');

var server = express();

server.use(express.static(__dirname + '/www'); // www es el folder con tu animación

// agregas rutas y otras cosas necesarias (http://expressjs.org)

// iniciar el servidor en el puerto 8080
server.listen(8080, function (){
  console.log('El servidor esta disponible en el puerto 8080');
});

```

Y tienes esta animación en `www/index.html`:

Lo que tienes que hacer para instalar `CanvasVideo`es:

- Primero instalar `cvideo`:

`$ npm install --save Revls/cvideo`

- Agrgar un par de lineas a tu servidor

```javascript
// agregar las siguientes lineas:
var CanvasVideo = require('cvideo');

server.listen(8080, function (){
  CanvasVideo(this, {
    vpath: __dirname + '/videos/', // donde guardara los videos
    path: __dirname + '/frames/', // carpeta donde va a guardar temporalmente los cadros
  })
  console.log('El servidor esta disponible en el puerto 8080');
});
```

Y en la animación agregar la libreria:


```html
<script src="/canvas/canvas.video.js"></script>
<!-- luego, justo despues de que haces canvas.getContext('2d') iniciar la libreria-->
<script>
  // -- codigo de la animación
    var context = canvas.getContext('2d')
    var recorder = CanvasVideo.create(canvas, { // opciones
      background: white; //color de fondo del video
    })
    
    // una vez despues de creado el "recorder" falta inicializarlo
    
    recorder.init()
    
    // y luego cuando se quiere terminar de "grabar" el canvas
    
    recorder.convertToVideo(function(error, resp){
      if (error) return console.log('error\n' + error.stack)
      console.dir(resp) // resp contiene la información meta del video
    })
    
</script>


```


Eso es lo único que hace falta para hacer funcionar CanvasVideo.


[Video de ejemplo](http://www.youtube.com/watch?v=HuKhLhPYjMI)

