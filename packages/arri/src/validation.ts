import {
    SCHEMA_METADATA,
    type ASchema,
    type a,
    ValidationError,
    isValidationError,
} from "arri-validate";
export function arriSafeValidate<TSchema extends ASchema<any>>(
    schema: ASchema,
    input: unknown,
    coerce = false,
):
    | { success: true; value: a.infer<TSchema> }
    | { success: false; error: ValidationError } {
    try {
        if (coerce) {
            const result = schema.metadata[SCHEMA_METADATA].coerce(input);
            return {
                success: true,
                value: result,
            };
        }
        const result = schema.metadata[SCHEMA_METADATA].parse(input);
        return {
            success: true,
            value: result,
        };
    } catch (err) {
        if (isValidationError(err)) {
            return { success: false, error: err };
        }
        return {
            success: false,
            error: new ValidationError([
                {
                    message: "Unknown validation error",
                    data: err,
                },
            ]),
        };
    }
}
