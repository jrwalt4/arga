(function() {
    // DataColumn.ts
    var arga;
    (function(arga) {
        var DataColumn = (function() {
            function DataColumn() {}
            DataColumn.prototype.name = function(sName) {
                if (sName !== undefined) {
                    this._name = sName;
                    return this;
                }
                return this._name;
            };
            return DataColumn;
        }());
        arga.DataColumn = DataColumn;
    })(arga || (arga = {}));
    // DataColumnConstraint.ts
    var DataColumnConstraint;
    (function(DataColumnConstraint) {
        DataColumnConstraint[DataColumnConstraint["PRIMARY_KEY"] = 0] = "PRIMARY_KEY";
        DataColumnConstraint[DataColumnConstraint["UNIQUE"] = 1] = "UNIQUE";
        DataColumnConstraint[DataColumnConstraint["INDEX"] = 2] = "INDEX";
    })(DataColumnConstraint || (DataColumnConstraint = {}));
    // DataRelation.ts
    var arga;
    (function(arga) {
        var DataRelation = (function() {
            function DataRelation(_parent, _child, _operator) {
                this._parent = _parent;
                this._child = _child;
                this._operator = _operator;
            }
            DataRelation.prototype.getChildRows = function(oRow) {
                return [new arga.DataRow];
            };
            DataRelation.prototype.getParentRow = function(oRow) {
                return new arga.DataRow;
            };
            return DataRelation;
        }());
        arga.DataRelation = DataRelation;
    })(arga || (arga = {}));
    // DataRow.js
    var arga;
    (function(arga) {
        var DataRow = (function() {
            function DataRow() {
                this._original = {};
                this._current = Object.create(this._original);
            }
            DataRow.prototype.table = function(oDataTable) {
                if (oDataTable !== undefined) {
                    if (oDataTable === null) {
                        this._table = undefined;
                    } else {
                        this._table = oDataTable;
                    }
                    return this;
                }
                return this._table;
            };
            DataRow.prototype.rowState = function() {
                /*
                 * should probably implement this with biflags,
                 * but here it is for now
                 */
                if (this._current === undefined) {
                    return arga.DataRowState.DELETED;
                }
                if (this.table() === undefined) {
                    return arga.DataRowState.DETACHED;
                }
                if (Object.keys(this._current).length == 0) {
                    return arga.DataRowState.UNCHANGED;
                }
                // currently not implementing 'DataRowState.PROPOSED'
                return arga.DataRowState.MODIFIED;
            };
            DataRow.prototype.isEditing = function() {
                return !!this._proposed;
            };
            DataRow.prototype.get = function() {};
            DataRow.prototype.set = function() {};
            DataRow.prototype.del = function() {};
            DataRow.prototype.has = function() {
                return true;
            };
            DataRow.prototype.item = function(column, newValue, version) {
                if (newValue !== undefined) {
                    return this._setItem(column, newValue, version);
                } else {
                    return this._getItem(column, version);
                }
            };
            DataRow.prototype._getItem = function(column, version) {
                return this._getVersion(version)[column];
            };
            DataRow.prototype._setItem = function(column, newValue, version) {
                if (this.rowState() == arga.DataRowState.DELETED) {
                    throw new Error("Row already deleted");
                }
                this._getVersion(version)[column] = newValue;
                return this;
            };
            DataRow.prototype._getVersion = function(version) {
                version = version || arga.DataRowVersion.DEFAULT;
                switch (version) {
                    case arga.DataRowVersion.DEFAULT:
                        if (this.isEditing()) {
                            return this._proposed;
                        } else {
                            return this._current;
                        }
                    case arga.DataRowVersion.CURRENT:
                        return this._current;
                    case arga.DataRowVersion.ORIGINAL:
                        return this._original;
                    case arga.DataRowVersion.PROPOSED:
                        return this._proposed;
                    default:
                        throw new Error("DataRowVersion {" + version + "} is not recognized");
                }
            };
            DataRow.prototype.acceptChanges = function() {
                Object.keys(this._current).forEach(function(key, i) {
                    this._original[key] = this._current[key];
                });
                this._current = Object.create(this._original);
            };
            DataRow.prototype.rejectChanges = function() {
                this._current = Object.create(this._original);
            };
            return DataRow;
        }());
        arga.DataRow = DataRow;
    })(arga || (arga = {}));
    // DataRowState.ts
    var arga;
    (function(arga) {
        (function(DataRowState) {
            DataRowState[DataRowState["DETACHED"] = 1] = "DETACHED";
            DataRowState[DataRowState["UNCHANGED"] = 2] = "UNCHANGED";
            DataRowState[DataRowState["ADDED"] = 4] = "ADDED";
            DataRowState[DataRowState["MODIFIED"] = 8] = "MODIFIED";
            DataRowState[DataRowState["DELETED"] = 16] = "DELETED";
        })(arga.DataRowState || (arga.DataRowState = {}));
        var DataRowState = arga.DataRowState;
    })(arga || (arga = {}));
    // DataRowVersion.ts
    var arga;
    (function(arga) {
        (function(DataRowVersion) {
            DataRowVersion[DataRowVersion["ORIGINAL"] = 0] = "ORIGINAL";
            DataRowVersion[DataRowVersion["CURRENT"] = 1] = "CURRENT";
            DataRowVersion[DataRowVersion["PROPOSED"] = 2] = "PROPOSED";
            DataRowVersion[DataRowVersion["DEFAULT"] = 3] = "DEFAULT";
        })(arga.DataRowVersion || (arga.DataRowVersion = {}));
        var DataRowVersion = arga.DataRowVersion;
    })(arga || (arga = {}));
    // DataSet.ts
    var arga;
    (function(arga) {
        var ds_counter = 0;
        var DataSet = (function() {
            function DataSet(name) {
                this._name = name;
                this._tables = [];
                this._relations = [];
                this.events = new EventEmitter;
            }
            DataSet.prototype.tables = function() {
                return this._tables.slice();
            };
            DataSet.prototype.addTable = function(oTable) {
                var tbl;
                if (typeof oTable === 'string') {
                    tbl = new arga.DataTable(oTable);
                } else {
                    tbl = oTable;
                }
                if (tbl.name() === undefined) {
                    tbl.name("Table" + this._tables.length);
                }
                this._tables.push(tbl);
            };;
            DataSet.prototype.acceptChanges = function() {
                this._tables.forEach(function(table) {
                    table.acceptChanges();
                });
            };;
            DataSet.prototype.getChanges = function() {};;
            DataSet.prototype.name = function(newValue) {
                if (newValue != undefined) {
                    this._name = newValue;
                }
                return this._name;
            };;
            return DataSet;
        }());
        arga.DataSet = DataSet;
    })(arga || (arga = {}));
    // DataTable.ts
    var arga;
    (function(arga) {
        var dt_counter = 0;
        var DataTable = (function() {
            function DataTable(sName, sKeyPath) {
                this._name = sName || "Table" + dt_counter++;
                this._rows = [];
                this._columns = [];
                this._keyPath = sKeyPath;
                this._keyComparer = arga.util.createKeyComparer(sKeyPath);
            }
            DataTable.prototype.name = function(sName) {
                if (sName !== undefined) {
                    this._name = sName;
                    return this;
                }
                return this._name;
            };
            DataTable.prototype.rows = function() {
                return this._rows.slice();
            };
            DataTable.prototype.addRow = function(oRow) {
                this._rows.push(oRow);
                oRow.table(this);
                return this;
            };
            DataTable.prototype.schema = function() {
                return this;
            };
            DataTable.prototype.columns = function() {
                return this._columns;
            };
            DataTable.prototype.keyPath = function() {
                return this._keyPath;
            };
            DataTable.prototype.acceptChanges = function() {
                this._rows.forEach(function(dr) {
                    dr.acceptChanges();
                });
            };
            return DataTable;
        }());
        arga.DataTable = DataTable;
    })(arga || (arga = {}));
    // DataView.js
    var arga;
    (function(arga) {
        var DataView = (function() {
            function DataView() {}
            return DataView;
        }());
        arga.DataView = DataView;
    })(arga || (arga = {}));
    // ICommandBuilder.js
    // IDataAdapter.js
    // IDataSchema.ts
    // Util.ts
    // Utilities used by arga.js
    var arga;
    (function(arga) {
        var util;
        (function(util) {
            function createKeyComparer(sKeyPath) {
                sKeyPath = sKeyPath || "";
                var path = sKeyPath.split('.');
                return function compare(key, compareValue) {
                    var keyValue = path.reduce(function(prevResult, nextVal) {
                        return prevResult[nextVal];
                    }, key);
                    return keyValue < compareValue ? -1 : (keyValue > compareValue ? 1 : 0);
                };
            }
            util.createKeyComparer = createKeyComparer;
        })(util = arga.util || (arga.util = {}));
    })(arga || (arga = {}));
    // IdbCommandBuilder.js 
    // IdbDataAdapter.js 
    // EventEmitter.js
    function EventEmitter() {
        this._callbacks = [];
    }
    EventEmitter.prototype.emit = function(event) {};

    if (typeof module !== 'undefined' && module.exports) {
        module.exports = arga;
    } else if (typeof define == 'function' && define.amd) {
        define('arga', function() {
            return arga;
        })
    }
    this['arga'] = arga;
})()