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
//# sourceMappingURL=DataRowState.js.map