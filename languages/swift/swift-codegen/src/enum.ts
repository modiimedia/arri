import { camelCase, SchemaFormEnum } from "@arrirpc/codegen-utils";

import {
    GeneratorContext,
    getTypeName,
    isNullableType,
    SwiftProperty,
} from "./_common";

export function swiftEnumFromSchema(
    schema: SchemaFormEnum,
    context: GeneratorContext,
): SwiftProperty {
    if (!schema.enum[0]) {
        throw new Error(
            `Error at ${context.instancePath}. Must have at least one enum value.`,
        );
    }
    const typeName = getTypeName(schema, context);
    const isNullable = isNullableType(schema, context);
    const defaultEnumValue = camelCase(schema.enum[0]!, { normalize: true });
    const prefixedTypeName = `${context.typePrefix}${typeName}`;
    const defaultValue = isNullable
        ? ""
        : `${prefixedTypeName}.${defaultEnumValue}`;
    const result: SwiftProperty = {
        typeName: isNullable ? `${typeName}?` : typeName,
        isNullable,
        defaultValue,
        canBeQueryString: true,
        fromJsonTemplate(input, target) {
            if (context.isOptional) {
                return `if ${input}.exists() {
                    ${target} = ${prefixedTypeName}(serialValue: ${input}.string ?? "")
                }`;
            }
            if (schema.nullable) {
                return `if ${input}.string != nil {
                    ${target} = ${prefixedTypeName}(serialValue: ${input}.string ?? "")
                }`;
            }
            return `${target} = ${prefixedTypeName}(serialValue: ${input}.string ?? "")`;
        },
        toJsonTemplate(input, target) {
            if (context.isOptional) {
                return `${target} += "\\"\\(${input}!.serialValue())\\""`;
            }
            if (schema.nullable) {
                return `if ${input} != nil {
                    ${target} += "\\"\\(${input}!.serialValue())\\""
                } else {
                    ${target} += "null" 
                }`;
            }
            return `${target} += "\\"\\(${input}.serialValue())\\""`;
        },
        toQueryPartTemplate(input, target, key) {
            if (context.isOptional) {
                return `if ${input} != nil {
                    ${target}.append(URLQueryItem(name: "${key}", value: ${input}!.serialValue()))
                }`;
            }
            if (schema.nullable) {
                return `if ${input} != nil {
                    ${target}.append(URLQueryItem(name: "${key}", value: ${input}!.serialValue()))
                } else {
                    ${target}.append(URLQueryItem(name: "${key}", value: "null")) 
                }`;
            }
            return `${target}.append(URLQueryItem(name: "${key}", value: ${input}.serialValue()))`;
        },
        content: "",
    };
    if (context.generatedTypes.includes(typeName)) {
        return result;
    }
    result.content = `public enum ${prefixedTypeName}: ArriClientEnum {
${schema.enum.map((val) => `    case ${camelCase(val, { normalize: true })}`).join("\n")}
    public init() {
        self = .${defaultEnumValue}
    }
    public init(serialValue: String) {
        switch(serialValue) {
${schema.enum
    .map(
        (val) => `            case "${val}":
                self = .${camelCase(val, { normalize: true })}
                break;`,
    )
    .join("\n")}
            default:
                self = .${defaultEnumValue}
        }
    }
    public func serialValue() -> String {
        switch (self) {
${schema.enum
    .map(
        (val) => `            case .${camelCase(val, { normalize: true })}:
                return "${val}"`,
    )
    .join("\n")}
        }
    }
}`;
    context.generatedTypes.push(typeName);
    return result;
}
