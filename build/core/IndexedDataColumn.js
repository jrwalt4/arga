// IndexedDataColumn.ts
"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var DataColumn_1 = require('./DataColumn');
var SortedMap = require('collections/sorted-map');
var GenericIndexedDataColumn = (function (_super) {
    __extends(GenericIndexedDataColumn, _super);
    function GenericIndexedDataColumn() {
        _super.apply(this, arguments);
        this._index = new SortedMap();
    }
    GenericIndexedDataColumn.prototype.find = function (value) {
        return this.table().rows(this._index.get(value).key);
    };
    return GenericIndexedDataColumn;
}(DataColumn_1.GenericDataColumn));
exports.GenericIndexedDataColumn = GenericIndexedDataColumn;
exports.IndexedDataColumn = GenericIndexedDataColumn;
