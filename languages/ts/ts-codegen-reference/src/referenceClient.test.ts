import fs from "node:fs";
import path from "node:path";

import {
    $$Book,
    $$ObjectWithEveryType,
    $$RecursiveObject,
    Book,
    ObjectWithEveryType,
    RecursiveObject,
} from "./referenceClient";

const testDate = new Date("2001-01-01T16:00:00.000Z");
const referenceDir = path.resolve(__dirname, "../../../../tests/test-files");
const testFile = (filename: string) =>
    fs.readFileSync(path.resolve(referenceDir, filename), "utf8");

describe("Book", () => {
    const targetValue: Book = {
        id: "1",
        name: "The Adventures of Tom Sawyer",
        createdAt: testDate,
        updatedAt: testDate,
    };
    const jsonReference = testFile("Book.json");
    test("JSON Parsing", () => {
        const result = $$Book.fromJsonString(jsonReference);
        expect(result).toStrictEqual(targetValue);
    });
    test("JSON Output", () => {
        expect($$Book.toJsonString(targetValue)).toEqual(jsonReference);
    });
    test("URL Query String Output", () => {
        expect($$Book.toUrlQueryString(targetValue)).toEqual(
            `id=1&name=The Adventures of Tom Sawyer&createdAt=2001-01-01T16:00:00.000Z&updatedAt=2001-01-01T16:00:00.000Z`,
        );
    });
});

describe("ObjectWithEveryType", () => {
    const targetValue: ObjectWithEveryType = {
        string: "",
        boolean: false,
        timestamp: testDate,
        float32: 1.5,
        float64: 1.5,
        int8: 1,
        uint8: 1,
        int16: 10,
        uint16: 10,
        int32: 100,
        uint32: 100,
        int64: 1000n,
        uint64: 1000n,
        enum: "BAZ",
        object: {
            id: "1",
            content: "hello world",
        },
        array: [true, false, false],
        record: {
            A: true,
            B: false,
        },
        discriminator: {
            typeName: "C",
            id: "",
            name: "",
            date: testDate,
        },
        any: "hello world",
    };
    const jsonReference = testFile("ObjectWithEveryType.json");
    const emptyJsonReference = testFile(
        "ObjectWithOptionalFields_AllUndefined.json",
    );
    test("JSON parsing", () => {
        const result = $$ObjectWithEveryType.fromJsonString(jsonReference);
        expect(result).toStrictEqual(targetValue);

        const emptyJsonResult =
            $$ObjectWithEveryType.fromJsonString(emptyJsonReference);
        expect(emptyJsonResult).toStrictEqual($$ObjectWithEveryType.new());
    });
    test("JSON output", () => {
        expect($$ObjectWithEveryType.toJsonString(targetValue)).toEqual(
            jsonReference,
        );
    });
});

describe("RecursiveObject", () => {
    const targetValue: RecursiveObject = {
        left: {
            left: { left: null, right: { left: null, right: null } },
            right: null,
        },
        right: { left: null, right: null },
    };
    const jsonReference = testFile("RecursiveObject.json");
    test("JSON parsing", () => {
        const result = $$RecursiveObject.fromJsonString(jsonReference);
        expect(result).toStrictEqual(targetValue);
    });
    test("JSON output", () => {
        expect($$RecursiveObject.toJsonString(targetValue)).toEqual(
            jsonReference,
        );
    });
});
