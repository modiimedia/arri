import { ASchema, ASchemaOptions, SCHEMA_METADATA } from "../schemas";

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
    input: ASchema<T>,
    opts: ASchemaOptions = {},
): ASchema<T | null> {
    const isType = (val: unknown): val is T | null => {
        if (val === null) {
            return true;
        }
        return input.metadata[SCHEMA_METADATA].validate(val);
    };
    return {
        ...input,
        nullable: true,
        metadata: {
            id: opts.id,
            description: opts.description,
            [SCHEMA_METADATA]: {
                output: null as T | null,
                optional: input.metadata[SCHEMA_METADATA].optional,
                validate: isType,
                parse: (val: unknown) => {
                    if (val === null) {
                        return null;
                    }
                    return input.metadata[SCHEMA_METADATA].parse(val);
                },
                coerce: (val: unknown) => {
                    if (val === null) {
                        return null;
                    }
                    if (val === "null") {
                        return null;
                    }
                    return input.metadata[SCHEMA_METADATA].coerce(val);
                },
                serialize: (val) => {
                    if (val === null) {
                        return "null";
                    }
                    return input.metadata[SCHEMA_METADATA].serialize(val);
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
        if (typeof val === "undefined") {
            return true;
        }
        return input.metadata[SCHEMA_METADATA].validate(val);
    };
    return {
        ...input,
        metadata: {
            id: opts.id,
            description: opts.description,
            [SCHEMA_METADATA]: {
                output: undefined as T | undefined,
                optional: true,
                validate: isType,
                parse: (val) => {
                    if (typeof val === "undefined") {
                        return val;
                    }
                    return input.metadata[SCHEMA_METADATA].parse(val);
                },
                coerce: (val) => {
                    if (typeof val === "undefined") {
                        return val;
                    }
                    if (val === "undefined") {
                        return undefined;
                    }
                    return input.metadata[SCHEMA_METADATA].coerce(val);
                },
                serialize: (val) => {
                    if (typeof val === "undefined") {
                        return "undefined";
                    }
                    return input.metadata[SCHEMA_METADATA].serialize(val);
                },
            },
        },
    };
}
