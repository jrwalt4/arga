// DataSet.ts
"use strict";
var DataTable = require('./DataTable');
var ds_counter = 0;
var DataSet = (function () {
    function DataSet(name) {
        if (name === void 0) { name = "Set" + ds_counter++; }
        this._name = name;
        this._tables = [];
        this._relations = [];
    }
    DataSet.prototype.tables = function () {
        return this._tables.slice();
    };
    DataSet.prototype.addTable = function (oTable) {
        var tbl;
        if (typeof oTable === 'string') {
            tbl = new DataTable(oTable);
        }
        else {
            tbl = oTable;
        }
        if (tbl.name() === undefined) {
            tbl.name("Table" + this._tables.length);
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
module.exports = DataSet;
//# sourceMappingURL=DataSet.js.map