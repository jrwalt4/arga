// DataRow.js

import { DataTable } from './DataTable'
import { DataRowState } from './DataRowState'
import { DataRowVersion } from './DataRowVersion'
import { DataColumn, GenericDataColumn } from './DataColumn'
import { DataRelation } from './DataRelation'
import { KeyedCollection, EmptyObject, deepCopy, compareKeys, 
	equalKeys, getValueAtKeyPath, setValueAtKeyPath } from './Util'

import { EventEmitter2 as EventEmitter } from 'eventemitter2'

export class DataRow {
	private _table: DataTable
	private _original: Object
	private _current: Object
	private _proposed: Object
	public observable = new EventEmitter()

	constructor(values?: Object, table?:DataTable) {

		this._table = table;
		
		/**
		 * _original is set to undefined, and
		 * _current is an empty object so we 
		 * start off as DataRowState.ADDED
		 */
		this._original = void 0;
		this._current = this._createCurrent();

		for (let key in values) {
			this.set(key, values[key]);
		}

	}

	private _createOriginal(): {} {
		return {};
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

	/**
	 * Returns whether the key or column is defined on this row
	 */
	has(key: string, version?: DataRowVersion): boolean {
		var searchObject = this._getVersion(version);
		for (var member in searchObject) {
			if (member === key) {
				return true;
			}
		}
		return false;
	}

	get<T>(column: GenericDataColumn<T>, version?: DataRowVersion): T
	get<T>(columns: DataColumn[], version?: DataRowVersion): T[]
	get<T>(columnName: string, version?: DataRowVersion): T
	get<T>(columnOrName: any, version?: DataRowVersion): any {
		if (typeof columnOrName === "string") {
			return this._getItemWithKey<T>(columnOrName, version);
		}
		if (Array.isArray(columnOrName)) {
			return (<DataColumn[]>columnOrName).map(column => this.get(column))
		}
		return this._getItemWithColumn<T>(<DataColumn>columnOrName, version);
	}

	private _getItemWithKey<T>(key: string, version?: DataRowVersion): T {
		var data = this._getVersion(version);
		if (data != null) {
			return (<GenericDataColumn<T>>this.table().columns(key)).getValue(data);
		}
	}

	private _getItemWithColumn<T>(column: GenericDataColumn<T>, version?: DataRowVersion): T {
		var data = this._getVersion(version);
		if (data != null) {
			return column.getValue(data);
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

	set<T>(key: string, value: T): boolean
	set(values: Object): boolean
	set<T>(column: DataColumn, value: T): boolean
	set<T>(valsOrKeyOrColumn: any, value?: T): boolean {

		switch (typeof valsOrKeyOrColumn) {

			case "string":
				return this._setItemWithKey((<string>valsOrKeyOrColumn), value);

			case "object":
				if (isDataColumn(valsOrKeyOrColumn)) {
					return valsOrKeyOrColumn.setValue(this, value);
				} else {
					return this._setItems(<{}>valsOrKeyOrColumn)
				}
		}
		throw new TypeError("invalid arguments passed to DataRow#set: "+valsOrKeyOrColumn)
	}

	private _setItems(values: Object): boolean {
		let success = true;
		for (var key in values) {
			success = success && this._setItemWithKey(key, values[key])
		}
		return success;
	}
	/**
     * @todo
	 */
	private _setItemWithColumn(column: DataColumn, value: any): boolean {

		return column.setValue(this._current, value);
	}

	private _setItemWithKey(key: string, newValue: any): boolean {

		// bitwise check (&) in case rowState() is 
		// changed to return a set of flags in
		// future versions
		if (this.rowState() & DataRowState.DELETED) {
			throw new Error("Row already deleted");
		}

		if (this.isEditing()) {
			this._proposed = this._proposed || this._createProposed();
			setValueAtKeyPath(key, this._proposed, newValue);
		} else {
			this._current = this._current || this._createCurrent();
			setValueAtKeyPath(key, this._current, newValue);
		}
		return false;
	}

	del(key: string): boolean {
		if (this.has(key)) {
			this._setItemWithKey(key, null);
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

	getChildRows(relation: DataRelation): DataRow[] {
		return relation.getChildRows(this);
	}

	getParentRow(relation: DataRelation): DataRow {
		return relation.getParentRow(this);
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
	return dc instanceof GenericDataColumn;
}
//*/
export type RowChangeEventArgs = {
	type: RowChangeType,
	key?: any
}
export type RowChangeType = "modify" | "delete" | "add"