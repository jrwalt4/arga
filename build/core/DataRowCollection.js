// DataRowCollection.ts
"use strict";
var SortedArray = require('collections/sorted-array');
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
                return primaryKey[index] === row.get(column);
            });
        }, function (key, row) {
            var keyColumn = drc.table().primaryKey();
            return 1;
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
    /*
    set(key:any):boolean {
        throw new Error("DataRowCollection#set does not exist")
    }
    //*/
    DataRowCollection.prototype.add = function (row) {
        if (this._rows.add(row)) {
            row.table(this.table());
            return true;
        }
        return false;
    };
    DataRowCollection.prototype.delete = function (key) {
        return this._rows.delete(key);
    };
    DataRowCollection.prototype.clear = function () {
        this._rows.clear();
    };
    DataRowCollection.prototype.find = function (value) {
        return this.get(value);
    };
    DataRowCollection.prototype.entriesArray = function () {
        var self = this;
        return this._rows.map(function (row) {
            return [row.get(self.table().primaryKey()), row];
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
//# sourceMappingURL=DataRowCollection.js.map