// DataColumnCollection.ts
"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var Util_1 = require('./Util');
var DataColumnCollection = (function (_super) {
    __extends(DataColumnCollection, _super);
    //private _columns: DataColumn<any>[];
    function DataColumnCollection(dataTable) {
        _super.call(this, 'name');
        if (dataTable === void 0) {
            throw new Error("Illegal DataColumnCollection constructor: expected DataTable as first argument");
        }
        this._table = dataTable;
        //this._columns = new Array<DataColumn<any>>();
    }
    DataColumnCollection.prototype.add = function (dataColumn) {
        var added = _super.prototype.add.call(this, dataColumn);
        if (added) {
            dataColumn.table(this._table);
        }
        return added;
    };
    return DataColumnCollection;
}(Util_1.KeyedCollection));
exports.DataColumnCollection = DataColumnCollection;
//# sourceMappingURL=DataColumnCollection.js.map