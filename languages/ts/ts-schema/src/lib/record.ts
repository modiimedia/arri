import {
    createStandardSchemaProperty,
    hideInvalidProperties,
} from '../adapters';
import {
    ARecordSchemaWithAdapters,
    type ASchema,
    type ASchemaOptions,
    type InferType,
    isObject,
    SchemaValidator,
    type ValidationContext,
    VALIDATOR_KEY,
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
export function record<TInnerSchema extends ASchema<any, any>>(
    schema: TInnerSchema,
    opts: ASchemaOptions = {},
): ARecordSchemaWithAdapters<TInnerSchema> {
    const validateFn = (
        input: unknown,
    ): input is InferRecordType<TInnerSchema> => {
        if (!isObject(input)) {
            return false;
        }
        for (const key of Object.keys(input)) {
            const val = input[key];
            const isValid = schema[VALIDATOR_KEY].validate(val);
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
        optional: false,
        validate: validateFn,
        parse: parseFn,
        coerce(input: unknown, data) {
            return parse(schema, input, data, true);
        },
        serialize(input, context) {
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
                result += schema[VALIDATOR_KEY].serialize(val, {
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
    const result: ARecordSchemaWithAdapters<TInnerSchema> = {
        values: schema,
        metadata: {
            id: opts.id,
            description: opts.description,
            isDeprecated: opts.isDeprecated,
        },
        [VALIDATOR_KEY]: validator,
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
        try {
            parsedInput = JSON.parse(input);
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
            result[key] = schema[VALIDATOR_KEY].coerce(val, {
                instancePath: `${data.instancePath}/${key}`,
                schemaPath: `${data.schemaPath}/values`,
                errors: data.errors,
                maxDepth: data.maxDepth,
                depth: data.depth + 1,
                exitOnFirstError: data.exitOnFirstError,
            });
        } else {
            result[key] = schema[VALIDATOR_KEY].parse(val, {
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
