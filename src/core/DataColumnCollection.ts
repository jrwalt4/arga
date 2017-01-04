// DataColumnCollection.ts

import {DataColumn, addColumnToCollection} from './DataColumn'
import {DataTable} from './DataTable'
import {KeyedDictionary} from './Util'

export class DataColumnCollection extends KeyedDictionary<DataColumn> {
    private _table: DataTable
    //private _columns: DataColumn<any>[];
    constructor(dataTable: DataTable) {
        super('name');
        if (dataTable === void 0) {
            throw new Error("Illegal DataColumnCollection constructor: expected DataTable as first argument");
        }
        this._table = dataTable;
        //this._columns = new Array<DataColumn<any>>();
    }

    add(columnName:string):boolean
    add(column:DataColumn):boolean
    add(columnOrName:any):boolean {
        let column:DataColumn = (typeof columnOrName == "string") ? new DataColumn(columnOrName) : columnOrName
        let added = super.add(column);
        if(added) {
            addColumnToCollection(column, this);
        }
        return added;
    }

    get table():DataTable {
        return this._table;
    }
}