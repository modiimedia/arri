import {
    type Schema,
    type SchemaFormElements,
    type SchemaFormEmpty,
    type SchemaFormEnum,
    type SchemaFormProperties,
    type SchemaFormValues,
} from "jtd-utils";

import {
    isJsonSchemaArray,
    isJsonSchemaEnum,
    isJsonSchemaObject,
    isJsonSchemaRecord,
    isJsonSchemaScalarType,
    type JsonSchemaArray,
    type JsonSchemaEnum,
    type JsonSchemaObject,
    type JsonSchemaRecord,
    type JsonSchemaScalarType,
    type JsonSchemaType,
} from "./models";
export * from "./models";

export function jsonSchemaToJtdSchema(input: JsonSchemaType): Schema {
    if (isJsonSchemaScalarType(input)) {
        return jsonSchemaScalarToJtdScalar(input);
    }
    if (isJsonSchemaEnum(input)) {
        return jsonSchemaEnumToJtdEnum(input);
    }
    if (isJsonSchemaObject(input)) {
        return jsonSchemaObjectToJtdObject(input);
    }
    if (isJsonSchemaArray(input)) {
        return jsonSchemaArrayToJtdArray(input);
    }
    if (isJsonSchemaRecord(input)) {
        return jsonSchemaRecordToJtdRecord(input);
    }

    console.warn(
        `WARNING: unable to determine type for ${
            input as any
        }. Falling back to "any" type.`,
    );
    // fallback to "any" type
    return {
        metadata: {
            id: input.$id ?? input.title,
            description: input.description,
        },
    } satisfies SchemaFormEmpty;
}

export function jsonSchemaEnumToJtdEnum(input: JsonSchemaEnum): Schema {
    const enumTypes = input.anyOf.map((val) => val.type);
    const isNotStringEnum =
        enumTypes.includes("integer") || enumTypes.includes("number");
    if (isNotStringEnum) {
        console.error(
            `WARNING: Cannot convert non string enums. This key will be treated as an "any" by generated clients.`,
        );
        const output: SchemaFormEmpty = {};
        return output;
    }
    const output: SchemaFormEnum = {
        enum: input.anyOf.map((val) => val.const as string),
        metadata: {
            id: input.$id ?? input.title,
            description: input.description,
        },
    };
    return output;
}

export function jsonSchemaScalarToJtdScalar(
    input: JsonSchemaScalarType,
): Schema {
    const meta = {
        id: input.$id ?? input.title,
        description: input.description,
    };
    switch (input.type) {
        case "Date":
            return {
                type: "timestamp",
                metadata: meta,
            };
        case "bigint":
        case "integer":
            return {
                type: "int32",
                metadata: meta,
            };
        case "number":
            return {
                type: "float64",
                metadata: meta,
            };
        case "boolean":
            return {
                type: "boolean",
                metadata: meta,
            };
        case "string":
            return {
                type: "string",
                metadata: meta,
            };
        default:
            return {};
    }
}

export function jsonSchemaObjectToJtdObject(input: JsonSchemaObject): Schema {
    const result: SchemaFormProperties = {
        properties: {},
        additionalProperties:
            typeof input.additionalProperties === "boolean"
                ? input.additionalProperties
                : true,
        metadata: {
            id: input.$id ?? input.title,
            description: input.description,
        },
    };
    Object.keys(input.properties).forEach((key) => {
        const prop = input.properties[key];
        if (!prop) {
            return;
        }
        const isOptional = !(input.required ?? []).includes(key);
        if (isOptional) {
            if (!result.optionalProperties) {
                result.optionalProperties = {};
            }
            (result.optionalProperties as any)[key] =
                jsonSchemaToJtdSchema(prop);
            return;
        }
        (result.properties as any)[key] = jsonSchemaToJtdSchema(prop);
    });

    return result;
}

export function jsonSchemaArrayToJtdArray(input: JsonSchemaArray) {
    const result: SchemaFormElements = {
        elements: jsonSchemaToJtdSchema(input.items),
        metadata: {
            id: input.$id ?? input.title,
            description: input.description,
        },
    };
    return result;
}

export function jsonSchemaRecordToJtdRecord(input: JsonSchemaRecord): Schema {
    const types: Schema[] = [];
    Object.keys(input.patternProperties).forEach((key) => {
        const pattern = input.patternProperties[key];
        if (!pattern) {
            return;
        }
        types.push(jsonSchemaToJtdSchema(pattern));
    });
    if (types.length === 0) {
        console.warn(
            'WARNING: unable to determine record type values. This key will be treated as "any" by client generators.',
        );
        return {};
    }
    const result: SchemaFormValues = {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        values: types[0]!,
        metadata: {
            id: input.$id ?? input.title,
            description: input.description,
        },
    };
    return result;
}
