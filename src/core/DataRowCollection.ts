// DataRowCollection.ts

import SortedArray = require('collections/sorted-array')
import {IKeyedCollection} from './Util'
import * as util from './Util'

import {DataTable} from './DataTable'
import {DataRow} from './DataRow'
import {DataColumn} from './DataColumn'

export class DataRowCollection implements IKeyedCollection<any, DataRow> {

    private _rows:SortedArray<DataRow>
    private _table:DataTable

    constructor(dataTable:DataTable) {
        if (dataTable === void 0) {
            throw new Error("Illegal DataRowCollection constructor: expected DataTable as first argument")
        }
        this._table = dataTable;
        
        var drc = this;

        this._rows = new SortedArray<DataRow>([], function(key:any, row:DataRow):boolean {
            var primaryKey = drc.table().primaryKey();
            return primaryKey.every(function(column:DataColumn, index:number){
                return key === row.get(column);
            })
        }, function (key, row:DataRow):number {
            var keyColumns = drc.table().primaryKey();
            return util.compareKeys(key, row.get(keyColumns))
        });
    }

    //*
    get size():number {
        return this._rows.length;
    }

    has(key:any):boolean {
        return this._rows.has(key); // TODO
    }

    get(key:any):DataRow {
        return this._rows.get(key);
    }

    add(row:DataRow):boolean
    add(rowData:{}):boolean
    add(rowOrData:DataRow|{}):boolean {
        let row:DataRow;
        if (!(rowOrData instanceof DataRow)) {
            row = new DataRow(rowOrData);
        }
        if (this._rows.add(row)) {
            row.table(this.table());
            return true;
        }
        return false;
    }

    delete(row:DataRow):boolean
    delete(keyOrRow:any):boolean {
        let dataRow:DataRow;
        if (keyOrRow instanceof DataRow) {
            dataRow = keyOrRow;
        } else {
            dataRow = this.get(keyOrRow);
        }
        return this._rows.delete(dataRow);
    }

    clear() {
        this._rows.clear();
    }

    find(predicate:(value:DataRow, key:any, collection:this)=>boolean):DataRow {
        throw new Error("DataRowCollection#find not implemented yet");
    }

    forEach(callback:(v,k,c)=>void,thisArg?:any) {
        //
    }

    entriesArray():[any, DataRow][] {
        var self = this;
        return this._rows.map(function (row:DataRow):[any,DataRow] {
            return [row.get(self.table().primaryKey()),row]
        })
    }

    valuesArray():DataRow[] {
        return this.toArray();
    }

    keysArray():any[] {
        var self = this;
        return this._rows.map(function(row:DataRow):any {
            return row.get(self.table().primaryKey());
        })
    }

    toArray():DataRow[] {
        return this._rows.toArray();
    }
    //*/

    table() {
        return this._table;
    }
}