// DataSet.ts

import DataTable = require('./DataTable')
import DataRelation = require('./DataRelation')

var ds_counter = 0;
class DataSet {

	private _name: string;
	private _tables: DataTable[];
	private _relations: DataRelation[];

	constructor(name: string = "Set" + ds_counter++) {
		this._name = name;
		this._tables = [];
		this._relations = [];
	}

	tables(): DataTable[] {
		return this._tables.slice();
	}

	addTable(oTable: string): void
	addTable(oTable: DataTable): void
	addTable(oTable: DataTable | string) {
		let tbl: DataTable;
		if (typeof oTable === 'string') {
			tbl = new DataTable(oTable);
		} else {
			tbl = oTable;
		}
		if (tbl.name() === undefined) {
			tbl.name("Table" + this._tables.length);
		}
		this._tables.push(tbl);
	};

	acceptChanges(): void {
		this._tables.forEach(function (table) {
			table.acceptChanges();
		})
	};

	getChanges() {

	};

	name(newValue?: string) {
		if (newValue != undefined) {
			this._name = newValue;
		}
		return this._name;
	};
}
export = DataSet