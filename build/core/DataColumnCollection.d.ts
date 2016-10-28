import { DataColumn } from './DataColumn';
import { DataTable } from './DataTable';
import { KeyedCollection } from './Util';
export declare class DataColumnCollection extends KeyedCollection<string, DataColumn> {
    private _table;
    constructor(dataTable: DataTable);
    add(dataColumn: DataColumn): boolean;
}
