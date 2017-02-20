// DataColumn.ts

import { ObservableEvent, equalKeys} from './Util'
import { DataTable } from './DataTable'
import { DataRow } from './DataRow'
import { DataColumnCollection } from './DataColumnCollection'
import { DataColumnConstraint } from './DataColumnConstraint'
import { DataType, GenericDataType } from './DataType'

import * as _ from 'lodash'
import {EventEmitter2 as EventEmitter} from 'EventEmitter2'

export class GenericDataColumn<T> {

  private _table: DataTable

  public onValueChanged = new ObservableEvent<{
    row:DataRow,
    column:GenericDataColumn<T>,
    newValue:T,
    oldValue:T
  }>();

  /** TODO */
  // private _constraints: DataColumnConstraint[]

  constructor(
    public name: string,
    public keyPath: string = name,
    public type: DataType = DataType.AnyType
  ) {

  }

  getValue(data: Object, row:DataRow): T {
    return _.get<T>(data, this.keyPath);
  }

  setValue(data: Object, newValue: T, row:DataRow): boolean {
    let oldValue = this.getValue(data, row);
    _.set<T, {}>(data, this.keyPath, newValue)
    // let DataRow publish the onValueChanged event
    return true;
  }

  hasValue(data: Object, row:DataRow): boolean {
    return _.has(data, this.keyPath);
  }

  deleteValue(data:Object, row:DataRow):boolean {
    return this.setValue(data, null, row);
  }

  get table(): DataTable {
    return this._table;
  }

  set table(dataTable: DataTable) {
    this._table = dataTable;
  }

  findId(value:T):string {
    let self = this;
    let row = this.table.rows.find(function (row) {
      return equalKeys(value, row.get(self))
    })
    return ((row as any)._id as string);
  }

  find(value: T): DataRow {
    let self = this;
    return this.table.rows.find(function (row) {
      return equalKeys(value, row.get(self))
    })
  }

  findAll(value: T): DataRow[] {
    let foundRows: DataRow[] = [];
    var self = this;
    this.table.rows.forEach(function (row) {
      if (equalKeys(value, row.get(self))) {
        foundRows.push(row);
      }
    });
    return foundRows;
  }

  private _addColumnToCollection(collection: DataColumnCollection): boolean {
    if (this._table = collection.table) {
      return true;
    }
    return false;
  }

  toString():string {
    return `DataColumn(keyPath:"${this.keyPath}")`;
  }
}

export let DataColumn = GenericDataColumn
export type DataColumn = GenericDataColumn<any>
