// DataSet.ts

import DataTable = require('./DataTable')
import DataRelation = require('./DataRelation')
//import SimpleSet = require('collections/set');

var ds_counter = 0;
var dt_counter = 0;

class DataSet {

	private _name: string;
	private _tables: DataTable[];
	private _relations: DataRelation[];

	constructor(sName?: string) {
		++ds_counter;
		this._name = sName || "Set " + ds_counter;
		this._tables = [];
		this._relations = [];
	}

	tables(): DataTable[] {
		return this._tables.slice();
	}

	newTable(sName?: string): DataTable {
		++dt_counter;
		sName = sName || "Table " + dt_counter;
		return new DataTable(sName);
	}

	addTable(oTable: string): void
	addTable(oTable: DataTable): void
	addTable(oTable: any) {
		let tbl: DataTable;
		if (typeof oTable === 'string') {
			tbl = this.newTable(oTable);
		} else {
			if (oTable instanceof DataTable) {
				tbl = oTable;
			} else {
				throw new TypeError("Cannot add table: " + oTable);
			}
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