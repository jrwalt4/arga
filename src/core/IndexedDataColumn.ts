// IndexedDataColumn.ts

import { GenericDataColumn } from './DataColumn'
import { DataRow } from './DataRow'

import SortedMap = require('collections/sorted-map')

export class GenericIndexedDataColumn<T> extends GenericDataColumn<T> {
    private _index = new SortedMap<any, { value: any, key: any }>();

    find(value: any): DataRow {
        return this.table.rows.get(this._index.get(value).key);
    }
}

export let IndexedDataColumn = GenericIndexedDataColumn;
export interface IndexedDataColumn extends GenericIndexedDataColumn<any> { }