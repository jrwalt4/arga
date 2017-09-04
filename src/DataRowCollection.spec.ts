import { DataRowCollection } from './DataRowCollection'
import { DataRow } from './DataRow'
import { DataTable } from './DataTable'
import { DataColumn } from './DataColumn'

describe("DataRowCollection", function () {
  describe("constructor", function () {
    it("should throw error if not given a parent DataTable", function () {
      function constructWithoutTable() {
        let dt: DataTable;
        let drc = new DataRowCollection(dt); // dt is undefined
      }
      expect(constructWithoutTable).toThrow();
    })
    it("should be created when DataTable is instantiated", function () {
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
    let dc = new DataColumn("name");
    dt.columns.add(dc);
    let dr = new DataRow({ name: "Reese" });
    dt.rows.add(dr);
    it("should fail w/o primaryKey, but pass with", () => {
      expect(dt.rows.get("Reese")).toBeFalsy(dt.primaryKey);
      dt.primaryKey = [dt.columns.get("name")];
      expect(dt.rows.get("Reese")).toBe(dr);
      expect(dt.rows.get(["Reese"])).toBe(dr);
    })
  })
  describe("delete", function () {

  })
})