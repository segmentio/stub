'use strict';

/*
 * Module dependencies.
 */

var extend = require('@ndhoule/extend');
var eql = require('@segment/equals');

/**
 * Prototype.
 */

var proto = {};

/**
 * `true` if the stub was called with `args`.
 *
 * @return {boolean}
 * @api public
 */
proto.got = proto.calledWith = function() {
  var a = Array.prototype.slice.call(arguments);
  for (var i = 0, n = this.args.length; i < n; i++) {
    var b = this.args[i];
    if (eql(a, b.slice(0, a.length))) return true;
  }
  return;
};

/**
 * `true` if the stub returned `value`.
 *
 * @param {*} value
 * @return {boolean}
 * @api public
 */
proto.returned = function(value) {
  var ret = this.returns[this.returns.length - 1];
  return eql(ret, value);
};

/**
 * `true` if the stub was called once.
 *
 * @return {boolean}
 * @api public
 */
proto.once = function() {
  return this.args.length === 1;
};

/**
 * `true` if the stub was called twice.
 *
 * @return {boolean}
 * @api public
 */
proto.twice = function() {
  return this.args.length === 2;
};

/**
 * `true` if the stub was called three times.
 *
 * @return {boolean}
 * @api public
 */
proto.thrice = function() {
  return this.args.length === 3;
};

/**
 * Reset the stub.
 *
 * @return {Function}
 * @api public
 */
proto.reset = function() {
  this.returns = [];
  this.args = [];
  this.update();
  return this;
};

/**
 * Restore.
 *
 * @return {Function}
 * @api public
 */
proto.restore = function() {
  if (!this.obj) return this;
  var m = this.method;
  var fn = this.fn;
  this.obj[m] = fn;
  return this;
};

/**
 * Update the stub.
 *
 * @return {Function}
 * @api private
 */
proto.update = function() {
  this.called = !! this.args.length;
  this.calledOnce = this.once();
  this.calledTwice = this.twice();
  this.calledThrice = this.thrice();
  return this;
};

/**
 * To function.
 *
 * @param {*} ...args
 * @param {Function} stub
 * @return {Function}
 * @api private
 */
function toFunction(args, stub) {
  var obj = args[0];
  var method = args[1];
  var fn = args[2] || function() {};

  switch (args.length) {
  case 0: return function noop() {};
  case 1: return function(args) { return obj.apply(null, args); };
  case 2:
  case 3:
  default:
    var m = obj[method];
    stub.method = method;
    stub.fn = m;
    stub.obj = obj;
    obj[method] = stub;
    return function(args) {
      return fn.apply(obj, args);
    };
  }
}

/**
 * Create a test stub with `obj`, `method`.
 *
 * Examples:
 *
 *      s = require('stub')({}, 'toString');
 *      s = require('stub')(document.write);
 *      s = require('stub')();
 *
 * @param {Object|Function} obj
 * @param {string} method
 * @return {Function}
 * @api public
 */
// eslint-disable-next-line no-unused-vars
module.exports = function(obj, method) {
  var fn = toFunction(arguments, stub);

  function stub() {
    var args = Array.prototype.slice.call(arguments);
    var ret = fn(arguments);
    // stub.returns || stub.reset();
    stub.args.push(args);
    stub.returns.push(ret);
    stub.update();
    return ret;
  }

  extend(stub, proto);
  stub.reset();
  // stub.name = method;
  return stub;
};
