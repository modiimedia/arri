/* eslint-disable no-new-func */
/* eslint-disable @typescript-eslint/no-implied-eval */
/* eslint-disable @typescript-eslint/dot-notation */
import {
    type SafeResult,
    type ASchema,
    type InferType,
    ValidationError,
} from "./_index";
import { createParsingTemplate } from "./compiler/parse";
import { createSerializationTemplate } from "./compiler/serialize";
import { createValidationTemplate } from "./compiler/validate";

export interface CompiledValidator<TSchema extends ASchema<any>> {
    /**
     * Determine if a type matches a schema. This is a type guard.
     */
    validate: (input: unknown) => input is InferType<TSchema>;
    /**
     * Parse a JSON string or the result of JSON.parse(). Throws an error if parsing fails.
     */
    parse: (input: unknown) => InferType<TSchema>;
    /**
     * Parse a JSON string or the result of JSON.parse() without throwing an error
     */
    safeParse: (input: unknown) => SafeResult<InferType<TSchema>>;
    /**
     * Serialize to JSON
     */
    serialize: (input: InferType<TSchema>) => string;
    compiledCode: {
        serialize: string;
        parse: string;
        validate: string;
    };
}

/**
 * Create compiled versions of the `parse()`, `validate()`, and `serialize()` functions
 */
export function compile<TSchema extends ASchema<any>>(
    schema: TSchema,
): CompiledValidator<TSchema> {
    const serializeCode = createSerializationTemplate("input", schema);
    const validateCode = createValidationTemplate("input", schema);
    const parseCode = createParsingTemplate("input", schema);
    const serialize = new Function(
        "input",
        serializeCode,
    ) as CompiledValidator<TSchema>["serialize"];
    const validate = new Function(
        "input",
        validateCode,
    ) as CompiledValidator<TSchema>["validate"];
    const parse = new Function(
        "input",
        parseCode,
    ) as CompiledValidator<TSchema>["parse"];
    return {
        validate,
        parse,
        safeParse(input) {
            try {
                const result = parse(input);
                return {
                    success: true,
                    value: result,
                };
            } catch (err) {
                if (
                    typeof err === "object" &&
                    err !== null &&
                    "instancePath" in err &&
                    "schemaPath" in err &&
                    "message" in err
                ) {
                    return {
                        success: false,
                        error: new ValidationError({
                            // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
                            message: `${err.message}`,
                            errors: [
                                {
                                    // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
                                    instancePath: `${err.instancePath}`,
                                    // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
                                    schemaPath: `${err.schemaPath}`,
                                    // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
                                    message: `${err.message}`,
                                },
                            ],
                        }),
                    };
                }
                return {
                    success: false,
                    error: new ValidationError({
                        // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
                        message: `${err}`,
                        errors: [],
                    }),
                };
            }
        },
        // eslint-disable-next-line no-eval
        serialize,
        compiledCode: {
            validate: validateCode,
            parse: parseCode,
            serialize: serializeCode,
        },
    };
}
