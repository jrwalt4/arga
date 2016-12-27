// DataColumnCollection.ts
"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var DataColumn_1 = require("./DataColumn");
var Util_1 = require("./Util");
var DataColumnCollection = (function (_super) {
    __extends(DataColumnCollection, _super);
    //private _columns: DataColumn<any>[];
    function DataColumnCollection(dataTable) {
        var _this = _super.call(this, 'name') || this;
        if (dataTable === void 0) {
            throw new Error("Illegal DataColumnCollection constructor: expected DataTable as first argument");
        }
        _this._table = dataTable;
        return _this;
        //this._columns = new Array<DataColumn<any>>();
    }
    DataColumnCollection.prototype.add = function (dataColumn) {
        var added = _super.prototype.add.call(this, dataColumn);
        if (added) {
            dataColumn.table(this._table);
        }
        return added;
    };
    DataColumnCollection.prototype.get = function (columnName) {
        var column;
        if (!(column = _super.prototype.get.call(this, columnName))) {
            column = new DataColumn_1.DataColumn(columnName);
            this.add(column);
        }
        return column;
    };
    DataColumnCollection.prototype.table = function () {
        return this._table;
    };
    return DataColumnCollection;
}(Util_1.KeyedCollection));
exports.DataColumnCollection = DataColumnCollection;
