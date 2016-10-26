// DataColumn.ts

import SortedArray = require('collections/sorted-array');
import * as util from './Util'
import {DataTable} from './DataTable'
import {DataRow} from './DataRow'
import {DataColumnConstraint}  from './DataColumnConstraint'

export type DataColumnConstructorOptions = {
    keyPath?:string
    primaryKey?:boolean
    index?:boolean
    constraints?:DataColumnConstraint[]
    get?(object:{}):any
    set?(object:{});
}

export class DataColumn {
    private _name: string
    private _index: SortedArray<Item<any>>
    private _table: DataTable
    private _keyPath: string
    private _constraints: DataColumnConstraint[]

    constructor(name: string, constructorOptions:DataColumnConstructorOptions = {keyPath:name}) {
        this._name = name;
        if (constructorOptions.keyPath) {
            var keyPath = constructorOptions.keyPath;
            this.getValue = (data:Object) => util.resolveKeyPath(keyPath, data)
            this.setValue = (data:Object, value:any)=> util.setValueAtKeyPath(keyPath, data, value) 
        } else {

        }
        if (constructorOptions.index) {
            this._index = new SortedArray<Item<any>>(undefined, util.createContentEquals(keyPath), util.createContentCompare(keyPath));
            //this._index.addRangeChangeListener(()=>{});
        }
    }

    getValue<T>(data: Object): T {
        return util.resolveKeyPath<T>(this._keyPath, data);
    }

    setValue<T>(data:Object, value:T) {

    }

    table(): DataTable {
        return this._table;
    }

    name(): string
    name(sName: string): this
    name(sName?: string): any {
        if (sName !== undefined) {
            this._name = sName;
            return this;
        }
        return this._name;
    }

    keyPath(): string {
        if (this._keyPath === void 0) {
            return this.name()
        }
        return this._keyPath
    }
}

class Item<T> {
    constructor(public key: T, public index: number) { }
}