// DataColumn.ts

import SortedArray = require('collections/sorted-array');
import * as util from './Util'
import { DataTable } from './DataTable'
import { DataRow } from './DataRow'
import { DataColumnConstraint } from './DataColumnConstraint'
import { DataType, GenericDataType } from './DataType'

export type DataColumnConstructorOptions = {
    keyPath?: string
    type?: string | DataType
    isPrimaryKey?: boolean
    isIndex?: boolean
    constraints?: DataColumnConstraint[]
    get?: (object: {}) => any
    set?: (object: {}) => boolean
}

export class GenericDataColumn<T> {
    private _name: string
    private _table: DataTable
    private _type: DataType
    private _keyPath: string
    private _constraints: DataColumnConstraint[]

    constructor(name: string, constructorOptions: DataColumnConstructorOptions = { keyPath: name }) {
        if (constructorOptions.isIndex) {
            console.warn("use IndexedDataColumn for index")
        }
        this._name = name;
        if (constructorOptions.keyPath) {
            this._keyPath = constructorOptions.keyPath;
        } else {
            if (typeof constructorOptions.get === 'function' && typeof constructorOptions.set === 'function') {
                this.getValue = constructorOptions.get;
                this.setValue = constructorOptions.set;
            } else {
                throw new Error("Insufficient parameters supplied for new DataRow(name, ctorOptions)")
            }
        }
        let dataType: DataType;
        switch (typeof constructorOptions.type) {
            case "string":
                let typeName: string = <string>constructorOptions.type
                dataType = DataType.getType(typeName);

                break;
            case "object":
                dataType = (<DataType>constructorOptions.type);
                break;
            default:
                dataType = DataType.getType("object")
        }
        this._type = dataType;
    }

    getValue(data: Object): T {
        return util.getValueAtKeyPath<T>(this.keyPath(), data);
    }

    setValue(data: Object, value: T): boolean | void {
        return util.setValueAtKeyPath(this.keyPath(), data, value);
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

    get type():DataType{
        return this._type;
    }

    find(value: T): DataRow {
        var self = this;
        return this.table().rows().toArray().find(function (row) {
            return util.equalKeys(value, self.getValue(row))
        })
    }

    findAll(value: T): DataRow[] {
        throw new Error("not implemented")
    }
}
export class DataColumn extends GenericDataColumn<any> { }