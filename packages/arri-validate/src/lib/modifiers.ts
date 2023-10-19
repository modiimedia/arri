import { type ASchema, type ASchemaOptions, SCHEMA_METADATA } from "../schemas";

/**
 * Transforms a schema into a nullable type
 *
 * @example
 * const NullableString = a.nullable(a.string())
 * const NullableObject = a.nullable(
 *   a.object({
 *     id: a.string(),
 *     description: a.nullable(a.string())
 *   })
 * )
 */
export function nullable<T>(
    schema: ASchema<T>,
    opts: ASchemaOptions = {},
): ASchema<T | null> {
    const isType = (val: unknown): val is T | null => {
        if (val === null) {
            return true;
        }
        return schema.metadata[SCHEMA_METADATA].validate(val);
    };
    return {
        ...schema,
        nullable: true,
        metadata: {
            id: opts.id ?? schema.metadata.id,
            description: opts.description ?? schema.metadata.description,
            [SCHEMA_METADATA]: {
                output: null as T | null,
                optional: schema.metadata[SCHEMA_METADATA].optional,
                validate: isType,
                parse(val, data) {
                    if (
                        data.instancePath.length === 0 &&
                        typeof val === "string" &&
                        val === "null"
                    ) {
                        return null;
                    }
                    if (val === null) {
                        return null;
                    }
                    return schema.metadata[SCHEMA_METADATA].parse(val, data);
                },
                coerce(val, data) {
                    if (val === null) {
                        return null;
                    }
                    if (val === "null") {
                        return null;
                    }
                    return schema.metadata[SCHEMA_METADATA].coerce(val, data);
                },
                serialize(val, data) {
                    if (val === null) {
                        return "null";
                    }
                    return schema.metadata[SCHEMA_METADATA].serialize(
                        val,
                        data,
                    );
                },
            },
        },
    };
}

/**
 * Make an object field optional
 *
 * This makes use of the "optionalProperties" property in JTD. See: https://jsontypedef.com/docs/jtd-in-5-minutes/#optional-properties
 *
 * @example
 * const User = a.object({
 *   id: a.string(),
 *   // make the email field optional
 *   email: a.optional(a.string())
 * })
 */
export function optional<T>(
    input: ASchema<T>,
    opts: ASchemaOptions = {},
): ASchema<T | undefined> {
    const isType = (val: unknown): val is T | undefined => {
        if (val === undefined) {
            return true;
        }
        return input.metadata[SCHEMA_METADATA].validate(val);
    };
    return {
        ...input,
        metadata: {
            id: opts.id ?? input.metadata.id,
            description: opts.description ?? input.metadata.description,
            [SCHEMA_METADATA]: {
                output: undefined as T | undefined,
                optional: true,
                validate: isType,
                parse: (val, data) => {
                    if (typeof val === "undefined") {
                        return undefined;
                    }
                    if (data.instancePath.length === 0 && val === "undefined") {
                        return undefined;
                    }
                    return input.metadata[SCHEMA_METADATA].parse(val, data);
                },
                coerce: (val, data) => {
                    if (typeof val === "undefined") {
                        return undefined;
                    }
                    if (val === "undefined") {
                        return undefined;
                    }
                    return input.metadata[SCHEMA_METADATA].coerce(val, data);
                },
                serialize: (val, data) => {
                    if (typeof val === "undefined") {
                        return "undefined";
                    }
                    return input.metadata[SCHEMA_METADATA].serialize(val, data);
                },
            },
        },
    };
}
