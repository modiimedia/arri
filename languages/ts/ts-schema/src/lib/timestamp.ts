import { v1 } from '@arrirpc/schema-interface';

import {
    createStandardSchemaProperty as createStandardSchemaProperty,
    hideInvalidProperties,
} from '../adapters';
import {
    type AScalarSchema,
    type ASchemaOptions,
    newValidationContext,
    type ValidationContext,
    validatorKey as arriValidations,
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
): AScalarSchema<'timestamp', Date> {
    const result: AScalarSchema<'timestamp', Date> = {
        type: 'timestamp',
        metadata: {
            id: opts.id,
            description: opts.description,
            isDeprecated: opts.isDeprecated,
        },
        [arriValidations]: {
            output: new Date(),
            validate,
            decode: parse,
            coerce,
            encode: serialize,
        },
        '~standard': createStandardSchemaProperty(validate, parse),
        [v1]: {
            isAtd: true,
            validate,
            decodeJson(input) {
                const ctx: ValidationContext = {
                    instancePath: '',
                    schemaPath: '',
                    errors: [],
                };
                const result = parse(input, ctx);
                if (!result || ctx.errors.length) {
                    return {
                        success: false,
                        errors: ctx.errors.length
                            ? ctx.errors
                            : [
                                  {
                                      instancePath: '',
                                      schemaPath: '',
                                      message: 'error decoding date',
                                  },
                              ],
                    };
                }
                return {
                    success: true,
                    value: result,
                };
            },
            encodeJson(input) {
                try {
                    return {
                        success: true,
                        value: serialize(input, {
                            instancePath: '',
                            schemaPath: '',
                            errors: [],
                        }),
                    };
                } catch (err) {
                    return {
                        success: false,
                        errors: [
                            {
                                instancePath: '',
                                schemaPath: '',
                                message:
                                    err instanceof Error
                                        ? err.message
                                        : `${err}`,
                                data: err,
                            },
                        ],
                    };
                }
            },
            decodeQueryString(input) {
                const ctx = newValidationContext();
                const result = coerce(input, ctx);
                if (!result || ctx.errors.length) {
                    return {
                        success: false,
                        errors: ctx.errors,
                    };
                }
                return {
                    success: true,
                    value: result,
                };
            },
        },
    };
    hideInvalidProperties(result);
    return result;
}

function validate(input: unknown): input is Date {
    return typeof input === 'object' && input instanceof Date;
}
function parse(input: unknown, data: ValidationContext): Date | undefined {
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
