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
            throw new Error("Illegal DataColumnCollection constructor: expected DataTable as first argument");
        }
        this._table = dataTable;
        //this._columns = new Array<DataColumn<any>>();
    }

    add(dataColumn:DataColumn):boolean {
        let added = super.add(dataColumn);
        if(added) {
            dataColumn.table(this._table);
        }
        return added;
    }

    table():DataTable {
        return this._table;
    }
}