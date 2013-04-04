var path   = require('path')
  , fs     = require('fs')
  , fwatch = require('chokidar')
  , shell  = require('shelljs')

module.exports = function (opts){'use strict';
  /**
   * Task: Watch
   * ------------
   * Watch the videos dir, when a new element is added to the dir
   * this task will check if there are more videos that the max
   * permitted, if this is true, remove the first element in the 
   * videos' list
   * 
   */
  var watcher = fwatch.watch(opts.g('vpath'), {
        ignored: /^\.|\.mp4$/,
        persistent: true
      })
    , files = fs.readdirSync(opts.g('vpath'))
    , max = opts.g('max:videos')
    , rpath = path.resolve(opts.g('vpath'))

  watcher.on('add', function(file){
    file = file.replace(rpath,'').split('/')[1]
    if (~files.indexOf(file)) return
    files.push(file)
    if (files.length > max) {
      debug('VIDEO: removing ' + files[0])
      shell.rm('-rf', opts.g('vpath') + files.shift())
    }
  })

  return watcher
}

