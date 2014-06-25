
describe('stub', function(){
  var assert = require('assert');
  var stub = require('stub');
  var s;

  describe('.calledWith', function(){
    it('should alias .got', function(){
      assert(stub().calledWith == stub().got);
    })
  })

  beforeEach(function(){
    s = stub();
  })

  it('should support methods', function(){
    var arr = [];
    var s = stub(arr, 'push');
    s(1, 2, 3);
    assert.deepEqual([], arr);
    assert(arr.push.calledWith(1, 2, 3));
  })

  it('should support custom functions', function(){
    var arr = [];
    var tmp;
    var fn = function() { tmp = [].slice.call(arguments) }
    var s = stub(arr, 'push', fn);
    s(1, 2, 3);
    assert.deepEqual([], arr);
    assert.deepEqual([1, 2, 3], tmp);
    assert(arr.push.calledWith(1, 2, 3));
  })

  it('should restore methods with `.restore()`', function(){
    var arr = [];
    var orig = arr.push;
    var s = stub(arr, 'push');
    s(1);
    assert(arr.push.calledWith(1));
    s.restore();
    assert(orig == arr.push);
  })

  it('should record arguments', function(){
    s(1, 2, 3);
    s(4, 5, 6);
    s(7, 8, 9);
    assert.deepEqual(s.args, [
      [1, 2, 3],
      [4, 5, 6],
      [7, 8, 9],
    ]);
  })

  it('should record partial arguments', function(){
    s(1, 2, 3);
    s(4, 5, 6);
    assert(s.calledWith(1));
    assert(s.calledWith(1, 2));
    assert(s.calledWith(1, 2, 3));
    assert(!s.calledWith(1, 2, 3, 4));
    assert(s.calledWith(4));
    assert(s.calledWith(4, 5));
    assert(s.calledWith(4, 5, 6));
  })

  it('should record returned values', function(){
    s(1, 2, 3);
    s(4, 5, 6);
    s(7, 8, 9);
    assert.deepEqual(s.returns, [
      undefined,
      undefined,
      undefined
    ]);
  })

  describe('.calledOnce', function(){
    it('should be true only when the function was called once', function(){
      assert(!s.calledOnce);
      s(1);
      assert(s.calledOnce);
      s(1);
      assert(!s.calledOnce);
    })
  })

  describe('.calledTwice', function(){
    it('should be true when called twice', function(){
      assert(!s.calledTwice);
      s(1);
      assert(!s.calledTwice);
      s(1);
      assert(s.calledTwice);
      s(1);
      assert(!s.calledTwice);
    })
  })

  describe('.calledThrice', function(){
    it('should be true when called three times', function(){
      assert(!s.calledThrice);
      s(1);
      assert(!s.calledThrice);
      s(1);
      assert(!s.calledThrice);
      s(1);
      assert(s.calledThrice);
    })
  })

  describe('.got()', function(){
    it('should assert arguments correctly', function(){
      s(1, 2, 3);
      assert(s.got(1, 2, 3));
      s(4, 5, [6]);
      assert(s.got(4, 5, [6]));
    })
  })

  describe('.returned()', function(){
    it('should assert return values correctly', function(){
      var s = stub(window.btoa);
      s('test');
      assert(s.returned('dGVzdA=='));
      assert('dGVzdA==' == s.returns[0]);
      s('foo');
      assert(s.returned('Zm9v'));
      assert('Zm9v' == s.returns[1]);
    })
  })

  describe('.reset()', function(){
    it('should reset the stub', function(){
      var s = stub();
      s(1);
      s(2);
      s(3);
      assert(3 == s.args.length);
      assert(3 == s.returns.length);
      s.reset();
      assert(0 == s.args.length);
      assert(0 == s.returns.length);
      assert(!s.calledOnce);
      assert(!s.calledTwice);
      assert(!s.calledThrice);
      assert(!s.called);
    })
  })
})
