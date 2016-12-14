// DataColumn.ts

import SortedArray = require('collections/sorted-array');
import * as util from './Util'
import { DataTable } from './DataTable'
import { DataRow } from './DataRow'
import { DataColumnConstraint } from './DataColumnConstraint'
import { DataType, GenericDataType } from './DataType'

export type DataColumnConstructorOptions<T> = {
    keyPath?: string
    type?: GenericDataType<T> | string
    isPrimaryKey?: boolean
    constraints?: DataColumnConstraint[]
    get?: (object: {}) => T
    set?: (object: {}, value: T) => boolean
    default?: T
}

export class GenericDataColumn<T> {
    private _name: string
    private _table: DataTable
    private _type: DataType
    private _keyPath: string
    private _constraints: DataColumnConstraint[]

    constructor(name: string, constructorOptions: DataColumnConstructorOptions<T> = { keyPath: name }) {

        this._name = name;
        if (constructorOptions.keyPath) {
            this._keyPath = constructorOptions.keyPath;
            this.getValue = util.createKeyPathGetter<T>(this._keyPath);
            this.setValue = util.createKeyPathSetter<T>(this._keyPath);
        } else {
            let get = constructorOptions.get, set = constructorOptions.set;
            get = typeof get === 'function' ? get : ()=>{return void 0;}
            set = typeof set === 'function' ? set : ()=>{return void 0;}
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
                dataType = DataType.getType("any")
        }
        this._type = dataType;
        /**
         * @todo - What to do with constructorOptions.default
         */
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

    get type(): DataType {
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

export let DataColumn = GenericDataColumn
export interface DataColumn extends GenericDataColumn<any> { }