// util/Functions.ts

// used for type information only
import DataRow = require('../DataRow')
import {ContentCompare, ContentEquals} from 'collections/types'

export function createContentCompare<K, V>(sKeyPath: string): ContentCompare<K, V> {

	return function compare(objA: K, objB: V): number {
		var keyA = resolveKeyPath(sKeyPath, objA)
		var keyB = resolveKeyPath(sKeyPath, objB)
		return keyA < keyB ? -1 : (keyA > keyB ? 1 : 0);
	}
}

export function createContentEquals<K, V>(sKeyPath: string): ContentEquals<K, V> {
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

export function getValueAtKeyPath<T>(sKeyPath: string, item: {}): T {
	sKeyPath = sKeyPath || "";
	var path = sKeyPath.split('.');
	return resolveKeyPathArray<T>(path, item);
}

export function setValueAtKeyPath(sKeyPath:string, item:{}, value:any):boolean {
	let keyPathArray = sKeyPath.split('.');
	let lastKey = keyPathArray.pop();
	let penultimantValue = resolveKeyPathArray<{}>(keyPathArray, item);
	return !!(penultimantValue[lastKey] = value);
}

export function createKeyPathGetter<T>(sKeyPath: string): (item: {}) => T {
	return <(item: {}) => T>new Function("__item__", "return __item__." + sanitizeKeyPath(sKeyPath))
}

export function createKeyPathSetter<T>(sKeyPath: string): (item: {}, value: T) => void {
	return <(item: {}, value: T) => void>new Function("__item__", "__value__",
		"__item__." + sanitizeKeyPath(sKeyPath) + " = __value__ ")
}

function sanitizeKeyPath(sKeyPath: string): string {
	return sKeyPath.split('.').map(value => value.trim()).join('.');
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
		var value: any;
		if (typeof prevResult[nextVal] === "function") {
			value = prevResult[nextVal]();
		} else {
			value = prevResult[nextVal];
		}
		return value;
	}, obj)
}

export function createValueWithKeyPath(value: any, sKeyPath: string): Object {
	var keyPathArray = sKeyPath.split('.');
	return keyPathArray.reduceRight(function (prevValue: any, key: string, curIndex: number, array: string[]) {
		var wrappedValue = {};
		wrappedValue[key] = prevValue;
		return wrappedValue;
	}, value)
}

export function deepCopy(value: any): typeof value {
	return (typeof value === "object") ? flattenPrototypeChain(value) : value
}

export function flattenPrototypeChain(obj: Object, depth?: number, doNotCopy?: Object[]): Object {
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
				copyObj[key] = flattenPrototypeChain(value, depth - 1, doNotCopy);
			} else {
				console.warn("circular reference in obj:" + obj)
			}
		} else {
			copyObj[key] = value;
		}
	}
	return copyObj;
}

export function createUUID(): string {
	var uuid = '0';
	for (var i = 0; i < 12; i++) {
		uuid += '0';
	}
	return uuid;
}