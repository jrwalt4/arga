import DataColumn = require('./DataColumn');
import DataRow = require('./DataRow');
declare class DataRelation {
    private _parent;
    private _child;
    private _operator;
    constructor(_parent: DataColumn<any>, _child: DataColumn<any>, _operator: Function);
    getChildRows(oRow: DataRow): DataRow[];
    getParentRow(oRow: DataRow): DataRow;
}
export = DataRelation;
