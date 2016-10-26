import { DataColumn } from './DataColumn';
import { DataRow } from './DataRow';
export declare abstract class DataRelation {
    private _parent;
    private _child;
    private _operator;
    constructor(_parent: DataColumn, _child: DataColumn, _operator: Function);
    abstract getChildRows(oRow: DataRow): DataRow[];
    abstract getParentRow(oRow: DataRow): DataRow;
}
