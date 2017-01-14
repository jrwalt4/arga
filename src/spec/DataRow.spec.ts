import {
    DataRow, DataRowState, DataRowVersion, DataTable, DataColumn
} from '../arga'

describe("DataRow", function () {
    describe("constructor", function () {
        it("should take an object", function () {
            let values = {
                task: "clean",
                duration: 10,
                priority: 1
            };
            let dr = new DataRow(values);
            for (let key in values) {
                expect(dr.get(key)).toEqual(values[key]);
            }
        })
        it("should maintain values after adding to DataTable", function(){
            let values = {
                task: "clean",
                duration: 10,
                priority: 1
            };
            let dr = new DataRow(values);
            let dt = new DataTable();
            dt.rows.add(dr);
            for (let key in values) {
                expect(dr.get(key)).toEqual(values[key], "failed on key: "+key);
            }
        })
    })
    describe("getter/setters", function () {
        let values = {
            task: "clean",
            duration: 10,
            priority: 1
        };
        function testGetterSetter(dr: DataRow, values: {}) {
            it("should set and get single property", function () {
                let key: string = Object.keys(values)[0];
                dr.set(key, values[key]);
                expect(dr.get(key)).toEqual(values[key]);
            })

            it("should set and get multiple properties", function () {
                dr.set(values);
                for (let key in values) {
                    expect(dr.get(key)).toEqual(values[key]);
                }
            })
        }

        describe("while detached", function () {
            let dr = new DataRow();
            testGetterSetter(dr, values);
        })

        describe("after adding to collection", function () {
            let dr = new DataRow();
            let dt = new DataTable();
            for (let key in values) {
                dt.columns.add(key);
            }
            testGetterSetter(dr, values);
        })
    })

    describe("rowState", function () {

        function checkState(dr: DataRow, state: DataRowState) {
            /** 
             * use bitwise operator '&' since a rowState could match
             * multiple conditions (i.e. DETACHED and MODIFIED)
             */
            expect(DataRowState[dr.rowState & state]).toEqual(DataRowState[state]);
        }

        it("should begin as DETACHED", function () {
            let dr = new DataRow();
            checkState(dr, DataRowState.DETACHED);
        })

        it("should be ADDED when added to collection", function () {
            let dr = new DataRow();
            let dt = new DataTable();

            dt.rows.add(dr);

            checkState(dr, DataRowState.ADDED);
        })

        it("should update the rowState to MODIFIED", function () {
            let dr = new DataRow();
            let dt = new DataTable();
            dt.rows.add(dr);
            dr.acceptChanges();
            dr.set("name", "Reese");
            expect(DataRowState[dr.rowState]).toEqual(DataRowState[DataRowState.MODIFIED]);
        })
    })
})