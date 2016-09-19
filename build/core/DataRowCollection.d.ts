import DataTable = require('./DataTable');
import DataRow = require('./DataRow');
declare class DataRowCollection {
    private _rows;
    private _table;
    constructor(dataTable: DataTable);
    add(...rows: DataRow[]): void;
    toArray(): DataRow[];
}
export = DataRowCollection;
