// DataTableCollection.ts
"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var Util_1 = require('./Util');
var DataTableCollection = (function (_super) {
    __extends(DataTableCollection, _super);
    function DataTableCollection(dataSet) {
        if (dataSet === void 0) {
            throw new Error("Illegal DataTableCollection constructor: expected DataSet as first argument");
        }
        _super.call(this, 'name');
        this._set = dataSet;
    }
    DataTableCollection.prototype.add = function (table) {
        var added = _super.prototype.add.call(this, table);
        if (added) {
            table.dataSet(this._set);
        }
        return added;
    };
    return DataTableCollection;
}(Util_1.KeyedCollection));
exports.DataTableCollection = DataTableCollection;
