import { StandardSchemaV1 } from '@standard-schema/spec';

import { ValidationError } from './_index';
import { ASchema, ValidationContext } from './schemas';

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
