import {
    SCHEMA_METADATA,
    ValidationError,
    type ValueError,
    type AAdaptedSchema,
    type AAdaptedRecordSchema,
    type AAdaptedObjectSchema,
} from "@arrirpc/schema";
import {
    type TSchema,
    type Static,
    type TObject,
    type TRecord,
    OptionalKind,
} from "@sinclair/typebox";
import { TypeCompiler } from "@sinclair/typebox/compiler";
import { Value, type ValueErrorIterator } from "@sinclair/typebox/value";
import { type JsonSchemaType, jsonSchemaToJtdSchema } from "json-schema-to-jtd";

export function typeboxAdapter<TInput extends TSchema>(
    input: TInput,
): TInput extends TObject
    ? AAdaptedObjectSchema<Static<TInput>>
    : TInput extends TRecord
      ? AAdaptedRecordSchema<
            Static<TInput> extends Record<string, any>
                ? Static<TInput>[string]
                : any
        >
      : AAdaptedSchema<Static<TInput>> {
    const schema = jsonSchemaToJtdSchema(input as unknown as JsonSchemaType);
    const compiled = TypeCompiler.Compile<any>(input);
    return {
        ...schema,
        metadata: {
            id: input.$id ?? input.title,
            description: input.description,
            [SCHEMA_METADATA]: {
                _isAdaptedSchema: true,
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
    } satisfies AAdaptedSchema<Static<TInput>> as any;
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
