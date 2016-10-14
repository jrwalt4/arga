import DataRow = require('../DataRow');
export declare function createContentCompare<K, V>(sKeyPath: string): ContentCompare<K, V>;
export declare function createContentEquals<K, V>(sKeyPath: string): ContentEquals<K, V>;
export declare function compareKeys<T>(keyA: T, keyB: T): number;
export declare function resolveKeyPath<T>(sKeyPath: string, obj: any): T;
export declare function resolveKeyPathArray<T>(aKeyPathArray: string[], obj: any): T;
export declare function resolveKeyPathFromDataRow<T>(sKeyPath: string, row: DataRow): T;
export declare function createValueWithKeyPath(value: any, sKeyPath: string): any;
export declare function deepCopy(value: any): typeof value;
export declare function flattenPrototypeChain(obj: Object, depth?: number, doNotCopy?: Object[]): Object;
export declare function createUUID(): string;
