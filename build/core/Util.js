// Util.ts
// Utilities used by arga.js
"use strict";
exports.KeyedCollection = require('./util/KeyedCollection');
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
function compareKeys(keyA, keyB) {
    if (typeof indexedDB !== "undefined") {
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
    return resolveKeyPathArray(path, obj);
}
exports.resolveKeyPath = resolveKeyPath;
function resolveKeyPathArray(aKeyPathArray, obj) {
    return aKeyPathArray.reduce(function (prevResult, nextVal) {
        if (prevResult === void 0) {
            return void 0;
        }
        return prevResult[nextVal];
    }, obj);
}
exports.resolveKeyPathArray = resolveKeyPathArray;
function resolveKeyPathFromDataRow(sKeyPath, row) {
    sKeyPath = sKeyPath || "";
    var path = sKeyPath.split('.');
    var firstMemberKey = path.shift();
    var firstMember = row.get(firstMemberKey);
    return resolveKeyPathArray(path, firstMember);
}
exports.resolveKeyPathFromDataRow = resolveKeyPathFromDataRow;
function createValueWithKeyPath(value, sKeyPath) {
    var keyPathArray = sKeyPath.split('.');
    return keyPathArray.reduceRight(function (prevValue, key, curIndex, array) {
        var wrappedValue = {};
        wrappedValue[key] = prevValue;
        return wrappedValue;
    }, value);
}
exports.createValueWithKeyPath = createValueWithKeyPath;
function deepCopy(value) {
    return (typeof value === "object") ? flattenPrototype(value) : value;
}
exports.deepCopy = deepCopy;
function flattenPrototype(obj, depth, doNotCopy) {
    //
    if (obj === null) {
        return null;
    }
    var copyObj = Array.isArray(obj) ? [] : Object.create(null);
    doNotCopy = Array.isArray(doNotCopy) ? doNotCopy : new Array();
    depth = depth || 10;
    if (doNotCopy.indexOf(obj) < 0) {
        doNotCopy.push(obj);
    }
    for (var key in obj) {
        var value = obj[key];
        if (typeof value === "object") {
            if (doNotCopy.indexOf(value) < 0) {
                copyObj[key] = flattenPrototype(value, depth - 1, doNotCopy);
            }
            else {
                console.warn("circular reference in obj:" + obj);
            }
        }
        else {
            copyObj[key] = value;
        }
    }
    return copyObj;
}
exports.flattenPrototype = flattenPrototype;
//# sourceMappingURL=Util.js.map