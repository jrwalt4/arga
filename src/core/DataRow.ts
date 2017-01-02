// DataRow.js

import { DataTable } from './DataTable'
import { DataRowCollection } from './DataRowCollection'
import { DataRowState } from './DataRowState'
import { DataRowVersion } from './DataRowVersion'
import { DataColumn, GenericDataColumn } from './DataColumn'
import { DataRelation } from './DataRelation'
import {
	KeyedCollection, EmptyObject, deepCopy, compareKeys,
	equalKeys, getValueAtKeyPath, setValueAtKeyPath
} from './Util'

import Dict = require('dict');

export class DataRow {
	private _table: DataTable
	private _original: Object
	private _current: Object
	private _proposed: Object
	private _detachedCache: Dict<any>

	constructor(values?: Object, table?: DataTable) {

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
		return new EmptyObject();
	}

	private _createCurrent(): {} {
		return Object.create(this._original || null);
	}

	private _createProposed(): {} {
		return Object.create(this._current || null);
	}

	/**
	 * returns The DataRowState that this row is currently in
	 * @return {DataRowState} rowState - the current DataRowState
	 */
	rowState(): DataRowState {
		/**
		 * _______________________________________________ 
		 *|   _table  |  _current | _original |   state   | 
		 *|-----------|-----------|-----------|-----------| 
		 *| undefined | undefined | undefined |  DETACHED | 
		 *| undefined | undefined |     {}    |  DETACHED | 
		 *| undefined |    null   | undefined |  DETACHED | 
		 *| undefined |    null   |     {}    |  DETACHED | 
		 *| undefined |     {}    | undefined |  DETACHED | 
		 *| undefined |     {}    |     {}    |  DETACHED | 
		 *| DataTable | undefined | undefined |     ??    | 
		 *| DataTable | undefined |     {}    | UNCHANGED | 
		 *| DataTable |    null   | undefined |  DELETED  | should be deleted immediately without waiting for 'acceptChanges()'
		 *| DataTable |    null   |     {}    |  DELETED  | 
		 *| DataTable |     {}    | undefined |   ADDED   | 
		 *| DataTable |     {}    |     {}    |  MODIFIED | 
		 *|___________|___________|___________|___________| 
		 */

		if (this._table != null) { // either 'null' or 'undefined'
			if (this._current === void 0) {
				return DataRowState.UNCHANGED;
			}
			if (this._current === null) {
				return DataRowState.DELETED;
			}
			return this._original ? DataRowState.MODIFIED : DataRowState.ADDED;
		}
		return DataRowState.DETACHED;
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

	private _getCache<T>(key: string): T {
		let dict = this._detachedCache || (this._detachedCache = Dict<any>());
		return dict.get(key);
	}

	set<T>(key: string, value: T): boolean
	set(values: {}): boolean
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
		throw new TypeError("invalid arguments passed to DataRow#set: " + valsOrKeyOrColumn)
	}

	private _setItems(values: {}): boolean {
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
		let store = this.isEditing() ? this._proposed : this._current
		return column.setValue(store, value);
	}

	private _setItemWithKey(key: string, value: any): boolean {

		let state: DataRowState = this.rowState();

		/**
		 * bitwise check (&) in case rowState() is 
		 * changed to return a set of flags in
		 * future versions
		 */
		if (state & DataRowState.DELETED) {
			throw new Error("Row already deleted");
		}

		/**
		 * if DataRow hasn't been added to a 
		 * DataRowCollection yet, cache the
		 * key(i.e. ColumnName) and value to 
		 * be set when the row is added.
		 */
		if (state & DataRowState.DETACHED) {
			return this._setCache(key, value);
		}

		/**
		 * search for column on parent table
		 * and use it to set the value;
		 */
		let table: DataTable, column: DataColumn;
		if (table = this.table()) {// double check that we have a valid parent table
			if (column = table.columns().get(key)) {
				return this._setItemWithColumn(column, value);
			} else {
				/**
				 * if the column could not be found on the table
				 * we create one with that key, add it to the table,
				 * and use it to set the value
				 */
				column = new DataColumn(key);
				if (table.columns().add(column)) {// check for successful addition
					return this._setItemWithColumn(column, value);
				}
			}
		} else {
			// somehow the row is not DETACHED but the table is not defined
			throw new Error("Cannot find DataRow#table")
		}
	}

	private _setCache(key: string, value: any): boolean {
		let dict = this._detachedCache || (this._detachedCache = new Dict<any>());
		if (dict.set(key, value)) {
			return true;
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

	deleteRow() {
		if (this.isEditing()) {
			this._proposed = null;
		} else {
			this._current = null;
		}
		if (this.rowState() & DataRowState.ADDED) {
			this.dispatchDelete();
		}
	}

	getChildRows(relation: DataRelation): DataRow[] {
		return relation.getChildRows(this);
	}

	getParentRow(relation: DataRelation): DataRow {
		return relation.getParentRow(this);
	}

	/**
     * @todo
     */
	setParentRow(relation: DataRelation) {

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
		var self = this;
		Object.keys(this._proposed).forEach(function (key) {
			self._current[key] = self._proposed[key];
		})
		delete this._proposed;
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
	 * Get reference to parent DataTable
	 */
	table(): DataTable;
	table(table: DataTable): this;
	table(table?: DataTable): any {
		if (table instanceof DataTable) {
			this._table = table;
			return this;
		}
		return this._table;
	}

	/**
	 * Semi-private (i.e. friendly?) method for adding row
	 * to a row collection. Used by DataRowCollection#add()
	 */
	_addToCollection(collection: DataRowCollection): boolean {
		// set the reference to the parent table 
		this.table(collection.table());

		let success = true;

		if (this._detachedCache) {
			// flush the cache
			let self = this;
			this._detachedCache.forEach(function (value: any, key: string, dict: Dict<any>) {
				success = success && self._setItemWithKey(key, value);
			})

			// cleanup cache to prevent memory leaks
			this._detachedCache.clear();
			delete this._detachedCache;
		}

		return success;
	}

	private dispatchAdd() {

	}

	private dispatchChange<T>(key:string, newValue:T, oldValue?:T)
	private dispatchChange<T>(column:DataColumn, newValue:T, oldValue?:T)
	private dispatchChange<T>(keyOrColumn:string | DataColumn, newValue:T, oldValue?:T) {
		this.table().emit({
			row:this,
			type:'rowchange',
			column: keyOrColumn instanceof DataColumn ? keyOrColumn : this.table().columns(keyOrColumn)
		})
	}

	private dispatchDelete() {
		
	}

}

function isDataColumn(dc: any): dc is DataColumn {
	return dc instanceof GenericDataColumn;
}