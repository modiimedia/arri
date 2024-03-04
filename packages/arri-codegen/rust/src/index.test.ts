import { normalizeWhitespace, type SchemaFormType } from "arri-codegen-utils";
import { a } from "arri-validate";
import { rustBoolFromSchema, rustStructFromSchema } from "./index";

describe("Scalar Types", () => {
    test("bool", () => {
        const schema: SchemaFormType = {
            type: "boolean",
        };
        const schemaResult = rustBoolFromSchema(schema);
        expect(schemaResult.fieldTemplate).toBe(`bool`);

        const nullableSchema: SchemaFormType = {
            type: "boolean",
            nullable: true,
        };
        const nullableSchemaResult = rustBoolFromSchema(nullableSchema);
        expect(nullableSchemaResult.fieldTemplate).toBe("Option<bool>");
    });
});

describe("objects", () => {
    test("simple object", () => {
        const User = a.object(
            {
                id: a.string(),
                name: a.string(),
                date: a.timestamp(),
                isAdmin: a.boolean(),
            },
            {
                id: "User",
            },
        );
        const result = rustStructFromSchema(User, {
            clientName: "",
            generatedTypes: [],
            instancePath: "",
            schemaPath: "",
        });
        expect(normalizeWhitespace(result.content)).toBe(
            normalizeWhitespace(`struct User {
            id: String,
            name: String,
            date: DateTime<FixedOffset>,
            is_admin: bool,
        }`),
        );
    });
});
