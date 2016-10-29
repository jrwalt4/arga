// DataRowCollection.ts
/// <reference path="../../typings/index.d.ts" />

import SortedArray = require('collections/sorted-array')
import {IKeyedCollection} from './Util'

import {DataTable} from './DataTable'
import {DataRow} from './DataRow'
import {DataColumn} from './DataColumn'
import {createContentCompare, createContentEquals, createValueWithKeyPath} from './Util'

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
                return primaryKey[index] === row.get(column);
            })
        }, function (key, row:DataRow):number {
            var keyColumn = drc.table().primaryKey();
            return 1
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

    /*
    set(key:any):boolean {
        throw new Error("DataRowCollection#set does not exist")
    }
    //*/

    add(row:DataRow):boolean {
        if (this._rows.add(row)) {
            row.table(this.table());
            return true;
        }
        return false;
    }

    delete(key:any):boolean {
        return this._rows.delete(key);
    }

    clear() {
        this._rows.clear();
    }

    find(value:any):DataRow {
        return this.get(value);
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