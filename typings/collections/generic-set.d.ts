
declare module "collections/generic-set" {

    import GenericCollection = require('collections/generic-collection')
    export = GenericSet

    interface GenericSet<TValue> extends GenericCollection<number,TValue>{
        isSet:true
        length:number
        add(TValue):boolean
        get(value:any):TValue
        union(values:GenericSet<TValue>):this
        intersection(values:GenericSet<TValue>):this
        difference(values:GenericSet<TValue>):this
        summetricDifference(value:GenericSet<TValue>):this
        map<TOut>(callback: (value: TValue, index:number, object: this, depth: number) => TOut, thisp?: any): TOut[]
        remove(value:TValue):boolean
        delete(value:TValue):boolean
        clear()
        contains(value:TValue):boolean
        toggle(value:TValue)
        deleteAll()
    }
}