interface Array<T> {
    find(predicate:(value:T, index:number, array:T[])=>boolean, thisArg?:any):T
    findIndex(predicate:(value:T, index:number, array:T[])=>boolean, thisArg?:any):number
}

if (!Array.prototype.findIndex) {
  Object.defineProperty(Array.prototype, 'findIndex', {
    value: function(predicate) {
      'use strict';
      if (this == null) {
        throw new TypeError('Array.prototype.findIndex called on null or undefined');
      }
      if (typeof predicate !== 'function') {
        throw new TypeError('predicate must be a function');
      }
      var list = Object(this);
      var length = list.length >>> 0;
      var thisArg = arguments[1];
      var value;

      for (var i = 0; i < length; i++) {
        value = list[i];
        if (predicate.call(thisArg, value, i, list)) {
          return i;
        }
      }
      return -1;
    },
    enumerable: false,
    configurable: false,
    writable: false
  });
}

if(!Array.prototype.find) {
    Array.prototype.find = function(predicate) {
        var index = this.findIndex(predicate, arguments[1])
        return index === -1 ? void 0 : this[index];
    }
}