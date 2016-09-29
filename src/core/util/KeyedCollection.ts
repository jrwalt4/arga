
class KeyedCollection<TKey, TValue> {

}

export = KeyedCollection;

interface SimpleCollection<T> {

	/**
	 * Whether the collection contains the key
	 */
	has(key: Object): boolean

	/**
	 * Returns the value of the requested key
	 */
	get(index: number): T
	get(key: Object): T

	/**
	 * Add the value to the set
	 */
	add(value: T): number

	/**
	 * deletes the value at the provided key
	 */
	del(index: number): boolean
	del(key: Object): boolean
}