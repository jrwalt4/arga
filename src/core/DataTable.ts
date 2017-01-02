// DataTable.ts

import { DataSet } from './DataSet'
import { GenericDataColumn, DataColumn } from './DataColumn'
import { DataColumnCollection } from './DataColumnCollection'
import { DataRow } from './DataRow'
import { DataRowCollection } from './DataRowCollection'

import { EventEmitter2 as EventEmitter } from 'EventEmitter2'

let dt_counter = 0;

export class DataTable {

	private _dataSet: DataSet
	private _rowCollection = new DataRowCollection(this);
	private _columnCollection = new DataColumnCollection(this);
	private _primaryKey: DataColumn[];
	private _emitter: EventEmitter.emitter

	constructor(public name?: string) {
		dt_counter++
		this.name = name || "Table " + dt_counter;
	}

	dataSet(): DataSet
	dataSet(dataSet: DataSet): this
	dataSet(dataSet?: DataSet): any {
		if (dataSet === void 0) {
			return this._dataSet;
		}
		this._dataSet = dataSet;
	}

	rows(): DataRowCollection
	rows(key: any): DataRow
	rows(key?: any): any {
		if (key === void 0) {
			return this._rowCollection;
		}
		return this._rowCollection.get(key);
	}

	columns(): DataColumnCollection
	columns<T>(columnName: string): GenericDataColumn<T>
	columns(columnName?: string): any {
		if (columnName === void 0) {
			return this._columnCollection;
		}
		return this._columnCollection.get(columnName);
	}

	primaryKey(): DataColumn[]
	primaryKey(dataColumn: DataColumn): this
	primaryKey(dataColumnArray: DataColumn[]): this
	primaryKey(dataColumn?: DataColumn | DataColumn[]): any {
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

	toString() {
		return this.name;
	}

	emit(event:RowChangeEvent)
	emit(event:ColumnChangeEvent)
	emit(event:RowChangeEvent | ColumnChangeEvent) {
		this._emitter.emit(event.type, event);
	}

	on(event: RowChangeEventType, listener: RowChangeListener)
	on(event: ColumnChangeEventType, listener: ColumnChangeListener)
	on(event: string, listener: (...values: any[]) => void) {
		(this._emitter || (this._emitter = new EventEmitter())).on(event, listener);
	}

	off(event: RowChangeEventType, listener: RowChangeListener)
	off(event: ColumnChangeEventType, listener: ColumnChangeListener)
	off(event: string, listener: (...values: any[]) => void) {
		(this._emitter || (this._emitter = new EventEmitter())).off(event, listener);
	}
}

export type RowChangeEventType = "rowadded" | "rowchanged" | "rowdeleted"

export interface RowChangeEvent {
	type: RowChangeEventType
	row: DataRow
	column?:DataColumn
	oldValue?: any
	newValue?: any
}

export type RowChangeListener = (event: RowChangeEvent) => void

export type ColumnChangeEventType = "columnadded" | "columndeleted"

export interface ColumnChangeEvent {
	type:ColumnChangeEventType
	column:DataColumn
}

export type ColumnChangeListener = (event:ColumnChangeEvent)=>void