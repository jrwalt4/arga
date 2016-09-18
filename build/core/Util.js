// Util.ts
// Utilities used by arga.js
"use strict";
function createContentComparer(sKeyPath) {
    return function compare(objA, objB) {
        var keyA = resolveKeyPath(sKeyPath, objA);
        var keyB = resolveKeyPath(sKeyPath, objB);
        return keyA < keyB ? -1 : (keyA > keyB ? 1 : 0);
    };
}
exports.createContentComparer = createContentComparer;
function createContentEquator(sKeyPath) {
    return function equals(objA, objB) {
        var keyA = resolveKeyPath(sKeyPath, objA);
        var keyB = resolveKeyPath(sKeyPath, objB);
        return keyA == keyB;
    };
}
exports.createContentEquator = createContentEquator;
function getKeyWithKeyPath(sKeyPath, obj) {
    //sKeyPath
    var keyPathArray = sKeyPath.split('.');
}
exports.getKeyWithKeyPath = getKeyWithKeyPath;
function compareKeys(keyA, keyB) {
    if (indexedDB !== void 0) {
        return indexedDB.cmp(keyA, keyB);
    }
    else {
        return (keyA < keyB ? -1 : keyA > keyB ? 1 : 0);
    }
}
exports.compareKeys = compareKeys;
function resolveKeyPath(sKeyPath, obj) {
    sKeyPath = sKeyPath || "";
    var path = sKeyPath.split('.');
    return path.reduce(function (prevResult, nextVal) {
        if (prevResult === void 0) {
            return void 0;
        }
        return prevResult[nextVal];
    }, obj);
}
exports.resolveKeyPath = resolveKeyPath;
function createValueWithKeyPath(value, sKeyPath) {
    var keyPathArray = sKeyPath.split('.');
    return keyPathArray.reduceRight(function (prevValue, key, curIndex, array) {
        var wrappedValue = {};
        wrappedValue[key] = prevValue;
        return wrappedValue;
    }, value);
}
exports.createValueWithKeyPath = createValueWithKeyPath;
function resolveKeyPathArray(aKeypath) {
}
//# sourceMappingURL=Util.js.map