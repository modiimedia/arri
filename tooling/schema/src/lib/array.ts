import {
    type AArraySchema,
    type ASchema,
    type ASchemaOptions,
    type InferType,
    SCHEMA_METADATA,
    type ValidationContext,
} from "../schemas";

export function array<TInnerSchema extends ASchema<any> = any>(
    schema: TInnerSchema,
    opts: ASchemaOptions = {},
): AArraySchema<TInnerSchema> {
    return {
        elements: schema,
        metadata: {
            id: opts.id,
            description: opts.description,
            isDeprecated: opts.isDeprecated,
            [SCHEMA_METADATA]: {
                output: [] as any,
                parse(input, context) {
                    return parse(schema, input, context, false);
                },
                coerce(input, context) {
                    return parse(schema, input, context, true);
                },
                validate(
                    input,
                ): input is InferType<AArraySchema<TInnerSchema>> {
                    return validate(schema, input);
                },
                serialize(input, context) {
                    const strParts: string[] = [];
                    for (let i = 0; i < input.length; i++) {
                        const item = input[i];
                        strParts.push(
                            schema.metadata[SCHEMA_METADATA].serialize(item, {
                                instancePath: `${context.instancePath}/${i}`,
                                schemaPath: `${context.schemaPath}/elements`,
                                errors: context.errors,
                            }),
                        );
                    }
                    return `[${strParts.join(",")}]`;
                },
            },
        },
    };
}

function validate<T>(innerSchema: ASchema<T>, input: unknown): input is T[] {
    if (!Array.isArray(input)) {
        return false;
    }
    for (const item of input) {
        const isValid = innerSchema.metadata[SCHEMA_METADATA].validate(item);
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
    if (data.instancePath.length === 0 && typeof input === "string") {
        try {
            parsedInput = JSON.parse(input);
        } catch (err) {
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
            const parsedItem = innerSchema.metadata[SCHEMA_METADATA].coerce(
                item,
                {
                    instancePath: `${data.instancePath}/${i}`,
                    schemaPath: `${data.schemaPath}/elements`,
                    errors: data.errors,
                },
            );
            // if (data.errors.length) {
            //     return undefined;
            // }
            result.push(parsedItem as any);
        } else {
            const parsedItem = innerSchema.metadata[SCHEMA_METADATA].parse(
                item,
                {
                    instancePath: `${data.instancePath}/${i}`,
                    schemaPath: `${data.schemaPath}/elements`,
                    errors: data.errors,
                },
            );
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
