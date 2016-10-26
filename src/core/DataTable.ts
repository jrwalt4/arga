// DataTable.ts

import {DataColumn} from './DataColumn'
import {DataColumnCollection} from './DataColumnCollection'
import {DataRow} from './DataRow'
import {DataRowCollection} from './DataRowCollection'
//import IDataSchema = require('./IDataSchema')
import {createContentCompare} from './Util'

export class DataTable {
	private _name: string;
	private _rowCollection: DataRowCollection;
	private _columnCollection: DataColumnCollection;
	private _keyPath: string;

	constructor(sName?: string) {
		this._name = sName || "Table";

		this._rowCollection = new DataRowCollection(this);
		this._columnCollection = new DataColumnCollection(this);
	}
	
	name(): string;
	name(sName: string): this;
	name(sName?: string): any {
		if (sName !== undefined) {
			this._name = sName;
			return this;
		}
		return this._name;
	}

	rows(): DataRowCollection
	rows(key:any):DataRow
	rows(key?:any):any {
		if(key === void 0) {
			return this._rowCollection;
		}
		return this._rowCollection.get(key);
	}

	columns(): DataColumnCollection
	columns(columnName:string):DataColumn
	columns(columnName?:string):any {
		if (columnName === void 0) {
			return this._columnCollection;
		}
		return this._columnCollection.get(columnName);
	}

	primaryKey():DataColumn {
		throw new Error("not yet implemented");
		/*
		return this.columns().find(function (column, index, array){
			return !column;
		})
		*/
	}

	acceptChanges() {
		this.rows().toArray().forEach((dr: DataRow) => {
			dr.acceptChanges();
		})
	}
}