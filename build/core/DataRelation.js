// DataRelation.ts
"use strict";
var DataRelation = (function () {
    function DataRelation(_name, _parent, _child, _operator) {
        this._name = _name;
        this._parent = _parent;
        this._child = _child;
        this._operator = _operator;
    }
    DataRelation.prototype.parentColumn = function (column) {
        if (column === void 0) {
            return this._parent;
        }
        this._parent = column;
        return this;
    };
    DataRelation.prototype.childColumn = function (column) {
        if (column !== undefined) {
            this._child = column;
            return this;
        }
        return this._child;
    };
    return DataRelation;
}());
exports.DataRelation = DataRelation;
