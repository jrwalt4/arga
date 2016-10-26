var DataTable = require('../build/core/DataTable').DataTable;
var DataSet = require('../build/core/DataSet').DataSet;

describe("arga.DataTable", function() {
    var dr = new DataTable();

    beforeEach(function() {
        dr = new DataTable();
    });

    it("should create a DataTable with provided name", function() {
        var tblName = "DataTable 1";
        var dt = new DataTable(tblName);
        expect(dt.name()).toBe(tblName);
    })
})