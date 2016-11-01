// util/KeyedCollection.ts

import { resolveKeyPath } from './Functions'

export interface IKeyedCollection<TKey, TValue> {
	size:number 
	has(key: TKey): boolean
	get(key: TKey): TValue
	//set(value: TValue): boolean
	add(value: TValue): boolean
	delete(key: TKey): boolean
	find(predicate:ContentCompare<TValue>): TValue
	keysArray(): TKey[]
	valuesArray(): TValue[]
	entriesArray(): [TKey, TValue][]
	toString(): string
}

export class KeyedCollection<TKey, TValue> implements IKeyedCollection<TKey, TValue> {
	private _data: TValue[]
	private _keyPath: string

	constructor(keyPath: string) {
		this._data = [];
		this._keyPath = keyPath;
	}

	has(key: TKey): boolean {
		return this.indexOf(key) > -1
	}

	get(key: TKey): TValue {
		var index = this.indexOf(key);
		if (index < 0) {
			return void 0;
		} else {
			return this._data[index];
		}
	}

	/*
	set(value: TValue): boolean {
		var added = false;
		var newKey = resolveKeyPath<TKey>(this._keyPath, value)
		var index = this.indexOf(newKey);
		if (index < 0) {
			added = true;
			this._data.push(value)
		} else {
			
		}
		return added;
	}
	//*/

	add(value: TValue): boolean {
		var added = false;
		var key = resolveKeyPath<TKey>(this._keyPath, value)
		var index = this.indexOf(key);
		if (index < 0) {
			added = true;
			this._data.push(value)
		} else {
			console.warn("value with key=" + key + " exists in collection. Replacing value")
			this._data.splice(index, 1, value);
			added = true;
		}
		return added;
	}

	delete(key: TKey): boolean {
		var deleted = false;
		var index = this.indexOf(key);
		if (index < 0) {
			throw new TypeError("key:" + key + "does not exist in set");
		} else {
			deleted = true;
			this._data.splice(index, 1);
		}
		return deleted;
	}

	private indexOf(key: TKey): number {
		var self = this;
		return findIndex(this._data, function (value: TValue): boolean {
			return resolveKeyPath(self._keyPath, value) === key;
		})
	}

	find(predicate:ContentCompare<TValue>): TValue {
		var index = findIndex(this._data, predicate);
		if (index > -1) {
			return this._data[index]
		}
		return void 0;
	}

	forEach(callback:(value:TValue, index:number, collection:TValue[])=>any) {
		return this._data.forEach(callback);
	}

	toArray():TValue[] {
		return this.valuesArray();
	}

	keysArray(): TKey[] {
		var self = this;
		return this._data.map(function (value: TValue) {
			return resolveKeyPath<TKey>(self._keyPath, value);
		});
	}

	valuesArray(): TValue[] {
		return this._data.slice();
	}

	entriesArray(): [TKey, TValue][] {
		var self = this;
		return this._data.map(function (value: TValue): [TKey, TValue] {
			return [resolveKeyPath<TKey>(this._keyPath, value), value];
		});
	}

	toString(): string {
		return this._data.map((value: TValue, index: number) => {
			var key = resolveKeyPath<TKey>(this._keyPath, value);
			return key + ":" + value;
		}).join(', ');
	}

	get size(): number {
		return this._data.length
	}

	set size(newValue) {
		this._data.length = newValue;
	}
}

export type ContentCompare<T> = (value: T, index: number, array: T[]) => boolean

function findIndex(array: any[], predicate: ContentCompare<any>): number {
	'use strict';
	if (array === null) {
		throw new TypeError('Array.prototype.findIndex called on null or undefined');
	}
	if (typeof predicate !== 'function') {
		throw new TypeError('predicate must be a function');
	}
	var list = Object(array);
	var length = list.length >>> 0;
	var thisArg = arguments[2];
	var value;

	for (var i = 0; i < length; i++) {
		value = list[i];
		if (predicate.call(thisArg, value, i, list)) {
			return i;
		}
	}
	return -1;
};