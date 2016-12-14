// DataColumn.ts
"use strict";
var util = require('./Util');
var DataType_1 = require('./DataType');
var GenericDataColumn = (function () {
    function GenericDataColumn(name, constructorOptions) {
        if (constructorOptions === void 0) { constructorOptions = { keyPath: name }; }
        this._name = name;
        if (constructorOptions.keyPath) {
            this._keyPath = constructorOptions.keyPath;
            this.getValue = util.createKeyPathGetter(this._keyPath);
            this.setValue = util.createKeyPathSetter(this._keyPath);
        }
        else {
            var get = constructorOptions.get, set = constructorOptions.set;
            get = typeof get === 'function' ? get : function () { return void 0; };
            set = typeof set === 'function' ? set : function () { return void 0; };
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
                dataType = DataType_1.DataType.getType("any");
        }
        this._type = dataType;
        /**
         * @todo - What to do with constructorOptions.default
         */
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
exports.DataColumn = GenericDataColumn;
