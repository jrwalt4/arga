declare module "collections/types" {
    export type ContentEquals<K, V> = (objA: K, objB: V) => boolean
    export type ContentCompare<K, V> = (objA: K, objB: V) => number
    export type ContentHash<T> = (obj:any) => T

    export type PropertyChangeListener<T> = (value: any, key: string, collection: T) => void | Object

    export type RangeChangeListener<T> = (plus: T[], minus: T[], index: number) => void | Object
}