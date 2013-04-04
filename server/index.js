/**
 * CanvasVideo
 * -------------------------
 * @author: Alejandro Morales <vamg008@gmail.com>
 * @license: MIT 2013 <http://ale.mit-license.org>
 * @date: 3-04-2013
 */ 'use strict';

var fs = require('fs')
  , clientLib


module.exports = function(server, opts){'use strict';
  if (!opts) opts = {}
  if (!opts.transport) opts.transport = 'http'
  var transport = require('./transports/' + opts.transport)
  clientLib = fs.readFileSync('../client/' + opts.transport + '.js', 'utf8')

  if (transport.url) fixListeners(server, transport)
  else fixListeners(server)
  
  transport.init(server, opts)
}


function fixListeners(server, transport){
  if (!transport) transport = {}
  var oldListeners = server.listeners('request').splice(0);
  server.removeAllListeners('request')

  server.on('request', function (req, res){
    if (req.url === '/canvas/canvas.video.js') {
      res.statusCode = 200
      res.setHeader('Content-Type', 'application/javascript')
      res.end(clientLib)
    } else if (req.url.indexOf(transport.url) === 0){
      transport.process(req, res)
    } else if (req.url.indexOf('/videos/') === 0) {
      sendVideo.call(server, req, res)
    } else {
      for (var i = 0, l = oldListeners.length; i < l; i++) {
        oldListeners[i].call(server, req, res);
      }
    }
  })
}


function sendVideo(req, res){
  if (!fs.existsSync(__dirname + '/tasks' + req.url)) {
    res.statusCode = 404
    return res.end('not found')
  }
  
  var stream = fs.createReadStream(__dirname + '/tasks' + req.url)

  res.setHeader('Content-Type', 'video/mp4')
  stream.on('error', function (error){
    stream.unpipe(res)
    if (stream.readStop) stream.readStop()
    res.statusCode = 500
    res.write('Internal server error\n')
    res.end(error.stack)
  })
  stream.pipe(res)
}
