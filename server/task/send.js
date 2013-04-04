var fs = require('fs')
  , path = require('path')

module.exports = function (req, res){
  var opts = this._opts
  
  var vpath = path.join(opts.g('vpath'), req.url.replace('/videos/', ''))

  if (!fs.existsSync(vpath)) {
    res.statusCode = 404
    return res.end('not found')
  }
  
  var stream = fs.createReadStream(vpath)

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
