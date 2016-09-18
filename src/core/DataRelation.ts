// DataRelation.ts

import DataColumn = require('./DataColumn')
import DataRow = require('./DataRow')

abstract class DataRelation {

    constructor(
        private _parent: DataColumn<any>,
        private _child: DataColumn<any>,
        private _operator: Function) { }

    abstract getChildRows(oRow: DataRow): DataRow[]

    abstract getParentRow(oRow: DataRow): DataRow
}
export = DataRelation