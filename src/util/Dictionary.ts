import { EmptyObject } from './EmptyObject'
export class Dictionary<TValue> {

  private _store = new EmptyObject()
  public size = 0;

  constructor(values?: {}) {
    if (values) {
      Object.keys(values).forEach((key: string) => {
        this.set(key, values[key]);
      })
    }
  }

  set(key: string, value: TValue): TValue {
    if (!this.has(key)) {
      this.size++;
    }
    return this._store[_hash(key)] = value;
  }

  get(key: string, fallback?: TValue): TValue {
    if (this.has(key)) {
      return this._store[_hash(key)]
    }
    return fallback;
  }

  has(key: string): boolean {
    return _hash(key) in this._store;
  }

  delete(key: string): boolean {
    if (this.has(key)) {
      this.size--;
      return delete this._store[_hash(key)];
    }
    return false;
  }

  clear(): void {
    this._store = new EmptyObject();
    this.size = 0;
  }

  forEach(
    callback: (value: TValue, key: string, dictionary: this) => void,
    thisArg?: any
  ): void {
    for (let _key in this._store) {
      if (_key.substr(0, 1) === _magicString) {
        callback.call(thisArg, this._store[_key], _dehash(_key), this);
      }
    }
  }

  find(
    predicate: (value: TValue, key: string, dictionary: this) => boolean,
    thisArg?: any
  ): TValue {
    for (let _key in this._store) {
      if (_key.substr(0, 1) === _magicString) {
        if (predicate.call(thisArg, this._store[_key], _dehash(_key), this)) {
          return this._store[_key];
        }
      }
    }
  }

  findKey(
    predicate: (value: TValue, key: string, dictionary: this) => boolean,
    thisArg?: any
  ): string {
    for (let _key in this._store) {
      if (_key.substr(0, 1) === _magicString) {
        if (predicate.call(thisArg, this._store[_key], _dehash(_key), this)) {
          return _dehash(_key);
        }
      }
    }
  }

}

let _magicString = "~";
let _magicStringLength = _magicString.length;

function _hash(key: string) {
  return _magicString + key;
}

function _dehash(key: string) {
  return key.substr(_magicStringLength);
}