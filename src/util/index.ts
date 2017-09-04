// Util.ts
// Utilities used by arga.js

export { IKeyedCollection } from './IKeyedCollection'
//export { KeyedCollection } from './KeyedCollection'
export { KeyedDictionary } from './KeyedDictionary'

export { EmptyObject } from './EmptyObject'

export { Dictionary } from './Dictionary'

export { EventEmitter } from './EventEmitter'

export {
	compareKeys, equalKeys, resolveKeyPath, resolveKeyPathArray, createValueWithKeyPath,
	deepCopy, flattenPrototypeChain, getValueAtKeyPath, setValueAtKeyPath,
	createKeyPathGetter, createKeyPathSetter, createUUID, deserializeString
} from './Functions'

