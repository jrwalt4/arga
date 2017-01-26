// DataRowCollection.ts

import { IKeyedCollection } from './Util'
import * as util from './Util'

import { DataTable, RowChangeEvent } from './DataTable'
import { DataRow } from './DataRow'
import { DataColumn } from './DataColumn'

import FastSet = require('collections/fast-set')
import FastMap = require('collections/fast-map')

export class DataRowCollection implements IKeyedCollection<any, DataRow> {

  private _store: FastSet<DataRow> = new FastSet<DataRow>(
    [],
    (a, b) => {
      return (a as any)._id === (b as any)._id;
    }, (row) => {
      return <string>(row as any)._id
    });
  private _index: FastMap<any[], string>
  private _table: DataTable

  constructor(dataTable: DataTable) {
    if (dataTable === void 0) {
      throw new Error("Illegal DataRowCollection constructor: " +
        "expected DataTable as first argument")
    }
    this._table = dataTable;
    this._initializeListeners();
  }

  private _initializeListeners() {
    let columnListeners: Array<() => void> = [];
    this._table.onPrimaryKeyChange.subscribe(
      ({newPrimaryKey, oldPrimaryKey}) => {
        this._buildIndex(newPrimaryKey);
        let unsubscribeFn: () => void;
        // unsubscribe all previous listeners
        while (unsubscribeFn = columnListeners.pop()) {
          unsubscribeFn();
        }
        for (let column of newPrimaryKey) {
          columnListeners.push(column.onValueChanged.subscribe((changeArgs) => {
            // need to find a way of knowing which row it is
            this._updateIndexForRow({
              type: "rowchanged",
              row: changeArgs.row,
              column,
              newValue: changeArgs.newValue,
              oldValue: changeArgs.oldValue
            })
          }))
        }
      })
  }

  get size(): number {
    return this._store.length;
  }

  has(key: any): boolean {
    if (this._table.primaryKey) {
      key = Array.isArray(key) ? key : [key];
      return this._index.has(key); // TODO
    }
    return false;
  }

  get(key: any): DataRow {
    if (this._table.primaryKey) {
      key = Array.isArray(key) ? key : [key];
      let index: string;
      if (index = this._index.get(key)) {
        return this._store.get({ _id: index });
      }
    }
  }

  add(row: DataRow): boolean
  add(rowData: {}): boolean
  add(rowOrData: DataRow | {}): boolean {
    let row: DataRow = rowOrData instanceof DataRow ?
      rowOrData : new DataRow(rowOrData);
    if (this._store.add(row)) {
      let primaryKey: DataColumn[];
      if (primaryKey = this._table.primaryKey) {
        this._index.set(row.get(primaryKey), (row as any)._id);
      }
      // internal module method
      return (row as any)._addRowToCollection(this);
    }
    return false;
  }

  delete(row: DataRow): boolean
  delete(keyOrRow: any): boolean {
    let dataRow: DataRow;
    if (keyOrRow instanceof DataRow) {
      dataRow = keyOrRow;
    } else {
      dataRow = this.get(keyOrRow);
    }
    return this._store.delete(dataRow);
  }

  clear() {
    this._store.clear();
  }

  find(
    predicate: (value: DataRow, key: any, collection: this) => boolean
  ): DataRow {
    throw new Error("DataRowCollection#find not implemented yet");
  }

  forEach(callback: (v, k, c) => void, thisArg?: any) {
    //
  }

  get table(): DataTable {
    return this._table;
  }

  private _updateIndexForRow(rowChangeEvent: RowChangeEvent) {
    let primaryKey = this._table.primaryKey;
    let keys: DataColumn[] = [];
    let {row, column: changedColumn, oldValue, newValue} = rowChangeEvent;
    for (let i = 0; i < primaryKey.length; i++) {
      keys.push(changedColumn === primaryKey[i] ?
        oldValue :
        row.get(primaryKey[i]));
    }
    this._index.delete(keys);
    this._index.set(row.get(primaryKey), <string>(row as any)._id);
  }

  private _buildIndex(primaryKey: DataColumn[]) {
    this._index = new FastMap<any, string>(
      this._store.map<[any[], string]>((row) => {
        let id = <string>(row as any)._id;
        let key = row.get(primaryKey);
        return [key, id];
      }),
      (pKeyA: any[], pKeyB: any[]) => {
        for (let index = 0; index < pKeyA.length; index++) {
          if (pKeyA[index] != pKeyB[index]) {
            return false
          }
        }
        return true;
      },
      (pKey: any[]) => {
        return pKey.join(':');
      });
  }
}