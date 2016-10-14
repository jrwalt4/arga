import DataColumnCollection = require('./DataColumnCollection');
import DataRowCollection = require('./DataRowCollection');
export = DataTable;
declare class DataTable {
    private _name;
    private _rows;
    private _columns;
    private _keyPath;
    constructor(sName?: string, sKeyPath?: string);
    name(): string;
    name(sName: string): this;
    rows(): DataRowCollection;
    columns(): DataColumnCollection;
    primaryKey(): string;
    keyPath(): string;
    acceptChanges(): void;
}
