var DataTable = require("../build/core/DataTable").DataTable;
var DataColumn = require("../build/core/DataColumn").DataColumn;

describe("arga.DataColumn", function() {
    var dt = new DataTable();
    var dc = new DataColumn(dt);
    beforeEach(function() {
        dc = new DataColumn(dt);
    })

    /*
    it("should throw error", function() {
        function createDataColumnWithoutTable() {
            var dc = new DataColumn();
        }
        expect(createDataColumnWithoutTable).toThrow();
    })
    */
})