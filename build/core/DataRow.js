// DataRow.js
"use strict";
var DataRowState_1 = require("./DataRowState");
var DataRowVersion_1 = require("./DataRowVersion");
var DataColumn_1 = require("./DataColumn");
var Util_1 = require("./Util");
var eventemitter2_1 = require("eventemitter2");
var Dict = require("dict");
var DataRow = (function () {
    function DataRow(values, table) {
        this._observable = new eventemitter2_1.EventEmitter2();
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
        return {};
    };
    DataRow.prototype._createCurrent = function () {
        return Object.create(this._original || null);
    };
    DataRow.prototype._createProposed = function () {
        return Object.create(this._current || null);
    };
    /**
     *
     */
    DataRow.prototype.rowState = function () {
        /**
         *  __________________________________
         * | _original | _current |   state   |
         * |-----------|----------|-----------|
         * | undefined | undefined|   ERROR   |
         * | undefined |    {}    |   ADDED   |
         * | undefined |   null   |  DELETED  | deleted immediately (won't wait to sync)
         * |     {}    | undefined| UNCHANGED |
         * |     {}    |    {}    | MODIFIED  |
         * |     {}    |   null   |  DELETED  |
         * |___________|__________|___________|
         *
         */
        if (this._table === void 0) {
            return DataRowState_1.DataRowState.DETACHED;
        }
        if (this._current === null) {
            return DataRowState_1.DataRowState.DELETED;
        }
        if (this._original === void 0) {
            return DataRowState_1.DataRowState.ADDED;
        }
        return this._current === void 0 ? DataRowState_1.DataRowState.UNCHANGED : DataRowState_1.DataRowState.MODIFIED;
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
        var data = this._getVersion(version);
        if (data != null) {
            return this.table().columns(key).getValue(data);
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
        var store = this.isEditing() ? this._proposed : this._current;
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
            this.dispatchBeforeDelete();
            this.dispatchDelete();
        }
    };
    DataRow.prototype.getChildRows = function (relation) {
        return relation.getChildRows(this);
    };
    DataRow.prototype.getParentRow = function (relation) {
        return relation.getParentRow(this);
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
        this.dispatchBeforeRowChange({ type: "modify" });
        var self = this;
        Object.keys(this._proposed).forEach(function (key) {
            self._current[key] = self._proposed[key];
        });
        delete this._proposed;
        this.dispatchRowChange({ type: "modify" });
    };
    DataRow.prototype.acceptChanges = function () {
        if (this.isEditing()) {
            this.endEdit();
        }
        /**
         * copy all the changes from _current onto _original,
         */
        this._original = Util_1.deepCopy(this._current) || this._createOriginal();
        delete this._current;
    };
    DataRow.prototype.rejectChanges = function () {
        if (this.isEditing()) {
            this.endEdit();
        }
        delete this._current;
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
    /**
     * Semi-private (i.e. friendly?) method
     * for adding row to the row collection.
     * Used by DataRowCollection#add()
     */
    DataRow.prototype._addToCollection = function (collection) {
        // set the reference to the parent table 
        this.table(collection.table());
        // flush the cache
        var success = true;
        var self = this;
        if (this._detachedCache) {
            this._detachedCache.forEach(function (value, key, dict) {
                success = success && self._setItemWithKey(key, value);
            });
            this._detachedCache.clear();
        }
        delete this._detachedCache;
        return success;
    };
    DataRow.prototype.dispatchBeforeRowChange = function (args) {
        this._observable.emit("beforechange", args);
    };
    DataRow.prototype.dispatchRowChange = function (args) {
        this._observable.emit("change", args);
    };
    DataRow.prototype.dispatchBeforeDelete = function () {
        this._observable.emit("beforedeleted");
    };
    DataRow.prototype.dispatchDelete = function () {
        this._observable.emit("deleted");
    };
    /**
     * Facade for the _observable#on
     */
    DataRow.prototype.on = function (event, listener) {
        this._observable.on(event, listener);
        return this;
    };
    /**
     * Facade for the _observable#on
     */
    DataRow.prototype.off = function (event, listener) {
        this._observable.off(event, listener);
        return this;
    };
    return DataRow;
}());
exports.DataRow = DataRow;
//*
function isDataColumn(dc) {
    return dc instanceof DataColumn_1.GenericDataColumn;
}
