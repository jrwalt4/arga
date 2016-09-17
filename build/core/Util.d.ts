export declare function createContentComparer<K, V>(sKeyPath: string): ContentCompare<K, V>;
export declare function createContentEquator<K, V>(sKeyPath: string): ContentEquals<K, V>;
export declare function getKeyWithKeyPath<T>(sKeyPath: string, obj: any): void;
export declare function compareKeys<T>(keyA: T, keyB: T): number;
export declare function resolveKeyPath<T>(sKeyPath: string, obj: any): T;
export declare function createValueWithKeyPath(value: any, sKeyPath: string): any;
