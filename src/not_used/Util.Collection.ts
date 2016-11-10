// Collection.ts
// A data structure class for a collection container

/*
interface Array<T> {
    find(callback:(val:T, index:number)=>boolean):T
    findIndex(callback:(val:T, index:number)=>boolean):number
}
//*/

import {resolveKeyPath, compareKeys} from '../core/Util'

export class Collection<K,T> {

    private _keyPath: string;
    private _data: Array<T>;
    //private _keyPathArray: string[];

    constructor(keyPath: string = "", data?: Array<T>) {
        this.keyPath(keyPath);
        this._data = data || new Array<T>();
        this._data.concat
    }

    get(key: K): T {
        return this._data[this._findIndex(key)]
    }

    toArray(): T[] {
        return this._data.slice();
    }

    add(obj: T) {
        this._data.push(obj);
        this._data.sort(this._compareKeys);
    }

    delete(index:number):void {

    }

    private _findIndex(key: K): number {
        return 0;
        /*
        (function (val:T, i:number) {
            return this._getKey(val) == key;
        })
        //*/
    }

    remove(key: K): T {
        var index = this._findIndex(key);
        if (index < 0) {
            return undefined
        }
        var retObj = this._data[index];
        this._data[index] = undefined;
        return retObj;
    }

    keyPath(): string;
    keyPath(newKeyPath: string): this;
    keyPath(newKeyPath?: string): any {
        if (newKeyPath !== undefined) {
            this._keyPath = newKeyPath;
            return this;
        }
        return this._keyPath;
    }

    _getKey(obj: T):K {
        return resolveKeyPath<K>(this._keyPath, obj);
    }

    _compareKeys(a, b):number {
        return cmp_keys(this._getKey(a), this._getKey(b));
    }
}

function key_path_reducer(prevKey: Object, nextKey: string, index: number, keyPathArray: string[]) {
    return prevKey === undefined ? undefined : prevKey[nextKey];
}

var cmp_keys = (typeof indexedDB !== 'undefined') ? indexedDB.cmp.bind(indexedDB) :
    function (a: any, b: any) {
        return a < b ? -1 : (a > b ? 1 : 0);
    }