// DataColumn.ts

import SortedArray = require('collections/sorted-array');
import * as util from './Util';
import DataTable = require('./DataTable');
import DataColumnConstraint = require('./DataColumnConstraint')

class DataColumn<TKey> {
    private _name: string
    private _index: SortedArray<Item<TKey>>
    private _table: DataTable
    private _keyPath: string
    private _constraints: DataColumnConstraint[]

    private _Item: Item<TKey>

    constructor(table: DataTable, name: string, keyPath?: string) {
        if (!(table instanceof DataTable)) {
            throw new Error("cannot construct DataColumn without DataTable")
        }
        this._name = name;
        this._keyPath = keyPath;
        this._index = new SortedArray<Item<TKey>>(undefined, util.createContentEquator(keyPath), util.createContentComparer(keyPath));
    }

    getValue(object: Object): any {
        return util.resolveKeyPath(this._keyPath, object);
    }

    table(): DataTable {
        return this._table;
    }
    /*
    table(newTable: DataTable): this;
    table(newTable?: DataTable): any {
        if (newTable !== undefined && newTable instanceof DataTable) {
            this._table = newTable;
            return this;
        }
        return this._table;
    }
    //*/

    name(): string
    name(sName: string): this
    name(sName?: string): any {
        if (sName !== undefined) {
            this._name = sName;
            return this;
        }
        return this._name;
    }

    keyPath():string {
        if(this._keyPath === void 0) {
            return this.name()
        }
        return this._keyPath
    }
}

class Item<T> {
    constructor(public key: T, public index: number) { }
}

export = DataColumn;