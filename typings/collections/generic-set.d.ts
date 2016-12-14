
declare module "collections/generic-set" {

    export = GenericSet

    interface GenericSet<TValue> {
        isSet:true
        add(TValue):boolean
        get(value:any):TValue
        union(values:GenericSet<TValue>):this
        intersection(values:GenericSet<TValue>):this
        difference(values:GenericSet<TValue>):this
        summetricDifference(value:GenericSet<TValue>):this
        remove(value:TValue):boolean
        contains(value:TValue):boolean
        toggle(value:TValue)
        deleteAll
    }
}