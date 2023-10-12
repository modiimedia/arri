import { Optional, type Static, type TObject } from "@sinclair/typebox";
import { TypeCompiler } from "@sinclair/typebox/compiler";
import { Value, type ValueErrorIterator } from "@sinclair/typebox/value";
import {
    SCHEMA_METADATA,
    ValidationError,
    type ValueError,
    type AAdaptedSchema,
} from "arri-validate";
import { jsonSchemaToJtdSchema } from "json-schema-to-jtd";

export function typeboxAdapter<TInput extends TObject<any>>(
    input: TInput,
): AAdaptedSchema<Static<TInput>> {
    const schema = jsonSchemaToJtdSchema(input as any);
    const compiled = TypeCompiler.Compile<any>(input);
    return {
        ...schema,
        metadata: {
            id: input.$id ?? input.title,
            description: input.description,
            [SCHEMA_METADATA]: {
                _isAdaptedSchema: true,
                output: {} as any as Static<TInput>,
                optional: input[Optional] === "Optional",
                parse(val) {
                    if (typeof val === "string") {
                        const parsedVal = JSON.parse(val);
                        if (compiled.Check(parsedVal)) {
                            return parsedVal;
                        }
                        throw typeboxErrorsToArriError(
                            compiled.Errors(parsedVal),
                        );
                    }
                    if (compiled.Check(val)) {
                        return val;
                    }
                    throw typeboxErrorsToArriError(compiled.Errors(val));
                },
                coerce(val) {
                    return Value.Cast(input, val);
                },
                validate(val): val is Static<TInput> {
                    return compiled.Check(val);
                },
                serialize(val) {
                    return compiled.Encode(val);
                },
            },
        },
    };
}

function typeboxErrorsToArriError(errs: ValueErrorIterator): ValidationError {
    const mappedErrs: ValueError[] = [];
    for (const err of errs) {
        const obj: ValueError = {
            message: err.message,
            instancePath: err.path,
            schemaPath: "",
            data: err.value,
        };
        mappedErrs.push(obj);
    }
    return new ValidationError({
        message: "Error validating input",
        errors: mappedErrs,
    });
}
