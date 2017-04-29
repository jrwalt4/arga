import { KeyedDictionary } from '../core/Util'

import * as _ from 'lodash'

describe("KeyedCollection", () => {
  let idDict: KeyedDictionary<Person>,
    lastNameDict: KeyedDictionary<Person>,
    firstNameDict: KeyedDictionary<Person>;

  let firstNameUniqs = _.uniqBy(people, 'first.name');
  let firstNameDuplicates = _.difference(people, firstNameUniqs);
  beforeEach(() => {
    idDict = new KeyedDictionary<Person>('id');
    lastNameDict = new KeyedDictionary<Person>('name.last');
    firstNameDict = new KeyedDictionary<Person>('name.first');
  })
  describe("add", () => {
    it("should store objects with unique values at key path", () => {
      for (let person of people) {
        expect(idDict.add(person)).toBeTruthy();
        expect(lastNameDict.add(person)).toBeTruthy();
      }
    });
    it("should not store duplicate values", () => {
      for (let person of firstNameUniqs) {
        expect(firstNameDict.add(person)).toBeTruthy();
      }
      for (let person of firstNameDuplicates) {
        expect(firstNameDict.add(person)).toBeFalsy();
      }
    })
  })

  describe("size", () => {
    it("should track the number of values", function () {
      let i = 0;
      for (let person of people) {
        lastNameDict.add(person);
        idDict.add(person);
        i++
        expect(lastNameDict.size).toEqual(i)
        expect(idDict.size).toEqual(i)
      }
    });
    it("should not increase size with duplicates", () => {
      let j = 0;
      for (let person of firstNameUniqs) {
        firstNameDict.add(person);
        j++;
        expect(firstNameDict.size).toEqual(j);
      }
      for (let person of firstNameDuplicates) {
        firstNameDict.add(person);
        expect(firstNameDict.size).toEqual(j);
      }
    })
  })

  describe("has", () => {
    it("should indicate that the value exists", ()=>{
      for(let person of people) {
        
      }
    })
  })

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

  describe("forEach", () => {
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
})
});

type Person = { name: { first?: string, last: string }, id?: string };

// people with different last names and at least
// one repeat first name required for tests
let people: Person[] = [
  {
    name: {
      first: "Reese",
      last: "Walton"
    },
    id: '10'
  },
  {
    name: {
      first: "Ben",
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