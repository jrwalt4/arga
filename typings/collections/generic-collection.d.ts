export interface GenericCollection<T> extends Array<T> {

    has(value: any): boolean

    get(value: any): T

    add(value: T): boolean

    delete(value: any): boolean

    addEach(values: T[]): this

    deleteEach(values: any[], equals?: ContentEquals<any, T>): number

    deleteAll(value: any, equals?: ContentEquals<any, typeof value>): void

    /**
     * Replaces a length of values from a starting position
     * with the given values
     */
    swap(start: number, length: number, values?: T[])

    clear()

    lastIndexOf(value: any): number

    //find(value:any, equals?:ContentEquals, start?:number):T

    /**
     * Finds the first equivalent value
     * @param equivalent value
     * @param equivalence test
     * @param start index to begin search
     */
    findValue(value: any, equals?: ContentEquals<typeof value, T>, start?: number): T

    findLastValue(value: any, equals?: ContentEquals<typeof value, T>, start?: number): T

    /**
     * Returns a sorted array of the values in this collection
     */
    sorted(compare?: ContentCompare<T, T>): T[]

    /**
     * Returns a copy of this collection with the values in reverse order
     */
    reversed(): this

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

    min(): T

    max(): T

    /**
     * Returns one, arbitrary value from this collection, 
     * or <i>undefined</i> if there are none.
     */
    one(): T

    /**
     * Returns the only value in this collection, 
     * or undefined if there is more than one value, 
     * or if there are no values in the collection.
     */
    only(): T

    /**
     * Returns an array of the respective values in this collection
     * and in each collection provided as an argument
     */
    zip(...iterables)

    enumerate(start?: number)

    /**
     * Assuming that this is a collection of collections, 
     * returns a new collection that contains all the values 
     * of each nested collection in order.
     */
    flatten(): this

    toArray(): T[]

    /**
     * Returns an object with each property name and value
     * corresponding to the entries in this collection 
     */
    toObject(): Object

    toJSON(): string

    equals(value: any, equals?: ContentEquals<typeof value, T>): boolean

    compare(value: any, compare?: ContentCompare<typeof value, T>): number

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
    clone(depth?: number, memo?: { has(value): boolean, set(key, value) }): Object

    /**
     * Creates a shallow clone of this collection.
     */
    constructClone(values?: T[]): this
}

type ContentEquals<K, V> = (objA: K, objB: V) => boolean
type ContentCompare<K, V> = (objA: K, objB: V) => number