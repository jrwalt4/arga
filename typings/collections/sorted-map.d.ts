declare module "collections/sorted-map" {

    import GenericCollection = require('collections/generic-collection');
    import PropertyChanges = require('collections/listen/property-changes')
    import RangeChanges = require('collections/listen/range-changes');

    export = SortedMap

    let SortedMap:SortedMapConstructor

    interface SortedMapConstructor {
        (values?: any[]): SortedMap<any, any>
        <TKey, TValue>(values?: TValue[]): SortedMap<TKey, TValue>
        new (values?: any[]): SortedMap<any, any>
        new <TKey, TValue>(values?: TValue[]): SortedMap<TKey, TValue>
        from<TKey, TValue>(values?: TValue[]): SortedMap<TKey, TValue>
    }

    interface SortedMap<TKey, TValue> extends
        GenericCollection<TKey, TValue>,
        PropertyChanges<SortedMap<TKey, TValue>> {
            get(key:TKey):TValue
    }
}