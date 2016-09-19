// DataRow.js

import DataTable = require('./DataTable')
import DataRowState = require('./DataRowState')
import DataRowVersion = require('./DataRowVersion')

import DataColumn = require('./DataColumn')

import {SimpleCollection} from './Util'

class DataRow implements SimpleCollection {
	private _table: DataTable
	private _original: Object
	private _current: Object
	private _proposed: Object

	constructor(dataTable: DataTable) {
		if (!(dataTable instanceof DataTable)) {
			throw new Error("Cannot construct DataRow without DataTable")
		}
		this._table = dataTable;
		this._original = {};
		this._current = this._createCurrent();
		this._proposed = this._createProposed();
	}

	private _createCurrent(): Object {
		return Object.create(this._original);
	}

	private _createProposed() {
		if (this._current == void 0) {
			throw new Error("DataRow._current has been deleted");
		}
		return Object.create(this._current);
	}

	get<T>(key: string, version?: DataRowVersion): T {
		return this._getItem(key, version);
	}

	set<T>(key: string, newValue: T, version?: DataRowVersion): this {
		return this._setItem(key, newValue, version)
	}

	del(key: string): any {
		this._setItem(key, null);
	}

	has(key: string): boolean {
		return Object.keys(this._current).indexOf(key) >= 0 ||
			Object.keys(this._original).indexOf(key) >= 0
	}

	delete(version?: DataRowVersion) {
		if (this.isEditing()) {
			this._proposed = null;
		} else {
			this._current = null;
		}
	}

	item(key: string, newValue?: any, version?: DataRowVersion): any {
		if (newValue !== undefined) {
			return this._setItem(key, newValue, version);
		} else {
			return this._getItem(key, version);
		}
	}

	private _getItem(key: string, version?: DataRowVersion): any {
		var column = this._getColumn(key);
		if (column === void 0) {
			return this._getVersion(version)[key];
		} else {
			return column.getValue(this._getVersion(version));
		}
	}

	private _setItem(column: string, newValue: any, version?: DataRowVersion): this {
		if (this.rowState() == DataRowState.DELETED) {
			throw new Error("Row already deleted");
		}
		this._getVersion(version)[column] = newValue;
		return this;
	}

	private _getVersion(version: DataRowVersion): Object {
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

	private _getColumn(name: string): DataColumn<any> {
		return this.table().columns().get(name);
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
		 * should probably implement this with bitmask,
		 * but here it is for now
		 */
		if (this._current === null) {
			return DataRowState.DELETED;
		}
		if (Object.keys(this._current).length === 0) {
			return DataRowState.UNCHANGED;
		}
		/* not sure if a DataRowState.PROPOSED is needed
		if (Object.keys(this._proposed).length !== 0){
			return DataRowState.PROPOSED
		}
		//*/
		if (this._table === undefined) {
			return DataRowState.DETACHED;
		}
		return DataRowState.MODIFIED;
	}

	beginEdit(): void {
		if (this.isEditing()) {
			throw new Error("already editing");
		}
		this._proposed = this._createProposed();
	}

	isEditing(): boolean {
		return !!this._proposed;
	}

	endEdit(): void {
		this.dispatchBeforeRowChange();
		var self = this;
		Object.keys(this._proposed).forEach(function (key) {
			self._current[key] = self._proposed[key];
		})
		delete this._proposed;
		this.dispatchRowChange();
	}

	acceptChanges() {
		var self = this;
		Object.keys(this._current).forEach(function (key, i) {
			var value = self._current[key];
			if (value === null) {
				delete self._original[key]
			} else {
				self._original[key] = self._current[key];
			}
		})
		this._current = this._createCurrent();
	}

	rejectChanges() {
		this._current = this._createCurrent();
	}

	dispatchRowChange() {

	}

	dispatchBeforeRowChange() {

	}
}
export = DataRow