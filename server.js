/*
 * Initialize Components
 */
var express = require('express');
var Canvas = require('canvas');
var fs = require('fs'),
exec = require('child_process').exec;
/*
 * Los metodos del canvas module son lo mismo
 * que el API de canvas
 */

var app = express.createServer();
app.use(express.bodyParser());

app.get('/',function(req,res){
  res.sendfile('index.html');
});

app.post('/',function(req,res){
  console.log('\033[96m - starting \033[39m');
  var frames = req.body || [];
  if (Array.isArray(frames) && frames.length){
    console.log('\033[90m - starting processing %s operations\033[39m', req.body.length);
    // Inicializando el canvas
    var canvas = new Canvas(600,400);
        var ctx = canvas.getContext('2d');
        var job = Date.now(),
        path = __dirname + '/frames/' + job + '-'
        ctx.strokeStyle ='red';
   // Creando Frames
    function frame(i){
      var data = frames[i];
      if (data){
          switch (data[0]){
            case 'path':
              ctx.beginPath();
              ctx.moveTo(data[1],data[2]);
              break; 
            case 'line':
              ctx.lineTo(data[1],data[2]);
              ctx.stroke()
              break;
            case 'style':
              ctx.strokeStyle = data[1];
          }
          canvas.toBuffer(function(e,b){
            if (e) return console.error(e);
            fs.writeFileSync(path + (i+1) + '.png', b );
            frame(++i)
          })
      } else {
        console.log('\033[90m - wrote %s frames \033[39m',i);
        var videopath = 'video-'+ job + '.mpg'
        console.log('\033[90m - ready for create video\033[39m');
         // Creando Video
          exec([
            '/usr/bin/ffmpeg',
            '-r 30',
            '-f image2',
            '-i ' + path + '%d.png',
            __dirname + '/videos/' + videopath
            ].join(' '), function(er){
            if (er) return console.error(er);
            // Borrando frames
            console.log('\033[90m - cleaning the house\033[39m');
              exec([
                'cd ' + __dirname + '/frames',
                ' && rm ' + path + '*'
               ].join(' '), function(e2){
                if (e2) {return console.error(e2)};
                console.log('\033[96m - OK!\033[39m');
                console.log('\033[96m - video ready at: videos/%s\033[39m',videopath);
                res.writeHeader(200,{'Content-Type':'text/plain'});
                res.end(videopath)
              })
          })
      }
    }
  }
  frame(0);
})
/*  
* Added cluster
*/
var cluster = require('cluster');
var numCPUs = require('os').cpus().length;
if (cluster.isMaster) {
  for (var i = 0; i < numCPUs; i++) {
    cluster.fork();
  }
  cluster.on('death', function(worker) {
    console.log('worker ' + worker.pid + ' died');
    cluster.fork()
  });
} else {
  app.listen(8080);
}

console.log('\033[90m - Server up and ready at 127.0.0.1:%s\033[39m', 8080);
