import { DataTable } from './DataTable';
import { DataRow } from './DataRow';
export declare class DataRowCollection {
    private _rows;
    private _table;
    constructor(dataTable: DataTable);
    readonly size: number;
    has(key: any): boolean;
    get(key: any): DataRow;
    add(row: DataRow): boolean;
    delete(key: any): boolean;
    clear(): void;
    find(value: any): DataRow;
    entriesArray(): [any, DataRow][];
    toArray(): DataRow[];
    table(): DataTable;
}
