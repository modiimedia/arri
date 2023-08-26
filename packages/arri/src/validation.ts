import { type Static, type TSchema } from "@sinclair/typebox";
import { type ValueError } from "@sinclair/typebox/errors";
import { Value } from "@sinclair/typebox/value";

export function typeboxSafeValidate<T extends TSchema>(
    schema: T,
    coerce = false,
) {
    const fn = (
        input: any,
    ):
        | { success: true; value: Static<T> }
        | { success: false; errors: ValueError[] } => {
        const finalInput = coerce ? Value.Convert(schema, input) : input;
        if (Value.Check(schema, finalInput)) {
            return { success: true, value: finalInput as Static<T> };
        }
        const errs = [...Value.Errors(schema, finalInput)];
        return {
            success: false,
            errors: errs,
        };
    };
    return fn;
}
