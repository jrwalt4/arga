/// <reference path="./generic-collection.d.ts" />
/// <reference path="./listen/property-changes.d.ts" />
/// <reference path="./listen/range-changes.d.ts" />

import { GenericCollection, ContentEquals, ContentCompare } from './generic-collection'
import { PropertyChanges } from './listen/property-changes'

interface SortedArrayConstructor {
    /**
     * Hack so require('sorted-array').SortedArray
     * will work in MontageJS
     */
    SortedArray: SortedArrayConstructor
    (values?: any[], equals?: ContentEquals<any, any>, compare?: ContentCompare<any, any>, getDefault?: () => any): SortedArray<any>
    <T>(values?: T[], equals?: ContentEquals<any, T>, compare?: ContentCompare<any, T>, getDefault?: () => T): SortedArray<T>
    new (values?: any[], equals?: ContentEquals<any, any>, compare?: ContentCompare<any, any>, getDefault?: () => any): SortedArray<any>
    new <T>(values?: T[], equals?: ContentEquals<any, T>, compare?: ContentCompare<any, T>, getDefault?: () => T): SortedArray<T>
    from<T>(values?: T[]): SortedArray<T>
}

interface SortedArray<T> extends
    GenericCollection<T>,
    PropertyChanges<SortedArray<T>>,
    RangeChanges<T> {
    isSorted: boolean
    /**
     * Replaces a length of values from a starting 
     * position with the given values.
     */
    swap(start: number, length: number, values?: T[])
}

declare let SortedArray: SortedArrayConstructor

export = SortedArray;