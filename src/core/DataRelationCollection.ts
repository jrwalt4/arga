// DataRelationCollection.ts

import {DataSet} from './DataSet'
import {DataTable} from './DataTable'
import {DataRelation} from './DataRelation'
import {KeyedDictionary} from './Util'
import FastSet = require('collections/fast-set');

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
            return (relation as any)._addRelationToCollection(this);
        }
        return false;
    }
}