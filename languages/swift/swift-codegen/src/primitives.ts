import { SchemaFormType } from "@arrirpc/codegen-utils";

import { GeneratorContext, isNullableType, SwiftProperty } from "./_common";

export function swiftStringFromSchema(
    schema: SchemaFormType,
    context: GeneratorContext,
): SwiftProperty {
    const isNullable = isNullableType(schema, context);
    const typeName = isNullable ? "String?" : "String";
    const defaultValue = isNullable ? "" : '""';
    return {
        typeName,
        isNullable,
        defaultValue,
        fromJsonTemplate(input, target) {
            if (context.isOptional) {
                return `        if ${input}.exists() {
            ${target} = ${input}.string    
        }`;
            }
            if (schema.nullable) {
                return `        if ${input}.string != nil {
            ${target} = ${input}.string
        }`;
            }
            return `        ${target} = ${input}.string`;
        },
        toJsonTemplate(input, target) {
            if (context.isOptional) {
                return `if ${input} != nil {
                    ${target} += serializeString(input: ${input}!)
                }`;
            }
            if (schema.nullable) {
                return `if ${input} != nil {
                    ${target} += serializeString(input: ${input}!)
                } else {
                    ${target} += "null" 
                }`;
            }
            return `${target} += serializeString(input: ${input})`;
        },
        toQueryStringTemplate(input, target, key) {
            if (context.isOptional) {
                return `if ${input} != nil {
                    ${target}.append("${key}=\\(${input}!)")
                }`;
            }
            if (schema.nullable) {
                return `if ${input} != nil {
                    ${target}.append("${key}=\\(${input}!)")
                } else {
                    ${target}.append("${key}=null") 
                }`;
            }
            return `${target}.append("${key}=\\(${input}${schema.nullable ? "!" : ""})")`;
        },
        content: "",
    };
}

export function swiftBooleanFromSchema(
    schema: SchemaFormType,
    context: GeneratorContext,
): SwiftProperty {
    const isNullable = isNullableType(schema, context);
    const typeName = isNullable ? "Bool?" : "Bool";
    const defaultValue = isNullable ? "" : "false";
    return {
        typeName,
        isNullable,
        defaultValue,
        fromJsonTemplate(input, target) {
            if (context.isOptional) {
                return `if ${input}.exists() {
                    ${target} = ${input}.bool
                }`;
            }
            if (schema.nullable) {
                return `if ${input}.bool != nil {
                    ${target} = ${input}.bool
                }`;
            }
            return `${target} = ${input}.bool ?? false`;
        },
        toJsonTemplate(input, target) {
            if (context.isOptional) {
                return `${target} += "\\(${input}!)"`;
            }
            if (schema.nullable) {
                return `if ${input} != nil {
                    ${target} += "\\(${input}!)"
                } else {
                    ${target} += "null" 
                }`;
            }
            return `${target} += "\\(${input})"`;
        },
        toQueryStringTemplate(input, target, key) {
            if (context.isOptional) {
                return `if ${input} != nil {
                    ${target}.append("${key}=\\(${input}!)")
                }`;
            }
            if (schema.nullable) {
                return `if ${input} != nil {
                    ${target}.append("${key}=\\(${input}!)")
                } else {
                    ${target}.append("${key}=null") 
                }`;
            }
            return `${target}.append("${key}=\\(${input})")`;
        },
        content: "",
    };
}

export function swiftTimestampFromSchema(
    schema: SchemaFormType,
    context: GeneratorContext,
): SwiftProperty {
    const isNullable = isNullableType(schema, context);
    const typeName = isNullable ? "Date?" : "Date";
    const defaultValue = isNullable ? "" : "Date()";
    return {
        typeName,
        defaultValue,
        isNullable,
        fromJsonTemplate(input, target) {
            if (context.isOptional) {
                return `if ${input}.exists() {
                    ${target} = parseDate(${input}.string ?? "") ?? Date()
                }`;
            }
            if (schema.nullable) {
                return `if ${input}.string != nil {
                    ${target} = parseDate(${input}.string ?? "") ?? Date()
                }`;
            }
            return `${target} = parseDate(${input}.string ?? "") ?? Date()`;
        },
        toJsonTemplate(input, target) {
            if (context.isOptional) {
                return `${target} += serializeDate(${target}!)`;
            }
            if (schema.nullable) {
                return `if ${input} != nil {
                    ${target} += serializeDate(${input}!)
                } else {
                    ${target} += "null" 
                }`;
            }
            return `${target} += serializeDate(${input})`;
        },
        toQueryStringTemplate(input, target, key) {
            if (context.isOptional) {
                return `if ${input} != nil {
                    ${target}.append("${key}=\\(serializeDate(${input}!), withQuotes: false)")
                }`;
            }
            if (schema.nullable) {
                return `if ${input} != nil {
                    ${target}.append("${key}=\\(serializeDate(${input}!, withQuotes: false))")
                } else {
                    ${target}.append("${key}=null") 
                }`;
            }
            return `${target}.append("${key}=\\(serializeDate(${input}!, withQuotes: false))")`;
        },
        content: "",
    };
}
