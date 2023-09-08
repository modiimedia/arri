import { Optional, type Static, type TObject } from "@sinclair/typebox";
import { Value, type ValueErrorIterator } from "@sinclair/typebox/value";
import {
    type ArriSchema,
    SCHEMA_METADATA,
    ValidationError,
    type ErrorObject,
} from "arri-validate";
import { type SchemaFormProperties } from "jtd";

export function typeboxAdapter<TInput extends TObject<any>>(
    input: TInput,
): ArriSchema<Static<TInput>> {
    const schema: SchemaFormProperties = {
        properties: {},
    };
    return {
        ...schema,
        metadata: {
            id: input.$id ?? input.title,
            description: input.description,
            [SCHEMA_METADATA]: {
                output: {} as any as Static<TInput>,
                optional: input[Optional] === "Optional",
                parse(val) {
                    if (typeof val === "string") {
                        return Value.Decode(input, val);
                    }
                    if (Value.Check(input, val)) {
                        return val;
                    }
                    throw typeboxErrorsToArriError(Value.Errors(input, val));
                },
                coerce(val) {
                    return Value.Cast(input, val);
                },
                validate(val): val is Static<TInput> {
                    return Value.Check(input, val);
                },
                serialize(val) {
                    return Value.Encode(input, val);
                },
            },
        },
    };
}

function typeboxErrorsToArriError(errs: ValueErrorIterator): ValidationError {
    const mappedErrs: ErrorObject[] = [];
    for (const err of errs) {
        const obj: ErrorObject = {
            message: err.message,
            keyword: "",
            instancePath: err.path,
            schemaPath: "",
            params: {},
            data: err.value,
        };
        mappedErrs.push(obj);
    }
    return new ValidationError(mappedErrs);
}
