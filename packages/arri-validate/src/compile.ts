/* eslint-disable @typescript-eslint/dot-notation */
import { type ASchema, type InferType } from "./_index";
import { createSerializationTemplate } from "./compiler/serialize";

export interface CompiledValidator<TSchema extends ASchema<any>> {
    validate: (input: unknown) => input is InferType<TSchema>;
    parse: (input: unknown) => InferType<TSchema>;
    serialize: (input: InferType<TSchema>) => string;
    compiledCode: {
        serialize: string;
        parse: string;
        validate: string;
    };
}

export function compileV2<TSchema extends ASchema<any>>(
    schema: TSchema,
): CompiledValidator<TSchema> {
    const serializeCode = createSerializationTemplate("input", schema);
    // eslint-disable-next-line @typescript-eslint/no-implied-eval, no-new-func
    const serialize = new Function(
        "input",
        serializeCode,
    ) as CompiledValidator<TSchema>["serialize"];
    return {
        validate(input): input is InferType<TSchema> {
            return false;
        },
        parse(input) {
            throw new Error("Not implemented");
        },
        // eslint-disable-next-line no-eval
        serialize,
        compiledCode: {
            validate: "",
            parse: "",
            serialize: serializeCode,
        },
    };
}
