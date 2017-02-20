declare module 'collections/fast-map' {
  import GenericMap = require('collections/generic-map')
  export = FastMap;
  let FastMap: FastMapConstructor

  interface FastMapConstructor {
    new <TKey, TValue>(
      values?: [TKey, TValue][],
      equals?: (keyA: TKey, keyB: TKey) => boolean,
      hash?: (key: TKey) => string,
      getDefault?: (key: TKey) => TValue
    ): FastMap<TKey, TValue>
    <TKey, TValue>(
      values?: [TKey, TValue][],
      equals?: (a: TValue, b: TValue) => boolean,
      hash?: (value: TValue) => string,
      getDefault?: (key: TKey) => TValue
    ): FastMap<TKey, TValue>
  }

  interface FastMap<TKey, TValue> extends GenericMap<TKey, TValue> {

  }
}