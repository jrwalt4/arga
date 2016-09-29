// DataRow.js

import DataTable = require('./DataTable')
import DataRowState = require('./DataRowState')
import DataRowVersion = require('./DataRowVersion')

import DataColumn = require('./DataColumn')

import {KeyedCollection, deepCopy} from './Util'

class DataRow {
	private _table: DataTable
	private _original: Object
	private _current: Object
	private _proposed: Object

	constructor(dataTable: DataTable, values?: Object) {
		if (dataTable === void 0) {
			throw new Error("Cannot construct DataRow without DataTable")
		}
		this._table = dataTable;

		if (values !== void 0 && typeof values === "object") {
			this._original = deepCopy(values);
		} else {
			this._original = null;
		}
	}

	private _createCurrent(): Object {
		this._original = this._original || null;
		return Object.create(this._original);
	}

	private _createProposed() {
		if (this.rowState() === DataRowState.DELETED) {
			throw new Error("Cannot create proposed after deleting row")
		}
		if (this._current === void 0) {
			this._current = this._createCurrent();
		}
		return Object.create(this._current);
	}

	get<T>(column: DataColumn<T>, version?: DataRowVersion): T
	get<T>(key: string, version?: DataRowVersion): T
	get<T>(keyOrColumn: any, version?: DataRowVersion): T {
		switch (typeof keyOrColumn) {
			case "string":
				var key = keyOrColumn;
				return this._getItemWithKey<T>(key, version);
			case "object":
				var column = keyOrColumn;
				return this._getItemWithColumn<T>(column, version);
		}
	}

	set(values: Object, version: DataRowVersion): this
	set<T>(key: string, newValue: T, version?: DataRowVersion): this
	set<T>(valsOrKey: any, valOrVersion?: any, version?: DataRowVersion): this {
		switch (typeof valsOrKey) {
			case "string":
				var key: string = valsOrKey;
				var value: T = valOrVersion;
				return this._setItem(key, value, version);
			case "object":
				var values: Object = valsOrKey;
				var version: DataRowVersion = valOrVersion;
				return this._setItems(values, version)
		}

	}

	del(key: string): any {
		this._setItem(key, null);
	}

	has(key: string, version?: DataRowVersion): boolean {
		var searchObject = this._getVersion(version);
		for (var member in searchObject) {
			if (member == key) {
				return true;
			}
		}
		return false;
	}

	delete(version?: DataRowVersion) {
		if (this.isEditing()) {
			this._proposed = null;
		} else {
			this._current = null;
		}
	}

	private _getItemWithColumn<T>(column: DataColumn<T>, version?: DataRowVersion): T {
		var data = this._getVersion(version);
		if(data === void 0 || data === null) {
			return void 0;
		} else {
			return column.getValue(data);
		}
	}
	private _getItemWithKey<T>(key: string, version?: DataRowVersion): T {
		var data = this._getVersion(version);
		if(data === void 0 || data === null) {
			return void 0;
		} else {
			return data[key]
		}
	}

	private _setItem(column: string, newValue: any, version?: DataRowVersion): this {
		if (version === DataRowVersion.ORIGINAL) {
			throw new Error("Cannot write to original version");
		}
		if (this.rowState() === DataRowState.DELETED) {
			throw new Error("Row already deleted");
		}
		this._getVersion(version)[column] = newValue;
		return this;
	}

	private _setItems(values: Object, version?: DataRowVersion): this {
		for (var key in values) {
			this._setItem(key, values[key]);
		}
		return this;
	}

	private _getVersion(version: DataRowVersion = DataRowVersion.DEFAULT): Object {
		switch (version) {
			case DataRowVersion.DEFAULT:
				if (this.isEditing()) {
					return this._proposed ||
						(this._proposed = this._createProposed());
				} else {
					return this._current ||
						(this._current = this._createCurrent());
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
		if (this._table === void 0) {
			return DataRowState.DETACHED;
		}

		if (this._original === null) {
			return DataRowState.ADDED;
		}

		if (this._current === null) {
			return DataRowState.DELETED;
		}

		if (this._current === void 0) {
			return DataRowState.UNCHANGED;
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
		// need to fix
		var self = this;
		var newOriginal = deepCopy(this._current);
		this._original = newOriginal;
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