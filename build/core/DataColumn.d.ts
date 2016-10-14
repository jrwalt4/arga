import DataTable = require('./DataTable');
import DataRow = require('./DataRow');
export = DataColumn;
declare class DataColumn<T> {
    private _name;
    private _index;
    private _table;
    private _keyPath;
    private _constraints;
    constructor(table: DataTable, name: string, keyPath?: string);
    getValue(data: Object): T;
    setValue(row: DataRow, value: T): void;
    table(): DataTable;
    name(): string;
    name(sName: string): this;
    keyPath(): string;
}
