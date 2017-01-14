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
    it("should be created with a DataTable", function () {
      let dt = new DataTable();
      expect(dt.rows instanceof DataRowCollection).toBe(true, 'DataTable#rows is not a DataRowCollection');
    })
  })
  describe("add", function () {
    let dt = new DataTable();
    let dr = new DataRow();
    it("should add a DataRow", function () {
      expect(dt.rows.add(dr)).toBeTruthy();
    })
  })
  describe("get", function () {
    let dt = new DataTable();
    let dr = new DataRow({ name: "Reese" });
    it("should fail without a primaryKey", function () {
      expect(dt.rows.get("Reese")).toBeFalsy();
    });
    dt.primaryKey = [dt.columns.get("name")];
    it("should succeed once primaryKey has been set", function () {
      expect(dt.rows.get("Reese")).toBe(dr);
    })
  })
})