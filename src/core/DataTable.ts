// DataTable.ts

import {DataColumn} from './DataColumn'
import {DataColumnCollection} from './DataColumnCollection'
import {DataRow} from './DataRow'
import {DataRowCollection} from './DataRowCollection'
//import IDataSchema = require('./IDataSchema')
import {createContentCompare} from './Util'

export class DataTable {
	private _name: string;
	private _rowCollection = new DataRowCollection(this);
	private _columnCollection = new DataColumnCollection(this);
	private _primaryKey: DataColumn[];

	constructor(sName?: string) {
		this._name = sName || "Table";
	}
	
	name(): string
	name(sName: string): this
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

	primaryKey():DataColumn[] 
	primaryKey(dataColumn:DataColumn):this
	primaryKey(dataColumnArray:DataColumn[]):this
	primaryKey(dataColumn?:DataColumn | DataColumn[]):any {
		if (dataColumn === void 0) {
			return this._primaryKey;
		}
		if (Array.isArray(dataColumn)) {
			this._primaryKey = dataColumn;
		} else {
			this._primaryKey = [dataColumn];
		}
		return this;
	}

	acceptChanges() {
		this.rows().toArray().forEach((dr: DataRow) => {
			dr.acceptChanges();
		})
	}
}