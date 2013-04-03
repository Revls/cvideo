var processVideo = require('../server/task/video')
var frames = require('./fixture.json')


processVideo(frames).then(function(meta){
  console.log(meta)
}, function (error){
  console.log('ERROR:', error.stack)
})
