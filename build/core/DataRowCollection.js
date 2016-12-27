// DataRowCollection.ts
"use strict";
var SortedArray = require("collections/sorted-array");
var util = require("./Util");
var DataRow_1 = require("./DataRow");
var DataRowCollection = (function () {
    function DataRowCollection(dataTable) {
        if (dataTable === void 0) {
            throw new Error("Illegal DataRowCollection constructor: expected DataTable as first argument");
        }
        this._table = dataTable;
        var drc = this;
        this._rows = new SortedArray([], function (key, row) {
            var primaryKey = drc.table().primaryKey();
            return primaryKey.every(function (column, index) {
                return key === row.get(column);
            });
        }, function (key, row) {
            var keyColumns = drc.table().primaryKey();
            return util.compareKeys(key, row.get(keyColumns));
        });
    }
    Object.defineProperty(DataRowCollection.prototype, "size", {
        //*
        get: function () {
            return this._rows.length;
        },
        enumerable: true,
        configurable: true
    });
    DataRowCollection.prototype.has = function (key) {
        return this._rows.has(key); // TODO
    };
    DataRowCollection.prototype.get = function (key) {
        return this._rows.get(key);
    };
    DataRowCollection.prototype.add = function (rowOrData) {
        var row;
        if (!(rowOrData instanceof DataRow_1.DataRow)) {
            row = new DataRow_1.DataRow(rowOrData);
        }
        if (this._rows.add(row)) {
            row.table(this.table());
            return true;
        }
        return false;
    };
    DataRowCollection.prototype.delete = function (keyOrRow) {
        var dataRow;
        if (keyOrRow instanceof DataRow_1.DataRow) {
            dataRow = keyOrRow;
        }
        else {
            dataRow = this.get(keyOrRow);
        }
        return this._rows.delete(dataRow);
    };
    DataRowCollection.prototype.clear = function () {
        this._rows.clear();
    };
    DataRowCollection.prototype.find = function (predicate) {
        throw new Error("DataRowCollection#find not implemented yet");
    };
    DataRowCollection.prototype.forEach = function (callback, thisArg) {
        //
    };
    DataRowCollection.prototype.entriesArray = function () {
        var self = this;
        return this._rows.map(function (row) {
            return [row.get(self.table().primaryKey()), row];
        });
    };
    DataRowCollection.prototype.valuesArray = function () {
        return this.toArray();
    };
    DataRowCollection.prototype.keysArray = function () {
        var self = this;
        return this._rows.map(function (row) {
            return row.get(self.table().primaryKey());
        });
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
