import DataColumn = require('./DataColumn');
import DataTable = require('./DataTable');
declare class DataColumnCollection {
    private _table;
    private _columns;
    constructor(dataTable: DataTable);
    add(dataColumn: DataColumn<any>): this;
    get(col: string): DataColumn<any>;
    remove(col: string | DataColumn<any>): void;
}
export = DataColumnCollection;
