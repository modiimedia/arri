import path from "pathe";
import { pascalCase, snakeCase } from "scule";
import { removeDisallowedChars, Schema } from "tooling/codegen-utils/dist";

export interface GeneratorContext {
    clientName: string;
    typeNamePrefix: string;
    instancePath: string;
    schemaPath: string;
    generatedTypes: string[];
    discriminatorKey?: string;
    discriminatorValue?: string;
    isOptional?: boolean;
}

export interface RustProperty {
    typeName: string;
    defaultValue: string;
    isNullable: boolean;
    fromJsonTemplate: (input: string, key: string) => string;
    toJsonTemplate: (input: string, target: string) => string;
    toQueryStringTemplate: (
        input: string,
        key: string,
        target: string,
    ) => string;
    content: string;
}

const reservedKeywords = [
    "as",
    "break",
    "const",
    "continue",
    "crate",
    "else",
    "enum",
    "extern",
    "false",
    "fn",
    "for",
    "if",
    "impl",
    "in",
    "let",
    "loop",
    "match",
    "mod",
    "move",
    "mut",
    "pub",
    "ref",
    "return",
    "self",
    "Self",
    "static",
    "struct",
    "super",
    "trait",
    "true",
    "type",
    "unsafe",
    "use",
    "where",
    "while",
    "async",
    "await",
    "dyn",
    "abstract",
    "become",
    "box",
    "do",
    "final",
    "macro",
    "override",
    "priv",
    "typeof",
    "unsized",
    "virtual",
    "yield",
    "try",
    "macro_rules",
    "union",
    "'static",
    "dyn",
];

const illegalChars = ".!@#$%^&*()-+=\\][{}'\";?";
const numberChars = "0123456789";

export function validRustKey(key: string): string {
    const output = removeDisallowedChars(snakeCase(key), illegalChars);
    if (numberChars.includes(output.charAt(0))) {
        return `r#_${output}`;
    }
    if (reservedKeywords.includes(output)) {
        return `r#${output}`;
    }
    return output;
}

export function validRustName(name: string): string {
    const output = removeDisallowedChars(
        pascalCase(name, { normalize: true }),
        illegalChars,
    );
    if (numberChars.includes(output.charAt(0))) {
        return `r#_${output}`;
    }
    if (reservedKeywords.includes(output)) {
        return `r#${output}`;
    }
    return output;
}

export const tmpDir = path.resolve(__dirname, "../.temp");

export function outputIsOptionType(
    schema: Schema,
    context: GeneratorContext,
): boolean {
    return schema.nullable === true || context.isOptional === true;
}
