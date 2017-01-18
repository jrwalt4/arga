// DataTable.ts

import { DataSet } from './DataSet'
import { DataTableCollection } from './DataTableCollection'
import { GenericDataColumn, DataColumn } from './DataColumn'
import { DataColumnCollection } from './DataColumnCollection'
import { DataRow } from './DataRow'
import { DataRowCollection } from './DataRowCollection'

import { EventEmitter2 as EventEmitter } from 'EventEmitter2'

let dt_counter = 0;

export class DataTable {

  private _dataSet: DataSet
  private _rowCollection = new DataRowCollection(this);
  private _columnCollection = new DataColumnCollection(this);
  private _primaryKey: DataColumn[];
  private _emitter: EventEmitter.emitter

  constructor(public name?: string) {
    dt_counter++
    this.name = name || "Table " + dt_counter;
    this.on('rowchanged', (event) => {
      if(!this._primaryKey) {
        return;
      }
      for (let index = 0; index < this._primaryKey.length; index++) {
        if (event.column === this._primaryKey[index]) {
          (this._rowCollection as any)._updateIndex(event);
        }
      }
    });
  }

  get dataSet(): DataSet {
    return this._dataSet;
  }
  set dataSet(dataSet: DataSet) {
    this._dataSet = dataSet;
  }

  get rows(): DataRowCollection {
    return this._rowCollection;
  }

  get columns(): DataColumnCollection {
    return this._columnCollection
  }

  get primaryKey(): DataColumn[] {
    return this._primaryKey;
  }

  set primaryKey(columns: DataColumn[]) {
    if (Array.isArray(columns)) {
      if (this._primaryKey && this._primaryKey.every((col, ndx) => {
        return col === columns[ndx]
      })) {
        // primary key hasn't changed, so skip
        return;
      }
      this._primaryKey = columns;
      this._onPrimaryKeyChange();
    } else {
      throw new TypeError("primary key must be a DataColumn array")
    }
  }

  private _onPrimaryKeyChange() {
    (this._rowCollection as any)._buildIndex();
  }

  acceptChanges() {
    this.rows.forEach((dr: DataRow) => {
      dr.acceptChanges();
    })
  }

  toString() {
    return this.name;
  }

  emit(event: RowChangeEvent)
  emit(event: ColumnChangeEvent)
  emit(event: RowChangeEvent | ColumnChangeEvent) {
    let emitter = this._emitter || (this._emitter = new EventEmitter())
    emitter.emit(event.type, event);
  }

  on(event: RowChangeEventType, listener: RowChangeListener)
  on(event: ColumnChangeEventType, listener: ColumnChangeListener)
  on(event: string, listener: (...values: any[]) => void) {
    (this._emitter || (this._emitter = new EventEmitter())).on(event, listener);
  }

  off(event: RowChangeEventType, listener: RowChangeListener)
  off(event: ColumnChangeEventType, listener: ColumnChangeListener)
  off(event: string, listener: (...values: any[]) => void) {
    (this._emitter || (this._emitter = new EventEmitter())).off(event, listener);
  }

  /** internal module methods */
  private _addTableToCollection(collection: DataTableCollection): boolean {
    if (this.dataSet = collection.dataSet) {
      return true;
    }
    return false;
  }
}

export type RowChangeEventType = "rowadded" | "rowchanged" | "rowdeleted"

export interface RowChangeEvent {
  type: RowChangeEventType
  row: DataRow
  column?: DataColumn
  oldValue?: any
  newValue?: any
}

export type RowChangeListener = (event: RowChangeEvent) => void

export type ColumnChangeEventType = "columnadded" | "columndeleted"

export interface ColumnChangeEvent {
  type: ColumnChangeEventType
  column: DataColumn
}

export type ColumnChangeListener = (event: ColumnChangeEvent) => void