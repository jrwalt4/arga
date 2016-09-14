import DataTable = require('./DataTable');
declare class DataColumn {
    private _name;
    private _index;
    private _table;
    private _keyPath;
    private _constraints;
    constructor(name: string);
    private _get(object);
    table(): DataTable;
    table(newTable: DataTable): this;
    name(): string;
    name(sName: string): this;
}
export = DataColumn;
