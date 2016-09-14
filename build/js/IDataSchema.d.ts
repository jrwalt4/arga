import DataColumn = require('./DataColumn');
interface IDataSchema {
    columns(): DataColumn[];
    keyPath(): string;
}
export = IDataSchema;
