// DataType.ts
"use strict";
var Util_1 = require("./Util");
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
            case "string": return GenericDataType.StringType;
            case "number": return GenericDataType.NumberType;
            case "object": return GenericDataType.ObjectType;
            case "any":
            default:
                return new GenericDataType();
        }
    };
    return GenericDataType;
}());
GenericDataType.StringType = new GenericDataType({
    serialize: function (value) { return value.toString(); },
    deserialize: function (value) { return Util_1.deserializeString(value); }
});
GenericDataType.NumberType = new GenericDataType();
GenericDataType.ObjectType = new GenericDataType();
GenericDataType.AnyType = new GenericDataType();
exports.GenericDataType = GenericDataType;
exports.DataType = GenericDataType;
