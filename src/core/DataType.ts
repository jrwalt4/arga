// DataType.ts

import { deserializeString } from './Util'

export type DataTypeConstructorOptions = {
    serialize: (value: any) => string
    deserialize: (value: string) => any
}

export class GenericDataType<T> {

    constructor(typeOrOptions?: DataTypeConstructorOptions) {
        let options: DataTypeConstructorOptions = typeOrOptions;
        if (options.serialize) {
            this.serialize = options.serialize
        }
        if (options.deserialize) {
            this.deserialize = options.deserialize
        }

    }
    serialize(value: T): string {
        return value.toString();
    }
    deserialize(string: string): T {
        return JSON.parse(string);
    }

    static getType(typeName: string): DataType {
        switch (typeName) {
            case "string": return StringType
            case "number": return NumberType
            case "object":return ObjectType
        }
    }
}

// | "number" | "object"

let StringType = new GenericDataType<string>({
    serialize: (value) => value.toString(),
    deserialize: (value) => deserializeString<string>(value)
})
let NumberType = new GenericDataType<number>()
let ObjectType = new GenericDataType<{}>();

export class DataType extends GenericDataType<any>{ }