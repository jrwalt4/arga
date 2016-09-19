import DataTable = require('./DataTable');
import DataRowState = require('./DataRowState');
import DataRowVersion = require('./DataRowVersion');
import { SimpleCollection } from './Util';
declare class DataRow implements SimpleCollection {
    private _table;
    private _original;
    private _current;
    private _proposed;
    constructor(dataTable: DataTable);
    private _createCurrent();
    private _createProposed();
    get<T>(key: string, version?: DataRowVersion): T;
    set<T>(key: string, newValue: T, version?: DataRowVersion): this;
    del(key: string): any;
    has(key: string): boolean;
    delete(version?: DataRowVersion): void;
    item(key: string, newValue?: any, version?: DataRowVersion): any;
    private _getItem(key, version?);
    private _setItem(column, newValue, version?);
    private _getVersion(version);
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
    dispatchRowChange(): void;
    dispatchBeforeRowChange(): void;
}
export = DataRow;
