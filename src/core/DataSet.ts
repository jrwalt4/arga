// DataSet.ts

import {DataTable} from './DataTable'
import {DataTableCollection} from './DataTableCollection'
import {DataRelation} from './DataRelation'
import {KeyedCollection} from './util'

var ds_counter = 0;
var dt_counter = 0;

export class DataSet {

	private _name: string
	private _tables = new DataTableCollection(this)
	private _relations = new KeyedCollection<string, DataRelation>('name')

	constructor(sName?: string) {
		++ds_counter;
		this._name = sName || "Set " + ds_counter;
	}

	name():string
	name(newName:string):this
	name(newName?: string):any {
		if (newName === void 0) {
			return this._name;
		}
		this._name = newName;
		return this;
	};

	tables(): DataTableCollection
	tables(name:string):DataTable
	tables(name?:string):DataTable | DataTableCollection {
		if(name === void 0) {
			return this._tables; 
		}
		return this._tables.get(name);
	}

	relations():KeyedCollection<string, DataRelation>
	relations(name:string):DataRelation
	relations(name?:string):any {
		if(name === void 0) {
			return this._relations;
		}
		return this._relations.get(name);
	}

	newTable(sName?: string): DataTable {
		++dt_counter;
		sName = sName || "Table " + dt_counter;
		return new DataTable(sName);
	}

	acceptChanges(): void {
		this._tables.forEach(function (table) {
			table.acceptChanges();
		})
	};

	getChanges() {

	};
}