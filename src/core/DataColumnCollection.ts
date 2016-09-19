// DataColumnCollection.ts

import DataColumn = require('./DataColumn');
import DataTable = require('./DataTable')

class DataColumnCollection {
    private _table: DataTable
    private _columns: DataColumn<any>[];
    constructor(dataTable: DataTable) {
        if (!(dataTable instanceof DataTable)) {
            throw new Error("Cannot create DataColumnCollection without DataTable")
        }
        this._table = dataTable;
        this._columns = new Array<DataColumn<any>>();
    }

    add(dataColumn:DataColumn<any>):this {
        if(this._columns.indexOf(dataColumn)<0) {
            this._columns.push(dataColumn);
        } else {
            throw new Error("Column '"+dataColumn.name()+"' already exists in collection")
        }
        return this;
    }

    get(col:string):DataColumn<any> {
        if(typeof col === 'string') {
            for (var dc of this._columns) {
                if(dc.name() === col) {
                    return dc
                }
            }
        }
    }

    remove(col:string|DataColumn<any>) {
        
    }
}

export = DataColumnCollection