
declare module "collections/generic-collection" {

    //import {ContentEquals, ContentCompare} from 'collections/types'

    let GenericCollection:GenericCollectionConstructor;
    export = GenericCollection;

    interface GenericCollectionConstructor {
        from(...arguments:any[]):GenericCollection<any, any>
        from<TKey, TValue>(...arguments:any[]):GenericCollection<TKey, TValue>
    }

    interface GenericCollection<TKey, TValue> /* extends Array<T> */ {
        addEach(values: TValue[]): this
        deleteEach(values: any[], equals?: (a: TValue, b: TValue) => boolean): number
        forEach(callback: (value: TValue, key: TKey, object: this, depth: number) => void, thisp?: any)
        map<TOut>(callback: (value: TValue, key: TKey, object: this, depth: number) => TOut, thisp?: any): TOut[]
        enumerate(start?: number): [number, TValue]
        group<TGroupKey>(callback: (value: TValue, key: TKey, object: this) => TGroupKey):[TGroupKey, TValue[]][]
        toArray(): TValue[]
        /**
         * Returns an object with each property name and value
         * corresponding to the entries in this collection 
         */
        toObject(): Object
        filter(callback:(value:TValue, key:TKey, object:this, depth:number)=>boolean, thisp?:any):this
        every(callback:(value:TValue, key:TKey, object:this, depth:number)=>boolean, thisp?:any):boolean
        some(callback:(value:TValue, key:TKey, object:this, depth:number)=>boolean, thisp?:any):boolean
        all():boolean
        any():boolean
        min(compare:(a:TValue, b:TValue)=>number): TValue
        max(compare:(a:TValue, b:TValue)=>number): TValue
        /**
         * Returns the sum of all values in this collection
         * @param initial value to begin accumulating the sum (defaults to 0)
         */
        sum(zero?: any): number | string
        /**
         * Returns the arithmetic mean of the collection by computing the quotient 
         * of the sum of the collection and the count of its values.
         * @param initial value for the sum and count (defaults to 0)
         */
        average(zero?: number): number
        concat(...values:TValue[]):this
        /**
         * Assuming that this is a collection of collections, 
         * returns a new collection that contains all the values 
         * of each nested collection in order.
         */
        flatten(): this
        /**
         * Returns an array of the respective values in this collection
         * and in each collection provided as an argument
         */
        zip(...iterables):TValue[]
        join(delimiter:string):string
        /**
         * Returns a sorted array of the values in this collection
         */
        sorted(compare?: (a:TValue, b:TValue)=>number, by?:(item:TValue)=>any, order?:number): this
        /**
         * Returns a copy of this collection with the values in reverse order
         */
        reversed(): this
        /**
         * Creates a deep replica of this collection.
         * 
         * The default depth is Infinity, in which case, 
         * clone will explore every transitive reference 
         * of this object graph, producing a mirror image 
         * in the clone graph. A depth of 1 signifies a 
         * shallow clone, and a depth of 0 signifies no clone 
         * at all and this collection returns itself.
         * 
         * @param depth to clone. 
         * @param memo map to connect reference cycles.
         */
        clone(depth?: number, memo?: { has(value): boolean, set(key, value) }): this

        /**
         * Returns the only value in this collection, 
         * or undefined if there is more than one value, 
         * or if there are no values in the collection.
         */
        only(): TValue
        iterator():IterableIterator<TValue>
    }
}