"use strict";
var Dict = require("dict");
var _ = require("lodash");
var _get = _.get, _property = _.property;
var KeyedDictionary = (function () {
    function KeyedDictionary(keyPath, values) {
        this.keyPath = keyPath;
        this._store = new Dict(values);
        this._getKey = _property(keyPath);
    }
    Object.defineProperty(KeyedDictionary.prototype, "size", {
        get: function () {
            return this._store.size;
        },
        set: function (newSize) {
            // just in case dictjs changes to implement size setter
            this._store.size = newSize;
        },
        enumerable: true,
        configurable: true
    });
    KeyedDictionary.prototype.get = function (key) {
        return this._store.get(key);
    };
    KeyedDictionary.prototype.add = function (value) {
        var key;
        if (!this.has(key = this._getKey(value))) {
            this._store.set(key, value);
            return true;
        }
        else {
            return false;
        }
    };
    KeyedDictionary.prototype.has = function (key) {
        return this._store.has(key);
    };
    KeyedDictionary.prototype.delete = function (key) {
        return this._store.delete(key);
    };
    KeyedDictionary.prototype.clear = function () {
        return this._store.clear();
    };
    KeyedDictionary.prototype.find = function (predicate) {
        var self = this, result;
        this._store.forEach(function (val, key, dict) {
            if (predicate(val, key, self)) {
                result = val;
            }
        });
        return result;
    };
    KeyedDictionary.prototype.forEach = function (callback, thisArg) {
        var self = this;
        this._store.forEach(function (v, k, d) {
            callback.call(thisArg, v, k, self);
        }, thisArg);
    };
    return KeyedDictionary;
}());
exports.KeyedDictionary = KeyedDictionary;
