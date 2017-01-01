import * as util from '../core/Util'

describe("Util", function () {
    pending("Util is in flux")

    var obj = {
        name: {
            first: "Reese",
            last: "Walton"
        }
    }

    beforeEach(function () {
        obj = {
            name: {
                first: "Reese",
                last: "Walton"
            }
        }
    })

    it("should return value at specified keyPath", function () {

        expect(util.resolveKeyPath("name.last", obj)).toEqual(obj.name.last);

    })

    it("should return undefined if nothing exists at keyPath", function () {

        expect(util.resolveKeyPath("does.not.exist", obj)).toBeUndefined();

    })

    it("should return undefined if obj is undefined", function () {
        var undefinedObject;
        expect(util.resolveKeyPath("should.not.work", undefinedObject)).toBeUndefined();
    })

    it("should return value at specified keyPathArray", function () {
        expect(util.resolveKeyPathArray(['name', 'last'], obj)).toEqual(obj.name.last);
    })

    it("should create deep copy of object", function () {
        var original = {
            name: "Reese",
            job: {
                title: "Engineer"
            },
            projects: [
                "arga",
                "tigris",
                "perago"
            ]
        }
        var copy = util.deepCopy(original);

        expect(copy).not.toBe(original);
        expect(copy.name).toEqual(original.name);
        expect(copy.job).not.toBe(original.job);
        expect(copy.job.title).toEqual(original.job.title);
        expect(copy.projects).not.toBe(original.projects);
        for (var i = 0; i < original.projects.length; i++) {
            expect(copy.projects[i]).toEqual(original.projects[i]);
        }
    })

    it("should create deep copy of object with prototype", function () {
        var prototype = {
            name: "object",
            data: {
                age: 27,
                type: "data"
            },
            array: [1, 2, 3]
        }
        var original = Object.create(prototype);
        var copy = util.deepCopy(original);

        expect(copy).not.toBe(original);
        expect(copy.name).toEqual(original.name);
        expect(copy.data).not.toBe(original.data);
        expect(copy.data.age).toEqual(original.data.age);
        expect(copy.data.type).toEqual(original.data.type);
        expect(copy.array).not.toBe(original.array);
        expect(copy.array).toEqual(original.array);
    })

    it("should return value for value types", function () {
        expect(util.deepCopy('a')).toEqual('a');
    })

})