// DataRelation.ts
"use strict";
var DataRow = require('./DataRow');
var DataRelation = (function () {
    function DataRelation(_parent, _child, _operator) {
        this._parent = _parent;
        this._child = _child;
        this._operator = _operator;
    }
    DataRelation.prototype.getChildRows = function (oRow) {
        return [new DataRow];
    };
    DataRelation.prototype.getParentRow = function (oRow) {
        return new DataRow;
    };
    return DataRelation;
}());
module.exports = DataRelation;
