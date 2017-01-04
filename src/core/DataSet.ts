// DataSet.ts

import { DataTable } from './DataTable'
import { DataTableCollection } from './DataTableCollection'
import { DataRelation } from './DataRelation'
import { DataRelationCollection } from './DataRelationCollection'

var ds_counter = 0;

export class DataSet {

	private _tables = new DataTableCollection(this)
	private _relations = new DataRelationCollection(this)

	constructor(public name?: string) {
		ds_counter++;
		this.name = name || "Set " + ds_counter;
	}

	get tables(): DataTableCollection {
		return this._tables;
	}

	get relations(): DataRelationCollection {
		return this._relations;
	}

	acceptChanges(): void {
		this._tables.forEach(function (table) {
			table.acceptChanges();
		})
	};

	getChanges() {

	};
}