declare module "collections/sorted-set" {

    import GenericCollection = require('collections/generic-collection')
    import PropertyChanges = require('collections/listen/property-changes')
    import RangeChanges = require('collections/listen/range-changes');

    export = SortedSet

    let SortedSet: SortedSetConstructor

    interface SortedSetConstructor {
        (values?: any[]): SortedSet<any>
        <T>(values?: T[]): SortedSet<T>
        new (values?: any[]): SortedSet<any>
        new <T>(values?: T[]): SortedSet<T>
        from<T>(values?: T[]): SortedSet<T>
    }

    interface SortedSet<T> extends
        GenericCollection<T>,
        PropertyChanges<SortedSet<T>>,
        RangeChanges<T> {

        swap(): boolean

    }
}
