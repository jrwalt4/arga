import { KeyedDictionary } from '../core/Util'

describe("arga.util.KeyedCollection", function () {

    type Person = {name:{first?:string, last:string}};

    let kc = new KeyedDictionary<Person>("name.last");
    kc.add({
        name: {
            first: "Reese",
            last: "Walton"
        }
    })
    kc.add({
        name: {
            first: "Beth",
            last: "Jones"
        }
    })
    kc.add({
        name: {
            first: "Ben",
            last: "Williams"
        }
    })

    it("should find value based on keyPath", function () {
        var firstName = kc.get("Walton").name.first;
        expect(firstName).toEqual("Reese");

        firstName = kc.get("Jones").name.first;
        expect(firstName).toEqual("Beth");
    })

    it("should return false when adding same key", function () {

        expect(kc.add({name:{last:"Williams"}})).toBeFalsy("object was added against our will");
    })
})