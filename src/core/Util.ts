// Util.ts
// Utilities used by arga.js
/// <reference path="../../typings/index.d.ts" />

export { IKeyedCollection, KeyedCollection } from './util/KeyedCollection';

export {
	createContentCompare, createContentEquals, compareKeys,
	resolveKeyPath, resolveKeyPathArray, createValueWithKeyPath,
	deepCopy, flattenPrototypeChain, getValueAtKeyPath, setValueAtKeyPath
} from './util/Functions'

