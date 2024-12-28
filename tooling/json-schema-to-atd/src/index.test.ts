import {
    type SchemaFormProperties,
    type SchemaFormType,
    SchemaFormValues,
} from "@arrirpc/type-defs";

import { jsonSchemaToJtdSchema } from "./index";
import {
    type JsonSchemaObject,
    JsonSchemaRecord,
    type JsonSchemaScalarType,
} from "./models";

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
        nullable: undefined,
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
        nullable: undefined,
    };
    expect(jsonSchemaToJtdSchema(input)).toStrictEqual(expectedOutput);
});

it('Converts strings that are marked as format "date-time"', () => {
    const input: JsonSchemaScalarType = {
        type: "string",
        format: "date-time",
    };
    const expectedOutput: SchemaFormType = {
        type: "timestamp",
        metadata: emptyMetadata,
        nullable: undefined,
    };
    expect(jsonSchemaToJtdSchema(input)).toStrictEqual(expectedOutput);
    const input2: JsonSchemaScalarType = {
        type: "string",
        format: "date-time",
        nullable: true,
    };
    const expectedOutput2: SchemaFormType = {
        type: "timestamp",
        metadata: emptyMetadata,
        nullable: true,
    };
    expect(jsonSchemaToJtdSchema(input2)).toStrictEqual(expectedOutput2);
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
                nullable: undefined,
            },
            title: {
                type: "string",
                metadata: emptyMetadata,
                nullable: undefined,
            },
            numLikes: {
                type: "int32",
                metadata: emptyMetadata,
                nullable: undefined,
            },
            createdAt: {
                type: "int32",
                metadata: emptyMetadata,
                nullable: undefined,
            },
        },
        metadata: emptyMetadata,
        strict: undefined,
        nullable: undefined,
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
                nullable: undefined,
                metadata: emptyMetadata,
            },
        },
        optionalProperties: {
            name: {
                type: "string",
                metadata: emptyMetadata,
                nullable: undefined,
            },
        },
        metadata: emptyMetadata,
        strict: undefined,
        nullable: undefined,
    };
    expect(jsonSchemaToJtdSchema(input)).toStrictEqual(expectedOutput);
});

it("Converts dictionary types", () => {
    const input1: JsonSchemaRecord = {
        type: "object",
        patternProperties: {
            a: {
                type: "string",
            },
        },
    };
    const expectedOutput1: SchemaFormValues = {
        values: {
            type: "string",
            nullable: undefined,
            metadata: emptyMetadata,
        },
        nullable: undefined,
        metadata: emptyMetadata,
    };
    expect(jsonSchemaToJtdSchema(input1)).toStrictEqual(expectedOutput1);
    const input2: JsonSchemaRecord = {
        type: "object",
        nullable: undefined,
        additionalProperties: {
            type: "object",
            properties: {
                id: {
                    type: "string",
                    nullable: undefined,
                },
                name: {
                    type: "string",
                    nullable: true,
                },
            },
        },
    };
    const expectedOutput2: SchemaFormValues = {
        values: {
            properties: {},
            optionalProperties: {
                id: {
                    type: "string",
                    nullable: undefined,
                    metadata: emptyMetadata,
                },
                name: {
                    type: "string",
                    nullable: true,
                    metadata: emptyMetadata,
                },
            },
            metadata: emptyMetadata,
            nullable: undefined,
            strict: undefined,
        },
        metadata: emptyMetadata,
        nullable: undefined,
    };
    expect(jsonSchemaToJtdSchema(input2)).toStrictEqual(expectedOutput2);
});
