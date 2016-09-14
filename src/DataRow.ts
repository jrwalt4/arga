// DataRow.js

import DataTable = require('./DataTable')
import DataRowState = require('./DataRowState')
import DataRowVersion = require('./DataRowVersion')

class DataRow {
		private _table: DataTable
		private _original: Object
		private _current: Object
		private _proposed: Object

		constructor() {
			this._original = {};
			this._current = Object.create(this._original);
		}

		/**
		 * pass 'null' to set the table to 'undefined'
		 */
		table(): DataTable;
		table(oDataTable: DataTable): this;
		table(oDataTable?: DataTable): any {
			if (oDataTable !== undefined) {
				if (oDataTable === null) {
					this._table = undefined;
				} else {
					this._table = oDataTable;
				}
				return this;
			}
			return this._table;
		}

		rowState(): DataRowState {
			/*
			 * should probably implement this with biflags,
			 * but here it is for now
			 */
			if (this._current === undefined) {
				return DataRowState.DELETED;
			}
			if (this.table() === undefined) {
				return DataRowState.DETACHED;
			}
			if (Object.keys(this._current).length == 0) {
				return DataRowState.UNCHANGED;
			}

			// currently not implementing 'DataRowState.PROPOSED'

			return DataRowState.MODIFIED;
		}

		isEditing(): boolean {
			return !!this._proposed;
		}

		get(): any {

		}

		set(): any {

		}

		del(): any {

		}

		has(): boolean {
			return true;
		}

		item(column: string, newValue?: any, version?: DataRowVersion): any {
			if (newValue !== undefined) {
				return this._setItem(column, newValue, version);
			} else {
				return this._getItem(column, version);
			}
		}

		private _getItem(column: string, version: DataRowVersion): any {
			return this._getVersion(version)[column];
		}

		private _setItem(column, newValue, version): this {

			if (this.rowState() == DataRowState.DELETED) {
				throw new Error("Row already deleted");
			}

			this._getVersion(version)[column] = newValue;

			return this;
		}

		private _getVersion(version): Object {
			version = version || DataRowVersion.DEFAULT;
			switch (version) {
				case DataRowVersion.DEFAULT:
					if (this.isEditing()) {
						return this._proposed;
					} else {
						return this._current;
					}
				case DataRowVersion.CURRENT:
					return this._current;
				case DataRowVersion.ORIGINAL:
					return this._original;
				case DataRowVersion.PROPOSED:
					return this._proposed;
				default:
					throw new Error("DataRowVersion {" + version + "} is not recognized");
			}
		}

		acceptChanges() {
			Object.keys(this._current).forEach(function (key, i) {
				this._original[key] = this._current[key];
			})
			this._current = Object.create(this._original);
		}

		rejectChanges() {
			this._current = Object.create(this._original);
		}
	}
export = DataRow