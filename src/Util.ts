// Util.ts
// Utilities used by arga.js

namespace arga {
	export namespace util {
		export function createKeyComparer(sKeyPath):(a:any, b:any)=>number {
			sKeyPath = sKeyPath || "";
			var path = sKeyPath.split('.');
			return function compare(key, compareValue):number {
				var keyValue = path.reduce(function(prevResult, nextVal) {
					return prevResult[nextVal];
				}, key)
				return keyValue < compareValue ? -1 : (keyValue > compareValue ? 1 : 0);
			}
		}
	}
}