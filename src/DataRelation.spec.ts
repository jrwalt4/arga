import { DataRelation } from './DataRelation'
import { DataTable } from './DataTable'
import { DataRow } from './DataRow';
import { DataColumn } from './DataColumn';

describe("DataRelation", () => {
  let dt: DataTable,
    nameColumn: DataColumn,
    parentNameColumn: DataColumn,
    relation: DataRelation;

  beforeEach(() => {
    dt = getTestData();
    nameColumn = dt.columns.get('name');
    parentNameColumn = dt.columns.get('parent');
    relation = new DataRelation(parentNameColumn, nameColumn);
  })

  describe("getParentRow", () => {
    it("should retrieve the parent row", () => {
      let reese = dt.rows.get("Reese");
      let matt = dt.rows.get("Matt");
      let tom = dt.rows.get("Tom");
      expect(reese.getParentRow(relation)).toBe(tom);
      expect(matt.getParentRow(relation)).toBe(tom);
    })
  })

  describe("getChildRows", () => {
    it("should retrieve an array of child rows", () => {
      let tom = dt.rows.get("Tom");
      let reese = dt.rows.get("Reese");
      let matt = dt.rows.get("Matt");
      let children = tom.getChildRows(relation);
      expect(children).toContain(reese);
      expect(children).toContain(matt);
    })
  })
})
interface Person {
  name: string
  parent?: string
  age?: number
}
function getTestData(): DataTable {
  let people: Person[] = [
    {
      name: "Reese",
      parent: "Tom",
      age: 28
    },
    {
      name: "Matt",
      parent: "Tom",
      age: 30
    },
    {
      name: "Anna",
      parent: "Drew",
      age: 28
    },
    {
      name: "Tom",
      age: 60
    }
  ];
  let dt = new DataTable;
  dt.columns.add(new DataColumn('name'));
  dt.columns.add(new DataColumn('parent'));
  dt.columns.add(new DataColumn('age'));
  dt.primaryKey = [dt.columns.get('name')];
  for (let person of people) {
    dt.rows.add(new DataRow(person));
  }
  return dt;
}