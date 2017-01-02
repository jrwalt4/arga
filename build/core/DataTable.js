// DataTable.ts
"use strict";
var DataColumnCollection_1 = require("./DataColumnCollection");
var DataRowCollection_1 = require("./DataRowCollection");
var EventEmitter2_1 = require("EventEmitter2");
var dt_counter = 0;
var DataTable = (function () {
    function DataTable(name) {
        this.name = name;
        this._rowCollection = new DataRowCollection_1.DataRowCollection(this);
        this._columnCollection = new DataColumnCollection_1.DataColumnCollection(this);
        dt_counter++;
        this.name = name || "Table " + dt_counter;
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
    DataTable.prototype.emit = function (event) {
        this._emitter.emit(event.type, event);
    };
    DataTable.prototype.on = function (event, listener) {
        (this._emitter || (this._emitter = new EventEmitter2_1.EventEmitter2())).on(event, listener);
    };
    DataTable.prototype.off = function (event, listener) {
        (this._emitter || (this._emitter = new EventEmitter2_1.EventEmitter2())).off(event, listener);
    };
    return DataTable;
}());
exports.DataTable = DataTable;
