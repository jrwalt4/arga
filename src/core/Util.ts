// Util.ts
// Utilities used by arga.js

// only used for type information
import DataRow = require('./DataRow');

export import KeyedCollection = require('./util/KeyedCollection');

export function createContentComparer<K, V>(sKeyPath: string): ContentCompare<K, V> {

	return function compare(objA: K, objB: V): number {
		var keyA = resolveKeyPath(sKeyPath, objA)
		var keyB = resolveKeyPath(sKeyPath, objB)
		return keyA < keyB ? -1 : (keyA > keyB ? 1 : 0);
	}
}

export function createContentEquator<K, V>(sKeyPath: string): ContentEquals<K, V> {
	return function equals(objA: K, objB: V): boolean {
		var keyA = resolveKeyPath(sKeyPath, objA)
		var keyB = resolveKeyPath(sKeyPath, objB)
		return keyA == keyB;
	}
}

export function compareKeys<T>(keyA: T, keyB: T) {
	if (typeof indexedDB !== "undefined") {
		return indexedDB.cmp(keyA, keyB);
	} else {
		return (keyA < keyB ? -1 : keyA > keyB ? 1 : 0);
	}
}

export function resolveKeyPath<T>(sKeyPath: string, obj: any): T {
	sKeyPath = sKeyPath || "";
	var path = sKeyPath.split('.');
	return resolveKeyPathArray<T>(path, obj);
}

export function resolveKeyPathArray<T>(aKeyPathArray: string[], obj: any): T {
	return aKeyPathArray.reduce(function (prevResult: any, nextVal: string) {
		if (prevResult === void 0) {
			return void 0;
		}
		return prevResult[nextVal];
	}, obj)
}

export function resolveKeyPathFromDataRow<T>(sKeyPath: string, row: DataRow) {
	sKeyPath = sKeyPath || "";
	var path = sKeyPath.split('.');
	var firstMemberKey = path.shift();
	var firstMember = row.get<T>(firstMemberKey);
	return resolveKeyPathArray<T>(path, firstMember);
}

export function createValueWithKeyPath(value: any, sKeyPath: string) {
	var keyPathArray = sKeyPath.split('.');
	return keyPathArray.reduceRight(function (prevValue: any, key: string, curIndex: number, array: string[]) {
		var wrappedValue = {};
		wrappedValue[key] = prevValue;
		return wrappedValue;
	}, value)
}

export function deepCopy(value: any): typeof value {
	return (typeof value === "object") ? flattenPrototype(value) : value
}

export function flattenPrototype(obj: Object, depth?: number, doNotCopy?: Object[]): Object {
	//
	if (obj === null) {
		return null;
	}
	var copyObj = Array.isArray(obj) ? [] : Object.create(null);
	doNotCopy = Array.isArray(doNotCopy) ? doNotCopy : new Array<Object>();
	depth = depth || 10;
	if (doNotCopy.indexOf(obj) < 0) {
		doNotCopy.push(obj);
	}
	for (var key in obj) {
		var value: any = obj[key];
		if (typeof value === "object") {
			if (doNotCopy.indexOf(value) < 0) {
				copyObj[key] = flattenPrototype(value, depth - 1, doNotCopy);
			} else {
				console.warn("circular reference in obj:"+obj)
			}
		} else {
			copyObj[key] = value;
		}
	}
	return copyObj;
}
