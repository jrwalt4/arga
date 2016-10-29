declare module "collections/generic-map" {
    export = GenericMap
}

interface GenericMap<K,V> extends Array<V>{
    has(key:K):boolean
    get(key:K):V
    set(key:K, value:V):boolean
    add(value:V, key:K):boolean
    delete(key:K):boolean
    clear()
}