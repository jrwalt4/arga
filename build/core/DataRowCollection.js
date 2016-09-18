// DataRowCollection.ts
"use strict";
//import {Collection} from './Util.Collection'
var SortedArray = require('collections/sorted-array');
var DataRowCollection = (function () {
    function DataRowCollection() {
        this._rows = new SortedArray();
    }
    DataRowCollection.prototype.add = function () {
        var rows = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            rows[_i - 0] = arguments[_i];
        }
        this._rows.addEach(rows);
    };
    DataRowCollection.prototype.toArray = function () {
        return this._rows.toArray();
    };
    return DataRowCollection;
}());
module.exports = DataRowCollection;
//# sourceMappingURL=DataRowCollection.js.map