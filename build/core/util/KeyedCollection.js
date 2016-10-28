// util/KeyedCollection.ts
"use strict";
var Functions_1 = require('./Functions');
var KeyedCollection = (function () {
    function KeyedCollection(keyPath) {
        this._data = [];
        this._keyPath = keyPath;
    }
    KeyedCollection.prototype.has = function (key) {
        return this.indexOf(key) > -1;
    };
    KeyedCollection.prototype.get = function (key) {
        var index = this.indexOf(key);
        if (index < 0) {
            return void 0;
        }
        else {
            return this._data[index];
        }
    };
    /*
    set(value: TValue): boolean {
        var added = false;
        var newKey = resolveKeyPath<TKey>(this._keyPath, value)
        var index = this.indexOf(newKey);
        if (index < 0) {
            added = true;
            this._data.push(value)
        } else {
            
        }
        return added;
    }
    //*/
    KeyedCollection.prototype.add = function (value) {
        var added = false;
        var key = Functions_1.resolveKeyPath(this._keyPath, value);
        var index = this.indexOf(key);
        if (index < 0) {
            added = true;
            this._data.push(value);
        }
        else {
            console.warn("value with key=" + key + " exists in collection. Replacing value");
            this._data.splice(index, 1, value);
            added = true;
        }
        return added;
    };
    KeyedCollection.prototype.delete = function (key) {
        var deleted = false;
        var index = this.indexOf(key);
        if (index < 0) {
            throw new TypeError("key:" + key + "does not exist in set");
        }
        else {
            deleted = true;
            this._data.splice(index, 1);
        }
        return deleted;
    };
    KeyedCollection.prototype.indexOf = function (key) {
        var self = this;
        return findIndex(this._data, function (value) {
            return Functions_1.resolveKeyPath(self._keyPath, value) === key;
        });
    };
    KeyedCollection.prototype.find = function (predicate) {
        var index = findIndex(this._data, predicate);
        if (index > -1) {
            return this._data[index];
        }
        return void 0;
    };
    KeyedCollection.prototype.keysArray = function () {
        var self = this;
        return this._data.map(function (value) {
            return Functions_1.resolveKeyPath(self._keyPath, value);
        });
    };
    KeyedCollection.prototype.valuesArray = function () {
        return this._data.slice();
    };
    KeyedCollection.prototype.entriesArray = function () {
        var self = this;
        return this._data.map(function (value) {
            return [Functions_1.resolveKeyPath(this._keyPath, value), value];
        });
    };
    KeyedCollection.prototype.toString = function () {
        var _this = this;
        return this._data.map(function (value, index) {
            var key = Functions_1.resolveKeyPath(_this._keyPath, value);
            return key + ":" + value;
        }).join(', ');
    };
    Object.defineProperty(KeyedCollection.prototype, "size", {
        get: function () {
            return this._data.length;
        },
        set: function (newValue) {
            this._data.length = newValue;
        },
        enumerable: true,
        configurable: true
    });
    return KeyedCollection;
}());
exports.KeyedCollection = KeyedCollection;
function findIndex(array, predicate) {
    'use strict';
    if (array === null) {
        throw new TypeError('Array.prototype.findIndex called on null or undefined');
    }
    if (typeof predicate !== 'function') {
        throw new TypeError('predicate must be a function');
    }
    var list = Object(array);
    var length = list.length >>> 0;
    var thisArg = arguments[2];
    var value;
    for (var i = 0; i < length; i++) {
        value = list[i];
        if (predicate.call(thisArg, value, i, list)) {
            return i;
        }
    }
    return -1;
}
;
//# sourceMappingURL=KeyedCollection.js.map