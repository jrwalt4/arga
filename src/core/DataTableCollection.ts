// DataTableCollection.ts

import {KeyedCollection} from './Util'
import {DataTable} from './DataTable'
import {DataSet} from './DataSet'

export class DataTableCollection extends KeyedCollection<string, DataTable> {
    private _set:DataSet
    constructor(dataSet:DataSet) {
        if (dataSet === void 0) {
            throw new Error("Illegal DataTableCollection constructor: expected DataSet as first argument")
        }
        super('name');
        this._set = dataSet;
    }
    add(table:DataTable):boolean {
        let added = super.add(table);
        if(added) {
            table.dataSet(this._set);
        }
        return added;
    }
}