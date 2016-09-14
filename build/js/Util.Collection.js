// Collection.ts
// A data structure class for a collection container
"use strict";
var Collection = (function () {
    function Collection(keyPath, data) {
        if (keyPath === void 0) { keyPath = ""; }
        this.keyPath(keyPath);
        this._data = data || [];
    }
    Collection.prototype.get = function (index) {
        return this._data[index];
    };
    Collection.prototype.toArray = function () {
        return this._data.slice();
    };
    Collection.prototype.add = function (obj) {
        this._data.push(obj);
        this._data.sort(this.cmp);
    };
    Collection.prototype._find = function (obj) {
        return this._data.find(function (val) {
            return val == obj;
        });
    };
    Collection.prototype.remove = function (obj) {
        var index = this._data.findIndex(function (val, i) {
            return val == obj;
        });
        if (index < 0) {
            return undefined;
        }
        var retObj = this._data[index];
        this._data[index] = undefined;
        return retObj;
    };
    Collection.prototype.keyPath = function (newKeyPath) {
        if (newKeyPath !== undefined) {
            this._keyPath = newKeyPath;
            this._keyPathArray = this._keyPath.split('.');
            return this;
        }
        return this._keyPath;
    };
    Collection.prototype.getKey = function (obj) {
        return this._keyPathArray.reduce(key_path_reducer, obj);
    };
    Collection.prototype.cmp = function (a, b) {
        return cmp_keys(this.getKey(a), this.getKey(b));
    };
    return Collection;
}());
exports.Collection = Collection;
function key_path_reducer(prevKey, nextKey, index, keyPathArray) {
    return prevKey === undefined ? undefined : prevKey[nextKey];
}
var cmp_keys = (typeof indexedDB !== 'undefined') ? indexedDB.cmp.bind(indexedDB) :
    function (a, b) {
        return a < b ? -1 : (a > b ? 1 : 0);
    };
