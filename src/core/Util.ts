// Util.ts
// Utilities used by arga.js
/// <reference path="../../typings/index.d.ts" />

export { IKeyedCollection, KeyedCollection } from './util/KeyedCollection';

export {
	compareKeys, equalKeys, resolveKeyPath, resolveKeyPathArray, createValueWithKeyPath,
	deepCopy, flattenPrototypeChain, getValueAtKeyPath, setValueAtKeyPath
} from './util/Functions'

