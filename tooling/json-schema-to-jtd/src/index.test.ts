import { type SchemaFormProperties, type SchemaFormType } from "jtd-utils";

import { jsonSchemaToJtdSchema } from "./index";
import { type JsonSchemaObject, type JsonSchemaScalarType } from "./models";

const emptyMetadata = {
    id: undefined,
    description: undefined,
};

it("Converts integers", () => {
    const integerSchema: JsonSchemaScalarType = {
        type: "integer",
    };
    const expectedOutput: SchemaFormType = {
        type: "int32",
        metadata: emptyMetadata,
    };
    expect(jsonSchemaToJtdSchema(integerSchema)).toStrictEqual(expectedOutput);
});

it("Converts strings", () => {
    const input: JsonSchemaScalarType = {
        type: "string",
    };
    const expectedOutput: SchemaFormType = {
        type: "string",
        metadata: emptyMetadata,
    };
    expect(jsonSchemaToJtdSchema(input)).toStrictEqual(expectedOutput);
});

it("Converts objects", () => {
    const input: JsonSchemaObject = {
        type: "object",
        properties: {
            id: {
                type: "string",
            },
            title: {
                type: "string",
            },
            numLikes: {
                type: "integer",
            },
            createdAt: {
                type: "integer",
            },
        },
        required: ["id", "title", "numLikes", "createdAt"],
    };
    const expectedOutput: SchemaFormProperties = {
        properties: {
            id: {
                type: "string",
                metadata: emptyMetadata,
            },
            title: {
                type: "string",
                metadata: emptyMetadata,
            },
            numLikes: {
                type: "int32",
                metadata: emptyMetadata,
            },
            createdAt: {
                type: "int32",
                metadata: emptyMetadata,
            },
        },
        metadata: emptyMetadata,
        strict: undefined,
    };
    expect(jsonSchemaToJtdSchema(input)).toStrictEqual(expectedOutput);
});

it("Converts objects with optional values", () => {
    const input: JsonSchemaObject = {
        type: "object",
        properties: {
            id: {
                type: "string",
            },
            name: {
                type: "string",
            },
        },
        required: ["id"],
    };
    const expectedOutput: SchemaFormProperties = {
        properties: {
            id: {
                type: "string",
                metadata: emptyMetadata,
            },
        },
        optionalProperties: {
            name: {
                type: "string",
                metadata: emptyMetadata,
            },
        },
        metadata: emptyMetadata,
        strict: undefined,
    };
    expect(jsonSchemaToJtdSchema(input)).toStrictEqual(expectedOutput);
});
