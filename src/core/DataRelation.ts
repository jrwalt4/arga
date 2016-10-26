// DataRelation.ts

import {DataColumn} from './DataColumn'
import {DataRow} from './DataRow'

export abstract class DataRelation {

    constructor(
        private _parent: DataColumn,
        private _child: DataColumn,
        private _operator: Function) { }

    abstract getChildRows(oRow: DataRow): DataRow[]

    abstract getParentRow(oRow: DataRow): DataRow
}