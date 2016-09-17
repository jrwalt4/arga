var DataTable = require('../build/core/DataTable');

describe("Test suite for arga.DataTable", function() {
    it("should create a DataTable named DataTable0", function() {
        var dt = new DataTable();
        expect(dt.name()).toBe("Table0");
    })
})