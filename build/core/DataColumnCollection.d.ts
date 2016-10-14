import DataColumn = require('./DataColumn');
import DataTable = require('./DataTable');
import { KeyedCollection } from './Util';
export = DataColumnCollection;
declare class DataColumnCollection extends KeyedCollection<string, DataColumn<any>> {
    private _table;
    constructor(dataTable: DataTable);
    table(): DataTable;
}
