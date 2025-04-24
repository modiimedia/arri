import {
    createStandardSchemaProperty,
    hideInvalidProperties,
} from '../adapters';
import {
    AScalarSchemaWithAdapters,
    type ASchemaOptions,
    SchemaValidator,
    type ValidationContext,
    VALIDATOR_KEY,
} from '../schemas';
/**
 * Create a Date schema
 *
 * @example
 * const Schema = a.timestamp();
 * a.validate(Schema, new Date()) // true
 */
export function timestamp(
    opts: ASchemaOptions = {},
): AScalarSchemaWithAdapters<'timestamp', Date> {
    const validator: SchemaValidator<Date> = {
        output: new Date(),
        optional: false,
        validate,
        parse: parse,
        coerce,
        serialize: serialize,
    };
    const result: AScalarSchemaWithAdapters<'timestamp', Date> = {
        type: 'timestamp',
        metadata: {
            id: opts.id,
            description: opts.description,
            isDeprecated: opts.isDeprecated,
        },
        [VALIDATOR_KEY]: validator,
        '~standard': createStandardSchemaProperty(validate, parse),
    };
    hideInvalidProperties(result);
    return result;
}

function validate(input: unknown): input is Date {
    return typeof input === 'object' && input instanceof Date;
}
function parse(input: unknown, data: ValidationContext): Date | undefined {
    try {
        if (validate(input)) {
            return input;
        }
        if (typeof input === 'string') {
            const result = Date.parse(input);
            if (Number.isNaN(result)) {
                data?.errors.push({
                    message: `Error at ${data.instancePath}. Invalid date string.`,
                    instancePath: data.instancePath,
                    schemaPath: `${data.schemaPath}/type`,
                });
                return undefined;
            }
            return new Date(result);
        }
        data.errors.push({
            message: `Error at ${data.instancePath}. Invalid date.`,
            instancePath: data.instancePath,
            schemaPath: `${data.schemaPath}/type`,
        });
        return undefined;
    } catch (err) {
        data.errors.push({
            message: err instanceof Error ? err.message : `${err}`,
            instancePath: data.instancePath,
            schemaPath: data.schemaPath,
            data: err,
        });
        return undefined;
    }
}
function coerce(input: unknown, options: ValidationContext): Date | undefined {
    if (typeof input === 'number') {
        return new Date(input);
    }
    return parse(input, options);
}
function serialize(input: Date, data: ValidationContext): string {
    if (data.instancePath.length === 0) {
        return input.toISOString();
    }
    return `"${input.toISOString()}"`;
}
