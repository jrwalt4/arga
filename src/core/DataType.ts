// DataType.ts

import { deserializeString } from './Util'

export type DataTypeConstructorOptions = {
    serialize: (value: any) => string
    deserialize: (value: string) => any
}

export class GenericDataType<T> {

    constructor(typeOrOptions?: DataTypeConstructorOptions) {
        let options: DataTypeConstructorOptions = typeOrOptions;
        if (options && options.serialize) {
            this.serialize = options.serialize
        }
        if (options && options.deserialize) {
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
            case "string": return GenericDataType.StringType
            case "number": return GenericDataType.NumberType
            case "object": return GenericDataType.ObjectType
            case "any":
            default:
                return new GenericDataType<any>()
        }
    }

    static StringType = new GenericDataType<string>({
        serialize: (value) => value.toString(),
        deserialize: (value) => deserializeString<string>(value)
    });

    static NumberType = new GenericDataType<number>();
    
    static ObjectType = new GenericDataType<{}>();

    static AnyType = new GenericDataType<any>();
}

export let DataType = GenericDataType;
export type DataType = GenericDataType<any>;