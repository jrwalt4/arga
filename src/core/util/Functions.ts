// util/Functions.ts

// used for type information only
import DataRow = require('../DataRow')
import { ContentCompare, ContentEquals } from 'collections/types'

export let compareKeys: (a, b) => number;
if (typeof indexedDB !== "undefined") {
	compareKeys = indexedDB.cmp.bind(indexedDB);
} else {
	compareKeys = function (keyA: any, keyB: any): number {

		if (Array.isArray(keyA) && Array.isArray(keyB)) {
			var cmp = 0;
			for (var i = 0; i < keyA.length; i++) {
				cmp = compareKeys(keyA[i], keyB[i]);
				if (cmp !== 0) {
					break;
				}
			}
			return cmp;
		}
		return (keyA < keyB ? -1 : keyA > keyB ? 1 : 0);
	}
}

export function equalKeys(keyA: any, keyB: any): boolean {
	var equals = true;
	if(Array.isArray(keyA) && Array.isArray(keyB)) {
		for(var i = 0 ; i < keyA.length ; i++) {
			equals = equalKeys(keyA[i], keyB[i]);
			if(!equals) {
				break;
			}
		}
	} else {
		equals = keyA === keyB;
	}
	return equals;
}

export function getValueAtKeyPath<T>(sKeyPath: string, item: {}): T {
	sKeyPath = sanitizeKeyPath(sKeyPath);
	let keyPathArray = sKeyPath.split('.');
	return keyPathArray.reduce(function (prevResult: any, nextVal: string) {
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
	}, item)
}

export function setValueAtKeyPath(sKeyPath: string, item: {}, value: any, extendProto: boolean = false): boolean {
	let keyPath = sanitizeKeyPath(sKeyPath);
	let keyPathArray = keyPath.split('.');
	let lastMemberName = keyPathArray.pop();
	let penultimentMember = keyPathArray.reduce(function (member: {}, nextMemberName: string) {
		if (member[nextMemberName] === void 0) {
			member[nextMemberName] = {};
		} else {
			if (typeof member[nextMemberName] === "object") {
				if (!member.hasOwnProperty(nextMemberName)) {
					member[nextMemberName] = Object.create(member[nextMemberName]);
				}
			}
		}
		return member[nextMemberName];
	}, item)
	return !!(penultimentMember[lastMemberName] = value);
}

export function createKeyPathGetter<T>(sKeyPath: string): (item: {}) => T {
	let keyPath = sanitizeKeyPath(sKeyPath);
	let keyPathArray = keyPath.split('.');
	return function getter(item: {}): T {
		return resolveKeyPathArray<T>(keyPathArray, item);
	}
}

export function createKeyPathSetter<T>(sKeyPath: string, extendProto: boolean = false): (item: {}, value: T) => void {
	return function setter(item: {}, value: T): boolean {
		return setValueAtKeyPath(sKeyPath, item, value);
	}
}

function sanitizeKeyPath(sKeyPath: string): string
//function sanitizeKeyPath(sKeyPath: string, toArray:boolean): string[]
//function sanitizeKeyPath(sKeyPath:string, toArray?:boolean):string|string[] 
{
	if (sKeyPath === void 0) {
		sKeyPath = "";
	}
	var sanitizedArray = sKeyPath.split('.').map(value => value.trim());
	/*
	if(toArray){
		return sanitizedArray.join('.');
	}
	//*/
	return sanitizedArray.join('.');
}

export function resolveKeyPath<T>(sKeyPath: string, obj: any): T {
	console.warn("util.resolveKeyPath() is deprecated: use util.getValueAtKeyPath()");
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

/*
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
//*/