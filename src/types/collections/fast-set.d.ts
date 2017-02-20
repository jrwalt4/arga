
declare module 'collections/fast-set' {
    import GenericSet = require('collections/generic-set');
    import PropertyChanges = require('collections/listen/property-changes');
    import RangeChanges = require('collections/listen/range-changes');

    let FastSet: FastSetConstructor;
    export = FastSet;

    interface FastSetConstructor {
        <T>(
            values?: T[],
            equals?: (a: T, b: T) => boolean,
            hash?: (a: T) => string
        ): FastSet<T>
        new <T>(
            values?: T[],
            equals?: (a: T, b: T) => boolean,
            hash?: (a: T) => string
        ): FastSet<T>
        from<T>(values: T[]): FastSet<T>
    }
    interface FastSet<T> extends GenericSet<T>, PropertyChanges<T> {
        iterate():Iterator<T>
    }
}