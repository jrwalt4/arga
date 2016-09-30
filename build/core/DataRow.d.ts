import DataTable = require('./DataTable');
import DataRowState = require('./DataRowState');
import DataRowVersion = require('./DataRowVersion');
import { EventEmitter2 as EventEmitter } from 'eventemitter2';
import DataColumn = require('./DataColumn');
declare class DataRow {
    private _table;
    private _original;
    private _current;
    private _proposed;
    observable: EventEmitter.emitter;
    constructor(dataTable: DataTable, values?: Object);
    private _createCurrent();
    private _createProposed();
    get<T>(column: DataColumn<T>, version?: DataRowVersion): T;
    get<T>(key: string, version?: DataRowVersion): T;
    set(values: Object, version: DataRowVersion): this;
    set<T>(key: string, newValue: T, version?: DataRowVersion): this;
    del(key: string): any;
    has(key: string, version?: DataRowVersion): boolean;
    delete(version?: DataRowVersion): void;
    private _getItemWithColumn<T>(column, version?);
    private _getItemWithKey<T>(key, version?);
    private _setItem(column, newValue, version?);
    private _setItems(values, version?);
    private _getVersion(version?);
    private _getColumn(name);
    /**
     * pass 'null' to set the table to 'undefined'
     */
    table(): DataTable;
    table(oDataTable: DataTable): this;
    rowState(): DataRowState;
    beginEdit(): void;
    isEditing(): boolean;
    endEdit(): void;
    acceptChanges(): void;
    rejectChanges(): void;
    private dispatchRowChange(args);
    private dispatchBeforeRowChange(args);
}
declare namespace DataRow {
    type DataRowChangeEventArgs = {
        type: DataRowChangeType;
    };
    type DataRowChangeType = "modify" | "delete" | "add";
}
export = DataRow;
