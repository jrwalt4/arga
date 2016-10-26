// util/Functions.ts
"use strict";
function createContentCompare(sKeyPath) {
    return function compare(objA, objB) {
        var keyA = resolveKeyPath(sKeyPath, objA);
        var keyB = resolveKeyPath(sKeyPath, objB);
        return keyA < keyB ? -1 : (keyA > keyB ? 1 : 0);
    };
}
exports.createContentCompare = createContentCompare;
function createContentEquals(sKeyPath) {
    return function equals(objA, objB) {
        var keyA = resolveKeyPath(sKeyPath, objA);
        var keyB = resolveKeyPath(sKeyPath, objB);
        return keyA == keyB;
    };
}
exports.createContentEquals = createContentEquals;
function compareKeys(keyA, keyB) {
    if (typeof indexedDB !== "undefined") {
        return indexedDB.cmp(keyA, keyB);
    }
    else {
        return (keyA < keyB ? -1 : keyA > keyB ? 1 : 0);
    }
}
exports.compareKeys = compareKeys;
function getValueAtKeyPath(sKeyPath, item) {
    sKeyPath = sKeyPath || "";
    var path = sKeyPath.split('.');
    return resolveKeyPathArray(path, item);
}
exports.getValueAtKeyPath = getValueAtKeyPath;
function setValueAtKeyPath(sKeyPath, item, value) {
    var keyPathArray = sKeyPath.split('.');
    var lastKey = keyPathArray.pop();
    var penultimantValue = resolveKeyPathArray(keyPathArray, item);
    return !!(penultimantValue[lastKey] = value);
}
exports.setValueAtKeyPath = setValueAtKeyPath;
function createKeyPathGetter(sKeyPath) {
    return new Function("__item__", "return __item__." + sanitizeKeyPath(sKeyPath));
}
exports.createKeyPathGetter = createKeyPathGetter;
function createKeyPathSetter(sKeyPath) {
    return new Function("__item__", "__value__", "__item__." + sanitizeKeyPath(sKeyPath) + " = __value__ ");
}
exports.createKeyPathSetter = createKeyPathSetter;
function sanitizeKeyPath(sKeyPath) {
    return sKeyPath.split('.').map(function (value) { return value.trim(); }).join('.');
}
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
        var value;
        if (typeof prevResult[nextVal] === "function") {
            value = prevResult[nextVal]();
        }
        else {
            value = prevResult[nextVal];
        }
        return value;
    }, obj);
}
exports.resolveKeyPathArray = resolveKeyPathArray;
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
    return (typeof value === "object") ? flattenPrototypeChain(value) : value;
}
exports.deepCopy = deepCopy;
function flattenPrototypeChain(obj, depth, doNotCopy) {
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
                copyObj[key] = flattenPrototypeChain(value, depth - 1, doNotCopy);
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
exports.flattenPrototypeChain = flattenPrototypeChain;
function createUUID() {
    var uuid = '0';
    for (var i = 0; i < 12; i++) {
        uuid += '0';
    }
    return uuid;
}
exports.createUUID = createUUID;
//# sourceMappingURL=Functions.js.map