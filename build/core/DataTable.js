// DataTable.ts
"use strict";
var DataColumnCollection = require('./DataColumnCollection');
var DataRowCollection = require('./DataRowCollection');
var DataTable = (function () {
    //private _keyComparer: (keyA: string, keyB: string) => number;
    function DataTable(sName, sKeyPath) {
        this._name = sName;
        sKeyPath = sKeyPath || '_id';
        this._rows = new DataRowCollection(this, sKeyPath);
        this._columns = new DataColumnCollection(this);
        this._keyPath = sKeyPath;
        //this._keyComparer = createContentCompare(sKeyPath);
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
    DataTable.prototype.primaryKey = function () {
        return this.keyPath();
    };
    DataTable.prototype.keyPath = function () {
        return this._keyPath;
    };
    DataTable.prototype.acceptChanges = function () {
        this.rows().toArray().forEach(function (dr) {
            dr.acceptChanges();
        });
    };
    return DataTable;
}());
module.exports = DataTable;
//# sourceMappingURL=DataTable.js.map