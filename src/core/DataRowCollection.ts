// DataRowCollection.ts

import SortedArray = require('collections/sorted-array')

import DataTable = require('./DataTable')
import DataRow = require('./DataRow')
import {createContentCompare, createContentEquals} from './Util'

export = DataRowCollection;

class DataRowCollection {
    private _rows:SortedArray<DataRow>
    private _table:DataTable
    constructor(dataTable:DataTable, sKeyPath:string) {
        if (dataTable === void 0) {
            throw new Error("Illegal DataRowCollection constructor: expected DataTable as first argument")
        }
        this._table = dataTable;
        
        this._rows = new SortedArray<DataRow>([], createContentEquals(sKeyPath), createContentCompare(sKeyPath));
    }

    //*
    size():number {
        return this._rows.length;
    }

    has(value:any):boolean {
        return this._rows.has(value);
    }

    get(value:any):DataRow {
        return this._rows.get(value);
    }

    add(...rows:DataRow[]) {
        for (let row of rows) {
            row.table(this.table());
        }
        this._rows.addEach(rows);
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