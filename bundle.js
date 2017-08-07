'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var _ = require('lodash');

/*! *****************************************************************************
Copyright (c) Microsoft Corporation. All rights reserved.
Licensed under the Apache License, Version 2.0 (the "License"); you may not use
this file except in compliance with the License. You may obtain a copy of the
License at http://www.apache.org/licenses/LICENSE-2.0

THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
MERCHANTABLITY OR NON-INFRINGEMENT.

See the Apache Version 2.0 License for specific language governing permissions
and limitations under the License.
***************************************************************************** */
/* global Reflect, Promise */

var extendStatics = Object.setPrototypeOf ||
    ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
    function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };

function __extends(d, b) {
    extendStatics(d, b);
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
}

var EmptyObject = (function (_super) {
    __extends(EmptyObject, _super);
    function EmptyObject() {
    }
    return EmptyObject;
}(null));

var Dictionary = (function () {
    function Dictionary(values) {
        var _this = this;
        this._store = new EmptyObject();
        this.size = 0;
        if (values) {
            Object.keys(values).forEach(function (key) {
                _this.set(key, values[key]);
            });
        }
    }
    Dictionary.prototype.set = function (key, value) {
        if (!this.has(key)) {
            this.size++;
        }
        return this._store[_hash(key)] = value;
    };
    Dictionary.prototype.get = function (key, fallback) {
        if (this.has(key)) {
            return this._store[_hash(key)];
        }
        return fallback;
    };
    Dictionary.prototype.has = function (key) {
        return _hash(key) in this._store;
    };
    Dictionary.prototype.delete = function (key) {
        if (this.has(key)) {
            this.size--;
            return delete this._store[_hash(key)];
        }
        return false;
    };
    Dictionary.prototype.clear = function () {
        this._store = new EmptyObject();
        this.size = 0;
    };
    Dictionary.prototype.forEach = function (callback, thisArg) {
        for (var _key in this._store) {
            if (_key.substr(0, 1) === _magicString) {
                callback.call(thisArg, this._store[_key], _dehash(_key), this);
            }
        }
    };
    Dictionary.prototype.find = function (predicate, thisArg) {
        for (var _key in this._store) {
            if (_key.substr(0, 1) === _magicString) {
                if (predicate.call(thisArg, this._store[_key], _dehash(_key), this)) {
                    return this._store[_key];
                }
            }
        }
    };
    Dictionary.prototype.findKey = function (predicate, thisArg) {
        for (var _key in this._store) {
            if (_key.substr(0, 1) === _magicString) {
                if (predicate.call(thisArg, this._store[_key], _dehash(_key), this)) {
                    return _dehash(_key);
                }
            }
        }
    };
    return Dictionary;
}());
var _magicString = "~";
var _magicStringLength = _magicString.length;
function _hash(key) {
    return _magicString + key;
}
function _dehash(key) {
    return key.substr(_magicStringLength);
}

//import Dict = require('dict')
var KeyedDictionary = (function () {
    function KeyedDictionary(keyPath, values) {
        this.keyPath = keyPath;
        this._store = new Dictionary(values);
        this._getKey = _.property(keyPath);
    }
    Object.defineProperty(KeyedDictionary.prototype, "size", {
        get: function () {
            return this._store.size;
        },
        set: function (newSize) {
            // just in case dictjs changes to implement size setter
            this._store.size = newSize;
        },
        enumerable: true,
        configurable: true
    });
    KeyedDictionary.prototype.get = function (key) {
        return this._store.get(key);
    };
    KeyedDictionary.prototype.add = function (value) {
        var key;
        if (!this.has(key = this._getKey(value))) {
            this._store.set(key, value);
            return true;
        }
        else {
            return false;
        }
    };
    KeyedDictionary.prototype.has = function (key) {
        return this._store.has(key);
    };
    KeyedDictionary.prototype.delete = function (key) {
        return this._store.delete(key);
    };
    KeyedDictionary.prototype.clear = function () {
        return this._store.clear();
    };
    KeyedDictionary.prototype.find = function (predicate) {
        var self = this, result;
        this._store.forEach(function (val, key, dict) {
            if (predicate(val, key, self)) {
                result = val;
            }
        });
        return result;
    };
    KeyedDictionary.prototype.forEach = function (callback, thisArg) {
        var self = this;
        this._store.forEach(function (v, k, d) {
            callback.call(thisArg, v, k, self);
        }, thisArg);
    };
    return KeyedDictionary;
}());

var EventEmitter = (function () {
    function EventEmitter() {
    }
    EventEmitter.prototype.subscribe = function (listener) {
        if (typeof listener === "function") {
            (this._listeners || (this._listeners = [])).push(listener);
            var listenersArray_1 = this._listeners;
            return function unsubscribe() {
                unsubscribeListener(listener, listenersArray_1);
            };
        }
        else {
            throw new TypeError("listener must be of type: (EventArgs)=>void");
        }
    };
    EventEmitter.prototype.unsubscribe = function (listener) {
        unsubscribeListener(listener, this._listeners);
    };
    EventEmitter.prototype.publish = function (eventArgs) {
        for (var _i = 0, _a = (this._listeners || (this._listeners = [])); _i < _a.length; _i++) {
            var callback = _a[_i];
            callback.call(void 0, eventArgs);
        }
    };
    Object.defineProperty(EventEmitter.prototype, "count", {
        get: function () {
            return this._listeners.length;
        },
        enumerable: true,
        configurable: true
    });
    return EventEmitter;
}());
function unsubscribeListener(listener, listenersArray) {
    for (var index = 0; index < listenersArray.length; index++) {
        if (listenersArray[index] === listener) {
            listenersArray.splice(index, 1);
            // since a listener can subscribe multiple times,
            // keep iterating to remove all instances
            // (i.e. don't 'break')
        }
    }
}

// util/Functions.ts
var compareKeys;
if (typeof indexedDB !== "undefined") {
    compareKeys = indexedDB.cmp.bind(indexedDB);
}
else {
    compareKeys = function (keyA, keyB) {
        if (Array.isArray(keyA) && Array.isArray(keyB)) {
            var cmp = 0;
            for (var i = 0; i < keyA.length; i++) {
                cmp = compareKeys(keyA[i], keyB[i]);
                if (cmp !== 0) {
                    break;
                }
            }
            return cmp;
        }
        return (keyA < keyB ? -1 : keyA > keyB ? 1 : 0);
    };
}
function equalKeys(keyA, keyB) {
    var equals = true;
    if (Array.isArray(keyA) && Array.isArray(keyB)) {
        for (var i = 0; i < keyA.length; i++) {
            equals = equalKeys(keyA[i], keyB[i]);
            if (!equals) {
                break;
            }
        }
    }
    else {
        equals = keyA === keyB;
    }
    return equals;
}
function getValueAtKeyPath(sKeyPath, item) {
    sKeyPath = sanitizeKeyPath(sKeyPath);
    var keyPathArray = sKeyPath.split('.');
    return keyPathArray.reduce(function (prevResult, nextVal) {
        if (prevResult === void 0) {
            return void 0;
        }
        var value;
        if (typeof prevResult[nextVal] === "function") {
            value = prevResult[nextVal]();
        }
        else {
            value = prevResult[nextVal];
        }
        return value;
    }, item);
}
function setValueAtKeyPath(sKeyPath, item, value, extendProto) {
    if (extendProto === void 0) { extendProto = false; }
    var keyPath = sanitizeKeyPath(sKeyPath);
    var keyPathArray = keyPath.split('.');
    var lastMemberName = keyPathArray.pop();
    var penultimentMember = keyPathArray.reduce(function (member, nextMemberName) {
        if (member[nextMemberName] === void 0) {
            member[nextMemberName] = {};
        }
        else {
            if (typeof member[nextMemberName] === "object") {
                if (!member.hasOwnProperty(nextMemberName)) {
                    member[nextMemberName] = Object.create(member[nextMemberName]);
                }
            }
        }
        return member[nextMemberName];
    }, item);
    return !!(penultimentMember[lastMemberName] = value);
}
function createKeyPathGetter(sKeyPath) {
    var keyPath = sanitizeKeyPath(sKeyPath);
    var keyPathArray = keyPath.split('.');
    return function getter(item) {
        return resolveKeyPathArray(keyPathArray, item);
    };
}
function createKeyPathSetter(sKeyPath, extendProto) {
    if (extendProto === void 0) { extendProto = false; }
    return function setter(item, value) {
        return setValueAtKeyPath(sKeyPath, item, value);
    };
}
function sanitizeKeyPath(sKeyPath) {
    if (sKeyPath === void 0) {
        sKeyPath = "";
    }
    var sanitizedArray = sKeyPath.split('.').map(function (value) { return value.trim(); });
    /*
    if(toArray){
        return sanitizedArray.join('.');
    }
    //*/
    return sanitizedArray.join('.');
}
function resolveKeyPath(sKeyPath, obj) {
    console.warn("util.resolveKeyPath() is deprecated: use util.getValueAtKeyPath()");
    sKeyPath = sKeyPath || "";
    var path = sKeyPath.split('.');
    return resolveKeyPathArray(path, obj);
}
function resolveKeyPathArray(aKeyPathArray, obj) {
    return aKeyPathArray.reduce(function (prevResult, nextVal) {
        if (prevResult === void 0) {
            return void 0;
        }
        var value;
        if (typeof prevResult[nextVal] === "function") {
            value = prevResult[nextVal]();
        }
        else {
            value = prevResult[nextVal];
        }
        return value;
    }, obj);
}
function createValueWithKeyPath(value, sKeyPath) {
    var keyPathArray = sKeyPath.split('.');
    return keyPathArray.reduceRight(function (prevValue, key, curIndex, array) {
        var wrappedValue = {};
        wrappedValue[key] = prevValue;
        return wrappedValue;
    }, value);
}
function deepCopy(value) {
    return (typeof value === "object") ? flattenPrototypeChain(value) : value;
}
function flattenPrototypeChain(obj, depth, doNotCopy) {
    //
    if (obj === null) {
        return null;
    }
    var copyObj = Array.isArray(obj) ? [] : Object.create(null);
    doNotCopy = Array.isArray(doNotCopy) ? doNotCopy : new Array();
    depth = depth || 10;
    if (doNotCopy.indexOf(obj) < 0) {
        doNotCopy.push(obj);
    }
    for (var key in obj) {
        var value = obj[key];
        if (typeof value === "object") {
            if (doNotCopy.indexOf(value) < 0) {
                copyObj[key] = flattenPrototypeChain(value, depth - 1, doNotCopy);
            }
            else {
                console.warn("circular reference in obj:" + obj);
            }
        }
        else {
            copyObj[key] = value;
        }
    }
    return copyObj;
}
function deserializeString(value) {
    return JSON.parse(value);
}
function createUUID() {
    var uuid = '0';
    for (var i = 0; i < 12; i++) {
        uuid += '0';
    }
    return uuid;
}

// Util.ts
// Utilities used by arga.js
//export { KeyedCollection } from './KeyedCollection'



var coreUtil = Object.freeze({
	KeyedDictionary: KeyedDictionary,
	EmptyObject: EmptyObject,
	Dictionary: Dictionary,
	EventEmitter: EventEmitter,
	get compareKeys () { return compareKeys; },
	equalKeys: equalKeys,
	resolveKeyPath: resolveKeyPath,
	resolveKeyPathArray: resolveKeyPathArray,
	createValueWithKeyPath: createValueWithKeyPath,
	deepCopy: deepCopy,
	flattenPrototypeChain: flattenPrototypeChain,
	getValueAtKeyPath: getValueAtKeyPath,
	setValueAtKeyPath: setValueAtKeyPath,
	createKeyPathGetter: createKeyPathGetter,
	createKeyPathSetter: createKeyPathSetter,
	createUUID: createUUID,
	deserializeString: deserializeString
});

// DataTableCollection.ts
var DataTableCollection = (function (_super) {
    __extends(DataTableCollection, _super);
    function DataTableCollection(dataSet) {
        var _this = _super.call(this, 'name') || this;
        _this.dataSet = dataSet;
        if (dataSet === void 0) {
            throw new Error("Illegal DataTableCollection constructor: expected DataSet as first argument");
        }
        return _this;
    }
    DataTableCollection.prototype.add = function (table) {
        var added = _super.prototype.add.call(this, table);
        if (added) {
            table._addTableToCollection(this);
        }
        return added;
    };
    return DataTableCollection;
}(KeyedDictionary));

// DataRelationCollection.ts
var DataRelationCollection = (function (_super) {
    __extends(DataRelationCollection, _super);
    function DataRelationCollection(dataSet) {
        var _this = this;
        if (dataSet == null) {
            throw new Error("Illegal DataRealtionCollection constructor: expected DataTable as first argument");
        }
        _this = _super.call(this, 'name') || this;
        _this._dataSet = dataSet;
        return _this;
    }
    Object.defineProperty(DataRelationCollection.prototype, "dataSet", {
        get: function () {
            return this._dataSet;
        },
        enumerable: true,
        configurable: true
    });
    DataRelationCollection.prototype.add = function (relation) {
        if (_super.prototype.add.call(this, relation)) {
            return relation._addRelationToCollection(this);
        }
        return false;
    };
    return DataRelationCollection;
}(KeyedDictionary));

