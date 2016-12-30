import {DataRow, DataTable, DataRowState, DataRowVersion} from '../arga'

describe("DataRow", function () {
    let dt = new DataTable();
    var dr:DataRow;
    
    beforeEach(function () {
        dr = new DataRow();
    })

    it("should set property from key and value", function () {
        dr.set("name", "Reese");
        expect(dr.get("name")).toEqual("Reese");
    })

    it("should set property from object's key and value", function () {
        dr.set({
            name: "Reese"
        });
        expect(dr.get("name")).toEqual("Reese");
    })

    it("should set multiple properties from object's keys and values", function () {
        dr.set({
            name: "Reese",
            age: 27,
            job: "Engineer"
        });
        expect(dr.get("name")).toEqual("Reese");
        expect(dr.get("age")).toEqual(27);
        expect(dr.get("job")).toEqual("Engineer");
    })

    it("should start with rowState equals DETACHED", function() {
        expect(DataRowState[dr.rowState()]).toEqual(DataRowState[DataRowState.DETACHED]);
    })

    it("should set rowState to UNCHANGED", function(){
        dt.rows().add(dr);
        dr.acceptChanges();
        expect(DataRowState[dr.rowState()]).toEqual(DataRowState[DataRowState.UNCHANGED]);
    })

    it("should update the rowState to MODIFIED", function () {
        dt.rows().add(dr);
        dr.acceptChanges();
        dr.set("name", "Reese");
        expect(DataRowState[dr.rowState()]).toEqual(DataRowState[DataRowState.MODIFIED]);
    })
    
})