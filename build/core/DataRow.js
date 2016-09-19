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
        this._proposed = this._createProposed();
    }
    DataRow.prototype._createCurrent = function () {
        return Object.create(this._original);
    };
    DataRow.prototype._createProposed = function () {
        if (this._current == void 0) {
            throw new Error("DataRow._current has been deleted");
        }
        return Object.create(this._current);
    };
    DataRow.prototype.get = function (key, version) {
        return this._getItem(key, version);
    };
    DataRow.prototype.set = function (key, newValue, version) {
        return this._setItem(key, newValue, version);
    };
    DataRow.prototype.del = function (key) {
        this._setItem(key, null);
    };
    DataRow.prototype.has = function (key) {
        return Object.keys(this._current).indexOf(key) >= 0 ||
            Object.keys(this._original).indexOf(key) >= 0;
    };
    DataRow.prototype.delete = function (version) {
        if (this.isEditing()) {
            this._proposed = null;
        }
        else {
            this._current = null;
        }
    };
    DataRow.prototype.item = function (key, newValue, version) {
        if (newValue !== undefined) {
            return this._setItem(key, newValue, version);
        }
        else {
            return this._getItem(key, version);
        }
    };
    DataRow.prototype._getItem = function (key, version) {
        var column = this._getColumn(key);
        if (column === void 0) {
            return this._getVersion(version)[key];
        }
        else {
            return column.getValue(this._getVersion(version));
        }
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
        if (this._current === null) {
            return DataRowState.DELETED;
        }
        if (Object.keys(this._current).length === 0) {
            return DataRowState.UNCHANGED;
        }
        /* not sure if a DataRowState.PROPOSED is needed
        if (Object.keys(this._proposed).length !== 0){
            return DataRowState.PROPOSED
        }
        //*/
        if (this._table === undefined) {
            return DataRowState.DETACHED;
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
        var self = this;
        Object.keys(this._current).forEach(function (key, i) {
            var value = self._current[key];
            if (value === null) {
                delete self._original[key];
            }
            else {
                self._original[key] = self._current[key];
            }
        });
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