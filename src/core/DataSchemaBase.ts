// IDataSchema.ts

import DataColumn = require('./DataColumn')

interface DataSchemaBase {
    columns(): DataColumn<any>[];
    keyPath(): string;
}
export = DataSchemaBase