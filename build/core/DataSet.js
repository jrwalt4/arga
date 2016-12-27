// DataSet.ts
"use strict";
var DataTableCollection_1 = require("./DataTableCollection");
var DataRelationCollection_1 = require("./DataRelationCollection");
var ds_counter = 1;
var DataSet = (function () {
    function DataSet(name) {
        if (name === void 0) { name = "Set " + (++ds_counter); }
        this.name = name;
        this._tables = new DataTableCollection_1.DataTableCollection(this);
        this._relations = new DataRelationCollection_1.DataRelationCollection(this);
    }
    DataSet.prototype.tables = function (name) {
        if (name === void 0) {
            return this._tables;
        }
        return this._tables.get(name);
    };
    DataSet.prototype.relations = function (name) {
        if (name === void 0) {
            return this._relations;
        }
        return this._relations.get(name);
    };
    DataSet.prototype.acceptChanges = function () {
        this._tables.forEach(function (table) {
            table.acceptChanges();
        });
    };
    ;
    DataSet.prototype.getChanges = function () {
    };
    ;
    return DataSet;
}());
exports.DataSet = DataSet;
