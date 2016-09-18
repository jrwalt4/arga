(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.arga = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
// CommandBuilderBase.ts
"use strict";
var CommandBuilderBase = (function () {
    function CommandBuilderBase() {
    }
    return CommandBuilderBase;
}());
module.exports = CommandBuilderBase;

},{}],2:[function(require,module,exports){
// DataColumn.ts
"use strict";
var SortedArray = require('collections/sorted-array');
var util = require('./Util');
var DataTable = require('./DataTable');
var DataColumn = (function () {
    function DataColumn(table, name, keyPath) {
        if (!(table instanceof DataTable)) {
            throw new Error("cannot construct DataColumn without DataTable");
        }
        this._name = name;
        this._keyPath = keyPath;
        this._index = new SortedArray(undefined, util.createContentEquator(keyPath), util.createContentComparer(keyPath));
    }
    DataColumn.prototype._get = function (object) {
        return util.resolveKeyPath(this._keyPath, object);
    };
    DataColumn.prototype.table = function () {
        return this._table;
    };
    DataColumn.prototype.name = function (sName) {
        if (sName !== undefined) {
            this._name = sName;
            return this;
        }
        return this._name;
    };
    return DataColumn;
}());
var Item = (function () {
    function Item(key, index) {
        this.key = key;
        this.index = index;
    }
    return Item;
}());
module.exports = DataColumn;

},{"./DataTable":11,"./Util":13,"collections/sorted-array":32}],3:[function(require,module,exports){
// DataColumnCollection.ts
"use strict";
//import {Collection} from './Util.Collection'
var DataColumnCollection = (function () {
    function DataColumnCollection() {
    }
    return DataColumnCollection;
}());
module.exports = DataColumnCollection;

},{}],4:[function(require,module,exports){
// DataColumnConstraint.ts
"use strict";
var DataColumnConstraint;
(function (DataColumnConstraint) {
    DataColumnConstraint[DataColumnConstraint["PRIMARY_KEY"] = 0] = "PRIMARY_KEY";
    DataColumnConstraint[DataColumnConstraint["UNIQUE"] = 1] = "UNIQUE";
    DataColumnConstraint[DataColumnConstraint["INDEX"] = 2] = "INDEX";
})(DataColumnConstraint || (DataColumnConstraint = {}));
module.exports = DataColumnConstraint;

},{}],5:[function(require,module,exports){
// DataRelation.ts
"use strict";
var DataRelation = (function () {
    function DataRelation(_parent, _child, _operator) {
        this._parent = _parent;
        this._child = _child;
        this._operator = _operator;
    }
    return DataRelation;
}());
module.exports = DataRelation;

},{}],6:[function(require,module,exports){
// DataRow.js
"use strict";
var DataTable = require('./DataTable');
var DataRowState = require('./DataRowState');
var DataRowVersion = require('./DataRowVersion');
var DataRow = (function () {
    function DataRow(dataTable) {
        if (!(dataTable instanceof DataTable)) {
            throw new Error("Cannot construct DataRow without DataTable");
        }
        this._table = dataTable;
        this._original = {};
        this._current = this._createCurrent();
    }
    DataRow.prototype._createCurrent = function () {
        return Object.create(this._original);
    };
    DataRow.prototype.table = function (oDataTable) {
        if (oDataTable !== undefined) {
            if (oDataTable === null) {
                this._table = undefined;
            }
            else {
                this._table = oDataTable;
            }
            return this;
        }
        return this._table;
    };
    DataRow.prototype.rowState = function () {
        /*
         * should probably implement this with biflags,
         * but here it is for now
         */
        if (this._current === null) {
            return DataRowState.DELETED;
        }
        if (this._current === void 0 || Object.keys(this._current).length == 0) {
            return DataRowState.UNCHANGED;
        }
        if (this.table() === undefined) {
            return DataRowState.DETACHED;
        }
        return DataRowState.MODIFIED;
    };
    DataRow.prototype.beginEdit = function () {
        if (this.isEditing()) {
            throw "already editing";
        }
        this._proposed = this._createProposed();
    };
    DataRow.prototype.isEditing = function () {
        return !!this._proposed && Object.keys(this._proposed).length === 0;
    };
    DataRow.prototype._createProposed = function () {
        return Object.create(this._current);
    };
    DataRow.prototype.endEdit = function () {
        this.dispatchBeforeRowChange();
        var self = this;
        Object.keys(this._proposed).forEach(function (key) {
            self._current[key] = self._proposed[key];
        });
        this.dispatchRowChange();
    };
    DataRow.prototype.get = function () {
    };
    DataRow.prototype.set = function () {
    };
    DataRow.prototype.del = function () {
    };
    DataRow.prototype.has = function () {
        return true;
    };
    DataRow.prototype.item = function (column, newValue, version) {
        if (newValue !== undefined) {
            return this._setItem(column, newValue, version);
        }
        else {
            return this._getItem(column, version);
        }
    };
    DataRow.prototype._getItem = function (column, version) {
        return this._getVersion(version)[column];
    };
    DataRow.prototype._setItem = function (column, newValue, version) {
        if (this.rowState() == DataRowState.DELETED) {
            throw new Error("Row already deleted");
        }
        this._getVersion(version)[column] = newValue;
        return this;
    };
    DataRow.prototype._getVersion = function (version) {
        version = version || DataRowVersion.DEFAULT;
        switch (version) {
            case DataRowVersion.DEFAULT:
                if (this.isEditing()) {
                    return this._proposed;
                }
                else {
                    return this._current;
                }
            case DataRowVersion.CURRENT:
                return this._current;
            case DataRowVersion.ORIGINAL:
                return this._original;
            case DataRowVersion.PROPOSED:
                return this._proposed;
            default:
                throw new Error("DataRowVersion {" + version + "} is not recognized");
        }
    };
    DataRow.prototype.acceptChanges = function () {
        var self = this;
        Object.keys(this._current).forEach(function (key, i) {
            self._original[key] = self._current[key];
        });
        this._current = Object.create(this._original);
    };
    DataRow.prototype.rejectChanges = function () {
        this._current = Object.create(this._original);
    };
    DataRow.prototype.dispatchRowChange = function () {
    };
    DataRow.prototype.dispatchBeforeRowChange = function () {
    };
    return DataRow;
}());
module.exports = DataRow;

},{"./DataRowState":8,"./DataRowVersion":9,"./DataTable":11}],7:[function(require,module,exports){
// DataRowCollection.ts
"use strict";
//import {Collection} from './Util.Collection'
var SortedArray = require('collections/sorted-array');
var DataRowCollection = (function () {
    function DataRowCollection() {
        this._rows = new SortedArray();
    }
    DataRowCollection.prototype.add = function () {
        var rows = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            rows[_i - 0] = arguments[_i];
        }
        this._rows.addEach(rows);
    };
    DataRowCollection.prototype.toArray = function () {
        return this._rows.toArray();
    };
    return DataRowCollection;
}());
module.exports = DataRowCollection;

},{"collections/sorted-array":32}],8:[function(require,module,exports){
// DataRowState.ts
"use strict";
var DataRowState;
(function (DataRowState) {
    DataRowState[DataRowState["DETACHED"] = 1] = "DETACHED";
    DataRowState[DataRowState["UNCHANGED"] = 2] = "UNCHANGED";
    DataRowState[DataRowState["ADDED"] = 4] = "ADDED";
    DataRowState[DataRowState["MODIFIED"] = 8] = "MODIFIED";
    DataRowState[DataRowState["DELETED"] = 16] = "DELETED";
})(DataRowState || (DataRowState = {}));
module.exports = DataRowState;

},{}],9:[function(require,module,exports){
"use strict";
// DataRowVersion.ts
var DataRowVersion;
(function (DataRowVersion) {
    DataRowVersion[DataRowVersion["ORIGINAL"] = 0] = "ORIGINAL";
    DataRowVersion[DataRowVersion["CURRENT"] = 1] = "CURRENT";
    DataRowVersion[DataRowVersion["PROPOSED"] = 2] = "PROPOSED";
    DataRowVersion[DataRowVersion["DEFAULT"] = 3] = "DEFAULT";
})(DataRowVersion || (DataRowVersion = {}));
module.exports = DataRowVersion;

},{}],10:[function(require,module,exports){
// DataSet.ts
"use strict";
var DataTable = require('./DataTable');
var ds_counter = 0;
var DataSet = (function () {
    function DataSet(name) {
        if (name === void 0) { name = "Set" + ds_counter++; }
        this._name = name;
        this._tables = [];
        this._relations = [];
    }
    DataSet.prototype.tables = function () {
        return this._tables.slice();
    };
    DataSet.prototype.addTable = function (oTable) {
        var tbl;
        if (typeof oTable === 'string') {
            tbl = new DataTable(oTable);
        }
        else {
            tbl = oTable;
        }
        if (tbl.name() === undefined) {
            tbl.name("Table" + this._tables.length);
        }
        this._tables.push(tbl);
    };
    ;
    DataSet.prototype.acceptChanges = function () {
        this._tables.forEach(function (table) {
            table.acceptChanges();
        });
    };
    ;
    DataSet.prototype.getChanges = function () {
    };
    ;
    DataSet.prototype.name = function (newValue) {
        if (newValue != undefined) {
            this._name = newValue;
        }
        return this._name;
    };
    ;
    return DataSet;
}());
module.exports = DataSet;

},{"./DataTable":11}],11:[function(require,module,exports){
// DataTable.ts
"use strict";
var DataRowCollection = require('./DataRowCollection');
//import IDataSchema = require('./IDataSchema')
var Util_1 = require('./Util');
var dt_counter = 0;
var DataTable = (function () {
    function DataTable(sName, sKeyPath) {
        this._name = sName || "Table" + dt_counter++;
        this._rows = new DataRowCollection();
        this._columns = [];
        this._keyPath = sKeyPath;
        this._keyComparer = Util_1.createContentComparer(sKeyPath);
    }
    DataTable.prototype.name = function (sName) {
        if (sName !== undefined) {
            this._name = sName;
            return this;
        }
        return this._name;
    };
    DataTable.prototype.rows = function () {
        return this._rows;
    };
    DataTable.prototype.addRow = function (oRow) {
        this._rows.add(oRow);
        oRow.table(this);
        return this;
    };
    DataTable.prototype.columns = function () {
        return this._columns;
    };
    DataTable.prototype.keyPath = function () {
        return this._keyPath;
    };
    DataTable.prototype.acceptChanges = function () {
        this._rows.toArray().forEach(function (dr) {
            dr.acceptChanges();
        });
    };
    return DataTable;
}());
console.log('loaded DataTable');
module.exports = DataTable;

},{"./DataRowCollection":7,"./Util":13}],12:[function(require,module,exports){
// DataView.js
"use strict";
var DataView = (function () {
    function DataView() {
    }
    return DataView;
}());
module.exports = DataView;

},{}],13:[function(require,module,exports){
// Util.ts
// Utilities used by arga.js
"use strict";
function createContentComparer(sKeyPath) {
    return function compare(objA, objB) {
        var keyA = resolveKeyPath(sKeyPath, objA);
        var keyB = resolveKeyPath(sKeyPath, objB);
        return keyA < keyB ? -1 : (keyA > keyB ? 1 : 0);
    };
}
exports.createContentComparer = createContentComparer;
function createContentEquator(sKeyPath) {
    return function equals(objA, objB) {
        var keyA = resolveKeyPath(sKeyPath, objA);
        var keyB = resolveKeyPath(sKeyPath, objB);
        return keyA == keyB;
    };
}
exports.createContentEquator = createContentEquator;
function getKeyWithKeyPath(sKeyPath, obj) {
    //sKeyPath
    var keyPathArray = sKeyPath.split('.');
}
exports.getKeyWithKeyPath = getKeyWithKeyPath;
function compareKeys(keyA, keyB) {
    if (indexedDB !== void 0) {
        return indexedDB.cmp(keyA, keyB);
    }
    else {
        return (keyA < keyB ? -1 : keyA > keyB ? 1 : 0);
    }
}
exports.compareKeys = compareKeys;
function resolveKeyPath(sKeyPath, obj) {
    sKeyPath = sKeyPath || "";
    var path = sKeyPath.split('.');
    return path.reduce(function (prevResult, nextVal) {
        if (prevResult === void 0) {
            return void 0;
        }
        return prevResult[nextVal];
    }, obj);
}
exports.resolveKeyPath = resolveKeyPath;
function createValueWithKeyPath(value, sKeyPath) {
    var keyPathArray = sKeyPath.split('.');
    return keyPathArray.reduceRight(function (prevValue, key, curIndex, array) {
        var wrappedValue = {};
        wrappedValue[key] = prevValue;
        return wrappedValue;
    }, value);
}
exports.createValueWithKeyPath = createValueWithKeyPath;
function resolveKeyPathArray(aKeypath) {
}

},{}],14:[function(require,module,exports){
"use strict";

var Shim = require("./shim");
var GenericCollection = require("./generic-collection");
var GenericMap = require("./generic-map");

// Burgled from https://github.com/domenic/dict

module.exports = Dict;
function Dict(values, getDefault) {
    if (!(this instanceof Dict)) {
        return new Dict(values, getDefault);
    }
    getDefault = getDefault || Function.noop;
    this.getDefault = getDefault;
    this.store = Object.create(null);
    this.length = 0;
    this.addEach(values);
}

Dict.Dict = Dict; // hack so require("dict").Dict will work in MontageJS.

Object.addEach(Dict.prototype, GenericCollection.prototype);
Object.addEach(Dict.prototype, GenericMap.prototype);

Dict.from = GenericCollection.from;

Dict.prototype.constructClone = function (values) {
    return new this.constructor(values, this.getDefault);
};

Dict.prototype.assertString = function (key) {
    if (typeof key !== "string") {
        throw new TypeError("key must be a string but Got " + key);
    }
}

Object.defineProperty(Dict.prototype,"$__proto__",{writable:true});
Object.defineProperty(Dict.prototype,"_hasProto",{
    get:function() {
        return this.hasOwnProperty("$__proto__") && typeof this._protoValue !== "undefined";
    }
});
Object.defineProperty(Dict.prototype,"_protoValue",{
    get:function() {
        return this["$__proto__"];
    },
    set: function(value) {
        this["$__proto__"] = value;
    }
});

Object.defineProperty(Dict.prototype,"size",GenericCollection._sizePropertyDescriptor);


Dict.prototype.get = function (key, defaultValue) {
    this.assertString(key);
    if (key === "__proto__") {
        if (this._hasProto) {
            return this._protoValue;
        } else if (arguments.length > 1) {
            return defaultValue;
        } else {
            return this.getDefault(key);
        }
    }
    else {
        if (key in this.store) {
            return this.store[key];
        } else if (arguments.length > 1) {
            return defaultValue;
        } else {
            return this.getDefault(key);
        }
    }
};

Dict.prototype.set = function (key, value) {
    this.assertString(key);
    var isProtoKey = (key === "__proto__");

    if (isProtoKey ? this._hasProto : key in this.store) { // update
        if (this.dispatchesMapChanges) {
            this.dispatchBeforeMapChange(key, isProtoKey ? this._protoValue : this.store[key]);
        }

        isProtoKey
            ? this._protoValue = value
            : this.store[key] = value;

        if (this.dispatchesMapChanges) {
            this.dispatchMapChange(key, value);
        }
        return false;
    } else { // create
        if (this.dispatchesMapChanges) {
            this.dispatchBeforeMapChange(key, undefined);
        }
        this.length++;

        isProtoKey
            ? this._protoValue = value
            : this.store[key] = value;

        if (this.dispatchesMapChanges) {
            this.dispatchMapChange(key, value);
        }
        return true;
    }
};

Dict.prototype.has = function (key) {
    this.assertString(key);
    return key === "__proto__" ? this._hasProto : key in this.store;
};

Dict.prototype["delete"] = function (key) {
    this.assertString(key);
    if (key === "__proto__") {
        if (this._hasProto) {
            if (this.dispatchesMapChanges) {
                this.dispatchBeforeMapChange(key, this._protoValue);
            }
            this._protoValue = undefined;
            this.length--;
            if (this.dispatchesMapChanges) {
                this.dispatchMapChange(key, undefined);
            }
            return true;
        }
        return false;
    }
    else {
        if (key in this.store) {
            if (this.dispatchesMapChanges) {
                this.dispatchBeforeMapChange(key, this.store[key]);
            }
            delete this.store[key];
            this.length--;
            if (this.dispatchesMapChanges) {
                this.dispatchMapChange(key, undefined);
            }
            return true;
        }
        return false;
    }
};

Dict.prototype.clear = function () {
    var key;
    if (this._hasProto) {
        if (this.dispatchesMapChanges) {
            this.dispatchBeforeMapChange("__proto__", this._protoValue);
        }
        this._protoValue = undefined;
        if (this.dispatchesMapChanges) {
            this.dispatchMapChange("__proto__", undefined);
        }
    }
    for (key in this.store) {
        if (this.dispatchesMapChanges) {
            this.dispatchBeforeMapChange(key, this.store[key]);
        }
        delete this.store[key];
        if (this.dispatchesMapChanges) {
            this.dispatchMapChange(key, undefined);
        }
    }
    this.length = 0;
};

Dict.prototype.reduce = function (callback, basis, thisp) {
    if(this._hasProto) {
        basis = callback.call(thisp, basis, "$__proto__", "__proto__", this);
    }
    var store = this.store;
    for (var key in this.store) {
        basis = callback.call(thisp, basis, store[key], key, this);
    }
    return basis;
};

Dict.prototype.reduceRight = function (callback, basis, thisp) {
    var self = this;
    var store = this.store;
    basis = Object.keys(this.store).reduceRight(function (basis, key) {
        return callback.call(thisp, basis, store[key], key, self);
    }, basis);

    if(this._hasProto) {
        return callback.call(thisp, basis, this._protoValue, "__proto__", self);
    }
    return basis;
};

Dict.prototype.one = function () {
    var key;
    for (key in this.store) {
        return this.store[key];
    }
    return this._protoValue;
};

Dict.prototype.toJSON = function () {
    return this.toObject();
};

},{"./generic-collection":19,"./generic-map":20,"./shim":31}],15:[function(require,module,exports){
"use strict";

var Shim = require("./shim");
var Dict = require("./_dict");
var List = require("./_list");
var GenericCollection = require("./generic-collection");
var GenericSet = require("./generic-set");
var TreeLog = require("./tree-log");

var object_has = Object.prototype.hasOwnProperty;

module.exports = FastSet;

function FastSet(values, equals, hash, getDefault) {
    if (!(this instanceof FastSet)) {
        return new FastSet(values, equals, hash, getDefault);
    }
    equals = equals || Object.equals;
    hash = hash || Object.hash;
    getDefault = getDefault || Function.noop;
    this.contentEquals = equals;
    this.contentHash = hash;
    this.getDefault = getDefault;
    var self = this;
    this.buckets = new this.Buckets(null, function getDefaultBucket() {
        return new self.Bucket();
    });
    this.length = 0;
    this.addEach(values);
}

FastSet.FastSet = FastSet; // hack so require("fast-set").FastSet will work in MontageJS

Object.addEach(FastSet.prototype, GenericCollection.prototype);
Object.addEach(FastSet.prototype, GenericSet.prototype);
FastSet.from = GenericCollection.from;

FastSet.prototype.Buckets = Dict;
FastSet.prototype.Bucket = List;

FastSet.prototype.constructClone = function (values) {
    return new this.constructor(
        values,
        this.contentEquals,
        this.contentHash,
        this.getDefault
    );
};

FastSet.prototype.has = function (value) {
    var hash = this.contentHash(value);
    return this.buckets.get(hash).has(value);
};

FastSet.prototype.get = function (value, equals) {
    if (equals) {
        throw new Error("FastSet#get does not support second argument: equals");
    }
    var hash = this.contentHash(value);
    var buckets = this.buckets;
    if (buckets.has(hash)) {
        return buckets.get(hash).get(value);
    } else {
        return this.getDefault(value);
    }
};

FastSet.prototype["delete"] = function (value, equals) {
    if (equals) {
        throw new Error("FastSet#delete does not support second argument: equals");
    }
    var hash = this.contentHash(value);
    var buckets = this.buckets;
    if (buckets.has(hash)) {
        var bucket = buckets.get(hash);
        if (bucket["delete"](value)) {
            this.length--;
            if (bucket.length === 0) {
                buckets["delete"](hash);
            }
            return true;
        }
    }
    return false;
};

FastSet.prototype.clear = function () {
    this.buckets.clear();
    this.length = 0;
};

FastSet.prototype.add = function (value) {
    var hash = this.contentHash(value);
    var buckets = this.buckets;
    if (!buckets.has(hash)) {
        buckets.set(hash, new this.Bucket(null, this.contentEquals));
    }
    if (!buckets.get(hash).has(value)) {
        buckets.get(hash).add(value);
        this.length++;
        return true;
    }
    return false;
};

FastSet.prototype.reduce = function (callback, basis /*, thisp*/) {
    var thisp = arguments[2];
    var buckets = this.buckets;
    var index = 0;
    return buckets.reduce(function (basis, bucket) {
        return bucket.reduce(function (basis, value) {
            return callback.call(thisp, basis, value, index++, this);
        }, basis, this);
    }, basis, this);
};

FastSet.prototype.one = function () {
    if (this.length > 0) {
        return this.buckets.one().one();
    }
};

FastSet.prototype.iterate = function () {
    return this.buckets.valuesArray().flatten().iterate();
};

FastSet.prototype.log = function (charmap, logNode, callback, thisp) {
    charmap = charmap || TreeLog.unicodeSharp;
    logNode = logNode || this.logNode;
    if (!callback) {
        callback = console.log;
        thisp = console;
    }
    callback = callback.bind(thisp);

    var buckets = this.buckets, bucketsSize = buckets.size,
        mapIter = buckets.keys(), hash, index = 0,
        branch, leader, bucket;

    while (hash = mapIter.next().value) {
        if (index === bucketsSize - 1) {
            branch = charmap.fromAbove;
            leader = ' ';
        } else if (index === 0) {
            branch = charmap.branchDown;
            leader = charmap.strafe;
        } else {
            branch = charmap.fromBoth;
            leader = charmap.strafe;
        }
        bucket = buckets.get(hash);
        callback.call(thisp, branch + charmap.through + charmap.branchDown + ' ' + hash);
        bucket.forEach(function (value, node) {
            var branch, below, written;
            if (node === bucket.head.prev) {
                branch = charmap.fromAbove;
                below = ' ';
            } else {
                branch = charmap.fromBoth;
                below = charmap.strafe;
            }
            logNode(
                node,
                function (line) {
                    if (!written) {
                        callback.call(thisp, leader + ' ' + branch + charmap.through + charmap.through + line);
                        written = true;
                    } else {
                        callback.call(thisp, leader + ' ' + below + '  ' + line);
                    }
                },
                function (line) {
                    callback.call(thisp, leader + ' ' + charmap.strafe + '  ' + line);
                }
            );
        });
        index++;
    }

    //var hashes = buckets.keysArray();
    // hashes.forEach(function (hash, index) {
    //     var branch;
    //     var leader;
    //     if (index === hashes.length - 1) {
    //         branch = charmap.fromAbove;
    //         leader = ' ';
    //     } else if (index === 0) {
    //         branch = charmap.branchDown;
    //         leader = charmap.strafe;
    //     } else {
    //         branch = charmap.fromBoth;
    //         leader = charmap.strafe;
    //     }
    //     var bucket = buckets.get(hash);
    //     callback.call(thisp, branch + charmap.through + charmap.branchDown + ' ' + hash);
    //     bucket.forEach(function (value, node) {
    //         var branch, below;
    //         if (node === bucket.head.prev) {
    //             branch = charmap.fromAbove;
    //             below = ' ';
    //         } else {
    //             branch = charmap.fromBoth;
    //             below = charmap.strafe;
    //         }
    //         var written;
    //         logNode(
    //             node,
    //             function (line) {
    //                 if (!written) {
    //                     callback.call(thisp, leader + ' ' + branch + charmap.through + charmap.through + line);
    //                     written = true;
    //                 } else {
    //                     callback.call(thisp, leader + ' ' + below + '  ' + line);
    //                 }
    //             },
    //             function (line) {
    //                 callback.call(thisp, leader + ' ' + charmap.strafe + '  ' + line);
    //             }
    //         );
    //     });
    // });
};

FastSet.prototype.logNode = function (node, write) {
    var value = node.value;
    if (Object(value) === value) {
        JSON.stringify(value, null, 4).split("\n").forEach(function (line) {
            write(" " + line);
        });
    } else {
        write(" " + value);
    }
};

},{"./_dict":14,"./_list":16,"./generic-collection":19,"./generic-set":22,"./shim":31,"./tree-log":33}],16:[function(require,module,exports){
"use strict";

module.exports = List;

var Shim = require("./shim");
var GenericCollection = require("./generic-collection");
var GenericOrder = require("./generic-order");

function List(values, equals, getDefault) {
    return List._init(List, this, values, equals, getDefault);
}

List._init = function (constructor, object, values, equals, getDefault) {
    if (!(object instanceof constructor)) {
        return new constructor(values, equals, getDefault);
    }
    var head = object.head = new object.Node();
    head.next = head;
    head.prev = head;
    object.contentEquals = equals || Object.equals;
    object.getDefault = getDefault || Function.noop;
    object.length = 0;
    object.addEach(values);
}

List.List = List; // hack so require("list").List will work in MontageJS

Object.addEach(List.prototype, GenericCollection.prototype);
Object.addEach(List.prototype, GenericOrder.prototype);

List.from = GenericCollection.from;

List.prototype.constructClone = function (values) {
    return new this.constructor(values, this.contentEquals, this.getDefault);
};

List.prototype.find = function (value, equals, index) {
    equals = equals || this.contentEquals;
    var head = this.head;
    var at = this.scan(index, head.next);
    while (at !== head) {
        if (equals(at.value, value)) {
            return at;
        }
        at = at.next;
    }
};

List.prototype.findLast = function (value, equals, index) {
    equals = equals || this.contentEquals;
    var head = this.head;
    var at = this.scan(index, head.prev);
    while (at !== head) {
        if (equals(at.value, value)) {
            return at;
        }
        at = at.prev;
    }
};

List.prototype.has = function (value, equals) {
    return !!this.find(value, equals);
};

List.prototype.get = function (value, equals) {
    var found = this.find(value, equals);
    if (found) {
        return found.value;
    }
    return this.getDefault(value);
};

// LIFO (delete removes the most recently added equivalent value)
List.prototype["delete"] = function (value, equals) {
    var found = this.findLast(value, equals);
    if (found) {
        found["delete"]();
        this.length--;
        return true;
    }
    return false;
};

List.prototype.deleteAll = function (value, equals) {
    equals = equals || this.contentEquals;
    var head = this.head;
    var at = head.next;
    var count = 0;
    while (at !== head) {
        if (equals(value, at.value)) {
            at["delete"]();
            count++;
        }
        at = at.next;
    }
    this.length -= count;
    return count;
};

List.prototype.clear = function () {
    this.head.next = this.head.prev = this.head;
    this.length = 0;
};

List.prototype.add = function (value) {
    var node = new this.Node(value)
    return this._addNode(node);
};

List.prototype._addNode = function (node) {
    this.head.addBefore(node);
    this.length++;
    return true;
};

List.prototype.push = function () {
    var head = this.head;
    for (var i = 0; i < arguments.length; i++) {
        var value = arguments[i];
        var node = new this.Node(value);
        head.addBefore(node);
    }
    this.length += arguments.length;
};

List.prototype.unshift = function () {
    var at = this.head;
    for (var i = 0; i < arguments.length; i++) {
        var value = arguments[i];
        var node = new this.Node(value);
        at.addAfter(node);
        at = node;
    }
    this.length += arguments.length;
};

List.prototype._shouldPop = function () {
    var value;
    var head = this.head;
    if (head.prev !== head) {
        value = head.prev.value;
    }
    return value;
}

List.prototype.pop = function (_before, _after) {
    var value;
    var head = this.head;
    if (head.prev !== head) {
        value = head.prev.value;
        var index = this.length - 1;
        var popDispatchValueArray = _before ? _before.call(this,value,index) : void 0;
        head.prev['delete']();
        this.length--;
        _after ? _after.call(this,value,index, popDispatchValueArray) : void 0;
    }
    return value;
};

List.prototype.shift = function (_before, _after) {
    var value;
    var head = this.head;
    if (head.prev !== head) {
        value = head.next.value;
        var dispatchValueArray = _before ? _before.call(this,value,0) : void 0;
        head.next['delete']();
        this.length--;
        _after ? _after.call(this,value,0,dispatchValueArray) : void 0;
    }
    return value;
};

List.prototype.peek = function () {
    if (this.head !== this.head.next) {
        return this.head.next.value;
    }
};

List.prototype.poke = function (value) {
    if (this.head !== this.head.next) {
        this.head.next.value = value;
    } else {
        this.push(value);
    }
};

List.prototype.one = function () {
    return this.peek();
};

// TODO
// List.prototype.indexOf = function (value) {
// };

// TODO
// List.prototype.lastIndexOf = function (value) {
// };

// an internal utility for coercing index offsets to nodes
List.prototype.scan = function (at, fallback) {
    var head = this.head;
    if (typeof at === "number") {
        var count = at;
        if (count >= 0) {
            at = head.next;
            while (count) {
                count--;
                at = at.next;
                if (at == head) {
                    break;
                }
            }
        } else {
            at = head;
            while (count < 0) {
                count++;
                at = at.prev;
                if (at == head) {
                    break;
                }
            }
        }
        return at;
    } else {
        return at || fallback;
    }
};

// at and end may both be positive or negative numbers (in which cases they
// correspond to numeric indicies, or nodes)
List.prototype.slice = function (at, end) {
    var sliced = [];
    var head = this.head;
    at = this.scan(at, head.next);
    end = this.scan(end, head);

    while (at !== end && at !== head) {
        sliced.push(at.value);
        at = at.next;
    }

    return sliced;
};

List.prototype.splice = function (at, length /*...plus*/) {
    return this.swap(at, length, Array.prototype.slice.call(arguments, 2));
};

List.prototype.swap = function (start, length, plus, _before, _after) {
    var initial = start;
    // start will be head if start is null or -1 (meaning from the end), but
    // will be head.next if start is 0 (meaning from the beginning)
    start = this.scan(start, this.head);
    if (length == null) {
        length = Infinity;
    }
    plus = Array.from(plus);

    // collect the minus array
    var minus = [];
    var at = start;
    while (length-- && length >= 0 && at !== this.head) {
        minus.push(at.value);
        at = at.next;
    }

    // before range change
    var index, startNode;
    index = _before ? _before.call(this, start, plus, minus) : void 0;

    // delete minus
    var at = start;
    for (var i = 0, at = start; i < minus.length; i++, at = at.next) {
        at["delete"]();
    }
    // add plus
    if (initial == null && at === this.head) {
        at = this.head.next;
    }
    for (var i = 0; i < plus.length; i++) {
        var node = new this.Node(plus[i]);
        at.addBefore(node);
    }
    // adjust length
    this.length += plus.length - minus.length;

    _after ? _after.call(this, start, plus, minus) : void 0;

    return minus;
};

List.prototype.reverse = function () {
    var at = this.head;
    do {
        var temp = at.next;
        at.next = at.prev;
        at.prev = temp;
        at = at.next;
    } while (at !== this.head);
    return this;
};

List.prototype.sort = function () {
    this.swap(0, this.length, this.sorted());
};

// TODO account for missing basis argument
List.prototype.reduce = function (callback, basis /*, thisp*/) {
    var thisp = arguments[2];
    var head = this.head;
    var at = head.next;
    while (at !== head) {
        basis = callback.call(thisp, basis, at.value, at, this);
        at = at.next;
    }
    return basis;
};

List.prototype.reduceRight = function (callback, basis /*, thisp*/) {
    var thisp = arguments[2];
    var head = this.head;
    var at = head.prev;
    while (at !== head) {
        basis = callback.call(thisp, basis, at.value, at, this);
        at = at.prev;
    }
    return basis;
};

List.prototype.updateIndexes = function (node, index) {
    while (node !== this.head) {
        node.index = index++;
        node = node.next;
    }
};


List.prototype.iterate = function () {
    return new ListIterator(this.head);
};

function ListIterator(head) {
    this.head = head;
    this.at = head.next;
};

ListIterator.prototype.__iterationObject = null;
Object.defineProperty(ListIterator.prototype,"_iterationObject", {
    get: function() {
        return this.__iterationObject || (this.__iterationObject = { done: false, value:null});
    }
});


ListIterator.prototype.next = function () {
    if (this.at === this.head) {
        this._iterationObject.done = true;
        this._iterationObject.value = void 0;
    } else {
        var value = this.at.value;
        this.at = this.at.next;
        this._iterationObject.value = value;
    }
    return this._iterationObject;
};

List.prototype.Node = Node;

function Node(value) {
    this.value = value;
    this.prev = null;
    this.next = null;
};

Node.prototype["delete"] = function () {
    this.prev.next = this.next;
    this.next.prev = this.prev;
};

Node.prototype.addBefore = function (node) {
    var prev = this.prev;
    this.prev = node;
    node.prev = prev;
    prev.next = node;
    node.next = this;
};

Node.prototype.addAfter = function (node) {
    var next = this.next;
    this.next = node;
    node.next = next;
    next.prev = node;
    node.prev = this;
};

},{"./generic-collection":19,"./generic-order":21,"./shim":31}],17:[function(require,module,exports){
(function (global){
"use strict";

var Shim = require("./shim");
var GenericCollection = require("./generic-collection");
var Map, GlobalMap, CollectionsMap;

if((global.Map !== void 0) && (typeof global.Set.prototype.values === "function")) {

    Map = module.exports = global.Map,
    GlobalMap = Map;
    Map.Map = Map; // hack so require("map").Map will work in MontageJS

    // use different strategies for making sets observable between Internet
    // Explorer and other browsers.
    var protoIsSupported = {}.__proto__ === Object.prototype,
        map_makeObservable;

    if (protoIsSupported) {
        map_makeObservable = function () {
            this.__proto__ = ChangeDispatchMap;
        };
    } else {
        map_makeObservable = function () {
            Object.defineProperties(this, observableSetProperties);
        };
    }

    Object.defineProperty(Map.prototype, "makeObservable", {
        value: map_makeObservable,
        writable: true,
        configurable: true,
        enumerable: false
    });

    //This is a no-op test in property-changes.js - PropertyChanges.prototype.makePropertyObservable, so might as well not pay the price every time....
    Object.defineProperty(Map.prototype, "makePropertyObservable", {
        value: function(){},
        writable: true,
        configurable: true,
        enumerable: false
    });


    Map.prototype.constructClone = function (values) {
        return new this.constructor(values);
    };

    Map.prototype.isMap = true;
    Map.prototype.addEach = function (values) {
        if (values && Object(values) === values) {
            if (typeof values.forEach === "function") {
                // copy map-alikes
                if (values.isMap === true) {
                    values.forEach(function (value, key) {
                        this.set(key, value);
                    }, this);
                // iterate key value pairs of other iterables
                } else {
                    values.forEach(function (pair) {
                        this.set(pair[0], pair[1]);
                    }, this);
                }
            } else if (typeof values.length === "number") {
                // Array-like objects that do not implement forEach, ergo,
                // Arguments
                for (var i = 0; i < values.length; i++) {
                    this.add(values[i], i);
                }
            } else {
                // copy other objects as map-alikes
                Object.keys(values).forEach(function (key) {
                    this.set(key, values[key]);
                }, this);
            }
        } else if (values && typeof values.length === "number") {
            // String
            for (var i = 0; i < values.length; i++) {
                this.add(values[i], i);
            }
        }
        return this;
    };

    Map.prototype.add = function (value, key) {
        return this.set(key, value);
    };

    Map.prototype.reduce = function (callback, basis /*, thisp*/) {
        var thisp = arguments[2];
        this.forEach(function(value, key, map) {
            basis = callback.call(thisp, basis, value, key, this);
        });
        return basis;
    };

    Map.prototype.reduceRight = function (callback, basis /*, thisp*/) {
        var thisp = arguments[2];
        var keysIterator = this.keys();
        var size = this.size;
        var reverseOrder = new Array(this.size);
        var aKey, i = 0;
        while ((aKey = keysIterator.next().value)) {
            reverseOrder[--size] = aKey;
        }
        while (i++ < size) {
            basis = callback.call(thisp, basis, this.get(reverseOrder[i]), reverseOrder[i], this);
        }
        return basis;
    };

    Map.prototype.equals = function (that, equals) {
        equals = equals || Object.equals;
        if (this === that) {
            return true;
        } else if (that && typeof that.every === "function") {
            return that.size === this.size && that.every(function (value, key) {
                return equals(this.get(key), value);
            }, this);
        } else {
            var keys = Object.keys(that);
            return keys.length === this.size && Object.keys(that).every(function (key) {
                return equals(this.get(key), that[key]);
            }, this);
        }
    };

    var _keysArrayFunction = function(value,key) {return key;};
    Map.prototype.keysArray = function() {
        return this.map(_keysArrayFunction);
    }
    var _valuesArrayFunction = function(value,key) {return value;};
    Map.prototype.valuesArray = function() {
        return this.map(_valuesArrayFunction);
    }
    var _entriesArrayFunction = function(value,key) {return [key,value];};
    Map.prototype.entriesArray = function() {
        return this.map(_entriesArrayFunction);
    }
    Map.prototype.toJSON = function () {
        return this.entriesArray();
    };

    // XXX deprecated
    Map.prototype.items = function () {
        return this.entriesArray();
    };

    // Map.prototype.contentEquals = Object.equals;
    // Map.prototype.contentHash = Object.hash;


    Map.from = function (value) {
        var result = new this;
        result.addEach(value);
        return result;
    };


    //Backward compatibility:
    Object.defineProperty(Map.prototype,"length",{
        get: function() {
            return this.size;
        },
        enumerable: true,
        configurable:true
    });


    var map_clear = Map.prototype.clear,
        map_set = Map.prototype.set,
        map_delete = Map.prototype.delete;

    var observableMapProperties = {
        clear : {
            value: function () {
                var keys;
                if (this.dispatchesMapChanges) {
                    this.forEach(function (value, key) {
                        this.dispatchBeforeMapChange(key, value);
                    }, this);
                    keys = this.keysArray();
                }
                map_clear.call(this);
                if (this.dispatchesMapChanges) {
                    keys.forEach(function (key) {
                        this.dispatchMapChange(key);
                    }, this);
                }
            },
            writable: true,
            configurable: true

        },
        set : {
            value: function (key, value) {
                var found = this.get(key);
                if (found) { // update
                    if (this.dispatchesMapChanges) {
                        this.dispatchBeforeMapChange(key, found);
                    }

                    map_set.call(this,key, value);

                    if (this.dispatchesMapChanges) {
                        this.dispatchMapChange(key, value);
                    }
                } else { // create
                    if (this.dispatchesMapChanges) {
                        this.dispatchBeforeMapChange(key, undefined);
                    }

                    map_set.call(this,key, value);

                    if (this.dispatchesMapChanges) {
                        this.dispatchMapChange(key, value);
                    }
                }
                return this;
            },
            writable: true,
            configurable: true
        },

        "delete": {
            value: function (key) {
                if (this.has(key)) {
                    if (this.dispatchesMapChanges) {
                        this.dispatchBeforeMapChange(key, this.get(key));
                    }
                    map_delete.call(this,key);

                    if (this.dispatchesMapChanges) {
                        this.dispatchMapChange(key, undefined);
                    }
                    return true;
                }
                return false;
            }
        }
    };



    Object.addEach(Map.prototype, GenericCollection.prototype, false);

    var ChangeDispatchMap = Object.create(Map.prototype, observableMapProperties);
}

    var Set = require("./_set").CollectionsSet;
    var GenericMap = require("./generic-map");

    CollectionsMap = Map = function Map(values, equals, hash, getDefault) {
        if (!(this instanceof Map)) {
            return new Map(values, equals, hash, getDefault);
        }
        equals = equals || Object.equals;
        hash = hash || Object.hash;
        getDefault = getDefault || Function.noop;
        this.contentEquals = equals;
        this.contentHash = hash;
        this.getDefault = getDefault;
        this.store = new Set(
            undefined,
            function keysEqual(a, b) {
                return equals(a.key, b.key);
            },
            function keyHash(item) {
                return hash(item.key);
            }
        );
        this.length = 0;
        this.addEach(values);
    }

    Map.Map = Map; // hack so require("map").Map will work in MontageJS

    Object.addEach(Map.prototype, GenericCollection.prototype);
    Object.addEach(Map.prototype, GenericMap.prototype); // overrides GenericCollection
    Object.defineProperty(Map.prototype,"size",GenericCollection._sizePropertyDescriptor);

    Map.from = GenericCollection.from;

    Map.prototype.constructClone = function (values) {
        return new this.constructor(
            values,
            this.contentEquals,
            this.contentHash,
            this.getDefault
        );
    };

    Map.prototype.log = function (charmap, logNode, callback, thisp) {
        logNode = logNode || this.logNode;
        this.store.log(charmap, function (node, log, logBefore) {
            logNode(node.value.value, log, logBefore);
        }, callback, thisp);
    };

    Map.prototype.logNode = function (node, log) {
        log(' key: ' + node.key);
        log(' value: ' + node.value);
    };

    if(!GlobalMap) {
        module.exports = CollectionsMap;
    }
    else {
        module.exports = GlobalMap;
        GlobalMap.CollectionsMap = CollectionsMap;
    }

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"./_set":18,"./generic-collection":19,"./generic-map":20,"./shim":31}],18:[function(require,module,exports){
(function (global){
"use strict";

var Shim = require("./shim");
var GenericCollection = require("./generic-collection");
var GenericSet = require("./generic-set");
var Set, GlobalSet, CollectionsSet;


if((global.Set !== void 0) && (typeof global.Set.prototype.values === "function")) {

    GlobalSet = module.exports = global.Set;
    GlobalSet.Set = GlobalSet; // hack so require("set").Set will work in MontageJS

    GlobalSet.prototype.reduce = function (callback, basis /*, thisp*/) {
        var thisp = arguments[2];
        this.forEach(function(value) {
            basis = callback.call(thisp, basis, value, this);
        });
        return basis;
    };

    GlobalSet.prototype.reduceRight = function (callback, basis /*, thisp*/) {
        var thisp = arguments[2];
        var setIterator = this.values();
        var size = this.size;
        var reverseOrder = new Array(this.size);
        var value, i = 0;
        while ((value = setIterator.next().value)) {
            reverseOrder[--size] = value;
        }
        while (i++ < size) {
            basis = callback.call(thisp, basis, value, this);
        }
        return basis;
    };

    GlobalSet.prototype.equals = function (that, equals) {
        var self = this;
        return (
            that && typeof that.reduce === "function" &&
            this.size === (that.size || that.length) &&
            that.reduce(function (equal, value) {
                return equal && self.has(value, equals);
            }, true)
        );
    };

    GlobalSet.prototype.constructClone = function (values) {
        return new this.constructor(values, this.contentEquals, this.contentHash, this.getDefault);
    };

    GlobalSet.prototype.toJSON = function () {
        return this.entriesArray();
    };

    GlobalSet.prototype.one = function () {
        if (this.size > 0) {
            return this.values().next().value;
        }
        return undefined;
    };

    GlobalSet.prototype.pop = function () {
        if (this.size) {
            var setIterator = this.values(), aValue, value;
            while(aValue = setIterator.next().value) {
                value = aValue;
            }
            this["delete"](value,this.size-1);
            return value;
        }
    };

    GlobalSet.prototype.shift = function () {
        if (this.size) {
            var firstValue = this.values().next().value;
            this["delete"](firstValue,0);
            return firstValue;
        }
    };

    //Backward compatibility:
    Object.defineProperty(GlobalSet.prototype,"length",{
        get: function() {
            return this.size;
        },
        enumerable: true,
        configurable:true
    });

    GlobalSet.from = function (value) {
        var result = (new this);
        result.addEach(value);
        return result;
    };

    Object.addEach(GlobalSet.prototype, GenericCollection.prototype, false);
    Object.addEach(GlobalSet.prototype, GenericSet.prototype, false);

}



    var List = require("./_list");
    var FastSet = require("./_fast-set");
    var Iterator = require("./iterator");

    CollectionsSet = function CollectionsSet(values, equals, hash, getDefault) {
        return CollectionsSet._init(CollectionsSet, this, values, equals, hash, getDefault);
    }

    CollectionsSet._init = function (constructor, object, values, equals, hash, getDefault) {
        if (!(object instanceof constructor)) {
            return new constructor(values, equals, hash, getDefault);
        }
        equals = equals || Object.equals;
        hash = hash || Object.hash;
        getDefault = getDefault || Function.noop;
        object.contentEquals = equals;
        object.contentHash = hash;
        object.getDefault = getDefault;
        // a list of values in insertion order, used for all operations that depend
        // on iterating in insertion order
        object.order = new object.Order(undefined, equals);
        // a set of nodes from the order list, indexed by the corresponding value,
        // used for all operations that need to quickly seek  value in the list
        object.store = new object.Store(
            undefined,
            function (a, b) {
                return equals(a.value, b.value);
            },
            function (node) {
                return hash(node.value);
            }
        );
        object.length = 0;
        object.addEach(values);

    }

    CollectionsSet.Set = CollectionsSet; // hack so require("set").Set will work in MontageJS
    CollectionsSet.CollectionsSet = CollectionsSet;

    Object.addEach(CollectionsSet.prototype, GenericCollection.prototype);
    Object.addEach(CollectionsSet.prototype, GenericSet.prototype);

    CollectionsSet.from = GenericCollection.from;

    Object.defineProperty(CollectionsSet.prototype,"size",GenericCollection._sizePropertyDescriptor);

    //Overrides for consistency:
    // Set.prototype.forEach = GenericCollection.prototype.forEach;


    CollectionsSet.prototype.Order = List;
    CollectionsSet.prototype.Store = FastSet;

    CollectionsSet.prototype.constructClone = function (values) {
        return new this.constructor(values, this.contentEquals, this.contentHash, this.getDefault);
    };

    CollectionsSet.prototype.has = function (value) {
        var node = new this.order.Node(value);
        return this.store.has(node);
    };

    CollectionsSet.prototype.get = function (value, equals) {
        if (equals) {
            throw new Error("Set#get does not support second argument: equals");
        }
        var node = new this.order.Node(value);
        node = this.store.get(node);
        if (node) {
            return node.value;
        } else {
            return this.getDefault(value);
        }
    };

    CollectionsSet.prototype.add = function (value) {
        var node = new this.order.Node(value);
        if (!this.store.has(node)) {
            var index = this.length;
            this.order.add(value);
            node = this.order.head.prev;
            this.store.add(node);
            this.length++;
            return true;
        }
        return false;
    };

    CollectionsSet.prototype["delete"] = function (value, equals) {
        if (equals) {
            throw new Error("Set#delete does not support second argument: equals");
        }
        var node = new this.order.Node(value);
        if (this.store.has(node)) {
            node = this.store.get(node);
            this.store["delete"](node); // removes from the set
            this.order.splice(node, 1); // removes the node from the list
            this.length--;
            return true;
        }
        return false;
    };

    CollectionsSet.prototype.pop = function () {
        if (this.length) {
            var result = this.order.head.prev.value;
            this["delete"](result);
            return result;
        }
    };

    CollectionsSet.prototype.shift = function () {
        if (this.length) {
            var result = this.order.head.next.value;
            this["delete"](result);
            return result;
        }
    };

    CollectionsSet.prototype.one = function () {
        if (this.length > 0) {
            return this.store.one().value;
        }
    };

    CollectionsSet.prototype.clear = function () {
        this.store.clear();
        this.order.clear();
        this.length = 0;
    };
    Object.defineProperty(CollectionsSet.prototype,"_clear", {
        value: CollectionsSet.prototype.clear
    });

    CollectionsSet.prototype.reduce = function (callback, basis /*, thisp*/) {
        var thisp = arguments[2];
        var list = this.order;
        var index = 0;
        return list.reduce(function (basis, value) {
            return callback.call(thisp, basis, value, index++, this);
        }, basis, this);
    };

    CollectionsSet.prototype.reduceRight = function (callback, basis /*, thisp*/) {
        var thisp = arguments[2];
        var list = this.order;
        var index = this.length - 1;
        return list.reduceRight(function (basis, value) {
            return callback.call(thisp, basis, value, index--, this);
        }, basis, this);
    };

    CollectionsSet.prototype.iterate = function () {
        return this.order.iterate();
    };

    CollectionsSet.prototype.values = function () {
        return new Iterator(this);
    };

    CollectionsSet.prototype.log = function () {
        var set = this.store;
        return set.log.apply(set, arguments);
    };



if(!GlobalSet) {
    module.exports = CollectionsSet;
}
else {
    GlobalSet.prototype.valuesArray = GenericSet.prototype.valuesArray;
    GlobalSet.prototype.entriesArray = GenericSet.prototype.entriesArray;
    module.exports = GlobalSet;
    GlobalSet.CollectionsSet = CollectionsSet;
}

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"./_fast-set":15,"./_list":16,"./generic-collection":19,"./generic-set":22,"./iterator":23,"./shim":31}],19:[function(require,module,exports){
(function (global){
"use strict";

module.exports = GenericCollection;
function GenericCollection() {
    throw new Error("Can't construct. GenericCollection is a mixin.");
}

var DOMTokenList = global.DOMTokenList || function(){};

GenericCollection.EmptyArray = Object.freeze([]);

/* TODO: optimize for DOMTokenList and Array to use for() instead of forEach */
GenericCollection.prototype.addEach = function (values) {
    //We want to eliminate everything but array like: Strings, Arrays, DOMTokenList
    if(values && (values instanceof Array || (values instanceof DOMTokenList) || values instanceof String)) {
        for (var i = 0; i < values.length; i++) {
            this.add(values[i], i);
        }
    }
    else if (values && Object(values) === values) {
        if (typeof values.forEach === "function") {
            values.forEach(this.add, this);
        } else if (typeof values.length === "number") {
            // Array-like objects that do not implement forEach, ergo,
            // Arguments
            for (var i = 0; i < values.length; i++) {
                this.add(values[i], i);
            }
        } else {
            Object.keys(values).forEach(function (key) {
                this.add(values[key], key);
            }, this);
        }
    }
    return this;
};

// This is sufficiently generic for Map (since the value may be a key)
// and ordered collections (since it forwards the equals argument)
GenericCollection.prototype.deleteEach = function (values, equals) {
    values.forEach(function (value) {
        this["delete"](value, equals);
    }, this);
    return this;
};

// all of the following functions are implemented in terms of "reduce".
// some need "constructClone".

GenericCollection.prototype.forEach = function (callback /*, thisp*/) {
    var thisp = arguments[1];
    return this.reduce(function (undefined, value, key, object, depth) {
        callback.call(thisp, value, key, object, depth);
    }, undefined);
};

GenericCollection.prototype.map = function (callback /*, thisp*/) {
    var thisp = arguments[1];
    var result = [];
    this.reduce(function (undefined, value, key, object, depth) {
        result.push(callback.call(thisp, value, key, object, depth));
    }, undefined);
    return result;
};

GenericCollection.prototype.enumerate = function (start) {
    if (start == null) {
        start = 0;
    }
    var result = [];
    this.reduce(function (undefined, value) {
        result.push([start++, value]);
    }, undefined);
    return result;
};

GenericCollection.prototype.group = function (callback, thisp, equals) {
    equals = equals || Object.equals;
    var groups = [];
    var keys = [];
    this.forEach(function (value, key, object) {
        var key = callback.call(thisp, value, key, object);
        var index = keys.indexOf(key, equals);
        var group;
        if (index === -1) {
            group = [];
            groups.push([key, group]);
            keys.push(key);
        } else {
            group = groups[index][1];
        }
        group.push(value);
    });
    return groups;
};

GenericCollection.prototype.toArray = function () {
    return this.map(Function.identity);
};

// this depends on stringable keys, which apply to Array and Iterator
// because they have numeric keys and all Maps since they may use
// strings as keys.  List, Set, and SortedSet have nodes for keys, so
// toObject would not be meaningful.
GenericCollection.prototype.toObject = function () {
    var object = {};
    this.reduce(function (undefined, value, key) {
        object[key] = value;
    }, undefined);
    return object;
};

GenericCollection.from = function () {
    return this.apply(this,arguments);
};

GenericCollection.prototype.filter = function (callback /*, thisp*/) {
    var thisp = arguments[1];
    var result = this.constructClone();
    this.reduce(function (undefined, value, key, object, depth) {
        if (callback.call(thisp, value, key, object, depth)) {
            result.add(value, key);
        }
    }, undefined);
    return result;
};

GenericCollection.prototype.every = function (callback /*, thisp*/) {
    var thisp = arguments[1];
    return this.reduce(function (result, value, key, object, depth) {
        return result && callback.call(thisp, value, key, object, depth);
    }, true);
};

GenericCollection.prototype.some = function (callback /*, thisp*/) {
    var thisp = arguments[1];
    return this.reduce(function (result, value, key, object, depth) {
        return result || callback.call(thisp, value, key, object, depth);
    }, false);
};

GenericCollection.prototype.all = function () {
    return this.every(Boolean);
};

GenericCollection.prototype.any = function () {
    return this.some(Boolean);
};

GenericCollection.prototype.min = function (compare) {
    compare = compare || this.contentCompare || Object.compare;
    var first = true;
    return this.reduce(function (result, value) {
        if (first) {
            first = false;
            return value;
        } else {
            return compare(value, result) < 0 ? value : result;
        }
    }, undefined);
};

GenericCollection.prototype.max = function (compare) {
    compare = compare || this.contentCompare || Object.compare;
    var first = true;
    return this.reduce(function (result, value) {
        if (first) {
            first = false;
            return value;
        } else {
            return compare(value, result) > 0 ? value : result;
        }
    }, undefined);
};

GenericCollection.prototype.sum = function (zero) {
    zero = zero === undefined ? 0 : zero;
    return this.reduce(function (a, b) {
        return a + b;
    }, zero);
};

GenericCollection.prototype.average = function (zero) {
    var sum = zero === undefined ? 0 : zero;
    var count = zero === undefined ? 0 : zero;
    this.reduce(function (undefined, value) {
        sum += value;
        count += 1;
    }, undefined);
    return sum / count;
};

GenericCollection.prototype.concat = function () {
    var result = this.constructClone(this);
    for (var i = 0; i < arguments.length; i++) {
        result.addEach(arguments[i]);
    }
    return result;
};

GenericCollection.prototype.flatten = function () {
    var self = this;
    return this.reduce(function (result, array) {
        array.forEach(function (value) {
            this.push(value);
        }, result, self);
        return result;
    }, []);
};

GenericCollection.prototype.zip = function () {
    var table = Array.prototype.slice.call(arguments);
    table.unshift(this);
    return Array.unzip(table);
}

GenericCollection.prototype.join = function (delimiter) {
    return this.reduce(function (result, string) {
        // work-around for reduce that does not support no-basis form
        if (result === void 0) {
            return string;
        } else {
            return result + delimiter + string;
        }
    }, void 0);
};

GenericCollection.prototype.sorted = function (compare, by, order) {
    compare = compare || this.contentCompare || Object.compare;
    // account for comparators generated by Function.by
    if (compare.by) {
        by = compare.by;
        compare = compare.compare || this.contentCompare || Object.compare;
    } else {
        by = by || Function.identity;
    }
    if (order === undefined)
        order = 1;
    return this.map(function (item) {
        return {
            by: by(item),
            value: item
        };
    })
    .sort(function (a, b) {
        return compare(a.by, b.by) * order;
    })
    .map(function (pair) {
        return pair.value;
    });
};

GenericCollection.prototype.reversed = function () {
    return this.constructClone(this).reverse();
};

GenericCollection.prototype.clone = function (depth, memo) {
    if (depth === undefined) {
        depth = Infinity;
    } else if (depth === 0) {
        return this;
    }
    var clone = this.constructClone();
    this.forEach(function (value, key) {
        clone.add(Object.clone(value, depth - 1, memo), key);
    }, this);
    return clone;
};

GenericCollection.prototype.only = function () {
    if (this.length === 1) {
        return this.one();
    }
};

GenericCollection.prototype.iterator = function () {
    return this.iterate.apply(this, arguments);
};

GenericCollection._sizePropertyDescriptor = {
    get: function() {
        return this.length;
    },
    enumerable: false,
    configurable: true
};

Object.defineProperty(GenericCollection.prototype,"size",GenericCollection._sizePropertyDescriptor);

require("./shim-array");

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"./shim-array":27}],20:[function(require,module,exports){
"use strict";

var Object = require("./shim-object");
var Iterator = require("./iterator");

module.exports = GenericMap;
function GenericMap() {
    throw new Error("Can't construct. GenericMap is a mixin.");
}

// all of these methods depend on the constructor providing a `store` set

GenericMap.prototype.isMap = true;

GenericMap.prototype.addEach = function (values) {
    var i;
    if (values && Object(values) === values) {
        if (typeof values.forEach === "function") {
            // copy map-alikes
            if (values.isMap === true) {
                values.forEach(function (value, key) {
                    this.set(key, value);
                }, this);
            // iterate key value pairs of other iterables
            } else {
                values.forEach(function (pair) {
                    this.set(pair[0], pair[1]);
                }, this);
            }
        } else if (typeof values.length === "number") {
            // Array-like objects that do not implement forEach, ergo,
            // Arguments
            for (i = 0; i < values.length; i++) {
                this.add(values[i], i);
            }
        } else {
            // copy other objects as map-alikes
            Object.keys(values).forEach(function (key) {
                this.set(key, values[key]);
            }, this);
        }
    } else if (values && typeof values.length === "number") {
        // String
        for (i = 0; i < values.length; i++) {
            this.add(values[i], i);
        }
    }
    return this;
};

GenericMap.prototype.get = function (key, defaultValue) {
    var item = this.store.get(new this.Item(key));
    if (item) {
        return item.value;
    } else if (arguments.length > 1) {
        console.log("Use of a second argument as default value is deprecated to match standards");
        return defaultValue;
    } else {
        return this.getDefault(key);
    }
};

GenericMap.prototype.set = function (key, value) {
    var item = new this.Item(key, value);
    var found = this.store.get(item);
    var grew = false;
    if (found) { // update
        if (this.dispatchesMapChanges) {
            this.dispatchBeforeMapChange(key, found.value);
        }
        found.value = value;
        if (this.dispatchesMapChanges) {
            this.dispatchMapChange(key, value);
        }
    } else { // create
        if (this.dispatchesMapChanges) {
            this.dispatchBeforeMapChange(key, undefined);
        }
        if (this.store.add(item)) {
            this.length++;
            grew = true;
        }
        if (this.dispatchesMapChanges) {
            this.dispatchMapChange(key, value);
        }
    }
    return grew;
};

GenericMap.prototype.add = function (value, key) {
    return this.set(key, value);
};

GenericMap.prototype.has = function (key) {
    return this.store.has(new this.Item(key));
};

GenericMap.prototype['delete'] = function (key) {
    var item = new this.Item(key);
    if (this.store.has(item)) {
        var from = this.store.get(item).value;
        if (this.dispatchesMapChanges) {
            this.dispatchBeforeMapChange(key, from);
        }
        this.store["delete"](item);
        this.length--;
        if (this.dispatchesMapChanges) {
            this.dispatchMapChange(key, undefined);
        }
        return true;
    }
    return false;
};

GenericMap.prototype.clear = function () {
    var keys, key;
    if (this.dispatchesMapChanges) {
        this.forEach(function (value, key) {
            this.dispatchBeforeMapChange(key, value);
        }, this);
        keys = this.keysArray();
    }
    this.store.clear();
    this.length = 0;
    if (this.dispatchesMapChanges) {
        for(var i=0;(key = keys[i]);i++) {
            this.dispatchMapChange(key);
        }
        // keys.forEach(function (key) {
        //     this.dispatchMapChange(key);
        // }, this);
    }
};

GenericMap.prototype.reduce = function (callback, basis, thisp) {
    return this.store.reduce(function (basis, item) {
        return callback.call(thisp, basis, item.value, item.key, this);
    }, basis, this);
};

GenericMap.prototype.reduceRight = function (callback, basis, thisp) {
    return this.store.reduceRight(function (basis, item) {
        return callback.call(thisp, basis, item.value, item.key, this);
    }, basis, this);
};

GenericMap.prototype.keysArray = function () {
    return this.map(function (value, key) {
        return key;
    });
};
GenericMap.prototype.keys = function () {
    return new Iterator(this.keysArray());
};

GenericMap.prototype.valuesArray = function () {
    return this.map(Function.identity);
};
GenericMap.prototype.values = function () {
    return new Iterator(this.valuesArray());
};

GenericMap.prototype.entriesArray = function () {
    return this.map(function (value, key) {
        return [key, value];
    });
};
GenericMap.prototype.entries = function () {
    return new Iterator(this.entriesArray());
};

// XXX deprecated
GenericMap.prototype.items = function () {
    return this.entriesArray();
};

GenericMap.prototype.equals = function (that, equals) {
    equals = equals || Object.equals;
    if (this === that) {
        return true;
    } else if (that && typeof that.every === "function") {
        return that.length === this.length && that.every(function (value, key) {
            return equals(this.get(key), value);
        }, this);
    } else {
        var keys = Object.keys(that);
        return keys.length === this.length && Object.keys(that).every(function (key) {
            return equals(this.get(key), that[key]);
        }, this);
    }
};

GenericMap.prototype.toJSON = function () {
    return this.entriesArray();
};


GenericMap.prototype.Item = Item;

function Item(key, value) {
    this.key = key;
    this.value = value;
}

Item.prototype.equals = function (that) {
    return Object.equals(this.key, that.key) && Object.equals(this.value, that.value);
};

Item.prototype.compare = function (that) {
    return Object.compare(this.key, that.key);
};

},{"./iterator":23,"./shim-object":29}],21:[function(require,module,exports){

var Object = require("./shim-object");

module.exports = GenericOrder;
function GenericOrder() {
    throw new Error("Can't construct. GenericOrder is a mixin.");
}

GenericOrder.prototype.equals = function (that, equals) {
    equals = equals || this.contentEquals || Object.equals;

    if (this === that) {
        return true;
    }
    if (!that) {
        return false;
    }

    var self = this;
    return (
        this.length === that.length &&
        this.zip(that).every(function (pair) {
            return equals(pair[0], pair[1]);
        })
    );
};

GenericOrder.prototype.compare = function (that, compare) {
    compare = compare || this.contentCompare || Object.compare;

    if (this === that) {
        return 0;
    }
    if (!that) {
        return 1;
    }

    var length = Math.min(this.length, that.length);
    var comparison = this.zip(that).reduce(function (comparison, pair, index) {
        if (comparison === 0) {
            if (index >= length) {
                return comparison;
            } else {
                return compare(pair[0], pair[1]);
            }
        } else {
            return comparison;
        }
    }, 0);
    if (comparison === 0) {
        return this.length - that.length;
    }
    return comparison;
};

GenericOrder.prototype.toJSON = function () {
    return this.toArray();
};

},{"./shim-object":29}],22:[function(require,module,exports){

module.exports = GenericSet;
function GenericSet() {
    throw new Error("Can't construct. GenericSet is a mixin.");
}

GenericSet.prototype.isSet = true;

GenericSet.prototype.union = function (that) {
    var union =  this.constructClone(this);
    union.addEach(that);
    return union;
};

GenericSet.prototype.intersection = function (that) {
    return this.constructClone(this.filter(function (value) {
        return that.has(value);
    }));
};

GenericSet.prototype.difference = function (that) {
    var union =  this.constructClone(this);
    union.deleteEach(that);
    return union;
};

GenericSet.prototype.symmetricDifference = function (that) {
    var union = this.union(that);
    var intersection = this.intersection(that);
    return union.difference(intersection);
};

GenericSet.prototype.deleteAll = function (value) {
    // deleteAll is equivalent to delete for sets since they guarantee that
    // only one value exists for an equivalence class, but deleteAll returns
    // the count of deleted values instead of whether a value was deleted.
    return +this["delete"](value);
};

GenericSet.prototype.equals = function (that, equals) {
    var self = this;
    return (
        that && typeof that.reduce === "function" &&
        this.length === that.length &&
        that.reduce(function (equal, value) {
            return equal && self.has(value, equals);
        }, true)
    );
};

GenericSet.prototype.forEach = function (callback /*, thisp*/) {
    var thisp = arguments[1];
    return this.reduce(function (undefined, value, key, object, depth) {
        //ECMASCRIPT Sets send value twice in callback to forEach
        callback.call(thisp, value, value, object, depth);
    }, undefined);
};


GenericSet.prototype.toJSON = function () {
    return this.toArray();
};

// W3C DOMTokenList API overlap (does not handle variadic arguments)

GenericSet.prototype.contains = function (value) {
    return this.has(value);
};

GenericSet.prototype.remove = function (value) {
    return this["delete"](value);
};

GenericSet.prototype.toggle = function (value) {
    if (this.has(value)) {
        this["delete"](value);
    } else {
        this.add(value);
    }
};

var _valuesArrayFunction = function(value,key) {return value;};
GenericSet.prototype.valuesArray = function() {
    return this.map(_valuesArrayFunction);
}
var _entriesArrayFunction = function(value,key) {return [key,value];};
GenericSet.prototype.entriesArray = function() {
    return this.map(_entriesArrayFunction);
}

},{}],23:[function(require,module,exports){
"use strict";

module.exports = Iterator;

var Object = require("./shim-object");
var GenericCollection = require("./generic-collection");

// upgrades an iterable to a Iterator
function Iterator(iterable) {

    var values = iterable && iterable.values && iterable.values();
    if(values && typeof values.next === "function" ) {
        return values;
    }

    if (!(this instanceof Iterator)) {
        return new Iterator(iterable);
    }

    if (Array.isArray(iterable) || typeof iterable === "string")
        return Iterator.iterate(iterable);

    iterable = Object(iterable);

    if (iterable instanceof Iterator) {
        return iterable;
    } else if (iterable.next) {
        this.next = function () {
            return iterable.next();
        };
    } else if (iterable.iterate) {
        var iterator = iterable.iterate();
        this.next = function () {
            return iterator.next();
        };
    } else if (Object.prototype.toString.call(iterable) === "[object Function]") {
        this.next = iterable;
    } else {
        throw new TypeError("Can't iterate " + iterable);
    }

}

Iterator.prototype.forEach = GenericCollection.prototype.forEach;
Iterator.prototype.map = GenericCollection.prototype.map;
Iterator.prototype.filter = GenericCollection.prototype.filter;
Iterator.prototype.every = GenericCollection.prototype.every;
Iterator.prototype.some = GenericCollection.prototype.some;
Iterator.prototype.any = GenericCollection.prototype.any;
Iterator.prototype.all = GenericCollection.prototype.all;
Iterator.prototype.min = GenericCollection.prototype.min;
Iterator.prototype.max = GenericCollection.prototype.max;
Iterator.prototype.sum = GenericCollection.prototype.sum;
Iterator.prototype.average = GenericCollection.prototype.average;
Iterator.prototype.flatten = GenericCollection.prototype.flatten;
Iterator.prototype.zip = GenericCollection.prototype.zip;
Iterator.prototype.enumerate = GenericCollection.prototype.enumerate;
Iterator.prototype.sorted = GenericCollection.prototype.sorted;
Iterator.prototype.group = GenericCollection.prototype.group;
Iterator.prototype.reversed = GenericCollection.prototype.reversed;
Iterator.prototype.toArray = GenericCollection.prototype.toArray;
Iterator.prototype.toObject = GenericCollection.prototype.toObject;
Iterator.prototype.iterator = GenericCollection.prototype.iterator;

Iterator.prototype.__iterationObject = null;
Object.defineProperty(Iterator.prototype,"_iterationObject", {
    get: function() {
        return this.__iterationObject || (this.__iterationObject = { done: false, value:void 0});
    }
});


// this is a bit of a cheat so flatten and such work with the generic
// reducible
Iterator.prototype.constructClone = function (values) {
    var clone = [];
    clone.addEach(values);
    return clone;
};

Iterator.prototype.mapIterator = function (callback /*, thisp*/) {
    var self = Iterator(this),
        thisp = arguments[1],
        i = 0;

    if (Object.prototype.toString.call(callback) != "[object Function]")
        throw new TypeError();

    return new self.constructor(function () {
        if(self._iterationObject.done !== true) {
            var callbackValue = callback.call(thisp, self.next().value, i++, self);
            self._iterationObject.value = callbackValue;
        }
        return self._iterationObject;
    });
};

Iterator.prototype.filterIterator = function (callback /*, thisp*/) {
    var self = Iterator(this),
        thisp = arguments[1],
        i = 0;

    if (Object.prototype.toString.call(callback) != "[object Function]")
        throw new TypeError();

    return new self.constructor(function () {
        var nextEntry;
        while (true) {
            nextEntry = self.next();
            if(nextEntry.done !== true) {
                if (callback.call(thisp, nextEntry.value, i++, self))
                    return nextEntry;
            }
            else {
                //done true and value undefined at this point
                return nextEntry;
            }
        }
    });
};

Iterator.prototype.reduce = function (callback /*, initial, thisp*/) {
    var self = Iterator(this),
        result = arguments[1],
        thisp = arguments[2],
        i = 0,
        nextEntry;

    if (Object.prototype.toString.call(callback) != "[object Function]")
        throw new TypeError();

    // first iteration unrolled
    nextEntry = self.next();
    if(nextEntry.done === true) {
        if (arguments.length > 1) {
            return arguments[1]; // initial
        } else {
            throw TypeError("cannot reduce a value from an empty iterator with no initial value");
        }
    }
    if (arguments.length > 1) {
        result = callback.call(thisp, result, nextEntry.value, i, self);
    } else {
        result = nextEntry.value;
    }
    i++;
    // remaining entries
    while (true) {
        nextEntry = self.next();
        if(nextEntry.done === true) {
            return result;
        }
        result = callback.call(thisp, result, nextEntry.value, i, self);
        i++;
    }

};

Iterator.prototype.concat = function () {
    return Iterator.concat(
        Array.prototype.concat.apply(this, arguments)
    );
};

Iterator.prototype.dropWhile = function (callback /*, thisp */) {
    var self = Iterator(this),
        thisp = arguments[1],
        stopped = false,
        stopValue,
        nextEntry,
        i = 0;

    if (Object.prototype.toString.call(callback) != "[object Function]")
        throw new TypeError();

    while (true) {
        nextEntry = self.next();
        if(nextEntry.done === true) {
            break;
        }
        if (!callback.call(thisp, nextEntry.value, i, self)) {
            stopped = true;
            stopValue = nextEntry.value;
            break;
        }
        i++;
    }

    if (stopped) {
        return self.constructor([stopValue]).concat(self);
    } else {
        return self.constructor([]);
    }
};

Iterator.prototype.takeWhile = function (callback /*, thisp*/) {
    var self = Iterator(this),
        thisp = arguments[1],
        nextEntry,
        i = 0;

    if (Object.prototype.toString.call(callback) != "[object Function]")
        throw new TypeError();

    return new self.constructor(function () {
        if(self._iterationObject.done !== true) {
            var value = self.next().value;
            if(callback.call(thisp, value, i++, self)) {
                self._iterationObject.value = value;
            }
            else {
                self._iterationObject.done = true;
                self._iterationObject.value = void 0;
            }
        }
        return self._iterationObject;
    });

};

Iterator.prototype.zipIterator = function () {
    return Iterator.unzip(
        Array.prototype.concat.apply(this, arguments)
    );
};

Iterator.prototype.enumerateIterator = function (start) {
    return Iterator.count(start).zipIterator(this);
};

// creates an iterator for Array and String
Iterator.iterate = function (iterable) {
    var start;
    start = 0;
    return new Iterator(function () {
        // advance to next owned entry
        if (typeof iterable === "object") {
            while (!(start in iterable)) {
                // deliberately late bound
                if (start >= iterable.length) {
                    this._iterationObject.done = true;
                    this._iterationObject.value = void 0;
                    break;
                }
                else start += 1;
            }
        } else if (start >= iterable.length) {
            this._iterationObject.done = true;
            this._iterationObject.value = void 0;
        }

        if(!this._iterationObject.done) {
            this._iterationObject.value = iterable[start];
            start += 1;
        }
        return this._iterationObject;
    });
};

Iterator.cycle = function (cycle, times) {
    var next;
    if (arguments.length < 2)
        times = Infinity;
    //cycle = Iterator(cycle).toArray();
    return new Iterator(function () {
        var iteration, nextEntry;

        if(next) {
            nextEntry = next();
        }

        if(!next || nextEntry.done === true) {
            if (times > 0) {
                times--;
                iteration = Iterator.iterate(cycle);
                nextEntry = (next = iteration.next.bind(iteration))();
            }
            else {
                this._iterationObject.done = true;
                nextEntry = this._iterationObject;            }
        }
        return nextEntry;
    });
};

Iterator.concat = function (iterators) {
    iterators = Iterator(iterators);
    var next;
    return new Iterator(function (){
        var iteration, nextEntry;
        if(next) nextEntry = next();
        if(!nextEntry || nextEntry.done === true) {
            nextEntry = iterators.next();
            if(nextEntry.done === false) {
                iteration = Iterator(nextEntry.value);
                next = iteration.next.bind(iteration);
                return next();
            }
            else {
                return nextEntry;
            }
        }
        else return nextEntry;
    });
};

Iterator.unzip = function (iterators) {
    iterators = Iterator(iterators).map(Iterator);
    if (iterators.length === 0)
        return new Iterator([]);
    return new Iterator(function () {
        var stopped, nextEntry;
        var result = iterators.map(function (iterator) {
            nextEntry = iterator.next();
            if (nextEntry.done === true ) {
                stopped = true;
            }
            return nextEntry.value;
        });
        if (stopped) {
            this._iterationObject.done = true;
            this._iterationObject.value = void 0;
        }
        else {
            this._iterationObject.value = result;
        }
        return this._iterationObject;
    });
};

Iterator.zip = function () {
    return Iterator.unzip(
        Array.prototype.slice.call(arguments)
    );
};

Iterator.chain = function () {
    return Iterator.concat(
        Array.prototype.slice.call(arguments)
    );
};

Iterator.range = function (start, stop, step) {
    if (arguments.length < 3) {
        step = 1;
    }
    if (arguments.length < 2) {
        stop = start;
        start = 0;
    }
    start = start || 0;
    step = step || 1;
    return new Iterator(function () {
        if (start >= stop) {
            this._iterationObject.done = true;
            this._iterationObject.value = void 0;
        }
        var result = start;
        start += step;
        this._iterationObject.value = result;

        return this._iterationObject;
    });
};

Iterator.count = function (start, step) {
    return Iterator.range(start, Infinity, step);
};

Iterator.repeat = function (value, times) {
    return new Iterator.range(times).mapIterator(function () {
        return value;
    });
};

},{"./generic-collection":19,"./shim-object":29}],24:[function(require,module,exports){
/*
    Copyright (c) 2016, Montage Studio Inc. All Rights Reserved.
    3-Clause BSD License
    https://github.com/montagejs/montage/blob/master/LICENSE.md
*/

var Map = require("../_map");

var ObjectChangeDescriptor = module.exports.ObjectChangeDescriptor = function ObjectChangeDescriptor(name) {
    this.name = name;
    this.isActive = false;
    this._willChangeListeners = null;
    this._changeListeners = null;
	return this;
}

Object.defineProperties(ObjectChangeDescriptor.prototype,{
    name: {
		value:null,
		writable: true
	},
    isActive: {
		value:false,
		writable: true
	},
	_willChangeListeners: {
		value:null,
		writable: true
	},
	willChangeListeners: {
		get: function() {
			return this._willChangeListeners || (this._willChangeListeners = new this.willChangeListenersRecordConstructor(this.name));
		}
	},
	_changeListeners: {
		value:null,
		writable: true
	},
    changeListeners: {
		get: function() {
			return this._changeListeners || (this._changeListeners = new this.changeListenersRecordConstructor(this.name));
		}
	},
    changeListenersRecordConstructor: {
        value:ChangeListenersRecord,
        writable: true
    },
    willChangeListenersRecordConstructor: {
        value:ChangeListenersRecord,
        writable: true
    }

});

var ListenerGhost = module.exports.ListenerGhost = Object.create(null);
var ChangeListenerSpecificHandlerMethodName = new Map();

 module.exports.ChangeListenersRecord = ChangeListenersRecord;
function ChangeListenersRecord(name) {
    var specificHandlerMethodName = ChangeListenerSpecificHandlerMethodName.get(name);
    if(!specificHandlerMethodName) {
        specificHandlerMethodName = "handle";
        specificHandlerMethodName += name;
        specificHandlerMethodName += "Change";
        ChangeListenerSpecificHandlerMethodName.set(name,specificHandlerMethodName);
    }
    this._current = null;
    this._current = null;
    this.specificHandlerMethodName = specificHandlerMethodName;
    return this;
}

Object.defineProperties(ChangeListenersRecord.prototype,{
    _current: {
		value: null,
		writable: true
	},
	current: {
		get: function() {
            // if(this._current) {
            //     console.log(this.constructor.name," with ",this._current.length," listeners: ", this._current);
            // }
            return this._current;
            //return this._current || (this._current = []);
		},
        set: function(value) {
            this._current = value;
        }
	},
    ListenerGhost: {
        value:ListenerGhost,
        writable: true
    },
    ghostCount: {
        value:0,
        writable: true
    },
    maxListenerGhostRatio: {
        value:0.3,
        writable: true
    },
    listenerGhostFilter: {
        value: function listenerGhostFilter(value) {
          return value !== this.ListenerGhost;
      }
    },
    removeCurrentGostListenersIfNeeded: {
        value: function() {
            if(this._current && this.ghostCount/this._current.length>this.maxListenerGhostRatio) {
                this.ghostCount = 0;
                this._current = this._current.filter(this.listenerGhostFilter,this);
            }
            return this._current;
        }
    },
    dispatchBeforeChange: {
        value: false,
        writable: true
    },
    genericHandlerMethodName: {
		value: "handlePropertyChange",
        writable: true
	}
});

module.exports.WillChangeListenersRecord = WillChangeListenersRecord;
var WillChangeListenerSpecificHandlerMethodName = new Map();
function WillChangeListenersRecord(name) {
    var specificHandlerMethodName = WillChangeListenerSpecificHandlerMethodName.get(name);
    if(!specificHandlerMethodName) {
        specificHandlerMethodName = "handle";
        specificHandlerMethodName += name;
        specificHandlerMethodName += "WillChange";
        WillChangeListenerSpecificHandlerMethodName.set(name,specificHandlerMethodName);
    }
    this.specificHandlerMethodName = specificHandlerMethodName;
	return this;
}
WillChangeListenersRecord.prototype = new ChangeListenersRecord();
WillChangeListenersRecord.prototype.constructor = WillChangeListenersRecord;
WillChangeListenersRecord.prototype.genericHandlerMethodName = "handlePropertyWillChange";

},{"../_map":17}],25:[function(require,module,exports){
/*
    Based in part on observable arrays from Motorola Mobility’s Montage
    Copyright (c) 2012, Motorola Mobility LLC. All Rights Reserved.
    3-Clause BSD License
    https://github.com/motorola-mobility/montage/blob/master/LICENSE.md
*/

/*
    This module is responsible for observing changes to owned properties of
    objects and changes to the content of arrays caused by method calls.
    The interface for observing array content changes establishes the methods
    necessary for any collection with observable content.
*/



// objectHasOwnProperty.call(myObject, key) will be used instead of
// myObject.hasOwnProperty(key) to allow myObject have defined
// a own property called "hasOwnProperty".

var objectHasOwnProperty = Object.prototype.hasOwnProperty;

// Object property descriptors carry information necessary for adding,
// removing, dispatching, and shorting events to listeners for property changes
// for a particular key on a particular object.  These descriptors are used
// here for shallow property changes.  The current listeners are the ones
// modified by add and remove own property change listener methods.  During
// property change dispatch, we capture a snapshot of the current listeners in
// the active change listeners array.  The descriptor also keeps a memo of the
// corresponding handler method names.
//
// {
//     willChangeListeners:{current, active:Array<Function>, ...method names}
//     changeListeners:{current, active:Array<Function>, ...method names}
// }

// Maybe remove entries from this table if the corresponding object no longer
// has any property change listeners for any key.  However, the cost of
// book-keeping is probably not warranted since it would be rare for an
// observed object to no longer be observed unless it was about to be disposed
// of or reused as an observable.  The only benefit would be in avoiding bulk
// calls to dispatchOwnPropertyChange events on objects that have no listeners.

//  To observe shallow property changes for a particular key of a particular
//  object, we install a property descriptor on the object that overrides the previous
//  descriptor.  The overridden descriptors are stored in this weak map.  The
//  weak map associates an object with another object that maps property names
//  to property descriptors.
//
//  object.__overriddenPropertyDescriptors__[key]
//
//  We retain the old descriptor for various purposes.  For one, if the property
//  is no longer being observed by anyone, we revert the property descriptor to
//  the original.  For "value" descriptors, we store the actual value of the
//  descriptor on the overridden descriptor, so when the property is reverted, it
//  retains the most recently set value.  For "get" and "set" descriptors,
//  we observe then forward "get" and "set" operations to the original descriptor.

module.exports = PropertyChanges;

function PropertyChanges() {
    throw new Error("This is an abstract interface. Mix it. Don't construct it");
}

require("../shim");
var Map = require("../_map");
var WeakMap = require("../weak-map");
var ChangeDescriptor = require("./change-descriptor"),
    ObjectChangeDescriptor = ChangeDescriptor.ObjectChangeDescriptor,
    ListenerGhost = ChangeDescriptor.ListenerGhost;

PropertyChanges.debug = true;

var ObjectsPropertyChangeListeners = new WeakMap();

var ObjectChangeDescriptorName = new Map();

PropertyChanges.ObjectChangeDescriptor = function() {

}

PropertyChanges.prototype.getOwnPropertyChangeDescriptor = function (key) {
    var objectPropertyChangeDescriptors = ObjectsPropertyChangeListeners.get(this), keyChangeDescriptor;
    if (!objectPropertyChangeDescriptors) {
        objectPropertyChangeDescriptors = Object.create(null);
        ObjectsPropertyChangeListeners.set(this,objectPropertyChangeDescriptors);
    }
    if ( (keyChangeDescriptor = objectPropertyChangeDescriptors[key]) === void 0) {
        var propertyName = ObjectChangeDescriptorName.get(key);
        if(!propertyName) {
            propertyName = String(key);
            propertyName = propertyName && propertyName[0].toUpperCase() + propertyName.slice(1);
            ObjectChangeDescriptorName.set(key,propertyName);
        }
        return objectPropertyChangeDescriptors[key] = new ObjectChangeDescriptor(propertyName);
    }
    return keyChangeDescriptor;
};

PropertyChanges.prototype.hasOwnPropertyChangeDescriptor = function (key) {
    var objectPropertyChangeDescriptors = ObjectsPropertyChangeListeners.get(this);
    if (!objectPropertyChangeDescriptors) {
        return false;
    }
    if (!key) {
        return true;
    }
    if (objectPropertyChangeDescriptors[key] === void 0) {
        return false;
    }
    return true;
};

PropertyChanges.prototype.addOwnPropertyChangeListener = function (key, listener, beforeChange) {
    if (this.makeObservable && !this.isObservable) {
        this.makeObservable(); // particularly for observable arrays, for
        // their length property
    }
    var descriptor = PropertyChanges.getOwnPropertyChangeDescriptor(this, key),
        listeners = beforeChange ? descriptor.willChangeListeners : descriptor.changeListeners;

    PropertyChanges.makePropertyObservable(this, key);

    if(!listeners._current) {
        listeners._current = listener;
    }
    else if(!Array.isArray(listeners._current)) {
        listeners._current = [listeners._current,listener]
    }
    else {
        listeners._current.push(listener);
    }

    var self = this;
    return function cancelOwnPropertyChangeListener() {
        PropertyChanges.removeOwnPropertyChangeListener(self, key, listener, beforeChange);
        self = null;
    };
};

PropertyChanges.prototype.addBeforeOwnPropertyChangeListener = function (key, listener) {
    return PropertyChanges.addOwnPropertyChangeListener(this, key, listener, true);
};

PropertyChanges.prototype.removeOwnPropertyChangeListener = function removeOwnPropertyChangeListener(key, listener, beforeChange) {
    var descriptor = PropertyChanges.getOwnPropertyChangeDescriptor(this, key);

    var listeners;
    if (beforeChange) {
        listeners = descriptor._willChangeListeners;
    } else {
        listeners = descriptor._changeListeners;
    }

    if(listeners) {
        if(listeners._current) {
            if(listeners._current === listener) {
                listeners._current = null;
            }
            else {

                var index = listeners._current.lastIndexOf(listener);
                if (index === -1) {
                    throw new Error("Can't remove property change listener: does not exist: property name" + JSON.stringify(key));
                }
                if(descriptor.isActive) {
                    listeners.ghostCount = listeners.ghostCount+1;
                    listeners._current[index]=removeOwnPropertyChangeListener.ListenerGhost;
                }
                else {
                    listeners._current.spliceOne(index);
                }
            }
        }
    }
};
PropertyChanges.prototype.removeOwnPropertyChangeListener.ListenerGhost = ListenerGhost;

PropertyChanges.prototype.removeBeforeOwnPropertyChangeListener = function (key, listener) {
    return PropertyChanges.removeOwnPropertyChangeListener(this, key, listener, true);
};

PropertyChanges.prototype.dispatchOwnPropertyChange = function dispatchOwnPropertyChange(key, value, beforeChange) {
    var descriptor = PropertyChanges.getOwnPropertyChangeDescriptor(this, key),
        listeners;

    if (!descriptor.isActive) {
        descriptor.isActive = true;
        listeners = beforeChange ? descriptor._willChangeListeners: descriptor._changeListeners;
        try {
            dispatchOwnPropertyChange.dispatchEach(listeners, key, value, this);
        } finally {
            descriptor.isActive = false;
        }
    }
};
PropertyChanges.prototype.dispatchOwnPropertyChange.dispatchEach = dispatchEach;

function dispatchEach(listeners, key, value, object) {
    if(listeners && listeners._current) {
        // copy snapshot of current listeners to active listeners
        var current,
            listener,
            i,
            countI,
            thisp,
            specificHandlerMethodName = listeners.specificHandlerMethodName,
            genericHandlerMethodName = listeners.genericHandlerMethodName,
            Ghost = ListenerGhost;

        if(Array.isArray(listeners._current)) {
            //removeGostListenersIfNeeded returns listeners.current or a new filtered one when conditions are met
            current = listeners.removeCurrentGostListenersIfNeeded();
            //We use a for to guarantee we won't dispatch to listeners that would be added after we started
            for(i=0, countI = current.length;i<countI;i++) {
                if ((thisp = current[i]) !== Ghost) {
                    //This is fixing the issue causing a regression in Montage's repetition
                    listener = (
                        thisp[specificHandlerMethodName] ||
                        thisp[genericHandlerMethodName] ||
                        thisp
                    );
                    if (!listener.call) {
                        throw new Error("No event listener for " + listeners.specificHandlerName + " or " + listeners.genericHandlerName + " or call on " + listener);
                    }
                    listener.call(thisp, value, key, object);
                }
            }
        }
        else {
            thisp = listeners._current;
            listener = (
                thisp[specificHandlerMethodName] ||
                thisp[genericHandlerMethodName] ||
                thisp
            );
            if (!listener.call) {
                throw new Error("No event listener for " + listeners.specificHandlerName + " or " + listeners.genericHandlerName + " or call on " + listener);
            }
            listener.call(thisp, value, key, object);
        }

    }
}

dispatchEach.ListenerGhost = ListenerGhost;


PropertyChanges.prototype.dispatchBeforeOwnPropertyChange = function (key, listener) {
    return PropertyChanges.dispatchOwnPropertyChange(this, key, listener, true);
};

var ObjectsOverriddenPropertyDescriptors = new WeakMap(),
    Objects__state__ = new WeakMap(),
    propertyListener = {
        get: void 0,
        set: void 0,
        configurable: true,
        enumerable: false
    };

PropertyChanges.prototype.makePropertyObservable = function (key) {
    // arrays are special.  we do not support direct setting of properties
    // on an array.  instead, call .set(index, value).  this is observable.
    // 'length' property is observable for all mutating methods because
    // our overrides explicitly dispatch that change.


    var overriddenPropertyDescriptors = ObjectsOverriddenPropertyDescriptors.get(this);
    if (overriddenPropertyDescriptors && overriddenPropertyDescriptors.get(key) !== void 0) {
        // if we have already recorded an overridden property descriptor,
        // we have already installed the observer, so short-here
        return;
    }

    // memoize overridden property descriptor table
    if (!overriddenPropertyDescriptors) {
        if (Array.isArray(this)) {
            return;
        }
        if (!Object.isExtensible(this)) {
            throw new Error("Can't make property " + JSON.stringify(key) + " observable on " + this + " because object is not extensible");
        }
        overriddenPropertyDescriptors = new Map();
        ObjectsOverriddenPropertyDescriptors.set(this,overriddenPropertyDescriptors);
    }

    // var state = Objects__state__.get(this);
    // if (typeof state !== "object") {
    //     Objects__state__.set(this,(state = {}));
    // }
    // state[key] = this[key];



    // walk up the prototype chain to find a property descriptor for
    // the property name
    var overriddenDescriptor;
    var attached = this;
    do {
        overriddenDescriptor = Object.getOwnPropertyDescriptor(attached, key);
        if (overriddenDescriptor) {
            break;
        }
        attached = Object.getPrototypeOf(attached);
    } while (attached);
    // or default to an undefined value
    if (!overriddenDescriptor) {
        overriddenDescriptor = {
            value: void 0,
            enumerable: true,
            writable: true,
            configurable: true
        };
    } else {
        if (!overriddenDescriptor.configurable) {
            return;
        }
        if (!overriddenDescriptor.writable && !overriddenDescriptor.set) {
            return;
        }
    }

    // memoize the descriptor so we know not to install another layer,
    // and so we can reuse the overridden descriptor when uninstalling
    overriddenPropertyDescriptors.set(key,overriddenDescriptor);


    // TODO reflect current value on a displayed property

    // in both of these new descriptor variants, we reuse the overridden
    // descriptor to either store the current value or apply getters
    // and setters.  this is handy since we can reuse the overridden
    // descriptor if we uninstall the observer.  We even preserve the
    // assignment semantics, where we get the value from up the
    // prototype chain, and set as an owned property.
    if ('value' in overriddenDescriptor) {
        propertyListener.get = function () {
            return overriddenDescriptor.value;
        };
        propertyListener.set = function dispatchingSetter(value) {
            var descriptor,
                isActive,
                overriddenDescriptor = dispatchingSetter.overriddenDescriptor;

            if (value !== overriddenDescriptor.value) {
                descriptor = dispatchingSetter.descriptor;
                if (!(isActive = descriptor.isActive)) {
                    descriptor.isActive = true;
                    try {
                        dispatchingSetter.dispatchEach(descriptor._willChangeListeners, key, overriddenDescriptor.value, this);
                    } finally {}
                }
                overriddenDescriptor.value = value;
                if (!isActive) {
                    try {
                        dispatchingSetter.dispatchEach(descriptor._changeListeners, key, value, this);
                    } finally {
                        descriptor.isActive = false;
                    }
                }
            }
        };
        propertyListener.set.dispatchEach = dispatchEach;
        propertyListener.set.overriddenDescriptor = overriddenDescriptor;
        propertyListener.set.descriptor = ObjectsPropertyChangeListeners.get(this)[key];

        propertyListener.enumerable = overriddenDescriptor.enumerable;

        propertyListener.configurable = true

    } else { // 'get' or 'set', but not necessarily both
            propertyListener.get = overriddenDescriptor.get;
            propertyListener.set = function dispatchingSetter() {
                var formerValue = dispatchingSetter.overriddenGetter.call(this),
                    descriptor,
                    isActive,
                    newValue;


                    if(arguments.length === 1) {
                        dispatchingSetter.overriddenSetter.call(this,arguments[0]);
                    }
                    else if(arguments.length === 2) {
                        dispatchingSetter.overriddenSetter.call(this,arguments[0],arguments[1]);
                    }
                    else {
                        dispatchingSetter.overriddenSetter.apply(this, arguments);
                    }

                if ((newValue = dispatchingSetter.overriddenGetter.call(this)) !== formerValue) {
                    descriptor = dispatchingSetter.descriptor;
                    if (!(isActive = descriptor.isActive)) {
                        descriptor.isActive = true;
                        try {
                            dispatchingSetter.dispatchEach(descriptor._willChangeListeners, key, formerValue, this);
                        } finally {}
                    }
                    if (!isActive) {
                        try {
                            dispatchingSetter.dispatchEach(descriptor._changeListeners, key, newValue, this);
                        } finally {
                            descriptor.isActive = false;
                        }
                    }
                }
            };
            propertyListener.enumerable = overriddenDescriptor.enumerable;
            propertyListener.configurable = true;
        propertyListener.set.dispatchEach = dispatchEach;
        propertyListener.set.overriddenSetter = overriddenDescriptor.set;
        propertyListener.set.overriddenGetter = overriddenDescriptor.get;
        propertyListener.set.descriptor = ObjectsPropertyChangeListeners.get(this)[key];
    }

    Object.defineProperty(this, key, propertyListener);
};

// constructor functions

PropertyChanges.getOwnPropertyChangeDescriptor = function (object, key) {
    if (object.getOwnPropertyChangeDescriptor) {
        return object.getOwnPropertyChangeDescriptor(key);
    } else {
        return PropertyChanges.prototype.getOwnPropertyChangeDescriptor.call(object, key);
    }
};

PropertyChanges.hasOwnPropertyChangeDescriptor = function (object, key) {
    if (object.hasOwnPropertyChangeDescriptor) {
        return object.hasOwnPropertyChangeDescriptor(key);
    } else {
        return PropertyChanges.prototype.hasOwnPropertyChangeDescriptor.call(object, key);
    }
};

PropertyChanges.addOwnPropertyChangeListener = function (object, key, listener, beforeChange) {
    if (Object.isObject(object)) {
        return object.addOwnPropertyChangeListener
            ? object.addOwnPropertyChangeListener(key, listener, beforeChange)
            : this.prototype.addOwnPropertyChangeListener.call(object, key, listener, beforeChange);
    }
};

PropertyChanges.removeOwnPropertyChangeListener = function (object, key, listener, beforeChange) {
    if (!Object.isObject(object)) {
    } else if (object.removeOwnPropertyChangeListener) {
        return object.removeOwnPropertyChangeListener(key, listener, beforeChange);
    } else {
        return PropertyChanges.prototype.removeOwnPropertyChangeListener.call(object, key, listener, beforeChange);
    }
};

PropertyChanges.dispatchOwnPropertyChange = function (object, key, value, beforeChange) {
    if (!Object.isObject(object)) {
    } else if (object.dispatchOwnPropertyChange) {
        return object.dispatchOwnPropertyChange(key, value, beforeChange);
    } else {
        return PropertyChanges.prototype.dispatchOwnPropertyChange.call(object, key, value, beforeChange);
    }
};

PropertyChanges.addBeforeOwnPropertyChangeListener = function (object, key, listener) {
    return PropertyChanges.addOwnPropertyChangeListener(object, key, listener, true);
};

PropertyChanges.removeBeforeOwnPropertyChangeListener = function (object, key, listener) {
    return PropertyChanges.removeOwnPropertyChangeListener(object, key, listener, true);
};

PropertyChanges.dispatchBeforeOwnPropertyChange = function (object, key, value) {
    return PropertyChanges.dispatchOwnPropertyChange(object, key, value, true);
};

PropertyChanges.makePropertyObservable = function (object, key) {
    if (object.makePropertyObservable) {
        return object.makePropertyObservable(key);
    } else {
        return PropertyChanges.prototype.makePropertyObservable.call(object, key);
    }
};

},{"../_map":17,"../shim":31,"../weak-map":34,"./change-descriptor":24}],26:[function(require,module,exports){
"use strict";

//TODO:
// Remove Dict and use native Map as much as possible here
//Use ObjectChangeDescriptor to avoid creating useless arrays and benefit from similar gains made in property-changes


var WeakMap = require("weak-map"),
    Map = require("../_map"),
    ChangeDescriptor = require("./change-descriptor"),
    ObjectChangeDescriptor = ChangeDescriptor.ObjectChangeDescriptor,
    ChangeListenersRecord = ChangeDescriptor.ChangeListenersRecord,
    ListenerGhost = ChangeDescriptor.ListenerGhost;

var rangeChangeDescriptors = new WeakMap(); // {isActive, willChangeListeners, changeListeners}


//
function RangeChangeDescriptor(name) {
    this.name = name;
    this.isActive = false;
    this._willChangeListeners = null;
    this._changeListeners = null;
};

RangeChangeDescriptor.prototype = new ObjectChangeDescriptor();
RangeChangeDescriptor.prototype.constructor = RangeChangeDescriptor;

RangeChangeDescriptor.prototype.changeListenersRecordConstructor = RangeChangeListenersRecord;
RangeChangeDescriptor.prototype.willChangeListenersRecordConstructor = RangeWillChangeListenersRecord;
Object.defineProperty(RangeChangeDescriptor.prototype,"active",{
    get: function() {
        return this._active || (this._active = this._current ? this._current.slice():[]);
    }
});


var RangeChangeListenersSpecificHandlerMethodName = new Map();

function RangeChangeListenersRecord(name) {
    var specificHandlerMethodName = RangeChangeListenersSpecificHandlerMethodName.get(name);
    if(!specificHandlerMethodName) {
        specificHandlerMethodName = "handle";
        specificHandlerMethodName += name.slice(0, 1).toUpperCase();
        specificHandlerMethodName += name.slice(1);
        specificHandlerMethodName += "RangeChange";
        RangeChangeListenersSpecificHandlerMethodName.set(name,specificHandlerMethodName);
    }
    this.specificHandlerMethodName = specificHandlerMethodName;
	return this;
}
RangeChangeListenersRecord.prototype = new ChangeListenersRecord();
RangeChangeListenersRecord.prototype.constructor = RangeChangeListenersRecord;

var RangeWillChangeListenersSpecificHandlerMethodName = new Map();

function RangeWillChangeListenersRecord(name) {
    var specificHandlerMethodName = RangeWillChangeListenersSpecificHandlerMethodName.get(name);
    if(!specificHandlerMethodName) {
        specificHandlerMethodName = "handle";
        specificHandlerMethodName += name.slice(0, 1).toUpperCase();
        specificHandlerMethodName += name.slice(1);
        specificHandlerMethodName += "RangeWillChange";
        RangeWillChangeListenersSpecificHandlerMethodName.set(name,specificHandlerMethodName);
    }
    this.specificHandlerMethodName = specificHandlerMethodName;
    return this;
}
RangeWillChangeListenersRecord.prototype = new ChangeListenersRecord();
RangeWillChangeListenersRecord.prototype.constructor = RangeWillChangeListenersRecord;

module.exports = RangeChanges;
function RangeChanges() {
    throw new Error("Can't construct. RangeChanges is a mixin.");
}

RangeChanges.prototype.getAllRangeChangeDescriptors = function () {
    if (!rangeChangeDescriptors.has(this)) {
        rangeChangeDescriptors.set(this, new Map());
    }
    return rangeChangeDescriptors.get(this);
};

RangeChanges.prototype.getRangeChangeDescriptor = function (token) {
    var tokenChangeDescriptors = this.getAllRangeChangeDescriptors();
    token = token || "";
    if (!tokenChangeDescriptors.has(token)) {
        tokenChangeDescriptors.set(token, new RangeChangeDescriptor(token));
    }
    return tokenChangeDescriptors.get(token);
};

var ObjectsDispatchesRangeChanges = new WeakMap(),
    dispatchesRangeChangesGetter = function() {
        return ObjectsDispatchesRangeChanges.get(this);
    },
    dispatchesRangeChangesSetter = function(value) {
        return ObjectsDispatchesRangeChanges.set(this,value);
    },
    dispatchesChangesMethodName = "dispatchesRangeChanges",
    dispatchesChangesPropertyDescriptor = {
        get: dispatchesRangeChangesGetter,
        set: dispatchesRangeChangesSetter,
        configurable: true,
        enumerable: false
    };

RangeChanges.prototype.addRangeChangeListener = function addRangeChangeListener(listener, token, beforeChange) {
    // a concession for objects like Array that are not inherently observable
    if (!this.isObservable && this.makeObservable) {
        this.makeObservable();
    }

    var descriptor = this.getRangeChangeDescriptor(token);

    var listeners;
    if (beforeChange) {
        listeners = descriptor.willChangeListeners;
    } else {
        listeners = descriptor.changeListeners;
    }

    // even if already registered
    if(!listeners._current) {
        listeners._current = listener;
    }
    else if(!Array.isArray(listeners._current)) {
        listeners._current = [listeners._current,listener]
    }
    else {
        listeners._current.push(listener);
    }

    if(Object.getOwnPropertyDescriptor((this.__proto__||Object.getPrototypeOf(this)),dispatchesChangesMethodName) === void 0) {
        Object.defineProperty((this.__proto__||Object.getPrototypeOf(this)), dispatchesChangesMethodName, dispatchesChangesPropertyDescriptor);
    }
    this.dispatchesRangeChanges = true;

    var self = this;
    return function cancelRangeChangeListener() {
        if (!self) {
            // TODO throw new Error("Range change listener " + JSON.stringify(token) + " has already been canceled");
            return;
        }
        self.removeRangeChangeListener(listener, token, beforeChange);
        self = null;
    };
};


RangeChanges.prototype.removeRangeChangeListener = function (listener, token, beforeChange) {
    var descriptor = this.getRangeChangeDescriptor(token);

    var listeners;
    if (beforeChange) {
        listeners = descriptor._willChangeListeners;
    } else {
        listeners = descriptor._changeListeners;
    }

    if(listeners._current) {
        if(listeners._current === listener) {
            listeners._current = null;
        }
        else {
            var index = listeners._current.lastIndexOf(listener);
            if (index === -1) {
                throw new Error("Can't remove range change listener: does not exist: token " + JSON.stringify(token));
            }
            else {
                if(descriptor.isActive) {
                    listeners.ghostCount = listeners.ghostCount+1
                    listeners._current[index]=ListenerGhost
                }
                else {
                    listeners._current.spliceOne(index);
                }
            }
        }
    }

};

RangeChanges.prototype.dispatchRangeChange = function (plus, minus, index, beforeChange) {
    var descriptors = this.getAllRangeChangeDescriptors();
    descriptors.dispatchBeforeChange = beforeChange;
    descriptors.forEach(function (descriptor, token, descriptors) {

        if (descriptor.isActive) {
            return;
        }

        // before or after
        var listeners = beforeChange ? descriptor._willChangeListeners : descriptor._changeListeners;
        if(listeners && listeners._current) {
            var tokenName = listeners.specificHandlerMethodName;
            if(Array.isArray(listeners._current)) {
                if(listeners._current.length) {
                    // notably, defaults to "handleRangeChange" or "handleRangeWillChange"
                    // if token is "" (the default)

                    descriptor.isActive = true;
                    // dispatch each listener
                    try {
                        var i,
                            countI,
                            listener,
                            //removeGostListenersIfNeeded returns listeners.current or a new filtered one when conditions are met
                            currentListeners = listeners.removeCurrentGostListenersIfNeeded(),
                            Ghost = ListenerGhost;
                        for(i=0, countI = currentListeners.length;i<countI;i++) {
                            if ((listener = currentListeners[i]) !== Ghost) {
                                if (listener[tokenName]) {
                                    listener[tokenName](plus, minus, index, this, beforeChange);
                                } else if (listener.call) {
                                    listener.call(this, plus, minus, index, this, beforeChange);
                                } else {
                                    throw new Error("Handler " + listener + " has no method " + tokenName + " and is not callable");
                                }
                            }
                        }
                    } finally {
                        descriptor.isActive = false;
                    }
                }
            }
            else {
                descriptor.isActive = true;
                // dispatch each listener
                try {
                    listener = listeners._current;
                    if (listener[tokenName]) {
                        listener[tokenName](plus, minus, index, this, beforeChange);
                    } else if (listener.call) {
                        listener.call(this, plus, minus, index, this, beforeChange);
                    } else {
                        throw new Error("Handler " + listener + " has no method " + tokenName + " and is not callable");
                    }
                } finally {
                    descriptor.isActive = false;
                }

            }
        }

    }, this);
};

RangeChanges.prototype.addBeforeRangeChangeListener = function (listener, token) {
    return this.addRangeChangeListener(listener, token, true);
};

RangeChanges.prototype.removeBeforeRangeChangeListener = function (listener, token) {
    return this.removeRangeChangeListener(listener, token, true);
};

RangeChanges.prototype.dispatchBeforeRangeChange = function (plus, minus, index) {
    return this.dispatchRangeChange(plus, minus, index, true);
};

},{"../_map":17,"./change-descriptor":24,"weak-map":35}],27:[function(require,module,exports){
"use strict";

/*
    Based in part on extras from Motorola Mobility’s Montage
    Copyright (c) 2012, Motorola Mobility LLC. All Rights Reserved.
    3-Clause BSD License
    https://github.com/motorola-mobility/montage/blob/master/LICENSE.md
*/

var Function = require("./shim-function");
var GenericCollection = require("./generic-collection");
var GenericOrder = require("./generic-order");
var WeakMap = require("weak-map");

module.exports = Array;

var array_splice = Array.prototype.splice;
var array_slice = Array.prototype.slice;

Array.empty = [];

if (Object.freeze) {
    Object.freeze(Array.empty);
}

Array.from = function (values) {
    var array = [];
    array.addEach(values);
    return array;
};

Array.unzip = function (table) {
    var transpose = [];
    var length = Infinity;
    // compute shortest row
    for (var i = 0; i < table.length; i++) {
        var row = table[i];
        table[i] = row.toArray();
        if (row.length < length) {
            length = row.length;
        }
    }
    for (var i = 0; i < table.length; i++) {
        var row = table[i];
        for (var j = 0; j < row.length; j++) {
            if (j < length && j in row) {
                transpose[j] = transpose[j] || [];
                transpose[j][i] = row[j];
            }
        }
    }
    return transpose;
};

function define(key, value) {
    Object.defineProperty(Array.prototype, key, {
        value: value,
        writable: true,
        configurable: true,
        enumerable: false
    });
}

define("addEach", GenericCollection.prototype.addEach);
define("deleteEach", GenericCollection.prototype.deleteEach);
define("toArray", GenericCollection.prototype.toArray);
define("toObject", GenericCollection.prototype.toObject);
define("all", GenericCollection.prototype.all);
define("any", GenericCollection.prototype.any);
define("min", GenericCollection.prototype.min);
define("max", GenericCollection.prototype.max);
define("sum", GenericCollection.prototype.sum);
define("average", GenericCollection.prototype.average);
define("only", GenericCollection.prototype.only);
define("flatten", GenericCollection.prototype.flatten);
define("zip", GenericCollection.prototype.zip);
define("enumerate", GenericCollection.prototype.enumerate);
define("group", GenericCollection.prototype.group);
define("sorted", GenericCollection.prototype.sorted);
define("reversed", GenericCollection.prototype.reversed);

define("constructClone", function (values) {
    var clone = new this.constructor();
    clone.addEach(values);
    return clone;
});

define("has", function (value, equals) {
    return this.find(value, equals) !== -1;
});

define("get", function (index, defaultValue) {
    if (+index !== index)
        throw new Error("Indicies must be numbers");
    if (!index in this) {
        return defaultValue;
    } else {
        return this[index];
    }
});

define("set", function (index, value) {
    this[index] = value;
    return true;
});

define("add", function (value) {
    this.push(value);
    return true;
});

define("delete", function (value, equals) {
    var index = this.find(value, equals);
    if (index !== -1) {
        this.spliceOne(index);
        return true;
    }
    return false;
});

define("deleteAll", function (value, equals) {
    equals = equals || this.contentEquals || Object.equals;
    var count = 0;
    for (var index = 0; index < this.length;) {
        if (equals(value, this[index])) {
            this.swap(index, 1);
            count++;
        } else {
            index++;
        }
    }
    return count;
});

define("find", function (value, equals) {
    equals = equals || this.contentEquals || Object.equals;
    for (var index = 0; index < this.length; index++) {
        if (index in this && equals(value, this[index])) {
            return index;
        }
    }
    return -1;
});

define("findLast", function (value, equals) {
    equals = equals || this.contentEquals || Object.equals;
    var index = this.length;
    do {
        index--;
        if (index in this && equals(this[index], value)) {
            return index;
        }
    } while (index > 0);
    return -1;
});

define("swap", function (start, length, plus) {
    var args, plusLength, i, j, returnValue;
    if (start > this.length) {
        this.length = start;
    }
    if (typeof plus !== "undefined") {
        args = [start, length];
        if (!Array.isArray(plus)) {
            plus = array_slice.call(plus);
        }
        i = 0;
        plusLength = plus.length;
        // 1000 is a magic number, presumed to be smaller than the remaining
        // stack length. For swaps this small, we take the fast path and just
        // use the underlying Array splice. We could measure the exact size of
        // the remaining stack using a try/catch around an unbounded recursive
        // function, but this would defeat the purpose of short-circuiting in
        // the common case.
        if (plusLength < 1000) {
            for (i; i < plusLength; i++) {
                args[i+2] = plus[i];
            }
            return array_splice.apply(this, args);
        } else {
            // Avoid maximum call stack error.
            // First delete the desired entries.
            returnValue = array_splice.apply(this, args);
            // Second batch in 1000s.
            for (i; i < plusLength;) {
                args = [start+i, 0];
                for (j = 2; j < 1002 && i < plusLength; j++, i++) {
                    args[j] = plus[i];
                }
                array_splice.apply(this, args);
            }
            return returnValue;
        }
    // using call rather than apply to cut down on transient objects
    } else if (typeof length !== "undefined") {
        return array_splice.call(this, start, length);
    }  else if (typeof start !== "undefined") {
        return array_splice.call(this, start);
    } else {
        return [];
    }
});

define("peek", function () {
    return this[0];
});

define("poke", function (value) {
    if (this.length > 0) {
        this[0] = value;
    }
});

define("peekBack", function () {
    if (this.length > 0) {
        return this[this.length - 1];
    }
});

define("pokeBack", function (value) {
    if (this.length > 0) {
        this[this.length - 1] = value;
    }
});

define("one", function () {
    for (var i in this) {
        if (Object.owns(this, i)) {
            return this[i];
        }
    }
});

if (!Array.prototype.clear) {
    define("clear", function () {
        this.length = 0;
        return this;
    });
}

define("compare", function (that, compare) {
    compare = compare || Object.compare;
    var i;
    var length;
    var lhs;
    var rhs;
    var relative;

    if (this === that) {
        return 0;
    }

    if (!that || !Array.isArray(that)) {
        return GenericOrder.prototype.compare.call(this, that, compare);
    }

    length = (this.length < that.length) ? this.length : that.length;

    for (i = 0; i < length; i++) {
        if (i in this) {
            if (!(i in that)) {
                return -1;
            } else {
                lhs = this[i];
                rhs = that[i];
                relative = compare(lhs, rhs);
                if (relative) {
                    return relative;
                }
            }
        } else if (i in that) {
            return 1;
        }
    }

    return this.length - that.length;
});

define("equals", function (that, equals) {
    equals = equals || Object.equals;
    var i = 0;
    var length = this.length;
    var left;
    var right;

    if (this === that) {
        return true;
    }
    if (!that || !Array.isArray(that)) {
        return GenericOrder.prototype.equals.call(this, that);
    }

    if (length !== that.length) {
        return false;
    } else {
        for (; i < length; ++i) {
            if (i in this) {
                if (!(i in that)) {
                    return false;
                }
                left = this[i];
                right = that[i];
                if (!equals(left, right)) {
                    return false;
                }
            } else {
                if (i in that) {
                    return false;
                }
            }
        }
    }
    return true;
});

define("clone", function (depth, memo) {
    if (depth == null) {
        depth = Infinity;
    } else if (depth === 0) {
        return this;
    }
    memo = memo || new WeakMap();
    if (memo.has(this)) {
        return memo.get(this);
    }
    var clone = new Array(this.length);
    memo.set(this, clone);
    for (var i in this) {
        clone[i] = Object.clone(this[i], depth - 1, memo);
    };
    return clone;
});

define("iterate", function (start, end) {
    return new ArrayIterator(this, start, end);
});

if(Array.prototype.spliceOne === void 0) {
    define("spliceOne", function (index,itemToAdd) {
        var len=this.length;
        if (!len) { return }
        if(arguments.length === 1) {
            while (index<len) {
                this[index] = this[index+1];
                index++
            }
            this.length--;
        }
        else {
            this[index] = itemToAdd;
        }
    });
}

define("Iterator", ArrayIterator);

function ArrayIterator(array, start, end) {
    this.array = array;
    this.start = start == null ? 0 : start;
    this.end = end;
};
ArrayIterator.prototype.__iterationObject = null;
Object.defineProperty(ArrayIterator.prototype,"_iterationObject", {
    get: function() {
        return this.__iterationObject || (this.__iterationObject = { done: false, value:null});
    }
});

ArrayIterator.prototype.next = function () {
    if (this.start === (this.end == null ? this.array.length : this.end)) {
        this._iterationObject.done = true;
        this._iterationObject.value = void 0;
    } else {
        this._iterationObject.value = this.array[this.start++];
    }
    return this._iterationObject;
};

},{"./generic-collection":19,"./generic-order":21,"./shim-function":28,"weak-map":35}],28:[function(require,module,exports){

module.exports = Function;

/**
    A utility to reduce unnecessary allocations of <code>function () {}</code>
    in its many colorful variations.  It does nothing and returns
    <code>undefined</code> thus makes a suitable default in some circumstances.

    @function external:Function.noop
*/
Function.noop = function () {
};

/**
    A utility to reduce unnecessary allocations of <code>function (x) {return
    x}</code> in its many colorful but ultimately wasteful parameter name
    variations.

    @function external:Function.identity
    @param {Any} any value
    @returns {Any} that value
*/
Function.identity = function (value) {
    return value;
};

/**
    A utility for creating a comparator function for a particular aspect of a
    figurative class of objects.

    @function external:Function.by
    @param {Function} relation A function that accepts a value and returns a
    corresponding value to use as a representative when sorting that object.
    @param {Function} compare an alternate comparator for comparing the
    represented values.  The default is <code>Object.compare</code>, which
    does a deep, type-sensitive, polymorphic comparison.
    @returns {Function} a comparator that has been annotated with
    <code>by</code> and <code>compare</code> properties so
    <code>sorted</code> can perform a transform that reduces the need to call
    <code>by</code> on each sorted object to just once.
 */
Function.by = function (by , compare) {
    compare = compare || Object.compare;
    by = by || Function.identity;
    var compareBy = function (a, b) {
        return compare(by(a), by(b));
    };
    compareBy.compare = compare;
    compareBy.by = by;
    return compareBy;
};

// TODO document
Function.get = function (key) {
    return function (object) {
        return Object.get(object, key);
    };
};


},{}],29:[function(require,module,exports){
"use strict";

var WeakMap = require("weak-map");

module.exports = Object;

/*
    Based in part on extras from Motorola Mobility’s Montage
    Copyright (c) 2012, Motorola Mobility LLC. All Rights Reserved.
    3-Clause BSD License
    https://github.com/motorola-mobility/montage/blob/master/LICENSE.md
*/

/**
    Defines extensions to intrinsic <code>Object</code>.
    @see [Object class]{@link external:Object}
*/

/**
    A utility object to avoid unnecessary allocations of an empty object
    <code>{}</code>.  This object is frozen so it is safe to share.

    @object external:Object.empty
*/
Object.empty = Object.freeze(Object.create(null));

/**
    Returns whether the given value is an object, as opposed to a value.
    Unboxed numbers, strings, true, false, undefined, and null are not
    objects.  Arrays are objects.

    @function external:Object.isObject
    @param {Any} value
    @returns {Boolean} whether the given value is an object
*/
Object.isObject = function (object) {
    return Object(object) === object;
};

/**
    Returns the value of an any value, particularly objects that
    implement <code>valueOf</code>.

    <p>Note that, unlike the precedent of methods like
    <code>Object.equals</code> and <code>Object.compare</code> would suggest,
    this method is named <code>Object.getValueOf</code> instead of
    <code>valueOf</code>.  This is a delicate issue, but the basis of this
    decision is that the JavaScript runtime would be far more likely to
    accidentally call this method with no arguments, assuming that it would
    return the value of <code>Object</code> itself in various situations,
    whereas <code>Object.equals(Object, null)</code> protects against this case
    by noting that <code>Object</code> owns the <code>equals</code> property
    and therefore does not delegate to it.

    @function external:Object.getValueOf
    @param {Any} value a value or object wrapping a value
    @returns {Any} the primitive value of that object, if one exists, or passes
    the value through
*/
Object.getValueOf = function (value) {
    if (value && typeof value.valueOf === "function") {
        value = value.valueOf();
    }
    return value;
};

var hashMap = new WeakMap();
Object.hash = function (object) {
    if (object && typeof object.hash === "function") {
        return "" + object.hash();
    } else if (Object(object) === object) {
        if (!hashMap.has(object)) {
            hashMap.set(object, Math.random().toString(36).slice(2));
        }
        return hashMap.get(object);
    } else {
        return "" + object;
    }
};

/**
    A shorthand for <code>Object.prototype.hasOwnProperty.call(object,
    key)</code>.  Returns whether the object owns a property for the given key.
    It does not consult the prototype chain and works for any string (including
    "hasOwnProperty") except "__proto__".

    @function external:Object.owns
    @param {Object} object
    @param {String} key
    @returns {Boolean} whether the object owns a property wfor the given key.
*/
var owns = Object.prototype.hasOwnProperty;
Object.owns = function (object, key) {
    return owns.call(object, key);
};

/**
    A utility that is like Object.owns but is also useful for finding
    properties on the prototype chain, provided that they do not refer to
    methods on the Object prototype.  Works for all strings except "__proto__".

    <p>Alternately, you could use the "in" operator as long as the object
    descends from "null" instead of the Object.prototype, as with
    <code>Object.create(null)</code>.  However,
    <code>Object.create(null)</code> only works in fully compliant EcmaScript 5
    JavaScript engines and cannot be faithfully shimmed.

    <p>If the given object is an instance of a type that implements a method
    named "has", this function defers to the collection, so this method can be
    used to generically handle objects, arrays, or other collections.  In that
    case, the domain of the key depends on the instance.

    @param {Object} object
    @param {String} key
    @returns {Boolean} whether the object, or any of its prototypes except
    <code>Object.prototype</code>
    @function external:Object.has
*/
Object.has = function (object, key) {
    if (typeof object !== "object") {
        throw new Error("Object.has can't accept non-object: " + typeof object);
    }
    // forward to mapped collections that implement "has"
    if (object && typeof object.has === "function") {
        return object.has(key);
    // otherwise report whether the key is on the prototype chain,
    // as long as it is not one of the methods on object.prototype
    } else if (typeof key === "string") {
        return key in object && object[key] !== Object.prototype[key];
    } else {
        throw new Error("Key must be a string for Object.has on plain objects");
    }
};

/**
    Gets the value for a corresponding key from an object.

    <p>Uses Object.has to determine whether there is a corresponding value for
    the given key.  As such, <code>Object.get</code> is capable of retriving
    values from the prototype chain as long as they are not from the
    <code>Object.prototype</code>.

    <p>If there is no corresponding value, returns the given default, which may
    be <code>undefined</code>.

    <p>If the given object is an instance of a type that implements a method
    named "get", this function defers to the collection, so this method can be
    used to generically handle objects, arrays, or other collections.  In that
    case, the domain of the key depends on the implementation.  For a `Map`,
    for example, the key might be any object.

    @param {Object} object
    @param {String} key
    @param {Any} value a default to return, <code>undefined</code> if omitted
    @returns {Any} value for key, or default value
    @function external:Object.get
*/
Object.get = function (object, key, value) {
    if (typeof object !== "object") {
        throw new Error("Object.get can't accept non-object: " + typeof object);
    }
    // forward to mapped collections that implement "get"
    if (object && typeof object.get === "function") {
        return object.get(key, value);
    } else if (Object.has(object, key)) {
        return object[key];
    } else {
        return value;
    }
};

/**
    Sets the value for a given key on an object.

    <p>If the given object is an instance of a type that implements a method
    named "set", this function defers to the collection, so this method can be
    used to generically handle objects, arrays, or other collections.  As such,
    the key domain varies by the object type.

    @param {Object} object
    @param {String} key
    @param {Any} value
    @returns <code>undefined</code>
    @function external:Object.set
*/
Object.set = function (object, key, value) {
    if (object && typeof object.set === "function") {
        object.set(key, value);
    } else {
        object[key] = value;
    }
};

Object.addEach = function (target, source, overrides) {
    var overridesExistingProperty = arguments.length === 3 ? overrides : true;
    if (!source) {
    } else if (typeof source.forEach === "function" && !source.hasOwnProperty("forEach")) {
        // copy map-alikes
        if (source.isMap === true) {
            source.forEach(function (value, key) {
                target[key] = value;
            });
        // iterate key value pairs of other iterables
        } else {
            source.forEach(function (pair) {
                target[pair[0]] = pair[1];
            });
        }
    } else if (typeof source.length === "number") {
        // arguments, strings
        for (var index = 0; index < source.length; index++) {
            target[index] = source[index];
        }
    } else {
        // copy other objects as map-alikes
        for(var keys = Object.keys(source), i = 0, key;(key = keys[i]); i++) {
            if(overridesExistingProperty || !Object.owns(target,key)) {
                target[key] = source[key];
            }
        }
    }
    return target;
};


/*
var defineEach = function defineEach(target, prototype) {
    // console.log("Map defineEach: ",Object.keys(prototype));
    var proto = Map.prototype;
    for (var name in prototype) {
        if(!proto.hasOwnProperty(name)) {
            Object.defineProperty(proto, name, {
                value: prototype[name],
                writable: writable,
                configurable: configurable,
                enumerable: enumerable
            });
        }
    }
}
*/
Object.defineEach = function (target, source, overrides, configurable, enumerable, writable) {
    var overridesExistingProperty = arguments.length === 3 ? overrides : true;
    if (!source) {
    } else if (typeof source.forEach === "function" && !source.hasOwnProperty("forEach")) {
        // copy map-alikes
        if (source.isMap === true) {
            source.forEach(function (value, key) {
                Object.defineProperty(target, key, {
                    value: value,
                    writable: writable,
                    configurable: configurable,
                    enumerable: enumerable
                });
            });
        // iterate key value pairs of other iterables
        } else {
            source.forEach(function (pair) {
                Object.defineProperty(target, pair[0], {
                    value: pair[1],
                    writable: writable,
                    configurable: configurable,
                    enumerable: enumerable
                });

            });
        }
    } else if (typeof source.length === "number") {
        // arguments, strings
        for (var index = 0; index < source.length; index++) {
            Object.defineProperty(target, index, {
                value: source[index],
                writable: writable,
                configurable: configurable,
                enumerable: enumerable
            });

        }
    } else {
        // copy other objects as map-alikes
        for(var keys = Object.keys(source), i = 0, key;(key = keys[i]); i++) {
            if(overridesExistingProperty || !Object.owns(target,key)) {
                Object.defineProperty(target, key, {
                    value: source[key],
                    writable: writable,
                    configurable: configurable,
                    enumerable: enumerable
                });

            }
        }
    }
    return target;
};

/**
    Iterates over the owned properties of an object.

    @function external:Object.forEach
    @param {Object} object an object to iterate.
    @param {Function} callback a function to call for every key and value
    pair in the object.  Receives <code>value</code>, <code>key</code>,
    and <code>object</code> as arguments.
    @param {Object} thisp the <code>this</code> to pass through to the
    callback
*/
Object.forEach = function (object, callback, thisp) {

    var keys = Object.keys(object), i = 0, iKey;
    for(;(iKey = keys[i]);i++) {
        callback.call(thisp, object[iKey], iKey, object);
    }

};

/**
    Iterates over the owned properties of a map, constructing a new array of
    mapped values.

    @function external:Object.map
    @param {Object} object an object to iterate.
    @param {Function} callback a function to call for every key and value
    pair in the object.  Receives <code>value</code>, <code>key</code>,
    and <code>object</code> as arguments.
    @param {Object} thisp the <code>this</code> to pass through to the
    callback
    @returns {Array} the respective values returned by the callback for each
    item in the object.
*/
Object.map = function (object, callback, thisp) {
    var keys = Object.keys(object), i = 0, result = [], iKey;
    for(;(iKey = keys[i]);i++) {
        result.push(callback.call(thisp, object[iKey], iKey, object));
    }
    return result;
};

/**
    Returns the values for owned properties of an object.

    @function external:Object.map
    @param {Object} object
    @returns {Array} the respective value for each owned property of the
    object.
*/
Object.values = function (object) {
    return Object.map(object, Function.identity);
};

// TODO inline document concat
Object.concat = function () {
    var object = {};
    for (var i = 0; i < arguments.length; i++) {
        Object.addEach(object, arguments[i]);
    }
    return object;
};

Object.from = Object.concat;

/**
    Returns whether two values are identical.  Any value is identical to itself
    and only itself.  This is much more restictive than equivalence and subtly
    different than strict equality, <code>===</code> because of edge cases
    including negative zero and <code>NaN</code>.  Identity is useful for
    resolving collisions among keys in a mapping where the domain is any value.
    This method does not delgate to any method on an object and cannot be
    overridden.
    @see http://wiki.ecmascript.org/doku.php?id=harmony:egal
    @param {Any} this
    @param {Any} that
    @returns {Boolean} whether this and that are identical
    @function external:Object.is
*/
Object.is = function (x, y) {
    if (x === y) {
        // 0 === -0, but they are not identical
        return x !== 0 || 1 / x === 1 / y;
    }
    // NaN !== NaN, but they are identical.
    // NaNs are the only non-reflexive value, i.e., if x !== x,
    // then x is a NaN.
    // isNaN is broken: it converts its argument to number, so
    // isNaN("foo") => true
    return x !== x && y !== y;
};

/**
    Performs a polymorphic, type-sensitive deep equivalence comparison of any
    two values.

    <p>As a basic principle, any value is equivalent to itself (as in
    identity), any boxed version of itself (as a <code>new Number(10)</code> is
    to 10), and any deep clone of itself.

    <p>Equivalence has the following properties:

    <ul>
        <li><strong>polymorphic:</strong>
            If the given object is an instance of a type that implements a
            methods named "equals", this function defers to the method.  So,
            this function can safely compare any values regardless of type,
            including undefined, null, numbers, strings, any pair of objects
            where either implements "equals", or object literals that may even
            contain an "equals" key.
        <li><strong>type-sensitive:</strong>
            Incomparable types are not equal.  No object is equivalent to any
            array.  No string is equal to any other number.
        <li><strong>deep:</strong>
            Collections with equivalent content are equivalent, recursively.
        <li><strong>equivalence:</strong>
            Identical values and objects are equivalent, but so are collections
            that contain equivalent content.  Whether order is important varies
            by type.  For Arrays and lists, order is important.  For Objects,
            maps, and sets, order is not important.  Boxed objects are mutally
            equivalent with their unboxed values, by virtue of the standard
            <code>valueOf</code> method.
    </ul>
    @param this
    @param that
    @returns {Boolean} whether the values are deeply equivalent
    @function external:Object.equals
*/
Object.equals = function (a, b, equals, memo) {
    equals = equals || Object.equals;
    //console.log("Object.equals: a:",a, "b:",b, "equals:",equals);
    // unbox objects, but do not confuse object literals
    a = Object.getValueOf(a);
    b = Object.getValueOf(b);
    if (a === b)
        return true;
    if (Object.isObject(a)) {
        memo = memo || new WeakMap();
        if (memo.has(a)) {
            return true;
        }
        memo.set(a, true);
    }
    if (Object.isObject(a) && typeof a.equals === "function") {
        return a.equals(b, equals, memo);
    }
    // commutative
    if (Object.isObject(b) && typeof b.equals === "function") {
        return b.equals(a, equals, memo);
    }
    if (Object.isObject(a) && Object.isObject(b)) {
        if (Object.getPrototypeOf(a) === Object.prototype && Object.getPrototypeOf(b) === Object.prototype) {
            for (var name in a) {
                if (!equals(a[name], b[name], equals, memo)) {
                    return false;
                }
            }
            for (var name in b) {
                if (!(name in a) || !equals(b[name], a[name], equals, memo)) {
                    return false;
                }
            }
            return true;
        }
    }
    // NaN !== NaN, but they are equal.
    // NaNs are the only non-reflexive value, i.e., if x !== x,
    // then x is a NaN.
    // isNaN is broken: it converts its argument to number, so
    // isNaN("foo") => true
    // We have established that a !== b, but if a !== a && b !== b, they are
    // both NaN.
    if (a !== a && b !== b)
        return true;
    if (!a || !b)
        return a === b;
    return false;
};

// Because a return value of 0 from a `compare` function  may mean either
// "equals" or "is incomparable", `equals` cannot be defined in terms of
// `compare`.  However, `compare` *can* be defined in terms of `equals` and
// `lessThan`.  Again however, more often it would be desirable to implement
// all of the comparison functions in terms of compare rather than the other
// way around.

/**
    Determines the order in which any two objects should be sorted by returning
    a number that has an analogous relationship to zero as the left value to
    the right.  That is, if the left is "less than" the right, the returned
    value will be "less than" zero, where "less than" may be any other
    transitive relationship.

    <p>Arrays are compared by the first diverging values, or by length.

    <p>Any two values that are incomparable return zero.  As such,
    <code>equals</code> should not be implemented with <code>compare</code>
    since incomparability is indistinguishable from equality.

    <p>Sorts strings lexicographically.  This is not suitable for any
    particular international setting.  Different locales sort their phone books
    in very different ways, particularly regarding diacritics and ligatures.

    <p>If the given object is an instance of a type that implements a method
    named "compare", this function defers to the instance.  The method does not
    need to be an owned property to distinguish it from an object literal since
    object literals are incomparable.  Unlike <code>Object</code> however,
    <code>Array</code> implements <code>compare</code>.

    @param {Any} left
    @param {Any} right
    @returns {Number} a value having the same transitive relationship to zero
    as the left and right values.
    @function external:Object.compare
*/
Object.compare = function (a, b) {
    // unbox objects, but do not confuse object literals
    // mercifully handles the Date case
    a = Object.getValueOf(a);
    b = Object.getValueOf(b);
    if (a === b)
        return 0;
    var aType = typeof a;
    var bType = typeof b;
    if (aType === "number" && bType === "number")
        return a - b;
    if (aType === "string" && bType === "string")
        return a < b ? -Infinity : Infinity;
        // the possibility of equality elimiated above
    if (a && typeof a.compare === "function")
        return a.compare(b);
    // not commutative, the relationship is reversed
    if (b && typeof b.compare === "function")
        return -b.compare(a);
    return 0;
};

/**
    Creates a deep copy of any value.  Values, being immutable, are
    returned without alternation.  Forwards to <code>clone</code> on
    objects and arrays.

    @function external:Object.clone
    @param {Any} value a value to clone
    @param {Number} depth an optional traversal depth, defaults to infinity.
    A value of <code>0</code> means to make no clone and return the value
    directly.
    @param {Map} memo an optional memo of already visited objects to preserve
    reference cycles.  The cloned object will have the exact same shape as the
    original, but no identical objects.  Te map may be later used to associate
    all objects in the original object graph with their corresponding member of
    the cloned graph.
    @returns a copy of the value
*/
Object.clone = function (value, depth, memo) {
    value = Object.getValueOf(value);
    memo = memo || new WeakMap();
    if (depth === undefined) {
        depth = Infinity;
    } else if (depth === 0) {
        return value;
    }
    if (Object.isObject(value)) {
        if (!memo.has(value)) {
            if (value && typeof value.clone === "function") {
                memo.set(value, value.clone(depth, memo));
            } else {
                var prototype = Object.getPrototypeOf(value);
                if (prototype === null || prototype === Object.prototype) {
                    var clone = Object.create(prototype);
                    memo.set(value, clone);
                    for (var key in value) {
                        clone[key] = Object.clone(value[key], depth - 1, memo);
                    }
                } else {
                    throw new Error("Can't clone " + value);
                }
            }
        }
        return memo.get(value);
    }
    return value;
};

/**
    Removes all properties owned by this object making the object suitable for
    reuse.

    @function external:Object.clear
    @returns this
*/
Object.clear = function (object) {
    if (object && typeof object.clear === "function") {
        object.clear();
    } else {
        var keys = Object.keys(object),
            i = keys.length;
        while (i) {
            i--;
            delete object[keys[i]];
        }
    }
    return object;
};

},{"weak-map":35}],30:[function(require,module,exports){

/**
    accepts a string; returns the string with regex metacharacters escaped.
    the returned string can safely be used within a regex to match a literal
    string. escaped characters are [, ], {, }, (, ), -, *, +, ?, ., \, ^, $,
    |, #, [comma], and whitespace.
*/
if (!RegExp.escape) {
    var special = /[-[\]{}()*+?.\\^$|,#\s]/g;
    RegExp.escape = function (string) {
        return string.replace(special, "\\$&");
    };
}


},{}],31:[function(require,module,exports){

var Array = require("./shim-array");
var Object = require("./shim-object");
var Function = require("./shim-function");
var RegExp = require("./shim-regexp");


},{"./shim-array":27,"./shim-function":28,"./shim-object":29,"./shim-regexp":30}],32:[function(require,module,exports){
"use strict";

module.exports = SortedArray;

var Shim = require("./shim");
var GenericCollection = require("./generic-collection");
var PropertyChanges = require("./listen/property-changes");
var RangeChanges = require("./listen/range-changes");

function SortedArray(values, equals, compare, getDefault) {
    if (!(this instanceof SortedArray)) {
        return new SortedArray(values, equals, compare, getDefault);
    }
    if (Array.isArray(values)) {
        this.array = values;
        values = values.splice(0, values.length);
    } else {
        this.array = [];
    }
    this.contentEquals = equals || Object.equals;
    this.contentCompare = compare || Object.compare;
    this.getDefault = getDefault || Function.noop;

    this.length = 0;
    this.addEach(values);
}

// hack so require("sorted-array").SortedArray will work in MontageJS
SortedArray.SortedArray = SortedArray;

SortedArray.from = GenericCollection.from;

Object.addEach(SortedArray.prototype, GenericCollection.prototype);
Object.addEach(SortedArray.prototype, PropertyChanges.prototype);
Object.addEach(SortedArray.prototype, RangeChanges.prototype);

SortedArray.prototype.isSorted = true;

function search(array, value, compare) {
    var first = 0;
    var last = array.length - 1;
    while (first <= last) {
        var middle = (first + last) >> 1; // Math.floor( / 2)
        var comparison = compare(value, array[middle]);
        if (comparison > 0) {
            first = middle + 1;
        } else if (comparison < 0) {
            last = middle - 1;
        } else {
            return middle;
        }
    }
    return -(first + 1);
}

function searchFirst(array, value, compare, equals) {
    var index = search(array, value, compare);
    if (index < 0) {
        return -1;
    } else {
        while (index > 0 && equals(value, array[index - 1])) {
            index--;
        }
        if (!equals(value, array[index])) {
            return -1;
        } else {
            return index;
        }
    }
}

function searchLast(array, value, compare, equals) {
    var index = search(array, value, compare);
    if (index < 0) {
        return -1;
    } else {
        while (index < array.length - 1 && equals(value, array[index + 1])) {
            index++;
        }
        if (!equals(value, array[index])) {
            return -1;
        } else {
            return index;
        }
    }
}

function searchForInsertionIndex(array, value, compare) {
    var index = search(array, value, compare);
    if (index < 0) {
        return -index - 1;
    } else {
        var last = array.length - 1;
        while (index < last && compare(value, array[index + 1]) === 0) {
            index++;
        }
        return index;
    }
}

SortedArray.prototype.constructClone = function (values) {
    return new this.constructor(
        values,
        this.contentEquals,
        this.contentCompare,
        this.getDefault
    );
};

SortedArray.prototype.has = function (value, equals) {
    if (equals) {
        throw new Error("SortedSet#has does not support second argument: equals");
    }
    var index = search(this.array, value, this.contentCompare);
    return index >= 0 && this.contentEquals(this.array[index], value);
};

SortedArray.prototype.get = function (value, equals) {
    if (equals) {
        throw new Error("SortedArray#get does not support second argument: equals");
    }
    var index = searchFirst(this.array, value, this.contentCompare, this.contentEquals);
    if (index !== -1) {
        return this.array[index];
    } else {
        return this.getDefault(value);
    }
};

SortedArray.prototype.add = function (value) {
    var index = searchForInsertionIndex(this.array, value, this.contentCompare);
    if (this.dispatchesRangeChanges) {
        this.dispatchBeforeRangeChange([value], Array.empty, index);
    }
    this.array.splice(index, 0, value);
    this.length++;
    if (this.dispatchesRangeChanges) {
        this.dispatchRangeChange([value], Array.empty, index);
    }
    return true;
};

SortedArray.prototype["delete"] = function (value, equals) {
    if (equals) {
        throw new Error("SortedArray#delete does not support second argument: equals");
    }
    var index = searchFirst(this.array, value, this.contentCompare, this.contentEquals);
    if (index !== -1) {
        if (this.dispatchesRangeChanges) {
            this.dispatchBeforeRangeChange(Array.empty, [value], index);
        }
        this.array.spliceOne(index);
        this.length--;
        if (this.dispatchesRangeChanges) {
            this.dispatchRangeChange(Array.empty, [value], index);
        }
        return true;
    } else {
        return false;
    }
};

SortedArray.prototype.deleteAll = function (value, equals) {
    if (equals) {
        var count = this.array.deleteAll(value, equals);
        this.length -= count;
        return count;
    } else {
        var start = searchFirst(this.array, value, this.contentCompare, this.contentEquals);
        if (start !== -1) {
            var end = start;
            while (this.contentEquals(value, this.array[end])) {
                end++;
            }
            var minus = this.slice(start, end);
            if (this.dispatchesRangeChanges) {
                this.dispatchBeforeRangeChange(Array.empty, minus, start);
            }
            this.array.splice(start, minus.length);
            this.length -= minus.length;
            if (this.dispatchesRangeChanges) {
                this.dispatchRangeChange(Array.empty, minus, start);
            }
            return minus.length;
        } else {
            return 0;
        }
    }
};

SortedArray.prototype.indexOf = function (value) {
    // TODO throw error if provided a start index
    return searchFirst(this.array, value, this.contentCompare, this.contentEquals);
};

SortedArray.prototype.lastIndexOf = function (value) {
    // TODO throw error if provided a start index
    return searchLast(this.array, value, this.contentCompare, this.contentEquals);
};

SortedArray.prototype.find = function (value, equals, index) {
    // TODO throw error if provided a start index
    if (equals) {
        throw new Error("SortedArray#find does not support second argument: equals");
    }
    if (index) {
        throw new Error("SortedArray#find does not support third argument: index");
    }
    // TODO support initial partition index
    return searchFirst(this.array, value, this.contentCompare, this.contentEquals);
};

SortedArray.prototype.findLast = function (value, equals, index) {
    if (equals) {
        throw new Error("SortedArray#findLast does not support second argument: equals");
    }
    if (index) {
        throw new Error("SortedArray#findLast does not support third argument: index");
    }
    // TODO support initial partition index
    return searchLast(this.array, value, this.contentCompare, this.contentEquals);
};

SortedArray.prototype.push = function () {
    this.addEach(arguments);
};

SortedArray.prototype.unshift = function () {
    this.addEach(arguments);
};

SortedArray.prototype.pop = function () {
    var val = this.array.pop();
    this.length = this.array.length;
    return val;
};

SortedArray.prototype.shift = function () {
    var val = this.array.shift();
    this.length = this.array.length;
    return val;
};

SortedArray.prototype.slice = function () {
    return this.array.slice.apply(this.array, arguments);
};

SortedArray.prototype.splice = function (index, length /*...plus*/) {
    return this.swap(index, length, Array.prototype.slice.call(arguments, 2));
};

SortedArray.prototype.swap = function (index, length, plus) {
    if (index === undefined && length === undefined) {
        return Array.empty;
    }
    index = index || 0;
    if (index < 0) {
        index += this.length;
    }
    if (length === undefined) {
        length = Infinity;
    }
    var minus = this.slice(index, index + length);
    if (this.dispatchesRangeChanges) {
        this.dispatchBeforeRangeChange(plus, minus, index);
    }
    this.array.splice(index, length);
    this.length -= minus.length;
    if (this.dispatchesRangeChanges) {
        this.dispatchRangeChange(Array.empty, minus, index);
    }
    this.addEach(plus);
    return minus;
};

SortedArray.prototype.reduce = function (callback, basis /*, thisp*/) {
    var thisp = arguments[2];
    return this.array.reduce(function (basis, value, key) {
        return callback.call(thisp, basis, value, key, this);
    }, basis, this);
};

SortedArray.prototype.reduceRight = function () {
    var thisp = arguments[2];
    return this.array.reduceRight(function (basis, value, key) {
        return callback.call(thisp, basis, value, key, this);
    }, basis, this);
};

SortedArray.prototype.min = function () {
    if (this.length) {
        return this.array[0];
    }
};

SortedArray.prototype.max = function () {
    if (this.length) {
        return this.array[this.length - 1];
    }
};

SortedArray.prototype.one = function () {
    return this.array.one();
};

SortedArray.prototype.clear = function () {
    var minus;
    if (this.dispatchesRangeChanges) {
        minus = this.array.slice();
        this.dispatchBeforeRangeChange(Array.empty, minus, 0);
    }
    this.length = 0;
    this.array.clear();
    if (this.dispatchesRangeChanges) {
        this.dispatchRangeChange(Array.empty, minus, 0);
    }
};

SortedArray.prototype.equals = function (that, equals) {
    return this.array.equals(that, equals);
};

SortedArray.prototype.compare = function (that, compare) {
    return this.array.compare(that, compare);
};

SortedArray.prototype.iterate = function (start, end) {
    return new this.Iterator(this.array, start, end);
};

SortedArray.prototype.toJSON = function () {
    return this.toArray();
};

SortedArray.prototype.Iterator = Array.prototype.Iterator;

},{"./generic-collection":19,"./listen/property-changes":25,"./listen/range-changes":26,"./shim":31}],33:[function(require,module,exports){
"use strict";

module.exports = TreeLog;

function TreeLog() {
}

TreeLog.ascii = {
    intersection: "+",
    through: "-",
    branchUp: "+",
    branchDown: "+",
    fromBelow: ".",
    fromAbove: "'",
    fromBoth: "+",
    strafe: "|"
};

TreeLog.unicodeRound = {
    intersection: "\u254b",
    through: "\u2501",
    branchUp: "\u253b",
    branchDown: "\u2533",
    fromBelow: "\u256d", // round corner
    fromAbove: "\u2570", // round corner
    fromBoth: "\u2523",
    strafe: "\u2503"
};

TreeLog.unicodeSharp = {
    intersection: "\u254b",
    through: "\u2501",
    branchUp: "\u253b",
    branchDown: "\u2533",
    fromBelow: "\u250f", // sharp corner
    fromAbove: "\u2517", // sharp corner
    fromBoth: "\u2523",
    strafe: "\u2503"
};


},{}],34:[function(require,module,exports){
(function (global){
module.exports = (global.WeakMap !== void 0) ? global.WeakMap : require("weak-map");

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"weak-map":35}],35:[function(require,module,exports){
// Copyright (C) 2011 Google Inc.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
// http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * @fileoverview Install a leaky WeakMap emulation on platforms that
 * don't provide a built-in one.
 *
 * <p>Assumes that an ES5 platform where, if {@code WeakMap} is
 * already present, then it conforms to the anticipated ES6
 * specification. To run this file on an ES5 or almost ES5
 * implementation where the {@code WeakMap} specification does not
 * quite conform, run <code>repairES5.js</code> first.
 *
 * <p>Even though WeakMapModule is not global, the linter thinks it
 * is, which is why it is in the overrides list below.
 *
 * <p>NOTE: Before using this WeakMap emulation in a non-SES
 * environment, see the note below about hiddenRecord.
 *
 * @author Mark S. Miller
 * @requires crypto, ArrayBuffer, Uint8Array, navigator, console
 * @overrides WeakMap, ses, Proxy
 * @overrides WeakMapModule
 */

/**
 * This {@code WeakMap} emulation is observably equivalent to the
 * ES-Harmony WeakMap, but with leakier garbage collection properties.
 *
 * <p>As with true WeakMaps, in this emulation, a key does not
 * retain maps indexed by that key and (crucially) a map does not
 * retain the keys it indexes. A map by itself also does not retain
 * the values associated with that map.
 *
 * <p>However, the values associated with a key in some map are
 * retained so long as that key is retained and those associations are
 * not overridden. For example, when used to support membranes, all
 * values exported from a given membrane will live for the lifetime
 * they would have had in the absence of an interposed membrane. Even
 * when the membrane is revoked, all objects that would have been
 * reachable in the absence of revocation will still be reachable, as
 * far as the GC can tell, even though they will no longer be relevant
 * to ongoing computation.
 *
 * <p>The API implemented here is approximately the API as implemented
 * in FF6.0a1 and agreed to by MarkM, Andreas Gal, and Dave Herman,
 * rather than the offially approved proposal page. TODO(erights):
 * upgrade the ecmascript WeakMap proposal page to explain this API
 * change and present to EcmaScript committee for their approval.
 *
 * <p>The first difference between the emulation here and that in
 * FF6.0a1 is the presence of non enumerable {@code get___, has___,
 * set___, and delete___} methods on WeakMap instances to represent
 * what would be the hidden internal properties of a primitive
 * implementation. Whereas the FF6.0a1 WeakMap.prototype methods
 * require their {@code this} to be a genuine WeakMap instance (i.e.,
 * an object of {@code [[Class]]} "WeakMap}), since there is nothing
 * unforgeable about the pseudo-internal method names used here,
 * nothing prevents these emulated prototype methods from being
 * applied to non-WeakMaps with pseudo-internal methods of the same
 * names.
 *
 * <p>Another difference is that our emulated {@code
 * WeakMap.prototype} is not itself a WeakMap. A problem with the
 * current FF6.0a1 API is that WeakMap.prototype is itself a WeakMap
 * providing ambient mutability and an ambient communications
 * channel. Thus, if a WeakMap is already present and has this
 * problem, repairES5.js wraps it in a safe wrappper in order to
 * prevent access to this channel. (See
 * PATCH_MUTABLE_FROZEN_WEAKMAP_PROTO in repairES5.js).
 */

/**
 * If this is a full <a href=
 * "http://code.google.com/p/es-lab/wiki/SecureableES5"
 * >secureable ES5</a> platform and the ES-Harmony {@code WeakMap} is
 * absent, install an approximate emulation.
 *
 * <p>If WeakMap is present but cannot store some objects, use our approximate
 * emulation as a wrapper.
 *
 * <p>If this is almost a secureable ES5 platform, then WeakMap.js
 * should be run after repairES5.js.
 *
 * <p>See {@code WeakMap} for documentation of the garbage collection
 * properties of this WeakMap emulation.
 */
(function WeakMapModule() {
  "use strict";

  if (typeof ses !== 'undefined' && ses.ok && !ses.ok()) {
    // already too broken, so give up
    return;
  }

  /**
   * In some cases (current Firefox), we must make a choice betweeen a
   * WeakMap which is capable of using all varieties of host objects as
   * keys and one which is capable of safely using proxies as keys. See
   * comments below about HostWeakMap and DoubleWeakMap for details.
   *
   * This function (which is a global, not exposed to guests) marks a
   * WeakMap as permitted to do what is necessary to index all host
   * objects, at the cost of making it unsafe for proxies.
   *
   * Do not apply this function to anything which is not a genuine
   * fresh WeakMap.
   */
  function weakMapPermitHostObjects(map) {
    // identity of function used as a secret -- good enough and cheap
    if (map.permitHostObjects___) {
      map.permitHostObjects___(weakMapPermitHostObjects);
    }
  }
  if (typeof ses !== 'undefined') {
    ses.weakMapPermitHostObjects = weakMapPermitHostObjects;
  }

  // IE 11 has no Proxy but has a broken WeakMap such that we need to patch
  // it using DoubleWeakMap; this flag tells DoubleWeakMap so.
  var doubleWeakMapCheckSilentFailure = false;

  // Check if there is already a good-enough WeakMap implementation, and if so
  // exit without replacing it.
  if (typeof WeakMap === 'function') {
    var HostWeakMap = WeakMap;
    // There is a WeakMap -- is it good enough?
    if (typeof navigator !== 'undefined' &&
        /Firefox/.test(navigator.userAgent)) {
      // We're now *assuming not*, because as of this writing (2013-05-06)
      // Firefox's WeakMaps have a miscellany of objects they won't accept, and
      // we don't want to make an exhaustive list, and testing for just one
      // will be a problem if that one is fixed alone (as they did for Event).

      // If there is a platform that we *can* reliably test on, here's how to
      // do it:
      //  var problematic = ... ;
      //  var testHostMap = new HostWeakMap();
      //  try {
      //    testHostMap.set(problematic, 1);  // Firefox 20 will throw here
      //    if (testHostMap.get(problematic) === 1) {
      //      return;
      //    }
      //  } catch (e) {}

    } else {
      // IE 11 bug: WeakMaps silently fail to store frozen objects.
      var testMap = new HostWeakMap();
      var testObject = Object.freeze({});
      testMap.set(testObject, 1);
      if (testMap.get(testObject) !== 1) {
        doubleWeakMapCheckSilentFailure = true;
        // Fall through to installing our WeakMap.
      } else {
        module.exports = WeakMap;
        return;
      }
    }
  }

  var hop = Object.prototype.hasOwnProperty;
  var gopn = Object.getOwnPropertyNames;
  var defProp = Object.defineProperty;
  var isExtensible = Object.isExtensible;

  /**
   * Security depends on HIDDEN_NAME being both <i>unguessable</i> and
   * <i>undiscoverable</i> by untrusted code.
   *
   * <p>Given the known weaknesses of Math.random() on existing
   * browsers, it does not generate unguessability we can be confident
   * of.
   *
   * <p>It is the monkey patching logic in this file that is intended
   * to ensure undiscoverability. The basic idea is that there are
   * three fundamental means of discovering properties of an object:
   * The for/in loop, Object.keys(), and Object.getOwnPropertyNames(),
   * as well as some proposed ES6 extensions that appear on our
   * whitelist. The first two only discover enumerable properties, and
   * we only use HIDDEN_NAME to name a non-enumerable property, so the
   * only remaining threat should be getOwnPropertyNames and some
   * proposed ES6 extensions that appear on our whitelist. We monkey
   * patch them to remove HIDDEN_NAME from the list of properties they
   * returns.
   *
   * <p>TODO(erights): On a platform with built-in Proxies, proxies
   * could be used to trap and thereby discover the HIDDEN_NAME, so we
   * need to monkey patch Proxy.create, Proxy.createFunction, etc, in
   * order to wrap the provided handler with the real handler which
   * filters out all traps using HIDDEN_NAME.
   *
   * <p>TODO(erights): Revisit Mike Stay's suggestion that we use an
   * encapsulated function at a not-necessarily-secret name, which
   * uses the Stiegler shared-state rights amplification pattern to
   * reveal the associated value only to the WeakMap in which this key
   * is associated with that value. Since only the key retains the
   * function, the function can also remember the key without causing
   * leakage of the key, so this doesn't violate our general gc
   * goals. In addition, because the name need not be a guarded
   * secret, we could efficiently handle cross-frame frozen keys.
   */
  var HIDDEN_NAME_PREFIX = 'weakmap:';
  var HIDDEN_NAME = HIDDEN_NAME_PREFIX + 'ident:' + Math.random() + '___';

  if (typeof crypto !== 'undefined' &&
      typeof crypto.getRandomValues === 'function' &&
      typeof ArrayBuffer === 'function' &&
      typeof Uint8Array === 'function') {
    var ab = new ArrayBuffer(25);
    var u8s = new Uint8Array(ab);
    crypto.getRandomValues(u8s);
    HIDDEN_NAME = HIDDEN_NAME_PREFIX + 'rand:' +
      Array.prototype.map.call(u8s, function(u8) {
        return (u8 % 36).toString(36);
      }).join('') + '___';
  }

  function isNotHiddenName(name) {
    return !(
        name.substr(0, HIDDEN_NAME_PREFIX.length) == HIDDEN_NAME_PREFIX &&
        name.substr(name.length - 3) === '___');
  }

  /**
   * Monkey patch getOwnPropertyNames to avoid revealing the
   * HIDDEN_NAME.
   *
   * <p>The ES5.1 spec requires each name to appear only once, but as
   * of this writing, this requirement is controversial for ES6, so we
   * made this code robust against this case. If the resulting extra
   * search turns out to be expensive, we can probably relax this once
   * ES6 is adequately supported on all major browsers, iff no browser
   * versions we support at that time have relaxed this constraint
   * without providing built-in ES6 WeakMaps.
   */
  defProp(Object, 'getOwnPropertyNames', {
    value: function fakeGetOwnPropertyNames(obj) {
      return gopn(obj).filter(isNotHiddenName);
    }
  });

  /**
   * getPropertyNames is not in ES5 but it is proposed for ES6 and
   * does appear in our whitelist, so we need to clean it too.
   */
  if ('getPropertyNames' in Object) {
    var originalGetPropertyNames = Object.getPropertyNames;
    defProp(Object, 'getPropertyNames', {
      value: function fakeGetPropertyNames(obj) {
        return originalGetPropertyNames(obj).filter(isNotHiddenName);
      }
    });
  }

  /**
   * <p>To treat objects as identity-keys with reasonable efficiency
   * on ES5 by itself (i.e., without any object-keyed collections), we
   * need to add a hidden property to such key objects when we
   * can. This raises several issues:
   * <ul>
   * <li>Arranging to add this property to objects before we lose the
   *     chance, and
   * <li>Hiding the existence of this new property from most
   *     JavaScript code.
   * <li>Preventing <i>certification theft</i>, where one object is
   *     created falsely claiming to be the key of an association
   *     actually keyed by another object.
   * <li>Preventing <i>value theft</i>, where untrusted code with
   *     access to a key object but not a weak map nevertheless
   *     obtains access to the value associated with that key in that
   *     weak map.
   * </ul>
   * We do so by
   * <ul>
   * <li>Making the name of the hidden property unguessable, so "[]"
   *     indexing, which we cannot intercept, cannot be used to access
   *     a property without knowing the name.
   * <li>Making the hidden property non-enumerable, so we need not
   *     worry about for-in loops or {@code Object.keys},
   * <li>monkey patching those reflective methods that would
   *     prevent extensions, to add this hidden property first,
   * <li>monkey patching those methods that would reveal this
   *     hidden property.
   * </ul>
   * Unfortunately, because of same-origin iframes, we cannot reliably
   * add this hidden property before an object becomes
   * non-extensible. Instead, if we encounter a non-extensible object
   * without a hidden record that we can detect (whether or not it has
   * a hidden record stored under a name secret to us), then we just
   * use the key object itself to represent its identity in a brute
   * force leaky map stored in the weak map, losing all the advantages
   * of weakness for these.
   */
  function getHiddenRecord(key) {
    if (key !== Object(key)) {
      throw new TypeError('Not an object: ' + key);
    }
    var hiddenRecord = key[HIDDEN_NAME];
    if (hiddenRecord && hiddenRecord.key === key) { return hiddenRecord; }
    if (!isExtensible(key)) {
      // Weak map must brute force, as explained in doc-comment above.
      return void 0;
    }

    // The hiddenRecord and the key point directly at each other, via
    // the "key" and HIDDEN_NAME properties respectively. The key
    // field is for quickly verifying that this hidden record is an
    // own property, not a hidden record from up the prototype chain.
    //
    // NOTE: Because this WeakMap emulation is meant only for systems like
    // SES where Object.prototype is frozen without any numeric
    // properties, it is ok to use an object literal for the hiddenRecord.
    // This has two advantages:
    // * It is much faster in a performance critical place
    // * It avoids relying on Object.create(null), which had been
    //   problematic on Chrome 28.0.1480.0. See
    //   https://code.google.com/p/google-caja/issues/detail?id=1687
    hiddenRecord = { key: key };

    // When using this WeakMap emulation on platforms where
    // Object.prototype might not be frozen and Object.create(null) is
    // reliable, use the following two commented out lines instead.
    // hiddenRecord = Object.create(null);
    // hiddenRecord.key = key;

    // Please contact us if you need this to work on platforms where
    // Object.prototype might not be frozen and
    // Object.create(null) might not be reliable.

    try {
      defProp(key, HIDDEN_NAME, {
        value: hiddenRecord,
        writable: false,
        enumerable: false,
        configurable: false
      });
      return hiddenRecord;
    } catch (error) {
      // Under some circumstances, isExtensible seems to misreport whether
      // the HIDDEN_NAME can be defined.
      // The circumstances have not been isolated, but at least affect
      // Node.js v0.10.26 on TravisCI / Linux, but not the same version of
      // Node.js on OS X.
      return void 0;
    }
  }

  /**
   * Monkey patch operations that would make their argument
   * non-extensible.
   *
   * <p>The monkey patched versions throw a TypeError if their
   * argument is not an object, so it should only be done to functions
   * that should throw a TypeError anyway if their argument is not an
   * object.
   */
  (function(){
    var oldFreeze = Object.freeze;
    defProp(Object, 'freeze', {
      value: function identifyingFreeze(obj) {
        getHiddenRecord(obj);
        return oldFreeze(obj);
      }
    });
    var oldSeal = Object.seal;
    defProp(Object, 'seal', {
      value: function identifyingSeal(obj) {
        getHiddenRecord(obj);
        return oldSeal(obj);
      }
    });
    var oldPreventExtensions = Object.preventExtensions;
    defProp(Object, 'preventExtensions', {
      value: function identifyingPreventExtensions(obj) {
        getHiddenRecord(obj);
        return oldPreventExtensions(obj);
      }
    });
  })();

  function constFunc(func) {
    func.prototype = null;
    return Object.freeze(func);
  }

  var calledAsFunctionWarningDone = false;
  function calledAsFunctionWarning() {
    // Future ES6 WeakMap is currently (2013-09-10) expected to reject WeakMap()
    // but we used to permit it and do it ourselves, so warn only.
    if (!calledAsFunctionWarningDone && typeof console !== 'undefined') {
      calledAsFunctionWarningDone = true;
      console.warn('WeakMap should be invoked as new WeakMap(), not ' +
          'WeakMap(). This will be an error in the future.');
    }
  }

  var nextId = 0;

  var OurWeakMap = function() {
    if (!(this instanceof OurWeakMap)) {  // approximate test for new ...()
      calledAsFunctionWarning();
    }

    // We are currently (12/25/2012) never encountering any prematurely
    // non-extensible keys.
    var keys = []; // brute force for prematurely non-extensible keys.
    var values = []; // brute force for corresponding values.
    var id = nextId++;

    function get___(key, opt_default) {
      var index;
      var hiddenRecord = getHiddenRecord(key);
      if (hiddenRecord) {
        return id in hiddenRecord ? hiddenRecord[id] : opt_default;
      } else {
        index = keys.indexOf(key);
        return index >= 0 ? values[index] : opt_default;
      }
    }

    function has___(key) {
      var hiddenRecord = getHiddenRecord(key);
      if (hiddenRecord) {
        return id in hiddenRecord;
      } else {
        return keys.indexOf(key) >= 0;
      }
    }

    function set___(key, value) {
      var index;
      var hiddenRecord = getHiddenRecord(key);
      if (hiddenRecord) {
        hiddenRecord[id] = value;
      } else {
        index = keys.indexOf(key);
        if (index >= 0) {
          values[index] = value;
        } else {
          // Since some browsers preemptively terminate slow turns but
          // then continue computing with presumably corrupted heap
          // state, we here defensively get keys.length first and then
          // use it to update both the values and keys arrays, keeping
          // them in sync.
          index = keys.length;
          values[index] = value;
          // If we crash here, values will be one longer than keys.
          keys[index] = key;
        }
      }
      return this;
    }

    function delete___(key) {
      var hiddenRecord = getHiddenRecord(key);
      var index, lastIndex;
      if (hiddenRecord) {
        return id in hiddenRecord && delete hiddenRecord[id];
      } else {
        index = keys.indexOf(key);
        if (index < 0) {
          return false;
        }
        // Since some browsers preemptively terminate slow turns but
        // then continue computing with potentially corrupted heap
        // state, we here defensively get keys.length first and then use
        // it to update both the keys and the values array, keeping
        // them in sync. We update the two with an order of assignments,
        // such that any prefix of these assignments will preserve the
        // key/value correspondence, either before or after the delete.
        // Note that this needs to work correctly when index === lastIndex.
        lastIndex = keys.length - 1;
        keys[index] = void 0;
        // If we crash here, there's a void 0 in the keys array, but
        // no operation will cause a "keys.indexOf(void 0)", since
        // getHiddenRecord(void 0) will always throw an error first.
        values[index] = values[lastIndex];
        // If we crash here, values[index] cannot be found here,
        // because keys[index] is void 0.
        keys[index] = keys[lastIndex];
        // If index === lastIndex and we crash here, then keys[index]
        // is still void 0, since the aliasing killed the previous key.
        keys.length = lastIndex;
        // If we crash here, keys will be one shorter than values.
        values.length = lastIndex;
        return true;
      }
    }

    return Object.create(OurWeakMap.prototype, {
      get___:    { value: constFunc(get___) },
      has___:    { value: constFunc(has___) },
      set___:    { value: constFunc(set___) },
      delete___: { value: constFunc(delete___) }
    });
  };

  OurWeakMap.prototype = Object.create(Object.prototype, {
    get: {
      /**
       * Return the value most recently associated with key, or
       * opt_default if none.
       */
      value: function get(key, opt_default) {
        return this.get___(key, opt_default);
      },
      writable: true,
      configurable: true
    },

    has: {
      /**
       * Is there a value associated with key in this WeakMap?
       */
      value: function has(key) {
        return this.has___(key);
      },
      writable: true,
      configurable: true
    },

    set: {
      /**
       * Associate value with key in this WeakMap, overwriting any
       * previous association if present.
       */
      value: function set(key, value) {
        return this.set___(key, value);
      },
      writable: true,
      configurable: true
    },

    'delete': {
      /**
       * Remove any association for key in this WeakMap, returning
       * whether there was one.
       *
       * <p>Note that the boolean return here does not work like the
       * {@code delete} operator. The {@code delete} operator returns
       * whether the deletion succeeds at bringing about a state in
       * which the deleted property is absent. The {@code delete}
       * operator therefore returns true if the property was already
       * absent, whereas this {@code delete} method returns false if
       * the association was already absent.
       */
      value: function remove(key) {
        return this.delete___(key);
      },
      writable: true,
      configurable: true
    }
  });

  if (typeof HostWeakMap === 'function') {
    (function() {
      // If we got here, then the platform has a WeakMap but we are concerned
      // that it may refuse to store some key types. Therefore, make a map
      // implementation which makes use of both as possible.

      // In this mode we are always using double maps, so we are not proxy-safe.
      // This combination does not occur in any known browser, but we had best
      // be safe.
      if (doubleWeakMapCheckSilentFailure && typeof Proxy !== 'undefined') {
        Proxy = undefined;
      }

      function DoubleWeakMap() {
        if (!(this instanceof OurWeakMap)) {  // approximate test for new ...()
          calledAsFunctionWarning();
        }

        // Preferable, truly weak map.
        var hmap = new HostWeakMap();

        // Our hidden-property-based pseudo-weak-map. Lazily initialized in the
        // 'set' implementation; thus we can avoid performing extra lookups if
        // we know all entries actually stored are entered in 'hmap'.
        var omap = undefined;

        // Hidden-property maps are not compatible with proxies because proxies
        // can observe the hidden name and either accidentally expose it or fail
        // to allow the hidden property to be set. Therefore, we do not allow
        // arbitrary WeakMaps to switch to using hidden properties, but only
        // those which need the ability, and unprivileged code is not allowed
        // to set the flag.
        //
        // (Except in doubleWeakMapCheckSilentFailure mode in which case we
        // disable proxies.)
        var enableSwitching = false;

        function dget(key, opt_default) {
          if (omap) {
            return hmap.has(key) ? hmap.get(key)
                : omap.get___(key, opt_default);
          } else {
            return hmap.get(key, opt_default);
          }
        }

        function dhas(key) {
          return hmap.has(key) || (omap ? omap.has___(key) : false);
        }

        var dset;
        if (doubleWeakMapCheckSilentFailure) {
          dset = function(key, value) {
            hmap.set(key, value);
            if (!hmap.has(key)) {
              if (!omap) { omap = new OurWeakMap(); }
              omap.set(key, value);
            }
            return this;
          };
        } else {
          dset = function(key, value) {
            if (enableSwitching) {
              try {
                hmap.set(key, value);
              } catch (e) {
                if (!omap) { omap = new OurWeakMap(); }
                omap.set___(key, value);
              }
            } else {
              hmap.set(key, value);
            }
            return this;
          };
        }

        function ddelete(key) {
          var result = !!hmap['delete'](key);
          if (omap) { return omap.delete___(key) || result; }
          return result;
        }

        return Object.create(OurWeakMap.prototype, {
          get___:    { value: constFunc(dget) },
          has___:    { value: constFunc(dhas) },
          set___:    { value: constFunc(dset) },
          delete___: { value: constFunc(ddelete) },
          permitHostObjects___: { value: constFunc(function(token) {
            if (token === weakMapPermitHostObjects) {
              enableSwitching = true;
            } else {
              throw new Error('bogus call to permitHostObjects___');
            }
          })}
        });
      }
      DoubleWeakMap.prototype = OurWeakMap.prototype;
      module.exports = DoubleWeakMap;

      // define .constructor to hide OurWeakMap ctor
      Object.defineProperty(WeakMap.prototype, 'constructor', {
        value: WeakMap,
        enumerable: false,  // as default .constructor is
        configurable: true,
        writable: true
      });
    })();
  } else {
    // There is no host WeakMap, so we must use the emulation.

    // Emulated WeakMaps are incompatible with native proxies (because proxies
    // can observe the hidden name), so we must disable Proxy usage (in
    // ArrayLike and Domado, currently).
    if (typeof Proxy !== 'undefined') {
      Proxy = undefined;
    }

    module.exports = OurWeakMap;
  }
})();

},{}],36:[function(require,module,exports){
"use strict";
exports.DataSet = require('./core/DataSet');
exports.DataTable = require('./core/DataTable');
exports.DataView = require('./core/DataView');
exports.DataRow = require('./core/DataRow');
exports.DataRowVersion = require('./core/DataRowVersion');
exports.DataRowState = require('./core/DataRowState');
exports.DataColumn = require('./core/DataColumn');
exports.DataColumnConstraint = require('./core/DataColumnConstraint');
exports.DataColumnCollection = require('./core/DataColumnCollection');
exports.DataRelation = require('./core/DataRelation');
exports.util = require('./core/Util');
exports.CommandBuilderBase = require('./adapter/CommandBuilderBase');

},{"./adapter/CommandBuilderBase":1,"./core/DataColumn":2,"./core/DataColumnCollection":3,"./core/DataColumnConstraint":4,"./core/DataRelation":5,"./core/DataRow":6,"./core/DataRowState":8,"./core/DataRowVersion":9,"./core/DataSet":10,"./core/DataTable":11,"./core/DataView":12,"./core/Util":13}]},{},[36])(36)
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJidWlsZC9hZGFwdGVyL0NvbW1hbmRCdWlsZGVyQmFzZS5qcyIsImJ1aWxkL2NvcmUvRGF0YUNvbHVtbi5qcyIsImJ1aWxkL2NvcmUvRGF0YUNvbHVtbkNvbGxlY3Rpb24uanMiLCJidWlsZC9jb3JlL0RhdGFDb2x1bW5Db25zdHJhaW50LmpzIiwiYnVpbGQvY29yZS9EYXRhUmVsYXRpb24uanMiLCJidWlsZC9jb3JlL0RhdGFSb3cuanMiLCJidWlsZC9jb3JlL0RhdGFSb3dDb2xsZWN0aW9uLmpzIiwiYnVpbGQvY29yZS9EYXRhUm93U3RhdGUuanMiLCJidWlsZC9jb3JlL0RhdGFSb3dWZXJzaW9uLmpzIiwiYnVpbGQvY29yZS9EYXRhU2V0LmpzIiwiYnVpbGQvY29yZS9EYXRhVGFibGUuanMiLCJidWlsZC9jb3JlL0RhdGFWaWV3LmpzIiwiYnVpbGQvY29yZS9VdGlsLmpzIiwibm9kZV9tb2R1bGVzL2NvbGxlY3Rpb25zL19kaWN0LmpzIiwibm9kZV9tb2R1bGVzL2NvbGxlY3Rpb25zL19mYXN0LXNldC5qcyIsIm5vZGVfbW9kdWxlcy9jb2xsZWN0aW9ucy9fbGlzdC5qcyIsIm5vZGVfbW9kdWxlcy9jb2xsZWN0aW9ucy9fbWFwLmpzIiwibm9kZV9tb2R1bGVzL2NvbGxlY3Rpb25zL19zZXQuanMiLCJub2RlX21vZHVsZXMvY29sbGVjdGlvbnMvZ2VuZXJpYy1jb2xsZWN0aW9uLmpzIiwibm9kZV9tb2R1bGVzL2NvbGxlY3Rpb25zL2dlbmVyaWMtbWFwLmpzIiwibm9kZV9tb2R1bGVzL2NvbGxlY3Rpb25zL2dlbmVyaWMtb3JkZXIuanMiLCJub2RlX21vZHVsZXMvY29sbGVjdGlvbnMvZ2VuZXJpYy1zZXQuanMiLCJub2RlX21vZHVsZXMvY29sbGVjdGlvbnMvaXRlcmF0b3IuanMiLCJub2RlX21vZHVsZXMvY29sbGVjdGlvbnMvbGlzdGVuL2NoYW5nZS1kZXNjcmlwdG9yLmpzIiwibm9kZV9tb2R1bGVzL2NvbGxlY3Rpb25zL2xpc3Rlbi9wcm9wZXJ0eS1jaGFuZ2VzLmpzIiwibm9kZV9tb2R1bGVzL2NvbGxlY3Rpb25zL2xpc3Rlbi9yYW5nZS1jaGFuZ2VzLmpzIiwibm9kZV9tb2R1bGVzL2NvbGxlY3Rpb25zL3NoaW0tYXJyYXkuanMiLCJub2RlX21vZHVsZXMvY29sbGVjdGlvbnMvc2hpbS1mdW5jdGlvbi5qcyIsIm5vZGVfbW9kdWxlcy9jb2xsZWN0aW9ucy9zaGltLW9iamVjdC5qcyIsIm5vZGVfbW9kdWxlcy9jb2xsZWN0aW9ucy9zaGltLXJlZ2V4cC5qcyIsIm5vZGVfbW9kdWxlcy9jb2xsZWN0aW9ucy9zaGltLmpzIiwibm9kZV9tb2R1bGVzL2NvbGxlY3Rpb25zL3NvcnRlZC1hcnJheS5qcyIsIm5vZGVfbW9kdWxlcy9jb2xsZWN0aW9ucy90cmVlLWxvZy5qcyIsIm5vZGVfbW9kdWxlcy9jb2xsZWN0aW9ucy93ZWFrLW1hcC5qcyIsIm5vZGVfbW9kdWxlcy93ZWFrLW1hcC93ZWFrLW1hcC5qcyIsImJ1aWxkL2FyZ2EuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDUkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDVEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDVEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1hBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pJQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1hBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDVkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9DQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNSQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOU1BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN6T0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FDMVlBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7O0FDdFRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7O0FDeFJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7OztBQ2xTQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25OQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDekZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0WEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN0lBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDamVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDblFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN6WEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdmxCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDZEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDTkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9VQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUN4Q0E7QUFDQTs7OztBQ0RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN3FCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIi8vIENvbW1hbmRCdWlsZGVyQmFzZS50c1xyXG5cInVzZSBzdHJpY3RcIjtcclxudmFyIENvbW1hbmRCdWlsZGVyQmFzZSA9IChmdW5jdGlvbiAoKSB7XHJcbiAgICBmdW5jdGlvbiBDb21tYW5kQnVpbGRlckJhc2UoKSB7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gQ29tbWFuZEJ1aWxkZXJCYXNlO1xyXG59KCkpO1xyXG5tb2R1bGUuZXhwb3J0cyA9IENvbW1hbmRCdWlsZGVyQmFzZTtcclxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9Q29tbWFuZEJ1aWxkZXJCYXNlLmpzLm1hcCIsIi8vIERhdGFDb2x1bW4udHNcclxuXCJ1c2Ugc3RyaWN0XCI7XHJcbnZhciBTb3J0ZWRBcnJheSA9IHJlcXVpcmUoJ2NvbGxlY3Rpb25zL3NvcnRlZC1hcnJheScpO1xyXG52YXIgdXRpbCA9IHJlcXVpcmUoJy4vVXRpbCcpO1xyXG52YXIgRGF0YVRhYmxlID0gcmVxdWlyZSgnLi9EYXRhVGFibGUnKTtcclxudmFyIERhdGFDb2x1bW4gPSAoZnVuY3Rpb24gKCkge1xyXG4gICAgZnVuY3Rpb24gRGF0YUNvbHVtbih0YWJsZSwgbmFtZSwga2V5UGF0aCkge1xyXG4gICAgICAgIGlmICghKHRhYmxlIGluc3RhbmNlb2YgRGF0YVRhYmxlKSkge1xyXG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJjYW5ub3QgY29uc3RydWN0IERhdGFDb2x1bW4gd2l0aG91dCBEYXRhVGFibGVcIik7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuX25hbWUgPSBuYW1lO1xyXG4gICAgICAgIHRoaXMuX2tleVBhdGggPSBrZXlQYXRoO1xyXG4gICAgICAgIHRoaXMuX2luZGV4ID0gbmV3IFNvcnRlZEFycmF5KHVuZGVmaW5lZCwgdXRpbC5jcmVhdGVDb250ZW50RXF1YXRvcihrZXlQYXRoKSwgdXRpbC5jcmVhdGVDb250ZW50Q29tcGFyZXIoa2V5UGF0aCkpO1xyXG4gICAgfVxyXG4gICAgRGF0YUNvbHVtbi5wcm90b3R5cGUuX2dldCA9IGZ1bmN0aW9uIChvYmplY3QpIHtcclxuICAgICAgICByZXR1cm4gdXRpbC5yZXNvbHZlS2V5UGF0aCh0aGlzLl9rZXlQYXRoLCBvYmplY3QpO1xyXG4gICAgfTtcclxuICAgIERhdGFDb2x1bW4ucHJvdG90eXBlLnRhYmxlID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl90YWJsZTtcclxuICAgIH07XHJcbiAgICBEYXRhQ29sdW1uLnByb3RvdHlwZS5uYW1lID0gZnVuY3Rpb24gKHNOYW1lKSB7XHJcbiAgICAgICAgaWYgKHNOYW1lICE9PSB1bmRlZmluZWQpIHtcclxuICAgICAgICAgICAgdGhpcy5fbmFtZSA9IHNOYW1lO1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcztcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX25hbWU7XHJcbiAgICB9O1xyXG4gICAgcmV0dXJuIERhdGFDb2x1bW47XHJcbn0oKSk7XHJcbnZhciBJdGVtID0gKGZ1bmN0aW9uICgpIHtcclxuICAgIGZ1bmN0aW9uIEl0ZW0oa2V5LCBpbmRleCkge1xyXG4gICAgICAgIHRoaXMua2V5ID0ga2V5O1xyXG4gICAgICAgIHRoaXMuaW5kZXggPSBpbmRleDtcclxuICAgIH1cclxuICAgIHJldHVybiBJdGVtO1xyXG59KCkpO1xyXG5tb2R1bGUuZXhwb3J0cyA9IERhdGFDb2x1bW47XHJcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPURhdGFDb2x1bW4uanMubWFwIiwiLy8gRGF0YUNvbHVtbkNvbGxlY3Rpb24udHNcclxuXCJ1c2Ugc3RyaWN0XCI7XHJcbi8vaW1wb3J0IHtDb2xsZWN0aW9ufSBmcm9tICcuL1V0aWwuQ29sbGVjdGlvbidcclxudmFyIERhdGFDb2x1bW5Db2xsZWN0aW9uID0gKGZ1bmN0aW9uICgpIHtcclxuICAgIGZ1bmN0aW9uIERhdGFDb2x1bW5Db2xsZWN0aW9uKCkge1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIERhdGFDb2x1bW5Db2xsZWN0aW9uO1xyXG59KCkpO1xyXG5tb2R1bGUuZXhwb3J0cyA9IERhdGFDb2x1bW5Db2xsZWN0aW9uO1xyXG4vLyMgc291cmNlTWFwcGluZ1VSTD1EYXRhQ29sdW1uQ29sbGVjdGlvbi5qcy5tYXAiLCIvLyBEYXRhQ29sdW1uQ29uc3RyYWludC50c1xyXG5cInVzZSBzdHJpY3RcIjtcclxudmFyIERhdGFDb2x1bW5Db25zdHJhaW50O1xyXG4oZnVuY3Rpb24gKERhdGFDb2x1bW5Db25zdHJhaW50KSB7XHJcbiAgICBEYXRhQ29sdW1uQ29uc3RyYWludFtEYXRhQ29sdW1uQ29uc3RyYWludFtcIlBSSU1BUllfS0VZXCJdID0gMF0gPSBcIlBSSU1BUllfS0VZXCI7XHJcbiAgICBEYXRhQ29sdW1uQ29uc3RyYWludFtEYXRhQ29sdW1uQ29uc3RyYWludFtcIlVOSVFVRVwiXSA9IDFdID0gXCJVTklRVUVcIjtcclxuICAgIERhdGFDb2x1bW5Db25zdHJhaW50W0RhdGFDb2x1bW5Db25zdHJhaW50W1wiSU5ERVhcIl0gPSAyXSA9IFwiSU5ERVhcIjtcclxufSkoRGF0YUNvbHVtbkNvbnN0cmFpbnQgfHwgKERhdGFDb2x1bW5Db25zdHJhaW50ID0ge30pKTtcclxubW9kdWxlLmV4cG9ydHMgPSBEYXRhQ29sdW1uQ29uc3RyYWludDtcclxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9RGF0YUNvbHVtbkNvbnN0cmFpbnQuanMubWFwIiwiLy8gRGF0YVJlbGF0aW9uLnRzXHJcblwidXNlIHN0cmljdFwiO1xyXG52YXIgRGF0YVJlbGF0aW9uID0gKGZ1bmN0aW9uICgpIHtcclxuICAgIGZ1bmN0aW9uIERhdGFSZWxhdGlvbihfcGFyZW50LCBfY2hpbGQsIF9vcGVyYXRvcikge1xyXG4gICAgICAgIHRoaXMuX3BhcmVudCA9IF9wYXJlbnQ7XHJcbiAgICAgICAgdGhpcy5fY2hpbGQgPSBfY2hpbGQ7XHJcbiAgICAgICAgdGhpcy5fb3BlcmF0b3IgPSBfb3BlcmF0b3I7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gRGF0YVJlbGF0aW9uO1xyXG59KCkpO1xyXG5tb2R1bGUuZXhwb3J0cyA9IERhdGFSZWxhdGlvbjtcclxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9RGF0YVJlbGF0aW9uLmpzLm1hcCIsIi8vIERhdGFSb3cuanNcclxuXCJ1c2Ugc3RyaWN0XCI7XHJcbnZhciBEYXRhVGFibGUgPSByZXF1aXJlKCcuL0RhdGFUYWJsZScpO1xyXG52YXIgRGF0YVJvd1N0YXRlID0gcmVxdWlyZSgnLi9EYXRhUm93U3RhdGUnKTtcclxudmFyIERhdGFSb3dWZXJzaW9uID0gcmVxdWlyZSgnLi9EYXRhUm93VmVyc2lvbicpO1xyXG52YXIgRGF0YVJvdyA9IChmdW5jdGlvbiAoKSB7XHJcbiAgICBmdW5jdGlvbiBEYXRhUm93KGRhdGFUYWJsZSkge1xyXG4gICAgICAgIGlmICghKGRhdGFUYWJsZSBpbnN0YW5jZW9mIERhdGFUYWJsZSkpIHtcclxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiQ2Fubm90IGNvbnN0cnVjdCBEYXRhUm93IHdpdGhvdXQgRGF0YVRhYmxlXCIpO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLl90YWJsZSA9IGRhdGFUYWJsZTtcclxuICAgICAgICB0aGlzLl9vcmlnaW5hbCA9IHt9O1xyXG4gICAgICAgIHRoaXMuX2N1cnJlbnQgPSB0aGlzLl9jcmVhdGVDdXJyZW50KCk7XHJcbiAgICB9XHJcbiAgICBEYXRhUm93LnByb3RvdHlwZS5fY3JlYXRlQ3VycmVudCA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICByZXR1cm4gT2JqZWN0LmNyZWF0ZSh0aGlzLl9vcmlnaW5hbCk7XHJcbiAgICB9O1xyXG4gICAgRGF0YVJvdy5wcm90b3R5cGUudGFibGUgPSBmdW5jdGlvbiAob0RhdGFUYWJsZSkge1xyXG4gICAgICAgIGlmIChvRGF0YVRhYmxlICE9PSB1bmRlZmluZWQpIHtcclxuICAgICAgICAgICAgaWYgKG9EYXRhVGFibGUgPT09IG51bGwpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuX3RhYmxlID0gdW5kZWZpbmVkO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5fdGFibGUgPSBvRGF0YVRhYmxlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gdGhpcy5fdGFibGU7XHJcbiAgICB9O1xyXG4gICAgRGF0YVJvdy5wcm90b3R5cGUucm93U3RhdGUgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgLypcclxuICAgICAgICAgKiBzaG91bGQgcHJvYmFibHkgaW1wbGVtZW50IHRoaXMgd2l0aCBiaWZsYWdzLFxyXG4gICAgICAgICAqIGJ1dCBoZXJlIGl0IGlzIGZvciBub3dcclxuICAgICAgICAgKi9cclxuICAgICAgICBpZiAodGhpcy5fY3VycmVudCA9PT0gbnVsbCkge1xyXG4gICAgICAgICAgICByZXR1cm4gRGF0YVJvd1N0YXRlLkRFTEVURUQ7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICh0aGlzLl9jdXJyZW50ID09PSB2b2lkIDAgfHwgT2JqZWN0LmtleXModGhpcy5fY3VycmVudCkubGVuZ3RoID09IDApIHtcclxuICAgICAgICAgICAgcmV0dXJuIERhdGFSb3dTdGF0ZS5VTkNIQU5HRUQ7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICh0aGlzLnRhYmxlKCkgPT09IHVuZGVmaW5lZCkge1xyXG4gICAgICAgICAgICByZXR1cm4gRGF0YVJvd1N0YXRlLkRFVEFDSEVEO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gRGF0YVJvd1N0YXRlLk1PRElGSUVEO1xyXG4gICAgfTtcclxuICAgIERhdGFSb3cucHJvdG90eXBlLmJlZ2luRWRpdCA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICBpZiAodGhpcy5pc0VkaXRpbmcoKSkge1xyXG4gICAgICAgICAgICB0aHJvdyBcImFscmVhZHkgZWRpdGluZ1wiO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLl9wcm9wb3NlZCA9IHRoaXMuX2NyZWF0ZVByb3Bvc2VkKCk7XHJcbiAgICB9O1xyXG4gICAgRGF0YVJvdy5wcm90b3R5cGUuaXNFZGl0aW5nID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHJldHVybiAhIXRoaXMuX3Byb3Bvc2VkICYmIE9iamVjdC5rZXlzKHRoaXMuX3Byb3Bvc2VkKS5sZW5ndGggPT09IDA7XHJcbiAgICB9O1xyXG4gICAgRGF0YVJvdy5wcm90b3R5cGUuX2NyZWF0ZVByb3Bvc2VkID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHJldHVybiBPYmplY3QuY3JlYXRlKHRoaXMuX2N1cnJlbnQpO1xyXG4gICAgfTtcclxuICAgIERhdGFSb3cucHJvdG90eXBlLmVuZEVkaXQgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgdGhpcy5kaXNwYXRjaEJlZm9yZVJvd0NoYW5nZSgpO1xyXG4gICAgICAgIHZhciBzZWxmID0gdGhpcztcclxuICAgICAgICBPYmplY3Qua2V5cyh0aGlzLl9wcm9wb3NlZCkuZm9yRWFjaChmdW5jdGlvbiAoa2V5KSB7XHJcbiAgICAgICAgICAgIHNlbGYuX2N1cnJlbnRba2V5XSA9IHNlbGYuX3Byb3Bvc2VkW2tleV07XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgdGhpcy5kaXNwYXRjaFJvd0NoYW5nZSgpO1xyXG4gICAgfTtcclxuICAgIERhdGFSb3cucHJvdG90eXBlLmdldCA9IGZ1bmN0aW9uICgpIHtcclxuICAgIH07XHJcbiAgICBEYXRhUm93LnByb3RvdHlwZS5zZXQgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICB9O1xyXG4gICAgRGF0YVJvdy5wcm90b3R5cGUuZGVsID0gZnVuY3Rpb24gKCkge1xyXG4gICAgfTtcclxuICAgIERhdGFSb3cucHJvdG90eXBlLmhhcyA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgIH07XHJcbiAgICBEYXRhUm93LnByb3RvdHlwZS5pdGVtID0gZnVuY3Rpb24gKGNvbHVtbiwgbmV3VmFsdWUsIHZlcnNpb24pIHtcclxuICAgICAgICBpZiAobmV3VmFsdWUgIT09IHVuZGVmaW5lZCkge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fc2V0SXRlbShjb2x1bW4sIG5ld1ZhbHVlLCB2ZXJzaW9uKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl9nZXRJdGVtKGNvbHVtbiwgdmVyc2lvbik7XHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxuICAgIERhdGFSb3cucHJvdG90eXBlLl9nZXRJdGVtID0gZnVuY3Rpb24gKGNvbHVtbiwgdmVyc2lvbikge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9nZXRWZXJzaW9uKHZlcnNpb24pW2NvbHVtbl07XHJcbiAgICB9O1xyXG4gICAgRGF0YVJvdy5wcm90b3R5cGUuX3NldEl0ZW0gPSBmdW5jdGlvbiAoY29sdW1uLCBuZXdWYWx1ZSwgdmVyc2lvbikge1xyXG4gICAgICAgIGlmICh0aGlzLnJvd1N0YXRlKCkgPT0gRGF0YVJvd1N0YXRlLkRFTEVURUQpIHtcclxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiUm93IGFscmVhZHkgZGVsZXRlZFwiKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5fZ2V0VmVyc2lvbih2ZXJzaW9uKVtjb2x1bW5dID0gbmV3VmFsdWU7XHJcbiAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9O1xyXG4gICAgRGF0YVJvdy5wcm90b3R5cGUuX2dldFZlcnNpb24gPSBmdW5jdGlvbiAodmVyc2lvbikge1xyXG4gICAgICAgIHZlcnNpb24gPSB2ZXJzaW9uIHx8IERhdGFSb3dWZXJzaW9uLkRFRkFVTFQ7XHJcbiAgICAgICAgc3dpdGNoICh2ZXJzaW9uKSB7XHJcbiAgICAgICAgICAgIGNhc2UgRGF0YVJvd1ZlcnNpb24uREVGQVVMVDpcclxuICAgICAgICAgICAgICAgIGlmICh0aGlzLmlzRWRpdGluZygpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuX3Byb3Bvc2VkO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuX2N1cnJlbnQ7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGNhc2UgRGF0YVJvd1ZlcnNpb24uQ1VSUkVOVDpcclxuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLl9jdXJyZW50O1xyXG4gICAgICAgICAgICBjYXNlIERhdGFSb3dWZXJzaW9uLk9SSUdJTkFMOlxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuX29yaWdpbmFsO1xyXG4gICAgICAgICAgICBjYXNlIERhdGFSb3dWZXJzaW9uLlBST1BPU0VEOlxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuX3Byb3Bvc2VkO1xyXG4gICAgICAgICAgICBkZWZhdWx0OlxyXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiRGF0YVJvd1ZlcnNpb24ge1wiICsgdmVyc2lvbiArIFwifSBpcyBub3QgcmVjb2duaXplZFwiKTtcclxuICAgICAgICB9XHJcbiAgICB9O1xyXG4gICAgRGF0YVJvdy5wcm90b3R5cGUuYWNjZXB0Q2hhbmdlcyA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XHJcbiAgICAgICAgT2JqZWN0LmtleXModGhpcy5fY3VycmVudCkuZm9yRWFjaChmdW5jdGlvbiAoa2V5LCBpKSB7XHJcbiAgICAgICAgICAgIHNlbGYuX29yaWdpbmFsW2tleV0gPSBzZWxmLl9jdXJyZW50W2tleV07XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgdGhpcy5fY3VycmVudCA9IE9iamVjdC5jcmVhdGUodGhpcy5fb3JpZ2luYWwpO1xyXG4gICAgfTtcclxuICAgIERhdGFSb3cucHJvdG90eXBlLnJlamVjdENoYW5nZXMgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgdGhpcy5fY3VycmVudCA9IE9iamVjdC5jcmVhdGUodGhpcy5fb3JpZ2luYWwpO1xyXG4gICAgfTtcclxuICAgIERhdGFSb3cucHJvdG90eXBlLmRpc3BhdGNoUm93Q2hhbmdlID0gZnVuY3Rpb24gKCkge1xyXG4gICAgfTtcclxuICAgIERhdGFSb3cucHJvdG90eXBlLmRpc3BhdGNoQmVmb3JlUm93Q2hhbmdlID0gZnVuY3Rpb24gKCkge1xyXG4gICAgfTtcclxuICAgIHJldHVybiBEYXRhUm93O1xyXG59KCkpO1xyXG5tb2R1bGUuZXhwb3J0cyA9IERhdGFSb3c7XHJcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPURhdGFSb3cuanMubWFwIiwiLy8gRGF0YVJvd0NvbGxlY3Rpb24udHNcclxuXCJ1c2Ugc3RyaWN0XCI7XHJcbi8vaW1wb3J0IHtDb2xsZWN0aW9ufSBmcm9tICcuL1V0aWwuQ29sbGVjdGlvbidcclxudmFyIFNvcnRlZEFycmF5ID0gcmVxdWlyZSgnY29sbGVjdGlvbnMvc29ydGVkLWFycmF5Jyk7XHJcbnZhciBEYXRhUm93Q29sbGVjdGlvbiA9IChmdW5jdGlvbiAoKSB7XHJcbiAgICBmdW5jdGlvbiBEYXRhUm93Q29sbGVjdGlvbigpIHtcclxuICAgICAgICB0aGlzLl9yb3dzID0gbmV3IFNvcnRlZEFycmF5KCk7XHJcbiAgICB9XHJcbiAgICBEYXRhUm93Q29sbGVjdGlvbi5wcm90b3R5cGUuYWRkID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHZhciByb3dzID0gW107XHJcbiAgICAgICAgZm9yICh2YXIgX2kgPSAwOyBfaSA8IGFyZ3VtZW50cy5sZW5ndGg7IF9pKyspIHtcclxuICAgICAgICAgICAgcm93c1tfaSAtIDBdID0gYXJndW1lbnRzW19pXTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5fcm93cy5hZGRFYWNoKHJvd3MpO1xyXG4gICAgfTtcclxuICAgIERhdGFSb3dDb2xsZWN0aW9uLnByb3RvdHlwZS50b0FycmF5ID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9yb3dzLnRvQXJyYXkoKTtcclxuICAgIH07XHJcbiAgICByZXR1cm4gRGF0YVJvd0NvbGxlY3Rpb247XHJcbn0oKSk7XHJcbm1vZHVsZS5leHBvcnRzID0gRGF0YVJvd0NvbGxlY3Rpb247XHJcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPURhdGFSb3dDb2xsZWN0aW9uLmpzLm1hcCIsIi8vIERhdGFSb3dTdGF0ZS50c1xyXG5cInVzZSBzdHJpY3RcIjtcclxudmFyIERhdGFSb3dTdGF0ZTtcclxuKGZ1bmN0aW9uIChEYXRhUm93U3RhdGUpIHtcclxuICAgIERhdGFSb3dTdGF0ZVtEYXRhUm93U3RhdGVbXCJERVRBQ0hFRFwiXSA9IDFdID0gXCJERVRBQ0hFRFwiO1xyXG4gICAgRGF0YVJvd1N0YXRlW0RhdGFSb3dTdGF0ZVtcIlVOQ0hBTkdFRFwiXSA9IDJdID0gXCJVTkNIQU5HRURcIjtcclxuICAgIERhdGFSb3dTdGF0ZVtEYXRhUm93U3RhdGVbXCJBRERFRFwiXSA9IDRdID0gXCJBRERFRFwiO1xyXG4gICAgRGF0YVJvd1N0YXRlW0RhdGFSb3dTdGF0ZVtcIk1PRElGSUVEXCJdID0gOF0gPSBcIk1PRElGSUVEXCI7XHJcbiAgICBEYXRhUm93U3RhdGVbRGF0YVJvd1N0YXRlW1wiREVMRVRFRFwiXSA9IDE2XSA9IFwiREVMRVRFRFwiO1xyXG59KShEYXRhUm93U3RhdGUgfHwgKERhdGFSb3dTdGF0ZSA9IHt9KSk7XHJcbm1vZHVsZS5leHBvcnRzID0gRGF0YVJvd1N0YXRlO1xyXG4vLyMgc291cmNlTWFwcGluZ1VSTD1EYXRhUm93U3RhdGUuanMubWFwIiwiXCJ1c2Ugc3RyaWN0XCI7XHJcbi8vIERhdGFSb3dWZXJzaW9uLnRzXHJcbnZhciBEYXRhUm93VmVyc2lvbjtcclxuKGZ1bmN0aW9uIChEYXRhUm93VmVyc2lvbikge1xyXG4gICAgRGF0YVJvd1ZlcnNpb25bRGF0YVJvd1ZlcnNpb25bXCJPUklHSU5BTFwiXSA9IDBdID0gXCJPUklHSU5BTFwiO1xyXG4gICAgRGF0YVJvd1ZlcnNpb25bRGF0YVJvd1ZlcnNpb25bXCJDVVJSRU5UXCJdID0gMV0gPSBcIkNVUlJFTlRcIjtcclxuICAgIERhdGFSb3dWZXJzaW9uW0RhdGFSb3dWZXJzaW9uW1wiUFJPUE9TRURcIl0gPSAyXSA9IFwiUFJPUE9TRURcIjtcclxuICAgIERhdGFSb3dWZXJzaW9uW0RhdGFSb3dWZXJzaW9uW1wiREVGQVVMVFwiXSA9IDNdID0gXCJERUZBVUxUXCI7XHJcbn0pKERhdGFSb3dWZXJzaW9uIHx8IChEYXRhUm93VmVyc2lvbiA9IHt9KSk7XHJcbm1vZHVsZS5leHBvcnRzID0gRGF0YVJvd1ZlcnNpb247XHJcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPURhdGFSb3dWZXJzaW9uLmpzLm1hcCIsIi8vIERhdGFTZXQudHNcclxuXCJ1c2Ugc3RyaWN0XCI7XHJcbnZhciBEYXRhVGFibGUgPSByZXF1aXJlKCcuL0RhdGFUYWJsZScpO1xyXG52YXIgZHNfY291bnRlciA9IDA7XHJcbnZhciBEYXRhU2V0ID0gKGZ1bmN0aW9uICgpIHtcclxuICAgIGZ1bmN0aW9uIERhdGFTZXQobmFtZSkge1xyXG4gICAgICAgIGlmIChuYW1lID09PSB2b2lkIDApIHsgbmFtZSA9IFwiU2V0XCIgKyBkc19jb3VudGVyKys7IH1cclxuICAgICAgICB0aGlzLl9uYW1lID0gbmFtZTtcclxuICAgICAgICB0aGlzLl90YWJsZXMgPSBbXTtcclxuICAgICAgICB0aGlzLl9yZWxhdGlvbnMgPSBbXTtcclxuICAgIH1cclxuICAgIERhdGFTZXQucHJvdG90eXBlLnRhYmxlcyA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5fdGFibGVzLnNsaWNlKCk7XHJcbiAgICB9O1xyXG4gICAgRGF0YVNldC5wcm90b3R5cGUuYWRkVGFibGUgPSBmdW5jdGlvbiAob1RhYmxlKSB7XHJcbiAgICAgICAgdmFyIHRibDtcclxuICAgICAgICBpZiAodHlwZW9mIG9UYWJsZSA9PT0gJ3N0cmluZycpIHtcclxuICAgICAgICAgICAgdGJsID0gbmV3IERhdGFUYWJsZShvVGFibGUpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgdGJsID0gb1RhYmxlO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAodGJsLm5hbWUoKSA9PT0gdW5kZWZpbmVkKSB7XHJcbiAgICAgICAgICAgIHRibC5uYW1lKFwiVGFibGVcIiArIHRoaXMuX3RhYmxlcy5sZW5ndGgpO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLl90YWJsZXMucHVzaCh0YmwpO1xyXG4gICAgfTtcclxuICAgIDtcclxuICAgIERhdGFTZXQucHJvdG90eXBlLmFjY2VwdENoYW5nZXMgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgdGhpcy5fdGFibGVzLmZvckVhY2goZnVuY3Rpb24gKHRhYmxlKSB7XHJcbiAgICAgICAgICAgIHRhYmxlLmFjY2VwdENoYW5nZXMoKTtcclxuICAgICAgICB9KTtcclxuICAgIH07XHJcbiAgICA7XHJcbiAgICBEYXRhU2V0LnByb3RvdHlwZS5nZXRDaGFuZ2VzID0gZnVuY3Rpb24gKCkge1xyXG4gICAgfTtcclxuICAgIDtcclxuICAgIERhdGFTZXQucHJvdG90eXBlLm5hbWUgPSBmdW5jdGlvbiAobmV3VmFsdWUpIHtcclxuICAgICAgICBpZiAobmV3VmFsdWUgIT0gdW5kZWZpbmVkKSB7XHJcbiAgICAgICAgICAgIHRoaXMuX25hbWUgPSBuZXdWYWx1ZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX25hbWU7XHJcbiAgICB9O1xyXG4gICAgO1xyXG4gICAgcmV0dXJuIERhdGFTZXQ7XHJcbn0oKSk7XHJcbm1vZHVsZS5leHBvcnRzID0gRGF0YVNldDtcclxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9RGF0YVNldC5qcy5tYXAiLCIvLyBEYXRhVGFibGUudHNcclxuXCJ1c2Ugc3RyaWN0XCI7XHJcbnZhciBEYXRhUm93Q29sbGVjdGlvbiA9IHJlcXVpcmUoJy4vRGF0YVJvd0NvbGxlY3Rpb24nKTtcclxuLy9pbXBvcnQgSURhdGFTY2hlbWEgPSByZXF1aXJlKCcuL0lEYXRhU2NoZW1hJylcclxudmFyIFV0aWxfMSA9IHJlcXVpcmUoJy4vVXRpbCcpO1xyXG52YXIgZHRfY291bnRlciA9IDA7XHJcbnZhciBEYXRhVGFibGUgPSAoZnVuY3Rpb24gKCkge1xyXG4gICAgZnVuY3Rpb24gRGF0YVRhYmxlKHNOYW1lLCBzS2V5UGF0aCkge1xyXG4gICAgICAgIHRoaXMuX25hbWUgPSBzTmFtZSB8fCBcIlRhYmxlXCIgKyBkdF9jb3VudGVyKys7XHJcbiAgICAgICAgdGhpcy5fcm93cyA9IG5ldyBEYXRhUm93Q29sbGVjdGlvbigpO1xyXG4gICAgICAgIHRoaXMuX2NvbHVtbnMgPSBbXTtcclxuICAgICAgICB0aGlzLl9rZXlQYXRoID0gc0tleVBhdGg7XHJcbiAgICAgICAgdGhpcy5fa2V5Q29tcGFyZXIgPSBVdGlsXzEuY3JlYXRlQ29udGVudENvbXBhcmVyKHNLZXlQYXRoKTtcclxuICAgIH1cclxuICAgIERhdGFUYWJsZS5wcm90b3R5cGUubmFtZSA9IGZ1bmN0aW9uIChzTmFtZSkge1xyXG4gICAgICAgIGlmIChzTmFtZSAhPT0gdW5kZWZpbmVkKSB7XHJcbiAgICAgICAgICAgIHRoaXMuX25hbWUgPSBzTmFtZTtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiB0aGlzLl9uYW1lO1xyXG4gICAgfTtcclxuICAgIERhdGFUYWJsZS5wcm90b3R5cGUucm93cyA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5fcm93cztcclxuICAgIH07XHJcbiAgICBEYXRhVGFibGUucHJvdG90eXBlLmFkZFJvdyA9IGZ1bmN0aW9uIChvUm93KSB7XHJcbiAgICAgICAgdGhpcy5fcm93cy5hZGQob1Jvdyk7XHJcbiAgICAgICAgb1Jvdy50YWJsZSh0aGlzKTtcclxuICAgICAgICByZXR1cm4gdGhpcztcclxuICAgIH07XHJcbiAgICBEYXRhVGFibGUucHJvdG90eXBlLmNvbHVtbnMgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX2NvbHVtbnM7XHJcbiAgICB9O1xyXG4gICAgRGF0YVRhYmxlLnByb3RvdHlwZS5rZXlQYXRoID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9rZXlQYXRoO1xyXG4gICAgfTtcclxuICAgIERhdGFUYWJsZS5wcm90b3R5cGUuYWNjZXB0Q2hhbmdlcyA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICB0aGlzLl9yb3dzLnRvQXJyYXkoKS5mb3JFYWNoKGZ1bmN0aW9uIChkcikge1xyXG4gICAgICAgICAgICBkci5hY2NlcHRDaGFuZ2VzKCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9O1xyXG4gICAgcmV0dXJuIERhdGFUYWJsZTtcclxufSgpKTtcclxuY29uc29sZS5sb2coJ2xvYWRlZCBEYXRhVGFibGUnKTtcclxubW9kdWxlLmV4cG9ydHMgPSBEYXRhVGFibGU7XHJcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPURhdGFUYWJsZS5qcy5tYXAiLCIvLyBEYXRhVmlldy5qc1xyXG5cInVzZSBzdHJpY3RcIjtcclxudmFyIERhdGFWaWV3ID0gKGZ1bmN0aW9uICgpIHtcclxuICAgIGZ1bmN0aW9uIERhdGFWaWV3KCkge1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIERhdGFWaWV3O1xyXG59KCkpO1xyXG5tb2R1bGUuZXhwb3J0cyA9IERhdGFWaWV3O1xyXG4vLyMgc291cmNlTWFwcGluZ1VSTD1EYXRhVmlldy5qcy5tYXAiLCIvLyBVdGlsLnRzXHJcbi8vIFV0aWxpdGllcyB1c2VkIGJ5IGFyZ2EuanNcclxuXCJ1c2Ugc3RyaWN0XCI7XHJcbmZ1bmN0aW9uIGNyZWF0ZUNvbnRlbnRDb21wYXJlcihzS2V5UGF0aCkge1xyXG4gICAgcmV0dXJuIGZ1bmN0aW9uIGNvbXBhcmUob2JqQSwgb2JqQikge1xyXG4gICAgICAgIHZhciBrZXlBID0gcmVzb2x2ZUtleVBhdGgoc0tleVBhdGgsIG9iakEpO1xyXG4gICAgICAgIHZhciBrZXlCID0gcmVzb2x2ZUtleVBhdGgoc0tleVBhdGgsIG9iakIpO1xyXG4gICAgICAgIHJldHVybiBrZXlBIDwga2V5QiA/IC0xIDogKGtleUEgPiBrZXlCID8gMSA6IDApO1xyXG4gICAgfTtcclxufVxyXG5leHBvcnRzLmNyZWF0ZUNvbnRlbnRDb21wYXJlciA9IGNyZWF0ZUNvbnRlbnRDb21wYXJlcjtcclxuZnVuY3Rpb24gY3JlYXRlQ29udGVudEVxdWF0b3Ioc0tleVBhdGgpIHtcclxuICAgIHJldHVybiBmdW5jdGlvbiBlcXVhbHMob2JqQSwgb2JqQikge1xyXG4gICAgICAgIHZhciBrZXlBID0gcmVzb2x2ZUtleVBhdGgoc0tleVBhdGgsIG9iakEpO1xyXG4gICAgICAgIHZhciBrZXlCID0gcmVzb2x2ZUtleVBhdGgoc0tleVBhdGgsIG9iakIpO1xyXG4gICAgICAgIHJldHVybiBrZXlBID09IGtleUI7XHJcbiAgICB9O1xyXG59XHJcbmV4cG9ydHMuY3JlYXRlQ29udGVudEVxdWF0b3IgPSBjcmVhdGVDb250ZW50RXF1YXRvcjtcclxuZnVuY3Rpb24gZ2V0S2V5V2l0aEtleVBhdGgoc0tleVBhdGgsIG9iaikge1xyXG4gICAgLy9zS2V5UGF0aFxyXG4gICAgdmFyIGtleVBhdGhBcnJheSA9IHNLZXlQYXRoLnNwbGl0KCcuJyk7XHJcbn1cclxuZXhwb3J0cy5nZXRLZXlXaXRoS2V5UGF0aCA9IGdldEtleVdpdGhLZXlQYXRoO1xyXG5mdW5jdGlvbiBjb21wYXJlS2V5cyhrZXlBLCBrZXlCKSB7XHJcbiAgICBpZiAoaW5kZXhlZERCICE9PSB2b2lkIDApIHtcclxuICAgICAgICByZXR1cm4gaW5kZXhlZERCLmNtcChrZXlBLCBrZXlCKTtcclxuICAgIH1cclxuICAgIGVsc2Uge1xyXG4gICAgICAgIHJldHVybiAoa2V5QSA8IGtleUIgPyAtMSA6IGtleUEgPiBrZXlCID8gMSA6IDApO1xyXG4gICAgfVxyXG59XHJcbmV4cG9ydHMuY29tcGFyZUtleXMgPSBjb21wYXJlS2V5cztcclxuZnVuY3Rpb24gcmVzb2x2ZUtleVBhdGgoc0tleVBhdGgsIG9iaikge1xyXG4gICAgc0tleVBhdGggPSBzS2V5UGF0aCB8fCBcIlwiO1xyXG4gICAgdmFyIHBhdGggPSBzS2V5UGF0aC5zcGxpdCgnLicpO1xyXG4gICAgcmV0dXJuIHBhdGgucmVkdWNlKGZ1bmN0aW9uIChwcmV2UmVzdWx0LCBuZXh0VmFsKSB7XHJcbiAgICAgICAgaWYgKHByZXZSZXN1bHQgPT09IHZvaWQgMCkge1xyXG4gICAgICAgICAgICByZXR1cm4gdm9pZCAwO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gcHJldlJlc3VsdFtuZXh0VmFsXTtcclxuICAgIH0sIG9iaik7XHJcbn1cclxuZXhwb3J0cy5yZXNvbHZlS2V5UGF0aCA9IHJlc29sdmVLZXlQYXRoO1xyXG5mdW5jdGlvbiBjcmVhdGVWYWx1ZVdpdGhLZXlQYXRoKHZhbHVlLCBzS2V5UGF0aCkge1xyXG4gICAgdmFyIGtleVBhdGhBcnJheSA9IHNLZXlQYXRoLnNwbGl0KCcuJyk7XHJcbiAgICByZXR1cm4ga2V5UGF0aEFycmF5LnJlZHVjZVJpZ2h0KGZ1bmN0aW9uIChwcmV2VmFsdWUsIGtleSwgY3VySW5kZXgsIGFycmF5KSB7XHJcbiAgICAgICAgdmFyIHdyYXBwZWRWYWx1ZSA9IHt9O1xyXG4gICAgICAgIHdyYXBwZWRWYWx1ZVtrZXldID0gcHJldlZhbHVlO1xyXG4gICAgICAgIHJldHVybiB3cmFwcGVkVmFsdWU7XHJcbiAgICB9LCB2YWx1ZSk7XHJcbn1cclxuZXhwb3J0cy5jcmVhdGVWYWx1ZVdpdGhLZXlQYXRoID0gY3JlYXRlVmFsdWVXaXRoS2V5UGF0aDtcclxuZnVuY3Rpb24gcmVzb2x2ZUtleVBhdGhBcnJheShhS2V5cGF0aCkge1xyXG59XHJcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPVV0aWwuanMubWFwIiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbnZhciBTaGltID0gcmVxdWlyZShcIi4vc2hpbVwiKTtcbnZhciBHZW5lcmljQ29sbGVjdGlvbiA9IHJlcXVpcmUoXCIuL2dlbmVyaWMtY29sbGVjdGlvblwiKTtcbnZhciBHZW5lcmljTWFwID0gcmVxdWlyZShcIi4vZ2VuZXJpYy1tYXBcIik7XG5cbi8vIEJ1cmdsZWQgZnJvbSBodHRwczovL2dpdGh1Yi5jb20vZG9tZW5pYy9kaWN0XG5cbm1vZHVsZS5leHBvcnRzID0gRGljdDtcbmZ1bmN0aW9uIERpY3QodmFsdWVzLCBnZXREZWZhdWx0KSB7XG4gICAgaWYgKCEodGhpcyBpbnN0YW5jZW9mIERpY3QpKSB7XG4gICAgICAgIHJldHVybiBuZXcgRGljdCh2YWx1ZXMsIGdldERlZmF1bHQpO1xuICAgIH1cbiAgICBnZXREZWZhdWx0ID0gZ2V0RGVmYXVsdCB8fCBGdW5jdGlvbi5ub29wO1xuICAgIHRoaXMuZ2V0RGVmYXVsdCA9IGdldERlZmF1bHQ7XG4gICAgdGhpcy5zdG9yZSA9IE9iamVjdC5jcmVhdGUobnVsbCk7XG4gICAgdGhpcy5sZW5ndGggPSAwO1xuICAgIHRoaXMuYWRkRWFjaCh2YWx1ZXMpO1xufVxuXG5EaWN0LkRpY3QgPSBEaWN0OyAvLyBoYWNrIHNvIHJlcXVpcmUoXCJkaWN0XCIpLkRpY3Qgd2lsbCB3b3JrIGluIE1vbnRhZ2VKUy5cblxuT2JqZWN0LmFkZEVhY2goRGljdC5wcm90b3R5cGUsIEdlbmVyaWNDb2xsZWN0aW9uLnByb3RvdHlwZSk7XG5PYmplY3QuYWRkRWFjaChEaWN0LnByb3RvdHlwZSwgR2VuZXJpY01hcC5wcm90b3R5cGUpO1xuXG5EaWN0LmZyb20gPSBHZW5lcmljQ29sbGVjdGlvbi5mcm9tO1xuXG5EaWN0LnByb3RvdHlwZS5jb25zdHJ1Y3RDbG9uZSA9IGZ1bmN0aW9uICh2YWx1ZXMpIHtcbiAgICByZXR1cm4gbmV3IHRoaXMuY29uc3RydWN0b3IodmFsdWVzLCB0aGlzLmdldERlZmF1bHQpO1xufTtcblxuRGljdC5wcm90b3R5cGUuYXNzZXJ0U3RyaW5nID0gZnVuY3Rpb24gKGtleSkge1xuICAgIGlmICh0eXBlb2Yga2V5ICE9PSBcInN0cmluZ1wiKSB7XG4gICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoXCJrZXkgbXVzdCBiZSBhIHN0cmluZyBidXQgR290IFwiICsga2V5KTtcbiAgICB9XG59XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShEaWN0LnByb3RvdHlwZSxcIiRfX3Byb3RvX19cIix7d3JpdGFibGU6dHJ1ZX0pO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KERpY3QucHJvdG90eXBlLFwiX2hhc1Byb3RvXCIse1xuICAgIGdldDpmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuaGFzT3duUHJvcGVydHkoXCIkX19wcm90b19fXCIpICYmIHR5cGVvZiB0aGlzLl9wcm90b1ZhbHVlICE9PSBcInVuZGVmaW5lZFwiO1xuICAgIH1cbn0pO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KERpY3QucHJvdG90eXBlLFwiX3Byb3RvVmFsdWVcIix7XG4gICAgZ2V0OmZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gdGhpc1tcIiRfX3Byb3RvX19cIl07XG4gICAgfSxcbiAgICBzZXQ6IGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgICAgIHRoaXNbXCIkX19wcm90b19fXCJdID0gdmFsdWU7XG4gICAgfVxufSk7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShEaWN0LnByb3RvdHlwZSxcInNpemVcIixHZW5lcmljQ29sbGVjdGlvbi5fc2l6ZVByb3BlcnR5RGVzY3JpcHRvcik7XG5cblxuRGljdC5wcm90b3R5cGUuZ2V0ID0gZnVuY3Rpb24gKGtleSwgZGVmYXVsdFZhbHVlKSB7XG4gICAgdGhpcy5hc3NlcnRTdHJpbmcoa2V5KTtcbiAgICBpZiAoa2V5ID09PSBcIl9fcHJvdG9fX1wiKSB7XG4gICAgICAgIGlmICh0aGlzLl9oYXNQcm90bykge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX3Byb3RvVmFsdWU7XG4gICAgICAgIH0gZWxzZSBpZiAoYXJndW1lbnRzLmxlbmd0aCA+IDEpIHtcbiAgICAgICAgICAgIHJldHVybiBkZWZhdWx0VmFsdWU7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5nZXREZWZhdWx0KGtleSk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAgIGlmIChrZXkgaW4gdGhpcy5zdG9yZSkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuc3RvcmVba2V5XTtcbiAgICAgICAgfSBlbHNlIGlmIChhcmd1bWVudHMubGVuZ3RoID4gMSkge1xuICAgICAgICAgICAgcmV0dXJuIGRlZmF1bHRWYWx1ZTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmdldERlZmF1bHQoa2V5KTtcbiAgICAgICAgfVxuICAgIH1cbn07XG5cbkRpY3QucHJvdG90eXBlLnNldCA9IGZ1bmN0aW9uIChrZXksIHZhbHVlKSB7XG4gICAgdGhpcy5hc3NlcnRTdHJpbmcoa2V5KTtcbiAgICB2YXIgaXNQcm90b0tleSA9IChrZXkgPT09IFwiX19wcm90b19fXCIpO1xuXG4gICAgaWYgKGlzUHJvdG9LZXkgPyB0aGlzLl9oYXNQcm90byA6IGtleSBpbiB0aGlzLnN0b3JlKSB7IC8vIHVwZGF0ZVxuICAgICAgICBpZiAodGhpcy5kaXNwYXRjaGVzTWFwQ2hhbmdlcykge1xuICAgICAgICAgICAgdGhpcy5kaXNwYXRjaEJlZm9yZU1hcENoYW5nZShrZXksIGlzUHJvdG9LZXkgPyB0aGlzLl9wcm90b1ZhbHVlIDogdGhpcy5zdG9yZVtrZXldKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlzUHJvdG9LZXlcbiAgICAgICAgICAgID8gdGhpcy5fcHJvdG9WYWx1ZSA9IHZhbHVlXG4gICAgICAgICAgICA6IHRoaXMuc3RvcmVba2V5XSA9IHZhbHVlO1xuXG4gICAgICAgIGlmICh0aGlzLmRpc3BhdGNoZXNNYXBDaGFuZ2VzKSB7XG4gICAgICAgICAgICB0aGlzLmRpc3BhdGNoTWFwQ2hhbmdlKGtleSwgdmFsdWUpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9IGVsc2UgeyAvLyBjcmVhdGVcbiAgICAgICAgaWYgKHRoaXMuZGlzcGF0Y2hlc01hcENoYW5nZXMpIHtcbiAgICAgICAgICAgIHRoaXMuZGlzcGF0Y2hCZWZvcmVNYXBDaGFuZ2Uoa2V5LCB1bmRlZmluZWQpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMubGVuZ3RoKys7XG5cbiAgICAgICAgaXNQcm90b0tleVxuICAgICAgICAgICAgPyB0aGlzLl9wcm90b1ZhbHVlID0gdmFsdWVcbiAgICAgICAgICAgIDogdGhpcy5zdG9yZVtrZXldID0gdmFsdWU7XG5cbiAgICAgICAgaWYgKHRoaXMuZGlzcGF0Y2hlc01hcENoYW5nZXMpIHtcbiAgICAgICAgICAgIHRoaXMuZGlzcGF0Y2hNYXBDaGFuZ2Uoa2V5LCB2YWx1ZSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxufTtcblxuRGljdC5wcm90b3R5cGUuaGFzID0gZnVuY3Rpb24gKGtleSkge1xuICAgIHRoaXMuYXNzZXJ0U3RyaW5nKGtleSk7XG4gICAgcmV0dXJuIGtleSA9PT0gXCJfX3Byb3RvX19cIiA/IHRoaXMuX2hhc1Byb3RvIDoga2V5IGluIHRoaXMuc3RvcmU7XG59O1xuXG5EaWN0LnByb3RvdHlwZVtcImRlbGV0ZVwiXSA9IGZ1bmN0aW9uIChrZXkpIHtcbiAgICB0aGlzLmFzc2VydFN0cmluZyhrZXkpO1xuICAgIGlmIChrZXkgPT09IFwiX19wcm90b19fXCIpIHtcbiAgICAgICAgaWYgKHRoaXMuX2hhc1Byb3RvKSB7XG4gICAgICAgICAgICBpZiAodGhpcy5kaXNwYXRjaGVzTWFwQ2hhbmdlcykge1xuICAgICAgICAgICAgICAgIHRoaXMuZGlzcGF0Y2hCZWZvcmVNYXBDaGFuZ2Uoa2V5LCB0aGlzLl9wcm90b1ZhbHVlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMuX3Byb3RvVmFsdWUgPSB1bmRlZmluZWQ7XG4gICAgICAgICAgICB0aGlzLmxlbmd0aC0tO1xuICAgICAgICAgICAgaWYgKHRoaXMuZGlzcGF0Y2hlc01hcENoYW5nZXMpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmRpc3BhdGNoTWFwQ2hhbmdlKGtleSwgdW5kZWZpbmVkKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAgIGlmIChrZXkgaW4gdGhpcy5zdG9yZSkge1xuICAgICAgICAgICAgaWYgKHRoaXMuZGlzcGF0Y2hlc01hcENoYW5nZXMpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmRpc3BhdGNoQmVmb3JlTWFwQ2hhbmdlKGtleSwgdGhpcy5zdG9yZVtrZXldKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGRlbGV0ZSB0aGlzLnN0b3JlW2tleV07XG4gICAgICAgICAgICB0aGlzLmxlbmd0aC0tO1xuICAgICAgICAgICAgaWYgKHRoaXMuZGlzcGF0Y2hlc01hcENoYW5nZXMpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmRpc3BhdGNoTWFwQ2hhbmdlKGtleSwgdW5kZWZpbmVkKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG59O1xuXG5EaWN0LnByb3RvdHlwZS5jbGVhciA9IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIga2V5O1xuICAgIGlmICh0aGlzLl9oYXNQcm90bykge1xuICAgICAgICBpZiAodGhpcy5kaXNwYXRjaGVzTWFwQ2hhbmdlcykge1xuICAgICAgICAgICAgdGhpcy5kaXNwYXRjaEJlZm9yZU1hcENoYW5nZShcIl9fcHJvdG9fX1wiLCB0aGlzLl9wcm90b1ZhbHVlKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLl9wcm90b1ZhbHVlID0gdW5kZWZpbmVkO1xuICAgICAgICBpZiAodGhpcy5kaXNwYXRjaGVzTWFwQ2hhbmdlcykge1xuICAgICAgICAgICAgdGhpcy5kaXNwYXRjaE1hcENoYW5nZShcIl9fcHJvdG9fX1wiLCB1bmRlZmluZWQpO1xuICAgICAgICB9XG4gICAgfVxuICAgIGZvciAoa2V5IGluIHRoaXMuc3RvcmUpIHtcbiAgICAgICAgaWYgKHRoaXMuZGlzcGF0Y2hlc01hcENoYW5nZXMpIHtcbiAgICAgICAgICAgIHRoaXMuZGlzcGF0Y2hCZWZvcmVNYXBDaGFuZ2Uoa2V5LCB0aGlzLnN0b3JlW2tleV0pO1xuICAgICAgICB9XG4gICAgICAgIGRlbGV0ZSB0aGlzLnN0b3JlW2tleV07XG4gICAgICAgIGlmICh0aGlzLmRpc3BhdGNoZXNNYXBDaGFuZ2VzKSB7XG4gICAgICAgICAgICB0aGlzLmRpc3BhdGNoTWFwQ2hhbmdlKGtleSwgdW5kZWZpbmVkKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICB0aGlzLmxlbmd0aCA9IDA7XG59O1xuXG5EaWN0LnByb3RvdHlwZS5yZWR1Y2UgPSBmdW5jdGlvbiAoY2FsbGJhY2ssIGJhc2lzLCB0aGlzcCkge1xuICAgIGlmKHRoaXMuX2hhc1Byb3RvKSB7XG4gICAgICAgIGJhc2lzID0gY2FsbGJhY2suY2FsbCh0aGlzcCwgYmFzaXMsIFwiJF9fcHJvdG9fX1wiLCBcIl9fcHJvdG9fX1wiLCB0aGlzKTtcbiAgICB9XG4gICAgdmFyIHN0b3JlID0gdGhpcy5zdG9yZTtcbiAgICBmb3IgKHZhciBrZXkgaW4gdGhpcy5zdG9yZSkge1xuICAgICAgICBiYXNpcyA9IGNhbGxiYWNrLmNhbGwodGhpc3AsIGJhc2lzLCBzdG9yZVtrZXldLCBrZXksIHRoaXMpO1xuICAgIH1cbiAgICByZXR1cm4gYmFzaXM7XG59O1xuXG5EaWN0LnByb3RvdHlwZS5yZWR1Y2VSaWdodCA9IGZ1bmN0aW9uIChjYWxsYmFjaywgYmFzaXMsIHRoaXNwKSB7XG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgIHZhciBzdG9yZSA9IHRoaXMuc3RvcmU7XG4gICAgYmFzaXMgPSBPYmplY3Qua2V5cyh0aGlzLnN0b3JlKS5yZWR1Y2VSaWdodChmdW5jdGlvbiAoYmFzaXMsIGtleSkge1xuICAgICAgICByZXR1cm4gY2FsbGJhY2suY2FsbCh0aGlzcCwgYmFzaXMsIHN0b3JlW2tleV0sIGtleSwgc2VsZik7XG4gICAgfSwgYmFzaXMpO1xuXG4gICAgaWYodGhpcy5faGFzUHJvdG8pIHtcbiAgICAgICAgcmV0dXJuIGNhbGxiYWNrLmNhbGwodGhpc3AsIGJhc2lzLCB0aGlzLl9wcm90b1ZhbHVlLCBcIl9fcHJvdG9fX1wiLCBzZWxmKTtcbiAgICB9XG4gICAgcmV0dXJuIGJhc2lzO1xufTtcblxuRGljdC5wcm90b3R5cGUub25lID0gZnVuY3Rpb24gKCkge1xuICAgIHZhciBrZXk7XG4gICAgZm9yIChrZXkgaW4gdGhpcy5zdG9yZSkge1xuICAgICAgICByZXR1cm4gdGhpcy5zdG9yZVtrZXldO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy5fcHJvdG9WYWx1ZTtcbn07XG5cbkRpY3QucHJvdG90eXBlLnRvSlNPTiA9IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gdGhpcy50b09iamVjdCgpO1xufTtcbiIsIlwidXNlIHN0cmljdFwiO1xuXG52YXIgU2hpbSA9IHJlcXVpcmUoXCIuL3NoaW1cIik7XG52YXIgRGljdCA9IHJlcXVpcmUoXCIuL19kaWN0XCIpO1xudmFyIExpc3QgPSByZXF1aXJlKFwiLi9fbGlzdFwiKTtcbnZhciBHZW5lcmljQ29sbGVjdGlvbiA9IHJlcXVpcmUoXCIuL2dlbmVyaWMtY29sbGVjdGlvblwiKTtcbnZhciBHZW5lcmljU2V0ID0gcmVxdWlyZShcIi4vZ2VuZXJpYy1zZXRcIik7XG52YXIgVHJlZUxvZyA9IHJlcXVpcmUoXCIuL3RyZWUtbG9nXCIpO1xuXG52YXIgb2JqZWN0X2hhcyA9IE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHk7XG5cbm1vZHVsZS5leHBvcnRzID0gRmFzdFNldDtcblxuZnVuY3Rpb24gRmFzdFNldCh2YWx1ZXMsIGVxdWFscywgaGFzaCwgZ2V0RGVmYXVsdCkge1xuICAgIGlmICghKHRoaXMgaW5zdGFuY2VvZiBGYXN0U2V0KSkge1xuICAgICAgICByZXR1cm4gbmV3IEZhc3RTZXQodmFsdWVzLCBlcXVhbHMsIGhhc2gsIGdldERlZmF1bHQpO1xuICAgIH1cbiAgICBlcXVhbHMgPSBlcXVhbHMgfHwgT2JqZWN0LmVxdWFscztcbiAgICBoYXNoID0gaGFzaCB8fCBPYmplY3QuaGFzaDtcbiAgICBnZXREZWZhdWx0ID0gZ2V0RGVmYXVsdCB8fCBGdW5jdGlvbi5ub29wO1xuICAgIHRoaXMuY29udGVudEVxdWFscyA9IGVxdWFscztcbiAgICB0aGlzLmNvbnRlbnRIYXNoID0gaGFzaDtcbiAgICB0aGlzLmdldERlZmF1bHQgPSBnZXREZWZhdWx0O1xuICAgIHZhciBzZWxmID0gdGhpcztcbiAgICB0aGlzLmJ1Y2tldHMgPSBuZXcgdGhpcy5CdWNrZXRzKG51bGwsIGZ1bmN0aW9uIGdldERlZmF1bHRCdWNrZXQoKSB7XG4gICAgICAgIHJldHVybiBuZXcgc2VsZi5CdWNrZXQoKTtcbiAgICB9KTtcbiAgICB0aGlzLmxlbmd0aCA9IDA7XG4gICAgdGhpcy5hZGRFYWNoKHZhbHVlcyk7XG59XG5cbkZhc3RTZXQuRmFzdFNldCA9IEZhc3RTZXQ7IC8vIGhhY2sgc28gcmVxdWlyZShcImZhc3Qtc2V0XCIpLkZhc3RTZXQgd2lsbCB3b3JrIGluIE1vbnRhZ2VKU1xuXG5PYmplY3QuYWRkRWFjaChGYXN0U2V0LnByb3RvdHlwZSwgR2VuZXJpY0NvbGxlY3Rpb24ucHJvdG90eXBlKTtcbk9iamVjdC5hZGRFYWNoKEZhc3RTZXQucHJvdG90eXBlLCBHZW5lcmljU2V0LnByb3RvdHlwZSk7XG5GYXN0U2V0LmZyb20gPSBHZW5lcmljQ29sbGVjdGlvbi5mcm9tO1xuXG5GYXN0U2V0LnByb3RvdHlwZS5CdWNrZXRzID0gRGljdDtcbkZhc3RTZXQucHJvdG90eXBlLkJ1Y2tldCA9IExpc3Q7XG5cbkZhc3RTZXQucHJvdG90eXBlLmNvbnN0cnVjdENsb25lID0gZnVuY3Rpb24gKHZhbHVlcykge1xuICAgIHJldHVybiBuZXcgdGhpcy5jb25zdHJ1Y3RvcihcbiAgICAgICAgdmFsdWVzLFxuICAgICAgICB0aGlzLmNvbnRlbnRFcXVhbHMsXG4gICAgICAgIHRoaXMuY29udGVudEhhc2gsXG4gICAgICAgIHRoaXMuZ2V0RGVmYXVsdFxuICAgICk7XG59O1xuXG5GYXN0U2V0LnByb3RvdHlwZS5oYXMgPSBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICB2YXIgaGFzaCA9IHRoaXMuY29udGVudEhhc2godmFsdWUpO1xuICAgIHJldHVybiB0aGlzLmJ1Y2tldHMuZ2V0KGhhc2gpLmhhcyh2YWx1ZSk7XG59O1xuXG5GYXN0U2V0LnByb3RvdHlwZS5nZXQgPSBmdW5jdGlvbiAodmFsdWUsIGVxdWFscykge1xuICAgIGlmIChlcXVhbHMpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiRmFzdFNldCNnZXQgZG9lcyBub3Qgc3VwcG9ydCBzZWNvbmQgYXJndW1lbnQ6IGVxdWFsc1wiKTtcbiAgICB9XG4gICAgdmFyIGhhc2ggPSB0aGlzLmNvbnRlbnRIYXNoKHZhbHVlKTtcbiAgICB2YXIgYnVja2V0cyA9IHRoaXMuYnVja2V0cztcbiAgICBpZiAoYnVja2V0cy5oYXMoaGFzaCkpIHtcbiAgICAgICAgcmV0dXJuIGJ1Y2tldHMuZ2V0KGhhc2gpLmdldCh2YWx1ZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZ2V0RGVmYXVsdCh2YWx1ZSk7XG4gICAgfVxufTtcblxuRmFzdFNldC5wcm90b3R5cGVbXCJkZWxldGVcIl0gPSBmdW5jdGlvbiAodmFsdWUsIGVxdWFscykge1xuICAgIGlmIChlcXVhbHMpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiRmFzdFNldCNkZWxldGUgZG9lcyBub3Qgc3VwcG9ydCBzZWNvbmQgYXJndW1lbnQ6IGVxdWFsc1wiKTtcbiAgICB9XG4gICAgdmFyIGhhc2ggPSB0aGlzLmNvbnRlbnRIYXNoKHZhbHVlKTtcbiAgICB2YXIgYnVja2V0cyA9IHRoaXMuYnVja2V0cztcbiAgICBpZiAoYnVja2V0cy5oYXMoaGFzaCkpIHtcbiAgICAgICAgdmFyIGJ1Y2tldCA9IGJ1Y2tldHMuZ2V0KGhhc2gpO1xuICAgICAgICBpZiAoYnVja2V0W1wiZGVsZXRlXCJdKHZhbHVlKSkge1xuICAgICAgICAgICAgdGhpcy5sZW5ndGgtLTtcbiAgICAgICAgICAgIGlmIChidWNrZXQubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgICAgICAgYnVja2V0c1tcImRlbGV0ZVwiXShoYXNoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiBmYWxzZTtcbn07XG5cbkZhc3RTZXQucHJvdG90eXBlLmNsZWFyID0gZnVuY3Rpb24gKCkge1xuICAgIHRoaXMuYnVja2V0cy5jbGVhcigpO1xuICAgIHRoaXMubGVuZ3RoID0gMDtcbn07XG5cbkZhc3RTZXQucHJvdG90eXBlLmFkZCA9IGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgIHZhciBoYXNoID0gdGhpcy5jb250ZW50SGFzaCh2YWx1ZSk7XG4gICAgdmFyIGJ1Y2tldHMgPSB0aGlzLmJ1Y2tldHM7XG4gICAgaWYgKCFidWNrZXRzLmhhcyhoYXNoKSkge1xuICAgICAgICBidWNrZXRzLnNldChoYXNoLCBuZXcgdGhpcy5CdWNrZXQobnVsbCwgdGhpcy5jb250ZW50RXF1YWxzKSk7XG4gICAgfVxuICAgIGlmICghYnVja2V0cy5nZXQoaGFzaCkuaGFzKHZhbHVlKSkge1xuICAgICAgICBidWNrZXRzLmdldChoYXNoKS5hZGQodmFsdWUpO1xuICAgICAgICB0aGlzLmxlbmd0aCsrO1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gICAgcmV0dXJuIGZhbHNlO1xufTtcblxuRmFzdFNldC5wcm90b3R5cGUucmVkdWNlID0gZnVuY3Rpb24gKGNhbGxiYWNrLCBiYXNpcyAvKiwgdGhpc3AqLykge1xuICAgIHZhciB0aGlzcCA9IGFyZ3VtZW50c1syXTtcbiAgICB2YXIgYnVja2V0cyA9IHRoaXMuYnVja2V0cztcbiAgICB2YXIgaW5kZXggPSAwO1xuICAgIHJldHVybiBidWNrZXRzLnJlZHVjZShmdW5jdGlvbiAoYmFzaXMsIGJ1Y2tldCkge1xuICAgICAgICByZXR1cm4gYnVja2V0LnJlZHVjZShmdW5jdGlvbiAoYmFzaXMsIHZhbHVlKSB7XG4gICAgICAgICAgICByZXR1cm4gY2FsbGJhY2suY2FsbCh0aGlzcCwgYmFzaXMsIHZhbHVlLCBpbmRleCsrLCB0aGlzKTtcbiAgICAgICAgfSwgYmFzaXMsIHRoaXMpO1xuICAgIH0sIGJhc2lzLCB0aGlzKTtcbn07XG5cbkZhc3RTZXQucHJvdG90eXBlLm9uZSA9IGZ1bmN0aW9uICgpIHtcbiAgICBpZiAodGhpcy5sZW5ndGggPiAwKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmJ1Y2tldHMub25lKCkub25lKCk7XG4gICAgfVxufTtcblxuRmFzdFNldC5wcm90b3R5cGUuaXRlcmF0ZSA9IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gdGhpcy5idWNrZXRzLnZhbHVlc0FycmF5KCkuZmxhdHRlbigpLml0ZXJhdGUoKTtcbn07XG5cbkZhc3RTZXQucHJvdG90eXBlLmxvZyA9IGZ1bmN0aW9uIChjaGFybWFwLCBsb2dOb2RlLCBjYWxsYmFjaywgdGhpc3ApIHtcbiAgICBjaGFybWFwID0gY2hhcm1hcCB8fCBUcmVlTG9nLnVuaWNvZGVTaGFycDtcbiAgICBsb2dOb2RlID0gbG9nTm9kZSB8fCB0aGlzLmxvZ05vZGU7XG4gICAgaWYgKCFjYWxsYmFjaykge1xuICAgICAgICBjYWxsYmFjayA9IGNvbnNvbGUubG9nO1xuICAgICAgICB0aGlzcCA9IGNvbnNvbGU7XG4gICAgfVxuICAgIGNhbGxiYWNrID0gY2FsbGJhY2suYmluZCh0aGlzcCk7XG5cbiAgICB2YXIgYnVja2V0cyA9IHRoaXMuYnVja2V0cywgYnVja2V0c1NpemUgPSBidWNrZXRzLnNpemUsXG4gICAgICAgIG1hcEl0ZXIgPSBidWNrZXRzLmtleXMoKSwgaGFzaCwgaW5kZXggPSAwLFxuICAgICAgICBicmFuY2gsIGxlYWRlciwgYnVja2V0O1xuXG4gICAgd2hpbGUgKGhhc2ggPSBtYXBJdGVyLm5leHQoKS52YWx1ZSkge1xuICAgICAgICBpZiAoaW5kZXggPT09IGJ1Y2tldHNTaXplIC0gMSkge1xuICAgICAgICAgICAgYnJhbmNoID0gY2hhcm1hcC5mcm9tQWJvdmU7XG4gICAgICAgICAgICBsZWFkZXIgPSAnICc7XG4gICAgICAgIH0gZWxzZSBpZiAoaW5kZXggPT09IDApIHtcbiAgICAgICAgICAgIGJyYW5jaCA9IGNoYXJtYXAuYnJhbmNoRG93bjtcbiAgICAgICAgICAgIGxlYWRlciA9IGNoYXJtYXAuc3RyYWZlO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgYnJhbmNoID0gY2hhcm1hcC5mcm9tQm90aDtcbiAgICAgICAgICAgIGxlYWRlciA9IGNoYXJtYXAuc3RyYWZlO1xuICAgICAgICB9XG4gICAgICAgIGJ1Y2tldCA9IGJ1Y2tldHMuZ2V0KGhhc2gpO1xuICAgICAgICBjYWxsYmFjay5jYWxsKHRoaXNwLCBicmFuY2ggKyBjaGFybWFwLnRocm91Z2ggKyBjaGFybWFwLmJyYW5jaERvd24gKyAnICcgKyBoYXNoKTtcbiAgICAgICAgYnVja2V0LmZvckVhY2goZnVuY3Rpb24gKHZhbHVlLCBub2RlKSB7XG4gICAgICAgICAgICB2YXIgYnJhbmNoLCBiZWxvdywgd3JpdHRlbjtcbiAgICAgICAgICAgIGlmIChub2RlID09PSBidWNrZXQuaGVhZC5wcmV2KSB7XG4gICAgICAgICAgICAgICAgYnJhbmNoID0gY2hhcm1hcC5mcm9tQWJvdmU7XG4gICAgICAgICAgICAgICAgYmVsb3cgPSAnICc7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGJyYW5jaCA9IGNoYXJtYXAuZnJvbUJvdGg7XG4gICAgICAgICAgICAgICAgYmVsb3cgPSBjaGFybWFwLnN0cmFmZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGxvZ05vZGUoXG4gICAgICAgICAgICAgICAgbm9kZSxcbiAgICAgICAgICAgICAgICBmdW5jdGlvbiAobGluZSkge1xuICAgICAgICAgICAgICAgICAgICBpZiAoIXdyaXR0ZW4pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrLmNhbGwodGhpc3AsIGxlYWRlciArICcgJyArIGJyYW5jaCArIGNoYXJtYXAudGhyb3VnaCArIGNoYXJtYXAudGhyb3VnaCArIGxpbmUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgd3JpdHRlbiA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjYWxsYmFjay5jYWxsKHRoaXNwLCBsZWFkZXIgKyAnICcgKyBiZWxvdyArICcgICcgKyBsaW5lKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgZnVuY3Rpb24gKGxpbmUpIHtcbiAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2suY2FsbCh0aGlzcCwgbGVhZGVyICsgJyAnICsgY2hhcm1hcC5zdHJhZmUgKyAnICAnICsgbGluZSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgKTtcbiAgICAgICAgfSk7XG4gICAgICAgIGluZGV4Kys7XG4gICAgfVxuXG4gICAgLy92YXIgaGFzaGVzID0gYnVja2V0cy5rZXlzQXJyYXkoKTtcbiAgICAvLyBoYXNoZXMuZm9yRWFjaChmdW5jdGlvbiAoaGFzaCwgaW5kZXgpIHtcbiAgICAvLyAgICAgdmFyIGJyYW5jaDtcbiAgICAvLyAgICAgdmFyIGxlYWRlcjtcbiAgICAvLyAgICAgaWYgKGluZGV4ID09PSBoYXNoZXMubGVuZ3RoIC0gMSkge1xuICAgIC8vICAgICAgICAgYnJhbmNoID0gY2hhcm1hcC5mcm9tQWJvdmU7XG4gICAgLy8gICAgICAgICBsZWFkZXIgPSAnICc7XG4gICAgLy8gICAgIH0gZWxzZSBpZiAoaW5kZXggPT09IDApIHtcbiAgICAvLyAgICAgICAgIGJyYW5jaCA9IGNoYXJtYXAuYnJhbmNoRG93bjtcbiAgICAvLyAgICAgICAgIGxlYWRlciA9IGNoYXJtYXAuc3RyYWZlO1xuICAgIC8vICAgICB9IGVsc2Uge1xuICAgIC8vICAgICAgICAgYnJhbmNoID0gY2hhcm1hcC5mcm9tQm90aDtcbiAgICAvLyAgICAgICAgIGxlYWRlciA9IGNoYXJtYXAuc3RyYWZlO1xuICAgIC8vICAgICB9XG4gICAgLy8gICAgIHZhciBidWNrZXQgPSBidWNrZXRzLmdldChoYXNoKTtcbiAgICAvLyAgICAgY2FsbGJhY2suY2FsbCh0aGlzcCwgYnJhbmNoICsgY2hhcm1hcC50aHJvdWdoICsgY2hhcm1hcC5icmFuY2hEb3duICsgJyAnICsgaGFzaCk7XG4gICAgLy8gICAgIGJ1Y2tldC5mb3JFYWNoKGZ1bmN0aW9uICh2YWx1ZSwgbm9kZSkge1xuICAgIC8vICAgICAgICAgdmFyIGJyYW5jaCwgYmVsb3c7XG4gICAgLy8gICAgICAgICBpZiAobm9kZSA9PT0gYnVja2V0LmhlYWQucHJldikge1xuICAgIC8vICAgICAgICAgICAgIGJyYW5jaCA9IGNoYXJtYXAuZnJvbUFib3ZlO1xuICAgIC8vICAgICAgICAgICAgIGJlbG93ID0gJyAnO1xuICAgIC8vICAgICAgICAgfSBlbHNlIHtcbiAgICAvLyAgICAgICAgICAgICBicmFuY2ggPSBjaGFybWFwLmZyb21Cb3RoO1xuICAgIC8vICAgICAgICAgICAgIGJlbG93ID0gY2hhcm1hcC5zdHJhZmU7XG4gICAgLy8gICAgICAgICB9XG4gICAgLy8gICAgICAgICB2YXIgd3JpdHRlbjtcbiAgICAvLyAgICAgICAgIGxvZ05vZGUoXG4gICAgLy8gICAgICAgICAgICAgbm9kZSxcbiAgICAvLyAgICAgICAgICAgICBmdW5jdGlvbiAobGluZSkge1xuICAgIC8vICAgICAgICAgICAgICAgICBpZiAoIXdyaXR0ZW4pIHtcbiAgICAvLyAgICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrLmNhbGwodGhpc3AsIGxlYWRlciArICcgJyArIGJyYW5jaCArIGNoYXJtYXAudGhyb3VnaCArIGNoYXJtYXAudGhyb3VnaCArIGxpbmUpO1xuICAgIC8vICAgICAgICAgICAgICAgICAgICAgd3JpdHRlbiA9IHRydWU7XG4gICAgLy8gICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgLy8gICAgICAgICAgICAgICAgICAgICBjYWxsYmFjay5jYWxsKHRoaXNwLCBsZWFkZXIgKyAnICcgKyBiZWxvdyArICcgICcgKyBsaW5lKTtcbiAgICAvLyAgICAgICAgICAgICAgICAgfVxuICAgIC8vICAgICAgICAgICAgIH0sXG4gICAgLy8gICAgICAgICAgICAgZnVuY3Rpb24gKGxpbmUpIHtcbiAgICAvLyAgICAgICAgICAgICAgICAgY2FsbGJhY2suY2FsbCh0aGlzcCwgbGVhZGVyICsgJyAnICsgY2hhcm1hcC5zdHJhZmUgKyAnICAnICsgbGluZSk7XG4gICAgLy8gICAgICAgICAgICAgfVxuICAgIC8vICAgICAgICAgKTtcbiAgICAvLyAgICAgfSk7XG4gICAgLy8gfSk7XG59O1xuXG5GYXN0U2V0LnByb3RvdHlwZS5sb2dOb2RlID0gZnVuY3Rpb24gKG5vZGUsIHdyaXRlKSB7XG4gICAgdmFyIHZhbHVlID0gbm9kZS52YWx1ZTtcbiAgICBpZiAoT2JqZWN0KHZhbHVlKSA9PT0gdmFsdWUpIHtcbiAgICAgICAgSlNPTi5zdHJpbmdpZnkodmFsdWUsIG51bGwsIDQpLnNwbGl0KFwiXFxuXCIpLmZvckVhY2goZnVuY3Rpb24gKGxpbmUpIHtcbiAgICAgICAgICAgIHdyaXRlKFwiIFwiICsgbGluZSk7XG4gICAgICAgIH0pO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHdyaXRlKFwiIFwiICsgdmFsdWUpO1xuICAgIH1cbn07XG4iLCJcInVzZSBzdHJpY3RcIjtcblxubW9kdWxlLmV4cG9ydHMgPSBMaXN0O1xuXG52YXIgU2hpbSA9IHJlcXVpcmUoXCIuL3NoaW1cIik7XG52YXIgR2VuZXJpY0NvbGxlY3Rpb24gPSByZXF1aXJlKFwiLi9nZW5lcmljLWNvbGxlY3Rpb25cIik7XG52YXIgR2VuZXJpY09yZGVyID0gcmVxdWlyZShcIi4vZ2VuZXJpYy1vcmRlclwiKTtcblxuZnVuY3Rpb24gTGlzdCh2YWx1ZXMsIGVxdWFscywgZ2V0RGVmYXVsdCkge1xuICAgIHJldHVybiBMaXN0Ll9pbml0KExpc3QsIHRoaXMsIHZhbHVlcywgZXF1YWxzLCBnZXREZWZhdWx0KTtcbn1cblxuTGlzdC5faW5pdCA9IGZ1bmN0aW9uIChjb25zdHJ1Y3Rvciwgb2JqZWN0LCB2YWx1ZXMsIGVxdWFscywgZ2V0RGVmYXVsdCkge1xuICAgIGlmICghKG9iamVjdCBpbnN0YW5jZW9mIGNvbnN0cnVjdG9yKSkge1xuICAgICAgICByZXR1cm4gbmV3IGNvbnN0cnVjdG9yKHZhbHVlcywgZXF1YWxzLCBnZXREZWZhdWx0KTtcbiAgICB9XG4gICAgdmFyIGhlYWQgPSBvYmplY3QuaGVhZCA9IG5ldyBvYmplY3QuTm9kZSgpO1xuICAgIGhlYWQubmV4dCA9IGhlYWQ7XG4gICAgaGVhZC5wcmV2ID0gaGVhZDtcbiAgICBvYmplY3QuY29udGVudEVxdWFscyA9IGVxdWFscyB8fCBPYmplY3QuZXF1YWxzO1xuICAgIG9iamVjdC5nZXREZWZhdWx0ID0gZ2V0RGVmYXVsdCB8fCBGdW5jdGlvbi5ub29wO1xuICAgIG9iamVjdC5sZW5ndGggPSAwO1xuICAgIG9iamVjdC5hZGRFYWNoKHZhbHVlcyk7XG59XG5cbkxpc3QuTGlzdCA9IExpc3Q7IC8vIGhhY2sgc28gcmVxdWlyZShcImxpc3RcIikuTGlzdCB3aWxsIHdvcmsgaW4gTW9udGFnZUpTXG5cbk9iamVjdC5hZGRFYWNoKExpc3QucHJvdG90eXBlLCBHZW5lcmljQ29sbGVjdGlvbi5wcm90b3R5cGUpO1xuT2JqZWN0LmFkZEVhY2goTGlzdC5wcm90b3R5cGUsIEdlbmVyaWNPcmRlci5wcm90b3R5cGUpO1xuXG5MaXN0LmZyb20gPSBHZW5lcmljQ29sbGVjdGlvbi5mcm9tO1xuXG5MaXN0LnByb3RvdHlwZS5jb25zdHJ1Y3RDbG9uZSA9IGZ1bmN0aW9uICh2YWx1ZXMpIHtcbiAgICByZXR1cm4gbmV3IHRoaXMuY29uc3RydWN0b3IodmFsdWVzLCB0aGlzLmNvbnRlbnRFcXVhbHMsIHRoaXMuZ2V0RGVmYXVsdCk7XG59O1xuXG5MaXN0LnByb3RvdHlwZS5maW5kID0gZnVuY3Rpb24gKHZhbHVlLCBlcXVhbHMsIGluZGV4KSB7XG4gICAgZXF1YWxzID0gZXF1YWxzIHx8IHRoaXMuY29udGVudEVxdWFscztcbiAgICB2YXIgaGVhZCA9IHRoaXMuaGVhZDtcbiAgICB2YXIgYXQgPSB0aGlzLnNjYW4oaW5kZXgsIGhlYWQubmV4dCk7XG4gICAgd2hpbGUgKGF0ICE9PSBoZWFkKSB7XG4gICAgICAgIGlmIChlcXVhbHMoYXQudmFsdWUsIHZhbHVlKSkge1xuICAgICAgICAgICAgcmV0dXJuIGF0O1xuICAgICAgICB9XG4gICAgICAgIGF0ID0gYXQubmV4dDtcbiAgICB9XG59O1xuXG5MaXN0LnByb3RvdHlwZS5maW5kTGFzdCA9IGZ1bmN0aW9uICh2YWx1ZSwgZXF1YWxzLCBpbmRleCkge1xuICAgIGVxdWFscyA9IGVxdWFscyB8fCB0aGlzLmNvbnRlbnRFcXVhbHM7XG4gICAgdmFyIGhlYWQgPSB0aGlzLmhlYWQ7XG4gICAgdmFyIGF0ID0gdGhpcy5zY2FuKGluZGV4LCBoZWFkLnByZXYpO1xuICAgIHdoaWxlIChhdCAhPT0gaGVhZCkge1xuICAgICAgICBpZiAoZXF1YWxzKGF0LnZhbHVlLCB2YWx1ZSkpIHtcbiAgICAgICAgICAgIHJldHVybiBhdDtcbiAgICAgICAgfVxuICAgICAgICBhdCA9IGF0LnByZXY7XG4gICAgfVxufTtcblxuTGlzdC5wcm90b3R5cGUuaGFzID0gZnVuY3Rpb24gKHZhbHVlLCBlcXVhbHMpIHtcbiAgICByZXR1cm4gISF0aGlzLmZpbmQodmFsdWUsIGVxdWFscyk7XG59O1xuXG5MaXN0LnByb3RvdHlwZS5nZXQgPSBmdW5jdGlvbiAodmFsdWUsIGVxdWFscykge1xuICAgIHZhciBmb3VuZCA9IHRoaXMuZmluZCh2YWx1ZSwgZXF1YWxzKTtcbiAgICBpZiAoZm91bmQpIHtcbiAgICAgICAgcmV0dXJuIGZvdW5kLnZhbHVlO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy5nZXREZWZhdWx0KHZhbHVlKTtcbn07XG5cbi8vIExJRk8gKGRlbGV0ZSByZW1vdmVzIHRoZSBtb3N0IHJlY2VudGx5IGFkZGVkIGVxdWl2YWxlbnQgdmFsdWUpXG5MaXN0LnByb3RvdHlwZVtcImRlbGV0ZVwiXSA9IGZ1bmN0aW9uICh2YWx1ZSwgZXF1YWxzKSB7XG4gICAgdmFyIGZvdW5kID0gdGhpcy5maW5kTGFzdCh2YWx1ZSwgZXF1YWxzKTtcbiAgICBpZiAoZm91bmQpIHtcbiAgICAgICAgZm91bmRbXCJkZWxldGVcIl0oKTtcbiAgICAgICAgdGhpcy5sZW5ndGgtLTtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuICAgIHJldHVybiBmYWxzZTtcbn07XG5cbkxpc3QucHJvdG90eXBlLmRlbGV0ZUFsbCA9IGZ1bmN0aW9uICh2YWx1ZSwgZXF1YWxzKSB7XG4gICAgZXF1YWxzID0gZXF1YWxzIHx8IHRoaXMuY29udGVudEVxdWFscztcbiAgICB2YXIgaGVhZCA9IHRoaXMuaGVhZDtcbiAgICB2YXIgYXQgPSBoZWFkLm5leHQ7XG4gICAgdmFyIGNvdW50ID0gMDtcbiAgICB3aGlsZSAoYXQgIT09IGhlYWQpIHtcbiAgICAgICAgaWYgKGVxdWFscyh2YWx1ZSwgYXQudmFsdWUpKSB7XG4gICAgICAgICAgICBhdFtcImRlbGV0ZVwiXSgpO1xuICAgICAgICAgICAgY291bnQrKztcbiAgICAgICAgfVxuICAgICAgICBhdCA9IGF0Lm5leHQ7XG4gICAgfVxuICAgIHRoaXMubGVuZ3RoIC09IGNvdW50O1xuICAgIHJldHVybiBjb3VudDtcbn07XG5cbkxpc3QucHJvdG90eXBlLmNsZWFyID0gZnVuY3Rpb24gKCkge1xuICAgIHRoaXMuaGVhZC5uZXh0ID0gdGhpcy5oZWFkLnByZXYgPSB0aGlzLmhlYWQ7XG4gICAgdGhpcy5sZW5ndGggPSAwO1xufTtcblxuTGlzdC5wcm90b3R5cGUuYWRkID0gZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgdmFyIG5vZGUgPSBuZXcgdGhpcy5Ob2RlKHZhbHVlKVxuICAgIHJldHVybiB0aGlzLl9hZGROb2RlKG5vZGUpO1xufTtcblxuTGlzdC5wcm90b3R5cGUuX2FkZE5vZGUgPSBmdW5jdGlvbiAobm9kZSkge1xuICAgIHRoaXMuaGVhZC5hZGRCZWZvcmUobm9kZSk7XG4gICAgdGhpcy5sZW5ndGgrKztcbiAgICByZXR1cm4gdHJ1ZTtcbn07XG5cbkxpc3QucHJvdG90eXBlLnB1c2ggPSBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIGhlYWQgPSB0aGlzLmhlYWQ7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBhcmd1bWVudHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgdmFyIHZhbHVlID0gYXJndW1lbnRzW2ldO1xuICAgICAgICB2YXIgbm9kZSA9IG5ldyB0aGlzLk5vZGUodmFsdWUpO1xuICAgICAgICBoZWFkLmFkZEJlZm9yZShub2RlKTtcbiAgICB9XG4gICAgdGhpcy5sZW5ndGggKz0gYXJndW1lbnRzLmxlbmd0aDtcbn07XG5cbkxpc3QucHJvdG90eXBlLnVuc2hpZnQgPSBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIGF0ID0gdGhpcy5oZWFkO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgYXJndW1lbnRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIHZhciB2YWx1ZSA9IGFyZ3VtZW50c1tpXTtcbiAgICAgICAgdmFyIG5vZGUgPSBuZXcgdGhpcy5Ob2RlKHZhbHVlKTtcbiAgICAgICAgYXQuYWRkQWZ0ZXIobm9kZSk7XG4gICAgICAgIGF0ID0gbm9kZTtcbiAgICB9XG4gICAgdGhpcy5sZW5ndGggKz0gYXJndW1lbnRzLmxlbmd0aDtcbn07XG5cbkxpc3QucHJvdG90eXBlLl9zaG91bGRQb3AgPSBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIHZhbHVlO1xuICAgIHZhciBoZWFkID0gdGhpcy5oZWFkO1xuICAgIGlmIChoZWFkLnByZXYgIT09IGhlYWQpIHtcbiAgICAgICAgdmFsdWUgPSBoZWFkLnByZXYudmFsdWU7XG4gICAgfVxuICAgIHJldHVybiB2YWx1ZTtcbn1cblxuTGlzdC5wcm90b3R5cGUucG9wID0gZnVuY3Rpb24gKF9iZWZvcmUsIF9hZnRlcikge1xuICAgIHZhciB2YWx1ZTtcbiAgICB2YXIgaGVhZCA9IHRoaXMuaGVhZDtcbiAgICBpZiAoaGVhZC5wcmV2ICE9PSBoZWFkKSB7XG4gICAgICAgIHZhbHVlID0gaGVhZC5wcmV2LnZhbHVlO1xuICAgICAgICB2YXIgaW5kZXggPSB0aGlzLmxlbmd0aCAtIDE7XG4gICAgICAgIHZhciBwb3BEaXNwYXRjaFZhbHVlQXJyYXkgPSBfYmVmb3JlID8gX2JlZm9yZS5jYWxsKHRoaXMsdmFsdWUsaW5kZXgpIDogdm9pZCAwO1xuICAgICAgICBoZWFkLnByZXZbJ2RlbGV0ZSddKCk7XG4gICAgICAgIHRoaXMubGVuZ3RoLS07XG4gICAgICAgIF9hZnRlciA/IF9hZnRlci5jYWxsKHRoaXMsdmFsdWUsaW5kZXgsIHBvcERpc3BhdGNoVmFsdWVBcnJheSkgOiB2b2lkIDA7XG4gICAgfVxuICAgIHJldHVybiB2YWx1ZTtcbn07XG5cbkxpc3QucHJvdG90eXBlLnNoaWZ0ID0gZnVuY3Rpb24gKF9iZWZvcmUsIF9hZnRlcikge1xuICAgIHZhciB2YWx1ZTtcbiAgICB2YXIgaGVhZCA9IHRoaXMuaGVhZDtcbiAgICBpZiAoaGVhZC5wcmV2ICE9PSBoZWFkKSB7XG4gICAgICAgIHZhbHVlID0gaGVhZC5uZXh0LnZhbHVlO1xuICAgICAgICB2YXIgZGlzcGF0Y2hWYWx1ZUFycmF5ID0gX2JlZm9yZSA/IF9iZWZvcmUuY2FsbCh0aGlzLHZhbHVlLDApIDogdm9pZCAwO1xuICAgICAgICBoZWFkLm5leHRbJ2RlbGV0ZSddKCk7XG4gICAgICAgIHRoaXMubGVuZ3RoLS07XG4gICAgICAgIF9hZnRlciA/IF9hZnRlci5jYWxsKHRoaXMsdmFsdWUsMCxkaXNwYXRjaFZhbHVlQXJyYXkpIDogdm9pZCAwO1xuICAgIH1cbiAgICByZXR1cm4gdmFsdWU7XG59O1xuXG5MaXN0LnByb3RvdHlwZS5wZWVrID0gZnVuY3Rpb24gKCkge1xuICAgIGlmICh0aGlzLmhlYWQgIT09IHRoaXMuaGVhZC5uZXh0KSB7XG4gICAgICAgIHJldHVybiB0aGlzLmhlYWQubmV4dC52YWx1ZTtcbiAgICB9XG59O1xuXG5MaXN0LnByb3RvdHlwZS5wb2tlID0gZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgaWYgKHRoaXMuaGVhZCAhPT0gdGhpcy5oZWFkLm5leHQpIHtcbiAgICAgICAgdGhpcy5oZWFkLm5leHQudmFsdWUgPSB2YWx1ZTtcbiAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLnB1c2godmFsdWUpO1xuICAgIH1cbn07XG5cbkxpc3QucHJvdG90eXBlLm9uZSA9IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gdGhpcy5wZWVrKCk7XG59O1xuXG4vLyBUT0RPXG4vLyBMaXN0LnByb3RvdHlwZS5pbmRleE9mID0gZnVuY3Rpb24gKHZhbHVlKSB7XG4vLyB9O1xuXG4vLyBUT0RPXG4vLyBMaXN0LnByb3RvdHlwZS5sYXN0SW5kZXhPZiA9IGZ1bmN0aW9uICh2YWx1ZSkge1xuLy8gfTtcblxuLy8gYW4gaW50ZXJuYWwgdXRpbGl0eSBmb3IgY29lcmNpbmcgaW5kZXggb2Zmc2V0cyB0byBub2Rlc1xuTGlzdC5wcm90b3R5cGUuc2NhbiA9IGZ1bmN0aW9uIChhdCwgZmFsbGJhY2spIHtcbiAgICB2YXIgaGVhZCA9IHRoaXMuaGVhZDtcbiAgICBpZiAodHlwZW9mIGF0ID09PSBcIm51bWJlclwiKSB7XG4gICAgICAgIHZhciBjb3VudCA9IGF0O1xuICAgICAgICBpZiAoY291bnQgPj0gMCkge1xuICAgICAgICAgICAgYXQgPSBoZWFkLm5leHQ7XG4gICAgICAgICAgICB3aGlsZSAoY291bnQpIHtcbiAgICAgICAgICAgICAgICBjb3VudC0tO1xuICAgICAgICAgICAgICAgIGF0ID0gYXQubmV4dDtcbiAgICAgICAgICAgICAgICBpZiAoYXQgPT0gaGVhZCkge1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBhdCA9IGhlYWQ7XG4gICAgICAgICAgICB3aGlsZSAoY291bnQgPCAwKSB7XG4gICAgICAgICAgICAgICAgY291bnQrKztcbiAgICAgICAgICAgICAgICBhdCA9IGF0LnByZXY7XG4gICAgICAgICAgICAgICAgaWYgKGF0ID09IGhlYWQpIHtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBhdDtcbiAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gYXQgfHwgZmFsbGJhY2s7XG4gICAgfVxufTtcblxuLy8gYXQgYW5kIGVuZCBtYXkgYm90aCBiZSBwb3NpdGl2ZSBvciBuZWdhdGl2ZSBudW1iZXJzIChpbiB3aGljaCBjYXNlcyB0aGV5XG4vLyBjb3JyZXNwb25kIHRvIG51bWVyaWMgaW5kaWNpZXMsIG9yIG5vZGVzKVxuTGlzdC5wcm90b3R5cGUuc2xpY2UgPSBmdW5jdGlvbiAoYXQsIGVuZCkge1xuICAgIHZhciBzbGljZWQgPSBbXTtcbiAgICB2YXIgaGVhZCA9IHRoaXMuaGVhZDtcbiAgICBhdCA9IHRoaXMuc2NhbihhdCwgaGVhZC5uZXh0KTtcbiAgICBlbmQgPSB0aGlzLnNjYW4oZW5kLCBoZWFkKTtcblxuICAgIHdoaWxlIChhdCAhPT0gZW5kICYmIGF0ICE9PSBoZWFkKSB7XG4gICAgICAgIHNsaWNlZC5wdXNoKGF0LnZhbHVlKTtcbiAgICAgICAgYXQgPSBhdC5uZXh0O1xuICAgIH1cblxuICAgIHJldHVybiBzbGljZWQ7XG59O1xuXG5MaXN0LnByb3RvdHlwZS5zcGxpY2UgPSBmdW5jdGlvbiAoYXQsIGxlbmd0aCAvKi4uLnBsdXMqLykge1xuICAgIHJldHVybiB0aGlzLnN3YXAoYXQsIGxlbmd0aCwgQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzLCAyKSk7XG59O1xuXG5MaXN0LnByb3RvdHlwZS5zd2FwID0gZnVuY3Rpb24gKHN0YXJ0LCBsZW5ndGgsIHBsdXMsIF9iZWZvcmUsIF9hZnRlcikge1xuICAgIHZhciBpbml0aWFsID0gc3RhcnQ7XG4gICAgLy8gc3RhcnQgd2lsbCBiZSBoZWFkIGlmIHN0YXJ0IGlzIG51bGwgb3IgLTEgKG1lYW5pbmcgZnJvbSB0aGUgZW5kKSwgYnV0XG4gICAgLy8gd2lsbCBiZSBoZWFkLm5leHQgaWYgc3RhcnQgaXMgMCAobWVhbmluZyBmcm9tIHRoZSBiZWdpbm5pbmcpXG4gICAgc3RhcnQgPSB0aGlzLnNjYW4oc3RhcnQsIHRoaXMuaGVhZCk7XG4gICAgaWYgKGxlbmd0aCA9PSBudWxsKSB7XG4gICAgICAgIGxlbmd0aCA9IEluZmluaXR5O1xuICAgIH1cbiAgICBwbHVzID0gQXJyYXkuZnJvbShwbHVzKTtcblxuICAgIC8vIGNvbGxlY3QgdGhlIG1pbnVzIGFycmF5XG4gICAgdmFyIG1pbnVzID0gW107XG4gICAgdmFyIGF0ID0gc3RhcnQ7XG4gICAgd2hpbGUgKGxlbmd0aC0tICYmIGxlbmd0aCA+PSAwICYmIGF0ICE9PSB0aGlzLmhlYWQpIHtcbiAgICAgICAgbWludXMucHVzaChhdC52YWx1ZSk7XG4gICAgICAgIGF0ID0gYXQubmV4dDtcbiAgICB9XG5cbiAgICAvLyBiZWZvcmUgcmFuZ2UgY2hhbmdlXG4gICAgdmFyIGluZGV4LCBzdGFydE5vZGU7XG4gICAgaW5kZXggPSBfYmVmb3JlID8gX2JlZm9yZS5jYWxsKHRoaXMsIHN0YXJ0LCBwbHVzLCBtaW51cykgOiB2b2lkIDA7XG5cbiAgICAvLyBkZWxldGUgbWludXNcbiAgICB2YXIgYXQgPSBzdGFydDtcbiAgICBmb3IgKHZhciBpID0gMCwgYXQgPSBzdGFydDsgaSA8IG1pbnVzLmxlbmd0aDsgaSsrLCBhdCA9IGF0Lm5leHQpIHtcbiAgICAgICAgYXRbXCJkZWxldGVcIl0oKTtcbiAgICB9XG4gICAgLy8gYWRkIHBsdXNcbiAgICBpZiAoaW5pdGlhbCA9PSBudWxsICYmIGF0ID09PSB0aGlzLmhlYWQpIHtcbiAgICAgICAgYXQgPSB0aGlzLmhlYWQubmV4dDtcbiAgICB9XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBwbHVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIHZhciBub2RlID0gbmV3IHRoaXMuTm9kZShwbHVzW2ldKTtcbiAgICAgICAgYXQuYWRkQmVmb3JlKG5vZGUpO1xuICAgIH1cbiAgICAvLyBhZGp1c3QgbGVuZ3RoXG4gICAgdGhpcy5sZW5ndGggKz0gcGx1cy5sZW5ndGggLSBtaW51cy5sZW5ndGg7XG5cbiAgICBfYWZ0ZXIgPyBfYWZ0ZXIuY2FsbCh0aGlzLCBzdGFydCwgcGx1cywgbWludXMpIDogdm9pZCAwO1xuXG4gICAgcmV0dXJuIG1pbnVzO1xufTtcblxuTGlzdC5wcm90b3R5cGUucmV2ZXJzZSA9IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgYXQgPSB0aGlzLmhlYWQ7XG4gICAgZG8ge1xuICAgICAgICB2YXIgdGVtcCA9IGF0Lm5leHQ7XG4gICAgICAgIGF0Lm5leHQgPSBhdC5wcmV2O1xuICAgICAgICBhdC5wcmV2ID0gdGVtcDtcbiAgICAgICAgYXQgPSBhdC5uZXh0O1xuICAgIH0gd2hpbGUgKGF0ICE9PSB0aGlzLmhlYWQpO1xuICAgIHJldHVybiB0aGlzO1xufTtcblxuTGlzdC5wcm90b3R5cGUuc29ydCA9IGZ1bmN0aW9uICgpIHtcbiAgICB0aGlzLnN3YXAoMCwgdGhpcy5sZW5ndGgsIHRoaXMuc29ydGVkKCkpO1xufTtcblxuLy8gVE9ETyBhY2NvdW50IGZvciBtaXNzaW5nIGJhc2lzIGFyZ3VtZW50XG5MaXN0LnByb3RvdHlwZS5yZWR1Y2UgPSBmdW5jdGlvbiAoY2FsbGJhY2ssIGJhc2lzIC8qLCB0aGlzcCovKSB7XG4gICAgdmFyIHRoaXNwID0gYXJndW1lbnRzWzJdO1xuICAgIHZhciBoZWFkID0gdGhpcy5oZWFkO1xuICAgIHZhciBhdCA9IGhlYWQubmV4dDtcbiAgICB3aGlsZSAoYXQgIT09IGhlYWQpIHtcbiAgICAgICAgYmFzaXMgPSBjYWxsYmFjay5jYWxsKHRoaXNwLCBiYXNpcywgYXQudmFsdWUsIGF0LCB0aGlzKTtcbiAgICAgICAgYXQgPSBhdC5uZXh0O1xuICAgIH1cbiAgICByZXR1cm4gYmFzaXM7XG59O1xuXG5MaXN0LnByb3RvdHlwZS5yZWR1Y2VSaWdodCA9IGZ1bmN0aW9uIChjYWxsYmFjaywgYmFzaXMgLyosIHRoaXNwKi8pIHtcbiAgICB2YXIgdGhpc3AgPSBhcmd1bWVudHNbMl07XG4gICAgdmFyIGhlYWQgPSB0aGlzLmhlYWQ7XG4gICAgdmFyIGF0ID0gaGVhZC5wcmV2O1xuICAgIHdoaWxlIChhdCAhPT0gaGVhZCkge1xuICAgICAgICBiYXNpcyA9IGNhbGxiYWNrLmNhbGwodGhpc3AsIGJhc2lzLCBhdC52YWx1ZSwgYXQsIHRoaXMpO1xuICAgICAgICBhdCA9IGF0LnByZXY7XG4gICAgfVxuICAgIHJldHVybiBiYXNpcztcbn07XG5cbkxpc3QucHJvdG90eXBlLnVwZGF0ZUluZGV4ZXMgPSBmdW5jdGlvbiAobm9kZSwgaW5kZXgpIHtcbiAgICB3aGlsZSAobm9kZSAhPT0gdGhpcy5oZWFkKSB7XG4gICAgICAgIG5vZGUuaW5kZXggPSBpbmRleCsrO1xuICAgICAgICBub2RlID0gbm9kZS5uZXh0O1xuICAgIH1cbn07XG5cblxuTGlzdC5wcm90b3R5cGUuaXRlcmF0ZSA9IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gbmV3IExpc3RJdGVyYXRvcih0aGlzLmhlYWQpO1xufTtcblxuZnVuY3Rpb24gTGlzdEl0ZXJhdG9yKGhlYWQpIHtcbiAgICB0aGlzLmhlYWQgPSBoZWFkO1xuICAgIHRoaXMuYXQgPSBoZWFkLm5leHQ7XG59O1xuXG5MaXN0SXRlcmF0b3IucHJvdG90eXBlLl9faXRlcmF0aW9uT2JqZWN0ID0gbnVsbDtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShMaXN0SXRlcmF0b3IucHJvdG90eXBlLFwiX2l0ZXJhdGlvbk9iamVjdFwiLCB7XG4gICAgZ2V0OiBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX19pdGVyYXRpb25PYmplY3QgfHwgKHRoaXMuX19pdGVyYXRpb25PYmplY3QgPSB7IGRvbmU6IGZhbHNlLCB2YWx1ZTpudWxsfSk7XG4gICAgfVxufSk7XG5cblxuTGlzdEl0ZXJhdG9yLnByb3RvdHlwZS5uZXh0ID0gZnVuY3Rpb24gKCkge1xuICAgIGlmICh0aGlzLmF0ID09PSB0aGlzLmhlYWQpIHtcbiAgICAgICAgdGhpcy5faXRlcmF0aW9uT2JqZWN0LmRvbmUgPSB0cnVlO1xuICAgICAgICB0aGlzLl9pdGVyYXRpb25PYmplY3QudmFsdWUgPSB2b2lkIDA7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgdmFyIHZhbHVlID0gdGhpcy5hdC52YWx1ZTtcbiAgICAgICAgdGhpcy5hdCA9IHRoaXMuYXQubmV4dDtcbiAgICAgICAgdGhpcy5faXRlcmF0aW9uT2JqZWN0LnZhbHVlID0gdmFsdWU7XG4gICAgfVxuICAgIHJldHVybiB0aGlzLl9pdGVyYXRpb25PYmplY3Q7XG59O1xuXG5MaXN0LnByb3RvdHlwZS5Ob2RlID0gTm9kZTtcblxuZnVuY3Rpb24gTm9kZSh2YWx1ZSkge1xuICAgIHRoaXMudmFsdWUgPSB2YWx1ZTtcbiAgICB0aGlzLnByZXYgPSBudWxsO1xuICAgIHRoaXMubmV4dCA9IG51bGw7XG59O1xuXG5Ob2RlLnByb3RvdHlwZVtcImRlbGV0ZVwiXSA9IGZ1bmN0aW9uICgpIHtcbiAgICB0aGlzLnByZXYubmV4dCA9IHRoaXMubmV4dDtcbiAgICB0aGlzLm5leHQucHJldiA9IHRoaXMucHJldjtcbn07XG5cbk5vZGUucHJvdG90eXBlLmFkZEJlZm9yZSA9IGZ1bmN0aW9uIChub2RlKSB7XG4gICAgdmFyIHByZXYgPSB0aGlzLnByZXY7XG4gICAgdGhpcy5wcmV2ID0gbm9kZTtcbiAgICBub2RlLnByZXYgPSBwcmV2O1xuICAgIHByZXYubmV4dCA9IG5vZGU7XG4gICAgbm9kZS5uZXh0ID0gdGhpcztcbn07XG5cbk5vZGUucHJvdG90eXBlLmFkZEFmdGVyID0gZnVuY3Rpb24gKG5vZGUpIHtcbiAgICB2YXIgbmV4dCA9IHRoaXMubmV4dDtcbiAgICB0aGlzLm5leHQgPSBub2RlO1xuICAgIG5vZGUubmV4dCA9IG5leHQ7XG4gICAgbmV4dC5wcmV2ID0gbm9kZTtcbiAgICBub2RlLnByZXYgPSB0aGlzO1xufTtcbiIsIlwidXNlIHN0cmljdFwiO1xuXG52YXIgU2hpbSA9IHJlcXVpcmUoXCIuL3NoaW1cIik7XG52YXIgR2VuZXJpY0NvbGxlY3Rpb24gPSByZXF1aXJlKFwiLi9nZW5lcmljLWNvbGxlY3Rpb25cIik7XG52YXIgTWFwLCBHbG9iYWxNYXAsIENvbGxlY3Rpb25zTWFwO1xuXG5pZigoZ2xvYmFsLk1hcCAhPT0gdm9pZCAwKSAmJiAodHlwZW9mIGdsb2JhbC5TZXQucHJvdG90eXBlLnZhbHVlcyA9PT0gXCJmdW5jdGlvblwiKSkge1xuXG4gICAgTWFwID0gbW9kdWxlLmV4cG9ydHMgPSBnbG9iYWwuTWFwLFxuICAgIEdsb2JhbE1hcCA9IE1hcDtcbiAgICBNYXAuTWFwID0gTWFwOyAvLyBoYWNrIHNvIHJlcXVpcmUoXCJtYXBcIikuTWFwIHdpbGwgd29yayBpbiBNb250YWdlSlNcblxuICAgIC8vIHVzZSBkaWZmZXJlbnQgc3RyYXRlZ2llcyBmb3IgbWFraW5nIHNldHMgb2JzZXJ2YWJsZSBiZXR3ZWVuIEludGVybmV0XG4gICAgLy8gRXhwbG9yZXIgYW5kIG90aGVyIGJyb3dzZXJzLlxuICAgIHZhciBwcm90b0lzU3VwcG9ydGVkID0ge30uX19wcm90b19fID09PSBPYmplY3QucHJvdG90eXBlLFxuICAgICAgICBtYXBfbWFrZU9ic2VydmFibGU7XG5cbiAgICBpZiAocHJvdG9Jc1N1cHBvcnRlZCkge1xuICAgICAgICBtYXBfbWFrZU9ic2VydmFibGUgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB0aGlzLl9fcHJvdG9fXyA9IENoYW5nZURpc3BhdGNoTWFwO1xuICAgICAgICB9O1xuICAgIH0gZWxzZSB7XG4gICAgICAgIG1hcF9tYWtlT2JzZXJ2YWJsZSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0aWVzKHRoaXMsIG9ic2VydmFibGVTZXRQcm9wZXJ0aWVzKTtcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoTWFwLnByb3RvdHlwZSwgXCJtYWtlT2JzZXJ2YWJsZVwiLCB7XG4gICAgICAgIHZhbHVlOiBtYXBfbWFrZU9ic2VydmFibGUsXG4gICAgICAgIHdyaXRhYmxlOiB0cnVlLFxuICAgICAgICBjb25maWd1cmFibGU6IHRydWUsXG4gICAgICAgIGVudW1lcmFibGU6IGZhbHNlXG4gICAgfSk7XG5cbiAgICAvL1RoaXMgaXMgYSBuby1vcCB0ZXN0IGluIHByb3BlcnR5LWNoYW5nZXMuanMgLSBQcm9wZXJ0eUNoYW5nZXMucHJvdG90eXBlLm1ha2VQcm9wZXJ0eU9ic2VydmFibGUsIHNvIG1pZ2h0IGFzIHdlbGwgbm90IHBheSB0aGUgcHJpY2UgZXZlcnkgdGltZS4uLi5cbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoTWFwLnByb3RvdHlwZSwgXCJtYWtlUHJvcGVydHlPYnNlcnZhYmxlXCIsIHtcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uKCl7fSxcbiAgICAgICAgd3JpdGFibGU6IHRydWUsXG4gICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZSxcbiAgICAgICAgZW51bWVyYWJsZTogZmFsc2VcbiAgICB9KTtcblxuXG4gICAgTWFwLnByb3RvdHlwZS5jb25zdHJ1Y3RDbG9uZSA9IGZ1bmN0aW9uICh2YWx1ZXMpIHtcbiAgICAgICAgcmV0dXJuIG5ldyB0aGlzLmNvbnN0cnVjdG9yKHZhbHVlcyk7XG4gICAgfTtcblxuICAgIE1hcC5wcm90b3R5cGUuaXNNYXAgPSB0cnVlO1xuICAgIE1hcC5wcm90b3R5cGUuYWRkRWFjaCA9IGZ1bmN0aW9uICh2YWx1ZXMpIHtcbiAgICAgICAgaWYgKHZhbHVlcyAmJiBPYmplY3QodmFsdWVzKSA9PT0gdmFsdWVzKSB7XG4gICAgICAgICAgICBpZiAodHlwZW9mIHZhbHVlcy5mb3JFYWNoID09PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgICAgICAgICAgICAvLyBjb3B5IG1hcC1hbGlrZXNcbiAgICAgICAgICAgICAgICBpZiAodmFsdWVzLmlzTWFwID09PSB0cnVlKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhbHVlcy5mb3JFYWNoKGZ1bmN0aW9uICh2YWx1ZSwga2V5KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnNldChrZXksIHZhbHVlKTtcbiAgICAgICAgICAgICAgICAgICAgfSwgdGhpcyk7XG4gICAgICAgICAgICAgICAgLy8gaXRlcmF0ZSBrZXkgdmFsdWUgcGFpcnMgb2Ygb3RoZXIgaXRlcmFibGVzXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgdmFsdWVzLmZvckVhY2goZnVuY3Rpb24gKHBhaXIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuc2V0KHBhaXJbMF0sIHBhaXJbMV0pO1xuICAgICAgICAgICAgICAgICAgICB9LCB0aGlzKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2UgaWYgKHR5cGVvZiB2YWx1ZXMubGVuZ3RoID09PSBcIm51bWJlclwiKSB7XG4gICAgICAgICAgICAgICAgLy8gQXJyYXktbGlrZSBvYmplY3RzIHRoYXQgZG8gbm90IGltcGxlbWVudCBmb3JFYWNoLCBlcmdvLFxuICAgICAgICAgICAgICAgIC8vIEFyZ3VtZW50c1xuICAgICAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdmFsdWVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuYWRkKHZhbHVlc1tpXSwgaSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAvLyBjb3B5IG90aGVyIG9iamVjdHMgYXMgbWFwLWFsaWtlc1xuICAgICAgICAgICAgICAgIE9iamVjdC5rZXlzKHZhbHVlcykuZm9yRWFjaChmdW5jdGlvbiAoa2V5KSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc2V0KGtleSwgdmFsdWVzW2tleV0pO1xuICAgICAgICAgICAgICAgIH0sIHRoaXMpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2UgaWYgKHZhbHVlcyAmJiB0eXBlb2YgdmFsdWVzLmxlbmd0aCA9PT0gXCJudW1iZXJcIikge1xuICAgICAgICAgICAgLy8gU3RyaW5nXG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHZhbHVlcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgIHRoaXMuYWRkKHZhbHVlc1tpXSwgaSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfTtcblxuICAgIE1hcC5wcm90b3R5cGUuYWRkID0gZnVuY3Rpb24gKHZhbHVlLCBrZXkpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuc2V0KGtleSwgdmFsdWUpO1xuICAgIH07XG5cbiAgICBNYXAucHJvdG90eXBlLnJlZHVjZSA9IGZ1bmN0aW9uIChjYWxsYmFjaywgYmFzaXMgLyosIHRoaXNwKi8pIHtcbiAgICAgICAgdmFyIHRoaXNwID0gYXJndW1lbnRzWzJdO1xuICAgICAgICB0aGlzLmZvckVhY2goZnVuY3Rpb24odmFsdWUsIGtleSwgbWFwKSB7XG4gICAgICAgICAgICBiYXNpcyA9IGNhbGxiYWNrLmNhbGwodGhpc3AsIGJhc2lzLCB2YWx1ZSwga2V5LCB0aGlzKTtcbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiBiYXNpcztcbiAgICB9O1xuXG4gICAgTWFwLnByb3RvdHlwZS5yZWR1Y2VSaWdodCA9IGZ1bmN0aW9uIChjYWxsYmFjaywgYmFzaXMgLyosIHRoaXNwKi8pIHtcbiAgICAgICAgdmFyIHRoaXNwID0gYXJndW1lbnRzWzJdO1xuICAgICAgICB2YXIga2V5c0l0ZXJhdG9yID0gdGhpcy5rZXlzKCk7XG4gICAgICAgIHZhciBzaXplID0gdGhpcy5zaXplO1xuICAgICAgICB2YXIgcmV2ZXJzZU9yZGVyID0gbmV3IEFycmF5KHRoaXMuc2l6ZSk7XG4gICAgICAgIHZhciBhS2V5LCBpID0gMDtcbiAgICAgICAgd2hpbGUgKChhS2V5ID0ga2V5c0l0ZXJhdG9yLm5leHQoKS52YWx1ZSkpIHtcbiAgICAgICAgICAgIHJldmVyc2VPcmRlclstLXNpemVdID0gYUtleTtcbiAgICAgICAgfVxuICAgICAgICB3aGlsZSAoaSsrIDwgc2l6ZSkge1xuICAgICAgICAgICAgYmFzaXMgPSBjYWxsYmFjay5jYWxsKHRoaXNwLCBiYXNpcywgdGhpcy5nZXQocmV2ZXJzZU9yZGVyW2ldKSwgcmV2ZXJzZU9yZGVyW2ldLCB0aGlzKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gYmFzaXM7XG4gICAgfTtcblxuICAgIE1hcC5wcm90b3R5cGUuZXF1YWxzID0gZnVuY3Rpb24gKHRoYXQsIGVxdWFscykge1xuICAgICAgICBlcXVhbHMgPSBlcXVhbHMgfHwgT2JqZWN0LmVxdWFscztcbiAgICAgICAgaWYgKHRoaXMgPT09IHRoYXQpIHtcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9IGVsc2UgaWYgKHRoYXQgJiYgdHlwZW9mIHRoYXQuZXZlcnkgPT09IFwiZnVuY3Rpb25cIikge1xuICAgICAgICAgICAgcmV0dXJuIHRoYXQuc2l6ZSA9PT0gdGhpcy5zaXplICYmIHRoYXQuZXZlcnkoZnVuY3Rpb24gKHZhbHVlLCBrZXkpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZXF1YWxzKHRoaXMuZ2V0KGtleSksIHZhbHVlKTtcbiAgICAgICAgICAgIH0sIHRoaXMpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdmFyIGtleXMgPSBPYmplY3Qua2V5cyh0aGF0KTtcbiAgICAgICAgICAgIHJldHVybiBrZXlzLmxlbmd0aCA9PT0gdGhpcy5zaXplICYmIE9iamVjdC5rZXlzKHRoYXQpLmV2ZXJ5KGZ1bmN0aW9uIChrZXkpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZXF1YWxzKHRoaXMuZ2V0KGtleSksIHRoYXRba2V5XSk7XG4gICAgICAgICAgICB9LCB0aGlzKTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICB2YXIgX2tleXNBcnJheUZ1bmN0aW9uID0gZnVuY3Rpb24odmFsdWUsa2V5KSB7cmV0dXJuIGtleTt9O1xuICAgIE1hcC5wcm90b3R5cGUua2V5c0FycmF5ID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiB0aGlzLm1hcChfa2V5c0FycmF5RnVuY3Rpb24pO1xuICAgIH1cbiAgICB2YXIgX3ZhbHVlc0FycmF5RnVuY3Rpb24gPSBmdW5jdGlvbih2YWx1ZSxrZXkpIHtyZXR1cm4gdmFsdWU7fTtcbiAgICBNYXAucHJvdG90eXBlLnZhbHVlc0FycmF5ID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiB0aGlzLm1hcChfdmFsdWVzQXJyYXlGdW5jdGlvbik7XG4gICAgfVxuICAgIHZhciBfZW50cmllc0FycmF5RnVuY3Rpb24gPSBmdW5jdGlvbih2YWx1ZSxrZXkpIHtyZXR1cm4gW2tleSx2YWx1ZV07fTtcbiAgICBNYXAucHJvdG90eXBlLmVudHJpZXNBcnJheSA9IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5tYXAoX2VudHJpZXNBcnJheUZ1bmN0aW9uKTtcbiAgICB9XG4gICAgTWFwLnByb3RvdHlwZS50b0pTT04gPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmVudHJpZXNBcnJheSgpO1xuICAgIH07XG5cbiAgICAvLyBYWFggZGVwcmVjYXRlZFxuICAgIE1hcC5wcm90b3R5cGUuaXRlbXMgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmVudHJpZXNBcnJheSgpO1xuICAgIH07XG5cbiAgICAvLyBNYXAucHJvdG90eXBlLmNvbnRlbnRFcXVhbHMgPSBPYmplY3QuZXF1YWxzO1xuICAgIC8vIE1hcC5wcm90b3R5cGUuY29udGVudEhhc2ggPSBPYmplY3QuaGFzaDtcblxuXG4gICAgTWFwLmZyb20gPSBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgICAgdmFyIHJlc3VsdCA9IG5ldyB0aGlzO1xuICAgICAgICByZXN1bHQuYWRkRWFjaCh2YWx1ZSk7XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfTtcblxuXG4gICAgLy9CYWNrd2FyZCBjb21wYXRpYmlsaXR5OlxuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShNYXAucHJvdG90eXBlLFwibGVuZ3RoXCIse1xuICAgICAgICBnZXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuc2l6ZTtcbiAgICAgICAgfSxcbiAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgICAgY29uZmlndXJhYmxlOnRydWVcbiAgICB9KTtcblxuXG4gICAgdmFyIG1hcF9jbGVhciA9IE1hcC5wcm90b3R5cGUuY2xlYXIsXG4gICAgICAgIG1hcF9zZXQgPSBNYXAucHJvdG90eXBlLnNldCxcbiAgICAgICAgbWFwX2RlbGV0ZSA9IE1hcC5wcm90b3R5cGUuZGVsZXRlO1xuXG4gICAgdmFyIG9ic2VydmFibGVNYXBQcm9wZXJ0aWVzID0ge1xuICAgICAgICBjbGVhciA6IHtcbiAgICAgICAgICAgIHZhbHVlOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgdmFyIGtleXM7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuZGlzcGF0Y2hlc01hcENoYW5nZXMpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5mb3JFYWNoKGZ1bmN0aW9uICh2YWx1ZSwga2V5KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmRpc3BhdGNoQmVmb3JlTWFwQ2hhbmdlKGtleSwgdmFsdWUpO1xuICAgICAgICAgICAgICAgICAgICB9LCB0aGlzKTtcbiAgICAgICAgICAgICAgICAgICAga2V5cyA9IHRoaXMua2V5c0FycmF5KCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIG1hcF9jbGVhci5jYWxsKHRoaXMpO1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLmRpc3BhdGNoZXNNYXBDaGFuZ2VzKSB7XG4gICAgICAgICAgICAgICAgICAgIGtleXMuZm9yRWFjaChmdW5jdGlvbiAoa2V5KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmRpc3BhdGNoTWFwQ2hhbmdlKGtleSk7XG4gICAgICAgICAgICAgICAgICAgIH0sIHRoaXMpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB3cml0YWJsZTogdHJ1ZSxcbiAgICAgICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxuXG4gICAgICAgIH0sXG4gICAgICAgIHNldCA6IHtcbiAgICAgICAgICAgIHZhbHVlOiBmdW5jdGlvbiAoa2V5LCB2YWx1ZSkge1xuICAgICAgICAgICAgICAgIHZhciBmb3VuZCA9IHRoaXMuZ2V0KGtleSk7XG4gICAgICAgICAgICAgICAgaWYgKGZvdW5kKSB7IC8vIHVwZGF0ZVxuICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5kaXNwYXRjaGVzTWFwQ2hhbmdlcykge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5kaXNwYXRjaEJlZm9yZU1hcENoYW5nZShrZXksIGZvdW5kKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIG1hcF9zZXQuY2FsbCh0aGlzLGtleSwgdmFsdWUpO1xuXG4gICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLmRpc3BhdGNoZXNNYXBDaGFuZ2VzKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmRpc3BhdGNoTWFwQ2hhbmdlKGtleSwgdmFsdWUpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSBlbHNlIHsgLy8gY3JlYXRlXG4gICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLmRpc3BhdGNoZXNNYXBDaGFuZ2VzKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmRpc3BhdGNoQmVmb3JlTWFwQ2hhbmdlKGtleSwgdW5kZWZpbmVkKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIG1hcF9zZXQuY2FsbCh0aGlzLGtleSwgdmFsdWUpO1xuXG4gICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLmRpc3BhdGNoZXNNYXBDaGFuZ2VzKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmRpc3BhdGNoTWFwQ2hhbmdlKGtleSwgdmFsdWUpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHdyaXRhYmxlOiB0cnVlLFxuICAgICAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlXG4gICAgICAgIH0sXG5cbiAgICAgICAgXCJkZWxldGVcIjoge1xuICAgICAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIChrZXkpIHtcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5oYXMoa2V5KSkge1xuICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5kaXNwYXRjaGVzTWFwQ2hhbmdlcykge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5kaXNwYXRjaEJlZm9yZU1hcENoYW5nZShrZXksIHRoaXMuZ2V0KGtleSkpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIG1hcF9kZWxldGUuY2FsbCh0aGlzLGtleSk7XG5cbiAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMuZGlzcGF0Y2hlc01hcENoYW5nZXMpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuZGlzcGF0Y2hNYXBDaGFuZ2Uoa2V5LCB1bmRlZmluZWQpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9O1xuXG5cblxuICAgIE9iamVjdC5hZGRFYWNoKE1hcC5wcm90b3R5cGUsIEdlbmVyaWNDb2xsZWN0aW9uLnByb3RvdHlwZSwgZmFsc2UpO1xuXG4gICAgdmFyIENoYW5nZURpc3BhdGNoTWFwID0gT2JqZWN0LmNyZWF0ZShNYXAucHJvdG90eXBlLCBvYnNlcnZhYmxlTWFwUHJvcGVydGllcyk7XG59XG5cbiAgICB2YXIgU2V0ID0gcmVxdWlyZShcIi4vX3NldFwiKS5Db2xsZWN0aW9uc1NldDtcbiAgICB2YXIgR2VuZXJpY01hcCA9IHJlcXVpcmUoXCIuL2dlbmVyaWMtbWFwXCIpO1xuXG4gICAgQ29sbGVjdGlvbnNNYXAgPSBNYXAgPSBmdW5jdGlvbiBNYXAodmFsdWVzLCBlcXVhbHMsIGhhc2gsIGdldERlZmF1bHQpIHtcbiAgICAgICAgaWYgKCEodGhpcyBpbnN0YW5jZW9mIE1hcCkpIHtcbiAgICAgICAgICAgIHJldHVybiBuZXcgTWFwKHZhbHVlcywgZXF1YWxzLCBoYXNoLCBnZXREZWZhdWx0KTtcbiAgICAgICAgfVxuICAgICAgICBlcXVhbHMgPSBlcXVhbHMgfHwgT2JqZWN0LmVxdWFscztcbiAgICAgICAgaGFzaCA9IGhhc2ggfHwgT2JqZWN0Lmhhc2g7XG4gICAgICAgIGdldERlZmF1bHQgPSBnZXREZWZhdWx0IHx8IEZ1bmN0aW9uLm5vb3A7XG4gICAgICAgIHRoaXMuY29udGVudEVxdWFscyA9IGVxdWFscztcbiAgICAgICAgdGhpcy5jb250ZW50SGFzaCA9IGhhc2g7XG4gICAgICAgIHRoaXMuZ2V0RGVmYXVsdCA9IGdldERlZmF1bHQ7XG4gICAgICAgIHRoaXMuc3RvcmUgPSBuZXcgU2V0KFxuICAgICAgICAgICAgdW5kZWZpbmVkLFxuICAgICAgICAgICAgZnVuY3Rpb24ga2V5c0VxdWFsKGEsIGIpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZXF1YWxzKGEua2V5LCBiLmtleSk7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgZnVuY3Rpb24ga2V5SGFzaChpdGVtKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGhhc2goaXRlbS5rZXkpO1xuICAgICAgICAgICAgfVxuICAgICAgICApO1xuICAgICAgICB0aGlzLmxlbmd0aCA9IDA7XG4gICAgICAgIHRoaXMuYWRkRWFjaCh2YWx1ZXMpO1xuICAgIH1cblxuICAgIE1hcC5NYXAgPSBNYXA7IC8vIGhhY2sgc28gcmVxdWlyZShcIm1hcFwiKS5NYXAgd2lsbCB3b3JrIGluIE1vbnRhZ2VKU1xuXG4gICAgT2JqZWN0LmFkZEVhY2goTWFwLnByb3RvdHlwZSwgR2VuZXJpY0NvbGxlY3Rpb24ucHJvdG90eXBlKTtcbiAgICBPYmplY3QuYWRkRWFjaChNYXAucHJvdG90eXBlLCBHZW5lcmljTWFwLnByb3RvdHlwZSk7IC8vIG92ZXJyaWRlcyBHZW5lcmljQ29sbGVjdGlvblxuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShNYXAucHJvdG90eXBlLFwic2l6ZVwiLEdlbmVyaWNDb2xsZWN0aW9uLl9zaXplUHJvcGVydHlEZXNjcmlwdG9yKTtcblxuICAgIE1hcC5mcm9tID0gR2VuZXJpY0NvbGxlY3Rpb24uZnJvbTtcblxuICAgIE1hcC5wcm90b3R5cGUuY29uc3RydWN0Q2xvbmUgPSBmdW5jdGlvbiAodmFsdWVzKSB7XG4gICAgICAgIHJldHVybiBuZXcgdGhpcy5jb25zdHJ1Y3RvcihcbiAgICAgICAgICAgIHZhbHVlcyxcbiAgICAgICAgICAgIHRoaXMuY29udGVudEVxdWFscyxcbiAgICAgICAgICAgIHRoaXMuY29udGVudEhhc2gsXG4gICAgICAgICAgICB0aGlzLmdldERlZmF1bHRcbiAgICAgICAgKTtcbiAgICB9O1xuXG4gICAgTWFwLnByb3RvdHlwZS5sb2cgPSBmdW5jdGlvbiAoY2hhcm1hcCwgbG9nTm9kZSwgY2FsbGJhY2ssIHRoaXNwKSB7XG4gICAgICAgIGxvZ05vZGUgPSBsb2dOb2RlIHx8IHRoaXMubG9nTm9kZTtcbiAgICAgICAgdGhpcy5zdG9yZS5sb2coY2hhcm1hcCwgZnVuY3Rpb24gKG5vZGUsIGxvZywgbG9nQmVmb3JlKSB7XG4gICAgICAgICAgICBsb2dOb2RlKG5vZGUudmFsdWUudmFsdWUsIGxvZywgbG9nQmVmb3JlKTtcbiAgICAgICAgfSwgY2FsbGJhY2ssIHRoaXNwKTtcbiAgICB9O1xuXG4gICAgTWFwLnByb3RvdHlwZS5sb2dOb2RlID0gZnVuY3Rpb24gKG5vZGUsIGxvZykge1xuICAgICAgICBsb2coJyBrZXk6ICcgKyBub2RlLmtleSk7XG4gICAgICAgIGxvZygnIHZhbHVlOiAnICsgbm9kZS52YWx1ZSk7XG4gICAgfTtcblxuICAgIGlmKCFHbG9iYWxNYXApIHtcbiAgICAgICAgbW9kdWxlLmV4cG9ydHMgPSBDb2xsZWN0aW9uc01hcDtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAgIG1vZHVsZS5leHBvcnRzID0gR2xvYmFsTWFwO1xuICAgICAgICBHbG9iYWxNYXAuQ29sbGVjdGlvbnNNYXAgPSBDb2xsZWN0aW9uc01hcDtcbiAgICB9XG4iLCJcInVzZSBzdHJpY3RcIjtcblxudmFyIFNoaW0gPSByZXF1aXJlKFwiLi9zaGltXCIpO1xudmFyIEdlbmVyaWNDb2xsZWN0aW9uID0gcmVxdWlyZShcIi4vZ2VuZXJpYy1jb2xsZWN0aW9uXCIpO1xudmFyIEdlbmVyaWNTZXQgPSByZXF1aXJlKFwiLi9nZW5lcmljLXNldFwiKTtcbnZhciBTZXQsIEdsb2JhbFNldCwgQ29sbGVjdGlvbnNTZXQ7XG5cblxuaWYoKGdsb2JhbC5TZXQgIT09IHZvaWQgMCkgJiYgKHR5cGVvZiBnbG9iYWwuU2V0LnByb3RvdHlwZS52YWx1ZXMgPT09IFwiZnVuY3Rpb25cIikpIHtcblxuICAgIEdsb2JhbFNldCA9IG1vZHVsZS5leHBvcnRzID0gZ2xvYmFsLlNldDtcbiAgICBHbG9iYWxTZXQuU2V0ID0gR2xvYmFsU2V0OyAvLyBoYWNrIHNvIHJlcXVpcmUoXCJzZXRcIikuU2V0IHdpbGwgd29yayBpbiBNb250YWdlSlNcblxuICAgIEdsb2JhbFNldC5wcm90b3R5cGUucmVkdWNlID0gZnVuY3Rpb24gKGNhbGxiYWNrLCBiYXNpcyAvKiwgdGhpc3AqLykge1xuICAgICAgICB2YXIgdGhpc3AgPSBhcmd1bWVudHNbMl07XG4gICAgICAgIHRoaXMuZm9yRWFjaChmdW5jdGlvbih2YWx1ZSkge1xuICAgICAgICAgICAgYmFzaXMgPSBjYWxsYmFjay5jYWxsKHRoaXNwLCBiYXNpcywgdmFsdWUsIHRoaXMpO1xuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuIGJhc2lzO1xuICAgIH07XG5cbiAgICBHbG9iYWxTZXQucHJvdG90eXBlLnJlZHVjZVJpZ2h0ID0gZnVuY3Rpb24gKGNhbGxiYWNrLCBiYXNpcyAvKiwgdGhpc3AqLykge1xuICAgICAgICB2YXIgdGhpc3AgPSBhcmd1bWVudHNbMl07XG4gICAgICAgIHZhciBzZXRJdGVyYXRvciA9IHRoaXMudmFsdWVzKCk7XG4gICAgICAgIHZhciBzaXplID0gdGhpcy5zaXplO1xuICAgICAgICB2YXIgcmV2ZXJzZU9yZGVyID0gbmV3IEFycmF5KHRoaXMuc2l6ZSk7XG4gICAgICAgIHZhciB2YWx1ZSwgaSA9IDA7XG4gICAgICAgIHdoaWxlICgodmFsdWUgPSBzZXRJdGVyYXRvci5uZXh0KCkudmFsdWUpKSB7XG4gICAgICAgICAgICByZXZlcnNlT3JkZXJbLS1zaXplXSA9IHZhbHVlO1xuICAgICAgICB9XG4gICAgICAgIHdoaWxlIChpKysgPCBzaXplKSB7XG4gICAgICAgICAgICBiYXNpcyA9IGNhbGxiYWNrLmNhbGwodGhpc3AsIGJhc2lzLCB2YWx1ZSwgdGhpcyk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGJhc2lzO1xuICAgIH07XG5cbiAgICBHbG9iYWxTZXQucHJvdG90eXBlLmVxdWFscyA9IGZ1bmN0aW9uICh0aGF0LCBlcXVhbHMpIHtcbiAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgdGhhdCAmJiB0eXBlb2YgdGhhdC5yZWR1Y2UgPT09IFwiZnVuY3Rpb25cIiAmJlxuICAgICAgICAgICAgdGhpcy5zaXplID09PSAodGhhdC5zaXplIHx8IHRoYXQubGVuZ3RoKSAmJlxuICAgICAgICAgICAgdGhhdC5yZWR1Y2UoZnVuY3Rpb24gKGVxdWFsLCB2YWx1ZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBlcXVhbCAmJiBzZWxmLmhhcyh2YWx1ZSwgZXF1YWxzKTtcbiAgICAgICAgICAgIH0sIHRydWUpXG4gICAgICAgICk7XG4gICAgfTtcblxuICAgIEdsb2JhbFNldC5wcm90b3R5cGUuY29uc3RydWN0Q2xvbmUgPSBmdW5jdGlvbiAodmFsdWVzKSB7XG4gICAgICAgIHJldHVybiBuZXcgdGhpcy5jb25zdHJ1Y3Rvcih2YWx1ZXMsIHRoaXMuY29udGVudEVxdWFscywgdGhpcy5jb250ZW50SGFzaCwgdGhpcy5nZXREZWZhdWx0KTtcbiAgICB9O1xuXG4gICAgR2xvYmFsU2V0LnByb3RvdHlwZS50b0pTT04gPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmVudHJpZXNBcnJheSgpO1xuICAgIH07XG5cbiAgICBHbG9iYWxTZXQucHJvdG90eXBlLm9uZSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgaWYgKHRoaXMuc2l6ZSA+IDApIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnZhbHVlcygpLm5leHQoKS52YWx1ZTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgIH07XG5cbiAgICBHbG9iYWxTZXQucHJvdG90eXBlLnBvcCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgaWYgKHRoaXMuc2l6ZSkge1xuICAgICAgICAgICAgdmFyIHNldEl0ZXJhdG9yID0gdGhpcy52YWx1ZXMoKSwgYVZhbHVlLCB2YWx1ZTtcbiAgICAgICAgICAgIHdoaWxlKGFWYWx1ZSA9IHNldEl0ZXJhdG9yLm5leHQoKS52YWx1ZSkge1xuICAgICAgICAgICAgICAgIHZhbHVlID0gYVZhbHVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpc1tcImRlbGV0ZVwiXSh2YWx1ZSx0aGlzLnNpemUtMSk7XG4gICAgICAgICAgICByZXR1cm4gdmFsdWU7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgR2xvYmFsU2V0LnByb3RvdHlwZS5zaGlmdCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgaWYgKHRoaXMuc2l6ZSkge1xuICAgICAgICAgICAgdmFyIGZpcnN0VmFsdWUgPSB0aGlzLnZhbHVlcygpLm5leHQoKS52YWx1ZTtcbiAgICAgICAgICAgIHRoaXNbXCJkZWxldGVcIl0oZmlyc3RWYWx1ZSwwKTtcbiAgICAgICAgICAgIHJldHVybiBmaXJzdFZhbHVlO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIC8vQmFja3dhcmQgY29tcGF0aWJpbGl0eTpcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoR2xvYmFsU2V0LnByb3RvdHlwZSxcImxlbmd0aFwiLHtcbiAgICAgICAgZ2V0OiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnNpemU7XG4gICAgICAgIH0sXG4gICAgICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgICAgIGNvbmZpZ3VyYWJsZTp0cnVlXG4gICAgfSk7XG5cbiAgICBHbG9iYWxTZXQuZnJvbSA9IGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgICB2YXIgcmVzdWx0ID0gKG5ldyB0aGlzKTtcbiAgICAgICAgcmVzdWx0LmFkZEVhY2godmFsdWUpO1xuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH07XG5cbiAgICBPYmplY3QuYWRkRWFjaChHbG9iYWxTZXQucHJvdG90eXBlLCBHZW5lcmljQ29sbGVjdGlvbi5wcm90b3R5cGUsIGZhbHNlKTtcbiAgICBPYmplY3QuYWRkRWFjaChHbG9iYWxTZXQucHJvdG90eXBlLCBHZW5lcmljU2V0LnByb3RvdHlwZSwgZmFsc2UpO1xuXG59XG5cblxuXG4gICAgdmFyIExpc3QgPSByZXF1aXJlKFwiLi9fbGlzdFwiKTtcbiAgICB2YXIgRmFzdFNldCA9IHJlcXVpcmUoXCIuL19mYXN0LXNldFwiKTtcbiAgICB2YXIgSXRlcmF0b3IgPSByZXF1aXJlKFwiLi9pdGVyYXRvclwiKTtcblxuICAgIENvbGxlY3Rpb25zU2V0ID0gZnVuY3Rpb24gQ29sbGVjdGlvbnNTZXQodmFsdWVzLCBlcXVhbHMsIGhhc2gsIGdldERlZmF1bHQpIHtcbiAgICAgICAgcmV0dXJuIENvbGxlY3Rpb25zU2V0Ll9pbml0KENvbGxlY3Rpb25zU2V0LCB0aGlzLCB2YWx1ZXMsIGVxdWFscywgaGFzaCwgZ2V0RGVmYXVsdCk7XG4gICAgfVxuXG4gICAgQ29sbGVjdGlvbnNTZXQuX2luaXQgPSBmdW5jdGlvbiAoY29uc3RydWN0b3IsIG9iamVjdCwgdmFsdWVzLCBlcXVhbHMsIGhhc2gsIGdldERlZmF1bHQpIHtcbiAgICAgICAgaWYgKCEob2JqZWN0IGluc3RhbmNlb2YgY29uc3RydWN0b3IpKSB7XG4gICAgICAgICAgICByZXR1cm4gbmV3IGNvbnN0cnVjdG9yKHZhbHVlcywgZXF1YWxzLCBoYXNoLCBnZXREZWZhdWx0KTtcbiAgICAgICAgfVxuICAgICAgICBlcXVhbHMgPSBlcXVhbHMgfHwgT2JqZWN0LmVxdWFscztcbiAgICAgICAgaGFzaCA9IGhhc2ggfHwgT2JqZWN0Lmhhc2g7XG4gICAgICAgIGdldERlZmF1bHQgPSBnZXREZWZhdWx0IHx8IEZ1bmN0aW9uLm5vb3A7XG4gICAgICAgIG9iamVjdC5jb250ZW50RXF1YWxzID0gZXF1YWxzO1xuICAgICAgICBvYmplY3QuY29udGVudEhhc2ggPSBoYXNoO1xuICAgICAgICBvYmplY3QuZ2V0RGVmYXVsdCA9IGdldERlZmF1bHQ7XG4gICAgICAgIC8vIGEgbGlzdCBvZiB2YWx1ZXMgaW4gaW5zZXJ0aW9uIG9yZGVyLCB1c2VkIGZvciBhbGwgb3BlcmF0aW9ucyB0aGF0IGRlcGVuZFxuICAgICAgICAvLyBvbiBpdGVyYXRpbmcgaW4gaW5zZXJ0aW9uIG9yZGVyXG4gICAgICAgIG9iamVjdC5vcmRlciA9IG5ldyBvYmplY3QuT3JkZXIodW5kZWZpbmVkLCBlcXVhbHMpO1xuICAgICAgICAvLyBhIHNldCBvZiBub2RlcyBmcm9tIHRoZSBvcmRlciBsaXN0LCBpbmRleGVkIGJ5IHRoZSBjb3JyZXNwb25kaW5nIHZhbHVlLFxuICAgICAgICAvLyB1c2VkIGZvciBhbGwgb3BlcmF0aW9ucyB0aGF0IG5lZWQgdG8gcXVpY2tseSBzZWVrICB2YWx1ZSBpbiB0aGUgbGlzdFxuICAgICAgICBvYmplY3Quc3RvcmUgPSBuZXcgb2JqZWN0LlN0b3JlKFxuICAgICAgICAgICAgdW5kZWZpbmVkLFxuICAgICAgICAgICAgZnVuY3Rpb24gKGEsIGIpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZXF1YWxzKGEudmFsdWUsIGIudmFsdWUpO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGZ1bmN0aW9uIChub2RlKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGhhc2gobm9kZS52YWx1ZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICk7XG4gICAgICAgIG9iamVjdC5sZW5ndGggPSAwO1xuICAgICAgICBvYmplY3QuYWRkRWFjaCh2YWx1ZXMpO1xuXG4gICAgfVxuXG4gICAgQ29sbGVjdGlvbnNTZXQuU2V0ID0gQ29sbGVjdGlvbnNTZXQ7IC8vIGhhY2sgc28gcmVxdWlyZShcInNldFwiKS5TZXQgd2lsbCB3b3JrIGluIE1vbnRhZ2VKU1xuICAgIENvbGxlY3Rpb25zU2V0LkNvbGxlY3Rpb25zU2V0ID0gQ29sbGVjdGlvbnNTZXQ7XG5cbiAgICBPYmplY3QuYWRkRWFjaChDb2xsZWN0aW9uc1NldC5wcm90b3R5cGUsIEdlbmVyaWNDb2xsZWN0aW9uLnByb3RvdHlwZSk7XG4gICAgT2JqZWN0LmFkZEVhY2goQ29sbGVjdGlvbnNTZXQucHJvdG90eXBlLCBHZW5lcmljU2V0LnByb3RvdHlwZSk7XG5cbiAgICBDb2xsZWN0aW9uc1NldC5mcm9tID0gR2VuZXJpY0NvbGxlY3Rpb24uZnJvbTtcblxuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShDb2xsZWN0aW9uc1NldC5wcm90b3R5cGUsXCJzaXplXCIsR2VuZXJpY0NvbGxlY3Rpb24uX3NpemVQcm9wZXJ0eURlc2NyaXB0b3IpO1xuXG4gICAgLy9PdmVycmlkZXMgZm9yIGNvbnNpc3RlbmN5OlxuICAgIC8vIFNldC5wcm90b3R5cGUuZm9yRWFjaCA9IEdlbmVyaWNDb2xsZWN0aW9uLnByb3RvdHlwZS5mb3JFYWNoO1xuXG5cbiAgICBDb2xsZWN0aW9uc1NldC5wcm90b3R5cGUuT3JkZXIgPSBMaXN0O1xuICAgIENvbGxlY3Rpb25zU2V0LnByb3RvdHlwZS5TdG9yZSA9IEZhc3RTZXQ7XG5cbiAgICBDb2xsZWN0aW9uc1NldC5wcm90b3R5cGUuY29uc3RydWN0Q2xvbmUgPSBmdW5jdGlvbiAodmFsdWVzKSB7XG4gICAgICAgIHJldHVybiBuZXcgdGhpcy5jb25zdHJ1Y3Rvcih2YWx1ZXMsIHRoaXMuY29udGVudEVxdWFscywgdGhpcy5jb250ZW50SGFzaCwgdGhpcy5nZXREZWZhdWx0KTtcbiAgICB9O1xuXG4gICAgQ29sbGVjdGlvbnNTZXQucHJvdG90eXBlLmhhcyA9IGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgICB2YXIgbm9kZSA9IG5ldyB0aGlzLm9yZGVyLk5vZGUodmFsdWUpO1xuICAgICAgICByZXR1cm4gdGhpcy5zdG9yZS5oYXMobm9kZSk7XG4gICAgfTtcblxuICAgIENvbGxlY3Rpb25zU2V0LnByb3RvdHlwZS5nZXQgPSBmdW5jdGlvbiAodmFsdWUsIGVxdWFscykge1xuICAgICAgICBpZiAoZXF1YWxzKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJTZXQjZ2V0IGRvZXMgbm90IHN1cHBvcnQgc2Vjb25kIGFyZ3VtZW50OiBlcXVhbHNcIik7XG4gICAgICAgIH1cbiAgICAgICAgdmFyIG5vZGUgPSBuZXcgdGhpcy5vcmRlci5Ob2RlKHZhbHVlKTtcbiAgICAgICAgbm9kZSA9IHRoaXMuc3RvcmUuZ2V0KG5vZGUpO1xuICAgICAgICBpZiAobm9kZSkge1xuICAgICAgICAgICAgcmV0dXJuIG5vZGUudmFsdWU7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5nZXREZWZhdWx0KHZhbHVlKTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICBDb2xsZWN0aW9uc1NldC5wcm90b3R5cGUuYWRkID0gZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICAgIHZhciBub2RlID0gbmV3IHRoaXMub3JkZXIuTm9kZSh2YWx1ZSk7XG4gICAgICAgIGlmICghdGhpcy5zdG9yZS5oYXMobm9kZSkpIHtcbiAgICAgICAgICAgIHZhciBpbmRleCA9IHRoaXMubGVuZ3RoO1xuICAgICAgICAgICAgdGhpcy5vcmRlci5hZGQodmFsdWUpO1xuICAgICAgICAgICAgbm9kZSA9IHRoaXMub3JkZXIuaGVhZC5wcmV2O1xuICAgICAgICAgICAgdGhpcy5zdG9yZS5hZGQobm9kZSk7XG4gICAgICAgICAgICB0aGlzLmxlbmd0aCsrO1xuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH07XG5cbiAgICBDb2xsZWN0aW9uc1NldC5wcm90b3R5cGVbXCJkZWxldGVcIl0gPSBmdW5jdGlvbiAodmFsdWUsIGVxdWFscykge1xuICAgICAgICBpZiAoZXF1YWxzKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJTZXQjZGVsZXRlIGRvZXMgbm90IHN1cHBvcnQgc2Vjb25kIGFyZ3VtZW50OiBlcXVhbHNcIik7XG4gICAgICAgIH1cbiAgICAgICAgdmFyIG5vZGUgPSBuZXcgdGhpcy5vcmRlci5Ob2RlKHZhbHVlKTtcbiAgICAgICAgaWYgKHRoaXMuc3RvcmUuaGFzKG5vZGUpKSB7XG4gICAgICAgICAgICBub2RlID0gdGhpcy5zdG9yZS5nZXQobm9kZSk7XG4gICAgICAgICAgICB0aGlzLnN0b3JlW1wiZGVsZXRlXCJdKG5vZGUpOyAvLyByZW1vdmVzIGZyb20gdGhlIHNldFxuICAgICAgICAgICAgdGhpcy5vcmRlci5zcGxpY2Uobm9kZSwgMSk7IC8vIHJlbW92ZXMgdGhlIG5vZGUgZnJvbSB0aGUgbGlzdFxuICAgICAgICAgICAgdGhpcy5sZW5ndGgtLTtcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9O1xuXG4gICAgQ29sbGVjdGlvbnNTZXQucHJvdG90eXBlLnBvcCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgaWYgKHRoaXMubGVuZ3RoKSB7XG4gICAgICAgICAgICB2YXIgcmVzdWx0ID0gdGhpcy5vcmRlci5oZWFkLnByZXYudmFsdWU7XG4gICAgICAgICAgICB0aGlzW1wiZGVsZXRlXCJdKHJlc3VsdCk7XG4gICAgICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIENvbGxlY3Rpb25zU2V0LnByb3RvdHlwZS5zaGlmdCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgaWYgKHRoaXMubGVuZ3RoKSB7XG4gICAgICAgICAgICB2YXIgcmVzdWx0ID0gdGhpcy5vcmRlci5oZWFkLm5leHQudmFsdWU7XG4gICAgICAgICAgICB0aGlzW1wiZGVsZXRlXCJdKHJlc3VsdCk7XG4gICAgICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIENvbGxlY3Rpb25zU2V0LnByb3RvdHlwZS5vbmUgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIGlmICh0aGlzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnN0b3JlLm9uZSgpLnZhbHVlO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIENvbGxlY3Rpb25zU2V0LnByb3RvdHlwZS5jbGVhciA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdGhpcy5zdG9yZS5jbGVhcigpO1xuICAgICAgICB0aGlzLm9yZGVyLmNsZWFyKCk7XG4gICAgICAgIHRoaXMubGVuZ3RoID0gMDtcbiAgICB9O1xuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShDb2xsZWN0aW9uc1NldC5wcm90b3R5cGUsXCJfY2xlYXJcIiwge1xuICAgICAgICB2YWx1ZTogQ29sbGVjdGlvbnNTZXQucHJvdG90eXBlLmNsZWFyXG4gICAgfSk7XG5cbiAgICBDb2xsZWN0aW9uc1NldC5wcm90b3R5cGUucmVkdWNlID0gZnVuY3Rpb24gKGNhbGxiYWNrLCBiYXNpcyAvKiwgdGhpc3AqLykge1xuICAgICAgICB2YXIgdGhpc3AgPSBhcmd1bWVudHNbMl07XG4gICAgICAgIHZhciBsaXN0ID0gdGhpcy5vcmRlcjtcbiAgICAgICAgdmFyIGluZGV4ID0gMDtcbiAgICAgICAgcmV0dXJuIGxpc3QucmVkdWNlKGZ1bmN0aW9uIChiYXNpcywgdmFsdWUpIHtcbiAgICAgICAgICAgIHJldHVybiBjYWxsYmFjay5jYWxsKHRoaXNwLCBiYXNpcywgdmFsdWUsIGluZGV4KyssIHRoaXMpO1xuICAgICAgICB9LCBiYXNpcywgdGhpcyk7XG4gICAgfTtcblxuICAgIENvbGxlY3Rpb25zU2V0LnByb3RvdHlwZS5yZWR1Y2VSaWdodCA9IGZ1bmN0aW9uIChjYWxsYmFjaywgYmFzaXMgLyosIHRoaXNwKi8pIHtcbiAgICAgICAgdmFyIHRoaXNwID0gYXJndW1lbnRzWzJdO1xuICAgICAgICB2YXIgbGlzdCA9IHRoaXMub3JkZXI7XG4gICAgICAgIHZhciBpbmRleCA9IHRoaXMubGVuZ3RoIC0gMTtcbiAgICAgICAgcmV0dXJuIGxpc3QucmVkdWNlUmlnaHQoZnVuY3Rpb24gKGJhc2lzLCB2YWx1ZSkge1xuICAgICAgICAgICAgcmV0dXJuIGNhbGxiYWNrLmNhbGwodGhpc3AsIGJhc2lzLCB2YWx1ZSwgaW5kZXgtLSwgdGhpcyk7XG4gICAgICAgIH0sIGJhc2lzLCB0aGlzKTtcbiAgICB9O1xuXG4gICAgQ29sbGVjdGlvbnNTZXQucHJvdG90eXBlLml0ZXJhdGUgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLm9yZGVyLml0ZXJhdGUoKTtcbiAgICB9O1xuXG4gICAgQ29sbGVjdGlvbnNTZXQucHJvdG90eXBlLnZhbHVlcyA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBJdGVyYXRvcih0aGlzKTtcbiAgICB9O1xuXG4gICAgQ29sbGVjdGlvbnNTZXQucHJvdG90eXBlLmxvZyA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdmFyIHNldCA9IHRoaXMuc3RvcmU7XG4gICAgICAgIHJldHVybiBzZXQubG9nLmFwcGx5KHNldCwgYXJndW1lbnRzKTtcbiAgICB9O1xuXG5cblxuaWYoIUdsb2JhbFNldCkge1xuICAgIG1vZHVsZS5leHBvcnRzID0gQ29sbGVjdGlvbnNTZXQ7XG59XG5lbHNlIHtcbiAgICBHbG9iYWxTZXQucHJvdG90eXBlLnZhbHVlc0FycmF5ID0gR2VuZXJpY1NldC5wcm90b3R5cGUudmFsdWVzQXJyYXk7XG4gICAgR2xvYmFsU2V0LnByb3RvdHlwZS5lbnRyaWVzQXJyYXkgPSBHZW5lcmljU2V0LnByb3RvdHlwZS5lbnRyaWVzQXJyYXk7XG4gICAgbW9kdWxlLmV4cG9ydHMgPSBHbG9iYWxTZXQ7XG4gICAgR2xvYmFsU2V0LkNvbGxlY3Rpb25zU2V0ID0gQ29sbGVjdGlvbnNTZXQ7XG59XG4iLCJcInVzZSBzdHJpY3RcIjtcblxubW9kdWxlLmV4cG9ydHMgPSBHZW5lcmljQ29sbGVjdGlvbjtcbmZ1bmN0aW9uIEdlbmVyaWNDb2xsZWN0aW9uKCkge1xuICAgIHRocm93IG5ldyBFcnJvcihcIkNhbid0IGNvbnN0cnVjdC4gR2VuZXJpY0NvbGxlY3Rpb24gaXMgYSBtaXhpbi5cIik7XG59XG5cbnZhciBET01Ub2tlbkxpc3QgPSBnbG9iYWwuRE9NVG9rZW5MaXN0IHx8IGZ1bmN0aW9uKCl7fTtcblxuR2VuZXJpY0NvbGxlY3Rpb24uRW1wdHlBcnJheSA9IE9iamVjdC5mcmVlemUoW10pO1xuXG4vKiBUT0RPOiBvcHRpbWl6ZSBmb3IgRE9NVG9rZW5MaXN0IGFuZCBBcnJheSB0byB1c2UgZm9yKCkgaW5zdGVhZCBvZiBmb3JFYWNoICovXG5HZW5lcmljQ29sbGVjdGlvbi5wcm90b3R5cGUuYWRkRWFjaCA9IGZ1bmN0aW9uICh2YWx1ZXMpIHtcbiAgICAvL1dlIHdhbnQgdG8gZWxpbWluYXRlIGV2ZXJ5dGhpbmcgYnV0IGFycmF5IGxpa2U6IFN0cmluZ3MsIEFycmF5cywgRE9NVG9rZW5MaXN0XG4gICAgaWYodmFsdWVzICYmICh2YWx1ZXMgaW5zdGFuY2VvZiBBcnJheSB8fCAodmFsdWVzIGluc3RhbmNlb2YgRE9NVG9rZW5MaXN0KSB8fCB2YWx1ZXMgaW5zdGFuY2VvZiBTdHJpbmcpKSB7XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdmFsdWVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICB0aGlzLmFkZCh2YWx1ZXNbaV0sIGkpO1xuICAgICAgICB9XG4gICAgfVxuICAgIGVsc2UgaWYgKHZhbHVlcyAmJiBPYmplY3QodmFsdWVzKSA9PT0gdmFsdWVzKSB7XG4gICAgICAgIGlmICh0eXBlb2YgdmFsdWVzLmZvckVhY2ggPT09IFwiZnVuY3Rpb25cIikge1xuICAgICAgICAgICAgdmFsdWVzLmZvckVhY2godGhpcy5hZGQsIHRoaXMpO1xuICAgICAgICB9IGVsc2UgaWYgKHR5cGVvZiB2YWx1ZXMubGVuZ3RoID09PSBcIm51bWJlclwiKSB7XG4gICAgICAgICAgICAvLyBBcnJheS1saWtlIG9iamVjdHMgdGhhdCBkbyBub3QgaW1wbGVtZW50IGZvckVhY2gsIGVyZ28sXG4gICAgICAgICAgICAvLyBBcmd1bWVudHNcbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdmFsdWVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5hZGQodmFsdWVzW2ldLCBpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIE9iamVjdC5rZXlzKHZhbHVlcykuZm9yRWFjaChmdW5jdGlvbiAoa2V5KSB7XG4gICAgICAgICAgICAgICAgdGhpcy5hZGQodmFsdWVzW2tleV0sIGtleSk7XG4gICAgICAgICAgICB9LCB0aGlzKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gdGhpcztcbn07XG5cbi8vIFRoaXMgaXMgc3VmZmljaWVudGx5IGdlbmVyaWMgZm9yIE1hcCAoc2luY2UgdGhlIHZhbHVlIG1heSBiZSBhIGtleSlcbi8vIGFuZCBvcmRlcmVkIGNvbGxlY3Rpb25zIChzaW5jZSBpdCBmb3J3YXJkcyB0aGUgZXF1YWxzIGFyZ3VtZW50KVxuR2VuZXJpY0NvbGxlY3Rpb24ucHJvdG90eXBlLmRlbGV0ZUVhY2ggPSBmdW5jdGlvbiAodmFsdWVzLCBlcXVhbHMpIHtcbiAgICB2YWx1ZXMuZm9yRWFjaChmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgICAgdGhpc1tcImRlbGV0ZVwiXSh2YWx1ZSwgZXF1YWxzKTtcbiAgICB9LCB0aGlzKTtcbiAgICByZXR1cm4gdGhpcztcbn07XG5cbi8vIGFsbCBvZiB0aGUgZm9sbG93aW5nIGZ1bmN0aW9ucyBhcmUgaW1wbGVtZW50ZWQgaW4gdGVybXMgb2YgXCJyZWR1Y2VcIi5cbi8vIHNvbWUgbmVlZCBcImNvbnN0cnVjdENsb25lXCIuXG5cbkdlbmVyaWNDb2xsZWN0aW9uLnByb3RvdHlwZS5mb3JFYWNoID0gZnVuY3Rpb24gKGNhbGxiYWNrIC8qLCB0aGlzcCovKSB7XG4gICAgdmFyIHRoaXNwID0gYXJndW1lbnRzWzFdO1xuICAgIHJldHVybiB0aGlzLnJlZHVjZShmdW5jdGlvbiAodW5kZWZpbmVkLCB2YWx1ZSwga2V5LCBvYmplY3QsIGRlcHRoKSB7XG4gICAgICAgIGNhbGxiYWNrLmNhbGwodGhpc3AsIHZhbHVlLCBrZXksIG9iamVjdCwgZGVwdGgpO1xuICAgIH0sIHVuZGVmaW5lZCk7XG59O1xuXG5HZW5lcmljQ29sbGVjdGlvbi5wcm90b3R5cGUubWFwID0gZnVuY3Rpb24gKGNhbGxiYWNrIC8qLCB0aGlzcCovKSB7XG4gICAgdmFyIHRoaXNwID0gYXJndW1lbnRzWzFdO1xuICAgIHZhciByZXN1bHQgPSBbXTtcbiAgICB0aGlzLnJlZHVjZShmdW5jdGlvbiAodW5kZWZpbmVkLCB2YWx1ZSwga2V5LCBvYmplY3QsIGRlcHRoKSB7XG4gICAgICAgIHJlc3VsdC5wdXNoKGNhbGxiYWNrLmNhbGwodGhpc3AsIHZhbHVlLCBrZXksIG9iamVjdCwgZGVwdGgpKTtcbiAgICB9LCB1bmRlZmluZWQpO1xuICAgIHJldHVybiByZXN1bHQ7XG59O1xuXG5HZW5lcmljQ29sbGVjdGlvbi5wcm90b3R5cGUuZW51bWVyYXRlID0gZnVuY3Rpb24gKHN0YXJ0KSB7XG4gICAgaWYgKHN0YXJ0ID09IG51bGwpIHtcbiAgICAgICAgc3RhcnQgPSAwO1xuICAgIH1cbiAgICB2YXIgcmVzdWx0ID0gW107XG4gICAgdGhpcy5yZWR1Y2UoZnVuY3Rpb24gKHVuZGVmaW5lZCwgdmFsdWUpIHtcbiAgICAgICAgcmVzdWx0LnB1c2goW3N0YXJ0KyssIHZhbHVlXSk7XG4gICAgfSwgdW5kZWZpbmVkKTtcbiAgICByZXR1cm4gcmVzdWx0O1xufTtcblxuR2VuZXJpY0NvbGxlY3Rpb24ucHJvdG90eXBlLmdyb3VwID0gZnVuY3Rpb24gKGNhbGxiYWNrLCB0aGlzcCwgZXF1YWxzKSB7XG4gICAgZXF1YWxzID0gZXF1YWxzIHx8IE9iamVjdC5lcXVhbHM7XG4gICAgdmFyIGdyb3VwcyA9IFtdO1xuICAgIHZhciBrZXlzID0gW107XG4gICAgdGhpcy5mb3JFYWNoKGZ1bmN0aW9uICh2YWx1ZSwga2V5LCBvYmplY3QpIHtcbiAgICAgICAgdmFyIGtleSA9IGNhbGxiYWNrLmNhbGwodGhpc3AsIHZhbHVlLCBrZXksIG9iamVjdCk7XG4gICAgICAgIHZhciBpbmRleCA9IGtleXMuaW5kZXhPZihrZXksIGVxdWFscyk7XG4gICAgICAgIHZhciBncm91cDtcbiAgICAgICAgaWYgKGluZGV4ID09PSAtMSkge1xuICAgICAgICAgICAgZ3JvdXAgPSBbXTtcbiAgICAgICAgICAgIGdyb3Vwcy5wdXNoKFtrZXksIGdyb3VwXSk7XG4gICAgICAgICAgICBrZXlzLnB1c2goa2V5KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGdyb3VwID0gZ3JvdXBzW2luZGV4XVsxXTtcbiAgICAgICAgfVxuICAgICAgICBncm91cC5wdXNoKHZhbHVlKTtcbiAgICB9KTtcbiAgICByZXR1cm4gZ3JvdXBzO1xufTtcblxuR2VuZXJpY0NvbGxlY3Rpb24ucHJvdG90eXBlLnRvQXJyYXkgPSBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIHRoaXMubWFwKEZ1bmN0aW9uLmlkZW50aXR5KTtcbn07XG5cbi8vIHRoaXMgZGVwZW5kcyBvbiBzdHJpbmdhYmxlIGtleXMsIHdoaWNoIGFwcGx5IHRvIEFycmF5IGFuZCBJdGVyYXRvclxuLy8gYmVjYXVzZSB0aGV5IGhhdmUgbnVtZXJpYyBrZXlzIGFuZCBhbGwgTWFwcyBzaW5jZSB0aGV5IG1heSB1c2Vcbi8vIHN0cmluZ3MgYXMga2V5cy4gIExpc3QsIFNldCwgYW5kIFNvcnRlZFNldCBoYXZlIG5vZGVzIGZvciBrZXlzLCBzb1xuLy8gdG9PYmplY3Qgd291bGQgbm90IGJlIG1lYW5pbmdmdWwuXG5HZW5lcmljQ29sbGVjdGlvbi5wcm90b3R5cGUudG9PYmplY3QgPSBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIG9iamVjdCA9IHt9O1xuICAgIHRoaXMucmVkdWNlKGZ1bmN0aW9uICh1bmRlZmluZWQsIHZhbHVlLCBrZXkpIHtcbiAgICAgICAgb2JqZWN0W2tleV0gPSB2YWx1ZTtcbiAgICB9LCB1bmRlZmluZWQpO1xuICAgIHJldHVybiBvYmplY3Q7XG59O1xuXG5HZW5lcmljQ29sbGVjdGlvbi5mcm9tID0gZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiB0aGlzLmFwcGx5KHRoaXMsYXJndW1lbnRzKTtcbn07XG5cbkdlbmVyaWNDb2xsZWN0aW9uLnByb3RvdHlwZS5maWx0ZXIgPSBmdW5jdGlvbiAoY2FsbGJhY2sgLyosIHRoaXNwKi8pIHtcbiAgICB2YXIgdGhpc3AgPSBhcmd1bWVudHNbMV07XG4gICAgdmFyIHJlc3VsdCA9IHRoaXMuY29uc3RydWN0Q2xvbmUoKTtcbiAgICB0aGlzLnJlZHVjZShmdW5jdGlvbiAodW5kZWZpbmVkLCB2YWx1ZSwga2V5LCBvYmplY3QsIGRlcHRoKSB7XG4gICAgICAgIGlmIChjYWxsYmFjay5jYWxsKHRoaXNwLCB2YWx1ZSwga2V5LCBvYmplY3QsIGRlcHRoKSkge1xuICAgICAgICAgICAgcmVzdWx0LmFkZCh2YWx1ZSwga2V5KTtcbiAgICAgICAgfVxuICAgIH0sIHVuZGVmaW5lZCk7XG4gICAgcmV0dXJuIHJlc3VsdDtcbn07XG5cbkdlbmVyaWNDb2xsZWN0aW9uLnByb3RvdHlwZS5ldmVyeSA9IGZ1bmN0aW9uIChjYWxsYmFjayAvKiwgdGhpc3AqLykge1xuICAgIHZhciB0aGlzcCA9IGFyZ3VtZW50c1sxXTtcbiAgICByZXR1cm4gdGhpcy5yZWR1Y2UoZnVuY3Rpb24gKHJlc3VsdCwgdmFsdWUsIGtleSwgb2JqZWN0LCBkZXB0aCkge1xuICAgICAgICByZXR1cm4gcmVzdWx0ICYmIGNhbGxiYWNrLmNhbGwodGhpc3AsIHZhbHVlLCBrZXksIG9iamVjdCwgZGVwdGgpO1xuICAgIH0sIHRydWUpO1xufTtcblxuR2VuZXJpY0NvbGxlY3Rpb24ucHJvdG90eXBlLnNvbWUgPSBmdW5jdGlvbiAoY2FsbGJhY2sgLyosIHRoaXNwKi8pIHtcbiAgICB2YXIgdGhpc3AgPSBhcmd1bWVudHNbMV07XG4gICAgcmV0dXJuIHRoaXMucmVkdWNlKGZ1bmN0aW9uIChyZXN1bHQsIHZhbHVlLCBrZXksIG9iamVjdCwgZGVwdGgpIHtcbiAgICAgICAgcmV0dXJuIHJlc3VsdCB8fCBjYWxsYmFjay5jYWxsKHRoaXNwLCB2YWx1ZSwga2V5LCBvYmplY3QsIGRlcHRoKTtcbiAgICB9LCBmYWxzZSk7XG59O1xuXG5HZW5lcmljQ29sbGVjdGlvbi5wcm90b3R5cGUuYWxsID0gZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiB0aGlzLmV2ZXJ5KEJvb2xlYW4pO1xufTtcblxuR2VuZXJpY0NvbGxlY3Rpb24ucHJvdG90eXBlLmFueSA9IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gdGhpcy5zb21lKEJvb2xlYW4pO1xufTtcblxuR2VuZXJpY0NvbGxlY3Rpb24ucHJvdG90eXBlLm1pbiA9IGZ1bmN0aW9uIChjb21wYXJlKSB7XG4gICAgY29tcGFyZSA9IGNvbXBhcmUgfHwgdGhpcy5jb250ZW50Q29tcGFyZSB8fCBPYmplY3QuY29tcGFyZTtcbiAgICB2YXIgZmlyc3QgPSB0cnVlO1xuICAgIHJldHVybiB0aGlzLnJlZHVjZShmdW5jdGlvbiAocmVzdWx0LCB2YWx1ZSkge1xuICAgICAgICBpZiAoZmlyc3QpIHtcbiAgICAgICAgICAgIGZpcnN0ID0gZmFsc2U7XG4gICAgICAgICAgICByZXR1cm4gdmFsdWU7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gY29tcGFyZSh2YWx1ZSwgcmVzdWx0KSA8IDAgPyB2YWx1ZSA6IHJlc3VsdDtcbiAgICAgICAgfVxuICAgIH0sIHVuZGVmaW5lZCk7XG59O1xuXG5HZW5lcmljQ29sbGVjdGlvbi5wcm90b3R5cGUubWF4ID0gZnVuY3Rpb24gKGNvbXBhcmUpIHtcbiAgICBjb21wYXJlID0gY29tcGFyZSB8fCB0aGlzLmNvbnRlbnRDb21wYXJlIHx8IE9iamVjdC5jb21wYXJlO1xuICAgIHZhciBmaXJzdCA9IHRydWU7XG4gICAgcmV0dXJuIHRoaXMucmVkdWNlKGZ1bmN0aW9uIChyZXN1bHQsIHZhbHVlKSB7XG4gICAgICAgIGlmIChmaXJzdCkge1xuICAgICAgICAgICAgZmlyc3QgPSBmYWxzZTtcbiAgICAgICAgICAgIHJldHVybiB2YWx1ZTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiBjb21wYXJlKHZhbHVlLCByZXN1bHQpID4gMCA/IHZhbHVlIDogcmVzdWx0O1xuICAgICAgICB9XG4gICAgfSwgdW5kZWZpbmVkKTtcbn07XG5cbkdlbmVyaWNDb2xsZWN0aW9uLnByb3RvdHlwZS5zdW0gPSBmdW5jdGlvbiAoemVybykge1xuICAgIHplcm8gPSB6ZXJvID09PSB1bmRlZmluZWQgPyAwIDogemVybztcbiAgICByZXR1cm4gdGhpcy5yZWR1Y2UoZnVuY3Rpb24gKGEsIGIpIHtcbiAgICAgICAgcmV0dXJuIGEgKyBiO1xuICAgIH0sIHplcm8pO1xufTtcblxuR2VuZXJpY0NvbGxlY3Rpb24ucHJvdG90eXBlLmF2ZXJhZ2UgPSBmdW5jdGlvbiAoemVybykge1xuICAgIHZhciBzdW0gPSB6ZXJvID09PSB1bmRlZmluZWQgPyAwIDogemVybztcbiAgICB2YXIgY291bnQgPSB6ZXJvID09PSB1bmRlZmluZWQgPyAwIDogemVybztcbiAgICB0aGlzLnJlZHVjZShmdW5jdGlvbiAodW5kZWZpbmVkLCB2YWx1ZSkge1xuICAgICAgICBzdW0gKz0gdmFsdWU7XG4gICAgICAgIGNvdW50ICs9IDE7XG4gICAgfSwgdW5kZWZpbmVkKTtcbiAgICByZXR1cm4gc3VtIC8gY291bnQ7XG59O1xuXG5HZW5lcmljQ29sbGVjdGlvbi5wcm90b3R5cGUuY29uY2F0ID0gZnVuY3Rpb24gKCkge1xuICAgIHZhciByZXN1bHQgPSB0aGlzLmNvbnN0cnVjdENsb25lKHRoaXMpO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgYXJndW1lbnRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIHJlc3VsdC5hZGRFYWNoKGFyZ3VtZW50c1tpXSk7XG4gICAgfVxuICAgIHJldHVybiByZXN1bHQ7XG59O1xuXG5HZW5lcmljQ29sbGVjdGlvbi5wcm90b3R5cGUuZmxhdHRlbiA9IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgcmV0dXJuIHRoaXMucmVkdWNlKGZ1bmN0aW9uIChyZXN1bHQsIGFycmF5KSB7XG4gICAgICAgIGFycmF5LmZvckVhY2goZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICAgICAgICB0aGlzLnB1c2godmFsdWUpO1xuICAgICAgICB9LCByZXN1bHQsIHNlbGYpO1xuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH0sIFtdKTtcbn07XG5cbkdlbmVyaWNDb2xsZWN0aW9uLnByb3RvdHlwZS56aXAgPSBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIHRhYmxlID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzKTtcbiAgICB0YWJsZS51bnNoaWZ0KHRoaXMpO1xuICAgIHJldHVybiBBcnJheS51bnppcCh0YWJsZSk7XG59XG5cbkdlbmVyaWNDb2xsZWN0aW9uLnByb3RvdHlwZS5qb2luID0gZnVuY3Rpb24gKGRlbGltaXRlcikge1xuICAgIHJldHVybiB0aGlzLnJlZHVjZShmdW5jdGlvbiAocmVzdWx0LCBzdHJpbmcpIHtcbiAgICAgICAgLy8gd29yay1hcm91bmQgZm9yIHJlZHVjZSB0aGF0IGRvZXMgbm90IHN1cHBvcnQgbm8tYmFzaXMgZm9ybVxuICAgICAgICBpZiAocmVzdWx0ID09PSB2b2lkIDApIHtcbiAgICAgICAgICAgIHJldHVybiBzdHJpbmc7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gcmVzdWx0ICsgZGVsaW1pdGVyICsgc3RyaW5nO1xuICAgICAgICB9XG4gICAgfSwgdm9pZCAwKTtcbn07XG5cbkdlbmVyaWNDb2xsZWN0aW9uLnByb3RvdHlwZS5zb3J0ZWQgPSBmdW5jdGlvbiAoY29tcGFyZSwgYnksIG9yZGVyKSB7XG4gICAgY29tcGFyZSA9IGNvbXBhcmUgfHwgdGhpcy5jb250ZW50Q29tcGFyZSB8fCBPYmplY3QuY29tcGFyZTtcbiAgICAvLyBhY2NvdW50IGZvciBjb21wYXJhdG9ycyBnZW5lcmF0ZWQgYnkgRnVuY3Rpb24uYnlcbiAgICBpZiAoY29tcGFyZS5ieSkge1xuICAgICAgICBieSA9IGNvbXBhcmUuYnk7XG4gICAgICAgIGNvbXBhcmUgPSBjb21wYXJlLmNvbXBhcmUgfHwgdGhpcy5jb250ZW50Q29tcGFyZSB8fCBPYmplY3QuY29tcGFyZTtcbiAgICB9IGVsc2Uge1xuICAgICAgICBieSA9IGJ5IHx8IEZ1bmN0aW9uLmlkZW50aXR5O1xuICAgIH1cbiAgICBpZiAob3JkZXIgPT09IHVuZGVmaW5lZClcbiAgICAgICAgb3JkZXIgPSAxO1xuICAgIHJldHVybiB0aGlzLm1hcChmdW5jdGlvbiAoaXRlbSkge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgYnk6IGJ5KGl0ZW0pLFxuICAgICAgICAgICAgdmFsdWU6IGl0ZW1cbiAgICAgICAgfTtcbiAgICB9KVxuICAgIC5zb3J0KGZ1bmN0aW9uIChhLCBiKSB7XG4gICAgICAgIHJldHVybiBjb21wYXJlKGEuYnksIGIuYnkpICogb3JkZXI7XG4gICAgfSlcbiAgICAubWFwKGZ1bmN0aW9uIChwYWlyKSB7XG4gICAgICAgIHJldHVybiBwYWlyLnZhbHVlO1xuICAgIH0pO1xufTtcblxuR2VuZXJpY0NvbGxlY3Rpb24ucHJvdG90eXBlLnJldmVyc2VkID0gZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiB0aGlzLmNvbnN0cnVjdENsb25lKHRoaXMpLnJldmVyc2UoKTtcbn07XG5cbkdlbmVyaWNDb2xsZWN0aW9uLnByb3RvdHlwZS5jbG9uZSA9IGZ1bmN0aW9uIChkZXB0aCwgbWVtbykge1xuICAgIGlmIChkZXB0aCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIGRlcHRoID0gSW5maW5pdHk7XG4gICAgfSBlbHNlIGlmIChkZXB0aCA9PT0gMCkge1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG4gICAgdmFyIGNsb25lID0gdGhpcy5jb25zdHJ1Y3RDbG9uZSgpO1xuICAgIHRoaXMuZm9yRWFjaChmdW5jdGlvbiAodmFsdWUsIGtleSkge1xuICAgICAgICBjbG9uZS5hZGQoT2JqZWN0LmNsb25lKHZhbHVlLCBkZXB0aCAtIDEsIG1lbW8pLCBrZXkpO1xuICAgIH0sIHRoaXMpO1xuICAgIHJldHVybiBjbG9uZTtcbn07XG5cbkdlbmVyaWNDb2xsZWN0aW9uLnByb3RvdHlwZS5vbmx5ID0gZnVuY3Rpb24gKCkge1xuICAgIGlmICh0aGlzLmxlbmd0aCA9PT0gMSkge1xuICAgICAgICByZXR1cm4gdGhpcy5vbmUoKTtcbiAgICB9XG59O1xuXG5HZW5lcmljQ29sbGVjdGlvbi5wcm90b3R5cGUuaXRlcmF0b3IgPSBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIHRoaXMuaXRlcmF0ZS5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xufTtcblxuR2VuZXJpY0NvbGxlY3Rpb24uX3NpemVQcm9wZXJ0eURlc2NyaXB0b3IgPSB7XG4gICAgZ2V0OiBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMubGVuZ3RoO1xuICAgIH0sXG4gICAgZW51bWVyYWJsZTogZmFsc2UsXG4gICAgY29uZmlndXJhYmxlOiB0cnVlXG59O1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoR2VuZXJpY0NvbGxlY3Rpb24ucHJvdG90eXBlLFwic2l6ZVwiLEdlbmVyaWNDb2xsZWN0aW9uLl9zaXplUHJvcGVydHlEZXNjcmlwdG9yKTtcblxucmVxdWlyZShcIi4vc2hpbS1hcnJheVwiKTtcbiIsIlwidXNlIHN0cmljdFwiO1xuXG52YXIgT2JqZWN0ID0gcmVxdWlyZShcIi4vc2hpbS1vYmplY3RcIik7XG52YXIgSXRlcmF0b3IgPSByZXF1aXJlKFwiLi9pdGVyYXRvclwiKTtcblxubW9kdWxlLmV4cG9ydHMgPSBHZW5lcmljTWFwO1xuZnVuY3Rpb24gR2VuZXJpY01hcCgpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoXCJDYW4ndCBjb25zdHJ1Y3QuIEdlbmVyaWNNYXAgaXMgYSBtaXhpbi5cIik7XG59XG5cbi8vIGFsbCBvZiB0aGVzZSBtZXRob2RzIGRlcGVuZCBvbiB0aGUgY29uc3RydWN0b3IgcHJvdmlkaW5nIGEgYHN0b3JlYCBzZXRcblxuR2VuZXJpY01hcC5wcm90b3R5cGUuaXNNYXAgPSB0cnVlO1xuXG5HZW5lcmljTWFwLnByb3RvdHlwZS5hZGRFYWNoID0gZnVuY3Rpb24gKHZhbHVlcykge1xuICAgIHZhciBpO1xuICAgIGlmICh2YWx1ZXMgJiYgT2JqZWN0KHZhbHVlcykgPT09IHZhbHVlcykge1xuICAgICAgICBpZiAodHlwZW9mIHZhbHVlcy5mb3JFYWNoID09PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgICAgICAgIC8vIGNvcHkgbWFwLWFsaWtlc1xuICAgICAgICAgICAgaWYgKHZhbHVlcy5pc01hcCA9PT0gdHJ1ZSkge1xuICAgICAgICAgICAgICAgIHZhbHVlcy5mb3JFYWNoKGZ1bmN0aW9uICh2YWx1ZSwga2V5KSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc2V0KGtleSwgdmFsdWUpO1xuICAgICAgICAgICAgICAgIH0sIHRoaXMpO1xuICAgICAgICAgICAgLy8gaXRlcmF0ZSBrZXkgdmFsdWUgcGFpcnMgb2Ygb3RoZXIgaXRlcmFibGVzXG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHZhbHVlcy5mb3JFYWNoKGZ1bmN0aW9uIChwYWlyKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc2V0KHBhaXJbMF0sIHBhaXJbMV0pO1xuICAgICAgICAgICAgICAgIH0sIHRoaXMpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2UgaWYgKHR5cGVvZiB2YWx1ZXMubGVuZ3RoID09PSBcIm51bWJlclwiKSB7XG4gICAgICAgICAgICAvLyBBcnJheS1saWtlIG9iamVjdHMgdGhhdCBkbyBub3QgaW1wbGVtZW50IGZvckVhY2gsIGVyZ28sXG4gICAgICAgICAgICAvLyBBcmd1bWVudHNcbiAgICAgICAgICAgIGZvciAoaSA9IDA7IGkgPCB2YWx1ZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICB0aGlzLmFkZCh2YWx1ZXNbaV0sIGkpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgLy8gY29weSBvdGhlciBvYmplY3RzIGFzIG1hcC1hbGlrZXNcbiAgICAgICAgICAgIE9iamVjdC5rZXlzKHZhbHVlcykuZm9yRWFjaChmdW5jdGlvbiAoa2V5KSB7XG4gICAgICAgICAgICAgICAgdGhpcy5zZXQoa2V5LCB2YWx1ZXNba2V5XSk7XG4gICAgICAgICAgICB9LCB0aGlzKTtcbiAgICAgICAgfVxuICAgIH0gZWxzZSBpZiAodmFsdWVzICYmIHR5cGVvZiB2YWx1ZXMubGVuZ3RoID09PSBcIm51bWJlclwiKSB7XG4gICAgICAgIC8vIFN0cmluZ1xuICAgICAgICBmb3IgKGkgPSAwOyBpIDwgdmFsdWVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICB0aGlzLmFkZCh2YWx1ZXNbaV0sIGkpO1xuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiB0aGlzO1xufTtcblxuR2VuZXJpY01hcC5wcm90b3R5cGUuZ2V0ID0gZnVuY3Rpb24gKGtleSwgZGVmYXVsdFZhbHVlKSB7XG4gICAgdmFyIGl0ZW0gPSB0aGlzLnN0b3JlLmdldChuZXcgdGhpcy5JdGVtKGtleSkpO1xuICAgIGlmIChpdGVtKSB7XG4gICAgICAgIHJldHVybiBpdGVtLnZhbHVlO1xuICAgIH0gZWxzZSBpZiAoYXJndW1lbnRzLmxlbmd0aCA+IDEpIHtcbiAgICAgICAgY29uc29sZS5sb2coXCJVc2Ugb2YgYSBzZWNvbmQgYXJndW1lbnQgYXMgZGVmYXVsdCB2YWx1ZSBpcyBkZXByZWNhdGVkIHRvIG1hdGNoIHN0YW5kYXJkc1wiKTtcbiAgICAgICAgcmV0dXJuIGRlZmF1bHRWYWx1ZTtcbiAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gdGhpcy5nZXREZWZhdWx0KGtleSk7XG4gICAgfVxufTtcblxuR2VuZXJpY01hcC5wcm90b3R5cGUuc2V0ID0gZnVuY3Rpb24gKGtleSwgdmFsdWUpIHtcbiAgICB2YXIgaXRlbSA9IG5ldyB0aGlzLkl0ZW0oa2V5LCB2YWx1ZSk7XG4gICAgdmFyIGZvdW5kID0gdGhpcy5zdG9yZS5nZXQoaXRlbSk7XG4gICAgdmFyIGdyZXcgPSBmYWxzZTtcbiAgICBpZiAoZm91bmQpIHsgLy8gdXBkYXRlXG4gICAgICAgIGlmICh0aGlzLmRpc3BhdGNoZXNNYXBDaGFuZ2VzKSB7XG4gICAgICAgICAgICB0aGlzLmRpc3BhdGNoQmVmb3JlTWFwQ2hhbmdlKGtleSwgZm91bmQudmFsdWUpO1xuICAgICAgICB9XG4gICAgICAgIGZvdW5kLnZhbHVlID0gdmFsdWU7XG4gICAgICAgIGlmICh0aGlzLmRpc3BhdGNoZXNNYXBDaGFuZ2VzKSB7XG4gICAgICAgICAgICB0aGlzLmRpc3BhdGNoTWFwQ2hhbmdlKGtleSwgdmFsdWUpO1xuICAgICAgICB9XG4gICAgfSBlbHNlIHsgLy8gY3JlYXRlXG4gICAgICAgIGlmICh0aGlzLmRpc3BhdGNoZXNNYXBDaGFuZ2VzKSB7XG4gICAgICAgICAgICB0aGlzLmRpc3BhdGNoQmVmb3JlTWFwQ2hhbmdlKGtleSwgdW5kZWZpbmVkKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAodGhpcy5zdG9yZS5hZGQoaXRlbSkpIHtcbiAgICAgICAgICAgIHRoaXMubGVuZ3RoKys7XG4gICAgICAgICAgICBncmV3ID0gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgICBpZiAodGhpcy5kaXNwYXRjaGVzTWFwQ2hhbmdlcykge1xuICAgICAgICAgICAgdGhpcy5kaXNwYXRjaE1hcENoYW5nZShrZXksIHZhbHVlKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gZ3Jldztcbn07XG5cbkdlbmVyaWNNYXAucHJvdG90eXBlLmFkZCA9IGZ1bmN0aW9uICh2YWx1ZSwga2V5KSB7XG4gICAgcmV0dXJuIHRoaXMuc2V0KGtleSwgdmFsdWUpO1xufTtcblxuR2VuZXJpY01hcC5wcm90b3R5cGUuaGFzID0gZnVuY3Rpb24gKGtleSkge1xuICAgIHJldHVybiB0aGlzLnN0b3JlLmhhcyhuZXcgdGhpcy5JdGVtKGtleSkpO1xufTtcblxuR2VuZXJpY01hcC5wcm90b3R5cGVbJ2RlbGV0ZSddID0gZnVuY3Rpb24gKGtleSkge1xuICAgIHZhciBpdGVtID0gbmV3IHRoaXMuSXRlbShrZXkpO1xuICAgIGlmICh0aGlzLnN0b3JlLmhhcyhpdGVtKSkge1xuICAgICAgICB2YXIgZnJvbSA9IHRoaXMuc3RvcmUuZ2V0KGl0ZW0pLnZhbHVlO1xuICAgICAgICBpZiAodGhpcy5kaXNwYXRjaGVzTWFwQ2hhbmdlcykge1xuICAgICAgICAgICAgdGhpcy5kaXNwYXRjaEJlZm9yZU1hcENoYW5nZShrZXksIGZyb20pO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuc3RvcmVbXCJkZWxldGVcIl0oaXRlbSk7XG4gICAgICAgIHRoaXMubGVuZ3RoLS07XG4gICAgICAgIGlmICh0aGlzLmRpc3BhdGNoZXNNYXBDaGFuZ2VzKSB7XG4gICAgICAgICAgICB0aGlzLmRpc3BhdGNoTWFwQ2hhbmdlKGtleSwgdW5kZWZpbmVkKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gICAgcmV0dXJuIGZhbHNlO1xufTtcblxuR2VuZXJpY01hcC5wcm90b3R5cGUuY2xlYXIgPSBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIGtleXMsIGtleTtcbiAgICBpZiAodGhpcy5kaXNwYXRjaGVzTWFwQ2hhbmdlcykge1xuICAgICAgICB0aGlzLmZvckVhY2goZnVuY3Rpb24gKHZhbHVlLCBrZXkpIHtcbiAgICAgICAgICAgIHRoaXMuZGlzcGF0Y2hCZWZvcmVNYXBDaGFuZ2Uoa2V5LCB2YWx1ZSk7XG4gICAgICAgIH0sIHRoaXMpO1xuICAgICAgICBrZXlzID0gdGhpcy5rZXlzQXJyYXkoKTtcbiAgICB9XG4gICAgdGhpcy5zdG9yZS5jbGVhcigpO1xuICAgIHRoaXMubGVuZ3RoID0gMDtcbiAgICBpZiAodGhpcy5kaXNwYXRjaGVzTWFwQ2hhbmdlcykge1xuICAgICAgICBmb3IodmFyIGk9MDsoa2V5ID0ga2V5c1tpXSk7aSsrKSB7XG4gICAgICAgICAgICB0aGlzLmRpc3BhdGNoTWFwQ2hhbmdlKGtleSk7XG4gICAgICAgIH1cbiAgICAgICAgLy8ga2V5cy5mb3JFYWNoKGZ1bmN0aW9uIChrZXkpIHtcbiAgICAgICAgLy8gICAgIHRoaXMuZGlzcGF0Y2hNYXBDaGFuZ2Uoa2V5KTtcbiAgICAgICAgLy8gfSwgdGhpcyk7XG4gICAgfVxufTtcblxuR2VuZXJpY01hcC5wcm90b3R5cGUucmVkdWNlID0gZnVuY3Rpb24gKGNhbGxiYWNrLCBiYXNpcywgdGhpc3ApIHtcbiAgICByZXR1cm4gdGhpcy5zdG9yZS5yZWR1Y2UoZnVuY3Rpb24gKGJhc2lzLCBpdGVtKSB7XG4gICAgICAgIHJldHVybiBjYWxsYmFjay5jYWxsKHRoaXNwLCBiYXNpcywgaXRlbS52YWx1ZSwgaXRlbS5rZXksIHRoaXMpO1xuICAgIH0sIGJhc2lzLCB0aGlzKTtcbn07XG5cbkdlbmVyaWNNYXAucHJvdG90eXBlLnJlZHVjZVJpZ2h0ID0gZnVuY3Rpb24gKGNhbGxiYWNrLCBiYXNpcywgdGhpc3ApIHtcbiAgICByZXR1cm4gdGhpcy5zdG9yZS5yZWR1Y2VSaWdodChmdW5jdGlvbiAoYmFzaXMsIGl0ZW0pIHtcbiAgICAgICAgcmV0dXJuIGNhbGxiYWNrLmNhbGwodGhpc3AsIGJhc2lzLCBpdGVtLnZhbHVlLCBpdGVtLmtleSwgdGhpcyk7XG4gICAgfSwgYmFzaXMsIHRoaXMpO1xufTtcblxuR2VuZXJpY01hcC5wcm90b3R5cGUua2V5c0FycmF5ID0gZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiB0aGlzLm1hcChmdW5jdGlvbiAodmFsdWUsIGtleSkge1xuICAgICAgICByZXR1cm4ga2V5O1xuICAgIH0pO1xufTtcbkdlbmVyaWNNYXAucHJvdG90eXBlLmtleXMgPSBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIG5ldyBJdGVyYXRvcih0aGlzLmtleXNBcnJheSgpKTtcbn07XG5cbkdlbmVyaWNNYXAucHJvdG90eXBlLnZhbHVlc0FycmF5ID0gZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiB0aGlzLm1hcChGdW5jdGlvbi5pZGVudGl0eSk7XG59O1xuR2VuZXJpY01hcC5wcm90b3R5cGUudmFsdWVzID0gZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiBuZXcgSXRlcmF0b3IodGhpcy52YWx1ZXNBcnJheSgpKTtcbn07XG5cbkdlbmVyaWNNYXAucHJvdG90eXBlLmVudHJpZXNBcnJheSA9IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gdGhpcy5tYXAoZnVuY3Rpb24gKHZhbHVlLCBrZXkpIHtcbiAgICAgICAgcmV0dXJuIFtrZXksIHZhbHVlXTtcbiAgICB9KTtcbn07XG5HZW5lcmljTWFwLnByb3RvdHlwZS5lbnRyaWVzID0gZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiBuZXcgSXRlcmF0b3IodGhpcy5lbnRyaWVzQXJyYXkoKSk7XG59O1xuXG4vLyBYWFggZGVwcmVjYXRlZFxuR2VuZXJpY01hcC5wcm90b3R5cGUuaXRlbXMgPSBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIHRoaXMuZW50cmllc0FycmF5KCk7XG59O1xuXG5HZW5lcmljTWFwLnByb3RvdHlwZS5lcXVhbHMgPSBmdW5jdGlvbiAodGhhdCwgZXF1YWxzKSB7XG4gICAgZXF1YWxzID0gZXF1YWxzIHx8IE9iamVjdC5lcXVhbHM7XG4gICAgaWYgKHRoaXMgPT09IHRoYXQpIHtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfSBlbHNlIGlmICh0aGF0ICYmIHR5cGVvZiB0aGF0LmV2ZXJ5ID09PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgICAgcmV0dXJuIHRoYXQubGVuZ3RoID09PSB0aGlzLmxlbmd0aCAmJiB0aGF0LmV2ZXJ5KGZ1bmN0aW9uICh2YWx1ZSwga2V5KSB7XG4gICAgICAgICAgICByZXR1cm4gZXF1YWxzKHRoaXMuZ2V0KGtleSksIHZhbHVlKTtcbiAgICAgICAgfSwgdGhpcyk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgdmFyIGtleXMgPSBPYmplY3Qua2V5cyh0aGF0KTtcbiAgICAgICAgcmV0dXJuIGtleXMubGVuZ3RoID09PSB0aGlzLmxlbmd0aCAmJiBPYmplY3Qua2V5cyh0aGF0KS5ldmVyeShmdW5jdGlvbiAoa2V5KSB7XG4gICAgICAgICAgICByZXR1cm4gZXF1YWxzKHRoaXMuZ2V0KGtleSksIHRoYXRba2V5XSk7XG4gICAgICAgIH0sIHRoaXMpO1xuICAgIH1cbn07XG5cbkdlbmVyaWNNYXAucHJvdG90eXBlLnRvSlNPTiA9IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gdGhpcy5lbnRyaWVzQXJyYXkoKTtcbn07XG5cblxuR2VuZXJpY01hcC5wcm90b3R5cGUuSXRlbSA9IEl0ZW07XG5cbmZ1bmN0aW9uIEl0ZW0oa2V5LCB2YWx1ZSkge1xuICAgIHRoaXMua2V5ID0ga2V5O1xuICAgIHRoaXMudmFsdWUgPSB2YWx1ZTtcbn1cblxuSXRlbS5wcm90b3R5cGUuZXF1YWxzID0gZnVuY3Rpb24gKHRoYXQpIHtcbiAgICByZXR1cm4gT2JqZWN0LmVxdWFscyh0aGlzLmtleSwgdGhhdC5rZXkpICYmIE9iamVjdC5lcXVhbHModGhpcy52YWx1ZSwgdGhhdC52YWx1ZSk7XG59O1xuXG5JdGVtLnByb3RvdHlwZS5jb21wYXJlID0gZnVuY3Rpb24gKHRoYXQpIHtcbiAgICByZXR1cm4gT2JqZWN0LmNvbXBhcmUodGhpcy5rZXksIHRoYXQua2V5KTtcbn07XG4iLCJcbnZhciBPYmplY3QgPSByZXF1aXJlKFwiLi9zaGltLW9iamVjdFwiKTtcblxubW9kdWxlLmV4cG9ydHMgPSBHZW5lcmljT3JkZXI7XG5mdW5jdGlvbiBHZW5lcmljT3JkZXIoKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKFwiQ2FuJ3QgY29uc3RydWN0LiBHZW5lcmljT3JkZXIgaXMgYSBtaXhpbi5cIik7XG59XG5cbkdlbmVyaWNPcmRlci5wcm90b3R5cGUuZXF1YWxzID0gZnVuY3Rpb24gKHRoYXQsIGVxdWFscykge1xuICAgIGVxdWFscyA9IGVxdWFscyB8fCB0aGlzLmNvbnRlbnRFcXVhbHMgfHwgT2JqZWN0LmVxdWFscztcblxuICAgIGlmICh0aGlzID09PSB0aGF0KSB7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbiAgICBpZiAoIXRoYXQpIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIHZhciBzZWxmID0gdGhpcztcbiAgICByZXR1cm4gKFxuICAgICAgICB0aGlzLmxlbmd0aCA9PT0gdGhhdC5sZW5ndGggJiZcbiAgICAgICAgdGhpcy56aXAodGhhdCkuZXZlcnkoZnVuY3Rpb24gKHBhaXIpIHtcbiAgICAgICAgICAgIHJldHVybiBlcXVhbHMocGFpclswXSwgcGFpclsxXSk7XG4gICAgICAgIH0pXG4gICAgKTtcbn07XG5cbkdlbmVyaWNPcmRlci5wcm90b3R5cGUuY29tcGFyZSA9IGZ1bmN0aW9uICh0aGF0LCBjb21wYXJlKSB7XG4gICAgY29tcGFyZSA9IGNvbXBhcmUgfHwgdGhpcy5jb250ZW50Q29tcGFyZSB8fCBPYmplY3QuY29tcGFyZTtcblxuICAgIGlmICh0aGlzID09PSB0aGF0KSB7XG4gICAgICAgIHJldHVybiAwO1xuICAgIH1cbiAgICBpZiAoIXRoYXQpIHtcbiAgICAgICAgcmV0dXJuIDE7XG4gICAgfVxuXG4gICAgdmFyIGxlbmd0aCA9IE1hdGgubWluKHRoaXMubGVuZ3RoLCB0aGF0Lmxlbmd0aCk7XG4gICAgdmFyIGNvbXBhcmlzb24gPSB0aGlzLnppcCh0aGF0KS5yZWR1Y2UoZnVuY3Rpb24gKGNvbXBhcmlzb24sIHBhaXIsIGluZGV4KSB7XG4gICAgICAgIGlmIChjb21wYXJpc29uID09PSAwKSB7XG4gICAgICAgICAgICBpZiAoaW5kZXggPj0gbGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGNvbXBhcmlzb247XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHJldHVybiBjb21wYXJlKHBhaXJbMF0sIHBhaXJbMV0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIGNvbXBhcmlzb247XG4gICAgICAgIH1cbiAgICB9LCAwKTtcbiAgICBpZiAoY29tcGFyaXNvbiA9PT0gMCkge1xuICAgICAgICByZXR1cm4gdGhpcy5sZW5ndGggLSB0aGF0Lmxlbmd0aDtcbiAgICB9XG4gICAgcmV0dXJuIGNvbXBhcmlzb247XG59O1xuXG5HZW5lcmljT3JkZXIucHJvdG90eXBlLnRvSlNPTiA9IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gdGhpcy50b0FycmF5KCk7XG59O1xuIiwiXG5tb2R1bGUuZXhwb3J0cyA9IEdlbmVyaWNTZXQ7XG5mdW5jdGlvbiBHZW5lcmljU2V0KCkge1xuICAgIHRocm93IG5ldyBFcnJvcihcIkNhbid0IGNvbnN0cnVjdC4gR2VuZXJpY1NldCBpcyBhIG1peGluLlwiKTtcbn1cblxuR2VuZXJpY1NldC5wcm90b3R5cGUuaXNTZXQgPSB0cnVlO1xuXG5HZW5lcmljU2V0LnByb3RvdHlwZS51bmlvbiA9IGZ1bmN0aW9uICh0aGF0KSB7XG4gICAgdmFyIHVuaW9uID0gIHRoaXMuY29uc3RydWN0Q2xvbmUodGhpcyk7XG4gICAgdW5pb24uYWRkRWFjaCh0aGF0KTtcbiAgICByZXR1cm4gdW5pb247XG59O1xuXG5HZW5lcmljU2V0LnByb3RvdHlwZS5pbnRlcnNlY3Rpb24gPSBmdW5jdGlvbiAodGhhdCkge1xuICAgIHJldHVybiB0aGlzLmNvbnN0cnVjdENsb25lKHRoaXMuZmlsdGVyKGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgICByZXR1cm4gdGhhdC5oYXModmFsdWUpO1xuICAgIH0pKTtcbn07XG5cbkdlbmVyaWNTZXQucHJvdG90eXBlLmRpZmZlcmVuY2UgPSBmdW5jdGlvbiAodGhhdCkge1xuICAgIHZhciB1bmlvbiA9ICB0aGlzLmNvbnN0cnVjdENsb25lKHRoaXMpO1xuICAgIHVuaW9uLmRlbGV0ZUVhY2godGhhdCk7XG4gICAgcmV0dXJuIHVuaW9uO1xufTtcblxuR2VuZXJpY1NldC5wcm90b3R5cGUuc3ltbWV0cmljRGlmZmVyZW5jZSA9IGZ1bmN0aW9uICh0aGF0KSB7XG4gICAgdmFyIHVuaW9uID0gdGhpcy51bmlvbih0aGF0KTtcbiAgICB2YXIgaW50ZXJzZWN0aW9uID0gdGhpcy5pbnRlcnNlY3Rpb24odGhhdCk7XG4gICAgcmV0dXJuIHVuaW9uLmRpZmZlcmVuY2UoaW50ZXJzZWN0aW9uKTtcbn07XG5cbkdlbmVyaWNTZXQucHJvdG90eXBlLmRlbGV0ZUFsbCA9IGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgIC8vIGRlbGV0ZUFsbCBpcyBlcXVpdmFsZW50IHRvIGRlbGV0ZSBmb3Igc2V0cyBzaW5jZSB0aGV5IGd1YXJhbnRlZSB0aGF0XG4gICAgLy8gb25seSBvbmUgdmFsdWUgZXhpc3RzIGZvciBhbiBlcXVpdmFsZW5jZSBjbGFzcywgYnV0IGRlbGV0ZUFsbCByZXR1cm5zXG4gICAgLy8gdGhlIGNvdW50IG9mIGRlbGV0ZWQgdmFsdWVzIGluc3RlYWQgb2Ygd2hldGhlciBhIHZhbHVlIHdhcyBkZWxldGVkLlxuICAgIHJldHVybiArdGhpc1tcImRlbGV0ZVwiXSh2YWx1ZSk7XG59O1xuXG5HZW5lcmljU2V0LnByb3RvdHlwZS5lcXVhbHMgPSBmdW5jdGlvbiAodGhhdCwgZXF1YWxzKSB7XG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgIHJldHVybiAoXG4gICAgICAgIHRoYXQgJiYgdHlwZW9mIHRoYXQucmVkdWNlID09PSBcImZ1bmN0aW9uXCIgJiZcbiAgICAgICAgdGhpcy5sZW5ndGggPT09IHRoYXQubGVuZ3RoICYmXG4gICAgICAgIHRoYXQucmVkdWNlKGZ1bmN0aW9uIChlcXVhbCwgdmFsdWUpIHtcbiAgICAgICAgICAgIHJldHVybiBlcXVhbCAmJiBzZWxmLmhhcyh2YWx1ZSwgZXF1YWxzKTtcbiAgICAgICAgfSwgdHJ1ZSlcbiAgICApO1xufTtcblxuR2VuZXJpY1NldC5wcm90b3R5cGUuZm9yRWFjaCA9IGZ1bmN0aW9uIChjYWxsYmFjayAvKiwgdGhpc3AqLykge1xuICAgIHZhciB0aGlzcCA9IGFyZ3VtZW50c1sxXTtcbiAgICByZXR1cm4gdGhpcy5yZWR1Y2UoZnVuY3Rpb24gKHVuZGVmaW5lZCwgdmFsdWUsIGtleSwgb2JqZWN0LCBkZXB0aCkge1xuICAgICAgICAvL0VDTUFTQ1JJUFQgU2V0cyBzZW5kIHZhbHVlIHR3aWNlIGluIGNhbGxiYWNrIHRvIGZvckVhY2hcbiAgICAgICAgY2FsbGJhY2suY2FsbCh0aGlzcCwgdmFsdWUsIHZhbHVlLCBvYmplY3QsIGRlcHRoKTtcbiAgICB9LCB1bmRlZmluZWQpO1xufTtcblxuXG5HZW5lcmljU2V0LnByb3RvdHlwZS50b0pTT04gPSBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIHRoaXMudG9BcnJheSgpO1xufTtcblxuLy8gVzNDIERPTVRva2VuTGlzdCBBUEkgb3ZlcmxhcCAoZG9lcyBub3QgaGFuZGxlIHZhcmlhZGljIGFyZ3VtZW50cylcblxuR2VuZXJpY1NldC5wcm90b3R5cGUuY29udGFpbnMgPSBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICByZXR1cm4gdGhpcy5oYXModmFsdWUpO1xufTtcblxuR2VuZXJpY1NldC5wcm90b3R5cGUucmVtb3ZlID0gZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgcmV0dXJuIHRoaXNbXCJkZWxldGVcIl0odmFsdWUpO1xufTtcblxuR2VuZXJpY1NldC5wcm90b3R5cGUudG9nZ2xlID0gZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgaWYgKHRoaXMuaGFzKHZhbHVlKSkge1xuICAgICAgICB0aGlzW1wiZGVsZXRlXCJdKHZhbHVlKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLmFkZCh2YWx1ZSk7XG4gICAgfVxufTtcblxudmFyIF92YWx1ZXNBcnJheUZ1bmN0aW9uID0gZnVuY3Rpb24odmFsdWUsa2V5KSB7cmV0dXJuIHZhbHVlO307XG5HZW5lcmljU2V0LnByb3RvdHlwZS52YWx1ZXNBcnJheSA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB0aGlzLm1hcChfdmFsdWVzQXJyYXlGdW5jdGlvbik7XG59XG52YXIgX2VudHJpZXNBcnJheUZ1bmN0aW9uID0gZnVuY3Rpb24odmFsdWUsa2V5KSB7cmV0dXJuIFtrZXksdmFsdWVdO307XG5HZW5lcmljU2V0LnByb3RvdHlwZS5lbnRyaWVzQXJyYXkgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gdGhpcy5tYXAoX2VudHJpZXNBcnJheUZ1bmN0aW9uKTtcbn1cbiIsIlwidXNlIHN0cmljdFwiO1xuXG5tb2R1bGUuZXhwb3J0cyA9IEl0ZXJhdG9yO1xuXG52YXIgT2JqZWN0ID0gcmVxdWlyZShcIi4vc2hpbS1vYmplY3RcIik7XG52YXIgR2VuZXJpY0NvbGxlY3Rpb24gPSByZXF1aXJlKFwiLi9nZW5lcmljLWNvbGxlY3Rpb25cIik7XG5cbi8vIHVwZ3JhZGVzIGFuIGl0ZXJhYmxlIHRvIGEgSXRlcmF0b3JcbmZ1bmN0aW9uIEl0ZXJhdG9yKGl0ZXJhYmxlKSB7XG5cbiAgICB2YXIgdmFsdWVzID0gaXRlcmFibGUgJiYgaXRlcmFibGUudmFsdWVzICYmIGl0ZXJhYmxlLnZhbHVlcygpO1xuICAgIGlmKHZhbHVlcyAmJiB0eXBlb2YgdmFsdWVzLm5leHQgPT09IFwiZnVuY3Rpb25cIiApIHtcbiAgICAgICAgcmV0dXJuIHZhbHVlcztcbiAgICB9XG5cbiAgICBpZiAoISh0aGlzIGluc3RhbmNlb2YgSXRlcmF0b3IpKSB7XG4gICAgICAgIHJldHVybiBuZXcgSXRlcmF0b3IoaXRlcmFibGUpO1xuICAgIH1cblxuICAgIGlmIChBcnJheS5pc0FycmF5KGl0ZXJhYmxlKSB8fCB0eXBlb2YgaXRlcmFibGUgPT09IFwic3RyaW5nXCIpXG4gICAgICAgIHJldHVybiBJdGVyYXRvci5pdGVyYXRlKGl0ZXJhYmxlKTtcblxuICAgIGl0ZXJhYmxlID0gT2JqZWN0KGl0ZXJhYmxlKTtcblxuICAgIGlmIChpdGVyYWJsZSBpbnN0YW5jZW9mIEl0ZXJhdG9yKSB7XG4gICAgICAgIHJldHVybiBpdGVyYWJsZTtcbiAgICB9IGVsc2UgaWYgKGl0ZXJhYmxlLm5leHQpIHtcbiAgICAgICAgdGhpcy5uZXh0ID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgcmV0dXJuIGl0ZXJhYmxlLm5leHQoKTtcbiAgICAgICAgfTtcbiAgICB9IGVsc2UgaWYgKGl0ZXJhYmxlLml0ZXJhdGUpIHtcbiAgICAgICAgdmFyIGl0ZXJhdG9yID0gaXRlcmFibGUuaXRlcmF0ZSgpO1xuICAgICAgICB0aGlzLm5leHQgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICByZXR1cm4gaXRlcmF0b3IubmV4dCgpO1xuICAgICAgICB9O1xuICAgIH0gZWxzZSBpZiAoT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKGl0ZXJhYmxlKSA9PT0gXCJbb2JqZWN0IEZ1bmN0aW9uXVwiKSB7XG4gICAgICAgIHRoaXMubmV4dCA9IGl0ZXJhYmxlO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoXCJDYW4ndCBpdGVyYXRlIFwiICsgaXRlcmFibGUpO1xuICAgIH1cblxufVxuXG5JdGVyYXRvci5wcm90b3R5cGUuZm9yRWFjaCA9IEdlbmVyaWNDb2xsZWN0aW9uLnByb3RvdHlwZS5mb3JFYWNoO1xuSXRlcmF0b3IucHJvdG90eXBlLm1hcCA9IEdlbmVyaWNDb2xsZWN0aW9uLnByb3RvdHlwZS5tYXA7XG5JdGVyYXRvci5wcm90b3R5cGUuZmlsdGVyID0gR2VuZXJpY0NvbGxlY3Rpb24ucHJvdG90eXBlLmZpbHRlcjtcbkl0ZXJhdG9yLnByb3RvdHlwZS5ldmVyeSA9IEdlbmVyaWNDb2xsZWN0aW9uLnByb3RvdHlwZS5ldmVyeTtcbkl0ZXJhdG9yLnByb3RvdHlwZS5zb21lID0gR2VuZXJpY0NvbGxlY3Rpb24ucHJvdG90eXBlLnNvbWU7XG5JdGVyYXRvci5wcm90b3R5cGUuYW55ID0gR2VuZXJpY0NvbGxlY3Rpb24ucHJvdG90eXBlLmFueTtcbkl0ZXJhdG9yLnByb3RvdHlwZS5hbGwgPSBHZW5lcmljQ29sbGVjdGlvbi5wcm90b3R5cGUuYWxsO1xuSXRlcmF0b3IucHJvdG90eXBlLm1pbiA9IEdlbmVyaWNDb2xsZWN0aW9uLnByb3RvdHlwZS5taW47XG5JdGVyYXRvci5wcm90b3R5cGUubWF4ID0gR2VuZXJpY0NvbGxlY3Rpb24ucHJvdG90eXBlLm1heDtcbkl0ZXJhdG9yLnByb3RvdHlwZS5zdW0gPSBHZW5lcmljQ29sbGVjdGlvbi5wcm90b3R5cGUuc3VtO1xuSXRlcmF0b3IucHJvdG90eXBlLmF2ZXJhZ2UgPSBHZW5lcmljQ29sbGVjdGlvbi5wcm90b3R5cGUuYXZlcmFnZTtcbkl0ZXJhdG9yLnByb3RvdHlwZS5mbGF0dGVuID0gR2VuZXJpY0NvbGxlY3Rpb24ucHJvdG90eXBlLmZsYXR0ZW47XG5JdGVyYXRvci5wcm90b3R5cGUuemlwID0gR2VuZXJpY0NvbGxlY3Rpb24ucHJvdG90eXBlLnppcDtcbkl0ZXJhdG9yLnByb3RvdHlwZS5lbnVtZXJhdGUgPSBHZW5lcmljQ29sbGVjdGlvbi5wcm90b3R5cGUuZW51bWVyYXRlO1xuSXRlcmF0b3IucHJvdG90eXBlLnNvcnRlZCA9IEdlbmVyaWNDb2xsZWN0aW9uLnByb3RvdHlwZS5zb3J0ZWQ7XG5JdGVyYXRvci5wcm90b3R5cGUuZ3JvdXAgPSBHZW5lcmljQ29sbGVjdGlvbi5wcm90b3R5cGUuZ3JvdXA7XG5JdGVyYXRvci5wcm90b3R5cGUucmV2ZXJzZWQgPSBHZW5lcmljQ29sbGVjdGlvbi5wcm90b3R5cGUucmV2ZXJzZWQ7XG5JdGVyYXRvci5wcm90b3R5cGUudG9BcnJheSA9IEdlbmVyaWNDb2xsZWN0aW9uLnByb3RvdHlwZS50b0FycmF5O1xuSXRlcmF0b3IucHJvdG90eXBlLnRvT2JqZWN0ID0gR2VuZXJpY0NvbGxlY3Rpb24ucHJvdG90eXBlLnRvT2JqZWN0O1xuSXRlcmF0b3IucHJvdG90eXBlLml0ZXJhdG9yID0gR2VuZXJpY0NvbGxlY3Rpb24ucHJvdG90eXBlLml0ZXJhdG9yO1xuXG5JdGVyYXRvci5wcm90b3R5cGUuX19pdGVyYXRpb25PYmplY3QgPSBudWxsO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KEl0ZXJhdG9yLnByb3RvdHlwZSxcIl9pdGVyYXRpb25PYmplY3RcIiwge1xuICAgIGdldDogZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9faXRlcmF0aW9uT2JqZWN0IHx8ICh0aGlzLl9faXRlcmF0aW9uT2JqZWN0ID0geyBkb25lOiBmYWxzZSwgdmFsdWU6dm9pZCAwfSk7XG4gICAgfVxufSk7XG5cblxuLy8gdGhpcyBpcyBhIGJpdCBvZiBhIGNoZWF0IHNvIGZsYXR0ZW4gYW5kIHN1Y2ggd29yayB3aXRoIHRoZSBnZW5lcmljXG4vLyByZWR1Y2libGVcbkl0ZXJhdG9yLnByb3RvdHlwZS5jb25zdHJ1Y3RDbG9uZSA9IGZ1bmN0aW9uICh2YWx1ZXMpIHtcbiAgICB2YXIgY2xvbmUgPSBbXTtcbiAgICBjbG9uZS5hZGRFYWNoKHZhbHVlcyk7XG4gICAgcmV0dXJuIGNsb25lO1xufTtcblxuSXRlcmF0b3IucHJvdG90eXBlLm1hcEl0ZXJhdG9yID0gZnVuY3Rpb24gKGNhbGxiYWNrIC8qLCB0aGlzcCovKSB7XG4gICAgdmFyIHNlbGYgPSBJdGVyYXRvcih0aGlzKSxcbiAgICAgICAgdGhpc3AgPSBhcmd1bWVudHNbMV0sXG4gICAgICAgIGkgPSAwO1xuXG4gICAgaWYgKE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbChjYWxsYmFjaykgIT0gXCJbb2JqZWN0IEZ1bmN0aW9uXVwiKVxuICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCk7XG5cbiAgICByZXR1cm4gbmV3IHNlbGYuY29uc3RydWN0b3IoZnVuY3Rpb24gKCkge1xuICAgICAgICBpZihzZWxmLl9pdGVyYXRpb25PYmplY3QuZG9uZSAhPT0gdHJ1ZSkge1xuICAgICAgICAgICAgdmFyIGNhbGxiYWNrVmFsdWUgPSBjYWxsYmFjay5jYWxsKHRoaXNwLCBzZWxmLm5leHQoKS52YWx1ZSwgaSsrLCBzZWxmKTtcbiAgICAgICAgICAgIHNlbGYuX2l0ZXJhdGlvbk9iamVjdC52YWx1ZSA9IGNhbGxiYWNrVmFsdWU7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHNlbGYuX2l0ZXJhdGlvbk9iamVjdDtcbiAgICB9KTtcbn07XG5cbkl0ZXJhdG9yLnByb3RvdHlwZS5maWx0ZXJJdGVyYXRvciA9IGZ1bmN0aW9uIChjYWxsYmFjayAvKiwgdGhpc3AqLykge1xuICAgIHZhciBzZWxmID0gSXRlcmF0b3IodGhpcyksXG4gICAgICAgIHRoaXNwID0gYXJndW1lbnRzWzFdLFxuICAgICAgICBpID0gMDtcblxuICAgIGlmIChPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwoY2FsbGJhY2spICE9IFwiW29iamVjdCBGdW5jdGlvbl1cIilcbiAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcigpO1xuXG4gICAgcmV0dXJuIG5ldyBzZWxmLmNvbnN0cnVjdG9yKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdmFyIG5leHRFbnRyeTtcbiAgICAgICAgd2hpbGUgKHRydWUpIHtcbiAgICAgICAgICAgIG5leHRFbnRyeSA9IHNlbGYubmV4dCgpO1xuICAgICAgICAgICAgaWYobmV4dEVudHJ5LmRvbmUgIT09IHRydWUpIHtcbiAgICAgICAgICAgICAgICBpZiAoY2FsbGJhY2suY2FsbCh0aGlzcCwgbmV4dEVudHJ5LnZhbHVlLCBpKyssIHNlbGYpKVxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gbmV4dEVudHJ5O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgLy9kb25lIHRydWUgYW5kIHZhbHVlIHVuZGVmaW5lZCBhdCB0aGlzIHBvaW50XG4gICAgICAgICAgICAgICAgcmV0dXJuIG5leHRFbnRyeTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH0pO1xufTtcblxuSXRlcmF0b3IucHJvdG90eXBlLnJlZHVjZSA9IGZ1bmN0aW9uIChjYWxsYmFjayAvKiwgaW5pdGlhbCwgdGhpc3AqLykge1xuICAgIHZhciBzZWxmID0gSXRlcmF0b3IodGhpcyksXG4gICAgICAgIHJlc3VsdCA9IGFyZ3VtZW50c1sxXSxcbiAgICAgICAgdGhpc3AgPSBhcmd1bWVudHNbMl0sXG4gICAgICAgIGkgPSAwLFxuICAgICAgICBuZXh0RW50cnk7XG5cbiAgICBpZiAoT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKGNhbGxiYWNrKSAhPSBcIltvYmplY3QgRnVuY3Rpb25dXCIpXG4gICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoKTtcblxuICAgIC8vIGZpcnN0IGl0ZXJhdGlvbiB1bnJvbGxlZFxuICAgIG5leHRFbnRyeSA9IHNlbGYubmV4dCgpO1xuICAgIGlmKG5leHRFbnRyeS5kb25lID09PSB0cnVlKSB7XG4gICAgICAgIGlmIChhcmd1bWVudHMubGVuZ3RoID4gMSkge1xuICAgICAgICAgICAgcmV0dXJuIGFyZ3VtZW50c1sxXTsgLy8gaW5pdGlhbFxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhyb3cgVHlwZUVycm9yKFwiY2Fubm90IHJlZHVjZSBhIHZhbHVlIGZyb20gYW4gZW1wdHkgaXRlcmF0b3Igd2l0aCBubyBpbml0aWFsIHZhbHVlXCIpO1xuICAgICAgICB9XG4gICAgfVxuICAgIGlmIChhcmd1bWVudHMubGVuZ3RoID4gMSkge1xuICAgICAgICByZXN1bHQgPSBjYWxsYmFjay5jYWxsKHRoaXNwLCByZXN1bHQsIG5leHRFbnRyeS52YWx1ZSwgaSwgc2VsZik7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgcmVzdWx0ID0gbmV4dEVudHJ5LnZhbHVlO1xuICAgIH1cbiAgICBpKys7XG4gICAgLy8gcmVtYWluaW5nIGVudHJpZXNcbiAgICB3aGlsZSAodHJ1ZSkge1xuICAgICAgICBuZXh0RW50cnkgPSBzZWxmLm5leHQoKTtcbiAgICAgICAgaWYobmV4dEVudHJ5LmRvbmUgPT09IHRydWUpIHtcbiAgICAgICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgICAgIH1cbiAgICAgICAgcmVzdWx0ID0gY2FsbGJhY2suY2FsbCh0aGlzcCwgcmVzdWx0LCBuZXh0RW50cnkudmFsdWUsIGksIHNlbGYpO1xuICAgICAgICBpKys7XG4gICAgfVxuXG59O1xuXG5JdGVyYXRvci5wcm90b3R5cGUuY29uY2F0ID0gZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiBJdGVyYXRvci5jb25jYXQoXG4gICAgICAgIEFycmF5LnByb3RvdHlwZS5jb25jYXQuYXBwbHkodGhpcywgYXJndW1lbnRzKVxuICAgICk7XG59O1xuXG5JdGVyYXRvci5wcm90b3R5cGUuZHJvcFdoaWxlID0gZnVuY3Rpb24gKGNhbGxiYWNrIC8qLCB0aGlzcCAqLykge1xuICAgIHZhciBzZWxmID0gSXRlcmF0b3IodGhpcyksXG4gICAgICAgIHRoaXNwID0gYXJndW1lbnRzWzFdLFxuICAgICAgICBzdG9wcGVkID0gZmFsc2UsXG4gICAgICAgIHN0b3BWYWx1ZSxcbiAgICAgICAgbmV4dEVudHJ5LFxuICAgICAgICBpID0gMDtcblxuICAgIGlmIChPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwoY2FsbGJhY2spICE9IFwiW29iamVjdCBGdW5jdGlvbl1cIilcbiAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcigpO1xuXG4gICAgd2hpbGUgKHRydWUpIHtcbiAgICAgICAgbmV4dEVudHJ5ID0gc2VsZi5uZXh0KCk7XG4gICAgICAgIGlmKG5leHRFbnRyeS5kb25lID09PSB0cnVlKSB7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgICBpZiAoIWNhbGxiYWNrLmNhbGwodGhpc3AsIG5leHRFbnRyeS52YWx1ZSwgaSwgc2VsZikpIHtcbiAgICAgICAgICAgIHN0b3BwZWQgPSB0cnVlO1xuICAgICAgICAgICAgc3RvcFZhbHVlID0gbmV4dEVudHJ5LnZhbHVlO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgICAgaSsrO1xuICAgIH1cblxuICAgIGlmIChzdG9wcGVkKSB7XG4gICAgICAgIHJldHVybiBzZWxmLmNvbnN0cnVjdG9yKFtzdG9wVmFsdWVdKS5jb25jYXQoc2VsZik7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIHNlbGYuY29uc3RydWN0b3IoW10pO1xuICAgIH1cbn07XG5cbkl0ZXJhdG9yLnByb3RvdHlwZS50YWtlV2hpbGUgPSBmdW5jdGlvbiAoY2FsbGJhY2sgLyosIHRoaXNwKi8pIHtcbiAgICB2YXIgc2VsZiA9IEl0ZXJhdG9yKHRoaXMpLFxuICAgICAgICB0aGlzcCA9IGFyZ3VtZW50c1sxXSxcbiAgICAgICAgbmV4dEVudHJ5LFxuICAgICAgICBpID0gMDtcblxuICAgIGlmIChPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwoY2FsbGJhY2spICE9IFwiW29iamVjdCBGdW5jdGlvbl1cIilcbiAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcigpO1xuXG4gICAgcmV0dXJuIG5ldyBzZWxmLmNvbnN0cnVjdG9yKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgaWYoc2VsZi5faXRlcmF0aW9uT2JqZWN0LmRvbmUgIT09IHRydWUpIHtcbiAgICAgICAgICAgIHZhciB2YWx1ZSA9IHNlbGYubmV4dCgpLnZhbHVlO1xuICAgICAgICAgICAgaWYoY2FsbGJhY2suY2FsbCh0aGlzcCwgdmFsdWUsIGkrKywgc2VsZikpIHtcbiAgICAgICAgICAgICAgICBzZWxmLl9pdGVyYXRpb25PYmplY3QudmFsdWUgPSB2YWx1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIHNlbGYuX2l0ZXJhdGlvbk9iamVjdC5kb25lID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICBzZWxmLl9pdGVyYXRpb25PYmplY3QudmFsdWUgPSB2b2lkIDA7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHNlbGYuX2l0ZXJhdGlvbk9iamVjdDtcbiAgICB9KTtcblxufTtcblxuSXRlcmF0b3IucHJvdG90eXBlLnppcEl0ZXJhdG9yID0gZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiBJdGVyYXRvci51bnppcChcbiAgICAgICAgQXJyYXkucHJvdG90eXBlLmNvbmNhdC5hcHBseSh0aGlzLCBhcmd1bWVudHMpXG4gICAgKTtcbn07XG5cbkl0ZXJhdG9yLnByb3RvdHlwZS5lbnVtZXJhdGVJdGVyYXRvciA9IGZ1bmN0aW9uIChzdGFydCkge1xuICAgIHJldHVybiBJdGVyYXRvci5jb3VudChzdGFydCkuemlwSXRlcmF0b3IodGhpcyk7XG59O1xuXG4vLyBjcmVhdGVzIGFuIGl0ZXJhdG9yIGZvciBBcnJheSBhbmQgU3RyaW5nXG5JdGVyYXRvci5pdGVyYXRlID0gZnVuY3Rpb24gKGl0ZXJhYmxlKSB7XG4gICAgdmFyIHN0YXJ0O1xuICAgIHN0YXJ0ID0gMDtcbiAgICByZXR1cm4gbmV3IEl0ZXJhdG9yKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgLy8gYWR2YW5jZSB0byBuZXh0IG93bmVkIGVudHJ5XG4gICAgICAgIGlmICh0eXBlb2YgaXRlcmFibGUgPT09IFwib2JqZWN0XCIpIHtcbiAgICAgICAgICAgIHdoaWxlICghKHN0YXJ0IGluIGl0ZXJhYmxlKSkge1xuICAgICAgICAgICAgICAgIC8vIGRlbGliZXJhdGVseSBsYXRlIGJvdW5kXG4gICAgICAgICAgICAgICAgaWYgKHN0YXJ0ID49IGl0ZXJhYmxlLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLl9pdGVyYXRpb25PYmplY3QuZG9uZSA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX2l0ZXJhdGlvbk9iamVjdC52YWx1ZSA9IHZvaWQgMDtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2Ugc3RhcnQgKz0gMTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIGlmIChzdGFydCA+PSBpdGVyYWJsZS5sZW5ndGgpIHtcbiAgICAgICAgICAgIHRoaXMuX2l0ZXJhdGlvbk9iamVjdC5kb25lID0gdHJ1ZTtcbiAgICAgICAgICAgIHRoaXMuX2l0ZXJhdGlvbk9iamVjdC52YWx1ZSA9IHZvaWQgMDtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmKCF0aGlzLl9pdGVyYXRpb25PYmplY3QuZG9uZSkge1xuICAgICAgICAgICAgdGhpcy5faXRlcmF0aW9uT2JqZWN0LnZhbHVlID0gaXRlcmFibGVbc3RhcnRdO1xuICAgICAgICAgICAgc3RhcnQgKz0gMTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcy5faXRlcmF0aW9uT2JqZWN0O1xuICAgIH0pO1xufTtcblxuSXRlcmF0b3IuY3ljbGUgPSBmdW5jdGlvbiAoY3ljbGUsIHRpbWVzKSB7XG4gICAgdmFyIG5leHQ7XG4gICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPCAyKVxuICAgICAgICB0aW1lcyA9IEluZmluaXR5O1xuICAgIC8vY3ljbGUgPSBJdGVyYXRvcihjeWNsZSkudG9BcnJheSgpO1xuICAgIHJldHVybiBuZXcgSXRlcmF0b3IoZnVuY3Rpb24gKCkge1xuICAgICAgICB2YXIgaXRlcmF0aW9uLCBuZXh0RW50cnk7XG5cbiAgICAgICAgaWYobmV4dCkge1xuICAgICAgICAgICAgbmV4dEVudHJ5ID0gbmV4dCgpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYoIW5leHQgfHwgbmV4dEVudHJ5LmRvbmUgPT09IHRydWUpIHtcbiAgICAgICAgICAgIGlmICh0aW1lcyA+IDApIHtcbiAgICAgICAgICAgICAgICB0aW1lcy0tO1xuICAgICAgICAgICAgICAgIGl0ZXJhdGlvbiA9IEl0ZXJhdG9yLml0ZXJhdGUoY3ljbGUpO1xuICAgICAgICAgICAgICAgIG5leHRFbnRyeSA9IChuZXh0ID0gaXRlcmF0aW9uLm5leHQuYmluZChpdGVyYXRpb24pKSgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhpcy5faXRlcmF0aW9uT2JqZWN0LmRvbmUgPSB0cnVlO1xuICAgICAgICAgICAgICAgIG5leHRFbnRyeSA9IHRoaXMuX2l0ZXJhdGlvbk9iamVjdDsgICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG5leHRFbnRyeTtcbiAgICB9KTtcbn07XG5cbkl0ZXJhdG9yLmNvbmNhdCA9IGZ1bmN0aW9uIChpdGVyYXRvcnMpIHtcbiAgICBpdGVyYXRvcnMgPSBJdGVyYXRvcihpdGVyYXRvcnMpO1xuICAgIHZhciBuZXh0O1xuICAgIHJldHVybiBuZXcgSXRlcmF0b3IoZnVuY3Rpb24gKCl7XG4gICAgICAgIHZhciBpdGVyYXRpb24sIG5leHRFbnRyeTtcbiAgICAgICAgaWYobmV4dCkgbmV4dEVudHJ5ID0gbmV4dCgpO1xuICAgICAgICBpZighbmV4dEVudHJ5IHx8IG5leHRFbnRyeS5kb25lID09PSB0cnVlKSB7XG4gICAgICAgICAgICBuZXh0RW50cnkgPSBpdGVyYXRvcnMubmV4dCgpO1xuICAgICAgICAgICAgaWYobmV4dEVudHJ5LmRvbmUgPT09IGZhbHNlKSB7XG4gICAgICAgICAgICAgICAgaXRlcmF0aW9uID0gSXRlcmF0b3IobmV4dEVudHJ5LnZhbHVlKTtcbiAgICAgICAgICAgICAgICBuZXh0ID0gaXRlcmF0aW9uLm5leHQuYmluZChpdGVyYXRpb24pO1xuICAgICAgICAgICAgICAgIHJldHVybiBuZXh0KCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gbmV4dEVudHJ5O1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGVsc2UgcmV0dXJuIG5leHRFbnRyeTtcbiAgICB9KTtcbn07XG5cbkl0ZXJhdG9yLnVuemlwID0gZnVuY3Rpb24gKGl0ZXJhdG9ycykge1xuICAgIGl0ZXJhdG9ycyA9IEl0ZXJhdG9yKGl0ZXJhdG9ycykubWFwKEl0ZXJhdG9yKTtcbiAgICBpZiAoaXRlcmF0b3JzLmxlbmd0aCA9PT0gMClcbiAgICAgICAgcmV0dXJuIG5ldyBJdGVyYXRvcihbXSk7XG4gICAgcmV0dXJuIG5ldyBJdGVyYXRvcihmdW5jdGlvbiAoKSB7XG4gICAgICAgIHZhciBzdG9wcGVkLCBuZXh0RW50cnk7XG4gICAgICAgIHZhciByZXN1bHQgPSBpdGVyYXRvcnMubWFwKGZ1bmN0aW9uIChpdGVyYXRvcikge1xuICAgICAgICAgICAgbmV4dEVudHJ5ID0gaXRlcmF0b3IubmV4dCgpO1xuICAgICAgICAgICAgaWYgKG5leHRFbnRyeS5kb25lID09PSB0cnVlICkge1xuICAgICAgICAgICAgICAgIHN0b3BwZWQgPSB0cnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIG5leHRFbnRyeS52YWx1ZTtcbiAgICAgICAgfSk7XG4gICAgICAgIGlmIChzdG9wcGVkKSB7XG4gICAgICAgICAgICB0aGlzLl9pdGVyYXRpb25PYmplY3QuZG9uZSA9IHRydWU7XG4gICAgICAgICAgICB0aGlzLl9pdGVyYXRpb25PYmplY3QudmFsdWUgPSB2b2lkIDA7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICB0aGlzLl9pdGVyYXRpb25PYmplY3QudmFsdWUgPSByZXN1bHQ7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRoaXMuX2l0ZXJhdGlvbk9iamVjdDtcbiAgICB9KTtcbn07XG5cbkl0ZXJhdG9yLnppcCA9IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gSXRlcmF0b3IudW56aXAoXG4gICAgICAgIEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFyZ3VtZW50cylcbiAgICApO1xufTtcblxuSXRlcmF0b3IuY2hhaW4gPSBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIEl0ZXJhdG9yLmNvbmNhdChcbiAgICAgICAgQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzKVxuICAgICk7XG59O1xuXG5JdGVyYXRvci5yYW5nZSA9IGZ1bmN0aW9uIChzdGFydCwgc3RvcCwgc3RlcCkge1xuICAgIGlmIChhcmd1bWVudHMubGVuZ3RoIDwgMykge1xuICAgICAgICBzdGVwID0gMTtcbiAgICB9XG4gICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPCAyKSB7XG4gICAgICAgIHN0b3AgPSBzdGFydDtcbiAgICAgICAgc3RhcnQgPSAwO1xuICAgIH1cbiAgICBzdGFydCA9IHN0YXJ0IHx8IDA7XG4gICAgc3RlcCA9IHN0ZXAgfHwgMTtcbiAgICByZXR1cm4gbmV3IEl0ZXJhdG9yKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgaWYgKHN0YXJ0ID49IHN0b3ApIHtcbiAgICAgICAgICAgIHRoaXMuX2l0ZXJhdGlvbk9iamVjdC5kb25lID0gdHJ1ZTtcbiAgICAgICAgICAgIHRoaXMuX2l0ZXJhdGlvbk9iamVjdC52YWx1ZSA9IHZvaWQgMDtcbiAgICAgICAgfVxuICAgICAgICB2YXIgcmVzdWx0ID0gc3RhcnQ7XG4gICAgICAgIHN0YXJ0ICs9IHN0ZXA7XG4gICAgICAgIHRoaXMuX2l0ZXJhdGlvbk9iamVjdC52YWx1ZSA9IHJlc3VsdDtcblxuICAgICAgICByZXR1cm4gdGhpcy5faXRlcmF0aW9uT2JqZWN0O1xuICAgIH0pO1xufTtcblxuSXRlcmF0b3IuY291bnQgPSBmdW5jdGlvbiAoc3RhcnQsIHN0ZXApIHtcbiAgICByZXR1cm4gSXRlcmF0b3IucmFuZ2Uoc3RhcnQsIEluZmluaXR5LCBzdGVwKTtcbn07XG5cbkl0ZXJhdG9yLnJlcGVhdCA9IGZ1bmN0aW9uICh2YWx1ZSwgdGltZXMpIHtcbiAgICByZXR1cm4gbmV3IEl0ZXJhdG9yLnJhbmdlKHRpbWVzKS5tYXBJdGVyYXRvcihmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiB2YWx1ZTtcbiAgICB9KTtcbn07XG4iLCIvKlxuICAgIENvcHlyaWdodCAoYykgMjAxNiwgTW9udGFnZSBTdHVkaW8gSW5jLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICAgIDMtQ2xhdXNlIEJTRCBMaWNlbnNlXG4gICAgaHR0cHM6Ly9naXRodWIuY29tL21vbnRhZ2Vqcy9tb250YWdlL2Jsb2IvbWFzdGVyL0xJQ0VOU0UubWRcbiovXG5cbnZhciBNYXAgPSByZXF1aXJlKFwiLi4vX21hcFwiKTtcblxudmFyIE9iamVjdENoYW5nZURlc2NyaXB0b3IgPSBtb2R1bGUuZXhwb3J0cy5PYmplY3RDaGFuZ2VEZXNjcmlwdG9yID0gZnVuY3Rpb24gT2JqZWN0Q2hhbmdlRGVzY3JpcHRvcihuYW1lKSB7XG4gICAgdGhpcy5uYW1lID0gbmFtZTtcbiAgICB0aGlzLmlzQWN0aXZlID0gZmFsc2U7XG4gICAgdGhpcy5fd2lsbENoYW5nZUxpc3RlbmVycyA9IG51bGw7XG4gICAgdGhpcy5fY2hhbmdlTGlzdGVuZXJzID0gbnVsbDtcblx0cmV0dXJuIHRoaXM7XG59XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0aWVzKE9iamVjdENoYW5nZURlc2NyaXB0b3IucHJvdG90eXBlLHtcbiAgICBuYW1lOiB7XG5cdFx0dmFsdWU6bnVsbCxcblx0XHR3cml0YWJsZTogdHJ1ZVxuXHR9LFxuICAgIGlzQWN0aXZlOiB7XG5cdFx0dmFsdWU6ZmFsc2UsXG5cdFx0d3JpdGFibGU6IHRydWVcblx0fSxcblx0X3dpbGxDaGFuZ2VMaXN0ZW5lcnM6IHtcblx0XHR2YWx1ZTpudWxsLFxuXHRcdHdyaXRhYmxlOiB0cnVlXG5cdH0sXG5cdHdpbGxDaGFuZ2VMaXN0ZW5lcnM6IHtcblx0XHRnZXQ6IGZ1bmN0aW9uKCkge1xuXHRcdFx0cmV0dXJuIHRoaXMuX3dpbGxDaGFuZ2VMaXN0ZW5lcnMgfHwgKHRoaXMuX3dpbGxDaGFuZ2VMaXN0ZW5lcnMgPSBuZXcgdGhpcy53aWxsQ2hhbmdlTGlzdGVuZXJzUmVjb3JkQ29uc3RydWN0b3IodGhpcy5uYW1lKSk7XG5cdFx0fVxuXHR9LFxuXHRfY2hhbmdlTGlzdGVuZXJzOiB7XG5cdFx0dmFsdWU6bnVsbCxcblx0XHR3cml0YWJsZTogdHJ1ZVxuXHR9LFxuICAgIGNoYW5nZUxpc3RlbmVyczoge1xuXHRcdGdldDogZnVuY3Rpb24oKSB7XG5cdFx0XHRyZXR1cm4gdGhpcy5fY2hhbmdlTGlzdGVuZXJzIHx8ICh0aGlzLl9jaGFuZ2VMaXN0ZW5lcnMgPSBuZXcgdGhpcy5jaGFuZ2VMaXN0ZW5lcnNSZWNvcmRDb25zdHJ1Y3Rvcih0aGlzLm5hbWUpKTtcblx0XHR9XG5cdH0sXG4gICAgY2hhbmdlTGlzdGVuZXJzUmVjb3JkQ29uc3RydWN0b3I6IHtcbiAgICAgICAgdmFsdWU6Q2hhbmdlTGlzdGVuZXJzUmVjb3JkLFxuICAgICAgICB3cml0YWJsZTogdHJ1ZVxuICAgIH0sXG4gICAgd2lsbENoYW5nZUxpc3RlbmVyc1JlY29yZENvbnN0cnVjdG9yOiB7XG4gICAgICAgIHZhbHVlOkNoYW5nZUxpc3RlbmVyc1JlY29yZCxcbiAgICAgICAgd3JpdGFibGU6IHRydWVcbiAgICB9XG5cbn0pO1xuXG52YXIgTGlzdGVuZXJHaG9zdCA9IG1vZHVsZS5leHBvcnRzLkxpc3RlbmVyR2hvc3QgPSBPYmplY3QuY3JlYXRlKG51bGwpO1xudmFyIENoYW5nZUxpc3RlbmVyU3BlY2lmaWNIYW5kbGVyTWV0aG9kTmFtZSA9IG5ldyBNYXAoKTtcblxuIG1vZHVsZS5leHBvcnRzLkNoYW5nZUxpc3RlbmVyc1JlY29yZCA9IENoYW5nZUxpc3RlbmVyc1JlY29yZDtcbmZ1bmN0aW9uIENoYW5nZUxpc3RlbmVyc1JlY29yZChuYW1lKSB7XG4gICAgdmFyIHNwZWNpZmljSGFuZGxlck1ldGhvZE5hbWUgPSBDaGFuZ2VMaXN0ZW5lclNwZWNpZmljSGFuZGxlck1ldGhvZE5hbWUuZ2V0KG5hbWUpO1xuICAgIGlmKCFzcGVjaWZpY0hhbmRsZXJNZXRob2ROYW1lKSB7XG4gICAgICAgIHNwZWNpZmljSGFuZGxlck1ldGhvZE5hbWUgPSBcImhhbmRsZVwiO1xuICAgICAgICBzcGVjaWZpY0hhbmRsZXJNZXRob2ROYW1lICs9IG5hbWU7XG4gICAgICAgIHNwZWNpZmljSGFuZGxlck1ldGhvZE5hbWUgKz0gXCJDaGFuZ2VcIjtcbiAgICAgICAgQ2hhbmdlTGlzdGVuZXJTcGVjaWZpY0hhbmRsZXJNZXRob2ROYW1lLnNldChuYW1lLHNwZWNpZmljSGFuZGxlck1ldGhvZE5hbWUpO1xuICAgIH1cbiAgICB0aGlzLl9jdXJyZW50ID0gbnVsbDtcbiAgICB0aGlzLl9jdXJyZW50ID0gbnVsbDtcbiAgICB0aGlzLnNwZWNpZmljSGFuZGxlck1ldGhvZE5hbWUgPSBzcGVjaWZpY0hhbmRsZXJNZXRob2ROYW1lO1xuICAgIHJldHVybiB0aGlzO1xufVxuXG5PYmplY3QuZGVmaW5lUHJvcGVydGllcyhDaGFuZ2VMaXN0ZW5lcnNSZWNvcmQucHJvdG90eXBlLHtcbiAgICBfY3VycmVudDoge1xuXHRcdHZhbHVlOiBudWxsLFxuXHRcdHdyaXRhYmxlOiB0cnVlXG5cdH0sXG5cdGN1cnJlbnQ6IHtcblx0XHRnZXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgLy8gaWYodGhpcy5fY3VycmVudCkge1xuICAgICAgICAgICAgLy8gICAgIGNvbnNvbGUubG9nKHRoaXMuY29uc3RydWN0b3IubmFtZSxcIiB3aXRoIFwiLHRoaXMuX2N1cnJlbnQubGVuZ3RoLFwiIGxpc3RlbmVyczogXCIsIHRoaXMuX2N1cnJlbnQpO1xuICAgICAgICAgICAgLy8gfVxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX2N1cnJlbnQ7XG4gICAgICAgICAgICAvL3JldHVybiB0aGlzLl9jdXJyZW50IHx8ICh0aGlzLl9jdXJyZW50ID0gW10pO1xuXHRcdH0sXG4gICAgICAgIHNldDogZnVuY3Rpb24odmFsdWUpIHtcbiAgICAgICAgICAgIHRoaXMuX2N1cnJlbnQgPSB2YWx1ZTtcbiAgICAgICAgfVxuXHR9LFxuICAgIExpc3RlbmVyR2hvc3Q6IHtcbiAgICAgICAgdmFsdWU6TGlzdGVuZXJHaG9zdCxcbiAgICAgICAgd3JpdGFibGU6IHRydWVcbiAgICB9LFxuICAgIGdob3N0Q291bnQ6IHtcbiAgICAgICAgdmFsdWU6MCxcbiAgICAgICAgd3JpdGFibGU6IHRydWVcbiAgICB9LFxuICAgIG1heExpc3RlbmVyR2hvc3RSYXRpbzoge1xuICAgICAgICB2YWx1ZTowLjMsXG4gICAgICAgIHdyaXRhYmxlOiB0cnVlXG4gICAgfSxcbiAgICBsaXN0ZW5lckdob3N0RmlsdGVyOiB7XG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiBsaXN0ZW5lckdob3N0RmlsdGVyKHZhbHVlKSB7XG4gICAgICAgICAgcmV0dXJuIHZhbHVlICE9PSB0aGlzLkxpc3RlbmVyR2hvc3Q7XG4gICAgICB9XG4gICAgfSxcbiAgICByZW1vdmVDdXJyZW50R29zdExpc3RlbmVyc0lmTmVlZGVkOiB7XG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIGlmKHRoaXMuX2N1cnJlbnQgJiYgdGhpcy5naG9zdENvdW50L3RoaXMuX2N1cnJlbnQubGVuZ3RoPnRoaXMubWF4TGlzdGVuZXJHaG9zdFJhdGlvKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5naG9zdENvdW50ID0gMDtcbiAgICAgICAgICAgICAgICB0aGlzLl9jdXJyZW50ID0gdGhpcy5fY3VycmVudC5maWx0ZXIodGhpcy5saXN0ZW5lckdob3N0RmlsdGVyLHRoaXMpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX2N1cnJlbnQ7XG4gICAgICAgIH1cbiAgICB9LFxuICAgIGRpc3BhdGNoQmVmb3JlQ2hhbmdlOiB7XG4gICAgICAgIHZhbHVlOiBmYWxzZSxcbiAgICAgICAgd3JpdGFibGU6IHRydWVcbiAgICB9LFxuICAgIGdlbmVyaWNIYW5kbGVyTWV0aG9kTmFtZToge1xuXHRcdHZhbHVlOiBcImhhbmRsZVByb3BlcnR5Q2hhbmdlXCIsXG4gICAgICAgIHdyaXRhYmxlOiB0cnVlXG5cdH1cbn0pO1xuXG5tb2R1bGUuZXhwb3J0cy5XaWxsQ2hhbmdlTGlzdGVuZXJzUmVjb3JkID0gV2lsbENoYW5nZUxpc3RlbmVyc1JlY29yZDtcbnZhciBXaWxsQ2hhbmdlTGlzdGVuZXJTcGVjaWZpY0hhbmRsZXJNZXRob2ROYW1lID0gbmV3IE1hcCgpO1xuZnVuY3Rpb24gV2lsbENoYW5nZUxpc3RlbmVyc1JlY29yZChuYW1lKSB7XG4gICAgdmFyIHNwZWNpZmljSGFuZGxlck1ldGhvZE5hbWUgPSBXaWxsQ2hhbmdlTGlzdGVuZXJTcGVjaWZpY0hhbmRsZXJNZXRob2ROYW1lLmdldChuYW1lKTtcbiAgICBpZighc3BlY2lmaWNIYW5kbGVyTWV0aG9kTmFtZSkge1xuICAgICAgICBzcGVjaWZpY0hhbmRsZXJNZXRob2ROYW1lID0gXCJoYW5kbGVcIjtcbiAgICAgICAgc3BlY2lmaWNIYW5kbGVyTWV0aG9kTmFtZSArPSBuYW1lO1xuICAgICAgICBzcGVjaWZpY0hhbmRsZXJNZXRob2ROYW1lICs9IFwiV2lsbENoYW5nZVwiO1xuICAgICAgICBXaWxsQ2hhbmdlTGlzdGVuZXJTcGVjaWZpY0hhbmRsZXJNZXRob2ROYW1lLnNldChuYW1lLHNwZWNpZmljSGFuZGxlck1ldGhvZE5hbWUpO1xuICAgIH1cbiAgICB0aGlzLnNwZWNpZmljSGFuZGxlck1ldGhvZE5hbWUgPSBzcGVjaWZpY0hhbmRsZXJNZXRob2ROYW1lO1xuXHRyZXR1cm4gdGhpcztcbn1cbldpbGxDaGFuZ2VMaXN0ZW5lcnNSZWNvcmQucHJvdG90eXBlID0gbmV3IENoYW5nZUxpc3RlbmVyc1JlY29yZCgpO1xuV2lsbENoYW5nZUxpc3RlbmVyc1JlY29yZC5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBXaWxsQ2hhbmdlTGlzdGVuZXJzUmVjb3JkO1xuV2lsbENoYW5nZUxpc3RlbmVyc1JlY29yZC5wcm90b3R5cGUuZ2VuZXJpY0hhbmRsZXJNZXRob2ROYW1lID0gXCJoYW5kbGVQcm9wZXJ0eVdpbGxDaGFuZ2VcIjtcbiIsIi8qXG4gICAgQmFzZWQgaW4gcGFydCBvbiBvYnNlcnZhYmxlIGFycmF5cyBmcm9tIE1vdG9yb2xhIE1vYmlsaXR54oCZcyBNb250YWdlXG4gICAgQ29weXJpZ2h0IChjKSAyMDEyLCBNb3Rvcm9sYSBNb2JpbGl0eSBMTEMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gICAgMy1DbGF1c2UgQlNEIExpY2Vuc2VcbiAgICBodHRwczovL2dpdGh1Yi5jb20vbW90b3JvbGEtbW9iaWxpdHkvbW9udGFnZS9ibG9iL21hc3Rlci9MSUNFTlNFLm1kXG4qL1xuXG4vKlxuICAgIFRoaXMgbW9kdWxlIGlzIHJlc3BvbnNpYmxlIGZvciBvYnNlcnZpbmcgY2hhbmdlcyB0byBvd25lZCBwcm9wZXJ0aWVzIG9mXG4gICAgb2JqZWN0cyBhbmQgY2hhbmdlcyB0byB0aGUgY29udGVudCBvZiBhcnJheXMgY2F1c2VkIGJ5IG1ldGhvZCBjYWxscy5cbiAgICBUaGUgaW50ZXJmYWNlIGZvciBvYnNlcnZpbmcgYXJyYXkgY29udGVudCBjaGFuZ2VzIGVzdGFibGlzaGVzIHRoZSBtZXRob2RzXG4gICAgbmVjZXNzYXJ5IGZvciBhbnkgY29sbGVjdGlvbiB3aXRoIG9ic2VydmFibGUgY29udGVudC5cbiovXG5cblxuXG4vLyBvYmplY3RIYXNPd25Qcm9wZXJ0eS5jYWxsKG15T2JqZWN0LCBrZXkpIHdpbGwgYmUgdXNlZCBpbnN0ZWFkIG9mXG4vLyBteU9iamVjdC5oYXNPd25Qcm9wZXJ0eShrZXkpIHRvIGFsbG93IG15T2JqZWN0IGhhdmUgZGVmaW5lZFxuLy8gYSBvd24gcHJvcGVydHkgY2FsbGVkIFwiaGFzT3duUHJvcGVydHlcIi5cblxudmFyIG9iamVjdEhhc093blByb3BlcnR5ID0gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eTtcblxuLy8gT2JqZWN0IHByb3BlcnR5IGRlc2NyaXB0b3JzIGNhcnJ5IGluZm9ybWF0aW9uIG5lY2Vzc2FyeSBmb3IgYWRkaW5nLFxuLy8gcmVtb3ZpbmcsIGRpc3BhdGNoaW5nLCBhbmQgc2hvcnRpbmcgZXZlbnRzIHRvIGxpc3RlbmVycyBmb3IgcHJvcGVydHkgY2hhbmdlc1xuLy8gZm9yIGEgcGFydGljdWxhciBrZXkgb24gYSBwYXJ0aWN1bGFyIG9iamVjdC4gIFRoZXNlIGRlc2NyaXB0b3JzIGFyZSB1c2VkXG4vLyBoZXJlIGZvciBzaGFsbG93IHByb3BlcnR5IGNoYW5nZXMuICBUaGUgY3VycmVudCBsaXN0ZW5lcnMgYXJlIHRoZSBvbmVzXG4vLyBtb2RpZmllZCBieSBhZGQgYW5kIHJlbW92ZSBvd24gcHJvcGVydHkgY2hhbmdlIGxpc3RlbmVyIG1ldGhvZHMuICBEdXJpbmdcbi8vIHByb3BlcnR5IGNoYW5nZSBkaXNwYXRjaCwgd2UgY2FwdHVyZSBhIHNuYXBzaG90IG9mIHRoZSBjdXJyZW50IGxpc3RlbmVycyBpblxuLy8gdGhlIGFjdGl2ZSBjaGFuZ2UgbGlzdGVuZXJzIGFycmF5LiAgVGhlIGRlc2NyaXB0b3IgYWxzbyBrZWVwcyBhIG1lbW8gb2YgdGhlXG4vLyBjb3JyZXNwb25kaW5nIGhhbmRsZXIgbWV0aG9kIG5hbWVzLlxuLy9cbi8vIHtcbi8vICAgICB3aWxsQ2hhbmdlTGlzdGVuZXJzOntjdXJyZW50LCBhY3RpdmU6QXJyYXk8RnVuY3Rpb24+LCAuLi5tZXRob2QgbmFtZXN9XG4vLyAgICAgY2hhbmdlTGlzdGVuZXJzOntjdXJyZW50LCBhY3RpdmU6QXJyYXk8RnVuY3Rpb24+LCAuLi5tZXRob2QgbmFtZXN9XG4vLyB9XG5cbi8vIE1heWJlIHJlbW92ZSBlbnRyaWVzIGZyb20gdGhpcyB0YWJsZSBpZiB0aGUgY29ycmVzcG9uZGluZyBvYmplY3Qgbm8gbG9uZ2VyXG4vLyBoYXMgYW55IHByb3BlcnR5IGNoYW5nZSBsaXN0ZW5lcnMgZm9yIGFueSBrZXkuICBIb3dldmVyLCB0aGUgY29zdCBvZlxuLy8gYm9vay1rZWVwaW5nIGlzIHByb2JhYmx5IG5vdCB3YXJyYW50ZWQgc2luY2UgaXQgd291bGQgYmUgcmFyZSBmb3IgYW5cbi8vIG9ic2VydmVkIG9iamVjdCB0byBubyBsb25nZXIgYmUgb2JzZXJ2ZWQgdW5sZXNzIGl0IHdhcyBhYm91dCB0byBiZSBkaXNwb3NlZFxuLy8gb2Ygb3IgcmV1c2VkIGFzIGFuIG9ic2VydmFibGUuICBUaGUgb25seSBiZW5lZml0IHdvdWxkIGJlIGluIGF2b2lkaW5nIGJ1bGtcbi8vIGNhbGxzIHRvIGRpc3BhdGNoT3duUHJvcGVydHlDaGFuZ2UgZXZlbnRzIG9uIG9iamVjdHMgdGhhdCBoYXZlIG5vIGxpc3RlbmVycy5cblxuLy8gIFRvIG9ic2VydmUgc2hhbGxvdyBwcm9wZXJ0eSBjaGFuZ2VzIGZvciBhIHBhcnRpY3VsYXIga2V5IG9mIGEgcGFydGljdWxhclxuLy8gIG9iamVjdCwgd2UgaW5zdGFsbCBhIHByb3BlcnR5IGRlc2NyaXB0b3Igb24gdGhlIG9iamVjdCB0aGF0IG92ZXJyaWRlcyB0aGUgcHJldmlvdXNcbi8vICBkZXNjcmlwdG9yLiAgVGhlIG92ZXJyaWRkZW4gZGVzY3JpcHRvcnMgYXJlIHN0b3JlZCBpbiB0aGlzIHdlYWsgbWFwLiAgVGhlXG4vLyAgd2VhayBtYXAgYXNzb2NpYXRlcyBhbiBvYmplY3Qgd2l0aCBhbm90aGVyIG9iamVjdCB0aGF0IG1hcHMgcHJvcGVydHkgbmFtZXNcbi8vICB0byBwcm9wZXJ0eSBkZXNjcmlwdG9ycy5cbi8vXG4vLyAgb2JqZWN0Ll9fb3ZlcnJpZGRlblByb3BlcnR5RGVzY3JpcHRvcnNfX1trZXldXG4vL1xuLy8gIFdlIHJldGFpbiB0aGUgb2xkIGRlc2NyaXB0b3IgZm9yIHZhcmlvdXMgcHVycG9zZXMuICBGb3Igb25lLCBpZiB0aGUgcHJvcGVydHlcbi8vICBpcyBubyBsb25nZXIgYmVpbmcgb2JzZXJ2ZWQgYnkgYW55b25lLCB3ZSByZXZlcnQgdGhlIHByb3BlcnR5IGRlc2NyaXB0b3IgdG9cbi8vICB0aGUgb3JpZ2luYWwuICBGb3IgXCJ2YWx1ZVwiIGRlc2NyaXB0b3JzLCB3ZSBzdG9yZSB0aGUgYWN0dWFsIHZhbHVlIG9mIHRoZVxuLy8gIGRlc2NyaXB0b3Igb24gdGhlIG92ZXJyaWRkZW4gZGVzY3JpcHRvciwgc28gd2hlbiB0aGUgcHJvcGVydHkgaXMgcmV2ZXJ0ZWQsIGl0XG4vLyAgcmV0YWlucyB0aGUgbW9zdCByZWNlbnRseSBzZXQgdmFsdWUuICBGb3IgXCJnZXRcIiBhbmQgXCJzZXRcIiBkZXNjcmlwdG9ycyxcbi8vICB3ZSBvYnNlcnZlIHRoZW4gZm9yd2FyZCBcImdldFwiIGFuZCBcInNldFwiIG9wZXJhdGlvbnMgdG8gdGhlIG9yaWdpbmFsIGRlc2NyaXB0b3IuXG5cbm1vZHVsZS5leHBvcnRzID0gUHJvcGVydHlDaGFuZ2VzO1xuXG5mdW5jdGlvbiBQcm9wZXJ0eUNoYW5nZXMoKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKFwiVGhpcyBpcyBhbiBhYnN0cmFjdCBpbnRlcmZhY2UuIE1peCBpdC4gRG9uJ3QgY29uc3RydWN0IGl0XCIpO1xufVxuXG5yZXF1aXJlKFwiLi4vc2hpbVwiKTtcbnZhciBNYXAgPSByZXF1aXJlKFwiLi4vX21hcFwiKTtcbnZhciBXZWFrTWFwID0gcmVxdWlyZShcIi4uL3dlYWstbWFwXCIpO1xudmFyIENoYW5nZURlc2NyaXB0b3IgPSByZXF1aXJlKFwiLi9jaGFuZ2UtZGVzY3JpcHRvclwiKSxcbiAgICBPYmplY3RDaGFuZ2VEZXNjcmlwdG9yID0gQ2hhbmdlRGVzY3JpcHRvci5PYmplY3RDaGFuZ2VEZXNjcmlwdG9yLFxuICAgIExpc3RlbmVyR2hvc3QgPSBDaGFuZ2VEZXNjcmlwdG9yLkxpc3RlbmVyR2hvc3Q7XG5cblByb3BlcnR5Q2hhbmdlcy5kZWJ1ZyA9IHRydWU7XG5cbnZhciBPYmplY3RzUHJvcGVydHlDaGFuZ2VMaXN0ZW5lcnMgPSBuZXcgV2Vha01hcCgpO1xuXG52YXIgT2JqZWN0Q2hhbmdlRGVzY3JpcHRvck5hbWUgPSBuZXcgTWFwKCk7XG5cblByb3BlcnR5Q2hhbmdlcy5PYmplY3RDaGFuZ2VEZXNjcmlwdG9yID0gZnVuY3Rpb24oKSB7XG5cbn1cblxuUHJvcGVydHlDaGFuZ2VzLnByb3RvdHlwZS5nZXRPd25Qcm9wZXJ0eUNoYW5nZURlc2NyaXB0b3IgPSBmdW5jdGlvbiAoa2V5KSB7XG4gICAgdmFyIG9iamVjdFByb3BlcnR5Q2hhbmdlRGVzY3JpcHRvcnMgPSBPYmplY3RzUHJvcGVydHlDaGFuZ2VMaXN0ZW5lcnMuZ2V0KHRoaXMpLCBrZXlDaGFuZ2VEZXNjcmlwdG9yO1xuICAgIGlmICghb2JqZWN0UHJvcGVydHlDaGFuZ2VEZXNjcmlwdG9ycykge1xuICAgICAgICBvYmplY3RQcm9wZXJ0eUNoYW5nZURlc2NyaXB0b3JzID0gT2JqZWN0LmNyZWF0ZShudWxsKTtcbiAgICAgICAgT2JqZWN0c1Byb3BlcnR5Q2hhbmdlTGlzdGVuZXJzLnNldCh0aGlzLG9iamVjdFByb3BlcnR5Q2hhbmdlRGVzY3JpcHRvcnMpO1xuICAgIH1cbiAgICBpZiAoIChrZXlDaGFuZ2VEZXNjcmlwdG9yID0gb2JqZWN0UHJvcGVydHlDaGFuZ2VEZXNjcmlwdG9yc1trZXldKSA9PT0gdm9pZCAwKSB7XG4gICAgICAgIHZhciBwcm9wZXJ0eU5hbWUgPSBPYmplY3RDaGFuZ2VEZXNjcmlwdG9yTmFtZS5nZXQoa2V5KTtcbiAgICAgICAgaWYoIXByb3BlcnR5TmFtZSkge1xuICAgICAgICAgICAgcHJvcGVydHlOYW1lID0gU3RyaW5nKGtleSk7XG4gICAgICAgICAgICBwcm9wZXJ0eU5hbWUgPSBwcm9wZXJ0eU5hbWUgJiYgcHJvcGVydHlOYW1lWzBdLnRvVXBwZXJDYXNlKCkgKyBwcm9wZXJ0eU5hbWUuc2xpY2UoMSk7XG4gICAgICAgICAgICBPYmplY3RDaGFuZ2VEZXNjcmlwdG9yTmFtZS5zZXQoa2V5LHByb3BlcnR5TmFtZSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG9iamVjdFByb3BlcnR5Q2hhbmdlRGVzY3JpcHRvcnNba2V5XSA9IG5ldyBPYmplY3RDaGFuZ2VEZXNjcmlwdG9yKHByb3BlcnR5TmFtZSk7XG4gICAgfVxuICAgIHJldHVybiBrZXlDaGFuZ2VEZXNjcmlwdG9yO1xufTtcblxuUHJvcGVydHlDaGFuZ2VzLnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eUNoYW5nZURlc2NyaXB0b3IgPSBmdW5jdGlvbiAoa2V5KSB7XG4gICAgdmFyIG9iamVjdFByb3BlcnR5Q2hhbmdlRGVzY3JpcHRvcnMgPSBPYmplY3RzUHJvcGVydHlDaGFuZ2VMaXN0ZW5lcnMuZ2V0KHRoaXMpO1xuICAgIGlmICghb2JqZWN0UHJvcGVydHlDaGFuZ2VEZXNjcmlwdG9ycykge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIGlmICgha2V5KSB7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbiAgICBpZiAob2JqZWN0UHJvcGVydHlDaGFuZ2VEZXNjcmlwdG9yc1trZXldID09PSB2b2lkIDApIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICByZXR1cm4gdHJ1ZTtcbn07XG5cblByb3BlcnR5Q2hhbmdlcy5wcm90b3R5cGUuYWRkT3duUHJvcGVydHlDaGFuZ2VMaXN0ZW5lciA9IGZ1bmN0aW9uIChrZXksIGxpc3RlbmVyLCBiZWZvcmVDaGFuZ2UpIHtcbiAgICBpZiAodGhpcy5tYWtlT2JzZXJ2YWJsZSAmJiAhdGhpcy5pc09ic2VydmFibGUpIHtcbiAgICAgICAgdGhpcy5tYWtlT2JzZXJ2YWJsZSgpOyAvLyBwYXJ0aWN1bGFybHkgZm9yIG9ic2VydmFibGUgYXJyYXlzLCBmb3JcbiAgICAgICAgLy8gdGhlaXIgbGVuZ3RoIHByb3BlcnR5XG4gICAgfVxuICAgIHZhciBkZXNjcmlwdG9yID0gUHJvcGVydHlDaGFuZ2VzLmdldE93blByb3BlcnR5Q2hhbmdlRGVzY3JpcHRvcih0aGlzLCBrZXkpLFxuICAgICAgICBsaXN0ZW5lcnMgPSBiZWZvcmVDaGFuZ2UgPyBkZXNjcmlwdG9yLndpbGxDaGFuZ2VMaXN0ZW5lcnMgOiBkZXNjcmlwdG9yLmNoYW5nZUxpc3RlbmVycztcblxuICAgIFByb3BlcnR5Q2hhbmdlcy5tYWtlUHJvcGVydHlPYnNlcnZhYmxlKHRoaXMsIGtleSk7XG5cbiAgICBpZighbGlzdGVuZXJzLl9jdXJyZW50KSB7XG4gICAgICAgIGxpc3RlbmVycy5fY3VycmVudCA9IGxpc3RlbmVyO1xuICAgIH1cbiAgICBlbHNlIGlmKCFBcnJheS5pc0FycmF5KGxpc3RlbmVycy5fY3VycmVudCkpIHtcbiAgICAgICAgbGlzdGVuZXJzLl9jdXJyZW50ID0gW2xpc3RlbmVycy5fY3VycmVudCxsaXN0ZW5lcl1cbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAgIGxpc3RlbmVycy5fY3VycmVudC5wdXNoKGxpc3RlbmVyKTtcbiAgICB9XG5cbiAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgcmV0dXJuIGZ1bmN0aW9uIGNhbmNlbE93blByb3BlcnR5Q2hhbmdlTGlzdGVuZXIoKSB7XG4gICAgICAgIFByb3BlcnR5Q2hhbmdlcy5yZW1vdmVPd25Qcm9wZXJ0eUNoYW5nZUxpc3RlbmVyKHNlbGYsIGtleSwgbGlzdGVuZXIsIGJlZm9yZUNoYW5nZSk7XG4gICAgICAgIHNlbGYgPSBudWxsO1xuICAgIH07XG59O1xuXG5Qcm9wZXJ0eUNoYW5nZXMucHJvdG90eXBlLmFkZEJlZm9yZU93blByb3BlcnR5Q2hhbmdlTGlzdGVuZXIgPSBmdW5jdGlvbiAoa2V5LCBsaXN0ZW5lcikge1xuICAgIHJldHVybiBQcm9wZXJ0eUNoYW5nZXMuYWRkT3duUHJvcGVydHlDaGFuZ2VMaXN0ZW5lcih0aGlzLCBrZXksIGxpc3RlbmVyLCB0cnVlKTtcbn07XG5cblByb3BlcnR5Q2hhbmdlcy5wcm90b3R5cGUucmVtb3ZlT3duUHJvcGVydHlDaGFuZ2VMaXN0ZW5lciA9IGZ1bmN0aW9uIHJlbW92ZU93blByb3BlcnR5Q2hhbmdlTGlzdGVuZXIoa2V5LCBsaXN0ZW5lciwgYmVmb3JlQ2hhbmdlKSB7XG4gICAgdmFyIGRlc2NyaXB0b3IgPSBQcm9wZXJ0eUNoYW5nZXMuZ2V0T3duUHJvcGVydHlDaGFuZ2VEZXNjcmlwdG9yKHRoaXMsIGtleSk7XG5cbiAgICB2YXIgbGlzdGVuZXJzO1xuICAgIGlmIChiZWZvcmVDaGFuZ2UpIHtcbiAgICAgICAgbGlzdGVuZXJzID0gZGVzY3JpcHRvci5fd2lsbENoYW5nZUxpc3RlbmVycztcbiAgICB9IGVsc2Uge1xuICAgICAgICBsaXN0ZW5lcnMgPSBkZXNjcmlwdG9yLl9jaGFuZ2VMaXN0ZW5lcnM7XG4gICAgfVxuXG4gICAgaWYobGlzdGVuZXJzKSB7XG4gICAgICAgIGlmKGxpc3RlbmVycy5fY3VycmVudCkge1xuICAgICAgICAgICAgaWYobGlzdGVuZXJzLl9jdXJyZW50ID09PSBsaXN0ZW5lcikge1xuICAgICAgICAgICAgICAgIGxpc3RlbmVycy5fY3VycmVudCA9IG51bGw7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcblxuICAgICAgICAgICAgICAgIHZhciBpbmRleCA9IGxpc3RlbmVycy5fY3VycmVudC5sYXN0SW5kZXhPZihsaXN0ZW5lcik7XG4gICAgICAgICAgICAgICAgaWYgKGluZGV4ID09PSAtMSkge1xuICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJDYW4ndCByZW1vdmUgcHJvcGVydHkgY2hhbmdlIGxpc3RlbmVyOiBkb2VzIG5vdCBleGlzdDogcHJvcGVydHkgbmFtZVwiICsgSlNPTi5zdHJpbmdpZnkoa2V5KSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmKGRlc2NyaXB0b3IuaXNBY3RpdmUpIHtcbiAgICAgICAgICAgICAgICAgICAgbGlzdGVuZXJzLmdob3N0Q291bnQgPSBsaXN0ZW5lcnMuZ2hvc3RDb3VudCsxO1xuICAgICAgICAgICAgICAgICAgICBsaXN0ZW5lcnMuX2N1cnJlbnRbaW5kZXhdPXJlbW92ZU93blByb3BlcnR5Q2hhbmdlTGlzdGVuZXIuTGlzdGVuZXJHaG9zdDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGxpc3RlbmVycy5fY3VycmVudC5zcGxpY2VPbmUoaW5kZXgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbn07XG5Qcm9wZXJ0eUNoYW5nZXMucHJvdG90eXBlLnJlbW92ZU93blByb3BlcnR5Q2hhbmdlTGlzdGVuZXIuTGlzdGVuZXJHaG9zdCA9IExpc3RlbmVyR2hvc3Q7XG5cblByb3BlcnR5Q2hhbmdlcy5wcm90b3R5cGUucmVtb3ZlQmVmb3JlT3duUHJvcGVydHlDaGFuZ2VMaXN0ZW5lciA9IGZ1bmN0aW9uIChrZXksIGxpc3RlbmVyKSB7XG4gICAgcmV0dXJuIFByb3BlcnR5Q2hhbmdlcy5yZW1vdmVPd25Qcm9wZXJ0eUNoYW5nZUxpc3RlbmVyKHRoaXMsIGtleSwgbGlzdGVuZXIsIHRydWUpO1xufTtcblxuUHJvcGVydHlDaGFuZ2VzLnByb3RvdHlwZS5kaXNwYXRjaE93blByb3BlcnR5Q2hhbmdlID0gZnVuY3Rpb24gZGlzcGF0Y2hPd25Qcm9wZXJ0eUNoYW5nZShrZXksIHZhbHVlLCBiZWZvcmVDaGFuZ2UpIHtcbiAgICB2YXIgZGVzY3JpcHRvciA9IFByb3BlcnR5Q2hhbmdlcy5nZXRPd25Qcm9wZXJ0eUNoYW5nZURlc2NyaXB0b3IodGhpcywga2V5KSxcbiAgICAgICAgbGlzdGVuZXJzO1xuXG4gICAgaWYgKCFkZXNjcmlwdG9yLmlzQWN0aXZlKSB7XG4gICAgICAgIGRlc2NyaXB0b3IuaXNBY3RpdmUgPSB0cnVlO1xuICAgICAgICBsaXN0ZW5lcnMgPSBiZWZvcmVDaGFuZ2UgPyBkZXNjcmlwdG9yLl93aWxsQ2hhbmdlTGlzdGVuZXJzOiBkZXNjcmlwdG9yLl9jaGFuZ2VMaXN0ZW5lcnM7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBkaXNwYXRjaE93blByb3BlcnR5Q2hhbmdlLmRpc3BhdGNoRWFjaChsaXN0ZW5lcnMsIGtleSwgdmFsdWUsIHRoaXMpO1xuICAgICAgICB9IGZpbmFsbHkge1xuICAgICAgICAgICAgZGVzY3JpcHRvci5pc0FjdGl2ZSA9IGZhbHNlO1xuICAgICAgICB9XG4gICAgfVxufTtcblByb3BlcnR5Q2hhbmdlcy5wcm90b3R5cGUuZGlzcGF0Y2hPd25Qcm9wZXJ0eUNoYW5nZS5kaXNwYXRjaEVhY2ggPSBkaXNwYXRjaEVhY2g7XG5cbmZ1bmN0aW9uIGRpc3BhdGNoRWFjaChsaXN0ZW5lcnMsIGtleSwgdmFsdWUsIG9iamVjdCkge1xuICAgIGlmKGxpc3RlbmVycyAmJiBsaXN0ZW5lcnMuX2N1cnJlbnQpIHtcbiAgICAgICAgLy8gY29weSBzbmFwc2hvdCBvZiBjdXJyZW50IGxpc3RlbmVycyB0byBhY3RpdmUgbGlzdGVuZXJzXG4gICAgICAgIHZhciBjdXJyZW50LFxuICAgICAgICAgICAgbGlzdGVuZXIsXG4gICAgICAgICAgICBpLFxuICAgICAgICAgICAgY291bnRJLFxuICAgICAgICAgICAgdGhpc3AsXG4gICAgICAgICAgICBzcGVjaWZpY0hhbmRsZXJNZXRob2ROYW1lID0gbGlzdGVuZXJzLnNwZWNpZmljSGFuZGxlck1ldGhvZE5hbWUsXG4gICAgICAgICAgICBnZW5lcmljSGFuZGxlck1ldGhvZE5hbWUgPSBsaXN0ZW5lcnMuZ2VuZXJpY0hhbmRsZXJNZXRob2ROYW1lLFxuICAgICAgICAgICAgR2hvc3QgPSBMaXN0ZW5lckdob3N0O1xuXG4gICAgICAgIGlmKEFycmF5LmlzQXJyYXkobGlzdGVuZXJzLl9jdXJyZW50KSkge1xuICAgICAgICAgICAgLy9yZW1vdmVHb3N0TGlzdGVuZXJzSWZOZWVkZWQgcmV0dXJucyBsaXN0ZW5lcnMuY3VycmVudCBvciBhIG5ldyBmaWx0ZXJlZCBvbmUgd2hlbiBjb25kaXRpb25zIGFyZSBtZXRcbiAgICAgICAgICAgIGN1cnJlbnQgPSBsaXN0ZW5lcnMucmVtb3ZlQ3VycmVudEdvc3RMaXN0ZW5lcnNJZk5lZWRlZCgpO1xuICAgICAgICAgICAgLy9XZSB1c2UgYSBmb3IgdG8gZ3VhcmFudGVlIHdlIHdvbid0IGRpc3BhdGNoIHRvIGxpc3RlbmVycyB0aGF0IHdvdWxkIGJlIGFkZGVkIGFmdGVyIHdlIHN0YXJ0ZWRcbiAgICAgICAgICAgIGZvcihpPTAsIGNvdW50SSA9IGN1cnJlbnQubGVuZ3RoO2k8Y291bnRJO2krKykge1xuICAgICAgICAgICAgICAgIGlmICgodGhpc3AgPSBjdXJyZW50W2ldKSAhPT0gR2hvc3QpIHtcbiAgICAgICAgICAgICAgICAgICAgLy9UaGlzIGlzIGZpeGluZyB0aGUgaXNzdWUgY2F1c2luZyBhIHJlZ3Jlc3Npb24gaW4gTW9udGFnZSdzIHJlcGV0aXRpb25cbiAgICAgICAgICAgICAgICAgICAgbGlzdGVuZXIgPSAoXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzcFtzcGVjaWZpY0hhbmRsZXJNZXRob2ROYW1lXSB8fFxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpc3BbZ2VuZXJpY0hhbmRsZXJNZXRob2ROYW1lXSB8fFxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpc3BcbiAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKCFsaXN0ZW5lci5jYWxsKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJObyBldmVudCBsaXN0ZW5lciBmb3IgXCIgKyBsaXN0ZW5lcnMuc3BlY2lmaWNIYW5kbGVyTmFtZSArIFwiIG9yIFwiICsgbGlzdGVuZXJzLmdlbmVyaWNIYW5kbGVyTmFtZSArIFwiIG9yIGNhbGwgb24gXCIgKyBsaXN0ZW5lcik7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgbGlzdGVuZXIuY2FsbCh0aGlzcCwgdmFsdWUsIGtleSwgb2JqZWN0KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICB0aGlzcCA9IGxpc3RlbmVycy5fY3VycmVudDtcbiAgICAgICAgICAgIGxpc3RlbmVyID0gKFxuICAgICAgICAgICAgICAgIHRoaXNwW3NwZWNpZmljSGFuZGxlck1ldGhvZE5hbWVdIHx8XG4gICAgICAgICAgICAgICAgdGhpc3BbZ2VuZXJpY0hhbmRsZXJNZXRob2ROYW1lXSB8fFxuICAgICAgICAgICAgICAgIHRoaXNwXG4gICAgICAgICAgICApO1xuICAgICAgICAgICAgaWYgKCFsaXN0ZW5lci5jYWxsKSB7XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiTm8gZXZlbnQgbGlzdGVuZXIgZm9yIFwiICsgbGlzdGVuZXJzLnNwZWNpZmljSGFuZGxlck5hbWUgKyBcIiBvciBcIiArIGxpc3RlbmVycy5nZW5lcmljSGFuZGxlck5hbWUgKyBcIiBvciBjYWxsIG9uIFwiICsgbGlzdGVuZXIpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgbGlzdGVuZXIuY2FsbCh0aGlzcCwgdmFsdWUsIGtleSwgb2JqZWN0KTtcbiAgICAgICAgfVxuXG4gICAgfVxufVxuXG5kaXNwYXRjaEVhY2guTGlzdGVuZXJHaG9zdCA9IExpc3RlbmVyR2hvc3Q7XG5cblxuUHJvcGVydHlDaGFuZ2VzLnByb3RvdHlwZS5kaXNwYXRjaEJlZm9yZU93blByb3BlcnR5Q2hhbmdlID0gZnVuY3Rpb24gKGtleSwgbGlzdGVuZXIpIHtcbiAgICByZXR1cm4gUHJvcGVydHlDaGFuZ2VzLmRpc3BhdGNoT3duUHJvcGVydHlDaGFuZ2UodGhpcywga2V5LCBsaXN0ZW5lciwgdHJ1ZSk7XG59O1xuXG52YXIgT2JqZWN0c092ZXJyaWRkZW5Qcm9wZXJ0eURlc2NyaXB0b3JzID0gbmV3IFdlYWtNYXAoKSxcbiAgICBPYmplY3RzX19zdGF0ZV9fID0gbmV3IFdlYWtNYXAoKSxcbiAgICBwcm9wZXJ0eUxpc3RlbmVyID0ge1xuICAgICAgICBnZXQ6IHZvaWQgMCxcbiAgICAgICAgc2V0OiB2b2lkIDAsXG4gICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZSxcbiAgICAgICAgZW51bWVyYWJsZTogZmFsc2VcbiAgICB9O1xuXG5Qcm9wZXJ0eUNoYW5nZXMucHJvdG90eXBlLm1ha2VQcm9wZXJ0eU9ic2VydmFibGUgPSBmdW5jdGlvbiAoa2V5KSB7XG4gICAgLy8gYXJyYXlzIGFyZSBzcGVjaWFsLiAgd2UgZG8gbm90IHN1cHBvcnQgZGlyZWN0IHNldHRpbmcgb2YgcHJvcGVydGllc1xuICAgIC8vIG9uIGFuIGFycmF5LiAgaW5zdGVhZCwgY2FsbCAuc2V0KGluZGV4LCB2YWx1ZSkuICB0aGlzIGlzIG9ic2VydmFibGUuXG4gICAgLy8gJ2xlbmd0aCcgcHJvcGVydHkgaXMgb2JzZXJ2YWJsZSBmb3IgYWxsIG11dGF0aW5nIG1ldGhvZHMgYmVjYXVzZVxuICAgIC8vIG91ciBvdmVycmlkZXMgZXhwbGljaXRseSBkaXNwYXRjaCB0aGF0IGNoYW5nZS5cblxuXG4gICAgdmFyIG92ZXJyaWRkZW5Qcm9wZXJ0eURlc2NyaXB0b3JzID0gT2JqZWN0c092ZXJyaWRkZW5Qcm9wZXJ0eURlc2NyaXB0b3JzLmdldCh0aGlzKTtcbiAgICBpZiAob3ZlcnJpZGRlblByb3BlcnR5RGVzY3JpcHRvcnMgJiYgb3ZlcnJpZGRlblByb3BlcnR5RGVzY3JpcHRvcnMuZ2V0KGtleSkgIT09IHZvaWQgMCkge1xuICAgICAgICAvLyBpZiB3ZSBoYXZlIGFscmVhZHkgcmVjb3JkZWQgYW4gb3ZlcnJpZGRlbiBwcm9wZXJ0eSBkZXNjcmlwdG9yLFxuICAgICAgICAvLyB3ZSBoYXZlIGFscmVhZHkgaW5zdGFsbGVkIHRoZSBvYnNlcnZlciwgc28gc2hvcnQtaGVyZVxuICAgICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgLy8gbWVtb2l6ZSBvdmVycmlkZGVuIHByb3BlcnR5IGRlc2NyaXB0b3IgdGFibGVcbiAgICBpZiAoIW92ZXJyaWRkZW5Qcm9wZXJ0eURlc2NyaXB0b3JzKSB7XG4gICAgICAgIGlmIChBcnJheS5pc0FycmF5KHRoaXMpKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCFPYmplY3QuaXNFeHRlbnNpYmxlKHRoaXMpKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJDYW4ndCBtYWtlIHByb3BlcnR5IFwiICsgSlNPTi5zdHJpbmdpZnkoa2V5KSArIFwiIG9ic2VydmFibGUgb24gXCIgKyB0aGlzICsgXCIgYmVjYXVzZSBvYmplY3QgaXMgbm90IGV4dGVuc2libGVcIik7XG4gICAgICAgIH1cbiAgICAgICAgb3ZlcnJpZGRlblByb3BlcnR5RGVzY3JpcHRvcnMgPSBuZXcgTWFwKCk7XG4gICAgICAgIE9iamVjdHNPdmVycmlkZGVuUHJvcGVydHlEZXNjcmlwdG9ycy5zZXQodGhpcyxvdmVycmlkZGVuUHJvcGVydHlEZXNjcmlwdG9ycyk7XG4gICAgfVxuXG4gICAgLy8gdmFyIHN0YXRlID0gT2JqZWN0c19fc3RhdGVfXy5nZXQodGhpcyk7XG4gICAgLy8gaWYgKHR5cGVvZiBzdGF0ZSAhPT0gXCJvYmplY3RcIikge1xuICAgIC8vICAgICBPYmplY3RzX19zdGF0ZV9fLnNldCh0aGlzLChzdGF0ZSA9IHt9KSk7XG4gICAgLy8gfVxuICAgIC8vIHN0YXRlW2tleV0gPSB0aGlzW2tleV07XG5cblxuXG4gICAgLy8gd2FsayB1cCB0aGUgcHJvdG90eXBlIGNoYWluIHRvIGZpbmQgYSBwcm9wZXJ0eSBkZXNjcmlwdG9yIGZvclxuICAgIC8vIHRoZSBwcm9wZXJ0eSBuYW1lXG4gICAgdmFyIG92ZXJyaWRkZW5EZXNjcmlwdG9yO1xuICAgIHZhciBhdHRhY2hlZCA9IHRoaXM7XG4gICAgZG8ge1xuICAgICAgICBvdmVycmlkZGVuRGVzY3JpcHRvciA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IoYXR0YWNoZWQsIGtleSk7XG4gICAgICAgIGlmIChvdmVycmlkZGVuRGVzY3JpcHRvcikge1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgICAgYXR0YWNoZWQgPSBPYmplY3QuZ2V0UHJvdG90eXBlT2YoYXR0YWNoZWQpO1xuICAgIH0gd2hpbGUgKGF0dGFjaGVkKTtcbiAgICAvLyBvciBkZWZhdWx0IHRvIGFuIHVuZGVmaW5lZCB2YWx1ZVxuICAgIGlmICghb3ZlcnJpZGRlbkRlc2NyaXB0b3IpIHtcbiAgICAgICAgb3ZlcnJpZGRlbkRlc2NyaXB0b3IgPSB7XG4gICAgICAgICAgICB2YWx1ZTogdm9pZCAwLFxuICAgICAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgICAgICAgIHdyaXRhYmxlOiB0cnVlLFxuICAgICAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlXG4gICAgICAgIH07XG4gICAgfSBlbHNlIHtcbiAgICAgICAgaWYgKCFvdmVycmlkZGVuRGVzY3JpcHRvci5jb25maWd1cmFibGUpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBpZiAoIW92ZXJyaWRkZW5EZXNjcmlwdG9yLndyaXRhYmxlICYmICFvdmVycmlkZGVuRGVzY3JpcHRvci5zZXQpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8vIG1lbW9pemUgdGhlIGRlc2NyaXB0b3Igc28gd2Uga25vdyBub3QgdG8gaW5zdGFsbCBhbm90aGVyIGxheWVyLFxuICAgIC8vIGFuZCBzbyB3ZSBjYW4gcmV1c2UgdGhlIG92ZXJyaWRkZW4gZGVzY3JpcHRvciB3aGVuIHVuaW5zdGFsbGluZ1xuICAgIG92ZXJyaWRkZW5Qcm9wZXJ0eURlc2NyaXB0b3JzLnNldChrZXksb3ZlcnJpZGRlbkRlc2NyaXB0b3IpO1xuXG5cbiAgICAvLyBUT0RPIHJlZmxlY3QgY3VycmVudCB2YWx1ZSBvbiBhIGRpc3BsYXllZCBwcm9wZXJ0eVxuXG4gICAgLy8gaW4gYm90aCBvZiB0aGVzZSBuZXcgZGVzY3JpcHRvciB2YXJpYW50cywgd2UgcmV1c2UgdGhlIG92ZXJyaWRkZW5cbiAgICAvLyBkZXNjcmlwdG9yIHRvIGVpdGhlciBzdG9yZSB0aGUgY3VycmVudCB2YWx1ZSBvciBhcHBseSBnZXR0ZXJzXG4gICAgLy8gYW5kIHNldHRlcnMuICB0aGlzIGlzIGhhbmR5IHNpbmNlIHdlIGNhbiByZXVzZSB0aGUgb3ZlcnJpZGRlblxuICAgIC8vIGRlc2NyaXB0b3IgaWYgd2UgdW5pbnN0YWxsIHRoZSBvYnNlcnZlci4gIFdlIGV2ZW4gcHJlc2VydmUgdGhlXG4gICAgLy8gYXNzaWdubWVudCBzZW1hbnRpY3MsIHdoZXJlIHdlIGdldCB0aGUgdmFsdWUgZnJvbSB1cCB0aGVcbiAgICAvLyBwcm90b3R5cGUgY2hhaW4sIGFuZCBzZXQgYXMgYW4gb3duZWQgcHJvcGVydHkuXG4gICAgaWYgKCd2YWx1ZScgaW4gb3ZlcnJpZGRlbkRlc2NyaXB0b3IpIHtcbiAgICAgICAgcHJvcGVydHlMaXN0ZW5lci5nZXQgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICByZXR1cm4gb3ZlcnJpZGRlbkRlc2NyaXB0b3IudmFsdWU7XG4gICAgICAgIH07XG4gICAgICAgIHByb3BlcnR5TGlzdGVuZXIuc2V0ID0gZnVuY3Rpb24gZGlzcGF0Y2hpbmdTZXR0ZXIodmFsdWUpIHtcbiAgICAgICAgICAgIHZhciBkZXNjcmlwdG9yLFxuICAgICAgICAgICAgICAgIGlzQWN0aXZlLFxuICAgICAgICAgICAgICAgIG92ZXJyaWRkZW5EZXNjcmlwdG9yID0gZGlzcGF0Y2hpbmdTZXR0ZXIub3ZlcnJpZGRlbkRlc2NyaXB0b3I7XG5cbiAgICAgICAgICAgIGlmICh2YWx1ZSAhPT0gb3ZlcnJpZGRlbkRlc2NyaXB0b3IudmFsdWUpIHtcbiAgICAgICAgICAgICAgICBkZXNjcmlwdG9yID0gZGlzcGF0Y2hpbmdTZXR0ZXIuZGVzY3JpcHRvcjtcbiAgICAgICAgICAgICAgICBpZiAoIShpc0FjdGl2ZSA9IGRlc2NyaXB0b3IuaXNBY3RpdmUpKSB7XG4gICAgICAgICAgICAgICAgICAgIGRlc2NyaXB0b3IuaXNBY3RpdmUgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICAgICAgZGlzcGF0Y2hpbmdTZXR0ZXIuZGlzcGF0Y2hFYWNoKGRlc2NyaXB0b3IuX3dpbGxDaGFuZ2VMaXN0ZW5lcnMsIGtleSwgb3ZlcnJpZGRlbkRlc2NyaXB0b3IudmFsdWUsIHRoaXMpO1xuICAgICAgICAgICAgICAgICAgICB9IGZpbmFsbHkge31cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgb3ZlcnJpZGRlbkRlc2NyaXB0b3IudmFsdWUgPSB2YWx1ZTtcbiAgICAgICAgICAgICAgICBpZiAoIWlzQWN0aXZlKSB7XG4gICAgICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBkaXNwYXRjaGluZ1NldHRlci5kaXNwYXRjaEVhY2goZGVzY3JpcHRvci5fY2hhbmdlTGlzdGVuZXJzLCBrZXksIHZhbHVlLCB0aGlzKTtcbiAgICAgICAgICAgICAgICAgICAgfSBmaW5hbGx5IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlc2NyaXB0b3IuaXNBY3RpdmUgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICAgICAgcHJvcGVydHlMaXN0ZW5lci5zZXQuZGlzcGF0Y2hFYWNoID0gZGlzcGF0Y2hFYWNoO1xuICAgICAgICBwcm9wZXJ0eUxpc3RlbmVyLnNldC5vdmVycmlkZGVuRGVzY3JpcHRvciA9IG92ZXJyaWRkZW5EZXNjcmlwdG9yO1xuICAgICAgICBwcm9wZXJ0eUxpc3RlbmVyLnNldC5kZXNjcmlwdG9yID0gT2JqZWN0c1Byb3BlcnR5Q2hhbmdlTGlzdGVuZXJzLmdldCh0aGlzKVtrZXldO1xuXG4gICAgICAgIHByb3BlcnR5TGlzdGVuZXIuZW51bWVyYWJsZSA9IG92ZXJyaWRkZW5EZXNjcmlwdG9yLmVudW1lcmFibGU7XG5cbiAgICAgICAgcHJvcGVydHlMaXN0ZW5lci5jb25maWd1cmFibGUgPSB0cnVlXG5cbiAgICB9IGVsc2UgeyAvLyAnZ2V0JyBvciAnc2V0JywgYnV0IG5vdCBuZWNlc3NhcmlseSBib3RoXG4gICAgICAgICAgICBwcm9wZXJ0eUxpc3RlbmVyLmdldCA9IG92ZXJyaWRkZW5EZXNjcmlwdG9yLmdldDtcbiAgICAgICAgICAgIHByb3BlcnR5TGlzdGVuZXIuc2V0ID0gZnVuY3Rpb24gZGlzcGF0Y2hpbmdTZXR0ZXIoKSB7XG4gICAgICAgICAgICAgICAgdmFyIGZvcm1lclZhbHVlID0gZGlzcGF0Y2hpbmdTZXR0ZXIub3ZlcnJpZGRlbkdldHRlci5jYWxsKHRoaXMpLFxuICAgICAgICAgICAgICAgICAgICBkZXNjcmlwdG9yLFxuICAgICAgICAgICAgICAgICAgICBpc0FjdGl2ZSxcbiAgICAgICAgICAgICAgICAgICAgbmV3VmFsdWU7XG5cblxuICAgICAgICAgICAgICAgICAgICBpZihhcmd1bWVudHMubGVuZ3RoID09PSAxKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBkaXNwYXRjaGluZ1NldHRlci5vdmVycmlkZGVuU2V0dGVyLmNhbGwodGhpcyxhcmd1bWVudHNbMF0pO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGVsc2UgaWYoYXJndW1lbnRzLmxlbmd0aCA9PT0gMikge1xuICAgICAgICAgICAgICAgICAgICAgICAgZGlzcGF0Y2hpbmdTZXR0ZXIub3ZlcnJpZGRlblNldHRlci5jYWxsKHRoaXMsYXJndW1lbnRzWzBdLGFyZ3VtZW50c1sxXSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBkaXNwYXRjaGluZ1NldHRlci5vdmVycmlkZGVuU2V0dGVyLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGlmICgobmV3VmFsdWUgPSBkaXNwYXRjaGluZ1NldHRlci5vdmVycmlkZGVuR2V0dGVyLmNhbGwodGhpcykpICE9PSBmb3JtZXJWYWx1ZSkge1xuICAgICAgICAgICAgICAgICAgICBkZXNjcmlwdG9yID0gZGlzcGF0Y2hpbmdTZXR0ZXIuZGVzY3JpcHRvcjtcbiAgICAgICAgICAgICAgICAgICAgaWYgKCEoaXNBY3RpdmUgPSBkZXNjcmlwdG9yLmlzQWN0aXZlKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgZGVzY3JpcHRvci5pc0FjdGl2ZSA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRpc3BhdGNoaW5nU2V0dGVyLmRpc3BhdGNoRWFjaChkZXNjcmlwdG9yLl93aWxsQ2hhbmdlTGlzdGVuZXJzLCBrZXksIGZvcm1lclZhbHVlLCB0aGlzKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZmluYWxseSB7fVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGlmICghaXNBY3RpdmUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGlzcGF0Y2hpbmdTZXR0ZXIuZGlzcGF0Y2hFYWNoKGRlc2NyaXB0b3IuX2NoYW5nZUxpc3RlbmVycywga2V5LCBuZXdWYWx1ZSwgdGhpcyk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9IGZpbmFsbHkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlc2NyaXB0b3IuaXNBY3RpdmUgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICBwcm9wZXJ0eUxpc3RlbmVyLmVudW1lcmFibGUgPSBvdmVycmlkZGVuRGVzY3JpcHRvci5lbnVtZXJhYmxlO1xuICAgICAgICAgICAgcHJvcGVydHlMaXN0ZW5lci5jb25maWd1cmFibGUgPSB0cnVlO1xuICAgICAgICBwcm9wZXJ0eUxpc3RlbmVyLnNldC5kaXNwYXRjaEVhY2ggPSBkaXNwYXRjaEVhY2g7XG4gICAgICAgIHByb3BlcnR5TGlzdGVuZXIuc2V0Lm92ZXJyaWRkZW5TZXR0ZXIgPSBvdmVycmlkZGVuRGVzY3JpcHRvci5zZXQ7XG4gICAgICAgIHByb3BlcnR5TGlzdGVuZXIuc2V0Lm92ZXJyaWRkZW5HZXR0ZXIgPSBvdmVycmlkZGVuRGVzY3JpcHRvci5nZXQ7XG4gICAgICAgIHByb3BlcnR5TGlzdGVuZXIuc2V0LmRlc2NyaXB0b3IgPSBPYmplY3RzUHJvcGVydHlDaGFuZ2VMaXN0ZW5lcnMuZ2V0KHRoaXMpW2tleV07XG4gICAgfVxuXG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRoaXMsIGtleSwgcHJvcGVydHlMaXN0ZW5lcik7XG59O1xuXG4vLyBjb25zdHJ1Y3RvciBmdW5jdGlvbnNcblxuUHJvcGVydHlDaGFuZ2VzLmdldE93blByb3BlcnR5Q2hhbmdlRGVzY3JpcHRvciA9IGZ1bmN0aW9uIChvYmplY3QsIGtleSkge1xuICAgIGlmIChvYmplY3QuZ2V0T3duUHJvcGVydHlDaGFuZ2VEZXNjcmlwdG9yKSB7XG4gICAgICAgIHJldHVybiBvYmplY3QuZ2V0T3duUHJvcGVydHlDaGFuZ2VEZXNjcmlwdG9yKGtleSk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIFByb3BlcnR5Q2hhbmdlcy5wcm90b3R5cGUuZ2V0T3duUHJvcGVydHlDaGFuZ2VEZXNjcmlwdG9yLmNhbGwob2JqZWN0LCBrZXkpO1xuICAgIH1cbn07XG5cblByb3BlcnR5Q2hhbmdlcy5oYXNPd25Qcm9wZXJ0eUNoYW5nZURlc2NyaXB0b3IgPSBmdW5jdGlvbiAob2JqZWN0LCBrZXkpIHtcbiAgICBpZiAob2JqZWN0Lmhhc093blByb3BlcnR5Q2hhbmdlRGVzY3JpcHRvcikge1xuICAgICAgICByZXR1cm4gb2JqZWN0Lmhhc093blByb3BlcnR5Q2hhbmdlRGVzY3JpcHRvcihrZXkpO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiBQcm9wZXJ0eUNoYW5nZXMucHJvdG90eXBlLmhhc093blByb3BlcnR5Q2hhbmdlRGVzY3JpcHRvci5jYWxsKG9iamVjdCwga2V5KTtcbiAgICB9XG59O1xuXG5Qcm9wZXJ0eUNoYW5nZXMuYWRkT3duUHJvcGVydHlDaGFuZ2VMaXN0ZW5lciA9IGZ1bmN0aW9uIChvYmplY3QsIGtleSwgbGlzdGVuZXIsIGJlZm9yZUNoYW5nZSkge1xuICAgIGlmIChPYmplY3QuaXNPYmplY3Qob2JqZWN0KSkge1xuICAgICAgICByZXR1cm4gb2JqZWN0LmFkZE93blByb3BlcnR5Q2hhbmdlTGlzdGVuZXJcbiAgICAgICAgICAgID8gb2JqZWN0LmFkZE93blByb3BlcnR5Q2hhbmdlTGlzdGVuZXIoa2V5LCBsaXN0ZW5lciwgYmVmb3JlQ2hhbmdlKVxuICAgICAgICAgICAgOiB0aGlzLnByb3RvdHlwZS5hZGRPd25Qcm9wZXJ0eUNoYW5nZUxpc3RlbmVyLmNhbGwob2JqZWN0LCBrZXksIGxpc3RlbmVyLCBiZWZvcmVDaGFuZ2UpO1xuICAgIH1cbn07XG5cblByb3BlcnR5Q2hhbmdlcy5yZW1vdmVPd25Qcm9wZXJ0eUNoYW5nZUxpc3RlbmVyID0gZnVuY3Rpb24gKG9iamVjdCwga2V5LCBsaXN0ZW5lciwgYmVmb3JlQ2hhbmdlKSB7XG4gICAgaWYgKCFPYmplY3QuaXNPYmplY3Qob2JqZWN0KSkge1xuICAgIH0gZWxzZSBpZiAob2JqZWN0LnJlbW92ZU93blByb3BlcnR5Q2hhbmdlTGlzdGVuZXIpIHtcbiAgICAgICAgcmV0dXJuIG9iamVjdC5yZW1vdmVPd25Qcm9wZXJ0eUNoYW5nZUxpc3RlbmVyKGtleSwgbGlzdGVuZXIsIGJlZm9yZUNoYW5nZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIFByb3BlcnR5Q2hhbmdlcy5wcm90b3R5cGUucmVtb3ZlT3duUHJvcGVydHlDaGFuZ2VMaXN0ZW5lci5jYWxsKG9iamVjdCwga2V5LCBsaXN0ZW5lciwgYmVmb3JlQ2hhbmdlKTtcbiAgICB9XG59O1xuXG5Qcm9wZXJ0eUNoYW5nZXMuZGlzcGF0Y2hPd25Qcm9wZXJ0eUNoYW5nZSA9IGZ1bmN0aW9uIChvYmplY3QsIGtleSwgdmFsdWUsIGJlZm9yZUNoYW5nZSkge1xuICAgIGlmICghT2JqZWN0LmlzT2JqZWN0KG9iamVjdCkpIHtcbiAgICB9IGVsc2UgaWYgKG9iamVjdC5kaXNwYXRjaE93blByb3BlcnR5Q2hhbmdlKSB7XG4gICAgICAgIHJldHVybiBvYmplY3QuZGlzcGF0Y2hPd25Qcm9wZXJ0eUNoYW5nZShrZXksIHZhbHVlLCBiZWZvcmVDaGFuZ2UpO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiBQcm9wZXJ0eUNoYW5nZXMucHJvdG90eXBlLmRpc3BhdGNoT3duUHJvcGVydHlDaGFuZ2UuY2FsbChvYmplY3QsIGtleSwgdmFsdWUsIGJlZm9yZUNoYW5nZSk7XG4gICAgfVxufTtcblxuUHJvcGVydHlDaGFuZ2VzLmFkZEJlZm9yZU93blByb3BlcnR5Q2hhbmdlTGlzdGVuZXIgPSBmdW5jdGlvbiAob2JqZWN0LCBrZXksIGxpc3RlbmVyKSB7XG4gICAgcmV0dXJuIFByb3BlcnR5Q2hhbmdlcy5hZGRPd25Qcm9wZXJ0eUNoYW5nZUxpc3RlbmVyKG9iamVjdCwga2V5LCBsaXN0ZW5lciwgdHJ1ZSk7XG59O1xuXG5Qcm9wZXJ0eUNoYW5nZXMucmVtb3ZlQmVmb3JlT3duUHJvcGVydHlDaGFuZ2VMaXN0ZW5lciA9IGZ1bmN0aW9uIChvYmplY3QsIGtleSwgbGlzdGVuZXIpIHtcbiAgICByZXR1cm4gUHJvcGVydHlDaGFuZ2VzLnJlbW92ZU93blByb3BlcnR5Q2hhbmdlTGlzdGVuZXIob2JqZWN0LCBrZXksIGxpc3RlbmVyLCB0cnVlKTtcbn07XG5cblByb3BlcnR5Q2hhbmdlcy5kaXNwYXRjaEJlZm9yZU93blByb3BlcnR5Q2hhbmdlID0gZnVuY3Rpb24gKG9iamVjdCwga2V5LCB2YWx1ZSkge1xuICAgIHJldHVybiBQcm9wZXJ0eUNoYW5nZXMuZGlzcGF0Y2hPd25Qcm9wZXJ0eUNoYW5nZShvYmplY3QsIGtleSwgdmFsdWUsIHRydWUpO1xufTtcblxuUHJvcGVydHlDaGFuZ2VzLm1ha2VQcm9wZXJ0eU9ic2VydmFibGUgPSBmdW5jdGlvbiAob2JqZWN0LCBrZXkpIHtcbiAgICBpZiAob2JqZWN0Lm1ha2VQcm9wZXJ0eU9ic2VydmFibGUpIHtcbiAgICAgICAgcmV0dXJuIG9iamVjdC5tYWtlUHJvcGVydHlPYnNlcnZhYmxlKGtleSk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIFByb3BlcnR5Q2hhbmdlcy5wcm90b3R5cGUubWFrZVByb3BlcnR5T2JzZXJ2YWJsZS5jYWxsKG9iamVjdCwga2V5KTtcbiAgICB9XG59O1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbi8vVE9ETzpcbi8vIFJlbW92ZSBEaWN0IGFuZCB1c2UgbmF0aXZlIE1hcCBhcyBtdWNoIGFzIHBvc3NpYmxlIGhlcmVcbi8vVXNlIE9iamVjdENoYW5nZURlc2NyaXB0b3IgdG8gYXZvaWQgY3JlYXRpbmcgdXNlbGVzcyBhcnJheXMgYW5kIGJlbmVmaXQgZnJvbSBzaW1pbGFyIGdhaW5zIG1hZGUgaW4gcHJvcGVydHktY2hhbmdlc1xuXG5cbnZhciBXZWFrTWFwID0gcmVxdWlyZShcIndlYWstbWFwXCIpLFxuICAgIE1hcCA9IHJlcXVpcmUoXCIuLi9fbWFwXCIpLFxuICAgIENoYW5nZURlc2NyaXB0b3IgPSByZXF1aXJlKFwiLi9jaGFuZ2UtZGVzY3JpcHRvclwiKSxcbiAgICBPYmplY3RDaGFuZ2VEZXNjcmlwdG9yID0gQ2hhbmdlRGVzY3JpcHRvci5PYmplY3RDaGFuZ2VEZXNjcmlwdG9yLFxuICAgIENoYW5nZUxpc3RlbmVyc1JlY29yZCA9IENoYW5nZURlc2NyaXB0b3IuQ2hhbmdlTGlzdGVuZXJzUmVjb3JkLFxuICAgIExpc3RlbmVyR2hvc3QgPSBDaGFuZ2VEZXNjcmlwdG9yLkxpc3RlbmVyR2hvc3Q7XG5cbnZhciByYW5nZUNoYW5nZURlc2NyaXB0b3JzID0gbmV3IFdlYWtNYXAoKTsgLy8ge2lzQWN0aXZlLCB3aWxsQ2hhbmdlTGlzdGVuZXJzLCBjaGFuZ2VMaXN0ZW5lcnN9XG5cblxuLy9cbmZ1bmN0aW9uIFJhbmdlQ2hhbmdlRGVzY3JpcHRvcihuYW1lKSB7XG4gICAgdGhpcy5uYW1lID0gbmFtZTtcbiAgICB0aGlzLmlzQWN0aXZlID0gZmFsc2U7XG4gICAgdGhpcy5fd2lsbENoYW5nZUxpc3RlbmVycyA9IG51bGw7XG4gICAgdGhpcy5fY2hhbmdlTGlzdGVuZXJzID0gbnVsbDtcbn07XG5cblJhbmdlQ2hhbmdlRGVzY3JpcHRvci5wcm90b3R5cGUgPSBuZXcgT2JqZWN0Q2hhbmdlRGVzY3JpcHRvcigpO1xuUmFuZ2VDaGFuZ2VEZXNjcmlwdG9yLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IFJhbmdlQ2hhbmdlRGVzY3JpcHRvcjtcblxuUmFuZ2VDaGFuZ2VEZXNjcmlwdG9yLnByb3RvdHlwZS5jaGFuZ2VMaXN0ZW5lcnNSZWNvcmRDb25zdHJ1Y3RvciA9IFJhbmdlQ2hhbmdlTGlzdGVuZXJzUmVjb3JkO1xuUmFuZ2VDaGFuZ2VEZXNjcmlwdG9yLnByb3RvdHlwZS53aWxsQ2hhbmdlTGlzdGVuZXJzUmVjb3JkQ29uc3RydWN0b3IgPSBSYW5nZVdpbGxDaGFuZ2VMaXN0ZW5lcnNSZWNvcmQ7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoUmFuZ2VDaGFuZ2VEZXNjcmlwdG9yLnByb3RvdHlwZSxcImFjdGl2ZVwiLHtcbiAgICBnZXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fYWN0aXZlIHx8ICh0aGlzLl9hY3RpdmUgPSB0aGlzLl9jdXJyZW50ID8gdGhpcy5fY3VycmVudC5zbGljZSgpOltdKTtcbiAgICB9XG59KTtcblxuXG52YXIgUmFuZ2VDaGFuZ2VMaXN0ZW5lcnNTcGVjaWZpY0hhbmRsZXJNZXRob2ROYW1lID0gbmV3IE1hcCgpO1xuXG5mdW5jdGlvbiBSYW5nZUNoYW5nZUxpc3RlbmVyc1JlY29yZChuYW1lKSB7XG4gICAgdmFyIHNwZWNpZmljSGFuZGxlck1ldGhvZE5hbWUgPSBSYW5nZUNoYW5nZUxpc3RlbmVyc1NwZWNpZmljSGFuZGxlck1ldGhvZE5hbWUuZ2V0KG5hbWUpO1xuICAgIGlmKCFzcGVjaWZpY0hhbmRsZXJNZXRob2ROYW1lKSB7XG4gICAgICAgIHNwZWNpZmljSGFuZGxlck1ldGhvZE5hbWUgPSBcImhhbmRsZVwiO1xuICAgICAgICBzcGVjaWZpY0hhbmRsZXJNZXRob2ROYW1lICs9IG5hbWUuc2xpY2UoMCwgMSkudG9VcHBlckNhc2UoKTtcbiAgICAgICAgc3BlY2lmaWNIYW5kbGVyTWV0aG9kTmFtZSArPSBuYW1lLnNsaWNlKDEpO1xuICAgICAgICBzcGVjaWZpY0hhbmRsZXJNZXRob2ROYW1lICs9IFwiUmFuZ2VDaGFuZ2VcIjtcbiAgICAgICAgUmFuZ2VDaGFuZ2VMaXN0ZW5lcnNTcGVjaWZpY0hhbmRsZXJNZXRob2ROYW1lLnNldChuYW1lLHNwZWNpZmljSGFuZGxlck1ldGhvZE5hbWUpO1xuICAgIH1cbiAgICB0aGlzLnNwZWNpZmljSGFuZGxlck1ldGhvZE5hbWUgPSBzcGVjaWZpY0hhbmRsZXJNZXRob2ROYW1lO1xuXHRyZXR1cm4gdGhpcztcbn1cblJhbmdlQ2hhbmdlTGlzdGVuZXJzUmVjb3JkLnByb3RvdHlwZSA9IG5ldyBDaGFuZ2VMaXN0ZW5lcnNSZWNvcmQoKTtcblJhbmdlQ2hhbmdlTGlzdGVuZXJzUmVjb3JkLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IFJhbmdlQ2hhbmdlTGlzdGVuZXJzUmVjb3JkO1xuXG52YXIgUmFuZ2VXaWxsQ2hhbmdlTGlzdGVuZXJzU3BlY2lmaWNIYW5kbGVyTWV0aG9kTmFtZSA9IG5ldyBNYXAoKTtcblxuZnVuY3Rpb24gUmFuZ2VXaWxsQ2hhbmdlTGlzdGVuZXJzUmVjb3JkKG5hbWUpIHtcbiAgICB2YXIgc3BlY2lmaWNIYW5kbGVyTWV0aG9kTmFtZSA9IFJhbmdlV2lsbENoYW5nZUxpc3RlbmVyc1NwZWNpZmljSGFuZGxlck1ldGhvZE5hbWUuZ2V0KG5hbWUpO1xuICAgIGlmKCFzcGVjaWZpY0hhbmRsZXJNZXRob2ROYW1lKSB7XG4gICAgICAgIHNwZWNpZmljSGFuZGxlck1ldGhvZE5hbWUgPSBcImhhbmRsZVwiO1xuICAgICAgICBzcGVjaWZpY0hhbmRsZXJNZXRob2ROYW1lICs9IG5hbWUuc2xpY2UoMCwgMSkudG9VcHBlckNhc2UoKTtcbiAgICAgICAgc3BlY2lmaWNIYW5kbGVyTWV0aG9kTmFtZSArPSBuYW1lLnNsaWNlKDEpO1xuICAgICAgICBzcGVjaWZpY0hhbmRsZXJNZXRob2ROYW1lICs9IFwiUmFuZ2VXaWxsQ2hhbmdlXCI7XG4gICAgICAgIFJhbmdlV2lsbENoYW5nZUxpc3RlbmVyc1NwZWNpZmljSGFuZGxlck1ldGhvZE5hbWUuc2V0KG5hbWUsc3BlY2lmaWNIYW5kbGVyTWV0aG9kTmFtZSk7XG4gICAgfVxuICAgIHRoaXMuc3BlY2lmaWNIYW5kbGVyTWV0aG9kTmFtZSA9IHNwZWNpZmljSGFuZGxlck1ldGhvZE5hbWU7XG4gICAgcmV0dXJuIHRoaXM7XG59XG5SYW5nZVdpbGxDaGFuZ2VMaXN0ZW5lcnNSZWNvcmQucHJvdG90eXBlID0gbmV3IENoYW5nZUxpc3RlbmVyc1JlY29yZCgpO1xuUmFuZ2VXaWxsQ2hhbmdlTGlzdGVuZXJzUmVjb3JkLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IFJhbmdlV2lsbENoYW5nZUxpc3RlbmVyc1JlY29yZDtcblxubW9kdWxlLmV4cG9ydHMgPSBSYW5nZUNoYW5nZXM7XG5mdW5jdGlvbiBSYW5nZUNoYW5nZXMoKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKFwiQ2FuJ3QgY29uc3RydWN0LiBSYW5nZUNoYW5nZXMgaXMgYSBtaXhpbi5cIik7XG59XG5cblJhbmdlQ2hhbmdlcy5wcm90b3R5cGUuZ2V0QWxsUmFuZ2VDaGFuZ2VEZXNjcmlwdG9ycyA9IGZ1bmN0aW9uICgpIHtcbiAgICBpZiAoIXJhbmdlQ2hhbmdlRGVzY3JpcHRvcnMuaGFzKHRoaXMpKSB7XG4gICAgICAgIHJhbmdlQ2hhbmdlRGVzY3JpcHRvcnMuc2V0KHRoaXMsIG5ldyBNYXAoKSk7XG4gICAgfVxuICAgIHJldHVybiByYW5nZUNoYW5nZURlc2NyaXB0b3JzLmdldCh0aGlzKTtcbn07XG5cblJhbmdlQ2hhbmdlcy5wcm90b3R5cGUuZ2V0UmFuZ2VDaGFuZ2VEZXNjcmlwdG9yID0gZnVuY3Rpb24gKHRva2VuKSB7XG4gICAgdmFyIHRva2VuQ2hhbmdlRGVzY3JpcHRvcnMgPSB0aGlzLmdldEFsbFJhbmdlQ2hhbmdlRGVzY3JpcHRvcnMoKTtcbiAgICB0b2tlbiA9IHRva2VuIHx8IFwiXCI7XG4gICAgaWYgKCF0b2tlbkNoYW5nZURlc2NyaXB0b3JzLmhhcyh0b2tlbikpIHtcbiAgICAgICAgdG9rZW5DaGFuZ2VEZXNjcmlwdG9ycy5zZXQodG9rZW4sIG5ldyBSYW5nZUNoYW5nZURlc2NyaXB0b3IodG9rZW4pKTtcbiAgICB9XG4gICAgcmV0dXJuIHRva2VuQ2hhbmdlRGVzY3JpcHRvcnMuZ2V0KHRva2VuKTtcbn07XG5cbnZhciBPYmplY3RzRGlzcGF0Y2hlc1JhbmdlQ2hhbmdlcyA9IG5ldyBXZWFrTWFwKCksXG4gICAgZGlzcGF0Y2hlc1JhbmdlQ2hhbmdlc0dldHRlciA9IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gT2JqZWN0c0Rpc3BhdGNoZXNSYW5nZUNoYW5nZXMuZ2V0KHRoaXMpO1xuICAgIH0sXG4gICAgZGlzcGF0Y2hlc1JhbmdlQ2hhbmdlc1NldHRlciA9IGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgICAgIHJldHVybiBPYmplY3RzRGlzcGF0Y2hlc1JhbmdlQ2hhbmdlcy5zZXQodGhpcyx2YWx1ZSk7XG4gICAgfSxcbiAgICBkaXNwYXRjaGVzQ2hhbmdlc01ldGhvZE5hbWUgPSBcImRpc3BhdGNoZXNSYW5nZUNoYW5nZXNcIixcbiAgICBkaXNwYXRjaGVzQ2hhbmdlc1Byb3BlcnR5RGVzY3JpcHRvciA9IHtcbiAgICAgICAgZ2V0OiBkaXNwYXRjaGVzUmFuZ2VDaGFuZ2VzR2V0dGVyLFxuICAgICAgICBzZXQ6IGRpc3BhdGNoZXNSYW5nZUNoYW5nZXNTZXR0ZXIsXG4gICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZSxcbiAgICAgICAgZW51bWVyYWJsZTogZmFsc2VcbiAgICB9O1xuXG5SYW5nZUNoYW5nZXMucHJvdG90eXBlLmFkZFJhbmdlQ2hhbmdlTGlzdGVuZXIgPSBmdW5jdGlvbiBhZGRSYW5nZUNoYW5nZUxpc3RlbmVyKGxpc3RlbmVyLCB0b2tlbiwgYmVmb3JlQ2hhbmdlKSB7XG4gICAgLy8gYSBjb25jZXNzaW9uIGZvciBvYmplY3RzIGxpa2UgQXJyYXkgdGhhdCBhcmUgbm90IGluaGVyZW50bHkgb2JzZXJ2YWJsZVxuICAgIGlmICghdGhpcy5pc09ic2VydmFibGUgJiYgdGhpcy5tYWtlT2JzZXJ2YWJsZSkge1xuICAgICAgICB0aGlzLm1ha2VPYnNlcnZhYmxlKCk7XG4gICAgfVxuXG4gICAgdmFyIGRlc2NyaXB0b3IgPSB0aGlzLmdldFJhbmdlQ2hhbmdlRGVzY3JpcHRvcih0b2tlbik7XG5cbiAgICB2YXIgbGlzdGVuZXJzO1xuICAgIGlmIChiZWZvcmVDaGFuZ2UpIHtcbiAgICAgICAgbGlzdGVuZXJzID0gZGVzY3JpcHRvci53aWxsQ2hhbmdlTGlzdGVuZXJzO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIGxpc3RlbmVycyA9IGRlc2NyaXB0b3IuY2hhbmdlTGlzdGVuZXJzO1xuICAgIH1cblxuICAgIC8vIGV2ZW4gaWYgYWxyZWFkeSByZWdpc3RlcmVkXG4gICAgaWYoIWxpc3RlbmVycy5fY3VycmVudCkge1xuICAgICAgICBsaXN0ZW5lcnMuX2N1cnJlbnQgPSBsaXN0ZW5lcjtcbiAgICB9XG4gICAgZWxzZSBpZighQXJyYXkuaXNBcnJheShsaXN0ZW5lcnMuX2N1cnJlbnQpKSB7XG4gICAgICAgIGxpc3RlbmVycy5fY3VycmVudCA9IFtsaXN0ZW5lcnMuX2N1cnJlbnQsbGlzdGVuZXJdXG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgICBsaXN0ZW5lcnMuX2N1cnJlbnQucHVzaChsaXN0ZW5lcik7XG4gICAgfVxuXG4gICAgaWYoT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcigodGhpcy5fX3Byb3RvX198fE9iamVjdC5nZXRQcm90b3R5cGVPZih0aGlzKSksZGlzcGF0Y2hlc0NoYW5nZXNNZXRob2ROYW1lKSA9PT0gdm9pZCAwKSB7XG4gICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSgodGhpcy5fX3Byb3RvX198fE9iamVjdC5nZXRQcm90b3R5cGVPZih0aGlzKSksIGRpc3BhdGNoZXNDaGFuZ2VzTWV0aG9kTmFtZSwgZGlzcGF0Y2hlc0NoYW5nZXNQcm9wZXJ0eURlc2NyaXB0b3IpO1xuICAgIH1cbiAgICB0aGlzLmRpc3BhdGNoZXNSYW5nZUNoYW5nZXMgPSB0cnVlO1xuXG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgIHJldHVybiBmdW5jdGlvbiBjYW5jZWxSYW5nZUNoYW5nZUxpc3RlbmVyKCkge1xuICAgICAgICBpZiAoIXNlbGYpIHtcbiAgICAgICAgICAgIC8vIFRPRE8gdGhyb3cgbmV3IEVycm9yKFwiUmFuZ2UgY2hhbmdlIGxpc3RlbmVyIFwiICsgSlNPTi5zdHJpbmdpZnkodG9rZW4pICsgXCIgaGFzIGFscmVhZHkgYmVlbiBjYW5jZWxlZFwiKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBzZWxmLnJlbW92ZVJhbmdlQ2hhbmdlTGlzdGVuZXIobGlzdGVuZXIsIHRva2VuLCBiZWZvcmVDaGFuZ2UpO1xuICAgICAgICBzZWxmID0gbnVsbDtcbiAgICB9O1xufTtcblxuXG5SYW5nZUNoYW5nZXMucHJvdG90eXBlLnJlbW92ZVJhbmdlQ2hhbmdlTGlzdGVuZXIgPSBmdW5jdGlvbiAobGlzdGVuZXIsIHRva2VuLCBiZWZvcmVDaGFuZ2UpIHtcbiAgICB2YXIgZGVzY3JpcHRvciA9IHRoaXMuZ2V0UmFuZ2VDaGFuZ2VEZXNjcmlwdG9yKHRva2VuKTtcblxuICAgIHZhciBsaXN0ZW5lcnM7XG4gICAgaWYgKGJlZm9yZUNoYW5nZSkge1xuICAgICAgICBsaXN0ZW5lcnMgPSBkZXNjcmlwdG9yLl93aWxsQ2hhbmdlTGlzdGVuZXJzO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIGxpc3RlbmVycyA9IGRlc2NyaXB0b3IuX2NoYW5nZUxpc3RlbmVycztcbiAgICB9XG5cbiAgICBpZihsaXN0ZW5lcnMuX2N1cnJlbnQpIHtcbiAgICAgICAgaWYobGlzdGVuZXJzLl9jdXJyZW50ID09PSBsaXN0ZW5lcikge1xuICAgICAgICAgICAgbGlzdGVuZXJzLl9jdXJyZW50ID0gbnVsbDtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHZhciBpbmRleCA9IGxpc3RlbmVycy5fY3VycmVudC5sYXN0SW5kZXhPZihsaXN0ZW5lcik7XG4gICAgICAgICAgICBpZiAoaW5kZXggPT09IC0xKSB7XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiQ2FuJ3QgcmVtb3ZlIHJhbmdlIGNoYW5nZSBsaXN0ZW5lcjogZG9lcyBub3QgZXhpc3Q6IHRva2VuIFwiICsgSlNPTi5zdHJpbmdpZnkodG9rZW4pKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIGlmKGRlc2NyaXB0b3IuaXNBY3RpdmUpIHtcbiAgICAgICAgICAgICAgICAgICAgbGlzdGVuZXJzLmdob3N0Q291bnQgPSBsaXN0ZW5lcnMuZ2hvc3RDb3VudCsxXG4gICAgICAgICAgICAgICAgICAgIGxpc3RlbmVycy5fY3VycmVudFtpbmRleF09TGlzdGVuZXJHaG9zdFxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgbGlzdGVuZXJzLl9jdXJyZW50LnNwbGljZU9uZShpbmRleCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG59O1xuXG5SYW5nZUNoYW5nZXMucHJvdG90eXBlLmRpc3BhdGNoUmFuZ2VDaGFuZ2UgPSBmdW5jdGlvbiAocGx1cywgbWludXMsIGluZGV4LCBiZWZvcmVDaGFuZ2UpIHtcbiAgICB2YXIgZGVzY3JpcHRvcnMgPSB0aGlzLmdldEFsbFJhbmdlQ2hhbmdlRGVzY3JpcHRvcnMoKTtcbiAgICBkZXNjcmlwdG9ycy5kaXNwYXRjaEJlZm9yZUNoYW5nZSA9IGJlZm9yZUNoYW5nZTtcbiAgICBkZXNjcmlwdG9ycy5mb3JFYWNoKGZ1bmN0aW9uIChkZXNjcmlwdG9yLCB0b2tlbiwgZGVzY3JpcHRvcnMpIHtcblxuICAgICAgICBpZiAoZGVzY3JpcHRvci5pc0FjdGl2ZSkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gYmVmb3JlIG9yIGFmdGVyXG4gICAgICAgIHZhciBsaXN0ZW5lcnMgPSBiZWZvcmVDaGFuZ2UgPyBkZXNjcmlwdG9yLl93aWxsQ2hhbmdlTGlzdGVuZXJzIDogZGVzY3JpcHRvci5fY2hhbmdlTGlzdGVuZXJzO1xuICAgICAgICBpZihsaXN0ZW5lcnMgJiYgbGlzdGVuZXJzLl9jdXJyZW50KSB7XG4gICAgICAgICAgICB2YXIgdG9rZW5OYW1lID0gbGlzdGVuZXJzLnNwZWNpZmljSGFuZGxlck1ldGhvZE5hbWU7XG4gICAgICAgICAgICBpZihBcnJheS5pc0FycmF5KGxpc3RlbmVycy5fY3VycmVudCkpIHtcbiAgICAgICAgICAgICAgICBpZihsaXN0ZW5lcnMuX2N1cnJlbnQubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIG5vdGFibHksIGRlZmF1bHRzIHRvIFwiaGFuZGxlUmFuZ2VDaGFuZ2VcIiBvciBcImhhbmRsZVJhbmdlV2lsbENoYW5nZVwiXG4gICAgICAgICAgICAgICAgICAgIC8vIGlmIHRva2VuIGlzIFwiXCIgKHRoZSBkZWZhdWx0KVxuXG4gICAgICAgICAgICAgICAgICAgIGRlc2NyaXB0b3IuaXNBY3RpdmUgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICAvLyBkaXNwYXRjaCBlYWNoIGxpc3RlbmVyXG4gICAgICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgaSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb3VudEksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbGlzdGVuZXIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy9yZW1vdmVHb3N0TGlzdGVuZXJzSWZOZWVkZWQgcmV0dXJucyBsaXN0ZW5lcnMuY3VycmVudCBvciBhIG5ldyBmaWx0ZXJlZCBvbmUgd2hlbiBjb25kaXRpb25zIGFyZSBtZXRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjdXJyZW50TGlzdGVuZXJzID0gbGlzdGVuZXJzLnJlbW92ZUN1cnJlbnRHb3N0TGlzdGVuZXJzSWZOZWVkZWQoKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBHaG9zdCA9IExpc3RlbmVyR2hvc3Q7XG4gICAgICAgICAgICAgICAgICAgICAgICBmb3IoaT0wLCBjb3VudEkgPSBjdXJyZW50TGlzdGVuZXJzLmxlbmd0aDtpPGNvdW50STtpKyspIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoKGxpc3RlbmVyID0gY3VycmVudExpc3RlbmVyc1tpXSkgIT09IEdob3N0KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChsaXN0ZW5lclt0b2tlbk5hbWVdKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsaXN0ZW5lclt0b2tlbk5hbWVdKHBsdXMsIG1pbnVzLCBpbmRleCwgdGhpcywgYmVmb3JlQ2hhbmdlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmIChsaXN0ZW5lci5jYWxsKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsaXN0ZW5lci5jYWxsKHRoaXMsIHBsdXMsIG1pbnVzLCBpbmRleCwgdGhpcywgYmVmb3JlQ2hhbmdlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIkhhbmRsZXIgXCIgKyBsaXN0ZW5lciArIFwiIGhhcyBubyBtZXRob2QgXCIgKyB0b2tlbk5hbWUgKyBcIiBhbmQgaXMgbm90IGNhbGxhYmxlXCIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9IGZpbmFsbHkge1xuICAgICAgICAgICAgICAgICAgICAgICAgZGVzY3JpcHRvci5pc0FjdGl2ZSA9IGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgZGVzY3JpcHRvci5pc0FjdGl2ZSA9IHRydWU7XG4gICAgICAgICAgICAgICAgLy8gZGlzcGF0Y2ggZWFjaCBsaXN0ZW5lclxuICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgIGxpc3RlbmVyID0gbGlzdGVuZXJzLl9jdXJyZW50O1xuICAgICAgICAgICAgICAgICAgICBpZiAobGlzdGVuZXJbdG9rZW5OYW1lXSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgbGlzdGVuZXJbdG9rZW5OYW1lXShwbHVzLCBtaW51cywgaW5kZXgsIHRoaXMsIGJlZm9yZUNoYW5nZSk7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAobGlzdGVuZXIuY2FsbCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgbGlzdGVuZXIuY2FsbCh0aGlzLCBwbHVzLCBtaW51cywgaW5kZXgsIHRoaXMsIGJlZm9yZUNoYW5nZSk7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJIYW5kbGVyIFwiICsgbGlzdGVuZXIgKyBcIiBoYXMgbm8gbWV0aG9kIFwiICsgdG9rZW5OYW1lICsgXCIgYW5kIGlzIG5vdCBjYWxsYWJsZVwiKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0gZmluYWxseSB7XG4gICAgICAgICAgICAgICAgICAgIGRlc2NyaXB0b3IuaXNBY3RpdmUgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgfSwgdGhpcyk7XG59O1xuXG5SYW5nZUNoYW5nZXMucHJvdG90eXBlLmFkZEJlZm9yZVJhbmdlQ2hhbmdlTGlzdGVuZXIgPSBmdW5jdGlvbiAobGlzdGVuZXIsIHRva2VuKSB7XG4gICAgcmV0dXJuIHRoaXMuYWRkUmFuZ2VDaGFuZ2VMaXN0ZW5lcihsaXN0ZW5lciwgdG9rZW4sIHRydWUpO1xufTtcblxuUmFuZ2VDaGFuZ2VzLnByb3RvdHlwZS5yZW1vdmVCZWZvcmVSYW5nZUNoYW5nZUxpc3RlbmVyID0gZnVuY3Rpb24gKGxpc3RlbmVyLCB0b2tlbikge1xuICAgIHJldHVybiB0aGlzLnJlbW92ZVJhbmdlQ2hhbmdlTGlzdGVuZXIobGlzdGVuZXIsIHRva2VuLCB0cnVlKTtcbn07XG5cblJhbmdlQ2hhbmdlcy5wcm90b3R5cGUuZGlzcGF0Y2hCZWZvcmVSYW5nZUNoYW5nZSA9IGZ1bmN0aW9uIChwbHVzLCBtaW51cywgaW5kZXgpIHtcbiAgICByZXR1cm4gdGhpcy5kaXNwYXRjaFJhbmdlQ2hhbmdlKHBsdXMsIG1pbnVzLCBpbmRleCwgdHJ1ZSk7XG59O1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbi8qXG4gICAgQmFzZWQgaW4gcGFydCBvbiBleHRyYXMgZnJvbSBNb3Rvcm9sYSBNb2JpbGl0eeKAmXMgTW9udGFnZVxuICAgIENvcHlyaWdodCAoYykgMjAxMiwgTW90b3JvbGEgTW9iaWxpdHkgTExDLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICAgIDMtQ2xhdXNlIEJTRCBMaWNlbnNlXG4gICAgaHR0cHM6Ly9naXRodWIuY29tL21vdG9yb2xhLW1vYmlsaXR5L21vbnRhZ2UvYmxvYi9tYXN0ZXIvTElDRU5TRS5tZFxuKi9cblxudmFyIEZ1bmN0aW9uID0gcmVxdWlyZShcIi4vc2hpbS1mdW5jdGlvblwiKTtcbnZhciBHZW5lcmljQ29sbGVjdGlvbiA9IHJlcXVpcmUoXCIuL2dlbmVyaWMtY29sbGVjdGlvblwiKTtcbnZhciBHZW5lcmljT3JkZXIgPSByZXF1aXJlKFwiLi9nZW5lcmljLW9yZGVyXCIpO1xudmFyIFdlYWtNYXAgPSByZXF1aXJlKFwid2Vhay1tYXBcIik7XG5cbm1vZHVsZS5leHBvcnRzID0gQXJyYXk7XG5cbnZhciBhcnJheV9zcGxpY2UgPSBBcnJheS5wcm90b3R5cGUuc3BsaWNlO1xudmFyIGFycmF5X3NsaWNlID0gQXJyYXkucHJvdG90eXBlLnNsaWNlO1xuXG5BcnJheS5lbXB0eSA9IFtdO1xuXG5pZiAoT2JqZWN0LmZyZWV6ZSkge1xuICAgIE9iamVjdC5mcmVlemUoQXJyYXkuZW1wdHkpO1xufVxuXG5BcnJheS5mcm9tID0gZnVuY3Rpb24gKHZhbHVlcykge1xuICAgIHZhciBhcnJheSA9IFtdO1xuICAgIGFycmF5LmFkZEVhY2godmFsdWVzKTtcbiAgICByZXR1cm4gYXJyYXk7XG59O1xuXG5BcnJheS51bnppcCA9IGZ1bmN0aW9uICh0YWJsZSkge1xuICAgIHZhciB0cmFuc3Bvc2UgPSBbXTtcbiAgICB2YXIgbGVuZ3RoID0gSW5maW5pdHk7XG4gICAgLy8gY29tcHV0ZSBzaG9ydGVzdCByb3dcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRhYmxlLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIHZhciByb3cgPSB0YWJsZVtpXTtcbiAgICAgICAgdGFibGVbaV0gPSByb3cudG9BcnJheSgpO1xuICAgICAgICBpZiAocm93Lmxlbmd0aCA8IGxlbmd0aCkge1xuICAgICAgICAgICAgbGVuZ3RoID0gcm93Lmxlbmd0aDtcbiAgICAgICAgfVxuICAgIH1cbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRhYmxlLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIHZhciByb3cgPSB0YWJsZVtpXTtcbiAgICAgICAgZm9yICh2YXIgaiA9IDA7IGogPCByb3cubGVuZ3RoOyBqKyspIHtcbiAgICAgICAgICAgIGlmIChqIDwgbGVuZ3RoICYmIGogaW4gcm93KSB7XG4gICAgICAgICAgICAgICAgdHJhbnNwb3NlW2pdID0gdHJhbnNwb3NlW2pdIHx8IFtdO1xuICAgICAgICAgICAgICAgIHRyYW5zcG9zZVtqXVtpXSA9IHJvd1tqXTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gdHJhbnNwb3NlO1xufTtcblxuZnVuY3Rpb24gZGVmaW5lKGtleSwgdmFsdWUpIHtcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoQXJyYXkucHJvdG90eXBlLCBrZXksIHtcbiAgICAgICAgdmFsdWU6IHZhbHVlLFxuICAgICAgICB3cml0YWJsZTogdHJ1ZSxcbiAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlLFxuICAgICAgICBlbnVtZXJhYmxlOiBmYWxzZVxuICAgIH0pO1xufVxuXG5kZWZpbmUoXCJhZGRFYWNoXCIsIEdlbmVyaWNDb2xsZWN0aW9uLnByb3RvdHlwZS5hZGRFYWNoKTtcbmRlZmluZShcImRlbGV0ZUVhY2hcIiwgR2VuZXJpY0NvbGxlY3Rpb24ucHJvdG90eXBlLmRlbGV0ZUVhY2gpO1xuZGVmaW5lKFwidG9BcnJheVwiLCBHZW5lcmljQ29sbGVjdGlvbi5wcm90b3R5cGUudG9BcnJheSk7XG5kZWZpbmUoXCJ0b09iamVjdFwiLCBHZW5lcmljQ29sbGVjdGlvbi5wcm90b3R5cGUudG9PYmplY3QpO1xuZGVmaW5lKFwiYWxsXCIsIEdlbmVyaWNDb2xsZWN0aW9uLnByb3RvdHlwZS5hbGwpO1xuZGVmaW5lKFwiYW55XCIsIEdlbmVyaWNDb2xsZWN0aW9uLnByb3RvdHlwZS5hbnkpO1xuZGVmaW5lKFwibWluXCIsIEdlbmVyaWNDb2xsZWN0aW9uLnByb3RvdHlwZS5taW4pO1xuZGVmaW5lKFwibWF4XCIsIEdlbmVyaWNDb2xsZWN0aW9uLnByb3RvdHlwZS5tYXgpO1xuZGVmaW5lKFwic3VtXCIsIEdlbmVyaWNDb2xsZWN0aW9uLnByb3RvdHlwZS5zdW0pO1xuZGVmaW5lKFwiYXZlcmFnZVwiLCBHZW5lcmljQ29sbGVjdGlvbi5wcm90b3R5cGUuYXZlcmFnZSk7XG5kZWZpbmUoXCJvbmx5XCIsIEdlbmVyaWNDb2xsZWN0aW9uLnByb3RvdHlwZS5vbmx5KTtcbmRlZmluZShcImZsYXR0ZW5cIiwgR2VuZXJpY0NvbGxlY3Rpb24ucHJvdG90eXBlLmZsYXR0ZW4pO1xuZGVmaW5lKFwiemlwXCIsIEdlbmVyaWNDb2xsZWN0aW9uLnByb3RvdHlwZS56aXApO1xuZGVmaW5lKFwiZW51bWVyYXRlXCIsIEdlbmVyaWNDb2xsZWN0aW9uLnByb3RvdHlwZS5lbnVtZXJhdGUpO1xuZGVmaW5lKFwiZ3JvdXBcIiwgR2VuZXJpY0NvbGxlY3Rpb24ucHJvdG90eXBlLmdyb3VwKTtcbmRlZmluZShcInNvcnRlZFwiLCBHZW5lcmljQ29sbGVjdGlvbi5wcm90b3R5cGUuc29ydGVkKTtcbmRlZmluZShcInJldmVyc2VkXCIsIEdlbmVyaWNDb2xsZWN0aW9uLnByb3RvdHlwZS5yZXZlcnNlZCk7XG5cbmRlZmluZShcImNvbnN0cnVjdENsb25lXCIsIGZ1bmN0aW9uICh2YWx1ZXMpIHtcbiAgICB2YXIgY2xvbmUgPSBuZXcgdGhpcy5jb25zdHJ1Y3RvcigpO1xuICAgIGNsb25lLmFkZEVhY2godmFsdWVzKTtcbiAgICByZXR1cm4gY2xvbmU7XG59KTtcblxuZGVmaW5lKFwiaGFzXCIsIGZ1bmN0aW9uICh2YWx1ZSwgZXF1YWxzKSB7XG4gICAgcmV0dXJuIHRoaXMuZmluZCh2YWx1ZSwgZXF1YWxzKSAhPT0gLTE7XG59KTtcblxuZGVmaW5lKFwiZ2V0XCIsIGZ1bmN0aW9uIChpbmRleCwgZGVmYXVsdFZhbHVlKSB7XG4gICAgaWYgKCtpbmRleCAhPT0gaW5kZXgpXG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcIkluZGljaWVzIG11c3QgYmUgbnVtYmVyc1wiKTtcbiAgICBpZiAoIWluZGV4IGluIHRoaXMpIHtcbiAgICAgICAgcmV0dXJuIGRlZmF1bHRWYWx1ZTtcbiAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gdGhpc1tpbmRleF07XG4gICAgfVxufSk7XG5cbmRlZmluZShcInNldFwiLCBmdW5jdGlvbiAoaW5kZXgsIHZhbHVlKSB7XG4gICAgdGhpc1tpbmRleF0gPSB2YWx1ZTtcbiAgICByZXR1cm4gdHJ1ZTtcbn0pO1xuXG5kZWZpbmUoXCJhZGRcIiwgZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgdGhpcy5wdXNoKHZhbHVlKTtcbiAgICByZXR1cm4gdHJ1ZTtcbn0pO1xuXG5kZWZpbmUoXCJkZWxldGVcIiwgZnVuY3Rpb24gKHZhbHVlLCBlcXVhbHMpIHtcbiAgICB2YXIgaW5kZXggPSB0aGlzLmZpbmQodmFsdWUsIGVxdWFscyk7XG4gICAgaWYgKGluZGV4ICE9PSAtMSkge1xuICAgICAgICB0aGlzLnNwbGljZU9uZShpbmRleCk7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbiAgICByZXR1cm4gZmFsc2U7XG59KTtcblxuZGVmaW5lKFwiZGVsZXRlQWxsXCIsIGZ1bmN0aW9uICh2YWx1ZSwgZXF1YWxzKSB7XG4gICAgZXF1YWxzID0gZXF1YWxzIHx8IHRoaXMuY29udGVudEVxdWFscyB8fCBPYmplY3QuZXF1YWxzO1xuICAgIHZhciBjb3VudCA9IDA7XG4gICAgZm9yICh2YXIgaW5kZXggPSAwOyBpbmRleCA8IHRoaXMubGVuZ3RoOykge1xuICAgICAgICBpZiAoZXF1YWxzKHZhbHVlLCB0aGlzW2luZGV4XSkpIHtcbiAgICAgICAgICAgIHRoaXMuc3dhcChpbmRleCwgMSk7XG4gICAgICAgICAgICBjb3VudCsrO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgaW5kZXgrKztcbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gY291bnQ7XG59KTtcblxuZGVmaW5lKFwiZmluZFwiLCBmdW5jdGlvbiAodmFsdWUsIGVxdWFscykge1xuICAgIGVxdWFscyA9IGVxdWFscyB8fCB0aGlzLmNvbnRlbnRFcXVhbHMgfHwgT2JqZWN0LmVxdWFscztcbiAgICBmb3IgKHZhciBpbmRleCA9IDA7IGluZGV4IDwgdGhpcy5sZW5ndGg7IGluZGV4KyspIHtcbiAgICAgICAgaWYgKGluZGV4IGluIHRoaXMgJiYgZXF1YWxzKHZhbHVlLCB0aGlzW2luZGV4XSkpIHtcbiAgICAgICAgICAgIHJldHVybiBpbmRleDtcbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gLTE7XG59KTtcblxuZGVmaW5lKFwiZmluZExhc3RcIiwgZnVuY3Rpb24gKHZhbHVlLCBlcXVhbHMpIHtcbiAgICBlcXVhbHMgPSBlcXVhbHMgfHwgdGhpcy5jb250ZW50RXF1YWxzIHx8IE9iamVjdC5lcXVhbHM7XG4gICAgdmFyIGluZGV4ID0gdGhpcy5sZW5ndGg7XG4gICAgZG8ge1xuICAgICAgICBpbmRleC0tO1xuICAgICAgICBpZiAoaW5kZXggaW4gdGhpcyAmJiBlcXVhbHModGhpc1tpbmRleF0sIHZhbHVlKSkge1xuICAgICAgICAgICAgcmV0dXJuIGluZGV4O1xuICAgICAgICB9XG4gICAgfSB3aGlsZSAoaW5kZXggPiAwKTtcbiAgICByZXR1cm4gLTE7XG59KTtcblxuZGVmaW5lKFwic3dhcFwiLCBmdW5jdGlvbiAoc3RhcnQsIGxlbmd0aCwgcGx1cykge1xuICAgIHZhciBhcmdzLCBwbHVzTGVuZ3RoLCBpLCBqLCByZXR1cm5WYWx1ZTtcbiAgICBpZiAoc3RhcnQgPiB0aGlzLmxlbmd0aCkge1xuICAgICAgICB0aGlzLmxlbmd0aCA9IHN0YXJ0O1xuICAgIH1cbiAgICBpZiAodHlwZW9mIHBsdXMgIT09IFwidW5kZWZpbmVkXCIpIHtcbiAgICAgICAgYXJncyA9IFtzdGFydCwgbGVuZ3RoXTtcbiAgICAgICAgaWYgKCFBcnJheS5pc0FycmF5KHBsdXMpKSB7XG4gICAgICAgICAgICBwbHVzID0gYXJyYXlfc2xpY2UuY2FsbChwbHVzKTtcbiAgICAgICAgfVxuICAgICAgICBpID0gMDtcbiAgICAgICAgcGx1c0xlbmd0aCA9IHBsdXMubGVuZ3RoO1xuICAgICAgICAvLyAxMDAwIGlzIGEgbWFnaWMgbnVtYmVyLCBwcmVzdW1lZCB0byBiZSBzbWFsbGVyIHRoYW4gdGhlIHJlbWFpbmluZ1xuICAgICAgICAvLyBzdGFjayBsZW5ndGguIEZvciBzd2FwcyB0aGlzIHNtYWxsLCB3ZSB0YWtlIHRoZSBmYXN0IHBhdGggYW5kIGp1c3RcbiAgICAgICAgLy8gdXNlIHRoZSB1bmRlcmx5aW5nIEFycmF5IHNwbGljZS4gV2UgY291bGQgbWVhc3VyZSB0aGUgZXhhY3Qgc2l6ZSBvZlxuICAgICAgICAvLyB0aGUgcmVtYWluaW5nIHN0YWNrIHVzaW5nIGEgdHJ5L2NhdGNoIGFyb3VuZCBhbiB1bmJvdW5kZWQgcmVjdXJzaXZlXG4gICAgICAgIC8vIGZ1bmN0aW9uLCBidXQgdGhpcyB3b3VsZCBkZWZlYXQgdGhlIHB1cnBvc2Ugb2Ygc2hvcnQtY2lyY3VpdGluZyBpblxuICAgICAgICAvLyB0aGUgY29tbW9uIGNhc2UuXG4gICAgICAgIGlmIChwbHVzTGVuZ3RoIDwgMTAwMCkge1xuICAgICAgICAgICAgZm9yIChpOyBpIDwgcGx1c0xlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgYXJnc1tpKzJdID0gcGx1c1tpXTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBhcnJheV9zcGxpY2UuYXBwbHkodGhpcywgYXJncyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAvLyBBdm9pZCBtYXhpbXVtIGNhbGwgc3RhY2sgZXJyb3IuXG4gICAgICAgICAgICAvLyBGaXJzdCBkZWxldGUgdGhlIGRlc2lyZWQgZW50cmllcy5cbiAgICAgICAgICAgIHJldHVyblZhbHVlID0gYXJyYXlfc3BsaWNlLmFwcGx5KHRoaXMsIGFyZ3MpO1xuICAgICAgICAgICAgLy8gU2Vjb25kIGJhdGNoIGluIDEwMDBzLlxuICAgICAgICAgICAgZm9yIChpOyBpIDwgcGx1c0xlbmd0aDspIHtcbiAgICAgICAgICAgICAgICBhcmdzID0gW3N0YXJ0K2ksIDBdO1xuICAgICAgICAgICAgICAgIGZvciAoaiA9IDI7IGogPCAxMDAyICYmIGkgPCBwbHVzTGVuZ3RoOyBqKyssIGkrKykge1xuICAgICAgICAgICAgICAgICAgICBhcmdzW2pdID0gcGx1c1tpXTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgYXJyYXlfc3BsaWNlLmFwcGx5KHRoaXMsIGFyZ3MpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHJldHVyblZhbHVlO1xuICAgICAgICB9XG4gICAgLy8gdXNpbmcgY2FsbCByYXRoZXIgdGhhbiBhcHBseSB0byBjdXQgZG93biBvbiB0cmFuc2llbnQgb2JqZWN0c1xuICAgIH0gZWxzZSBpZiAodHlwZW9mIGxlbmd0aCAhPT0gXCJ1bmRlZmluZWRcIikge1xuICAgICAgICByZXR1cm4gYXJyYXlfc3BsaWNlLmNhbGwodGhpcywgc3RhcnQsIGxlbmd0aCk7XG4gICAgfSAgZWxzZSBpZiAodHlwZW9mIHN0YXJ0ICE9PSBcInVuZGVmaW5lZFwiKSB7XG4gICAgICAgIHJldHVybiBhcnJheV9zcGxpY2UuY2FsbCh0aGlzLCBzdGFydCk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIFtdO1xuICAgIH1cbn0pO1xuXG5kZWZpbmUoXCJwZWVrXCIsIGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gdGhpc1swXTtcbn0pO1xuXG5kZWZpbmUoXCJwb2tlXCIsIGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgIGlmICh0aGlzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgdGhpc1swXSA9IHZhbHVlO1xuICAgIH1cbn0pO1xuXG5kZWZpbmUoXCJwZWVrQmFja1wiLCBmdW5jdGlvbiAoKSB7XG4gICAgaWYgKHRoaXMubGVuZ3RoID4gMCkge1xuICAgICAgICByZXR1cm4gdGhpc1t0aGlzLmxlbmd0aCAtIDFdO1xuICAgIH1cbn0pO1xuXG5kZWZpbmUoXCJwb2tlQmFja1wiLCBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICBpZiAodGhpcy5sZW5ndGggPiAwKSB7XG4gICAgICAgIHRoaXNbdGhpcy5sZW5ndGggLSAxXSA9IHZhbHVlO1xuICAgIH1cbn0pO1xuXG5kZWZpbmUoXCJvbmVcIiwgZnVuY3Rpb24gKCkge1xuICAgIGZvciAodmFyIGkgaW4gdGhpcykge1xuICAgICAgICBpZiAoT2JqZWN0Lm93bnModGhpcywgaSkpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzW2ldO1xuICAgICAgICB9XG4gICAgfVxufSk7XG5cbmlmICghQXJyYXkucHJvdG90eXBlLmNsZWFyKSB7XG4gICAgZGVmaW5lKFwiY2xlYXJcIiwgZnVuY3Rpb24gKCkge1xuICAgICAgICB0aGlzLmxlbmd0aCA9IDA7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH0pO1xufVxuXG5kZWZpbmUoXCJjb21wYXJlXCIsIGZ1bmN0aW9uICh0aGF0LCBjb21wYXJlKSB7XG4gICAgY29tcGFyZSA9IGNvbXBhcmUgfHwgT2JqZWN0LmNvbXBhcmU7XG4gICAgdmFyIGk7XG4gICAgdmFyIGxlbmd0aDtcbiAgICB2YXIgbGhzO1xuICAgIHZhciByaHM7XG4gICAgdmFyIHJlbGF0aXZlO1xuXG4gICAgaWYgKHRoaXMgPT09IHRoYXQpIHtcbiAgICAgICAgcmV0dXJuIDA7XG4gICAgfVxuXG4gICAgaWYgKCF0aGF0IHx8ICFBcnJheS5pc0FycmF5KHRoYXQpKSB7XG4gICAgICAgIHJldHVybiBHZW5lcmljT3JkZXIucHJvdG90eXBlLmNvbXBhcmUuY2FsbCh0aGlzLCB0aGF0LCBjb21wYXJlKTtcbiAgICB9XG5cbiAgICBsZW5ndGggPSAodGhpcy5sZW5ndGggPCB0aGF0Lmxlbmd0aCkgPyB0aGlzLmxlbmd0aCA6IHRoYXQubGVuZ3RoO1xuXG4gICAgZm9yIChpID0gMDsgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGlmIChpIGluIHRoaXMpIHtcbiAgICAgICAgICAgIGlmICghKGkgaW4gdGhhdCkpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gLTE7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGxocyA9IHRoaXNbaV07XG4gICAgICAgICAgICAgICAgcmhzID0gdGhhdFtpXTtcbiAgICAgICAgICAgICAgICByZWxhdGl2ZSA9IGNvbXBhcmUobGhzLCByaHMpO1xuICAgICAgICAgICAgICAgIGlmIChyZWxhdGl2ZSkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gcmVsYXRpdmU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2UgaWYgKGkgaW4gdGhhdCkge1xuICAgICAgICAgICAgcmV0dXJuIDE7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcy5sZW5ndGggLSB0aGF0Lmxlbmd0aDtcbn0pO1xuXG5kZWZpbmUoXCJlcXVhbHNcIiwgZnVuY3Rpb24gKHRoYXQsIGVxdWFscykge1xuICAgIGVxdWFscyA9IGVxdWFscyB8fCBPYmplY3QuZXF1YWxzO1xuICAgIHZhciBpID0gMDtcbiAgICB2YXIgbGVuZ3RoID0gdGhpcy5sZW5ndGg7XG4gICAgdmFyIGxlZnQ7XG4gICAgdmFyIHJpZ2h0O1xuXG4gICAgaWYgKHRoaXMgPT09IHRoYXQpIHtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuICAgIGlmICghdGhhdCB8fCAhQXJyYXkuaXNBcnJheSh0aGF0KSkge1xuICAgICAgICByZXR1cm4gR2VuZXJpY09yZGVyLnByb3RvdHlwZS5lcXVhbHMuY2FsbCh0aGlzLCB0aGF0KTtcbiAgICB9XG5cbiAgICBpZiAobGVuZ3RoICE9PSB0aGF0Lmxlbmd0aCkge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgZm9yICg7IGkgPCBsZW5ndGg7ICsraSkge1xuICAgICAgICAgICAgaWYgKGkgaW4gdGhpcykge1xuICAgICAgICAgICAgICAgIGlmICghKGkgaW4gdGhhdCkpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBsZWZ0ID0gdGhpc1tpXTtcbiAgICAgICAgICAgICAgICByaWdodCA9IHRoYXRbaV07XG4gICAgICAgICAgICAgICAgaWYgKCFlcXVhbHMobGVmdCwgcmlnaHQpKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGlmIChpIGluIHRoYXQpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gdHJ1ZTtcbn0pO1xuXG5kZWZpbmUoXCJjbG9uZVwiLCBmdW5jdGlvbiAoZGVwdGgsIG1lbW8pIHtcbiAgICBpZiAoZGVwdGggPT0gbnVsbCkge1xuICAgICAgICBkZXB0aCA9IEluZmluaXR5O1xuICAgIH0gZWxzZSBpZiAoZGVwdGggPT09IDApIHtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuICAgIG1lbW8gPSBtZW1vIHx8IG5ldyBXZWFrTWFwKCk7XG4gICAgaWYgKG1lbW8uaGFzKHRoaXMpKSB7XG4gICAgICAgIHJldHVybiBtZW1vLmdldCh0aGlzKTtcbiAgICB9XG4gICAgdmFyIGNsb25lID0gbmV3IEFycmF5KHRoaXMubGVuZ3RoKTtcbiAgICBtZW1vLnNldCh0aGlzLCBjbG9uZSk7XG4gICAgZm9yICh2YXIgaSBpbiB0aGlzKSB7XG4gICAgICAgIGNsb25lW2ldID0gT2JqZWN0LmNsb25lKHRoaXNbaV0sIGRlcHRoIC0gMSwgbWVtbyk7XG4gICAgfTtcbiAgICByZXR1cm4gY2xvbmU7XG59KTtcblxuZGVmaW5lKFwiaXRlcmF0ZVwiLCBmdW5jdGlvbiAoc3RhcnQsIGVuZCkge1xuICAgIHJldHVybiBuZXcgQXJyYXlJdGVyYXRvcih0aGlzLCBzdGFydCwgZW5kKTtcbn0pO1xuXG5pZihBcnJheS5wcm90b3R5cGUuc3BsaWNlT25lID09PSB2b2lkIDApIHtcbiAgICBkZWZpbmUoXCJzcGxpY2VPbmVcIiwgZnVuY3Rpb24gKGluZGV4LGl0ZW1Ub0FkZCkge1xuICAgICAgICB2YXIgbGVuPXRoaXMubGVuZ3RoO1xuICAgICAgICBpZiAoIWxlbikgeyByZXR1cm4gfVxuICAgICAgICBpZihhcmd1bWVudHMubGVuZ3RoID09PSAxKSB7XG4gICAgICAgICAgICB3aGlsZSAoaW5kZXg8bGVuKSB7XG4gICAgICAgICAgICAgICAgdGhpc1tpbmRleF0gPSB0aGlzW2luZGV4KzFdO1xuICAgICAgICAgICAgICAgIGluZGV4KytcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMubGVuZ3RoLS07XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICB0aGlzW2luZGV4XSA9IGl0ZW1Ub0FkZDtcbiAgICAgICAgfVxuICAgIH0pO1xufVxuXG5kZWZpbmUoXCJJdGVyYXRvclwiLCBBcnJheUl0ZXJhdG9yKTtcblxuZnVuY3Rpb24gQXJyYXlJdGVyYXRvcihhcnJheSwgc3RhcnQsIGVuZCkge1xuICAgIHRoaXMuYXJyYXkgPSBhcnJheTtcbiAgICB0aGlzLnN0YXJ0ID0gc3RhcnQgPT0gbnVsbCA/IDAgOiBzdGFydDtcbiAgICB0aGlzLmVuZCA9IGVuZDtcbn07XG5BcnJheUl0ZXJhdG9yLnByb3RvdHlwZS5fX2l0ZXJhdGlvbk9iamVjdCA9IG51bGw7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoQXJyYXlJdGVyYXRvci5wcm90b3R5cGUsXCJfaXRlcmF0aW9uT2JqZWN0XCIsIHtcbiAgICBnZXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fX2l0ZXJhdGlvbk9iamVjdCB8fCAodGhpcy5fX2l0ZXJhdGlvbk9iamVjdCA9IHsgZG9uZTogZmFsc2UsIHZhbHVlOm51bGx9KTtcbiAgICB9XG59KTtcblxuQXJyYXlJdGVyYXRvci5wcm90b3R5cGUubmV4dCA9IGZ1bmN0aW9uICgpIHtcbiAgICBpZiAodGhpcy5zdGFydCA9PT0gKHRoaXMuZW5kID09IG51bGwgPyB0aGlzLmFycmF5Lmxlbmd0aCA6IHRoaXMuZW5kKSkge1xuICAgICAgICB0aGlzLl9pdGVyYXRpb25PYmplY3QuZG9uZSA9IHRydWU7XG4gICAgICAgIHRoaXMuX2l0ZXJhdGlvbk9iamVjdC52YWx1ZSA9IHZvaWQgMDtcbiAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLl9pdGVyYXRpb25PYmplY3QudmFsdWUgPSB0aGlzLmFycmF5W3RoaXMuc3RhcnQrK107XG4gICAgfVxuICAgIHJldHVybiB0aGlzLl9pdGVyYXRpb25PYmplY3Q7XG59O1xuIiwiXG5tb2R1bGUuZXhwb3J0cyA9IEZ1bmN0aW9uO1xuXG4vKipcbiAgICBBIHV0aWxpdHkgdG8gcmVkdWNlIHVubmVjZXNzYXJ5IGFsbG9jYXRpb25zIG9mIDxjb2RlPmZ1bmN0aW9uICgpIHt9PC9jb2RlPlxuICAgIGluIGl0cyBtYW55IGNvbG9yZnVsIHZhcmlhdGlvbnMuICBJdCBkb2VzIG5vdGhpbmcgYW5kIHJldHVybnNcbiAgICA8Y29kZT51bmRlZmluZWQ8L2NvZGU+IHRodXMgbWFrZXMgYSBzdWl0YWJsZSBkZWZhdWx0IGluIHNvbWUgY2lyY3Vtc3RhbmNlcy5cblxuICAgIEBmdW5jdGlvbiBleHRlcm5hbDpGdW5jdGlvbi5ub29wXG4qL1xuRnVuY3Rpb24ubm9vcCA9IGZ1bmN0aW9uICgpIHtcbn07XG5cbi8qKlxuICAgIEEgdXRpbGl0eSB0byByZWR1Y2UgdW5uZWNlc3NhcnkgYWxsb2NhdGlvbnMgb2YgPGNvZGU+ZnVuY3Rpb24gKHgpIHtyZXR1cm5cbiAgICB4fTwvY29kZT4gaW4gaXRzIG1hbnkgY29sb3JmdWwgYnV0IHVsdGltYXRlbHkgd2FzdGVmdWwgcGFyYW1ldGVyIG5hbWVcbiAgICB2YXJpYXRpb25zLlxuXG4gICAgQGZ1bmN0aW9uIGV4dGVybmFsOkZ1bmN0aW9uLmlkZW50aXR5XG4gICAgQHBhcmFtIHtBbnl9IGFueSB2YWx1ZVxuICAgIEByZXR1cm5zIHtBbnl9IHRoYXQgdmFsdWVcbiovXG5GdW5jdGlvbi5pZGVudGl0eSA9IGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgIHJldHVybiB2YWx1ZTtcbn07XG5cbi8qKlxuICAgIEEgdXRpbGl0eSBmb3IgY3JlYXRpbmcgYSBjb21wYXJhdG9yIGZ1bmN0aW9uIGZvciBhIHBhcnRpY3VsYXIgYXNwZWN0IG9mIGFcbiAgICBmaWd1cmF0aXZlIGNsYXNzIG9mIG9iamVjdHMuXG5cbiAgICBAZnVuY3Rpb24gZXh0ZXJuYWw6RnVuY3Rpb24uYnlcbiAgICBAcGFyYW0ge0Z1bmN0aW9ufSByZWxhdGlvbiBBIGZ1bmN0aW9uIHRoYXQgYWNjZXB0cyBhIHZhbHVlIGFuZCByZXR1cm5zIGFcbiAgICBjb3JyZXNwb25kaW5nIHZhbHVlIHRvIHVzZSBhcyBhIHJlcHJlc2VudGF0aXZlIHdoZW4gc29ydGluZyB0aGF0IG9iamVjdC5cbiAgICBAcGFyYW0ge0Z1bmN0aW9ufSBjb21wYXJlIGFuIGFsdGVybmF0ZSBjb21wYXJhdG9yIGZvciBjb21wYXJpbmcgdGhlXG4gICAgcmVwcmVzZW50ZWQgdmFsdWVzLiAgVGhlIGRlZmF1bHQgaXMgPGNvZGU+T2JqZWN0LmNvbXBhcmU8L2NvZGU+LCB3aGljaFxuICAgIGRvZXMgYSBkZWVwLCB0eXBlLXNlbnNpdGl2ZSwgcG9seW1vcnBoaWMgY29tcGFyaXNvbi5cbiAgICBAcmV0dXJucyB7RnVuY3Rpb259IGEgY29tcGFyYXRvciB0aGF0IGhhcyBiZWVuIGFubm90YXRlZCB3aXRoXG4gICAgPGNvZGU+Ynk8L2NvZGU+IGFuZCA8Y29kZT5jb21wYXJlPC9jb2RlPiBwcm9wZXJ0aWVzIHNvXG4gICAgPGNvZGU+c29ydGVkPC9jb2RlPiBjYW4gcGVyZm9ybSBhIHRyYW5zZm9ybSB0aGF0IHJlZHVjZXMgdGhlIG5lZWQgdG8gY2FsbFxuICAgIDxjb2RlPmJ5PC9jb2RlPiBvbiBlYWNoIHNvcnRlZCBvYmplY3QgdG8ganVzdCBvbmNlLlxuICovXG5GdW5jdGlvbi5ieSA9IGZ1bmN0aW9uIChieSAsIGNvbXBhcmUpIHtcbiAgICBjb21wYXJlID0gY29tcGFyZSB8fCBPYmplY3QuY29tcGFyZTtcbiAgICBieSA9IGJ5IHx8IEZ1bmN0aW9uLmlkZW50aXR5O1xuICAgIHZhciBjb21wYXJlQnkgPSBmdW5jdGlvbiAoYSwgYikge1xuICAgICAgICByZXR1cm4gY29tcGFyZShieShhKSwgYnkoYikpO1xuICAgIH07XG4gICAgY29tcGFyZUJ5LmNvbXBhcmUgPSBjb21wYXJlO1xuICAgIGNvbXBhcmVCeS5ieSA9IGJ5O1xuICAgIHJldHVybiBjb21wYXJlQnk7XG59O1xuXG4vLyBUT0RPIGRvY3VtZW50XG5GdW5jdGlvbi5nZXQgPSBmdW5jdGlvbiAoa2V5KSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uIChvYmplY3QpIHtcbiAgICAgICAgcmV0dXJuIE9iamVjdC5nZXQob2JqZWN0LCBrZXkpO1xuICAgIH07XG59O1xuXG4iLCJcInVzZSBzdHJpY3RcIjtcblxudmFyIFdlYWtNYXAgPSByZXF1aXJlKFwid2Vhay1tYXBcIik7XG5cbm1vZHVsZS5leHBvcnRzID0gT2JqZWN0O1xuXG4vKlxuICAgIEJhc2VkIGluIHBhcnQgb24gZXh0cmFzIGZyb20gTW90b3JvbGEgTW9iaWxpdHnigJlzIE1vbnRhZ2VcbiAgICBDb3B5cmlnaHQgKGMpIDIwMTIsIE1vdG9yb2xhIE1vYmlsaXR5IExMQy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAgICAzLUNsYXVzZSBCU0QgTGljZW5zZVxuICAgIGh0dHBzOi8vZ2l0aHViLmNvbS9tb3Rvcm9sYS1tb2JpbGl0eS9tb250YWdlL2Jsb2IvbWFzdGVyL0xJQ0VOU0UubWRcbiovXG5cbi8qKlxuICAgIERlZmluZXMgZXh0ZW5zaW9ucyB0byBpbnRyaW5zaWMgPGNvZGU+T2JqZWN0PC9jb2RlPi5cbiAgICBAc2VlIFtPYmplY3QgY2xhc3Nde0BsaW5rIGV4dGVybmFsOk9iamVjdH1cbiovXG5cbi8qKlxuICAgIEEgdXRpbGl0eSBvYmplY3QgdG8gYXZvaWQgdW5uZWNlc3NhcnkgYWxsb2NhdGlvbnMgb2YgYW4gZW1wdHkgb2JqZWN0XG4gICAgPGNvZGU+e308L2NvZGU+LiAgVGhpcyBvYmplY3QgaXMgZnJvemVuIHNvIGl0IGlzIHNhZmUgdG8gc2hhcmUuXG5cbiAgICBAb2JqZWN0IGV4dGVybmFsOk9iamVjdC5lbXB0eVxuKi9cbk9iamVjdC5lbXB0eSA9IE9iamVjdC5mcmVlemUoT2JqZWN0LmNyZWF0ZShudWxsKSk7XG5cbi8qKlxuICAgIFJldHVybnMgd2hldGhlciB0aGUgZ2l2ZW4gdmFsdWUgaXMgYW4gb2JqZWN0LCBhcyBvcHBvc2VkIHRvIGEgdmFsdWUuXG4gICAgVW5ib3hlZCBudW1iZXJzLCBzdHJpbmdzLCB0cnVlLCBmYWxzZSwgdW5kZWZpbmVkLCBhbmQgbnVsbCBhcmUgbm90XG4gICAgb2JqZWN0cy4gIEFycmF5cyBhcmUgb2JqZWN0cy5cblxuICAgIEBmdW5jdGlvbiBleHRlcm5hbDpPYmplY3QuaXNPYmplY3RcbiAgICBAcGFyYW0ge0FueX0gdmFsdWVcbiAgICBAcmV0dXJucyB7Qm9vbGVhbn0gd2hldGhlciB0aGUgZ2l2ZW4gdmFsdWUgaXMgYW4gb2JqZWN0XG4qL1xuT2JqZWN0LmlzT2JqZWN0ID0gZnVuY3Rpb24gKG9iamVjdCkge1xuICAgIHJldHVybiBPYmplY3Qob2JqZWN0KSA9PT0gb2JqZWN0O1xufTtcblxuLyoqXG4gICAgUmV0dXJucyB0aGUgdmFsdWUgb2YgYW4gYW55IHZhbHVlLCBwYXJ0aWN1bGFybHkgb2JqZWN0cyB0aGF0XG4gICAgaW1wbGVtZW50IDxjb2RlPnZhbHVlT2Y8L2NvZGU+LlxuXG4gICAgPHA+Tm90ZSB0aGF0LCB1bmxpa2UgdGhlIHByZWNlZGVudCBvZiBtZXRob2RzIGxpa2VcbiAgICA8Y29kZT5PYmplY3QuZXF1YWxzPC9jb2RlPiBhbmQgPGNvZGU+T2JqZWN0LmNvbXBhcmU8L2NvZGU+IHdvdWxkIHN1Z2dlc3QsXG4gICAgdGhpcyBtZXRob2QgaXMgbmFtZWQgPGNvZGU+T2JqZWN0LmdldFZhbHVlT2Y8L2NvZGU+IGluc3RlYWQgb2ZcbiAgICA8Y29kZT52YWx1ZU9mPC9jb2RlPi4gIFRoaXMgaXMgYSBkZWxpY2F0ZSBpc3N1ZSwgYnV0IHRoZSBiYXNpcyBvZiB0aGlzXG4gICAgZGVjaXNpb24gaXMgdGhhdCB0aGUgSmF2YVNjcmlwdCBydW50aW1lIHdvdWxkIGJlIGZhciBtb3JlIGxpa2VseSB0b1xuICAgIGFjY2lkZW50YWxseSBjYWxsIHRoaXMgbWV0aG9kIHdpdGggbm8gYXJndW1lbnRzLCBhc3N1bWluZyB0aGF0IGl0IHdvdWxkXG4gICAgcmV0dXJuIHRoZSB2YWx1ZSBvZiA8Y29kZT5PYmplY3Q8L2NvZGU+IGl0c2VsZiBpbiB2YXJpb3VzIHNpdHVhdGlvbnMsXG4gICAgd2hlcmVhcyA8Y29kZT5PYmplY3QuZXF1YWxzKE9iamVjdCwgbnVsbCk8L2NvZGU+IHByb3RlY3RzIGFnYWluc3QgdGhpcyBjYXNlXG4gICAgYnkgbm90aW5nIHRoYXQgPGNvZGU+T2JqZWN0PC9jb2RlPiBvd25zIHRoZSA8Y29kZT5lcXVhbHM8L2NvZGU+IHByb3BlcnR5XG4gICAgYW5kIHRoZXJlZm9yZSBkb2VzIG5vdCBkZWxlZ2F0ZSB0byBpdC5cblxuICAgIEBmdW5jdGlvbiBleHRlcm5hbDpPYmplY3QuZ2V0VmFsdWVPZlxuICAgIEBwYXJhbSB7QW55fSB2YWx1ZSBhIHZhbHVlIG9yIG9iamVjdCB3cmFwcGluZyBhIHZhbHVlXG4gICAgQHJldHVybnMge0FueX0gdGhlIHByaW1pdGl2ZSB2YWx1ZSBvZiB0aGF0IG9iamVjdCwgaWYgb25lIGV4aXN0cywgb3IgcGFzc2VzXG4gICAgdGhlIHZhbHVlIHRocm91Z2hcbiovXG5PYmplY3QuZ2V0VmFsdWVPZiA9IGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgIGlmICh2YWx1ZSAmJiB0eXBlb2YgdmFsdWUudmFsdWVPZiA9PT0gXCJmdW5jdGlvblwiKSB7XG4gICAgICAgIHZhbHVlID0gdmFsdWUudmFsdWVPZigpO1xuICAgIH1cbiAgICByZXR1cm4gdmFsdWU7XG59O1xuXG52YXIgaGFzaE1hcCA9IG5ldyBXZWFrTWFwKCk7XG5PYmplY3QuaGFzaCA9IGZ1bmN0aW9uIChvYmplY3QpIHtcbiAgICBpZiAob2JqZWN0ICYmIHR5cGVvZiBvYmplY3QuaGFzaCA9PT0gXCJmdW5jdGlvblwiKSB7XG4gICAgICAgIHJldHVybiBcIlwiICsgb2JqZWN0Lmhhc2goKTtcbiAgICB9IGVsc2UgaWYgKE9iamVjdChvYmplY3QpID09PSBvYmplY3QpIHtcbiAgICAgICAgaWYgKCFoYXNoTWFwLmhhcyhvYmplY3QpKSB7XG4gICAgICAgICAgICBoYXNoTWFwLnNldChvYmplY3QsIE1hdGgucmFuZG9tKCkudG9TdHJpbmcoMzYpLnNsaWNlKDIpKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gaGFzaE1hcC5nZXQob2JqZWN0KTtcbiAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gXCJcIiArIG9iamVjdDtcbiAgICB9XG59O1xuXG4vKipcbiAgICBBIHNob3J0aGFuZCBmb3IgPGNvZGU+T2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG9iamVjdCxcbiAgICBrZXkpPC9jb2RlPi4gIFJldHVybnMgd2hldGhlciB0aGUgb2JqZWN0IG93bnMgYSBwcm9wZXJ0eSBmb3IgdGhlIGdpdmVuIGtleS5cbiAgICBJdCBkb2VzIG5vdCBjb25zdWx0IHRoZSBwcm90b3R5cGUgY2hhaW4gYW5kIHdvcmtzIGZvciBhbnkgc3RyaW5nIChpbmNsdWRpbmdcbiAgICBcImhhc093blByb3BlcnR5XCIpIGV4Y2VwdCBcIl9fcHJvdG9fX1wiLlxuXG4gICAgQGZ1bmN0aW9uIGV4dGVybmFsOk9iamVjdC5vd25zXG4gICAgQHBhcmFtIHtPYmplY3R9IG9iamVjdFxuICAgIEBwYXJhbSB7U3RyaW5nfSBrZXlcbiAgICBAcmV0dXJucyB7Qm9vbGVhbn0gd2hldGhlciB0aGUgb2JqZWN0IG93bnMgYSBwcm9wZXJ0eSB3Zm9yIHRoZSBnaXZlbiBrZXkuXG4qL1xudmFyIG93bnMgPSBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5O1xuT2JqZWN0Lm93bnMgPSBmdW5jdGlvbiAob2JqZWN0LCBrZXkpIHtcbiAgICByZXR1cm4gb3ducy5jYWxsKG9iamVjdCwga2V5KTtcbn07XG5cbi8qKlxuICAgIEEgdXRpbGl0eSB0aGF0IGlzIGxpa2UgT2JqZWN0Lm93bnMgYnV0IGlzIGFsc28gdXNlZnVsIGZvciBmaW5kaW5nXG4gICAgcHJvcGVydGllcyBvbiB0aGUgcHJvdG90eXBlIGNoYWluLCBwcm92aWRlZCB0aGF0IHRoZXkgZG8gbm90IHJlZmVyIHRvXG4gICAgbWV0aG9kcyBvbiB0aGUgT2JqZWN0IHByb3RvdHlwZS4gIFdvcmtzIGZvciBhbGwgc3RyaW5ncyBleGNlcHQgXCJfX3Byb3RvX19cIi5cblxuICAgIDxwPkFsdGVybmF0ZWx5LCB5b3UgY291bGQgdXNlIHRoZSBcImluXCIgb3BlcmF0b3IgYXMgbG9uZyBhcyB0aGUgb2JqZWN0XG4gICAgZGVzY2VuZHMgZnJvbSBcIm51bGxcIiBpbnN0ZWFkIG9mIHRoZSBPYmplY3QucHJvdG90eXBlLCBhcyB3aXRoXG4gICAgPGNvZGU+T2JqZWN0LmNyZWF0ZShudWxsKTwvY29kZT4uICBIb3dldmVyLFxuICAgIDxjb2RlPk9iamVjdC5jcmVhdGUobnVsbCk8L2NvZGU+IG9ubHkgd29ya3MgaW4gZnVsbHkgY29tcGxpYW50IEVjbWFTY3JpcHQgNVxuICAgIEphdmFTY3JpcHQgZW5naW5lcyBhbmQgY2Fubm90IGJlIGZhaXRoZnVsbHkgc2hpbW1lZC5cblxuICAgIDxwPklmIHRoZSBnaXZlbiBvYmplY3QgaXMgYW4gaW5zdGFuY2Ugb2YgYSB0eXBlIHRoYXQgaW1wbGVtZW50cyBhIG1ldGhvZFxuICAgIG5hbWVkIFwiaGFzXCIsIHRoaXMgZnVuY3Rpb24gZGVmZXJzIHRvIHRoZSBjb2xsZWN0aW9uLCBzbyB0aGlzIG1ldGhvZCBjYW4gYmVcbiAgICB1c2VkIHRvIGdlbmVyaWNhbGx5IGhhbmRsZSBvYmplY3RzLCBhcnJheXMsIG9yIG90aGVyIGNvbGxlY3Rpb25zLiAgSW4gdGhhdFxuICAgIGNhc2UsIHRoZSBkb21haW4gb2YgdGhlIGtleSBkZXBlbmRzIG9uIHRoZSBpbnN0YW5jZS5cblxuICAgIEBwYXJhbSB7T2JqZWN0fSBvYmplY3RcbiAgICBAcGFyYW0ge1N0cmluZ30ga2V5XG4gICAgQHJldHVybnMge0Jvb2xlYW59IHdoZXRoZXIgdGhlIG9iamVjdCwgb3IgYW55IG9mIGl0cyBwcm90b3R5cGVzIGV4Y2VwdFxuICAgIDxjb2RlPk9iamVjdC5wcm90b3R5cGU8L2NvZGU+XG4gICAgQGZ1bmN0aW9uIGV4dGVybmFsOk9iamVjdC5oYXNcbiovXG5PYmplY3QuaGFzID0gZnVuY3Rpb24gKG9iamVjdCwga2V5KSB7XG4gICAgaWYgKHR5cGVvZiBvYmplY3QgIT09IFwib2JqZWN0XCIpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiT2JqZWN0LmhhcyBjYW4ndCBhY2NlcHQgbm9uLW9iamVjdDogXCIgKyB0eXBlb2Ygb2JqZWN0KTtcbiAgICB9XG4gICAgLy8gZm9yd2FyZCB0byBtYXBwZWQgY29sbGVjdGlvbnMgdGhhdCBpbXBsZW1lbnQgXCJoYXNcIlxuICAgIGlmIChvYmplY3QgJiYgdHlwZW9mIG9iamVjdC5oYXMgPT09IFwiZnVuY3Rpb25cIikge1xuICAgICAgICByZXR1cm4gb2JqZWN0LmhhcyhrZXkpO1xuICAgIC8vIG90aGVyd2lzZSByZXBvcnQgd2hldGhlciB0aGUga2V5IGlzIG9uIHRoZSBwcm90b3R5cGUgY2hhaW4sXG4gICAgLy8gYXMgbG9uZyBhcyBpdCBpcyBub3Qgb25lIG9mIHRoZSBtZXRob2RzIG9uIG9iamVjdC5wcm90b3R5cGVcbiAgICB9IGVsc2UgaWYgKHR5cGVvZiBrZXkgPT09IFwic3RyaW5nXCIpIHtcbiAgICAgICAgcmV0dXJuIGtleSBpbiBvYmplY3QgJiYgb2JqZWN0W2tleV0gIT09IE9iamVjdC5wcm90b3R5cGVba2V5XTtcbiAgICB9IGVsc2Uge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJLZXkgbXVzdCBiZSBhIHN0cmluZyBmb3IgT2JqZWN0LmhhcyBvbiBwbGFpbiBvYmplY3RzXCIpO1xuICAgIH1cbn07XG5cbi8qKlxuICAgIEdldHMgdGhlIHZhbHVlIGZvciBhIGNvcnJlc3BvbmRpbmcga2V5IGZyb20gYW4gb2JqZWN0LlxuXG4gICAgPHA+VXNlcyBPYmplY3QuaGFzIHRvIGRldGVybWluZSB3aGV0aGVyIHRoZXJlIGlzIGEgY29ycmVzcG9uZGluZyB2YWx1ZSBmb3JcbiAgICB0aGUgZ2l2ZW4ga2V5LiAgQXMgc3VjaCwgPGNvZGU+T2JqZWN0LmdldDwvY29kZT4gaXMgY2FwYWJsZSBvZiByZXRyaXZpbmdcbiAgICB2YWx1ZXMgZnJvbSB0aGUgcHJvdG90eXBlIGNoYWluIGFzIGxvbmcgYXMgdGhleSBhcmUgbm90IGZyb20gdGhlXG4gICAgPGNvZGU+T2JqZWN0LnByb3RvdHlwZTwvY29kZT4uXG5cbiAgICA8cD5JZiB0aGVyZSBpcyBubyBjb3JyZXNwb25kaW5nIHZhbHVlLCByZXR1cm5zIHRoZSBnaXZlbiBkZWZhdWx0LCB3aGljaCBtYXlcbiAgICBiZSA8Y29kZT51bmRlZmluZWQ8L2NvZGU+LlxuXG4gICAgPHA+SWYgdGhlIGdpdmVuIG9iamVjdCBpcyBhbiBpbnN0YW5jZSBvZiBhIHR5cGUgdGhhdCBpbXBsZW1lbnRzIGEgbWV0aG9kXG4gICAgbmFtZWQgXCJnZXRcIiwgdGhpcyBmdW5jdGlvbiBkZWZlcnMgdG8gdGhlIGNvbGxlY3Rpb24sIHNvIHRoaXMgbWV0aG9kIGNhbiBiZVxuICAgIHVzZWQgdG8gZ2VuZXJpY2FsbHkgaGFuZGxlIG9iamVjdHMsIGFycmF5cywgb3Igb3RoZXIgY29sbGVjdGlvbnMuICBJbiB0aGF0XG4gICAgY2FzZSwgdGhlIGRvbWFpbiBvZiB0aGUga2V5IGRlcGVuZHMgb24gdGhlIGltcGxlbWVudGF0aW9uLiAgRm9yIGEgYE1hcGAsXG4gICAgZm9yIGV4YW1wbGUsIHRoZSBrZXkgbWlnaHQgYmUgYW55IG9iamVjdC5cblxuICAgIEBwYXJhbSB7T2JqZWN0fSBvYmplY3RcbiAgICBAcGFyYW0ge1N0cmluZ30ga2V5XG4gICAgQHBhcmFtIHtBbnl9IHZhbHVlIGEgZGVmYXVsdCB0byByZXR1cm4sIDxjb2RlPnVuZGVmaW5lZDwvY29kZT4gaWYgb21pdHRlZFxuICAgIEByZXR1cm5zIHtBbnl9IHZhbHVlIGZvciBrZXksIG9yIGRlZmF1bHQgdmFsdWVcbiAgICBAZnVuY3Rpb24gZXh0ZXJuYWw6T2JqZWN0LmdldFxuKi9cbk9iamVjdC5nZXQgPSBmdW5jdGlvbiAob2JqZWN0LCBrZXksIHZhbHVlKSB7XG4gICAgaWYgKHR5cGVvZiBvYmplY3QgIT09IFwib2JqZWN0XCIpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiT2JqZWN0LmdldCBjYW4ndCBhY2NlcHQgbm9uLW9iamVjdDogXCIgKyB0eXBlb2Ygb2JqZWN0KTtcbiAgICB9XG4gICAgLy8gZm9yd2FyZCB0byBtYXBwZWQgY29sbGVjdGlvbnMgdGhhdCBpbXBsZW1lbnQgXCJnZXRcIlxuICAgIGlmIChvYmplY3QgJiYgdHlwZW9mIG9iamVjdC5nZXQgPT09IFwiZnVuY3Rpb25cIikge1xuICAgICAgICByZXR1cm4gb2JqZWN0LmdldChrZXksIHZhbHVlKTtcbiAgICB9IGVsc2UgaWYgKE9iamVjdC5oYXMob2JqZWN0LCBrZXkpKSB7XG4gICAgICAgIHJldHVybiBvYmplY3Rba2V5XTtcbiAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gdmFsdWU7XG4gICAgfVxufTtcblxuLyoqXG4gICAgU2V0cyB0aGUgdmFsdWUgZm9yIGEgZ2l2ZW4ga2V5IG9uIGFuIG9iamVjdC5cblxuICAgIDxwPklmIHRoZSBnaXZlbiBvYmplY3QgaXMgYW4gaW5zdGFuY2Ugb2YgYSB0eXBlIHRoYXQgaW1wbGVtZW50cyBhIG1ldGhvZFxuICAgIG5hbWVkIFwic2V0XCIsIHRoaXMgZnVuY3Rpb24gZGVmZXJzIHRvIHRoZSBjb2xsZWN0aW9uLCBzbyB0aGlzIG1ldGhvZCBjYW4gYmVcbiAgICB1c2VkIHRvIGdlbmVyaWNhbGx5IGhhbmRsZSBvYmplY3RzLCBhcnJheXMsIG9yIG90aGVyIGNvbGxlY3Rpb25zLiAgQXMgc3VjaCxcbiAgICB0aGUga2V5IGRvbWFpbiB2YXJpZXMgYnkgdGhlIG9iamVjdCB0eXBlLlxuXG4gICAgQHBhcmFtIHtPYmplY3R9IG9iamVjdFxuICAgIEBwYXJhbSB7U3RyaW5nfSBrZXlcbiAgICBAcGFyYW0ge0FueX0gdmFsdWVcbiAgICBAcmV0dXJucyA8Y29kZT51bmRlZmluZWQ8L2NvZGU+XG4gICAgQGZ1bmN0aW9uIGV4dGVybmFsOk9iamVjdC5zZXRcbiovXG5PYmplY3Quc2V0ID0gZnVuY3Rpb24gKG9iamVjdCwga2V5LCB2YWx1ZSkge1xuICAgIGlmIChvYmplY3QgJiYgdHlwZW9mIG9iamVjdC5zZXQgPT09IFwiZnVuY3Rpb25cIikge1xuICAgICAgICBvYmplY3Quc2V0KGtleSwgdmFsdWUpO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIG9iamVjdFtrZXldID0gdmFsdWU7XG4gICAgfVxufTtcblxuT2JqZWN0LmFkZEVhY2ggPSBmdW5jdGlvbiAodGFyZ2V0LCBzb3VyY2UsIG92ZXJyaWRlcykge1xuICAgIHZhciBvdmVycmlkZXNFeGlzdGluZ1Byb3BlcnR5ID0gYXJndW1lbnRzLmxlbmd0aCA9PT0gMyA/IG92ZXJyaWRlcyA6IHRydWU7XG4gICAgaWYgKCFzb3VyY2UpIHtcbiAgICB9IGVsc2UgaWYgKHR5cGVvZiBzb3VyY2UuZm9yRWFjaCA9PT0gXCJmdW5jdGlvblwiICYmICFzb3VyY2UuaGFzT3duUHJvcGVydHkoXCJmb3JFYWNoXCIpKSB7XG4gICAgICAgIC8vIGNvcHkgbWFwLWFsaWtlc1xuICAgICAgICBpZiAoc291cmNlLmlzTWFwID09PSB0cnVlKSB7XG4gICAgICAgICAgICBzb3VyY2UuZm9yRWFjaChmdW5jdGlvbiAodmFsdWUsIGtleSkge1xuICAgICAgICAgICAgICAgIHRhcmdldFtrZXldID0gdmFsdWU7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgLy8gaXRlcmF0ZSBrZXkgdmFsdWUgcGFpcnMgb2Ygb3RoZXIgaXRlcmFibGVzXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBzb3VyY2UuZm9yRWFjaChmdW5jdGlvbiAocGFpcikge1xuICAgICAgICAgICAgICAgIHRhcmdldFtwYWlyWzBdXSA9IHBhaXJbMV07XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH0gZWxzZSBpZiAodHlwZW9mIHNvdXJjZS5sZW5ndGggPT09IFwibnVtYmVyXCIpIHtcbiAgICAgICAgLy8gYXJndW1lbnRzLCBzdHJpbmdzXG4gICAgICAgIGZvciAodmFyIGluZGV4ID0gMDsgaW5kZXggPCBzb3VyY2UubGVuZ3RoOyBpbmRleCsrKSB7XG4gICAgICAgICAgICB0YXJnZXRbaW5kZXhdID0gc291cmNlW2luZGV4XTtcbiAgICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICAgIC8vIGNvcHkgb3RoZXIgb2JqZWN0cyBhcyBtYXAtYWxpa2VzXG4gICAgICAgIGZvcih2YXIga2V5cyA9IE9iamVjdC5rZXlzKHNvdXJjZSksIGkgPSAwLCBrZXk7KGtleSA9IGtleXNbaV0pOyBpKyspIHtcbiAgICAgICAgICAgIGlmKG92ZXJyaWRlc0V4aXN0aW5nUHJvcGVydHkgfHwgIU9iamVjdC5vd25zKHRhcmdldCxrZXkpKSB7XG4gICAgICAgICAgICAgICAgdGFyZ2V0W2tleV0gPSBzb3VyY2Vba2V5XTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gdGFyZ2V0O1xufTtcblxuXG4vKlxudmFyIGRlZmluZUVhY2ggPSBmdW5jdGlvbiBkZWZpbmVFYWNoKHRhcmdldCwgcHJvdG90eXBlKSB7XG4gICAgLy8gY29uc29sZS5sb2coXCJNYXAgZGVmaW5lRWFjaDogXCIsT2JqZWN0LmtleXMocHJvdG90eXBlKSk7XG4gICAgdmFyIHByb3RvID0gTWFwLnByb3RvdHlwZTtcbiAgICBmb3IgKHZhciBuYW1lIGluIHByb3RvdHlwZSkge1xuICAgICAgICBpZighcHJvdG8uaGFzT3duUHJvcGVydHkobmFtZSkpIHtcbiAgICAgICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShwcm90bywgbmFtZSwge1xuICAgICAgICAgICAgICAgIHZhbHVlOiBwcm90b3R5cGVbbmFtZV0sXG4gICAgICAgICAgICAgICAgd3JpdGFibGU6IHdyaXRhYmxlLFxuICAgICAgICAgICAgICAgIGNvbmZpZ3VyYWJsZTogY29uZmlndXJhYmxlLFxuICAgICAgICAgICAgICAgIGVudW1lcmFibGU6IGVudW1lcmFibGVcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfVxufVxuKi9cbk9iamVjdC5kZWZpbmVFYWNoID0gZnVuY3Rpb24gKHRhcmdldCwgc291cmNlLCBvdmVycmlkZXMsIGNvbmZpZ3VyYWJsZSwgZW51bWVyYWJsZSwgd3JpdGFibGUpIHtcbiAgICB2YXIgb3ZlcnJpZGVzRXhpc3RpbmdQcm9wZXJ0eSA9IGFyZ3VtZW50cy5sZW5ndGggPT09IDMgPyBvdmVycmlkZXMgOiB0cnVlO1xuICAgIGlmICghc291cmNlKSB7XG4gICAgfSBlbHNlIGlmICh0eXBlb2Ygc291cmNlLmZvckVhY2ggPT09IFwiZnVuY3Rpb25cIiAmJiAhc291cmNlLmhhc093blByb3BlcnR5KFwiZm9yRWFjaFwiKSkge1xuICAgICAgICAvLyBjb3B5IG1hcC1hbGlrZXNcbiAgICAgICAgaWYgKHNvdXJjZS5pc01hcCA9PT0gdHJ1ZSkge1xuICAgICAgICAgICAgc291cmNlLmZvckVhY2goZnVuY3Rpb24gKHZhbHVlLCBrZXkpIHtcbiAgICAgICAgICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkodGFyZ2V0LCBrZXksIHtcbiAgICAgICAgICAgICAgICAgICAgdmFsdWU6IHZhbHVlLFxuICAgICAgICAgICAgICAgICAgICB3cml0YWJsZTogd3JpdGFibGUsXG4gICAgICAgICAgICAgICAgICAgIGNvbmZpZ3VyYWJsZTogY29uZmlndXJhYmxlLFxuICAgICAgICAgICAgICAgICAgICBlbnVtZXJhYmxlOiBlbnVtZXJhYmxlXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgLy8gaXRlcmF0ZSBrZXkgdmFsdWUgcGFpcnMgb2Ygb3RoZXIgaXRlcmFibGVzXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBzb3VyY2UuZm9yRWFjaChmdW5jdGlvbiAocGFpcikge1xuICAgICAgICAgICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0YXJnZXQsIHBhaXJbMF0sIHtcbiAgICAgICAgICAgICAgICAgICAgdmFsdWU6IHBhaXJbMV0sXG4gICAgICAgICAgICAgICAgICAgIHdyaXRhYmxlOiB3cml0YWJsZSxcbiAgICAgICAgICAgICAgICAgICAgY29uZmlndXJhYmxlOiBjb25maWd1cmFibGUsXG4gICAgICAgICAgICAgICAgICAgIGVudW1lcmFibGU6IGVudW1lcmFibGVcbiAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9IGVsc2UgaWYgKHR5cGVvZiBzb3VyY2UubGVuZ3RoID09PSBcIm51bWJlclwiKSB7XG4gICAgICAgIC8vIGFyZ3VtZW50cywgc3RyaW5nc1xuICAgICAgICBmb3IgKHZhciBpbmRleCA9IDA7IGluZGV4IDwgc291cmNlLmxlbmd0aDsgaW5kZXgrKykge1xuICAgICAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRhcmdldCwgaW5kZXgsIHtcbiAgICAgICAgICAgICAgICB2YWx1ZTogc291cmNlW2luZGV4XSxcbiAgICAgICAgICAgICAgICB3cml0YWJsZTogd3JpdGFibGUsXG4gICAgICAgICAgICAgICAgY29uZmlndXJhYmxlOiBjb25maWd1cmFibGUsXG4gICAgICAgICAgICAgICAgZW51bWVyYWJsZTogZW51bWVyYWJsZVxuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICAgIC8vIGNvcHkgb3RoZXIgb2JqZWN0cyBhcyBtYXAtYWxpa2VzXG4gICAgICAgIGZvcih2YXIga2V5cyA9IE9iamVjdC5rZXlzKHNvdXJjZSksIGkgPSAwLCBrZXk7KGtleSA9IGtleXNbaV0pOyBpKyspIHtcbiAgICAgICAgICAgIGlmKG92ZXJyaWRlc0V4aXN0aW5nUHJvcGVydHkgfHwgIU9iamVjdC5vd25zKHRhcmdldCxrZXkpKSB7XG4gICAgICAgICAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRhcmdldCwga2V5LCB7XG4gICAgICAgICAgICAgICAgICAgIHZhbHVlOiBzb3VyY2Vba2V5XSxcbiAgICAgICAgICAgICAgICAgICAgd3JpdGFibGU6IHdyaXRhYmxlLFxuICAgICAgICAgICAgICAgICAgICBjb25maWd1cmFibGU6IGNvbmZpZ3VyYWJsZSxcbiAgICAgICAgICAgICAgICAgICAgZW51bWVyYWJsZTogZW51bWVyYWJsZVxuICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHRhcmdldDtcbn07XG5cbi8qKlxuICAgIEl0ZXJhdGVzIG92ZXIgdGhlIG93bmVkIHByb3BlcnRpZXMgb2YgYW4gb2JqZWN0LlxuXG4gICAgQGZ1bmN0aW9uIGV4dGVybmFsOk9iamVjdC5mb3JFYWNoXG4gICAgQHBhcmFtIHtPYmplY3R9IG9iamVjdCBhbiBvYmplY3QgdG8gaXRlcmF0ZS5cbiAgICBAcGFyYW0ge0Z1bmN0aW9ufSBjYWxsYmFjayBhIGZ1bmN0aW9uIHRvIGNhbGwgZm9yIGV2ZXJ5IGtleSBhbmQgdmFsdWVcbiAgICBwYWlyIGluIHRoZSBvYmplY3QuICBSZWNlaXZlcyA8Y29kZT52YWx1ZTwvY29kZT4sIDxjb2RlPmtleTwvY29kZT4sXG4gICAgYW5kIDxjb2RlPm9iamVjdDwvY29kZT4gYXMgYXJndW1lbnRzLlxuICAgIEBwYXJhbSB7T2JqZWN0fSB0aGlzcCB0aGUgPGNvZGU+dGhpczwvY29kZT4gdG8gcGFzcyB0aHJvdWdoIHRvIHRoZVxuICAgIGNhbGxiYWNrXG4qL1xuT2JqZWN0LmZvckVhY2ggPSBmdW5jdGlvbiAob2JqZWN0LCBjYWxsYmFjaywgdGhpc3ApIHtcblxuICAgIHZhciBrZXlzID0gT2JqZWN0LmtleXMob2JqZWN0KSwgaSA9IDAsIGlLZXk7XG4gICAgZm9yKDsoaUtleSA9IGtleXNbaV0pO2krKykge1xuICAgICAgICBjYWxsYmFjay5jYWxsKHRoaXNwLCBvYmplY3RbaUtleV0sIGlLZXksIG9iamVjdCk7XG4gICAgfVxuXG59O1xuXG4vKipcbiAgICBJdGVyYXRlcyBvdmVyIHRoZSBvd25lZCBwcm9wZXJ0aWVzIG9mIGEgbWFwLCBjb25zdHJ1Y3RpbmcgYSBuZXcgYXJyYXkgb2ZcbiAgICBtYXBwZWQgdmFsdWVzLlxuXG4gICAgQGZ1bmN0aW9uIGV4dGVybmFsOk9iamVjdC5tYXBcbiAgICBAcGFyYW0ge09iamVjdH0gb2JqZWN0IGFuIG9iamVjdCB0byBpdGVyYXRlLlxuICAgIEBwYXJhbSB7RnVuY3Rpb259IGNhbGxiYWNrIGEgZnVuY3Rpb24gdG8gY2FsbCBmb3IgZXZlcnkga2V5IGFuZCB2YWx1ZVxuICAgIHBhaXIgaW4gdGhlIG9iamVjdC4gIFJlY2VpdmVzIDxjb2RlPnZhbHVlPC9jb2RlPiwgPGNvZGU+a2V5PC9jb2RlPixcbiAgICBhbmQgPGNvZGU+b2JqZWN0PC9jb2RlPiBhcyBhcmd1bWVudHMuXG4gICAgQHBhcmFtIHtPYmplY3R9IHRoaXNwIHRoZSA8Y29kZT50aGlzPC9jb2RlPiB0byBwYXNzIHRocm91Z2ggdG8gdGhlXG4gICAgY2FsbGJhY2tcbiAgICBAcmV0dXJucyB7QXJyYXl9IHRoZSByZXNwZWN0aXZlIHZhbHVlcyByZXR1cm5lZCBieSB0aGUgY2FsbGJhY2sgZm9yIGVhY2hcbiAgICBpdGVtIGluIHRoZSBvYmplY3QuXG4qL1xuT2JqZWN0Lm1hcCA9IGZ1bmN0aW9uIChvYmplY3QsIGNhbGxiYWNrLCB0aGlzcCkge1xuICAgIHZhciBrZXlzID0gT2JqZWN0LmtleXMob2JqZWN0KSwgaSA9IDAsIHJlc3VsdCA9IFtdLCBpS2V5O1xuICAgIGZvcig7KGlLZXkgPSBrZXlzW2ldKTtpKyspIHtcbiAgICAgICAgcmVzdWx0LnB1c2goY2FsbGJhY2suY2FsbCh0aGlzcCwgb2JqZWN0W2lLZXldLCBpS2V5LCBvYmplY3QpKTtcbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdDtcbn07XG5cbi8qKlxuICAgIFJldHVybnMgdGhlIHZhbHVlcyBmb3Igb3duZWQgcHJvcGVydGllcyBvZiBhbiBvYmplY3QuXG5cbiAgICBAZnVuY3Rpb24gZXh0ZXJuYWw6T2JqZWN0Lm1hcFxuICAgIEBwYXJhbSB7T2JqZWN0fSBvYmplY3RcbiAgICBAcmV0dXJucyB7QXJyYXl9IHRoZSByZXNwZWN0aXZlIHZhbHVlIGZvciBlYWNoIG93bmVkIHByb3BlcnR5IG9mIHRoZVxuICAgIG9iamVjdC5cbiovXG5PYmplY3QudmFsdWVzID0gZnVuY3Rpb24gKG9iamVjdCkge1xuICAgIHJldHVybiBPYmplY3QubWFwKG9iamVjdCwgRnVuY3Rpb24uaWRlbnRpdHkpO1xufTtcblxuLy8gVE9ETyBpbmxpbmUgZG9jdW1lbnQgY29uY2F0XG5PYmplY3QuY29uY2F0ID0gZnVuY3Rpb24gKCkge1xuICAgIHZhciBvYmplY3QgPSB7fTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGFyZ3VtZW50cy5sZW5ndGg7IGkrKykge1xuICAgICAgICBPYmplY3QuYWRkRWFjaChvYmplY3QsIGFyZ3VtZW50c1tpXSk7XG4gICAgfVxuICAgIHJldHVybiBvYmplY3Q7XG59O1xuXG5PYmplY3QuZnJvbSA9IE9iamVjdC5jb25jYXQ7XG5cbi8qKlxuICAgIFJldHVybnMgd2hldGhlciB0d28gdmFsdWVzIGFyZSBpZGVudGljYWwuICBBbnkgdmFsdWUgaXMgaWRlbnRpY2FsIHRvIGl0c2VsZlxuICAgIGFuZCBvbmx5IGl0c2VsZi4gIFRoaXMgaXMgbXVjaCBtb3JlIHJlc3RpY3RpdmUgdGhhbiBlcXVpdmFsZW5jZSBhbmQgc3VidGx5XG4gICAgZGlmZmVyZW50IHRoYW4gc3RyaWN0IGVxdWFsaXR5LCA8Y29kZT49PT08L2NvZGU+IGJlY2F1c2Ugb2YgZWRnZSBjYXNlc1xuICAgIGluY2x1ZGluZyBuZWdhdGl2ZSB6ZXJvIGFuZCA8Y29kZT5OYU48L2NvZGU+LiAgSWRlbnRpdHkgaXMgdXNlZnVsIGZvclxuICAgIHJlc29sdmluZyBjb2xsaXNpb25zIGFtb25nIGtleXMgaW4gYSBtYXBwaW5nIHdoZXJlIHRoZSBkb21haW4gaXMgYW55IHZhbHVlLlxuICAgIFRoaXMgbWV0aG9kIGRvZXMgbm90IGRlbGdhdGUgdG8gYW55IG1ldGhvZCBvbiBhbiBvYmplY3QgYW5kIGNhbm5vdCBiZVxuICAgIG92ZXJyaWRkZW4uXG4gICAgQHNlZSBodHRwOi8vd2lraS5lY21hc2NyaXB0Lm9yZy9kb2t1LnBocD9pZD1oYXJtb255OmVnYWxcbiAgICBAcGFyYW0ge0FueX0gdGhpc1xuICAgIEBwYXJhbSB7QW55fSB0aGF0XG4gICAgQHJldHVybnMge0Jvb2xlYW59IHdoZXRoZXIgdGhpcyBhbmQgdGhhdCBhcmUgaWRlbnRpY2FsXG4gICAgQGZ1bmN0aW9uIGV4dGVybmFsOk9iamVjdC5pc1xuKi9cbk9iamVjdC5pcyA9IGZ1bmN0aW9uICh4LCB5KSB7XG4gICAgaWYgKHggPT09IHkpIHtcbiAgICAgICAgLy8gMCA9PT0gLTAsIGJ1dCB0aGV5IGFyZSBub3QgaWRlbnRpY2FsXG4gICAgICAgIHJldHVybiB4ICE9PSAwIHx8IDEgLyB4ID09PSAxIC8geTtcbiAgICB9XG4gICAgLy8gTmFOICE9PSBOYU4sIGJ1dCB0aGV5IGFyZSBpZGVudGljYWwuXG4gICAgLy8gTmFOcyBhcmUgdGhlIG9ubHkgbm9uLXJlZmxleGl2ZSB2YWx1ZSwgaS5lLiwgaWYgeCAhPT0geCxcbiAgICAvLyB0aGVuIHggaXMgYSBOYU4uXG4gICAgLy8gaXNOYU4gaXMgYnJva2VuOiBpdCBjb252ZXJ0cyBpdHMgYXJndW1lbnQgdG8gbnVtYmVyLCBzb1xuICAgIC8vIGlzTmFOKFwiZm9vXCIpID0+IHRydWVcbiAgICByZXR1cm4geCAhPT0geCAmJiB5ICE9PSB5O1xufTtcblxuLyoqXG4gICAgUGVyZm9ybXMgYSBwb2x5bW9ycGhpYywgdHlwZS1zZW5zaXRpdmUgZGVlcCBlcXVpdmFsZW5jZSBjb21wYXJpc29uIG9mIGFueVxuICAgIHR3byB2YWx1ZXMuXG5cbiAgICA8cD5BcyBhIGJhc2ljIHByaW5jaXBsZSwgYW55IHZhbHVlIGlzIGVxdWl2YWxlbnQgdG8gaXRzZWxmIChhcyBpblxuICAgIGlkZW50aXR5KSwgYW55IGJveGVkIHZlcnNpb24gb2YgaXRzZWxmIChhcyBhIDxjb2RlPm5ldyBOdW1iZXIoMTApPC9jb2RlPiBpc1xuICAgIHRvIDEwKSwgYW5kIGFueSBkZWVwIGNsb25lIG9mIGl0c2VsZi5cblxuICAgIDxwPkVxdWl2YWxlbmNlIGhhcyB0aGUgZm9sbG93aW5nIHByb3BlcnRpZXM6XG5cbiAgICA8dWw+XG4gICAgICAgIDxsaT48c3Ryb25nPnBvbHltb3JwaGljOjwvc3Ryb25nPlxuICAgICAgICAgICAgSWYgdGhlIGdpdmVuIG9iamVjdCBpcyBhbiBpbnN0YW5jZSBvZiBhIHR5cGUgdGhhdCBpbXBsZW1lbnRzIGFcbiAgICAgICAgICAgIG1ldGhvZHMgbmFtZWQgXCJlcXVhbHNcIiwgdGhpcyBmdW5jdGlvbiBkZWZlcnMgdG8gdGhlIG1ldGhvZC4gIFNvLFxuICAgICAgICAgICAgdGhpcyBmdW5jdGlvbiBjYW4gc2FmZWx5IGNvbXBhcmUgYW55IHZhbHVlcyByZWdhcmRsZXNzIG9mIHR5cGUsXG4gICAgICAgICAgICBpbmNsdWRpbmcgdW5kZWZpbmVkLCBudWxsLCBudW1iZXJzLCBzdHJpbmdzLCBhbnkgcGFpciBvZiBvYmplY3RzXG4gICAgICAgICAgICB3aGVyZSBlaXRoZXIgaW1wbGVtZW50cyBcImVxdWFsc1wiLCBvciBvYmplY3QgbGl0ZXJhbHMgdGhhdCBtYXkgZXZlblxuICAgICAgICAgICAgY29udGFpbiBhbiBcImVxdWFsc1wiIGtleS5cbiAgICAgICAgPGxpPjxzdHJvbmc+dHlwZS1zZW5zaXRpdmU6PC9zdHJvbmc+XG4gICAgICAgICAgICBJbmNvbXBhcmFibGUgdHlwZXMgYXJlIG5vdCBlcXVhbC4gIE5vIG9iamVjdCBpcyBlcXVpdmFsZW50IHRvIGFueVxuICAgICAgICAgICAgYXJyYXkuICBObyBzdHJpbmcgaXMgZXF1YWwgdG8gYW55IG90aGVyIG51bWJlci5cbiAgICAgICAgPGxpPjxzdHJvbmc+ZGVlcDo8L3N0cm9uZz5cbiAgICAgICAgICAgIENvbGxlY3Rpb25zIHdpdGggZXF1aXZhbGVudCBjb250ZW50IGFyZSBlcXVpdmFsZW50LCByZWN1cnNpdmVseS5cbiAgICAgICAgPGxpPjxzdHJvbmc+ZXF1aXZhbGVuY2U6PC9zdHJvbmc+XG4gICAgICAgICAgICBJZGVudGljYWwgdmFsdWVzIGFuZCBvYmplY3RzIGFyZSBlcXVpdmFsZW50LCBidXQgc28gYXJlIGNvbGxlY3Rpb25zXG4gICAgICAgICAgICB0aGF0IGNvbnRhaW4gZXF1aXZhbGVudCBjb250ZW50LiAgV2hldGhlciBvcmRlciBpcyBpbXBvcnRhbnQgdmFyaWVzXG4gICAgICAgICAgICBieSB0eXBlLiAgRm9yIEFycmF5cyBhbmQgbGlzdHMsIG9yZGVyIGlzIGltcG9ydGFudC4gIEZvciBPYmplY3RzLFxuICAgICAgICAgICAgbWFwcywgYW5kIHNldHMsIG9yZGVyIGlzIG5vdCBpbXBvcnRhbnQuICBCb3hlZCBvYmplY3RzIGFyZSBtdXRhbGx5XG4gICAgICAgICAgICBlcXVpdmFsZW50IHdpdGggdGhlaXIgdW5ib3hlZCB2YWx1ZXMsIGJ5IHZpcnR1ZSBvZiB0aGUgc3RhbmRhcmRcbiAgICAgICAgICAgIDxjb2RlPnZhbHVlT2Y8L2NvZGU+IG1ldGhvZC5cbiAgICA8L3VsPlxuICAgIEBwYXJhbSB0aGlzXG4gICAgQHBhcmFtIHRoYXRcbiAgICBAcmV0dXJucyB7Qm9vbGVhbn0gd2hldGhlciB0aGUgdmFsdWVzIGFyZSBkZWVwbHkgZXF1aXZhbGVudFxuICAgIEBmdW5jdGlvbiBleHRlcm5hbDpPYmplY3QuZXF1YWxzXG4qL1xuT2JqZWN0LmVxdWFscyA9IGZ1bmN0aW9uIChhLCBiLCBlcXVhbHMsIG1lbW8pIHtcbiAgICBlcXVhbHMgPSBlcXVhbHMgfHwgT2JqZWN0LmVxdWFscztcbiAgICAvL2NvbnNvbGUubG9nKFwiT2JqZWN0LmVxdWFsczogYTpcIixhLCBcImI6XCIsYiwgXCJlcXVhbHM6XCIsZXF1YWxzKTtcbiAgICAvLyB1bmJveCBvYmplY3RzLCBidXQgZG8gbm90IGNvbmZ1c2Ugb2JqZWN0IGxpdGVyYWxzXG4gICAgYSA9IE9iamVjdC5nZXRWYWx1ZU9mKGEpO1xuICAgIGIgPSBPYmplY3QuZ2V0VmFsdWVPZihiKTtcbiAgICBpZiAoYSA9PT0gYilcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgaWYgKE9iamVjdC5pc09iamVjdChhKSkge1xuICAgICAgICBtZW1vID0gbWVtbyB8fCBuZXcgV2Vha01hcCgpO1xuICAgICAgICBpZiAobWVtby5oYXMoYSkpIHtcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9XG4gICAgICAgIG1lbW8uc2V0KGEsIHRydWUpO1xuICAgIH1cbiAgICBpZiAoT2JqZWN0LmlzT2JqZWN0KGEpICYmIHR5cGVvZiBhLmVxdWFscyA9PT0gXCJmdW5jdGlvblwiKSB7XG4gICAgICAgIHJldHVybiBhLmVxdWFscyhiLCBlcXVhbHMsIG1lbW8pO1xuICAgIH1cbiAgICAvLyBjb21tdXRhdGl2ZVxuICAgIGlmIChPYmplY3QuaXNPYmplY3QoYikgJiYgdHlwZW9mIGIuZXF1YWxzID09PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgICAgcmV0dXJuIGIuZXF1YWxzKGEsIGVxdWFscywgbWVtbyk7XG4gICAgfVxuICAgIGlmIChPYmplY3QuaXNPYmplY3QoYSkgJiYgT2JqZWN0LmlzT2JqZWN0KGIpKSB7XG4gICAgICAgIGlmIChPYmplY3QuZ2V0UHJvdG90eXBlT2YoYSkgPT09IE9iamVjdC5wcm90b3R5cGUgJiYgT2JqZWN0LmdldFByb3RvdHlwZU9mKGIpID09PSBPYmplY3QucHJvdG90eXBlKSB7XG4gICAgICAgICAgICBmb3IgKHZhciBuYW1lIGluIGEpIHtcbiAgICAgICAgICAgICAgICBpZiAoIWVxdWFscyhhW25hbWVdLCBiW25hbWVdLCBlcXVhbHMsIG1lbW8pKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBmb3IgKHZhciBuYW1lIGluIGIpIHtcbiAgICAgICAgICAgICAgICBpZiAoIShuYW1lIGluIGEpIHx8ICFlcXVhbHMoYltuYW1lXSwgYVtuYW1lXSwgZXF1YWxzLCBtZW1vKSkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH1cbiAgICB9XG4gICAgLy8gTmFOICE9PSBOYU4sIGJ1dCB0aGV5IGFyZSBlcXVhbC5cbiAgICAvLyBOYU5zIGFyZSB0aGUgb25seSBub24tcmVmbGV4aXZlIHZhbHVlLCBpLmUuLCBpZiB4ICE9PSB4LFxuICAgIC8vIHRoZW4geCBpcyBhIE5hTi5cbiAgICAvLyBpc05hTiBpcyBicm9rZW46IGl0IGNvbnZlcnRzIGl0cyBhcmd1bWVudCB0byBudW1iZXIsIHNvXG4gICAgLy8gaXNOYU4oXCJmb29cIikgPT4gdHJ1ZVxuICAgIC8vIFdlIGhhdmUgZXN0YWJsaXNoZWQgdGhhdCBhICE9PSBiLCBidXQgaWYgYSAhPT0gYSAmJiBiICE9PSBiLCB0aGV5IGFyZVxuICAgIC8vIGJvdGggTmFOLlxuICAgIGlmIChhICE9PSBhICYmIGIgIT09IGIpXG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIGlmICghYSB8fCAhYilcbiAgICAgICAgcmV0dXJuIGEgPT09IGI7XG4gICAgcmV0dXJuIGZhbHNlO1xufTtcblxuLy8gQmVjYXVzZSBhIHJldHVybiB2YWx1ZSBvZiAwIGZyb20gYSBgY29tcGFyZWAgZnVuY3Rpb24gIG1heSBtZWFuIGVpdGhlclxuLy8gXCJlcXVhbHNcIiBvciBcImlzIGluY29tcGFyYWJsZVwiLCBgZXF1YWxzYCBjYW5ub3QgYmUgZGVmaW5lZCBpbiB0ZXJtcyBvZlxuLy8gYGNvbXBhcmVgLiAgSG93ZXZlciwgYGNvbXBhcmVgICpjYW4qIGJlIGRlZmluZWQgaW4gdGVybXMgb2YgYGVxdWFsc2AgYW5kXG4vLyBgbGVzc1RoYW5gLiAgQWdhaW4gaG93ZXZlciwgbW9yZSBvZnRlbiBpdCB3b3VsZCBiZSBkZXNpcmFibGUgdG8gaW1wbGVtZW50XG4vLyBhbGwgb2YgdGhlIGNvbXBhcmlzb24gZnVuY3Rpb25zIGluIHRlcm1zIG9mIGNvbXBhcmUgcmF0aGVyIHRoYW4gdGhlIG90aGVyXG4vLyB3YXkgYXJvdW5kLlxuXG4vKipcbiAgICBEZXRlcm1pbmVzIHRoZSBvcmRlciBpbiB3aGljaCBhbnkgdHdvIG9iamVjdHMgc2hvdWxkIGJlIHNvcnRlZCBieSByZXR1cm5pbmdcbiAgICBhIG51bWJlciB0aGF0IGhhcyBhbiBhbmFsb2dvdXMgcmVsYXRpb25zaGlwIHRvIHplcm8gYXMgdGhlIGxlZnQgdmFsdWUgdG9cbiAgICB0aGUgcmlnaHQuICBUaGF0IGlzLCBpZiB0aGUgbGVmdCBpcyBcImxlc3MgdGhhblwiIHRoZSByaWdodCwgdGhlIHJldHVybmVkXG4gICAgdmFsdWUgd2lsbCBiZSBcImxlc3MgdGhhblwiIHplcm8sIHdoZXJlIFwibGVzcyB0aGFuXCIgbWF5IGJlIGFueSBvdGhlclxuICAgIHRyYW5zaXRpdmUgcmVsYXRpb25zaGlwLlxuXG4gICAgPHA+QXJyYXlzIGFyZSBjb21wYXJlZCBieSB0aGUgZmlyc3QgZGl2ZXJnaW5nIHZhbHVlcywgb3IgYnkgbGVuZ3RoLlxuXG4gICAgPHA+QW55IHR3byB2YWx1ZXMgdGhhdCBhcmUgaW5jb21wYXJhYmxlIHJldHVybiB6ZXJvLiAgQXMgc3VjaCxcbiAgICA8Y29kZT5lcXVhbHM8L2NvZGU+IHNob3VsZCBub3QgYmUgaW1wbGVtZW50ZWQgd2l0aCA8Y29kZT5jb21wYXJlPC9jb2RlPlxuICAgIHNpbmNlIGluY29tcGFyYWJpbGl0eSBpcyBpbmRpc3Rpbmd1aXNoYWJsZSBmcm9tIGVxdWFsaXR5LlxuXG4gICAgPHA+U29ydHMgc3RyaW5ncyBsZXhpY29ncmFwaGljYWxseS4gIFRoaXMgaXMgbm90IHN1aXRhYmxlIGZvciBhbnlcbiAgICBwYXJ0aWN1bGFyIGludGVybmF0aW9uYWwgc2V0dGluZy4gIERpZmZlcmVudCBsb2NhbGVzIHNvcnQgdGhlaXIgcGhvbmUgYm9va3NcbiAgICBpbiB2ZXJ5IGRpZmZlcmVudCB3YXlzLCBwYXJ0aWN1bGFybHkgcmVnYXJkaW5nIGRpYWNyaXRpY3MgYW5kIGxpZ2F0dXJlcy5cblxuICAgIDxwPklmIHRoZSBnaXZlbiBvYmplY3QgaXMgYW4gaW5zdGFuY2Ugb2YgYSB0eXBlIHRoYXQgaW1wbGVtZW50cyBhIG1ldGhvZFxuICAgIG5hbWVkIFwiY29tcGFyZVwiLCB0aGlzIGZ1bmN0aW9uIGRlZmVycyB0byB0aGUgaW5zdGFuY2UuICBUaGUgbWV0aG9kIGRvZXMgbm90XG4gICAgbmVlZCB0byBiZSBhbiBvd25lZCBwcm9wZXJ0eSB0byBkaXN0aW5ndWlzaCBpdCBmcm9tIGFuIG9iamVjdCBsaXRlcmFsIHNpbmNlXG4gICAgb2JqZWN0IGxpdGVyYWxzIGFyZSBpbmNvbXBhcmFibGUuICBVbmxpa2UgPGNvZGU+T2JqZWN0PC9jb2RlPiBob3dldmVyLFxuICAgIDxjb2RlPkFycmF5PC9jb2RlPiBpbXBsZW1lbnRzIDxjb2RlPmNvbXBhcmU8L2NvZGU+LlxuXG4gICAgQHBhcmFtIHtBbnl9IGxlZnRcbiAgICBAcGFyYW0ge0FueX0gcmlnaHRcbiAgICBAcmV0dXJucyB7TnVtYmVyfSBhIHZhbHVlIGhhdmluZyB0aGUgc2FtZSB0cmFuc2l0aXZlIHJlbGF0aW9uc2hpcCB0byB6ZXJvXG4gICAgYXMgdGhlIGxlZnQgYW5kIHJpZ2h0IHZhbHVlcy5cbiAgICBAZnVuY3Rpb24gZXh0ZXJuYWw6T2JqZWN0LmNvbXBhcmVcbiovXG5PYmplY3QuY29tcGFyZSA9IGZ1bmN0aW9uIChhLCBiKSB7XG4gICAgLy8gdW5ib3ggb2JqZWN0cywgYnV0IGRvIG5vdCBjb25mdXNlIG9iamVjdCBsaXRlcmFsc1xuICAgIC8vIG1lcmNpZnVsbHkgaGFuZGxlcyB0aGUgRGF0ZSBjYXNlXG4gICAgYSA9IE9iamVjdC5nZXRWYWx1ZU9mKGEpO1xuICAgIGIgPSBPYmplY3QuZ2V0VmFsdWVPZihiKTtcbiAgICBpZiAoYSA9PT0gYilcbiAgICAgICAgcmV0dXJuIDA7XG4gICAgdmFyIGFUeXBlID0gdHlwZW9mIGE7XG4gICAgdmFyIGJUeXBlID0gdHlwZW9mIGI7XG4gICAgaWYgKGFUeXBlID09PSBcIm51bWJlclwiICYmIGJUeXBlID09PSBcIm51bWJlclwiKVxuICAgICAgICByZXR1cm4gYSAtIGI7XG4gICAgaWYgKGFUeXBlID09PSBcInN0cmluZ1wiICYmIGJUeXBlID09PSBcInN0cmluZ1wiKVxuICAgICAgICByZXR1cm4gYSA8IGIgPyAtSW5maW5pdHkgOiBJbmZpbml0eTtcbiAgICAgICAgLy8gdGhlIHBvc3NpYmlsaXR5IG9mIGVxdWFsaXR5IGVsaW1pYXRlZCBhYm92ZVxuICAgIGlmIChhICYmIHR5cGVvZiBhLmNvbXBhcmUgPT09IFwiZnVuY3Rpb25cIilcbiAgICAgICAgcmV0dXJuIGEuY29tcGFyZShiKTtcbiAgICAvLyBub3QgY29tbXV0YXRpdmUsIHRoZSByZWxhdGlvbnNoaXAgaXMgcmV2ZXJzZWRcbiAgICBpZiAoYiAmJiB0eXBlb2YgYi5jb21wYXJlID09PSBcImZ1bmN0aW9uXCIpXG4gICAgICAgIHJldHVybiAtYi5jb21wYXJlKGEpO1xuICAgIHJldHVybiAwO1xufTtcblxuLyoqXG4gICAgQ3JlYXRlcyBhIGRlZXAgY29weSBvZiBhbnkgdmFsdWUuICBWYWx1ZXMsIGJlaW5nIGltbXV0YWJsZSwgYXJlXG4gICAgcmV0dXJuZWQgd2l0aG91dCBhbHRlcm5hdGlvbi4gIEZvcndhcmRzIHRvIDxjb2RlPmNsb25lPC9jb2RlPiBvblxuICAgIG9iamVjdHMgYW5kIGFycmF5cy5cblxuICAgIEBmdW5jdGlvbiBleHRlcm5hbDpPYmplY3QuY2xvbmVcbiAgICBAcGFyYW0ge0FueX0gdmFsdWUgYSB2YWx1ZSB0byBjbG9uZVxuICAgIEBwYXJhbSB7TnVtYmVyfSBkZXB0aCBhbiBvcHRpb25hbCB0cmF2ZXJzYWwgZGVwdGgsIGRlZmF1bHRzIHRvIGluZmluaXR5LlxuICAgIEEgdmFsdWUgb2YgPGNvZGU+MDwvY29kZT4gbWVhbnMgdG8gbWFrZSBubyBjbG9uZSBhbmQgcmV0dXJuIHRoZSB2YWx1ZVxuICAgIGRpcmVjdGx5LlxuICAgIEBwYXJhbSB7TWFwfSBtZW1vIGFuIG9wdGlvbmFsIG1lbW8gb2YgYWxyZWFkeSB2aXNpdGVkIG9iamVjdHMgdG8gcHJlc2VydmVcbiAgICByZWZlcmVuY2UgY3ljbGVzLiAgVGhlIGNsb25lZCBvYmplY3Qgd2lsbCBoYXZlIHRoZSBleGFjdCBzYW1lIHNoYXBlIGFzIHRoZVxuICAgIG9yaWdpbmFsLCBidXQgbm8gaWRlbnRpY2FsIG9iamVjdHMuICBUZSBtYXAgbWF5IGJlIGxhdGVyIHVzZWQgdG8gYXNzb2NpYXRlXG4gICAgYWxsIG9iamVjdHMgaW4gdGhlIG9yaWdpbmFsIG9iamVjdCBncmFwaCB3aXRoIHRoZWlyIGNvcnJlc3BvbmRpbmcgbWVtYmVyIG9mXG4gICAgdGhlIGNsb25lZCBncmFwaC5cbiAgICBAcmV0dXJucyBhIGNvcHkgb2YgdGhlIHZhbHVlXG4qL1xuT2JqZWN0LmNsb25lID0gZnVuY3Rpb24gKHZhbHVlLCBkZXB0aCwgbWVtbykge1xuICAgIHZhbHVlID0gT2JqZWN0LmdldFZhbHVlT2YodmFsdWUpO1xuICAgIG1lbW8gPSBtZW1vIHx8IG5ldyBXZWFrTWFwKCk7XG4gICAgaWYgKGRlcHRoID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgZGVwdGggPSBJbmZpbml0eTtcbiAgICB9IGVsc2UgaWYgKGRlcHRoID09PSAwKSB7XG4gICAgICAgIHJldHVybiB2YWx1ZTtcbiAgICB9XG4gICAgaWYgKE9iamVjdC5pc09iamVjdCh2YWx1ZSkpIHtcbiAgICAgICAgaWYgKCFtZW1vLmhhcyh2YWx1ZSkpIHtcbiAgICAgICAgICAgIGlmICh2YWx1ZSAmJiB0eXBlb2YgdmFsdWUuY2xvbmUgPT09IFwiZnVuY3Rpb25cIikge1xuICAgICAgICAgICAgICAgIG1lbW8uc2V0KHZhbHVlLCB2YWx1ZS5jbG9uZShkZXB0aCwgbWVtbykpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB2YXIgcHJvdG90eXBlID0gT2JqZWN0LmdldFByb3RvdHlwZU9mKHZhbHVlKTtcbiAgICAgICAgICAgICAgICBpZiAocHJvdG90eXBlID09PSBudWxsIHx8IHByb3RvdHlwZSA9PT0gT2JqZWN0LnByb3RvdHlwZSkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgY2xvbmUgPSBPYmplY3QuY3JlYXRlKHByb3RvdHlwZSk7XG4gICAgICAgICAgICAgICAgICAgIG1lbW8uc2V0KHZhbHVlLCBjbG9uZSk7XG4gICAgICAgICAgICAgICAgICAgIGZvciAodmFyIGtleSBpbiB2YWx1ZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgY2xvbmVba2V5XSA9IE9iamVjdC5jbG9uZSh2YWx1ZVtrZXldLCBkZXB0aCAtIDEsIG1lbW8pO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiQ2FuJ3QgY2xvbmUgXCIgKyB2YWx1ZSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBtZW1vLmdldCh2YWx1ZSk7XG4gICAgfVxuICAgIHJldHVybiB2YWx1ZTtcbn07XG5cbi8qKlxuICAgIFJlbW92ZXMgYWxsIHByb3BlcnRpZXMgb3duZWQgYnkgdGhpcyBvYmplY3QgbWFraW5nIHRoZSBvYmplY3Qgc3VpdGFibGUgZm9yXG4gICAgcmV1c2UuXG5cbiAgICBAZnVuY3Rpb24gZXh0ZXJuYWw6T2JqZWN0LmNsZWFyXG4gICAgQHJldHVybnMgdGhpc1xuKi9cbk9iamVjdC5jbGVhciA9IGZ1bmN0aW9uIChvYmplY3QpIHtcbiAgICBpZiAob2JqZWN0ICYmIHR5cGVvZiBvYmplY3QuY2xlYXIgPT09IFwiZnVuY3Rpb25cIikge1xuICAgICAgICBvYmplY3QuY2xlYXIoKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICB2YXIga2V5cyA9IE9iamVjdC5rZXlzKG9iamVjdCksXG4gICAgICAgICAgICBpID0ga2V5cy5sZW5ndGg7XG4gICAgICAgIHdoaWxlIChpKSB7XG4gICAgICAgICAgICBpLS07XG4gICAgICAgICAgICBkZWxldGUgb2JqZWN0W2tleXNbaV1dO1xuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiBvYmplY3Q7XG59O1xuIiwiXG4vKipcbiAgICBhY2NlcHRzIGEgc3RyaW5nOyByZXR1cm5zIHRoZSBzdHJpbmcgd2l0aCByZWdleCBtZXRhY2hhcmFjdGVycyBlc2NhcGVkLlxuICAgIHRoZSByZXR1cm5lZCBzdHJpbmcgY2FuIHNhZmVseSBiZSB1c2VkIHdpdGhpbiBhIHJlZ2V4IHRvIG1hdGNoIGEgbGl0ZXJhbFxuICAgIHN0cmluZy4gZXNjYXBlZCBjaGFyYWN0ZXJzIGFyZSBbLCBdLCB7LCB9LCAoLCApLCAtLCAqLCArLCA/LCAuLCBcXCwgXiwgJCxcbiAgICB8LCAjLCBbY29tbWFdLCBhbmQgd2hpdGVzcGFjZS5cbiovXG5pZiAoIVJlZ0V4cC5lc2NhcGUpIHtcbiAgICB2YXIgc3BlY2lhbCA9IC9bLVtcXF17fSgpKis/LlxcXFxeJHwsI1xcc10vZztcbiAgICBSZWdFeHAuZXNjYXBlID0gZnVuY3Rpb24gKHN0cmluZykge1xuICAgICAgICByZXR1cm4gc3RyaW5nLnJlcGxhY2Uoc3BlY2lhbCwgXCJcXFxcJCZcIik7XG4gICAgfTtcbn1cblxuIiwiXG52YXIgQXJyYXkgPSByZXF1aXJlKFwiLi9zaGltLWFycmF5XCIpO1xudmFyIE9iamVjdCA9IHJlcXVpcmUoXCIuL3NoaW0tb2JqZWN0XCIpO1xudmFyIEZ1bmN0aW9uID0gcmVxdWlyZShcIi4vc2hpbS1mdW5jdGlvblwiKTtcbnZhciBSZWdFeHAgPSByZXF1aXJlKFwiLi9zaGltLXJlZ2V4cFwiKTtcblxuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbm1vZHVsZS5leHBvcnRzID0gU29ydGVkQXJyYXk7XG5cbnZhciBTaGltID0gcmVxdWlyZShcIi4vc2hpbVwiKTtcbnZhciBHZW5lcmljQ29sbGVjdGlvbiA9IHJlcXVpcmUoXCIuL2dlbmVyaWMtY29sbGVjdGlvblwiKTtcbnZhciBQcm9wZXJ0eUNoYW5nZXMgPSByZXF1aXJlKFwiLi9saXN0ZW4vcHJvcGVydHktY2hhbmdlc1wiKTtcbnZhciBSYW5nZUNoYW5nZXMgPSByZXF1aXJlKFwiLi9saXN0ZW4vcmFuZ2UtY2hhbmdlc1wiKTtcblxuZnVuY3Rpb24gU29ydGVkQXJyYXkodmFsdWVzLCBlcXVhbHMsIGNvbXBhcmUsIGdldERlZmF1bHQpIHtcbiAgICBpZiAoISh0aGlzIGluc3RhbmNlb2YgU29ydGVkQXJyYXkpKSB7XG4gICAgICAgIHJldHVybiBuZXcgU29ydGVkQXJyYXkodmFsdWVzLCBlcXVhbHMsIGNvbXBhcmUsIGdldERlZmF1bHQpO1xuICAgIH1cbiAgICBpZiAoQXJyYXkuaXNBcnJheSh2YWx1ZXMpKSB7XG4gICAgICAgIHRoaXMuYXJyYXkgPSB2YWx1ZXM7XG4gICAgICAgIHZhbHVlcyA9IHZhbHVlcy5zcGxpY2UoMCwgdmFsdWVzLmxlbmd0aCk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5hcnJheSA9IFtdO1xuICAgIH1cbiAgICB0aGlzLmNvbnRlbnRFcXVhbHMgPSBlcXVhbHMgfHwgT2JqZWN0LmVxdWFscztcbiAgICB0aGlzLmNvbnRlbnRDb21wYXJlID0gY29tcGFyZSB8fCBPYmplY3QuY29tcGFyZTtcbiAgICB0aGlzLmdldERlZmF1bHQgPSBnZXREZWZhdWx0IHx8IEZ1bmN0aW9uLm5vb3A7XG5cbiAgICB0aGlzLmxlbmd0aCA9IDA7XG4gICAgdGhpcy5hZGRFYWNoKHZhbHVlcyk7XG59XG5cbi8vIGhhY2sgc28gcmVxdWlyZShcInNvcnRlZC1hcnJheVwiKS5Tb3J0ZWRBcnJheSB3aWxsIHdvcmsgaW4gTW9udGFnZUpTXG5Tb3J0ZWRBcnJheS5Tb3J0ZWRBcnJheSA9IFNvcnRlZEFycmF5O1xuXG5Tb3J0ZWRBcnJheS5mcm9tID0gR2VuZXJpY0NvbGxlY3Rpb24uZnJvbTtcblxuT2JqZWN0LmFkZEVhY2goU29ydGVkQXJyYXkucHJvdG90eXBlLCBHZW5lcmljQ29sbGVjdGlvbi5wcm90b3R5cGUpO1xuT2JqZWN0LmFkZEVhY2goU29ydGVkQXJyYXkucHJvdG90eXBlLCBQcm9wZXJ0eUNoYW5nZXMucHJvdG90eXBlKTtcbk9iamVjdC5hZGRFYWNoKFNvcnRlZEFycmF5LnByb3RvdHlwZSwgUmFuZ2VDaGFuZ2VzLnByb3RvdHlwZSk7XG5cblNvcnRlZEFycmF5LnByb3RvdHlwZS5pc1NvcnRlZCA9IHRydWU7XG5cbmZ1bmN0aW9uIHNlYXJjaChhcnJheSwgdmFsdWUsIGNvbXBhcmUpIHtcbiAgICB2YXIgZmlyc3QgPSAwO1xuICAgIHZhciBsYXN0ID0gYXJyYXkubGVuZ3RoIC0gMTtcbiAgICB3aGlsZSAoZmlyc3QgPD0gbGFzdCkge1xuICAgICAgICB2YXIgbWlkZGxlID0gKGZpcnN0ICsgbGFzdCkgPj4gMTsgLy8gTWF0aC5mbG9vciggLyAyKVxuICAgICAgICB2YXIgY29tcGFyaXNvbiA9IGNvbXBhcmUodmFsdWUsIGFycmF5W21pZGRsZV0pO1xuICAgICAgICBpZiAoY29tcGFyaXNvbiA+IDApIHtcbiAgICAgICAgICAgIGZpcnN0ID0gbWlkZGxlICsgMTtcbiAgICAgICAgfSBlbHNlIGlmIChjb21wYXJpc29uIDwgMCkge1xuICAgICAgICAgICAgbGFzdCA9IG1pZGRsZSAtIDE7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gbWlkZGxlO1xuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiAtKGZpcnN0ICsgMSk7XG59XG5cbmZ1bmN0aW9uIHNlYXJjaEZpcnN0KGFycmF5LCB2YWx1ZSwgY29tcGFyZSwgZXF1YWxzKSB7XG4gICAgdmFyIGluZGV4ID0gc2VhcmNoKGFycmF5LCB2YWx1ZSwgY29tcGFyZSk7XG4gICAgaWYgKGluZGV4IDwgMCkge1xuICAgICAgICByZXR1cm4gLTE7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgd2hpbGUgKGluZGV4ID4gMCAmJiBlcXVhbHModmFsdWUsIGFycmF5W2luZGV4IC0gMV0pKSB7XG4gICAgICAgICAgICBpbmRleC0tO1xuICAgICAgICB9XG4gICAgICAgIGlmICghZXF1YWxzKHZhbHVlLCBhcnJheVtpbmRleF0pKSB7XG4gICAgICAgICAgICByZXR1cm4gLTE7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gaW5kZXg7XG4gICAgICAgIH1cbiAgICB9XG59XG5cbmZ1bmN0aW9uIHNlYXJjaExhc3QoYXJyYXksIHZhbHVlLCBjb21wYXJlLCBlcXVhbHMpIHtcbiAgICB2YXIgaW5kZXggPSBzZWFyY2goYXJyYXksIHZhbHVlLCBjb21wYXJlKTtcbiAgICBpZiAoaW5kZXggPCAwKSB7XG4gICAgICAgIHJldHVybiAtMTtcbiAgICB9IGVsc2Uge1xuICAgICAgICB3aGlsZSAoaW5kZXggPCBhcnJheS5sZW5ndGggLSAxICYmIGVxdWFscyh2YWx1ZSwgYXJyYXlbaW5kZXggKyAxXSkpIHtcbiAgICAgICAgICAgIGluZGV4Kys7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCFlcXVhbHModmFsdWUsIGFycmF5W2luZGV4XSkpIHtcbiAgICAgICAgICAgIHJldHVybiAtMTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiBpbmRleDtcbiAgICAgICAgfVxuICAgIH1cbn1cblxuZnVuY3Rpb24gc2VhcmNoRm9ySW5zZXJ0aW9uSW5kZXgoYXJyYXksIHZhbHVlLCBjb21wYXJlKSB7XG4gICAgdmFyIGluZGV4ID0gc2VhcmNoKGFycmF5LCB2YWx1ZSwgY29tcGFyZSk7XG4gICAgaWYgKGluZGV4IDwgMCkge1xuICAgICAgICByZXR1cm4gLWluZGV4IC0gMTtcbiAgICB9IGVsc2Uge1xuICAgICAgICB2YXIgbGFzdCA9IGFycmF5Lmxlbmd0aCAtIDE7XG4gICAgICAgIHdoaWxlIChpbmRleCA8IGxhc3QgJiYgY29tcGFyZSh2YWx1ZSwgYXJyYXlbaW5kZXggKyAxXSkgPT09IDApIHtcbiAgICAgICAgICAgIGluZGV4Kys7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGluZGV4O1xuICAgIH1cbn1cblxuU29ydGVkQXJyYXkucHJvdG90eXBlLmNvbnN0cnVjdENsb25lID0gZnVuY3Rpb24gKHZhbHVlcykge1xuICAgIHJldHVybiBuZXcgdGhpcy5jb25zdHJ1Y3RvcihcbiAgICAgICAgdmFsdWVzLFxuICAgICAgICB0aGlzLmNvbnRlbnRFcXVhbHMsXG4gICAgICAgIHRoaXMuY29udGVudENvbXBhcmUsXG4gICAgICAgIHRoaXMuZ2V0RGVmYXVsdFxuICAgICk7XG59O1xuXG5Tb3J0ZWRBcnJheS5wcm90b3R5cGUuaGFzID0gZnVuY3Rpb24gKHZhbHVlLCBlcXVhbHMpIHtcbiAgICBpZiAoZXF1YWxzKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcIlNvcnRlZFNldCNoYXMgZG9lcyBub3Qgc3VwcG9ydCBzZWNvbmQgYXJndW1lbnQ6IGVxdWFsc1wiKTtcbiAgICB9XG4gICAgdmFyIGluZGV4ID0gc2VhcmNoKHRoaXMuYXJyYXksIHZhbHVlLCB0aGlzLmNvbnRlbnRDb21wYXJlKTtcbiAgICByZXR1cm4gaW5kZXggPj0gMCAmJiB0aGlzLmNvbnRlbnRFcXVhbHModGhpcy5hcnJheVtpbmRleF0sIHZhbHVlKTtcbn07XG5cblNvcnRlZEFycmF5LnByb3RvdHlwZS5nZXQgPSBmdW5jdGlvbiAodmFsdWUsIGVxdWFscykge1xuICAgIGlmIChlcXVhbHMpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiU29ydGVkQXJyYXkjZ2V0IGRvZXMgbm90IHN1cHBvcnQgc2Vjb25kIGFyZ3VtZW50OiBlcXVhbHNcIik7XG4gICAgfVxuICAgIHZhciBpbmRleCA9IHNlYXJjaEZpcnN0KHRoaXMuYXJyYXksIHZhbHVlLCB0aGlzLmNvbnRlbnRDb21wYXJlLCB0aGlzLmNvbnRlbnRFcXVhbHMpO1xuICAgIGlmIChpbmRleCAhPT0gLTEpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuYXJyYXlbaW5kZXhdO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiB0aGlzLmdldERlZmF1bHQodmFsdWUpO1xuICAgIH1cbn07XG5cblNvcnRlZEFycmF5LnByb3RvdHlwZS5hZGQgPSBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICB2YXIgaW5kZXggPSBzZWFyY2hGb3JJbnNlcnRpb25JbmRleCh0aGlzLmFycmF5LCB2YWx1ZSwgdGhpcy5jb250ZW50Q29tcGFyZSk7XG4gICAgaWYgKHRoaXMuZGlzcGF0Y2hlc1JhbmdlQ2hhbmdlcykge1xuICAgICAgICB0aGlzLmRpc3BhdGNoQmVmb3JlUmFuZ2VDaGFuZ2UoW3ZhbHVlXSwgQXJyYXkuZW1wdHksIGluZGV4KTtcbiAgICB9XG4gICAgdGhpcy5hcnJheS5zcGxpY2UoaW5kZXgsIDAsIHZhbHVlKTtcbiAgICB0aGlzLmxlbmd0aCsrO1xuICAgIGlmICh0aGlzLmRpc3BhdGNoZXNSYW5nZUNoYW5nZXMpIHtcbiAgICAgICAgdGhpcy5kaXNwYXRjaFJhbmdlQ2hhbmdlKFt2YWx1ZV0sIEFycmF5LmVtcHR5LCBpbmRleCk7XG4gICAgfVxuICAgIHJldHVybiB0cnVlO1xufTtcblxuU29ydGVkQXJyYXkucHJvdG90eXBlW1wiZGVsZXRlXCJdID0gZnVuY3Rpb24gKHZhbHVlLCBlcXVhbHMpIHtcbiAgICBpZiAoZXF1YWxzKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcIlNvcnRlZEFycmF5I2RlbGV0ZSBkb2VzIG5vdCBzdXBwb3J0IHNlY29uZCBhcmd1bWVudDogZXF1YWxzXCIpO1xuICAgIH1cbiAgICB2YXIgaW5kZXggPSBzZWFyY2hGaXJzdCh0aGlzLmFycmF5LCB2YWx1ZSwgdGhpcy5jb250ZW50Q29tcGFyZSwgdGhpcy5jb250ZW50RXF1YWxzKTtcbiAgICBpZiAoaW5kZXggIT09IC0xKSB7XG4gICAgICAgIGlmICh0aGlzLmRpc3BhdGNoZXNSYW5nZUNoYW5nZXMpIHtcbiAgICAgICAgICAgIHRoaXMuZGlzcGF0Y2hCZWZvcmVSYW5nZUNoYW5nZShBcnJheS5lbXB0eSwgW3ZhbHVlXSwgaW5kZXgpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuYXJyYXkuc3BsaWNlT25lKGluZGV4KTtcbiAgICAgICAgdGhpcy5sZW5ndGgtLTtcbiAgICAgICAgaWYgKHRoaXMuZGlzcGF0Y2hlc1JhbmdlQ2hhbmdlcykge1xuICAgICAgICAgICAgdGhpcy5kaXNwYXRjaFJhbmdlQ2hhbmdlKEFycmF5LmVtcHR5LCBbdmFsdWVdLCBpbmRleCk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbn07XG5cblNvcnRlZEFycmF5LnByb3RvdHlwZS5kZWxldGVBbGwgPSBmdW5jdGlvbiAodmFsdWUsIGVxdWFscykge1xuICAgIGlmIChlcXVhbHMpIHtcbiAgICAgICAgdmFyIGNvdW50ID0gdGhpcy5hcnJheS5kZWxldGVBbGwodmFsdWUsIGVxdWFscyk7XG4gICAgICAgIHRoaXMubGVuZ3RoIC09IGNvdW50O1xuICAgICAgICByZXR1cm4gY291bnQ7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgdmFyIHN0YXJ0ID0gc2VhcmNoRmlyc3QodGhpcy5hcnJheSwgdmFsdWUsIHRoaXMuY29udGVudENvbXBhcmUsIHRoaXMuY29udGVudEVxdWFscyk7XG4gICAgICAgIGlmIChzdGFydCAhPT0gLTEpIHtcbiAgICAgICAgICAgIHZhciBlbmQgPSBzdGFydDtcbiAgICAgICAgICAgIHdoaWxlICh0aGlzLmNvbnRlbnRFcXVhbHModmFsdWUsIHRoaXMuYXJyYXlbZW5kXSkpIHtcbiAgICAgICAgICAgICAgICBlbmQrKztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHZhciBtaW51cyA9IHRoaXMuc2xpY2Uoc3RhcnQsIGVuZCk7XG4gICAgICAgICAgICBpZiAodGhpcy5kaXNwYXRjaGVzUmFuZ2VDaGFuZ2VzKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5kaXNwYXRjaEJlZm9yZVJhbmdlQ2hhbmdlKEFycmF5LmVtcHR5LCBtaW51cywgc3RhcnQpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy5hcnJheS5zcGxpY2Uoc3RhcnQsIG1pbnVzLmxlbmd0aCk7XG4gICAgICAgICAgICB0aGlzLmxlbmd0aCAtPSBtaW51cy5sZW5ndGg7XG4gICAgICAgICAgICBpZiAodGhpcy5kaXNwYXRjaGVzUmFuZ2VDaGFuZ2VzKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5kaXNwYXRjaFJhbmdlQ2hhbmdlKEFycmF5LmVtcHR5LCBtaW51cywgc3RhcnQpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIG1pbnVzLmxlbmd0aDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiAwO1xuICAgICAgICB9XG4gICAgfVxufTtcblxuU29ydGVkQXJyYXkucHJvdG90eXBlLmluZGV4T2YgPSBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAvLyBUT0RPIHRocm93IGVycm9yIGlmIHByb3ZpZGVkIGEgc3RhcnQgaW5kZXhcbiAgICByZXR1cm4gc2VhcmNoRmlyc3QodGhpcy5hcnJheSwgdmFsdWUsIHRoaXMuY29udGVudENvbXBhcmUsIHRoaXMuY29udGVudEVxdWFscyk7XG59O1xuXG5Tb3J0ZWRBcnJheS5wcm90b3R5cGUubGFzdEluZGV4T2YgPSBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAvLyBUT0RPIHRocm93IGVycm9yIGlmIHByb3ZpZGVkIGEgc3RhcnQgaW5kZXhcbiAgICByZXR1cm4gc2VhcmNoTGFzdCh0aGlzLmFycmF5LCB2YWx1ZSwgdGhpcy5jb250ZW50Q29tcGFyZSwgdGhpcy5jb250ZW50RXF1YWxzKTtcbn07XG5cblNvcnRlZEFycmF5LnByb3RvdHlwZS5maW5kID0gZnVuY3Rpb24gKHZhbHVlLCBlcXVhbHMsIGluZGV4KSB7XG4gICAgLy8gVE9ETyB0aHJvdyBlcnJvciBpZiBwcm92aWRlZCBhIHN0YXJ0IGluZGV4XG4gICAgaWYgKGVxdWFscykge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJTb3J0ZWRBcnJheSNmaW5kIGRvZXMgbm90IHN1cHBvcnQgc2Vjb25kIGFyZ3VtZW50OiBlcXVhbHNcIik7XG4gICAgfVxuICAgIGlmIChpbmRleCkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJTb3J0ZWRBcnJheSNmaW5kIGRvZXMgbm90IHN1cHBvcnQgdGhpcmQgYXJndW1lbnQ6IGluZGV4XCIpO1xuICAgIH1cbiAgICAvLyBUT0RPIHN1cHBvcnQgaW5pdGlhbCBwYXJ0aXRpb24gaW5kZXhcbiAgICByZXR1cm4gc2VhcmNoRmlyc3QodGhpcy5hcnJheSwgdmFsdWUsIHRoaXMuY29udGVudENvbXBhcmUsIHRoaXMuY29udGVudEVxdWFscyk7XG59O1xuXG5Tb3J0ZWRBcnJheS5wcm90b3R5cGUuZmluZExhc3QgPSBmdW5jdGlvbiAodmFsdWUsIGVxdWFscywgaW5kZXgpIHtcbiAgICBpZiAoZXF1YWxzKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcIlNvcnRlZEFycmF5I2ZpbmRMYXN0IGRvZXMgbm90IHN1cHBvcnQgc2Vjb25kIGFyZ3VtZW50OiBlcXVhbHNcIik7XG4gICAgfVxuICAgIGlmIChpbmRleCkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJTb3J0ZWRBcnJheSNmaW5kTGFzdCBkb2VzIG5vdCBzdXBwb3J0IHRoaXJkIGFyZ3VtZW50OiBpbmRleFwiKTtcbiAgICB9XG4gICAgLy8gVE9ETyBzdXBwb3J0IGluaXRpYWwgcGFydGl0aW9uIGluZGV4XG4gICAgcmV0dXJuIHNlYXJjaExhc3QodGhpcy5hcnJheSwgdmFsdWUsIHRoaXMuY29udGVudENvbXBhcmUsIHRoaXMuY29udGVudEVxdWFscyk7XG59O1xuXG5Tb3J0ZWRBcnJheS5wcm90b3R5cGUucHVzaCA9IGZ1bmN0aW9uICgpIHtcbiAgICB0aGlzLmFkZEVhY2goYXJndW1lbnRzKTtcbn07XG5cblNvcnRlZEFycmF5LnByb3RvdHlwZS51bnNoaWZ0ID0gZnVuY3Rpb24gKCkge1xuICAgIHRoaXMuYWRkRWFjaChhcmd1bWVudHMpO1xufTtcblxuU29ydGVkQXJyYXkucHJvdG90eXBlLnBvcCA9IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgdmFsID0gdGhpcy5hcnJheS5wb3AoKTtcbiAgICB0aGlzLmxlbmd0aCA9IHRoaXMuYXJyYXkubGVuZ3RoO1xuICAgIHJldHVybiB2YWw7XG59O1xuXG5Tb3J0ZWRBcnJheS5wcm90b3R5cGUuc2hpZnQgPSBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIHZhbCA9IHRoaXMuYXJyYXkuc2hpZnQoKTtcbiAgICB0aGlzLmxlbmd0aCA9IHRoaXMuYXJyYXkubGVuZ3RoO1xuICAgIHJldHVybiB2YWw7XG59O1xuXG5Tb3J0ZWRBcnJheS5wcm90b3R5cGUuc2xpY2UgPSBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIHRoaXMuYXJyYXkuc2xpY2UuYXBwbHkodGhpcy5hcnJheSwgYXJndW1lbnRzKTtcbn07XG5cblNvcnRlZEFycmF5LnByb3RvdHlwZS5zcGxpY2UgPSBmdW5jdGlvbiAoaW5kZXgsIGxlbmd0aCAvKi4uLnBsdXMqLykge1xuICAgIHJldHVybiB0aGlzLnN3YXAoaW5kZXgsIGxlbmd0aCwgQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzLCAyKSk7XG59O1xuXG5Tb3J0ZWRBcnJheS5wcm90b3R5cGUuc3dhcCA9IGZ1bmN0aW9uIChpbmRleCwgbGVuZ3RoLCBwbHVzKSB7XG4gICAgaWYgKGluZGV4ID09PSB1bmRlZmluZWQgJiYgbGVuZ3RoID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgcmV0dXJuIEFycmF5LmVtcHR5O1xuICAgIH1cbiAgICBpbmRleCA9IGluZGV4IHx8IDA7XG4gICAgaWYgKGluZGV4IDwgMCkge1xuICAgICAgICBpbmRleCArPSB0aGlzLmxlbmd0aDtcbiAgICB9XG4gICAgaWYgKGxlbmd0aCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIGxlbmd0aCA9IEluZmluaXR5O1xuICAgIH1cbiAgICB2YXIgbWludXMgPSB0aGlzLnNsaWNlKGluZGV4LCBpbmRleCArIGxlbmd0aCk7XG4gICAgaWYgKHRoaXMuZGlzcGF0Y2hlc1JhbmdlQ2hhbmdlcykge1xuICAgICAgICB0aGlzLmRpc3BhdGNoQmVmb3JlUmFuZ2VDaGFuZ2UocGx1cywgbWludXMsIGluZGV4KTtcbiAgICB9XG4gICAgdGhpcy5hcnJheS5zcGxpY2UoaW5kZXgsIGxlbmd0aCk7XG4gICAgdGhpcy5sZW5ndGggLT0gbWludXMubGVuZ3RoO1xuICAgIGlmICh0aGlzLmRpc3BhdGNoZXNSYW5nZUNoYW5nZXMpIHtcbiAgICAgICAgdGhpcy5kaXNwYXRjaFJhbmdlQ2hhbmdlKEFycmF5LmVtcHR5LCBtaW51cywgaW5kZXgpO1xuICAgIH1cbiAgICB0aGlzLmFkZEVhY2gocGx1cyk7XG4gICAgcmV0dXJuIG1pbnVzO1xufTtcblxuU29ydGVkQXJyYXkucHJvdG90eXBlLnJlZHVjZSA9IGZ1bmN0aW9uIChjYWxsYmFjaywgYmFzaXMgLyosIHRoaXNwKi8pIHtcbiAgICB2YXIgdGhpc3AgPSBhcmd1bWVudHNbMl07XG4gICAgcmV0dXJuIHRoaXMuYXJyYXkucmVkdWNlKGZ1bmN0aW9uIChiYXNpcywgdmFsdWUsIGtleSkge1xuICAgICAgICByZXR1cm4gY2FsbGJhY2suY2FsbCh0aGlzcCwgYmFzaXMsIHZhbHVlLCBrZXksIHRoaXMpO1xuICAgIH0sIGJhc2lzLCB0aGlzKTtcbn07XG5cblNvcnRlZEFycmF5LnByb3RvdHlwZS5yZWR1Y2VSaWdodCA9IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgdGhpc3AgPSBhcmd1bWVudHNbMl07XG4gICAgcmV0dXJuIHRoaXMuYXJyYXkucmVkdWNlUmlnaHQoZnVuY3Rpb24gKGJhc2lzLCB2YWx1ZSwga2V5KSB7XG4gICAgICAgIHJldHVybiBjYWxsYmFjay5jYWxsKHRoaXNwLCBiYXNpcywgdmFsdWUsIGtleSwgdGhpcyk7XG4gICAgfSwgYmFzaXMsIHRoaXMpO1xufTtcblxuU29ydGVkQXJyYXkucHJvdG90eXBlLm1pbiA9IGZ1bmN0aW9uICgpIHtcbiAgICBpZiAodGhpcy5sZW5ndGgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuYXJyYXlbMF07XG4gICAgfVxufTtcblxuU29ydGVkQXJyYXkucHJvdG90eXBlLm1heCA9IGZ1bmN0aW9uICgpIHtcbiAgICBpZiAodGhpcy5sZW5ndGgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuYXJyYXlbdGhpcy5sZW5ndGggLSAxXTtcbiAgICB9XG59O1xuXG5Tb3J0ZWRBcnJheS5wcm90b3R5cGUub25lID0gZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiB0aGlzLmFycmF5Lm9uZSgpO1xufTtcblxuU29ydGVkQXJyYXkucHJvdG90eXBlLmNsZWFyID0gZnVuY3Rpb24gKCkge1xuICAgIHZhciBtaW51cztcbiAgICBpZiAodGhpcy5kaXNwYXRjaGVzUmFuZ2VDaGFuZ2VzKSB7XG4gICAgICAgIG1pbnVzID0gdGhpcy5hcnJheS5zbGljZSgpO1xuICAgICAgICB0aGlzLmRpc3BhdGNoQmVmb3JlUmFuZ2VDaGFuZ2UoQXJyYXkuZW1wdHksIG1pbnVzLCAwKTtcbiAgICB9XG4gICAgdGhpcy5sZW5ndGggPSAwO1xuICAgIHRoaXMuYXJyYXkuY2xlYXIoKTtcbiAgICBpZiAodGhpcy5kaXNwYXRjaGVzUmFuZ2VDaGFuZ2VzKSB7XG4gICAgICAgIHRoaXMuZGlzcGF0Y2hSYW5nZUNoYW5nZShBcnJheS5lbXB0eSwgbWludXMsIDApO1xuICAgIH1cbn07XG5cblNvcnRlZEFycmF5LnByb3RvdHlwZS5lcXVhbHMgPSBmdW5jdGlvbiAodGhhdCwgZXF1YWxzKSB7XG4gICAgcmV0dXJuIHRoaXMuYXJyYXkuZXF1YWxzKHRoYXQsIGVxdWFscyk7XG59O1xuXG5Tb3J0ZWRBcnJheS5wcm90b3R5cGUuY29tcGFyZSA9IGZ1bmN0aW9uICh0aGF0LCBjb21wYXJlKSB7XG4gICAgcmV0dXJuIHRoaXMuYXJyYXkuY29tcGFyZSh0aGF0LCBjb21wYXJlKTtcbn07XG5cblNvcnRlZEFycmF5LnByb3RvdHlwZS5pdGVyYXRlID0gZnVuY3Rpb24gKHN0YXJ0LCBlbmQpIHtcbiAgICByZXR1cm4gbmV3IHRoaXMuSXRlcmF0b3IodGhpcy5hcnJheSwgc3RhcnQsIGVuZCk7XG59O1xuXG5Tb3J0ZWRBcnJheS5wcm90b3R5cGUudG9KU09OID0gZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiB0aGlzLnRvQXJyYXkoKTtcbn07XG5cblNvcnRlZEFycmF5LnByb3RvdHlwZS5JdGVyYXRvciA9IEFycmF5LnByb3RvdHlwZS5JdGVyYXRvcjtcbiIsIlwidXNlIHN0cmljdFwiO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFRyZWVMb2c7XG5cbmZ1bmN0aW9uIFRyZWVMb2coKSB7XG59XG5cblRyZWVMb2cuYXNjaWkgPSB7XG4gICAgaW50ZXJzZWN0aW9uOiBcIitcIixcbiAgICB0aHJvdWdoOiBcIi1cIixcbiAgICBicmFuY2hVcDogXCIrXCIsXG4gICAgYnJhbmNoRG93bjogXCIrXCIsXG4gICAgZnJvbUJlbG93OiBcIi5cIixcbiAgICBmcm9tQWJvdmU6IFwiJ1wiLFxuICAgIGZyb21Cb3RoOiBcIitcIixcbiAgICBzdHJhZmU6IFwifFwiXG59O1xuXG5UcmVlTG9nLnVuaWNvZGVSb3VuZCA9IHtcbiAgICBpbnRlcnNlY3Rpb246IFwiXFx1MjU0YlwiLFxuICAgIHRocm91Z2g6IFwiXFx1MjUwMVwiLFxuICAgIGJyYW5jaFVwOiBcIlxcdTI1M2JcIixcbiAgICBicmFuY2hEb3duOiBcIlxcdTI1MzNcIixcbiAgICBmcm9tQmVsb3c6IFwiXFx1MjU2ZFwiLCAvLyByb3VuZCBjb3JuZXJcbiAgICBmcm9tQWJvdmU6IFwiXFx1MjU3MFwiLCAvLyByb3VuZCBjb3JuZXJcbiAgICBmcm9tQm90aDogXCJcXHUyNTIzXCIsXG4gICAgc3RyYWZlOiBcIlxcdTI1MDNcIlxufTtcblxuVHJlZUxvZy51bmljb2RlU2hhcnAgPSB7XG4gICAgaW50ZXJzZWN0aW9uOiBcIlxcdTI1NGJcIixcbiAgICB0aHJvdWdoOiBcIlxcdTI1MDFcIixcbiAgICBicmFuY2hVcDogXCJcXHUyNTNiXCIsXG4gICAgYnJhbmNoRG93bjogXCJcXHUyNTMzXCIsXG4gICAgZnJvbUJlbG93OiBcIlxcdTI1MGZcIiwgLy8gc2hhcnAgY29ybmVyXG4gICAgZnJvbUFib3ZlOiBcIlxcdTI1MTdcIiwgLy8gc2hhcnAgY29ybmVyXG4gICAgZnJvbUJvdGg6IFwiXFx1MjUyM1wiLFxuICAgIHN0cmFmZTogXCJcXHUyNTAzXCJcbn07XG5cbiIsIm1vZHVsZS5leHBvcnRzID0gKGdsb2JhbC5XZWFrTWFwICE9PSB2b2lkIDApID8gZ2xvYmFsLldlYWtNYXAgOiByZXF1aXJlKFwid2Vhay1tYXBcIik7XG4iLCIvLyBDb3B5cmlnaHQgKEMpIDIwMTEgR29vZ2xlIEluYy5cbi8vXG4vLyBMaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xuLy8geW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuLy8gWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG4vL1xuLy8gaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG4vL1xuLy8gVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuLy8gZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxuLy8gV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG4vLyBTZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG4vLyBsaW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cblxuLyoqXG4gKiBAZmlsZW92ZXJ2aWV3IEluc3RhbGwgYSBsZWFreSBXZWFrTWFwIGVtdWxhdGlvbiBvbiBwbGF0Zm9ybXMgdGhhdFxuICogZG9uJ3QgcHJvdmlkZSBhIGJ1aWx0LWluIG9uZS5cbiAqXG4gKiA8cD5Bc3N1bWVzIHRoYXQgYW4gRVM1IHBsYXRmb3JtIHdoZXJlLCBpZiB7QGNvZGUgV2Vha01hcH0gaXNcbiAqIGFscmVhZHkgcHJlc2VudCwgdGhlbiBpdCBjb25mb3JtcyB0byB0aGUgYW50aWNpcGF0ZWQgRVM2XG4gKiBzcGVjaWZpY2F0aW9uLiBUbyBydW4gdGhpcyBmaWxlIG9uIGFuIEVTNSBvciBhbG1vc3QgRVM1XG4gKiBpbXBsZW1lbnRhdGlvbiB3aGVyZSB0aGUge0Bjb2RlIFdlYWtNYXB9IHNwZWNpZmljYXRpb24gZG9lcyBub3RcbiAqIHF1aXRlIGNvbmZvcm0sIHJ1biA8Y29kZT5yZXBhaXJFUzUuanM8L2NvZGU+IGZpcnN0LlxuICpcbiAqIDxwPkV2ZW4gdGhvdWdoIFdlYWtNYXBNb2R1bGUgaXMgbm90IGdsb2JhbCwgdGhlIGxpbnRlciB0aGlua3MgaXRcbiAqIGlzLCB3aGljaCBpcyB3aHkgaXQgaXMgaW4gdGhlIG92ZXJyaWRlcyBsaXN0IGJlbG93LlxuICpcbiAqIDxwPk5PVEU6IEJlZm9yZSB1c2luZyB0aGlzIFdlYWtNYXAgZW11bGF0aW9uIGluIGEgbm9uLVNFU1xuICogZW52aXJvbm1lbnQsIHNlZSB0aGUgbm90ZSBiZWxvdyBhYm91dCBoaWRkZW5SZWNvcmQuXG4gKlxuICogQGF1dGhvciBNYXJrIFMuIE1pbGxlclxuICogQHJlcXVpcmVzIGNyeXB0bywgQXJyYXlCdWZmZXIsIFVpbnQ4QXJyYXksIG5hdmlnYXRvciwgY29uc29sZVxuICogQG92ZXJyaWRlcyBXZWFrTWFwLCBzZXMsIFByb3h5XG4gKiBAb3ZlcnJpZGVzIFdlYWtNYXBNb2R1bGVcbiAqL1xuXG4vKipcbiAqIFRoaXMge0Bjb2RlIFdlYWtNYXB9IGVtdWxhdGlvbiBpcyBvYnNlcnZhYmx5IGVxdWl2YWxlbnQgdG8gdGhlXG4gKiBFUy1IYXJtb255IFdlYWtNYXAsIGJ1dCB3aXRoIGxlYWtpZXIgZ2FyYmFnZSBjb2xsZWN0aW9uIHByb3BlcnRpZXMuXG4gKlxuICogPHA+QXMgd2l0aCB0cnVlIFdlYWtNYXBzLCBpbiB0aGlzIGVtdWxhdGlvbiwgYSBrZXkgZG9lcyBub3RcbiAqIHJldGFpbiBtYXBzIGluZGV4ZWQgYnkgdGhhdCBrZXkgYW5kIChjcnVjaWFsbHkpIGEgbWFwIGRvZXMgbm90XG4gKiByZXRhaW4gdGhlIGtleXMgaXQgaW5kZXhlcy4gQSBtYXAgYnkgaXRzZWxmIGFsc28gZG9lcyBub3QgcmV0YWluXG4gKiB0aGUgdmFsdWVzIGFzc29jaWF0ZWQgd2l0aCB0aGF0IG1hcC5cbiAqXG4gKiA8cD5Ib3dldmVyLCB0aGUgdmFsdWVzIGFzc29jaWF0ZWQgd2l0aCBhIGtleSBpbiBzb21lIG1hcCBhcmVcbiAqIHJldGFpbmVkIHNvIGxvbmcgYXMgdGhhdCBrZXkgaXMgcmV0YWluZWQgYW5kIHRob3NlIGFzc29jaWF0aW9ucyBhcmVcbiAqIG5vdCBvdmVycmlkZGVuLiBGb3IgZXhhbXBsZSwgd2hlbiB1c2VkIHRvIHN1cHBvcnQgbWVtYnJhbmVzLCBhbGxcbiAqIHZhbHVlcyBleHBvcnRlZCBmcm9tIGEgZ2l2ZW4gbWVtYnJhbmUgd2lsbCBsaXZlIGZvciB0aGUgbGlmZXRpbWVcbiAqIHRoZXkgd291bGQgaGF2ZSBoYWQgaW4gdGhlIGFic2VuY2Ugb2YgYW4gaW50ZXJwb3NlZCBtZW1icmFuZS4gRXZlblxuICogd2hlbiB0aGUgbWVtYnJhbmUgaXMgcmV2b2tlZCwgYWxsIG9iamVjdHMgdGhhdCB3b3VsZCBoYXZlIGJlZW5cbiAqIHJlYWNoYWJsZSBpbiB0aGUgYWJzZW5jZSBvZiByZXZvY2F0aW9uIHdpbGwgc3RpbGwgYmUgcmVhY2hhYmxlLCBhc1xuICogZmFyIGFzIHRoZSBHQyBjYW4gdGVsbCwgZXZlbiB0aG91Z2ggdGhleSB3aWxsIG5vIGxvbmdlciBiZSByZWxldmFudFxuICogdG8gb25nb2luZyBjb21wdXRhdGlvbi5cbiAqXG4gKiA8cD5UaGUgQVBJIGltcGxlbWVudGVkIGhlcmUgaXMgYXBwcm94aW1hdGVseSB0aGUgQVBJIGFzIGltcGxlbWVudGVkXG4gKiBpbiBGRjYuMGExIGFuZCBhZ3JlZWQgdG8gYnkgTWFya00sIEFuZHJlYXMgR2FsLCBhbmQgRGF2ZSBIZXJtYW4sXG4gKiByYXRoZXIgdGhhbiB0aGUgb2ZmaWFsbHkgYXBwcm92ZWQgcHJvcG9zYWwgcGFnZS4gVE9ETyhlcmlnaHRzKTpcbiAqIHVwZ3JhZGUgdGhlIGVjbWFzY3JpcHQgV2Vha01hcCBwcm9wb3NhbCBwYWdlIHRvIGV4cGxhaW4gdGhpcyBBUElcbiAqIGNoYW5nZSBhbmQgcHJlc2VudCB0byBFY21hU2NyaXB0IGNvbW1pdHRlZSBmb3IgdGhlaXIgYXBwcm92YWwuXG4gKlxuICogPHA+VGhlIGZpcnN0IGRpZmZlcmVuY2UgYmV0d2VlbiB0aGUgZW11bGF0aW9uIGhlcmUgYW5kIHRoYXQgaW5cbiAqIEZGNi4wYTEgaXMgdGhlIHByZXNlbmNlIG9mIG5vbiBlbnVtZXJhYmxlIHtAY29kZSBnZXRfX18sIGhhc19fXyxcbiAqIHNldF9fXywgYW5kIGRlbGV0ZV9fX30gbWV0aG9kcyBvbiBXZWFrTWFwIGluc3RhbmNlcyB0byByZXByZXNlbnRcbiAqIHdoYXQgd291bGQgYmUgdGhlIGhpZGRlbiBpbnRlcm5hbCBwcm9wZXJ0aWVzIG9mIGEgcHJpbWl0aXZlXG4gKiBpbXBsZW1lbnRhdGlvbi4gV2hlcmVhcyB0aGUgRkY2LjBhMSBXZWFrTWFwLnByb3RvdHlwZSBtZXRob2RzXG4gKiByZXF1aXJlIHRoZWlyIHtAY29kZSB0aGlzfSB0byBiZSBhIGdlbnVpbmUgV2Vha01hcCBpbnN0YW5jZSAoaS5lLixcbiAqIGFuIG9iamVjdCBvZiB7QGNvZGUgW1tDbGFzc11dfSBcIldlYWtNYXB9KSwgc2luY2UgdGhlcmUgaXMgbm90aGluZ1xuICogdW5mb3JnZWFibGUgYWJvdXQgdGhlIHBzZXVkby1pbnRlcm5hbCBtZXRob2QgbmFtZXMgdXNlZCBoZXJlLFxuICogbm90aGluZyBwcmV2ZW50cyB0aGVzZSBlbXVsYXRlZCBwcm90b3R5cGUgbWV0aG9kcyBmcm9tIGJlaW5nXG4gKiBhcHBsaWVkIHRvIG5vbi1XZWFrTWFwcyB3aXRoIHBzZXVkby1pbnRlcm5hbCBtZXRob2RzIG9mIHRoZSBzYW1lXG4gKiBuYW1lcy5cbiAqXG4gKiA8cD5Bbm90aGVyIGRpZmZlcmVuY2UgaXMgdGhhdCBvdXIgZW11bGF0ZWQge0Bjb2RlXG4gKiBXZWFrTWFwLnByb3RvdHlwZX0gaXMgbm90IGl0c2VsZiBhIFdlYWtNYXAuIEEgcHJvYmxlbSB3aXRoIHRoZVxuICogY3VycmVudCBGRjYuMGExIEFQSSBpcyB0aGF0IFdlYWtNYXAucHJvdG90eXBlIGlzIGl0c2VsZiBhIFdlYWtNYXBcbiAqIHByb3ZpZGluZyBhbWJpZW50IG11dGFiaWxpdHkgYW5kIGFuIGFtYmllbnQgY29tbXVuaWNhdGlvbnNcbiAqIGNoYW5uZWwuIFRodXMsIGlmIGEgV2Vha01hcCBpcyBhbHJlYWR5IHByZXNlbnQgYW5kIGhhcyB0aGlzXG4gKiBwcm9ibGVtLCByZXBhaXJFUzUuanMgd3JhcHMgaXQgaW4gYSBzYWZlIHdyYXBwcGVyIGluIG9yZGVyIHRvXG4gKiBwcmV2ZW50IGFjY2VzcyB0byB0aGlzIGNoYW5uZWwuIChTZWVcbiAqIFBBVENIX01VVEFCTEVfRlJPWkVOX1dFQUtNQVBfUFJPVE8gaW4gcmVwYWlyRVM1LmpzKS5cbiAqL1xuXG4vKipcbiAqIElmIHRoaXMgaXMgYSBmdWxsIDxhIGhyZWY9XG4gKiBcImh0dHA6Ly9jb2RlLmdvb2dsZS5jb20vcC9lcy1sYWIvd2lraS9TZWN1cmVhYmxlRVM1XCJcbiAqID5zZWN1cmVhYmxlIEVTNTwvYT4gcGxhdGZvcm0gYW5kIHRoZSBFUy1IYXJtb255IHtAY29kZSBXZWFrTWFwfSBpc1xuICogYWJzZW50LCBpbnN0YWxsIGFuIGFwcHJveGltYXRlIGVtdWxhdGlvbi5cbiAqXG4gKiA8cD5JZiBXZWFrTWFwIGlzIHByZXNlbnQgYnV0IGNhbm5vdCBzdG9yZSBzb21lIG9iamVjdHMsIHVzZSBvdXIgYXBwcm94aW1hdGVcbiAqIGVtdWxhdGlvbiBhcyBhIHdyYXBwZXIuXG4gKlxuICogPHA+SWYgdGhpcyBpcyBhbG1vc3QgYSBzZWN1cmVhYmxlIEVTNSBwbGF0Zm9ybSwgdGhlbiBXZWFrTWFwLmpzXG4gKiBzaG91bGQgYmUgcnVuIGFmdGVyIHJlcGFpckVTNS5qcy5cbiAqXG4gKiA8cD5TZWUge0Bjb2RlIFdlYWtNYXB9IGZvciBkb2N1bWVudGF0aW9uIG9mIHRoZSBnYXJiYWdlIGNvbGxlY3Rpb25cbiAqIHByb3BlcnRpZXMgb2YgdGhpcyBXZWFrTWFwIGVtdWxhdGlvbi5cbiAqL1xuKGZ1bmN0aW9uIFdlYWtNYXBNb2R1bGUoKSB7XG4gIFwidXNlIHN0cmljdFwiO1xuXG4gIGlmICh0eXBlb2Ygc2VzICE9PSAndW5kZWZpbmVkJyAmJiBzZXMub2sgJiYgIXNlcy5vaygpKSB7XG4gICAgLy8gYWxyZWFkeSB0b28gYnJva2VuLCBzbyBnaXZlIHVwXG4gICAgcmV0dXJuO1xuICB9XG5cbiAgLyoqXG4gICAqIEluIHNvbWUgY2FzZXMgKGN1cnJlbnQgRmlyZWZveCksIHdlIG11c3QgbWFrZSBhIGNob2ljZSBiZXR3ZWVlbiBhXG4gICAqIFdlYWtNYXAgd2hpY2ggaXMgY2FwYWJsZSBvZiB1c2luZyBhbGwgdmFyaWV0aWVzIG9mIGhvc3Qgb2JqZWN0cyBhc1xuICAgKiBrZXlzIGFuZCBvbmUgd2hpY2ggaXMgY2FwYWJsZSBvZiBzYWZlbHkgdXNpbmcgcHJveGllcyBhcyBrZXlzLiBTZWVcbiAgICogY29tbWVudHMgYmVsb3cgYWJvdXQgSG9zdFdlYWtNYXAgYW5kIERvdWJsZVdlYWtNYXAgZm9yIGRldGFpbHMuXG4gICAqXG4gICAqIFRoaXMgZnVuY3Rpb24gKHdoaWNoIGlzIGEgZ2xvYmFsLCBub3QgZXhwb3NlZCB0byBndWVzdHMpIG1hcmtzIGFcbiAgICogV2Vha01hcCBhcyBwZXJtaXR0ZWQgdG8gZG8gd2hhdCBpcyBuZWNlc3NhcnkgdG8gaW5kZXggYWxsIGhvc3RcbiAgICogb2JqZWN0cywgYXQgdGhlIGNvc3Qgb2YgbWFraW5nIGl0IHVuc2FmZSBmb3IgcHJveGllcy5cbiAgICpcbiAgICogRG8gbm90IGFwcGx5IHRoaXMgZnVuY3Rpb24gdG8gYW55dGhpbmcgd2hpY2ggaXMgbm90IGEgZ2VudWluZVxuICAgKiBmcmVzaCBXZWFrTWFwLlxuICAgKi9cbiAgZnVuY3Rpb24gd2Vha01hcFBlcm1pdEhvc3RPYmplY3RzKG1hcCkge1xuICAgIC8vIGlkZW50aXR5IG9mIGZ1bmN0aW9uIHVzZWQgYXMgYSBzZWNyZXQgLS0gZ29vZCBlbm91Z2ggYW5kIGNoZWFwXG4gICAgaWYgKG1hcC5wZXJtaXRIb3N0T2JqZWN0c19fXykge1xuICAgICAgbWFwLnBlcm1pdEhvc3RPYmplY3RzX19fKHdlYWtNYXBQZXJtaXRIb3N0T2JqZWN0cyk7XG4gICAgfVxuICB9XG4gIGlmICh0eXBlb2Ygc2VzICE9PSAndW5kZWZpbmVkJykge1xuICAgIHNlcy53ZWFrTWFwUGVybWl0SG9zdE9iamVjdHMgPSB3ZWFrTWFwUGVybWl0SG9zdE9iamVjdHM7XG4gIH1cblxuICAvLyBJRSAxMSBoYXMgbm8gUHJveHkgYnV0IGhhcyBhIGJyb2tlbiBXZWFrTWFwIHN1Y2ggdGhhdCB3ZSBuZWVkIHRvIHBhdGNoXG4gIC8vIGl0IHVzaW5nIERvdWJsZVdlYWtNYXA7IHRoaXMgZmxhZyB0ZWxscyBEb3VibGVXZWFrTWFwIHNvLlxuICB2YXIgZG91YmxlV2Vha01hcENoZWNrU2lsZW50RmFpbHVyZSA9IGZhbHNlO1xuXG4gIC8vIENoZWNrIGlmIHRoZXJlIGlzIGFscmVhZHkgYSBnb29kLWVub3VnaCBXZWFrTWFwIGltcGxlbWVudGF0aW9uLCBhbmQgaWYgc29cbiAgLy8gZXhpdCB3aXRob3V0IHJlcGxhY2luZyBpdC5cbiAgaWYgKHR5cGVvZiBXZWFrTWFwID09PSAnZnVuY3Rpb24nKSB7XG4gICAgdmFyIEhvc3RXZWFrTWFwID0gV2Vha01hcDtcbiAgICAvLyBUaGVyZSBpcyBhIFdlYWtNYXAgLS0gaXMgaXQgZ29vZCBlbm91Z2g/XG4gICAgaWYgKHR5cGVvZiBuYXZpZ2F0b3IgIT09ICd1bmRlZmluZWQnICYmXG4gICAgICAgIC9GaXJlZm94Ly50ZXN0KG5hdmlnYXRvci51c2VyQWdlbnQpKSB7XG4gICAgICAvLyBXZSdyZSBub3cgKmFzc3VtaW5nIG5vdCosIGJlY2F1c2UgYXMgb2YgdGhpcyB3cml0aW5nICgyMDEzLTA1LTA2KVxuICAgICAgLy8gRmlyZWZveCdzIFdlYWtNYXBzIGhhdmUgYSBtaXNjZWxsYW55IG9mIG9iamVjdHMgdGhleSB3b24ndCBhY2NlcHQsIGFuZFxuICAgICAgLy8gd2UgZG9uJ3Qgd2FudCB0byBtYWtlIGFuIGV4aGF1c3RpdmUgbGlzdCwgYW5kIHRlc3RpbmcgZm9yIGp1c3Qgb25lXG4gICAgICAvLyB3aWxsIGJlIGEgcHJvYmxlbSBpZiB0aGF0IG9uZSBpcyBmaXhlZCBhbG9uZSAoYXMgdGhleSBkaWQgZm9yIEV2ZW50KS5cblxuICAgICAgLy8gSWYgdGhlcmUgaXMgYSBwbGF0Zm9ybSB0aGF0IHdlICpjYW4qIHJlbGlhYmx5IHRlc3Qgb24sIGhlcmUncyBob3cgdG9cbiAgICAgIC8vIGRvIGl0OlxuICAgICAgLy8gIHZhciBwcm9ibGVtYXRpYyA9IC4uLiA7XG4gICAgICAvLyAgdmFyIHRlc3RIb3N0TWFwID0gbmV3IEhvc3RXZWFrTWFwKCk7XG4gICAgICAvLyAgdHJ5IHtcbiAgICAgIC8vICAgIHRlc3RIb3N0TWFwLnNldChwcm9ibGVtYXRpYywgMSk7ICAvLyBGaXJlZm94IDIwIHdpbGwgdGhyb3cgaGVyZVxuICAgICAgLy8gICAgaWYgKHRlc3RIb3N0TWFwLmdldChwcm9ibGVtYXRpYykgPT09IDEpIHtcbiAgICAgIC8vICAgICAgcmV0dXJuO1xuICAgICAgLy8gICAgfVxuICAgICAgLy8gIH0gY2F0Y2ggKGUpIHt9XG5cbiAgICB9IGVsc2Uge1xuICAgICAgLy8gSUUgMTEgYnVnOiBXZWFrTWFwcyBzaWxlbnRseSBmYWlsIHRvIHN0b3JlIGZyb3plbiBvYmplY3RzLlxuICAgICAgdmFyIHRlc3RNYXAgPSBuZXcgSG9zdFdlYWtNYXAoKTtcbiAgICAgIHZhciB0ZXN0T2JqZWN0ID0gT2JqZWN0LmZyZWV6ZSh7fSk7XG4gICAgICB0ZXN0TWFwLnNldCh0ZXN0T2JqZWN0LCAxKTtcbiAgICAgIGlmICh0ZXN0TWFwLmdldCh0ZXN0T2JqZWN0KSAhPT0gMSkge1xuICAgICAgICBkb3VibGVXZWFrTWFwQ2hlY2tTaWxlbnRGYWlsdXJlID0gdHJ1ZTtcbiAgICAgICAgLy8gRmFsbCB0aHJvdWdoIHRvIGluc3RhbGxpbmcgb3VyIFdlYWtNYXAuXG4gICAgICB9IGVsc2Uge1xuICAgICAgICBtb2R1bGUuZXhwb3J0cyA9IFdlYWtNYXA7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICB2YXIgaG9wID0gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eTtcbiAgdmFyIGdvcG4gPSBPYmplY3QuZ2V0T3duUHJvcGVydHlOYW1lcztcbiAgdmFyIGRlZlByb3AgPSBPYmplY3QuZGVmaW5lUHJvcGVydHk7XG4gIHZhciBpc0V4dGVuc2libGUgPSBPYmplY3QuaXNFeHRlbnNpYmxlO1xuXG4gIC8qKlxuICAgKiBTZWN1cml0eSBkZXBlbmRzIG9uIEhJRERFTl9OQU1FIGJlaW5nIGJvdGggPGk+dW5ndWVzc2FibGU8L2k+IGFuZFxuICAgKiA8aT51bmRpc2NvdmVyYWJsZTwvaT4gYnkgdW50cnVzdGVkIGNvZGUuXG4gICAqXG4gICAqIDxwPkdpdmVuIHRoZSBrbm93biB3ZWFrbmVzc2VzIG9mIE1hdGgucmFuZG9tKCkgb24gZXhpc3RpbmdcbiAgICogYnJvd3NlcnMsIGl0IGRvZXMgbm90IGdlbmVyYXRlIHVuZ3Vlc3NhYmlsaXR5IHdlIGNhbiBiZSBjb25maWRlbnRcbiAgICogb2YuXG4gICAqXG4gICAqIDxwPkl0IGlzIHRoZSBtb25rZXkgcGF0Y2hpbmcgbG9naWMgaW4gdGhpcyBmaWxlIHRoYXQgaXMgaW50ZW5kZWRcbiAgICogdG8gZW5zdXJlIHVuZGlzY292ZXJhYmlsaXR5LiBUaGUgYmFzaWMgaWRlYSBpcyB0aGF0IHRoZXJlIGFyZVxuICAgKiB0aHJlZSBmdW5kYW1lbnRhbCBtZWFucyBvZiBkaXNjb3ZlcmluZyBwcm9wZXJ0aWVzIG9mIGFuIG9iamVjdDpcbiAgICogVGhlIGZvci9pbiBsb29wLCBPYmplY3Qua2V5cygpLCBhbmQgT2JqZWN0LmdldE93blByb3BlcnR5TmFtZXMoKSxcbiAgICogYXMgd2VsbCBhcyBzb21lIHByb3Bvc2VkIEVTNiBleHRlbnNpb25zIHRoYXQgYXBwZWFyIG9uIG91clxuICAgKiB3aGl0ZWxpc3QuIFRoZSBmaXJzdCB0d28gb25seSBkaXNjb3ZlciBlbnVtZXJhYmxlIHByb3BlcnRpZXMsIGFuZFxuICAgKiB3ZSBvbmx5IHVzZSBISURERU5fTkFNRSB0byBuYW1lIGEgbm9uLWVudW1lcmFibGUgcHJvcGVydHksIHNvIHRoZVxuICAgKiBvbmx5IHJlbWFpbmluZyB0aHJlYXQgc2hvdWxkIGJlIGdldE93blByb3BlcnR5TmFtZXMgYW5kIHNvbWVcbiAgICogcHJvcG9zZWQgRVM2IGV4dGVuc2lvbnMgdGhhdCBhcHBlYXIgb24gb3VyIHdoaXRlbGlzdC4gV2UgbW9ua2V5XG4gICAqIHBhdGNoIHRoZW0gdG8gcmVtb3ZlIEhJRERFTl9OQU1FIGZyb20gdGhlIGxpc3Qgb2YgcHJvcGVydGllcyB0aGV5XG4gICAqIHJldHVybnMuXG4gICAqXG4gICAqIDxwPlRPRE8oZXJpZ2h0cyk6IE9uIGEgcGxhdGZvcm0gd2l0aCBidWlsdC1pbiBQcm94aWVzLCBwcm94aWVzXG4gICAqIGNvdWxkIGJlIHVzZWQgdG8gdHJhcCBhbmQgdGhlcmVieSBkaXNjb3ZlciB0aGUgSElEREVOX05BTUUsIHNvIHdlXG4gICAqIG5lZWQgdG8gbW9ua2V5IHBhdGNoIFByb3h5LmNyZWF0ZSwgUHJveHkuY3JlYXRlRnVuY3Rpb24sIGV0YywgaW5cbiAgICogb3JkZXIgdG8gd3JhcCB0aGUgcHJvdmlkZWQgaGFuZGxlciB3aXRoIHRoZSByZWFsIGhhbmRsZXIgd2hpY2hcbiAgICogZmlsdGVycyBvdXQgYWxsIHRyYXBzIHVzaW5nIEhJRERFTl9OQU1FLlxuICAgKlxuICAgKiA8cD5UT0RPKGVyaWdodHMpOiBSZXZpc2l0IE1pa2UgU3RheSdzIHN1Z2dlc3Rpb24gdGhhdCB3ZSB1c2UgYW5cbiAgICogZW5jYXBzdWxhdGVkIGZ1bmN0aW9uIGF0IGEgbm90LW5lY2Vzc2FyaWx5LXNlY3JldCBuYW1lLCB3aGljaFxuICAgKiB1c2VzIHRoZSBTdGllZ2xlciBzaGFyZWQtc3RhdGUgcmlnaHRzIGFtcGxpZmljYXRpb24gcGF0dGVybiB0b1xuICAgKiByZXZlYWwgdGhlIGFzc29jaWF0ZWQgdmFsdWUgb25seSB0byB0aGUgV2Vha01hcCBpbiB3aGljaCB0aGlzIGtleVxuICAgKiBpcyBhc3NvY2lhdGVkIHdpdGggdGhhdCB2YWx1ZS4gU2luY2Ugb25seSB0aGUga2V5IHJldGFpbnMgdGhlXG4gICAqIGZ1bmN0aW9uLCB0aGUgZnVuY3Rpb24gY2FuIGFsc28gcmVtZW1iZXIgdGhlIGtleSB3aXRob3V0IGNhdXNpbmdcbiAgICogbGVha2FnZSBvZiB0aGUga2V5LCBzbyB0aGlzIGRvZXNuJ3QgdmlvbGF0ZSBvdXIgZ2VuZXJhbCBnY1xuICAgKiBnb2Fscy4gSW4gYWRkaXRpb24sIGJlY2F1c2UgdGhlIG5hbWUgbmVlZCBub3QgYmUgYSBndWFyZGVkXG4gICAqIHNlY3JldCwgd2UgY291bGQgZWZmaWNpZW50bHkgaGFuZGxlIGNyb3NzLWZyYW1lIGZyb3plbiBrZXlzLlxuICAgKi9cbiAgdmFyIEhJRERFTl9OQU1FX1BSRUZJWCA9ICd3ZWFrbWFwOic7XG4gIHZhciBISURERU5fTkFNRSA9IEhJRERFTl9OQU1FX1BSRUZJWCArICdpZGVudDonICsgTWF0aC5yYW5kb20oKSArICdfX18nO1xuXG4gIGlmICh0eXBlb2YgY3J5cHRvICE9PSAndW5kZWZpbmVkJyAmJlxuICAgICAgdHlwZW9mIGNyeXB0by5nZXRSYW5kb21WYWx1ZXMgPT09ICdmdW5jdGlvbicgJiZcbiAgICAgIHR5cGVvZiBBcnJheUJ1ZmZlciA9PT0gJ2Z1bmN0aW9uJyAmJlxuICAgICAgdHlwZW9mIFVpbnQ4QXJyYXkgPT09ICdmdW5jdGlvbicpIHtcbiAgICB2YXIgYWIgPSBuZXcgQXJyYXlCdWZmZXIoMjUpO1xuICAgIHZhciB1OHMgPSBuZXcgVWludDhBcnJheShhYik7XG4gICAgY3J5cHRvLmdldFJhbmRvbVZhbHVlcyh1OHMpO1xuICAgIEhJRERFTl9OQU1FID0gSElEREVOX05BTUVfUFJFRklYICsgJ3JhbmQ6JyArXG4gICAgICBBcnJheS5wcm90b3R5cGUubWFwLmNhbGwodThzLCBmdW5jdGlvbih1OCkge1xuICAgICAgICByZXR1cm4gKHU4ICUgMzYpLnRvU3RyaW5nKDM2KTtcbiAgICAgIH0pLmpvaW4oJycpICsgJ19fXyc7XG4gIH1cblxuICBmdW5jdGlvbiBpc05vdEhpZGRlbk5hbWUobmFtZSkge1xuICAgIHJldHVybiAhKFxuICAgICAgICBuYW1lLnN1YnN0cigwLCBISURERU5fTkFNRV9QUkVGSVgubGVuZ3RoKSA9PSBISURERU5fTkFNRV9QUkVGSVggJiZcbiAgICAgICAgbmFtZS5zdWJzdHIobmFtZS5sZW5ndGggLSAzKSA9PT0gJ19fXycpO1xuICB9XG5cbiAgLyoqXG4gICAqIE1vbmtleSBwYXRjaCBnZXRPd25Qcm9wZXJ0eU5hbWVzIHRvIGF2b2lkIHJldmVhbGluZyB0aGVcbiAgICogSElEREVOX05BTUUuXG4gICAqXG4gICAqIDxwPlRoZSBFUzUuMSBzcGVjIHJlcXVpcmVzIGVhY2ggbmFtZSB0byBhcHBlYXIgb25seSBvbmNlLCBidXQgYXNcbiAgICogb2YgdGhpcyB3cml0aW5nLCB0aGlzIHJlcXVpcmVtZW50IGlzIGNvbnRyb3ZlcnNpYWwgZm9yIEVTNiwgc28gd2VcbiAgICogbWFkZSB0aGlzIGNvZGUgcm9idXN0IGFnYWluc3QgdGhpcyBjYXNlLiBJZiB0aGUgcmVzdWx0aW5nIGV4dHJhXG4gICAqIHNlYXJjaCB0dXJucyBvdXQgdG8gYmUgZXhwZW5zaXZlLCB3ZSBjYW4gcHJvYmFibHkgcmVsYXggdGhpcyBvbmNlXG4gICAqIEVTNiBpcyBhZGVxdWF0ZWx5IHN1cHBvcnRlZCBvbiBhbGwgbWFqb3IgYnJvd3NlcnMsIGlmZiBubyBicm93c2VyXG4gICAqIHZlcnNpb25zIHdlIHN1cHBvcnQgYXQgdGhhdCB0aW1lIGhhdmUgcmVsYXhlZCB0aGlzIGNvbnN0cmFpbnRcbiAgICogd2l0aG91dCBwcm92aWRpbmcgYnVpbHQtaW4gRVM2IFdlYWtNYXBzLlxuICAgKi9cbiAgZGVmUHJvcChPYmplY3QsICdnZXRPd25Qcm9wZXJ0eU5hbWVzJywge1xuICAgIHZhbHVlOiBmdW5jdGlvbiBmYWtlR2V0T3duUHJvcGVydHlOYW1lcyhvYmopIHtcbiAgICAgIHJldHVybiBnb3BuKG9iaikuZmlsdGVyKGlzTm90SGlkZGVuTmFtZSk7XG4gICAgfVxuICB9KTtcblxuICAvKipcbiAgICogZ2V0UHJvcGVydHlOYW1lcyBpcyBub3QgaW4gRVM1IGJ1dCBpdCBpcyBwcm9wb3NlZCBmb3IgRVM2IGFuZFxuICAgKiBkb2VzIGFwcGVhciBpbiBvdXIgd2hpdGVsaXN0LCBzbyB3ZSBuZWVkIHRvIGNsZWFuIGl0IHRvby5cbiAgICovXG4gIGlmICgnZ2V0UHJvcGVydHlOYW1lcycgaW4gT2JqZWN0KSB7XG4gICAgdmFyIG9yaWdpbmFsR2V0UHJvcGVydHlOYW1lcyA9IE9iamVjdC5nZXRQcm9wZXJ0eU5hbWVzO1xuICAgIGRlZlByb3AoT2JqZWN0LCAnZ2V0UHJvcGVydHlOYW1lcycsIHtcbiAgICAgIHZhbHVlOiBmdW5jdGlvbiBmYWtlR2V0UHJvcGVydHlOYW1lcyhvYmopIHtcbiAgICAgICAgcmV0dXJuIG9yaWdpbmFsR2V0UHJvcGVydHlOYW1lcyhvYmopLmZpbHRlcihpc05vdEhpZGRlbk5hbWUpO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIDxwPlRvIHRyZWF0IG9iamVjdHMgYXMgaWRlbnRpdHkta2V5cyB3aXRoIHJlYXNvbmFibGUgZWZmaWNpZW5jeVxuICAgKiBvbiBFUzUgYnkgaXRzZWxmIChpLmUuLCB3aXRob3V0IGFueSBvYmplY3Qta2V5ZWQgY29sbGVjdGlvbnMpLCB3ZVxuICAgKiBuZWVkIHRvIGFkZCBhIGhpZGRlbiBwcm9wZXJ0eSB0byBzdWNoIGtleSBvYmplY3RzIHdoZW4gd2VcbiAgICogY2FuLiBUaGlzIHJhaXNlcyBzZXZlcmFsIGlzc3VlczpcbiAgICogPHVsPlxuICAgKiA8bGk+QXJyYW5naW5nIHRvIGFkZCB0aGlzIHByb3BlcnR5IHRvIG9iamVjdHMgYmVmb3JlIHdlIGxvc2UgdGhlXG4gICAqICAgICBjaGFuY2UsIGFuZFxuICAgKiA8bGk+SGlkaW5nIHRoZSBleGlzdGVuY2Ugb2YgdGhpcyBuZXcgcHJvcGVydHkgZnJvbSBtb3N0XG4gICAqICAgICBKYXZhU2NyaXB0IGNvZGUuXG4gICAqIDxsaT5QcmV2ZW50aW5nIDxpPmNlcnRpZmljYXRpb24gdGhlZnQ8L2k+LCB3aGVyZSBvbmUgb2JqZWN0IGlzXG4gICAqICAgICBjcmVhdGVkIGZhbHNlbHkgY2xhaW1pbmcgdG8gYmUgdGhlIGtleSBvZiBhbiBhc3NvY2lhdGlvblxuICAgKiAgICAgYWN0dWFsbHkga2V5ZWQgYnkgYW5vdGhlciBvYmplY3QuXG4gICAqIDxsaT5QcmV2ZW50aW5nIDxpPnZhbHVlIHRoZWZ0PC9pPiwgd2hlcmUgdW50cnVzdGVkIGNvZGUgd2l0aFxuICAgKiAgICAgYWNjZXNzIHRvIGEga2V5IG9iamVjdCBidXQgbm90IGEgd2VhayBtYXAgbmV2ZXJ0aGVsZXNzXG4gICAqICAgICBvYnRhaW5zIGFjY2VzcyB0byB0aGUgdmFsdWUgYXNzb2NpYXRlZCB3aXRoIHRoYXQga2V5IGluIHRoYXRcbiAgICogICAgIHdlYWsgbWFwLlxuICAgKiA8L3VsPlxuICAgKiBXZSBkbyBzbyBieVxuICAgKiA8dWw+XG4gICAqIDxsaT5NYWtpbmcgdGhlIG5hbWUgb2YgdGhlIGhpZGRlbiBwcm9wZXJ0eSB1bmd1ZXNzYWJsZSwgc28gXCJbXVwiXG4gICAqICAgICBpbmRleGluZywgd2hpY2ggd2UgY2Fubm90IGludGVyY2VwdCwgY2Fubm90IGJlIHVzZWQgdG8gYWNjZXNzXG4gICAqICAgICBhIHByb3BlcnR5IHdpdGhvdXQga25vd2luZyB0aGUgbmFtZS5cbiAgICogPGxpPk1ha2luZyB0aGUgaGlkZGVuIHByb3BlcnR5IG5vbi1lbnVtZXJhYmxlLCBzbyB3ZSBuZWVkIG5vdFxuICAgKiAgICAgd29ycnkgYWJvdXQgZm9yLWluIGxvb3BzIG9yIHtAY29kZSBPYmplY3Qua2V5c30sXG4gICAqIDxsaT5tb25rZXkgcGF0Y2hpbmcgdGhvc2UgcmVmbGVjdGl2ZSBtZXRob2RzIHRoYXQgd291bGRcbiAgICogICAgIHByZXZlbnQgZXh0ZW5zaW9ucywgdG8gYWRkIHRoaXMgaGlkZGVuIHByb3BlcnR5IGZpcnN0LFxuICAgKiA8bGk+bW9ua2V5IHBhdGNoaW5nIHRob3NlIG1ldGhvZHMgdGhhdCB3b3VsZCByZXZlYWwgdGhpc1xuICAgKiAgICAgaGlkZGVuIHByb3BlcnR5LlxuICAgKiA8L3VsPlxuICAgKiBVbmZvcnR1bmF0ZWx5LCBiZWNhdXNlIG9mIHNhbWUtb3JpZ2luIGlmcmFtZXMsIHdlIGNhbm5vdCByZWxpYWJseVxuICAgKiBhZGQgdGhpcyBoaWRkZW4gcHJvcGVydHkgYmVmb3JlIGFuIG9iamVjdCBiZWNvbWVzXG4gICAqIG5vbi1leHRlbnNpYmxlLiBJbnN0ZWFkLCBpZiB3ZSBlbmNvdW50ZXIgYSBub24tZXh0ZW5zaWJsZSBvYmplY3RcbiAgICogd2l0aG91dCBhIGhpZGRlbiByZWNvcmQgdGhhdCB3ZSBjYW4gZGV0ZWN0ICh3aGV0aGVyIG9yIG5vdCBpdCBoYXNcbiAgICogYSBoaWRkZW4gcmVjb3JkIHN0b3JlZCB1bmRlciBhIG5hbWUgc2VjcmV0IHRvIHVzKSwgdGhlbiB3ZSBqdXN0XG4gICAqIHVzZSB0aGUga2V5IG9iamVjdCBpdHNlbGYgdG8gcmVwcmVzZW50IGl0cyBpZGVudGl0eSBpbiBhIGJydXRlXG4gICAqIGZvcmNlIGxlYWt5IG1hcCBzdG9yZWQgaW4gdGhlIHdlYWsgbWFwLCBsb3NpbmcgYWxsIHRoZSBhZHZhbnRhZ2VzXG4gICAqIG9mIHdlYWtuZXNzIGZvciB0aGVzZS5cbiAgICovXG4gIGZ1bmN0aW9uIGdldEhpZGRlblJlY29yZChrZXkpIHtcbiAgICBpZiAoa2V5ICE9PSBPYmplY3Qoa2V5KSkge1xuICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignTm90IGFuIG9iamVjdDogJyArIGtleSk7XG4gICAgfVxuICAgIHZhciBoaWRkZW5SZWNvcmQgPSBrZXlbSElEREVOX05BTUVdO1xuICAgIGlmIChoaWRkZW5SZWNvcmQgJiYgaGlkZGVuUmVjb3JkLmtleSA9PT0ga2V5KSB7IHJldHVybiBoaWRkZW5SZWNvcmQ7IH1cbiAgICBpZiAoIWlzRXh0ZW5zaWJsZShrZXkpKSB7XG4gICAgICAvLyBXZWFrIG1hcCBtdXN0IGJydXRlIGZvcmNlLCBhcyBleHBsYWluZWQgaW4gZG9jLWNvbW1lbnQgYWJvdmUuXG4gICAgICByZXR1cm4gdm9pZCAwO1xuICAgIH1cblxuICAgIC8vIFRoZSBoaWRkZW5SZWNvcmQgYW5kIHRoZSBrZXkgcG9pbnQgZGlyZWN0bHkgYXQgZWFjaCBvdGhlciwgdmlhXG4gICAgLy8gdGhlIFwia2V5XCIgYW5kIEhJRERFTl9OQU1FIHByb3BlcnRpZXMgcmVzcGVjdGl2ZWx5LiBUaGUga2V5XG4gICAgLy8gZmllbGQgaXMgZm9yIHF1aWNrbHkgdmVyaWZ5aW5nIHRoYXQgdGhpcyBoaWRkZW4gcmVjb3JkIGlzIGFuXG4gICAgLy8gb3duIHByb3BlcnR5LCBub3QgYSBoaWRkZW4gcmVjb3JkIGZyb20gdXAgdGhlIHByb3RvdHlwZSBjaGFpbi5cbiAgICAvL1xuICAgIC8vIE5PVEU6IEJlY2F1c2UgdGhpcyBXZWFrTWFwIGVtdWxhdGlvbiBpcyBtZWFudCBvbmx5IGZvciBzeXN0ZW1zIGxpa2VcbiAgICAvLyBTRVMgd2hlcmUgT2JqZWN0LnByb3RvdHlwZSBpcyBmcm96ZW4gd2l0aG91dCBhbnkgbnVtZXJpY1xuICAgIC8vIHByb3BlcnRpZXMsIGl0IGlzIG9rIHRvIHVzZSBhbiBvYmplY3QgbGl0ZXJhbCBmb3IgdGhlIGhpZGRlblJlY29yZC5cbiAgICAvLyBUaGlzIGhhcyB0d28gYWR2YW50YWdlczpcbiAgICAvLyAqIEl0IGlzIG11Y2ggZmFzdGVyIGluIGEgcGVyZm9ybWFuY2UgY3JpdGljYWwgcGxhY2VcbiAgICAvLyAqIEl0IGF2b2lkcyByZWx5aW5nIG9uIE9iamVjdC5jcmVhdGUobnVsbCksIHdoaWNoIGhhZCBiZWVuXG4gICAgLy8gICBwcm9ibGVtYXRpYyBvbiBDaHJvbWUgMjguMC4xNDgwLjAuIFNlZVxuICAgIC8vICAgaHR0cHM6Ly9jb2RlLmdvb2dsZS5jb20vcC9nb29nbGUtY2FqYS9pc3N1ZXMvZGV0YWlsP2lkPTE2ODdcbiAgICBoaWRkZW5SZWNvcmQgPSB7IGtleToga2V5IH07XG5cbiAgICAvLyBXaGVuIHVzaW5nIHRoaXMgV2Vha01hcCBlbXVsYXRpb24gb24gcGxhdGZvcm1zIHdoZXJlXG4gICAgLy8gT2JqZWN0LnByb3RvdHlwZSBtaWdodCBub3QgYmUgZnJvemVuIGFuZCBPYmplY3QuY3JlYXRlKG51bGwpIGlzXG4gICAgLy8gcmVsaWFibGUsIHVzZSB0aGUgZm9sbG93aW5nIHR3byBjb21tZW50ZWQgb3V0IGxpbmVzIGluc3RlYWQuXG4gICAgLy8gaGlkZGVuUmVjb3JkID0gT2JqZWN0LmNyZWF0ZShudWxsKTtcbiAgICAvLyBoaWRkZW5SZWNvcmQua2V5ID0ga2V5O1xuXG4gICAgLy8gUGxlYXNlIGNvbnRhY3QgdXMgaWYgeW91IG5lZWQgdGhpcyB0byB3b3JrIG9uIHBsYXRmb3JtcyB3aGVyZVxuICAgIC8vIE9iamVjdC5wcm90b3R5cGUgbWlnaHQgbm90IGJlIGZyb3plbiBhbmRcbiAgICAvLyBPYmplY3QuY3JlYXRlKG51bGwpIG1pZ2h0IG5vdCBiZSByZWxpYWJsZS5cblxuICAgIHRyeSB7XG4gICAgICBkZWZQcm9wKGtleSwgSElEREVOX05BTUUsIHtcbiAgICAgICAgdmFsdWU6IGhpZGRlblJlY29yZCxcbiAgICAgICAgd3JpdGFibGU6IGZhbHNlLFxuICAgICAgICBlbnVtZXJhYmxlOiBmYWxzZSxcbiAgICAgICAgY29uZmlndXJhYmxlOiBmYWxzZVxuICAgICAgfSk7XG4gICAgICByZXR1cm4gaGlkZGVuUmVjb3JkO1xuICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAvLyBVbmRlciBzb21lIGNpcmN1bXN0YW5jZXMsIGlzRXh0ZW5zaWJsZSBzZWVtcyB0byBtaXNyZXBvcnQgd2hldGhlclxuICAgICAgLy8gdGhlIEhJRERFTl9OQU1FIGNhbiBiZSBkZWZpbmVkLlxuICAgICAgLy8gVGhlIGNpcmN1bXN0YW5jZXMgaGF2ZSBub3QgYmVlbiBpc29sYXRlZCwgYnV0IGF0IGxlYXN0IGFmZmVjdFxuICAgICAgLy8gTm9kZS5qcyB2MC4xMC4yNiBvbiBUcmF2aXNDSSAvIExpbnV4LCBidXQgbm90IHRoZSBzYW1lIHZlcnNpb24gb2ZcbiAgICAgIC8vIE5vZGUuanMgb24gT1MgWC5cbiAgICAgIHJldHVybiB2b2lkIDA7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIE1vbmtleSBwYXRjaCBvcGVyYXRpb25zIHRoYXQgd291bGQgbWFrZSB0aGVpciBhcmd1bWVudFxuICAgKiBub24tZXh0ZW5zaWJsZS5cbiAgICpcbiAgICogPHA+VGhlIG1vbmtleSBwYXRjaGVkIHZlcnNpb25zIHRocm93IGEgVHlwZUVycm9yIGlmIHRoZWlyXG4gICAqIGFyZ3VtZW50IGlzIG5vdCBhbiBvYmplY3QsIHNvIGl0IHNob3VsZCBvbmx5IGJlIGRvbmUgdG8gZnVuY3Rpb25zXG4gICAqIHRoYXQgc2hvdWxkIHRocm93IGEgVHlwZUVycm9yIGFueXdheSBpZiB0aGVpciBhcmd1bWVudCBpcyBub3QgYW5cbiAgICogb2JqZWN0LlxuICAgKi9cbiAgKGZ1bmN0aW9uKCl7XG4gICAgdmFyIG9sZEZyZWV6ZSA9IE9iamVjdC5mcmVlemU7XG4gICAgZGVmUHJvcChPYmplY3QsICdmcmVlemUnLCB7XG4gICAgICB2YWx1ZTogZnVuY3Rpb24gaWRlbnRpZnlpbmdGcmVlemUob2JqKSB7XG4gICAgICAgIGdldEhpZGRlblJlY29yZChvYmopO1xuICAgICAgICByZXR1cm4gb2xkRnJlZXplKG9iaik7XG4gICAgICB9XG4gICAgfSk7XG4gICAgdmFyIG9sZFNlYWwgPSBPYmplY3Quc2VhbDtcbiAgICBkZWZQcm9wKE9iamVjdCwgJ3NlYWwnLCB7XG4gICAgICB2YWx1ZTogZnVuY3Rpb24gaWRlbnRpZnlpbmdTZWFsKG9iaikge1xuICAgICAgICBnZXRIaWRkZW5SZWNvcmQob2JqKTtcbiAgICAgICAgcmV0dXJuIG9sZFNlYWwob2JqKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgICB2YXIgb2xkUHJldmVudEV4dGVuc2lvbnMgPSBPYmplY3QucHJldmVudEV4dGVuc2lvbnM7XG4gICAgZGVmUHJvcChPYmplY3QsICdwcmV2ZW50RXh0ZW5zaW9ucycsIHtcbiAgICAgIHZhbHVlOiBmdW5jdGlvbiBpZGVudGlmeWluZ1ByZXZlbnRFeHRlbnNpb25zKG9iaikge1xuICAgICAgICBnZXRIaWRkZW5SZWNvcmQob2JqKTtcbiAgICAgICAgcmV0dXJuIG9sZFByZXZlbnRFeHRlbnNpb25zKG9iaik7XG4gICAgICB9XG4gICAgfSk7XG4gIH0pKCk7XG5cbiAgZnVuY3Rpb24gY29uc3RGdW5jKGZ1bmMpIHtcbiAgICBmdW5jLnByb3RvdHlwZSA9IG51bGw7XG4gICAgcmV0dXJuIE9iamVjdC5mcmVlemUoZnVuYyk7XG4gIH1cblxuICB2YXIgY2FsbGVkQXNGdW5jdGlvbldhcm5pbmdEb25lID0gZmFsc2U7XG4gIGZ1bmN0aW9uIGNhbGxlZEFzRnVuY3Rpb25XYXJuaW5nKCkge1xuICAgIC8vIEZ1dHVyZSBFUzYgV2Vha01hcCBpcyBjdXJyZW50bHkgKDIwMTMtMDktMTApIGV4cGVjdGVkIHRvIHJlamVjdCBXZWFrTWFwKClcbiAgICAvLyBidXQgd2UgdXNlZCB0byBwZXJtaXQgaXQgYW5kIGRvIGl0IG91cnNlbHZlcywgc28gd2FybiBvbmx5LlxuICAgIGlmICghY2FsbGVkQXNGdW5jdGlvbldhcm5pbmdEb25lICYmIHR5cGVvZiBjb25zb2xlICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgY2FsbGVkQXNGdW5jdGlvbldhcm5pbmdEb25lID0gdHJ1ZTtcbiAgICAgIGNvbnNvbGUud2FybignV2Vha01hcCBzaG91bGQgYmUgaW52b2tlZCBhcyBuZXcgV2Vha01hcCgpLCBub3QgJyArXG4gICAgICAgICAgJ1dlYWtNYXAoKS4gVGhpcyB3aWxsIGJlIGFuIGVycm9yIGluIHRoZSBmdXR1cmUuJyk7XG4gICAgfVxuICB9XG5cbiAgdmFyIG5leHRJZCA9IDA7XG5cbiAgdmFyIE91cldlYWtNYXAgPSBmdW5jdGlvbigpIHtcbiAgICBpZiAoISh0aGlzIGluc3RhbmNlb2YgT3VyV2Vha01hcCkpIHsgIC8vIGFwcHJveGltYXRlIHRlc3QgZm9yIG5ldyAuLi4oKVxuICAgICAgY2FsbGVkQXNGdW5jdGlvbldhcm5pbmcoKTtcbiAgICB9XG5cbiAgICAvLyBXZSBhcmUgY3VycmVudGx5ICgxMi8yNS8yMDEyKSBuZXZlciBlbmNvdW50ZXJpbmcgYW55IHByZW1hdHVyZWx5XG4gICAgLy8gbm9uLWV4dGVuc2libGUga2V5cy5cbiAgICB2YXIga2V5cyA9IFtdOyAvLyBicnV0ZSBmb3JjZSBmb3IgcHJlbWF0dXJlbHkgbm9uLWV4dGVuc2libGUga2V5cy5cbiAgICB2YXIgdmFsdWVzID0gW107IC8vIGJydXRlIGZvcmNlIGZvciBjb3JyZXNwb25kaW5nIHZhbHVlcy5cbiAgICB2YXIgaWQgPSBuZXh0SWQrKztcblxuICAgIGZ1bmN0aW9uIGdldF9fXyhrZXksIG9wdF9kZWZhdWx0KSB7XG4gICAgICB2YXIgaW5kZXg7XG4gICAgICB2YXIgaGlkZGVuUmVjb3JkID0gZ2V0SGlkZGVuUmVjb3JkKGtleSk7XG4gICAgICBpZiAoaGlkZGVuUmVjb3JkKSB7XG4gICAgICAgIHJldHVybiBpZCBpbiBoaWRkZW5SZWNvcmQgPyBoaWRkZW5SZWNvcmRbaWRdIDogb3B0X2RlZmF1bHQ7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBpbmRleCA9IGtleXMuaW5kZXhPZihrZXkpO1xuICAgICAgICByZXR1cm4gaW5kZXggPj0gMCA/IHZhbHVlc1tpbmRleF0gOiBvcHRfZGVmYXVsdDtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBmdW5jdGlvbiBoYXNfX18oa2V5KSB7XG4gICAgICB2YXIgaGlkZGVuUmVjb3JkID0gZ2V0SGlkZGVuUmVjb3JkKGtleSk7XG4gICAgICBpZiAoaGlkZGVuUmVjb3JkKSB7XG4gICAgICAgIHJldHVybiBpZCBpbiBoaWRkZW5SZWNvcmQ7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4ga2V5cy5pbmRleE9mKGtleSkgPj0gMDtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBmdW5jdGlvbiBzZXRfX18oa2V5LCB2YWx1ZSkge1xuICAgICAgdmFyIGluZGV4O1xuICAgICAgdmFyIGhpZGRlblJlY29yZCA9IGdldEhpZGRlblJlY29yZChrZXkpO1xuICAgICAgaWYgKGhpZGRlblJlY29yZCkge1xuICAgICAgICBoaWRkZW5SZWNvcmRbaWRdID0gdmFsdWU7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBpbmRleCA9IGtleXMuaW5kZXhPZihrZXkpO1xuICAgICAgICBpZiAoaW5kZXggPj0gMCkge1xuICAgICAgICAgIHZhbHVlc1tpbmRleF0gPSB2YWx1ZTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAvLyBTaW5jZSBzb21lIGJyb3dzZXJzIHByZWVtcHRpdmVseSB0ZXJtaW5hdGUgc2xvdyB0dXJucyBidXRcbiAgICAgICAgICAvLyB0aGVuIGNvbnRpbnVlIGNvbXB1dGluZyB3aXRoIHByZXN1bWFibHkgY29ycnVwdGVkIGhlYXBcbiAgICAgICAgICAvLyBzdGF0ZSwgd2UgaGVyZSBkZWZlbnNpdmVseSBnZXQga2V5cy5sZW5ndGggZmlyc3QgYW5kIHRoZW5cbiAgICAgICAgICAvLyB1c2UgaXQgdG8gdXBkYXRlIGJvdGggdGhlIHZhbHVlcyBhbmQga2V5cyBhcnJheXMsIGtlZXBpbmdcbiAgICAgICAgICAvLyB0aGVtIGluIHN5bmMuXG4gICAgICAgICAgaW5kZXggPSBrZXlzLmxlbmd0aDtcbiAgICAgICAgICB2YWx1ZXNbaW5kZXhdID0gdmFsdWU7XG4gICAgICAgICAgLy8gSWYgd2UgY3Jhc2ggaGVyZSwgdmFsdWVzIHdpbGwgYmUgb25lIGxvbmdlciB0aGFuIGtleXMuXG4gICAgICAgICAga2V5c1tpbmRleF0gPSBrZXk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGRlbGV0ZV9fXyhrZXkpIHtcbiAgICAgIHZhciBoaWRkZW5SZWNvcmQgPSBnZXRIaWRkZW5SZWNvcmQoa2V5KTtcbiAgICAgIHZhciBpbmRleCwgbGFzdEluZGV4O1xuICAgICAgaWYgKGhpZGRlblJlY29yZCkge1xuICAgICAgICByZXR1cm4gaWQgaW4gaGlkZGVuUmVjb3JkICYmIGRlbGV0ZSBoaWRkZW5SZWNvcmRbaWRdO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgaW5kZXggPSBrZXlzLmluZGV4T2Yoa2V5KTtcbiAgICAgICAgaWYgKGluZGV4IDwgMCkge1xuICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICAvLyBTaW5jZSBzb21lIGJyb3dzZXJzIHByZWVtcHRpdmVseSB0ZXJtaW5hdGUgc2xvdyB0dXJucyBidXRcbiAgICAgICAgLy8gdGhlbiBjb250aW51ZSBjb21wdXRpbmcgd2l0aCBwb3RlbnRpYWxseSBjb3JydXB0ZWQgaGVhcFxuICAgICAgICAvLyBzdGF0ZSwgd2UgaGVyZSBkZWZlbnNpdmVseSBnZXQga2V5cy5sZW5ndGggZmlyc3QgYW5kIHRoZW4gdXNlXG4gICAgICAgIC8vIGl0IHRvIHVwZGF0ZSBib3RoIHRoZSBrZXlzIGFuZCB0aGUgdmFsdWVzIGFycmF5LCBrZWVwaW5nXG4gICAgICAgIC8vIHRoZW0gaW4gc3luYy4gV2UgdXBkYXRlIHRoZSB0d28gd2l0aCBhbiBvcmRlciBvZiBhc3NpZ25tZW50cyxcbiAgICAgICAgLy8gc3VjaCB0aGF0IGFueSBwcmVmaXggb2YgdGhlc2UgYXNzaWdubWVudHMgd2lsbCBwcmVzZXJ2ZSB0aGVcbiAgICAgICAgLy8ga2V5L3ZhbHVlIGNvcnJlc3BvbmRlbmNlLCBlaXRoZXIgYmVmb3JlIG9yIGFmdGVyIHRoZSBkZWxldGUuXG4gICAgICAgIC8vIE5vdGUgdGhhdCB0aGlzIG5lZWRzIHRvIHdvcmsgY29ycmVjdGx5IHdoZW4gaW5kZXggPT09IGxhc3RJbmRleC5cbiAgICAgICAgbGFzdEluZGV4ID0ga2V5cy5sZW5ndGggLSAxO1xuICAgICAgICBrZXlzW2luZGV4XSA9IHZvaWQgMDtcbiAgICAgICAgLy8gSWYgd2UgY3Jhc2ggaGVyZSwgdGhlcmUncyBhIHZvaWQgMCBpbiB0aGUga2V5cyBhcnJheSwgYnV0XG4gICAgICAgIC8vIG5vIG9wZXJhdGlvbiB3aWxsIGNhdXNlIGEgXCJrZXlzLmluZGV4T2Yodm9pZCAwKVwiLCBzaW5jZVxuICAgICAgICAvLyBnZXRIaWRkZW5SZWNvcmQodm9pZCAwKSB3aWxsIGFsd2F5cyB0aHJvdyBhbiBlcnJvciBmaXJzdC5cbiAgICAgICAgdmFsdWVzW2luZGV4XSA9IHZhbHVlc1tsYXN0SW5kZXhdO1xuICAgICAgICAvLyBJZiB3ZSBjcmFzaCBoZXJlLCB2YWx1ZXNbaW5kZXhdIGNhbm5vdCBiZSBmb3VuZCBoZXJlLFxuICAgICAgICAvLyBiZWNhdXNlIGtleXNbaW5kZXhdIGlzIHZvaWQgMC5cbiAgICAgICAga2V5c1tpbmRleF0gPSBrZXlzW2xhc3RJbmRleF07XG4gICAgICAgIC8vIElmIGluZGV4ID09PSBsYXN0SW5kZXggYW5kIHdlIGNyYXNoIGhlcmUsIHRoZW4ga2V5c1tpbmRleF1cbiAgICAgICAgLy8gaXMgc3RpbGwgdm9pZCAwLCBzaW5jZSB0aGUgYWxpYXNpbmcga2lsbGVkIHRoZSBwcmV2aW91cyBrZXkuXG4gICAgICAgIGtleXMubGVuZ3RoID0gbGFzdEluZGV4O1xuICAgICAgICAvLyBJZiB3ZSBjcmFzaCBoZXJlLCBrZXlzIHdpbGwgYmUgb25lIHNob3J0ZXIgdGhhbiB2YWx1ZXMuXG4gICAgICAgIHZhbHVlcy5sZW5ndGggPSBsYXN0SW5kZXg7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBPYmplY3QuY3JlYXRlKE91cldlYWtNYXAucHJvdG90eXBlLCB7XG4gICAgICBnZXRfX186ICAgIHsgdmFsdWU6IGNvbnN0RnVuYyhnZXRfX18pIH0sXG4gICAgICBoYXNfX186ICAgIHsgdmFsdWU6IGNvbnN0RnVuYyhoYXNfX18pIH0sXG4gICAgICBzZXRfX186ICAgIHsgdmFsdWU6IGNvbnN0RnVuYyhzZXRfX18pIH0sXG4gICAgICBkZWxldGVfX186IHsgdmFsdWU6IGNvbnN0RnVuYyhkZWxldGVfX18pIH1cbiAgICB9KTtcbiAgfTtcblxuICBPdXJXZWFrTWFwLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoT2JqZWN0LnByb3RvdHlwZSwge1xuICAgIGdldDoge1xuICAgICAgLyoqXG4gICAgICAgKiBSZXR1cm4gdGhlIHZhbHVlIG1vc3QgcmVjZW50bHkgYXNzb2NpYXRlZCB3aXRoIGtleSwgb3JcbiAgICAgICAqIG9wdF9kZWZhdWx0IGlmIG5vbmUuXG4gICAgICAgKi9cbiAgICAgIHZhbHVlOiBmdW5jdGlvbiBnZXQoa2V5LCBvcHRfZGVmYXVsdCkge1xuICAgICAgICByZXR1cm4gdGhpcy5nZXRfX18oa2V5LCBvcHRfZGVmYXVsdCk7XG4gICAgICB9LFxuICAgICAgd3JpdGFibGU6IHRydWUsXG4gICAgICBjb25maWd1cmFibGU6IHRydWVcbiAgICB9LFxuXG4gICAgaGFzOiB7XG4gICAgICAvKipcbiAgICAgICAqIElzIHRoZXJlIGEgdmFsdWUgYXNzb2NpYXRlZCB3aXRoIGtleSBpbiB0aGlzIFdlYWtNYXA/XG4gICAgICAgKi9cbiAgICAgIHZhbHVlOiBmdW5jdGlvbiBoYXMoa2V5KSB7XG4gICAgICAgIHJldHVybiB0aGlzLmhhc19fXyhrZXkpO1xuICAgICAgfSxcbiAgICAgIHdyaXRhYmxlOiB0cnVlLFxuICAgICAgY29uZmlndXJhYmxlOiB0cnVlXG4gICAgfSxcblxuICAgIHNldDoge1xuICAgICAgLyoqXG4gICAgICAgKiBBc3NvY2lhdGUgdmFsdWUgd2l0aCBrZXkgaW4gdGhpcyBXZWFrTWFwLCBvdmVyd3JpdGluZyBhbnlcbiAgICAgICAqIHByZXZpb3VzIGFzc29jaWF0aW9uIGlmIHByZXNlbnQuXG4gICAgICAgKi9cbiAgICAgIHZhbHVlOiBmdW5jdGlvbiBzZXQoa2V5LCB2YWx1ZSkge1xuICAgICAgICByZXR1cm4gdGhpcy5zZXRfX18oa2V5LCB2YWx1ZSk7XG4gICAgICB9LFxuICAgICAgd3JpdGFibGU6IHRydWUsXG4gICAgICBjb25maWd1cmFibGU6IHRydWVcbiAgICB9LFxuXG4gICAgJ2RlbGV0ZSc6IHtcbiAgICAgIC8qKlxuICAgICAgICogUmVtb3ZlIGFueSBhc3NvY2lhdGlvbiBmb3Iga2V5IGluIHRoaXMgV2Vha01hcCwgcmV0dXJuaW5nXG4gICAgICAgKiB3aGV0aGVyIHRoZXJlIHdhcyBvbmUuXG4gICAgICAgKlxuICAgICAgICogPHA+Tm90ZSB0aGF0IHRoZSBib29sZWFuIHJldHVybiBoZXJlIGRvZXMgbm90IHdvcmsgbGlrZSB0aGVcbiAgICAgICAqIHtAY29kZSBkZWxldGV9IG9wZXJhdG9yLiBUaGUge0Bjb2RlIGRlbGV0ZX0gb3BlcmF0b3IgcmV0dXJuc1xuICAgICAgICogd2hldGhlciB0aGUgZGVsZXRpb24gc3VjY2VlZHMgYXQgYnJpbmdpbmcgYWJvdXQgYSBzdGF0ZSBpblxuICAgICAgICogd2hpY2ggdGhlIGRlbGV0ZWQgcHJvcGVydHkgaXMgYWJzZW50LiBUaGUge0Bjb2RlIGRlbGV0ZX1cbiAgICAgICAqIG9wZXJhdG9yIHRoZXJlZm9yZSByZXR1cm5zIHRydWUgaWYgdGhlIHByb3BlcnR5IHdhcyBhbHJlYWR5XG4gICAgICAgKiBhYnNlbnQsIHdoZXJlYXMgdGhpcyB7QGNvZGUgZGVsZXRlfSBtZXRob2QgcmV0dXJucyBmYWxzZSBpZlxuICAgICAgICogdGhlIGFzc29jaWF0aW9uIHdhcyBhbHJlYWR5IGFic2VudC5cbiAgICAgICAqL1xuICAgICAgdmFsdWU6IGZ1bmN0aW9uIHJlbW92ZShrZXkpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZGVsZXRlX19fKGtleSk7XG4gICAgICB9LFxuICAgICAgd3JpdGFibGU6IHRydWUsXG4gICAgICBjb25maWd1cmFibGU6IHRydWVcbiAgICB9XG4gIH0pO1xuXG4gIGlmICh0eXBlb2YgSG9zdFdlYWtNYXAgPT09ICdmdW5jdGlvbicpIHtcbiAgICAoZnVuY3Rpb24oKSB7XG4gICAgICAvLyBJZiB3ZSBnb3QgaGVyZSwgdGhlbiB0aGUgcGxhdGZvcm0gaGFzIGEgV2Vha01hcCBidXQgd2UgYXJlIGNvbmNlcm5lZFxuICAgICAgLy8gdGhhdCBpdCBtYXkgcmVmdXNlIHRvIHN0b3JlIHNvbWUga2V5IHR5cGVzLiBUaGVyZWZvcmUsIG1ha2UgYSBtYXBcbiAgICAgIC8vIGltcGxlbWVudGF0aW9uIHdoaWNoIG1ha2VzIHVzZSBvZiBib3RoIGFzIHBvc3NpYmxlLlxuXG4gICAgICAvLyBJbiB0aGlzIG1vZGUgd2UgYXJlIGFsd2F5cyB1c2luZyBkb3VibGUgbWFwcywgc28gd2UgYXJlIG5vdCBwcm94eS1zYWZlLlxuICAgICAgLy8gVGhpcyBjb21iaW5hdGlvbiBkb2VzIG5vdCBvY2N1ciBpbiBhbnkga25vd24gYnJvd3NlciwgYnV0IHdlIGhhZCBiZXN0XG4gICAgICAvLyBiZSBzYWZlLlxuICAgICAgaWYgKGRvdWJsZVdlYWtNYXBDaGVja1NpbGVudEZhaWx1cmUgJiYgdHlwZW9mIFByb3h5ICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgICBQcm94eSA9IHVuZGVmaW5lZDtcbiAgICAgIH1cblxuICAgICAgZnVuY3Rpb24gRG91YmxlV2Vha01hcCgpIHtcbiAgICAgICAgaWYgKCEodGhpcyBpbnN0YW5jZW9mIE91cldlYWtNYXApKSB7ICAvLyBhcHByb3hpbWF0ZSB0ZXN0IGZvciBuZXcgLi4uKClcbiAgICAgICAgICBjYWxsZWRBc0Z1bmN0aW9uV2FybmluZygpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gUHJlZmVyYWJsZSwgdHJ1bHkgd2VhayBtYXAuXG4gICAgICAgIHZhciBobWFwID0gbmV3IEhvc3RXZWFrTWFwKCk7XG5cbiAgICAgICAgLy8gT3VyIGhpZGRlbi1wcm9wZXJ0eS1iYXNlZCBwc2V1ZG8td2Vhay1tYXAuIExhemlseSBpbml0aWFsaXplZCBpbiB0aGVcbiAgICAgICAgLy8gJ3NldCcgaW1wbGVtZW50YXRpb247IHRodXMgd2UgY2FuIGF2b2lkIHBlcmZvcm1pbmcgZXh0cmEgbG9va3VwcyBpZlxuICAgICAgICAvLyB3ZSBrbm93IGFsbCBlbnRyaWVzIGFjdHVhbGx5IHN0b3JlZCBhcmUgZW50ZXJlZCBpbiAnaG1hcCcuXG4gICAgICAgIHZhciBvbWFwID0gdW5kZWZpbmVkO1xuXG4gICAgICAgIC8vIEhpZGRlbi1wcm9wZXJ0eSBtYXBzIGFyZSBub3QgY29tcGF0aWJsZSB3aXRoIHByb3hpZXMgYmVjYXVzZSBwcm94aWVzXG4gICAgICAgIC8vIGNhbiBvYnNlcnZlIHRoZSBoaWRkZW4gbmFtZSBhbmQgZWl0aGVyIGFjY2lkZW50YWxseSBleHBvc2UgaXQgb3IgZmFpbFxuICAgICAgICAvLyB0byBhbGxvdyB0aGUgaGlkZGVuIHByb3BlcnR5IHRvIGJlIHNldC4gVGhlcmVmb3JlLCB3ZSBkbyBub3QgYWxsb3dcbiAgICAgICAgLy8gYXJiaXRyYXJ5IFdlYWtNYXBzIHRvIHN3aXRjaCB0byB1c2luZyBoaWRkZW4gcHJvcGVydGllcywgYnV0IG9ubHlcbiAgICAgICAgLy8gdGhvc2Ugd2hpY2ggbmVlZCB0aGUgYWJpbGl0eSwgYW5kIHVucHJpdmlsZWdlZCBjb2RlIGlzIG5vdCBhbGxvd2VkXG4gICAgICAgIC8vIHRvIHNldCB0aGUgZmxhZy5cbiAgICAgICAgLy9cbiAgICAgICAgLy8gKEV4Y2VwdCBpbiBkb3VibGVXZWFrTWFwQ2hlY2tTaWxlbnRGYWlsdXJlIG1vZGUgaW4gd2hpY2ggY2FzZSB3ZVxuICAgICAgICAvLyBkaXNhYmxlIHByb3hpZXMuKVxuICAgICAgICB2YXIgZW5hYmxlU3dpdGNoaW5nID0gZmFsc2U7XG5cbiAgICAgICAgZnVuY3Rpb24gZGdldChrZXksIG9wdF9kZWZhdWx0KSB7XG4gICAgICAgICAgaWYgKG9tYXApIHtcbiAgICAgICAgICAgIHJldHVybiBobWFwLmhhcyhrZXkpID8gaG1hcC5nZXQoa2V5KVxuICAgICAgICAgICAgICAgIDogb21hcC5nZXRfX18oa2V5LCBvcHRfZGVmYXVsdCk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiBobWFwLmdldChrZXksIG9wdF9kZWZhdWx0KTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBmdW5jdGlvbiBkaGFzKGtleSkge1xuICAgICAgICAgIHJldHVybiBobWFwLmhhcyhrZXkpIHx8IChvbWFwID8gb21hcC5oYXNfX18oa2V5KSA6IGZhbHNlKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHZhciBkc2V0O1xuICAgICAgICBpZiAoZG91YmxlV2Vha01hcENoZWNrU2lsZW50RmFpbHVyZSkge1xuICAgICAgICAgIGRzZXQgPSBmdW5jdGlvbihrZXksIHZhbHVlKSB7XG4gICAgICAgICAgICBobWFwLnNldChrZXksIHZhbHVlKTtcbiAgICAgICAgICAgIGlmICghaG1hcC5oYXMoa2V5KSkge1xuICAgICAgICAgICAgICBpZiAoIW9tYXApIHsgb21hcCA9IG5ldyBPdXJXZWFrTWFwKCk7IH1cbiAgICAgICAgICAgICAgb21hcC5zZXQoa2V5LCB2YWx1ZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgICAgICB9O1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGRzZXQgPSBmdW5jdGlvbihrZXksIHZhbHVlKSB7XG4gICAgICAgICAgICBpZiAoZW5hYmxlU3dpdGNoaW5nKSB7XG4gICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgaG1hcC5zZXQoa2V5LCB2YWx1ZSk7XG4gICAgICAgICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgICAgICBpZiAoIW9tYXApIHsgb21hcCA9IG5ldyBPdXJXZWFrTWFwKCk7IH1cbiAgICAgICAgICAgICAgICBvbWFwLnNldF9fXyhrZXksIHZhbHVlKTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgaG1hcC5zZXQoa2V5LCB2YWx1ZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgICAgICB9O1xuICAgICAgICB9XG5cbiAgICAgICAgZnVuY3Rpb24gZGRlbGV0ZShrZXkpIHtcbiAgICAgICAgICB2YXIgcmVzdWx0ID0gISFobWFwWydkZWxldGUnXShrZXkpO1xuICAgICAgICAgIGlmIChvbWFwKSB7IHJldHVybiBvbWFwLmRlbGV0ZV9fXyhrZXkpIHx8IHJlc3VsdDsgfVxuICAgICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gT2JqZWN0LmNyZWF0ZShPdXJXZWFrTWFwLnByb3RvdHlwZSwge1xuICAgICAgICAgIGdldF9fXzogICAgeyB2YWx1ZTogY29uc3RGdW5jKGRnZXQpIH0sXG4gICAgICAgICAgaGFzX19fOiAgICB7IHZhbHVlOiBjb25zdEZ1bmMoZGhhcykgfSxcbiAgICAgICAgICBzZXRfX186ICAgIHsgdmFsdWU6IGNvbnN0RnVuYyhkc2V0KSB9LFxuICAgICAgICAgIGRlbGV0ZV9fXzogeyB2YWx1ZTogY29uc3RGdW5jKGRkZWxldGUpIH0sXG4gICAgICAgICAgcGVybWl0SG9zdE9iamVjdHNfX186IHsgdmFsdWU6IGNvbnN0RnVuYyhmdW5jdGlvbih0b2tlbikge1xuICAgICAgICAgICAgaWYgKHRva2VuID09PSB3ZWFrTWFwUGVybWl0SG9zdE9iamVjdHMpIHtcbiAgICAgICAgICAgICAgZW5hYmxlU3dpdGNoaW5nID0gdHJ1ZTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignYm9ndXMgY2FsbCB0byBwZXJtaXRIb3N0T2JqZWN0c19fXycpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0pfVxuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICAgIERvdWJsZVdlYWtNYXAucHJvdG90eXBlID0gT3VyV2Vha01hcC5wcm90b3R5cGU7XG4gICAgICBtb2R1bGUuZXhwb3J0cyA9IERvdWJsZVdlYWtNYXA7XG5cbiAgICAgIC8vIGRlZmluZSAuY29uc3RydWN0b3IgdG8gaGlkZSBPdXJXZWFrTWFwIGN0b3JcbiAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShXZWFrTWFwLnByb3RvdHlwZSwgJ2NvbnN0cnVjdG9yJywge1xuICAgICAgICB2YWx1ZTogV2Vha01hcCxcbiAgICAgICAgZW51bWVyYWJsZTogZmFsc2UsICAvLyBhcyBkZWZhdWx0IC5jb25zdHJ1Y3RvciBpc1xuICAgICAgICBjb25maWd1cmFibGU6IHRydWUsXG4gICAgICAgIHdyaXRhYmxlOiB0cnVlXG4gICAgICB9KTtcbiAgICB9KSgpO1xuICB9IGVsc2Uge1xuICAgIC8vIFRoZXJlIGlzIG5vIGhvc3QgV2Vha01hcCwgc28gd2UgbXVzdCB1c2UgdGhlIGVtdWxhdGlvbi5cblxuICAgIC8vIEVtdWxhdGVkIFdlYWtNYXBzIGFyZSBpbmNvbXBhdGlibGUgd2l0aCBuYXRpdmUgcHJveGllcyAoYmVjYXVzZSBwcm94aWVzXG4gICAgLy8gY2FuIG9ic2VydmUgdGhlIGhpZGRlbiBuYW1lKSwgc28gd2UgbXVzdCBkaXNhYmxlIFByb3h5IHVzYWdlIChpblxuICAgIC8vIEFycmF5TGlrZSBhbmQgRG9tYWRvLCBjdXJyZW50bHkpLlxuICAgIGlmICh0eXBlb2YgUHJveHkgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICBQcm94eSA9IHVuZGVmaW5lZDtcbiAgICB9XG5cbiAgICBtb2R1bGUuZXhwb3J0cyA9IE91cldlYWtNYXA7XG4gIH1cbn0pKCk7XG4iLCJcInVzZSBzdHJpY3RcIjtcclxuZXhwb3J0cy5EYXRhU2V0ID0gcmVxdWlyZSgnLi9jb3JlL0RhdGFTZXQnKTtcclxuZXhwb3J0cy5EYXRhVGFibGUgPSByZXF1aXJlKCcuL2NvcmUvRGF0YVRhYmxlJyk7XHJcbmV4cG9ydHMuRGF0YVZpZXcgPSByZXF1aXJlKCcuL2NvcmUvRGF0YVZpZXcnKTtcclxuZXhwb3J0cy5EYXRhUm93ID0gcmVxdWlyZSgnLi9jb3JlL0RhdGFSb3cnKTtcclxuZXhwb3J0cy5EYXRhUm93VmVyc2lvbiA9IHJlcXVpcmUoJy4vY29yZS9EYXRhUm93VmVyc2lvbicpO1xyXG5leHBvcnRzLkRhdGFSb3dTdGF0ZSA9IHJlcXVpcmUoJy4vY29yZS9EYXRhUm93U3RhdGUnKTtcclxuZXhwb3J0cy5EYXRhQ29sdW1uID0gcmVxdWlyZSgnLi9jb3JlL0RhdGFDb2x1bW4nKTtcclxuZXhwb3J0cy5EYXRhQ29sdW1uQ29uc3RyYWludCA9IHJlcXVpcmUoJy4vY29yZS9EYXRhQ29sdW1uQ29uc3RyYWludCcpO1xyXG5leHBvcnRzLkRhdGFDb2x1bW5Db2xsZWN0aW9uID0gcmVxdWlyZSgnLi9jb3JlL0RhdGFDb2x1bW5Db2xsZWN0aW9uJyk7XHJcbmV4cG9ydHMuRGF0YVJlbGF0aW9uID0gcmVxdWlyZSgnLi9jb3JlL0RhdGFSZWxhdGlvbicpO1xyXG5leHBvcnRzLnV0aWwgPSByZXF1aXJlKCcuL2NvcmUvVXRpbCcpO1xyXG5leHBvcnRzLkNvbW1hbmRCdWlsZGVyQmFzZSA9IHJlcXVpcmUoJy4vYWRhcHRlci9Db21tYW5kQnVpbGRlckJhc2UnKTtcclxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9YXJnYS5qcy5tYXAiXX0=
