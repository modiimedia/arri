import {
    OptionalKind,
    type Static,
    type TObject,
    TSchema,
} from "@sinclair/typebox";
import { TypeCompiler } from "@sinclair/typebox/compiler";
import { Value, type ValueErrorIterator } from "@sinclair/typebox/value";
import { jsonSchemaToJtdSchema, type JsonSchemaType } from "json-schema-to-atd";

import {
    AObjectSchema,
    ASchema,
    SCHEMA_METADATA,
    ValidationError,
    type ValueError,
} from "../../../languages/ts/ts-schema/dist";

export function typeboxAdapter<TInput extends TSchema>(
    input: TInput,
): TInput extends TObject
    ? AObjectSchema<Static<TInput>>
    : ASchema<Static<TInput>> {
    const schema = jsonSchemaToJtdSchema(input as unknown as JsonSchemaType);
    const compiled = TypeCompiler.Compile<any>(input);
    return {
        ...schema,
        metadata: {
            id: input.$id ?? input.title,
            description: input.description,
            [SCHEMA_METADATA]: {
                _isAdapted: true,
                output: {} as any as Static<TInput>,
                optional: input[OptionalKind] === "Optional",
                parse(val: unknown) {
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
                coerce(val: unknown): any {
                    return Value.Cast(input, val);
                },
                validate(val: unknown): val is Static<TInput> {
                    return compiled.Check(val);
                },
                serialize(val: Static<TInput>) {
                    return compiled.Encode(val);
                },
            },
        },
    } satisfies ASchema<Static<TInput>> as any;
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
