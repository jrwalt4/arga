// DataTable.ts
"use strict";
var DataColumnCollection = require('./DataColumnCollection');
var DataRowCollection = require('./DataRowCollection');
//import IDataSchema = require('./IDataSchema')
var Util_1 = require('./Util');
var DataTable = (function () {
    function DataTable(sName, sKeyPath) {
        this._name = sName;
        this._rows = new DataRowCollection(this);
        this._columns = new DataColumnCollection(this);
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
module.exports = DataTable;
//# sourceMappingURL=DataTable.js.map