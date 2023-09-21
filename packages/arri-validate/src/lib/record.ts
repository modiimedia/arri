import {
    type ARecordSchema,
    type ASchema,
    type ASchemaOptions,
    type InferType,
    SCHEMA_METADATA,
    isObject,
    type ValidationData,
} from "../schemas";

export function record<TInnerSchema extends ASchema<any>>(
    schema: TInnerSchema,
    opts: ASchemaOptions = {},
): ARecordSchema<TInnerSchema> {
    return {
        values: schema,
        metadata: {
            id: opts.id,
            description: opts.description,
            [SCHEMA_METADATA]: {
                output: {},
                validate(input): input is InferRecordType<TInnerSchema> {
                    if (!isObject(input)) {
                        return false;
                    }
                    for (const key of Object.keys(input)) {
                        const val = input[key];
                        const isValid =
                            schema.metadata[SCHEMA_METADATA].validate(val);
                        if (!isValid) {
                            return false;
                        }
                    }
                    return true;
                },
                parse(input, data) {
                    return parse(schema, input, data, false);
                },
                coerce(input: unknown, data) {
                    return parse(schema, input, data, true);
                },
                serialize: (input) => JSON.stringify(input),
            },
        },
    };
}

function parse<T>(
    schema: ASchema<T>,
    input: unknown,
    data: ValidationData,
    coerce = false,
): Record<string, T> | undefined {
    let parsedInput: any = input;
    if (data.instancePath.length === 0 && typeof input === "string") {
        parsedInput = JSON.parse(input);
    }
    if (!isObject(parsedInput)) {
        data.errors.push({
            instancePath: data.instancePath,
            schemaPath: data.schemaPath,
            message: "Expected object",
        });
        return undefined;
    }
    const result: Record<any, any> = {};
    for (const key of Object.keys(parsedInput)) {
        const val = parsedInput[key];
        if (coerce) {
            result[key] = schema.metadata[SCHEMA_METADATA].coerce(val, {
                instancePath: `${data.instancePath}/${key}`,
                schemaPath: `${data.schemaPath}/values`,
                errors: data.errors,
            });
        } else {
            result[key] = schema.metadata[SCHEMA_METADATA].parse(val, {
                instancePath: `${data.instancePath}/${key}`,
                schemaPath: `${data.schemaPath}/values`,
                errors: data.errors,
            });
        }
    }
    if (data.errors.length) {
        return undefined;
    }
    return result;
}

/**
 * An alias for `a.record()`
 */
export const dictionary = record;

type InferRecordType<TInnerSchema extends ASchema<any>> = Record<
    string,
    InferType<TInnerSchema>
>;