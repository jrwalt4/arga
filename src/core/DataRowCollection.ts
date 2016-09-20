// DataRowCollection.ts

import SortedArray = require('collections/sorted-array')
import DataTable = require('./DataTable')
import DataRow = require('./DataRow')

class DataRowCollection {
    private _rows:SortedArray<DataRow>
    private _table:DataTable
    constructor(dataTable:DataTable) {
        if (dataTable === void 0) {
            throw new Error("Illegal DataRowCollection constructor: expected DataTable as first argument")
        }
        this._table = dataTable;
        this._rows = new SortedArray<DataRow>();
    }

    add(...rows:DataRow[]) {
        this._rows.addEach(rows);
    }

    toArray():DataRow[] {
        return this._rows.toArray();
    }
}

export = DataRowCollection;