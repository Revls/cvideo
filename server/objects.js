/**
 * Object extended
 * -------------------------
 * Cuz' simple objects are main stream
 * @author: Alejandro Morales <vamg008@gmail.com>
 * @license: MIT 2013 <http://ale.mit-license.org>
 * @date: date
 */ 'use strict';

// Is this a good idea? Hell no! But I like my objects with get/has and emitter
module.exports = ExtendedObject

/**
 * ExtendedObject
 * ------------
 * Add a bunch of tools to raw objects
 * - get
 * - has
 * - set / mixin
 * Options: 'separator', the char used to separate levels (o.get('a:b:c'), separator -> ':')
 * 
 */
function ExtendedObject(options){
  if (!(this instanceof ExtendedObject)) return new ExtendedObject(options)
  if (!options.separator) options.separator = '.'
  ExtendedObject.mix(options)
}

ExtendedObject.create = function(options){
  return new ExtendedObject(options)
}

/**
 * ExtendObject#mix
 * ------------
 * Mix the options with constructor into private properties
 * 
 */
ExtendedObject.mix = function (options){
  Object.keys(options).forEach(function(key){
    Object.defineProperty(ExtendedObject.prototype, '_' + key, {
      get: function (){
        // if (typeof options[key] == 'function') return options[key].call(this)
        return options[key]
      },
      enumerable: false
    })
  })
}

/**
 * ExtendObject#getElementsByTagName('')
 * ------------
 * Gets the value in the main object
 *
 *  // o -> { a: 2, b: {c:{ f: 1, d: 2}}}
 * 
 *  o.get('a.b.c') // -> {f: 1, d: 2}
 *  o.get('a.b.c.d') // -> 2
 */
ExtendedObject.prototype.get
ExtendedObject.prototype.g = function (id){
  var deep = destructure(id, this._separator) 
  var noexist = false
  var found = deep.reduce(function (prev, next){
    if (!prev) return this[next]
    if (prev[next]) return prev[next]
    else {
      noexist = true
      return prev
    }
  }, this)
  if (noexist) return null
  else return found
}

/**
 * ExtendObject#mixin
 * ------------
 * Alias to ExtendObject#set
 * 
 */
ExtendedObject.prototype.mixin = function (newStuff){
  return this.set(newStuff)
}

ExtendedObject.prototype.set = function (id, tng){
  if (!tng && typeof id === 'object') {
    return Object.keys(id).forEach(function(tn){ this.set(tn, id[tn]) }, this)
  }
  insertInto(this, id, tng, this._separator)
  if (typeof this._change == 'function') this._change.call(this, id, tng)
  return this
}

// Has a key? true/false
ExtendedObject.prototype.has = function(id){
  if (this.get(id)) return true
  return false
}

// --- Helpers --
function insertInto(o, id, tn, _separator) {
  var steps = id
  if (!Array.isArray(id)) steps = id.split(_separator)
  if (steps.length === 1 && !o[id]) {
    o[id] = tn
  } else if (!o[id] && steps.length > 1){
    id = steps.shift()
    if (o[id] && typeof o[id] === 'object') o[id] = merge(o[id], insertInto({}, steps, tn, _separator))
    else o[id] = insertInto({}, steps, tn, _separator)
  } else {
    id = steps.shift()
    o[id] = insertInto(o[id], steps, tn, _separator)
  }
  return o
}

function merge(obj1, obj2) {
  for (var prop in obj2) {
    try {
      if (obj2[prop].constructor == Object) {
        obj1[prop] = merge(obj1[prop], obj2[prop])
      } else {
        obj1[prop] = obj2[prop]
      }
    } catch(e) {
      obj1[prop] = obj2[prop]
    }
  }
  return obj1
}

function destructure(obj, _separator) {
  if (Array.isArray(obj)) return obj
  return obj.split(_separator || '.')
}

// -- endHelpers --
