import { ValidationError } from "./_index";
import { compile } from "./compile";
import { type ASchema, SCHEMA_METADATA, ValidationContext } from "./schemas";

export type ValidationAdapter = <T>(input: any) => ASchema<T>;

export function isAdaptedSchema(input: ASchema) {
    return input.metadata[SCHEMA_METADATA]._isAdapted === true;
}

export function validatorFromAdaptedSchema(
    schema: ASchema,
): ReturnType<typeof compile> {
    return {
        compiledCode: {
            parse: "",
            serialize: "",
            validate: "",
        },
        validate: schema.metadata[SCHEMA_METADATA].validate,
        parse(input) {
            const context: ValidationContext = {
                instancePath: "",
                schemaPath: "",
                errors: [],
            };
            return schema.metadata[SCHEMA_METADATA].parse(input, context);
        },
        safeParse(input) {
            const context: ValidationContext = {
                instancePath: "",
                schemaPath: "",
                errors: [],
            };
            try {
                const result = schema.metadata[SCHEMA_METADATA].parse(
                    input,
                    context,
                );
                return {
                    success: true,
                    value: result,
                };
            } catch (err) {
                if (err instanceof ValidationError) {
                    return {
                        success: false,
                        error: err,
                    };
                }
                return {
                    success: false,
                    error: new ValidationError({
                        message:
                            context.errors[0]?.message ??
                            `Error parsing input. ${err}`,
                        errors: context.errors,
                    }),
                };
            }
        },
        serialize(input) {
            const context: ValidationContext = {
                instancePath: "",
                schemaPath: "",
                errors: [],
            };
            return schema.metadata[SCHEMA_METADATA].serialize(input, context);
        },
    };
}
