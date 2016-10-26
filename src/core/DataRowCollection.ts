// DataRowCollection.ts

import SortedArray = require('collections/sorted-array')

import {DataTable} from './DataTable'
import {DataRow} from './DataRow'
import {createContentCompare, createContentEquals, createValueWithKeyPath} from './Util'

export class DataRowCollection {
    private _rows:SortedArray<DataRow>
    private _table:DataTable
    constructor(dataTable:DataTable) {
        if (dataTable === void 0) {
            throw new Error("Illegal DataRowCollection constructor: expected DataTable as first argument")
        }
        this._table = dataTable;
        
        var drc = this;

        this._rows = new SortedArray<DataRow>([], function(objA, objB):boolean {
            var keyColumn = drc.table().primaryKey();
            return keyColumn.getValue(objA) === keyColumn.getValue(objB); 
        }, function (objA, objB):number {
            var keyColumn = drc.table().primaryKey();
            return 1
        });
    }

    //*
    size():number {
        return this._rows.length;
    }

    has(value:any):boolean {
        return this._rows.has({}); // TODO
    }

    get(value:any):DataRow {
        return this._rows.get(value);
    }

    add(...rows:DataRow[]) {
        for (let row of rows) {
            this._addRow(row);
        }
    }

    private _addRow(row:DataRow) {
        if (this._rows.add(row)) {
            row.table(this.table());
        } else {
            throw new Error("Could not add DataRow:" + row);
        }
    }

    clear() {
        this._rows.clear();
    }

    toArray():DataRow[] {
        return this._rows.toArray();
    }
    //*/

    table() {
        return this._table;
    }
}