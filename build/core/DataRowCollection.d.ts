import DataRow = require('./DataRow');
declare class DataRowCollection {
    private _rows;
    constructor();
    add(...rows: DataRow[]): void;
    toArray(): DataRow[];
}
export = DataRowCollection;
