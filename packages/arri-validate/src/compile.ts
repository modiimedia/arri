/* eslint-disable no-new-func */
/* eslint-disable @typescript-eslint/no-implied-eval */
/* eslint-disable @typescript-eslint/dot-notation */
import { type SafeResult, type ASchema, type InferType } from "./_index";
import { createSerializationTemplate } from "./compiler/serialize";
import { createValidationTemplate } from "./compiler/validate";

export interface CompiledValidator<TSchema extends ASchema<any>> {
    validate: (input: unknown) => input is InferType<TSchema>;
    parse: (input: unknown) => InferType<TSchema>;
    safeParse: (input: unknown) => SafeResult<InferType<TSchema>>;
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
    const validateCode = createValidationTemplate("input", schema);
    const serialize = new Function(
        "input",
        serializeCode,
    ) as CompiledValidator<TSchema>["serialize"];

    const validate = new Function(
        "input",
        validateCode,
    ) as CompiledValidator<TSchema>["validate"];
    return {
        validate,
        parse(input) {
            throw new Error("Not implemented");
        },
        safeParse(input) {
            throw new Error("Not implemented");
        },
        // eslint-disable-next-line no-eval
        serialize,
        compiledCode: {
            validate: validateCode,
            parse: "",
            serialize: serializeCode,
        },
    };
}
