// DataColumn.ts

import SortedArray = require('collections/sorted-array');
import * as util from './Util'
import { DataTable } from './DataTable'
import { DataRow } from './DataRow'
import {DataColumnCollection} from './DataColumnCollection'
import { DataColumnConstraint } from './DataColumnConstraint'
import { DataType, GenericDataType } from './DataType'

import * as _ from 'lodash'

export class GenericDataColumn<T> {

    private _table: DataTable

    /** TODO */
    // private _constraints: DataColumnConstraint[]

    constructor(public name: string, public keyPath: string = name, public type: DataType = DataType.AnyType) {

    }

    getValue(data: Object): T {
        return _.get<T>(data, this.keyPath);
    }

    setValue(data: Object, value: T): boolean {
        _.set<T, {}>(data, this.keyPath, value)
        return true;
    }

    get table(): DataTable {
        return this._table;
    }

    set table(dataTable: DataTable) {
        this._table = dataTable;
    }

    find(value: T): DataRow {
        var self = this;
        return this.table.rows.find(function (row) {
            return util.equalKeys(value, row.get(self))
        })
    }

    findAll(value: T): DataRow[] {
        let foundRows: DataRow[] = [];
        var self = this;
        this.table.rows.forEach(function(row) {
            if (util.equalKeys(value, row.get(self))) {
                foundRows.push(row);
            }
        });
        return foundRows;
    }

}

export let DataColumn = GenericDataColumn
export type DataColumn = GenericDataColumn<any>

export function addColumnToCollection(column:DataColumn, collection:DataColumnCollection) {
    (column as any)._table = collection.table;
}