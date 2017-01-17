// DataRowCollection.ts

import { IKeyedCollection } from './Util'
import * as util from './Util'

import { DataTable } from './DataTable'
import { DataRow } from './DataRow'
import { DataColumn } from './DataColumn'

import FastSet = require('collections/fast-set')
import FastMap = require('collections/fast-map')

export class DataRowCollection implements IKeyedCollection<any, DataRow> {

  private _store: FastSet<DataRow> = new FastSet<DataRow>([], (a, b) => {
    return (a as any)._id === (b as any)._id;
  }, (row) => {
    return <string>(row as any)._id
  });
  private _index: FastMap<[any], string>
  private _table: DataTable

  constructor(dataTable: DataTable) {
    if (dataTable === void 0) {
      throw new Error("Illegal DataRowCollection constructor: " +
        "expected DataTable as first argument")
    }
    this._table = dataTable;
  }

  get size(): number {
    return this._store.length;
  }

  has(key: any): boolean {
    if (this._table.primaryKey) {
      return this._index.has(key); // TODO
    }
    return false;
  }

  get(key: any): DataRow {
    if (this._table.primaryKey) {
      let index = this._index.get(key);
      return this._store.get(index);
    }
  }

  add(row: DataRow): boolean
  add(rowData: {}): boolean
  add(rowOrData: DataRow | {}): boolean {
    let row: DataRow = rowOrData instanceof DataRow ?
      rowOrData : new DataRow(rowOrData);
    if (this._store.add(row)) {
      if (this._table.primaryKey) {
        // look for row._id in index
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

  find(predicate: (value: DataRow, key: any, collection: this) => boolean): DataRow {
    throw new Error("DataRowCollection#find not implemented yet");
  }

  forEach(callback: (v, k, c) => void, thisArg?: any) {
    //
  }

  get table(): DataTable {
    return this._table;
  }

  private _updateIndexForRow(row: DataRow) {

  }

  private _buildIndex() {
    let primaryKey = this._table.primaryKey;
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
        return pKey.join('');
      });
  }
}