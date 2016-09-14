// DataRow.js
"use strict";
var DataRowState = require('./DataRowState');
var DataRowVersion = require('./DataRowVersion');
var DataRow = (function () {
    function DataRow() {
        this._original = {};
        this._current = Object.create(this._original);
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
    DataRow.prototype.rowState = function () {
        /*
         * should probably implement this with biflags,
         * but here it is for now
         */
        if (this._current === undefined) {
            return DataRowState.DELETED;
        }
        if (this.table() === undefined) {
            return DataRowState.DETACHED;
        }
        if (Object.keys(this._current).length == 0) {
            return DataRowState.UNCHANGED;
        }
        // currently not implementing 'DataRowState.PROPOSED'
        return DataRowState.MODIFIED;
    };
    DataRow.prototype.isEditing = function () {
        return !!this._proposed;
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
        Object.keys(this._current).forEach(function (key, i) {
            this._original[key] = this._current[key];
        });
        this._current = Object.create(this._original);
    };
    DataRow.prototype.rejectChanges = function () {
        this._current = Object.create(this._original);
    };
    return DataRow;
}());
module.exports = DataRow;
