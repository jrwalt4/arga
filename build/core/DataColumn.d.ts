import DataTable = require('./DataTable');
declare class DataColumn<TKey> {
    private _name;
    private _index;
    private _table;
    private _keyPath;
    private _constraints;
    private _Item;
    constructor(table: DataTable, name: string, keyPath?: string);
    getValue(object: Object): any;
    table(): DataTable;
    name(): string;
    name(sName: string): this;
    keyPath(): string;
}
export = DataColumn;