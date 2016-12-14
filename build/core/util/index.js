// Util.ts
// Utilities used by arga.js
"use strict";
var KeyedCollection_1 = require('./KeyedCollection');
exports.KeyedCollection = KeyedCollection_1.KeyedCollection;
var Functions_1 = require('./Functions');
exports.compareKeys = Functions_1.compareKeys;
exports.equalKeys = Functions_1.equalKeys;
exports.resolveKeyPath = Functions_1.resolveKeyPath;
exports.resolveKeyPathArray = Functions_1.resolveKeyPathArray;
exports.createValueWithKeyPath = Functions_1.createValueWithKeyPath;
exports.deepCopy = Functions_1.deepCopy;
exports.flattenPrototypeChain = Functions_1.flattenPrototypeChain;
exports.getValueAtKeyPath = Functions_1.getValueAtKeyPath;
exports.setValueAtKeyPath = Functions_1.setValueAtKeyPath;
exports.createKeyPathGetter = Functions_1.createKeyPathGetter;
exports.createKeyPathSetter = Functions_1.createKeyPathSetter;
exports.createUUID = Functions_1.createUUID;
exports.deserializeString = Functions_1.deserializeString;
