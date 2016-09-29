var DataSet = require('../build/core/DataSet');
describe("arga.DataSet", function() {

    var ds = new DataSet();;

    beforeEach(function(){
        ds = new DataSet();
    })

    it("should create a DataSet with default name 'Set #'", function() {
        var ds = new DataSet();
        expect(ds.name()).toMatch(/Set \d/);
    })

    it("should create a DataSet with provided name", function() {
        var dsName = "My DataSet";
        var ds = new DataSet(dsName);
        expect(ds.name()).toEqual(dsName);
    })

    it("should create a DataTable with default name", function() {
        var dt1 = ds.newTable();
        expect(dt1.name()).toEqual("Table 1");

        // create it again - without adding to DataSet,
        // it shouldn't increment the table counter
        var dt1 = ds.newTable();
        expect(dt1.name()).toEqual("Table 2");

        // add the table so it is counted 
        ds.addTable(dt1);
        var dt2 = ds.newTable();
        expect(dt2.name()).toEqual("Table 3");
    })
})