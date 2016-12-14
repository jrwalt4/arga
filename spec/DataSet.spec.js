/// <reference path="../build/arga.d.ts" />
var DataSet = require('../build/core/DataSet').DataSet;
var DataTable = require('../build/core/DataTable').DataTable;
//var DataTableCollection = require('../build/core/DataTableCollection').DataTableCollection;
var DataRelation = require('../build/core/DataRelation').DataRelation;
//var DataRelationCollection = require('../build/core/DataRelationCollection').DataRelationCollection

describe("DataSet", function () {

    var ds = new DataSet();;

    beforeEach(function () {
        ds = new DataSet();
    })
    
    describe("constructor", function () {
        it("should create a DataSet with provided name", function () {
            var dsName = "My DataSet";
            var ds = new DataSet(dsName);
            expect(ds.name()).toEqual(dsName);
        })
    })

    describe("tables()", function(){
        it("should add a single table", function(){
            var dtName = "Table1";
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