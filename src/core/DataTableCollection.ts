// DataTableCollection.ts

import {KeyedDictionary} from './Util'
import {DataTable, addTableToCollection} from './DataTable'
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
            addTableToCollection(table, this);
        }
        return added;
    }

}