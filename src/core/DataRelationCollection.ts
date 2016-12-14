// DataRelationCollection.ts

import {DataSet} from './DataSet'
import {DataTable} from './DataTable'
import {DataRelation} from './DataRelation'
import FastSet = require('collections/fast-set');

export class DataRelationCollection extends FastSet<DataRelation> {
    private _dataSet:DataSet
    constructor(dataSet:DataSet) {
        if (dataSet === void 0) {
            throw new Error("Illegal DataRealtionCollection constructor: expected DataTable as first argument")
        }
        super();
        this._dataSet = dataSet;
    }

    dataSet():DataSet {
        return this._dataSet;
    }

    add(relation:DataRelation):boolean {
        if(super.add(relation)) {
            relation.dataSet(this._dataSet)
            return true;
        }
        return false;
    }
}