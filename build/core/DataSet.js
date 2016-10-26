// DataSet.ts
"use strict";
var DataTable_1 = require('./DataTable');
var util_1 = require('./util');
var ds_counter = 0;
var dt_counter = 0;
var DataSet = (function () {
    function DataSet(sName) {
        this._tables = new Array();
        this._relations = new util_1.KeyedCollection('name');
        ++ds_counter;
        this._name = sName || "Set " + ds_counter;
    }
    DataSet.prototype.tables = function () {
        return this._tables.slice();
    };
    DataSet.prototype.newTable = function (sName) {
        ++dt_counter;
        sName = sName || "Table " + dt_counter;
        return new DataTable_1.DataTable(sName);
    };
    DataSet.prototype.addTable = function (oTable) {
        var tbl;
        if (typeof oTable === 'string') {
            tbl = this.newTable(oTable);
        }
        else {
            if (oTable instanceof DataTable_1.DataTable) {
                tbl = oTable;
            }
            else {
                throw new TypeError("Cannot add table: " + oTable);
            }
        }
        this._tables.push(tbl);
    };
    ;
    DataSet.prototype.acceptChanges = function () {
        this._tables.forEach(function (table) {
            table.acceptChanges();
        });
    };
    ;
    DataSet.prototype.getChanges = function () {
    };
    ;
    DataSet.prototype.name = function (newValue) {
        if (newValue != undefined) {
            this._name = newValue;
        }
        return this._name;
    };
    ;
    return DataSet;
}());
exports.DataSet = DataSet;
//# sourceMappingURL=DataSet.js.map