export interface IKeyedCollection<TKey, TValue> {
	size: number
	has(key: TKey): boolean
	get(key: TKey): TValue
	//set(value: TValue): boolean
	add(value: TValue): boolean
	delete(key: TKey): boolean
	clear()
	find(predicate: (value: TValue, key: TKey, collection: this) => boolean): TValue
	forEach(callback: (value: TValue, key: TKey, collection: this) => void, thisArg?: any)
}