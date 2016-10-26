// DataRowCollection.ts
"use strict";
var SortedArray = require('collections/sorted-array');
var DataRowCollection = (function () {
    function DataRowCollection(dataTable) {
        if (dataTable === void 0) {
            throw new Error("Illegal DataRowCollection constructor: expected DataTable as first argument");
        }
        this._table = dataTable;
        var drc = this;
        this._rows = new SortedArray([], function (objA, objB) {
            var keyColumn = drc.table().primaryKey();
            return keyColumn.getValue(objA) === keyColumn.getValue(objB);
        }, function (objA, objB) {
            //var keyColumn = drc.table().primaryKey();
            return 1;
        });
    }
    //*
    DataRowCollection.prototype.size = function () {
        return this._rows.length;
    };
    DataRowCollection.prototype.has = function (value) {
        return this._rows.has({}); // TODO
    };
    DataRowCollection.prototype.get = function (value) {
        return this._rows.get(value);
    };
    DataRowCollection.prototype.add = function () {
        var rows = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            rows[_i - 0] = arguments[_i];
        }
        for (var _a = 0, rows_1 = rows; _a < rows_1.length; _a++) {
            var row = rows_1[_a];
            this._addRow(row);
        }
    };
    DataRowCollection.prototype._addRow = function (row) {
        if (this._rows.add(row)) {
            row.table(this.table());
        }
        else {
            throw new Error("Could not add DataRow:" + row);
        }
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
exports.DataRowCollection = DataRowCollection;
//# sourceMappingURL=DataRowCollection.js.map