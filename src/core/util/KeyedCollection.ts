// util/KeyedCollection.ts

import {resolveKeyPath} from './Functions'

export = KeyedCollection;

class KeyedCollection<TKey, TValue> {
	private _data: TValue[]
	private _keyPath: string

	constructor(keyPath: string) {
		this._data = [];
		this._keyPath = keyPath;
	}

	has(key: TKey): boolean {
		return this.indexOf(key) !== void 0
	}

	get(key: TKey): TValue {
		var index = this.indexOf(key);
		if (index < 0) {
			return void 0;
		} else {
			return this._data[index];
		}
	}

	set(value: TValue): boolean {
		var added = false;
		var newKey = resolveKeyPath<TKey>(this._keyPath, value)
		var index = this.indexOf(newKey);
		if (index < 0) {
			added = true;
			this._data.push(value)
		} else {
			console.warn("value with key=" + newKey + " exists in collection. Replacing value")
			this._data.splice(index, 1, value);
			added = true;
		}
		return added;
	}

	add(newValue: TValue): boolean {
		var added = false;
		var newKey = resolveKeyPath<TKey>(this._keyPath, newValue)
		var index = this.indexOf(newKey);
		if (index < 0) {
			added = true;
			this._data.push(newValue)
		} else {
			throw new Error("value with key=" + newKey + " already exists in collection")
		}
		return added;
	}

	del(key: TKey): boolean {
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

	indexOf(key: TKey): number {
		var self = this;
		return findIndex(this._data, function (value: TValue) {
			return resolveKeyPath(self._keyPath, value) === key;
		})
	}

	keysArray(): TKey[] {
		var self = this;
		return this._data.map(function (value: TValue) {
			return resolveKeyPath<TKey>(self._keyPath, value);
		});
	}

	valuesArray(): TValue[] {
		return this._data;
	}

	entriesArray(): (TKey | TValue)[][] {
		var self = this;
		return this._data.map(function (value: TValue) {
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

	static isCollection(obj: any) {
		return obj instanceof KeyedCollection
	}

}

type ContentCompare<T> = (value: T, index: number, array: T[]) => boolean

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