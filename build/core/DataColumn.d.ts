import { DataTable } from './DataTable';
import { DataColumnConstraint } from './DataColumnConstraint';
export declare type DataColumnConstructorOptions = {
    keyPath?: string;
    primaryKey?: boolean;
    index?: boolean;
    constraints?: DataColumnConstraint[];
    get?(object: {}): any;
    set?(object: {});
};
export declare class DataColumn {
    private _name;
    private _index;
    private _table;
    private _keyPath;
    private _constraints;
    constructor(name: string, constructorOptions?: DataColumnConstructorOptions);
    getValue<T>(data: Object): T;
    setValue<T>(data: Object, value: T): void;
    table(): DataTable;
    table(dataTable: DataTable): this;
    name(): string;
    name(sName: string): this;
    keyPath(): string;
}
