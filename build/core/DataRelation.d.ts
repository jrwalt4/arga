import DataColumn = require('./DataColumn');
import DataRow = require('./DataRow');
declare abstract class DataRelation {
    private _parent;
    private _child;
    private _operator;
    constructor(_parent: DataColumn<any>, _child: DataColumn<any>, _operator: Function);
    abstract getChildRows(oRow: DataRow): DataRow[];
    abstract getParentRow(oRow: DataRow): DataRow;
}
export = DataRelation;
