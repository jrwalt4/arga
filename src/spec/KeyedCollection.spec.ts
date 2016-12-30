import {KeyedCollection} from '../core/Util'

xdescribe("arga.util.KeyedCollection", function () {
    var kc;
    beforeEach(function () {
        kc = new KeyedCollection("name.last");
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
    })

    it("should find value based on keyPath", function () {
        var firstName = kc.get("Walton").name.first;
        expect(firstName).toEqual("Reese");

        firstName = kc.get("Jones").name.first;
        expect(firstName).toEqual("Beth");
    })

    it("should throw when adding same key", function () {
        function tryToAdd() {
            var sameKey = {
                name: {
                    last: "Williams"
                }
            };
            kc.add(sameKey);
        }
        expect(tryToAdd).toThrow();
    })
})