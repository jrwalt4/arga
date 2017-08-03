import { DataTable, DataSet } from '../arga'

import data from './data/test-data';

describe("DataTable", function () {

    describe('constructor()', function () {
        var tblName = "Test Table";
        let dt = new DataTable(tblName);
        it("should create a DataTable with provided name", function () {
            expect(dt.name).toBe(tblName);
        })

        it("should have a row collection", function(){
            expect(dt.rows.table).toBe(dt);
        })

        it("should have a column collection", function(){
            expect(dt.columns.table).toBe(dt);
        })
    })

    describe("data retrieval", function(){
        let dt = new DataTable("Table w/ Data");
        dt.columns.add("id");
        dt.primaryKey = [dt.columns.get("id")];
    })

})