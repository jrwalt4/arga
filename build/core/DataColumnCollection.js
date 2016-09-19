// DataColumnCollection.ts
"use strict";
var DataTable = require('./DataTable');
var DataColumnCollection = (function () {
    function DataColumnCollection(dataTable) {
        if (!(dataTable instanceof DataTable)) {
            throw new Error("Cannot create DataColumnCollection without DataTable");
        }
        this._table = dataTable;
        this._columns = new Array();
    }
    DataColumnCollection.prototype.add = function (dataColumn) {
        if (this._columns.indexOf(dataColumn) < 0) {
            this._columns.push(dataColumn);
        }
        else {
            throw new Error("Column '" + dataColumn.name() + "' already exists in collection");
        }
        return this;
    };
    DataColumnCollection.prototype.get = function (col) {
        if (typeof col === 'string') {
            for (var _i = 0, _a = this._columns; _i < _a.length; _i++) {
                var dc = _a[_i];
                if (dc.name() === col) {
                    return dc;
                }
            }
        }
    };
    DataColumnCollection.prototype.remove = function (col) {
    };
    return DataColumnCollection;
}());
module.exports = DataColumnCollection;
//# sourceMappingURL=DataColumnCollection.js.map