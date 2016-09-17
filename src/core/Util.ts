// Util.ts
// Utilities used by arga.js

export function createContentComparer<K,V>(sKeyPath: string): ContentCompare<K,V> {

	return function compare(objA:K, objB:V): number {
		var keyA = resolveKeyPath(sKeyPath, objA)
		var keyB = resolveKeyPath(sKeyPath, objB)
		return keyA < keyB ? -1 : (keyA > keyB ? 1 : 0);
	}
}

export function createContentEquator<K,V>(sKeyPath:string):ContentEquals<K,V> {
	return function equals(objA:K, objB:V): boolean {
		var keyA = resolveKeyPath(sKeyPath, objA)
		var keyB = resolveKeyPath(sKeyPath, objB)
		return keyA == keyB;
	}
}

export function getKeyWithKeyPath<T>(sKeyPath: string, obj: any) {
	//sKeyPath
	var keyPathArray = sKeyPath.split('.');

}

export function compareKeys<T>(keyA: T, keyB: T) {
	if (indexedDB !== void 0) {
		return indexedDB.cmp(keyA, keyB);
	} else {
		return (keyA < keyB ? -1 : keyA > keyB ? 1 : 0);
	}
}

export function resolveKeyPath<T>(sKeyPath: string, obj: any): T {
	sKeyPath = sKeyPath || "";
	var path = sKeyPath.split('.');
	return path.reduce(function (prevResult: any, nextVal: string) {
		if (prevResult === void 0) {
			return void 0;
		}
		return prevResult[nextVal];
	}, obj)
}

export function createValueWithKeyPath(value:any, sKeyPath:string) {
	var keyPathArray = sKeyPath.split('.');
	return keyPathArray.reduceRight(function(prevValue:any, key:string, curIndex:number, array:string[]) {
		var wrappedValue = {};
		wrappedValue[key] = prevValue;
		return wrappedValue;
	}, value) 
}

function resolveKeyPathArray(aKeypath: string[]): any {

}