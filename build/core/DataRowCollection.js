// DataRowCollection.ts
"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
//import {Collection} from './Util.Collection'
var SortedArray = require('collections/sorted-array');
var DataRowCollection = (function (_super) {
    __extends(DataRowCollection, _super);
    function DataRowCollection() {
        _super.call(this, new Array());
    }
    return DataRowCollection;
}(SortedArray));
module.exports = DataRowCollection;
