var arga = require('../../build/arga.js');

describe("Test suite for arga.DataTable", function() {
    it("should create a DataTable named DataTable0", function() {
        var dt = new arga.DataTable();
        expect(dt.name()).toBe("Table0");
    })
})