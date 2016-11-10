// DataType.ts
"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var Util_1 = require('./Util');
var GenericDataType = (function () {
    function GenericDataType(typeOrOptions) {
        var options = typeOrOptions;
        if (options.serialize) {
            this.serialize = options.serialize;
        }
        if (options.deserialize) {
            this.deserialize = options.deserialize;
        }
    }
    GenericDataType.prototype.serialize = function (value) {
        return value.toString();
    };
    GenericDataType.prototype.deserialize = function (string) {
        return JSON.parse(string);
    };
    GenericDataType.getType = function (typeName) {
        switch (typeName) {
            case "string": return StringType;
            case "number": return NumberType;
            case "object": return ObjectType;
        }
    };
    return GenericDataType;
}());
exports.GenericDataType = GenericDataType;
// | "number" | "object"
var StringType = new GenericDataType({
    serialize: function (value) { return value.toString(); },
    deserialize: function (value) { return Util_1.deserializeString(value); }
});
var NumberType = new GenericDataType();
var ObjectType = new GenericDataType();
var DataType = (function (_super) {
    __extends(DataType, _super);
    function DataType() {
        _super.apply(this, arguments);
    }
    return DataType;
}(GenericDataType));
exports.DataType = DataType;
