
declare module "collections/sorted-array" {
    import GenericCollection = require('collections/generic-collection');
    import PropertyChanges = require('collections/listen/property-changes');
    import RangeChanges = require('collections/listen/range-changes');

    export = SortedArray;

    let SortedArray: SortedArrayConstructor

    interface SortedArrayConstructor {
        /**
         * Hack so require('sorted-array').SortedArray
         * will work in MontageJS
         */
        SortedArray: SortedArrayConstructor
        (values?: any[], equals?: (a, b) => boolean, compare?: (a, b) => number, getDefault?: () => any): SortedArray<any>
        <T>(values?: T[], equals?: (a: T, b: T) => boolean, compare?: (a: T, b: T) => number, getDefault?: () => T): SortedArray<T>
        new (values?: any[], equals?: (a, b) => boolean, compare?: (a, b) => number, getDefault?: () => any): SortedArray<any>
        new <T>(values?: T[], equals?: (a: T, b: T) => boolean, compare?: (a: T, b: T) => number, getDefault?: () => T): SortedArray<T>
        from<T>(values?: T[]): SortedArray<T>
    }

    interface SortedArray<T> extends
        GenericCollection<number, T>,
        PropertyChanges<SortedArray<T>>,
        RangeChanges<T> {
        isSorted: true
        length:number
        array:T[]
        has(value: any): boolean
        get(value: any): T

        add(value: T): boolean

        delete(value: any): boolean

        deleteAll(value: any, equals?:(a:T, b:T)=>boolean): number

        indexOf(value:any):T

        /**
         * Replaces a length of values from a starting position
         * with the given values
         */
        swap(start: number, length: number, values?: T[])

        lastIndexOf(value: any): number

        //find(value:any, equals?:ContentEquals, start?:number):T

        /**
         * Finds the first equivalent value
         * @param equivalent value
         * @param equivalence test
         * @param start index to begin search
         */
        findValue(value: any, equals?: (a:T, b:T)=>boolean, start?: number): T

        findLastValue(value: any, equals?: (a:T, b:T)=>boolean, start?: number): T



        /**
         * Returns one, arbitrary value from this collection, 
         * or <i>undefined</i> if there are none.
         */
        one(): T

        clear()

        toJSON(): string

        equals(value: any, equals?: (a:T, b:T)=>boolean): boolean

        compare(value: any, compare?: (a:T, b:T)=>number): number

        /**
         * Creates a shallow clone of this collection.
         */
        constructClone(values?: T[]): this
    }

}