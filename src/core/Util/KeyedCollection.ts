// util/KeyedCollection.ts

import * as _ from 'lodash'
import {IKeyedCollection} from './IKeyedCollection'
import {EmptyObject} from './EmptyObject'

var _get = _.get,
	_set = _.set,
	_has = _.has,
	_property = _.property,
	_isEqualBy = function (iteratee) {
		return function (a, b) {
			return iteratee(a) === iteratee(b);
		}
	};

export class KeyedCollection<TKey extends string | number, TValue> implements IKeyedCollection<TKey, TValue> {
	private _store:{} = new EmptyObject

	constructor(private _keyPath: string, entries?: any[]) {
		throw new Error("not implemented yet")
	}

	get size(): number {
		return Object.keys(this._store).length
	}

	get(key: TKey): TValue {
		if (this.has(key)) {
			return _get<TValue>(this._store, this._keyPath)
		}
	}

	add(value: TValue): boolean {
		let key: TKey;
		if (!this.has(key = _get<TKey>(value, this._keyPath))) {
			_set(this._store, key, value);
			return true;
		}
		return false
	}

	has(key: TKey): boolean {
		return _.hasIn(this._store, key);
	}

	delete(key: TKey): boolean {
		return _.unset(this._store, this._keyPath);
	}

	clear() {
		this._store = new EmptyObject();
	}

	find(callback: (value: TValue, key: TKey, object: this) => boolean): TValue {

		return _.find<TValue>(this._store, <_.ObjectIterator<TValue, boolean>>callback);
	}

	forEach(callback: (value: TValue, key: TKey, collection: this) => void, thisArg?: any) {
		_.forOwn(this._store, <_.ObjectIterator<TValue, void>>callback, thisArg);
	}
}