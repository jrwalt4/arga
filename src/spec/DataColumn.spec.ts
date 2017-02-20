import { DataTable, DataColumn, DataRow } from '../arga'

export function testColumn(ColumnCtor: typeof DataColumn) {
    describe(ColumnCtor.name, function () {

        let dc: DataColumn, dt: DataTable, dr: DataRow;

        it("should set value on row", ()=>{
            dc = new ColumnCtor("name");
            dr = new DataRow();
            dr.set(dc, "Reese");
            expect(dr.get(dc)).toEqual("Reese");
        })

        it("should find value in row collection", ()=>{
            dt = new DataTable();
            dc = new ColumnCtor("name");
            dt.columns.add(dc);
            let names = ["Reese", "Matt", "Anna"]
            let rows:DataRow[] = names.map<DataRow>((name)=>{
                let row = new DataRow();
                row.set(dc, name);
                dt.rows.add(row);
                return row;
            });
            names.forEach((name, i)=>{
                //console.log(name, rows[i].get(dc));
                expect(dc.find(name)).toBe(rows[i], "couldn't find "+name);
            })
        })
    })
}

testColumn(DataColumn);