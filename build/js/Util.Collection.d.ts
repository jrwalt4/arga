export declare class Collection<T> {
    private _keyPath;
    private _data;
    private _keyPathArray;
    constructor(keyPath?: string, data?: T[]);
    get(index: number): T;
    toArray(): T[];
    add(obj: T): void;
    private _find(obj);
    remove(obj: T): T;
    keyPath(): string;
    keyPath(newKeyPath: string): this;
    getKey(obj: T): any;
    cmp(a: any, b: any): any;
}
