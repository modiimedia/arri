import { StandardSchemaV1 } from '@standard-schema/spec';

import { ASchema, newValidationContext, ValidationContext } from './schemas';

export function createStandardSchemaProperty<T>(
    validate: (input: unknown) => input is T,
    parse: (input: unknown, ctx: ValidationContext) => T | undefined,
    vendor = 'arri',
): StandardSchemaV1<T>['~standard'] {
    return {
        version: 1,
        vendor,
        validate(input): StandardSchemaV1.Result<T> {
            const ctx = newValidationContext(true);
            const result = parse(input, ctx);
            if (ctx.errors.length) {
                return {
                    issues: ctx.errors.map((err) => ({
                        message: err.message ?? 'Unknown error',
                        path: err.instancePath
                            ?.split('/')
                            .filter((val) => val.length > 0),
                    })),
                };
            }
            return {
                value: result as T,
            };
        },
    };
}

/**
 * Ensure that non ATD compliant properties get hidden when serialized to JSON
 */
export function hideInvalidProperties(schema: ASchema) {
    Object.defineProperty(schema, '~standard', { enumerable: false });
}

// export function createUValidatorProperty<T>(
//     validator: ASchema<T>[typeof ValidationsKey],
//     vendor = 'arri',
// ): UValidatorWith<
//     T,
//     'parse' | 'serialize' | 'coerce' | 'validate' | 'errors'
// >[typeof v1] {
//     const result: UValidatorWith<
//         T,
//         'parse' | 'serialize' | 'coerce' | 'validate' | 'errors'
//     >[typeof v1] = {
//         vendor,
//         validate: validator.validate,
//         parse(input) {
//             const ctx = newValidationContext(true);
//             const result = validator.parse(input, ctx);
//             if (
//                 ctx.errors.length ||
//                 (typeof result === 'undefined' && !validator.optional)
//             ) {
//                 return {
//                     success: false,
//                     errors: ctx.errors,
//                 };
//             }
//             return {
//                 success: true,
//                 value: result!,
//             };
//         },
//         serialize(input) {
//             try {
//                 const ctx = newValidationContext(true);
//                 const result = validator.serialize(input, ctx);
//                 if (ctx.errors.length || typeof result === 'undefined') {
//                     return {
//                         success: false,
//                         errors: ctx.errors,
//                     };
//                 }
//                 return {
//                     success: true,
//                     value: result,
//                 };
//             } catch (err) {
//                 if (err instanceof ValidationException) {
//                     return {
//                         success: false,
//                         errors: err.errors,
//                     };
//                 }
//                 if (err instanceof Error) {
//                     return {
//                         success: false,
//                         errors: [
//                             {
//                                 message: err.message,
//                                 instancePath: '',
//                                 schemaPath: '',
//                             },
//                         ],
//                     };
//                 }
//                 return {
//                     success: false,
//                     errors: [
//                         {
//                             message: `${err}`,
//                             instancePath: '',
//                             schemaPath: '',
//                             data: err,
//                         },
//                     ],
//                 };
//             }
//         },
//         coerce(input) {
//             const ctx = newValidationContext(true);
//             const result = validator.coerce(input, ctx);
//             if (ctx.errors.length || (!result && !validator.optional)) {
//                 return {
//                     success: false,
//                     errors: ctx.errors,
//                 };
//             }
//             return {
//                 success: true,
//                 value: result!,
//             };
//         },
//         errors(input) {
//             const ctx = newValidationContext();
//             try {
//                 validator.parse(input, ctx);
//             } catch (err) {
//                 ctx.errors.push({
//                     instancePath: '',
//                     schemaPath: '',
//                     message: `${err}`,
//                 });
//             }
//             return ctx.errors;
//         },
//     };
//     return result;
// }
