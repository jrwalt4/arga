// Collection.ts
// A data structure class for a collection container

export class Collection<T> {

        private _keyPath: string;
        private _data: T[];
        private _keyPathArray: string[];

        constructor(keyPath: string = "", data?: T[]) {
            this.keyPath(keyPath);
            this._data = data || [];
        }

        get(index: number): T {
            return this._data[index];
        }

        toArray(): T[] {
            return this._data.slice();
        }

        add(obj: T) {
            this._data.push(obj);
            this._data.sort(this.cmp);
        }

        private _find(obj: T): T {
            return this._data.find(function (val) {
                return val == obj;
            })
        }

        remove(obj: T): T {
            var index = this._data.findIndex(function (val, i) {
                return val == obj;
            });
            if (index < 0) {
                return undefined
            }
            var retObj = this._data[index];
            this._data[index] = undefined;
            return retObj;
        }

        keyPath(): string;
        keyPath(newKeyPath: string): this;
        keyPath(newKeyPath?: string): any {
            if (newKeyPath !== undefined) {
                this._keyPath = newKeyPath;
                this._keyPathArray = this._keyPath.split('.');
                return this;
            }
            return this._keyPath;
        }

        getKey(obj: T) {
            return this._keyPathArray.reduce(key_path_reducer, obj);
        }

        cmp(a, b) {
            return cmp_keys(this.getKey(a), this.getKey(b));
        }
    }

    function key_path_reducer(prevKey: Object, nextKey: string, index: number, keyPathArray: string[]) {
        return prevKey === undefined ? undefined : prevKey[nextKey];
    }

    var cmp_keys = (typeof indexedDB !== 'undefined') ? indexedDB.cmp.bind(indexedDB) :
        function (a: any, b: any) {
            return a < b ? -1 : (a > b ? 1 : 0);
        }