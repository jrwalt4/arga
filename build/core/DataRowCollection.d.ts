import SortedArray = require('collections/sorted-array');
import DataRow = require('./DataRow');
declare class DataRowCollection extends SortedArray<DataRow> {
    constructor();
}
export = DataRowCollection;
