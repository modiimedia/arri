import {
    ArriNativeValidator,
    ValidationError,
} from '@arrirpc/schema-interface';
import { v1 } from '@arrirpc/schema-interface';
import { StandardSchemaV1 } from '@standard-schema/spec';

import {
    ASchema,
    newValidationContext,
    ValidationContext,
    validatorKey,
} from './schemas';

export function createStandardSchemaProperty<T>(
    validate: (input: unknown) => input is T,
    parse: (input: unknown, ctx: ValidationContext) => T | undefined,
): StandardSchemaV1<T>['~standard'] {
    return {
        version: 1,
        vendor: 'arri',
        validate(input): StandardSchemaV1.Result<T> {
            if (validate(input)) {
                return {
                    value: input,
                };
            }
            const ctx: ValidationContext = {
                instancePath: '',
                schemaPath: '',
                errors: [],
            };
            try {
                const result = parse(input, ctx);
                if (ctx.errors.length) {
                    return {
                        issues: ctx.errors.map((err) => ({
                            message: err.message ?? 'Unknown error',
                            path: err.instancePath
                                .split('/')
                                .filter((val) => val.length > 0),
                        })),
                    };
                }
                return {
                    value: result!,
                };
            } catch (err) {
                if (err instanceof ValidationError) {
                    return {
                        issues: err.errors.map((err) => ({
                            message: err.message ?? 'Unknown error',
                            path: err.instancePath
                                .split('/')
                                .filter((item) => item.length > 0),
                        })),
                    };
                }
                return {
                    issues: [
                        {
                            message:
                                err instanceof Error ? err.message : `${err}`,
                        },
                    ],
                };
            }
        },
    };
}

/**
 * Ensure that non ATD compliant properties get hidden when serialized to JSON
 */
export function hideInvalidProperties(schema: ASchema) {
    Object.defineProperty(schema, '~standard', { enumerable: false });
}

export function createArriInterfaceProperty<T>(
    validator: ASchema<T>[typeof validatorKey],
): ArriNativeValidator<T>[typeof v1] {
    const result: ArriNativeValidator<T>[typeof v1] = {
        isAtd: true,
        validate: validator.validate,
        decodeJson(input) {
            const ctx = newValidationContext();
            const result = validator.decode(input, ctx);
            if (
                ctx.errors.length ||
                (typeof result === 'undefined' && !validator.optional)
            ) {
                return {
                    success: false,
                    errors: ctx.errors,
                };
            }
            return {
                success: true,
                value: result!,
            };
        },
        encodeJson(input) {
            try {
                const ctx = newValidationContext();
                const result = validator.encode(input, ctx);
                if (ctx.errors.length) {
                    return {
                        success: false,
                        errors: ctx.errors,
                    };
                }
                return {
                    success: true,
                    value: result,
                };
            } catch (err) {
                if (err instanceof ValidationError) {
                    return {
                        success: false,
                        errors: err.errors,
                    };
                }
                if (err instanceof Error) {
                    return {
                        success: false,
                        errors: [
                            {
                                message: err.message,
                                instancePath: '',
                                schemaPath: '',
                            },
                        ],
                    };
                }
                return {
                    success: false,
                    errors: [
                        {
                            message: `${err}`,
                            instancePath: '',
                            schemaPath: '',
                            data: err,
                        },
                    ],
                };
            }
        },
        decodeQueryString(input) {
            const ctx = newValidationContext();
            const result = validator.coerce(input, ctx);
            if (ctx.errors.length || (!result && !validator.optional)) {
                return {
                    success: false,
                    errors: ctx.errors,
                };
            }
            return {
                success: true,
                value: result!,
            };
        },
    };
    return result;
}
