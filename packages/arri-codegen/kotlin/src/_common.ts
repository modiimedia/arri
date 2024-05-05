import {
    type Schema,
    camelCase,
    pascalCase,
    removeDisallowedChars,
} from "arri-codegen-utils";
import { stringStartsWithNumber } from "packages/arri-codegen/utils/dist";
import { type CodegenContext } from ".";

const reservedIdentifierKeywords = [
    "as",
    "as?",
    "break",
    "class",
    "continue",
    "do",
    "else",
    "false",
    "for",
    "fun",
    "if",
    "in",
    "!in",
    "interface",
    "is",
    "!is",
    "null",
    "object",
    "package",
    "return",
    "super",
    "this",
    "throw",
    "true",
    "try",
    "typealias",
    "typeof",
    "val",
    "var",
    "when",
    "while",
];

const illegalCharacters = "+-*/%=&|!<>[]?:.@$;";

export function kotlinIdentifier(input: string): string {
    const name = removeDisallowedChars(camelCase(input), illegalCharacters);
    if (
        stringStartsWithNumber(name) ||
        reservedIdentifierKeywords.includes(name)
    ) {
        return `_${name}`;
    }
    return name;
}

export function kotlinClassName(input: string): string {
    const name = removeDisallowedChars(
        pascalCase(input, { normalize: true }),
        illegalCharacters,
    );
    if (
        stringStartsWithNumber(name) ||
        reservedIdentifierKeywords.includes(name)
    ) {
        return `_${name}`;
    }
    return name;
}

export function isNullable(schema: Schema, context: CodegenContext) {
    return schema.nullable === true || context.isOptional === true;
}
