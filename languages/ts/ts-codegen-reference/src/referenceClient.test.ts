import fs from "node:fs";
import path from "node:path";

import { $$Book, Book } from "./referenceClient";

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
