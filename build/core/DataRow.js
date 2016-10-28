// DataRow.js
"use strict";
var DataRowState_1 = require('./DataRowState');
var DataRowVersion_1 = require('./DataRowVersion');
var eventemitter2_1 = require('eventemitter2');
var Util_1 = require('./Util');
var DataRow = (function () {
    function DataRow(values) {
        this.observable = new eventemitter2_1.EventEmitter2();
        /**
         * _original is set to undefined, and
         * _current is an empty object so we
         * start off as DataRowState.ADDED
         */
        this._original = void 0;
        this._current = this._createCurrent();
    }
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
    DataRow.prototype._createOriginal = function () {
        return Object.create(null);
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
    DataRow.prototype.has = function (key, version) {
        var searchObject = this._getVersion(version);
        for (var member in searchObject) {
            if (member === key) {
                return true;
            }
        }
        return false;
    };
    DataRow.prototype.get = function (keyOrColumn, version) {
        var _this = this;
        if (typeof keyOrColumn === "string") {
            var key = keyOrColumn;
            return this._getItemWithKey(key, version);
        }
        if (Array.isArray(keyOrColumn)) {
            return keyOrColumn.map(function (column) { return _this.get(column); });
        }
        var column = keyOrColumn;
        return this._getItemWithColumn(column, version);
    };
    DataRow.prototype._getItemWithKey = function (key, version) {
        var data = this._getVersion(version);
        if (data === void 0 || data === null) {
            return void 0;
        }
        else {
            return data[key];
        }
    };
    DataRow.prototype._getItemWithColumn = function (column, version) {
        var data = this._getVersion(version);
        if (data === void 0 || data === null) {
            return void 0;
        }
        else {
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
    DataRow.prototype.set = function (valsOrKeyOrColumn, value) {
        switch (typeof valsOrKeyOrColumn) {
            case "string":
                var key = valsOrKeyOrColumn;
                //var value: T = valOrVersion;
                return this._setItem(key, value);
            case "object":
                if (isDataColumn(valsOrKeyOrColumn)) {
                    var column = valsOrKeyOrColumn;
                    column.setValue(this, value);
                    return this;
                }
                else {
                    var values = valsOrKeyOrColumn;
                    return this._setItems(values);
                }
        }
        return this;
    };
    DataRow.prototype._setItems = function (values) {
        for (var key in values) {
            this._setItem(key, values[key]);
        }
        return this;
    };
    DataRow.prototype._setItem = function (key, newValue) {
        // bitwise check (&) in case rowState() is 
        // changed to return a set of flags in
        // future versions
        if (this.rowState() & DataRowState_1.DataRowState.DELETED) {
            throw new Error("Row already deleted");
        }
        if (this.isEditing()) {
            this._proposed = this._proposed || this._createProposed();
            this._proposed[key] = newValue;
        }
        else {
            this._current = this._current || this._createCurrent();
            this._current[key] = newValue;
        }
        return this;
    };
    DataRow.prototype.del = function (key) {
        if (this.has(key)) {
            this._setItem(key, null);
            return true;
        }
        return false;
    };
    DataRow.prototype.delete = function () {
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
    DataRow.prototype.dispatchBeforeRowChange = function (args) {
        this.observable.emit("beforechange", args);
    };
    DataRow.prototype.dispatchRowChange = function (args) {
        this.observable.emit("change", args);
    };
    DataRow.prototype.dispatchBeforeDelete = function () {
        this.observable.emit("beforedeleted");
    };
    DataRow.prototype.dispatchDelete = function () {
        this.observable.emit("deleted");
    };
    return DataRow;
}());
exports.DataRow = DataRow;
//*
function isDataColumn(dc) {
    return (typeof dc.getValue === "function" && typeof dc.setValue === "function");
}
//# sourceMappingURL=DataRow.js.map