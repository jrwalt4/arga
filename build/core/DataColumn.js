// DataColumn.ts
"use strict";
var SortedArray = require('collections/sorted-array');
var util = require('./Util');
var DataTable = require('./DataTable');
var DataColumn = (function () {
    function DataColumn(name, keyPath) {
        this._name = name;
        this._keyPath = keyPath;
        this._index = new SortedArray(undefined, util.createContentEquator(keyPath), util.createContentComparer(keyPath));
    }
    DataColumn.prototype._get = function (object) {
        return object[this._keyPath];
    };
    DataColumn.prototype.table = function (newTable) {
        if (newTable !== undefined && newTable instanceof DataTable) {
            this._table = newTable;
            return this;
        }
        return this._table;
    };
    DataColumn.prototype.name = function (sName) {
        if (sName !== undefined) {
            this._name = sName;
            return this;
        }
        return this._name;
    };
    return DataColumn;
}());
var Item = (function () {
    function Item(key, index) {
        this.key = key;
        this.index = index;
    }
    return Item;
}());
module.exports = DataColumn;
