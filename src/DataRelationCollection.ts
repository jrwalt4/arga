// DataRelationCollection.ts

import {DataSet} from './DataSet'
import {DataTable} from './DataTable'
import {DataRelation} from './DataRelation'
import {KeyedDictionary} from './util'
import * as FastSet from'collections/fast-set'

export class DataRelationCollection extends KeyedDictionary<DataRelation> {
    private _dataSet:DataSet
    constructor(dataSet:DataSet) {
        if (dataSet == null) {
            throw new Error("Illegal DataRealtionCollection constructor: expected DataTable as first argument")
        }
        super('name');
        this._dataSet = dataSet;
    }

    get dataSet():DataSet {
        return this._dataSet;
    }

    add(relation:DataRelation):boolean {
        if(super.add(relation)) {
            return relation._addRelationToCollection(this);
        }
        return false;
    }
}