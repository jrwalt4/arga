import { DataTable } from './DataTable';
export declare class DataSet {
    private _name;
    private _tables;
    private _relations;
    constructor(sName?: string);
    tables(): DataTable[];
    newTable(sName?: string): DataTable;
    addTable(oTable: string): void;
    addTable(oTable: DataTable): void;
    acceptChanges(): void;
    getChanges(): void;
    name(newValue?: string): string;
}
