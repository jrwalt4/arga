// IDataSchema.ts

import {DataColumn} from './DataColumn'

export interface DataSchemaBase {
    columns(): DataColumn[];
    keyPath(): string;
}