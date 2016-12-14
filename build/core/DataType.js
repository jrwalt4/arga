// DataType.ts
"use strict";
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
            case "any":
            default:
                return new GenericDataType();
        }
    };
    return GenericDataType;
}());
exports.GenericDataType = GenericDataType;
var StringType = new GenericDataType({
    serialize: function (value) { return value.toString(); },
    deserialize: function (value) { return Util_1.deserializeString(value); }
});
var NumberType = new GenericDataType();
var ObjectType = new GenericDataType();
exports.DataType = GenericDataType;
