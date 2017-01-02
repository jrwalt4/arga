// DataRow.js
"use strict";
var DataTable_1 = require("./DataTable");
var DataRowState_1 = require("./DataRowState");
var DataRowVersion_1 = require("./DataRowVersion");
var DataColumn_1 = require("./DataColumn");
var Util_1 = require("./Util");
var Dict = require("dict");
var DataRow = (function () {
    function DataRow(values, table) {
        this._table = table;
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
    DataRow.prototype._createOriginal = function () {
        return new Util_1.EmptyObject();
    };
    DataRow.prototype._createCurrent = function () {
        return Object.create(this._original || null);
    };
    DataRow.prototype._createProposed = function () {
        return Object.create(this._current || null);
    };
    /**
     * returns The DataRowState that this row is currently in
     * @return {DataRowState} rowState - the current DataRowState
     */
    DataRow.prototype.rowState = function () {
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
                return DataRowState_1.DataRowState.UNCHANGED;
            }
            if (this._current === null) {
                return DataRowState_1.DataRowState.DELETED;
            }
            return this._original ? DataRowState_1.DataRowState.MODIFIED : DataRowState_1.DataRowState.ADDED;
        }
        return DataRowState_1.DataRowState.DETACHED;
    };
    /**
     * Returns whether the key or column is defined on this row
     */
    DataRow.prototype.has = function (key, version) {
        var searchObject = this._getVersion(version);
        for (var member in searchObject) {
            if (member === key) {
                return true;
            }
        }
        return false;
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
        if (this.rowState() & DataRowState_1.DataRowState.DETACHED) {
            return this._getCache(key);
        }
        var store = this._getVersion(version);
        if (store != null) {
            return this.table().columns(key).getValue(store);
        }
    };
    DataRow.prototype._getItemWithColumn = function (column, version) {
        var data = this._getVersion(version);
        if (data != null) {
            return column.getValue(data);
        }
    };
    DataRow.prototype._getVersion = function (version) {
        if (version === void 0) { version = DataRowVersion_1.DataRowVersion.DEFAULT; }
        switch (version) {
            case DataRowVersion_1.DataRowVersion.DEFAULT:
                if (this.isEditing()) {
                    return this._proposed ||
                        (this._proposed = this._createProposed());
                }
                else {
                    return this._current ||
                        (this._current = this._createCurrent());
                }
            case DataRowVersion_1.DataRowVersion.CURRENT:
                return this._current;
            case DataRowVersion_1.DataRowVersion.ORIGINAL:
                return this._original;
            case DataRowVersion_1.DataRowVersion.PROPOSED:
                return this._proposed;
            default:
                throw new Error("DataRowVersion {" + version + "} is not recognized");
        }
    };
    DataRow.prototype._getCache = function (key) {
        var dict = this._detachedCache || (this._detachedCache = Dict());
        return dict.get(key);
    };
    DataRow.prototype.set = function (valsOrKeyOrColumn, value) {
        switch (typeof valsOrKeyOrColumn) {
            case "string":
                return this._setItemWithKey(valsOrKeyOrColumn, value);
            case "object":
                if (isDataColumn(valsOrKeyOrColumn)) {
                    return valsOrKeyOrColumn.setValue(this, value);
                }
                else {
                    return this._setItems(valsOrKeyOrColumn);
                }
        }
        throw new TypeError("invalid arguments passed to DataRow#set: " + valsOrKeyOrColumn);
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
        var store = this.isEditing() ? this._proposed : this._current || (this._current = this._createCurrent());
        return column.setValue(store, value);
    };
    DataRow.prototype._setItemWithKey = function (key, value) {
        var state = this.rowState();
        /**
         * bitwise check (&) in case rowState() is
         * changed to return a set of flags in
         * future versions
         */
        if (state & DataRowState_1.DataRowState.DELETED) {
            throw new Error("Row already deleted");
        }
        /**
         * if DataRow hasn't been added to a
         * DataRowCollection yet, cache the
         * key(i.e. ColumnName) and value to
         * be set when the row is added.
         */
        if (state & DataRowState_1.DataRowState.DETACHED) {
            return this._setCache(key, value);
        }
        /**
         * search for column on parent table
         * and use it to set the value;
         */
        var table, column;
        if (table = this.table()) {
            if (column = table.columns().get(key)) {
                return this._setItemWithColumn(column, value);
            }
            else {
                /**
                 * if the column could not be found on the table
                 * we create one with that key, add it to the table,
                 * and use it to set the value
                 */
                column = new DataColumn_1.DataColumn(key);
                if (table.columns().add(column)) {
                    return this._setItemWithColumn(column, value);
                }
            }
        }
        else {
            // somehow the row is not DETACHED but the table is not defined
            throw new Error("Cannot find DataRow#table");
        }
    };
    DataRow.prototype._setCache = function (key, value) {
        var dict = this._detachedCache || (this._detachedCache = new Dict());
        if (dict.set(key, value)) {
            return true;
        }
        return false;
    };
    DataRow.prototype.del = function (key) {
        if (this.has(key)) {
            this._setItemWithKey(key, null);
            return true;
        }
        return false;
    };
    DataRow.prototype.deleteRow = function () {
        if (this.isEditing()) {
            this._proposed = null;
        }
        else {
            this._current = null;
        }
        if (this.rowState() & DataRowState_1.DataRowState.ADDED) {
            this.dispatchDelete();
        }
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
        this._original = Util_1.deepCopy(this._current) || this._createOriginal();
        this._current = void 0;
    };
    DataRow.prototype.rejectChanges = function () {
        if (this.isEditing()) {
            this.endEdit();
        }
        delete this._current;
    };
    DataRow.prototype.table = function (table) {
        if (table instanceof DataTable_1.DataTable) {
            this._table = table;
            return this;
        }
        return this._table;
    };
    /**
     * Semi-private (i.e. friendly?) method for adding row
     * to a row collection. Used by DataRowCollection#add()
     */
    DataRow.prototype._addToCollection = function (collection) {
        // set the reference to the parent table 
        this.table(collection.table());
        var success = true;
        if (this._detachedCache) {
            // flush the cache
            var self_1 = this;
            this._detachedCache.forEach(function (value, key, dict) {
                success = success && self_1._setItemWithKey(key, value);
            });
            // cleanup cache to prevent memory leaks
            this._detachedCache.clear();
            delete this._detachedCache;
        }
        return success;
    };
    DataRow.prototype.dispatchAdd = function () {
    };
    DataRow.prototype.dispatchChange = function (keyOrColumn, newValue, oldValue) {
        this.table().emit({
            row: this,
            type: 'rowchanged',
            column: keyOrColumn instanceof DataColumn_1.DataColumn ? keyOrColumn : this.table().columns(keyOrColumn)
        });
    };
    DataRow.prototype.dispatchDelete = function () {
    };
    return DataRow;
}());
exports.DataRow = DataRow;
function isDataColumn(dc) {
    return dc instanceof DataColumn_1.GenericDataColumn;
}
