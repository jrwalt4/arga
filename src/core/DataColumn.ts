// DataColumn.ts

import SortedArray = require('collections/sorted-array');
import * as util from './Util'
import DataTable = require('./DataTable');
import DataRow = require('./DataRow');
import DataColumnConstraint = require('./DataColumnConstraint');

export = DataColumn;

class DataColumn<T> {
    private _name: string
    private _index: SortedArray<Item<T>>
    private _table: DataTable
    private _keyPath: string
    private _constraints: DataColumnConstraint[]

    constructor(name: string, keyPath?: string) {
        this._name = name;
        this._keyPath = keyPath;
        this._index = new SortedArray<Item<T>>(undefined, util.createContentEquals(keyPath), util.createContentCompare(keyPath));
    }

    getValue(data: Object): T {
        return util.resolveKeyPath<T>(this._keyPath, data);
    }

    setValue(row:DataRow, value:T) {

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