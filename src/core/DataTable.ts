// DataTable.ts

import { DataSet } from './DataSet'
import { DataTableCollection } from './DataTableCollection'
import { DataColumn } from './DataColumn'
import { DataColumnCollection } from './DataColumnCollection'
import { DataRow } from './DataRow'
import { DataRowCollection } from './DataRowCollection'
import { EventEmitter } from './Util'

//import { EventEmitter2 as EventEmitter } from 'EventEmitter2'

let dt_counter = 0;

export class DataTable {

  private _dataSet: DataSet
  private _rowCollection: DataRowCollection;
  private _columnCollection: DataColumnCollection;
  private _primaryKey: DataColumn[];

  public onRowDeleted = new EventEmitter<{
    row:DataRow
  }>()

  constructor(public name?: string) {
    dt_counter++
    this.name = name || "Table " + dt_counter;

    // collections are created here so they can be initialized
    // after all Observables have been created
    this._rowCollection = new DataRowCollection(this);
    this._columnCollection = new DataColumnCollection(this);
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
    } else {
      throw new TypeError("primary key must be a DataColumn array")
    }
  }

  acceptChanges() {
    this.rows.forEach((dr: DataRow) => {
      dr.acceptChanges();
    })
  }

  toString() {
    return this.name;
  }

  /** 
   * @internal 
   */
  _addTableToCollection(collection: DataTableCollection): boolean {
    if (this.dataSet = collection.dataSet) {
      return true;
    }
    return false;
  }
}