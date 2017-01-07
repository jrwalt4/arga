import { KeyedDictionary } from '../core/Util'

import * as _ from 'lodash'

describe("arga.util.KeyedCollection", function () {
    type Person = { name: { first?: string, last: string } };

    // people with different first and last names required for tests
    let people = [
        {
            name: {
                first: "Reese",
                last: "Walton"
            },
            id: '10'
        },
        {
            name: {
                first: "Beth",
                last: "Jones"
            },
            id: '113'
        },
        {
            name: {
                first: "Ben",
                last: "Williams"
            },
            id: '101'
        }
    ];

    function testKeyPath(keyPath: string) {
        let kc = new KeyedDictionary<Person>(keyPath);
        describe("keyPath: " + keyPath, function () {
            let i = 0;
            for (let person of people) {
                it("should store objects", function () {
                    expect(kc.add(person)).toBeTruthy();
                    i++;
                });
                it("should track the number of values", function () {
                    expect(kc.size).toEqual(i);
                });
                it("should indicate that the value exists", function () {
                    expect(kc.has(_.get<string>(person, keyPath))).toBe(true);
                });
                it("should retrieve the same objects", function () {
                    expect(kc.get(_.get<string>(person, keyPath))).toBe(person);
                });
                it("should return false when adding same key", function () {
                    var sameKey = {};
                    _.set(sameKey, keyPath, _.get(person, keyPath));
                    expect(kc.add(sameKey as Person)).toBe(false);
                })
            }
            it("should iterate over all entries", function () {
                let i = 0;
                let callback = jasmine.createSpy(
                    'callback', function (person: Person, key: string, collection: KeyedDictionary<Person>) {
                        expect(person).toEqual(people[i]);
                        i++;
                        expect(key).toEqual(_.get(person, keyPath));
                        expect(collection).toBe(kc);
                    });
                kc.forEach(callback)
                expect(callback).toHaveBeenCalledTimes(kc.size);
            })
            for (let person of people) {
                it("should return true when deleting by key", function () {
                    expect(kc.delete(_.get<string>(person, keyPath))).toBe(true)
                    i--;
                })
                it("should keep count after deleted items", function () {
                    expect(kc.size).toEqual(i);
                })
            }
        });
    }
    testKeyPath('name.last');
    testKeyPath('name.first');
    testKeyPath('id');
})