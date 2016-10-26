import { DataTable } from './DataTable';
import { DataRow } from './DataRow';
export declare class DataRowCollection {
    private _rows;
    private _table;
    constructor(dataTable: DataTable);
    size(): number;
    has(value: any): boolean;
    get(value: any): DataRow;
    add(...rows: DataRow[]): void;
    private _addRow(row);
    clear(): void;
    toArray(): DataRow[];
    table(): DataTable;
}
