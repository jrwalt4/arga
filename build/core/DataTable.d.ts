import { DataColumn } from './DataColumn';
import { DataColumnCollection } from './DataColumnCollection';
import { DataRow } from './DataRow';
import { DataRowCollection } from './DataRowCollection';
export declare class DataTable {
    private _name;
    private _rowCollection;
    private _columnCollection;
    private _keyPath;
    constructor(sName?: string);
    name(): string;
    name(sName: string): this;
    rows(): DataRowCollection;
    rows(key: any): DataRow;
    columns(): DataColumnCollection;
    columns(columnName: string): DataColumn;
    primaryKey(): DataColumn;
    acceptChanges(): void;
}
