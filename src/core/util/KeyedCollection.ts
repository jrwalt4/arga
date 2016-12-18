// util/KeyedCollection.ts

import * as _ from 'lodash'

var _get = _.get,
	_set = _.set,
	_has = _.has,
	_property = _.property,
	_isEqualBy = function (iteratee) {
		return function (a, b) {
			return iteratee(a) === iteratee(b);
		}
	};

export interface IKeyedCollection<TKey extends string | number, TValue> {
	size: number
	has(key: TKey): boolean
	get(key: TKey): TValue
	//set(value: TValue): boolean
	add(value: TValue): boolean
	delete(key: TKey): boolean
	find(predicate: (value: TValue, key: TKey, collection: this) => boolean): TValue
}

export class KeyedCollection<TKey extends string|number, TValue> implements IKeyedCollection<TKey, TValue> {
	private _store = {}

	constructor(private _keyPath:string, entries?:any[]){

	}

	get size():number {
		return Object.keys(this._store).length
	}

	get(key: TKey): TValue {
		if (this.has(key)) {
			return _get<TValue>(this._store, key)
		}
	}

	add(value: TValue):boolean {
		let key:TKey;
		if (!this.has(key = _get<TKey>(value, this._keyPath))) {
			_set(this._store, key, value);
			return true;
		}
		return false
	}

	has(key: TKey):boolean {
		return _.hasIn(this._store, key);
	}

	delete(key: TKey):boolean {
		return _.unset(this._store, this._keyPath);
	}

	find(callback: (value: TValue, key: TKey, object: this)=>boolean):TValue {
		
		return _.find<TValue>(this._store, <_.ObjectIterator<TValue, boolean>>callback);
	}
}