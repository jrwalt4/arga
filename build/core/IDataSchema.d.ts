import DataColumn = require('./DataColumn');
interface IDataSchema {
    columns(): DataColumn<any>[];
    keyPath(): string;
}
export = IDataSchema;
