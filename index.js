var shell = require('shelljs')

if (!shell.which('ffmpeg'))
  process.env.FFMPEG_PATH = __dirname + '/vendor/ffmpeg'

module.exports = require('./server')
module.exports.version = require('./package').version

