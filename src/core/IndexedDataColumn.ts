// IndexedDataColumn.ts

import { GenericDataColumn } from './DataColumn'
import { DataRow } from './DataRow'

import FastMap = require('collections/fast-map')

export class GenericIndexedDataColumn<T> extends GenericDataColumn<T> {
    // will only store unique values. must find a replacement
    // or make a switch based on constraints (UniqueConstraint)
    private _index = new FastMap<T, string>();

    find(value: T): DataRow {
        return this.table.rows._getWithId(this._index.get(value));
    }

    findId(value: T): string {
        return this._index.get(value)
    }

    setValue(store: Object, value: T, row: DataRow): boolean {
        let oldValue:T = this.getValue(store, row);
        if (super.setValue(store, value, row)) {
            this._index.delete(oldValue);
            this._index.set(value, row._id);
            return true;
        }
        return false;
    }

    deleteValue(store:Object, row:DataRow):boolean {
        let oldValue:T = this.getValue(store, row);
        if(super.deleteValue(store, row)) {
            this._index.delete(oldValue);
            return true;
        }
        return false;
    }
}

export let IndexedDataColumn = GenericIndexedDataColumn;
export interface IndexedDataColumn extends GenericIndexedDataColumn<any> { }