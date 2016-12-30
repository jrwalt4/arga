import {DataTable, DataSet} from '../arga'

var data = require('../../spec/data/test-data');

describe("DataTable", function() {
    var dr = new DataTable();

    beforeEach(function() {
        dr = new DataTable();
    });

    it("should create a DataTable with provided name", function() {
        var tblName = "DataTable 1";
        var dt = new DataTable(tblName);
        expect(dt.name).toBe(tblName);
    })
})