// DataSet.ts
var ds_counter = 0;
var DataSet = (function () {
    function DataSet(name) {
        this.name = name;
        this._tables = new DataTableCollection(this);
        this._relations = new DataRelationCollection(this);
        ds_counter++;
        this.name = name || "Set " + ds_counter;
    }
    Object.defineProperty(DataSet.prototype, "tables", {
        get: function () {
            return this._tables;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(DataSet.prototype, "relations", {
        get: function () {
            return this._relations;
        },
        enumerable: true,
        configurable: true
    });
    DataSet.prototype.acceptChanges = function () {
        this._tables.forEach(function (table) {
            table.acceptChanges();
        });
    };
    
    DataSet.prototype.getChanges = function () {
    };
    
    return DataSet;
}());

// DataType.ts
var GenericDataType = (function () {
    function GenericDataType(typeOrOptions) {
        var options = typeOrOptions;
        if (options && options.serialize) {
            this.serialize = options.serialize;
        }
        if (options && options.deserialize) {
            this.deserialize = options.deserialize;
        }
    }
    GenericDataType.prototype.serialize = function (value) {
        return value.toString();
    };
    GenericDataType.prototype.deserialize = function (string) {
        return JSON.parse(string);
    };
    GenericDataType.getType = function (typeName) {
        switch (typeName) {
            case "string": return GenericDataType.StringType;
            case "number": return GenericDataType.NumberType;
            case "object": return GenericDataType.ObjectType;
            case "any":
            default:
                return new GenericDataType();
        }
    };
    GenericDataType.StringType = new GenericDataType({
        serialize: function (value) { return value.toString(); },
        deserialize: function (value) { return deserializeString(value); }
    });
    GenericDataType.NumberType = new GenericDataType();
    GenericDataType.ObjectType = new GenericDataType();
    GenericDataType.AnyType = new GenericDataType();
    return GenericDataType;
}());
var DataType = GenericDataType;

// DataColumn.ts
//import { EventEmitter2 as EventEmitter } from 'EventEmitter2'
var GenericDataColumn = (function () {
    /** TODO */
    // private _constraints: DataColumnConstraint[]
    function GenericDataColumn(name, keyPath, type) {
        if (keyPath === void 0) { keyPath = name; }
        if (type === void 0) { type = DataType.AnyType; }
        this.name = name;
        this.keyPath = keyPath;
        this.type = type;
        this.onValueChanged = new EventEmitter();
    }
    GenericDataColumn.prototype.getValue = function (data, row) {
        return _.get(data, this.keyPath);
    };
    GenericDataColumn.prototype.setValue = function (data, newValue, row) {
        var oldValue = this.getValue(data, row);
        _.set(data, this.keyPath, newValue);
        // let DataRow publish the onValueChanged event
        return true;
    };
    GenericDataColumn.prototype.hasValue = function (data, row) {
        return _.has(data, this.keyPath);
    };
    GenericDataColumn.prototype.deleteValue = function (data, row) {
        return this.setValue(data, null, row);
    };
    Object.defineProperty(GenericDataColumn.prototype, "table", {
        get: function () {
            return this._table;
        },
        set: function (dataTable) {
            this._table = dataTable;
        },
        enumerable: true,
        configurable: true
    });
    GenericDataColumn.prototype.findId = function (value) {
        var self = this;
        var row = this.table.rows.find(function (row) {
            return equalKeys(value, row.get(self));
        });
        return row._id;
    };
    GenericDataColumn.prototype.find = function (value) {
        if (this._table) {
            var row = void 0;
            var iterator = this._table.rows.iterate();
            var result = void 0;
            while (!(result = iterator.next()).done) {
                row = result.value;
                if (equalKeys(value, row.get(this))) {
                    return row;
                }
            }
        }
    };
    GenericDataColumn.prototype.findAll = function (value) {
        if (this._table) {
            var foundRows_1 = [];
            var self = this;
            this.table.rows.forEach(function (row) {
                if (equalKeys(value, row.get(self))) {
                    foundRows_1.push(row);
                }
            });
            return foundRows_1;
        }
    };
    /**
     * @internal
     * Prepare column to be added to DataColumnCollection
     */
    GenericDataColumn.prototype._addColumnToCollection = function (collection) {
        if (this._table = collection.table) {
            return true;
        }
        return false;
    };
    GenericDataColumn.prototype.toString = function () {
        return "DataColumn(keyPath:\"" + this.keyPath + "\")";
    };
    return GenericDataColumn;
}());
var DataColumn = GenericDataColumn;

// DataColumnCollection.ts
var DataColumnCollection = (function (_super) {
    __extends(DataColumnCollection, _super);
    //private _columns: DataColumn<any>[];
    function DataColumnCollection(dataTable) {
        var _this = _super.call(this, 'name') || this;
        if (dataTable === void 0) {
            throw new Error("Illegal DataColumnCollection constructor: expected DataTable as first argument");
        }
        _this._table = dataTable;
        return _this;
        //this._columns = new Array<DataColumn<any>>();
    }
    DataColumnCollection.prototype.add = function (columnOrName) {
        var column = (typeof columnOrName == "string") ? new DataColumn(columnOrName) : columnOrName;
        var added = _super.prototype.add.call(this, column);
        if (added) {
            column._addColumnToCollection(this);
        }
        return added;
    };
    Object.defineProperty(DataColumnCollection.prototype, "table", {
        get: function () {
            return this._table;
        },
        enumerable: true,
        configurable: true
    });
    return DataColumnCollection;
}(KeyedDictionary));

// DataRowState.ts

(function (DataRowState) {
    DataRowState[DataRowState["DETACHED"] = 1] = "DETACHED";
    DataRowState[DataRowState["UNCHANGED"] = 2] = "UNCHANGED";
    DataRowState[DataRowState["ADDED"] = 4] = "ADDED";
    DataRowState[DataRowState["MODIFIED"] = 8] = "MODIFIED";
    DataRowState[DataRowState["DELETED"] = 16] = "DELETED";
})(exports.DataRowState || (exports.DataRowState = {}));

// DataRowVersion.ts

(function (DataRowVersion) {
    DataRowVersion[DataRowVersion["ORIGINAL"] = 0] = "ORIGINAL";
    DataRowVersion[DataRowVersion["CURRENT"] = 1] = "CURRENT";
    DataRowVersion[DataRowVersion["PROPOSED"] = 2] = "PROPOSED";
    DataRowVersion[DataRowVersion["DEFAULT"] = 3] = "DEFAULT";
})(exports.DataRowVersion || (exports.DataRowVersion = {}));

// DataRow.js
//import Dict = require('dict');
var DataRow = (function () {
    function DataRow(values) {
        this._id = _.uniqueId();
        /**
         * _original is set to undefined, and
         * _current is an empty object so we
         * start off as DataRowState.ADDED
         */
        this._original = void 0;
        this._current = this._createCurrent();
        for (var key in values) {
            this.set(key, values[key]);
        }
    }
    Object.defineProperty(DataRow.prototype, "table", {
        get: function () {
            return this._table;
        },
        set: function (table) {
            if (table instanceof DataTable) {
                this._table = table;
            }
            throw new TypeError("table is not a DataTable");
        },
        enumerable: true,
        configurable: true
    });
    DataRow.prototype._createOriginal = function () {
        return new EmptyObject();
    };
    DataRow.prototype._createCurrent = function () {
        return Object.create(this._original || null);
    };
    DataRow.prototype._createProposed = function () {
        return Object.create(this._current || null);
    };
    Object.defineProperty(DataRow.prototype, "rowState", {
        /**
         * The DataRowState that this row is currently in
         * @return {DataRowState} rowState - the current DataRowState
         */
        get: function () {
            /**
             * _______________________________________________
             *|   _table  |  _current | _original |   state   |
             *|-----------|-----------|-----------|-----------|
             *| undefined | undefined | undefined |  DETACHED |
             *| undefined | undefined |     {}    |  DETACHED |
             *| undefined |    null   | undefined |  DETACHED |
             *| undefined |    null   |     {}    |  DETACHED |
             *| undefined |     {}    | undefined |  DETACHED |
             *| undefined |     {}    |     {}    |  DETACHED |
             *| DataTable | undefined | undefined |     ??    |
             *| DataTable | undefined |     {}    | UNCHANGED |
             *| DataTable |    null   | undefined |  DELETED  | should be deleted immediately without waiting for 'acceptChanges()'
             *| DataTable |    null   |     {}    |  DELETED  |
             *| DataTable |     {}    | undefined |   ADDED   |
             *| DataTable |     {}    |     {}    |  MODIFIED |
             *|___________|___________|___________|___________|
             */
            if (this._table != null) {
                if (this._current === void 0) {
                    return exports.DataRowState.UNCHANGED;
                }
                if (this._current === null) {
                    return exports.DataRowState.DELETED;
                }
                return this._original ? exports.DataRowState.MODIFIED : exports.DataRowState.ADDED;
            }
            return exports.DataRowState.DETACHED;
        },
        enumerable: true,
        configurable: true
    });
    DataRow.prototype.has = function (keyOrColumn, version) {
        var store;
        if (store = this._getVersion(version)) {
            if (isDataColumn(keyOrColumn)) {
                return !!keyOrColumn.getValue(store, this);
            }
            // keyOrColumn is a column name
            var column = void 0;
            if (this.rowState ^ exports.DataRowState.DETACHED) {
                return (column = this._getColumnWithName(keyOrColumn)) ?
                    column.hasValue(store, this) : false;
            }
            // row is DETACHED, so check the cache
            return this._detachedCache && this._detachedCache.has(keyOrColumn);
        }
        // the store doesn't exist
        return false;
    };
    DataRow.prototype._getColumnWithName = function (key) {
        if (this.rowState & exports.DataRowState.DETACHED) {
            return;
        }
        if (this._table) {
            return this._table.columns.get(key);
        }
    };
    DataRow.prototype.get = function (columnOrName, version) {
        var _this = this;
        if (typeof columnOrName === "string") {
            return this._getItemWithKey(columnOrName, version);
        }
        if (Array.isArray(columnOrName)) {
            return columnOrName.map(function (column) { return _this.get(column); });
        }
        return this._getItemWithColumn(columnOrName, version);
    };
    DataRow.prototype._getItemWithKey = function (key, version) {
        if (this.rowState & exports.DataRowState.DETACHED) {
            return this._getFromCache(key);
        }
        var store = this._getVersion(version);
        if (store != null) {
            return this.table.columns.get(key).getValue(store, this);
        }
    };
    DataRow.prototype._getItemWithColumn = function (column, version) {
        var data = this._getVersion(version);
        if (data != null) {
            return column.getValue(data, this);
        }
    };
    DataRow.prototype._getVersion = function (version) {
        if (version === void 0) { version = exports.DataRowVersion.DEFAULT; }
        switch (version) {
            case exports.DataRowVersion.DEFAULT:
                if (this.isEditing()) {
                    return this._proposed ||
                        (this._proposed = this._createProposed());
                }
                else {
                    return this._current ||
                        (this._current = this._createCurrent());
                }
            case exports.DataRowVersion.CURRENT:
                return this._current;
            case exports.DataRowVersion.ORIGINAL:
                return this._original;
            case exports.DataRowVersion.PROPOSED:
                return this._proposed;
            default:
                throw new Error("DataRowVersion {" + version + "} is not recognized");
        }
    };
    DataRow.prototype._getFromCache = function (key) {
        var dict = this._detachedCache || (this._detachedCache = new Dictionary());
        return dict.get(key);
    };
    DataRow.prototype.set = function (valsOrKeyOrColumn, value) {
        switch (typeof valsOrKeyOrColumn) {
            case "string":
                return this._setItemWithKey(valsOrKeyOrColumn, value);
            case "object":
                if (isDataColumn(valsOrKeyOrColumn)) {
                    return valsOrKeyOrColumn.setValue(this._getVersion(), value, this);
                }
                else {
                    return this._setItems(valsOrKeyOrColumn);
                }
        }
        throw new TypeError("invalid arguments passed to DataRow#set: " +
            valsOrKeyOrColumn);
    };
    DataRow.prototype._setItems = function (values) {
        var success = true;
        for (var key in values) {
            success = success && this._setItemWithKey(key, values[key]);
        }
        return success;
    };
    /**
     * @todo
     */
    DataRow.prototype._setItemWithColumn = function (column, value) {
        var store = this.isEditing() ?
            this._proposed : this._current ||
            (this._current = this._createCurrent());
        var oldValue = column.getValue(store, this);
        if (column.setValue(store, value, this)) {
            column.onValueChanged.publish({
                row: this,
                column: column,
                oldValue: oldValue,
                newValue: value
            });
            return true;
        }
        return false;
    };
    DataRow.prototype._setItemWithKey = function (key, value) {
        var state = this.rowState;
        /**
         * bitwise check (&) in case rowState() is
         * changed to return a set of flags in
         * future versions
         */
        if (state & exports.DataRowState.DELETED) {
            throw new Error("Row already deleted");
        }
        /**
         * if DataRow hasn't been added to a
         * DataRowCollection yet, cache the
         * key(i.e. ColumnName) and value to
         * be set when the row is added.
         */
        if (state & exports.DataRowState.DETACHED) {
            return this._setOnCache(key, value);
        }
        /**
         * search for column on parent table
         * and use it to set the value;
         */
        var table, column;
        if (table = this.table) {
            if (column = table.columns.get(key)) {
                return this._setItemWithColumn(column, value);
            }
            else {
                /**
                 * if the column could not be found on the table
                 * we create one with that key, add it to the table,
                 * and use it to set the value
                 */
                column = new DataColumn(key);
                if (table.columns.add(column)) {
                    return this._setItemWithColumn(column, value);
                }
            }
        }
        else {
            // somehow the row is not DETACHED but the table is not defined
            throw new Error("Cannot find DataRow#table");
        }
    };
    DataRow.prototype._setOnCache = function (key, value) {
        var dict = this._detachedCache || (this._detachedCache = new Dictionary());
        if (dict.set(key, value)) {
            return true;
        }
        return false;
    };
    DataRow.prototype.del = function (keyOrColumn) {
        var column = keyOrColumn instanceof DataColumn ?
            keyOrColumn : this._getColumnWithName(keyOrColumn);
        if (this.has(column)) {
            return column.deleteValue(this._getVersion(), this);
        }
        return false;
    };
    /**
     * @internal
     * Called to prepare row to be deleted
     */
    DataRow.prototype._onDelete = function () {
        if (this.isEditing()) {
            this._proposed = null;
        }
        else {
            this._current = null;
        }
    };
    /**
     * @internal
     * Called to ensure row doesn't cause memory leak
     */
    DataRow.prototype._free = function () {
        this._original = null;
        this._current = null;
        this._proposed = null;
        this._table = null;
        this._detachedCache = null;
    };
    DataRow.prototype.getChildRows = function (relation) {
        return relation.getChildRows(this);
    };
    DataRow.prototype.getParentRow = function (relation) {
        return relation.getParentRow(this);
    };
    /**
   * @todo
   */
    DataRow.prototype.setParentRow = function (relation) {
    };
    DataRow.prototype.beginEdit = function () {
        if (this.isEditing()) {
            throw new Error("already editing");
        }
        this._proposed = this._createProposed();
    };
    DataRow.prototype.isEditing = function () {
        return !!this._proposed;
    };
    DataRow.prototype.endEdit = function () {
        var self = this;
        Object.keys(this._proposed).forEach(function (key) {
            self._current[key] = self._proposed[key];
        });
        delete this._proposed;
    };
    DataRow.prototype.acceptChanges = function () {
        if (this.isEditing()) {
            this.endEdit();
        }
        /**
         * copy all the changes from _current onto _original,
         */
        this._original = deepCopy(this._current) || this._createOriginal();
        this._current = void 0;
    };
    DataRow.prototype.rejectChanges = function () {
        if (this.isEditing()) {
            this.endEdit();
        }
        delete this._current;
    };
    /**
     * @internal
     * Semi-private (i.e. friendly?) method for adding row
     * to a collection. Used by DataRowCollection#add()
     */
    DataRow.prototype._addRowToCollection = function (collection) {
        // set the reference to the parent table 
        this._table = collection.table;
        var success = true;
        if (this._detachedCache) {
            // flush the cache
            var self_1 = this;
            this._detachedCache.forEach(function (value, key, dict) {
                success = success && self_1._setItemWithKey(key, value);
            });
            // cleanup cache to mitigate memory leaks
            this._detachedCache.clear();
            this._detachedCache = null;
            delete this._detachedCache;
        }
        return success;
    };
    DataRow.prototype.toString = function () {
        return "DataRow(" + JSON.stringify(this._getVersion()) + ")";
    };
    return DataRow;
}());
/* internal module methods */
function isDataColumn(dc) {
    return dc instanceof GenericDataColumn;
}

function createCommonjsModule(fn, module) {
	return module = { exports: {} }, fn(module, module.exports), module.exports;
}

var miniMap = MiniMap;
function MiniMap() {
    this.keys = [];
    this.values = [];
}

MiniMap.prototype.has = function (key) {
    var index = this.keys.indexOf(key);
    return index >= 0;
};

MiniMap.prototype.get = function (key) {
    var index = this.keys.indexOf(key);
    if (index >= 0) {
        return this.values[index];
    }
};

MiniMap.prototype.set = function (key, value) {
    var index = this.keys.indexOf(key);
    if (index < 0) {
        index = this.keys.length;
    }
    this.keys[index] = key;
    this.values[index] = value;
};

MiniMap.prototype["delete"] = function (key) {
    var index = this.keys.indexOf(key);
    if (index >= 0) {
        this.keys.splice(index, 1);
        this.values.splice(index, 1);
    }
};

MiniMap.prototype.clear = function () {
    this.keys.length = 0;
    this.values.length = 0;
};

var popEquals = createCommonjsModule(function (module) {
"use strict";


var getPrototypeOf = Object.getPrototypeOf;
var objectPrototype = Object.prototype;

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
*/
module.exports = equals;
function equals(a, b, equals, memo) {
    equals = equals || module.exports;
    // unbox objects
    if (a && typeof a.valueOf === "function") {
        a = a.valueOf();
    }
    if (b && typeof b.valueOf === "function") {
        b = b.valueOf();
    }
    if (a === b)
        return true;
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
        return false;
    if (typeof a === "object") {
        memo = memo || new miniMap();
        if (memo.has(a)) {
            return true;
        }
        memo.set(a, true);
    }
    if (typeof a.equals === "function") {
        return a.equals(b, equals, memo);
    }
    // commutative
    if (typeof b.equals === "function") {
        return b.equals(a, equals, memo);
    }
    if ((Array.isArray(a) || Array.isArray(b)) && a.length !== b.length) {
        return false;
    }
    if (typeof a === "object" && typeof b === "object") {
        if (
            getPrototypeOf(a) === objectPrototype &&
            getPrototypeOf(b) === objectPrototype ||
            Array.isArray(a) ||
            Array.isArray(b)
        ) {
            for (var name in a) {
                if (!equals(a[name], b[name], equals, memo)) {
                    return false;
                }
            }
            for (var name in b) {
                if (!(name in a)) {
                    return false;
                }
            }
            return true;
        }
    }
    return false;
}

// Because a return value of 0 from a `compare` function  may mean either
// "equals" or "is incomparable", `equals` cannot be defined in terms of
// `compare`.  However, `compare` *can* be defined in terms of `equals` and
// `lessThan`.  Again however, more often it would be desirable to implement
// all of the comparison functions in terms of compare rather than the other
// way around.
});

var popCompare = createCommonjsModule(function (module) {
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
*/
module.exports = compare;
function compare(a, b, compare) {
    var difference;
    // unbox objects
    // mercifully handles the Date case
    if (a && typeof a.valueOf === "function") {
        a = a.valueOf();
    }
    if (b && typeof b.valueOf === "function") {
        b = b.valueOf();
    }
    // x !== x is only true if x is NaN. NaN is "incomparable" and both
    // equivalent and incomparable values always return 0.
    if (a === b || a !== a || b !== b)
        return 0;
    var aType = typeof a;
    var bType = typeof b;
    if (aType === "number" && bType === "number")
        return a - b;
    if (aType === "string" && bType === "string")
        return a < b ? -Infinity : Infinity;
        // the possibility of equality elimiated above
    compare = compare || module.exports;
    if (Array.isArray(a) && Array.isArray(b)) {
        for (var index in a) {
            if (!(index in b)) {
                return Infinity;
            } else {
                difference = compare(a[index], b[index], compare);
                if (difference) {
                    return difference;
                }
            }
        }
        for (var index in b) {
            if (!(index in a)) {
                return -Infinity;
            }
        }
        return a.length - b.length;
    }
    if (a && typeof a.compare === "function")
        return a.compare(b, compare);
    // not commutative, the relationship is reversed
    if (b && typeof b.compare === "function")
        return -b.compare(a, compare);
    return 0;
}
});

var getPrototypeOf = Object.getPrototypeOf;
var objectPrototype = Object.prototype;

/**
 * Creates a deep copy of any value.  Values, being immutable, are returned
 * without alternation.  Forwards to <code>clone</code> on objects and arrays.
 *
 * @function clone
 * @param {Any} value a value to clone
 * @param {Number} depth an optional traversal depth, defaults to infinity.  A
 * value of <code>0</code> means to make no clone and return the value
 * directly.
 * @param {Map} memo an optional memo of already visited objects to preserve
 * reference cycles.  The cloned object will have the exact same shape as the
 * original, but no identical objects.  Te map may be later used to associate
 * all objects in the original object graph with their corresponding member of
 * the cloned graph.
 * @returns a copy of the value
 */
var popClone = cloneOperator;
function cloneOperator(value, depth, memo) {
    if (value && value.valueOf) {
        value = value.valueOf();
    }
    if (depth == null) { // null or undefined
        depth = Infinity;
    } else if (depth === 0) {
        return value;
    }
    if (value && typeof value === "object") {
        memo = memo || new miniMap();
        if (!memo.has(value)) {
            if (value && typeof value.clone === "function") {
                memo.set(value, value.clone(depth, memo));
            } else {
                var isArray = Array.isArray(value);
                var prototype = getPrototypeOf(value);
                if (
                    isArray ||
                    prototype === null ||
                    prototype === objectPrototype
                ) {
                    var clone = isArray ? [] : {};
                    memo.set(value, clone);
                    for (var key in value) {
                        clone[key] = cloneOperator(
                            value[key],
                            depth - 1,
                            memo
                        );
                    }
                } else {
                    throw new Error("Can't clone " + value);
                }
            }
        }
        return memo.get(value);
    }
    return value;
}

// Unzip is also known as a matrix transpose, operating exclusively on arrays.

var unzip_1 = unzip;
function unzip(table) {
    var transpose = [];
    var rows = table.length;
    var row, columns, length;
    var index, jndex;

    // Mathematically, the degenerate case is an empty array where each inner
    // value would be of infinite length.
    if (!rows) {
        // Within this array, the nothingness is infinite.
        return [];
    }

    columns = table[0].length;
    length = Infinity;

    // Find the shortest row, this will be the length of the transpose.
    for (index = 0; index < rows; index++) {
        row = table[index];
        if (row.length < length) {
            length = row.length;
        }
    }

    // Populate the transpose.
    for (index = 0; index < length; index++) {
        row = transpose[index] = [];
        for (jndex = 0; jndex < rows; jndex++) {
            row[jndex] = table[jndex][index];
        }
    }

    return transpose;
}

// Polymorphic unzip uses collection.toArray() (for non-array collection
// implementations) to convert the table or any of its rows into array before
// passing them along to the non-polymorphic unzip.

var popUnzip_1 = popUnzip;
function popUnzip(table) {
    if (typeof table.unzip === 'function') {
        return table.unzip();
    }
    // Ensure that the table we pass to the non-polymorphic unzip is an array
    // of arrays.
    // However, only construct a new table if necessary.
    var arrayTable;
    if (!Array.isArray(table)) {
        table = arrayTable = table.toArray();
    }
    for (var index = 0, length = table.length; index < length; index++) {
        var row = table[index];
        if (!Array.isArray(row)) {
            // Construct a copy of the table in which to replace non-array
            // values.
            if (!arrayTable) {
                // Table is known to be an array because we would have replaced
                // it already otherwise.
                arrayTable = table.slice();
            }
            arrayTable[index] = row.toArray();
        }
    }
    return unzip_1(arrayTable || table);
}

var genericCollection = GenericCollection;
function GenericCollection() {
    throw new Error("Can't construct. GenericCollection is a mixin.");
}

GenericCollection.prototype.addEach = function (values) {
    if (values && Object(values) === values) {
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
    equals = equals || popEquals;
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
    return this.map(identity);
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
    var iterator = this.iterate();
    while (true) {
        var iteration = iterator.next();
        if (iteration.done) {
            return true;
        } else if (!callback.call(thisp, iteration.value, iteration.index, this)) {
            return false;
        }
    }
};

GenericCollection.prototype.some = function (callback /*, thisp*/) {
    var thisp = arguments[1];
    var iterator = this.iterate();
    while (true) {
        var iteration = iterator.next();
        if (iteration.done) {
            return false;
        } else if (callback.call(thisp, iteration.value, iteration.index, this)) {
            return true;
        }
    }
};

GenericCollection.prototype.min = function (compare) {
    compare = compare || this.contentCompare || popCompare;
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
    compare = compare || this.contentCompare || popCompare;
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
    return popUnzip_1(table);
};

GenericCollection.prototype.join = function (delimiter) {
    return this.reduce(function (result, string) {
        return result + delimiter + string;
    });
};

GenericCollection.prototype.sorted = function (compare, by, order) {
    compare = compare || this.contentCompare || popCompare;
    // account for comparators generated by Function.by
    if (compare.by) {
        by = compare.by;
        compare = compare.compare || this.contentCompare || popCompare;
    } else {
        by = by || identity;
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

GenericCollection.prototype.clone = function (depth, memo, clone) {
    if (depth === undefined) {
        depth = Infinity;
    } else if (depth === 0) {
        return this;
    }
    clone = clone || popClone;
    var collection = this.constructClone();
    this.forEach(function (value, key) {
        collection.add(clone(value, depth - 1, memo), key);
    }, this);
    return collection;
};

GenericCollection.prototype.only = function () {
    if (this.length === 1) {
        return this.one();
    }
};

function identity(value) { return value; }

// XXX Note: exceptions thrown from handlers and handler cancelers may
// interfere with dispatching to subsequent handlers of any change in progress.
// It is unlikely that plans are recoverable once an exception interferes with
// change dispatch. The internal records should not be corrupt, but observers
// might miss an intermediate property change.

var owns = Object.prototype.hasOwnProperty;

var observerFreeList$1 = [];
var observerToFreeList$1 = [];
var dispatching$1 = false;

// Reusable property descriptor
var hiddenValueProperty = {
    value: null,
    writable: true,
    enumerable: false,
    configurable: true
};

var observableObject = ObservableObject;
function ObservableObject() {
    throw new Error("Can't construct. ObservableObject is a mixin.");
}

ObservableObject.prototype.observePropertyChange = function (name, handler, note, capture) {
    return observePropertyChange(this, name, handler, note, capture);
};

ObservableObject.prototype.observePropertyWillChange = function (name, handler, note) {
    return observePropertyWillChange(this, name, handler, note);
};

ObservableObject.prototype.dispatchPropertyChange = function (name, plus, minus, capture) {
    return dispatchPropertyChange(this, name, plus, minus, capture);
};

ObservableObject.prototype.dispatchPropertyWillChange = function (name, plus, minus) {
    return dispatchPropertyWillChange(this, name, plus, minus);
};

ObservableObject.prototype.getPropertyChangeObservers = function (name, capture) {
    return getPropertyChangeObservers(this, name, capture);
};

ObservableObject.prototype.getPropertyWillChangeObservers = function (name) {
    return getPropertyWillChangeObservers(this, name);
};

ObservableObject.prototype.makePropertyObservable = function (name) {
    return makePropertyObservable$1(this, name);
};

ObservableObject.prototype.preventPropertyObserver = function (name) {
    return preventPropertyObserver(this, name);
};

ObservableObject.prototype.PropertyChangeObserver = PropertyChangeObserver;

// Constructor interface with polymorphic delegation if available

ObservableObject.observePropertyChange = function (object, name, handler, note, capture) {
    if (object.observePropertyChange) {
        return object.observePropertyChange(name, handler, note, capture);
    } else {
        return observePropertyChange(object, name, handler, note, capture);
    }
};

ObservableObject.observePropertyWillChange = function (object, name, handler, note) {
    if (object.observePropertyWillChange) {
        return object.observePropertyWillChange(name, handler, note);
    } else {
        return observePropertyWillChange(object, name, handler, note);
    }
};

ObservableObject.dispatchPropertyChange = function (object, name, plus, minus, capture) {
    if (object.dispatchPropertyChange) {
        return object.dispatchPropertyChange(name, plus, minus, capture);
    } else {
        return dispatchPropertyChange(object, name, plus, minus, capture);
    }
};

ObservableObject.dispatchPropertyWillChange = function (object, name, plus, minus) {
    if (object.dispatchPropertyWillChange) {
        return object.dispatchPropertyWillChange(name, plus, minus);
    } else {
        return dispatchPropertyWillChange(object, name, plus, minus);
    }
};

ObservableObject.makePropertyObservable = function (object, name) {
    if (object.makePropertyObservable) {
        return object.makePropertyObservable(name);
    } else {
        return makePropertyObservable$1(object, name);
    }
};

ObservableObject.preventPropertyObserver = function (object, name) {
    if (object.preventPropertyObserver) {
        return object.preventPropertyObserver(name);
    } else {
        return preventPropertyObserver(object, name);
    }
};

// Implementation

function observePropertyChange(object, name, handler, note, capture) {
    ObservableObject.makePropertyObservable(object, name);
    var observers = getPropertyChangeObservers(object, name, capture);

    var observer;
    if (observerFreeList$1.length) { // TODO && !debug?
        observer = observerFreeList$1.pop();
    } else {
        observer = new PropertyChangeObserver();
    }

    observer.object = object;
    observer.propertyName = name;
    observer.capture = capture;
    observer.observers = observers;
    observer.handler = handler;
    observer.note = note;
    observer.value = object[name];

    // Precompute dispatch method names.

    var stringName = "" + name; // Array indicides must be coerced to string.
    var propertyName = stringName.slice(0, 1).toUpperCase() + stringName.slice(1);

    if (!capture) {
        var specificChangeMethodName = "handle" + propertyName + "PropertyChange";
        var genericChangeMethodName = "handlePropertyChange";
        if (handler[specificChangeMethodName]) {
            observer.handlerMethodName = specificChangeMethodName;
        } else if (handler[genericChangeMethodName]) {
            observer.handlerMethodName = genericChangeMethodName;
        } else if (handler.call) {
            observer.handlerMethodName = null;
        } else {
            throw new Error("Can't arrange to dispatch " + JSON.stringify(name) + " property changes on " + object);
        }
    } else {
        var specificWillChangeMethodName = "handle" + propertyName + "PropertyWillChange";
        var genericWillChangeMethodName = "handlePropertyWillChange";
        if (handler[specificWillChangeMethodName]) {
            observer.handlerMethodName = specificWillChangeMethodName;
        } else if (handler[genericWillChangeMethodName]) {
            observer.handlerMethodName = genericWillChangeMethodName;
        } else if (handler.call) {
            observer.handlerMethodName = null;
        } else {
            throw new Error("Can't arrange to dispatch " + JSON.stringify(name) + " property changes on " + object);
        }
    }

    observers.push(observer);

    // TODO issue warnings if the number of handler records exceeds some
    // concerning quantity as a harbinger of a memory leak.
    // TODO Note that if this is garbage collected without ever being called,
    // it probably indicates a programming error.
    return observer;
}

function observePropertyWillChange(object, name, handler, note) {
    return observePropertyChange(object, name, handler, note, true);
}

function dispatchPropertyChange(object, name, plus, minus, capture) {
    if (!dispatching$1) { // TODO && !debug?
        return startPropertyChangeDispatchContext(object, name, plus, minus, capture);
    }
    var observers = getPropertyChangeObservers(object, name, capture).slice();
    for (var index = 0; index < observers.length; index++) {
        var observer = observers[index];
        observer.dispatch(plus, minus);
    }
}

function dispatchPropertyWillChange(object, name, plus, minus) {
    dispatchPropertyChange(object, name, plus, minus, true);
}

function startPropertyChangeDispatchContext(object, name, plus, minus, capture) {
    dispatching$1 = true;
    try {
        dispatchPropertyChange(object, name, plus, minus, capture);
    } catch (error) {
        if (typeof error === "object" && typeof error.message === "string") {
            error.message = "Property change dispatch possibly corrupted by error: " + error.message;
            throw error;
        } else {
            throw new Error("Property change dispatch possibly corrupted by error: " + error);
        }
    } finally {
        dispatching$1 = false;
        if (observerToFreeList$1.length) {
            // Using push.apply instead of addEach because push will definitely
            // be much faster than the generic addEach, which also handles
            // non-array collections.
            observerFreeList$1.push.apply(
                observerFreeList$1,
                observerToFreeList$1
            );
            // Using clear because it is observable. The handler record array
            // is obtainable by getPropertyChangeObservers, and is observable.
            observerToFreeList$1.length = 0;
        }
    }
}

function getPropertyChangeObservers(object, name, capture) {
    if (!object.propertyObservers) {
        hiddenValueProperty.value = Object.create(null);
        Object.defineProperty(object, "propertyObservers", hiddenValueProperty);
    }
    var observersByKey = object.propertyObservers;
    var phase = capture ? "WillChange" : "Change";
    var key = name + phase;
    if (!Object.prototype.hasOwnProperty.call(observersByKey, key)) {
        observersByKey[key] = [];
    }
    return observersByKey[key];
}

function getPropertyWillChangeObservers(object, name) {
    return getPropertyChangeObservers(object, name, true);
}

function PropertyChangeObserver() {
    this.init();
    // Object.seal(this); // Maybe one day, this won't deoptimize.
}

PropertyChangeObserver.prototype.init = function () {
    this.object = null;
    this.propertyName = null;
    // Peer observers, from which to pluck itself upon cancelation.
    this.observers = null;
    // On which to dispatch property change notifications.
    this.handler = null;
    // Precomputed handler method name for change dispatch
    this.handlerMethodName = null;
    // Returned by the last property change notification, which must be
    // canceled before the next change notification, or when this observer is
    // finally canceled.
    this.childObserver = null;
    // For the discretionary use of the user, perhaps to track why this
    // observer has been created, or whether this observer should be
    // serialized.
    this.note = null;
    // Whether this observer dispatches before a change occurs, or after
    this.capture = null;
    // The last known value
    this.value = null;
};

PropertyChangeObserver.prototype.cancel = function () {
    var observers = this.observers;
    var index = observers.indexOf(this);
    // Unfortunately, if this observer was reused, this would not be sufficient
    // to detect a duplicate cancel. Do not cancel more than once.
    if (index < 0) {
        throw new Error(
            "Can't cancel observer for " +
            JSON.stringify(this.propertyName) + " on " + this.object +
            " because it has already been canceled"
        );
    }
    var childObserver = this.childObserver;
    observers.splice(index, 1);
    this.init();
    // If this observer is canceled while dispatching a change
    // notification for the same property...
    // 1. We cannot put the handler record onto the free list because
    // it may have been captured in the array of records to which
    // the change notification would be sent. We must mark it as
    // canceled by nulling out the handler property so the dispatcher
    // passes over it.
    // 2. We also cannot put the handler record onto the free list
    // until all change dispatches have been completed because it could
    // conceivably be reused, confusing the current dispatcher.
    if (dispatching$1) {
        // All handlers added to this list will be moved over to the
        // actual free list when there are no longer any property
        // change dispatchers on the stack.
        observerToFreeList$1.push(this);
    } else {
        observerFreeList$1.push(this);
    }
    if (childObserver) {
        // Calling user code on our stack.
        // Done in tail position to avoid a plan interference hazard.
        childObserver.cancel();
    }
};

PropertyChangeObserver.prototype.dispatch = function (plus, minus) {
    var handler = this.handler;
    // A null handler implies that an observer was canceled during the dispatch
    // of a change. The observer is pending addition to the free list.
    if (!handler) {
        return;
    }

    if (minus === void 0) {
        minus = this.value;
    }
    this.value = plus;

    var childObserver = this.childObserver;
    this.childObserver = null;
    // XXX plan interference hazards calling cancel and handler methods:
    if (childObserver) {
        childObserver.cancel();
    }
    var handlerMethodName = this.handlerMethodName;
    if (handlerMethodName && typeof handler[handlerMethodName] === "function") {
        childObserver = handler[handlerMethodName](plus, minus, this.propertyName, this.object);
    } else if (handler.call) {
        childObserver = handler.call(void 0, plus, minus, this.propertyName, this.object);
    } else {
        throw new Error(
            "Can't dispatch " + JSON.stringify(handlerMethodName) + " property change on " + object +
            " because there is no handler method"
        );
    }

    this.childObserver = childObserver;
    return this;
};

function makePropertyObservable$1(object, name) {
    if (Array.isArray(object)) {
        return observableArray.makePropertyObservable(object, name);
    }

    var wrappedDescriptor = wrapPropertyDescriptor(object, name);

    if (!wrappedDescriptor) {
        return;
    }

    var thunk;
    // in both of these new descriptor variants, we reuse the wrapped
    // descriptor to either store the current value or apply getters
    // and setters. this is handy since we can reuse the wrapped
    // descriptor if we uninstall the observer. We even preserve the
    // assignment semantics, where we get the value from up the
    // prototype chain, and set as an owned property.
    if ("value" in wrappedDescriptor) {
        thunk = makeValuePropertyThunk(name, wrappedDescriptor);
    } else { // "get" or "set", but not necessarily both
        thunk = makeGetSetPropertyThunk(name, wrappedDescriptor);
    }

    Object.defineProperty(object, name, thunk);
}

/**
 * Prevents a thunk from being installed on a property, assuming that the
 * underlying type will dispatch the change manually, or intends the property
 * to stick on all instances.
 */
function preventPropertyObserver(object, name) {
    var wrappedDescriptor = wrapPropertyDescriptor(object, name);
    Object.defineProperty(object, name, wrappedDescriptor);
}

function wrapPropertyDescriptor(object, name) {
    // Arrays are special. We do not support direct setting of properties
    // on an array. instead, call .set(index, value). This is observable.
    // "length" property is observable for all mutating methods because
    // our overrides explicitly dispatch that change.
    if (Array.isArray(object)) {
        return;
    }

    if (!Object.isExtensible(object, name)) {
        return;
    }

    var wrappedDescriptor = getPropertyDescriptor(object, name);
    var wrappedPrototype = wrappedDescriptor.prototype;

    var existingWrappedDescriptors = wrappedPrototype.wrappedPropertyDescriptors;
    if (existingWrappedDescriptors && owns.call(existingWrappedDescriptors, name)) {
        return;
    }

    var wrappedPropertyDescriptors = object.wrappedPropertyDescriptors;
    if (!wrappedPropertyDescriptors) {
        wrappedPropertyDescriptors = {};
        hiddenValueProperty.value = wrappedPropertyDescriptors;
        Object.defineProperty(object, "wrappedPropertyDescriptors", hiddenValueProperty);
    }

    if (owns.call(wrappedPropertyDescriptors, name)) {
        // If we have already recorded a wrapped property descriptor,
        // we have already installed the observer, so short-here.
        return;
    }

    if (!wrappedDescriptor.configurable) {
        return;
    }

    // Memoize the descriptor so we know not to install another layer. We
    // could use it to uninstall the observer, but we do not to avoid GC
    // thrashing.
    wrappedPropertyDescriptors[name] = wrappedDescriptor;

    // Give up *after* storing the wrapped property descriptor so it
    // can be restored by uninstall. Unwritable properties are
    // silently not overriden. Since success is indistinguishable from
    // failure, we let it pass but don't waste time on intercepting
    // get/set.
    if (!wrappedDescriptor.writable && !wrappedDescriptor.set) {
        return;
    }

    // If there is no setter, it is not mutable, and observing is moot.
    // Manual dispatch may still apply.
    if (wrappedDescriptor.get && !wrappedDescriptor.set) {
        return;
    }

    return wrappedDescriptor;
}

function getPropertyDescriptor(object, name) {
    // walk up the prototype chain to find a property descriptor for the
    // property name.
    var descriptor;
    var prototype = object;
    do {
        descriptor = Object.getOwnPropertyDescriptor(prototype, name);
        if (descriptor) {
            break;
        }
        prototype = Object.getPrototypeOf(prototype);
    } while (prototype);
    if (descriptor) {
        descriptor.prototype = prototype;
        return descriptor;
    } else {
        // or default to an undefined value
        return {
            prototype: object,
            value: undefined,
            enumerable: false,
            writable: true,
            configurable: true
        };
    }
}

function makeValuePropertyThunk(name, wrappedDescriptor) {
    return {
        get: function () {
            // Uses __this__ to quickly distinguish __state__ properties from
            // upward in the prototype chain.
            if (this.__state__ === void 0 || this.__state__.__this__ !== this) {
                initState(this);
            }
            var state = this.__state__;

            if (!(name in state)) {
                // Get the initial value from up the prototype chain
                state[name] = wrappedDescriptor.value;
            }

            return state[name];
        },
        set: function (plus) {
            // Uses __this__ to quickly distinguish __state__ properties from
            // upward in the prototype chain.
            if (this.__state__ === void 0 || this.__state__.__this__ !== this) {
                initState(this);
                this.__state__[name] = this[name];
            }
            var state = this.__state__;

            if (!(name in state)) {
                // Get the initial value from up the prototype chain
                state[name] = wrappedDescriptor.value;
            }

            if (plus === state[name]) {
                return plus;
            }

            // XXX plan interference hazard:
            dispatchPropertyWillChange(this, name, plus);

            wrappedDescriptor.value = plus;
            state[name] = plus;

            // XXX plan interference hazard:
            dispatchPropertyChange(this, name, plus);

            return plus;
        },
        enumerable: wrappedDescriptor.enumerable,
        configurable: true
    };
}

function makeGetSetPropertyThunk(name, wrappedDescriptor) {
    return {
        get: function () {
            if (wrappedDescriptor.get) {
                return wrappedDescriptor.get.apply(this, arguments);
            }
        },
        set: function (plus) {
            // Uses __this__ to quickly distinguish __state__ properties from
            // upward in the prototype chain.
            if (this.__state__ === void 0 || this.__state__.__this__ !== this) {
                initState(this);
                this.__state__[name] = this[name];
            }
            var state = this.__state__;

            if (state[name] === plus) {
                return plus;
            }

            // XXX plan interference hazard:
            dispatchPropertyWillChange(this, name, plus);

            // call through to actual setter
            if (wrappedDescriptor.set) {
                wrappedDescriptor.set.apply(this, arguments);
                state[name] = plus;
            }

            // use getter, if possible, to adjust the plus value if the setter
            // adjusted it, for example a setter for an array property that
            // retains the original array and replaces its content, or a setter
            // that coerces the value to an expected type.
            if (wrappedDescriptor.get) {
                plus = wrappedDescriptor.get.apply(this, arguments);
            }

            // dispatch the new value: the given value if there is
            // no getter, or the actual value if there is one
            // TODO spec
            // XXX plan interference hazard:
            dispatchPropertyChange(this, name, plus);

            return plus;
        },
        enumerable: wrappedDescriptor.enumerable,
        configurable: true
    };
}

function initState(object) {
    Object.defineProperty(object, "__state__", {
        value: {
            __this__: object
        },
        writable: true,
        enumerable: false,
        configurable: true
    });
}

// TODO review all error messages for consistency and helpfulness across observables

var observerFreeList$2 = [];
var observerToFreeList$2 = [];
var dispatching$2 = false;

var observableRange = ObservableRange;
function ObservableRange() {
    throw new Error("Can't construct. ObservableRange is a mixin.");
}

ObservableRange.prototype.observeRangeChange = function (handler, name, note, capture) {
    return observeRangeChange(this, handler, name, note, capture);
};

ObservableRange.prototype.observeRangeWillChange = function (handler, name, note) {
    return observeRangeChange(this, handler, name, note, true);
};

ObservableRange.prototype.dispatchRangeChange = function (plus, minus, index, capture) {
    return dispatchRangeChange(this, plus, minus, index, capture);
};

ObservableRange.prototype.dispatchRangeWillChange = function (plus, minus, index) {
    return dispatchRangeChange(this, plus, minus, index, true);
};

ObservableRange.prototype.getRangeChangeObservers = function (capture) {
};

ObservableRange.prototype.getRangeWillChangeObservers = function () {
    return getRangeChangeObservers(this, true);
};

ObservableRange.observeRangeChange = observeRangeChange;
function observeRangeChange(object, handler, name, note, capture) {
    makeRangeChangesObservable$1(object);
    var observers = getRangeChangeObservers(object, capture);

    var observer;
    if (observerFreeList$2.length) { // TODO !debug?
        observer = observerFreeList$2.pop();
    } else {
        observer = new RangeChangeObserver();
    }

    observer.object = object;
    observer.name = name;
    observer.capture = capture;
    observer.observers = observers;
    observer.handler = handler;
    observer.note = note;

    // Precompute dispatch method name

    var stringName = "" + name; // Array indicides must be coerced to string.
    var propertyName = stringName.slice(0, 1).toUpperCase() + stringName.slice(1);

    if (!capture) {
        var methodName = "handle" + propertyName + "RangeChange";
        if (handler[methodName]) {
            observer.handlerMethodName = methodName;
        } else if (handler.handleRangeChange) {
            observer.handlerMethodName = "handleRangeChange";
        } else if (handler.call) {
            observer.handlerMethodName = null;
        } else {
            throw new Error("Can't arrange to dispatch " + JSON.stringify(name) + " map changes");
        }
    } else {
        var methodName = "handle" + propertyName + "RangeWillChange";
        if (handler[methodName]) {
            observer.handlerMethodName = methodName;
        } else if (handler.handleRangeWillChange) {
            observer.handlerMethodName = "handleRangeWillChange";
        } else if (handler.call) {
            observer.handlerMethodName = null;
        } else {
            throw new Error("Can't arrange to dispatch " + JSON.stringify(name) + " map changes");
        }
    }

    observers.push(observer);

    // TODO issue warning if the number of handler records is worrisome
    return observer;
}

ObservableRange.observeRangeWillChange = observeRangeWillChange;
function observeRangeWillChange(object, handler, name, note) {
    return observeRangeChange(object, handler, name, note, true);
}

ObservableRange.dispatchRangeChange = dispatchRangeChange;
function dispatchRangeChange(object, plus, minus, index, capture) {
    if (!dispatching$2) { // TODO && !debug?
        return startRangeChangeDispatchContext(object, plus, minus, index, capture);
    }
    var observers = getRangeChangeObservers(object, capture);
    for (var observerIndex = 0; observerIndex < observers.length; observerIndex++) {
        var observer = observers[observerIndex];
        // The slicing ensures that handlers cannot interfere with another by
        // altering these arguments.
        observer.dispatch(plus.slice(), minus.slice(), index);
    }
}

ObservableRange.dispatchRangeWillChange = dispatchRangeWillChange;
function dispatchRangeWillChange(object, plus, minus, index) {
    return dispatchRangeChange(object, plus, minus, index, true);
}

function startRangeChangeDispatchContext(object, plus, minus, index, capture) {
    dispatching$2 = true;
    try {
        dispatchRangeChange(object, plus, minus, index, capture);
    } catch (error) {
        if (typeof error === "object" && typeof error.message === "string") {
            error.message = "Range change dispatch possibly corrupted by error: " + error.message;
            throw error;
        } else {
            throw new Error("Range change dispatch possibly corrupted by error: " + error);
        }
    } finally {
        dispatching$2 = false;
        if (observerToFreeList$2.length) {
            // Using push.apply instead of addEach because push will definitely
            // be much faster than the generic addEach, which also handles
            // non-array collections.
            observerFreeList$2.push.apply(
                observerFreeList$2,
                observerToFreeList$2
            );
            // Using clear because it is observable. The handler record array
            // is obtainable by getPropertyChangeObservers, and is observable.
            if (observerToFreeList$2.clear) {
                observerToFreeList$2.clear();
            } else {
                observerToFreeList$2.length = 0;
            }
        }
    }
}

function makeRangeChangesObservable$1(object) {
    if (Array.isArray(object)) {
        observableArray.makeRangeChangesObservable(object);
    }
    if (object.makeRangeChangesObservable) {
        object.makeRangeChangesObservable();
    }
    object.dispatchesRangeChanges = true;
}

function getRangeChangeObservers(object, capture) {
    if (capture) {
        if (!object.rangeWillChangeObservers) {
            object.rangeWillChangeObservers = [];
        }
        return object.rangeWillChangeObservers;
    } else {
        if (!object.rangeChangeObservers) {
            object.rangeChangeObservers = [];
        }
        return object.rangeChangeObservers;
    }
}

/*
    if (object.preventPropertyObserver) {
        return object.preventPropertyObserver(name);
    } else {
        return preventPropertyObserver(object, name);
    }
*/

function RangeChangeObserver() {
    this.init();
}

RangeChangeObserver.prototype.init = function () {
    this.object = null;
    this.name = null;
    this.observers = null;
    this.handler = null;
    this.handlerMethodName = null;
    this.childObserver = null;
    this.note = null;
    this.capture = null;
};

RangeChangeObserver.prototype.cancel = function () {
    var observers = this.observers;
    var index = observers.indexOf(this);
    // Unfortunately, if this observer was reused, this would not be sufficient
    // to detect a duplicate cancel. Do not cancel more than once.
    if (index < 0) {
        throw new Error(
            "Can't cancel observer for " +
            JSON.stringify(this.name) + " range changes" +
            " because it has already been canceled"
        );
    }
    var childObserver = this.childObserver;
    observers.splice(index, 1);
    this.init();
    // If this observer is canceled while dispatching a change
    // notification for the same property...
    // 1. We cannot put the handler record onto the free list because
    // it may have been captured in the array of records to which
    // the change notification would be sent. We must mark it as
    // canceled by nulling out the handler property so the dispatcher
    // passes over it.
    // 2. We also cannot put the handler record onto the free list
    // until all change dispatches have been completed because it could
    // conceivably be reused, confusing the current dispatcher.
    if (dispatching$2) {
        // All handlers added to this list will be moved over to the
        // actual free list when there are no longer any property
        // change dispatchers on the stack.
        observerToFreeList$2.push(this);
    } else {
        observerFreeList$2.push(this);
    }
    if (childObserver) {
        // Calling user code on our stack.
        // Done in tail position to avoid a plan interference hazard.
        childObserver.cancel();
    }
};

RangeChangeObserver.prototype.dispatch = function (plus, minus, index) {
    var handler = this.handler;
    // A null handler implies that an observer was canceled during the dispatch
    // of a change. The observer is pending addition to the free list.
    if (!handler) {
        return;
    }

    var childObserver = this.childObserver;
    this.childObserver = null;
    // XXX plan interference hazards calling cancel and handler methods:
    if (childObserver) {
        childObserver.cancel();
    }

    var handlerMethodName = this.handlerMethodName;
    if (handlerMethodName && typeof handler[handlerMethodName] === "function") {
        childObserver = handler[handlerMethodName](plus, minus, index, this.object);
    } else if (handler.call) {
        childObserver = handler.call(void 0, plus, minus, index, this.object);
    } else {
        throw new Error(
            "Can't dispatch range change to " + handler
        );
    }

    this.childObserver = childObserver;

    return this;
};

// Copyright (C) 2014 Montage Studio
// https://github.com/montagejs/collections/blob/7c674d49c04955f01bbd2839f90936e15aceea2f/operators/swap.js

var array_slice$1 = Array.prototype.slice;

var swap_1 = swap;
function swap(array, start, minusLength, plus) {
    // Unrolled implementation into JavaScript for a couple reasons.
    // Calling splice can cause large stack sizes for large swaps. Also,
    // splice cannot handle array holes.
    if (plus) {
        if (!Array.isArray(plus)) {
            plus = array_slice$1.call(plus);
        }
    } else {
        plus = Array.empty;
    }

    if (start < 0) {
        start = array.length + start;
    } else if (start > array.length) {
        array.length = start;
    }

    if (start + minusLength > array.length) {
        // Truncate minus length if it extends beyond the length
        minusLength = array.length - start;
    } else if (minusLength < 0) {
        // It is the JavaScript way.
        minusLength = 0;
    }

    var diff = plus.length - minusLength;
    var oldLength = array.length;
    var newLength = array.length + diff;

    if (diff > 0) {
        // Head Tail Plus Minus
        // H H H H M M T T T T
        // H H H H P P P P T T T T
        //         ^ start
        //         ^-^ minus.length
        //           ^ --> diff
        //         ^-----^ plus.length
        //             ^------^ tail before
        //                 ^------^ tail after
        //                   ^ start iteration
        //                       ^ start iteration offset
        //             ^ end iteration
        //                 ^ end iteration offset
        //             ^ start + minus.length
        //                     ^ length
        //                   ^ length - 1
        for (var index = oldLength - 1; index >= start + minusLength; index--) {
            var offset = index + diff;
            if (index in array) {
                array[offset] = array[index];
            } else {
                // Oddly, PhantomJS complains about deleting array
                // properties, unless you assign undefined first.
                array[offset] = void 0;
                delete array[offset];
            }
        }
    }
    for (var index = 0; index < plus.length; index++) {
        if (index in plus) {
            array[start + index] = plus[index];
        } else {
            array[start + index] = void 0;
            delete array[start + index];
        }
    }
    if (diff < 0) {
        // Head Tail Plus Minus
        // H H H H M M M M T T T T
        // H H H H P P T T T T
        //         ^ start
        //         ^-----^ length
        //         ^-^ plus.length
        //             ^ start iteration
        //                 ^ offset start iteration
        //                     ^ end
        //                         ^ offset end
        //             ^ start + minus.length - plus.length
        //             ^ start - diff
        //                 ^------^ tail before
        //             ^------^ tail after
        //                     ^ length - diff
        //                     ^ newLength
        for (var index = start + plus.length; index < oldLength - diff; index++) {
            var offset = index - diff;
            if (offset in array) {
                array[index] = array[offset];
            } else {
                array[index] = void 0;
                delete array[index];
            }
        }
    }
    array.length = newLength;
}

var array_slice = Array.prototype.slice;
var array_sort = Array.prototype.sort;
var array_empty = [];

var observableArrayProperties = {

    swap: {
        value: function swap(start, minusLength, plus) {
            if (plus) {
                if (!Array.isArray(plus)) {
                    plus = array_slice.call(plus);
                }
            } else {
                plus = array_empty;
            }

            if (start < 0) {
                start = this.length + start;
            } else if (start > this.length) {
                var holes = start - this.length;
                var newPlus = Array(holes + plus.length);
                for (var i = 0, j = holes; i < plus.length; i++, j++) {
                    if (i in plus) {
                        newPlus[j] = plus[i];
                    }
                }
                plus = newPlus;
                start = this.length;
            }

            if (start + minusLength > this.length) {
                // Truncate minus length if it extends beyond the length
                minusLength = this.length - start;
            } else if (minusLength < 0) {
                // It is the JavaScript way.
                minusLength = 0;
            }

            var minus;
            if (minusLength === 0) {
                // minus will be empty
                if (plus.length === 0) {
                    // at this point if plus is empty there is nothing to do.
                    return []; // [], but spare us an instantiation
                }
                minus = array_empty;
            } else {
                minus = array_slice.call(this, start, start + minusLength);
            }

            var diff = plus.length - minus.length;
            var oldLength = this.length;
            var newLength = Math.max(this.length + diff, start + plus.length);
            var longest = Math.max(oldLength, newLength);
            var observedLength = Math.min(longest, this.observedLength);

            // dispatch before change events
            if (diff) {
                observableObject.dispatchPropertyWillChange(this, "length", newLength, oldLength);
            }
            observableRange.dispatchRangeWillChange(this, plus, minus, start);
            if (diff === 0) {
                // Substring replacement
                for (var i = start, j = 0; i < start + plus.length; i++, j++) {
                    if (plus[j] !== minus[j]) {
                        observableObject.dispatchPropertyWillChange(this, i, plus[j], minus[j]);
                        observableMap.dispatchMapWillChange(this, "update", i, plus[j], minus[j]);
                    }
                }
            } else {
                // All subsequent values changed or shifted.
                // Avoid (observedLength - start) long walks if there are no
                // registered descriptors.
                for (var i = start, j = 0; i < observedLength; i++, j++) {
                    if (i < oldLength && i < newLength) { // update
                        if (j < plus.length) {
                            if (plus[j] !== this[i]) {
                                observableObject.dispatchPropertyWillChange(this, i, plus[j], this[i]);
                                observableMap.dispatchMapWillChange(this, "update", i, plus[j], this[i]);
                            }
                        } else {
                            if (this[i - diff] !== this[i]) {
                                observableObject.dispatchPropertyWillChange(this, i, this[i - diff], this[i]);
                                observableMap.dispatchMapWillChange(this, "update", i, this[i - diff], this[i]);
                            }
                        }
                    } else if (i < newLength) { // but i >= oldLength, create
                        if (j < plus.length) {
                            if (plus[j] !== void 0) {
                                observableObject.dispatchPropertyWillChange(this, i, plus[j]);
                            }
                            observableMap.dispatchMapWillChange(this, "create", i, plus[j]);
                        } else {
                            if (this[i - diff] !== void 0) {
                                observableObject.dispatchPropertyWillChange(this, i, this[i - diff]);
                            }
                            observableMap.dispatchMapWillChange(this, "create", i, this[i - diff]);
                        }
                    } else if (i < oldLength) { // but i >= newLength, delete
                        if (this[i] !== void 0) {
                            observableObject.dispatchPropertyWillChange(this, i, void 0, this[i]);
                        }
                        observableMap.dispatchMapWillChange(this, "delete", i, void 0, this[i]);
                    } else {
                        throw new Error("assertion error");
                    }
                }
            }

            // actual work
            swap_1(this, start, minusLength, plus);

            // dispatch after change events
            if (diff === 0) { // substring replacement
                for (var i = start, j = 0; i < start + plus.length; i++, j++) {
                    if (plus[j] !== minus[j]) {
                        observableObject.dispatchPropertyChange(this, i, plus[j], minus[j]);
                        observableMap.dispatchMapChange(this, "update", i, plus[j], minus[j]);
                    }
                }
            } else {
                // All subsequent values changed or shifted.
                // Avoid (observedLength - start) long walks if there are no
                // registered descriptors.
                for (var i = start, j = 0; i < observedLength; i++, j++) {
                    if (i < oldLength && i < newLength) { // update
                        if (j < minus.length) {
                            if (this[i] !== minus[j]) {
                                observableObject.dispatchPropertyChange(this, i, this[i], minus[j]);
                                observableMap.dispatchMapChange(this, "update", i, this[i], minus[j]);
                            }
                        } else {
                            if (this[i] !== this[i + diff]) {
                                observableObject.dispatchPropertyChange(this, i, this[i], this[i + diff]);
                                observableMap.dispatchMapChange(this, "update", i, this[i], this[i + diff]);
                            }
                        }
                    } else if (i < newLength) { // but i >= oldLength, create
                        if (j < minus.length) {
                            if (this[i] !== minus[j]) {
                                observableObject.dispatchPropertyChange(this, i, this[i], minus[j]);
                            }
                            observableMap.dispatchMapChange(this, "create", i, this[i], minus[j]);
                        } else {
                            if (this[i] !== this[i + diff]) {
                                observableObject.dispatchPropertyChange(this, i, this[i], this[i + diff]);
                            }
                            observableMap.dispatchMapChange(this, "create", i, this[i], this[i + diff]);
                        }
                    } else if (i < oldLength) { // but i >= newLength, delete
                        if (j < minus.length) {
                            if (minus[j] !== void 0) {
                                observableObject.dispatchPropertyChange(this, i, void 0, minus[j]);
                            }
                            observableMap.dispatchMapChange(this, "delete", i, void 0, minus[j]);
                        } else {
                            if (this[i + diff] !== void 0) {
                                observableObject.dispatchPropertyChange(this, i, void 0, this[i + diff]);
                            }
                            observableMap.dispatchMapChange(this, "delete", i, void 0, this[i + diff]);
                        }
                    } else {
                        throw new Error("assertion error");
                    }
                }
            }

            observableRange.dispatchRangeChange(this, plus, minus, start);
            if (diff) {
                observableObject.dispatchPropertyChange(this, "length", newLength, oldLength);
            }
        },
        writable: true,
        configurable: true
    },

    splice: {
        value: function splice(start, minusLength) {
            if (start > this.length) {
                start = this.length;
            }
            var result = this.slice(start, start + minusLength);
            this.swap.call(this, start, minusLength, array_slice.call(arguments, 2));
            return result;
        },
        writable: true,
        configurable: true
    },

    // splice is the array content change utility belt.  forward all other
    // content changes to splice so we only have to write observer code in one
    // place

    reverse: {
        value: function reverse() {
            var reversed = this.slice();
            reversed.reverse();
            this.swap(0, this.length, reversed);
            return this;
        },
        writable: true,
        configurable: true
    },

    sort: {
        value: function sort() {
            var sorted = this.slice();
            array_sort.apply(sorted, arguments);
            this.swap(0, this.length, sorted);
            return this;
        },
        writable: true,
        configurable: true
    },

    set: {
        value: function set$$1(index, value) {
            this.swap(index, index >= this.length ? 0 : 1, [value]);
            return true;
        },
        writable: true,
        configurable: true
    },

    shift: {
        value: function shift() {
            if (this.length) {
                var result = this[0];
                this.swap(0, 1);
                return result;
            }
        },
        writable: true,
        configurable: true
    },

    pop: {
        value: function pop() {
            if (this.length) {
                var result = this[this.length - 1];
                this.swap(this.length - 1, 1);
                return result;
            }
        },
        writable: true,
        configurable: true
    },

    push: {
        value: function push(value) {
            this.swap(this.length, 0, arguments);
            return this.length;
        },
        writable: true,
        configurable: true
    },

    unshift: {
        value: function unshift(value) {
            this.swap(0, 0, arguments);
            return this.length;
        },
        writable: true,
        configurable: true
    },

    clear: {
        value: function clear() {
            this.swap(0, this.length);
        },
        writable: true,
        configurable: true
    }

};

var hiddenProperty = {
    value: null,
    enumerable: false,
    writable: true,
    configurable: true
};

var observableArrayOwnProperties = {
    observed: hiddenProperty,
    observedLength: hiddenProperty,

    propertyObservers: hiddenProperty,
    wrappedPropertyDescriptors: hiddenProperty,

    rangeChangeObservers: hiddenProperty,
    rangeWillChangeObservers: hiddenProperty,
    dispatchesRangeChanges: hiddenProperty,

    mapChangeObservers: hiddenProperty,
    mapWillChangeObservers: hiddenProperty,
    dispatchesMapChanges: hiddenProperty
};

// use different strategies for making arrays observable between Internet
// Explorer and other browsers.
var protoIsSupported = {}.__proto__ === Object.prototype;
var bestowObservableArrayProperties;
if (protoIsSupported) {
    var observableArrayPrototype = Object.create(Array.prototype, observableArrayProperties);
    bestowObservableArrayProperties = function (array) {
        array.__proto__ = observableArrayPrototype;
    };
} else {
    bestowObservableArrayProperties = function (array) {
        Object.defineProperties(array, observableArrayProperties);
    };
}

var makeArrayObservable_1 = makeArrayObservable;
function makeArrayObservable(array) {
    if (array.observed) {
        return;
    }
    bestowObservableArrayProperties(array);
    Object.defineProperties(array, observableArrayOwnProperties);
    array.observedLength = 0;
    array.observed = true;
}

// For ObservableObject
var makePropertyObservable_1 = makePropertyObservable;
function makePropertyObservable(array, index) {
    makeArrayObservable(array);
    if (~~index === index && index >= 0) { // Note: NaN !== NaN, ~~"foo" !== "foo"
        makeIndexObservable(array, index);
    }
}

// For ObservableRange
var makeRangeChangesObservable_1 = makeRangeChangesObservable;
function makeRangeChangesObservable(array) {
    makeArrayObservable(array);
}

// For ObservableMap
var makeMapChangesObservable_1 = makeMapChangesObservable$1;
function makeMapChangesObservable$1(array) {
    makeArrayObservable(array);
    makeIndexObservable(array, Infinity);
}

function makeIndexObservable(array, index) {
    if (index >= array.observedLength) {
        array.observedLength = index + 1;
    }
}

var observableArray = {
	makeArrayObservable: makeArrayObservable_1,
	makePropertyObservable: makePropertyObservable_1,
	makeRangeChangesObservable: makeRangeChangesObservable_1,
	makeMapChangesObservable: makeMapChangesObservable_1
};

var observerFreeList = [];
var observerToFreeList = [];
var dispatching = false;

var observableMap = ObservableMap;
function ObservableMap() {
    throw new Error("Can't construct. ObservableMap is a mixin.");
}

ObservableMap.prototype.observeMapChange = function (handler, name, note, capture) {
    return observeMapChange(this, handler, name, note, capture);
};

ObservableMap.prototype.observeMapWillChange = function (handler, name, note) {
    return observeMapChange(this, handler, name, note, true);
};

ObservableMap.prototype.dispatchMapChange = function (type, key, plus, minus, capture) {
    return dispatchMapChange(this, type, key, plus, minus, capture);
};

ObservableMap.prototype.dispatchMapWillChange = function (type, key, plus, minus) {
    return dispatchMapWillChange(this, type, key, plus, minus, true);
};

ObservableMap.prototype.getMapChangeObservers = function (capture) {
    return getMapChangeObservers(this, capture);
};

ObservableMap.prototype.getMapWillChangeObservers = function () {
    return getMapChangeObservers(this, true);
};

ObservableMap.observeMapChange = observeMapChange;
function observeMapChange(object, handler, name, note, capture) {
    makeMapChangesObservable(object);
    var observers = getMapChangeObservers(object, capture);

    var observer;
    if (observerFreeList.length) { // TODO !debug?
        observer = observerFreeList.pop();
    } else {
        observer = new MapChangeObserver();
    }

    observer.object = object;
    observer.name = name;
    observer.capture = capture;
    observer.observers = observers;
    observer.handler = handler;
    observer.note = note;

    // Precompute dispatch method name

    var stringName = "" + name; // Array indicides must be coerced to string.
    var propertyName = stringName.slice(0, 1).toUpperCase() + stringName.slice(1);

    if (!capture) {
        var methodName = "handle" + propertyName + "MapChange";
        if (handler[methodName]) {
            observer.handlerMethodName = methodName;
        } else if (handler.handleMapChange) {
            observer.handlerMethodName = "handleMapChange";
        } else if (handler.call) {
            observer.handlerMethodName = null;
        } else {
            throw new Error("Can't arrange to dispatch map changes to " + handler);
        }
    } else {
        var methodName = "handle" + propertyName + "MapWillChange";
        if (handler[methodName]) {
            observer.handlerMethodName = methodName;
        } else if (handler.handleMapWillChange) {
            observer.handlerMethodName = "handleMapWillChange";
        } else if (handler.call) {
            observer.handlerMethodName = null;
        } else {
            throw new Error("Can't arrange to dispatch map changes to " + handler);
        }
    }

    observers.push(observer);

    // TODO issue warning if the number of handler records is worrisome
    return observer;
}

ObservableMap.observeMapWillChange = observeMapWillChange;
function observeMapWillChange(object, handler, name, note) {
    return observeMapChange(object, handler, name, note, true);
}

ObservableMap.dispatchMapChange = dispatchMapChange;
function dispatchMapChange(object, type, key, plus, minus, capture) {
    if (plus === minus) {
        return;
    }
    if (!dispatching) { // TODO && !debug?
        return startMapChangeDispatchContext(object, type, key, plus, minus, capture);
    }
    var observers = getMapChangeObservers(object, capture);
    for (var index = 0; index < observers.length; index++) {
        var observer = observers[index];
        observer.dispatch(type, key, plus, minus);
    }
}

ObservableMap.dispatchMapWillChange = dispatchMapWillChange;
function dispatchMapWillChange(object, type, key, plus, minus) {
    return dispatchMapChange(object, type, key, plus, minus, true);
}

function startMapChangeDispatchContext(object, type, key, plus, minus, capture) {
    dispatching = true;
    try {
        dispatchMapChange(object, type, key, plus, minus, capture);
    } catch (error) {
        if (typeof error === "object" && typeof error.message === "string") {
            error.message = "Map change dispatch possibly corrupted by error: " + error.message;
            throw error;
        } else {
            throw new Error("Map change dispatch possibly corrupted by error: " + error);
        }
    } finally {
        dispatching = false;
        if (observerToFreeList.length) {
            // Using push.apply instead of addEach because push will definitely
            // be much faster than the generic addEach, which also handles
            // non-array collections.
            observerFreeList.push.apply(
                observerFreeList,
                observerToFreeList
            );
            // Using clear because it is observable. The handler record array
            // is obtainable by getPropertyChangeObservers, and is observable.
            observerToFreeList.clear();
        }
    }
}

function getMapChangeObservers(object, capture) {
    if (capture) {
        if (!object.mapWillChangeObservers) {
            object.mapWillChangeObservers = [];
        }
        return object.mapWillChangeObservers;
    } else {
        if (!object.mapChangeObservers) {
            object.mapChangeObservers = [];
        }
        return object.mapChangeObservers;
    }
}

function makeMapChangesObservable(object) {
    if (Array.isArray(object)) {
        observableArray.makeMapChangesObservable(object);
    }
    if (object.makeMapChangesObservable) {
        object.makeMapChangesObservable();
    }
    object.dispatchesMapChanges = true;
}

function MapChangeObserver() {
    this.init();
}

MapChangeObserver.prototype.init = function () {
    this.object = null;
    this.name = null;
    this.observers = null;
    this.handler = null;
    this.handlerMethodName = null;
    this.childObserver = null;
    this.note = null;
    this.capture = null;
};

MapChangeObserver.prototype.cancel = function () {
    var observers = this.observers;
    var index = observers.indexOf(this);
    // Unfortunately, if this observer was reused, this would not be sufficient
    // to detect a duplicate cancel. Do not cancel more than once.
    if (index < 0) {
        throw new Error(
            "Can't cancel observer for " +
            JSON.stringify(this.name) + " map changes" +
            " because it has already been canceled"
        );
    }
    var childObserver = this.childObserver;
    observers.splice(index, 1);
    this.init();
    // If this observer is canceled while dispatching a change
    // notification for the same property...
    // 1. We cannot put the handler record onto the free list because
    // it may have been captured in the array of records to which
    // the change notification would be sent. We must mark it as
    // canceled by nulling out the handler property so the dispatcher
    // passes over it.
    // 2. We also cannot put the handler record onto the free list
    // until all change dispatches have been completed because it could
    // conceivably be reused, confusing the current dispatcher.
    if (dispatching) {
        // All handlers added to this list will be moved over to the
        // actual free list when there are no longer any property
        // change dispatchers on the stack.
        observerToFreeList.push(this);
    } else {
        observerFreeList.push(this);
    }
    if (childObserver) {
        // Calling user code on our stack.
        // Done in tail position to avoid a plan interference hazard.
        childObserver.cancel();
    }
};

MapChangeObserver.prototype.dispatch = function (type, key, plus, minus) {
    var handler = this.handler;
    // A null handler implies that an observer was canceled during the dispatch
    // of a change. The observer is pending addition to the free list.
    if (!handler) {
        return;
    }

    var childObserver = this.childObserver;
    this.childObserver = null;
    // XXX plan interference hazards calling cancel and handler methods:
    if (childObserver) {
        childObserver.cancel();
    }

    var handlerMethodName = this.handlerMethodName;
    if (handlerMethodName && typeof handler[handlerMethodName] === "function") {
        childObserver = handler[handlerMethodName](plus, minus, key, type, this.object);
    } else if (handler.call) {
        childObserver = handler.call(void 0, plus, minus, key, type, this.object);
    } else {
        throw new Error(
            "Can't dispatch map change for " + JSON.stringify(this.name) + " to " + handler +
            " because there is no handler method"
        );
    }

    this.childObserver = childObserver;
    return this;
};

var weakMap = createCommonjsModule(function (module) {
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
      value: function get$$1(key, opt_default) {
        return this.get___(key, opt_default);
      },
      writable: true,
      configurable: true
    },

    has: {
      /**
       * Is there a value associated with key in this WeakMap?
       */
      value: function has$$1(key) {
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
      value: function set$$1(key, value) {
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
});

var iterator = Iterator;




// upgrades an iterable to a Iterator
function Iterator(iterable, start, stop, step) {
    if (!iterable) {
        return Iterator.empty;
    } else if (iterable instanceof Iterator) {
        return iterable;
    } else if (!(this instanceof Iterator)) {
        return new Iterator(iterable, start, stop, step);
    } else if (Array.isArray(iterable) || typeof iterable === "string") {
        iterators.set(this, new IndexIterator(iterable, start, stop, step));
        return;
    }
    iterable = Object(iterable);
    if (iterable.next) {
        iterators.set(this, iterable);
    } else if (iterable.iterate) {
        iterators.set(this, iterable.iterate(start, stop, step));
    } else if (Object.prototype.toString.call(iterable) === "[object Function]") {
        this.next = iterable;
    } else if (Object.getPrototypeOf(iterable) === Object.prototype) {
        iterators.set(this, new ObjectIterator(iterable));
    } else {
        throw new TypeError("Can't iterate " + iterable);
    }
}

// Using iterators as a hidden table associating a full-fledged Iterator with
// an underlying, usually merely "nextable", iterator.
var iterators = new weakMap();

// Selectively apply generic methods of GenericCollection
Iterator.prototype.forEach = genericCollection.prototype.forEach;
Iterator.prototype.map = genericCollection.prototype.map;
Iterator.prototype.filter = genericCollection.prototype.filter;
Iterator.prototype.every = genericCollection.prototype.every;
Iterator.prototype.some = genericCollection.prototype.some;
Iterator.prototype.min = genericCollection.prototype.min;
Iterator.prototype.max = genericCollection.prototype.max;
Iterator.prototype.sum = genericCollection.prototype.sum;
Iterator.prototype.average = genericCollection.prototype.average;
Iterator.prototype.flatten = genericCollection.prototype.flatten;
Iterator.prototype.zip = genericCollection.prototype.zip;
Iterator.prototype.enumerate = genericCollection.prototype.enumerate;
Iterator.prototype.sorted = genericCollection.prototype.sorted;
Iterator.prototype.group = genericCollection.prototype.group;
Iterator.prototype.reversed = genericCollection.prototype.reversed;
Iterator.prototype.toArray = genericCollection.prototype.toArray;
Iterator.prototype.toObject = genericCollection.prototype.toObject;

// This is a bit of a cheat so flatten and such work with the generic reducible
Iterator.prototype.constructClone = function (values) {
    var clone = [];
    clone.addEach(values);
    return clone;
};

// A level of indirection so a full-interface iterator can proxy for a simple
// nextable iterator.
Iterator.prototype.next = function () {
    var nextable = iterators.get(this);
    if (nextable) {
        return nextable.next();
    } else {
        return Iterator.done;
    }
};

Iterator.prototype.iterateMap = function (callback /*, thisp*/) {
    var self = Iterator(this),
        thisp = arguments[1];
    return new MapIterator(self, callback, thisp);
};

function MapIterator(iterator, callback, thisp) {
    this.iterator = iterator;
    this.callback = callback;
    this.thisp = thisp;
}

MapIterator.prototype = Object.create(Iterator.prototype);
MapIterator.prototype.constructor = MapIterator;

MapIterator.prototype.next = function () {
    var iteration = this.iterator.next();
    if (iteration.done) {
        return iteration;
    } else {
        return new Iteration(
            this.callback.call(
                this.thisp,
                iteration.value,
                iteration.index,
                this.iteration
            ),
            iteration.index
        );
    }
};

Iterator.prototype.iterateFilter = function (callback /*, thisp*/) {
    var self = Iterator(this),
        thisp = arguments[1],
        index = 0;

    return new FilterIterator(self, callback, thisp);
};

function FilterIterator(iterator, callback, thisp) {
    this.iterator = iterator;
    this.callback = callback;
    this.thisp = thisp;
}

FilterIterator.prototype = Object.create(Iterator.prototype);
FilterIterator.prototype.constructor = FilterIterator;

FilterIterator.prototype.next = function () {
    var iteration;
    while (true) {
        iteration = this.iterator.next();
        if (iteration.done || this.callback.call(
            this.thisp,
            iteration.value,
            iteration.index,
            this.iteration
        )) {
            return iteration;
        }
    }
};

Iterator.prototype.reduce = function (callback /*, initial, thisp*/) {
    var self = Iterator(this),
        result = arguments[1],
        thisp = arguments[2],
        iteration;

    // First iteration unrolled
    iteration = self.next();
    if (iteration.done) {
        if (arguments.length > 1) {
            return arguments[1];
        } else {
            throw TypeError("Reduce of empty iterator with no initial value");
        }
    } else if (arguments.length > 1) {
        result = callback.call(
            thisp,
            result,
            iteration.value,
            iteration.index,
            self
        );
    } else {
        result = iteration.value;
    }

    // Remaining entries
    while (true) {
        iteration = self.next();
        if (iteration.done) {
            return result;
        } else {
            result = callback.call(
                thisp,
                result,
                iteration.value,
                iteration.index,
                self
            );
        }
    }
};

Iterator.prototype.dropWhile = function (callback /*, thisp */) {
    var self = Iterator(this),
        thisp = arguments[1],
        iteration;

    while (true) {
        iteration = self.next();
        if (iteration.done) {
            return Iterator.empty;
        } else if (!callback.call(thisp, iteration.value, iteration.index, self)) {
            return new DropWhileIterator(iteration, self);
        }
    }
};

function DropWhileIterator(iteration, iterator) {
    this.iteration = iteration;
    this.iterator = iterator;
    this.parent = null;
}

DropWhileIterator.prototype = Object.create(Iterator.prototype);
DropWhileIterator.prototype.constructor = DropWhileIterator;

DropWhileIterator.prototype.next = function () {
    var result = this.iteration;
    if (result) {
        this.iteration = null;
        return result;
    } else {
        return this.iterator.next();
    }
};

Iterator.prototype.takeWhile = function (callback /*, thisp*/) {
    var self = Iterator(this),
        thisp = arguments[1];
    return new TakeWhileIterator(self, callback, thisp);
};

function TakeWhileIterator(iterator, callback, thisp) {
    this.iterator = iterator;
    this.callback = callback;
    this.thisp = thisp;
}

TakeWhileIterator.prototype = Object.create(Iterator.prototype);
TakeWhileIterator.prototype.constructor = TakeWhileIterator;

TakeWhileIterator.prototype.next = function () {
    var iteration = this.iterator.next();
    if (iteration.done) {
        return iteration;
    } else if (this.callback.call(
        this.thisp,
        iteration.value,
        iteration.index,
        this.iterator
    )) {
        return iteration;
    } else {
        return Iterator.done;
    }
};

Iterator.prototype.iterateZip = function () {
    return Iterator.unzip(Array.prototype.concat.apply(this, arguments));
};

Iterator.prototype.iterateUnzip = function () {
    return Iterator.unzip(this);
};

Iterator.prototype.iterateEnumerate = function (start) {
    return Iterator.count(start).iterateZip(this);
};

Iterator.prototype.iterateConcat = function () {
    return Iterator.flatten(Array.prototype.concat.apply(this, arguments));
};

Iterator.prototype.iterateFlatten = function () {
    return Iterator.flatten(this);
};

Iterator.prototype.recount = function (start) {
    return new RecountIterator(this, start);
};

function RecountIterator(iterator, start) {
    this.iterator = iterator;
    this.index = start || 0;
}

RecountIterator.prototype = Object.create(Iterator.prototype);
RecountIterator.prototype.constructor = RecountIterator;

RecountIterator.prototype.next = function () {
    var iteration = this.iterator.next();
    if (iteration.done) {
        return iteration;
    } else {
        return new Iteration(
            iteration.value,
            this.index++
        );
    }
};

// creates an iterator for Array and String
function IndexIterator(iterable, start, stop, step) {
    if (step == null) {
        step = 1;
    }
    if (stop == null) {
        stop = start;
        start = 0;
    }
    if (start == null) {
        start = 0;
    }
    if (step == null) {
        step = 1;
    }
    if (stop == null) {
        stop = iterable.length;
    }
    this.iterable = iterable;
    this.start = start;
    this.stop = stop;
    this.step = step;
}

IndexIterator.prototype.next = function () {
    // Advance to next owned entry
    if (typeof this.iterable === "object") { // as opposed to string
        while (!(this.start in this.iterable)) {
            if (this.start >= this.stop) {
                return Iterator.done;
            } else {
                this.start += this.step;
            }
        }
    }
    if (this.start >= this.stop) { // end of string
        return Iterator.done;
    }
    var iteration = new Iteration(
        this.iterable[this.start],
        this.start
    );
    this.start += this.step;
    return iteration;
};

function ObjectIterator(object) {
    this.object = object;
    this.iterator = new Iterator(Object.keys(object));
}

ObjectIterator.prototype.next = function () {
    var iteration = this.iterator.next();
    if (iteration.done) {
        return iteration;
    } else {
        var key = iteration.value;
        return new Iteration(this.object[key], key);
    }
};

Iterator.cycle = function (cycle, times) {
    if (arguments.length < 2) {
        times = Infinity;
    }
    return new CycleIterator(cycle, times);
};

function CycleIterator(cycle, times) {
    this.cycle = cycle;
    this.times = times;
    this.iterator = Iterator.empty;
}

CycleIterator.prototype = Object.create(Iterator.prototype);
CycleIterator.prototype.constructor = CycleIterator;

CycleIterator.prototype.next = function () {
    var iteration = this.iterator.next();
    if (iteration.done) {
        if (this.times > 0) {
            this.times--;
            this.iterator = new Iterator(this.cycle);
            return this.iterator.next();
        } else {
            return iteration;
        }
    } else {
        return iteration;
    }
};

Iterator.concat = function (/* ...iterators */) {
    return Iterator.flatten(Array.prototype.slice.call(arguments));
};

Iterator.flatten = function (iterators) {
    iterators = Iterator(iterators);
    return new ChainIterator(iterators);
};

function ChainIterator(iterators) {
    this.iterators = iterators;
    this.iterator = Iterator.empty;
}

ChainIterator.prototype = Object.create(Iterator.prototype);
ChainIterator.prototype.constructor = ChainIterator;

ChainIterator.prototype.next = function () {
    var iteration = this.iterator.next();
    if (iteration.done) {
        var iteratorIteration = this.iterators.next();
        if (iteratorIteration.done) {
            return Iterator.done;
        } else {
            this.iterator = new Iterator(iteratorIteration.value);
            return this.iterator.next();
        }
    } else {
        return iteration;
    }
};

Iterator.unzip = function (iterators) {
    iterators = Iterator(iterators).map(Iterator);
    if (iterators.length === 0)
        return new Iterator.empty;
    return new UnzipIterator(iterators);
};

function UnzipIterator(iterators) {
    this.iterators = iterators;
    this.index = 0;
}

UnzipIterator.prototype = Object.create(Iterator.prototype);
UnzipIterator.prototype.constructor = UnzipIterator;

UnzipIterator.prototype.next = function () {
    var done = false;
    var result = this.iterators.map(function (iterator) {
        var iteration = iterator.next();
        if (iteration.done) {
            done = true;
        } else {
            return iteration.value;
        }
    });
    if (done) {
        return Iterator.done;
    } else {
        return new Iteration(result, this.index++);
    }
};

Iterator.zip = function () {
    return Iterator.unzip(Array.prototype.slice.call(arguments));
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
    return new RangeIterator(start, stop, step);
};

Iterator.count = function (start, step) {
    return Iterator.range(start, Infinity, step);
};

function RangeIterator(start, stop, step) {
    this.start = start;
    this.stop = stop;
    this.step = step;
    this.index = 0;
}

RangeIterator.prototype = Object.create(Iterator.prototype);
RangeIterator.prototype.constructor = RangeIterator;

RangeIterator.prototype.next = function () {
    if (this.start >= this.stop) {
        return Iterator.done;
    } else {
        var result = this.start;
        this.start += this.step;
        return new Iteration(result, this.index++);
    }
};

Iterator.repeat = function (value, times) {
    if (times == null) {
        times = Infinity;
    }
    return new RepeatIterator(value, times);
};

function RepeatIterator(value, times) {
    this.value = value;
    this.times = times;
    this.index = 0;
}

RepeatIterator.prototype = Object.create(Iterator.prototype);
RepeatIterator.prototype.constructor = RepeatIterator;

RepeatIterator.prototype.next = function () {
    if (this.index < this.times) {
        return new Iteration(this.value, this.index++);
    } else {
        return Iterator.done;
    }
};

Iterator.enumerate = function (values, start) {
    return Iterator.count(start).iterateZip(new Iterator(values));
};

function EmptyIterator() {}

EmptyIterator.prototype = Object.create(Iterator.prototype);
EmptyIterator.prototype.constructor = EmptyIterator;

EmptyIterator.prototype.next = function () {
    return Iterator.done;
};

Iterator.empty = new EmptyIterator();

// Iteration and DoneIteration exist here only to encourage hidden classes.
// Otherwise, iterations are merely duck-types.

function Iteration(value, index) {
    this.value = value;
    this.index = index;
}

Iteration.prototype.done = false;

Iteration.prototype.equals = function (that, equals, memo) {
    if (!that) return false;
    return (
        equals(this.value, that.value, equals, memo) &&
        this.index === that.index &&
        this.done === that.done
    );

};

function DoneIteration(value) {
    Iteration.call(this, value);
    this.done = true; // reflected on the instance to make it more obvious
}

DoneIteration.prototype = Object.create(Iteration.prototype);
DoneIteration.prototype.constructor = DoneIteration;
DoneIteration.prototype.done = true;

Iterator.Iteration = Iteration;
Iterator.DoneIteration = DoneIteration;
Iterator.done = new DoneIteration();

var hasOwnProperty = Object.prototype.hasOwnProperty;

var copy_1 = copy;
function copy(target, source) {
    for (var name in source) {
        if (hasOwnProperty.call(source, name)) {
            target[name] = source[name];
        }
    }
}

var genericMap = GenericMap;
function GenericMap() {
    throw new Error("Can't construct. GenericMap is a mixin.");
}

copy_1(GenericMap.prototype, observableMap.prototype);
copy_1(GenericMap.prototype, observableObject.prototype);

// all of these methods depend on the constructor providing a `store` set

GenericMap.prototype.isMap = true;

GenericMap.prototype.addEach = function (values) {
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
        } else {
            // copy other objects as map-alikes
            Object.keys(values).forEach(function (key) {
                this.set(key, values[key]);
            }, this);
        }
    }
    return this;
};

GenericMap.prototype.get = function (key, defaultValue) {
    var item = this.store.get(new this.Item(key));
    if (item) {
        return item.value;
    } else if (arguments.length > 1) {
        return defaultValue;
    } else {
        return this.getDefault(key);
    }
};

GenericMap.prototype.getDefault = function () {
};

GenericMap.prototype.set = function (key, value) {
    var item = new this.Item(key, value);
    var found = this.store.get(item);
    var grew = false;
    if (found) { // update
        var from;
        if (this.dispatchesMapChanges) {
            from = found.value;
            this.dispatchMapWillChange("update", key, value, from);
        }
        found.value = value;
        if (this.dispatchesMapChanges) {
            this.dispatchMapChange("update", key, value, from);
        }
    } else { // create
        if (this.dispatchesMapChanges) {
            this.dispatchMapWillChange("create", key, value);
        }
        if (this.store.add(item)) {
            this.length++;
            grew = true;
        }
        if (this.dispatchesMapChanges) {
            this.dispatchMapChange("create", key, value);
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
        var from;
        if (this.dispatchesMapChanges) {
            from = this.store.get(item).value;
            this.dispatchMapWillChange("delete", key, void 0, from);
        }
        this.store["delete"](item);
        this.length--;
        if (this.dispatchesMapChanges) {
            this.dispatchMapChange("delete", key, void 0, from);
        }
        return true;
    }
    return false;
};

GenericMap.prototype.clear = function () {
    var from;
    if (this.dispatchesMapChanges) {
        this.forEach(function (value, key) {
            this.dispatchMapWillChange("delete", key, void 0, value);
        }, this);
        from = this.constructClone(this);
    }
    this.store.clear();
    this.length = 0;
    if (this.dispatchesMapChanges) {
        from.forEach(function (value, key) {
            this.dispatchMapChange("delete", key, void 0, value);
        }, this);
    }
};

GenericMap.prototype.iterate = function () {
    return new this.Iterator(this);
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

GenericMap.prototype.keys = function () {
    return this.map(function (value, key) {
        return key;
    });
};

GenericMap.prototype.values = function () {
    return this.map(identity$1);
};

GenericMap.prototype.entries = function () {
    return this.map(function (value, key) {
        return [key, value];
    });
};

GenericMap.prototype.equals = function (that, equals) {
    equals = equals || popEquals;
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

GenericMap.prototype.Item = Item;
GenericMap.prototype.Iterator = GenericMapIterator;

function Item(key, value) {
    this.key = key;
    this.value = value;
}

Item.prototype.equals = function (that) {
    return popEquals(this.key, that.key) && popEquals(this.value, that.value);
};

Item.prototype.compare = function (that) {
    return popCompare(this.key, that.key);
};

function GenericMapIterator(map) {
    this.storeIterator = new iterator(map.store);
}

GenericMapIterator.prototype = Object.create(iterator.prototype);
GenericMapIterator.prototype.constructor = GenericMapIterator;

GenericMapIterator.prototype.next = function () {
    var iteration = this.storeIterator.next();
    if (iteration.done) {
        return iteration;
    } else {
        return new iterator.Iteration(
            iteration.value.value,
            iteration.value.key
        );
    }
};

function identity$1(value) { return value; }

// Burgled from https://github.com/domenic/dict

var dict = Dict;
function Dict(values, getDefault) {
    if (!(this instanceof Dict)) {
        return new Dict(values, getDefault);
    }
    getDefault = getDefault || this.getDefault;
    this.getDefault = getDefault;
    this.store = {};
    this.length = 0;
    this.addEach(values);
}

Dict.Dict = Dict; // hack for MontageJS

function mangle(key) {
    return "$" + key;
}

function unmangle(mangled) {
    return mangled.slice(1);
}

copy_1(Dict.prototype, genericCollection.prototype);
copy_1(Dict.prototype, genericMap.prototype);
copy_1(Dict.prototype, observableObject.prototype);

Dict.prototype.isDict = true;

Dict.prototype.constructClone = function (values) {
    return new this.constructor(values, this.mangle, this.getDefault);
};

Dict.prototype.get = function (key, defaultValue) {
    var mangled = mangle(key);
    if (mangled in this.store) {
        return this.store[mangled];
    } else if (arguments.length > 1) {
        return defaultValue;
    } else {
        return this.getDefault(key);
    }
};

Dict.prototype.set = function (key, value) {
    var mangled = mangle(key);
    var from;
    if (mangled in this.store) { // update
        if (this.dispatchesMapChanges) {
            from = this.store[mangled];
            this.dispatchMapWillChange("update", key, value, from);
        }
        this.store[mangled] = value;
        if (this.dispatchesMapChanges) {
            this.dispatchMapChange("update", key, value, from);
        }
        return false;
    } else { // create
        if (this.dispatchesMapChanges) {
            this.dispatchMapWillChange("create", key, value);
        }
        this.length++;
        this.store[mangled] = value;
        if (this.dispatchesMapChanges) {
            this.dispatchMapChange("create", key, value);
        }
        return true;
    }
};

Dict.prototype.has = function (key) {
    var mangled = mangle(key);
    return mangled in this.store;
};

Dict.prototype["delete"] = function (key) {
    var mangled = mangle(key);
    var from;
    if (mangled in this.store) {
        if (this.dispatchesMapChanges) {
            from = this.store[mangled];
            this.dispatchMapWillChange("delete", key, void 0, from);
        }
        delete this.store[mangle(key)];
        this.length--;
        if (this.dispatchesMapChanges) {
            this.dispatchMapChange("delete", key, void 0, from);
        }
        return true;
    }
    return false;
};

Dict.prototype.clear = function () {
    var key, mangled, from;
    for (mangled in this.store) {
        key = unmangle(mangled);
        if (this.dispatchesMapChanges) {
            from = this.store[mangled];
            this.dispatchMapWillChange("delete", key, void 0, from);
        }
        delete this.store[mangled];
        if (this.dispatchesMapChanges) {
            this.dispatchMapChange("delete", key, void 0, from);
        }
    }
    this.length = 0;
};

Dict.prototype.reduce = function (callback, basis, thisp) {
    for (var mangled in this.store) {
        basis = callback.call(thisp, basis, this.store[mangled], unmangle(mangled), this);
    }
    return basis;
};

Dict.prototype.reduceRight = function (callback, basis, thisp) {
    var self = this;
    var store = this.store;
    return Object.keys(this.store).reduceRight(function (basis, mangled) {
        return callback.call(thisp, basis, store[mangled], unmangle(mangled), self);
    }, basis);
};

Dict.prototype.one = function () {
    var key;
    for (key in this.store) {
        return this.store[key];
    }
};

Dict.prototype.iterate = function () {
    return new this.Iterator(new iterator(this.store));
};

Dict.prototype.Iterator = DictIterator;

function DictIterator(storeIterator) {
    this.storeIterator = storeIterator;
}

DictIterator.prototype.next = function () {
    var iteration = this.storeIterator.next();
    if (iteration.done) {
        return iteration;
    } else {
        return new iterator.Iteration(
            iteration.value,
            unmangle(iteration.index)
        );
    }
};

var genericOrder = GenericOrder;
function GenericOrder() {
    throw new Error("Can't construct. GenericOrder is a mixin.");
}

GenericOrder.prototype.equals = function (that, equals) {
    equals = equals || this.contentEquals || popEquals;

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
    compare = compare || this.contentCompare || popCompare;

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

var index = arrayify;
function arrayify(object) {
    var result, index, length;
    if (!object) {
        return [];
    } else if (Array.isArray(object)) {
        return object.slice();
    } else if (typeof object.toArray === "function") {
        return object.toArray();
    } else if (typeof object.forEach === "function") {
        result = [];
        object.forEach(result.push, result);
        return result;
    } else if (typeof object.length === "number") {
        result = [];
        for (index = 0, length = object.length; index < length; index++) {
            result[index] = object[index];
        }
        return result;
    } else {
        throw new Error("Can't convert to an array " + object);
    }
}

var list = List;










function List(values, equals, getDefault) {
    if (!(this instanceof List)) {
        return new List(values, equals, getDefault);
    }
    var head = this.head = new this.Node();
    head.next = head;
    head.prev = head;
    this.contentEquals = equals || popEquals;
    this.getDefault = getDefault || noop$1;
    this.length = 0;
    this.addEach(values);
}

List.List = List; // hack for MontageJS

copy_1(List.prototype, genericCollection.prototype);
copy_1(List.prototype, genericOrder.prototype);
copy_1(List.prototype, observableObject.prototype);
copy_1(List.prototype, observableRange.prototype);

List.prototype.constructClone = function (values) {
    return new this.constructor(values, this.contentEquals, this.getDefault);
};

List.prototype.findValue = function (value, equals) {
    equals = equals || this.contentEquals;
    var head = this.head;
    var at = head.next;
    while (at !== head) {
        // Note that the given value occurs first so that it can be a matcher
        // like an Any(Number) object.
        if (equals(value, at.value)) {
            return at;
        }
        at = at.next;
    }
};

List.prototype.findLastValue = function (value, equals) {
    equals = equals || this.contentEquals;
    var head = this.head;
    var at = head.prev;
    while (at !== head) {
        if (equals(value, at.value)) {
            return at;
        }
        at = at.prev;
    }
};

List.prototype.has = function (value, equals) {
    return !!this.findValue(value, equals);
};

List.prototype.get = function (value, equals) {
    var found = this.findValue(value, equals);
    if (found) {
        return found.value;
    }
    return this.getDefault(value);
};

// LIFO (delete removes the most recently added equivalent value)
List.prototype['delete'] = function (value, equals) {
    var found = this.findLastValue(value, equals);
    if (found) {
        if (this.dispatchesRangeChanges) {
            var plus = [];
            var minus = [value];
            this.dispatchRangeWillChange(plus, minus, found.index);
        }
        found['delete']();
        this.length--;
        if (this.dispatchesRangeChanges) {
            this.dispatchRangeChange(plus, minus, found.index);
            this.updateIndexes(found.next, found.index);
        }
        return true;
    }
    return false;
};

List.prototype.clear = function () {
    var plus, minus;
    if (this.dispatchesRangeChanges) {
        minus = this.toArray();
        plus = [];
        this.dispatchRangeWillChange(plus, minus, 0);
    }
    this.head.next = this.head.prev = this.head;
    this.length = 0;
    if (this.dispatchesRangeChanges) {
        this.dispatchRangeChange(plus, minus, 0);
    }
};

List.prototype.add = function (value) {
    var node = new this.Node(value);
    if (this.dispatchesRangeChanges) {
        node.index = this.length;
        this.dispatchRangeWillChange([value], [], node.index);
    }
    this.head.addBefore(node);
    this.length++;
    if (this.dispatchesRangeChanges) {
        this.dispatchRangeChange([value], [], node.index);
    }
    return true;
};

List.prototype.push = function () {
    var head = this.head;
    if (this.dispatchesRangeChanges) {
        var plus = Array.prototype.slice.call(arguments);
        var minus = [];
        var index$$1 = this.length;
        this.dispatchRangeWillChange(plus, minus, index$$1);
        var start = this.head.prev;
    }
    for (var i = 0; i < arguments.length; i++) {
        var value = arguments[i];
        var node = new this.Node(value);
        head.addBefore(node);
    }
    this.length += arguments.length;
    if (this.dispatchesRangeChanges) {
        this.updateIndexes(start, start.index);
        this.dispatchRangeChange(plus, minus, index$$1);
    }
};

List.prototype.unshift = function () {
    if (this.dispatchesRangeChanges) {
        var plus = Array.prototype.slice.call(arguments);
        var minus = [];
        this.dispatchRangeWillChange(plus, minus, 0);
    }
    var at = this.head;
    for (var i = 0; i < arguments.length; i++) {
        var value = arguments[i];
        var node = new this.Node(value);
        at.addAfter(node);
        at = node;
    }
    this.length += arguments.length;
    if (this.dispatchesRangeChanges) {
        this.updateIndexes(this.head, -1);
        this.dispatchRangeChange(plus, minus, 0);
    }
};

List.prototype.pop = function () {
    var value;
    var head = this.head;
    if (head.prev !== head) {
        value = head.prev.value;
        if (this.dispatchesRangeChanges) {
            var plus = [];
            var minus = [value];
            var index$$1 = this.length - 1;
            this.dispatchRangeWillChange(plus, minus, index$$1);
        }
        head.prev['delete']();
        this.length--;
        if (this.dispatchesRangeChanges) {
            this.dispatchRangeChange(plus, minus, index$$1);
        }
    }
    return value;
};

List.prototype.shift = function () {
    var value;
    var head = this.head;
    if (head.prev !== head) {
        value = head.next.value;
        if (this.dispatchesRangeChanges) {
            var plus = [];
            var minus = [value];
            this.dispatchRangeWillChange(plus, minus, 0);
        }
        head.next['delete']();
        this.length--;
        if (this.dispatchesRangeChanges) {
            this.updateIndexes(this.head, -1);
            this.dispatchRangeChange(plus, minus, 0);
        }
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

List.prototype.swap = function (start, length, plus) {
    var initial = start;
    // start will be head if start is null or -1 (meaning from the end), but
    // will be head.next if start is 0 (meaning from the beginning)
    start = this.scan(start, this.head);
    if (length == null) {
        length = Infinity;
    }
    plus = index(plus);

    // collect the minus array
    var minus = [];
    var at = start;
    while (length-- && length >= 0 && at !== this.head) {
        minus.push(at.value);
        at = at.next;
    }

    // before range change
    var index$$1, startNode;
    if (this.dispatchesRangeChanges) {
        if (start === this.head) {
            index$$1 = this.length;
        } else if (start.prev === this.head) {
            index$$1 = 0;
        } else {
            index$$1 = start.index;
        }
        startNode = start.prev;
        this.dispatchRangeWillChange(plus, minus, index$$1);
    }

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

    // after range change
    if (this.dispatchesRangeChanges) {
        if (start === this.head) {
            this.updateIndexes(this.head, -1);
        } else {
            this.updateIndexes(startNode, startNode.index);
        }
        this.dispatchRangeChange(plus, minus, index$$1);
    }

    return minus;
};

List.prototype.reverse = function () {
    if (this.dispatchesRangeChanges) {
        var minus = this.toArray();
        var plus = minus.reversed();
        this.dispatchRangeWillChange(plus, minus, 0);
    }
    var at = this.head;
    do {
        var temp = at.next;
        at.next = at.prev;
        at.prev = temp;
        at = at.next;
    } while (at !== this.head);
    if (this.dispatchesRangeChanges) {
        this.dispatchRangeChange(plus, minus, 0);
    }
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

List.prototype.updateIndexes = function (node, index$$1) {
    do {
        node.index = index$$1++;
        node = node.next;
    } while (node !== this.head);
};

List.prototype.makeRangeChangesObservable = function () {
    this.updateIndexes(this.head, -1);
    this.dispatchesRangeChanges = true;
};

List.prototype.toArray = function () {
    return this.slice();
};

List.prototype.iterate = function () {
    return new ListIterator(this.head);
};

function ListIterator(head) {
    this.head = head;
    this.at = head.next;
    this.index = 0;
}

ListIterator.prototype = Object.create(iterator.prototype);
ListIterator.prototype.constructor = ListIterator;

ListIterator.prototype.next = function () {
    if (this.at === this.head) {
        return iterator.done;
    } else {
        var at = this.at;
        this.at = this.at.next;
        return new iterator.Iteration(
            at.value,
            this.index++
        );
    }
};

List.prototype.Node = Node;

function Node(value) {
    this.value = value;
    this.prev = null;
    this.next = null;
}

Node.prototype['delete'] = function () {
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

function noop$1() {}

var hasOwnProperty$1 = Object.prototype.hasOwnProperty;

var has_1 = has$2;
function has$2(object, soughtValue, equals) {
    equals = equals || popEquals;
    for (var key in object) {
        if (hasOwnProperty$1.call(object, key)) {
            var value = object[key];
            if (equals(soughtValue, value)) {
                return true;
            }
        }
    }
    return false;
}

var popHas = has$1;
function has$1(object, soughtValue, equals) {
    if (object && typeof object.has === "function") {
        return object.has(soughtValue, equals);
    } else {
        return has_1(object, soughtValue, equals);
    }
}

var genericSet = GenericSet;
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
        return popHas(that, value);
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

var treeLog = TreeLog;

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

var hashes = new weakMap();

var popHash = hash;
function hash(value) {
    if (value && typeof value.hash === "function") {
        return value.hash();
    } else if (value && typeof value === "object") {
        var hash = hashes.get(value);
        if (!hash) {
            hash = (Math.random() * 0xFFFFFFFF) >>> 0;
            hashes.set(value, hash);
        }
        return hash;
    } else {
        return value;
    }
}

var iteration = Iteration$1;
function Iteration$1(value, done, index) {
    this.value = value;
    this.done = done;
    this.index = index;
}

Iteration$1.prototype.equals = function (other) {
    return (
        typeof other == 'object' &&
        other.value === this.value &&
        other.done === this.done &&
        other.index === this.index
    );
};

var arrayIterator = ArrayIterator;
function ArrayIterator(iterable, start, stop, step) {
    this.array = iterable;
    this.start = start || 0;
    this.stop = stop || Infinity;
    this.step = step || 1;
}

ArrayIterator.prototype.next = function () {
    var iteration$$1;
    if (this.start < Math.min(this.array.length, this.stop)) {
        iteration$$1 = new iteration(this.array[this.start], false, this.start);
        this.start += this.step;
    } else {
        iteration$$1 =  new iteration(undefined, true);
    }
    return iteration$$1;
};

var objectIterator = ObjectIterator$1;
function ObjectIterator$1(iterable, start, stop, step) {
    this.object = iterable;
    this.keysIterator = new arrayIterator(Object.keys(iterable), start, stop, step);
}

ObjectIterator$1.prototype.next = function () {
    var iteration$$2 = this.keysIterator.next();
    if (iteration$$2.done) {
        return iteration$$2;
    }
    var key = iteration$$2.value;
    return new iteration(this.object[key], false, key);
};

var popIterate = iterate;
function iterate(iterable, start, stop, step) {
    if (!iterable) {
        return empty;
    } else if (Array.isArray(iterable)) {
        return new arrayIterator(iterable, start, stop, step);
    } else if (typeof iterable.next === "function") {
        return iterable;
    } else if (typeof iterable.iterate === "function") {
        return iterable.iterate(start, stop, step);
    } else if (typeof iterable === "object") {
        return new objectIterator(iterable);
    } else {
        throw new TypeError("Can't iterate " + iterable);
    }
}

var fastSet = FastSet;

function FastSet(values, equals, hash, getDefault) {
    if (!(this instanceof FastSet)) {
        return new FastSet(values, equals, hash, getDefault);
    }
    equals = equals || popEquals;
    hash = hash || popHash;
    getDefault = getDefault || noop;
    this.contentEquals = equals;
    this.contentHash = hash;
    this.getDefault = getDefault;
    this.buckets = new this.Buckets(null, this.Bucket);
    this.length = 0;
    this.addEach(values);
}

FastSet.FastSet = FastSet; // hack for MontageJS

copy_1(FastSet.prototype, genericCollection.prototype);
copy_1(FastSet.prototype, genericSet.prototype);
copy_1(FastSet.prototype, observableObject.prototype);

FastSet.prototype.Buckets = dict;
FastSet.prototype.Bucket = list;

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

FastSet.prototype.get = function (value) {
    var hash = this.contentHash(value);
    var buckets = this.buckets;
    if (buckets.has(hash)) {
        return buckets.get(hash).get(value);
    } else {
        return this.getDefault(value);
    }
};

FastSet.prototype['delete'] = function (value) {
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
    var index$$1 = 0;
    return buckets.reduce(function (basis, bucket) {
        return bucket.reduce(function (basis, value) {
            return callback.call(thisp, basis, value, index$$1++, this);
        }, basis, this);
    }, basis, this);
};

FastSet.prototype.one = function () {
    if (this.length > 0) {
        return this.buckets.one().one();
    }
};

FastSet.prototype.toArray = function () {
    return flatten(this.buckets.map(index));
};

FastSet.prototype.iterate = function () {
    return popIterate(this.toArray());
};

FastSet.prototype.log = function (charmap, logNode, callback, thisp) {
    charmap = charmap || treeLog.unicodeSharp;
    logNode = logNode || this.logNode;
    if (!callback) {
        callback = console.log;
        thisp = console;
    }

    // Bind is unavailable in PhantomJS, the only environment of consequence
    // that does not implement it yet.
    var originalCallback = callback;
    callback = function () {
        return originalCallback.apply(thisp, arguments);
    };

    var buckets = this.buckets;
    var hashes = buckets.keys();
    hashes.forEach(function (hash, index$$1) {
        var branch;
        var leader;
        if (index$$1 === hashes.length - 1) {
            branch = charmap.fromAbove;
            leader = ' ';
        } else if (index$$1 === 0) {
            branch = charmap.branchDown;
            leader = charmap.strafe;
        } else {
            branch = charmap.fromBoth;
            leader = charmap.strafe;
        }
        var bucket = buckets.get(hash);
        callback.call(thisp, branch + charmap.through + charmap.branchDown + ' ' + hash);
        bucket.forEach(function (value, node) {
            var branch, below;
            if (node === bucket.head.prev) {
                branch = charmap.fromAbove;
                below = ' ';
            } else {
                branch = charmap.fromBoth;
                below = charmap.strafe;
            }
            var written;
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
    });
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

function flatten(arrays) {
    return Array.prototype.concat.apply([], arrays);
}

function noop() {}



var FastSet$1 = Object.freeze({
	default: fastSet,
	__moduleExports: fastSet
});

// DataRowCollection.ts
var DataRowCollection = (function () {
    function DataRowCollection(dataTable) {
        this._store = new FastSet$1([], function (a, b) {
            return a._id === b._id;
        }, function (row) {
            return row._id;
        });
        if (dataTable === void 0) {
            throw new Error("Illegal DataRowCollection constructor: " +
                "expected DataTable as first argument");
        }
        this._table = dataTable;
    }
    Object.defineProperty(DataRowCollection.prototype, "size", {
        get: function () {
            var deletedRows = this._stagedRowDeletions ?
                this._stagedRowDeletions.length : 0;
            return this._store.length - deletedRows;
        },
        enumerable: true,
        configurable: true
    });
    DataRowCollection.prototype.has = function (keyValue) {
        var primaryKey;
        var foundId;
        if (primaryKey = this._table.primaryKey) {
            for (var _i = 0, primaryKey_1 = primaryKey; _i < primaryKey_1.length; _i++) {
                var column = primaryKey_1[_i];
                if (!column.findId(keyValue)) {
                    return false;
                }
            }
        }
        return true;
    };
    DataRowCollection.prototype.get = function (keyValue) {
        var primaryKey;
        if (primaryKey = this._table.primaryKey) {
            // let's only support single column keys for now
            //*
            keyValue = Array.isArray(keyValue) ? keyValue[0] : keyValue;
            //*/
            return primaryKey[0].find(keyValue);
        }
    };
    /**
     * @internal
     */
    DataRowCollection.prototype._getWithId = function (id) {
        return this._store.get({ _id: id });
    };
    DataRowCollection.prototype.add = function (rowOrData) {
        var row = rowOrData instanceof DataRow ?
            rowOrData : new DataRow(rowOrData);
        if (this._store.add(row)) {
            return row._addRowToCollection(this);
        }
        this.size;
        return false;
    };
    DataRowCollection.prototype.delete = function (keyOrRow) {
        var row = (keyOrRow instanceof DataRow) ?
            keyOrRow : this.get(keyOrRow);
        if (row) {
            row._onDelete();
            // check if row is new (i.e. recently added)
            if (row.rowState & (exports.DataRowState.ADDED | exports.DataRowState.DETACHED)) {
                this._commitDelete(row);
            }
            else {
                this._stageDelete(row);
            }
            this._table.onRowDeleted.publish({ row: row });
        }
        // row is not in this collection
        return false;
    };
    DataRowCollection.prototype._stageDelete = function (row) {
        var rows = this._stagedRowDeletions = this._stagedRowDeletions || [];
        if (rows.indexOf(row._id) < 0) {
            rows.push(row._id);
        }
    };
    DataRowCollection.prototype._commitDelete = function (row) {
        row._free();
        return this._store.delete(row);
    };
    DataRowCollection.prototype.clear = function () {
        this._store.clear();
    };
    DataRowCollection.prototype.find = function (predicate, thisArg) {
        var primaryKey = this._table.primaryKey;
        var row, key, iterator = this._store.iterate(), result;
        while (!(result = iterator.next()).done) {
            row = result.value;
            // only support single column (non-compound) primary keys
            key = primaryKey ? row.get(primaryKey) : void 0;
            if (predicate.call(thisArg, row, key, this)) {
                return row;
            }
        }
    };
    DataRowCollection.prototype.iterate = function () {
        return this._store.iterate();
    };
    DataRowCollection.prototype.forEach = function (callback, thisArg, filter) {
        filter = filter !== void 0 ?
            filter : ~(exports.DataRowState.DELETED | exports.DataRowState.DETACHED);
        var self = this;
        var primaryKey = this._table.primaryKey[0];
        this._store.forEach(function (row, index, collection) {
            if (row.rowState & filter) {
                callback.call(thisArg, row, row.get(primaryKey), self);
            }
        });
    };
    Object.defineProperty(DataRowCollection.prototype, "table", {
        get: function () {
            return this._table;
        },
        enumerable: true,
        configurable: true
    });
    return DataRowCollection;
}());

// DataTable.ts
//import { EventEmitter2 as EventEmitter } from 'EventEmitter2'
var dt_counter = 0;
var DataTable = (function () {
    function DataTable(name) {
        this.name = name;
        this.onRowDeleted = new EventEmitter();
        dt_counter++;
        this.name = name || "Table " + dt_counter;
        // collections are created here so they can be initialized
        // after all Observables have been created
        this._rowCollection = new DataRowCollection(this);
        this._columnCollection = new DataColumnCollection(this);
    }
    Object.defineProperty(DataTable.prototype, "dataSet", {
        get: function () {
            return this._dataSet;
        },
        set: function (dataSet) {
            this._dataSet = dataSet;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(DataTable.prototype, "rows", {
        get: function () {
            return this._rowCollection;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(DataTable.prototype, "columns", {
        get: function () {
            return this._columnCollection;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(DataTable.prototype, "primaryKey", {
        get: function () {
            return this._primaryKey;
        },
        set: function (columns) {
            if (Array.isArray(columns)) {
                if (this._primaryKey && this._primaryKey.every(function (col, ndx) {
                    return col === columns[ndx];
                })) {
                    // primary key hasn't changed, so skip
                    return;
                }
                this._primaryKey = columns;
            }
            else {
                throw new TypeError("primary key must be a DataColumn array");
            }
        },
        enumerable: true,
        configurable: true
    });
    DataTable.prototype.acceptChanges = function () {
        this.rows.forEach(function (dr) {
            dr.acceptChanges();
        });
    };
    DataTable.prototype.toString = function () {
        return this.name;
    };
    /**
     * @internal
     */
    DataTable.prototype._addTableToCollection = function (collection) {
        if (this.dataSet = collection.dataSet) {
            return true;
        }
        return false;
    };
    return DataTable;
}());

// DataView.js
var DataView = (function () {
    function DataView() {
    }
    return DataView;
}());

var fastMap = FastMap;

function FastMap(values, equals, hash, getDefault) {
    if (!(this instanceof FastMap)) {
        return new FastMap(values, equals, hash, getDefault);
    }
    equals = equals || popEquals;
    hash = hash || popHash;
    getDefault = getDefault || this.getDefault;
    this.contentEquals = equals;
    this.contentHash = hash;
    this.getDefault = getDefault;
    this.store = new fastSet(
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

FastMap.FastMap = FastMap; // hack for MontageJS

copy_1(FastMap.prototype, genericCollection.prototype);
copy_1(FastMap.prototype, genericMap.prototype);
copy_1(FastMap.prototype, observableObject.prototype);

FastMap.prototype.constructClone = function (values) {
    return new this.constructor(
        values,
        this.contentEquals,
        this.contentHash,
        this.getDefault
    );
};

FastMap.prototype.log = function (charmap, stringify) {
    stringify = stringify || this.stringify;
    this.store.log(charmap, stringify);
};

FastMap.prototype.stringify = function (item, leader) {
    return leader + JSON.stringify(item.key) + ": " + JSON.stringify(item.value);
};



var FastMap$1 = Object.freeze({
	default: fastMap,
	__moduleExports: fastMap
});

// IndexedDataColumn.ts
var GenericIndexedDataColumn = (function (_super) {
    __extends(GenericIndexedDataColumn, _super);
    function GenericIndexedDataColumn() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        // will only store unique values. must find a replacement
        // or make a switch based on constraints (UniqueConstraint)
        _this._index = new FastMap$1();
        return _this;
    }
    GenericIndexedDataColumn.prototype.find = function (value) {
        return this.table.rows._getWithId(this._index.get(value));
    };
    GenericIndexedDataColumn.prototype.findId = function (value) {
        return this._index.get(value);
    };
    GenericIndexedDataColumn.prototype.setValue = function (store, value, row) {
        var oldValue = this.getValue(store, row);
        if (_super.prototype.setValue.call(this, store, value, row)) {
            this._index.delete(oldValue);
            this._index.set(value, row._id);
            return true;
        }
        return false;
    };
    GenericIndexedDataColumn.prototype.deleteValue = function (store, row) {
        var oldValue = this.getValue(store, row);
        if (_super.prototype.deleteValue.call(this, store, row)) {
            this._index.delete(oldValue);
            return true;
        }
        return false;
    };
    return GenericIndexedDataColumn;
}(GenericDataColumn));
var IndexedDataColumn = GenericIndexedDataColumn;

// DataColumnConstraint.ts

(function (DataColumnConstraint) {
    DataColumnConstraint[DataColumnConstraint["PRIMARY_KEY"] = 0] = "PRIMARY_KEY";
    DataColumnConstraint[DataColumnConstraint["UNIQUE"] = 1] = "UNIQUE";
    DataColumnConstraint[DataColumnConstraint["INDEX"] = 2] = "INDEX";
})(exports.DataColumnConstraint || (exports.DataColumnConstraint = {}));

// DataRelation.ts
var rel_counter = 0;
var DataRelation = (function () {
    function DataRelation(childColumn, parentColumn, name) {
        if (parentColumn.table.dataSet !== childColumn.table.dataSet) {
            throw new TypeError("columns must be from the same DataSet");
        }
        this._dataSet = parentColumn.table.dataSet;
        this._parent = parentColumn;
        this._child = childColumn;
        this.name = rel_counter++ && name || "DataRelation " + rel_counter;
    }
    Object.defineProperty(DataRelation.prototype, "dataSet", {
        get: function () {
            return this._dataSet;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(DataRelation.prototype, "parentColumn", {
        get: function () {
            return this._parent;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(DataRelation.prototype, "childColumn", {
        get: function () {
            return this._child;
        },
        enumerable: true,
        configurable: true
    });
    DataRelation.prototype.getChildRows = function (oRow) {
        var parentColumn = this.parentColumn;
        var childColumn = this.childColumn;
        if (parentColumn.table !== oRow.table) {
            throw new Error("Parent Row must belong to table: " + parentColumn.table);
        }
        return childColumn.findAll(oRow.get(parentColumn));
    };
    DataRelation.prototype.getParentRow = function (oRow) {
        var parentColumn = this.parentColumn;
        var childColumn = this.childColumn;
        if (childColumn.table !== oRow.table) {
            throw new Error("Child Row must belong to table: " + childColumn.table);
        }
        return parentColumn.find(oRow.get(childColumn));
    };
    /**
     * @internal
     * Prepare relation to be added to DataRelationCollection
     */
    DataRelation.prototype._addRelationToCollection = function (collection) {
        if (this._dataSet = collection.dataSet) {
            return true;
        }
        return false;
    };
    return DataRelation;
}());

var util = coreUtil;

exports.util = util;
exports.DataSet = DataSet;
exports.DataTable = DataTable;
exports.DataTableCollection = DataTableCollection;
exports.DataView = DataView;
exports.DataRow = DataRow;
exports.DataRowCollection = DataRowCollection;
exports.DataColumn = DataColumn;
exports.IndexedDataColumn = IndexedDataColumn;
exports.DataColumnCollection = DataColumnCollection;
exports.DataRelation = DataRelation;
