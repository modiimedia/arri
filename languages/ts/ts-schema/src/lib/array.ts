import {
    createStandardSchemaProperty,
    hideInvalidProperties,
} from '../adapters';
import {
    type AArraySchema,
    type ASchema,
    type ASchemaOptions,
    type InferType,
    SchemaValidator,
    type ValidationContext,
    VALIDATOR_KEY,
    WithAdapters,
} from '../schemas';

export function array<TInnerSchema extends ASchema<any> = any>(
    schema: TInnerSchema,
    opts: ASchemaOptions = {},
): AArraySchema<TInnerSchema> & WithAdapters<InferType<TInnerSchema>[]> {
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
    const validator: SchemaValidator<
        InferType<AArraySchema<TInnerSchema>>,
        false
    > = {
        output: [] as any,
        optional: false,
        parse: parseType,
        coerce(input, context) {
            return parse(schema, input, context, true);
        },
        validate: validateType,
        serialize(input, context) {
            const strParts: string[] = [];
            for (let i = 0; i < input.length; i++) {
                const item = input[i];
                const part = schema[VALIDATOR_KEY].serialize(item, {
                    instancePath: `${context.instancePath}/${i}`,
                    schemaPath: `${context.schemaPath}/elements`,
                    errors: context.errors,
                    depth: context.depth + 1,
                    maxDepth: context.maxDepth,
                    exitOnFirstError: context.exitOnFirstError,
                });
                if (!part) {
                    return undefined;
                }
                strParts.push(part);
            }
            return `[${strParts.join(',')}]`;
        },
    };
    const result: AArraySchema<TInnerSchema> &
        WithAdapters<InferType<TInnerSchema>[]> = {
        elements: schema,
        metadata: {
            id: opts.id,
            description: opts.description,
            isDeprecated: opts.isDeprecated,
        },
        [VALIDATOR_KEY]: validator,
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
        const isValid = innerSchema[VALIDATOR_KEY].validate(item);
        if (!isValid) {
            return false;
        }
    }
    return true;
}

function parse<T>(
    innerSchema: ASchema<T>,
    input: unknown,
    context: ValidationContext,
    coerce = false,
): T[] | undefined {
    let parsedInput: any = input;
    if (context.instancePath.length === 0 && typeof input === 'string') {
        try {
            parsedInput = JSON.parse(input);
        } catch (_) {
            context.errors.push({
                instancePath: context.instancePath,
                schemaPath: `${context.schemaPath}/elements`,
                message: `Error at ${context.instancePath}. Invalid JSON.`,
            });
            return undefined;
        }
    }
    if (!Array.isArray(parsedInput)) {
        context.errors.push({
            instancePath: context.instancePath,
            schemaPath: `${context.schemaPath}/elements`,
            message: `Error at ${
                context.instancePath
            }. Expected array. Got ${typeof input}.`,
        });
        return undefined;
    }
    const result: T[] = [];
    for (let i = 0; i < parsedInput.length; i++) {
        const item = parsedInput[i];
        if (coerce) {
            const parsedItem = innerSchema[VALIDATOR_KEY].coerce(item, {
                instancePath: `${context.instancePath}/${i}`,
                schemaPath: `${context.schemaPath}/elements`,
                errors: context.errors,
                depth: context.depth + 1,
                maxDepth: context.maxDepth,
                exitOnFirstError: context.exitOnFirstError,
            });
            // if (data.errors.length) {
            //     return undefined;
            // }
            result.push(parsedItem as any);
        } else {
            const parsedItem = innerSchema[VALIDATOR_KEY].parse(item, {
                instancePath: `${context.instancePath}/${i}`,
                schemaPath: `${context.schemaPath}/elements`,
                errors: context.errors,
                depth: context.depth + 1,
                maxDepth: context.maxDepth,
                exitOnFirstError: context.exitOnFirstError,
            });
            // if (data.errors.length) {
            //     return undefined;
            // }
            result.push(parsedItem as any);
        }
    }
    if (context.errors.length) {
        return undefined;
    }
    return result;
}
