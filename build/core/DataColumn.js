// DataColumn.ts
"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var util = require('./Util');
var DataType_1 = require('./DataType');
var GenericDataColumn = (function () {
    function GenericDataColumn(name, constructorOptions) {
        if (constructorOptions === void 0) { constructorOptions = { keyPath: name }; }
        if (constructorOptions.isIndex) {
            console.warn("use IndexedDataColumn for index");
        }
        this._name = name;
        if (constructorOptions.keyPath) {
            this._keyPath = constructorOptions.keyPath;
        }
        else {
            if (typeof constructorOptions.get === 'function' && typeof constructorOptions.set === 'function') {
                this.getValue = constructorOptions.get;
                this.setValue = constructorOptions.set;
            }
            else {
                throw new Error("Insufficient parameters supplied for new DataRow(name, ctorOptions)");
            }
        }
        var dataType;
        switch (typeof constructorOptions.type) {
            case "string":
                var typeName = constructorOptions.type;
                dataType = DataType_1.DataType.getType(typeName);
                break;
            case "object":
                dataType = constructorOptions.type;
                break;
            default:
                dataType = DataType_1.DataType.getType("object");
        }
        this._type = dataType;
    }
    GenericDataColumn.prototype.getValue = function (data) {
        return util.getValueAtKeyPath(this.keyPath(), data);
    };
    GenericDataColumn.prototype.setValue = function (data, value) {
        return util.setValueAtKeyPath(this.keyPath(), data, value);
    };
    GenericDataColumn.prototype.table = function (dataTable) {
        if (dataTable === void 0) {
            return this._table;
        }
        this._table = dataTable;
        return this;
    };
    GenericDataColumn.prototype.name = function (sName) {
        if (sName !== undefined) {
            this._name = sName;
            return this;
        }
        return this._name;
    };
    GenericDataColumn.prototype.keyPath = function () {
        return this._keyPath;
    };
    Object.defineProperty(GenericDataColumn.prototype, "type", {
        get: function () {
            return this._type;
        },
        enumerable: true,
        configurable: true
    });
    GenericDataColumn.prototype.find = function (value) {
        var self = this;
        return this.table().rows().toArray().find(function (row) {
            return util.equalKeys(value, self.getValue(row));
        });
    };
    GenericDataColumn.prototype.findAll = function (value) {
        throw new Error("not implemented");
    };
    return GenericDataColumn;
}());
exports.GenericDataColumn = GenericDataColumn;
var DataColumn = (function (_super) {
    __extends(DataColumn, _super);
    function DataColumn() {
        _super.apply(this, arguments);
    }
    return DataColumn;
}(GenericDataColumn));
exports.DataColumn = DataColumn;
