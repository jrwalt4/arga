// DataRowCollection.ts

import { IKeyedCollection } from './Util'
import * as util from './Util'

import { DataTable, RowChangeEvent } from './DataTable'
import { DataRow } from './DataRow'
import { DataRowState } from './DataRowState'
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
  private _table: DataTable
  private _stagedRowDeletions: string[]

  constructor(dataTable: DataTable) {
    if (dataTable === void 0) {
      throw new Error("Illegal DataRowCollection constructor: " +
        "expected DataTable as first argument")
    }
    this._table = dataTable;
  }

  get size(): number {
    let deletedRows = this._stagedRowDeletions ?
      this._stagedRowDeletions.length : 0
    return this._store.length - deletedRows;
  }

  has(keyValue: any): boolean {
    let primaryKey: DataColumn[];
    let foundId: string;
    if (primaryKey = this._table.primaryKey) {
      for (let column of primaryKey) {
        if (!column.findId(keyValue)) {
          return false;
        }
      }
    }
    return true;
  }

  get(keyValue: any): DataRow {
    let primaryKey: DataColumn[]
    if (primaryKey = this._table.primaryKey) {
      // let's only support single column keys for now
      //*
      keyValue = Array.isArray(keyValue) ? keyValue[0] : keyValue;
      //*/
      return primaryKey[0].find(keyValue);
    }
  }

  private _getWithId(id: string): DataRow {
    return this._store.get(id);
  }

  add(row: DataRow): boolean
  add(rowData: {}): boolean
  add(rowOrData: DataRow | {}): boolean {
    let row: DataRow = rowOrData instanceof DataRow ?
      rowOrData : new DataRow(rowOrData);
    if (this._store.add(row)) {
      /*
      let primaryKey: DataColumn[];
      if (primaryKey = this._table.primaryKey) {
        this._index.set(row.get(primaryKey), (row as any)._id);
      }
      //*/

      // internal module method
      return (row as any)._addRowToCollection(this);
    }
    this.size
    return false;
  }

  delete(row: DataRow): boolean
  delete(keyOrRow: any): boolean {
    let row: DataRow = (keyOrRow instanceof DataRow) ?
      keyOrRow : this.get(keyOrRow);
    if (row) {
      (row as any)._onDelete();
      // check if row is new (i.e. recently added)
      if (row.rowState & (DataRowState.ADDED | DataRowState.DETACHED)) {
        this._commitDelete(row);
      } else {
        this._stageDelete(row);
      }
      this._table.onRowDeleted.publish({ row: row });
    }
    // row is not in this collection
    return false
  }

  private _stageDelete(row: DataRow) {
    let rows = this._stagedRowDeletions = this._stagedRowDeletions || [];
    if (rows.indexOf((row as any)._id) < 0) {
      rows.push((row as any)._id);
    }
  }

  private _commitDelete(row: DataRow) {
    (row as any)._free();
    return this._store.delete(row);
  }

  clear() {
    this._store.clear();
  }

  find(
    predicate: (value: DataRow, key: any, collection: this) => boolean,
    thisArg?:any
  ): DataRow {
    let primaryKey: DataColumn[]
    if (primaryKey = this._table.primaryKey) {
      let row: DataRow,
        key: any,
        iterator: Iterator<DataRow> = this._store.iterate(),
        result: IteratorResult<DataRow>;

      while (!(result = iterator.next()).done) {
        row = result.value;
        // only support single column (non-compound) primary keys
        key = row.get(primaryKey);
        if (predicate.call(thisArg, row, key, this)) {
          return row;
        }
      }
    }
  }

  forEach(
    callback: (row: DataRow, key: string, collection: this) => void,
    thisArg?: any,
    filter?: DataRowState
  ) {
    filter = filter !== void 0 ?
      filter : ~(DataRowState.DELETED | DataRowState.DETACHED);
    let self = this;
    let primaryKey: DataColumn = this._table.primaryKey[0];
    this._store.forEach((row, index, collection) => {
      if (row.rowState & filter) {
        callback.call(thisArg, row, row.get(primaryKey as DataColumn), self)
      }
    })
  }

  get table(): DataTable {
    return this._table;
  }
}