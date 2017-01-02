// DataColumn.ts
"use strict";
var util = require("./Util");
var DataType_1 = require("./DataType");
var _ = require("lodash");
var GenericDataColumn = (function () {
    /** TODO */
    // private _constraints: DataColumnConstraint[]
    function GenericDataColumn(name, keyPath, type) {
        if (keyPath === void 0) { keyPath = name; }
        if (type === void 0) { type = DataType_1.DataType.AnyType; }
        this.name = name;
        this.keyPath = keyPath;
        this.type = type;
    }
    GenericDataColumn.prototype.getValue = function (data) {
        return _.get(data, this.keyPath);
    };
    GenericDataColumn.prototype.setValue = function (data, value) {
        _.set(data, this.keyPath, value);
        return true;
    };
    GenericDataColumn.prototype.table = function (dataTable) {
        if (dataTable === void 0) {
            return this._table;
        }
        this._table = dataTable;
        return this;
    };
    GenericDataColumn.prototype.find = function (value) {
        var self = this;
        return this.table().rows().find(function (row) {
            return util.equalKeys(value, row.get(self));
        });
    };
    GenericDataColumn.prototype.findAll = function (value) {
        var foundRows = [];
        var self = this;
        this.table().rows().forEach(function (row) {
            if (util.equalKeys(value, row.get(self))) {
                foundRows.push(row);
            }
        });
        return foundRows;
    };
    GenericDataColumn.prototype._addToCollection = function (collection) {
        this.table(collection.table());
    };
    return GenericDataColumn;
}());
exports.GenericDataColumn = GenericDataColumn;
exports.DataColumn = GenericDataColumn;
