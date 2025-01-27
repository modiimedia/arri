import {
    createStandardSchemaProperty,
    hideInvalidProperties,
} from '../adapters';
import {
    type ASchema,
    type ASchemaOptions,
    ASchemaWithAdapters,
    SchemaValidator,
    ValidationContext,
    VALIDATOR_KEY,
} from '../schemas';

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
): ASchemaWithAdapters<T | null> {
    const isType = (val: unknown): val is T | null => {
        if (val === null) {
            return true;
        }
        return schema[VALIDATOR_KEY].validate(val);
    };
    const parse = (
        val: unknown,
        data: ValidationContext,
    ): T | null | undefined => {
        if (
            data.instancePath.length === 0 &&
            typeof val === 'string' &&
            val === 'null'
        ) {
            return null;
        }
        if (val === null) {
            return null;
        }
        return schema[VALIDATOR_KEY].parse(val, data);
    };
    const validator: SchemaValidator<T | null> = {
        output: null as T | null,
        optional: schema[VALIDATOR_KEY].optional,
        validate: isType,
        parse: parse,
        coerce(val, data) {
            if (val === null) {
                return null;
            }
            if (val === 'null') {
                return null;
            }
            return schema[VALIDATOR_KEY].coerce(val, data);
        },
        serialize(val, data) {
            if (val === null) {
                return 'null';
            }
            return schema[VALIDATOR_KEY].serialize(val, data);
        },
    };
    const result: ASchemaWithAdapters<T | null> = {
        ...schema,
        nullable: true,
        metadata: {
            id: opts.id ?? schema.metadata?.id,
            description: opts.description ?? schema.metadata?.description,
            isDeprecated: opts.isDeprecated ?? schema.metadata?.isDeprecated,
        },
        [VALIDATOR_KEY]: validator,
        '~standard': createStandardSchemaProperty(
            validator.validate,
            validator.parse,
        ),
    };
    hideInvalidProperties(result);
    return result;
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
        return input[VALIDATOR_KEY].validate(val);
    };
    const parse = (val: unknown, context: ValidationContext): T | undefined => {
        if (typeof val === 'undefined') {
            return undefined;
        }
        if (context.instancePath.length === 0 && val === 'undefined') {
            return undefined;
        }
        return input[VALIDATOR_KEY].parse(val, context);
    };
    const validator: SchemaValidator<T | undefined> = {
        output: undefined as T | undefined,
        optional: true,
        validate: isType,
        parse: parse,
        coerce: (val, data) => {
            if (typeof val === 'undefined') {
                return undefined;
            }
            if (val === 'undefined') {
                return undefined;
            }
            return input[VALIDATOR_KEY].coerce(val, data);
        },
        serialize: (val, data) => {
            if (typeof val === 'undefined') {
                return 'undefined';
            }
            return input[VALIDATOR_KEY].serialize(val, data);
        },
    };
    const result: ASchemaWithAdapters<T | undefined> = {
        ...input,
        metadata: {
            id: opts.id ?? input.metadata?.id,
            description: opts.description ?? input.metadata?.description,
            isDeprecated: opts.isDeprecated ?? input.metadata?.isDeprecated,
        },
        [VALIDATOR_KEY]: validator,
        '~standard': createStandardSchemaProperty(isType, parse),
    };
    hideInvalidProperties(result);
    return result;
}

export function clone<T>(
    input: ASchema<T>,
    opts: ASchemaOptions = {},
): ASchemaWithAdapters<T> {
    const validator = {
        ...input[VALIDATOR_KEY],
    };
    const schema: ASchemaWithAdapters<T> = {
        ...input,
        metadata: {
            id: opts.id,
            description: opts.description,
            isDeprecated: opts.isDeprecated,
        },
        [VALIDATOR_KEY]: validator,
        '~standard': createStandardSchemaProperty(
            validator.validate,
            validator.parse,
        ),
    };
    hideInvalidProperties(schema);
    return schema;
}
