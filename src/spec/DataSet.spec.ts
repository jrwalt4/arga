import {DataSet, DataTable, DataRelation, DataTableCollection} from '../arga'

describe("DataSet", function () {

    let ds = new DataSet();;

    beforeEach(function () {
        ds = new DataSet();
    })
    
    describe("constructor", function () {
        it("should create a DataSet with provided name", function () {
            var dsName = "My DataSet";
            var ds = new DataSet(dsName);
            expect(ds.name).toEqual(dsName);
        })
    })

    describe("tables()", function(){
        it("should return a reference to the tables' DataRowCollection", function(){
            let ds = new DataSet();
            expect(ds.tables() instanceof DataTableCollection).toBeTruthy();
        })
    })

    describe("tables(name)", function(){
        it("should retrieve the table with the indicated name", function(){
            var dtName = "Table 1";
            var dt = new DataTable(dtName);
            ds.tables().add(dt);
            expect(ds.tables(dtName)).toBe(dt);
        })
    })

    describe("relations()", function(){
        it("should add a single relation", function(){
            var drtName = "owner";
            var drt = new DataRelation(drtName);
            ds.relations().add(drt);
            expect(ds.relations(drtName)).toBe(drt);
        })
    })
})