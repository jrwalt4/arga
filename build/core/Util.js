// Util.ts
// Utilities used by arga.js
/// <reference path="../../typings/index.d.ts" />
"use strict";
var KeyedCollection_1 = require('./util/KeyedCollection');
exports.KeyedCollection = KeyedCollection_1.KeyedCollection;
var Functions_1 = require('./util/Functions');
exports.compareKeys = Functions_1.compareKeys;
exports.equalKeys = Functions_1.equalKeys;
exports.resolveKeyPath = Functions_1.resolveKeyPath;
exports.resolveKeyPathArray = Functions_1.resolveKeyPathArray;
exports.createValueWithKeyPath = Functions_1.createValueWithKeyPath;
exports.deepCopy = Functions_1.deepCopy;
exports.flattenPrototypeChain = Functions_1.flattenPrototypeChain;
exports.getValueAtKeyPath = Functions_1.getValueAtKeyPath;
exports.setValueAtKeyPath = Functions_1.setValueAtKeyPath;
exports.deserializeString = Functions_1.deserializeString;
