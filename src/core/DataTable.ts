// DataTable.ts

import DataColumn = require('./DataColumn')
import DataColumnCollection = require('./DataColumnCollection')
import DataRow = require('./DataRow')
import DataRowCollection = require('./DataRowCollection')
//import IDataSchema = require('./IDataSchema')
import {createContentCompare} from './Util'

class DataTable {
		private _name: string;
		private _rows: DataRowCollection;
		private _columns: DataColumnCollection;
		private _keyPath: string;
		private _keyComparer: (keyA: string, keyB: string) => number;
		constructor(sName?: string, sKeyPath?: string) {
			this._name = sName;
			this._rows = new DataRowCollection(this);
			this._columns = new DataColumnCollection(this);
			this._keyPath = sKeyPath;
			this._keyComparer = createContentCompare(sKeyPath);
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

		rows(): DataRowCollection {
			return this._rows;
		}

		columns(): DataColumnCollection {
			return this._columns;
		}

		keyPath(): string {
			return this._keyPath;
		}

		acceptChanges() {
			this._rows.toArray().forEach((dr: DataRow) => {
				dr.acceptChanges();
			})
		}
	}
export = DataTable