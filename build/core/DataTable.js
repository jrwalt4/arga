// DataTable.ts
"use strict";
var DataColumnCollection_1 = require('./DataColumnCollection');
var DataRowCollection_1 = require('./DataRowCollection');
var DataTable = (function () {
    function DataTable(sName) {
        this._name = sName || "Table";
        this._rowCollection = new DataRowCollection_1.DataRowCollection(this);
        this._columnCollection = new DataColumnCollection_1.DataColumnCollection(this);
    }
    DataTable.prototype.name = function (sName) {
        if (sName !== undefined) {
            this._name = sName;
            return this;
        }
        return this._name;
    };
    DataTable.prototype.rows = function (key) {
        if (key === void 0) {
            return this._rowCollection;
        }
        return this._rowCollection.get(key);
    };
    DataTable.prototype.columns = function (columnName) {
        if (columnName === void 0) {
            return this._columnCollection;
        }
        return this._columnCollection.get(columnName);
    };
    DataTable.prototype.primaryKey = function () {
        throw new Error("not yet implemented");
        /*
        return this.columns().find(function (column, index, array){
            return !column;
        })
        */
    };
    DataTable.prototype.acceptChanges = function () {
        this.rows().toArray().forEach(function (dr) {
            dr.acceptChanges();
        });
    };
    return DataTable;
}());
exports.DataTable = DataTable;
//# sourceMappingURL=DataTable.js.map