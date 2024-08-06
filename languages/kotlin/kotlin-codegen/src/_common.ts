import {
    camelCase,
    pascalCase,
    removeDisallowedChars,
    type Schema,
} from "@arrirpc/codegen-utils";
import { stringStartsWithNumber } from "@arrirpc/codegen-utils";

export interface CodegenContext {
    modelPrefix: string;
    clientName: string;
    clientVersion: string;
    instancePath: string;
    schemaPath: string;
    existingTypeIds: string[];
    isOptional?: boolean;
    discriminatorParentId?: string;
    discriminatorKey?: string;
    discriminatorValue?: string;
}

export interface KotlinProperty {
    typeName: string;
    isNullable: boolean;
    content: string;
    defaultValue: string;
    fromJson: (input: string, key?: string) => string;
    toJson: (input: string, target: string) => string;
    toQueryString: (input: string, target: string, key: string) => string;
}

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
        return `\`${name}\``;
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

export function getClassName(schema: Schema, context: CodegenContext): string {
    if (schema.metadata?.id) {
        const className = kotlinClassName(
            pascalCase(schema.metadata.id, {
                normalize: true,
            }),
        );
        return `${context.modelPrefix}${className}`;
    }
    const depth = instanceDepth(context);
    if (depth === 1 && !context.discriminatorKey) {
        const className = kotlinClassName(
            pascalCase(context.instancePath.replace("/", ""), {
                normalize: true,
            }),
        );
        return `${context.modelPrefix}${className}`;
    }

    if (
        context.discriminatorParentId &&
        context.discriminatorKey &&
        context.discriminatorValue
    ) {
        const className = kotlinClassName(
            pascalCase(
                `${context.discriminatorParentId}_${context.discriminatorValue}`,
                { normalize: true },
            ),
        );
        return `${context.modelPrefix}${className}`;
    }

    const className = kotlinClassName(
        pascalCase(
            context.instancePath
                .split("/")
                .join("_")
                .split("[")
                .join("_")
                .split("]")
                .join("_"),
            {
                normalize: true,
            },
        ),
    );
    return `${context.modelPrefix}${className}`;
}

export function instanceDepth(context: CodegenContext) {
    const parts = context.instancePath.split("/");
    return parts.length - 1;
}

export function isNullable(schema: Schema, context: CodegenContext) {
    return schema.nullable === true || context.isOptional === true;
}

export function getCodeComment(
    metadata?: Schema["metadata"],
    prefix?: string,
    valueField?: "field" | "method" | "class",
) {
    if (!metadata?.description && !metadata?.isDeprecated) return "";
    const descriptionPart = metadata.description
        ?.split("\n")
        .map((line) => `${prefix ?? ""}* ${line}`)
        .join("\n");
    const finalDescription = metadata.description
        ? `${prefix ?? ""}/**\n${descriptionPart}${prefix ?? ""}\n*/`
        : "";
    const deprecationMessage = `@Deprecated(message = "This ${valueField ?? "item"} was marked as deprecated by the server")`;
    if (metadata.description && metadata.isDeprecated) {
        return `${finalDescription}\n${deprecationMessage}\n`;
    }
    if (metadata.isDeprecated) {
        return `${deprecationMessage}\n`;
    }
    if (metadata.description) {
        return `${finalDescription}\n`;
    }
    return "";
}
