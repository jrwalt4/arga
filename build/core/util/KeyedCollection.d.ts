export interface IKeyedCollection<TKey, TValue> {
    size: number;
    has(key: TKey): boolean;
    get(key: TKey): TValue;
    add(value: TValue): boolean;
    delete(key: TKey): boolean;
    find(predicate: ContentCompare<TValue>): TValue;
    keysArray(): TKey[];
    valuesArray(): TValue[];
    entriesArray(): [TKey, TValue][];
    toString(): string;
}
export declare class KeyedCollection<TKey, TValue> implements IKeyedCollection<TKey, TValue> {
    private _data;
    private _keyPath;
    constructor(keyPath: string);
    has(key: TKey): boolean;
    get(key: TKey): TValue;
    add(value: TValue): boolean;
    delete(key: TKey): boolean;
    private indexOf(key);
    find(predicate: ContentCompare<TValue>): TValue;
    keysArray(): TKey[];
    valuesArray(): TValue[];
    entriesArray(): [TKey, TValue][];
    toString(): string;
    size: number;
}
export declare type ContentCompare<T> = (value: T, index: number, array: T[]) => boolean;
