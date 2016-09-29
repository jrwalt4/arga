// DataRow.js
"use strict";
var DataRowState = require('./DataRowState');
var DataRowVersion = require('./DataRowVersion');
var Util_1 = require('./Util');
var DataRow = (function () {
    function DataRow(dataTable, values) {
        if (dataTable === void 0) {
            throw new Error("Cannot construct DataRow without DataTable");
        }
        this._table = dataTable;
        if (values !== void 0 && typeof values === "object") {
            this._original = Util_1.deepCopy(values);
        }
        else {
            this._original = null;
        }
    }
    DataRow.prototype._createCurrent = function () {
        this._original = this._original || null;
        return Object.create(this._original);
    };
    DataRow.prototype._createProposed = function () {
        if (this.rowState() === DataRowState.DELETED) {
            throw new Error("Cannot create proposed after deleting row");
        }
        if (this._current === void 0) {
            this._current = this._createCurrent();
        }
        return Object.create(this._current);
    };
    DataRow.prototype.get = function (keyOrColumn, version) {
        switch (typeof keyOrColumn) {
            case "string":
                var key = keyOrColumn;
                return this._getItemWithKey(key, version);
            case "object":
                var column = keyOrColumn;
                return this._getItemWithColumn(column, version);
        }
    };
    DataRow.prototype.set = function (valsOrKey, valOrVersion, version) {
        switch (typeof valsOrKey) {
            case "string":
                var key = valsOrKey;
                var value = valOrVersion;
                return this._setItem(key, value, version);
            case "object":
                var values = valsOrKey;
                var version = valOrVersion;
                return this._setItems(values, version);
        }
    };
    DataRow.prototype.del = function (key) {
        this._setItem(key, null);
    };
    DataRow.prototype.has = function (key, version) {
        var searchObject = this._getVersion(version);
        for (var member in searchObject) {
            if (member == key) {
                return true;
            }
        }
        return false;
    };
    DataRow.prototype.delete = function (version) {
        if (this.isEditing()) {
            this._proposed = null;
        }
        else {
            this._current = null;
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
    DataRow.prototype._getItemWithKey = function (key, version) {
        var data = this._getVersion(version);
        if (data === void 0 || data === null) {
            return void 0;
        }
        else {
            return data[key];
        }
    };
    DataRow.prototype._setItem = function (column, newValue, version) {
        if (version === DataRowVersion.ORIGINAL) {
            throw new Error("Cannot write to original version");
        }
        if (this.rowState() === DataRowState.DELETED) {
            throw new Error("Row already deleted");
        }
        this._getVersion(version)[column] = newValue;
        return this;
    };
    DataRow.prototype._setItems = function (values, version) {
        for (var key in values) {
            this._setItem(key, values[key]);
        }
        return this;
    };
    DataRow.prototype._getVersion = function (version) {
        if (version === void 0) { version = DataRowVersion.DEFAULT; }
        switch (version) {
            case DataRowVersion.DEFAULT:
                if (this.isEditing()) {
                    return this._proposed ||
                        (this._proposed = this._createProposed());
                }
                else {
                    return this._current ||
                        (this._current = this._createCurrent());
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
    DataRow.prototype._getColumn = function (name) {
        return this.table().columns().get(name);
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
         * should probably implement this with bitmask,
         * but here it is for now
         */
        if (this._table === void 0) {
            return DataRowState.DETACHED;
        }
        if (this._original === null) {
            return DataRowState.ADDED;
        }
        if (this._current === null) {
            return DataRowState.DELETED;
        }
        if (this._current === void 0) {
            return DataRowState.UNCHANGED;
        }
        return DataRowState.MODIFIED;
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
        this.dispatchBeforeRowChange();
        var self = this;
        Object.keys(this._proposed).forEach(function (key) {
            self._current[key] = self._proposed[key];
        });
        delete this._proposed;
        this.dispatchRowChange();
    };
    DataRow.prototype.acceptChanges = function () {
        // need to fix
        var self = this;
        var newOriginal = Util_1.deepCopy(this._current);
        this._original = newOriginal;
        this._current = this._createCurrent();
    };
    DataRow.prototype.rejectChanges = function () {
        this._current = this._createCurrent();
    };
    DataRow.prototype.dispatchRowChange = function () {
    };
    DataRow.prototype.dispatchBeforeRowChange = function () {
    };
    return DataRow;
}());
module.exports = DataRow;
//# sourceMappingURL=DataRow.js.map