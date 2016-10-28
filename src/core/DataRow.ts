// DataRow.js

import { DataTable } from './DataTable'
import { DataRowState } from './DataRowState'
import { DataRowVersion } from './DataRowVersion'
import { EventEmitter2 as EventEmitter } from 'eventemitter2'

import { DataColumn } from './DataColumn'

import { KeyedCollection, deepCopy } from './Util'

export class DataRow {
	private _table: DataTable
	private _original: Object
	private _current: Object
	private _proposed: Object
	public observable = new EventEmitter()

	constructor(values?: Object) {

		/**
		 * _original is set to undefined, and
		 * _current is an empty object so we 
		 * start off as DataRowState.ADDED
		 */
		this._original = void 0;
		this._current = this._createCurrent();

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

	private _createOriginal(): {} {
		return Object.create(null);
	}

	private _createCurrent(): {} {
		return Object.create(this._original || null);
	}

	private _createProposed(): {} {
		return Object.create(this._current || null);
	}

	/**
	 * 
	 */
	rowState(): DataRowState {
		/**
		 *  __________________________________
		 * | _original | _current |   state   |
		 * |-----------|----------|-----------|
		 * | undefined | undefined|   ERROR   |
		 * | undefined |    {}    |   ADDED   |
		 * | undefined |   null   |  DELETED  | deleted immediately (won't wait to sync)
		 * |     {}    | undefined| UNCHANGED |
		 * |     {}    |    {}    | MODIFIED  |
		 * |     {}    |   null   |  DELETED  |
		 * |___________|__________|___________|
		 * 
		 */

		if (this._table === void 0) {
			return DataRowState.DETACHED;
		}
		if (this._current === null) {
			return DataRowState.DELETED;
		}
		if (this._original === void 0) {
			return DataRowState.ADDED
		}
		return this._current === void 0 ? DataRowState.UNCHANGED : DataRowState.MODIFIED;
	}

	has(key: string, version?: DataRowVersion): boolean {
		var searchObject = this._getVersion(version);
		for (var member in searchObject) {
			if (member === key) {
				return true;
			}
		}
		return false;
	}

	get<T>(column: DataColumn, version?: DataRowVersion): T
	get<T>(columns: DataColumn[], version?: DataRowVersion): [T]
	get<T>(key: string, version?: DataRowVersion): T
	get<T>(keyOrColumn: any, version?: DataRowVersion): any {
		if (typeof keyOrColumn === "string") {
			var key = keyOrColumn;
			return this._getItemWithKey<T>(key, version);
		}
		if (Array.isArray(keyOrColumn)) {
			return (<DataColumn[]>keyOrColumn).map((column) => this.get(column))
		}
		var column: DataColumn = keyOrColumn;
		return this._getItemWithColumn<T>(column, version);
	}

	private _getItemWithKey<T>(key: string, version?: DataRowVersion): T {
		var data = this._getVersion(version);
		if (data === void 0 || data === null) {
			return void 0;
		} else {
			return data[key]
		}
	}

	private _getItemWithColumn<T>(column: DataColumn, version?: DataRowVersion): T {
		var data = this._getVersion(version);
		if (data === void 0 || data === null) {
			return void 0;
		} else {
			return <T>column.getValue(data);
		}
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

	set<T>(key: string, newValue: T): this
	set(values: Object): this
	set<T>(column: DataColumn, value: T): this
	set<T>(valsOrKeyOrColumn: any, value?: T): this {
		switch (typeof valsOrKeyOrColumn) {
			case "string":
				var key: string = valsOrKeyOrColumn;
				//var value: T = valOrVersion;
				return this._setItem(key, value);
			case "object":
				if (isDataColumn(valsOrKeyOrColumn)) {
					let column: DataColumn = valsOrKeyOrColumn;
					column.setValue(this, value);
					return this;
				} else {
					var values: Object = valsOrKeyOrColumn;
					return this._setItems(values)
				}
		}
		return this;
	}

	private _setItems(values: Object): this {
		for (var key in values) {
			this._setItem(key, values[key]);
		}
		return this;
	}

	private _setItem(key: string, newValue: any): this {

		// bitwise check (&) in case rowState() is 
		// changed to return a set of flags in
		// future versions
		if (this.rowState() & DataRowState.DELETED) {
			throw new Error("Row already deleted");
		}

		if (this.isEditing()) {
			this._proposed = this._proposed || this._createProposed();
			this._proposed[key] = newValue;
		} else {
			this._current = this._current || this._createCurrent();
			this._current[key] = newValue;
		}
		return this;
	}

	del(key: string): boolean {
		if (this.has(key)) {
			this._setItem(key, null);
			return true
		}
		return false;
	}

	delete() {
		if (this.isEditing()) {
			this._proposed = null;
		} else {
			this._current = null;
		}
		if (this.rowState() & DataRowState.ADDED) {
			this.dispatchBeforeDelete();
			this.dispatchDelete();
		}
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
		this.dispatchBeforeRowChange({ type: "modify" });
		var self = this;
		Object.keys(this._proposed).forEach(function (key) {
			self._current[key] = self._proposed[key];
		})
		delete this._proposed;
		this.dispatchRowChange({ type: "modify" });
	}

	acceptChanges() {
		if (this.isEditing()) {
			this.endEdit();
		}
		/**
		 * copy all the changes from _current onto _original,
		 */

		this._original = deepCopy(this._current) || this._createOriginal();
		delete this._current;
	}

	rejectChanges() {
		if (this.isEditing()) {
			this.endEdit();
		}
		delete this._current;
	}

	private dispatchBeforeRowChange(args: RowChangeEventArgs) {
		this.observable.emit("beforechange", args);
	}

	private dispatchRowChange(args: RowChangeEventArgs) {
		this.observable.emit("change", args);
	}

	private dispatchBeforeDelete() {
		this.observable.emit("beforedeleted");
	}

	private dispatchDelete() {
		this.observable.emit("deleted");
	}
}

//*
function isDataColumn(dc: any): dc is DataColumn {
	return (typeof dc.getValue === "function" && typeof dc.setValue === "function");
}
//*/
export type RowChangeEventArgs = {
	type: RowChangeType,
	key?: any
}
export type RowChangeType = "modify" | "delete" | "add"