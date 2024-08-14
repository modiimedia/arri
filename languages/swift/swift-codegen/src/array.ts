import { SchemaFormElements } from "@arrirpc/codegen-utils";

import {
    GeneratorContext,
    isNullableType,
    SwiftProperty,
    validSwiftKey,
} from "./_common";
import { swiftTypeFromSchema } from "./_index";

export function swiftArrayFromSchema(
    schema: SchemaFormElements,
    context: GeneratorContext,
): SwiftProperty {
    const subType = swiftTypeFromSchema(schema.elements, {
        clientVersion: context.clientVersion,
        clientName: context.clientName,
        typePrefix: context.typePrefix,
        instancePath: `${context.instancePath}/[element]`,
        schemaPath: `${context.schemaPath}/elements`,
        generatedTypes: context.generatedTypes,
    });
    const isNullable = isNullableType(schema, context);
    const typeName = isNullable
        ? `[${subType.typeName}]?`
        : `[${subType.typeName}]`;
    const defaultValue = isNullable ? "" : "[]";
    return {
        typeName,
        isNullable,
        defaultValue,
        canBeQueryString: false,
        fromJsonTemplate(input, target, key) {
            const innerKey = validSwiftKey(key);
            const mainContent = `${target} = []
            let __${innerKey}Json = ${input}.array ?? []
            for __${innerKey}JsonElement in __${innerKey}Json {
                let ${subType.fromJsonTemplate(`__${innerKey}JsonElement`, `__${innerKey}JsonElementValue`, `element`)}
                ${target}${isNullable ? "!" : ""}.append(__${innerKey}JsonElementValue)
            }`;
            if (context.isOptional) {
                return `if ${input}.exists() {
                ${mainContent}
                }`;
            }
            if (schema.nullable) {
                return `if ${input}.array != nil {
                    ${mainContent}
                }`;
            }
            return mainContent;
        },
        toJsonTemplate(input, target) {
            const mainContent = `${target} += "["
            for (__index, __element) in ${input}${isNullable ? "!" : ""}.enumerated() {
                if __index > 0 {
                    ${target} += ","
                }
                ${subType.toJsonTemplate(`__element`, target)}
            }
            ${target} += "]"`;
            if (schema.nullable) {
                return `if ${input} != nil {
                    ${mainContent}
                } else {
                    ${target} += "null" 
                }`;
            }
            return mainContent;
        },
        toQueryStringTemplate(_, __, ___) {
            return `print("[WARNING] arrays cannot be serialized to query params. Skipping field at ${context.instancePath}.")`;
        },
        cloneTemplate(input, key) {
            const innerKey = validSwiftKey(key);
            const subTypeClonedResult = subType.cloneTemplate?.(
                `__${innerKey}Cloned`,
                `${innerKey}Cloned`,
            );
            if (isNullable) {
                return {
                    bodyContent: `var __${innerKey}Cloned: ${typeName}
                if ${input} != nil {
                    __${innerKey}Cloned = []
                    for __${innerKey}Element in ${input}! {
                        ${subTypeClonedResult?.bodyContent ?? ""}
                        __${innerKey}Cloned!.append(${subTypeClonedResult?.fieldContent || `__${innerKey}Element`})
                    }
                }`,
                    fieldContent: `__${innerKey}Cloned`,
                };
            }
            return {
                bodyContent: `var __${innerKey}Cloned: ${typeName} = []
                for __${innerKey}Element in ${input} {
                    ${subTypeClonedResult?.bodyContent ?? ""}
                    __${innerKey}Cloned.append(${subTypeClonedResult?.fieldContent || `__${innerKey}Element`})
                }`,
                fieldContent: `__${innerKey}Cloned`,
            };
        },
        content: subType.content,
    };
}
