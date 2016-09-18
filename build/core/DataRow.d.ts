import DataTable = require('./DataTable');
import DataRowState = require('./DataRowState');
import DataRowVersion = require('./DataRowVersion');
declare class DataRow {
    private _table;
    private _original;
    private _current;
    private _proposed;
    constructor(dataTable: DataTable);
    private _createCurrent();
    /**
     * pass 'null' to set the table to 'undefined'
     */
    table(): DataTable;
    table(oDataTable: DataTable): this;
    rowState(): DataRowState;
    beginEdit(): void;
    isEditing(): boolean;
    private _createProposed();
    endEdit(): void;
    get(): any;
    set(): any;
    del(): any;
    has(): boolean;
    item(column: string, newValue?: any, version?: DataRowVersion): any;
    private _getItem(column, version);
    private _setItem(column, newValue, version);
    private _getVersion(version);
    acceptChanges(): void;
    rejectChanges(): void;
    dispatchRowChange(): void;
    dispatchBeforeRowChange(): void;
}
export = DataRow;
