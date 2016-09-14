var arga = require('../../build/arga.js');
describe("Test suite for arga.DataSet", function() {
    it("should create a DataSet named 'DataSet1'", function() {
        var ds = new arga.DataSet();
        expect(ds.name()).toEqual("Set0");
    })
})