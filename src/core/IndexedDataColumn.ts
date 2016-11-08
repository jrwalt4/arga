// IndexedDataColumn.ts

import {DataColumn} from './DataColumn'
import {DataRow} from './DataRow'

import SortedMap = require('collections/sorted-map')

export class IndexedDataColumn extends DataColumn {
    private _index = new SortedMap<any, {value:any, key:any}>();

    find(value:any):DataRow {
        return this.table().rows(this._index.get(value).key);
    }
}