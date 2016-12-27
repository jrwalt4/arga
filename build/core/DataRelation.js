// DataRelation.ts
"use strict";
var DataRelation = (function () {
    function DataRelation(name, _parent, _child, _operator) {
        this.name = name;
        this._parent = _parent;
        this._child = _child;
        this._operator = _operator;
    }
    DataRelation.prototype.dataSet = function (dataSet) {
        if (dataSet !== void 0) {
            this._dataSet = dataSet;
            return this;
        }
        return this._dataSet;
    };
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
    DataRelation.prototype.getChildRows = function (oRow) {
        var parentColumn = this.parentColumn();
        var childColumn = this.childColumn();
        if (parentColumn.table() !== oRow.table()) {
            throw new Error("Parent Row must belong to table: " + parentColumn.table());
        }
        return childColumn.findAll(oRow.get(parentColumn));
    };
    DataRelation.prototype.getParentRow = function (oRow) {
        var parentColumn = this.parentColumn();
        var childColumn = this.childColumn();
        if (childColumn.table() !== oRow.table()) {
            throw new Error("Child Row must belong to table : " + childColumn.table());
        }
        return parentColumn.find(oRow.get(childColumn));
    };
    return DataRelation;
}());
exports.DataRelation = DataRelation;
