export declare function createContentComparer<K, V>(sKeyPath: string): ContentCompare<K, V>;
export declare function createContentEquator<K, V>(sKeyPath: string): ContentEquals<K, V>;
export declare function compareKeys<T>(keyA: T, keyB: T): number;
export declare function resolveKeyPath<T>(sKeyPath: string, obj: any): T;
export declare function createValueWithKeyPath(value: any, sKeyPath: string): any;
export interface SimpleCollection {
    /**
     * Whether the collection contains the key
     */
    has(key: any): any;
    /**
     * Returns the value of the requested key
     */
    get(key: any): any;
    /**
     * Sets the value at the requested key
     */
    set(key: any, value: any): any;
    /**
     * deletes the value at the provided key
     */
    del(key: any): any;
}
