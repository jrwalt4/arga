// DataRelation.ts

import { DataSet } from './DataSet'
import { DataColumn } from './DataColumn'
import { DataRow } from './DataRow'
import { DataRelationCollection } from './DataRelationCollection'

let rel_counter = 0;

export class DataRelation {

  public name:string
  private _dataSet: DataSet
  private _parent: DataColumn
  private _child: DataColumn

  constructor(childColumn: DataColumn, parentColumn: DataColumn, name?: string) {
    if (parentColumn.table.dataSet !== childColumn.table.dataSet) {
      throw new TypeError("columns must be from the same DataSet")
    }
    this._dataSet = parentColumn.table.dataSet;
    this._parent = parentColumn;
    this._child = childColumn;
    this.name = rel_counter++ && name || "DataRelation " + rel_counter;
  }

  get dataSet(): DataSet {
    return this._dataSet;
  }

  get parentColumn(): DataColumn {
    return this._parent;
  }

  get childColumn(): DataColumn {
    return this._child;
  }

  getChildRows(oRow: DataRow): DataRow[] {
    var parentColumn = this.parentColumn;
    var childColumn = this.childColumn;

    if (parentColumn.table !== oRow.table) {
      throw new Error("Parent Row must belong to table: " + parentColumn.table);
    }

    return childColumn.findAll(oRow.get(parentColumn));
  }

  getParentRow(oRow: DataRow): DataRow {
    let parentColumn = this.parentColumn;
    let childColumn = this.childColumn;

    if (childColumn.table !== oRow.table) {
      throw new Error("Child Row must belong to table: " + childColumn.table);
    }

    return parentColumn.find(oRow.get(childColumn));
  }

  /**
   * @internal
   * Prepare relation to be added to DataRelationCollection
   */
  _addRelationToCollection(
    collection: DataRelationCollection
  ): boolean {
    if (this._dataSet = collection.dataSet) {
      return true;
    }
    return false;
  }
}