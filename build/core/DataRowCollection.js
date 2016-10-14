// DataRowCollection.ts
"use strict";
var SortedArray = require('collections/sorted-array');
var Util_1 = require('./Util');
var DataRowCollection = (function () {
    function DataRowCollection(dataTable, sKeyPath) {
        if (dataTable === void 0) {
            throw new Error("Illegal DataRowCollection constructor: expected DataTable as first argument");
        }
        this._table = dataTable;
        this._rows = new SortedArray([], Util_1.createContentEquals(sKeyPath), Util_1.createContentCompare(sKeyPath));
    }
    //*
    DataRowCollection.prototype.size = function () {
        return this._rows.length;
    };
    DataRowCollection.prototype.has = function (value) {
        return this._rows.has(value);
    };
    DataRowCollection.prototype.get = function (value) {
        return this._rows.get(value);
    };
    DataRowCollection.prototype.add = function () {
        var rows = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            rows[_i - 0] = arguments[_i];
        }
        this._rows.addEach(rows);
    };
    DataRowCollection.prototype.clear = function () {
        this._rows.clear();
    };
    DataRowCollection.prototype.toArray = function () {
        return this._rows.toArray();
    };
    //*/
    DataRowCollection.prototype.table = function () {
        return this._table;
    };
    return DataRowCollection;
}());
module.exports = DataRowCollection;
//# sourceMappingURL=DataRowCollection.js.map