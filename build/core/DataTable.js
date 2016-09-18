// DataTable.ts
"use strict";
var DataRowCollection = require('./DataRowCollection');
//import IDataSchema = require('./IDataSchema')
var Util_1 = require('./Util');
var dt_counter = 0;
var DataTable = (function () {
    function DataTable(sName, sKeyPath) {
        this._name = sName || "Table" + dt_counter++;
        this._rows = new DataRowCollection();
        this._columns = [];
        this._keyPath = sKeyPath;
        this._keyComparer = Util_1.createContentComparer(sKeyPath);
    }
    DataTable.prototype.name = function (sName) {
        if (sName !== undefined) {
            this._name = sName;
            return this;
        }
        return this._name;
    };
    DataTable.prototype.rows = function () {
        return this._rows;
    };
    DataTable.prototype.addRow = function (oRow) {
        this._rows.add(oRow);
        oRow.table(this);
        return this;
    };
    DataTable.prototype.columns = function () {
        return this._columns;
    };
    DataTable.prototype.keyPath = function () {
        return this._keyPath;
    };
    DataTable.prototype.acceptChanges = function () {
        this._rows.toArray().forEach(function (dr) {
            dr.acceptChanges();
        });
    };
    return DataTable;
}());
console.log('loaded DataTable');
module.exports = DataTable;
//# sourceMappingURL=DataTable.js.map