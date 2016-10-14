// DataTable.ts

import DataColumn = require('./DataColumn')
import DataColumnCollection = require('./DataColumnCollection')
import DataRow = require('./DataRow')
import DataRowCollection = require('./DataRowCollection')
//import IDataSchema = require('./IDataSchema')
import {createContentCompare} from './Util'

export = DataTable

class DataTable {
	private _name: string;
	private _rows: DataRowCollection;
	private _columns: DataColumnCollection;
	private _keyPath: string;
	//private _keyComparer: (keyA: string, keyB: string) => number;
	constructor(sName?: string, sKeyPath?: string) {
		this._name = sName;
		sKeyPath = sKeyPath || '_id';
		this._keyPath = sKeyPath;

		this._rows = new DataRowCollection(this, sKeyPath);
		this._columns = new DataColumnCollection(this);
		
		//this._keyComparer = createContentCompare(sKeyPath);
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

	rows(key:any):DataRow
	rows(): DataRowCollection
	rows(key?:any):any {
		if(key === void 0) {
			return this._rows;
		}
		return this._rows.get(key);
	}

	columns(columnName:string):DataColumn<any>
	columns(): DataColumnCollection
	columns(columnName?:string):any {
		if (columnName === void 0) {
			return this._columns;
		}
		return this._columns.get(columnName);
	}

	primaryKey():DataColumn<any> {
		return this.keyPath();
	}

	keyPath(): string {
		return this._keyPath;
	}

	acceptChanges() {
		this.rows().toArray().forEach((dr: DataRow) => {
			dr.acceptChanges();
		})
	}
}