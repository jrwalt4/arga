var arga = require('../../build/arga.js');
describe("Test suite for arga.DataSet", function() {
    it("should create a DataSet named 'DataSet1'", function() {
        var dsName = "DataSet1";
        var ds = new arga.DataSet(dsName);
        expect(ds.name()).toEqual(dsName);
    })

    it("should say \"hello\"", function(){
        expect(arga.hello()).toBe("hello")
    })
})