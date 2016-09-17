var DataSet = require('../build/core/DataSet');
describe("Test suite for arga.DataSet", function() {
    it("should create a DataSet named 'DataSet1'", function() {
        var ds = new DataSet();
        expect(ds.name()).toEqual("Set0");
    })
})