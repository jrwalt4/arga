// DataColumn.ts
"use strict";
var DataTable = require('./DataTable');
var DataColumn = (function () {
    function DataColumn(name) {
        this._name = name;
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
module.exports = DataColumn;
