// IndexedDataColumn.ts
"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var DataColumn_1 = require('./DataColumn');
var SortedMap = require('collections/sorted-map');
var IndexedDataColumn = (function (_super) {
    __extends(IndexedDataColumn, _super);
    function IndexedDataColumn() {
        _super.apply(this, arguments);
        this._index = new SortedMap();
    }
    IndexedDataColumn.prototype.find = function (value) {
        return this.table().rows(this._index.get(value).key);
    };
    return IndexedDataColumn;
}(DataColumn_1.DataColumn));
exports.IndexedDataColumn = IndexedDataColumn;
