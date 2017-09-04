
import { IKeyedCollection } from './IKeyedCollection'
import {Dictionary as Dict} from './Dictionary'

//import Dict = require('dict')
import {get as _get, property as _property} from 'lodash'

export class KeyedDictionary<TValue> implements IKeyedCollection<string, TValue> {

    private _store: Dict<TValue>
    constructor(public keyPath: string, values?: {}) {
        this._store = new Dict<TValue>(values);
        this._getKey = _property<{}, string>(keyPath);
    }

    get size():number {
        return this._store.size;
    }

    set size(newSize:number) {
        // just in case dictjs changes to implement size setter
        this._store.size = newSize;
    }

    get(key: string): TValue {
        return this._store.get(key);
    }

    add(value: TValue): boolean {
        let key: string;
        if (!this.has(key = this._getKey(value))) {
            this._store.set(key, value);
            return true;
        } else {
            return false
        }
    }

    has(key: string): boolean {
        return this._store.has(key);
    }

    delete(key: string): boolean {
        return this._store.delete(key);
    }

    clear() {
        return this._store.clear();
    }

    find(predicate: (value: TValue, key: string, collection: this) => boolean): TValue {
        let self = this, result: TValue;
        this._store.forEach(function (val: TValue, key: string, dict:Dict<TValue>) {
            if (predicate(val, key, self)) {
                result = val;
            }
        });
        return result;
    }
    forEach(callback: (value: TValue, key: string, collection: this) => void, thisArg?: any) {
        let self = this;
        this._store.forEach(function(v:TValue, k:string, d:Dict<TValue>) {
            callback.call(thisArg, v, k, self)
        }, thisArg);
    }

    private _getKey: (value: TValue) => string

}