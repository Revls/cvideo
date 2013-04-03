/*
 * Initialize Components
 */
var http = require('http')
 , cluster = require('cluster')
 , express = require('express')
 , CanvasVideo = require('../server')
 , os = require('os') 


var server = express()
  , numCPUs = os.cpus().length
/*
 * Los metodos del canvas module son lo mismo
 * que el API de canvas
 */

server.use(express.static(__dirname ))  

/*  
* Added cluster
*/

if (cluster.isMaster) {
  for (var i = 0; i < numCPUs; i++) {
    cluster.fork();
  }
  cluster.on('death', function(worker) {
    console.log('worker ' + worker.pid + ' died');
    cluster.fork()
  });
} else {
  http.createServer(server).listen(process.env.PORT || 8080, function (){ 
    CanvasVideo(this)
    console.log('server listening on %d', this.address().port)
  })
}

console.log('\033[90m - Server up and ready at 127.0.0.1:%s\033[39m', 8080);
