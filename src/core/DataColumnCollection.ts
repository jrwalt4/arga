// DataColumnCollection.ts

import {DataColumn} from './DataColumn'
import {DataTable} from './DataTable'
import {KeyedCollection} from './Util'

export class DataColumnCollection extends KeyedCollection<string, DataColumn> {
    private _table: DataTable
    //private _columns: DataColumn<any>[];
    constructor(dataTable: DataTable) {
        super('name');
        if (dataTable === void 0) {
            throw new Error("Illegal DataColumnCollection constructor: expected DataTable as first argument")
        }
        this._table = dataTable;
        //this._columns = new Array<DataColumn<any>>();
    }

    table():DataTable {
        return this._table;
    }

    /*
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
    //*/
}