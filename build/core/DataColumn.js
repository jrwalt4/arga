// DataColumn.ts
"use strict";
var SortedArray = require('collections/sorted-array');
var util = require('./Util');
var DataColumn = (function () {
    function DataColumn(name, constructorOptions) {
        if (constructorOptions === void 0) { constructorOptions = { keyPath: name }; }
        this._name = name;
        if (constructorOptions.keyPath) {
            var keyPath = this._keyPath = constructorOptions.keyPath;
            this.getValue = function (data) { return util.getValueAtKeyPath(keyPath, data); };
            this.setValue = function (data, value) { return util.setValueAtKeyPath(keyPath, data, value); };
        }
        else {
        }
        if (constructorOptions.index) {
            this._index = new SortedArray(undefined, util.createContentEquals(keyPath), util.createContentCompare(keyPath));
        }
    }
    DataColumn.prototype.getValue = function (data) {
        return util.resolveKeyPath(this._keyPath, data);
    };
    DataColumn.prototype.setValue = function (data, value) {
    };
    DataColumn.prototype.table = function (dataTable) {
        if (dataTable === void 0) {
            return this._table;
        }
        this._table = dataTable;
        return this;
    };
    DataColumn.prototype.name = function (sName) {
        if (sName !== undefined) {
            this._name = sName;
            return this;
        }
        return this._name;
    };
    DataColumn.prototype.keyPath = function () {
        return this._keyPath;
    };
    return DataColumn;
}());
exports.DataColumn = DataColumn;
var Item = (function () {
    function Item(key, index) {
        this.key = key;
        this.index = index;
    }
    return Item;
}());
//# sourceMappingURL=DataColumn.js.map