// DataRelation.ts

import { DataSet } from './DataSet'
import { DataColumn } from './DataColumn'
import { DataRow } from './DataRow'

export class DataRelation {

    private _dataSet: DataSet

    constructor(
        public name?: string,
        private _parent?: DataColumn,
        private _child?: DataColumn,
        private _operator?: Function) {
            
    }

    dataSet(): DataSet
    dataSet(dataSet: DataSet): this
    dataSet(dataSet?: DataSet): this | DataSet {
        if (dataSet !== void 0) {
            this._dataSet = dataSet;
            return this;
        }
        return this._dataSet;
    }

    parentColumn(): DataColumn
    parentColumn(column: DataColumn): this
    parentColumn(column?: DataColumn): any {
        if (column === void 0) {
            return this._parent;
        }
        this._parent = column;
        return this;
    }

    childColumn(): DataColumn;
    childColumn(column: DataColumn): this;
    childColumn(column?: DataColumn): any {
        if (column !== undefined) {
            this._child = column;
            return this;
        }
        return this._child;
    }

    getChildRows(oRow: DataRow): DataRow[] {
        var parentColumn = this.parentColumn();
		var childColumn = this.childColumn();

		if (parentColumn.table() !== oRow.table()) {
			throw new Error("Parent Row must belong to table: " + parentColumn.table());
		}

		return childColumn.findAll(oRow.get(parentColumn));
    }

    getParentRow(oRow: DataRow): DataRow {
        let parentColumn = this.parentColumn();
		let childColumn = this.childColumn();

		if (childColumn.table() !== oRow.table()) {
			throw new Error("Child Row must belong to table : " + childColumn.table());
		}

		return parentColumn.find(oRow.get(childColumn));
    }

}