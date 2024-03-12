import { type Schema, snakeCase, pascalCase } from "arri-codegen-utils";

export interface GeneratorContext {
    parentId?: string;
    schemaPath: string;
    instancePath: string;
    generatedTypes: string[];
    clientName: string;
    isOptional?: boolean;
}

export interface RustProperty {
    fieldTemplate: string;
    fromJsonTemplate: (val: string, key: string) => string;
    toJsonTemplate: (targetString: string, val: string, key: string) => string;
    toQueryTemplate: (targetVec: string, val: string, key: string) => string;
    defaultTemplate: string;
    content: string;
}

export function validRustKey(key: string): string {
    const finalKey = snakeCase(key);
    const illegalKeys = [
        "bool",
        "String",
        "i8",
        "u8",
        "i16",
        "u16",
        "i32",
        "u32",
        "i64",
        "u64",
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
    ];
    if (illegalKeys.includes(finalKey)) {
        return `r#${finalKey}`;
    }
    return finalKey;
}

export function isOptionType(schema: Schema, context: GeneratorContext) {
    return (schema.nullable ?? false) || (context.isOptional ?? false);
}

export function maybeOption(typeName: string, isOptionType: boolean) {
    if (isOptionType) {
        return `Option<${typeName}>`;
    }
    return typeName;
}

export function maybeSome(val: string, isSome?: boolean) {
    if (isSome) {
        return `Some(${val})`;
    }
    return val;
}

export function maybeNone(val: string, isNone?: boolean) {
    if (isNone) {
        return "None";
    }
    return val;
}

export function getTypeName(schema: Schema, context: GeneratorContext): string {
    let typeName = schema.metadata?.id ?? "";
    if (typeName.length === 0) {
        if (context.parentId) {
            typeName = pascalCase(
                `${context.parentId}_${context.instancePath.split("/").pop()}`,
            );
        } else {
            typeName = pascalCase(
                `${context.instancePath.split("/").join("_")}`,
            );
        }
    }
    return typeName;
}
