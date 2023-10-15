import {
    type AScalarSchema,
    type ASchemaOptions,
    type MaybeNullable,
    SCHEMA_METADATA,
    type ValidationData,
} from "../schemas";

/**
 * @example
 * const Schema = a.boolean();
 * a.validate(Schema, true) // true;
 * a.validate(Schema, false) // true;
 */
export function boolean<TNullable extends boolean = false>(
    opts: ASchemaOptions = {},
): AScalarSchema<"boolean", MaybeNullable<boolean, TNullable>> {
    return {
        type: "boolean",
        metadata: {
            id: opts.id,
            description: opts.description,
            [SCHEMA_METADATA]: {
                output: false,
                parse,
                validate,
                serialize,
                coerce(input, data) {
                    if (validate(input)) {
                        return input;
                    }
                    switch (input) {
                        case "true":
                        case "TRUE":
                        case "1":
                        case 1:
                            return true;
                        case "false":
                        case "FALSE":
                        case "0":
                        case 0:
                            return false;
                        default:
                            break;
                    }
                    data.errors.push({
                        instancePath: data.instancePath,
                        schemaPath: data.schemaPath,
                        message: `Unable to coerce ${input as any} to boolean`,
                    });
                    return undefined;
                },
            },
        },
    };
}

function validate(input: unknown): input is boolean {
    return typeof input === "boolean";
}
function parse(input: unknown, data: ValidationData): boolean | undefined {
    if (validate(input)) {
        return input;
    }
    if (data.instancePath.length === 0 && typeof input === "string") {
        if (input === "true") {
            return true;
        }
        if (input === "false") {
            return false;
        }
        data.errors.push({
            instancePath: data.instancePath,
            schemaPath: `${data.schemaPath}/type`,
            message: `Expected boolean. Got ${typeof input}.`,
        });
        return undefined;
    }

    data.errors.push({
        instancePath: data.instancePath,
        schemaPath: `${data.schemaPath}/type`,
        message: `Expected boolean. Got ${typeof input}.`,
    });
    return undefined;
}
function serialize(input: boolean | null) {
    return `${input}`;
}
