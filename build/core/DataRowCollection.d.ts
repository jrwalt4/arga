import DataTable = require('./DataTable');
import DataRow = require('./DataRow');
export = DataRowCollection;
declare class DataRowCollection {
    private _rows;
    private _table;
    constructor(dataTable: DataTable, sKeyPath: string);
    size(): number;
    has(value: any): boolean;
    get(value: any): DataRow;
    add(...rows: DataRow[]): void;
    clear(): void;
    toArray(): DataRow[];
    table(): DataTable;
}
