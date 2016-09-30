export = KeyedCollection;
declare class KeyedCollection<TKey, TValue> {
    private _data;
    private _keyPath;
    constructor(keyPath: string);
    has(key: TKey): boolean;
    get(key: TKey): TValue;
    set(value: TValue): boolean;
    add(newValue: TValue): boolean;
    del(key: TKey): boolean;
    indexOf(key: TKey): number;
    keysArray(): TKey[];
    valuesArray(): TValue[];
    entriesArray(): (TKey | TValue)[][];
    toString(): string;
    size: number;
    static isCollection(obj: any): boolean;
}
