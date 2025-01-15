import * as UValidator from '@arrirpc/schema-interface';

import {
    createStandardSchemaProperty,
    createUValidatorProperty,
    hideInvalidProperties,
} from '../adapters';
import {
    type ARecordSchema,
    type ASchema,
    type ASchemaOptions,
    type InferType,
    isObject,
    SchemaValidator,
    type ValidationContext,
    ValidationsKey,
} from '../schemas';
import { serializeString } from './string';

/**
 * Create a schema for a record with strings keys
 *
 * @example
 * const StringRecord = a.record(
 *   a.string(),
 * );
 * a.validate(StringRecord, {foo: "bar"}) // true
 *
 * const ObjectRecord = a.record(
 *   a.object({
 *     id: a.string(),
 *     date: a.timestamp(),
 *   })
 * )
 * a.validate(ObjectRecord, {foo: {id: "1", date: new Date()}}) // true
 */
export function record<TInnerSchema extends ASchema<any>>(
    schema: TInnerSchema,
    opts: ASchemaOptions = {},
): ARecordSchema<TInnerSchema> {
    const validateFn = (
        input: unknown,
    ): input is InferRecordType<TInnerSchema> => {
        if (!isObject(input)) {
            return false;
        }
        for (const key of Object.keys(input)) {
            const val = input[key];
            const isValid = schema[ValidationsKey].validate(val);
            if (!isValid) {
                return false;
            }
        }
        return true;
    };
    const parseFn = (
        input: unknown,
        ctx: ValidationContext,
    ): InferRecordType<TInnerSchema> | undefined => {
        return parse(schema, input, ctx, false);
    };
    const validator: SchemaValidator<InferRecordType<TInnerSchema>> = {
        output: {},
        validate: validateFn,
        decode: parseFn,
        coerce(input: unknown, data) {
            return parse(schema, input, data, true);
        },
        encode(input, context) {
            if (context.depth >= context.maxDepth) {
                context.errors.push({
                    instancePath: context.instancePath,
                    schemaPath: context.schemaPath,
                    message: 'Max depth reached',
                });
                return undefined;
            }
            let result = '{';
            const keys = Object.keys(input);
            for (let i = 0; i < keys.length; i++) {
                const key = keys[i]!;
                const val = input[key];
                if (i > 0) result += ',';
                result += serializeString(key);
                result += ':';
                result += schema[ValidationsKey].encode(val, {
                    instancePath: `${context.instancePath}/${key}`,
                    schemaPath: `${context.schemaPath}/values`,
                    errors: context.errors,
                    exitOnFirstError: context.exitOnFirstError,
                    depth: context.depth + 1,
                    maxDepth: context.maxDepth,
                });
            }
            result += '}';
            return result;
        },
    };
    const result: ARecordSchema<TInnerSchema> = {
        values: schema,
        metadata: {
            id: opts.id,
            description: opts.description,
            isDeprecated: opts.isDeprecated,
        },
        [ValidationsKey]: validator,
        [UValidator.v1]: createUValidatorProperty(validator),
        '~standard': createStandardSchemaProperty(validateFn, parseFn),
    };
    hideInvalidProperties(result);
    return result;
}

function parse<T>(
    schema: ASchema<T>,
    input: unknown,
    data: ValidationContext,
    coerce = false,
): Record<string, T> | undefined {
    if (data.depth >= data.maxDepth) {
        data.errors.push({
            instancePath: data.instancePath,
            schemaPath: data.schemaPath,
            message: 'Max depth reached',
        });
        return undefined;
    }
    let parsedInput: any = input;
    if (
        data.instancePath.length === 0 &&
        typeof input === 'string' &&
        input.length > 0
    ) {
        parsedInput = JSON.parse(input);
    }
    if (!isObject(parsedInput)) {
        data.errors.push({
            instancePath: data.instancePath,
            schemaPath: `${data.schemaPath}/values`,
            message: `Error at ${data.instancePath} Expected object`,
        });
        return undefined;
    }
    const result: Record<any, any> = {};
    for (const key of Object.keys(parsedInput)) {
        const val = parsedInput[key];
        if (coerce) {
            result[key] = schema[ValidationsKey].coerce(val, {
                instancePath: `${data.instancePath}/${key}`,
                schemaPath: `${data.schemaPath}/values`,
                errors: data.errors,
                maxDepth: data.maxDepth,
                depth: data.depth + 1,
                exitOnFirstError: data.exitOnFirstError,
            });
        } else {
            result[key] = schema[ValidationsKey].decode(val, {
                instancePath: `${data.instancePath}/${key}`,
                schemaPath: `${data.schemaPath}/values`,
                errors: data.errors,
                maxDepth: data.maxDepth,
                depth: data.depth + 1,
                exitOnFirstError: data.exitOnFirstError,
            });
        }
    }
    if (data.errors.length) {
        return undefined;
    }
    return result;
}

type InferRecordType<TInnerSchema extends ASchema<any>> = Record<
    string,
    InferType<TInnerSchema>
>;
