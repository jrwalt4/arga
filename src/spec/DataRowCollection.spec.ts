import {
  DataRowCollection, DataRow, DataTable
} from '../arga'

describe("DataRowCollection", function () {
  describe("constructor", function () {
    it("should throw error if not given a parent DataTable", function () {
      function constructWithoutTable() {
        let dt: DataTable;
        let drc = new DataRowCollection(dt); // dt is undefined
      }
      expect(constructWithoutTable).toThrow();
    })
  })
  describe("getter", function () {

  })
})