// DataRelationCollection.ts
"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var FastSet = require("collections/fast-set");
var DataRelationCollection = (function (_super) {
    __extends(DataRelationCollection, _super);
    function DataRelationCollection(dataSet) {
        var _this;
        if (dataSet === void 0) {
            throw new Error("Illegal DataRealtionCollection constructor: expected DataTable as first argument");
        }
        _this = _super.call(this) || this;
        _this._dataSet = dataSet;
        return _this;
    }
    DataRelationCollection.prototype.dataSet = function () {
        return this._dataSet;
    };
    DataRelationCollection.prototype.add = function (relation) {
        if (_super.prototype.add.call(this, relation)) {
            relation.dataSet(this._dataSet);
            return true;
        }
        return false;
    };
    return DataRelationCollection;
}(FastSet));
exports.DataRelationCollection = DataRelationCollection;
