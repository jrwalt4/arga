// util/KeyedCollection.ts
"use strict";
var _ = require("lodash");
var EmptyObject_1 = require("./EmptyObject");
var _get = _.get, _set = _.set, _has = _.has, _property = _.property, _isEqualBy = function (iteratee) {
    return function (a, b) {
        return iteratee(a) === iteratee(b);
    };
};
var KeyedCollection = (function () {
    function KeyedCollection(_keyPath, entries) {
        this._keyPath = _keyPath;
        this._store = new EmptyObject_1.EmptyObject;
    }
    Object.defineProperty(KeyedCollection.prototype, "size", {
        get: function () {
            return Object.keys(this._store).length;
        },
        enumerable: true,
        configurable: true
    });
    KeyedCollection.prototype.get = function (key) {
        if (this.has(key)) {
            return _get(this._store, this._keyPath);
        }
    };
    KeyedCollection.prototype.add = function (value) {
        var key;
        if (!this.has(key = _get(value, this._keyPath))) {
            _set(this._store, key, value);
            return true;
        }
        return false;
    };
    KeyedCollection.prototype.has = function (key) {
        return _.hasIn(this._store, key);
    };
    KeyedCollection.prototype.delete = function (key) {
        return _.unset(this._store, this._keyPath);
    };
    KeyedCollection.prototype.clear = function () {
        this._store = new EmptyObject_1.EmptyObject();
    };
    KeyedCollection.prototype.find = function (callback) {
        return _.find(this._store, callback);
    };
    KeyedCollection.prototype.forEach = function (callback, thisArg) {
        _.forOwn(this._store, callback, thisArg);
    };
    return KeyedCollection;
}());
exports.KeyedCollection = KeyedCollection;
