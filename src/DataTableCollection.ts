// DataTableCollection.ts

import {KeyedDictionary} from './util'
import {DataTable} from './DataTable'
import {DataSet} from './DataSet'

export class DataTableCollection extends KeyedDictionary<DataTable> {
    constructor(public dataSet:DataSet) {
        super('name');
        if (dataSet === void 0) {
            throw new Error("Illegal DataTableCollection constructor: expected DataSet as first argument")
        }
    }

    add(table:DataTable):boolean {
        let added = super.add(table);
        if(added) {
            table._addTableToCollection(this);
        }
        return added;
    }

}