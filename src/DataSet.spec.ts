import { DataSet } from './DataSet'

describe("DataSet", function () {

  describe("constructor", function () {
    var dsName = "Test DataSet";
    var ds = new DataSet(dsName);
    it("should create a DataSet with provided name", function () {
      expect(ds.name).toEqual(dsName);
    })

    it("should have an associated DataTableCollection", function () {
      expect(ds.tables.dataSet).toBe(ds);
    })

    it("should have an associated DataRelationCollection", function () {
      expect(ds.relations.dataSet).toBe(ds);
    })

  })
})