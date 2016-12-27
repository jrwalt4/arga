// DataTable.ts
"use strict";
var DataColumnCollection_1 = require("./DataColumnCollection");
var DataRowCollection_1 = require("./DataRowCollection");
var dt_counter = 1;
var DataTable = (function () {
    function DataTable(name) {
        if (name === void 0) { name = "Table " + (++dt_counter); }
        this.name = name;
        this._rowCollection = new DataRowCollection_1.DataRowCollection(this);
        this._columnCollection = new DataColumnCollection_1.DataColumnCollection(this);
    }
    DataTable.prototype.dataSet = function (dataSet) {
        if (dataSet === void 0) {
            return this._dataSet;
        }
        this._dataSet = dataSet;
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
    DataTable.prototype.primaryKey = function (dataColumn) {
        if (dataColumn === void 0) {
            return this._primaryKey;
        }
        if (Array.isArray(dataColumn)) {
            this._primaryKey = dataColumn;
        }
        else {
            this._primaryKey = [dataColumn];
        }
        return this;
    };
    DataTable.prototype.acceptChanges = function () {
        this.rows().toArray().forEach(function (dr) {
            dr.acceptChanges();
        });
    };
    DataTable.prototype.toString = function () {
        return this.name;
    };
    return DataTable;
}());
exports.DataTable = DataTable;
