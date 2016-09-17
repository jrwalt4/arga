import DataTable = require('./DataTable');
declare class DataSet {
    private _name;
    private _tables;
    private _relations;
    constructor(name?: string);
    tables(): DataTable[];
    addTable(oTable: string): void;
    addTable(oTable: DataTable): void;
    acceptChanges(): void;
    getChanges(): void;
    name(newValue?: string): string;
}
export = DataSet;
