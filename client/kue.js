!function(exports){'use strict';
function Events(){}

Events.create = function (options){
  return new Events(options)
}

Events.prototype._listeners = {}

Events.prototype.emit = function (evnt){
  if (!this._listeners[evnt]) return this
  var args = [].slice.call(arguments, 1)
  this._listeners[evnt].forEach(function (cb){
    try {
      cb.apply(this, args)
    } catch (exc){
      console.log('ERROR executing function', exc.stack)
    }
  }, this)
}

Events.prototype.on = 
Events.prototype.bind =  function (evnt, cb){
  if (!this._listeners[evnt]) this._listeners[evnt] = []
  this._listeners[evnt].push(cb)
  return this
}

function Kue(options){
  if (!options) options = {}
  this._timeout = options.timeout || 10*1000 // ten seconds
  this._resolve = 'resolve' in options && options.resolve !== true ? false: true
  this._queue = []
  this.data = []
  this.called = false
}

Kue.prototype = Object.create(Events.prototype, {
  constructor: Kue
})

Kue.prototype.add = function (task){
  if (this.called) this.called = false
  if (this._resolve && !this._queue.length) {
    this._queue.push(1)
    this.emit('task', task)
    task(this._resolver.bind(this))
    return this
  } else if (this._queue.length || !this._resolve) {
   this._queue.push(task)
   return this
 }
}

Kue.prototype._resolver = function (error, data){
  if (error || data) {
    this.emit('task:resolved', error, data)
    this.data.push([error, data])
  }
  var next = this._queue.shift()
  if (!next) this._end(this.data)
  if (typeof next === 'number') return this._resolver()
  if (typeof next !== 'function') return this._end(this.data)
  return next(this._resolver.bind(this))
}

Kue.prototype.resolve = function (cb){
  this.on('resolve', cb)
}
Kue.prototype._end = function (data){
  if (!this.called) {
    this.called = true
    this.emit('resolve', data)
  }
}

exports.Kue = Kue
exports.Events = Events

}(window)
