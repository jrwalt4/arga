import DataColumn = require('./DataColumn');
import DataRow = require('./DataRow');
import DataRowCollection = require('./DataRowCollection');
import IDataSchema = require('./IDataSchema');
declare class DataTable implements IDataSchema {
    private _name;
    private _rows;
    private _columns;
    private _keyPath;
    private _keyComparer;
    constructor(sName?: string, sKeyPath?: string);
    name(): string;
    name(sName: string): this;
    rows(): DataRowCollection;
    addRow(oRow: DataRow): this;
    schema(): IDataSchema;
    columns(): DataColumn[];
    keyPath(): string;
    acceptChanges(): void;
}
export = DataTable;
