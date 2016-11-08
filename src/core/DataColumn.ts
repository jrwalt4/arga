// DataColumn.ts

import SortedArray = require('collections/sorted-array');
import * as util from './Util'
import { DataTable } from './DataTable'
import { DataRow } from './DataRow'
import { DataColumnConstraint } from './DataColumnConstraint'

export type DataColumnConstructorOptions = {
    keyPath?: string
    type?: string
    primaryKey?: boolean
    index?: boolean
    constraints?: DataColumnConstraint[]
    get?(object: {}): any
    set?(object: {});
}

export class DataColumn {
    private _name: string
    private _table: DataTable
    private _keyPath: string
    private _constraints: DataColumnConstraint[]

    constructor(name: string, constructorOptions: DataColumnConstructorOptions = { keyPath: name }) {
        this._name = name;
        if (constructorOptions.keyPath) {
            var keyPath = this._keyPath = constructorOptions.keyPath;
            this.getValue = (data: Object) => util.getValueAtKeyPath(keyPath, data)
            this.setValue = (data: Object, value: any) => util.setValueAtKeyPath(keyPath, data, value)
        } else {

        }
        if (constructorOptions.index) {
            console.warn("use IndexedDataColumn for index")
        }
    }

    getValue<T>(data: Object): T {
        return util.getValueAtKeyPath<T>(this._keyPath, data);
    }

    setValue<T>(data: Object, value: T): boolean {
        return util.setValueAtKeyPath(this._keyPath, data, value);
    }

    table(): DataTable
    table(dataTable: DataTable): this
    table(dataTable?: DataTable): any {
        if (dataTable === void 0) {
            return this._table;
        }
        this._table = dataTable;
        return this;
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

    keyPath(): string {
        return this._keyPath;
    }

    find(value: any): DataRow {
        var self = this;
        return this.table().rows().toArray().find(function (row) {
            return util.equalKeys(value, self.getValue(row))
        })
    }

    findAll(value: any): DataRow[] {
        throw new Error("not implemented")
    }
}

class Item<T> {
    constructor(public key: T, public index: number) { }
}