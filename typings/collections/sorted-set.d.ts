
interface SortedSetConstructor {
    (values:any[]):SortedSet<any>
    <T>(values:T[]):SortedSet<T>
    new <T>(values:T[]):SortedSet<T>
    from<T>(values:T[]):SortedSet<T>
}

interface SortedSet<T> extends GenericCollection<T>, PropertyChanges<SortedSet<T>>, RangeChanges<T> {
    
}

declare var SortedSet:SortedSetConstructor