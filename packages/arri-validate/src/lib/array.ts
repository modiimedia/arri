import {
    type AArraySchema,
    type ASchema,
    type InferType,
    type ASchemaOptions,
    SCHEMA_METADATA,
    type ValidationData,
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
            [SCHEMA_METADATA]: {
                output: [] as any,
                parse(input, data) {
                    return parse(schema, input, data, false);
                },
                coerce(input, data) {
                    return parse(schema, input, data, true);
                },
                validate(
                    input,
                ): input is InferType<AArraySchema<TInnerSchema>> {
                    return validate(schema, input);
                },
                serialize(input) {
                    return JSON.stringify(input);
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
    data: ValidationData,
    coerce = false,
): T[] | undefined {
    let parsedInput: any = input;
    if (data.instancePath.length === 0 && typeof input === "string") {
        try {
            parsedInput = JSON.parse(input);
        } catch (err) {
            data.errors.push({
                instancePath: data.instancePath,
                schemaPath: data.schemaPath,
                message: "Invalid JSON",
            });
            return undefined;
        }
    }
    if (!Array.isArray(input)) {
        data.errors.push({
            instancePath: data.instancePath,
            schemaPath: data.schemaPath,
            message: `Expected array. Got ${typeof input}.`,
        });
        return undefined;
    }
    const result: T[] = [];
    for (let i = 0; i < input.length; i++) {
        const item = input[i];
        if (coerce) {
            const parsedItem = innerSchema.metadata[SCHEMA_METADATA].coerce(
                item,
                {
                    instancePath: `${data.instancePath}/${i}`,
                    schemaPath: `${data.schemaPath}/elements`,
                    errors: data.errors,
                },
            );
            if (!parsedItem) {
                return undefined;
            }
            result.push(parsedItem);
        } else {
            const parsedItem = innerSchema.metadata[SCHEMA_METADATA].parse(
                item,
                {
                    instancePath: `${data.instancePath}/${i}`,
                    schemaPath: `${data.schemaPath}/elements`,
                    errors: data.errors,
                },
            );
            if (!parsedItem) {
                return undefined;
            }
            result.push(parsedInput);
        }
    }
    if (data.errors.length) {
        return undefined;
    }
    return result;
}
