import {
  DataTable,
  DataColumn,
  DataRelation,
  DataRow
} from '../arga'

describe("DataRelation", () => {
  let dt: DataTable,
    nameColumn: DataColumn,
    parentColumn: DataColumn;

  beforeEach(() => {
    dt = new DataTable;
    nameColumn = new DataColumn('name');
    dt.columns.add(nameColumn);
    parentColumn = new DataColumn('parent');
    dt.columns.add(parentColumn);
  })

  describe("getParent", () => {

  })
})
interface Person {
  name:string
  parent?:string
  age?:number
}
function loadData(table:DataTable) {
  let people:Person[] = [
    {
      name:"Reese",
      parent:"Tom",
      age:28
    },
    {
      name:"Matt",
      parent:"Tom",
      age:30
    },
    {
      name:"Anna",
      parent:"Drew",
      age:28
    },
    {
      name:"Tom",
      age:60
    }
  ];
  for (let person of people) {
    pending("add data to test with")
    let dr = new DataRow();
  }
}