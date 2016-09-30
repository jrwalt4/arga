// DataColumn.ts
"use strict";
var SortedArray = require('collections/sorted-array');
var util = require('./Util');
var DataColumn = (function () {
    function DataColumn(table, name, keyPath) {
        if (table === void 0) {
            throw new Error("cannot construct DataColumn without DataTable");
        }
        this._name = name;
        this._keyPath = keyPath;
        this._index = new SortedArray(undefined, util.createContentEquals(keyPath), util.createContentCompare(keyPath));
    }
    DataColumn.prototype.getValue = function (data) {
        return util.resolveKeyPath(this._keyPath, data);
    };
    DataColumn.prototype.setValue = function (row, value) {
    };
    DataColumn.prototype.table = function () {
        return this._table;
    };
    DataColumn.prototype.name = function (sName) {
        if (sName !== undefined) {
            this._name = sName;
            return this;
        }
        return this._name;
    };
    DataColumn.prototype.keyPath = function () {
        if (this._keyPath === void 0) {
            return this.name();
        }
        return this._keyPath;
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
//# sourceMappingURL=DataColumn.js.map