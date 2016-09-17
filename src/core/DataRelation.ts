// DataRelation.ts

import DataColumn = require('./DataColumn')
import DataRow = require('./DataRow')

class DataRelation {

        constructor(
            private _parent: DataColumn<any>,
            private _child: DataColumn<any>,
            private _operator: Function) { }

        getChildRows(oRow: DataRow): DataRow[] {
            return [new DataRow];
        }

        getParentRow(oRow: DataRow): DataRow {
            return new DataRow;
        }
    }
export = DataRelation