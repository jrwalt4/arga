
declare module "collections/generic-set" {

    import GenericCollection = require('collections/generic-collection')
    export = GenericSet

    interface GenericSet<T> {
        pop():T
        shift():T
        union(values:GenericCollection<T>):this
        intersection(values:GenericCollection<T>)
    }
}