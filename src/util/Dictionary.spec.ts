import { Dictionary } from './Dictionary'
/* 
 * Stolen from https://github.com/domenic/dict
 */
describe("Dict under normal usage", function () {
  let d: Dictionary<any>
  beforeEach(function () {
    d = new Dictionary();
  });
  it("should say it has a key once it is set", function () {
    d.set("key", "value");
    expect(d.has("key")).toEqual(true);
  });
  it("should be able to get a key once it is set", function () {
    var obj;
    obj = {};
    d.set("key", obj);
    expect(d.get("key")).toEqual(obj);
  });
  it("should return undefined for unset keys", function () {
    expect(d.get("key")).toEqual(void 0);
  });
  /*
  it("should use the supplied fallback value when getting unset keys", function () {
    var obj;
    obj = {};
    expect(d.get("key", obj)).toEqual(obj);
  });
  */
  it("should know how many keys are set", function () {
    expect(d.size).toEqual(0);
    d.set("k1", "v1");
    expect(d.size).toEqual(1);
    d.set("k2", "v2");
    expect(d.size).toEqual(2);
    d.set("k1", "v3");
    expect(d.size).toEqual(2);
    d["delete"]("k1");
    expect(d.size).toEqual(1);
    d["delete"]("bogus");
    expect(d.size).toEqual(1);
    d["delete"]("k2");
    expect(d.size).toEqual(0);
  });
  it("should return `true` when deleting keys " +
    "that are present; `false` otherwise", function () {
      expect(d.delete("k")).toEqual(false);
      d.set("k", "v");
      expect(d.delete("k")).toEqual(true);
      expect(d.delete("k")).toEqual(false);
    });
  it("should return the value set", function () {
    expect(d.set("k", "v")).toEqual("v");
  });
  it("should allow clearing all keys", function () {
    d.set("k1", "v1");
    d.set("k2", "v2");
    d.clear();
    expect(d.get("k1")).toEqual(void 0);
    expect(d.has("k1")).toEqual(false);
    expect(d.get("k2")).toEqual(void 0);
    expect(d.has("k2")).toEqual(false);
    expect(d.size).toEqual(0);
  });
  describe("forEach", function () {
    it("should execute the callback function " +
      "with args `(value, key, dict)`", function () {
        d.set("key1", "value1");
        d.set("key2", "value2");
        d.set("key3", "value3");
        let spy = jasmine.createSpy('forEach');
        d.forEach(spy);
        expect(spy).toHaveBeenCalledTimes(3);
        expect(spy.calls.all()[0].args).toEqual(["value1", "key1", d]);
        expect(spy.calls.all()[1].args).toEqual(["value2", "key2", d]);
        expect(spy.calls.all()[2].args).toEqual(["value3", "key3", d]);
      });
    it("should use the `thisArg` to set the " +
      "`this` inside the callback", function () {
        let thisArg = {
          "i am": "this!"
        };
        let spy = jasmine.createSpy('forEachWithThisArg');
        d.set("key", "value");
        d.forEach(spy, thisArg);
        expect(spy).toHaveBeenCalledTimes(1);
        expect(spy.calls.argsFor(0)).toEqual(["value", "key", d]);
        expect(spy.calls.all()[0].object).toBe(thisArg);
      });
  });
  describe("when values are undefined or falsy", function () {
    beforeEach(function () {
      d.set("key1", void 0);
      d.set("key2", 0);
      d.set("key3", false);
    });
    it("should still say it has those keys", function () {
      expect(d.has("key1")).toEqual(true);
      expect(d.has("key2")).toEqual(true);
      expect(d.has("key3")).toEqual(true);
    });
    it("should still be able to retrieve those values", function () {
      expect(d.get("key1")).toEqual(void 0);
      expect(d.get("key2")).toEqual(0);
      expect(d.get("key3")).toEqual(false);
    });
    it("should not use the supplied fallback value " +
      "when getting those keys", function () {
        expect(d.get("key1", "fallback")).toEqual(void 0);
        expect(d.get("key2", "fallback")).toEqual(0);
        expect(d.get("key3", "fallback")).toEqual(false);
      });
  });
  describe("when a key is deleted", function () {
    beforeEach(function () {
      d.set("key", "value");
      d["delete"]("key");
    });
    it("should no longer have that key", function () {
      expect(d.has("key")).toEqual(false);
    });
    it("should return undefined for that key", function () {
      expect(d.get("key")).toEqual(void 0);
    });
  });
});
/*
describe("Dict with constructor argument", function () {
  it("should not react to non-object arguments", function () {
    (function () {
      return Dictionary(null);
    }).should.not["throw"]();
    return (function () {
      return Dictionary(true);
    }).should.not["throw"]();
  });
  it("should get an element from the constructor", function () {
    var d, obj;
    obj = {};
    d = Dictionary({
      key: obj
    });
    d.has("key").should.equal(true);
    return d.get("key").should.equal(obj);
  });
  it("should get multiple elements from the constructor", function () {
    var d, obj;
    obj = {};
    d = Dictionary({
      key: obj,
      key2: 42
    });
    d.has("key").should.equal(true);
    d.get("key").should.equal(obj);
    d.has("key2").should.equal(true);
    return d.get("key2").should.equal(42);
  });
  return it("should not get elements from the constructor argument's prototype", function () {
    var d;
    d = Dictionary({});
    d.has("hasOwnProperty").should.equal(false);
    return d.has("toString").should.equal(false);
  });
});
//*/
/*
describe("Dict under unconventional, malicious, or dumb usage", function() {
  var d;
  d = null;
  beforeEach(function() {
    return d = dict();
  });
  it('should not have a key named "hasOwnProperty" initially', function() {
    return d.has("hasOwnProperty").should.equal(false);
  });
  it('should be able to handle a "hasOwnProperty" key being set', function() {
    var obj;
    obj = {};
    d.set("hasOwnProperty", obj);
    d.has("hasOwnProperty").should.equal(true);
    return d.get("hasOwnProperty").should.equal(obj);
  });
  it('should not have a key named "__proto__" initially', function() {
    return d.has("__proto__").should.equal(false);
  });
  it('should not allow changing of its `size` property', function() {
    expect(function() {
      return d.size = 10;
    }).to["throw"](TypeError);
    return d.size.should.equal(0);
  });
  describe('when an object is inserted into the "__proto__" key', function() {
    var fakeValue, proto;
    fakeValue = {};
    proto = {
      fakeKey: fakeValue
    };
    beforeEach(function() {
      return d.set("__proto__", proto);
    });
    it("should have an entry for the __proto__ key", function() {
      return d.has("__proto__").should.equal(true);
    });
    it("should not have any keys derived from the inserted __proto__ object", function() {
      return d.has("fakeKey").should.equal(false);
    });
    return it("should not delete from the inserted __proto__ object when deleting from the dict", function() {
      d["delete"]("fakeKey");
      return d.get("__proto__").fakeKey.should.equal(fakeValue);
    });
  });
  describe('when users forget to use strings as keys', function() {
    var shouldThrowFor;
    shouldThrowFor = function(value) {
      expect(function() {
        return d.get(value);
      }).to["throw"](TypeError);
      expect(function() {
        return d.get(value, "fallback");
      }).to["throw"](TypeError);
      expect(function() {
        return d.set(value);
      }).to["throw"](TypeError);
      expect(function() {
        return d.has(value);
      }).to["throw"](TypeError);
      return expect(function() {
        return d["delete"](value);
      }).to["throw"](TypeError);
    };
    it("should throw a `TypeError` when using `undefined`", function() {
      return shouldThrowFor(void 0);
    });
    it("should throw a `TypeError` when using `null`", function() {
      return shouldThrowFor(null);
    });
    it("should throw a `TypeError` when using `5`", function() {
      return shouldThrowFor(5);
    });
    it("should throw a `TypeError` when using a date", function() {
      return shouldThrowFor(new Date());
    });
    it("should throw a `TypeError` when using a regex", function() {
      return shouldThrowFor(/key/i);
    });
    it("should throw a `TypeError` when using an object", function() {
      return shouldThrowFor({});
    });
    return it("should throw a `TypeError` when using an object with a toString method", function() {
      return shouldThrowFor({
        toString: function() {
          return "key";
        }
      });
    });
  });
  return describe('when users pass non-functions to `forEach`', function() {
    var shouldThrowFor;
    shouldThrowFor = function(value) {
      return expect(function() {
        return d.forEach(value);
      }).to["throw"](TypeError);
    };
    it("should throw a `TypeError` when using `undefined`", function() {
      return shouldThrowFor(void 0);
    });
    it("should throw a `TypeError` when using `null`", function() {
      return shouldThrowFor(null);
    });
    it("should throw a `TypeError` when using `5`", function() {
      return shouldThrowFor(5);
    });
    it("should throw a `TypeError` when using a date", function() {
      return shouldThrowFor(new Date());
    });
    it("should throw a `TypeError` when using a regex", function() {
      return shouldThrowFor(/key/i);
    });
    return it("should throw a `TypeError` when using an object", function() {
      return shouldThrowFor({});
    });
  });
});
//*/