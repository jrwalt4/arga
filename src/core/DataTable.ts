// DataTable.ts

import DataColumn = require('./DataColumn')
import DataRow = require('./DataRow')
import DataRowCollection = require('./DataRowCollection')
//import IDataSchema = require('./IDataSchema')
import {createContentComparer} from './Util'

let dt_counter: number = 0;

class DataTable {
		private _name: string;
		private _rows: DataRowCollection;
		private _columns: DataColumn<any>[];
		private _keyPath: string;
		private _keyComparer: (keyA: string, keyB: string) => number;
		constructor(sName?: string, sKeyPath?: string) {
			this._name = sName || "Table" + dt_counter++;
			this._rows = new DataRowCollection();
			this._columns = [];
			this._keyPath = sKeyPath;
			this._keyComparer = createContentComparer(sKeyPath);
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

		addRow(oRow: DataRow): this {
			this._rows.add(oRow);
			oRow.table(this);
			return this;
		}

		columns(): DataColumn<any>[] {
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

console.log('loaded DataTable')