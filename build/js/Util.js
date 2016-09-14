// Util.ts
// Utilities used by arga.js
"use strict";
function createKeyComparer(sKeyPath) {
    sKeyPath = sKeyPath || "";
    var path = sKeyPath.split('.');
    return function compare(key, compareValue) {
        var keyValue = path.reduce(function (prevResult, nextVal) {
            return prevResult[nextVal];
        }, key);
        return keyValue < compareValue ? -1 : (keyValue > compareValue ? 1 : 0);
    };
}
exports.createKeyComparer = createKeyComparer;
