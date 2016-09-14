// DataColumnCollection.ts
"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var Util_Collection_1 = require('./Util.Collection');
var arga;
(function (arga) {
    var DataColumnCollection = (function (_super) {
        __extends(DataColumnCollection, _super);
        function DataColumnCollection() {
            _super.apply(this, arguments);
        }
        return DataColumnCollection;
    }(Util_Collection_1.Collection));
    arga.DataColumnCollection = DataColumnCollection;
})(arga || (arga = {}));
