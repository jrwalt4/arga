import DataColumnCollection = require('./DataColumnCollection');
import DataRowCollection = require('./DataRowCollection');
declare class DataTable {
    private _name;
    private _rows;
    private _columns;
    private _keyPath;
    private _keyComparer;
    constructor(sName?: string, sKeyPath?: string);
    name(): string;
    name(sName: string): this;
    rows(): DataRowCollection;
    columns(): DataColumnCollection;
    keyPath(): string;
    acceptChanges(): void;
}
export = DataTable;
