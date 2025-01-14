import {
    createStandardSchemaProperty,
    hideInvalidProperties,
} from '../adapters';
import {
    type AArraySchema,
    type ASchema,
    type ASchemaOptions,
    type InferType,
    type ValidationContext,
    validatorKey,
} from '../schemas';

export function array<TInnerSchema extends ASchema<any> = any>(
    schema: TInnerSchema,
    opts: ASchemaOptions = {},
): AArraySchema<TInnerSchema> {
    const validateType = (
        input: unknown,
    ): input is InferType<AArraySchema<TInnerSchema>> => {
        return validate(schema, input);
    };
    const parseType = (
        input: unknown,
        context: ValidationContext,
    ): InferType<AArraySchema<TInnerSchema>> | undefined => {
        return parse(schema, input, context, false);
    };
    const result: AArraySchema<TInnerSchema> = {
        elements: schema,
        metadata: {
            id: opts.id,
            description: opts.description,
            isDeprecated: opts.isDeprecated,
            [validatorKey]: {
                output: [] as any,
                decode: parseType,
                coerce(input, context) {
                    return parse(schema, input, context, true);
                },
                validate: validateType,
                encode(input, context) {
                    const strParts: string[] = [];
                    for (let i = 0; i < input.length; i++) {
                        const item = input[i];
                        strParts.push(
                            schema.metadata[validatorKey].encode(item, {
                                instancePath: `${context.instancePath}/${i}`,
                                schemaPath: `${context.schemaPath}/elements`,
                                errors: context.errors,
                            }),
                        );
                    }
                    return `[${strParts.join(',')}]`;
                },
            },
        },
        '~standard': createStandardSchemaProperty(validateType, parseType),
    };
    hideInvalidProperties(result);
    return result;
}

function validate<T>(innerSchema: ASchema<T>, input: unknown): input is T[] {
    if (!Array.isArray(input)) {
        return false;
    }
    for (const item of input) {
        const isValid = innerSchema.metadata[validatorKey].validate(item);
        if (!isValid) {
            return false;
        }
    }
    return true;
}

function parse<T>(
    innerSchema: ASchema<T>,
    input: unknown,
    data: ValidationContext,
    coerce = false,
): T[] | undefined {
    let parsedInput: any = input;
    if (data.instancePath.length === 0 && typeof input === 'string') {
        try {
            parsedInput = JSON.parse(input);
        } catch (_) {
            data.errors.push({
                instancePath: data.instancePath,
                schemaPath: `${data.schemaPath}/elements`,
                message: `Error at ${data.instancePath}. Invalid JSON.`,
            });
            return undefined;
        }
    }
    if (!Array.isArray(parsedInput)) {
        data.errors.push({
            instancePath: data.instancePath,
            schemaPath: `${data.schemaPath}/elements`,
            message: `Error at ${
                data.instancePath
            }. Expected array. Got ${typeof input}.`,
        });
        return undefined;
    }
    const result: T[] = [];
    for (let i = 0; i < parsedInput.length; i++) {
        const item = parsedInput[i];
        if (coerce) {
            const parsedItem = innerSchema.metadata[validatorKey].coerce(item, {
                instancePath: `${data.instancePath}/${i}`,
                schemaPath: `${data.schemaPath}/elements`,
                errors: data.errors,
            });
            // if (data.errors.length) {
            //     return undefined;
            // }
            result.push(parsedItem as any);
        } else {
            const parsedItem = innerSchema.metadata[validatorKey].decode(item, {
                instancePath: `${data.instancePath}/${i}`,
                schemaPath: `${data.schemaPath}/elements`,
                errors: data.errors,
            });
            // if (data.errors.length) {
            //     return undefined;
            // }
            result.push(parsedItem as any);
        }
    }
    if (data.errors.length) {
        return undefined;
    }
    return result;
}
