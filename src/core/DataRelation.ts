// DataRelation.ts

import { DataColumn } from './DataColumn'
import { DataRow } from './DataRow'

export class DataRelation {

    constructor(
        private _name?: string,
        private _parent?: DataColumn,
        private _child?: DataColumn,
        private _operator?: Function) { }

    parentColumn(): DataColumn
    parentColumn(column: DataColumn): this
    parentColumn(column?: DataColumn): any {
        if (column === void 0) {
            return this._parent;
        }
        this._parent = column;
        return this;
    }

    childColumn():DataColumn;
    childColumn(column:DataColumn):this;
    childColumn(column?:DataColumn):any {
        if(column !== undefined) {
            this._child = column;
            return this;
        }
        return this._child;
    }

    /*
    abstract getChildRows(oRow: DataRow): DataRow[]

    abstract getParentRow(oRow: DataRow): DataRow
    //*/
}