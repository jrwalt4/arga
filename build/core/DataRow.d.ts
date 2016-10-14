import DataTable = require('./DataTable');
import DataRowState = require('./DataRowState');
import DataRowVersion = require('./DataRowVersion');
import { EventEmitter2 as EventEmitter } from 'eventemitter2';
import DataColumn = require('./DataColumn');
export = DataRow;
declare class DataRow {
    private _table;
    private _original;
    private _current;
    private _proposed;
    observable: EventEmitter.emitter;
    constructor(values?: Object);
    private _createOriginal();
    private _createCurrent();
    private _createProposed();
    /**
     *
     */
    rowState(): DataRowState;
    has(key: string, version?: DataRowVersion): boolean;
    get<T>(column: DataColumn<T>, version?: DataRowVersion): T;
    get<T>(key: string, version?: DataRowVersion): T;
    private _getItemWithKey<T>(key, version?);
    private _getItemWithColumn<T>(column, version?);
    private _getVersion(version?);
    set<T>(key: string, newValue: T): this;
    set(values: Object): this;
    set<T>(column: DataColumn<T>, value: T): this;
    private _setItems(values);
    private _setItem(key, newValue);
    del(key: string): boolean;
    delete(): void;
    key(): string;
    /**
     * pass 'null' to set the table to 'undefined'
     */
    table(): DataTable;
    table(oDataTable: DataTable): this;
    beginEdit(): void;
    isEditing(): boolean;
    endEdit(): void;
    acceptChanges(): void;
    rejectChanges(): void;
    private dispatchBeforeRowChange(args);
    private dispatchRowChange(args);
    private dispatchBeforeDelete();
    private dispatchDelete();
}
declare namespace DataRow {
    type RowChangeEventArgs = {
        type: RowChangeType;
        key?: any;
    };
    type RowChangeType = "modify" | "delete" | "add";
}
