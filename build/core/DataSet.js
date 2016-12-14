// DataSet.ts
"use strict";
var DataTable_1 = require('./DataTable');
var DataTableCollection_1 = require('./DataTableCollection');
var DataRelationCollection_1 = require('./DataRelationCollection');
var ds_counter = 0;
var dt_counter = 0;
var DataSet = (function () {
    function DataSet(sName) {
        this._tables = new DataTableCollection_1.DataTableCollection(this);
        this._relations = new DataRelationCollection_1.DataRelationCollection(this);
        ++ds_counter;
        this._name = sName || "Set " + ds_counter;
    }
    DataSet.prototype.name = function (newName) {
        if (newName === void 0) {
            return this._name;
        }
        this._name = newName;
        return this;
    };
    ;
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
    DataSet.prototype.newTable = function (sName) {
        ++dt_counter;
        sName = sName || "Table " + dt_counter;
        return new DataTable_1.DataTable(sName);
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
