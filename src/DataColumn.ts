// DataColumn.ts

import SortedArray = require('collections/sorted-array');
import DataTable = require('./DataTable');
import DataColumnConstraint = require('./DataColumnConstraint')
class DataColumn {
    private _name: string
    private _index: SortedArray<any>
    private _table: DataTable
    private _keyPath: string
    private _constraints: DataColumnConstraint[]

    constructor(name: string) {
        this._name = name;

    }

    private _get(object: Object): any {
        return object[this._keyPath];

    }

    table(): DataTable;
    table(newTable: DataTable): this;
    table(newTable?: DataTable): any {
        if (newTable !== undefined && newTable instanceof DataTable) {
            this._table = newTable;
            return this;
        }
        return this._table;
    }

    name(): string
    name(sName: string): this
    name(sName?: string): any {
        if (sName !== undefined) {
            this._name = sName;
            return this;
        }
        return this._name;
    }
}
export = DataColumn;