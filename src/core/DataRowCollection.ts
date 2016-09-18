// DataRowCollection.ts


//import {Collection} from './Util.Collection'
import SortedArray = require('collections/sorted-array');
import DataRow = require('./DataRow')

class DataRowCollection {
    private _rows:SortedArray<DataRow>
    constructor() {
        this._rows = new SortedArray<DataRow>();
    }

    add(...rows:DataRow[]) {
        this._rows.addEach(rows);
    }

    toArray():DataRow[] {
        return this._rows.toArray();
    }
}

export = DataRowCollection;