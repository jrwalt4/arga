
declare module 'collections/fast-set' {
    import GenericSet = require('collections/generic-set');
    import PropertyChanges = require('collections/listen/property-changes');
    import RangeChanges = require('collections/listen/range-changes');

    let FastSet:FastSetConstructor;
    export = FastSet;

    interface FastSetConstructor {
        <T>():FastSet<T>
        new <T>():FastSet<T>
        from<T>(values:T[]):FastSet<T>
    }
    interface FastSet<T> extends GenericSet<T>,  PropertyChanges<T> {

    }
}