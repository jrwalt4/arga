// IDataSchema.ts

namespace arga {
    export interface IDataSchema {
        columns(): DataColumn[];
        keyPath(): string;
    }
}