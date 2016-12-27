// DataSet.ts

import { DataTable } from './DataTable'
import { DataTableCollection } from './DataTableCollection'
import { DataRelation } from './DataRelation'
import { DataRelationCollection } from './DataRelationCollection'
import { KeyedCollection } from './util'

var ds_counter = 1;

export class DataSet {

	private _tables = new DataTableCollection(this)
	private _relations = new DataRelationCollection(this)

	constructor(public name: string = "Set " + (++ds_counter)) { }

	tables(): DataTableCollection
	tables(name: string): DataTable
	tables(name?: string): DataTable | DataTableCollection {
		if (name === void 0) {
			return this._tables;
		}
		return this._tables.get(name);
	}

	relations(): DataRelationCollection
	relations(name: string): DataRelation
	relations(name?: string): any {
		if (name === void 0) {
			return this._relations;
		}
		return this._relations.get(name);
	}

	acceptChanges(): void {
		this._tables.forEach(function (table) {
			table.acceptChanges();
		})
	};

	getChanges() {

	};
}