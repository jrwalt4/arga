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
//# sourceMappingURL=DataRow.js.map