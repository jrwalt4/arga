// DataRowCollection.ts


//import {Collection} from './Util.Collection'
import SortedArray = require('collections/sorted-array');
import DataRow = require('./DataRow')

class DataRowCollection extends SortedArray<DataRow> {
    constructor() {
        super(new Array<DataRow>())
    }
}

export = DataRowCollection;