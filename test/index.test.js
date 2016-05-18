'use strict';

var assert = require('proclaim');
var stub = require('../lib');
// XXX(ndhoule): This works but not assert.deepEqual because this impl and
// these tests are awful and should be deprecated in favor of Sinon or similar
var equals = require('equals');

describe('stub', function() {
  var s;

  beforeEach(function() {
    s = stub();
  });

  describe('.calledWith', function() {
    it('should alias .got', function() {
      assert(stub().calledWith === stub().got);
    });
  });

  it('should support methods', function() {
    var arr = [];
    var s = stub(arr, 'push');
    s(1, 2, 3);
    assert(equals(arr, []));
    assert(arr.push.calledWith(1, 2, 3));
  });

  it('should support custom functions', function() {
    var arr = [];
    var tmp;
    var fn = function() { tmp = [].slice.call(arguments); };
    var s = stub(arr, 'push', fn);
    s(1, 2, 3);
    assert(equals(arr, []));
    assert(equals(tmp, [1, 2, 3]));
    assert(arr.push.calledWith(1, 2, 3));
  });

  it('should restore methods with `.restore()`', function() {
    var arr = [];
    var orig = arr.push;
    var s = stub(arr, 'push');
    s(1);
    assert(arr.push.calledWith(1));
    s.restore();
    assert(orig === arr.push);
  });

  it('should record arguments', function() {
    s(1, 2, 3);
    s(4, 5, 6);
    s(7, 8, 9);
    assert(equals(s.args, [
      [1, 2, 3],
      [4, 5, 6],
      [7, 8, 9]
    ]));
  });

  it('should record partial arguments', function() {
    s(1, 2, 3);
    s(4, 5, 6);
    assert(s.calledWith(1));
    assert(s.calledWith(1, 2));
    assert(s.calledWith(1, 2, 3));
    assert(!s.calledWith(1, 2, 3, 4));
    assert(s.calledWith(4));
    assert(s.calledWith(4, 5));
    assert(s.calledWith(4, 5, 6));
  });

  it('should record returned values', function() {
    s(1, 2, 3);
    s(4, 5, 6);
    s(7, 8, 9);
    assert(equals(s.returns, [
      undefined,
      undefined,
      undefined
    ]));
  });

  describe('.calledOnce', function() {
    it('should be true only when the function was called once', function() {
      assert(!s.calledOnce);
      s(1);
      assert(s.calledOnce);
      s(1);
      assert(!s.calledOnce);
    });
  });

  describe('.calledTwice', function() {
    it('should be true when called twice', function() {
      assert(!s.calledTwice);
      s(1);
      assert(!s.calledTwice);
      s(1);
      assert(s.calledTwice);
      s(1);
      assert(!s.calledTwice);
    });
  });

  describe('.calledThrice', function() {
    it('should be true when called three times', function() {
      assert(!s.calledThrice);
      s(1);
      assert(!s.calledThrice);
      s(1);
      assert(!s.calledThrice);
      s(1);
      assert(s.calledThrice);
    });
  });

  describe('.got()', function() {
    it('should assert arguments correctly', function() {
      s(1, 2, 3);
      assert(s.got(1, 2, 3));
      s(4, 5, [6]);
      assert(s.got(4, 5, [6]));
    });
  });

  describe('.returned()', function() {
    it('should assert return values correctly', function() {
      var s = stub(window.encodeURIComponent);
      s('testing 4 u');
      assert(s.returned('testing%204%20u'));
      assert(s.returns[0] === 'testing%204%20u');
      s('testing 4 u 2');
      assert(s.returned('testing%204%20u%202'));
      assert(s.returns[1] === 'testing%204%20u%202');
    });
  });

  describe('.reset()', function() {
    it('should reset the stub', function() {
      var s = stub();
      s(1);
      s(2);
      s(3);
      assert(s.args.length === 3);
      assert(s.returns.length === 3);
      s.reset();
      assert(s.args.length === 0);
      assert(s.returns.length === 0);
      assert(!s.calledOnce);
      assert(!s.calledTwice);
      assert(!s.calledThrice);
      assert(!s.called);
    });
  });
});
