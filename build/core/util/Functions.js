// util/Functions.ts
"use strict";
if (typeof indexedDB !== "undefined") {
    exports.compareKeys = indexedDB.cmp.bind(indexedDB);
}
else {
    exports.compareKeys = function (keyA, keyB) {
        if (Array.isArray(keyA) && Array.isArray(keyB)) {
            var cmp = 0;
            for (var i = 0; i < keyA.length; i++) {
                cmp = exports.compareKeys(keyA[i], keyB[i]);
                if (cmp !== 0) {
                    break;
                }
            }
            return cmp;
        }
        return (keyA < keyB ? -1 : keyA > keyB ? 1 : 0);
    };
}
function equalKeys(keyA, keyB) {
    var equals = true;
    if (Array.isArray(keyA) && Array.isArray(keyB)) {
        for (var i = 0; i < keyA.length; i++) {
            equals = equalKeys(keyA[i], keyB[i]);
            if (!equals) {
                break;
            }
        }
    }
    else {
        equals = keyA === keyB;
    }
    return equals;
}
exports.equalKeys = equalKeys;
function getValueAtKeyPath(sKeyPath, item) {
    sKeyPath = sanitizeKeyPath(sKeyPath);
    var keyPathArray = sKeyPath.split('.');
    return keyPathArray.reduce(function (prevResult, nextVal) {
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
    }, item);
}
exports.getValueAtKeyPath = getValueAtKeyPath;
function setValueAtKeyPath(sKeyPath, item, value, extendProto) {
    if (extendProto === void 0) { extendProto = false; }
    var keyPath = sanitizeKeyPath(sKeyPath);
    var keyPathArray = keyPath.split('.');
    var lastMemberName = keyPathArray.pop();
    var penultimentMember = keyPathArray.reduce(function (member, nextMemberName) {
        if (member[nextMemberName] === void 0) {
            member[nextMemberName] = {};
        }
        else {
            if (typeof member[nextMemberName] === "object") {
                if (!member.hasOwnProperty(nextMemberName)) {
                    member[nextMemberName] = Object.create(member[nextMemberName]);
                }
            }
        }
        return member[nextMemberName];
    }, item);
    return !!(penultimentMember[lastMemberName] = value);
}
exports.setValueAtKeyPath = setValueAtKeyPath;
function createKeyPathGetter(sKeyPath) {
    var keyPath = sanitizeKeyPath(sKeyPath);
    var keyPathArray = keyPath.split('.');
    return function getter(item) {
        return resolveKeyPathArray(keyPathArray, item);
    };
}
exports.createKeyPathGetter = createKeyPathGetter;
function createKeyPathSetter(sKeyPath, extendProto) {
    if (extendProto === void 0) { extendProto = false; }
    return function setter(item, value) {
        return setValueAtKeyPath(sKeyPath, item, value);
    };
}
exports.createKeyPathSetter = createKeyPathSetter;
function sanitizeKeyPath(sKeyPath) {
    if (sKeyPath === void 0) {
        sKeyPath = "";
    }
    var sanitizedArray = sKeyPath.split('.').map(function (value) { return value.trim(); });
    /*
    if(toArray){
        return sanitizedArray.join('.');
    }
    //*/
    return sanitizedArray.join('.');
}
function resolveKeyPath(sKeyPath, obj) {
    console.warn("util.resolveKeyPath() is deprecated: use util.getValueAtKeyPath()");
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
function deserializeString(value) {
    return JSON.parse(value);
}
exports.deserializeString = deserializeString;
function createUUID() {
    var uuid = '0';
    for (var i = 0; i < 12; i++) {
        uuid += '0';
    }
    return uuid;
}
exports.createUUID = createUUID;
