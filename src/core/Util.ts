// Util.ts
// Utilities used by arga.js

export { IKeyedCollection, KeyedCollection } from './util/KeyedCollection';

export {
	createContentCompare, createContentEquals, compareKeys,
	resolveKeyPath, resolveKeyPathArray, createValueWithKeyPath,
	deepCopy, flattenPrototypeChain, getValueAtKeyPath, setValueAtKeyPath
} from './util/Functions'
